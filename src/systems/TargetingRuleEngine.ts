import {
  DamagePayload,
  ElementType,
  TargetingFilter
} from '../types/elements.types.js';
import { EnemyEntity } from '../types/entities.types.js';
import { ELEMENTAL_MATCHUPS } from '../config/elements.config.js';

export interface DamageCalculationResult {
  finalDamage: number;
  isImmune: boolean;
  multiplier: number;
  label?: string; // 'MIỄN NHIỄM!' | 'KHẮC HỆ!' | 'KHÁNG!'
  primaryDamage?: number;
  secondaryDamage?: number;
}

export class TargetingRuleEngine {
  public static globalDamageMultiplier: number = 1.0;

  /**
   * Evaluates if an attacker (Tower, Trap, or Soldier) can target this enemy
   */
  public static canTarget(
    filter: TargetingFilter,
    enemy: EnemyEntity
  ): boolean {
    if (enemy.hp <= 0 || enemy.state === 'DEAD') {
      return false;
    }

    // 1. Movement type check (WALK, FLY, SWIM)
    if (!filter.allowedMovement.includes(enemy.movementType)) {
      return false;
    }

    // 2. Excluded elements check
    if (
      filter.excludedElements &&
      filter.excludedElements.includes(enemy.elementalProfile.primaryElement)
    ) {
      return false;
    }

    // 3. Excluded tags check (e.g. ['STEALTH', 'UNBLOCKABLE'])
    if (filter.excludedTags && filter.excludedTags.length > 0) {
      for (const tag of filter.excludedTags) {
        if (enemy.tags.includes(tag)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Calculates damage for a single element component
   */
  public static calculateSingleDamage(
    amount: number,
    element: ElementType,
    isCrit: boolean | undefined,
    enemy: EnemyEntity
  ): DamageCalculationResult {
    const profile = enemy.elementalProfile;

    // 1. Check complete 100% Immunity
    if (profile.immunities.includes(element)) {
      return {
        finalDamage: 0,
        isImmune: true,
        multiplier: 0,
        label: 'MIỄN NHIỄM!'
      };
    }

    let multiplier = 1.0;

    // 2. Enemy-specific custom damage multiplier
    if (
      profile.damageMultipliers &&
      profile.damageMultipliers[element] !== undefined
    ) {
      multiplier *= profile.damageMultipliers[element]!;
    } else {
      // 3. Global elemental matchup against primary element
      const matchup = ELEMENTAL_MATCHUPS[element]?.[profile.primaryElement];
      if (matchup !== undefined) {
        multiplier *= matchup;
      }

      // If enemy has secondary element, factor it in
      if (profile.secondaryElement && profile.secondaryElement !== 'PHYSICAL') {
        const secMatchup = ELEMENTAL_MATCHUPS[element]?.[profile.secondaryElement];
        if (secMatchup !== undefined) {
          multiplier = (multiplier + secMatchup) / 2;
        }
      }
    }

    // 4. Status effect interactions
    const hasWet = enemy.statusEffects.some((s) => s.type === 'WET');
    const hasCurse = enemy.statusEffects.some((s) => s.type === 'CURSE');

    if (hasWet) {
      if (element === 'LIGHTNING') multiplier *= 1.75;
      if (element === 'ICE') multiplier *= 1.5;
    }

    if (hasCurse) {
      multiplier *= 1.35;
    }

    // Special bonus: WIND against flying enemies
    if (element === 'WIND' && enemy.movementType === 'FLY') {
      multiplier *= 1.5;
    }

    // Special bonus: EARTH against walking enemies
    if (element === 'EARTH' && enemy.movementType === 'WALK') {
      multiplier *= 1.2;
    }

    if (isCrit) {
      multiplier *= 1.5;
    }

    const calculatedDamage = Math.max(1, Math.round(amount * multiplier * this.globalDamageMultiplier));
    const finalDamage = calculatedDamage;

    let label: string | undefined;
    if (multiplier >= 1.4) {
      label = 'KHẮC HỆ!';
    } else if (multiplier <= 0.6) {
      label = 'KHÁNG!';
    }

    return {
      finalDamage,
      isImmune: false,
      multiplier,
      label
    };
  }

  /**
   * Calculates final damage supporting hybrid (Physical + Magic) & dual-element payloads
   */
  public static calculateDamage(
    payload: DamagePayload,
    enemy: EnemyEntity
  ): DamageCalculationResult {
    const primary = this.calculateSingleDamage(payload.amount, payload.element, payload.isCrit, enemy);
    let totalBase = payload.amount;
    let allImmune = primary.isImmune;
    let finalDamage = primary.isImmune ? 0 : primary.finalDamage;
    let hasSuperEffective = primary.label === 'KHẮC HỆ!';
    let allResist = primary.label === 'KHÁNG!';
    let secondaryDamage = 0;

    if (
      payload.secondaryElement &&
      payload.secondaryAmount !== undefined &&
      payload.secondaryAmount > 0
    ) {
      const secondary = this.calculateSingleDamage(
        payload.secondaryAmount,
        payload.secondaryElement,
        payload.isCrit,
        enemy
      );
      totalBase += payload.secondaryAmount;
      if (!secondary.isImmune) {
        allImmune = false;
        finalDamage += secondary.finalDamage;
        secondaryDamage = secondary.finalDamage;
      }
      if (secondary.label === 'KHẮC HỆ!') hasSuperEffective = true;
      if (secondary.label !== 'KHÁNG!') allResist = false;
    }

    if (payload.bonusElements && payload.bonusElements.length > 0) {
      for (const bonus of payload.bonusElements) {
        if (bonus.amount > 0) {
          const bCalc = this.calculateSingleDamage(
            bonus.amount,
            bonus.element,
            payload.isCrit,
            enemy
          );
          totalBase += bonus.amount;
          if (!bCalc.isImmune) {
            allImmune = false;
            finalDamage += bCalc.finalDamage;
          }
          if (bCalc.label === 'KHẮC HỆ!') hasSuperEffective = true;
          if (bCalc.label !== 'KHÁNG!') allResist = false;
        }
      }
    }

    if (!payload.secondaryElement && (!payload.bonusElements || payload.bonusElements.length === 0)) {
      return {
        ...primary,
        primaryDamage: primary.finalDamage,
        secondaryDamage: 0
      };
    }

    const combinedMultiplier = totalBase > 0 ? finalDamage / totalBase : 1;
    let label: string | undefined;
    if (allImmune) {
      label = 'MIỄN NHIỄM!';
    } else if (hasSuperEffective) {
      label = 'KHẮC HỆ!';
    } else if (allResist) {
      label = 'KHÁNG!';
    }

    return {
      finalDamage,
      isImmune: allImmune,
      multiplier: combinedMultiplier,
      label,
      primaryDamage: primary.finalDamage,
      secondaryDamage
    };
  }

  /**
   * Applies all combat effects for primary, secondary, and bonus elements
   */
  public static applyAllPayloadEffects(enemy: EnemyEntity, payload: DamagePayload): void {
    if (payload.element !== 'PHYSICAL') {
      this.applyElementalHitEffects(enemy, payload.element, payload.amount);
    }
    if (payload.secondaryElement && payload.secondaryAmount) {
      this.applyElementalHitEffects(enemy, payload.secondaryElement, payload.secondaryAmount);
    }
    if (payload.bonusElements) {
      for (const bonus of payload.bonusElements) {
        if (bonus.amount > 0 && bonus.element !== 'PHYSICAL') {
          this.applyElementalHitEffects(enemy, bonus.element, bonus.amount);
        }
      }
    }
  }

  /**
   * Applies specific combat effects triggered on hit for a given magical element
   */
  public static applyElementalHitEffects(
    enemy: EnemyEntity,
    element: ElementType,
    baseDamage: number
  ): void {
    if (element === 'PHYSICAL') return;

    switch (element) {
      case 'FIRE':
        this.applyStatusEffect(enemy, {
          type: 'BURN',
          duration: 3.0,
          value: Math.max(5, Math.round(baseDamage * 0.2))
        });
        break;

      case 'WATER':
        this.applyStatusEffect(enemy, {
          type: 'WET',
          duration: 4.0,
          value: 0
        });
        this.applyStatusEffect(enemy, {
          type: 'SLOW',
          duration: 2.5,
          value: 0.2
        });
        break;

      case 'EARTH':
        this.applyStatusEffect(enemy, {
          type: 'SLOW',
          duration: 2.5,
          value: 0.35
        });
        break;

      case 'WIND':
        if (enemy.movementType === 'FLY') {
          enemy.pathDistance = Math.max(0, enemy.pathDistance - 25);
        } else {
          enemy.pathDistance = Math.max(0, enemy.pathDistance - 15);
        }
        break;

      case 'LIGHTNING':
        this.applyStatusEffect(enemy, {
          type: 'FREEZE',
          duration: 0.35, // mini shock stun
          value: 0
        });
        break;

      case 'ICE':
        this.applyStatusEffect(enemy, {
          type: 'SLOW',
          duration: 3.0,
          value: 0.45
        });
        if (Math.random() < 0.25) {
          this.applyStatusEffect(enemy, {
            type: 'FREEZE',
            duration: 1.2,
            value: 0
          });
        }
        break;

      case 'LIGHT':
        // Holy purification: if enemy is DARK, apply a lingering burn-like holy radiance
        if (enemy.elementalProfile.primaryElement === 'DARK') {
          this.applyStatusEffect(enemy, {
            type: 'BURN',
            duration: 2.5,
            value: Math.max(6, Math.round(baseDamage * 0.25))
          });
        }
        break;

      case 'DARK':
        this.applyStatusEffect(enemy, {
          type: 'CURSE',
          duration: 3.5,
          value: 0.35
        });
        break;
    }
  }

  /**
   * Applies or refreshes a status effect on an enemy
   */
  public static applyStatusEffect(
    enemy: EnemyEntity,
    effectPayload: DamagePayload['statusEffect']
  ): void {
    if (!effectPayload) return;

    // Flying enemies cannot be slowed by ground effects unless targeted directly
    const existing = enemy.statusEffects.find((s) => s.type === effectPayload.type);
    if (existing) {
      existing.duration = Math.max(existing.duration, effectPayload.duration);
      existing.value = Math.max(existing.value, effectPayload.value);
    } else {
      enemy.statusEffects.push({
        ...effectPayload,
        tickTimer: 0
      });
    }
  }

  /**
   * Updates status effects per frame (ticks DoT damage, removes expired)
   */
  public static updateStatusEffects(
    enemy: EnemyEntity,
    dt: number,
    onDotDamage: (dmg: number, element: ElementType) => void
  ): void {
    let speedMult = 1.0;

    for (let i = enemy.statusEffects.length - 1; i >= 0; i--) {
      const eff = enemy.statusEffects[i];
      eff.duration -= dt;

      if (eff.type === 'BURN') {
        eff.tickTimer = (eff.tickTimer || 0) + dt;
        if (eff.tickTimer >= 0.5) {
          eff.tickTimer = 0;
          const scaledDmg = Math.max(1, Math.round(eff.value * this.globalDamageMultiplier));
          onDotDamage(scaledDmg, 'FIRE');
        }
      } else if (eff.type === 'SLOW') {
        speedMult = Math.min(speedMult, 1 - eff.value);
      } else if (eff.type === 'FREEZE') {
        speedMult = 0; // Frozen in place
      }

      if (eff.duration <= 0) {
        enemy.statusEffects.splice(i, 1);
      }
    }

    enemy.speed = enemy.baseSpeed * speedMult;
  }
}

