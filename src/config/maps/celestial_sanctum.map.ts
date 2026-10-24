import { MapConfig, WaveConfig } from '../map.config.js';
import { WAVES_EXTENDED_POST_10 } from './waves_extended.js';

export const WAVES_CELESTIAL_SANCTUM: WaveConfig[] = [
  {
    waveNumber: 1,
    name: 'Đợt 1: Tiền Đồn Vân Thiên (Đi Bộ)',
    rewardGold: 60,
    enemies: [
      { typeId: 'STICK_RUNNER', count: 10, interval: 1.2, delay: 0 }
    ]
  },
  {
    waveNumber: 2,
    name: 'Đợt 2: Tuần Tra Thánh Điện (Đi Bộ)',
    rewardGold: 75,
    enemies: [
      { typeId: 'STICK_RUNNER', count: 6, interval: 1.0, delay: 0 },
      { typeId: 'STICK_WARRIOR', count: 6, interval: 1.5, delay: 2 },
      { typeId: 'LIGHT_PALADIN', count: 2, interval: 2.5, delay: 4 }
    ]
  },
  {
    waveNumber: 3,
    name: 'Đợt 3: Thánh Kỵ Binh Hộ Vệ (Đi Bộ)',
    rewardGold: 95,
    enemies: [
      { typeId: 'STICK_WARRIOR', count: 6, interval: 1.4, delay: 0 },
      { typeId: 'LIGHT_PALADIN', count: 4, interval: 2.0, delay: 2 },
      { typeId: 'DRUID_SHAMAN', count: 3, interval: 2.5, delay: 5 }
    ]
  },
  {
    waveNumber: 4,
    name: 'Đợt 4: Thiên Sứ Vũ Không (Chỉ Quái Bay)',
    rewardGold: 110,
    enemies: [
      { typeId: 'SERAPH_VALKYRIE', count: 5, interval: 1.8, delay: 0 },
      { typeId: 'FAIRY_SPRITE', count: 6, interval: 1.4, delay: 3 }
    ]
  },
  {
    waveNumber: 5,
    name: 'Đợt 5: Suối Thánh Dâng Trào (Chỉ Quái Bơi)',
    rewardGold: 125,
    enemies: [
      { typeId: 'TIDAL_PRIESTESS', count: 4, interval: 2.0, delay: 0 },
      { typeId: 'MOSS_TURTLE', count: 4, interval: 2.2, delay: 3 }
    ]
  },
  {
    waveNumber: 6,
    name: 'Đợt 6: Quang Triều Hợp Kích (Bộ & Nước)',
    rewardGold: 145,
    enemies: [
      { typeId: 'LIGHT_PALADIN', count: 5, interval: 1.8, delay: 0 },
      { typeId: 'DRUID_SHAMAN', count: 4, interval: 2.2, delay: 2 },
      { typeId: 'TIDAL_PRIESTESS', count: 4, interval: 2.0, delay: 4 }
    ]
  },
  {
    waveNumber: 7,
    name: 'Đợt 7: Vân Thiên Cuồng Bão (Bộ & Bay)',
    rewardGold: 160,
    enemies: [
      { typeId: 'LIGHT_PALADIN', count: 6, interval: 1.6, delay: 0 },
      { typeId: 'SERAPH_VALKYRIE', count: 6, interval: 1.5, delay: 2 },
      { typeId: 'WINGED_GARGOYLE', count: 6, interval: 1.2, delay: 5 }
    ]
  },
  {
    waveNumber: 8,
    name: 'Đợt 8: Phong Thủy Đồng Hành (Nước & Bay)',
    rewardGold: 180,
    enemies: [
      { typeId: 'TIDAL_PRIESTESS', count: 6, interval: 1.6, delay: 0 },
      { typeId: 'SERAPH_VALKYRIE', count: 6, interval: 1.6, delay: 2 },
      { typeId: 'FAIRY_SPRITE', count: 8, interval: 1.1, delay: 4 }
    ]
  },
  {
    waveNumber: 9,
    name: 'Đợt 9: Tam Giới Thánh Trận (Bộ, Nước & Bay)',
    rewardGold: 210,
    enemies: [
      { typeId: 'LIGHT_PALADIN', count: 6, interval: 1.5, delay: 0 },
      { typeId: 'HEX_DEGRADER', count: 3, interval: 2.8, delay: 3 },
      { typeId: 'TIDAL_PRIESTESS', count: 6, interval: 1.6, delay: 4 },
      { typeId: 'SERAPH_VALKYRIE', count: 7, interval: 1.4, delay: 6 }
    ]
  },
  {
    waveNumber: 10,
    name: 'Đợt 10: Đại Thiên Sứ Tối Thượng Thức Tỉnh',
    rewardGold: 500,
    enemies: [
      { typeId: 'LIGHT_PALADIN', count: 6, interval: 1.8, delay: 0 },
      { typeId: 'TIDAL_PRIESTESS', count: 5, interval: 1.6, delay: 3 },
      { typeId: 'HEX_DEGRADER', count: 2, interval: 3.0, delay: 5 },
      { typeId: 'ARCHANGEL_MONARCH_BOSS', count: 1, interval: 1.0, delay: 8 }
    ]
  },
  ...WAVES_EXTENDED_POST_10
];

