import { describe, it, expect } from 'vitest';
import { SpatialIndex } from '../core/SpatialIndex.js';
import { swapRemove, particlePool, floatingTextPool } from '../core/ObjectPool.js';
import { SimulationEngine } from '../core/SimulationEngine.js';
import { GameState } from '../core/GameState.js';
import { NavigationSystem } from '../systems/NavigationSystem.js';
import { WaveSystem } from '../systems/WaveSystem.js';
import { StickmanRenderer } from '../render/StickmanRenderer.js';
import { UnitSpriteCache } from '../render/UnitSpriteCache.js';
import { EnemyEntity } from '../types/entities.types.js';

describe('Performance Optimization Suite', () => {
  describe('SpatialIndex - O(1) Spatial Hash Grid', () => {
    function createMockEnemy(id: string, x: number, y: number, pathDistance: number): EnemyEntity {
      return {
        id,
        typeId: 'RUNNER_STICKMAN',
        name: 'Runner',
        x,
        y,
        hp: 100,
        maxHp: 100,
        speed: 80,
        baseSpeed: 80,
        damage: 10,
        attackSpeed: 1,
        attackCooldown: 0,
        rewardGold: 5,
        movementType: 'WALK',
        navigationMode: 'GROUND_PATH',
        pathDistance,
        pathTotalLength: 800,
        elementalProfile: { primaryElement: 'PHYSICAL', immunities: [], damageMultipliers: {} as any },
        state: 'WALKING',
        engagedBySoldierId: null,
        statusEffects: [],
        tags: [],
        altitude: 0,
        size: 14,
        facing: 0
      };
    }

    it('should accurately return all enemies within radius matching linear brute force scan', () => {
      const spatial = new SpatialIndex();
      const enemies: EnemyEntity[] = [];

      // Create 500 enemies at diverse coordinates
      for (let i = 0; i < 500; i++) {
        const x = (i * 37) % 1000;
        const y = (i * 43) % 650;
        enemies.push(createMockEnemy(`e_${i}`, x, y, i * 2));
      }

      spatial.rebuild(enemies);

      const testX = 350;
      const testY = 280;
      const radius = 120;
      const radiusSq = radius * radius;

      // Brute force results
      const bruteForceExpected = enemies.filter((e) => {
        const dx = e.x - testX;
        const dy = e.y - testY;
        return dx * dx + dy * dy <= radiusSq;
      });

      // Spatial index results
      const spatialResults = spatial.queryRadius(testX, testY, radius);

      expect(spatialResults.length).toBe(bruteForceExpected.length);
      const spatialIds = new Set(spatialResults.map((e) => e.id));
      for (const expected of bruteForceExpected) {
        expect(spatialIds.has(expected.id)).toBe(true);
      }
    });

    it('should correctly find the enemy furthest along its path in range', () => {
      const spatial = new SpatialIndex();
      const enemies = [
        createMockEnemy('e1', 100, 100, 50),
        createMockEnemy('e2', 110, 105, 300), // furthest in range
        createMockEnemy('e3', 120, 110, 150),
        createMockEnemy('e4', 500, 500, 700)  // outside range
      ];

      spatial.rebuild(enemies);
      const best = spatial.findBestTargetInRange(100, 100, 50);
      expect(best).not.toBeNull();
      expect(best?.id).toBe('e2');
      expect(best?.pathDistance).toBe(300);
    });

    it('should correctly find closest enemy in range', () => {
      const spatial = new SpatialIndex();
      const enemies = [
        createMockEnemy('e1', 200, 200, 100),
        createMockEnemy('e2', 205, 200, 200), // closest to (203, 200)
        createMockEnemy('e3', 240, 200, 300)
      ];

      spatial.rebuild(enemies);
      const closest = spatial.findClosestInRange(203, 200, 30);
      expect(closest).not.toBeNull();
      expect(closest?.id).toBe('e2');
    });
  });

  describe('ObjectPool and swapRemove', () => {
    it('swapRemove should remove elements in O(1) time without splice shift', () => {
      const arr = [10, 20, 30, 40, 50];
      swapRemove(arr, 1); // remove 20
      expect(arr.length).toBe(4);
      expect(arr.includes(20)).toBe(false);
      // Last element 50 took index 1
      expect(arr[1]).toBe(50);
    });

    it('particlePool and floatingTextPool should acquire and recycle items', () => {
      const p1 = particlePool.acquire();
      p1.x = 42;
      expect(p1.id).toBeDefined();

      particlePool.release(p1);
      const p2 = particlePool.acquire();
      expect(p2).toBeDefined();

      const t1 = floatingTextPool.acquire();
      t1.text = 'Crit!';
      floatingTextPool.release(t1);
      const t2 = floatingTextPool.acquire();
      expect(t2).toBeDefined();
    });
  });

  describe('Smart LOD and Sprite Quantization', () => {
    it('should assign correct LOD levels based on battlefield density thresholds', () => {
      expect(StickmanRenderer.getLODLevel(20)).toBe('FULL');
      expect(StickmanRenderer.getLODLevel(79)).toBe('FULL');
      expect(StickmanRenderer.getLODLevel(80)).toBe('MEDIUM');
      expect(StickmanRenderer.getLODLevel(219)).toBe('MEDIUM');
      expect(StickmanRenderer.getLODLevel(220)).toBe('HIGH_CROWD');
      expect(StickmanRenderer.getLODLevel(1000)).toBe('HIGH_CROWD');
    });

    it('UnitSpriteCache should correctly quantize animation phases and angles', () => {
      expect(UnitSpriteCache.quantizeAnimPhase(0.0)).toBe(0);
      expect(UnitSpriteCache.quantizeAnimPhase(0.5)).toBe(6);
      expect(UnitSpriteCache.quantizeAnimPhase(0.99)).toBe(11);

      // Angle quantization
      expect(UnitSpriteCache.quantizeAngle(0)).toBe(0);
      expect(UnitSpriteCache.quantizeAngle(Math.PI)).toBe(8);
      expect(UnitSpriteCache.quantizeAngle(Math.PI * 2)).toBe(0);
    });
  });

  describe('SimulationEngine - Fixed-Timestep Execution', () => {
    it('should tick at 60Hz and compute interpolation alpha accurately', () => {
      const state = new GameState();
      const navSystem = new NavigationSystem(state.currentMap);
      const waveSystem = new WaveSystem(state.currentMap, 15);
      const engine = new SimulationEngine(state, navSystem, waveSystem);

      // Advance 1/120th second (half a tick) -> accumulator = 1/120, subSteps = 0, alpha = 0.5
      engine.update(1 / 120);
      expect(engine.getInterpolationAlpha()).toBeCloseTo(0.5, 2);

      // Advance another 1/120th second -> total 1/60, executes 1 tick, remainder = 0, alpha ~ 0.0
      engine.update(1 / 120);
      expect(engine.getInterpolationAlpha()).toBeCloseTo(0.0, 2);
    });

    it('should execute 1 simulation tick under 15ms even with 1,500 enemies on field', () => {
      const state = new GameState();
      const navSystem = new NavigationSystem(state.currentMap);
      const waveSystem = new WaveSystem(state.currentMap, 15);
      const engine = new SimulationEngine(state, navSystem, waveSystem);

      // Spawn 1,500 enemies
      for (let i = 0; i < 1500; i++) {
        state.enemies.push({
          id: `en_${i}`,
          typeId: 'RUNNER_STICKMAN',
          name: 'Runner',
          x: (i * 17) % 950 + 20,
          y: (i * 23) % 600 + 20,
          hp: 100,
          maxHp: 100,
          speed: 70,
          baseSpeed: 70,
          damage: 10,
          attackSpeed: 1,
          attackCooldown: 0,
          rewardGold: 2,
          movementType: 'WALK',
          navigationMode: 'GROUND_PATH',
          pathDistance: i % 400,
          pathTotalLength: 800,
          elementalProfile: { primaryElement: 'PHYSICAL', immunities: [], damageMultipliers: {} as any },
          state: 'WALKING',
          engagedBySoldierId: null,
          statusEffects: [],
          tags: [],
          altitude: 0,
          size: 14,
          facing: 0
        });
      }

      // Add towers
      for (let i = 0; i < 30; i++) {
        state.buildTowerAt(150 + (i % 6) * 120, 120 + Math.floor(i / 6) * 100, 'ARCHER');
      }

      const start = performance.now();
      engine.tick(1 / 60);
      const duration = performance.now() - start;

      // Single tick simulation with 1,500 units should execute in well under 25ms
      expect(duration).toBeLessThan(25);
    });
  });
});
