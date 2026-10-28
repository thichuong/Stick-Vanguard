/**
 * Stick Vanguard - TowerRenderer Facade
 * All towers, traps, summoned units, projectiles, and GPU particles
 * are rendered in WebGL2 by Rust Engine (`wasm-sim/src/webgl/`).
 * Floating texts on the 2D HUD overlay are batched here.
 */
import {
  TowerEntity,
  ProjectileEntity,
  FloatingText,
  Particle
} from '../types/entities.types.js';

export class TowerRenderer {
  public static renderTowers(
    _ctx: CanvasRenderingContext2D,
    _towers: TowerEntity[],
    _selectedTowerId: string | null,
    _animTime: number
  ): void {
    // 100% rendered in WebGL2 Rust Engine
  }

  public static renderProjectiles(
    _ctx: CanvasRenderingContext2D,
    _projectiles: ProjectileEntity[]
  ): void {
    // 100% rendered in WebGL2 Rust Engine
  }

  public static renderFloatingTexts(
    ctx: CanvasRenderingContext2D,
    texts: FloatingText[]
  ): void {
    if (!texts || texts.length === 0) return;

    ctx.save();
    ctx.textAlign = 'center';
    let lastColor = '';
    let lastAlpha = -1;

    for (let i = 0; i < texts.length; i++) {
      const t = texts[i];
      const alpha = Math.max(0, t.lifeTime / t.maxLifeTime);
      if (alpha !== lastAlpha) {
        ctx.globalAlpha = alpha;
        lastAlpha = alpha;
      }
      if (t.color !== lastColor) {
        ctx.fillStyle = t.color;
        lastColor = t.color;
      }
      ctx.font = `bold ${t.size}px sans-serif`;
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.restore();
  }

  public static renderParticles(
    _ctx: CanvasRenderingContext2D,
    _particles: Particle[]
  ): void {
    // 100% rendered in WebGL2 Rust Engine
  }
}
