import { MapConfig, WaveConfig } from '../map.config.js';
import { WAVES_EXTENDED_POST_10 } from './waves_extended.js';

export const WAVES_PLAGUE_MORASS: WaveConfig[] = [
  {
    waveNumber: 1,
    name: 'Đợt 1: Sâu Bọ Đầm Lầy (Đi Bộ)',
    rewardGold: 55,
    enemies: [{ typeId: 'STICK_RUNNER', count: 12, interval: 1.2, delay: 0 }]
  },
  {
    waveNumber: 2,
    name: 'Đợt 2: Dân Làng Bị Tha Hóa (Đi Bộ)',
    rewardGold: 70,
    enemies: [
      { typeId: 'STICK_RUNNER', count: 8, interval: 1.0, delay: 0 },
      { typeId: 'STICK_WARRIOR', count: 6, interval: 1.6, delay: 3 }
    ]
  },
  {
    waveNumber: 3,
    name: 'Đợt 3: Khối Nham Thạch Ô Nhiễm (Đi Bộ)',
    rewardGold: 90,
    enemies: [
      { typeId: 'STICK_WARRIOR', count: 6, interval: 1.5, delay: 0 },
      { typeId: 'MAGMA_SLIME', count: 4, interval: 2.2, delay: 3 }
    ]
  },
  {
    waveNumber: 4,
    name: 'Đợt 4: Que Dơi Độc Khí (Chỉ Quái Bay)',
    rewardGold: 105,
    enemies: [
      { typeId: 'WINGED_GARGOYLE', count: 8, interval: 1.6, delay: 0 }
    ]
  },
  {
    waveNumber: 5,
    name: 'Đợt 5: Lươn Điện Kênh Bùn (Chỉ Quái Bơi)',
    rewardGold: 120,
    enemies: [
      { typeId: 'SPARK_EEL', count: 8, interval: 1.6, delay: 0 }
    ]
  },
  {
    waveNumber: 6,
    name: 'Đợt 6: Đầm Lầy Trỗi Dậy (Bộ & Nước)',
    rewardGold: 140,
    enemies: [
      { typeId: 'STICK_WARRIOR', count: 8, interval: 1.3, delay: 0 },
      { typeId: 'SPARK_EEL', count: 6, interval: 1.7, delay: 3 }
    ]
  },
  {
    waveNumber: 7,
    name: 'Đợt 7: Độc Khí Song Hành (Bộ & Bay)',
    rewardGold: 155,
    enemies: [
      { typeId: 'MAGMA_SLIME', count: 6, interval: 1.7, delay: 0 },
      { typeId: 'WINGED_GARGOYLE', count: 8, interval: 1.4, delay: 3 }
    ]
  },
  {
    waveNumber: 8,
    name: 'Đợt 8: Thủy Quái Kênh Độc (Nước & Bay)',
    rewardGold: 175,
    enemies: [
      { typeId: 'SPARK_EEL', count: 7, interval: 1.5, delay: 0 },
      { typeId: 'WINGED_GARGOYLE', count: 7, interval: 1.5, delay: 3 }
    ]
  },
  {
    waveNumber: 9,
    name: 'Đợt 9: Tứ Tuyến Tử Địa (Tam Tuyến)',
    rewardGold: 200,
    enemies: [
      { typeId: 'SHADOW_WRAITH', count: 8, interval: 1.4, delay: 0 },
      { typeId: 'SPARK_EEL', count: 8, interval: 1.5, delay: 2 },
      { typeId: 'WINGED_GARGOYLE', count: 8, interval: 1.3, delay: 5 },
      { typeId: 'ROCK_GOLEM', count: 4, interval: 2.2, delay: 7 }
    ]
  },
  {
    waveNumber: 10,
    name: 'Đợt 10: Trùm Mãng Xà Hư Không - Tử Thần Đầm Lầy',
    rewardGold: 450,
    enemies: [
      { typeId: 'ROCK_GOLEM', count: 6, interval: 2.0, delay: 0 },
      { typeId: 'SPARK_EEL', count: 6, interval: 1.6, delay: 3 },
      { typeId: 'VOID_HYDRA_BOSS', count: 1, interval: 1.0, delay: 8 }
    ]
  },
  ...WAVES_EXTENDED_POST_10
];

