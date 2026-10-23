import { ElementType, StatusEffectType } from '../../types/elements.types.js';

export type ReactionCategory =
  | 'NATURAL'        // Phản ứng tự nhiên cổ điển
  | 'DRAGON_BOOST'   // Rồng tăng uy lực các nguyên tố khác
  | 'FAIRY_BLESS'    // Tiên tăng phúc nguyên tố (trừ Ám, Ma, Độc, Vật Lý)
  | 'DARK_SYNERGY';  // Ám + Ma & Ám + các nguyên tố khác (trừ Tiên, Quang)

export interface ElementMatchupEntry {
  element: ElementType;
  mult: number;
  note: string;
}

export interface ElementCombatStats {
  // Hệ số sát thương đặc thù theo loại di chuyển / phân loại quái
  vsWalkMultiplier?: number;       // VD: EARTH = 1.2
  vsFlyMultiplier?: number;        // VD: WIND = 1.0 (đã bỏ bonus sát thương)
  vsBossEliteMultiplier?: number;  // VD: DRAGON = 1.35

  // Hiệu ứng trạng thái chính (Status Effect)
  statusDuration?: number;         // Thời gian hiệu lực của trạng thái chính (s)
  statusValue?: number;            // Giá trị hiệu ứng (VD: CURSE 0.35, SUNDER 0.30, DRAGON_AWE 0.25)

  // Làm chậm (Slow)
  slowDuration?: number;           // Thời gian làm chậm (s)
  slowRatio?: number;              // Tỉ lệ làm chậm tốc chạy (0.0 -> 1.0)

  // Khống chế cứng theo tỉ lệ (Freeze / Root)
  procChance?: number;             // Tỉ lệ kích hoạt (0.0 -> 1.0)
  procDuration?: number;           // Thời gian khống chế (s)

  // Đẩy lùi (Knockback - WIND, GHOST)
  knockbackChanceGround?: number;  // Tỉ lệ đẩy lùi quái bộ/bơi (0.0 -> 1.0)
  knockbackChanceFly?: number;     // Tỉ lệ đẩy lùi quái bay (0.0 -> 1.0)
  knockbackDistanceGround?: number;// Cự ly đẩy lùi quái bộ/bơi (px)
  knockbackDistanceFly?: number;   // Cự ly đẩy lùi quái bay (px)

  // Sát thương theo thời gian (DoT - FIRE, POISON, LIGHT)
  dotTickInterval?: number;        // Chu kỳ mỗi nhịp DoT (s)
  dotDamageRatio?: number;         // % sát thương gốc mỗi nhịp
  dotMinDamage?: number;           // Sát thương tối thiểu mỗi nhịp
  maxStacks?: number;              // Số tầng cộng dồn tối đa (POISON)
  damagePerStack?: number;         // Sát thương mỗi tầng (POISON)

  // Giật sét lan (Chain - LIGHTNING)
  chainDamageRatio?: number;       // Tỉ lệ sát thương nảy tia sét
  chainRange?: number;             // Phạm vi tìm mục tiêu nảy sét (px)

  // Hồi máu cho Lính khi đánh trúng (LIGHT, GRASS)
  soldierHealOnHit?: number;       // Lượng HP hồi mỗi đòn đánh của lính

  // Khuếch đại sát thương / Suy yếu đòn đánh kẻ địch
  damageAmp?: number;              // Tăng sát thương nhận vào
  bypassPhysicalResist?: boolean;  // Phá kháng vật lý
  attackSpeedReduction?: number;   // Giảm tốc đánh của quái
  enemyDamageReduction?: number;   // Giảm sát thương đòn đánh của quái
  missingHpDamageRatio?: number;   // Tăng sát thương theo % máu đã mất
}

export interface ElementDefinition {
  element: ElementType;
  name: string;
  nameVi: string;
  color: string;
  icon: string;
  badge: string;
  nature: string;
  statusEffectType?: StatusEffectType;
  effectName: string;
  effectDescription: string;
  statusEffectName: string;
  statusEffectDesc: string;
  combatHighlights: string[]; // Chi tiết cơ chế & thông số chiến đấu
  combatStats?: ElementCombatStats; // Thông số chiến đấu cấu hình được
  buildingEffects: {
    barracks: string;
    archer: string;
    mage: string;
    artillery: string;
  };
  offensiveMatchups: ElementMatchupEntry[]; // Khi hệ này tấn công các hệ khác
  defensiveNotes?: Partial<Record<ElementType, string>>; // Ghi chú khi bị hệ khác tấn công
  sampleMonsters: string[];
}

export interface ElementalReaction {
  id: string;
  name: string;
  category: ReactionCategory;
  requiredStatus: StatusEffectType;
  triggerElement: ElementType;
  damageMultiplier: number;
  bonusEffect?: string;
  label: string; // e.g. "💥 BÙNG CHÁY!"
  description: string;
}

export interface OffensiveLookupRow {
  targetElement: ElementType;
  multiplier: number;
  percentage: number;
  category: 'SUPER_EFFECTIVE' | 'EFFECTIVE' | 'NORMAL' | 'RESISTED' | 'IMMUNE';
  label: string;
  note: string;
}

export interface DefensiveLookupRow {
  attackerElement: ElementType;
  multiplier: number;
  percentage: number;
  category: 'SUPER_WEAK' | 'WEAK' | 'NORMAL' | 'RESIST' | 'IMMUNE';
  label: string;
  note: string;
}

export interface SynergyLookupRow {
  partnerElement: ElementType;
  role: 'SETUP' | 'TRIGGER';
  reaction: ElementalReaction;
  formulaText: string;
}

