import { MapConfig, WaveConfig } from '../map.config.js';
import { EXTENDED_WAVES_PLAGUE_MORASS } from './waves_extended.js';

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
    name: 'Đợt 3: Nhện Độc Đầm Lầy (Đi Bộ)',
    rewardGold: 90,
    enemies: [
      { typeId: 'STICK_WARRIOR', count: 4, interval: 1.5, delay: 0 },
      { typeId: 'VENOM_ARACHNID', count: 6, interval: 1.2, delay: 2 }
    ]
  },
  {
    waveNumber: 4,
    name: 'Đợt 4: Dơi Huyết Độc Bão Tố (Chỉ Quái Bay)',
    rewardGold: 105,
    enemies: [
      { typeId: 'TOXIC_BAT', count: 8, interval: 1.5, delay: 0 }
    ]
  },
  {
    waveNumber: 5,
    name: 'Đợt 5: Thủy Quái Kịch Độc Kênh Bùn (Chỉ Quái Bơi)',
    rewardGold: 120,
    enemies: [
      { typeId: 'PLAGUE_LEVIATHAN', count: 3, interval: 2.2, delay: 0 }
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
  }
];

export const MAP_PLAGUE_MORASS: MapConfig = {
  id: 'plague_morass',
  name: 'Đầm Lầy Tử Khí',
  subtitle: 'Đối Cực Chéo - Tây Bắc & Đông Nam',
  description: 'Quân đoàn độc trùng đan chéo qua mạng lưới bùn lầy, tấn công 2 Căn Cứ độc lập ở hai góc đối cực Tây Bắc và Đông Nam.',
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
  playerBase: { x: 120, y: 120, radius: 42 },
  playerBases: [
    { x: 120, y: 120, radius: 42 }, // Căn Cứ Tây Bắc
    { x: 880, y: 530, radius: 42 }  // Căn Cứ Đông Nam
  ],
  groundSpawn: { x: 40, y: 510 },
  waterSpawn: { x: 300, y: 650 },
  towerSlots: [],
  waves: WAVES_PLAGUE_MORASS,
  extendedWaves: EXTENDED_WAVES_PLAGUE_MORASS,
  groundLanes: [
    // Tuyến 1: Từ Tây Nam -> Trung Tâm -> Căn Cứ Đông Nam
    [
      { x: 40, y: 510 },
      { x: 260, y: 510 },
      { x: 500, y: 325 },
      { x: 740, y: 530 },
      { x: 880, y: 530 }
    ],
    // Tuyến 2: Từ Đông Bắc -> Trung Tâm -> Căn Cứ Tây Bắc
    [
      { x: 960, y: 140 },
      { x: 740, y: 140 },
      { x: 500, y: 325 },
      { x: 260, y: 120 },
      { x: 120, y: 120 }
    ]
  ],
  waterLanes: [
    // Kênh Bùn 1: Nam -> Tâm -> Đông Nam
    [
      { x: 300, y: 650 },
      { x: 360, y: 460 },
      { x: 500, y: 325 },
      { x: 680, y: 420 },
      { x: 880, y: 530 }
    ],
    // Kênh Bùn 2: Bắc -> Tâm -> Tây Bắc
    [
      { x: 700, y: 0 },
      { x: 640, y: 190 },
      { x: 500, y: 325 },
      { x: 320, y: 230 },
      { x: 120, y: 120 }
    ]
  ],
  airLanes: [
    [
      { x: 40, y: 570 },
      { x: 460, y: 430 },
      { x: 880, y: 530 }
    ],
    [
      { x: 960, y: 80 },
      { x: 540, y: 220 },
      { x: 120, y: 120 }
    ]
  ],
  groundSpawns: [
    { x: 40, y: 510 },
    { x: 960, y: 140 }
  ],
  waterSpawns: [
    { x: 300, y: 650 },
    { x: 700, y: 0 }
  ],
  airStarts: [
    { x: 40, y: 570 },
    { x: 960, y: 80 }
  ],
  laneBadges: ['2 Nhà Chính Đối Cực Chéo', '2 Tuyến Đan Chéo Tâm', '2 Kênh Bùn Độc'],
  tribe: {
    name: 'Tộc Độc Trùng Biến Dị',
    icon: '☠️🌿',
    elements: ['POISON', 'GRASS', 'DARK'],
    description: 'Vùng đầm lầy chết chóc nơi Nhện Độc, Dơi Huyết Độc và Thủy Quái Kịch Độc sinh sôi dưới sự cai trị của Trùm Mãng Xà Hư Không.'
  }
};

