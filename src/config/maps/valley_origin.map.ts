import { MapConfig, WaveConfig } from '../map.config.js';
import { EXTENDED_WAVES_VALLEY_ORIGIN } from './waves_extended.js';

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
    name: 'Đợt 3: Tiên Phong Mộc Tinh (Đi Bộ)',
    rewardGold: 80,
    enemies: [
      { typeId: 'STICK_WARRIOR', count: 4, interval: 1.8, delay: 0 },
      { typeId: 'TREANT_GUARD', count: 3, interval: 2.5, delay: 3 }
    ]
  },
  // Wave 4: Chỉ quái bay
  {
    waveNumber: 4,
    name: 'Đợt 4: Tiên Linh Hoa Gió Không Kích (Chỉ Quái Bay)',
    rewardGold: 95,
    enemies: [
      { typeId: 'FAIRY_SPRITE', count: 7, interval: 1.7, delay: 0 }
    ]
  },
  // Wave 5: Chỉ quái dưới nước
  {
    waveNumber: 5,
    name: 'Đợt 5: Rùa Rêu Suối Nguồn (Chỉ Quái Bơi)',
    rewardGold: 110,
    enemies: [
      { typeId: 'MOSS_TURTLE', count: 6, interval: 2.0, delay: 0 }
    ]
  },
  // Sau wave 5: Xuất hiện nhiều hơn 1 loại đường
  {
    waveNumber: 6,
    name: 'Đợt 6: Hỗn Hợp Thủy Lục Rừng Xanh (Bộ & Nước)',
    rewardGold: 120,
    enemies: [
      { typeId: 'TREANT_GUARD', count: 5, interval: 1.8, delay: 0 },
      { typeId: 'MOSS_TURTLE', count: 4, interval: 2.0, delay: 3 }
    ]
  },
  {
    waveNumber: 7,
    name: 'Đợt 7: Vũ Khúc Tiên Linh (Bộ & Bay)',
    rewardGold: 135,
    enemies: [
      { typeId: 'TREANT_GUARD', count: 6, interval: 1.5, delay: 0 },
      { typeId: 'FAIRY_SPRITE', count: 6, interval: 1.8, delay: 3 }
    ]
  },
  {
    waveNumber: 8,
    name: 'Đợt 8: Tổng Lực Tam Tuyến Thung Lũng (Bộ, Bay & Nước)',
    rewardGold: 150,
    enemies: [
      { typeId: 'TREANT_GUARD', count: 4, interval: 2.2, delay: 0 },
      { typeId: 'FAIRY_SPRITE', count: 7, interval: 1.6, delay: 2 },
      { typeId: 'MOSS_TURTLE', count: 5, interval: 2.0, delay: 5 }
    ]
  },
  {
    waveNumber: 9,
    name: 'Đợt 9: Đại Quân Rừng Rậm Trỗi Dậy (Hỗn Hợp)',
    rewardGold: 175,
    enemies: [
      { typeId: 'TREANT_GUARD', count: 6, interval: 1.6, delay: 0 },
      { typeId: 'FAIRY_SPRITE', count: 8, interval: 1.4, delay: 3 },
      { typeId: 'MOSS_TURTLE', count: 6, interval: 1.7, delay: 6 },
      { typeId: 'ROCK_GOLEM', count: 3, interval: 2.5, delay: 8 }
    ]
  },
  {
    waveNumber: 10,
    name: 'Đợt 10: Trùm Cổ Thụ Tinh Vương Thức Tỉnh',
    rewardGold: 300,
    enemies: [
      { typeId: 'TREANT_GUARD', count: 6, interval: 1.5, delay: 0 },
      { typeId: 'FAIRY_SPRITE', count: 6, interval: 1.5, delay: 3 },
      { typeId: 'ANCIENT_TREANT_BOSS', count: 1, interval: 1.0, delay: 8 }
    ]
  }
];

export const MAP_VALLEY_ORIGIN: MapConfig = {
  id: 'valley_origin',
  name: 'Thung Lũng Khởi Nguyên',
  subtitle: 'Đường uốn chữ S kinh điển',
  description: 'Địa hình lòng chảo với đường bộ uốn quanh co và dòng suối băng qua từ phương Bắc.',
  themeColor: '#1e293b',
  roadColor: '#b45309',
  riverColor: '#0284c7',
  roadWidth: 42,
  riverWidth: 38,
  playerBases: [
    { x: 920, y: 480, radius: 45 }
  ],
  groundLanes: [
    [
      { x: 40, y: 160 },
      { x: 220, y: 160 },
      { x: 300, y: 240 },
      { x: 300, y: 420 },
      { x: 460, y: 500 },
      { x: 620, y: 460 },
      { x: 650, y: 260 },
      { x: 780, y: 220 },
      { x: 880, y: 320 },
      1
    ]
  ],
  waterLanes: [
    [
      { x: 340, y: 0 },
      { x: 380, y: 150 },
      { x: 450, y: 280 },
      { x: 540, y: 360 },
      { x: 700, y: 420 },
      { x: 820, y: 460 },
      1
    ]
  ],
  airLanes: [
    [
      { x: 40, y: 60 },
      { x: 380, y: 100 },
      { x: 680, y: 180 },
      1
    ]
  ],
  waves: WAVES_VALLEY_ORIGIN,
  extendedWaves: EXTENDED_WAVES_VALLEY_ORIGIN,
  laneBadges: ['1 Nhà Chính Đông Nam', '1 Tuyến Bộ Uốn S', '1 Dòng Suối'],
  tribe: {
    name: 'Tộc Mộc Tinh & Tiên Linh',
    icon: '🌿🧚',
    elements: ['GRASS', 'FAIRY', 'PHYSICAL'],
    description: 'Thung lũng ngập tràn sức sống cỏ cây với Mộc Tinh Chiến Binh, Tiên Linh Hoa Gió và Rùa Rêu Suối Nguồn.'
  }
};
