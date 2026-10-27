import { EnemyEntity } from '../types/entities.types.js';
import {
  EnemyVisualArchetype,
  ArchetypeInfo,
  getArchetype,
  getArchetypeInfo,
} from './archetypes/types.js';
import { renderDragon } from './archetypes/dragon.js';
import { renderSerpent } from './archetypes/serpent.js';
import { renderAvianBat } from './archetypes/avian_bat.js';
import { renderArachnid } from './archetypes/arachnid.js';
import { renderTurtleBeast } from './archetypes/turtle_beast.js';
import { renderSlimeCrystal } from './archetypes/slime_crystal.js';
import { renderColossus } from './archetypes/colossus.js';
import { renderWraithReaper } from './archetypes/wraith_reaper.js';
import { renderSiren } from './archetypes/siren.js';
import { renderHumanoid } from './archetypes/humanoid.js';

export type { EnemyVisualArchetype, ArchetypeInfo };

/**
 * Unified facade for enemy archetype visual representations and GPU Atlas baking.
 * Sub-archetype renderers are organized in ./archetypes/ for maintainability.
 */
export class EnemyArchetypeRenderer {
  public static getArchetype(enemy: { typeId?: string; type?: string }): EnemyVisualArchetype {
    return getArchetype(enemy);
  }

  public static getArchetypeInfo(enemy: { typeId?: string; type?: string }): ArchetypeInfo {
    return getArchetypeInfo(enemy);
  }

  /**
   * Render creature body according to its stick-art archetype
   */
  public static renderEnemyBody(
    ctx: CanvasRenderingContext2D,
    enemy: EnemyEntity,
    animTime: number,
    elemColor: string,
    secColor: string
  ): void {
    const archetype = this.getArchetype(enemy);
    const { x, y, altitude, facing } = enemy;
    const drawY = y - altitude;
    const isEngaged = enemy.state === 'ENGAGED' || enemy.state === 'ATTACKING';
    const isAttacking = enemy.state === 'ATTACKING';
    const faceDir = facing > -Math.PI / 2 && facing < Math.PI / 2 ? 1 : -1;

    ctx.save();
    ctx.translate(x, drawY);

    switch (archetype) {
      case 'DRAGON':
        renderDragon(ctx, enemy, animTime, elemColor, secColor, faceDir, isAttacking);
        break;
      case 'SERPENT':
        renderSerpent(ctx, enemy, animTime, elemColor, secColor, faceDir, isAttacking);
        break;
      case 'AVIAN_BAT':
        renderAvianBat(ctx, enemy, animTime, elemColor, secColor, faceDir, isAttacking);
        break;
      case 'ARACHNID':
        renderArachnid(ctx, enemy, animTime, elemColor, secColor, faceDir, isAttacking);
        break;
      case 'TURTLE_BEAST':
        renderTurtleBeast(ctx, enemy, animTime, elemColor, secColor, faceDir, isAttacking);
        break;
      case 'SLIME_CRYSTAL':
        renderSlimeCrystal(ctx, enemy, animTime, elemColor, secColor, faceDir, isAttacking);
        break;
      case 'COLOSSUS':
        renderColossus(ctx, enemy, animTime, elemColor, secColor, faceDir, isAttacking, isEngaged);
        break;
      case 'WRAITH_REAPER':
        renderWraithReaper(ctx, enemy, animTime, elemColor, secColor, faceDir, isAttacking);
        break;
      case 'SIREN':
        renderSiren(ctx, enemy, animTime, elemColor, secColor, faceDir, isAttacking);
        break;
      case 'HUMANOID':
      default:
        renderHumanoid(ctx, enemy, animTime, elemColor, secColor, faceDir, isAttacking, isEngaged);
        break;
    }

    ctx.restore();
  }
}
