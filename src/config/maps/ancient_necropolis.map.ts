import { MapConfig, WaveConfig } from '../map.config.js';
import { EXTENDED_WAVES_ANCIENT_NECROPOLIS } from './waves_extended.js';

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
    name: 'Đợt 3: U Hồn Tử Thần & Pháp Sư Chiêu Hồn (Đi Bộ)',
    rewardGold: 90,
    enemies: [
      { typeId: 'PHANTOM_REAPER', count: 4, interval: 2.0, delay: 0 },
      { typeId: 'NECRO_WARLOCK', count: 2, interval: 3.0, delay: 4 }
    ]
  },
  {
    waveNumber: 4,
    name: 'Đợt 4: Oán Hồn Không Trung Tiếng Thét (Chỉ Quái Bay)',
    rewardGold: 105,
    enemies: [
      { typeId: 'SPECTRAL_BANSHEE', count: 7, interval: 1.7, delay: 0 }
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
    name: 'Đợt 10: Trùm U Minh Tử Đế Thức Tỉnh',
    rewardGold: 420,
    enemies: [
      { typeId: 'SHADOW_WRAITH', count: 8, interval: 1.4, delay: 0 },
      { typeId: 'NECRO_WARLOCK', count: 4, interval: 2.2, delay: 3 },
      { typeId: 'SOUL_EMPEROR_BOSS', count: 1, interval: 1.0, delay: 8 }
    ]
  }
];

export const MAP_ANCIENT_NECROPOLIS: MapConfig = {
  id: 'ancient_necropolis',
  name: 'Cổ Thành Hư Vô',
  subtitle: 'Tam Thành Phòng Thủ - 3 Cửa Bộ Độc Lập',
  description: 'Quân đoàn hư vô tấn công từ ba hướng Tây Bắc, Chính Tây và Tây Nam, nhắm vào 3 Cổng Thành độc lập ở phía Đông.',
  themeColor: '#0a0914',
  roadColor: '#a16207',
  riverColor: '#9333ea',
  roadWidth: 38,
  riverWidth: 36,
  playerBases: [
    { x: 900, y: 130, radius: 40 }, // 1: Cổng Thành Bắc
    { x: 900, y: 325, radius: 40 }, // 2: Cổng Thành Trung
    { x: 900, y: 520, radius: 40 }  // 3: Cổng Thành Nam
  ],
  groundLanes: [
    // Cánh Tây Bắc -> Cổng Thành Bắc (1)
    [
      { x: 40, y: 110 },
      { x: 280, y: 110 },
      { x: 540, y: 180 },
      { x: 740, y: 130 },
      1
    ],
    // Cánh Chính Tây -> Cổng Thành Trung (2)
    [
      { x: 40, y: 325 },
      { x: 260, y: 325 },
      { x: 500, y: 410 },
      { x: 720, y: 325 },
      2
    ],
    // Cánh Tây Nam -> Cổng Thành Nam (3)
    [
      { x: 40, y: 540 },
      { x: 280, y: 540 },
      { x: 540, y: 470 },
      { x: 740, y: 520 },
      3
    ]
  ],
  waterLanes: [
    // Kênh Năng Lượng Ma Thuật Tím 1 -> Thành Bắc (1)
    [
      { x: 200, y: 0 },
      { x: 380, y: 220 },
      { x: 660, y: 220 },
      1
    ],
    // Kênh Năng Lượng Ma Thuật Tím 2 -> Thành Nam (3)
    [
      { x: 200, y: 650 },
      { x: 380, y: 430 },
      { x: 660, y: 430 },
      3
    ]
  ],
  airLanes: [
    [
      { x: 40, y: 60 },
      { x: 460, y: 130 },
      1
    ],
    [
      { x: 40, y: 325 },
      { x: 460, y: 325 },
      2
    ],
    [
      { x: 40, y: 580 },
      { x: 460, y: 520 },
      3
    ]
  ],
  waves: WAVES_ANCIENT_NECROPOLIS,
  extendedWaves: EXTENDED_WAVES_ANCIENT_NECROPOLIS,
  laneBadges: ['3 Nhà Chính Tam Thành', '3 Tuyến Bộ Riêng Biệt', 'Tam Lộ Giáp Kẹp'],
  tribe: {
    name: 'Tộc Vong Linh U Hồn',
    icon: '👻🔮',
    elements: ['GHOST', 'DARK', 'ICE'],
    description: 'Binh đoàn u hồn tử thần và oán hồn không trung xuyên thấu mọi lớp giáp vật lý cùng Pháp Sư Chiêu Hồn.'
  }
};
