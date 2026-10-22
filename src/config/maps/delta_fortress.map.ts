import { MapConfig, WaveConfig } from '../map.config.js';
import { WAVES_SERPENT_CANYON } from './serpent_canyon.map.js';
import { WAVES_EXTENDED_POST_10 } from './waves_extended.js';

export const WAVES_DELTA_FORTRESS: WaveConfig[] = [
  ...WAVES_SERPENT_CANYON.slice(0, 10), // Wave 1-3: WALK, Wave 4: FLY, Wave 5: SWIM, Wave 6-10: Mixed
  ...WAVES_EXTENDED_POST_10
];

export const MAP_DELTA_FORTRESS: MapConfig = {
  id: 'delta_fortress',
  name: 'Pháo Đài Đồng Bằng',
  subtitle: 'Song tuyến hợp lưu về thành',
  description: 'Đường bộ từ Tây Nam và thủy lộ từ Tây Bắc hợp lưu áp sát thành trì phía Đông.',
  themeColor: '#0f172a',
  roadColor: '#b45309',
  riverColor: '#0284c7',
  width: 1000,
  height: 650,
  roadWidth: 42,
  riverWidth: 40,
  groundWaypoints: [
    { x: 40, y: 520 },
    { x: 260, y: 520 },
    { x: 400, y: 420 },
    { x: 580, y: 420 },
    { x: 720, y: 340 },
    { x: 900, y: 340 }
  ],
  waterWaypoints: [
    { x: 40, y: 120 },
    { x: 280, y: 120 },
    { x: 420, y: 240 },
    { x: 600, y: 240 },
    { x: 720, y: 340 },
    { x: 900, y: 340 }
  ],
  airStart: { x: 40, y: 300 },
  airWaypoints: [
    { x: 40, y: 300 },
    { x: 450, y: 300 },
    { x: 900, y: 340 }
  ],
  playerBase: { x: 900, y: 340, radius: 45 },
  groundSpawn: { x: 40, y: 520 },
  waterSpawn: { x: 40, y: 120 },
  towerSlots: [],
  waves: WAVES_DELTA_FORTRESS,
  laneBadges: ['1 Tuyến Bộ Tây Nam', '1 Thủy Lộ Tây Bắc', 'Song Tuyến Hợp Lưu']
};

