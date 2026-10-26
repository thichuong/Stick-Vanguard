import { MapConfig, WaveConfig } from '../map.config.js';
import { ELEMENT_ICONS } from '../elements.config.js';
import { EXTENDED_WAVES_TWIN_CROSSROADS } from './waves_extended.js';

export const WAVES_TWIN_CROSSROADS: WaveConfig[] = [
  // Wave 1-3: WALK
  {
    waveNumber: 1,
    name: 'Đợt 1: Tiền Đồn Thiết Binh (Đi Bộ)',
    rewardGold: 50,
    enemies: [{ typeId: 'STICK_RUNNER', count: 8, interval: 1.4, delay: 0 }]
  },
  {
    waveNumber: 2,
    name: 'Đợt 2: Dân Binh Giáp Sắt (Đi Bộ)',
    rewardGold: 65,
    enemies: [
      { typeId: 'STICK_RUNNER', count: 6, interval: 1.2, delay: 0 },
      { typeId: 'STEEL_VANGUARD', count: 3, interval: 2.2, delay: 3 }
    ]
  },
  {
    waveNumber: 3,
    name: 'Đợt 3: Binh Đoàn Thiết Giáp (Đi Bộ)',
    rewardGold: 80,
    enemies: [
      { typeId: 'STEEL_VANGUARD', count: 5, interval: 1.8, delay: 0 },
      { typeId: 'IRON_COLOSSUS', count: 1, interval: 3.0, delay: 5 }
    ]
  },
  // Wave 4: FLY ONLY
  {
    waveNumber: 4,
    name: 'Đợt 4: Phi Đội Sấm Sét (Chỉ Quái Bay)',
    rewardGold: 95,
    enemies: [
      { typeId: 'WINGED_GARGOYLE', count: 7, interval: 1.8, delay: 0 }
    ]
  },
  // Wave 5: SWIM ONLY
  {
    waveNumber: 5,
    name: 'Đợt 5: Lươn Điện Thủy Tộc (Chỉ Quái Bơi)',
    rewardGold: 110,
    enemies: [
      { typeId: 'SPARK_EEL', count: 6, interval: 1.8, delay: 0 }
    ]
  },
  // Wave 6-10: Mixed
  {
    waveNumber: 6,
    name: 'Đợt 6: Xung Đột Thủy Lục (Bộ & Nước)',
    rewardGold: 120,
    enemies: [
      { typeId: 'STEEL_VANGUARD', count: 6, interval: 1.5, delay: 0 },
      { typeId: 'SPARK_EEL', count: 6, interval: 1.8, delay: 3 }
    ]
  },
  {
    waveNumber: 7,
    name: 'Đợt 7: Thiết Giáp & Lôi Điện (Bộ & Bay)',
    rewardGold: 135,
    enemies: [
      { typeId: 'STEEL_VANGUARD', count: 7, interval: 1.5, delay: 0 },
      { typeId: 'WINGED_GARGOYLE', count: 6, interval: 1.6, delay: 3 }
    ]
  },
  {
    waveNumber: 8,
    name: 'Đợt 8: Khổng Lồ Cơ Giới (Bộ, Bay & Nước)',
    rewardGold: 155,
    enemies: [
      { typeId: 'IRON_COLOSSUS', count: 2, interval: 3.0, delay: 0 },
      { typeId: 'WINGED_GARGOYLE', count: 6, interval: 1.5, delay: 3 },
      { typeId: 'SPARK_EEL', count: 5, interval: 1.8, delay: 5 }
    ]
  },
  {
    waveNumber: 9,
    name: 'Đợt 9: Quân Đoàn Thép Tràn Ngập (Tam Tuyến)',
    rewardGold: 180,
    enemies: [
      { typeId: 'STEEL_VANGUARD', count: 8, interval: 1.3, delay: 0 },
      { typeId: 'IRON_COLOSSUS', count: 2, interval: 2.8, delay: 2 },
      { typeId: 'WINGED_GARGOYLE', count: 8, interval: 1.3, delay: 5 },
      { typeId: 'SPARK_EEL', count: 8, interval: 1.5, delay: 7 }
    ]
  },
  {
    waveNumber: 10,
    name: 'Đợt 10: Trùm Thiết Giáp Lôi Đế Xuất Trận (Tam Tuyến)',
    rewardGold: 320,
    enemies: [
      { typeId: 'IRON_COLOSSUS', count: 3, interval: 2.5, delay: 0 },
      { typeId: 'STEEL_VANGUARD', count: 8, interval: 1.3, delay: 3 },
      { typeId: 'IRON_OVERLORD_BOSS', count: 1, interval: 1.0, delay: 8 }
    ]
  }
];

export const MAP_TWIN_CROSSROADS: MapConfig = {
  id: 'twin_crossroads',
  name: 'Giao Lộ Sinh Tử',
  subtitle: 'Song Thành Bắc - Nam & Giao Lộ Giữa',
  description: 'Quân đoàn tiến vào từ hai phía Đông và Tây gặp nhau tại giao lộ trung tâm, rồi chia mũi nhọn tấn công 2 Nhà Chính ở phương Bắc và Nam.',
  themeColor: '#172554',
  roadColor: '#b45309',
  riverColor: '#0369a1',
  roadWidth: 42,
  riverWidth: 40,
  playerBases: [
    { x: 500, y: 70, radius: 42 },  // 1: Nhà Chính Bắc
    { x: 500, y: 580, radius: 42 } // 2: Nhà Chính Nam
  ],
  groundLanes: [
    // Tuyến Bộ Tây -> Giao lộ -> Nhà Chính Bắc
    [
      { x: 40, y: 325 },
      { x: 260, y: 325 },
      { x: 500, y: 325 },
      1
    ],
    // Tuyến Bộ Đông -> Giao lộ -> Nhà Chính Nam
    [
      { x: 960, y: 325 },
      { x: 740, y: 325 },
      { x: 500, y: 325 },
      2
    ]
  ],
  waterLanes: [
    // Thủy Lộ Tây Bắc -> Nhà Chính Bắc
    [
      { x: 40, y: 120 },
      { x: 260, y: 160 },
      1
    ],
    // Thủy Lộ Đông Nam -> Nhà Chính Nam
    [
      { x: 960, y: 530 },
      { x: 740, y: 490 },
      2
    ]
  ],
  airLanes: [
    // Hành Lang Bay Tây -> Nhà Chính Bắc
    [
      { x: 40, y: 220 },
      { x: 280, y: 160 },
      1
    ],
    // Hành Lang Bay Đông -> Nhà Chính Nam
    [
      { x: 960, y: 430 },
      { x: 720, y: 490 },
      2
    ]
  ],
  waves: WAVES_TWIN_CROSSROADS,
  extendedWaves: EXTENDED_WAVES_TWIN_CROSSROADS,
  laneBadges: ['2 Nhà Chính Bắc-Nam', 'Giao Lộ Chữ Thập', 'Song Tuyến Đông-Tây'],
  tribe: {
    name: 'Tộc Thiết Giáp Cơ Giới',
    icon: `${ELEMENT_ICONS.STEEL}${ELEMENT_ICONS.LIGHTNING}`,
    elements: ['STEEL', 'LIGHTNING', 'PHYSICAL'],
    description: 'Binh đoàn cơ giới giáp sắt dày cộm, chỉ huy bởi Khổng Lồ Thép Sét kết hợp cùng Lươn Điện dưới sông.'
  }
};
