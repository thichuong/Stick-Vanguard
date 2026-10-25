import {
  SoldierEntity,
  EnemyEntity,
  Vector2D
} from '../types/entities.types.js';
import { TargetingRuleEngine } from './TargetingRuleEngine.js';
import { ALL_ELEMENT_DEFINITIONS } from '../config/elements.config.js';

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
          enemies,
          soldier.canBlockAir
        );

        if (interceptCandidate) {
          soldier.engagedEnemyId = interceptCandidate.id;
          interceptCandidate.engagedBySoldierId = soldier.id;
          interceptCandidate.state = 'ENGAGED';
          soldier.state = 'MOVING_TO_ENGAGE';
          currentEnemy = interceptCandidate;
        } else if (
          soldier.canTargetAir ||
          soldier.canTargetSwim ||
          soldier.archetype === 'DRAGON' ||
          soldier.archetype === 'FAIRY'
        ) {
          this.checkAerialSoldierAttack(soldier, enemies, dt, onCombatEvent);
        }
      }

      // 5. State Machine execution for Melee
      if (soldier.engagedEnemyId && currentEnemy) {
        const dist = Math.hypot(soldier.x - currentEnemy.x, soldier.y - currentEnemy.y);
        const angle = Math.atan2(currentEnemy.y - soldier.y, currentEnemy.x - soldier.x);
        soldier.facing = angle;

        if (dist > 24) {
          // Move towards enemy
          soldier.state = 'MOVING_TO_ENGAGE';
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

            const primaryElement = soldier.element || 'PHYSICAL';
            const secondaryElement = soldier.secondaryElement || undefined;
            const secondaryAmount = secondaryElement
              ? Math.max(1, Math.round(soldier.damage * (soldier.archetype === 'DRAGON' || soldier.archetype === 'FAIRY' ? 0.6 : 0.45)))
              : undefined;

            const bonusElements = soldier.buffedElements
              ? soldier.buffedElements.map((elem) => ({
                  element: elem,
                  amount: Math.max(1, Math.round(soldier.damage * 0.45))
                }))
              : [];

            if (soldier.isSpirit) {
              const ghostRatio = soldier.spiritGhostRatio ?? 0.5;
              bonusElements.push({
                element: 'GHOST' as const,
                amount: Math.max(1, Math.round(soldier.damage * ghostRatio))
              });
            }

            const payload = {
              amount: soldier.damage,
              element: primaryElement,
              secondaryAmount,
              secondaryElement,
              bonusElements: bonusElements.length > 0 ? bonusElements : undefined,
              sourceId: soldier.id
            };

            const calc = TargetingRuleEngine.calculateDamage(payload, currentEnemy);

            if (!calc.isImmune) {
              TargetingRuleEngine.applyDamageToEnemy(
                currentEnemy,
                calc,
                payload.element,
                payload.secondaryAmount,
                payload.secondaryElement
              );
              TargetingRuleEngine.applyAllPayloadEffects(currentEnemy, payload);

              // Light holy heal & Grass root drain
              if (
                secondaryElement === 'LIGHT' ||
                primaryElement === 'LIGHT' ||
                soldier.buffedElements?.includes('LIGHT')
              ) {
                const healAmt = ALL_ELEMENT_DEFINITIONS.LIGHT?.combatStats?.soldierHealOnHit ?? 5;
                soldier.hp = Math.min(soldier.maxHp, soldier.hp + healAmt);
              } else if (
                secondaryElement === 'GRASS' ||
                primaryElement === 'GRASS' ||
                soldier.buffedElements?.includes('GRASS')
              ) {
                const healAmt = ALL_ELEMENT_DEFINITIONS.GRASS?.combatStats?.soldierHealOnHit ?? 3;
                soldier.hp = Math.min(soldier.maxHp, soldier.hp + healAmt);
              }
            }

            const displayElement =
              bonusElements && bonusElements.length > 0
                ? bonusElements[0].element
                : secondaryElement || primaryElement;

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

            // AOE splash attack for Dragon
            if (soldier.aoeRadius && soldier.aoeRadius > 0) {
              const splashRadius = soldier.aoeRadius;
              const splashAmount = Math.max(1, Math.round(soldier.damage * 0.7));
              const splashPayload = {
                amount: splashAmount,
                element: primaryElement,
                secondaryAmount: secondaryElement ? Math.max(1, Math.round(splashAmount * 0.45)) : undefined,
                secondaryElement,
                bonusElements: bonusElements.length > 0 ? bonusElements : undefined,
                sourceId: soldier.id
              };

              for (const otherEnemy of enemies) {
                if (otherEnemy.id === currentEnemy.id || otherEnemy.hp <= 0 || otherEnemy.state === 'DEAD') continue;
                const d = Math.hypot(otherEnemy.x - currentEnemy.x, otherEnemy.y - currentEnemy.y);
                if (d <= splashRadius) {
                  const sCalc = TargetingRuleEngine.calculateDamage(splashPayload, otherEnemy);
                  if (!sCalc.isImmune) {
                    TargetingRuleEngine.applyDamageToEnemy(
                      otherEnemy,
                      sCalc,
                      splashPayload.element,
                      splashPayload.secondaryAmount,
                      splashPayload.secondaryElement
                    );
                    TargetingRuleEngine.applyAllPayloadEffects(otherEnemy, splashPayload);
                  }
                  onCombatEvent({
                    type: 'MELEE_HIT',
                    sourceId: soldier.id,
                    targetId: otherEnemy.id,
                    x: otherEnemy.x,
                    y: otherEnemy.y - (otherEnemy.altitude || 0),
                    damage: sCalc.finalDamage,
                    isImmune: sCalc.isImmune,
                    label: sCalc.label,
                    element: displayElement
                  });
                  if (otherEnemy.hp <= 0) {
                    otherEnemy.state = 'DEAD';
                  }
                }
              }
            }

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

            // Lightning chain shock bounce to 1 nearby enemy
            if (secondaryElement === 'LIGHTNING' || soldier.buffedElements?.includes('LIGHTNING')) {
              const chainRatio = ALL_ELEMENT_DEFINITIONS.LIGHTNING?.combatStats?.chainDamageRatio ?? 0.35;
              this.triggerLightningChain(soldier.id, currentEnemy, enemies, Math.max(1, Math.round(soldier.damage * chainRatio)), onCombatEvent);
            }
          }

          // Enemy attacks soldier (if not stunned/frozen)
          if (!TargetingRuleEngine.isEnemyStunnedOrFrozen(currentEnemy)) {
            currentEnemy.attackCooldown -= dt;
            if (currentEnemy.attackCooldown <= 0) {
              const atkMult = TargetingRuleEngine.getEnemyAttackSpeedMultiplier(currentEnemy);
              currentEnemy.attackCooldown = 1 / Math.max(0.1, currentEnemy.attackSpeed * atkMult);

              const takenDmg = TargetingRuleEngine.calculateEnemyDamageToSoldier(currentEnemy, soldier);
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
        }
      } else {
        // Return to rally point if displaced
        const distToRally = Math.hypot(soldier.x - soldier.rallyPoint.x, soldier.y - soldier.rallyPoint.y);
        if (distToRally > 6) {
          soldier.state = 'MOVING_TO_RALLY';
          const angle = Math.atan2(soldier.rallyPoint.y - soldier.y, soldier.rallyPoint.x - soldier.x);
          soldier.facing = angle;
          const moveSpeed = 65;
          soldier.x += Math.cos(angle) * moveSpeed * dt;
          soldier.y += Math.sin(angle) * moveSpeed * dt;
        } else {
          if (soldier.state !== 'ATTACKING') {
            soldier.state = 'IDLE';
          }
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
        if (!TargetingRuleEngine.isEnemyStunnedOrFrozen(enemy)) {
          enemy.attackCooldown -= dt;
          if (enemy.attackCooldown <= 0) {
            const atkMult = TargetingRuleEngine.getEnemyAttackSpeedMultiplier(enemy);
            enemy.attackCooldown = 1 / Math.max(0.1, enemy.attackSpeed * atkMult);
            const takenDmg = TargetingRuleEngine.calculateEnemyDamageToSoldier(enemy, soldier);
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

    const primaryElement = soldier.element || 'PHYSICAL';
    const secondaryElement = soldier.secondaryElement || undefined;
    const secondaryAmount = secondaryElement
      ? Math.max(1, Math.round(soldier.damage * (soldier.archetype === 'DRAGON' || soldier.archetype === 'FAIRY' ? 0.6 : 0.45)))
      : undefined;

    const bonusElements = soldier.buffedElements
      ? soldier.buffedElements.map((elem) => ({
          element: elem,
          amount: Math.max(1, Math.round(soldier.damage * 0.45))
        }))
      : [];

    if (soldier.isSpirit) {
      const ghostRatio = soldier.spiritGhostRatio ?? 0.5;
      bonusElements.push({
        element: 'GHOST' as const,
        amount: Math.max(1, Math.round(soldier.damage * ghostRatio))
      });
    }

    const payload = {
      amount: soldier.damage,
      element: primaryElement,
      secondaryAmount,
      secondaryElement,
      bonusElements: bonusElements.length > 0 ? bonusElements : undefined,
      sourceId: soldier.id
    };

    const calc = TargetingRuleEngine.calculateDamage(payload, bestTarget);

    if (!calc.isImmune) {
      TargetingRuleEngine.applyDamageToEnemy(
        bestTarget,
        calc,
        payload.element,
        payload.secondaryAmount,
        payload.secondaryElement
      );
      TargetingRuleEngine.applyAllPayloadEffects(bestTarget, payload);

      if (
        secondaryElement === 'LIGHT' ||
        primaryElement === 'LIGHT' ||
        soldier.buffedElements?.includes('LIGHT')
      ) {
        const healAmt = ALL_ELEMENT_DEFINITIONS.LIGHT?.combatStats?.soldierHealOnHit ?? 5;
        soldier.hp = Math.min(soldier.maxHp, soldier.hp + healAmt);
      } else if (
        secondaryElement === 'GRASS' ||
        primaryElement === 'GRASS' ||
        soldier.buffedElements?.includes('GRASS')
      ) {
        const healAmt = ALL_ELEMENT_DEFINITIONS.GRASS?.combatStats?.soldierHealOnHit ?? 3;
        soldier.hp = Math.min(soldier.maxHp, soldier.hp + healAmt);
      }
    }

    const displayElement =
      bonusElements && bonusElements.length > 0
        ? bonusElements[0].element
        : secondaryElement || primaryElement;

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

    // Lightning chain shock bounce to 1 nearby enemy
    if (secondaryElement === 'LIGHTNING' || soldier.buffedElements?.includes('LIGHTNING')) {
      const chainRatio = ALL_ELEMENT_DEFINITIONS.LIGHTNING?.combatStats?.chainDamageRatio ?? 0.35;
      this.triggerLightningChain(soldier.id, bestTarget, enemies, Math.max(1, Math.round(soldier.damage * chainRatio)), onCombatEvent);
    }
  }

  private static triggerLightningChain(
    sourceId: string,
    originTarget: EnemyEntity,
    enemies: EnemyEntity[],
    chainDamage: number,
    onCombatEvent: (evt: CombatEvent) => void
  ): void {
    let closestCandidate: EnemyEntity | null = null;
    let minDist = ALL_ELEMENT_DEFINITIONS.LIGHTNING?.combatStats?.chainRange ?? 110;

    for (const other of enemies) {
      if (other.id === originTarget.id || other.hp <= 0 || other.state === 'DEAD') continue;
      const d = Math.hypot(other.x - originTarget.x, other.y - originTarget.y);
      if (d <= minDist) {
        minDist = d;
        closestCandidate = other;
      }
    }

    if (closestCandidate) {
      const calc = TargetingRuleEngine.calculateDamage(
        {
          amount: chainDamage,
          element: 'LIGHTNING',
          sourceId
        },
        closestCandidate
      );

      if (!calc.isImmune) {
        TargetingRuleEngine.applyDamageToEnemy(closestCandidate, calc, 'LIGHTNING');
        TargetingRuleEngine.applyElementalHitEffects(closestCandidate, 'LIGHTNING', chainDamage);
      }

      onCombatEvent({
        type: 'RANGED_JAVELIN',
        sourceId,
        targetId: closestCandidate.id,
        x: closestCandidate.x,
        y: closestCandidate.y - (closestCandidate.altitude || 0),
        damage: calc.finalDamage,
        isImmune: calc.isImmune,
        label: calc.label,
        element: 'LIGHTNING'
      });

      if (closestCandidate.hp <= 0) {
        closestCandidate.state = 'DEAD';
      }
    }
  }

  private static findUnengagedEnemyNear(
    rallyPoint: Vector2D,
    radius: number,
    enemies: EnemyEntity[],
    canBlockAir?: boolean
  ): EnemyEntity | null {
    let closest: EnemyEntity | null = null;
    let maxDist = radius;

    for (const enemy of enemies) {
      if (enemy.hp <= 0 || enemy.state === 'DEAD') continue;
      // Melee soldiers without canBlockAir can ONLY engage WALK units
      // Units with canBlockAir can engage both WALK and FLY units!
      if (enemy.movementType !== 'WALK') {
        if (!canBlockAir || enemy.movementType !== 'FLY') continue;
      }
      if (enemy.tags && enemy.tags.includes('UNBLOCKABLE')) continue;
      if (enemy.engagedBySoldierId) continue; // already blocked

      const dist = Math.hypot(enemy.x - rallyPoint.x, enemy.y - rallyPoint.y);
      if (dist < maxDist) {
        maxDist = dist;
        closest = enemy;
      }
    }

    return closest;
  }

  private static checkAerialSoldierAttack(
    soldier: SoldierEntity,
    enemies: EnemyEntity[],
    dt: number,
    onCombatEvent: (evt: CombatEvent) => void
  ): void {
    if (soldier.attackCooldown > 0) {
      soldier.attackCooldown -= dt;
    }

    const isDragon = soldier.archetype === 'DRAGON' || (soldier.isSpirit && soldier.spiritSourceArchetype === 'DRAGON');
    const isFairy = soldier.archetype === 'FAIRY' || (soldier.isSpirit && soldier.spiritSourceArchetype === 'FAIRY');
    const canHitAll = isDragon || isFairy || soldier.canTargetSwim;

    // Movement types allowed:
    // Dragon and Fairy can attack targets across all 3 paths: WALK, FLY, and SWIM!
    // Regular melee soldiers with canTargetAir can only attack FLY.
    const allowedMovement: string[] = canHitAll ? ['WALK', 'FLY', 'SWIM'] : ['FLY'];

    const range = soldier.rangedRange || 130;
    let bestTarget: EnemyEntity | null = null;
    let maxProgress = -1;

    for (const enemy of enemies) {
      if (enemy.hp <= 0 || enemy.state === 'DEAD') continue;
      if (!allowedMovement.includes(enemy.movementType)) continue;

      const dist = Math.hypot(enemy.x - soldier.x, enemy.y - soldier.y);
      if (dist <= range) {
        if (enemy.pathDistance > maxProgress) {
          maxProgress = enemy.pathDistance;
          bestTarget = enemy;
        }
      }
    }

    if (!bestTarget) {
      if (soldier.state === 'ATTACKING') {
        soldier.state = 'IDLE';
      }
      return;
    }

    // Turn soldier to face the target enemy (360-degree orientation)
    soldier.facing = Math.atan2(bestTarget.y - soldier.y, bestTarget.x - soldier.x);
    soldier.state = 'ATTACKING';

    if (soldier.attackCooldown > 0) return;

    soldier.attackCooldown = 1 / Math.max(0.2, soldier.attackSpeed);

    if (!canHitAll) {
      // Legacy Spartan air javelin
      const calc = TargetingRuleEngine.calculateDamage(
        {
          amount: soldier.damage * 0.9,
          element: 'LIGHTNING',
          sourceId: soldier.id
        },
        bestTarget
      );

      if (!calc.isImmune) {
        TargetingRuleEngine.applyDamageToEnemy(bestTarget, calc, 'LIGHTNING');
        TargetingRuleEngine.applyElementalHitEffects(bestTarget, 'LIGHTNING', soldier.damage * 0.9);
      }

      onCombatEvent({
        type: 'RANGED_JAVELIN',
        sourceId: soldier.id,
        targetId: bestTarget.id,
        x: bestTarget.x,
        y: bestTarget.y - (bestTarget.altitude || 0),
        damage: calc.finalDamage,
        isImmune: calc.isImmune,
        label: calc.label,
        element: 'LIGHTNING'
      });

      if (bestTarget.hp <= 0) {
        bestTarget.state = 'DEAD';
      }
      return;
    }

    // Dragon and Fairy full hybrid elemental attack:
    const primaryElement = soldier.element || 'PHYSICAL';
    const secondaryElement = soldier.secondaryElement || undefined;
    const secondaryAmount = secondaryElement
      ? Math.max(1, Math.round(soldier.damage * (isDragon || isFairy ? 0.6 : 0.45)))
      : undefined;

    const bonusElements = soldier.buffedElements
      ? soldier.buffedElements.map((elem) => ({
          element: elem,
          amount: Math.max(1, Math.round(soldier.damage * 0.45))
        }))
      : [];

    if (soldier.isSpirit) {
      const ghostRatio = soldier.spiritGhostRatio ?? 0.5;
      bonusElements.push({
        element: 'GHOST' as const,
        amount: Math.max(1, Math.round(soldier.damage * ghostRatio))
      });
    }

    const payload = {
      amount: soldier.damage,
      element: primaryElement,
      secondaryAmount,
      secondaryElement,
      bonusElements: bonusElements.length > 0 ? bonusElements : undefined,
      sourceId: soldier.id
    };

    const calc = TargetingRuleEngine.calculateDamage(payload, bestTarget);

    if (!calc.isImmune) {
      TargetingRuleEngine.applyDamageToEnemy(
        bestTarget,
        calc,
        payload.element,
        payload.secondaryAmount,
        payload.secondaryElement
      );
      TargetingRuleEngine.applyAllPayloadEffects(bestTarget, payload);

      // Light holy heal & Grass root drain
      if (
        secondaryElement === 'LIGHT' ||
        primaryElement === 'LIGHT' ||
        soldier.buffedElements?.includes('LIGHT')
      ) {
        const healAmt = ALL_ELEMENT_DEFINITIONS.LIGHT?.combatStats?.soldierHealOnHit ?? 5;
        soldier.hp = Math.min(soldier.maxHp, soldier.hp + healAmt);
      } else if (
        secondaryElement === 'GRASS' ||
        primaryElement === 'GRASS' ||
        soldier.buffedElements?.includes('GRASS')
      ) {
        const healAmt = ALL_ELEMENT_DEFINITIONS.GRASS?.combatStats?.soldierHealOnHit ?? 3;
        soldier.hp = Math.min(soldier.maxHp, soldier.hp + healAmt);
      }
    }

    const displayElement =
      bonusElements && bonusElements.length > 0
        ? bonusElements[0].element
        : secondaryElement || primaryElement;

    onCombatEvent({
      type: 'MELEE_HIT',
      sourceId: soldier.id,
      targetId: bestTarget.id,
      x: bestTarget.x,
      y: bestTarget.y - (bestTarget.altitude || 0),
      damage: calc.finalDamage,
      isImmune: calc.isImmune,
      label: calc.label,
      element: displayElement
    });

    // AOE splash attack for Dragon
    if (soldier.aoeRadius && soldier.aoeRadius > 0) {
      const splashRadius = soldier.aoeRadius;
      const splashAmount = Math.max(1, Math.round(soldier.damage * 0.7));
      const splashPayload = {
        amount: splashAmount,
        element: primaryElement,
        secondaryAmount: secondaryElement ? Math.max(1, Math.round(splashAmount * 0.45)) : undefined,
        secondaryElement,
        bonusElements: bonusElements.length > 0 ? bonusElements : undefined,
        sourceId: soldier.id
      };

      for (const otherEnemy of enemies) {
        if (otherEnemy.id === bestTarget.id || otherEnemy.hp <= 0 || otherEnemy.state === 'DEAD') continue;
        const d = Math.hypot(otherEnemy.x - bestTarget.x, otherEnemy.y - bestTarget.y);
        if (d <= splashRadius) {
          const sCalc = TargetingRuleEngine.calculateDamage(splashPayload, otherEnemy);
          if (!sCalc.isImmune) {
            TargetingRuleEngine.applyDamageToEnemy(
              otherEnemy,
              sCalc,
              splashPayload.element,
              splashPayload.secondaryAmount,
              splashPayload.secondaryElement
            );
            TargetingRuleEngine.applyAllPayloadEffects(otherEnemy, splashPayload);
          }
          onCombatEvent({
            type: 'MELEE_HIT',
            sourceId: soldier.id,
            targetId: otherEnemy.id,
            x: otherEnemy.x,
            y: otherEnemy.y - (otherEnemy.altitude || 0),
            damage: sCalc.finalDamage,
            isImmune: sCalc.isImmune,
            label: sCalc.label,
            element: displayElement
          });
          if (otherEnemy.hp <= 0) {
            otherEnemy.state = 'DEAD';
          }
        }
      }
    }

    if (bestTarget.hp <= 0) {
      bestTarget.state = 'DEAD';
      bestTarget.engagedBySoldierId = null;
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

    // Lightning chain bounce
    if (secondaryElement === 'LIGHTNING' || soldier.buffedElements?.includes('LIGHTNING')) {
      const chainRatio = ALL_ELEMENT_DEFINITIONS.LIGHTNING?.combatStats?.chainDamageRatio ?? 0.35;
      this.triggerLightningChain(soldier.id, bestTarget, enemies, Math.max(1, Math.round(soldier.damage * chainRatio)), onCombatEvent);
    }
  }
}

