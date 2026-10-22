import { Vector2D, TowerSlot } from '../types/entities.types.js';

export interface WaveEnemyEntry {
  typeId: string;
  count: number;
  interval: number; // seconds between spawns
  delay: number;    // seconds before starting this group
}

export interface WaveConfig {
  waveNumber: number;
  name: string;
  rewardGold: number;
  enemies: WaveEnemyEntry[];
}

export const MAP_CONFIG = {
  width: 1000,
  height: 650,

  // 1. Đường bộ (Ground Path)
  groundWaypoints: [
    { x: 40, y: 160 },
    { x: 220, y: 160 },
    { x: 300, y: 240 },
    { x: 300, y: 420 },
    { x: 460, y: 500 },
    { x: 620, y: 460 },
    { x: 650, y: 260 },
    { x: 780, y: 220 },
    { x: 880, y: 320 },
    { x: 920, y: 480 } // Player base
  ] as Vector2D[],

  // 2. Dòng sông nước (Water Path)
  waterWaypoints: [
    { x: 340, y: 0 },
    { x: 380, y: 150 },
    { x: 450, y: 280 },
    { x: 540, y: 360 },
    { x: 700, y: 420 },
    { x: 820, y: 460 },
    { x: 920, y: 480 } // Enters base
  ] as Vector2D[],

  // 3. Đường bay trên không (Air Path - Direct diagonal)
  airStart: { x: 40, y: 60 } as Vector2D,
  airWaypoints: [
    { x: 40, y: 60 },
    { x: 380, y: 100 },
    { x: 680, y: 180 },
    { x: 920, y: 480 }
  ] as Vector2D[],

  // Căn cứ người chơi
  playerBase: { x: 920, y: 480, radius: 45 },

  // Điểm xuất phát của quái
  groundSpawn: { x: 40, y: 160 },
  waterSpawn: { x: 340, y: 0 },

  // Danh sách các ô xây tháp & đặt bẫy
  towerSlots: [
    // 10 Ô Tháp Bên Đường (ROADSIDE)
    { id: 'slot-r1', x: 150, y: 105, placement: 'ROADSIDE', currentTowerId: null },
    { id: 'slot-r2', x: 230, y: 245, placement: 'ROADSIDE', currentTowerId: null },
    { id: 'slot-r3', x: 235, y: 365, placement: 'ROADSIDE', currentTowerId: null },
    { id: 'slot-r4', x: 380, y: 380, placement: 'ROADSIDE', currentTowerId: null },
    { id: 'slot-r5', x: 390, y: 520, placement: 'ROADSIDE', currentTowerId: null },
    { id: 'slot-r6', x: 540, y: 525, placement: 'ROADSIDE', currentTowerId: null },
    { id: 'slot-r7', x: 575, y: 365, placement: 'ROADSIDE', currentTowerId: null },
    { id: 'slot-r8', x: 715, y: 200, placement: 'ROADSIDE', currentTowerId: null },
    { id: 'slot-r9', x: 730, y: 335, placement: 'ROADSIDE', currentTowerId: null },
    { id: 'slot-r10', x: 840, y: 240, placement: 'ROADSIDE', currentTowerId: null },

    // 4 Ô Đặt Bẫy Trên Đường Đi Bộ (PATH_TRAP)
    { id: 'slot-t1', x: 160, y: 160, placement: 'PATH_TRAP', currentTowerId: null },
    { id: 'slot-t2', x: 300, y: 330, placement: 'PATH_TRAP', currentTowerId: null },
    { id: 'slot-t3', x: 540, y: 480, placement: 'PATH_TRAP', currentTowerId: null },
    { id: 'slot-t4', x: 830, y: 270, placement: 'PATH_TRAP', currentTowerId: null },

    // 2 Ô Đặt Bẫy Thủy Lôi Dưới Sông (WATER_TRAP)
    { id: 'slot-w1', x: 410, y: 210, placement: 'WATER_TRAP', currentTowerId: null },
    { id: 'slot-w2', x: 620, y: 390, placement: 'WATER_TRAP', currentTowerId: null }
  ] as TowerSlot[]
};

