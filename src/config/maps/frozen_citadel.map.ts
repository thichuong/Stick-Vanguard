import { MapConfig, WaveConfig } from '../map.config.js';
import { WAVES_EXTENDED_POST_10 } from './waves_extended.js';

export const WAVES_FROZEN_CITADEL: WaveConfig[] = [
  {
    waveNumber: 1,
    name: 'Đợt 1: Băng Binh Tiền Trạm (Đi Bộ)',
    rewardGold: 55,
    enemies: [{ typeId: 'STICK_RUNNER', count: 10, interval: 1.3, delay: 0 }]
  },
  {
    waveNumber: 2,
    name: 'Đợt 2: Chiến Binh Băng Giá (Đi Bộ)',
    rewardGold: 70,
    enemies: [
      { typeId: 'STICK_RUNNER', count: 8, interval: 1.1, delay: 0 },
      { typeId: 'STICK_WARRIOR', count: 6, interval: 1.7, delay: 3 }
    ]
  },
  {
    waveNumber: 3,
    name: 'Đợt 3: Khổng Lồ Băng Nham (Đi Bộ)',
    rewardGold: 90,
    enemies: [
      { typeId: 'STICK_WARRIOR', count: 6, interval: 1.5, delay: 0 },
      { typeId: 'FROST_CRYSTAL_GOLEM', count: 3, interval: 2.5, delay: 3 }
    ]
  },
  {
    waveNumber: 4,
    name: 'Đợt 4: Tiên Linh Bão Tuyết (Chỉ Quái Bay)',
    rewardGold: 105,
    enemies: [
      { typeId: 'FAIRY_SPRITE', count: 8, interval: 1.6, delay: 0 }
    ]
  },
  {
    waveNumber: 5,
    name: 'Đợt 5: Thủy Xà Băng Đảo (Chỉ Quái Bơi)',
    rewardGold: 120,
    enemies: [
      { typeId: 'AQUA_SERPENT', count: 8, interval: 1.8, delay: 0 }
    ]
  },
  {
    waveNumber: 6,
    name: 'Đợt 6: Hợp Lưu Băng Giá (Bộ & Nước)',
    rewardGold: 135,
    enemies: [
      { typeId: 'FROST_CRYSTAL_GOLEM', count: 4, interval: 2.2, delay: 0 },
      { typeId: 'AQUA_SERPENT', count: 6, interval: 1.7, delay: 3 }
    ]
  },
  {
    waveNumber: 7,
    name: 'Đợt 7: Bão Băng Song Hành (Bộ & Bay)',
    rewardGold: 150,
    enemies: [
      { typeId: 'STICK_WARRIOR', count: 10, interval: 1.0, delay: 0 },
      { typeId: 'WINGED_GARGOYLE', count: 8, interval: 1.5, delay: 3 }
    ]
  },
  {
    waveNumber: 8,
    name: 'Đợt 8: Tiên Cá & Thạch Nham (Nước & Bộ)',
    rewardGold: 170,
    enemies: [
      { typeId: 'STORM_CALLER_SIREN', count: 4, interval: 2.2, delay: 0 },
      { typeId: 'FROST_CRYSTAL_GOLEM', count: 4, interval: 2.4, delay: 3 }
    ]
  },
  {
    waveNumber: 9,
    name: 'Đợt 9: Bão Tố Tam Giới Cực Bắc (Tam Tuyến)',
    rewardGold: 195,
    enemies: [
      { typeId: 'FROST_CRYSTAL_GOLEM', count: 5, interval: 2.0, delay: 0 },
      { typeId: 'STORM_CALLER_SIREN', count: 5, interval: 1.8, delay: 3 },
      { typeId: 'WINGED_GARGOYLE', count: 8, interval: 1.4, delay: 5 }
    ]
  },
  {
    waveNumber: 10,
    name: 'Đợt 10: Trùm Hắc Long Giá Lạnh',
    rewardGold: 400,
    enemies: [
      { typeId: 'FROST_CRYSTAL_GOLEM', count: 5, interval: 2.0, delay: 0 },
      { typeId: 'STORM_CALLER_SIREN', count: 4, interval: 2.0, delay: 3 },
      { typeId: 'DARK_DRAGON_BOSS', count: 1, interval: 1.0, delay: 8 }
    ]
  },
  ...WAVES_EXTENDED_POST_10
];

