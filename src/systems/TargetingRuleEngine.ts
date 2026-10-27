/**
 * Stick Vanguard - Targeting & Elemental Rule Engine Shell
 * 100% delegated to Rust WebAssembly Core (`wasm-sim/src/rules.rs`).
 * Fallback TypeScript implementations removed.
 */
import {
  DamagePayload,
  ElementType,
  ElementalProfile,
  TargetingFilter,
  StatusEffectPayload
} from '../types/elements.types.js';
import { EnemyEntity, SoldierEntity } from '../types/entities.types.js';
import { TierCCConfig } from '../config/enemies.config.js';
import { WasmBridge } from '../core/WasmBridge.js';

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
    const bridge = WasmBridge.ensureSingletonReady();
    return bridge.getOps().rules_can_target(JSON.stringify(filter), JSON.stringify(enemy));
  }

  /**
   * Automatically calculates elemental matchup multiplier from matrix for single or dual-element profile.
   * Multiplicative combination: Mult(Atk -> Primary) * Mult(Atk -> Secondary), clamped safely [0.1, 3.0].
   */
  public static calculateElementalMatchup(
    attacker: ElementType,
    profile: ElementalProfile
  ): number {
    const bridge = WasmBridge.ensureSingletonReady();
    return bridge.getOps().rules_calculate_elemental_matchup(attacker, JSON.stringify(profile));
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
    return this.calculateDamage(
      {
        amount,
        element,
        isCrit,
        sourceId: 'single'
      },
      enemy
    );
  }

  /**
   * Calculates final damage supporting hybrid (Physical + Magic) & dual-element payloads
   */
  public static calculateDamage(
    payload: DamagePayload,
    enemy: EnemyEntity,
    globalDamageMultiplier: number = TargetingRuleEngine.globalDamageMultiplier
  ): DamageCalculationResult {
    const bridge = WasmBridge.ensureSingletonReady();
    const json = bridge
      .getOps()
      .rules_calculate_damage(
        JSON.stringify(payload),
        JSON.stringify(enemy),
        globalDamageMultiplier
      );
    return JSON.parse(json) as DamageCalculationResult;
  }

  /**
   * Applies damage to enemy HP, taking shields, physical armor, and magical resistance into account.
   */
  public static applyDamageToEnemy(
    enemy: EnemyEntity,
    calculationOrDamage: DamageCalculationResult | number,
    damageElement: ElementType,
    arg3?: number | ElementType,
    arg4?: ElementType
  ): { hpLost: number; shieldAbsorbed: number } {
    let calc: DamageCalculationResult;
    let secElem: ElementType | undefined;
    if (typeof calculationOrDamage === 'number') {
      calc = {
        finalDamage: calculationOrDamage,
        isImmune: false,
        multiplier: 1.0
      };
      if (typeof arg3 === 'string') {
        secElem = arg3;
      }
    } else {
      calc = calculationOrDamage;
      if (typeof arg3 === 'string') {
        secElem = arg3;
      } else if (typeof arg4 === 'string') {
        secElem = arg4;
      }
    }

    const bridge = WasmBridge.ensureSingletonReady();
    const json = bridge
      .getOps()
      .rules_apply_damage_to_enemy(
        JSON.stringify(enemy),
        JSON.stringify(calc),
        damageElement,
        secElem
      );
    const parsed = JSON.parse(json);
    Object.assign(enemy, parsed.enemy);
    return { hpLost: parsed.hpLost, shieldAbsorbed: parsed.shieldAbsorbed };
  }

  /**
   * Applies all damage payload secondary effects (AoE, CC, statuses) to enemy
   */
  public static applyAllPayloadEffects(enemy: EnemyEntity, payload: DamagePayload): void {
    const bridge = WasmBridge.ensureSingletonReady();
    const res = bridge.getOps().rules_apply_all_payload_effects(
      JSON.stringify(enemy),
      JSON.stringify(payload)
    );
    if (res) {
      Object.assign(enemy, JSON.parse(res));
    }
  }

  /**
   * Applies individual elemental hit effects and secondary debuffs
   */
  public static applyElementalHitEffects(
    enemy: EnemyEntity,
    element: ElementType,
    baseDamage: number
  ): void {
    const bridge = WasmBridge.ensureSingletonReady();
    const res = bridge.getOps().rules_apply_elemental_hit_effects(
      JSON.stringify(enemy),
      element,
      baseDamage
    );
    if (res) {
      Object.assign(enemy, JSON.parse(res));
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
    const bridge = WasmBridge.ensureSingletonReady();
    const res = bridge.getOps().rules_apply_reaction_bonus_effects(
      JSON.stringify(enemy),
      element,
      baseDamage
    );
    if (res) {
      Object.assign(enemy, JSON.parse(res));
    }
  }

  /**
   * Returns crowd-control duration and effect intensity multipliers
   */
  public static getCrowdControlModifiers(enemy: EnemyEntity): TierCCConfig {
    const bridge = WasmBridge.ensureSingletonReady();
    const json = bridge.getOps().rules_get_crowd_control_modifiers(JSON.stringify(enemy));
    return JSON.parse(json) as TierCCConfig;
  }

  /**
   * Applies knockback displacement to enemy respecting CC resistance
   */
  public static applyKnockback(enemy: EnemyEntity, baseDistance: number): number {
    const bridge = WasmBridge.ensureSingletonReady();
    const json = bridge.getOps().rules_apply_knockback(JSON.stringify(enemy), baseDistance);
    const parsed = JSON.parse(json);
    Object.assign(enemy, parsed.enemy);
    return parsed.actualDistance;
  }

  /**
   * Checks if enemy is unable to act or attack due to hard CC
   */
  public static isEnemyStunnedOrFrozen(enemy: EnemyEntity): boolean {
    const bridge = WasmBridge.ensureSingletonReady();
    return bridge.getOps().rules_is_enemy_stunned_or_frozen(JSON.stringify(enemy));
  }

  /**
   * Calculates enemy attack speed multiplier under debuffs
   */
  public static getEnemyAttackSpeedMultiplier(enemy: EnemyEntity): number {
    const bridge = WasmBridge.ensureSingletonReady();
    const val = bridge.getOps().rules_get_enemy_attack_speed_multiplier(JSON.stringify(enemy));
    return Math.round(val * 100) / 100;
  }

  /**
   * Returns list of elements of a summoned soldier
   */
  public static getSoldierElements(soldier: SoldierEntity): ElementType[] {
    const bridge = WasmBridge.ensureSingletonReady();
    const json = bridge.getOps().rules_get_soldier_elements(JSON.stringify(soldier));
    return JSON.parse(json) as ElementType[];
  }

  /**
   * Computes defender elemental resistance multiplier for summoned soldiers
   */
  public static calculateSoldierDefensiveMultiplier(
    attackerElement: ElementType,
    soldier: SoldierEntity
  ): {
    matchupMult: number;
    reduction: number;
    intakeRatio: number;
    matchupMultiplier: number;
    armorOrResistReduction: number;
    finalDamageIntakeRatio: number;
  } {
    const bridge = WasmBridge.ensureSingletonReady();
    const json = bridge.getOps().rules_calculate_soldier_defensive_multiplier(
      attackerElement,
      JSON.stringify(soldier)
    );
    const parsed = JSON.parse(json);
    const matchupMult = Math.round((parsed.matchupMultiplier ?? parsed.matchupMult ?? 1.0) * 100) / 100;
    const reduction = Math.round((parsed.armorOrResistReduction ?? parsed.reduction ?? 0) * 100) / 100;
    const intakeRatio = Math.round((parsed.finalDamageIntakeRatio ?? parsed.intakeRatio ?? 1.0) * 100) / 100;
    return {
      matchupMult,
      reduction,
      intakeRatio,
      matchupMultiplier: matchupMult,
      armorOrResistReduction: reduction,
      finalDamageIntakeRatio: intakeRatio
    };
  }

  /**
   * Calculates detailed damage dealt by an enemy to a soldier
   */
  public static calculateEnemyDamageToSoldierDetailed(
    enemy: EnemyEntity,
    soldier: SoldierEntity
  ): EnemyToSoldierDamageResult {
    const bridge = WasmBridge.ensureSingletonReady();
    const json = bridge.getOps().rules_calculate_enemy_damage_to_soldier(
      JSON.stringify(enemy),
      JSON.stringify(soldier)
    );
    return JSON.parse(json) as EnemyToSoldierDamageResult;
  }

  /**
   * Calculates final damage dealt by an enemy to a soldier
   */
  public static calculateEnemyDamageToSoldier(
    enemy: EnemyEntity,
    soldier: SoldierEntity
  ): number {
    return this.calculateEnemyDamageToSoldierDetailed(enemy, soldier).finalDamage;
  }

  /**
   * Applies status effect with CC resistance scaling
   */
  public static applyStatusEffect(enemy: EnemyEntity, payload: StatusEffectPayload): void {
    const bridge = WasmBridge.ensureSingletonReady();
    const res = bridge.getOps().rules_apply_status_effect(
      JSON.stringify(enemy),
      JSON.stringify(payload)
    );
    if (res) {
      Object.assign(enemy, JSON.parse(res));
    }
  }

  /**
   * Ticks down status effects and resolves DoT damage
   */
  public static updateStatusEffects(
    enemy: EnemyEntity,
    dt: number,
    onDamageOverTime?: (damage: number, element: ElementType) => void,
    globalDamageMultiplier: number = TargetingRuleEngine.globalDamageMultiplier
  ): void {
    const bridge = WasmBridge.ensureSingletonReady();
    const json = bridge.getOps().rules_update_status_effects(
      JSON.stringify(enemy),
      dt,
      globalDamageMultiplier
    );
    if (json) {
      const parsed = JSON.parse(json);
      Object.assign(enemy, parsed.enemy);
      if (onDamageOverTime && parsed.dots) {
        for (const dot of parsed.dots) {
          onDamageOverTime(dot.damage, dot.element);
        }
      }
    }
  }

  /**
   * Applies damage reduction buff to enemy
   */
  public static applyDamageReduction(
    enemy: EnemyEntity,
    ratio: number,
    duration: number
  ): void {
    const bridge = WasmBridge.ensureSingletonReady();
    const res = bridge.getOps().rules_apply_damage_reduction(
      JSON.stringify(enemy),
      ratio,
      duration
    );
    if (res) {
      Object.assign(enemy, JSON.parse(res));
      if (enemy.damageReductionRatio !== undefined && enemy.damageReductionRatio !== null) {
        enemy.damageReductionRatio = Math.round(enemy.damageReductionRatio * 100) / 100;
      }
      if (enemy.damageReductionTimer !== undefined && enemy.damageReductionTimer !== null) {
        enemy.damageReductionTimer = Math.round(enemy.damageReductionTimer * 100) / 100;
      }
    }
  }

  /**
   * Synchronizes effective damage reduction from active buffs
   */
  public static syncEffectiveDamageReduction(enemy: EnemyEntity): void {
    const bridge = WasmBridge.ensureSingletonReady();
    const res = bridge.getOps().rules_sync_effective_damage_reduction(JSON.stringify(enemy));
    if (res) {
      Object.assign(enemy, JSON.parse(res));
      if (enemy.damageReductionRatio !== undefined && enemy.damageReductionRatio !== null) {
        enemy.damageReductionRatio = Math.round(enemy.damageReductionRatio * 100) / 100;
      }
      if (enemy.damageReductionTimer !== undefined && enemy.damageReductionTimer !== null) {
        enemy.damageReductionTimer = Math.round(enemy.damageReductionTimer * 100) / 100;
      }
    }
  }

  /**
   * Returns current active damage reduction ratio on enemy
   */
  public static getEffectiveDamageReductionRatio(enemy: EnemyEntity): number {
    const bridge = WasmBridge.ensureSingletonReady();
    const val = bridge.getOps().rules_get_effective_damage_reduction_ratio(JSON.stringify(enemy));
    return Math.round(val * 100) / 100;
  }
}
