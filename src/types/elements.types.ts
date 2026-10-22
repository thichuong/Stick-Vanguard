export type MovementType = 'WALK' | 'FLY' | 'SWIM';

export type NavigationMode =
  | 'GROUND_PATH'
  | 'WATER_PATH'
  | 'AIR_DIRECT'
  | 'AIR_WAYPOINTS';

export type ElementType =
  | 'PHYSICAL'
  | 'FIRE'
  | 'WATER'
  | 'EARTH'
  | 'WIND'
  | 'LIGHTNING'
  | 'ICE'
  | 'LIGHT'
  | 'DARK';

export type StatusEffectType =
  | 'BURN'      // DoT damage
  | 'WET'       // Vulnerable to lightning / ice
  | 'SLOW'      // Reduces movement speed
  | 'FREEZE'    // Completely immobilized
  | 'SHOCK'     // Stunned & chain electric damage
  | 'KNOCKBACK' // Pushed backward along path
  | 'CURSE';    // Takes increased damage from all sources

export interface StatusEffect {
  type: StatusEffectType;
  duration: number; // in seconds
  value: number;    // damage per tick, slow %, etc.
  tickTimer?: number;
}

export interface ElementalProfile {
  primaryElement: ElementType;
  immunities: ElementType[]; // 100% immune (0 damage)
  /**
   * Multipliers for each damage type:
   * 0 = immune
   * < 1 = resistance
   * 1 = normal
   * > 1 = weakness / vulnerable
   * < 0 = absorb (heals instead of hurts)
   */
  damageMultipliers?: Partial<Record<ElementType, number>>;
}

export interface TargetingFilter {
  allowedMovement: MovementType[];
  excludedElements?: ElementType[];
  excludedTags?: string[];
  skipImmuneTargets?: boolean;
}

export interface DamagePayload {
  amount: number;
  element: ElementType;
  isCrit?: boolean;
  sourceId: string;
  statusEffect?: Omit<StatusEffect, 'tickTimer'>;
}