export const MAP_FROZEN_CITADEL: MapConfig = {
  id: 'frozen_citadel',
  name: 'Băng Đảo Cực Bắc',
  subtitle: 'Song thủy lộ & Đường bộ uốn Z',
  description: 'Hai dòng sông băng cuồn cuộn ép vào hai sườn đồi, kẹp chặt con đường bộ quanh co ở trung tâm.',
  themeColor: '#0a192f',
  roadColor: '#64748b',
  riverColor: '#38bdf8',
  width: 1000,
  height: 650,
  roadWidth: 40,
  riverWidth: 38,
  groundWaypoints: [
    { x: 40, y: 325 },
    { x: 200, y: 325 },
    { x: 300, y: 220 },
    { x: 500, y: 220 },
    { x: 600, y: 430 },
    { x: 760, y: 430 },
    { x: 850, y: 325 },
    { x: 920, y: 325 }
  ],
  waterWaypoints: [
    { x: 40, y: 90 },
    { x: 300, y: 90 },
    { x: 580, y: 110 },
    { x: 780, y: 170 },
    { x: 920, y: 325 }
  ],
  airStart: { x: 40, y: 60 },
  airWaypoints: [
    { x: 40, y: 60 },
    { x: 480, y: 200 },
    { x: 920, y: 325 }
  ],
  playerBase: { x: 920, y: 325, radius: 45 },
  groundSpawn: { x: 40, y: 325 },
  waterSpawn: { x: 40, y: 90 },
  towerSlots: [],
  waves: WAVES_FROZEN_CITADEL,
  groundLanes: [
    [
      { x: 40, y: 325 },
      { x: 200, y: 325 },
      { x: 300, y: 220 },
      { x: 500, y: 220 },
      { x: 600, y: 430 },
      { x: 760, y: 430 },
      { x: 850, y: 325 },
      { x: 920, y: 325 }
    ]
  ],
  waterLanes: [
    // Sông Băng Bắc
    [
      { x: 40, y: 90 },
      { x: 300, y: 90 },
      { x: 580, y: 110 },
      { x: 780, y: 170 },
      { x: 920, y: 325 }
    ],
    // Sông Băng Nam
    [
      { x: 40, y: 560 },
      { x: 300, y: 560 },
      { x: 580, y: 540 },
      { x: 780, y: 480 },
      { x: 920, y: 325 }
    ]
  ],
  airLanes: [
    [
      { x: 40, y: 60 },
      { x: 480, y: 200 },
      { x: 920, y: 325 }
    ],
    [
      { x: 40, y: 590 },
      { x: 480, y: 450 },
      { x: 920, y: 325 }
    ]
  ],
  groundSpawns: [
    { x: 40, y: 325 }
  ],
  waterSpawns: [
    { x: 40, y: 90 },  // Thủy Cổng Bắc
    { x: 40, y: 560 }  // Thủy Cổng Nam
  ],
  airStarts: [
    { x: 40, y: 60 },
    { x: 40, y: 590 }
  ],
  laneBadges: ['1 Tuyến Bộ Uốn Z', '2 Dòng Sông Băng', 'Song Thủy Đột Kích'],
  tribe: {
    name: 'Tộc Hàn Băng Tuyết Linh',
    icon: '❄️🧚',
    elements: ['ICE', 'FAIRY', 'WATER'],
    description: 'Quân đoàn băng giá Khổng Lồ Băng Nham phối hợp cùng Tiên Linh Băng Tuyết và Thủy Xà Băng Đảo.'
  }
};

