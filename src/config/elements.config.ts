import { ElementType } from '../types/elements.types.js';

export const ELEMENT_COLORS: Record<ElementType, string> = {
  PHYSICAL: '#e2e8f0', // Silver / White
  FIRE: '#ef4444',     // Crimson Red
  WATER: '#3b82f6',    // Ocean Blue
  EARTH: '#d97706',    // Amber / Earth Brown
  WIND: '#10b981',     // Emerald Green
  LIGHTNING: '#f59e0b',// Bright Electric Yellow
  ICE: '#06b6d4',      // Cyan Frost
  LIGHT: '#fef08a',    // Radiant Golden Light
  DARK: '#8b5cf6'      // Void Purple
};

export const ELEMENT_ICONS: Record<ElementType, string> = {
  PHYSICAL: '⚔️',
  FIRE: '🔥',
  WATER: '💧',
  EARTH: '🪨',
  WIND: '🌪️',
  LIGHTNING: '⚡',
  ICE: '❄️',
  LIGHT: '✨',
  DARK: '🔮'
};

/**
 * Base element matchup multipliers:
 * attackerElement -> targetPrimaryElement -> multiplier
 */
export const ELEMENTAL_MATCHUPS: Partial<Record<ElementType, Partial<Record<ElementType, number>>>> = {
  FIRE: {
    ICE: 1.75,
    WIND: 1.3,
    FIRE: 0.3,
    WATER: 0.5
  },
  WATER: {
    FIRE: 2.0,
    EARTH: 1.5,
    WATER: 0.3,
    LIGHTNING: 0.5
  },
  EARTH: {
    LIGHTNING: 1.5,
    WIND: 1.25,
    EARTH: 0.5
  },
  WIND: {
    EARTH: 1.5,
    PHYSICAL: 1.2
  },
  LIGHTNING: {
    WATER: 2.0,
    WIND: 1.5,
    EARTH: 0.3,
    LIGHTNING: 0.3
  },
  ICE: {
    WATER: 1.5,
    FIRE: 0.5,
    ICE: 0.2
  },
  LIGHT: {
    DARK: 2.0,
    LIGHT: 0.3
  },
  DARK: {
    LIGHT: 1.8,
    DARK: 0.3
  },
  PHYSICAL: {
    EARTH: 0.7
  }
};

