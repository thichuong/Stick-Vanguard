import initWasm, * as wasmOps from '../wasm/wasm_sim.js';
import { EnemyEntity } from '../types/entities.types.js';
import { NavigationSystem } from '../systems/NavigationSystem.js';
import { NavigationMode } from '../types/elements.types.js';

export class WasmBridge {
  private static instance: WasmBridge | null = null;
  private isReady = false;
  private memory: WebAssembly.Memory | null = null;

  private strToU32 = new Map<string, number>();
  private u32ToStr = new Map<number, string>();
  private nextId = 1;

  public static getInstance(): WasmBridge {
    if (!WasmBridge.instance) {
      WasmBridge.instance = new WasmBridge();
    }
    return WasmBridge.instance;
  }

  public async init(wasmSource?: string | URL | RequestInfo | BufferSource | WebAssembly.Module): Promise<boolean> {
    if (this.isReady) return true;

    try {
      let initOutput: wasmOps.InitOutput;
      if (wasmSource) {
        initOutput = await initWasm({ module_or_path: wasmSource as any });
      } else {
        // Try importing the default wasm url if in Vite browser environment
        try {
          const wasmUrl = (await import('../wasm/wasm_sim_bg.wasm?url')).default;
          initOutput = await initWasm({ module_or_path: wasmUrl });
        } catch {
          initOutput = await initWasm();
        }
      }

      this.memory = initOutput.memory;
      this.isReady = true;
      wasmOps.init_world(1000, 650);
      console.log('[WASM Core] Initialized successfully. High-performance Flat Memory & Spatial Grid active.');
      return true;
    } catch (err) {
      console.warn('[WASM Core] Initialization skipped or failed; using TypeScript fallback.', err);
      this.isReady = false;
      return false;
    }
  }

  public isAvailable(): boolean {
    return this.isReady && this.memory !== null;
  }

  public getOrCreateU32Id(strId: string): number {
    let u32 = this.strToU32.get(strId);
    if (u32 === undefined) {
      u32 = this.nextId++;
      this.strToU32.set(strId, u32);
      this.u32ToStr.set(u32, strId);
    }
    return u32;
  }

  public getStrId(u32: number): string | undefined {
    return this.u32ToStr.get(u32);
  }

  public removeId(strId: string): void {
    const u32 = this.strToU32.get(strId);
    if (u32 !== undefined) {
      this.strToU32.delete(strId);
      this.u32ToStr.delete(u32);
      if (this.isReady) {
        wasmOps.remove_enemy(u32);
      }
    }
  }

  public removeEnemy(strId: string): void {
    this.removeId(strId);
  }

  public clearAll(): void {
    this.strToU32.clear();
    this.u32ToStr.clear();
    this.nextId = 1;
    if (this.isReady) {
      wasmOps.clear_enemies();
    }
  }

  public syncPaths(navSystem: NavigationSystem): void {
    if (!this.isReady) return;

    wasmOps.clear_paths();

    const syncLanePool = (mode: NavigationMode, modeInt: number) => {
      const lanes = navSystem.getAllLanes(mode);
      for (let i = 0; i < lanes.length; i++) {
        const lane = lanes[i];
        if (!lane.segments || lane.segments.length === 0) continue;

        const waypoints: number[] = [];
        // Push start of first segment
        waypoints.push(lane.segments[0].p1.x, lane.segments[0].p1.y);
        for (let s = 0; s < lane.segments.length; s++) {
          waypoints.push(lane.segments[s].p2.x, lane.segments[s].p2.y);
        }

        wasmOps.set_path(modeInt, i, new Float32Array(waypoints));
      }
    };

    // 0 = Ground, 1 = Water, 2 = Air
    syncLanePool('GROUND_PATH', 0);
    syncLanePool('WATER_PATH', 1);
    syncLanePool('AIR_DIRECT', 2);
    syncLanePool('AIR_WAYPOINTS', 2);
  }

