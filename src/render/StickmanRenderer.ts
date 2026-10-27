import {
  EnemyEntity,
  SoldierEntity
} from '../types/entities.types.js';
import { ELEMENT_COLORS } from '../config/elements.config.js';
import { ElementType, StatusEffectType } from '../types/elements.types.js';
import { drawElementSvgOnCanvas, STATUS_EFFECT_TO_ELEMENT } from '../config/elements/icons/index.js';
import { drawUiSvgOnCanvas } from '../config/ui/icons/index.js';
import { EnemyArchetypeRenderer } from './EnemyArchetypeRenderer.js';

export type LODLevel = 'FULL' | 'MEDIUM' | 'HIGH_CROWD';

export class StickmanRenderer {
  public static currentLOD: LODLevel = 'FULL';

  public static getLODLevel(totalUnits: number): LODLevel {
    if (totalUnits >= 220) return 'HIGH_CROWD';
    if (totalUnits >= 80) return 'MEDIUM';
    return 'FULL';
  }

  /**
   * Renders a procedural enemy stickman
   */
  public static renderEnemy(
    ctx: CanvasRenderingContext2D,
    enemy: EnemyEntity,
    animTime: number,
    interpolationAlpha = 1.0
  ): void {
    if (enemy.hp <= 0 || enemy.state === 'DEAD') return;

    const lod = this.currentLOD;
    const hasTeleport = enemy.prevX !== undefined && enemy.prevY !== undefined && Math.hypot(enemy.x - enemy.prevX, enemy.y - enemy.prevY) > 80;
    const x = enemy.prevX !== undefined && !hasTeleport && interpolationAlpha < 1.0
      ? enemy.prevX + (enemy.x - enemy.prevX) * interpolationAlpha
      : enemy.x;
    const y = enemy.prevY !== undefined && !hasTeleport && interpolationAlpha < 1.0
      ? enemy.prevY + (enemy.y - enemy.prevY) * interpolationAlpha
      : enemy.y;

    const { size, altitude, elementalProfile } = enemy;
    const drawY = y - altitude;

    ctx.save();

    // 1. Shadow (especially visible for flying enemies)
    if (lod !== 'HIGH_CROWD' || altitude > 5) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      const shadowScale = Math.max(0.4, 1 - altitude / 60);
      ctx.ellipse(x, y + 4, (size * 0.7) * shadowScale, (size * 0.35) * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Water ripples for Swimming Enemy
    if (enemy.movementType === 'SWIM' && lod === 'FULL') {
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

    if (lod === 'FULL') {
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
    }

    // 5. Render Creature Body via Direct Rigging (2D Fallback)
    const mockPosEnemy = x !== enemy.x || y !== enemy.y ? { ...enemy, x, y } : enemy;
    EnemyArchetypeRenderer.renderEnemyBody(ctx, mockPosEnemy, animTime, elemColor, secColor);

    // 6. Health bar & Elemental icons with Smart LOD
    const isBossOrElite = enemy.tags.includes('BOSS') || enemy.tags.includes('ELITE');
    const hasLostHp = enemy.hp < enemy.maxHp;
    const hasShield = (enemy.armorShield && enemy.armorShield > 0) || (enemy.magicShield && enemy.magicShield > 0);
    const hasStatus = enemy.statusEffects && enemy.statusEffects.length > 0;
    const shouldDrawHp = lod === 'FULL' || isBossOrElite || hasLostHp || hasShield || hasStatus;

    if (shouldDrawHp) {
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
        enemy.damageReductionTimer,
        lod
      );
    }

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

    // Spectral aura if unit is a Heroic Spirit
    if (soldier.isSpirit) {
      ctx.globalAlpha = 0.78 + Math.sin(animTime * 6) * 0.15;
      ctx.save();
      ctx.strokeStyle = 'rgba(129, 140, 248, 0.75)';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(x, y - 8, 16 + Math.sin(animTime * 5) * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Specialized archetype rendering: Dragon
    if (soldier.archetype === 'DRAGON') {
      this.renderDragonSoldier(ctx, soldier, animTime);
      const displayElement = soldier.isSpirit ? 'GHOST' : soldier.secondaryElement || soldier.element;
      this.renderHealthBar(ctx, x, y - 26, soldier.hp, soldier.maxHp, displayElement, [], soldier.isSpirit ? 'DRAGON' : undefined);
      ctx.restore();
      return;
    }

    // Specialized archetype rendering: Fairy
    if (soldier.archetype === 'FAIRY') {
      this.renderFairySoldier(ctx, soldier, animTime);
      const displayElement = soldier.isSpirit ? 'GHOST' : soldier.secondaryElement || soldier.element;
      this.renderHealthBar(ctx, x, y - 22, soldier.hp, soldier.maxHp, displayElement, [], soldier.isSpirit ? 'FAIRY' : undefined);
      ctx.restore();
      return;
    }

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
    const displayElement = soldier.isSpirit ? 'GHOST' : soldier.secondaryElement || soldier.element;
    this.renderHealthBar(ctx, x, headY - 8, soldier.hp, soldier.maxHp, displayElement, [], soldier.isSpirit ? 'PHYSICAL' : undefined);

    ctx.restore();
  }

  private static renderDragonSoldier(
    ctx: CanvasRenderingContext2D,
    soldier: SoldierEntity,
    animTime: number
  ): void {
    const { x, y, tier, branch, state } = soldier;
    const isAttacking = state === 'ATTACKING';
    const isMoving = state === 'MOVING_TO_ENGAGE' || state === 'MOVING_TO_RALLY';
    const hover = Math.sin(animTime * 5) * 4;
    const flap = Math.sin(animTime * (isMoving ? 14 : 7)) * 7;
    const bodyY = y - 12 + hover;

    const mainColor = soldier.isSpirit
      ? '#818cf8'
      : tier === 4 && branch === 'A'
      ? '#f59e0b'
      : tier === 4 && branch === 'B'
      ? '#dc2626'
      : '#ea580c';
    const wingColor = soldier.isSpirit ? '#a5b4fc' : tier === 4 && branch === 'A' ? '#fcd34d' : '#fb923c';
    const hornColor = soldier.isSpirit ? '#c7d2fe' : '#fef08a';

    // Direction facing: defaults to 0 (right)
    const facing = soldier.facing ?? 0;

    ctx.save();
    ctx.translate(x, bodyY);
    ctx.rotate(facing);

    // --- 1. Tail (Behind in -X) ---
    const tailWiggle = Math.sin(animTime * (isMoving ? 10 : 6)) * 4;
    ctx.strokeStyle = mainColor;
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.quadraticCurveTo(-14, tailWiggle * 0.8, -22, tailWiggle * 1.4);
    ctx.stroke();

    // Tail Spade (fin/blade)
    ctx.fillStyle = wingColor;
    ctx.beginPath();
    ctx.moveTo(-22, tailWiggle * 1.4);
    ctx.lineTo(-26, tailWiggle * 1.4 - 4);
    ctx.lineTo(-30, tailWiggle * 1.4);
    ctx.lineTo(-26, tailWiggle * 1.4 + 4);
    ctx.closePath();
    ctx.fill();

    // --- 2. Wings (Left on -Y, Right on +Y) ---
    ctx.fillStyle = wingColor;
    ctx.strokeStyle = mainColor;
    ctx.lineWidth = 1.8;

    // Left Wing (-Y)
    ctx.beginPath();
    ctx.moveTo(-2, -4);
    ctx.lineTo(2, -18 - flap);
    ctx.lineTo(-10, -12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right Wing (+Y)
    ctx.beginPath();
    ctx.moveTo(-2, 4);
    ctx.lineTo(2, 18 + flap);
    ctx.lineTo(-10, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // --- 3. Dragon Torso (Aerodynamic Oval) ---
    ctx.fillStyle = mainColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // --- 4. Neck & Head (Facing forward in +X) ---
    // Neck
    ctx.strokeStyle = mainColor;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(4, 0);
    ctx.lineTo(11, 0);
    ctx.stroke();

    // Head base (skull)
    ctx.fillStyle = mainColor;
    ctx.beginPath();
    ctx.arc(12, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    // Snout pointing forward (+X)
    ctx.beginPath();
    ctx.moveTo(11, -3.5);
    ctx.lineTo(19, 0);
    ctx.lineTo(11, 3.5);
    ctx.closePath();
    ctx.fill();

    // Majestic Horns curving backwards (-X)
    ctx.strokeStyle = hornColor;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    // Top Horn (-Y)
    ctx.moveTo(10, -2.5);
    ctx.quadraticCurveTo(6, -6, 4, -9);
    // Bottom Horn (+Y)
    ctx.moveTo(10, 2.5);
    ctx.quadraticCurveTo(6, 6, 4, 9);
    ctx.stroke();

    // Glowing Eyes
    ctx.fillStyle = hornColor;
    ctx.beginPath();
    ctx.arc(13, -2, 1.3, 0, Math.PI * 2);
    ctx.arc(13, 2, 1.3, 0, Math.PI * 2);
    ctx.fill();

    // --- 5. Fire Breath / Elemental Attack when Attacking ---
    if (isAttacking) {
      const flamePulse = Math.sin(animTime * 16) * 3;
      const flameDist = 24 + flamePulse;

      // Outer fiery blast
      ctx.fillStyle = soldier.isSpirit ? 'rgba(168, 85, 247, 0.75)' : 'rgba(249, 115, 22, 0.8)';
      ctx.beginPath();
      ctx.moveTo(18, -2);
      ctx.lineTo(flameDist + 4, -7 - flamePulse * 0.5);
      ctx.lineTo(flameDist + 10, 0);
      ctx.lineTo(flameDist + 4, 7 + flamePulse * 0.5);
      ctx.lineTo(18, 2);
      ctx.closePath();
      ctx.fill();

      // Inner flame core (bright white/yellow)
      ctx.fillStyle = soldier.isSpirit ? '#e0e7ff' : '#fef08a';
      ctx.beginPath();
      ctx.moveTo(19, -1);
      ctx.lineTo(flameDist, -3);
      ctx.lineTo(flameDist + 4, 0);
      ctx.lineTo(flameDist, 3);
      ctx.lineTo(19, 1);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  private static renderFairySoldier(
    ctx: CanvasRenderingContext2D,
    soldier: SoldierEntity,
    animTime: number
  ): void {
    const { x, y, tier, branch, state } = soldier;
    const isAttacking = state === 'ATTACKING';
    const hover = Math.sin(animTime * 6) * 3;
    const flap = Math.sin(animTime * 14) * 5;
    const bodyY = y - 10 + hover;
    const fColor = soldier.isSpirit
      ? '#a5b4fc'
      : tier === 4 && branch === 'A'
      ? '#f472b6'
      : tier === 4 && branch === 'B'
      ? '#c084fc'
      : '#ec4899';

    ctx.save();

    // Translucent Fairy Butterfly Wings
    ctx.fillStyle = soldier.isSpirit ? 'rgba(199, 210, 254, 0.6)' : 'rgba(251, 207, 232, 0.65)';
    ctx.strokeStyle = fColor;
    ctx.lineWidth = 1.2;

    // Left Wing
    ctx.beginPath();
    ctx.ellipse(x - 6, bodyY - 3, 5, 8 + flap * 0.4, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right Wing
    ctx.beginPath();
    ctx.ellipse(x + 6, bodyY - 3, 5, 8 + flap * 0.4, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Petite Fairy Body
    ctx.fillStyle = fColor;
    ctx.beginPath();
    ctx.arc(x, bodyY - 6, 3.5, 0, Math.PI * 2); // Head
    ctx.fill();

    ctx.strokeStyle = fColor;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(x, bodyY - 2.5);
    ctx.lineTo(x, bodyY + 5); // Torso
    ctx.stroke();

    // Wand or starlight sparkle
    const sparkleAngle = animTime * 8;
    const wandX = x + (isAttacking ? 8 : 5);
    const wandY = bodyY - (isAttacking ? 6 : 2);
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(wandX + Math.cos(sparkleAngle) * 2, wandY + Math.sin(sparkleAngle) * 2, 2.5, 0, Math.PI * 2);
    ctx.fill();

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
    damageReductionTimer?: number,
    lod: LODLevel = 'FULL'
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

    if (lod === 'HIGH_CROWD') {
      ctx.restore();
      return;
    }

    // Element indicator pip (Crisp SVG icon)
    if (element) {
      drawElementSvgOnCanvas(ctx, element as ElementType, x - width / 2 - 16, y - 5, 13);
    }

    // Secondary Element indicator pip for dual-element enemies (Crisp SVG icon)
    if (secondaryElement) {
      drawElementSvgOnCanvas(ctx, secondaryElement as ElementType, x - width / 2 - 31, y - 5, 13);
    }

    // Status icons & Shield badges
    let iconOffset = 0;
    if (armorShield && armorShield > 0) {
      drawUiSvgOnCanvas(ctx, 'SHIELD', x + width / 2 + 2 + iconOffset, y - 5, 12, 12);
      iconOffset += 13;
    }
    if (magicShield && magicShield > 0) {
      drawUiSvgOnCanvas(ctx, 'MAGIC_SHIELD', x + width / 2 + 2 + iconOffset, y - 5, 12, 12);
      iconOffset += 13;
    }
    if (damageReductionTimer && damageReductionTimer > 0) {
      drawUiSvgOnCanvas(ctx, 'DAMAGE_REDUCE', x + width / 2 + 2 + iconOffset, y - 5, 12, 12);
      iconOffset += 13;
    }

    if (statusEffects.length > 0) {
      const maxIcons = lod === 'MEDIUM' ? 1 : statusEffects.length;
      for (let i = 0; i < maxIcons && i < statusEffects.length; i++) {
        const eff = statusEffects[i];
        const effElem = STATUS_EFFECT_TO_ELEMENT[eff.type as StatusEffectType];
        if (effElem) {
          drawElementSvgOnCanvas(ctx, effElem, x + width / 2 + 2 + iconOffset, y - 5, 12);
          iconOffset += 13;
        }
      }
    }

    ctx.restore();
  }
}
