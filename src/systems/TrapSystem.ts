import { TowerEntity, EnemyEntity } from '../types/entities.types.js';
import { TargetingRuleEngine } from './TargetingRuleEngine.js';

export interface TrapTriggerResult {
  trapId: string;
  triggeredAt: { x: number; y: number };
  affectedEnemies: {
    enemyId: string;
    damage: number;
    isImmune: boolean;
    label?: string;
  }[];
}

export class TrapSystem {
  public static updateTraps(
    traps: TowerEntity[],
    enemies: EnemyEntity[],
    dt: number,
    onTrigger: (res: TrapTriggerResult, trap: TowerEntity) => void
  ): void {
    for (const trap of traps) {
      // Cooldown timer
      if (trap.attackCooldown > 0) {
        trap.attackCooldown -= dt;
      }

      // Check if ready to trigger
      if (trap.attackCooldown > 0) {
        continue;
      }

      const triggerRadius = trap.triggerRadius || 35;
      const candidates: EnemyEntity[] = [];

      for (const enemy of enemies) {
        if (enemy.hp <= 0 || enemy.state === 'DEAD') continue;

        // Check distance to trap center
        const dist = Math.hypot(enemy.x - trap.x, enemy.y - trap.y);
        if (dist <= triggerRadius) {
          // Check if trap is allowed to target this enemy (e.g. Earth Spike ignores Flying!)
          if (TargetingRuleEngine.canTarget(trap.targetingFilter, enemy)) {
            candidates.push(enemy);
          }
        }
      }

      if (candidates.length === 0) {
        continue;
      }

      // Trigger the trap!
      trap.attackCooldown = trap.rearmTimer || 3.0;

      const affectedEnemies: TrapTriggerResult['affectedEnemies'] = [];
      const aoeRadius = trap.aoeRadius || triggerRadius;

      // Find all valid targets in AoE
      for (const enemy of enemies) {
        if (enemy.hp <= 0 || enemy.state === 'DEAD') continue;
        const dist = Math.hypot(enemy.x - trap.x, enemy.y - trap.y);
        if (dist <= aoeRadius && TargetingRuleEngine.canTarget(trap.targetingFilter, enemy)) {
          const calc = TargetingRuleEngine.calculateDamage(
            {
              amount: trap.damage,
              element: trap.element,
              sourceId: trap.id
            },
            enemy
          );

          if (!calc.isImmune) {
            TargetingRuleEngine.applyDamageToEnemy(enemy, calc, trap.element);
            TargetingRuleEngine.applyElementalHitEffects(enemy, trap.element, trap.damage);
            // Special extra effect for TRAP_FROST (Bẫy Băng & Thủy Lôi)
            if (trap.type === 'TRAP_FROST') {
              TargetingRuleEngine.applyStatusEffect(enemy, {
                type: 'WET',
                duration: 4.0,
                value: 1
              });
            }
          }

          affectedEnemies.push({
            enemyId: enemy.id,
            damage: calc.finalDamage,
            isImmune: calc.isImmune,
            label: calc.label
          });
        }
      }

      onTrigger(
        {
          trapId: trap.id,
          triggeredAt: { x: trap.x, y: trap.y },
          affectedEnemies
        },
        trap
      );
    }
  }
}

