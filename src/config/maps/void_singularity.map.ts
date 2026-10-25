import { MapConfig, WaveConfig } from '../map.config.js';
import { EXTENDED_WAVES_VOID_SINGULARITY } from './waves_extended.js';

export const WAVES_VOID_SINGULARITY: WaveConfig[] = [
  {
    waveNumber: 1,
    name: 'Đợt 1: Dò Đường Hư Vô (Đi Bộ)',
    rewardGold: 60,
    enemies: [
      { typeId: 'STICK_RUNNER', count: 12, interval: 1.1, delay: 0 }
    ]
  },
  {
    waveNumber: 2,
    name: 'Đợt 2: Xung Điện Tiền Tiêu (Đi Bộ)',
    rewardGold: 75,
    enemies: [
      { typeId: 'STICK_RUNNER', count: 6, interval: 1.0, delay: 0 },
      { typeId: 'STICK_WARRIOR', count: 6, interval: 1.4, delay: 2 },
      { typeId: 'VOID_SABOTEUR', count: 3, interval: 2.2, delay: 4 }
    ]
  },
  {
    waveNumber: 3,
    name: 'Đợt 3: Thiết Giáp & Hủy Cấp (Đi Bộ)',
    rewardGold: 95,
    enemies: [
      { typeId: 'STEEL_VANGUARD', count: 5, interval: 1.8, delay: 0 },
      { typeId: 'VOID_SABOTEUR', count: 4, interval: 1.8, delay: 2 },
      { typeId: 'HEX_DEGRADER', count: 2, interval: 3.5, delay: 5 }
    ]
  },
  {
    waveNumber: 4,
    name: 'Đợt 4: Nhãn Cầu Tê Liệt (Chỉ Quái Bay)',
    rewardGold: 110,
    enemies: [
      { typeId: 'EMP_DRONE', count: 6, interval: 1.6, delay: 0 },
      { typeId: 'SPECTRAL_BANSHEE', count: 5, interval: 1.8, delay: 3 }
    ]
  },
  {
    waveNumber: 5,
    name: 'Đợt 5: Cự Giải Kênh Năng Lượng (Chỉ Quái Bơi)',
    rewardGold: 125,
    enemies: [
      { typeId: 'ABYSSAL_CRAB', count: 4, interval: 2.2, delay: 0 },
      { typeId: 'SPARK_EEL', count: 5, interval: 1.8, delay: 3 }
    ]
  },
  {
    waveNumber: 6,
    name: 'Đợt 6: Hư Không Thủy Lục (Bộ & Nước)',
    rewardGold: 145,
    enemies: [
      { typeId: 'VOID_SABOTEUR', count: 6, interval: 1.6, delay: 0 },
      { typeId: 'STEEL_VANGUARD', count: 5, interval: 1.8, delay: 2 },
      { typeId: 'ABYSSAL_CRAB', count: 4, interval: 2.0, delay: 4 }
    ]
  },
  {
    waveNumber: 7,
    name: 'Đợt 7: Không Địa Ma Trận (Bộ & Bay)',
    rewardGold: 160,
    enemies: [
      { typeId: 'HEX_DEGRADER', count: 4, interval: 2.5, delay: 0 },
      { typeId: 'EMP_DRONE', count: 7, interval: 1.4, delay: 2 },
      { typeId: 'SHADOW_WRAITH', count: 6, interval: 1.3, delay: 5 }
    ]
  },
  {
    waveNumber: 8,
    name: 'Đợt 8: Xung Điện Đa Chiều (Nước & Bay)',
    rewardGold: 180,
    enemies: [
      { typeId: 'ABYSSAL_CRAB', count: 5, interval: 1.8, delay: 0 },
      { typeId: 'EMP_DRONE', count: 7, interval: 1.4, delay: 2 },
      { typeId: 'SPARK_EEL', count: 7, interval: 1.3, delay: 4 }
    ]
  },
  {
    waveNumber: 9,
    name: 'Đợt 9: Hắc Tinh Diệt Hồn (Bộ, Nước & Bay)',
    rewardGold: 215,
    enemies: [
      { typeId: 'HEX_DEGRADER', count: 4, interval: 2.2, delay: 0 },
      { typeId: 'VOID_SABOTEUR', count: 6, interval: 1.5, delay: 2 },
      { typeId: 'ABYSSAL_CRAB', count: 5, interval: 1.8, delay: 4 },
      { typeId: 'EMP_DRONE', count: 8, interval: 1.2, delay: 6 }
    ]
  },
  {
    waveNumber: 10,
    name: 'Đợt 10: Trùm Hắc Tinh Hủy Diệt Thức Tỉnh',
    rewardGold: 520,
    enemies: [
      { typeId: 'HEX_DEGRADER', count: 3, interval: 2.5, delay: 0 },
      { typeId: 'EMP_DRONE', count: 6, interval: 1.5, delay: 2 },
      { typeId: 'ABYSSAL_CRAB', count: 5, interval: 1.8, delay: 4 },
      { typeId: 'CHRONO_DESTROYER_BOSS', count: 1, interval: 1.0, delay: 8 }
    ]
  }
];

