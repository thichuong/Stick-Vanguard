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