  public spawnEnemy(enemy: EnemyEntity): void {
    if (!this.isReady) return;

    const u32Id = this.getOrCreateU32Id(enemy.id);
    const navModeInt = enemy.navigationMode === 'WATER_PATH'
      ? 1
      : enemy.navigationMode === 'AIR_DIRECT'
      ? 2
      : enemy.navigationMode === 'AIR_WAYPOINTS'
      ? 3
      : 0;

    const stateInt = enemy.state === 'DEAD'
      ? 5
      : enemy.state === 'ATTACKING'
      ? 4
      : enemy.state === 'ENGAGED'
      ? 3
      : enemy.movementType === 'SWIM'
      ? 2
      : enemy.movementType === 'FLY'
      ? 1
      : 0;

    const hpRatio = enemy.maxHp > 0 ? Math.max(0, Math.min(1, enemy.hp / enemy.maxHp)) : 0;

    wasmOps.spawn_enemy(
      u32Id,
      enemy.speed,
      enemy.pathDistance,
      navModeInt,
      enemy.laneIndex ?? 0,
      enemy.size,
      enemy.altitude,
      hpRatio,
      stateInt
    );
  }

  public updateEnemyStatus(enemy: EnemyEntity): void {
    if (!this.isReady) return;

    const u32Id = this.strToU32.get(enemy.id);
    if (u32Id === undefined) return;

    const stateInt = enemy.state === 'DEAD'
      ? 5
      : enemy.state === 'ATTACKING'
      ? 4
      : enemy.state === 'ENGAGED'
      ? 3
      : 0;

    const hpRatio = enemy.maxHp > 0 ? Math.max(0, Math.min(1, enemy.hp / enemy.maxHp)) : 0;
    wasmOps.update_enemy_status(u32Id, enemy.speed, hpRatio, stateInt);
  }

  public stepSimulation(dt: number, animTime: number): void {
    if (!this.isReady) return;
    wasmOps.step_simulation(dt, animTime);
  }

  public rebuildSpatialGrid(): void {
    if (!this.isReady) return;
    wasmOps.rebuild_spatial_grid();
  }

  public hasEnemyFinished(enemyId: string): boolean {
    if (!this.isReady) return false;
    const u32Id = this.strToU32.get(enemyId);
    if (u32Id === undefined) return false;
    return wasmOps.has_enemy_finished(u32Id);
  }

  /**
   * Zero-copy Direct Memory View into WASM Linear Memory.
   * Stride = 12 floats: [id, x, y, prev_x, prev_y, facing, hp_ratio, altitude, state, size, path_dist, has_finished]
   */
  public getRenderView(): Float32Array | null {
    if (!this.isReady || !this.memory) return null;

    const ptr = wasmOps.get_render_buffer_ptr();
    const len = wasmOps.get_render_buffer_len();
    if (ptr === 0 || len === 0) return null;

    return new Float32Array(this.memory.buffer, ptr, len);
  }

  public getRenderStride(): number {
    return wasmOps.get_render_stride();
  }

  public findBestTargetInRange(
    x: number,
    y: number,
    range: number,
    mode: 'FIRST' | 'CLOSEST' | 'STRONGEST' | 'WEAKEST' = 'FIRST'
  ): string | null {
    if (!this.isReady) return null;

    const modeInt = mode === 'CLOSEST' ? 1 : mode === 'STRONGEST' ? 2 : mode === 'WEAKEST' ? 3 : 0;
    const targetU32 = wasmOps.find_best_target_in_range(x, y, range, modeInt);
    if (targetU32 === 0) return null;

    return this.u32ToStr.get(targetU32) || null;
  }

  public queryRadius(x: number, y: number, radius: number): string[] {
    if (!this.isReady || !this.memory) return [];

    const count = wasmOps.query_radius(x, y, radius);
    if (count === 0) return [];

    const ptr = wasmOps.get_query_results_ptr();
    const u32View = new Uint32Array(this.memory.buffer, ptr, count);

    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      const strId = this.u32ToStr.get(u32View[i]);
      if (strId) {
        result.push(strId);
      }
    }
    return result;
  }
}
