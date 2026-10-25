import { ElementType, MagicalElementType } from '../../types/elements.types.js';
import {
  ElementDefinition,
  ElementalReaction,
  OffensiveLookupRow,
  DefensiveLookupRow,
  SynergyLookupRow
} from './types.js';

import { PHYSICAL_ELEMENT } from './physical.element.js';
import { FIRE_ELEMENT } from './fire.element.js';
import { WATER_ELEMENT } from './water.element.js';
import { EARTH_ELEMENT } from './earth.element.js';
import { WIND_ELEMENT } from './wind.element.js';
import { LIGHTNING_ELEMENT } from './lightning.element.js';
import { ICE_ELEMENT } from './ice.element.js';
import { LIGHT_ELEMENT } from './light.element.js';
import { DARK_ELEMENT } from './dark.element.js';
import { GRASS_ELEMENT } from './grass.element.js';
import { POISON_ELEMENT } from './poison.element.js';
import { STEEL_ELEMENT } from './steel.element.js';
import { GHOST_ELEMENT } from './ghost.element.js';
import { DRAGON_ELEMENT } from './dragon.element.js';
import { FAIRY_ELEMENT } from './fairy.element.js';
import { ELEMENTAL_REACTIONS } from './reactions.config.js';

export * from './types.js';
export * from './icons/index.js';
export { ELEMENTAL_REACTIONS };

export const ALL_15_ELEMENTS: ElementType[] = [
  'PHYSICAL',
  'FIRE',
  'WATER',
  'EARTH',
  'WIND',
  'LIGHTNING',
  'ICE',
  'GRASS',
  'POISON',
  'STEEL',
  'LIGHT',
  'DARK',
  'GHOST',
  'DRAGON',
  'FAIRY'
];

export const SELECTABLE_ELEMENTS: MagicalElementType[] = [
  'FIRE',
  'WATER',
  'EARTH',
  'WIND',
  'LIGHTNING',
  'ICE',
  'LIGHT',
  'DARK',
  'GRASS',
  'POISON',
  'STEEL',
  'GHOST',
  'DRAGON',
  'FAIRY'
];

export const ELEMENT_IMBUE_COST = 40;
export const MAGE_SECOND_ELEMENT_COST = 50;
export const HYBRID_ELEMENT_DMG_RATIO = 0.45;
export const MAGE_SECONDARY_DMG_RATIO = 1.0;

export const ALL_ELEMENT_DEFINITIONS: Record<ElementType, ElementDefinition> = {
  PHYSICAL: PHYSICAL_ELEMENT,
  FIRE: FIRE_ELEMENT,
  WATER: WATER_ELEMENT,
  EARTH: EARTH_ELEMENT,
  WIND: WIND_ELEMENT,
  LIGHTNING: LIGHTNING_ELEMENT,
  ICE: ICE_ELEMENT,
  LIGHT: LIGHT_ELEMENT,
  DARK: DARK_ELEMENT,
  GRASS: GRASS_ELEMENT,
  POISON: POISON_ELEMENT,
  STEEL: STEEL_ELEMENT,
  GHOST: GHOST_ELEMENT,
  DRAGON: DRAGON_ELEMENT,
  FAIRY: FAIRY_ELEMENT
};

// Build standard metadata dictionaries
export const ELEMENT_NAMES: Record<ElementType, string> = {
  PHYSICAL: PHYSICAL_ELEMENT.nameVi,
  FIRE: FIRE_ELEMENT.nameVi,
  WATER: WATER_ELEMENT.nameVi,
  EARTH: EARTH_ELEMENT.nameVi,
  WIND: WIND_ELEMENT.nameVi,
  LIGHTNING: LIGHTNING_ELEMENT.nameVi,
  ICE: ICE_ELEMENT.nameVi,
  LIGHT: LIGHT_ELEMENT.nameVi,
  DARK: DARK_ELEMENT.nameVi,
  GRASS: GRASS_ELEMENT.nameVi,
  POISON: POISON_ELEMENT.nameVi,
  STEEL: STEEL_ELEMENT.nameVi,
  GHOST: GHOST_ELEMENT.nameVi,
  DRAGON: DRAGON_ELEMENT.nameVi,
  FAIRY: FAIRY_ELEMENT.nameVi
};

export const ELEMENT_COLORS: Record<ElementType, string> = {
  PHYSICAL: PHYSICAL_ELEMENT.color,
  FIRE: FIRE_ELEMENT.color,
  WATER: WATER_ELEMENT.color,
  EARTH: EARTH_ELEMENT.color,
  WIND: WIND_ELEMENT.color,
  LIGHTNING: LIGHTNING_ELEMENT.color,
  ICE: ICE_ELEMENT.color,
  LIGHT: LIGHT_ELEMENT.color,
  DARK: DARK_ELEMENT.color,
  GRASS: GRASS_ELEMENT.color,
  POISON: POISON_ELEMENT.color,
  STEEL: STEEL_ELEMENT.color,
  GHOST: GHOST_ELEMENT.color,
  DRAGON: DRAGON_ELEMENT.color,
  FAIRY: FAIRY_ELEMENT.color
};

