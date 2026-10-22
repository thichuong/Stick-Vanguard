import { MapConfig, WaveConfig } from '../map.config.js';
import { WAVES_EXTENDED_POST_10 } from './waves_extended.js';

export const WAVES_ANCIENT_NECROPOLIS: WaveConfig[] = [
  {
    waveNumber: 1,
    name: 'Đợt 1: Khô Cốt Trỗi Dậy (Đi Bộ)',
    rewardGold: 55,
    enemies: [{ typeId: 'STICK_RUNNER', count: 12, interval: 1.2, delay: 0 }]
  },
  {
    waveNumber: 2,
    name: 'Đợt 2: Chiến Binh U Hồn (Đi Bộ)',
    rewardGold: 70,
    enemies: [
      { typeId: 'STICK_RUNNER', count: 8, interval: 1.1, delay: 0 },
      { typeId: 'STICK_WARRIOR', count: 6, interval: 1.6, delay: 3 }
    ]
  },
  {
    waveNumber: 3,
    name: 'Đợt 3: Hồn Ma & Pháp Sư Chiêu Hồn (Đi Bộ)',
    rewardGold: 90,
    enemies: [
      { typeId: 'SHADOW_WRAITH', count: 5, interval: 2.0, delay: 0 },
      { typeId: 'NECRO_WARLOCK', count: 2, interval: 3.0, delay: 4 }
    ]
  },
  {
    waveNumber: 4,
    name: 'Đợt 4: Que Dơi Ma Ám (Chỉ Quái Bay)',
    rewardGold: 105,
    enemies: [
      { typeId: 'WINGED_GARGOYLE', count: 8, interval: 1.6, delay: 0 }
    ]
  },
  {
    waveNumber: 5,
    name: 'Đợt 5: Thủy Xà Kênh Ma Thuật (Chỉ Quái Bơi)',
    rewardGold: 120,
    enemies: [
      { typeId: 'AQUA_SERPENT', count: 8, interval: 1.8, delay: 0 }
    ]
  },
  {
    waveNumber: 6,
    name: 'Đợt 6: Huyết Chiến Tam Lộ (Bộ & Nước)',
    rewardGold: 140,
    enemies: [
      { typeId: 'STICK_WARRIOR', count: 10, interval: 1.2, delay: 0 },
      { typeId: 'AQUA_SERPENT', count: 6, interval: 1.8, delay: 3 }
    ]
  },
  {
    waveNumber: 7,
    name: 'Đợt 7: Bão Tố U Hồn (Bộ & Bay)',
    rewardGold: 155,
    enemies: [
      { typeId: 'SHADOW_WRAITH', count: 8, interval: 1.5, delay: 0 },
      { typeId: 'WINGED_GARGOYLE', count: 8, interval: 1.5, delay: 3 }
    ]
  },
  {
    waveNumber: 8,
    name: 'Đợt 8: Quân Đoàn Chiêu Hồn (Bộ & Bay)',
    rewardGold: 175,
    enemies: [
      { typeId: 'NECRO_WARLOCK', count: 4, interval: 2.5, delay: 0 },
      { typeId: 'WINGED_GARGOYLE', count: 8, interval: 1.5, delay: 3 },
      { typeId: 'STICK_WARRIOR', count: 8, interval: 1.2, delay: 5 }
    ]
  },
  {
    waveNumber: 9,
    name: 'Đợt 9: Vây Hãm Cổ Thành (Tam Tuyến)',
    rewardGold: 200,
    enemies: [
      { typeId: 'SHADOW_WRAITH', count: 8, interval: 1.3, delay: 0 },
      { typeId: 'AQUA_SERPENT', count: 8, interval: 1.5, delay: 2 },
      { typeId: 'WINGED_GARGOYLE', count: 8, interval: 1.3, delay: 5 },
      { typeId: 'NECRO_WARLOCK', count: 3, interval: 2.2, delay: 7 }
    ]
  },
  {
    waveNumber: 10,
    name: 'Đợt 10: Trùm Hắc Long Hư Vô',
    rewardGold: 420,
    enemies: [
      { typeId: 'SHADOW_WRAITH', count: 8, interval: 1.4, delay: 0 },
      { typeId: 'NECRO_WARLOCK', count: 4, interval: 2.2, delay: 3 },
      { typeId: 'DARK_DRAGON_BOSS', count: 1, interval: 1.0, delay: 8 }
    ]
  },
  ...WAVES_EXTENDED_POST_10
];

