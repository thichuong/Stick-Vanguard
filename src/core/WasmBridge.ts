import initWasm, * as wasmOps from '../wasm/wasm_sim.js';
import { EnemyEntity, SoldierEntity } from '../types/entities.types.js';
import { NavigationSystem } from '../systems/NavigationSystem.js';
import { ElementType, NavigationMode } from '../types/elements.types.js';
import { TOWER_BLUEPRINTS } from '../config/towers.config.js';
import { ENEMY_BLUEPRINTS, ENEMY_CC_CONFIG } from '../config/enemies.config.js';
import { MAPS_CONFIG } from '../config/map.config.js';
import {
  ALL_15_ELEMENTS,
  ALL_ELEMENT_DEFINITIONS,
  ELEMENTAL_MATCHUPS,
  ELEMENTAL_REACTIONS,
  ELEMENT_COLORS,
  ELEMENT_NAMES
} from '../config/elements.config.js';

export interface StepRenderOutput {
  gold: number;
  lives: number;
  maxLives: number;
  currentWaveIndex: number;
  totalWaves: number;
  isWaveInProgress: boolean;
  isGameOver: boolean;
  isVictory: boolean;
  enemyCount: number;
  towerCount: number;
  gameSpeed: number;
  isPaused: boolean;
  animTime: number;
  alpha: number;
  floatingTexts: Array<{
    id: string;
    text: string;
    x: number;
    y: number;
    color: string;
    lifeTime: number;
    maxLifeTime: number;
    size: number;
  }>;
  soldiers?: SoldierEntity[];
}

export class WasmBridge {
  private static instance: WasmBridge | null = null;
  private static wasmLoadedGlobally = false;
  private static globalMemory: WebAssembly.Memory | null = null;

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

  /**
   * Ensures the singleton WASM instance is initialized (including synchronous init in Node/Vitest).
   */
  public static ensureSingletonReady(): WasmBridge {
    const inst = WasmBridge.getInstance();
    if (inst.isReady) return inst;

    if (WasmBridge.wasmLoadedGlobally && WasmBridge.globalMemory) {
      inst.memory = WasmBridge.globalMemory;
      inst.isReady = true;
      inst.syncGameConfigToRust();
      return inst;
    }

    // Attempt synchronous initialization in Node/Vitest if available
    try {
      const proc = (globalThis as any).process;
      let fsMod: any = null;
      let pathMod: any = null;
      if (proc && typeof proc.getBuiltinModule === 'function') {
        fsMod = proc.getBuiltinModule('fs');
        pathMod = proc.getBuiltinModule('path');
      } else if (typeof (globalThis as any).require === 'function') {
        fsMod = (globalThis as any).require('fs');
        pathMod = (globalThis as any).require('path');
      }
      if (fsMod && pathMod) {
        const wasmPath = pathMod.resolve(proc.cwd(), 'src/wasm/wasm_sim_bg.wasm');
        if (fsMod.existsSync(wasmPath)) {
          const bytes = fsMod.readFileSync(wasmPath);
          const out = wasmOps.initSync({ module: bytes });
          WasmBridge.wasmLoadedGlobally = true;
          WasmBridge.globalMemory = out.memory;
          inst.memory = out.memory;
          inst.isReady = true;
          wasmOps.init_world(1000, 650);
          inst.syncGameConfigToRust();
        }
      }
    } catch {
      // Async init in browser
    }

    return inst;
  }

  public async init(wasmSource?: string | URL | RequestInfo | BufferSource | WebAssembly.Module): Promise<boolean> {
    if (this.isReady) return true;

    try {
      let initOutput: wasmOps.InitOutput;
      if (wasmSource) {
        initOutput = await initWasm({ module_or_path: wasmSource as any });
      } else {
        try {
          const wasmUrl = (await import('../wasm/wasm_sim_bg.wasm?url')).default;
          initOutput = await initWasm({ module_or_path: wasmUrl });
        } catch {
          initOutput = await initWasm();
        }
      }

      this.memory = initOutput.memory;
      this.isReady = true;
      WasmBridge.wasmLoadedGlobally = true;
      WasmBridge.globalMemory = initOutput.memory;
      if (WasmBridge.instance && !WasmBridge.instance.isReady) {
        WasmBridge.instance.memory = initOutput.memory;
        WasmBridge.instance.isReady = true;
      }

      wasmOps.init_world(1000, 650);
      this.syncGameConfigToRust();
      console.log('[WASM Core] Initialized successfully. Rust Engine, Audio & WebGL2 Renderer active.');
      return true;
    } catch (err) {
      console.warn('[WASM Core] Initialization skipped or failed; using fallback.', err);
      this.isReady = false;
      return false;
    }
  }

  public syncGameConfigToRust(): boolean {
    if (!this.isReady) return false;
    try {
      const elementCombatStats: Record<string, any> = {};
      for (const elem of ALL_15_ELEMENTS) {
        const def = ALL_ELEMENT_DEFINITIONS[elem as ElementType];
        if (def?.combatStats) {
          elementCombatStats[elem] = def.combatStats;
        }
      }

      const payload = {
        towers: TOWER_BLUEPRINTS,
        enemies: ENEMY_BLUEPRINTS,
        maps: MAPS_CONFIG,
        elementMatchups: ELEMENTAL_MATCHUPS,
        elementReactions: ELEMENTAL_REACTIONS,
        elementCombatStats,
        elementColors: ELEMENT_COLORS,
        elementNames: ELEMENT_NAMES,
        ccConfig: ENEMY_CC_CONFIG
      };

      return wasmOps.load_game_config(JSON.stringify(payload));
    } catch (e) {
      console.error('[WASM Core] Failed to sync game config to Rust:', e);
      return false;
    }
  }

