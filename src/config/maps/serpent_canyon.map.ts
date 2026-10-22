import { MapConfig, WaveConfig } from '../map.config.js';
import { WAVES_TWIN_CROSSROADS } from './twin_crossroads.map.js';
import { WAVES_EXTENDED_POST_10 } from './waves_extended.js';

export const WAVES_SERPENT_CANYON: WaveConfig[] = [
  ...WAVES_TWIN_CROSSROADS.slice(0, 9), // Wave 1-3: WALK, Wave 4: FLY, Wave 5: SWIM, Wave 6-9: Mixed
  {
    waveNumber: 10,
    name: 'Đợt 10: Tiền Trạm Trùm - Khổng Lồ Nham Thạch',
    rewardGold: 180,
    enemies: [
      { typeId: 'ROCK_GOLEM', count: 6, interval: 2.0, delay: 0 },
      { typeId: 'FIRE_IMP', count: 12, interval: 0.8, delay: 3 },
      { typeId: 'WINGED_GARGOYLE', count: 4, interval: 2.0, delay: 5 }
    ]
  },
  ...WAVES_EXTENDED_POST_10
];

export const MAP_SERPENT_CANYON: MapConfig = {
  id: 'serpent_canyon',
  name: 'Hẻm Núi Mãng Xà',
  subtitle: 'Địa hình zíc-zắc 3 tầng',
  description: 'Đường bộ khúc khuỷu kéo dài cho phép đặt tháp tập trung hỏa lực tối đa.',
  themeColor: '#1c1917',
  roadColor: '#a16207',
  riverColor: '#0ea5e9',
  width: 1000,
  height: 650,
  roadWidth: 40,
  riverWidth: 36,
  groundWaypoints: [
    { x: 40, y: 120 },
    { x: 860, y: 120 },
    { x: 860, y: 300 },
    { x: 160, y: 300 },
    { x: 160, y: 500 },
    { x: 860, y: 500 },
    { x: 920, y: 500 }
  ],
  waterWaypoints: [
    { x: 0, y: 300 },
    { x: 120, y: 400 },
    { x: 340, y: 400 },
    { x: 560, y: 400 },
    { x: 740, y: 400 },
    { x: 880, y: 420 },
    { x: 920, y: 500 }
  ],
  airStart: { x: 40, y: 50 },
  airWaypoints: [
    { x: 40, y: 50 },
    { x: 450, y: 240 },
    { x: 750, y: 380 },
    { x: 920, y: 500 }
  ],
  playerBase: { x: 920, y: 500, radius: 45 },
  groundSpawn: { x: 40, y: 120 },
  waterSpawn: { x: 0, y: 300 },
  towerSlots: [],
  waves: WAVES_SERPENT_CANYON,
  laneBadges: ['1 Tuyến Bộ 3 Tầng', '1 Thủy Lộ Đáy Vực', 'Đường Dài Tập Kích']
};

