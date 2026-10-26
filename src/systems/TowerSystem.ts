import {
  TowerEntity,
  EnemyEntity,
  ProjectileEntity
} from '../types/entities.types.js';
import { ElementType, DamagePayload } from '../types/elements.types.js';
import { TargetingRuleEngine } from './TargetingRuleEngine.js';
import { DEFENSE_TOWER_TYPES } from '../config/towers.config.js';
import {
  HYBRID_ELEMENT_DMG_RATIO,
  MAGE_SECONDARY_DMG_RATIO,
  ELEMENT_COLORS
} from '../config/elements.config.js';
import { SpatialIndex } from '../core/SpatialIndex.js';

export class TowerSystem {
  private static projectileCounter = 0;
  private static auraCandidates: EnemyEntity[] = [];

  public static updateTowers(
    towers: TowerEntity[],
    enemies: EnemyEntity[],
    dt: number,
    onSpawnProjectile: (proj: ProjectileEntity) => void,
    onAuraHit?: (params: { enemy: EnemyEntity; damage: number; color: string }) => void,
    spatialIndex?: SpatialIndex
  ): void {
    for (const tower of towers) {
      if (tower.disabledTimer && tower.disabledTimer > 0) {
        tower.disabledTimer -= dt;
        if (tower.disabledTimer < 0) tower.disabledTimer = 0;
        continue;
      }

      if (tower.attackCooldown > 0) {
        tower.attackCooldown -= dt;
      }

      // Only Defense Towers (Archer, Mage, Artillery) attack directly from the tower.
      // Summon Towers (Barracks, Dragon Nest, Fairy Tree, Heroic Altar) and Traps NEVER attack directly!
      if (!DEFENSE_TOWER_TYPES.includes(tower.type) || tower.placement !== 'ROADSIDE') {
        continue;
      }

      // Handle Mage 4_A: Continuous Area DPS in its range
      if (tower.type === 'MAGE' && tower.tier === 4 && tower.branch === 'A') {
        tower.auraTickTimer = (tower.auraTickTimer || 0) + dt;
        if (tower.auraTickTimer >= 0.5) {
          tower.auraTickTimer = 0;
          const tickDamage = Math.max(1, Math.round(tower.damage * 0.5));
          const secDamage = tower.secondaryElement ? tickDamage : undefined;
          const bonusElements = tower.buffedElements
            ? tower.buffedElements.map((el) => ({ element: el, amount: tickDamage }))
            : undefined;

          const payload: DamagePayload = {
            amount: tickDamage,
            element: tower.element,
            secondaryAmount: secDamage,
            secondaryElement: tower.secondaryElement || undefined,
            bonusElements,
            sourceId: tower.id
          };

          const candidateEnemies = spatialIndex
            ? spatialIndex.queryRadius(tower.x, tower.y, tower.range, this.auraCandidates)
            : enemies;

          for (const enemy of candidateEnemies) {
            if (enemy.hp <= 0 || enemy.state === 'DEAD') continue;
            const dx = enemy.x - tower.x;
            const dy = enemy.y - tower.y;
            if (dx * dx + dy * dy <= tower.range * tower.range && TargetingRuleEngine.canTarget(tower.targetingFilter, enemy)) {
              const calc = TargetingRuleEngine.calculateDamage(payload, enemy);
              if (!calc.isImmune) {
                TargetingRuleEngine.applyDamageToEnemy(
                  enemy,
                  calc,
                  payload.element,
                  payload.secondaryAmount,
                  payload.secondaryElement
                );
                TargetingRuleEngine.applyAllPayloadEffects(enemy, payload);
                if (onAuraHit) {
                  onAuraHit({
                    enemy,
                    damage: calc.finalDamage,
                    color: ELEMENT_COLORS[tower.element] || '#a855f7'
                  });
                }
              }
              if (enemy.hp <= 0) {
                enemy.state = 'DEAD';
              }
            }
          }
        }
        continue;
      }

      if (tower.attackCooldown > 0) {
        continue;
      }

      // Find best target in range
      const target = spatialIndex
        ? spatialIndex.findBestTargetInRange(tower.x, tower.y, tower.range, (e) => TargetingRuleEngine.canTarget(tower.targetingFilter, e))
        : this.findTarget(tower, enemies);
      if (!target) {
        continue;
      }

      // Fire projectile
      tower.attackCooldown = 1 / tower.fireRate;
      this.projectileCounter++;

      const isParabolic = tower.type === 'ARTILLERY';
      const aoeRadius = tower.aoeRadius || (isParabolic ? 75 : 0);
      const projSpeed = isParabolic ? 220 : tower.type === 'ARCHER' ? 440 : 340;

      // Construct hybrid or dual-element payload
      let primaryElement: ElementType = tower.element;
      let primaryAmount = tower.damage;
      let secondaryElement = tower.secondaryElement || undefined;
      let secondaryAmount: number | undefined;

      if (tower.type === 'MAGE') {
        // Mage is pure elemental. Primary is tower.element, secondary gets 100% damage (equal to base)
        primaryElement = tower.element;
        primaryAmount = tower.damage;
        if (secondaryElement) {
          secondaryAmount = Math.max(1, Math.round(tower.damage * MAGE_SECONDARY_DMG_RATIO));
        }
      } else {
        // Archer and Artillery use Physical base damage + 45% bonus elemental damage if imbued
        primaryElement = 'PHYSICAL';
        primaryAmount = tower.damage;
        if (secondaryElement) {
          secondaryAmount = Math.max(1, Math.round(tower.damage * HYBRID_ELEMENT_DMG_RATIO));
        }
      }

      // Additional elements if buffed by nearby Mage 4_B
      let bonusElements: Array<{ element: ElementType; amount: number }> | undefined;
      if (tower.buffedElements && tower.buffedElements.length > 0) {
        bonusElements = tower.buffedElements.map((elem) => ({
          element: elem,
          amount:
            tower.type === 'MAGE'
              ? tower.damage
              : Math.max(1, Math.round(tower.damage * HYBRID_ELEMENT_DMG_RATIO))
        }));
      }

      const hasLightning =
        primaryElement === 'LIGHTNING' ||
        secondaryElement === 'LIGHTNING' ||
        (bonusElements && bonusElements.some((b) => b.element === 'LIGHTNING'));

      let chainCount = 0;
      if (hasLightning) {
        if (tower.type === 'MAGE') {
          chainCount = tower.tier === 4 && tower.branch === 'B' ? 4 : 2;
        } else {
          chainCount = 1;
        }
      }

      const proj: ProjectileEntity = {
        id: `proj-${this.projectileCounter}`,
        sourceTowerId: tower.id,
        x: tower.x,
        y: tower.y - 14, // firing from tower top
        startX: tower.x,
        startY: tower.y - 14,
        targetX: target.x,
        targetY: target.y,
        targetEnemyId: isParabolic ? undefined : target.id, // Artillery shoots at ground position
        speed: projSpeed,
        damagePayload: {
          amount: primaryAmount,
          element: primaryElement,
          secondaryAmount,
          secondaryElement,
          bonusElements,
          sourceId: tower.id
        },
        aoeRadius,
        isParabolic,
        arcHeight: isParabolic ? 70 : 0,
        progress: 0,
        chainCount
      };

      onSpawnProjectile(proj);
    }
  }

  private static findTarget(
    tower: TowerEntity,
    enemies: EnemyEntity[]
  ): EnemyEntity | null {
    let bestTarget: EnemyEntity | null = null;
    let maxProgress = -1;

    for (const enemy of enemies) {
      if (enemy.hp <= 0 || enemy.state === 'DEAD') continue;

      // Distance check
      const dist = Math.hypot(enemy.x - tower.x, enemy.y - tower.y);
      if (dist > tower.range) continue;

      // Rule check (movement type, excluded elements/tags)
      if (!TargetingRuleEngine.canTarget(tower.targetingFilter, enemy)) {
        continue;
      }

      // Priority: Enemy furthest along path (closest to goal)
      if (enemy.pathDistance > maxProgress) {
        maxProgress = enemy.pathDistance;
        bestTarget = enemy;
      }
    }

    return bestTarget;
  }
}

