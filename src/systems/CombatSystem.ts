import {
  SoldierEntity,
  EnemyEntity,
  Vector2D
} from '../types/entities.types.js';
import { TargetingRuleEngine } from './TargetingRuleEngine.js';

export interface CombatEvent {
  type: 'MELEE_HIT' | 'RANGED_JAVELIN' | 'SOLDIER_DEATH' | 'ENEMY_DEATH';
  sourceId: string;
  targetId: string;
  x: number;
  y: number;
  damage: number;
  isImmune: boolean;
  label?: string;
  element: string;
}

export class CombatSystem {
  public static updateCombat(
    soldiers: SoldierEntity[],
    enemies: EnemyEntity[],
    dt: number,
    onCombatEvent: (evt: CombatEvent) => void
  ): void {
    const enemyMap = new Map<string, EnemyEntity>();
    for (const e of enemies) {
      if (e.hp > 0 && e.state !== 'DEAD') {
        enemyMap.set(e.id, e);
      }
    }

    for (const soldier of soldiers) {
      // 1. Respawn timer if dead
      if (soldier.state === 'DEAD') {
        soldier.respawnTimer -= dt;
        if (soldier.respawnTimer <= 0) {
          soldier.state = 'MOVING_TO_RALLY';
          soldier.hp = soldier.maxHp;
          soldier.x = soldier.rallyPoint.x;
          soldier.y = soldier.rallyPoint.y;
          soldier.engagedEnemyId = null;
        }
        continue;
      }

      // 2. Self-healing for Paladin (Tier 4 Branch A)
      if (soldier.branch === 'A' && soldier.tier === 4 && soldier.hp < soldier.maxHp) {
        soldier.hp = Math.min(soldier.maxHp, soldier.hp + 12 * dt);
      }

      // 3. Check current engaged enemy validity
      let currentEnemy: EnemyEntity | undefined;
      if (soldier.engagedEnemyId) {
        currentEnemy = enemyMap.get(soldier.engagedEnemyId);
        if (!currentEnemy || currentEnemy.hp <= 0 || currentEnemy.state === 'DEAD') {
          soldier.engagedEnemyId = null;
          soldier.state = 'MOVING_TO_RALLY';
          currentEnemy = undefined;
        }
      }

      // 4. Find new enemy to intercept if idle or moving to rally
      if (!soldier.engagedEnemyId) {
        const interceptCandidate = this.findUnengagedEnemyNear(
          soldier.rallyPoint,
          95, // aggro radius around rally point
          enemies
        );

        if (interceptCandidate) {
          soldier.engagedEnemyId = interceptCandidate.id;
          interceptCandidate.engagedBySoldierId = soldier.id;
          interceptCandidate.state = 'ENGAGED';
          soldier.state = 'MOVING_TO_ENGAGE';
          currentEnemy = interceptCandidate;
        } else if (soldier.canTargetAir) {
          // Special ability: Tempest Spartan throws lightning javelin at flying targets!
          this.checkSoldierAirAttack(soldier, enemies, dt, onCombatEvent);
        }
      }

      // 5. State Machine execution
      if (soldier.engagedEnemyId && currentEnemy) {
        const dist = Math.hypot(soldier.x - currentEnemy.x, soldier.y - currentEnemy.y);

        if (dist > 24) {
          // Move towards enemy
          soldier.state = 'MOVING_TO_ENGAGE';
          const angle = Math.atan2(currentEnemy.y - soldier.y, currentEnemy.x - soldier.x);
          const moveSpeed = 80;
          soldier.x += Math.cos(angle) * moveSpeed * dt;
          soldier.y += Math.sin(angle) * moveSpeed * dt;
        } else {
          // In melee range: fight!
          soldier.state = 'ATTACKING';
          currentEnemy.state = 'ATTACKING';

          // Soldier attacks enemy
          soldier.attackCooldown -= dt;
          if (soldier.attackCooldown <= 0) {
            soldier.attackCooldown = 1 / soldier.attackSpeed;

            const calc = TargetingRuleEngine.calculateDamage(
              {
                amount: soldier.damage,
                element: soldier.element,
                sourceId: soldier.id
              },
              currentEnemy
            );

            if (!calc.isImmune) {
              currentEnemy.hp -= calc.finalDamage;
            }

            onCombatEvent({
              type: 'MELEE_HIT',
              sourceId: soldier.id,
              targetId: currentEnemy.id,
              x: (soldier.x + currentEnemy.x) / 2,
              y: (soldier.y + currentEnemy.y) / 2,
              damage: calc.finalDamage,
              isImmune: calc.isImmune,
              label: calc.label,
              element: soldier.element
            });

            if (currentEnemy.hp <= 0) {
              currentEnemy.state = 'DEAD';
              currentEnemy.engagedBySoldierId = null;
              soldier.engagedEnemyId = null;
              soldier.state = 'MOVING_TO_RALLY';
              onCombatEvent({
                type: 'ENEMY_DEATH',
                sourceId: soldier.id,
                targetId: currentEnemy.id,
                x: currentEnemy.x,
                y: currentEnemy.y,
                damage: 0,
                isImmune: false,
                element: soldier.element
              });
              continue;
            }
          }

          // Enemy attacks soldier
          currentEnemy.attackCooldown -= dt;
          if (currentEnemy.attackCooldown <= 0) {
            currentEnemy.attackCooldown = 1 / currentEnemy.attackSpeed;

            // Reduce damage by soldier armor
            const rawDmg = currentEnemy.damage * (1 - soldier.armor);
            const takenDmg = Math.max(1, Math.round(rawDmg));
            soldier.hp -= takenDmg;

            onCombatEvent({
              type: 'MELEE_HIT',
              sourceId: currentEnemy.id,
              targetId: soldier.id,
              x: soldier.x,
              y: soldier.y,
              damage: takenDmg,
              isImmune: false,
              element: 'PHYSICAL'
            });

            if (soldier.hp <= 0) {
              soldier.state = 'DEAD';
              soldier.respawnTimer = soldier.respawnDelay;
              soldier.engagedEnemyId = null;
              currentEnemy.engagedBySoldierId = null;
              currentEnemy.state = 'WALKING';
              onCombatEvent({
                type: 'SOLDIER_DEATH',
                sourceId: currentEnemy.id,
                targetId: soldier.id,
                x: soldier.x,
                y: soldier.y,
                damage: 0,
                isImmune: false,
                element: 'PHYSICAL'
              });
            }
          }
        }
      } else {
        // Return to rally point if displaced
        const distToRally = Math.hypot(soldier.x - soldier.rallyPoint.x, soldier.y - soldier.rallyPoint.y);
        if (distToRally > 6) {
          soldier.state = 'MOVING_TO_RALLY';
          const angle = Math.atan2(soldier.rallyPoint.y - soldier.y, soldier.rallyPoint.x - soldier.x);
          const moveSpeed = 65;
          soldier.x += Math.cos(angle) * moveSpeed * dt;
          soldier.y += Math.sin(angle) * moveSpeed * dt;
        } else {
          soldier.state = 'IDLE';
        }
      }
    }
  }

