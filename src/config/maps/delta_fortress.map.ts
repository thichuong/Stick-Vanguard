import { MapConfig, WaveConfig } from '../map.config.js';
import { WAVES_SERPENT_CANYON } from './serpent_canyon.map.js';

export const WAVES_DELTA_FORTRESS: WaveConfig[] = [
  ...WAVES_SERPENT_CANYON.slice(0, 14), // Wave 1-3: WALK, Wave 4: FLY, Wave 5: SWIM, Wave 6+: Mixed
  {
    waveNumber: 15,
    name: 'Đợt 15: Đại Trận Chiến Giữa Kỳ (Bay & Bộ)',
    rewardGold: 270,
    enemies: [
      { typeId: 'DARK_DRAGON_BOSS', count: 1, interval: 1.0, delay: 0 },
      { typeId: 'STICK_WARRIOR', count: 10, interval: 1.0, delay: 4 }
    ]
  },
  {
    waveNumber: 16,
    name: 'Đợt 16: Thủy Hỏa Tương Tàn (Bộ & Nước)',
    rewardGold: 280,
    enemies: [
      { typeId: 'FIRE_IMP', count: 15, interval: 0.7, delay: 0 },
      { typeId: 'AQUA_SERPENT', count: 12, interval: 1.2, delay: 2 }
    ]
  },
  {
    waveNumber: 17,
    name: 'Đợt 17: Quân Đoàn Hư Vô Tối Thượng (Tam Tuyến)',
    rewardGold: 300,
    enemies: [
      { typeId: 'SHADOW_WRAITH', count: 10, interval: 1.2, delay: 0 },
      { typeId: 'WINGED_GARGOYLE', count: 10, interval: 1.2, delay: 2 },
      { typeId: 'ROCK_GOLEM', count: 6, interval: 2.0, delay: 5 }
    ]
  },
  {
    waveNumber: 18,
    name: 'Đợt 18: Công Thành Khổng Lồ (Bộ & Nước)',
    rewardGold: 320,
    enemies: [
      { typeId: 'ROCK_GOLEM', count: 8, interval: 1.8, delay: 0 },
      { typeId: 'STICK_RUNNER', count: 20, interval: 0.6, delay: 2 },
      { typeId: 'AQUA_SERPENT', count: 10, interval: 1.2, delay: 5 }
    ]
  },
  {
    waveNumber: 19,
    name: 'Đợt 19: Cuộc Đổ Bộ Tận Diệt (Tam Tuyến)',
    rewardGold: 360,
    enemies: [
      { typeId: 'STICK_WARRIOR', count: 15, interval: 0.8, delay: 0 },
      { typeId: 'SHADOW_WRAITH', count: 10, interval: 1.1, delay: 3 },
      { typeId: 'WINGED_GARGOYLE', count: 12, interval: 1.0, delay: 5 },
      { typeId: 'FIRE_IMP', count: 15, interval: 0.7, delay: 7 }
    ]
  },
  {
    waveNumber: 20,
    name: 'Đợt 20: Chung Cuộc Đại Thắng - Đại Hắc Long Tái Sinh',
    rewardGold: 600,
    enemies: [
      { typeId: 'ROCK_GOLEM', count: 8, interval: 1.8, delay: 0 },
      { typeId: 'SHADOW_WRAITH', count: 8, interval: 1.3, delay: 3 },
      { typeId: 'AQUA_SERPENT', count: 10, interval: 1.2, delay: 5 },
      { typeId: 'DARK_DRAGON_BOSS', count: 1, interval: 1.0, delay: 8 }
    ]
  }
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

