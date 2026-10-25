import { describe, it, expect } from 'vitest';
import {
  ALL_15_ELEMENTS,
  ALL_ELEMENT_DEFINITIONS,
  ELEMENT_ICONS
} from '../config/elements/index.js';
import {
  ELEMENT_SVG_MARKUP,
  STATUS_EFFECT_TO_ELEMENT,
  getElementSvgDataUri,
  drawElementSvgOnCanvas
} from '../config/elements/icons/index.js';
import { StatusEffectType } from '../types/elements.types.js';

describe('Element SVG Icons Architecture & Assets Tests', () => {
  it('1. All 15 .svg files are loaded via Vite raw glob with valid SVG content', () => {
    // Eagerly glob all 15 SVG files from src/config/elements/icons/
    const svgFiles = (import.meta as any).glob('../config/elements/icons/*.svg', {
      query: '?raw',
      import: 'default',
      eager: true
    }) as Record<string, string>;

    const fileKeys = Object.keys(svgFiles);
    expect(fileKeys.length).toBe(15);

    const expectedElements = [
      'physical',
      'fire',
      'water',
      'earth',
      'wind',
      'lightning',
      'ice',
      'grass',
      'poison',
      'steel',
      'light',
      'dark',
      'ghost',
      'dragon',
      'fairy'
    ];

    for (const elemName of expectedElements) {
      const matchKey = fileKeys.find((k) => k.endsWith(`/${elemName}.svg`));
      expect(matchKey, `File ${elemName}.svg must exist in icons/`).toBeDefined();

      const content = svgFiles[matchKey!];
      expect(content).toContain('<svg');
      expect(content).toContain('viewBox="0 0 24 24"');
      expect(content).toContain('</svg>');
      expect(content.length).toBeGreaterThan(100);
    }
  });

  it('2. ALL_ELEMENT_DEFINITIONS & ELEMENT_ICONS provide clean inline SVG for all 15 elements', () => {
    expect(ALL_15_ELEMENTS).toHaveLength(15);

    for (const elem of ALL_15_ELEMENTS) {
      const def = ALL_ELEMENT_DEFINITIONS[elem];
      expect(def).toBeDefined();
      expect(def.icon).toContain('<svg');
      expect(def.icon).toContain('class="elem-svg-icon"');
      expect(def.icon).toContain('viewBox="0 0 24 24"');
      expect(def.icon).toContain('</svg>');

      const iconFromMap = ELEMENT_ICONS[elem];
      expect(iconFromMap).toBe(def.icon);

      const rawMarkup = ELEMENT_SVG_MARKUP[elem];
      expect(rawMarkup).toBeDefined();
      expect(rawMarkup).toBe(def.icon);
    }
  });

  it('3. getElementSvgDataUri returns valid SVG Data URI for all 15 elements', () => {
    for (const elem of ALL_15_ELEMENTS) {
      const uri = getElementSvgDataUri(elem);
      expect(uri).toContain('data:image/svg+xml;utf8,');
      expect(uri).toContain('%3Csvg');
    }
  });

  it('4. STATUS_EFFECT_TO_ELEMENT maps all 13 status effects to valid elements', () => {
    const statusEffects: StatusEffectType[] = [
      'BURN',
      'WET',
      'SLOW',
      'KNOCKBACK',
      'SHOCK',
      'FREEZE',
      'ROOT',
      'POISON',
      'SUNDER',
      'SOUL_DRAIN',
      'DRAGON_AWE',
      'CHARM',
      'CURSE'
    ];

    for (const eff of statusEffects) {
      const mappedElem = STATUS_EFFECT_TO_ELEMENT[eff];
      expect(mappedElem).toBeDefined();
      expect(ALL_15_ELEMENTS).toContain(mappedElem);
    }
  });

  it('5. drawElementSvgOnCanvas executes safely without errors on 2D context', () => {
    const mockCtx = {
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      arc: () => {},
      fill: () => {},
      stroke: () => {},
      drawImage: () => {},
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1
    } as unknown as CanvasRenderingContext2D;

    for (const elem of ALL_15_ELEMENTS) {
      expect(() => {
        drawElementSvgOnCanvas(mockCtx, elem, 10, 20, 14);
      }).not.toThrow();
    }
  });
});
