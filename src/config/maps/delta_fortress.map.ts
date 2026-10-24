import { MapConfig, WaveConfig } from '../map.config.js';

export const WAVES_DELTA_FORTRESS: WaveConfig[] = [
  // Wave 1-3: WALK ONLY
  {
    waveNumber: 1,
    name: 'Đợt 1: Dân Binh Ven Kênh (Đi Bộ)',
    rewardGold: 50,
    enemies: [{ typeId: 'STICK_RUNNER', count: 8, interval: 1.4, delay: 0 }]
  },
  {
    waveNumber: 2,
    name: 'Đợt 2: Quân Tiên Phong Thép (Đi Bộ)',
    rewardGold: 65,
    enemies: [
      { typeId: 'STICK_RUNNER', count: 6, interval: 1.2, delay: 0 },
      { typeId: 'STEEL_VANGUARD', count: 3, interval: 2.0, delay: 3 }
    ]
  },
  {
    waveNumber: 3,
    name: 'Đợt 3: Thiết Giáp Vượt Cầu (Đi Bộ)',
    rewardGold: 80,
    enemies: [
      { typeId: 'STICK_WARRIOR', count: 5, interval: 1.6, delay: 0 },
      { typeId: 'STEEL_VANGUARD', count: 4, interval: 2.0, delay: 3 }
    ]
  },
  // Wave 4: FLY ONLY
  {
    waveNumber: 4,
    name: 'Đợt 4: Phi Đội Sấm Sét Không Gian (Chỉ Quái Bay)',
    rewardGold: 95,
    enemies: [
      { typeId: 'WINGED_GARGOYLE', count: 7, interval: 1.8, delay: 0 }
    ]
  },
  // Wave 5: SWIM ONLY
  {
    waveNumber: 5,
    name: 'Đợt 5: Hải Tộc Cuộn Trào (Chỉ Quái Bơi)',
    rewardGold: 110,
    enemies: [
      { typeId: 'AQUA_SERPENT', count: 6, interval: 1.8, delay: 0 }
    ]
  },
  // Wave 6-10: Mixed
  {
    waveNumber: 6,
    name: 'Đợt 6: Hợp Lưu Áp Thành (Bộ & Nước)',
    rewardGold: 125,
    enemies: [
      { typeId: 'STEEL_VANGUARD', count: 6, interval: 1.5, delay: 0 },
      { typeId: 'AQUA_SERPENT', count: 6, interval: 1.7, delay: 3 }
    ]
  },
  {
    waveNumber: 7,
    name: 'Đợt 7: Bão Tố Biển Khơi (Bộ & Bay)',
    rewardGold: 140,
    enemies: [
      { typeId: 'STEEL_VANGUARD', count: 7, interval: 1.4, delay: 0 },
      { typeId: 'WINGED_GARGOYLE', count: 7, interval: 1.5, delay: 3 }
    ]
  },
  {
    waveNumber: 8,
    name: 'Đợt 8: Tiên Cá Gọi Bão Đột Kích (Bộ, Bay & Nước)',
    rewardGold: 165,
    enemies: [
      { typeId: 'STORM_CALLER_SIREN', count: 3, interval: 2.2, delay: 0 },
      { typeId: 'STEEL_VANGUARD', count: 5, interval: 1.6, delay: 2 },
      { typeId: 'WINGED_GARGOYLE', count: 6, interval: 1.5, delay: 4 }
    ]
  },
  {
    waveNumber: 9,
    name: 'Đợt 9: Hải Thần Đại Triều Hợp Lực (Tam Tuyến)',
    rewardGold: 190,
    enemies: [
      { typeId: 'STEEL_VANGUARD', count: 8, interval: 1.3, delay: 0 },
      { typeId: 'STORM_CALLER_SIREN', count: 5, interval: 1.8, delay: 2 },
      { typeId: 'WINGED_GARGOYLE', count: 8, interval: 1.3, delay: 5 },
      { typeId: 'AQUA_SERPENT', count: 7, interval: 1.5, delay: 7 }
    ]
  },
  {
    waveNumber: 10,
    name: 'Đợt 10: Trùm Hải Vương Cuồng Lôi Đại Náo (Tam Tuyến)',
    rewardGold: 360,
    enemies: [
      { typeId: 'STORM_CALLER_SIREN', count: 4, interval: 2.0, delay: 0 },
      { typeId: 'STEEL_VANGUARD', count: 8, interval: 1.3, delay: 3 },
      { typeId: 'TEMPEST_LEVIATHAN_BOSS', count: 1, interval: 1.0, delay: 8 }
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
  laneBadges: ['1 Tuyến Bộ Tây Nam', '1 Thủy Lộ Tây Bắc', 'Song Tuyến Hợp Lưu'],
  tribe: {
    name: 'Tộc Hải Thần Bão Tố',
    icon: '💧⚡',
    elements: ['WATER', 'LIGHTNING', 'STEEL'],
    description: 'Thủy quái Tiên Cá Gọi Bão, Lôi Điện Thủy Xà cùng đạo quân Chiến Binh Thiết Giáp tràn vào cửa biển.'
  }
};

