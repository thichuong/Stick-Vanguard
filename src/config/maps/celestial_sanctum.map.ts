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
      { typeId: 'STICK_WARRIOR', count: 6, interval: 1.4, delay: 2 },
      { typeId: 'LIGHT_PALADIN', count: 4, interval: 2.2, delay: 4 }
    ]
  },
  {
    waveNumber: 3,
    name: 'Đợt 3: Thánh Kỵ Binh Hộ Vệ (Đi Bộ)',
    rewardGold: 95,
    enemies: [
      { typeId: 'STICK_WARRIOR', count: 8, interval: 1.3, delay: 0 },
      { typeId: 'LIGHT_PALADIN', count: 6, interval: 1.8, delay: 2 },
      { typeId: 'DRUID_SHAMAN', count: 4, interval: 2.2, delay: 5 }
    ]
  },
  {
    waveNumber: 4,
    name: 'Đợt 4: Thiên Sứ Vũ Không (6 Tuyến Quái Bay)',
    rewardGold: 120,
    enemies: [
      { typeId: 'SERAPH_VALKYRIE', count: 12, interval: 1.2, delay: 0 },
      { typeId: 'FAIRY_SPRITE', count: 18, interval: 0.8, delay: 3 }
    ]
  },
  {
    waveNumber: 5,
    name: 'Đợt 5: Suối Thánh Dâng Trào (Chỉ Quái Bơi)',
    rewardGold: 135,
    enemies: [
      { typeId: 'TIDAL_PRIESTESS', count: 6, interval: 1.8, delay: 0 },
      { typeId: 'MOSS_TURTLE', count: 6, interval: 2.0, delay: 2 },
      { typeId: 'AQUA_SERPENT', count: 4, interval: 1.5, delay: 6 }
    ]
  },
  {
    waveNumber: 6,
    name: 'Đợt 6: Quang Triều Hợp Kích (Bộ & Nước)',
    rewardGold: 155,
    enemies: [
      { typeId: 'LIGHT_PALADIN', count: 8, interval: 1.5, delay: 0 },
      { typeId: 'DRUID_SHAMAN', count: 4, interval: 2.0, delay: 2 },
      { typeId: 'TIDAL_PRIESTESS', count: 6, interval: 1.6, delay: 3 },
      { typeId: 'MOSS_TURTLE', count: 4, interval: 2.0, delay: 5 }
    ]
  },
  {
    waveNumber: 7,
    name: 'Đợt 7: Vân Thiên Cuồng Bão (Bộ & 6 Tuyến Bay)',
    rewardGold: 175,
    enemies: [
      { typeId: 'LIGHT_PALADIN', count: 8, interval: 1.5, delay: 0 },
      { typeId: 'SERAPH_VALKYRIE', count: 12, interval: 1.2, delay: 2 },
      { typeId: 'WINGED_GARGOYLE', count: 12, interval: 1.0, delay: 5 }
    ]
  },
  {
    waveNumber: 8,
    name: 'Đợt 8: Phong Thủy Đồng Hành (Nước & 6 Tuyến Bay)',
    rewardGold: 200,
    enemies: [
      { typeId: 'TIDAL_PRIESTESS', count: 8, interval: 1.5, delay: 0 },
      { typeId: 'AQUA_SERPENT', count: 6, interval: 1.4, delay: 2 },
      { typeId: 'SERAPH_VALKYRIE', count: 12, interval: 1.2, delay: 4 },
      { typeId: 'FAIRY_SPRITE', count: 18, interval: 0.8, delay: 6 }
    ]
  },
  {
    waveNumber: 9,
    name: 'Đợt 9: Tam Giới Thánh Trận (Bộ, Nước & 6 Tuyến Bay)',
    rewardGold: 240,
    enemies: [
      { typeId: 'LIGHT_PALADIN', count: 8, interval: 1.4, delay: 0 },
      { typeId: 'CELESTIAL_FAIRY', count: 4, interval: 2.5, delay: 2 },
      { typeId: 'TIDAL_PRIESTESS', count: 8, interval: 1.4, delay: 3 },
      { typeId: 'SERAPH_VALKYRIE', count: 12, interval: 1.2, delay: 5 },
      { typeId: 'WINGED_GARGOYLE', count: 12, interval: 1.0, delay: 7 }
    ]
  },
  {
    waveNumber: 10,
    name: 'Đợt 10: Song Đại Thiên Sứ Tối Thượng Thức Tỉnh',
    rewardGold: 550,
    enemies: [
      { typeId: 'LIGHT_PALADIN', count: 8, interval: 1.5, delay: 0 },
      { typeId: 'TIDAL_PRIESTESS', count: 6, interval: 1.6, delay: 3 },
      { typeId: 'CELESTIAL_FAIRY', count: 4, interval: 2.5, delay: 5 },
      { typeId: 'SERAPH_VALKYRIE', count: 6, interval: 1.5, delay: 7 },
      { typeId: 'ARCHANGEL_MONARCH_BOSS', count: 2, interval: 3.0, delay: 10 }
    ]
  }
];

