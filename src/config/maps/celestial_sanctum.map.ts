import { MapConfig, WaveConfig } from '../map.config.js';
import { EXTENDED_WAVES_CELESTIAL_SANCTUM } from './waves_extended.js';

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
  }
];

export const MAP_CELESTIAL_SANCTUM: MapConfig = {
  id: 'celestial_sanctum',
  name: 'Thánh Điện Thiên Không',
  subtitle: 'Đối Kích Tây Bắc & Đông Bắc - Giao Cắt Chữ X',
  description: 'Tuyến 1 xuất phát từ Tây Bắc, Tuyến 2 xuất phát từ góc trên bên phải (Đông Bắc), cắt chéo nhau qua giao lộ trung tâm trước khi tiến về Song Điện Thánh.',
  themeColor: '#0a192f',
  roadColor: '#ca8a04',
  riverColor: '#38bdf8',
  width: 1000,
  height: 650,
  roadWidth: 38,
  riverWidth: 34,
  groundWaypoints: [
    { x: 40, y: 110 },
    { x: 260, y: 110 },
    { x: 380, y: 200 },
    { x: 500, y: 325 },
    { x: 640, y: 460 },
    { x: 840, y: 530 },
    { x: 860, y: 380 },
    { x: 780, y: 325 },
    { x: 670, y: 325 }
  ],
  waterWaypoints: [
    { x: 180, y: 0 },
    { x: 320, y: 160 },
    { x: 500, y: 325 },
    { x: 680, y: 460 },
    { x: 760, y: 390 },
    { x: 670, y: 325 }
  ],
  airStart: { x: 40, y: 60 },
  airWaypoints: [
    { x: 40, y: 60 },
    { x: 500, y: 325 },
    { x: 670, y: 325 }
  ],
  playerBase: { x: 330, y: 325, radius: 42 },
  playerBases: [
    { x: 330, y: 325, radius: 42 }, // Thánh Điện Tây
    { x: 670, y: 325, radius: 42 }  // Thánh Điện Đông
  ],
  groundSpawn: { x: 40, y: 110 },
  waterSpawn: { x: 180, y: 0 },
  towerSlots: [],
  waves: WAVES_CELESTIAL_SANCTUM,
  extendedWaves: EXTENDED_WAVES_CELESTIAL_SANCTUM,
  groundLanes: [
    // Tuyến 1: Tây Bắc (40, 110) -> cắt qua tâm (500, 325) -> vòng qua Đông Nam -> về Điện Đông (670, 325)
    [
      { x: 40, y: 110 },
      { x: 260, y: 110 },
      { x: 380, y: 200 },
      { x: 500, y: 325 },
      { x: 640, y: 460 },
      { x: 840, y: 530 },
      { x: 860, y: 380 },
      { x: 780, y: 325 },
      { x: 670, y: 325 }
    ],
    // Tuyến 2: Xuất phát góc trên bên phải bản đồ (960, 110) -> cắt qua tâm (500, 325) -> vòng qua Tây Nam -> về Điện Tây (330, 325)
    [
      { x: 960, y: 110 },
      { x: 740, y: 110 },
      { x: 620, y: 200 },
      { x: 500, y: 325 },
      { x: 360, y: 460 },
      { x: 160, y: 530 },
      { x: 140, y: 380 },
      { x: 220, y: 325 },
      { x: 330, y: 325 }
    ]
  ],
  waterLanes: [
    // Suối Thánh 1: Tây Bắc xuống Đông Nam rồi rẽ vào Điện Đông
    [
      { x: 180, y: 0 },
      { x: 320, y: 160 },
      { x: 500, y: 325 },
      { x: 680, y: 460 },
      { x: 760, y: 390 },
      { x: 670, y: 325 }
    ],
    // Suối Thánh 2: Đông Bắc xuống Tây Nam rồi rẽ vào Điện Tây
    [
      { x: 820, y: 0 },
      { x: 680, y: 160 },
      { x: 500, y: 325 },
      { x: 320, y: 460 },
      { x: 240, y: 390 },
      { x: 330, y: 325 }
    ]
  ],
  airLanes: [
    [
      { x: 40, y: 60 },
      { x: 500, y: 325 },
      { x: 670, y: 325 }
    ],
    [
      { x: 960, y: 60 },
      { x: 500, y: 325 },
      { x: 330, y: 325 }
    ]
  ],
  groundSpawns: [
    { x: 40, y: 110 },
    { x: 960, y: 110 }
  ],
  waterSpawns: [
    { x: 180, y: 0 },
    { x: 820, y: 0 }
  ],
  airStarts: [
    { x: 40, y: 60 },
    { x: 960, y: 60 }
  ],
  laneBadges: ['2 Nhà Chính Song Điện', 'Đối Kích Tây Bắc & Đông Bắc', 'Giao Cắt Chữ X'],
  tribe: {
    name: 'Tộc Thiên Sứ Quang Phong',
    icon: '✨🌪️🧚',
    elements: ['LIGHT', 'WIND', 'FAIRY'],
    description: 'Thánh điện trên không trung do Đại Thiên Sứ Tối Thượng cai quản, quy tụ Thánh Kỵ Sĩ, Thiên Sứ Hộ Vệ và Vu Nữ Thủy Triều.'
  }
};

