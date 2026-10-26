import { EnemyEntity } from '../types/entities.types.js';
import { EnemyArchetypeRenderer } from './EnemyArchetypeRenderer.js';

export interface SpriteKeyParams {
  typeId: string;
  state: string;
  facing: number;
  animTime: number;
  elemColor: string;
  secColor: string;
}

export class UnitSpriteCache {
  private static cache: Map<string, HTMLCanvasElement> = new Map();
  private static readonly MAX_ENTRIES = 600;
  private static readonly TILE_SIZE = 84;
  private static readonly HALF_TILE = 42;

  public static clear(): void {
    this.cache.clear();
  }

  /**
   * Quantize animation time into 12 discrete sub-second loop frames
   */
  public static quantizeAnimPhase(animTime: number, steps = 12): number {
    return Math.floor((animTime % 1.0) * steps);
  }

  /**
   * Quantize angle into 16 discrete angles (22.5 deg each) for smooth rotation
   */
  public static quantizeAngle(angle: number, steps = 16): number {
    const twoPi = Math.PI * 2;
    const normalized = ((angle % twoPi) + twoPi) % twoPi;
    return Math.round((normalized / twoPi) * steps) % steps;
  }

  /**
   * Render enemy creature body via cached offscreen tile.
   * Returns true if rendered via cache, false if fallback to direct vector draw is needed.
   */
  public static drawCachedEnemyBody(
    ctx: CanvasRenderingContext2D,
    enemy: EnemyEntity,
    drawX: number,
    drawY: number,
    animTime: number,
    elemColor: string,
    secColor: string
  ): boolean {
    if (typeof document === 'undefined') return false;

    const archetype = EnemyArchetypeRenderer.getArchetype(enemy);
    // Large bosses (Colossus, Boss Dragons) with big scales can use direct render
    if (enemy.tags.includes('BOSS') || enemy.size > 26) {
      return false;
    }

    const typeId = enemy.typeId || 'GENERIC';
    const state = enemy.state || 'WALKING';
    const animPhase = this.quantizeAnimPhase(animTime, 12);
    const angleStep = archetype === 'DRAGON' || archetype === 'SERPENT'
      ? this.quantizeAngle(enemy.facing, 16)
      : enemy.facing < -Math.PI / 2 || enemy.facing > Math.PI / 2 ? 1 : 0;

    const cacheKey = `${typeId}_${state}_${animPhase}_${angleStep}_${elemColor}_${secColor}`;

    let cachedCanvas = this.cache.get(cacheKey);
    if (!cachedCanvas) {
      if (this.cache.size >= this.MAX_ENTRIES) {
        // Evict older half of entries
        const iter = this.cache.keys();
        for (let i = 0; i < 150; i++) {
          const next = iter.next();
          if (next.done) break;
          this.cache.delete(next.value);
        }
      }

      cachedCanvas = document.createElement('canvas');
      cachedCanvas.width = this.TILE_SIZE;
      cachedCanvas.height = this.TILE_SIZE;
      const tileCtx = cachedCanvas.getContext('2d');
      if (!tileCtx) return false;

      // Render enemy at center of tile (HALF_TILE, HALF_TILE)
      const mockEnemyForBake: EnemyEntity = {
        ...enemy,
        x: this.HALF_TILE,
        y: this.HALF_TILE + (enemy.altitude || 0), // neutralize altitude during body bake
        altitude: enemy.altitude || 0
      };

      EnemyArchetypeRenderer.renderEnemyBody(
        tileCtx,
        mockEnemyForBake,
        animTime,
        elemColor,
        secColor
      );

      this.cache.set(cacheKey, cachedCanvas);
    }

    ctx.drawImage(
      cachedCanvas,
      drawX - this.HALF_TILE,
      drawY - this.HALF_TILE
    );
    return true;
  }
}

