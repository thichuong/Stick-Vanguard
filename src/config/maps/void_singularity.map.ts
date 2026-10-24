import { MapConfig, WaveConfig } from '../map.config.js';
import { WAVES_EXTENDED_POST_10 } from './waves_extended.js';

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
  },
  ...WAVES_EXTENDED_POST_10
];

export const MAP_VOID_SINGULARITY: MapConfig = {
  id: 'void_singularity',
  name: 'Vực Thẳm Hắc Tinh',
  subtitle: 'Tam lộ hư không - 3 Tuyến Hội Tụ & 2 Kênh Hắc Ám',
  description: 'Tâm điểm hố đen vũ trụ nuốt chửng năng lượng. Binh đoàn Hắc Tinh Cơ Giới liên tục phóng xung điện vô hiệu hóa và tia hạ cấp tháp phòng thủ.',
  themeColor: '#09081a',
  roadColor: '#4338ca',
  riverColor: '#6d28d9',
  width: 1000,
  height: 650,
  roadWidth: 38,
  riverWidth: 34,
  groundWaypoints: [
    { x: 40, y: 140 },
    { x: 260, y: 140 },
    { x: 440, y: 260 },
    { x: 680, y: 200 },
    { x: 920, y: 325 }
  ],
  waterWaypoints: [
    { x: 40, y: 240 },
    { x: 300, y: 240 },
    { x: 500, y: 325 },
    { x: 740, y: 300 },
    { x: 920, y: 325 }
  ],
  airStart: { x: 40, y: 60 },
  airWaypoints: [
    { x: 40, y: 60 },
    { x: 460, y: 200 },
    { x: 920, y: 325 }
  ],
  playerBase: { x: 920, y: 325, radius: 45 },
  groundSpawn: { x: 40, y: 140 },
  waterSpawn: { x: 40, y: 240 },
  towerSlots: [],
  waves: WAVES_VOID_SINGULARITY,
  groundLanes: [
    // Tuyến Bắc
    [
      { x: 40, y: 140 },
      { x: 260, y: 140 },
      { x: 440, y: 260 },
      { x: 680, y: 200 },
      { x: 920, y: 325 }
    ],
    // Tuyến Giữa
    [
      { x: 40, y: 325 },
      { x: 220, y: 325 },
      { x: 380, y: 325 },
      { x: 600, y: 325 },
      { x: 920, y: 325 }
    ],
    // Tuyến Nam
    [
      { x: 40, y: 510 },
      { x: 260, y: 510 },
      { x: 440, y: 390 },
      { x: 680, y: 450 },
      { x: 920, y: 325 }
    ]
  ],
  waterLanes: [
    // Kênh Năng Lượng Bắc
    [
      { x: 40, y: 230 },
      { x: 300, y: 230 },
      { x: 500, y: 310 },
      { x: 740, y: 290 },
      { x: 920, y: 325 }
    ],
    // Kênh Năng Lượng Nam
    [
      { x: 40, y: 420 },
      { x: 300, y: 420 },
      { x: 500, y: 340 },
      { x: 740, y: 360 },
      { x: 920, y: 325 }
    ]
  ],
  airLanes: [
    [
      { x: 40, y: 60 },
      { x: 460, y: 200 },
      { x: 920, y: 325 }
    ],
    [
      { x: 40, y: 590 },
      { x: 460, y: 450 },
      { x: 920, y: 325 }
    ]
  ],
  groundSpawns: [
    { x: 40, y: 140 },
    { x: 40, y: 325 },
    { x: 40, y: 510 }
  ],
  waterSpawns: [
    { x: 40, y: 230 },
    { x: 40, y: 420 }
  ],
  airStarts: [
    { x: 40, y: 60 },
    { x: 40, y: 590 }
  ],
  laneBadges: ['3 Tuyến Hội Tụ', '2 Kênh Hắc Ám', 'Cỗ Máy Hủy Diệt'],
  tribe: {
    name: 'Tộc Hắc Tinh Phá Tháp',
    icon: '🔮⚙️⚡',
    elements: ['DARK', 'STEEL', 'GHOST', 'LIGHTNING'],
    description: 'Binh đoàn tà thuật cơ giới tối thượng do Trùm Hắc Tinh Hủy Diệt dẫn đầu, đe dọa hạ cấp và vô hiệu hóa toàn bộ tháp phòng thủ.'
  }
};

