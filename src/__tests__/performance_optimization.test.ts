import { describe, it, expect } from 'vitest';
import { swapRemove, particlePool, floatingTextPool } from '../core/ObjectPool.js';
import { WasmBridge } from '../core/WasmBridge.js';
import { GameState } from '../core/GameState.js';
import { StickmanRenderer } from '../render/StickmanRenderer.js';
import { EnemyEntity } from '../types/entities.types.js';

describe('Performance Optimization Suite', () => {
  describe('SpatialGrid & Spatial Queries (Rust WASM Engine)', () => {
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

    it('should accurately find unengaged enemy near target using Rust Spatial Grid', () => {
      const bridge = WasmBridge.ensureSingletonReady();
      const enemies = [
        createMockEnemy('e1', 100, 100, 50),
        createMockEnemy('e2', 110, 105, 300),
        createMockEnemy('e3', 500, 500, 700)
      ];

      const found = bridge.findUnengagedEnemyNear({ x: 105, y: 105 }, 50, enemies, true);
      expect(found).not.toBeNull();
      expect(['e1', 'e2']).toContain(found?.id);
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

  describe('Smart LOD Battlefield Density Thresholds', () => {
    it('should assign correct LOD levels based on battlefield density thresholds', () => {
      expect(StickmanRenderer.getLODLevel(20)).toBe('FULL');
      expect(StickmanRenderer.getLODLevel(79)).toBe('FULL');
      expect(StickmanRenderer.getLODLevel(80)).toBe('MEDIUM');
      expect(StickmanRenderer.getLODLevel(219)).toBe('MEDIUM');
      expect(StickmanRenderer.getLODLevel(220)).toBe('HIGH_CROWD');
      expect(StickmanRenderer.getLODLevel(1000)).toBe('HIGH_CROWD');
    });
  });

  describe('WasmEngine - Fixed-Timestep Execution', () => {
    it('should execute 1 simulation step under 15ms via Rust WASM Core', () => {
      const bridge = WasmBridge.ensureSingletonReady();
      const state = new GameState();

      // Add towers
      for (let i = 0; i < 10; i++) {
        state.buildTowerAt(150 + (i % 5) * 120, 120 + Math.floor(i / 5) * 100, 'ARCHER');
      }

      const start = performance.now();
      bridge.stepSimulation(1 / 60, 0);
      const duration = performance.now() - start;

      // Rust WASM tick should execute in well under 15ms
      expect(duration).toBeLessThan(15);
    });
  });
});
