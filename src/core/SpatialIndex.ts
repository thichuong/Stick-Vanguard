import { EnemyEntity } from '../types/entities.types.js';
import { WasmBridge } from './WasmBridge.js';

/**
 * 2D Spatial Hash Grid for high-performance O(1) proximity queries.
 * Map dimensions: 1000 x 650
 * Cell size: 64px -> 16 columns x 11 rows = 176 cells.
 * Reuses internal flat arrays each frame to avoid GC pressure.
 */
export class SpatialIndex {
  private static readonly CELL_SIZE = 64;
  private static readonly COLS = 16; // Math.ceil(1000 / 64)
  private static readonly ROWS = 11; // Math.ceil(650 / 64)
  private static readonly TOTAL_CELLS = SpatialIndex.COLS * SpatialIndex.ROWS;

  // Each cell stores an array of references to EnemyEntity
  private cells: EnemyEntity[][];
  private cellCounts: Uint16Array;
  private enemyMap: Map<string, EnemyEntity> = new Map();

  constructor() {
    this.cells = new Array(SpatialIndex.TOTAL_CELLS);
    this.cellCounts = new Uint16Array(SpatialIndex.TOTAL_CELLS);
    for (let i = 0; i < SpatialIndex.TOTAL_CELLS; i++) {
      this.cells[i] = [];
    }
  }

