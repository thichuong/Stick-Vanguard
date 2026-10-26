import { NavigationSystem } from '../systems/NavigationSystem.js';
import { EnemyEntity } from '../types/entities.types.js';

export class SimWorkerBridge {
  private worker: Worker | null = null;
  private isBusy = false;
  private buffer: Float32Array = new Float32Array(1024 * 7); // Pre-allocated for up to 1024 enemies
  private capacity = 1024;
  private lastResultBuffer: Float32Array | null = null;
  private hasPendingResult = false;
  private pendingResultCount = 0;

  constructor() {
    this.initWorker();
  }

  private initWorker(): void {
    if (typeof Worker !== 'undefined') {
      try {
        this.worker = new Worker(new URL('../workers/sim.worker.ts', import.meta.url), {
          type: 'module'
        });
        this.worker.onmessage = (e: MessageEvent) => {
          if (e.data.type === 'BATCH_MOVE_COMPLETE') {
            this.buffer = new Float32Array(e.data.buffer);
            this.lastResultBuffer = this.buffer;
            this.hasPendingResult = true;
            this.pendingResultCount = e.data.count;
            this.isBusy = false;
          }
        };
      } catch {
        // Fallback to synchronous execution if Workers not supported (e.g. testing)
        this.worker = null;
      }
    }
  }

  public syncPaths(navSystem: NavigationSystem): void {
    if (!this.worker) return;

    const groundPaths = navSystem.getAllLanes('GROUND_PATH');
    const waterPaths = navSystem.getAllLanes('WATER_PATH');
    const airPaths = navSystem.getAllLanes('AIR_DIRECT');

    this.worker.postMessage({
      type: 'INIT_PATHS',
      data: { groundPaths, waterPaths, airPaths }
    });
  }

  /**
   * Dispatches enemy batch movement to Web Worker if available and idle.
   */
  public dispatchBatchMove(
    enemies: EnemyEntity[],
    dt: number,
    animTime: number
  ): boolean {
    if (!this.worker || this.isBusy || enemies.length === 0) {
      return false;
    }

    const count = enemies.length;
    if (count > this.capacity) {
      this.capacity = Math.max(count * 2, 1024);
      this.buffer = new Float32Array(this.capacity * 7);
    }

    const STRIDE = 7;
    for (let i = 0; i < count; i++) {
      const e = enemies[i];
      const offset = i * STRIDE;
      const modeCode = e.navigationMode === 'WATER_PATH' ? 1 : e.navigationMode === 'AIR_DIRECT' ? 2 : 0;
      this.buffer[offset] = e.pathDistance;
      this.buffer[offset + 1] = e.speed;
      this.buffer[offset + 2] = dt;
      this.buffer[offset + 3] = modeCode;
      this.buffer[offset + 4] = e.laneIndex ?? 0;
      this.buffer[offset + 5] = animTime;
      this.buffer[offset + 6] = 0;
    }

    this.isBusy = true;
    this.hasPendingResult = false;
    this.worker.postMessage(
      {
        type: 'BATCH_MOVE_ENEMIES',
        data: {
          buffer: this.buffer.buffer,
          count
        }
      },
      [this.buffer.buffer]
    );

    return true;
  }

  public hasResult(): boolean {
    return this.hasPendingResult;
  }

  public applyResult(enemies: EnemyEntity[], onEnemyFinished: (enemy: EnemyEntity, index: number) => void): boolean {
    if (!this.hasPendingResult || !this.lastResultBuffer) {
      return false;
    }

    const buffer = this.lastResultBuffer;
    const count = Math.min(enemies.length, this.pendingResultCount);
    const STRIDE = 7;

    for (let i = count - 1; i >= 0; i--) {
      const offset = i * STRIDE;
      const enemy = enemies[i];
      enemy.pathDistance = buffer[offset];
      enemy.x = buffer[offset + 1];
      enemy.y = buffer[offset + 2];
      enemy.facing = buffer[offset + 3];
      const isFinished = buffer[offset + 4] === 1;

      if (isFinished) {
        onEnemyFinished(enemy, i);
      }
    }

    this.hasPendingResult = false;
    return true;
  }

  public terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}
