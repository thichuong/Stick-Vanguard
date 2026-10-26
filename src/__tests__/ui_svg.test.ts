import { describe, it, expect } from 'vitest';
import {
  UI_ICONS,
  ARCHETYPE_SVG_ICONS,
  getUiSvgDataUri,
  drawUiSvgOnCanvas,
  UiIconKey
} from '../config/ui/icons/index.js';

describe('UI SVG Icons Library', () => {
  it('should define all master UI_ICONS as valid SVG strings', () => {
    const keys = Object.keys(UI_ICONS) as UiIconKey[];
    expect(keys.length).toBeGreaterThanOrEqual(75);

    for (const key of keys) {
      const svg = UI_ICONS[key];
      expect(typeof svg).toBe('string');
      expect(svg.trim().startsWith('<svg')).toBe(true);
      expect(svg.trim().endsWith('</svg>')).toBe(true);
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
      expect(svg).toContain('viewBox="0 0 24 24"');
    }
  });

  it('should define all archetype SVG icons properly', () => {
    const archKeys = Object.keys(ARCHETYPE_SVG_ICONS);
    expect(archKeys.length).toBeGreaterThanOrEqual(10);

    for (const key of archKeys) {
      const svg = ARCHETYPE_SVG_ICONS[key];
      expect(typeof svg).toBe('string');
      expect(svg.trim().startsWith('<svg')).toBe(true);
      expect(svg.trim().endsWith('</svg>')).toBe(true);
    }
  });

  it('should generate valid data URI via getUiSvgDataUri', () => {
    const uri = getUiSvgDataUri('SWORDS');
    expect(uri.startsWith('data:image/svg+xml;utf8,')).toBe(true);
    expect(uri).toContain('SWORDS');
  });

  it('should execute drawUiSvgOnCanvas safely on canvas context', () => {
    const drawnImages: any[] = [];
    const mockCtx = {
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      arc: () => {},
      fill: () => {},
      drawImage: (img: any, x: number, y: number, w: number, h: number) => {
        drawnImages.push({ img, x, y, w, h });
      }
    } as unknown as CanvasRenderingContext2D;

    // First call initiates image loading or runs fallback
    drawUiSvgOnCanvas(mockCtx, 'SHIELD', 10, 20, 16, 16);

    // Call with unknown key should fail gracefully without throwing
    expect(() => {
      drawUiSvgOnCanvas(mockCtx, 'UNKNOWN_KEY' as any, 0, 0, 16, 16);
    }).not.toThrow();
  });
});
