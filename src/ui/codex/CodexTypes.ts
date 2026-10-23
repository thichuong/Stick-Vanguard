import { ElementType, StatusEffectType } from '../../types/elements.types.js';

export const STATUS_TO_ELEMENT: Record<StatusEffectType, ElementType> = {
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

