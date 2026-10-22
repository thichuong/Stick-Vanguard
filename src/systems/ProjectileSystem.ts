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
        if (p.damagePayload.element === 'FIRE') {
          TargetingRuleEngine.applyStatusEffect(target, { type: 'BURN', duration: 2.5, value: 6 });
        } else if (p.damagePayload.element === 'ICE') {
          TargetingRuleEngine.applyStatusEffect(target, { type: 'SLOW', duration: 3.0, value: 0.5 });
        } else if (p.damagePayload.element === 'WIND' && target.movementType === 'FLY') {
          // Wind knocks back flying enemies
          target.pathDistance = Math.max(0, target.pathDistance - 25);
        }
      }

      onHit({
        enemy: target,
        damage: calc.finalDamage,
        isImmune: calc.isImmune,
        label: calc.label,
        color: ELEMENT_COLORS[p.damagePayload.element],
        x: target.x,
        y: target.y - (target.altitude || 0)
      });

      if (target.hp <= 0) {
        target.state = 'DEAD';
      }
    }
  }

  private static handleAoEImpact(
    p: ProjectileEntity,
    enemies: EnemyEntity[],
    onHit: (params: any) => void,
    onExplosion: (x: number, y: number, color: string, aoeRadius: number) => void
  ): void {
    const color = ELEMENT_COLORS[p.damagePayload.element];
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
          amount: Math.round(p.damagePayload.amount * falloff)
        };

        const calc = TargetingRuleEngine.calculateDamage(payload, enemy);
        if (!calc.isImmune) {
          enemy.hp -= calc.finalDamage;
          if (p.damagePayload.element === 'FIRE') {
            TargetingRuleEngine.applyStatusEffect(enemy, { type: 'BURN', duration: 3, value: 7 });
          } else if (p.damagePayload.element === 'LIGHTNING') {
            TargetingRuleEngine.applyStatusEffect(enemy, { type: 'SLOW', duration: 1.5, value: 0.6 });
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