export const ELEMENT_ICONS: Record<ElementType, string> = {
  PHYSICAL: PHYSICAL_ELEMENT.icon,
  FIRE: FIRE_ELEMENT.icon,
  WATER: WATER_ELEMENT.icon,
  EARTH: EARTH_ELEMENT.icon,
  WIND: WIND_ELEMENT.icon,
  LIGHTNING: LIGHTNING_ELEMENT.icon,
  ICE: ICE_ELEMENT.icon,
  LIGHT: LIGHT_ELEMENT.icon,
  DARK: DARK_ELEMENT.icon,
  GRASS: GRASS_ELEMENT.icon,
  POISON: POISON_ELEMENT.icon,
  STEEL: STEEL_ELEMENT.icon,
  GHOST: GHOST_ELEMENT.icon,
  DRAGON: DRAGON_ELEMENT.icon,
  FAIRY: FAIRY_ELEMENT.icon
};

export const ELEMENT_EFFECT_DESCRIPTIONS: Record<MagicalElementType, { effectName: string; description: string }> = {
  FIRE: { effectName: FIRE_ELEMENT.effectName, description: FIRE_ELEMENT.effectDescription },
  WATER: { effectName: WATER_ELEMENT.effectName, description: WATER_ELEMENT.effectDescription },
  EARTH: { effectName: EARTH_ELEMENT.effectName, description: EARTH_ELEMENT.effectDescription },
  WIND: { effectName: WIND_ELEMENT.effectName, description: WIND_ELEMENT.effectDescription },
  LIGHTNING: { effectName: LIGHTNING_ELEMENT.effectName, description: LIGHTNING_ELEMENT.effectDescription },
  ICE: { effectName: ICE_ELEMENT.effectName, description: ICE_ELEMENT.effectDescription },
  LIGHT: { effectName: LIGHT_ELEMENT.effectName, description: LIGHT_ELEMENT.effectDescription },
  DARK: { effectName: DARK_ELEMENT.effectName, description: DARK_ELEMENT.effectDescription },
  GRASS: { effectName: GRASS_ELEMENT.effectName, description: GRASS_ELEMENT.effectDescription },
  POISON: { effectName: POISON_ELEMENT.effectName, description: POISON_ELEMENT.effectDescription },
  STEEL: { effectName: STEEL_ELEMENT.effectName, description: STEEL_ELEMENT.effectDescription },
  GHOST: { effectName: GHOST_ELEMENT.effectName, description: GHOST_ELEMENT.effectDescription },
  DRAGON: { effectName: DRAGON_ELEMENT.effectName, description: DRAGON_ELEMENT.effectDescription },
  FAIRY: { effectName: FAIRY_ELEMENT.effectName, description: FAIRY_ELEMENT.effectDescription }
};

// Build ELEMENTAL_MATCHUPS table
export const ELEMENTAL_MATCHUPS: Partial<Record<ElementType, Partial<Record<ElementType, number>>>> = {};

for (const elemKey of ALL_15_ELEMENTS) {
  const def = ALL_ELEMENT_DEFINITIONS[elemKey];
  if (def.offensiveMatchups.length > 0) {
    const map: Partial<Record<ElementType, number>> = {};
    for (const match of def.offensiveMatchups) {
      map[match.element] = match.mult;
    }
    ELEMENTAL_MATCHUPS[elemKey] = map;
  }
}

// Build ELEMENT_CODEX_DETAILS for backwards compatibility
export interface ElementCodexData {
  element: ElementType;
  nameVi: string;
  badge: string;
  nature: string;
  statusEffectName: string;
  statusEffectDesc: string;
  buildingEffects: {
    barracks: string;
    archer: string;
    mage: string;
    artillery: string;
  };
  combos: Array<{ partner: ElementType; reaction: string; desc: string }>;
  strongAgainst: Array<{ element: ElementType; mult: number; note: string }>;
  weakAgainstAttack: Array<{ element: ElementType; mult: number; note: string }>;
  weakAgainstDefense: Array<{ element: ElementType; mult: number; note: string }>;
  sampleMonsters: string[];
}

export const STATUS_TO_ELEMENT: Record<string, ElementType> = {
  BURN: 'FIRE',
  WET: 'WATER',
  SLOW: 'EARTH',
  KNOCKBACK: 'WIND',
  SHOCK: 'LIGHTNING',
  FREEZE: 'ICE',
  ROOT: 'GRASS',
  POISON: 'POISON',
  SUNDER: 'STEEL',
  SOUL_DRAIN: 'GHOST',
  DRAGON_AWE: 'DRAGON',
  CHARM: 'FAIRY',
  CURSE: 'DARK'
};