export const MAP_ANCIENT_NECROPOLIS: MapConfig = {
  id: 'ancient_necropolis',
  name: 'Cổ Thành Hư Vô',
  subtitle: 'Tam lộ huyết chiến - 3 Cửa bộ riêng biệt',
  description: 'Quân đoàn hư vô tấn công từ ba hướng Tây Bắc, Chính Tây và Tây Nam, vây hãm đại điện trung tâm.',
  themeColor: '#0a0914',
  roadColor: '#a16207',
  riverColor: '#9333ea',
  width: 1000,
  height: 650,
  roadWidth: 38,
  riverWidth: 36,
  groundWaypoints: [
    { x: 40, y: 110 },
    { x: 280, y: 110 },
    { x: 480, y: 220 },
    { x: 720, y: 220 },
    { x: 920, y: 325 }
  ],
  waterWaypoints: [
    { x: 200, y: 0 },
    { x: 280, y: 220 },
    { x: 450, y: 330 },
    { x: 580, y: 200 },
    { x: 820, y: 280 },
    { x: 920, y: 325 }
  ],
  airStart: { x: 40, y: 60 },
  airWaypoints: [
    { x: 40, y: 60 },
    { x: 460, y: 160 },
    { x: 920, y: 325 }
  ],
  playerBase: { x: 920, y: 325, radius: 45 },
  groundSpawn: { x: 40, y: 110 },
  waterSpawn: { x: 200, y: 0 },
  towerSlots: [],
  waves: WAVES_ANCIENT_NECROPOLIS,
  groundLanes: [
    // Cánh Tây Bắc
    [
      { x: 40, y: 110 },
      { x: 280, y: 110 },
      { x: 480, y: 220 },
      { x: 720, y: 220 },
      { x: 920, y: 325 }
    ],
    // Cánh Chính Tây
    [
      { x: 40, y: 325 },
      { x: 260, y: 325 },
      { x: 400, y: 440 },
      { x: 620, y: 440 },
      { x: 760, y: 325 },
      { x: 920, y: 325 }
    ],
    // Cánh Tây Nam
    [
      { x: 40, y: 540 },
      { x: 280, y: 540 },
      { x: 500, y: 490 },
      { x: 720, y: 400 },
      { x: 920, y: 325 }
    ]
  ],
  waterLanes: [
    // Kênh Năng Lượng Ma Thuật Tím
    [
      { x: 200, y: 0 },
      { x: 280, y: 220 },
      { x: 450, y: 330 },
      { x: 580, y: 200 },
      { x: 820, y: 280 },
      { x: 920, y: 325 }
    ]
  ],
  airLanes: [
    [
      { x: 40, y: 60 },
      { x: 460, y: 160 },
      { x: 920, y: 325 }
    ],
    [
      { x: 40, y: 580 },
      { x: 460, y: 480 },
      { x: 920, y: 325 }
    ]
  ],
  groundSpawns: [
    { x: 40, y: 110 }, // Cổng Tây Bắc
    { x: 40, y: 325 }, // Cổng Chính Tây
    { x: 40, y: 540 }  // Cổng Tây Nam
  ],
  waterSpawns: [
    { x: 200, y: 0 }   // Kênh Bắc
  ],
  airStarts: [
    { x: 40, y: 60 },
    { x: 40, y: 580 }
  ],
  laneBadges: ['3 Tuyến Bộ Riêng Biệt', '1 Kênh Năng Lượng', 'Tam Lộ Giáp Kẹp']
};

