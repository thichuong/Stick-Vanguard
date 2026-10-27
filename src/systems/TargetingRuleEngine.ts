import {
  DamagePayload,
  ElementType,
  ElementalProfile,
  TargetingFilter
} from '../types/elements.types.js';
import { EnemyEntity, SoldierEntity } from '../types/entities.types.js';
import { ELEMENTAL_MATCHUPS, ELEMENTAL_REACTIONS, ALL_ELEMENT_DEFINITIONS } from '../config/elements.config.js';
import {
  ENEMY_CC_CONFIG,
  HARD_CC_STATUS_TYPES,
  SOFT_CC_STATUS_TYPES,
  TierCCConfig,
  EnemyTierCategory
} from '../config/enemies.config.js';

export interface DamageCalculationResult {
  finalDamage: number;
  isImmune: boolean;
  multiplier: number;
  label?: string; // 'MIỄN NHIỄM!' | 'KHẮC HỆ!' | 'KHÁNG!' | '💥 BÙNG CHÁY!' | etc.
  reactionTriggered?: boolean;
  reactionLabel?: string;
  primaryDamage?: number;
  secondaryDamage?: number;
}

export interface EnemyToSoldierDamageResult {
  finalDamage: number;
  primaryDamage: number;
  secondaryDamage: number;
  primaryElement: ElementType;
  secondaryElement?: ElementType;
  multiplier: number;
  label?: string; // 'KHẮC HỆ!' | 'KHÁNG!'
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
   * Automatically calculates elemental matchup multiplier from matrix for single or dual-element profile.
   * Multiplicative combination: Mult(Atk -> Primary) * Mult(Atk -> Secondary), clamped safely [0.1, 3.0].
   */
  public static calculateElementalMatchup(
    attacker: ElementType,
    profile: ElementalProfile
  ): number {
    if (profile.immunities.includes(attacker)) {
      return 0;
    }

    const pMatch = ELEMENTAL_MATCHUPS[attacker]?.[profile.primaryElement] ?? 1.0;

    if (profile.secondaryElement && profile.secondaryElement !== 'PHYSICAL') {
      const sMatch = ELEMENTAL_MATCHUPS[attacker]?.[profile.secondaryElement] ?? 1.0;
      const combined = pMatch * sMatch;
      return Math.round(Math.min(3.0, Math.max(0.1, combined)) * 100) / 100;
    }

    return pMatch;
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

    // 2. Calculate elemental matchup automatically from matrix (Primary x Secondary)
    let multiplier = this.calculateElementalMatchup(element, profile);

    // 3. Status effect interactions & Elemental Reactions
    let reactionLabel: string | undefined;
    let bestReaction: (typeof ELEMENTAL_REACTIONS)[0] | undefined;

    for (const reaction of ELEMENTAL_REACTIONS) {
      if (
        reaction.triggerElement === element &&
        enemy.statusEffects.some((s) => s.type === reaction.requiredStatus)
      ) {
        if (!bestReaction || reaction.damageMultiplier > bestReaction.damageMultiplier) {
          bestReaction = reaction;
        }
      }
    }

    if (bestReaction) {
      multiplier *= bestReaction.damageMultiplier;
      reactionLabel = bestReaction.label;
    }

    // Debuff modifiers on target:
    // SUNDER: Armor broken - neutralizes physical resistance and amplifies damage
    const hasSunder = enemy.statusEffects.some((s) => s.type === 'SUNDER');
    const steelStats = ALL_ELEMENT_DEFINITIONS.STEEL?.combatStats;
    if (hasSunder) {
      if (element === 'PHYSICAL' && multiplier < 1.0 && steelStats?.bypassPhysicalResist) {
        multiplier = 1.0; // Bypasses physical resistance of armored foes
      }
      if (!bestReaction || bestReaction.requiredStatus !== 'SUNDER') {
        multiplier *= 1 + (steelStats?.damageAmp ?? 0.30);
      }
    }

    // Ám (CURSE): Khuếch đại sát thương từ các nguồn khác, trừ Tiên (FAIRY) và Quang (LIGHT)
    const hasCurse = enemy.statusEffects.some((s) => s.type === 'CURSE');
    const darkStats = ALL_ELEMENT_DEFINITIONS.DARK?.combatStats;
    if (hasCurse && !['FAIRY', 'LIGHT'].includes(element)) {
      if (!bestReaction || bestReaction.requiredStatus !== 'CURSE') {
        multiplier *= 1 + (darkStats?.damageAmp ?? 0.35);
      }
    }

    // Tiên (CHARM): Tăng phúc mọi chiêu nguyên tố, trừ Hắc Ám (DARK), Ma (GHOST), Độc (POISON) và Vật Lý (PHYSICAL)
    const hasCharm = enemy.statusEffects.some((s) => s.type === 'CHARM');
    const fairyStats = ALL_ELEMENT_DEFINITIONS.FAIRY?.combatStats;
    if (hasCharm && !['PHYSICAL', 'DARK', 'GHOST', 'POISON'].includes(element)) {
      if (!bestReaction || bestReaction.requiredStatus !== 'CHARM') {
        multiplier *= 1 + (fairyStats?.damageAmp ?? 0.25);
      }
    }

    // Rồng (DRAGON_AWE): Tăng uy lực cho các nguyên tố khác
    const hasDragonAwe = enemy.statusEffects.some((s) => s.type === 'DRAGON_AWE');
    const dragonStats = ALL_ELEMENT_DEFINITIONS.DRAGON?.combatStats;
    if (hasDragonAwe && element !== 'DRAGON') {
      if (!bestReaction || bestReaction.requiredStatus !== 'DRAGON_AWE') {
        multiplier *= 1 + (dragonStats?.damageAmp ?? 0.25);
      }
    }

    const hasSoulDrain = enemy.statusEffects.some((s) => s.type === 'SOUL_DRAIN');
    const ghostStats = ALL_ELEMENT_DEFINITIONS.GHOST?.combatStats;
    if (hasSoulDrain) {
      const missingHpRatio = Math.max(0, 1 - enemy.hp / enemy.maxHp);
      multiplier *= 1 + missingHpRatio * (ghostStats?.missingHpDamageRatio ?? 0.4);
    }

    // Special bonus: DRAGON against BOSS or ELITE
    if (element === 'DRAGON' && (enemy.tags.includes('BOSS') || enemy.tags.includes('ELITE'))) {
      multiplier *= dragonStats?.vsBossEliteMultiplier ?? 1.35;
    }

    // Special bonus: WIND against flying enemies
    const windStats = ALL_ELEMENT_DEFINITIONS.WIND?.combatStats;
    if (element === 'WIND' && enemy.movementType === 'FLY') {
      multiplier *= windStats?.vsFlyMultiplier ?? 1.0;
    }

    // Special bonus: EARTH against walking enemies
    const earthStats = ALL_ELEMENT_DEFINITIONS.EARTH?.combatStats;
    if (element === 'EARTH' && enemy.movementType === 'WALK') {
      multiplier *= earthStats?.vsWalkMultiplier ?? 1.2;
    }

    if (isCrit) {
      multiplier *= 1.5;
    }

    // Active Damage Reduction buff on target (DAMAGE_REDUCTION_AURA, highest active ratio, non-stacking)
    const effectiveReduction = this.getEffectiveDamageReductionRatio(enemy);
    if (effectiveReduction > 0) {
      multiplier *= Math.max(0.25, 1 - effectiveReduction);
    }

    const calculatedDamage = Math.max(1, Math.round(amount * multiplier * this.globalDamageMultiplier));
    const finalDamage = calculatedDamage;

    let label: string | undefined = reactionLabel;
    if (!label) {
      if (multiplier >= 1.4) {
        label = 'KHẮC HỆ!';
      } else if (multiplier <= 0.6) {
        label = 'KHÁNG!';
      }
    }

    return {
      finalDamage,
      isImmune: false,
      multiplier,
      label,
      reactionTriggered: !!reactionLabel,
      reactionLabel
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
    let superEffectiveLabel: string | undefined = primary.label && primary.label !== 'KHÁNG!' ? primary.label : undefined;
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
      if (secondary.label && secondary.label !== 'KHÁNG!') {
        superEffectiveLabel = secondary.label;
      }
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
          if (bCalc.label && bCalc.label !== 'KHÁNG!') {
            superEffectiveLabel = bCalc.label;
          }
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
    } else if (superEffectiveLabel) {
      label = superEffectiveLabel;
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
   * Applies damage to enemy, absorbing via Armor Shield (PHYSICAL) and Magic Shield (Non-PHYSICAL)
   * before deducting remaining damage from HP.
   */
  public static applyDamageToEnemy(
    enemy: EnemyEntity,
    calcOrDamage: DamageCalculationResult | number,
    element: ElementType = 'PHYSICAL',
    secondaryDamage?: number,
    secondaryElement?: ElementType
  ): { hpLost: number; shieldAbsorbed: number } {
    const finalDamage = typeof calcOrDamage === 'number' ? calcOrDamage : calcOrDamage.finalDamage;
    if (typeof calcOrDamage !== 'number' && calcOrDamage.isImmune) {
      return { hpLost: 0, shieldAbsorbed: 0 };
    }
    if (finalDamage <= 0) return { hpLost: 0, shieldAbsorbed: 0 };

    let totalShieldAbsorbed = 0;
    let totalHpLost = 0;

    const absorbComponent = (dmg: number, elem: ElementType) => {
      let remainingDmg = dmg;
      if (elem === 'PHYSICAL') {
        if (enemy.armorShield && enemy.armorShield > 0) {
          const absorbed = Math.min(enemy.armorShield, remainingDmg);
          enemy.armorShield -= absorbed;
          remainingDmg -= absorbed;
          totalShieldAbsorbed += absorbed;
        }
      } else {
        if (enemy.magicShield && enemy.magicShield > 0) {
          const absorbed = Math.min(enemy.magicShield, remainingDmg);
          enemy.magicShield -= absorbed;
          remainingDmg -= absorbed;
          totalShieldAbsorbed += absorbed;
        }
      }
      if (remainingDmg > 0) {
        enemy.hp = Math.max(0, enemy.hp - remainingDmg);
        totalHpLost += remainingDmg;
      }
    };

    if (
      typeof calcOrDamage !== 'number' &&
      calcOrDamage.primaryDamage !== undefined &&
      calcOrDamage.secondaryDamage !== undefined &&
      calcOrDamage.secondaryDamage > 0
    ) {
      absorbComponent(calcOrDamage.primaryDamage, element);
      absorbComponent(calcOrDamage.secondaryDamage, secondaryElement || element);
    } else if (typeof calcOrDamage === 'number' && secondaryDamage && secondaryDamage > 0) {
      absorbComponent(calcOrDamage, element);
      absorbComponent(secondaryDamage, secondaryElement || element);
    } else {
      absorbComponent(finalDamage, element);
    }

    if (enemy.hp <= 0) {
      enemy.state = 'DEAD';
    }

    return { hpLost: totalHpLost, shieldAbsorbed: totalShieldAbsorbed };
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
    if (element === 'PHYSICAL' || enemy.elementalProfile.immunities.includes(element)) return;

    // Check and trigger mechanical reaction bonus effects before applying base status
    this.applyReactionBonusEffects(enemy, element, baseDamage);

    const elemDef = ALL_ELEMENT_DEFINITIONS[element];
    const stats = elemDef?.combatStats;

    switch (element) {
      case 'FIRE':
        this.applyStatusEffect(enemy, {
          type: 'BURN',
          duration: stats?.statusDuration ?? 3.0,
          value: Math.max(stats?.dotMinDamage ?? 5, Math.round(baseDamage * (stats?.dotDamageRatio ?? 0.2)))
        });
        break;

      case 'WATER':
        this.applyStatusEffect(enemy, {
          type: 'WET',
          duration: stats?.statusDuration ?? 4.0,
          value: 0
        });
        this.applyStatusEffect(enemy, {
          type: 'SLOW',
          duration: stats?.slowDuration ?? 2.5,
          value: stats?.slowRatio ?? 0.2
        });
        break;

      case 'EARTH':
        this.applyStatusEffect(enemy, {
          type: 'SLOW',
          duration: stats?.slowDuration ?? 2.5,
          value: stats?.slowRatio ?? 0.35
        });
        break;

      case 'WIND': {
        const isFly = enemy.movementType === 'FLY';
        const chance = isFly ? (stats?.knockbackChanceFly ?? 0.55) : (stats?.knockbackChanceGround ?? 0.25);
        if (Math.random() < chance) {
          const dist = isFly ? (stats?.knockbackDistanceFly ?? 20) : (stats?.knockbackDistanceGround ?? 12);
          this.applyKnockback(enemy, dist);
        }
        break;
      }

      case 'LIGHTNING':
        this.applyStatusEffect(enemy, {
          type: 'SHOCK',
          duration: stats?.statusDuration ?? 0.35, // mini shock stun
          value: stats?.statusValue ?? 0.35
        });
        break;

      case 'ICE':
        this.applyStatusEffect(enemy, {
          type: 'SLOW',
          duration: stats?.slowDuration ?? 3.0,
          value: stats?.slowRatio ?? 0.45
        });
        if (Math.random() < (stats?.procChance ?? 0.25)) {
          this.applyStatusEffect(enemy, {
            type: 'FREEZE',
            duration: stats?.procDuration ?? 0.6,
            value: 0
          });
        }
        break;

      case 'LIGHT':
        // Holy purification: if enemy is DARK or GHOST, apply a lingering burn-like holy radiance
        if (
          enemy.elementalProfile.primaryElement === 'DARK' ||
          enemy.elementalProfile.primaryElement === 'GHOST'
        ) {
          this.applyStatusEffect(enemy, {
            type: 'BURN',
            duration: stats?.statusDuration ?? 2.5,
            value: Math.max(stats?.dotMinDamage ?? 6, Math.round(baseDamage * (stats?.dotDamageRatio ?? 0.25)))
          });
        }
        break;

      case 'DARK':
        this.applyStatusEffect(enemy, {
          type: 'CURSE',
          duration: stats?.statusDuration ?? 3.5,
          value: stats?.statusValue ?? 0.35
        });
        break;

      case 'GRASS':
        this.applyStatusEffect(enemy, {
          type: 'SLOW',
          duration: stats?.slowDuration ?? 3.0,
          value: stats?.slowRatio ?? 0.3
        });
        if (Math.random() < (stats?.procChance ?? 0.3)) {
          this.applyStatusEffect(enemy, {
            type: 'ROOT',
            duration: stats?.procDuration ?? 1.0,
            value: 0
          });
        }
        break;

      case 'POISON': {
        const existingPoison = enemy.statusEffects.find((s) => s.type === 'POISON');
        const maxSt = stats?.maxStacks ?? 3;
        const currentStacks = existingPoison ? Math.min(maxSt, (existingPoison.value || 1) + 1) : 1;
        this.applyStatusEffect(enemy, {
          type: 'POISON',
          duration: stats?.statusDuration ?? 4.0,
          value: currentStacks
        });
        break;
      }

      case 'STEEL':
        this.applyStatusEffect(enemy, {
          type: 'SUNDER',
          duration: stats?.statusDuration ?? 4.0,
          value: stats?.statusValue ?? 0.3
        });
        break;

      case 'GHOST':
        this.applyStatusEffect(enemy, {
          type: 'SOUL_DRAIN',
          duration: stats?.statusDuration ?? 3.0,
          value: stats?.statusValue ?? 0.2
        });
        // Slight fear nudge
        if (Math.random() < (stats?.knockbackChanceGround ?? 1.0)) {
          this.applyKnockback(enemy, stats?.knockbackDistanceGround ?? 10);
        }
        break;

      case 'DRAGON':
        this.applyStatusEffect(enemy, {
          type: 'DRAGON_AWE',
          duration: stats?.statusDuration ?? 3.5,
          value: stats?.statusValue ?? 0.25
        });
        break;

      case 'FAIRY':
        this.applyStatusEffect(enemy, {
          type: 'CHARM',
          duration: stats?.statusDuration ?? 3.0,
          value: stats?.slowRatio ?? 0.35
        });
        break;
    }
  }

  /**
   * Applies secondary mechanical bonus effects when an elemental reaction occurs
   */
  public static applyReactionBonusEffects(
    enemy: EnemyEntity,
    element: ElementType,
    baseDamage: number
  ): void {
    // 1. PERMAFROST: WET + ICE -> 100% Guaranteed Freeze
    if (element === 'ICE' && enemy.statusEffects.some((s) => s.type === 'WET')) {
      const iceStats = ALL_ELEMENT_DEFINITIONS.ICE?.combatStats;
      this.applyStatusEffect(enemy, {
        type: 'FREEZE',
        duration: Math.max(0.8, (iceStats?.procDuration ?? 0.6) * 1.33),
        value: 0
      });
    }

    // 2. OVERGROWTH: WET + GRASS -> 100% Guaranteed Root for 1.5s
    if (element === 'GRASS' && enemy.statusEffects.some((s) => s.type === 'WET')) {
      this.applyStatusEffect(enemy, {
        type: 'ROOT',
        duration: 1.5,
        value: 0
      });
    }

    // 3. ELECTRO_CHARGED: WET + LIGHTNING -> Extended shock stun duration
    if (element === 'LIGHTNING' && enemy.statusEffects.some((s) => s.type === 'WET')) {
      this.applyStatusEffect(enemy, {
        type: 'SHOCK',
        duration: 0.7,
        value: 0.35
      });
    }

    // 4. COMBUSTION & BURNING_VINES: POISON/ROOT + FIRE -> Enhanced DoT
    if (element === 'FIRE') {
      if (enemy.statusEffects.some((s) => s.type === 'POISON' || s.type === 'ROOT')) {
        this.applyStatusEffect(enemy, {
          type: 'BURN',
          duration: 3.5,
          value: Math.max(8, Math.round(baseDamage * 0.3))
        });
      }
    }

    // 5. SHATTER / SHATTER_EARTH: FREEZE + STEEL / EARTH -> Consumes ice block and sunders/slows
    if ((element === 'STEEL' || element === 'EARTH') && enemy.statusEffects.some((s) => s.type === 'FREEZE')) {
      // Remove freeze effect
      const fIndex = enemy.statusEffects.findIndex((s) => s.type === 'FREEZE');
      if (fIndex !== -1) {
        enemy.statusEffects.splice(fIndex, 1);
      }
      if (element === 'STEEL') {
        this.applyStatusEffect(enemy, {
          type: 'SUNDER',
          duration: 4.0,
          value: 0.3
        });
      } else {
        this.applyStatusEffect(enemy, {
          type: 'SLOW',
          duration: 3.0,
          value: 0.45
        });
      }
    }

    // 6. CORROSION: SUNDER + POISON -> Instantly stacks poison +2 and extends duration
    if (element === 'POISON' && enemy.statusEffects.some((s) => s.type === 'SUNDER')) {
      const existingPoison = enemy.statusEffects.find((s) => s.type === 'POISON');
      const newStacks = existingPoison ? Math.min(3, (existingPoison.value || 1) + 2) : 2;
      this.applyStatusEffect(enemy, {
        type: 'POISON',
        duration: 5.0,
        value: newStacks
      });
    }

    // 7. SWIRL: BURN + WIND -> Extra knockback and spreads fire duration
    if (element === 'WIND' && enemy.statusEffects.some((s) => s.type === 'BURN')) {
      const extraPush = enemy.movementType === 'FLY' ? 10 : 10;
      this.applyKnockback(enemy, extraPush);
      const burnEff = enemy.statusEffects.find((s) => s.type === 'BURN');
      if (burnEff) {
        burnEff.duration = Math.max(burnEff.duration, 3.5);
      }
    }

    // 8. ABYSSAL_SOUL: CURSE + GHOST -> Extra soul drain duration and knockback
    if (element === 'GHOST' && enemy.statusEffects.some((s) => s.type === 'CURSE')) {
      this.applyKnockback(enemy, 15);
      this.applyStatusEffect(enemy, {
        type: 'SOUL_DRAIN',
        duration: 4.5,
        value: 0.25
      });
    }
  }

  /**
   * Helper to resolve crowd control modifiers (hard and soft CC) for an enemy
   */
  public static getCrowdControlModifiers(enemy: EnemyEntity): TierCCConfig {
    const tier: EnemyTierCategory = enemy.tags.includes('BOSS')
      ? 'BOSS'
      : enemy.tags.includes('ELITE')
      ? 'ELITE'
      : 'NORMAL';

    const baseConfig = ENEMY_CC_CONFIG[tier];
    const custom = enemy.ccResistance;

    return {
      hardCC: {
        effectEfficiency: custom?.hardCC?.effectEfficiency ?? baseConfig.hardCC.effectEfficiency,
        durationEfficiency: custom?.hardCC?.durationEfficiency ?? baseConfig.hardCC.durationEfficiency
      },
      softCC: {
        effectEfficiency: custom?.softCC?.effectEfficiency ?? baseConfig.softCC.effectEfficiency,
        durationEfficiency: custom?.softCC?.durationEfficiency ?? baseConfig.softCC.durationEfficiency
      }
    };
  }

  /**
   * Applies knockback to an enemy taking into account hard crowd control resistance
   * Returns the actual distance knocked back
   */
  public static applyKnockback(enemy: EnemyEntity, baseDistance: number): number {
    const { hardCC } = this.getCrowdControlModifiers(enemy);
    if (hardCC.effectEfficiency <= 0 || hardCC.durationEfficiency <= 0) {
      return 0; // Boss / Immune to hard CC
    }

    const actualDist = baseDistance * hardCC.effectEfficiency;
    if (actualDist > 0) {
      enemy.pathDistance = Math.max(0, enemy.pathDistance - actualDist);
    }
    return actualDist;
  }

  /**
   * Helper to check if enemy is stunned or frozen (cannot move or attack)
   */
  public static isEnemyStunnedOrFrozen(enemy: EnemyEntity): boolean {
    return enemy.statusEffects.some((s) => s.type === 'FREEZE' || s.type === 'SHOCK');
  }

  /**
   * Calculates enemy attack speed multiplier based on active debuffs (POISON, CHARM)
   */
  public static getEnemyAttackSpeedMultiplier(enemy: EnemyEntity): number {
    let mult = 1.0;
    const poisonStats = ALL_ELEMENT_DEFINITIONS.POISON?.combatStats;
    const fairyStats = ALL_ELEMENT_DEFINITIONS.FAIRY?.combatStats;
    if (enemy.statusEffects.some((s) => s.type === 'POISON')) {
      mult = Math.min(mult, 1 - (poisonStats?.attackSpeedReduction ?? 0.2));
    }
    if (enemy.statusEffects.some((s) => s.type === 'CHARM')) {
      mult = Math.min(mult, 1 - (fairyStats?.attackSpeedReduction ?? 0.3));
    }
    return mult;
  }

  /**
   * Retrieves unique elements active on a summoned unit (including base, secondary, spirit, and buffs)
   */
  public static getSoldierElements(soldier: SoldierEntity): ElementType[] {
    const elements: ElementType[] = [];
    if (soldier.element) elements.push(soldier.element);
    else elements.push('PHYSICAL');

    if (soldier.secondaryElement) {
      elements.push(soldier.secondaryElement);
    }
    if (soldier.isSpirit && !elements.includes('GHOST')) {
      elements.push('GHOST');
    }
    if (soldier.buffedElements && soldier.buffedElements.length > 0) {
      for (const bElem of soldier.buffedElements) {
        if (bElem) elements.push(bElem);
      }
    }
    return Array.from(new Set(elements));
  }

  /**
   * Calculates defensive multiplier and mitigation for a soldier taking damage from an attacker element
   */
  public static calculateSoldierDefensiveMultiplier(
    attackerElem: ElementType,
    soldier: SoldierEntity
  ): {
    matchupMult: number;
    reduction: number;
    intakeRatio: number;
  } {
    const soldierElements = this.getSoldierElements(soldier);
    let matchupMult = 1.0;

    for (const sElem of soldierElements) {
      const m = ELEMENTAL_MATCHUPS[attackerElem]?.[sElem] ?? 1.0;
      matchupMult *= m;
    }

    matchupMult = Math.round(Math.min(3.0, Math.max(0.1, matchupMult)) * 100) / 100;

    const reduction = attackerElem === 'PHYSICAL'
      ? Math.min(0.9, Math.max(0, soldier.armor || 0))
      : Math.min(0.9, Math.max(0, soldier.magicResist || 0));

    const intakeRatio = Math.round(matchupMult * (1 - reduction) * 100) / 100;

    return { matchupMult, reduction, intakeRatio };
  }

  /**
   * Standardized detailed calculation for damage dealt by an Enemy to a Soldier.
   * Supports hybrid elemental attacks, secondary element scaling equal to primary element,
   * and multiplicative defense intake across all active soldier elements (including buffs).
   */
  public static calculateEnemyDamageToSoldierDetailed(
    enemy: EnemyEntity,
    soldier: SoldierEntity
  ): EnemyToSoldierDamageResult {
    const hasDragonAwe = enemy.statusEffects.some((s) => s.type === 'DRAGON_AWE');
    const dragonStats = ALL_ELEMENT_DEFINITIONS.DRAGON?.combatStats;
    let baseEnemyDmg = enemy.damage;
    if (hasDragonAwe) {
      baseEnemyDmg *= 1 - (dragonStats?.enemyDamageReduction ?? 0.25);
    }

    const primaryElement = enemy.elementalProfile.primaryElement || 'PHYSICAL';
    const primaryDefense = this.calculateSoldierDefensiveMultiplier(primaryElement, soldier);
    const primaryDamage = Math.max(
      1,
      Math.round(baseEnemyDmg * primaryDefense.matchupMult * (1 - primaryDefense.reduction))
    );

    let secondaryDamage = 0;
    const secondaryElement = enemy.elementalProfile.secondaryElement;

    if (secondaryElement) {
      // Secondary damage base is equal to primary damage base (baseEnemyDmg)
      const secondaryDefense = this.calculateSoldierDefensiveMultiplier(secondaryElement, soldier);
      secondaryDamage = Math.max(
        1,
        Math.round(baseEnemyDmg * secondaryDefense.matchupMult * (1 - secondaryDefense.reduction))
      );
    }

    const finalDamage = primaryDamage + secondaryDamage;
    const totalBaseDmg = secondaryElement ? baseEnemyDmg * 2 : baseEnemyDmg;
    const combinedMultiplier = totalBaseDmg > 0 ? finalDamage / totalBaseDmg : 1.0;

    let label: string | undefined;
    if (combinedMultiplier >= 1.4) {
      label = 'KHẮC HỆ!';
    } else if (combinedMultiplier <= 0.6) {
      label = 'KHÁNG!';
    }

    return {
      finalDamage,
      primaryDamage,
      secondaryDamage,
      primaryElement,
      secondaryElement,
      multiplier: combinedMultiplier,
      label
    };
  }

  /**
   * Standardized calculation for damage dealt by an Enemy to a Soldier
   * Incorporates debuffs (e.g. DRAGON_AWE), elemental matchups, and soldier mitigation
   */
  public static calculateEnemyDamageToSoldier(
    enemy: EnemyEntity,
    soldier: SoldierEntity
  ): number {
    return this.calculateEnemyDamageToSoldierDetailed(enemy, soldier).finalDamage;
  }

  /**
   * Applies or refreshes a status effect on an enemy
   * Taking into account Hard CC and Soft CC modifiers (Boss & Elite scaling)
   */
  public static applyStatusEffect(
    enemy: EnemyEntity,
    effectPayload: DamagePayload['statusEffect']
  ): void {
    if (!effectPayload) return;

    const { hardCC, softCC } = this.getCrowdControlModifiers(enemy);
    let finalDuration = effectPayload.duration;
    let finalValue = effectPayload.value;

    // 1. Check Hard CC (FREEZE, SHOCK, ROOT)
    if (HARD_CC_STATUS_TYPES.includes(effectPayload.type)) {
      if (hardCC.durationEfficiency <= 0 || hardCC.effectEfficiency <= 0) {
        return; // Complete immunity (Boss)
      }
      finalDuration = effectPayload.duration * hardCC.durationEfficiency;
      finalValue = effectPayload.value * hardCC.effectEfficiency;
    }
    // 2. Check Soft CC (SLOW, CHARM)
    else if (SOFT_CC_STATUS_TYPES.includes(effectPayload.type)) {
      if (softCC.durationEfficiency <= 0 || softCC.effectEfficiency <= 0) {
        return; // Complete immunity
      }
      finalDuration = effectPayload.duration * softCC.durationEfficiency;
      finalValue = effectPayload.value * softCC.effectEfficiency;
    }

    const existing = enemy.statusEffects.find((s) => s.type === effectPayload.type);
    if (existing) {
      existing.duration = Math.max(existing.duration, finalDuration);
      existing.value = Math.max(existing.value, finalValue);
    } else {
      enemy.statusEffects.push({
        ...effectPayload,
        duration: finalDuration,
        value: finalValue,
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
        const burnStats = ALL_ELEMENT_DEFINITIONS.FIRE?.combatStats;
        const tickInt = burnStats?.dotTickInterval ?? 0.5;
        if (eff.tickTimer >= tickInt) {
          eff.tickTimer = 0;
          const scaledDmg = Math.max(1, Math.round(eff.value * this.globalDamageMultiplier));
          onDotDamage(scaledDmg, 'FIRE');
        }
      } else if (eff.type === 'POISON') {
        eff.tickTimer = (eff.tickTimer || 0) + dt;
        const poisonStats = ALL_ELEMENT_DEFINITIONS.POISON?.combatStats;
        const tickInt = poisonStats?.dotTickInterval ?? 0.5;
        if (eff.tickTimer >= tickInt) {
          eff.tickTimer = 0;
          const stacks = eff.value || 1;
          const dmgPerStack = poisonStats?.damagePerStack ?? 4;
          const minDmg = poisonStats?.dotMinDamage ?? 3;
          const poisonDmg = Math.max(minDmg, Math.round(stacks * dmgPerStack * this.globalDamageMultiplier));
          onDotDamage(poisonDmg, 'POISON');
        }
      } else if (eff.type === 'SLOW') {
        speedMult = Math.min(speedMult, 1 - eff.value);
      } else if (eff.type === 'FREEZE' || eff.type === 'ROOT' || eff.type === 'SHOCK') {
        speedMult = 0; // Frozen, rooted, or shocked in place
      } else if (eff.type === 'CHARM') {
        speedMult = Math.min(speedMult, 1 - eff.value);
      }

      if (eff.duration <= 0) {
        enemy.statusEffects.splice(i, 1);
      }
    }

    if (enemy.damageReductionBuffs && enemy.damageReductionBuffs.length > 0) {
      for (let i = enemy.damageReductionBuffs.length - 1; i >= 0; i--) {
        const b = enemy.damageReductionBuffs[i];
        b.duration -= dt;
        if (b.duration <= 0) {
          enemy.damageReductionBuffs.splice(i, 1);
        }
      }
      this.syncEffectiveDamageReduction(enemy);
    } else if (enemy.damageReductionTimer && enemy.damageReductionTimer > 0) {
      enemy.damageReductionTimer -= dt;
      if (enemy.damageReductionTimer <= 0) {
        enemy.damageReductionTimer = 0;
        enemy.damageReductionRatio = 0;
      }
    }

    enemy.speed = enemy.baseSpeed * speedMult;
  }

  /**
   * Applies or refreshes damage reduction buff from DAMAGE_REDUCTION_AURA.
   * Incoming damage reduction buffs do NOT stack.
   * Only the effect with the highest ratio is selected.
   * Weaker auras do not refresh or extend the duration of a stronger aura.
   */
  public static applyDamageReduction(
    enemy: EnemyEntity,
    ratio: number,
    duration: number
  ): void {
    const clampedRatio = Math.min(0.6, Math.max(0, ratio));
    if (clampedRatio <= 0 || duration <= 0) return;

    if (!enemy.damageReductionBuffs) {
      enemy.damageReductionBuffs = [];
      if (enemy.damageReductionTimer && enemy.damageReductionTimer > 0 && enemy.damageReductionRatio) {
        enemy.damageReductionBuffs.push({
          ratio: enemy.damageReductionRatio,
          duration: enemy.damageReductionTimer
        });
      }
    }

    const existing = enemy.damageReductionBuffs.find((b) => Math.abs(b.ratio - clampedRatio) < 0.001);
    if (existing) {
      existing.duration = Math.max(existing.duration, duration);
    } else {
      enemy.damageReductionBuffs.push({ ratio: clampedRatio, duration });
    }

    this.syncEffectiveDamageReduction(enemy);
  }

  /**
   * Helper to recalculate and synchronize effective damage reduction ratio and timer.
   * Selects the single highest ratio among all active buffs (non-stacking).
   */
  public static syncEffectiveDamageReduction(enemy: EnemyEntity): void {
    if (!enemy.damageReductionBuffs || enemy.damageReductionBuffs.length === 0) {
      enemy.damageReductionRatio = 0;
      enemy.damageReductionTimer = 0;
      return;
    }

    let bestRatio = 0;
    let bestTimer = 0;

    for (const b of enemy.damageReductionBuffs) {
      if (b.duration > 0) {
        if (b.ratio > bestRatio) {
          bestRatio = b.ratio;
          bestTimer = b.duration;
        } else if (Math.abs(b.ratio - bestRatio) < 0.001) {
          bestTimer = Math.max(bestTimer, b.duration);
        }
      }
    }

    enemy.damageReductionRatio = bestRatio;
    enemy.damageReductionTimer = bestTimer;
  }

  /**
   * Returns the current effective damage reduction ratio on an enemy (highest active ratio, non-stacking)
   */
  public static getEffectiveDamageReductionRatio(enemy: EnemyEntity): number {
    if (enemy.damageReductionBuffs && enemy.damageReductionBuffs.length > 0) {
      let best = 0;
      for (const b of enemy.damageReductionBuffs) {
        if (b.duration > 0 && b.ratio > best) {
          best = b.ratio;
        }
      }
      return best;
    }

    if (enemy.damageReductionTimer && enemy.damageReductionTimer > 0 && enemy.damageReductionRatio) {
      return enemy.damageReductionRatio;
    }

    return 0;
  }
}

