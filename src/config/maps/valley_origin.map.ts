import { MapConfig, WaveConfig } from '../map.config.js';
import { WAVES_EXTENDED_POST_10 } from './waves_extended.js';

export const WAVES_VALLEY_ORIGIN: WaveConfig[] = [
  // Wave 1-3: Chỉ quái đi bộ
  {
    waveNumber: 1,
    name: 'Đợt 1: Dân Quân Bất Tuân (Đi Bộ)',
    rewardGold: 50,
    enemies: [{ typeId: 'STICK_RUNNER', count: 8, interval: 1.5, delay: 0 }]
  },
  {
    waveNumber: 2,
    name: 'Đợt 2: Tiền Trạm Kiếm Sĩ (Đi Bộ)',
    rewardGold: 65,
    enemies: [
      { typeId: 'STICK_RUNNER', count: 6, interval: 1.2, delay: 0 },
      { typeId: 'STICK_WARRIOR', count: 4, interval: 2.0, delay: 4 }
    ]
  },
  {
    waveNumber: 3,
    name: 'Đợt 3: Tiên Phong Thạch Nham (Đi Bộ)',
    rewardGold: 80,
    enemies: [
      { typeId: 'STICK_WARRIOR', count: 5, interval: 1.8, delay: 0 },
      { typeId: 'ROCK_GOLEM', count: 2, interval: 3.0, delay: 4 }
    ]
  },
  // Wave 4: Chỉ quái bay
  {
    waveNumber: 4,
    name: 'Đợt 4: Tập Kích Không Gian (Chỉ Quái Bay)',
    rewardGold: 95,
    enemies: [
      { typeId: 'WINGED_GARGOYLE', count: 6, interval: 2.0, delay: 0 }
    ]
  },
  // Wave 5: Chỉ quái dưới nước
  {
    waveNumber: 5,
    name: 'Đợt 5: Sóng Ngầm Thủy Tộc (Chỉ Quái Bơi)',
    rewardGold: 110,
    enemies: [
      { typeId: 'AQUA_SERPENT', count: 5, interval: 2.2, delay: 0 }
    ]
  },
  // Sau wave 5: Xuất hiện nhiều hơn 1 loại đường
  {
    waveNumber: 6,
    name: 'Đợt 6: Hỗn Hợp Thủy Lục (Bộ & Nước)',
    rewardGold: 120,
    enemies: [
      { typeId: 'STICK_WARRIOR', count: 6, interval: 1.5, delay: 0 },
      { typeId: 'AQUA_SERPENT', count: 4, interval: 2.0, delay: 3 }
    ]
  },
  {
    waveNumber: 7,
    name: 'Đợt 7: Bão Tố Song Hành (Bộ & Bay)',
    rewardGold: 135,
    enemies: [
      { typeId: 'FIRE_IMP', count: 8, interval: 1.2, delay: 0 },
      { typeId: 'WINGED_GARGOYLE', count: 5, interval: 2.0, delay: 3 }
    ]
  },
  {
    waveNumber: 8,
    name: 'Đợt 8: Tổng Lực Tam Giới (Bộ, Bay & Nước)',
    rewardGold: 150,
    enemies: [
      { typeId: 'ROCK_GOLEM', count: 3, interval: 2.8, delay: 0 },
      { typeId: 'WINGED_GARGOYLE', count: 6, interval: 1.8, delay: 2 },
      { typeId: 'AQUA_SERPENT', count: 5, interval: 2.0, delay: 5 }
    ]
  },
  {
    waveNumber: 9,
    name: 'Đợt 9: Quân Đoàn Ác Mộng (Hỗn Hợp Đa Tuyến)',
    rewardGold: 175,
    enemies: [
      { typeId: 'SHADOW_WRAITH', count: 6, interval: 1.6, delay: 0 },
      { typeId: 'ROCK_GOLEM', count: 4, interval: 2.5, delay: 3 },
      { typeId: 'WINGED_GARGOYLE', count: 6, interval: 1.5, delay: 6 },
      { typeId: 'AQUA_SERPENT', count: 6, interval: 1.8, delay: 8 }
    ]
  },
  {
    waveNumber: 10,
    name: 'Đợt 10: Tiền Trạm Trùm - Đại Hắc Long',
    rewardGold: 300,
    enemies: [
      { typeId: 'STICK_WARRIOR', count: 8, interval: 1.2, delay: 0 },
      { typeId: 'ROCK_GOLEM', count: 3, interval: 2.5, delay: 3 },
      { typeId: 'DARK_DRAGON_BOSS', count: 1, interval: 1.0, delay: 8 }
    ]
  },
  ...WAVES_EXTENDED_POST_10
];

export const MAP_VALLEY_ORIGIN: MapConfig = {
  id: 'valley_origin',
  name: 'Thung Lũng Khởi Nguyên',
  subtitle: 'Đường uốn chữ S kinh điển',
  description: 'Địa hình lòng chảo với đường bộ uốn quanh co và dòng suối băng qua từ phương Bắc.',
  themeColor: '#1e293b',
  roadColor: '#b45309',
  riverColor: '#0284c7',
  width: 1000,
  height: 650,
  roadWidth: 42,
  riverWidth: 38,
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
    { x: 920, y: 480 }
  ],
  waterWaypoints: [
    { x: 340, y: 0 },
    { x: 380, y: 150 },
    { x: 450, y: 280 },
    { x: 540, y: 360 },
    { x: 700, y: 420 },
    { x: 820, y: 460 },
    { x: 920, y: 480 }
  ],
  airStart: { x: 40, y: 60 },
  airWaypoints: [
    { x: 40, y: 60 },
    { x: 380, y: 100 },
    { x: 680, y: 180 },
    { x: 920, y: 480 }
  ],
  playerBase: { x: 920, y: 480, radius: 45 },
  groundSpawn: { x: 40, y: 160 },
  waterSpawn: { x: 340, y: 0 },
  towerSlots: [
    { id: 'slot-r1', x: 150, y: 105, placement: 'ROADSIDE', currentTowerId: null },
    { id: 'slot-r2', x: 230, y: 245, placement: 'ROADSIDE', currentTowerId: null },
    { id: 'slot-r3', x: 235, y: 365, placement: 'ROADSIDE', currentTowerId: null },
    { id: 'slot-t1', x: 160, y: 160, placement: 'PATH_TRAP', currentTowerId: null },
    { id: 'slot-w1', x: 410, y: 210, placement: 'WATER_TRAP', currentTowerId: null }
  ],
  waves: WAVES_VALLEY_ORIGIN,
  laneBadges: ['1 Tuyến Bộ Uốn S', '1 Dòng Suối', '1 Hành Lang Bay']
};