  public getOps(): typeof wasmOps {
    return wasmOps;
  }

  public initWebGlRenderer(gl: WebGL2RenderingContext): boolean {
    if (!this.isReady) return false;
    return wasmOps.init_webgl_renderer(gl);
  }

  public uploadWebGlAtlas(image: TexImageSource, manifestJson: string): boolean {
    if (!this.isReady) return false;
    return wasmOps.upload_webgl_atlas(image, manifestJson);
  }

  public initCodexWebGlRenderer(gl: WebGL2RenderingContext): boolean {
    if (!this.isReady) return false;
    return wasmOps.init_codex_webgl_renderer(gl);
  }

  public uploadCodexWebGlAtlas(image: TexImageSource, manifestJson: string): boolean {
    if (!this.isReady) return false;
    return wasmOps.upload_codex_webgl_atlas(image, manifestJson);
  }

  public renderCodexEnemy(
    enemyTypeId: string,
    animTime: number,
    width: number = 240,
    height: number = 200
  ): boolean {
    if (!this.isReady) return false;
    return wasmOps.render_codex_enemy_webgl(enemyTypeId, animTime, width, height);
  }

  public renderCodexSoldier(
    soldierType: string,
    stance: string,
    animTime: number,
    width: number = 240,
    height: number = 180
  ): boolean {
    if (!this.isReady) return false;
    return wasmOps.render_codex_soldier_webgl(soldierType, stance, animTime, width, height);
  }

  public renderWebGlFrame(): void {
    if (!this.isReady) return;
    wasmOps.render_webgl_frame();
  }

  public renderCustomStateWebGl(stateJson: string, animTime: number, alpha: number): number {
    if (!this.isReady) return 0;
    return wasmOps.render_custom_state_webgl(stateJson, animTime, alpha);
  }

  public stepAndRender(rawDt: number): StepRenderOutput | null {
    if (!this.isReady) return null;
    const jsonStr = wasmOps.engine_step_and_render(rawDt);
    if (!jsonStr) return null;
    try {
      return JSON.parse(jsonStr) as StepRenderOutput;
    } catch {
      return null;
    }
  }

  public syncTowersAndSoldiers(
    towers: any[],
    soldiers: any[],
    gold?: number,
    lives?: number
  ): boolean {
    if (!this.isReady) return false;
    return wasmOps.engine_sync_towers_and_soldiers(
      JSON.stringify(towers),
      JSON.stringify(soldiers),
      gold,
      lives
    );
  }

  public callWaveEarly(): {
    ok: boolean;
    bonusGold?: number;
    currentWaveIndex?: number;
    isWaveInProgress?: boolean;
  } | null {
    if (!this.isReady) return null;
    const resStr = wasmOps.engine_call_wave_early();
    if (!resStr) return null;
    try {
      return JSON.parse(resStr);
    } catch {
      return null;
    }
  }

  public setMap(mapId: string): boolean {
    if (!this.isReady) return false;
    const res = wasmOps.engine_set_map(mapId);
    return !!res;
  }

  public resetEngine(): void {
    if (!this.isReady) return;
    wasmOps.engine_reset();
  }

  public setGameSettings(
    customWaves: number,
    goldMult: number,
    dmgMult: number,
    speed: number,
    paused: boolean = false
  ): void {
    if (!this.isReady) return;
    wasmOps.engine_set_game_settings(customWaves, goldMult, dmgMult, speed, paused);
  }

  public getTowerInfo(towerId: string): any | null {
    if (!this.isReady) return null;
    const json = wasmOps.engine_get_tower_info(towerId);
    if (!json) return null;
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  public findUnengagedEnemyNear(
    center: { x: number; y: number },
    radius: number,
    enemies: EnemyEntity[],
    canBlockAir: boolean = false
  ): EnemyEntity | null {
    if (!this.isReady) return null;
    const json = wasmOps.combat_find_unengaged_enemy_near(
      JSON.stringify(enemies),
      center.x,
      center.y,
      radius,
      canBlockAir
    );
    if (!json) return null;
    try {
      return JSON.parse(json) as EnemyEntity;
    } catch {
      return null;
    }
  }

  public setSelectedTower(towerId: string | null, isSettingRally: boolean = false): void {
    if (!this.isReady) return;
    wasmOps.engine_set_selected_tower(towerId || undefined, isSettingRally);
  }

  public initAudio(): void {
    if (!this.isReady) return;
    wasmOps.audio_init();
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
        waypoints.push(lane.segments[0].p1.x, lane.segments[0].p1.y);
        for (let s = 0; s < lane.segments.length; s++) {
          waypoints.push(lane.segments[s].p2.x, lane.segments[s].p2.y);
        }

        wasmOps.set_path(modeInt, i, new Float32Array(waypoints));
      }
    };

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
      stateInt,
      enemy.x,
      enemy.y,
      enemy.facing || 0
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
