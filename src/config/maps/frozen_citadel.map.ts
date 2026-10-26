import { MapConfig, WaveConfig } from '../map.config.js';
import { ELEMENT_ICONS } from '../elements.config.js';
import { EXTENDED_WAVES_FROZEN_CITADEL } from './waves_extended.js';

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
    name: 'Đợt 10: Trùm Băng Đế Cực Hàn Giáng Thế',
    rewardGold: 400,
    enemies: [
      { typeId: 'FROST_CRYSTAL_GOLEM', count: 5, interval: 2.0, delay: 0 },
      { typeId: 'STORM_CALLER_SIREN', count: 4, interval: 2.0, delay: 3 },
      { typeId: 'GLACIAL_TITAN_BOSS', count: 1, interval: 1.0, delay: 8 }
    ]
  }
];

export const MAP_FROZEN_CITADEL: MapConfig = {
  id: 'frozen_citadel',
  name: 'Băng Đảo Cực Bắc',
  subtitle: 'Nhà Chính Đỉnh Cực Bắc & Hướng Nam->Bắc',
  description: 'Thành lũy băng tọa lạc tại đỉnh Bắc. Quân đoàn băng tuyết đổ bộ từ bờ biển phía Nam tiến ngược lên trên.',
  themeColor: '#0a192f',
  roadColor: '#64748b',
  riverColor: '#38bdf8',
  roadWidth: 40,
  riverWidth: 38,
  playerBases: [
    { x: 500, y: 75, radius: 45 }
  ],
  groundLanes: [
    // Tuyến Bộ Tây Nam -> Đỉnh Bắc (Nhà chính 1)
    [
      { x: 120, y: 610 },
      { x: 120, y: 420 },
      { x: 360, y: 360 },
      { x: 360, y: 180 },
      1
    ],
    // Tuyến Bộ Đông Nam -> Đỉnh Bắc (Nhà chính 1)
    [
      { x: 880, y: 610 },
      { x: 880, y: 420 },
      { x: 640, y: 360 },
      { x: 640, y: 180 },
      1
    ]
  ],
  waterLanes: [
    // Sông Băng Tây
    [
      { x: 40, y: 520 },
      { x: 220, y: 480 },
      { x: 240, y: 240 },
      { x: 380, y: 110 },
      1
    ],
    // Sông Băng Đông
    [
      { x: 960, y: 520 },
      { x: 780, y: 480 },
      { x: 760, y: 240 },
      { x: 620, y: 110 },
      1
    ]
  ],
  airLanes: [
    [
      { x: 80, y: 590 },
      { x: 300, y: 280 },
      1
    ],
    [
      { x: 920, y: 590 },
      { x: 700, y: 280 },
      1
    ]
  ],
  waves: WAVES_FROZEN_CITADEL,
  extendedWaves: EXTENDED_WAVES_FROZEN_CITADEL,
  laneBadges: ['1 Nhà Chính Đỉnh Cực Bắc', 'Tiến Quân Nam -> Bắc', '2 Dòng Sông Băng'],
  tribe: {
    name: 'Tộc Hàn Băng Tuyết Linh',
    icon: `${ELEMENT_ICONS.ICE}${ELEMENT_ICONS.FAIRY}`,
    elements: ['ICE', 'FAIRY', 'WATER'],
    description: 'Quân đoàn băng giá Khổng Lồ Băng Nham phối hợp cùng Tiên Linh Băng Tuyết và Thủy Xà Băng Đảo.'
  }
};