export const WAVES_CONFIG: WaveConfig[] = [
  {
    waveNumber: 1,
    name: 'Đợt 1: Dân Quân Bất Tuân',
    rewardGold: 50,
    enemies: [
      { typeId: 'STICK_RUNNER', count: 8, interval: 1.5, delay: 0 }
    ]
  },
  {
    waveNumber: 2,
    name: 'Đợt 2: Tiền Trạm Kiếm Sĩ',
    rewardGold: 65,
    enemies: [
      { typeId: 'STICK_RUNNER', count: 6, interval: 1.2, delay: 0 },
      { typeId: 'STICK_WARRIOR', count: 4, interval: 2.0, delay: 5 }
    ]
  },
  {
    waveNumber: 3,
    name: 'Đợt 3: Tập Kích Không Gian (Quái Bay)',
    rewardGold: 80,
    enemies: [
      { typeId: 'STICK_WARRIOR', count: 4, interval: 1.8, delay: 0 },
      { typeId: 'WINGED_GARGOYLE', count: 5, interval: 2.2, delay: 4 } // AIR UNIT!
    ]
  },
  {
    waveNumber: 4,
    name: 'Đợt 4: Sóng Ngầm Thủy Tộc (Quái Bơi)',
    rewardGold: 90,
    enemies: [
      { typeId: 'STICK_RUNNER', count: 8, interval: 1.0, delay: 0 },
      { typeId: 'AQUA_SERPENT', count: 4, interval: 2.5, delay: 3 } // WATER UNIT!
    ]
  },
  {
    waveNumber: 5,
    name: 'Đợt 5: Bão Lửa Xung Phong',
    rewardGold: 100,
    enemies: [
      { typeId: 'FIRE_IMP', count: 8, interval: 1.2, delay: 0 }, // Immune to FIRE
      { typeId: 'WINGED_GARGOYLE', count: 4, interval: 2.0, delay: 4 }
    ]
  },
  {
    waveNumber: 6,
    name: 'Đợt 6: Khiên Đá Kiên Cố',
    rewardGold: 110,
    enemies: [
      { typeId: 'ROCK_GOLEM', count: 4, interval: 3.0, delay: 0 }, // Immune to Physical & Lightning!
      { typeId: 'STICK_RUNNER', count: 10, interval: 0.9, delay: 3 }
    ]
  },
  {
    waveNumber: 7,
    name: 'Đợt 7: Hồn Ma Hư Vô (Xuyên Lính Chặn)',
    rewardGold: 125,
    enemies: [
      { typeId: 'SHADOW_WRAITH', count: 6, interval: 2.0, delay: 0 }, // UNBLOCKABLE & Immune Physical!
      { typeId: 'AQUA_SERPENT', count: 5, interval: 2.0, delay: 4 }
    ]
  },
  {
    waveNumber: 8,
    name: 'Đợt 8: Tổng Lực Tam Giới',
    rewardGold: 140,
    enemies: [
      { typeId: 'ROCK_GOLEM', count: 3, interval: 2.8, delay: 0 },
      { typeId: 'WINGED_GARGOYLE', count: 6, interval: 1.8, delay: 2 },
      { typeId: 'FIRE_IMP', count: 7, interval: 1.2, delay: 5 }
    ]
  },
  {
    waveNumber: 9,
    name: 'Đợt 9: Quân Đoàn Ác Mộng',
    rewardGold: 160,
    enemies: [
      { typeId: 'SHADOW_WRAITH', count: 6, interval: 1.6, delay: 0 },
      { typeId: 'ROCK_GOLEM', count: 4, interval: 2.5, delay: 3 },
      { typeId: 'WINGED_GARGOYLE', count: 6, interval: 1.5, delay: 6 },
      { typeId: 'AQUA_SERPENT', count: 6, interval: 1.8, delay: 8 }
    ]
  },
  {
    waveNumber: 10,
    name: 'Đợt 10: Trùm Cuối - Đại Hắc Long',
    rewardGold: 300,
    enemies: [
      { typeId: 'STICK_WARRIOR', count: 8, interval: 1.2, delay: 0 },
      { typeId: 'ROCK_GOLEM', count: 3, interval: 2.5, delay: 3 },
      { typeId: 'DARK_DRAGON_BOSS', count: 1, interval: 1.0, delay: 8 } // BOSS!
    ]
  }
];