  /**
   * Rebuild the spatial grid with currently alive enemies.
   * Call once per simulation tick.
   */
  public rebuild(enemies: EnemyEntity[]): void {
    // Clear previous cell counts
    for (let i = 0; i < SpatialIndex.TOTAL_CELLS; i++) {
      this.cellCounts[i] = 0;
    }
    this.enemyMap.clear();

    const cols = SpatialIndex.COLS;
    const rows = SpatialIndex.ROWS;
    const cellSize = SpatialIndex.CELL_SIZE;

    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (e.hp <= 0 || e.state === 'DEAD') continue;

      this.enemyMap.set(e.id, e);

      // Clamp coordinates to grid
      const col = Math.max(0, Math.min(cols - 1, Math.floor(e.x / cellSize)));
      const row = Math.max(0, Math.min(rows - 1, Math.floor(e.y / cellSize)));
      const cellIdx = row * cols + col;

      const currentCount = this.cellCounts[cellIdx];
      const cellArr = this.cells[cellIdx];
      if (currentCount < cellArr.length) {
        cellArr[currentCount] = e;
      } else {
        cellArr.push(e);
      }
      this.cellCounts[cellIdx] = currentCount + 1;
    }
  }

  /**
   * Retrieve cached enemy by ID in O(1) time without allocating new Map each frame.
   */
  public getEnemyById(id: string): EnemyEntity | undefined {
    return this.enemyMap.get(id);
  }

  /**
   * Query all alive enemies within radius around (x, y).
   * Populates out buffer to avoid array allocation if provided.
   */
  public queryRadius(
    x: number,
    y: number,
    radius: number,
    out: EnemyEntity[] = []
  ): EnemyEntity[] {
    out.length = 0;

    const wasm = WasmBridge.getInstance();
    if (wasm.isAvailable()) {
      const ids = wasm.queryRadius(x, y, radius);
      if (ids.length > 0) {
        for (let i = 0; i < ids.length; i++) {
          const en = this.enemyMap.get(ids[i]);
          if (en && en.hp > 0 && en.state !== 'DEAD') {
            out.push(en);
          }
        }
        return out;
      }
    }

    const cellSize = SpatialIndex.CELL_SIZE;
    const cols = SpatialIndex.COLS;
    const rows = SpatialIndex.ROWS;
    const radiusSq = radius * radius;

    const minCol = Math.max(0, Math.floor((x - radius) / cellSize));
    const maxCol = Math.min(cols - 1, Math.floor((x + radius) / cellSize));
    const minRow = Math.max(0, Math.floor((y - radius) / cellSize));
    const maxRow = Math.min(rows - 1, Math.floor((y + radius) / cellSize));

    for (let r = minRow; r <= maxRow; r++) {
      const rowOffset = r * cols;
      for (let c = minCol; c <= maxCol; c++) {
        const cellIdx = rowOffset + c;
        const count = this.cellCounts[cellIdx];
        const cellArr = this.cells[cellIdx];

        for (let i = 0; i < count; i++) {
          const e = cellArr[i];
          const dx = e.x - x;
          const dy = e.y - y;
          if (dx * dx + dy * dy <= radiusSq) {
            out.push(e);
          }
        }
      }
    }

    return out;
  }

  /**
   * Find the enemy furthest along its path (max pathDistance) within range.
   * Used heavily by towers and ranged soldiers.
   */
  public findBestTargetInRange(
    x: number,
    y: number,
    range: number,
    canTargetFilter?: (enemy: EnemyEntity) => boolean
  ): EnemyEntity | null {
    const wasm = WasmBridge.getInstance();
    if (wasm.isAvailable() && !canTargetFilter) {
      const bestId = wasm.findBestTargetInRange(x, y, range, 'FIRST');
      if (bestId) {
        const en = this.enemyMap.get(bestId);
        if (en && en.hp > 0 && en.state !== 'DEAD') return en;
      }
    }

    const cellSize = SpatialIndex.CELL_SIZE;
    const cols = SpatialIndex.COLS;
    const rows = SpatialIndex.ROWS;
    const rangeSq = range * range;

    const minCol = Math.max(0, Math.floor((x - range) / cellSize));
    const maxCol = Math.min(cols - 1, Math.floor((x + range) / cellSize));
    const minRow = Math.max(0, Math.floor((y - range) / cellSize));
    const maxRow = Math.min(rows - 1, Math.floor((y + range) / cellSize));

    let bestTarget: EnemyEntity | null = null;
    let maxProgress = -1;

    for (let r = minRow; r <= maxRow; r++) {
      const rowOffset = r * cols;
      for (let c = minCol; c <= maxCol; c++) {
        const cellIdx = rowOffset + c;
        const count = this.cellCounts[cellIdx];
        const cellArr = this.cells[cellIdx];

        for (let i = 0; i < count; i++) {
          const e = cellArr[i];
          const dx = e.x - x;
          const dy = e.y - y;
          if (dx * dx + dy * dy <= rangeSq) {
            if (canTargetFilter && !canTargetFilter(e)) {
              continue;
            }
            if (e.pathDistance > maxProgress) {
              maxProgress = e.pathDistance;
              bestTarget = e;
            }
          }
        }
      }
    }

    return bestTarget;
  }

  /**
   * Find the closest enemy to (x, y) within a maximum distance.
   */
  public findClosestInRange(
    x: number,
    y: number,
    maxRadius: number,
    filter?: (enemy: EnemyEntity) => boolean
  ): EnemyEntity | null {
    const cellSize = SpatialIndex.CELL_SIZE;
    const cols = SpatialIndex.COLS;
    const rows = SpatialIndex.ROWS;
    let minDistSq = maxRadius * maxRadius;
    let closest: EnemyEntity | null = null;

    const minCol = Math.max(0, Math.floor((x - maxRadius) / cellSize));
    const maxCol = Math.min(cols - 1, Math.floor((x + maxRadius) / cellSize));
    const minRow = Math.max(0, Math.floor((y - maxRadius) / cellSize));
    const maxRow = Math.min(rows - 1, Math.floor((y + maxRadius) / cellSize));

    for (let r = minRow; r <= maxRow; r++) {
      const rowOffset = r * cols;
      for (let c = minCol; c <= maxCol; c++) {
        const cellIdx = rowOffset + c;
        const count = this.cellCounts[cellIdx];
        const cellArr = this.cells[cellIdx];

        for (let i = 0; i < count; i++) {
          const e = cellArr[i];
          const dx = e.x - x;
          const dy = e.y - y;
          const dSq = dx * dx + dy * dy;
          if (dSq <= minDistSq) {
            if (filter && !filter(e)) {
              continue;
            }
            minDistSq = dSq;
            closest = e;
          }
        }
      }
    }

    return closest;
  }
}

