import { MapConfig, WaveConfig } from '../map.config.js';
import { WAVES_EXTENDED_POST_10 } from './waves_extended.js';

export const WAVES_INFERNAL_CALDERA: WaveConfig[] = [
  {
    waveNumber: 1,
    name: 'Đợt 1: Dân Quân Sa Mạc Tro (Đi Bộ)',
    rewardGold: 55,
    enemies: [{ typeId: 'STICK_RUNNER', count: 10, interval: 1.4, delay: 0 }]
  },
  {
    waveNumber: 2,
    name: 'Đợt 2: Đội Quân Kiếm Lửa (Đi Bộ)',
    rewardGold: 70,
    enemies: [
      { typeId: 'STICK_RUNNER', count: 8, interval: 1.2, delay: 0 },
      { typeId: 'STICK_WARRIOR', count: 5, interval: 1.8, delay: 4 }
    ]
  },
  {
    waveNumber: 3,
    name: 'Đợt 3: Tiểu Quỷ Hỏa Diệm & Quái Dung Nham (Đi Bộ)',
    rewardGold: 85,
    enemies: [
      { typeId: 'FIRE_IMP', count: 8, interval: 1.3, delay: 0 },
      { typeId: 'MAGMA_SLIME', count: 4, interval: 2.2, delay: 3 }
    ]
  },
  {
    waveNumber: 4,
    name: 'Đợt 4: Que Dơi Bão Lửa (Chỉ Quái Bay)',
    rewardGold: 100,
    enemies: [
      { typeId: 'WINGED_GARGOYLE', count: 8, interval: 1.8, delay: 0 }
    ]
  },
  {
    waveNumber: 5,
    name: 'Đợt 5: Thủy Xà Nham Thạch (Chỉ Quái Bơi)',
    rewardGold: 115,
    enemies: [
      { typeId: 'AQUA_SERPENT', count: 7, interval: 2.0, delay: 0 }
    ]
  },
  {
    waveNumber: 6,
    name: 'Đợt 6: Hỏa Lưu Gọng Kìm (Bộ & Nước)',
    rewardGold: 130,
    enemies: [
      { typeId: 'MAGMA_SLIME', count: 6, interval: 1.8, delay: 0 },
      { typeId: 'AQUA_SERPENT', count: 6, interval: 1.8, delay: 3 }
    ]
  },
  {
    waveNumber: 7,
    name: 'Đợt 7: Bão Tố Tro Tàn (Bộ & Bay)',
    rewardGold: 145,
    enemies: [
      { typeId: 'FIRE_IMP', count: 10, interval: 1.0, delay: 0 },
      { typeId: 'WINGED_GARGOYLE', count: 7, interval: 1.6, delay: 3 }
    ]
  },
  {
    waveNumber: 8,
    name: 'Đợt 8: Nham Thạch Giáp Trận (Tam Tuyến)',
    rewardGold: 165,
    enemies: [
      { typeId: 'ROCK_GOLEM', count: 5, interval: 2.2, delay: 0 },
      { typeId: 'WINGED_GARGOYLE', count: 7, interval: 1.5, delay: 3 },
      { typeId: 'AQUA_SERPENT', count: 6, interval: 1.8, delay: 5 }
    ]
  },
  {
    waveNumber: 9,
    name: 'Đợt 9: Quân Đoàn Dung Nham Hợp Kích (Tam Tuyến)',
    rewardGold: 190,
    enemies: [
      { typeId: 'MAGMA_SLIME', count: 8, interval: 1.5, delay: 0 },
      { typeId: 'FIRE_IMP', count: 12, interval: 0.9, delay: 3 },
      { typeId: 'WINGED_GARGOYLE', count: 8, interval: 1.3, delay: 6 },
      { typeId: 'AQUA_SERPENT', count: 8, interval: 1.5, delay: 8 }
    ]
  },
  {
    waveNumber: 10,
    name: 'Đợt 10: Chúa Tể Hỏa Ngục - Song Trùm Ma Vương',
    rewardGold: 380,
    enemies: [
      { typeId: 'ROCK_GOLEM', count: 6, interval: 2.0, delay: 0 },
      { typeId: 'MAGMA_SLIME', count: 6, interval: 1.6, delay: 3 },
      { typeId: 'DARK_DRAGON_BOSS', count: 1, interval: 1.0, delay: 8 }
    ]
  },
  ...WAVES_EXTENDED_POST_10
];

export const MAP_INFERNAL_CALDERA: MapConfig = {
  id: 'infernal_caldera',
  name: 'Hỏa Ngục Núi Lửa',
  subtitle: 'Song cánh gọng kìm & Sông nham thạch',
  description: 'Hai đạo quân bộ tràn xuống từ vách núi Bắc - Nam kẹp lấy dòng dung nham rực lửa ở trung tâm.',
  themeColor: '#1a0500',
  roadColor: '#9a3412',
  riverColor: '#ea580c',
  width: 1000,
  height: 650,
  roadWidth: 42,
  riverWidth: 38,
  groundWaypoints: [
    { x: 40, y: 120 },
    { x: 260, y: 120 },
    { x: 440, y: 160 },
    { x: 640, y: 160 },
    { x: 820, y: 240 },
    { x: 920, y: 325 }
  ],
  waterWaypoints: [
    { x: 40, y: 325 },
    { x: 280, y: 325 },
    { x: 520, y: 325 },
    { x: 740, y: 325 },
    { x: 920, y: 325 }
  ],
  airStart: { x: 40, y: 80 },
  airWaypoints: [
    { x: 40, y: 80 },
    { x: 450, y: 180 },
    { x: 920, y: 325 }
  ],
  playerBase: { x: 920, y: 325, radius: 45 },
  groundSpawn: { x: 40, y: 120 },
  waterSpawn: { x: 40, y: 325 },
  towerSlots: [],
  waves: WAVES_INFERNAL_CALDERA,
  groundLanes: [
    // Lane 0: Cánh Bắc
    [
      { x: 40, y: 120 },
      { x: 260, y: 120 },
      { x: 440, y: 160 },
      { x: 640, y: 160 },
      { x: 820, y: 240 },
      { x: 920, y: 325 }
    ],
    // Lane 1: Cánh Nam
    [
      { x: 40, y: 530 },
      { x: 260, y: 530 },
      { x: 440, y: 490 },
      { x: 640, y: 490 },
      { x: 820, y: 410 },
      { x: 920, y: 325 }
    ]
  ],
  waterLanes: [
    // Sông Nham Thạch Xuyên Tâm
    [
      { x: 40, y: 325 },
      { x: 280, y: 325 },
      { x: 520, y: 325 },
      { x: 740, y: 325 },
      { x: 920, y: 325 }
    ]
  ],
  airLanes: [
    [
      { x: 40, y: 80 },
      { x: 450, y: 180 },
      { x: 920, y: 325 }
    ],
    [
      { x: 40, y: 570 },
      { x: 450, y: 470 },
      { x: 920, y: 325 }
    ]
  ],
  groundSpawns: [
    { x: 40, y: 120 },
    { x: 40, y: 530 }
  ],
  waterSpawns: [
    { x: 40, y: 325 }
  ],
  airStarts: [
    { x: 40, y: 80 },
    { x: 40, y: 570 }
  ],
  laneBadges: ['2 Tuyến Bộ Song Cánh', '1 Sông Nham Thạch', '2 Hành Lang Bay']
};

