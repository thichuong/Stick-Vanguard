import {
  EnemyEntity,
  SoldierEntity
} from '../types/entities.types.js';
import { ELEMENT_COLORS, ELEMENT_ICONS } from '../config/elements.config.js';
import { ElementType } from '../types/elements.types.js';

export class StickmanRenderer {
  /**
   * Renders a procedural enemy stickman
   */
  public static renderEnemy(
    ctx: CanvasRenderingContext2D,
    enemy: EnemyEntity,
    animTime: number
  ): void {
    if (enemy.hp <= 0 || enemy.state === 'DEAD') return;

    const { x, y, size, altitude, elementalProfile } = enemy;
    const drawY = y - altitude;
    const isEngaged = enemy.state === 'ENGAGED' || enemy.state === 'ATTACKING';
    const isAttacking = enemy.state === 'ATTACKING';

    ctx.save();

    // 1. Shadow (especially visible for flying enemies)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    const shadowScale = Math.max(0.4, 1 - altitude / 60);
    ctx.ellipse(x, y + 4, (size * 0.7) * shadowScale, (size * 0.35) * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Wings for Flying Enemy
    if (enemy.movementType === 'FLY') {
      const wingFlap = Math.sin(animTime * 14) * 0.45;
      ctx.save();
      ctx.translate(x, drawY);
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2.5;

      // Left wing
      ctx.beginPath();
      ctx.moveTo(-4, -6);
      ctx.lineTo(-20, -18 + wingFlap * 14);
      ctx.lineTo(-12, -4 + wingFlap * 8);
      ctx.stroke();

      // Right wing
      ctx.beginPath();
      ctx.moveTo(4, -6);
      ctx.lineTo(20, -18 + wingFlap * 14);
      ctx.lineTo(12, -4 + wingFlap * 8);
      ctx.stroke();
      ctx.restore();
    }

    // 3. Water ripples for Swimming Enemy
    if (enemy.movementType === 'SWIM') {
      ctx.save();
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.6)';
      ctx.lineWidth = 1.5;
      const ripple = (animTime * 2) % 1;
      ctx.beginPath();
      ctx.ellipse(x, y + 2, 14 + ripple * 8, 7 + ripple * 4, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 4. Ghost translucency for Shadow Wraith
    if (enemy.tags.includes('GHOST')) {
      ctx.globalAlpha = 0.75 + Math.sin(animTime * 5) * 0.15;
    }

    // 5. Procedural Stickman Skeleton
    const elemColor = ELEMENT_COLORS[elementalProfile.primaryElement] || '#ffffff';
    ctx.strokeStyle = elemColor;
    ctx.lineWidth = enemy.size > 22 ? 3.5 : 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const walkCycle = isEngaged ? 0 : Math.sin(animTime * 8);
    const attackSwing = isAttacking ? Math.sin(animTime * 12) * 16 : 0;

    // Head
    const headRadius = size * 0.3;
    const headY = drawY - size * 0.7;
    ctx.beginPath();
    ctx.arc(x, headY, headRadius, 0, Math.PI * 2);
    ctx.fillStyle = elemColor;
    ctx.fill();
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    const faceDir = enemy.facing > -Math.PI / 2 && enemy.facing < Math.PI / 2 ? 1 : -1;
    ctx.arc(x + faceDir * (headRadius * 0.4), headY - 1, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Spine
    const neckY = headY + headRadius;
    const pelvisY = drawY + size * 0.2;
    ctx.beginPath();
    ctx.moveTo(x, neckY);
    ctx.lineTo(x, pelvisY);
    ctx.stroke();

    // Arms
    const shoulderY = neckY + 4;
    ctx.beginPath();
    ctx.moveTo(x - 8, shoulderY + walkCycle * 4);
    ctx.lineTo(x, shoulderY);
    ctx.lineTo(x + 10 + attackSwing, shoulderY - walkCycle * 4);
    ctx.stroke();

    // Legs (only if not swimming deep)
    if (enemy.movementType !== 'SWIM') {
      ctx.beginPath();
      // Left leg
      ctx.moveTo(x, pelvisY);
      ctx.lineTo(x - 6 - walkCycle * 6, drawY + size * 0.8);
      // Right leg
      ctx.moveTo(x, pelvisY);
      ctx.lineTo(x + 6 + walkCycle * 6, drawY + size * 0.8);
      ctx.stroke();
    }

    // 6. Health bar & Elemental icons
    this.renderHealthBar(ctx, x, headY - 10, enemy.hp, enemy.maxHp, elementalProfile.primaryElement, enemy.statusEffects);

    ctx.restore();
  }

  /**
   * Renders a friendly stickman soldier
   */
  public static renderSoldier(
    ctx: CanvasRenderingContext2D,
    soldier: SoldierEntity,
    animTime: number
  ): void {
    if (soldier.state === 'DEAD') return;

    const { x, y, tier, branch, state } = soldier;
    const isAttacking = state === 'ATTACKING';
    const isMoving = state === 'MOVING_TO_ENGAGE' || state === 'MOVING_TO_RALLY';

    ctx.save();

    // 1. Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x, y + 6, 9, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Aura for Paladin (Tier 4 Branch A)
    if (tier === 4 && branch === 'A') {
      ctx.save();
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y - 6, 18 + Math.sin(animTime * 4) * 2, 0, Math.PI * 2);
      ctx.stroke();

      // Halo above head
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(x, y - 26, 8, 3, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 3. Billowing Cape for Tempest Spartan (Tier 4 Branch B)
    if (tier === 4 && branch === 'B') {
      ctx.save();
      ctx.fillStyle = '#dc2626'; // Crimson red cape
      const capeWave = Math.sin(animTime * 8) * 4;
      ctx.beginPath();
      ctx.moveTo(x - 3, y - 10);
      ctx.quadraticCurveTo(x - 14, y - 2 + capeWave, x - 12, y + 10 + capeWave);
      ctx.lineTo(x - 2, y + 2);
      ctx.fill();
      ctx.restore();
    }

    // 4. Stickman Skeleton
    const bodyColor = tier >= 3 ? '#f1f5f9' : '#cbd5e1';
    ctx.strokeStyle = bodyColor;
    ctx.lineWidth = tier >= 3 ? 3 : 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const walk = isMoving ? Math.sin(animTime * 10) : 0;
    const swing = isAttacking ? Math.sin(animTime * 14) * 12 : 0;

    const headRadius = 5;
    const headY = y - 16;

    // Head
    ctx.beginPath();
    ctx.arc(x, headY, headRadius, 0, Math.PI * 2);
    ctx.fillStyle = bodyColor;
    ctx.fill();
    ctx.stroke();

    // Helmet Crest (Spartan / Knight)
    if (tier >= 3) {
      ctx.fillStyle = branch === 'B' ? '#ef4444' : '#3b82f6';
      ctx.beginPath();
      ctx.moveTo(x - 4, headY - 4);
      ctx.lineTo(x, headY - 9);
      ctx.lineTo(x + 4, headY - 4);
      ctx.fill();
    }

    // Spine
    ctx.beginPath();
    ctx.moveTo(x, headY + headRadius);
    ctx.lineTo(x, y);
    ctx.stroke();

    // Shield or Bow (Left Hand)
    const isRanged = soldier.combatMode === 'RANGED';

    if (isRanged) {
      // Archer Bow in Left Hand
      ctx.save();
      ctx.strokeStyle = '#78350f'; // Dark wood
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(x - 6, y - 6, 8, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();

      // Bow string
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 6, y - 14);
      ctx.lineTo(x - (isAttacking ? 2 : 6), y - 6);
      ctx.lineTo(x - 6, y + 2);
      ctx.stroke();
      ctx.restore();
    } else if (tier >= 2) {
      // Melee Shield
      ctx.save();
      ctx.fillStyle = branch === 'A' ? '#fef08a' : '#64748b';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(x - 7, y - 6, 4, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Weapon (Right Hand)
    ctx.save();
    const elemColor = soldier.secondaryElement ? ELEMENT_COLORS[soldier.secondaryElement] : '#e2e8f0';

    if (isRanged) {
      // Arrow nocked or drawn
      ctx.strokeStyle = elemColor;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(x - 2, y - 6);
      ctx.lineTo(x + 8 + swing, y - 6);
      ctx.stroke();
    } else if (tier === 4 && branch === 'B') {
      // Vanguard Elite Halberd / Dual blade
      ctx.strokeStyle = elemColor;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(x + 2, y - 2);
      ctx.lineTo(x + 14 + swing, y - 18 - swing);
      ctx.stroke();
    } else {
      // Melee Sword
      ctx.strokeStyle = elemColor;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(x + 2, y - 4);
      ctx.lineTo(x + 10 + swing, y - 12 - swing);
      ctx.stroke();
    }
    ctx.restore();

    // Legs
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 4 - walk * 5, y + 10);
    ctx.moveTo(x, y);
    ctx.lineTo(x + 4 + walk * 5, y + 10);
    ctx.stroke();

    // Soldier Health bar
    const displayElement = soldier.secondaryElement || soldier.element;
    this.renderHealthBar(ctx, x, headY - 8, soldier.hp, soldier.maxHp, displayElement, []);

    ctx.restore();
  }

  private static renderHealthBar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    hp: number,
    maxHp: number,
    element: string,
    statusEffects: any[]
  ): void {
    const width = 28;
    const height = 4;
    const healthPercent = Math.max(0, Math.min(1, hp / maxHp));

    ctx.save();
    // Background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(x - width / 2 - 1, y - 1, width + 2, height + 2);

    // Health Fill
    ctx.fillStyle = healthPercent > 0.5 ? '#22c55e' : healthPercent > 0.25 ? '#eab308' : '#ef4444';
    ctx.fillRect(x - width / 2, y, width * healthPercent, height);

    // Element indicator pip
    const icon = ELEMENT_ICONS[element as ElementType] || '⚔️';
    ctx.font = '13px sans-serif';
    ctx.fillText(icon, x - width / 2 - 14, y + 6);

    // Status icons
    if (statusEffects.length > 0) {
      let iconOffset = 0;
      for (const eff of statusEffects) {
        let effIcon = '';
        if (eff.type === 'BURN') effIcon = '🔥';
        else if (eff.type === 'SLOW' || eff.type === 'FREEZE') effIcon = '❄️';
        else if (eff.type === 'WET') effIcon = '💧';
        if (effIcon) {
          ctx.fillText(effIcon, x + width / 2 + 2 + iconOffset, y + 6);
          iconOffset += 13;
        }
      }
    }

    ctx.restore();
  }
}
