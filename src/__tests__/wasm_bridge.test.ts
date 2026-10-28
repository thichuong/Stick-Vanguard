import { describe, it, expect } from 'vitest';
import { WasmBridge } from '../core/WasmBridge.js';
import { EnemyEntity } from '../types/entities.types.js';

describe('WasmBridge Core Architecture', () => {
  it('should maintain singleton instance and ID mapping', () => {
    const bridge = WasmBridge.getInstance();
    expect(bridge).toBeDefined();

    const id1 = bridge.getOrCreateU32Id('enemy-1');
    const id2 = bridge.getOrCreateU32Id('enemy-2');
    const id1Repeat = bridge.getOrCreateU32Id('enemy-1');

    expect(id1).toBeGreaterThan(0);
    expect(id2).toBeGreaterThan(id1);
    expect(id1Repeat).toBe(id1);

    expect(bridge.getStrId(id1)).toBe('enemy-1');
    expect(bridge.getStrId(id2)).toBe('enemy-2');

    bridge.removeEnemy('enemy-1');
    expect(bridge.getStrId(id1)).toBeUndefined();

    bridge.clearAll();
    expect(bridge.getStrId(id2)).toBeUndefined();
  });

  it('should handle uninitialized state safely before wasm binary is loaded', () => {
    const bridge = new WasmBridge();
    expect(bridge.isAvailable()).toBe(false);
    expect(bridge.getRenderView()).toBeNull();
    expect(bridge.findBestTargetInRange(100, 100, 50)).toBeNull();
    expect(bridge.queryRadius(100, 100, 50)).toEqual([]);
    expect(bridge.hasEnemyFinished('enemy-1')).toBe(false);
  });

  it('should initialize and execute simulation when wasm binary is loaded', async () => {
    const bridge = new WasmBridge();

    // Dynamically read binary in vitest/node runner without static node imports
    let wasmBuffer: Uint8Array | null = null;
    try {
      const fsMod: any = await import(/* @vite-ignore */ 'node:' + 'fs');
      const pathMod: any = await import(/* @vite-ignore */ 'node:' + 'path');
      const proc: any = (globalThis as any).process;
      const wasmPath = pathMod.resolve(proc.cwd(), 'src/wasm/wasm_sim_bg.wasm');
      if (fsMod.existsSync(wasmPath)) {
        wasmBuffer = fsMod.readFileSync(wasmPath);
      }
    } catch {
      // In browser or non-node runner
    }

    if (wasmBuffer) {
      const ok = await bridge.init(wasmBuffer);
      expect(ok).toBe(true);
      expect(bridge.isAvailable()).toBe(true);

      const enemy: EnemyEntity = {
        id: 'test-enemy-1',
        typeId: 'GOBLIN',
        name: 'Goblin Test',
        x: 100,
        y: 100,
        hp: 150,
        maxHp: 150,
        speed: 60,
        baseSpeed: 60,
        damage: 5,
        attackSpeed: 1,
        attackCooldown: 1,
        rewardGold: 10,
        movementType: 'WALK',
        navigationMode: 'GROUND_PATH',
        pathDistance: 50,
        pathTotalLength: 1000,
        size: 16,
        altitude: 0,
        facing: 0,
        state: 'WALKING',
        engagedBySoldierId: null,
        statusEffects: [],
        tags: [],
        elementalProfile: {
          primaryElement: 'EARTH',
          immunities: []
        }
      };

      bridge.spawnEnemy(enemy);
      bridge.stepSimulation(1 / 60, 0.1);

      const view = bridge.getRenderView();
      expect(view).not.toBeNull();
      expect(view!.length).toBeGreaterThanOrEqual(12);
      expect(bridge.getRenderStride()).toBe(12);

      // Check Spatial Query in Rust
      const target = bridge.findBestTargetInRange(100, 100, 150, 'FIRST');
      expect(target).toBe('test-enemy-1');

      const aoeHits = bridge.queryRadius(100, 100, 150);
      expect(aoeHits).toContain('test-enemy-1');

      // Edge cases: out of bounds, negative coords, zero radius
      expect(bridge.queryRadius(-100, -100, 20)).toEqual([]);
      expect(bridge.queryRadius(2000, 2000, 50)).toEqual([]);
      expect(bridge.queryRadius(100, 100, 0)).toEqual([]);
      expect(bridge.queryRadius(100, 100, -10)).toEqual([]);
      expect(bridge.findBestTargetInRange(-50, -50, 10)).toBeNull();
      expect(bridge.findBestTargetInRange(100, 100, -10)).toBeNull();

      // Stress test: spawn multiple enemies, step, remove one, query radius immediately (bug regression check)
      const enemy2: EnemyEntity = { ...enemy, id: 'test-enemy-2', pathDistance: 80 };
      const enemy3: EnemyEntity = { ...enemy, id: 'test-enemy-3', pathDistance: 120 };
      bridge.spawnEnemy(enemy2);
      bridge.spawnEnemy(enemy3);
      bridge.stepSimulation(1 / 60, 0.2);

      // Remove enemy in the middle or end
      bridge.removeEnemy('test-enemy-2');

      // queryRadius must NEVER panic when enemies are removed after stepSimulation
      const hitsAfterRemoval = bridge.queryRadius(100, 100, 200);
      expect(hitsAfterRemoval).not.toContain('test-enemy-2');
      expect(hitsAfterRemoval).toContain('test-enemy-1');
      expect(hitsAfterRemoval).toContain('test-enemy-3');

      bridge.rebuildSpatialGrid();
      const hitsAfterRebuild = bridge.queryRadius(100, 100, 200);
      expect(hitsAfterRebuild).not.toContain('test-enemy-2');

      // Test status update and removal
      enemy.hp = 0;
      enemy.state = 'DEAD';
      bridge.updateEnemyStatus(enemy);
      bridge.removeEnemy('test-enemy-1');
      bridge.removeEnemy('test-enemy-3');
      bridge.clearAll();
      expect(bridge.getRenderView()?.length || 0).toBe(0);

      // Test Full Rust WASM Engine, Rules, Wave Generator, Audio & WebGL2 Vertex Batcher
      const ops = bridge.getOps();
      const mapStateJson = ops.engine_set_map('valley_origin');
      const mapState = JSON.parse(mapStateJson);
      expect(mapState.currentMapId).toBe('valley_origin');
      expect(mapState.gold).toBe(320);

      // Build an Archer tower in Rust
      const buildRes = JSON.parse(ops.engine_build_tower('slot-r1', 'ARCHER'));
      expect(buildRes.ok).toBe(true);
      expect(buildRes.state.towers.length).toBe(1);
      expect(buildRes.state.towers[0].type).toBe('ARCHER');

      // Start Wave 1 in Rust and run simulation ticks
      const waveStart = JSON.parse(ops.engine_start_wave(1));
      expect(waveStart.ok).toBe(true);
      expect(waveStart.isWaveInProgress).toBe(true);

      let tickedState = buildRes.state;
      for (let i = 0; i < 65; i++) {
        tickedState = JSON.parse(ops.engine_tick(1 / 60));
      }
      expect(tickedState.enemies.length).toBeGreaterThan(0);

      // Test WebGL2 scene vertex generation in Rust
      const vertexCount = bridge.renderCustomStateWebGl(JSON.stringify(tickedState), 1.0, 1.0);
      expect(vertexCount).toBeGreaterThan(100);

      // Test Rust Audio recording
      ops.audio_clear_recorded_events();
      ops.audio_play_shoot('ARCHER');
      const recordedAudio = JSON.parse(ops.audio_get_recorded_events_json());
      expect(recordedAudio.length).toBeGreaterThan(0);
      expect(recordedAudio[0].sound).toBe('SHOOT');

      // Test Codex Unit Preview Rendering via Rust WASM
      const enemyRenderOk = ops.render_codex_enemy_webgl('STICK_RUNNER', 1.2, 240, 200);
      expect(enemyRenderOk).toBe(true);

      const soldierRenderOk = ops.render_codex_soldier_webgl('BARRACKS', 'MELEE', 0.8, 240, 180);
      expect(soldierRenderOk).toBe(true);

      const dragonRenderOk = ops.render_codex_soldier_webgl('DRAGON_NEST', 'MELEE', 1.5, 240, 180);
      expect(dragonRenderOk).toBe(true);

      // Test New Pure Rust Step and Render Loop API
      const stepOut = bridge.stepAndRender(0.016);
      expect(stepOut).not.toBeNull();
      expect(stepOut!.gold).toBeDefined();
      expect(stepOut!.lives).toBeDefined();
      expect(stepOut!.currentWaveIndex).toBeDefined();
      expect(Array.isArray(stepOut!.floatingTexts)).toBe(true);

      // Test syncTowersAndSoldiers
      const syncOk = bridge.syncTowersAndSoldiers(
        [{ id: 't-test', x: 200, y: 200, type: 'ARCHER', tier: 1, element: 'PHYSICAL', placement: 'ROADSIDE', totalInvested: 100 }],
        [],
        450,
        18
      );
      expect(syncOk).toBe(true);

      // Test getTowerInfo
      const towerInfo = bridge.getTowerInfo('t-test');
      expect(towerInfo).not.toBeNull();
      expect(towerInfo.id).toBe('t-test');

      // Test callWaveEarly
      const earlyRes = bridge.callWaveEarly();
      expect(earlyRes).not.toBeNull();
      expect(earlyRes!.ok).toBe(true);

      // Test Typed Engine Facade Methods
      const valRes = bridge.validatePlacement(150, 105, 'ARCHER');
      expect(typeof valRes.valid).toBe('boolean');

      const buildAtRes = bridge.buildTowerAt(150, 105, 'ARCHER');
      expect(typeof buildAtRes.ok).toBe('boolean');

      // Test addFloatingText facade
      bridge.addFloatingText('Test Floating Text', 200, 200, '#ffffff', 14);

      // Test engine state json
      const stateJson = bridge.getStateJson();
      expect(typeof stateJson).toBe('string');
      expect(stateJson.length).toBeGreaterThan(0);
    }
  });
});

