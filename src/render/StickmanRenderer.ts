import {
  EnemyEntity,
  SoldierEntity
} from '../types/entities.types.js';
import { ELEMENT_COLORS, ELEMENT_ICONS } from '../config/elements.config.js';
import { ElementType } from '../types/elements.types.js';
import { EnemyArchetypeRenderer } from './EnemyArchetypeRenderer.js';

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

    ctx.save();

    // 1. Shadow (especially visible for flying enemies)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    const shadowScale = Math.max(0.4, 1 - altitude / 60);
    ctx.ellipse(x, y + 4, (size * 0.7) * shadowScale, (size * 0.35) * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Water ripples for Swimming Enemy
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

    // 3. Ghost translucency for Shadow Wraith
    if (enemy.tags.includes('GHOST')) {
      ctx.globalAlpha = 0.75 + Math.sin(animTime * 5) * 0.15;
    }

    // 4. Colors & Elemental aura
    const elemColor = ELEMENT_COLORS[elementalProfile.primaryElement] || '#ffffff';
    const secColor = elementalProfile.secondaryElement ? ELEMENT_COLORS[elementalProfile.secondaryElement] : elemColor;

    // Aura for dual-element or summoner enemies
    if (elementalProfile.secondaryElement || enemy.tags.includes('SUMMONER')) {
      ctx.save();
      ctx.strokeStyle = `${secColor}50`;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(x, drawY - size * 0.2, size * 0.9 + Math.sin(animTime * 6) * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Shield Aura (Armor Shield or Magic Shield or Damage Reduction)
    if ((enemy.armorShield && enemy.armorShield > 0) || (enemy.magicShield && enemy.magicShield > 0)) {
      ctx.save();
      const shieldColor = enemy.magicShield && enemy.magicShield > 0 ? '#c084fc' : '#e2e8f0';
      ctx.strokeStyle = shieldColor;
      ctx.lineWidth = 2.0;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.arc(x, drawY - size * 0.2, size * 0.95 + Math.sin(animTime * 5) * 2.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (enemy.damageReductionTimer && enemy.damageReductionTimer > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, drawY - size * 0.2, size * 1.1 + Math.sin(animTime * 4) * 1.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 5. Render Creature Body via Stick Archetype Rigging (Dragon, Serpent, Bat, Spider, etc.)
    EnemyArchetypeRenderer.renderEnemyBody(ctx, enemy, animTime, elemColor, secColor);

    // 6. Health bar & Elemental icons
    const headY = drawY - size * 0.75;
    this.renderHealthBar(
      ctx,
      x,
      headY - 12,
      enemy.hp,
      enemy.maxHp,
      elementalProfile.primaryElement,
      enemy.statusEffects,
      elementalProfile.secondaryElement,
      enemy.armorShield,
      enemy.magicShield,
      enemy.damageReductionTimer
    );

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
    statusEffects: any[],
    secondaryElement?: string,
    armorShield?: number,
    magicShield?: number,
    damageReductionTimer?: number
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

    // Shield overlay bar (Armor Shield or Magic Shield)
    const totalShield = (armorShield || 0) + (magicShield || 0);
    if (totalShield > 0) {
      const shieldRatio = Math.min(1.0, totalShield / Math.max(1, maxHp));
      const shieldWidth = width * shieldRatio;
      ctx.fillStyle = (magicShield || 0) > 0 ? '#c084fc' : '#e2e8f0';
      ctx.fillRect(x - width / 2, y - 2, shieldWidth, 2);
    }

    // Element indicator pip
    const icon1 = ELEMENT_ICONS[element as ElementType] || '⚔️';
    ctx.font = '12px sans-serif';
    ctx.fillText(icon1, x - width / 2 - 14, y + 6);

    // Secondary Element indicator pip for dual-element enemies
    if (secondaryElement) {
      const icon2 = ELEMENT_ICONS[secondaryElement as ElementType] || '';
      if (icon2) {
        ctx.fillText(icon2, x - width / 2 - 26, y + 6);
      }
    }

    // Status icons & Shield badges
    let iconOffset = 0;
    if (armorShield && armorShield > 0) {
      ctx.fillText('🛡️', x + width / 2 + 2 + iconOffset, y + 6);
      iconOffset += 13;
    }
    if (magicShield && magicShield > 0) {
      ctx.fillText('🔮', x + width / 2 + 2 + iconOffset, y + 6);
      iconOffset += 13;
    }
    if (damageReductionTimer && damageReductionTimer > 0) {
      ctx.fillText('🔰', x + width / 2 + 2 + iconOffset, y + 6);
      iconOffset += 13;
    }

    if (statusEffects.length > 0) {
      for (const eff of statusEffects) {
        let effIcon = '';
        if (eff.type === 'BURN') effIcon = '🔥';
        else if (eff.type === 'FREEZE') effIcon = '❄️';
        else if (eff.type === 'SHOCK') effIcon = '⚡';
        else if (eff.type === 'SLOW') effIcon = '🪨';
        else if (eff.type === 'WET') effIcon = '💧';
        else if (eff.type === 'POISON') effIcon = '☠️';
        else if (eff.type === 'ROOT') effIcon = '🌿';
        else if (eff.type === 'SUNDER') effIcon = '⚙️';
        else if (eff.type === 'SOUL_DRAIN') effIcon = '👻';
        else if (eff.type === 'DRAGON_AWE') effIcon = '🐉';
        else if (eff.type === 'CHARM') effIcon = '🧚';
        else if (eff.type === 'CURSE') effIcon = '🔮';
        if (effIcon) {
          ctx.fillText(effIcon, x + width / 2 + 2 + iconOffset, y + 6);
          iconOffset += 13;
        }
      }
    }

    ctx.restore();
  }
}
