import { MapConfig, WaveConfig } from '../map.config.js';
import { WAVES_VALLEY_ORIGIN } from './valley_origin.map.js';
import { WAVES_EXTENDED_POST_10 } from './waves_extended.js';

export const WAVES_TWIN_CROSSROADS: WaveConfig[] = [
  ...WAVES_VALLEY_ORIGIN.slice(0, 5), // Wave 1-3: WALK, Wave 4: FLY, Wave 5: SWIM
  {
    waveNumber: 6,
    name: 'Đợt 6: Xung Đột Thủy Lục (Bộ & Nước)',
    rewardGold: 110,
    enemies: [
      { typeId: 'STICK_WARRIOR', count: 6, interval: 1.5, delay: 0 },
      { typeId: 'AQUA_SERPENT', count: 6, interval: 1.8, delay: 3 }
    ]
  },
  {
    waveNumber: 7,
    name: 'Đợt 7: Bão Tố Song Hành (Bộ & Bay)',
    rewardGold: 120,
    enemies: [
      { typeId: 'FIRE_IMP', count: 8, interval: 1.0, delay: 0 },
      { typeId: 'WINGED_GARGOYLE', count: 6, interval: 1.8, delay: 4 }
    ]
  },
  {
    waveNumber: 8,
    name: 'Đợt 8: Thiết Giáp Thạch Nham (Bộ & Bay)',
    rewardGold: 135,
    enemies: [
      { typeId: 'ROCK_GOLEM', count: 5, interval: 2.6, delay: 0 },
      { typeId: 'WINGED_GARGOYLE', count: 5, interval: 1.8, delay: 2 }
    ]
  },
  {
    waveNumber: 9,
    name: 'Đợt 9: Thủy Quái Đột Kích (Nước & Bộ)',
    rewardGold: 150,
    enemies: [
      { typeId: 'AQUA_SERPENT', count: 8, interval: 1.5, delay: 0 },
      { typeId: 'SHADOW_WRAITH', count: 5, interval: 2.0, delay: 4 }
    ]
  },
  {
    waveNumber: 10,
    name: 'Đợt 10: Tinh Nhuệ Hắc Ám (Tam Tuyến)',
    rewardGold: 170,
    enemies: [
      { typeId: 'SHADOW_WRAITH', count: 7, interval: 1.5, delay: 0 },
      { typeId: 'ROCK_GOLEM', count: 4, interval: 2.2, delay: 3 },
      { typeId: 'WINGED_GARGOYLE', count: 7, interval: 1.6, delay: 6 }
    ]
  },
  ...WAVES_EXTENDED_POST_10
];

export const MAP_TWIN_CROSSROADS: MapConfig = {
  id: 'twin_crossroads',
  name: 'Giao Lộ Sinh Tử',
  subtitle: 'Đường bộ & Thủy lộ giao cắt',
  description: 'Dòng sông chảy dọc từ Bắc xuống Nam cắt ngang đường tiến quân tại cầu trung tâm.',
  themeColor: '#172554',
  roadColor: '#b45309',
  riverColor: '#0369a1',
  width: 1000,
  height: 650,
  roadWidth: 42,
  riverWidth: 40,
  groundWaypoints: [
    { x: 40, y: 320 },
    { x: 180, y: 320 },
    { x: 260, y: 160 },
    { x: 440, y: 160 },
    { x: 500, y: 325 },
    { x: 560, y: 480 },
    { x: 740, y: 480 },
    { x: 820, y: 320 },
    { x: 920, y: 320 }
  ],
  waterWaypoints: [
    { x: 500, y: 0 },
    { x: 500, y: 200 },
    { x: 500, y: 325 },
    { x: 520, y: 460 },
    { x: 680, y: 560 },
    { x: 850, y: 450 },
    { x: 920, y: 320 }
  ],
  airStart: { x: 40, y: 100 },
  airWaypoints: [
    { x: 40, y: 100 },
    { x: 350, y: 220 },
    { x: 650, y: 220 },
    { x: 920, y: 320 }
  ],
  playerBase: { x: 920, y: 320, radius: 45 },
  groundSpawn: { x: 40, y: 320 },
  waterSpawn: { x: 500, y: 0 },
  towerSlots: [],
  waves: WAVES_TWIN_CROSSROADS,
  laneBadges: ['1 Tuyến Bộ Cắt Sông', '1 Thủy Lộ Xuyên Tâm', 'Giao Điểm Cầu']
};