export const MAP_PLAGUE_MORASS: MapConfig = {
  id: 'plague_morass',
  name: 'Đầm Lầy Tử Khí',
  subtitle: 'Tứ trận hợp điểm - 2 Tuyến bộ & 2 Kênh độc',
  description: 'Địa hình sình lầy đan xen mạng lưới kênh bùn độc, quái vật xuất hiện từ cả 4 hướng tiếp cận.',
  themeColor: '#051f15',
  roadColor: '#166534',
  riverColor: '#84cc16',
  width: 1000,
  height: 650,
  roadWidth: 40,
  riverWidth: 36,
  groundWaypoints: [
    { x: 40, y: 140 },
    { x: 220, y: 140 },
    { x: 360, y: 280 },
    { x: 560, y: 160 },
    { x: 740, y: 200 },
    { x: 920, y: 325 }
  ],
  waterWaypoints: [
    { x: 300, y: 0 },
    { x: 340, y: 180 },
    { x: 460, y: 325 },
    { x: 640, y: 280 },
    { x: 820, y: 310 },
    { x: 920, y: 325 }
  ],
  airStart: { x: 40, y: 80 },
  airWaypoints: [
    { x: 40, y: 80 },
    { x: 460, y: 220 },
    { x: 920, y: 325 }
  ],
  playerBase: { x: 920, y: 325, radius: 45 },
  groundSpawn: { x: 40, y: 140 },
  waterSpawn: { x: 300, y: 0 },
  towerSlots: [],
  waves: WAVES_PLAGUE_MORASS,
  groundLanes: [
    // Tuyến Lầy Bắc
    [
      { x: 40, y: 140 },
      { x: 220, y: 140 },
      { x: 360, y: 280 },
      { x: 560, y: 160 },
      { x: 740, y: 200 },
      { x: 920, y: 325 }
    ],
    // Tuyến Lầy Nam
    [
      { x: 40, y: 510 },
      { x: 220, y: 510 },
      { x: 360, y: 370 },
      { x: 560, y: 490 },
      { x: 740, y: 450 },
      { x: 920, y: 325 }
    ]
  ],
  waterLanes: [
    // Kênh Bùn Độc Phương Bắc
    [
      { x: 300, y: 0 },
      { x: 340, y: 180 },
      { x: 460, y: 325 },
      { x: 640, y: 280 },
      { x: 820, y: 310 },
      { x: 920, y: 325 }
    ],
    // Kênh Bùn Độc Phương Nam
    [
      { x: 300, y: 650 },
      { x: 340, y: 470 },
      { x: 460, y: 325 },
      { x: 640, y: 370 },
      { x: 820, y: 340 },
      { x: 920, y: 325 }
    ]
  ],
  airLanes: [
    [
      { x: 40, y: 80 },
      { x: 460, y: 220 },
      { x: 920, y: 325 }
    ],
    [
      { x: 40, y: 570 },
      { x: 460, y: 430 },
      { x: 920, y: 325 }
    ]
  ],
  groundSpawns: [
    { x: 40, y: 140 }, // Cổng Lầy 1
    { x: 40, y: 510 }  // Cổng Lầy 2
  ],
  waterSpawns: [
    { x: 300, y: 0 },   // Kênh Độc Bắc
    { x: 300, y: 650 }  // Kênh Độc Nam
  ],
  airStarts: [
    { x: 40, y: 80 },
    { x: 40, y: 570 }
  ],
  laneBadges: ['2 Tuyến Bộ Đan Chéo', '2 Kênh Bùn Độc', 'Tứ Tuyến Tử Địa']
};

