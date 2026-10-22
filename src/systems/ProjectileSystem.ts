import {
  ProjectileEntity,
  EnemyEntity
} from '../types/entities.types.js';
import { TargetingRuleEngine } from './TargetingRuleEngine.js';
import { ELEMENT_COLORS } from '../config/elements.config.js';

export class ProjectileSystem {
  public static updateProjectiles(
    projectiles: ProjectileEntity[],
    enemies: EnemyEntity[],
    dt: number,
    onHit: (params: {
      enemy: EnemyEntity;
      damage: number;
      isImmune: boolean;
      label?: string;
      color: string;
      x: number;
      y: number;
    }) => void,
    onExplosion: (x: number, y: number, color: string, aoeRadius: number) => void
  ): void {
    const enemyMap = new Map<string, EnemyEntity>();
    for (const e of enemies) {
      if (e.hp > 0 && e.state !== 'DEAD') {
        enemyMap.set(e.id, e);
      }
    }

    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];

      // If tracking an enemy, update target coordinates
      if (p.targetEnemyId) {
        const target = enemyMap.get(p.targetEnemyId);
        if (target) {
          p.targetX = target.x;
          p.targetY = target.y - (target.altitude || 0); // aim at altitude if flying
        }
      }

      if (p.isParabolic) {
        // Parabolic flight
        const totalDist = Math.hypot(p.targetX - p.startX, p.targetY - p.startY);
        const flightTime = totalDist / p.speed;
        p.progress += dt / Math.max(0.2, flightTime);

        const t = Math.min(1.0, p.progress);
        const groundX = p.startX + (p.targetX - p.startX) * t;
        const groundY = p.startY + (p.targetY - p.startY) * t;
        const heightArc = 4 * p.arcHeight * t * (1 - t);

        p.x = groundX;
        p.y = groundY - heightArc;

        if (p.progress >= 1.0) {
          // Impact!
          this.handleAoEImpact(p, enemies, onHit, onExplosion);
          projectiles.splice(i, 1);
        }
      } else {
        // Straight / homing flight
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        const dist = Math.hypot(dx, dy);
        const step = p.speed * dt;

        if (dist <= step || dist < 12) {
          // Reached target
          p.x = p.targetX;
          p.y = p.targetY;

          if (p.aoeRadius > 0) {
            this.handleAoEImpact(p, enemies, onHit, onExplosion);
          } else {
            this.handleSingleImpact(p, enemies, onHit);
          }

          projectiles.splice(i, 1);
        } else {
          p.x += (dx / dist) * step;
          p.y += (dy / dist) * step;
        }
      }
    }
  }

  private static handleSingleImpact(
    p: ProjectileEntity,
    enemies: EnemyEntity[],
    onHit: (params: any) => void
  ): void {
    let target: EnemyEntity | undefined;
    if (p.targetEnemyId) {
      target = enemies.find((e) => e.id === p.targetEnemyId);
    }

    if (!target) {
      // Find closest enemy to impact point
      let minDist = 24;
      for (const e of enemies) {
        if (e.hp <= 0 || e.state === 'DEAD') continue;
        const d = Math.hypot(e.x - p.x, e.y - p.y);
        if (d < minDist) {
          minDist = d;
          target = e;
        }
      }
    }

    if (target && target.hp > 0 && target.state !== 'DEAD') {
      const calc = TargetingRuleEngine.calculateDamage(p.damagePayload, target);
      if (!calc.isImmune) {
        target.hp -= calc.finalDamage;

        // Apply primary element hit effect if magical
        if (p.damagePayload.element !== 'PHYSICAL') {
          TargetingRuleEngine.applyElementalHitEffects(target, p.damagePayload.element, p.damagePayload.amount);
        }

        // Apply secondary element hit effect if present
        if (p.damagePayload.secondaryElement && p.damagePayload.secondaryAmount) {
          TargetingRuleEngine.applyElementalHitEffects(
            target,
            p.damagePayload.secondaryElement,
            p.damagePayload.secondaryAmount
          );
        }
      }

      const displayColor = p.damagePayload.secondaryElement
        ? ELEMENT_COLORS[p.damagePayload.secondaryElement]
        : ELEMENT_COLORS[p.damagePayload.element];

      onHit({
        enemy: target,
        damage: calc.finalDamage,
        isImmune: calc.isImmune,
        label: calc.label,
        color: displayColor,
        x: target.x,
        y: target.y - (target.altitude || 0)
      });

      if (target.hp <= 0) {
        target.state = 'DEAD';
      }

      // Chain lightning bounce for Mage Tier 4 Branch B
      if (p.chainCount && p.chainCount > 0) {
        let remainingBounces = p.chainCount;
        let prevTarget = target;
        const hitSet = new Set<string>([target.id]);

        for (const nextEnemy of enemies) {
          if (remainingBounces <= 0) break;
          if (nextEnemy.hp <= 0 || nextEnemy.state === 'DEAD' || hitSet.has(nextEnemy.id)) continue;

          const dist = Math.hypot(nextEnemy.x - prevTarget.x, nextEnemy.y - prevTarget.y);
          if (dist <= 130) {
            hitSet.add(nextEnemy.id);
            remainingBounces--;

            const chainPayload = {
              ...p.damagePayload,
              amount: Math.round(p.damagePayload.amount * 0.7),
              secondaryAmount: p.damagePayload.secondaryAmount
                ? Math.round(p.damagePayload.secondaryAmount * 0.7)
                : undefined
            };

            const chainCalc = TargetingRuleEngine.calculateDamage(chainPayload, nextEnemy);
            if (!chainCalc.isImmune) {
              nextEnemy.hp -= chainCalc.finalDamage;
              if (chainPayload.element !== 'PHYSICAL') {
                TargetingRuleEngine.applyElementalHitEffects(nextEnemy, chainPayload.element, chainPayload.amount);
              }
              if (chainPayload.secondaryElement && chainPayload.secondaryAmount) {
                TargetingRuleEngine.applyElementalHitEffects(
                  nextEnemy,
                  chainPayload.secondaryElement,
                  chainPayload.secondaryAmount
                );
              }
            }

            onHit({
              enemy: nextEnemy,
              damage: chainCalc.finalDamage,
              isImmune: chainCalc.isImmune,
              label: chainCalc.label,
              color: displayColor,
              x: nextEnemy.x,
              y: nextEnemy.y - (nextEnemy.altitude || 0)
            });

            if (nextEnemy.hp <= 0) {
              nextEnemy.state = 'DEAD';
            }

            prevTarget = nextEnemy;
          }
        }
      }
    }
  }

  private static handleAoEImpact(
    p: ProjectileEntity,
    enemies: EnemyEntity[],
    onHit: (params: any) => void,
    onExplosion: (x: number, y: number, color: string, aoeRadius: number) => void
  ): void {
    const color = p.damagePayload.secondaryElement
      ? ELEMENT_COLORS[p.damagePayload.secondaryElement]
      : ELEMENT_COLORS[p.damagePayload.element];
    onExplosion(p.targetX, p.targetY, color, p.aoeRadius);

    for (const enemy of enemies) {
      if (enemy.hp <= 0 || enemy.state === 'DEAD') continue;

      // Parabolic artillery explosions are on ground, so they don't hit FLY enemies!
      if (p.isParabolic && enemy.movementType === 'FLY') {
        continue;
      }

      const dist = Math.hypot(enemy.x - p.targetX, enemy.y - p.targetY);
      if (dist <= p.aoeRadius) {
        const falloff = Math.max(0.4, 1 - (dist / p.aoeRadius) * 0.6);
        const payload = {
          ...p.damagePayload,
          amount: Math.round(p.damagePayload.amount * falloff),
          secondaryAmount: p.damagePayload.secondaryAmount
            ? Math.round(p.damagePayload.secondaryAmount * falloff)
            : undefined
        };

        const calc = TargetingRuleEngine.calculateDamage(payload, enemy);
        if (!calc.isImmune) {
          enemy.hp -= calc.finalDamage;

          if (payload.element !== 'PHYSICAL') {
            TargetingRuleEngine.applyElementalHitEffects(enemy, payload.element, payload.amount);
          }
          if (payload.secondaryElement && payload.secondaryAmount) {
            TargetingRuleEngine.applyElementalHitEffects(
              enemy,
              payload.secondaryElement,
              payload.secondaryAmount
            );
          }
        }

        onHit({
          enemy,
          damage: calc.finalDamage,
          isImmune: calc.isImmune,
          label: calc.label,
          color,
          x: enemy.x,
          y: enemy.y - (enemy.altitude || 0)
        });

        if (enemy.hp <= 0) {
          enemy.state = 'DEAD';
        }
      }
    }
  }
}