export const MAP_VOID_SINGULARITY: MapConfig = {
  id: 'void_singularity',
  name: 'Vực Thẳm Hắc Tinh',
  subtitle: 'Tam Tuyến Vòng Xoáy Hư Không & 3 Lõi Năng Lượng',
  description: 'Ba tuyến đường kéo dài uốn quanh co từ các góc bản đồ, cắt nhau tại các ngã tư chiến lược trước khi hội tụ về 3 Lõi Năng Lượng.',
  themeColor: '#09081a',
  roadColor: '#4338ca',
  riverColor: '#6d28d9',
  roadWidth: 38,
  riverWidth: 34,
  playerBases: [
    { x: 500, y: 140, radius: 42 }, // 1: Lõi Bắc
    { x: 300, y: 490, radius: 42 }, // 2: Lõi Tây Nam
    { x: 700, y: 490, radius: 42 }  // 3: Lõi Đông Nam
  ],
  groundLanes: [
    // Tuyến 1: Xuất phát Tây Bắc (40, 120) -> cắt qua tâm -> Lõi Đông Nam (3)
    [
      { x: 40, y: 120 },
      { x: 320, y: 120 },
      { x: 480, y: 200 },
      { x: 500, y: 325 },
      { x: 420, y: 450 },
      { x: 420, y: 550 },
      { x: 600, y: 550 },
      3
    ],
    // Tuyến 2: Xuất phát Đông Bắc (960, 120) -> cắt qua tâm -> Lõi Tây Nam (2)
    [
      { x: 960, y: 120 },
      { x: 680, y: 120 },
      { x: 520, y: 200 },
      { x: 500, y: 325 },
      { x: 580, y: 450 },
      { x: 580, y: 550 },
      { x: 400, y: 550 },
      2
    ],
    // Tuyến 3: Xuất phát Nam (500, 630) -> vòng lên đỉnh -> Lõi Bắc (1)
    [
      { x: 500, y: 630 },
      { x: 200, y: 580 },
      { x: 140, y: 380 },
      { x: 220, y: 240 },
      { x: 380, y: 200 },
      1
    ]
  ],
  waterLanes: [
    // Kênh Năng Lượng 1: Tây -> cắt qua tâm -> Lõi Đông Nam (3)
    [
      { x: 40, y: 325 },
      { x: 280, y: 325 },
      { x: 500, y: 325 },
      { x: 640, y: 380 },
      3
    ],
    // Kênh Năng Lượng 2: Đông -> cắt qua tâm -> Lõi Tây Nam (2)
    [
      { x: 960, y: 325 },
      { x: 720, y: 325 },
      { x: 500, y: 325 },
      { x: 360, y: 380 },
      2
    ]
  ],
  airLanes: [
    [
      { x: 40, y: 60 },
      { x: 300, y: 100 },
      1
    ],
    [
      { x: 40, y: 590 },
      2
    ],
    [
      { x: 960, y: 590 },
      3
    ]
  ],
  waves: WAVES_VOID_SINGULARITY,
  extendedWaves: EXTENDED_WAVES_VOID_SINGULARITY,
  laneBadges: ['3 Lõi Năng Lượng', 'Tam Tuyến Vòng Cắt Nhau', 'Giao Điểm Tâm Hố Đen'],
  tribe: {
    name: 'Tộc Hắc Tinh Phá Tháp',
    icon: '🔮⚙️⚡',
    elements: ['DARK', 'STEEL', 'GHOST', 'LIGHTNING'],
    description: 'Binh đoàn tà thuật cơ giới tối thượng do Trùm Hắc Tinh Hủy Diệt dẫn đầu, đe dọa hạ cấp và vô hiệu hóa toàn bộ tháp phòng thủ.'
  }
};