export const ELEMENT_CODEX_DETAILS: Record<ElementType, ElementCodexData> = {} as any;

for (const elemKey of ALL_15_ELEMENTS) {
  const def = ALL_ELEMENT_DEFINITIONS[elemKey];
  const strongAgainst: Array<{ element: ElementType; mult: number; note: string }> = [];
  const weakAgainstAttack: Array<{ element: ElementType; mult: number; note: string }> = [];
  const weakAgainstDefense: Array<{ element: ElementType; mult: number; note: string }> = [];

  for (const match of def.offensiveMatchups) {
    if (match.mult > 1.0) {
      strongAgainst.push(match);
    } else if (match.mult < 1.0) {
      weakAgainstAttack.push(match);
    }
  }

  // Cross reference defense
  for (const attackerKey of ALL_15_ELEMENTS) {
    const atkDef = ALL_ELEMENT_DEFINITIONS[attackerKey];
    const incomingMatch = atkDef.offensiveMatchups.find((m) => m.element === elemKey);
    if (incomingMatch && incomingMatch.mult > 1.0) {
      weakAgainstDefense.push({
        element: attackerKey,
        mult: incomingMatch.mult,
        note: def.defensiveNotes?.[attackerKey] || incomingMatch.note
      });
    }
  }

  // Combos
  const combos: Array<{ partner: ElementType; reaction: string; desc: string }> = [];
  for (const r of ELEMENTAL_REACTIONS) {
    const reqElem = STATUS_TO_ELEMENT[r.requiredStatus];
    if (reqElem === elemKey) {
      combos.push({
        partner: r.triggerElement,
        reaction: r.name,
        desc: r.description
      });
    } else if (r.triggerElement === elemKey && reqElem) {
      combos.push({
        partner: reqElem,
        reaction: r.name,
        desc: r.description
      });
    }
  }

  ELEMENT_CODEX_DETAILS[elemKey] = {
    element: elemKey,
    nameVi: def.nameVi,
    badge: def.badge,
    nature: def.nature,
    statusEffectName: def.statusEffectName,
    statusEffectDesc: def.statusEffectDesc,
    buildingEffects: def.buildingEffects,
    combos,
    strongAgainst,
    weakAgainstAttack,
    weakAgainstDefense,
    sampleMonsters: def.sampleMonsters
  };
}

// ==========================================
// LOOKUP TABLE GENERATORS
// ==========================================

/**
 * 1. BẢNG GÂY SÁT THƯƠNG (Offensive Lookup Table)
 * Khi hệ `attacker` tấn công tất cả 15 hệ khác
 */
export function getElementOffensiveTable(attacker: ElementType): OffensiveLookupRow[] {
  const def = ALL_ELEMENT_DEFINITIONS[attacker];
  const rows: OffensiveLookupRow[] = [];

  for (const target of ALL_15_ELEMENTS) {
    const match = def.offensiveMatchups.find((m) => m.element === target);
    let multiplier = match ? match.mult : 1.0;
    let note = match ? match.note : `Gây sát thương cơ bản (100%) lên hệ ${ALL_ELEMENT_DEFINITIONS[target].nameVi}.`;

    const percentage = Math.round(multiplier * 100);
    let category: OffensiveLookupRow['category'] = 'NORMAL';
    let label = 'Chuẩn (100%)';

    if (multiplier >= 1.7) {
      category = 'SUPER_EFFECTIVE';
      label = `Chí Mạng (x${multiplier})`;
    } else if (multiplier > 1.0) {
      category = 'EFFECTIVE';
      label = `Khắc Hệ (x${multiplier})`;
    } else if (multiplier === 0) {
      category = 'IMMUNE';
      label = 'Miễn Nhiễm (0%)';
    } else if (multiplier < 1.0) {
      category = 'RESISTED';
      label = `Bị Kháng (x${multiplier})`;
    }

    rows.push({
      targetElement: target,
      multiplier,
      percentage,
      category,
      label,
      note
    });
  }

  // Sort: Super effective / Effective first, then Normal, then Resisted / Immune
  rows.sort((a, b) => b.multiplier - a.multiplier);
  return rows;
}

/**
 * 2. BẢNG NHẬN SÁT THƯƠNG (Defensive Lookup Table)
 * Khi mục tiêu mang hệ `defender` bị tấn công bởi tất cả 15 hệ khác
 */
