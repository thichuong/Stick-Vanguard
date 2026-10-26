import {
  ProjectileEntity,
  EnemyEntity
} from '../types/entities.types.js';
import { TargetingRuleEngine } from './TargetingRuleEngine.js';
import { ELEMENT_COLORS } from '../config/elements.config.js';
import { SpatialIndex } from '../core/SpatialIndex.js';
import { swapRemove } from '../core/ObjectPool.js';

export class ProjectileSystem {
  private static aoeCandidates: EnemyEntity[] = [];

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
    onExplosion: (x: number, y: number, color: string, aoeRadius: number) => void,
    spatialIndex?: SpatialIndex
  ): void {
    let enemyMap: Map<string, EnemyEntity> | undefined;
    if (!spatialIndex) {
      enemyMap = new Map<string, EnemyEntity>();
      for (const e of enemies) {
        if (e.hp > 0 && e.state !== 'DEAD') {
          enemyMap.set(e.id, e);
        }
      }
    }

    const getEnemy = (id: string): EnemyEntity | undefined => {
      return spatialIndex ? spatialIndex.getEnemyById(id) : enemyMap?.get(id);
    };

    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.prevX = p.x;
      p.prevY = p.y;

      // If tracking an enemy, update target coordinates
      if (p.targetEnemyId) {
        const target = getEnemy(p.targetEnemyId);
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
          this.handleAoEImpact(p, enemies, onHit, onExplosion, spatialIndex);
          swapRemove(projectiles, i);
        }
      } else {
        // Straight / homing flight
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        const distSq = dx * dx + dy * dy;
        const step = p.speed * dt;

        if (distSq <= step * step || distSq < 144) {
          // Reached target
          p.x = p.targetX;
          p.y = p.targetY;

          if (p.aoeRadius > 0) {
            this.handleAoEImpact(p, enemies, onHit, onExplosion, spatialIndex);
          } else {
            this.handleSingleImpact(p, enemies, onHit, spatialIndex);
          }

          swapRemove(projectiles, i);
        } else {
          const dist = Math.sqrt(distSq);
          p.x += (dx / dist) * step;
          p.y += (dy / dist) * step;
        }
      }
    }
  }

  private static handleSingleImpact(
    p: ProjectileEntity,
    enemies: EnemyEntity[],
    onHit: (params: any) => void,
    spatialIndex?: SpatialIndex
  ): void {
    let target: EnemyEntity | undefined;
    if (p.targetEnemyId) {
      target = spatialIndex ? spatialIndex.getEnemyById(p.targetEnemyId) : enemies.find((e) => e.id === p.targetEnemyId);
    }

    if (!target) {
      // Find closest enemy to impact point
      target = spatialIndex
        ? spatialIndex.findClosestInRange(p.x, p.y, 24) || undefined
        : (() => {
            let t: EnemyEntity | undefined;
            let minDist = 24;
            for (const e of enemies) {
              if (e.hp <= 0 || e.state === 'DEAD') continue;
              const d = Math.hypot(e.x - p.x, e.y - p.y);
              if (d < minDist) {
                minDist = d;
                t = e;
              }
            }
            return t;
          })();
    }

    if (target && target.hp > 0 && target.state !== 'DEAD') {
      const calc = TargetingRuleEngine.calculateDamage(p.damagePayload, target);
      if (!calc.isImmune) {
        TargetingRuleEngine.applyDamageToEnemy(
          target,
          calc,
          p.damagePayload.element,
          p.damagePayload.secondaryAmount,
          p.damagePayload.secondaryElement
        );
        TargetingRuleEngine.applyAllPayloadEffects(target, p.damagePayload);
      }

      const displayColor =
        p.damagePayload.bonusElements && p.damagePayload.bonusElements.length > 0
          ? ELEMENT_COLORS[p.damagePayload.bonusElements[0].element]
          : p.damagePayload.secondaryElement
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

        const chainCandidates = spatialIndex
          ? spatialIndex.queryRadius(prevTarget.x, prevTarget.y, 130, this.aoeCandidates)
          : enemies;

        for (const nextEnemy of chainCandidates) {
          if (remainingBounces <= 0) break;
          if (nextEnemy.hp <= 0 || nextEnemy.state === 'DEAD' || hitSet.has(nextEnemy.id)) continue;

          const dx = nextEnemy.x - prevTarget.x;
          const dy = nextEnemy.y - prevTarget.y;
          if (dx * dx + dy * dy <= 130 * 130) {
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
              TargetingRuleEngine.applyDamageToEnemy(
                nextEnemy,
                chainCalc,
                chainPayload.element,
                chainPayload.secondaryAmount,
                chainPayload.secondaryElement
              );
              TargetingRuleEngine.applyAllPayloadEffects(nextEnemy, chainPayload);
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
    onExplosion: (x: number, y: number, color: string, aoeRadius: number) => void,
    spatialIndex?: SpatialIndex
  ): void {
    const color = p.damagePayload.secondaryElement
      ? ELEMENT_COLORS[p.damagePayload.secondaryElement]
      : ELEMENT_COLORS[p.damagePayload.element];
    onExplosion(p.targetX, p.targetY, color, p.aoeRadius);

    const aoeTargets = spatialIndex
      ? spatialIndex.queryRadius(p.targetX, p.targetY, p.aoeRadius, this.aoeCandidates)
      : enemies;
    const aoeRadiusSq = p.aoeRadius * p.aoeRadius;

    for (const enemy of aoeTargets) {
      if (enemy.hp <= 0 || enemy.state === 'DEAD') continue;

      // Parabolic artillery explosions are on ground, so they don't hit FLY enemies!
      if (p.isParabolic && enemy.movementType === 'FLY') {
        continue;
      }

      const dx = enemy.x - p.targetX;
      const dy = enemy.y - p.targetY;
      const dSq = dx * dx + dy * dy;
      if (dSq <= aoeRadiusSq) {
        const dist = Math.sqrt(dSq);
        const falloff = Math.max(0.4, 1 - (dist / p.aoeRadius) * 0.6);
        const bonusElements = p.damagePayload.bonusElements
          ? p.damagePayload.bonusElements.map((b) => ({
              element: b.element,
              amount: Math.round(b.amount * falloff)
            }))
          : undefined;

        const payload = {
          ...p.damagePayload,
          amount: Math.round(p.damagePayload.amount * falloff),
          secondaryAmount: p.damagePayload.secondaryAmount
            ? Math.round(p.damagePayload.secondaryAmount * falloff)
            : undefined,
          bonusElements
        };

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
