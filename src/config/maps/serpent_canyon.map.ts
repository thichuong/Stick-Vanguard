import { MapConfig, WaveConfig } from '../map.config.js';

export const WAVES_SERPENT_CANYON: WaveConfig[] = [
  // Wave 1-3: WALK
  {
    waveNumber: 1,
    name: 'Đợt 1: Dân Binh Vách Đá (Đi Bộ)',
    rewardGold: 50,
    enemies: [{ typeId: 'STICK_RUNNER', count: 8, interval: 1.4, delay: 0 }]
  },
  {
    waveNumber: 2,
    name: 'Đợt 2: Tiền Trạm Long Nhân (Đi Bộ)',
    rewardGold: 65,
    enemies: [
      { typeId: 'STICK_RUNNER', count: 6, interval: 1.2, delay: 0 },
      { typeId: 'DRAKE_WARRIOR', count: 3, interval: 2.2, delay: 3 }
    ]
  },
  {
    waveNumber: 3,
    name: 'Đợt 3: Long Nhân & Thạch Nham (Đi Bộ)',
    rewardGold: 80,
    enemies: [
      { typeId: 'DRAKE_WARRIOR', count: 4, interval: 1.8, delay: 0 },
      { typeId: 'ROCK_GOLEM', count: 3, interval: 2.5, delay: 3 }
    ]
  },
  // Wave 4: FLY ONLY
  {
    waveNumber: 4,
    name: 'Đợt 4: Phi Long Xung Kích Đáy Vực (Chỉ Quái Bay)',
    rewardGold: 95,
    enemies: [
      { typeId: 'WYVERN_RAIDER', count: 6, interval: 1.8, delay: 0 }
    ]
  },
  // Wave 5: SWIM ONLY
  {
    waveNumber: 5,
    name: 'Đợt 5: Giao Long Sông Sâu Cuộn Sóng (Chỉ Quái Bơi)',
    rewardGold: 110,
    enemies: [
      { typeId: 'RIVER_DRAKE', count: 5, interval: 2.0, delay: 0 }
    ]
  },
  // Wave 6-10: Mixed
  {
    waveNumber: 6,
    name: 'Đợt 6: Huyết Thạch Hợp Lưu (Bộ & Nước)',
    rewardGold: 125,
    enemies: [
      { typeId: 'DRAKE_WARRIOR', count: 6, interval: 1.6, delay: 0 },
      { typeId: 'RIVER_DRAKE', count: 4, interval: 2.0, delay: 3 }
    ]
  },
  {
    waveNumber: 7,
    name: 'Đợt 7: Long Huyết Không Gian (Bộ & Bay)',
    rewardGold: 140,
    enemies: [
      { typeId: 'DRAKE_WARRIOR', count: 6, interval: 1.5, delay: 0 },
      { typeId: 'WYVERN_RAIDER', count: 6, interval: 1.6, delay: 3 }
    ]
  },
  {
    waveNumber: 8,
    name: 'Đợt 8: Thạch Long Hộ Thân (Bộ, Bay & Nước)',
    rewardGold: 160,
    enemies: [
      { typeId: 'ROCK_GOLEM', count: 4, interval: 2.2, delay: 0 },
      { typeId: 'WYVERN_RAIDER', count: 6, interval: 1.5, delay: 3 },
      { typeId: 'RIVER_DRAKE', count: 5, interval: 1.8, delay: 5 }
    ]
  },
  {
    waveNumber: 9,
    name: 'Đợt 9: Quân Đoàn Long Huyết Cuồng Nộ (Tam Tuyến)',
    rewardGold: 185,
    enemies: [
      { typeId: 'DRAKE_WARRIOR', count: 8, interval: 1.4, delay: 0 },
      { typeId: 'ROCK_GOLEM', count: 4, interval: 2.4, delay: 2 },
      { typeId: 'WYVERN_RAIDER', count: 8, interval: 1.3, delay: 5 },
      { typeId: 'RIVER_DRAKE', count: 6, interval: 1.6, delay: 7 }
    ]
  },
  {
    waveNumber: 10,
    name: 'Đợt 10: Đại Hắc Long Ma Vương Giáng Lâm',
    rewardGold: 340,
    enemies: [
      { typeId: 'DRAKE_WARRIOR', count: 8, interval: 1.4, delay: 0 },
      { typeId: 'ROCK_GOLEM', count: 5, interval: 2.0, delay: 3 },
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
  laneBadges: ['1 Tuyến Bộ 3 Tầng', '1 Thủy Lộ Đáy Vực', 'Đường Dài Tập Kích'],
  tribe: {
    name: 'Tộc Long Huyết Thạch Nham',
    icon: '🐉🪨',
    elements: ['DRAGON', 'EARTH', 'WIND'],
    description: 'Chiến binh Long Nhân Hỏa Nham, Phi Long Cuồng Phong và Giao Long Đáy Vực chực chờ phục kích.'
  }
};