export function getElementDefensiveTable(defender: ElementType): DefensiveLookupRow[] {
  const def = ALL_ELEMENT_DEFINITIONS[defender];
  const rows: DefensiveLookupRow[] = [];

  for (const attacker of ALL_15_ELEMENTS) {
    const atkDef = ALL_ELEMENT_DEFINITIONS[attacker];
    const incomingMatch = atkDef.offensiveMatchups.find((m) => m.element === defender);
    let multiplier = incomingMatch ? incomingMatch.mult : 1.0;
    let note = incomingMatch
      ? (def.defensiveNotes?.[attacker] || incomingMatch.note)
      : `Nhận sát thương chuẩn (100%) từ hệ ${atkDef.nameVi}.`;

    const percentage = Math.round(multiplier * 100);
    let category: DefensiveLookupRow['category'] = 'NORMAL';
    let label = 'Chuẩn (100%)';

    if (multiplier >= 1.7) {
      category = 'SUPER_WEAK';
      label = `Khắc Tinh (x${multiplier})`;
    } else if (multiplier > 1.0) {
      category = 'WEAK';
      label = `Điểm Yếu (x${multiplier})`;
    } else if (multiplier === 0) {
      category = 'IMMUNE';
      label = 'Miễn Nhiễm (0%)';
    } else if (multiplier < 1.0) {
      category = 'RESIST';
      label = `Kháng Cự (x${multiplier})`;
    }

    rows.push({
      attackerElement: attacker,
      multiplier,
      percentage,
      category,
      label,
      note
    });
  }

  // Sort: Weaknesses (highest incoming dmg) first
  rows.sort((a, b) => b.multiplier - a.multiplier);
  return rows;
}

/**
 * 3. BẢNG PHỐI HỢP HIỆU ỨNG (Synergy Lookup Table)
 * Tất cả phản ứng nguyên tố mà hệ `elem` tham gia (Cả vai trò Setup và Trigger)
 */
export function getElementSynergyTable(elem: ElementType): SynergyLookupRow[] {
  const rows: SynergyLookupRow[] = [];
  const statusOfElem = ALL_ELEMENT_DEFINITIONS[elem].statusEffectType;

  for (const r of ELEMENTAL_REACTIONS) {
    // Check if elem is the SETUP element (matching its status effect)
    if (statusOfElem && r.requiredStatus === statusOfElem) {
      rows.push({
        partnerElement: r.triggerElement,
        role: 'SETUP',
        reaction: r,
        formulaText: `${ALL_ELEMENT_DEFINITIONS[elem].icon} Trạng Thái [${r.requiredStatus}] + ${ALL_ELEMENT_DEFINITIONS[r.triggerElement].icon} Đòn [${r.triggerElement}]`
      });
    }

    // Check if elem is the TRIGGER element
    if (r.triggerElement === elem) {
      const setupElem = STATUS_TO_ELEMENT[r.requiredStatus] || 'PHYSICAL';
      rows.push({
        partnerElement: setupElem,
        role: 'TRIGGER',
        reaction: r,
        formulaText: `${ALL_ELEMENT_DEFINITIONS[setupElem]?.icon || '✨'} Trạng Thái [${r.requiredStatus}] + ${ALL_ELEMENT_DEFINITIONS[elem].icon} Đòn [${elem}]`
      });
    }
  }

  return rows;
}

/**
 * Tìm kiếm & Lọc danh sách phản ứng nguyên tố
 */
export function searchElementalReactions(
  query: string = '',
  elementFilter: string = 'ALL',
  categoryFilter: string = 'ALL'
): ElementalReaction[] {
  const q = query.trim().toLowerCase();

  return ELEMENTAL_REACTIONS.filter((r) => {
    // 1. Category Filter
    if (categoryFilter !== 'ALL' && r.category !== categoryFilter) {
      return false;
    }

    // 2. Element Filter
    if (elementFilter !== 'ALL') {
      const setupElem = STATUS_TO_ELEMENT[r.requiredStatus];
      if (r.triggerElement !== elementFilter && setupElem !== elementFilter) {
        return false;
      }
    }

    // 3. Search Query
    if (q) {
      const matchName = r.name.toLowerCase().includes(q);
      const matchLabel = r.label.toLowerCase().includes(q);
      const matchDesc = r.description.toLowerCase().includes(q);
      const matchTrigger = r.triggerElement.toLowerCase().includes(q);
      const matchStatus = r.requiredStatus.toLowerCase().includes(q);
      const setupElem = STATUS_TO_ELEMENT[r.requiredStatus];
      const matchSetupName = setupElem ? ALL_ELEMENT_DEFINITIONS[setupElem]?.nameVi.toLowerCase().includes(q) : false;
      const matchTriggerName = ALL_ELEMENT_DEFINITIONS[r.triggerElement]?.nameVi.toLowerCase().includes(q);

      if (
        !matchName &&
        !matchLabel &&
        !matchDesc &&
        !matchTrigger &&
        !matchStatus &&
        !matchSetupName &&
        !matchTriggerName
      ) {
        return false;
      }
    }

    return true;
  });
}
