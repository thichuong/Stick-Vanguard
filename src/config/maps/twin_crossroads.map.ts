import { MapConfig, WaveConfig } from '../map.config.js';

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
  subtitle: 'Đường bộ & Thủy lộ giao cắt',
  description: 'Dòng sông chảy dọc từ Bắc xuống Nam cắt ngang đường tiến quân tại cầu trung tâm.',
  themeColor: '#172554',
  roadColor: '#b45309',
  riverColor: '#0369a1',
  width: 1000,
  height: 650,
  roadWidth: 42,
  riverWidth: 40,
  groundWaypoints: [
    { x: 40, y: 320 },
    { x: 180, y: 320 },
    { x: 260, y: 160 },
    { x: 440, y: 160 },
    { x: 500, y: 325 },
    { x: 560, y: 480 },
    { x: 740, y: 480 },
    { x: 820, y: 320 },
    { x: 920, y: 320 }
  ],
  waterWaypoints: [
    { x: 500, y: 0 },
    { x: 500, y: 200 },
    { x: 500, y: 325 },
    { x: 520, y: 460 },
    { x: 680, y: 560 },
    { x: 850, y: 450 },
    { x: 920, y: 320 }
  ],
  airStart: { x: 40, y: 100 },
  airWaypoints: [
    { x: 40, y: 100 },
    { x: 350, y: 220 },
    { x: 650, y: 220 },
    { x: 920, y: 320 }
  ],
  playerBase: { x: 920, y: 320, radius: 45 },
  groundSpawn: { x: 40, y: 320 },
  waterSpawn: { x: 500, y: 0 },
  towerSlots: [],
  waves: WAVES_TWIN_CROSSROADS,
  laneBadges: ['1 Tuyến Bộ Cắt Sông', '1 Thủy Lộ Xuyên Tâm', 'Giao Điểm Cầu'],
  tribe: {
    name: 'Tộc Thiết Giáp Cơ Giới',
    icon: '⚙️⚡',
    elements: ['STEEL', 'LIGHTNING', 'PHYSICAL'],
    description: 'Binh đoàn cơ giới giáp sắt dày cộm, chỉ huy bởi Khổng Lồ Thép Sét kết hợp cùng Lươn Điện dưới sông.'
  }
};

