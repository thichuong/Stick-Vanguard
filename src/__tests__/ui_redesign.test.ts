import { describe, it, expect } from 'vitest';
import { WaveSystem } from '../systems/WaveSystem.js';
import { MAPS_CONFIG } from '../config/map.config.js';
import { MapSelectionModal } from '../ui/modals/MapSelectionModal.js';
import { ENEMY_BLUEPRINTS } from '../config/enemies.config.js';

describe('UI Redesign Integration Tests', () => {
  it('should verify all maps produce valid mini-map SVG and wave configs for the stage info view', () => {
    for (const map of MAPS_CONFIG) {
      const svg = MapSelectionModal.generateMiniMapSvg(map);
      expect(svg).toContain('<svg');
      expect(svg).toContain('class="mini-map-svg"');

      const waveSys = new WaveSystem(map, 15);
      expect(waveSys.getTotalWaves()).toBe(15);

      for (let w = 0; w < 15; w++) {
        const wave = waveSys.generateWaveConfig(w, 15);
        expect(wave.waveNumber).toBe(w + 1);
        expect(wave.enemies.length).toBeGreaterThan(0);

        for (const enemyEntry of wave.enemies) {
          expect(ENEMY_BLUEPRINTS[enemyEntry.typeId]).toBeDefined();
          expect(enemyEntry.count).toBeGreaterThan(0);
        }
      }
    }
  });

  it('should scale HP buff correctly after wave 10 for stage info display', () => {
    const waveSys = new WaveSystem(MAPS_CONFIG[0], 25);
    expect(waveSys.getWaveHpMultiplier(0)).toBe(1.0);
    expect(waveSys.getWaveHpMultiplier(9)).toBe(1.0);
    expect(waveSys.getWaveHpMultiplier(10)).toBe(1.1); // Wave 11 (+10%)
    expect(waveSys.getWaveHpMultiplier(14)).toBe(1.5); // Wave 15 (+50%)
    expect(waveSys.getWaveHpMultiplier(19)).toBe(2.0); // Wave 20 (+100%)
  });
});
