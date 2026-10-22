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

      // 2. Self-healing for Guardian Citadel (Tier 4 Branch A)
      if (soldier.branch === 'A' && soldier.tier === 4 && soldier.hp < soldier.maxHp) {
        soldier.hp = Math.min(soldier.maxHp, soldier.hp + 15 * dt);
      }

      // Check if soldier is in RANGED mode
      if (soldier.combatMode === 'RANGED') {
        this.updateRangedSoldier(soldier, enemies, dt, onCombatEvent);
        continue;
      }

      // 3. Melee mode: Check current engaged enemy validity
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
          this.checkSoldierAirAttack(soldier, enemies, dt, onCombatEvent);
        }
      }

      // 5. State Machine execution for Melee
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

          // Soldier attacks enemy with Hybrid Damage
          soldier.attackCooldown -= dt;
          if (soldier.attackCooldown <= 0) {
            soldier.attackCooldown = 1 / soldier.attackSpeed;

            const secondaryElement = soldier.secondaryElement || undefined;
            const secondaryAmount = secondaryElement
              ? Math.max(1, Math.round(soldier.damage * 0.45))
              : undefined;

            const bonusElements = soldier.buffedElements
              ? soldier.buffedElements.map((elem) => ({
                  element: elem,
                  amount: Math.max(1, Math.round(soldier.damage * 0.45))
                }))
              : undefined;

            const payload = {
              amount: soldier.damage,
              element: 'PHYSICAL' as const,
              secondaryAmount,
              secondaryElement,
              bonusElements,
              sourceId: soldier.id
            };

            const calc = TargetingRuleEngine.calculateDamage(payload, currentEnemy);

            if (!calc.isImmune) {
              currentEnemy.hp -= calc.finalDamage;
              TargetingRuleEngine.applyAllPayloadEffects(currentEnemy, payload);

              // Light holy heal
              if (
                secondaryElement === 'LIGHT' ||
                soldier.buffedElements?.includes('LIGHT')
              ) {
                soldier.hp = Math.min(soldier.maxHp, soldier.hp + 5);
              }
            }

            const displayElement =
              bonusElements && bonusElements.length > 0
                ? bonusElements[0].element
                : secondaryElement || 'PHYSICAL';

            onCombatEvent({
              type: 'MELEE_HIT',
              sourceId: soldier.id,
              targetId: currentEnemy.id,
              x: (soldier.x + currentEnemy.x) / 2,
              y: (soldier.y + currentEnemy.y) / 2,
              damage: calc.finalDamage,
              isImmune: calc.isImmune,
              label: calc.label,
              element: displayElement
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
                element: secondaryElement || 'PHYSICAL'
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

  private static updateRangedSoldier(
    soldier: SoldierEntity,
    enemies: EnemyEntity[],
    dt: number,
    onCombatEvent: (evt: CombatEvent) => void
  ): void {
    // 1. Move back to rally point if moved
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

    // 2. Decrement attack cooldown
    if (soldier.attackCooldown > 0) {
      soldier.attackCooldown -= dt;
    }

    // 3. Melee defense check: if an enemy walked right on top of this archer
    for (const enemy of enemies) {
      if (enemy.hp <= 0 || enemy.state === 'DEAD' || enemy.movementType !== 'WALK') continue;
      const d = Math.hypot(enemy.x - soldier.x, enemy.y - soldier.y);
      if (d <= 22) {
        enemy.attackCooldown -= dt;
        if (enemy.attackCooldown <= 0) {
          enemy.attackCooldown = 1 / enemy.attackSpeed;
          const rawDmg = enemy.damage * (1 - soldier.armor);
          const takenDmg = Math.max(1, Math.round(rawDmg));
          soldier.hp -= takenDmg;
          onCombatEvent({
            type: 'MELEE_HIT',
            sourceId: enemy.id,
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
            onCombatEvent({
              type: 'SOLDIER_DEATH',
              sourceId: enemy.id,
              targetId: soldier.id,
              x: soldier.x,
              y: soldier.y,
              damage: 0,
              isImmune: false,
              element: 'PHYSICAL'
            });
            return;
          }
        }
      }
    }

    if (soldier.attackCooldown > 0) return;

    // 4. Find best target for Ranged Soldier (Can hit WALK, SWIM, and FLY!)
    const range = soldier.rangedRange || 150;
    let bestTarget: EnemyEntity | null = null;
    let maxProgress = -1;

    for (const enemy of enemies) {
      if (enemy.hp <= 0 || enemy.state === 'DEAD') continue;
      const dist = Math.hypot(enemy.x - soldier.x, enemy.y - soldier.y);
      if (dist <= range && enemy.pathDistance > maxProgress) {
        maxProgress = enemy.pathDistance;
        bestTarget = enemy;
      }
    }

    if (!bestTarget) return;

    // 5. Fire ranged arrow
    soldier.attackCooldown = 1 / soldier.attackSpeed;
    soldier.state = 'ATTACKING';

    const secondaryElement = soldier.secondaryElement || undefined;
    const secondaryAmount = secondaryElement
      ? Math.max(1, Math.round(soldier.damage * 0.45))
      : undefined;

    const bonusElements = soldier.buffedElements
      ? soldier.buffedElements.map((elem) => ({
          element: elem,
          amount: Math.max(1, Math.round(soldier.damage * 0.45))
        }))
      : undefined;

    const payload = {
      amount: soldier.damage,
      element: 'PHYSICAL' as const,
      secondaryAmount,
      secondaryElement,
      bonusElements,
      sourceId: soldier.id
    };

    const calc = TargetingRuleEngine.calculateDamage(payload, bestTarget);

    if (!calc.isImmune) {
      bestTarget.hp -= calc.finalDamage;
      TargetingRuleEngine.applyAllPayloadEffects(bestTarget, payload);

      if (
        secondaryElement === 'LIGHT' ||
        soldier.buffedElements?.includes('LIGHT')
      ) {
        soldier.hp = Math.min(soldier.maxHp, soldier.hp + 5);
      }
    }

    const displayElement =
      bonusElements && bonusElements.length > 0
        ? bonusElements[0].element
        : secondaryElement || 'PHYSICAL';

    onCombatEvent({
      type: 'RANGED_JAVELIN',
      sourceId: soldier.id,
      targetId: bestTarget.id,
      x: bestTarget.x,
      y: bestTarget.y - (bestTarget.altitude || 0),
      damage: calc.finalDamage,
      isImmune: calc.isImmune,
      label: calc.label,
      element: displayElement
    });

    if (bestTarget.hp <= 0) {
      bestTarget.state = 'DEAD';
      onCombatEvent({
        type: 'ENEMY_DEATH',
        sourceId: soldier.id,
        targetId: bestTarget.id,
        x: bestTarget.x,
        y: bestTarget.y,
        damage: 0,
        isImmune: false,
        element: secondaryElement || 'PHYSICAL'
      });
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

