import { EnemyEntity } from '../types/entities.types.js';
import { EnemyArchetypeRenderer } from './EnemyArchetypeRenderer.js';
import { ENEMY_BLUEPRINTS } from '../config/enemies.config.js';
import { ELEMENT_COLORS } from '../config/elements.config.js';
import { WasmBridge } from '../core/WasmBridge.js';

export interface SpriteKeyParams {
  typeId: string;
  state: string;
  facing: number;
  animTime: number;
  elemColor: string;
  secColor: string;
}

export interface AtlasUvRect {
  u0: number;
  v0: number;
  u1: number;
  v1: number;
}

export class UnitSpriteCache {
  private static cache: Map<string, HTMLCanvasElement> = new Map();
  private static readonly MAX_ENTRIES = 600;
  private static readonly TILE_SIZE = 84;
  private static readonly HALF_TILE = 42;
  private static atlasUploaded = false;
  private static codexAtlasUploaded = false;
  private static cachedAtlasCanvas: HTMLCanvasElement | null = null;
  private static cachedManifestJson: string = '';

  public static clear(): void {
    this.cache.clear();
  }

  /**
   * Bakes all enemy archetypes (4 animation frames each) + UI icons into a single GPU Texture Atlas
   * and uploads it to the Rust WebGL2 Renderer (`wasm-sim/src/webgl.rs`).
   */
  public static bakeAndUploadWebGlAtlas(bridge: WasmBridge): boolean {
    if (this.atlasUploaded || typeof document === 'undefined' || !bridge.isAvailable()) {
      return this.atlasUploaded;
    }

    const cellSize = 64;
    const cols = 16;
    const enemyEntries = Object.values(ENEMY_BLUEPRINTS);
    const totalCells = enemyEntries.length * 4 + 4;
    const rows = Math.ceil(totalCells / cols);
    const atlasW = cols * cellSize;
    const atlasH = Math.max(64, rows * cellSize);

    const atlasCanvas = document.createElement('canvas');
    atlasCanvas.width = atlasW;
    atlasCanvas.height = atlasH;
    const ctx = atlasCanvas.getContext('2d');
    if (!ctx) return false;

    const manifest: Record<string, AtlasUvRect> = {};
    let cellIdx = 0;

    const registerCell = (key: string, drawFn: (c: CanvasRenderingContext2D, cx: number, cy: number) => void) => {
      const col = cellIdx % cols;
      const row = Math.floor(cellIdx / cols);
      cellIdx++;

      const x0 = col * cellSize;
      const y0 = row * cellSize;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x0, y0, cellSize, cellSize);
      ctx.clip();
      drawFn(ctx, x0 + cellSize * 0.5, y0 + cellSize * 0.5);
      ctx.restore();

      manifest[key] = {
        u0: x0 / atlasW,
        v0: y0 / atlasH,
        u1: (x0 + cellSize) / atlasW,
        v1: (y0 + cellSize) / atlasH
      };
    };

    // 1. Bake UI icons for portals & bases
    registerCell('UI_SKULL', (c, cx, cy) => {
      c.font = '20px sans-serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('💀', cx, cy);
    });
    registerCell('UI_SWIM', (c, cx, cy) => {
      c.font = '20px sans-serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('🌊', cx, cy);
    });
    registerCell('UI_CASTLE', (c, cx, cy) => {
      c.font = '22px sans-serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('🏰', cx, cy);
    });

    // 2. Bake 4 animation frames per Enemy Blueprint
    for (const bp of enemyEntries) {
      const elemColor = ELEMENT_COLORS[bp.elementalProfile.primaryElement] || bp.color || '#ef4444';
      const secColor = bp.elementalProfile.secondaryElement
        ? ELEMENT_COLORS[bp.elementalProfile.secondaryElement] || elemColor
        : elemColor;

      for (let frame = 1; frame <= 4; frame++) {
        const animTime = (frame - 1) * 0.25;
        const key = `ENEMY_${bp.typeId}_${frame}`;
        registerCell(key, (c, cx, cy) => {
          const mockEnemy: EnemyEntity = {
            id: `bake-${bp.typeId}`,
            typeId: bp.typeId,
            name: bp.name,
            x: cx,
            y: cy,
            hp: bp.hp,
            maxHp: bp.hp,
            speed: bp.speed,
            baseSpeed: bp.speed,
            damage: bp.damage,
            attackSpeed: bp.attackSpeed,
            attackCooldown: 0,
            rewardGold: bp.rewardGold,
            movementType: bp.movementType,
            navigationMode: bp.navigationMode,
            pathDistance: 0,
            pathTotalLength: 500,
            size: Math.min(bp.size, 20),
            altitude: 0,
            facing: 0,
            state: bp.movementType === 'FLY' ? 'FLYING' : bp.movementType === 'SWIM' ? 'SWIMMING' : 'WALKING',
            engagedBySoldierId: null,
            statusEffects: [],
            tags: bp.tags || [],
            elementalProfile: bp.elementalProfile
          };
          EnemyArchetypeRenderer.renderEnemyBody(c, mockEnemy, animTime, elemColor, secColor);
        });
      }
    }

    this.cachedAtlasCanvas = atlasCanvas;
    this.cachedManifestJson = JSON.stringify(manifest);
    this.atlasUploaded = bridge.uploadWebGlAtlas(atlasCanvas, this.cachedManifestJson);
    return this.atlasUploaded;
  }

  /**
   * Uploads the cached GPU Texture Atlas to the Codex WebGL2 context
   */
  public static uploadCodexAtlas(bridge: WasmBridge): boolean {
    if (typeof document === 'undefined' || !bridge.isAvailable()) return false;
    if (!this.cachedAtlasCanvas || !this.cachedManifestJson) {
      this.bakeAndUploadWebGlAtlas(bridge);
    }
    if (this.cachedAtlasCanvas && this.cachedManifestJson) {
      this.codexAtlasUploaded = bridge.uploadCodexWebGlAtlas(
        this.cachedAtlasCanvas,
        this.cachedManifestJson
      );
    }
    return this.codexAtlasUploaded;
  }

  public static quantizeAnimPhase(animTime: number, steps = 12): number {
    return Math.floor((animTime % 1.0) * steps);
  }

  public static quantizeAngle(angle: number, steps = 16): number {
    const twoPi = Math.PI * 2;
    const normalized = ((angle % twoPi) + twoPi) % twoPi;
    return Math.round((normalized / twoPi) * steps) % steps;
  }

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

      const mockEnemyForBake: EnemyEntity = {
        ...enemy,
        x: this.HALF_TILE,
        y: this.HALF_TILE + (enemy.altitude || 0),
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