export const MAP_CELESTIAL_SANCTUM: MapConfig = {
  id: 'celestial_sanctum',
  name: 'Thánh Điện Thiên Không',
  subtitle: 'Song Điện Thánh - Giao Cắt Chữ X & 6 Hành Lang Không Chiến',
  description: 'Chiến trường trên tầng mây bảo vệ Song Điện (Tây & Đông). Bộ binh đối kích cắt chéo qua Giao Lộ Hoàng Kim, thủy lộ uốn lượn qua hai hồ thánh, cùng 6 hành lang không chiến tấn công từ mọi hướng.',
  themeColor: '#0a192f',
  roadColor: '#ca8a04',
  riverColor: '#38bdf8',
  roadWidth: 38,
  riverWidth: 34,
  playerBases: [
    { x: 320, y: 325, radius: 42 }, // 1: Thánh Điện Tây
    { x: 680, y: 325, radius: 42 }  // 2: Thánh Điện Đông
  ],
  groundLanes: [
    // Tuyến 1: Tây Bắc (40, 110) -> cắt qua tâm (500, 325) -> vòng qua Đông Nam -> về Điện Đông (2)
    [
      { x: 40, y: 110 },
      { x: 260, y: 110 },
      { x: 380, y: 190 },
      { x: 500, y: 325 },
      { x: 620, y: 460 },
      { x: 820, y: 530 },
      { x: 880, y: 430 },
      { x: 880, y: 325 },
      2
    ],
    // Tuyến 2: Đông Bắc (960, 110) -> cắt qua tâm (500, 325) -> vòng qua Tây Nam -> về Điện Tây (1)
    [
      { x: 960, y: 110 },
      { x: 740, y: 110 },
      { x: 620, y: 190 },
      { x: 500, y: 325 },
      { x: 380, y: 460 },
      { x: 180, y: 530 },
      { x: 120, y: 430 },
      { x: 120, y: 325 },
      1
    ]
  ],
  waterLanes: [
    // Suối Thánh Thượng Giới (Bắc): Bắt đầu từ (180, 0), uốn qua Hồ Bắc (500, 160) về Điện Đông (2)
    [
      { x: 180, y: 0 },
      { x: 180, y: 110 },
      { x: 220, y: 200 },
      { x: 340, y: 230 },
      { x: 500, y: 160 },
      { x: 660, y: 230 },
      { x: 760, y: 230 },
      { x: 740, y: 300 },
      2
    ],
    // Suối Thánh Hạ Giới (Nam): Bắt đầu từ (820, 650), uốn qua Hồ Nam (500, 490) về Điện Tây (1)
    [
      { x: 820, y: 650 },
      { x: 820, y: 530 },
      { x: 780, y: 450 },
      { x: 660, y: 420 },
      { x: 500, y: 490 },
      { x: 340, y: 420 },
      { x: 240, y: 420 },
      { x: 260, y: 350 },
      1
    ]
  ],
  airLanes: [
    // Tuyến 1: Không Đạo Đông Bắc -> Điện Tây (1)
    [
      { x: 960, y: 50 },
      { x: 640, y: 170 },
      1
    ],
    // Tuyến 2: Không Đạo Tây Bắc -> Điện Đông (2)
    [
      { x: 40, y: 50 },
      { x: 360, y: 170 },
      2
    ],
    // Tuyến 3: Không Đạo Chính Bắc -> Điện Tây (1)
    [
      { x: 500, y: 15 },
      { x: 420, y: 160 },
      1
    ],
    // Tuyến 4: Không Đạo Chính Nam -> Điện Đông (2)
    [
      { x: 500, y: 635 },
      { x: 580, y: 490 },
      2
    ],
    // Tuyến 5: Không Đạo Đông Nam -> Điện Tây (1)
    [
      { x: 960, y: 600 },
      { x: 640, y: 480 },
      1
    ],
    // Tuyến 6: Không Đạo Tây Nam -> Điện Đông (2)
    [
      { x: 40, y: 600 },
      { x: 360, y: 480 },
      2
    ]
  ],
  waves: WAVES_CELESTIAL_SANCTUM,
  extendedWaves: EXTENDED_WAVES_CELESTIAL_SANCTUM,
  laneBadges: ['2 Nhà Chính Song Điện', 'Giao Cắt Chữ X', 'Suối Thánh Thượng - Hạ', '6 Hành Lang Không Chiến'],
  tribe: {
    name: 'Tộc Thiên Sứ Quang Phong',
    icon: '✨🌪️🧚',
    elements: ['LIGHT', 'WIND', 'FAIRY'],
    description: 'Thánh điện trên không trung do Đại Thiên Sứ Tối Thượng cai quản, quy tụ Thánh Kỵ Sĩ, Thiên Sứ Hộ Vệ và Vu Nữ Thủy Triều.'
  }
};