  private static findUnengagedEnemyNear(
    rallyPoint: Vector2D,
    radius: number,
    enemies: EnemyEntity[]
  ): EnemyEntity | null {
    let closest: EnemyEntity | null = null;
    let maxDist = radius;

    for (const enemy of enemies) {
      if (enemy.hp <= 0 || enemy.state === 'DEAD') continue;
      // Melee soldiers can ONLY engage WALK units that are NOT UNBLOCKABLE
      if (enemy.movementType !== 'WALK') continue;
      if (enemy.tags.includes('UNBLOCKABLE')) continue;
      if (enemy.engagedBySoldierId !== null) continue; // already blocked

      const dist = Math.hypot(enemy.x - rallyPoint.x, enemy.y - rallyPoint.y);
      if (dist < maxDist) {
        maxDist = dist;
        closest = enemy;
      }
    }

    return closest;
  }

  private static checkSoldierAirAttack(
    soldier: SoldierEntity,
    enemies: EnemyEntity[],
    dt: number,
    onCombatEvent: (evt: CombatEvent) => void
  ): void {
    soldier.attackCooldown -= dt;
    if (soldier.attackCooldown > 0) return;

    // Look for flying enemy within range
    const range = 130;
    for (const enemy of enemies) {
      if (enemy.hp <= 0 || enemy.state === 'DEAD') continue;
      if (enemy.movementType === 'FLY') {
        const dist = Math.hypot(enemy.x - soldier.x, enemy.y - soldier.y);
        if (dist <= range) {
          soldier.attackCooldown = 1.2;
          const calc = TargetingRuleEngine.calculateDamage(
            {
              amount: soldier.damage * 0.9,
              element: 'LIGHTNING',
              sourceId: soldier.id
            },
            enemy
          );

          if (!calc.isImmune) {
            enemy.hp -= calc.finalDamage;
            TargetingRuleEngine.applyStatusEffect(enemy, {
              type: 'SLOW',
              duration: 1.5,
              value: 0.4
            });
          }

          onCombatEvent({
            type: 'RANGED_JAVELIN',
            sourceId: soldier.id,
            targetId: enemy.id,
            x: enemy.x,
            y: enemy.y,
            damage: calc.finalDamage,
            isImmune: calc.isImmune,
            label: calc.label,
            element: 'LIGHTNING'
          });

          if (enemy.hp <= 0) {
            enemy.state = 'DEAD';
          }
          break;
        }
      }
    }
  }
}

