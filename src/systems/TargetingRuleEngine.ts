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
}

export class TargetingRuleEngine {
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
   * Calculates final damage applying immunities, elemental matchup, and active status effects
   */
  public static calculateDamage(
    payload: DamagePayload,
    enemy: EnemyEntity
  ): DamageCalculationResult {
    const { element, amount, isCrit } = payload;
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
    }

    // 4. Status effect interactions (e.g. WET increases Lightning / Ice damage)
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

    if (isCrit) {
      multiplier *= 1.5;
    }

    const finalDamage = Math.max(1, Math.round(amount * multiplier));

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
          onDotDamage(eff.value, 'FIRE');
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

