import { MapConfig, WaveConfig } from '../map.config.js';
import { WAVES_TWIN_CROSSROADS } from './twin_crossroads.map.js';

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
  {
    waveNumber: 11,
    name: 'Đợt 11: Mãng Xà Trườn Hẻm (Bộ & Nước)',
    rewardGold: 195,
    enemies: [
      { typeId: 'AQUA_SERPENT', count: 10, interval: 1.3, delay: 0 },
      { typeId: 'STICK_RUNNER', count: 15, interval: 0.7, delay: 2 }
    ]
  },
  {
    waveNumber: 12,
    name: 'Đợt 12: Không Kích Hẻm Núi (Bay & Bộ)',
    rewardGold: 210,
    enemies: [
      { typeId: 'WINGED_GARGOYLE', count: 10, interval: 1.4, delay: 0 },
      { typeId: 'SHADOW_WRAITH', count: 7, interval: 1.6, delay: 3 }
    ]
  },
  {
    waveNumber: 13,
    name: 'Đợt 13: Bão Lửa Vách Đá (Tam Tuyến)',
    rewardGold: 230,
    enemies: [
      { typeId: 'FIRE_IMP', count: 14, interval: 0.8, delay: 0 },
      { typeId: 'ROCK_GOLEM', count: 5, interval: 2.2, delay: 3 },
      { typeId: 'AQUA_SERPENT', count: 7, interval: 1.5, delay: 6 }
    ]
  },
  {
    waveNumber: 14,
    name: 'Đợt 14: Ác Mộng Trùng Điệp (Tam Tuyến)',
    rewardGold: 260,
    enemies: [
      { typeId: 'SHADOW_WRAITH', count: 8, interval: 1.4, delay: 0 },
      { typeId: 'WINGED_GARGOYLE', count: 8, interval: 1.3, delay: 2 },
      { typeId: 'ROCK_GOLEM', count: 6, interval: 2.0, delay: 5 }
    ]
  },
  {
    waveNumber: 15,
    name: 'Đợt 15: Quyết Chiến Đỉnh Hẻm - Song Quái Vương',
    rewardGold: 450,
    enemies: [
      { typeId: 'STICK_WARRIOR', count: 12, interval: 0.9, delay: 0 },
      { typeId: 'ROCK_GOLEM', count: 6, interval: 2.0, delay: 3 },
      { typeId: 'DARK_DRAGON_BOSS', count: 1, interval: 1.0, delay: 8 }
    ]
  }
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