export const MAP_CELESTIAL_SANCTUM: MapConfig = {
  id: 'celestial_sanctum',
  name: 'Thánh Điện Thiên Không',
  subtitle: 'Song đạo vân thiên - 2 Tuyến Mây Vàng & Suối Ánh Sáng',
  description: 'Cung điện lơ lửng giữa tầng mây thánh thần. Quân đoàn thiên sứ với giáp ảo, khiên phép và ánh sáng chói lòa tấn công từ 2 tuyến đường mây.',
  themeColor: '#0a192f',
  roadColor: '#ca8a04',
  riverColor: '#38bdf8',
  width: 1000,
  height: 650,
  roadWidth: 38,
  riverWidth: 34,
  groundWaypoints: [
    { x: 40, y: 150 },
    { x: 240, y: 150 },
    { x: 380, y: 270 },
    { x: 580, y: 170 },
    { x: 740, y: 220 },
    { x: 920, y: 325 }
  ],
  waterWaypoints: [
    { x: 40, y: 325 },
    { x: 260, y: 325 },
    { x: 480, y: 400 },
    { x: 680, y: 325 },
    { x: 920, y: 325 }
  ],
  airStart: { x: 40, y: 80 },
  airWaypoints: [
    { x: 40, y: 80 },
    { x: 480, y: 220 },
    { x: 920, y: 325 }
  ],
  playerBase: { x: 920, y: 325, radius: 45 },
  groundSpawn: { x: 40, y: 150 },
  waterSpawn: { x: 40, y: 325 },
  towerSlots: [],
  waves: WAVES_CELESTIAL_SANCTUM,
  groundLanes: [
    // Tuyến Mây Bắc
    [
      { x: 40, y: 150 },
      { x: 240, y: 150 },
      { x: 380, y: 270 },
      { x: 580, y: 170 },
      { x: 740, y: 220 },
      { x: 920, y: 325 }
    ],
    // Tuyến Mây Nam
    [
      { x: 40, y: 500 },
      { x: 240, y: 500 },
      { x: 380, y: 380 },
      { x: 580, y: 480 },
      { x: 740, y: 430 },
      { x: 920, y: 325 }
    ]
  ],
  waterLanes: [
    [
      { x: 40, y: 325 },
      { x: 260, y: 325 },
      { x: 480, y: 400 },
      { x: 680, y: 325 },
      { x: 920, y: 325 }
    ]
  ],
  airLanes: [
    [
      { x: 40, y: 80 },
      { x: 480, y: 220 },
      { x: 920, y: 325 }
    ],
    [
      { x: 40, y: 570 },
      { x: 480, y: 430 },
      { x: 920, y: 325 }
    ]
  ],
  groundSpawns: [
    { x: 40, y: 150 },
    { x: 40, y: 500 }
  ],
  waterSpawns: [
    { x: 40, y: 325 }
  ],
  airStarts: [
    { x: 40, y: 80 },
    { x: 40, y: 570 }
  ],
  laneBadges: ['2 Tuyến Mây Vàng', 'Suối Thánh Quang', 'Quân Đoàn Thiên Sứ'],
  tribe: {
    name: 'Tộc Thiên Sứ Quang Phong',
    icon: '✨🌪️🧚',
    elements: ['LIGHT', 'WIND', 'FAIRY'],
    description: 'Thánh điện trên không trung do Đại Thiên Sứ Tối Thượng cai quản, quy tụ Thánh Kỵ Sĩ, Thiên Sứ Hộ Vệ và Vu Nữ Thủy Triều.'
  }
};

