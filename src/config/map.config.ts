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

export interface MapConfig {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  themeColor: string;
  roadColor: string;
  riverColor: string;
  width: number;
  height: number;
  groundWaypoints: Vector2D[];
  waterWaypoints: Vector2D[];
  airStart: Vector2D;
  airWaypoints: Vector2D[];
  playerBase: { x: number; y: number; radius: number };
  groundSpawn: Vector2D;
  waterSpawn: Vector2D;
  roadWidth: number;
  riverWidth: number;
  towerSlots: TowerSlot[];
  waves: WaveConfig[];
}

// Distance helper from point (px, py) to segment (x1, y1)-(x2, y2)
export function getDistanceToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): { distance: number; closestPoint: Vector2D } {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    return {
      distance: Math.hypot(px - x1, py - y1),
      closestPoint: { x: x1, y: y1 }
    };
  }

  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;

  return {
    distance: Math.hypot(px - projX, py - projY),
    closestPoint: { x: projX, y: projY }
  };
}

// Distance from point (px, py) to continuous polyline
export function getDistanceToPolyline(
  px: number,
  py: number,
  waypoints: Vector2D[]
): { distance: number; closestPoint: Vector2D } {
  if (waypoints.length === 0) {
    return { distance: Infinity, closestPoint: { x: px, y: py } };
  }
  if (waypoints.length === 1) {
    return {
      distance: Math.hypot(px - waypoints[0].x, py - waypoints[0].y),
      closestPoint: { ...waypoints[0] }
    };
  }

  let minDistance = Infinity;
  let closestPoint = { ...waypoints[0] };

  for (let i = 0; i < waypoints.length - 1; i++) {
    const p1 = waypoints[i];
    const p2 = waypoints[i + 1];
    const res = getDistanceToSegment(px, py, p1.x, p1.y, p2.x, p2.y);
    if (res.distance < minDistance) {
      minDistance = res.distance;
      closestPoint = res.closestPoint;
    }
  }

  return { distance: minDistance, closestPoint };
}

// 1. Waves for Map 1: Thung Lũng Khởi Nguyên (10 Waves)
const WAVES_VALLEY_ORIGIN: WaveConfig[] = [
  {
    waveNumber: 1,
    name: 'Đợt 1: Dân Quân Bất Tuân',
    rewardGold: 50,
    enemies: [{ typeId: 'STICK_RUNNER', count: 8, interval: 1.5, delay: 0 }]
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
      { typeId: 'WINGED_GARGOYLE', count: 5, interval: 2.2, delay: 4 }
    ]
  },
  {
    waveNumber: 4,
    name: 'Đợt 4: Sóng Ngầm Thủy Tộc (Quái Bơi)',
    rewardGold: 90,
    enemies: [
      { typeId: 'STICK_RUNNER', count: 8, interval: 1.0, delay: 0 },
      { typeId: 'AQUA_SERPENT', count: 4, interval: 2.5, delay: 3 }
    ]
  },
  {
    waveNumber: 5,
    name: 'Đợt 5: Bão Lửa Xung Phong',
    rewardGold: 100,
    enemies: [
      { typeId: 'FIRE_IMP', count: 8, interval: 1.2, delay: 0 },
      { typeId: 'WINGED_GARGOYLE', count: 4, interval: 2.0, delay: 4 }
    ]
  },
  {
    waveNumber: 6,
    name: 'Đợt 6: Khiên Đá Kiên Cố',
    rewardGold: 110,
    enemies: [
      { typeId: 'ROCK_GOLEM', count: 4, interval: 3.0, delay: 0 },
      { typeId: 'STICK_RUNNER', count: 10, interval: 0.9, delay: 3 }
    ]
  },
  {
    waveNumber: 7,
    name: 'Đợt 7: Hồn Ma Hư Vô (Xuyên Lính Chặn)',
    rewardGold: 125,
    enemies: [
      { typeId: 'SHADOW_WRAITH', count: 6, interval: 2.0, delay: 0 },
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
      { typeId: 'DARK_DRAGON_BOSS', count: 1, interval: 1.0, delay: 8 }
    ]
  }
];

// 2. Waves for Map 2: Giao Lộ Sinh Tử (12 Waves)
const WAVES_TWIN_CROSSROADS: WaveConfig[] = [
  ...WAVES_VALLEY_ORIGIN.slice(0, 5),
  {
    waveNumber: 6,
    name: 'Đợt 6: Xung Đột Thủy Lục',
    rewardGold: 110,
    enemies: [
      { typeId: 'STICK_WARRIOR', count: 6, interval: 1.5, delay: 0 },
      { typeId: 'AQUA_SERPENT', count: 6, interval: 1.8, delay: 3 }
    ]
  },
  {
    waveNumber: 7,
    name: 'Đợt 7: Bão Tố Song Hành',
    rewardGold: 120,
    enemies: [
      { typeId: 'FIRE_IMP', count: 8, interval: 1.0, delay: 0 },
      { typeId: 'WINGED_GARGOYLE', count: 6, interval: 1.8, delay: 4 }
    ]
  },
  {
    waveNumber: 8,
    name: 'Đợt 8: Thiết Giáp Thạch Nham',
    rewardGold: 135,
    enemies: [
      { typeId: 'ROCK_GOLEM', count: 5, interval: 2.6, delay: 0 },
      { typeId: 'STICK_RUNNER', count: 12, interval: 0.8, delay: 2 }
    ]
  },
  {
    waveNumber: 9,
    name: 'Đợt 9: Thủy Quái Đột Kích',
    rewardGold: 150,
    enemies: [
      { typeId: 'AQUA_SERPENT', count: 8, interval: 1.5, delay: 0 },
      { typeId: 'SHADOW_WRAITH', count: 5, interval: 2.0, delay: 4 }
    ]
  },
  {
    waveNumber: 10,
    name: 'Đợt 10: Tinh Nhuệ Hắc Ám',
    rewardGold: 170,
    enemies: [
      { typeId: 'SHADOW_WRAITH', count: 7, interval: 1.5, delay: 0 },
      { typeId: 'ROCK_GOLEM', count: 4, interval: 2.2, delay: 3 },
      { typeId: 'WINGED_GARGOYLE', count: 7, interval: 1.6, delay: 6 }
    ]
  },
  {
    waveNumber: 11,
    name: 'Đợt 11: Tổng Phản Công Giao Lộ',
    rewardGold: 200,
    enemies: [
      { typeId: 'STICK_WARRIOR', count: 10, interval: 1.0, delay: 0 },
      { typeId: 'AQUA_SERPENT', count: 8, interval: 1.4, delay: 2 },
      { typeId: 'FIRE_IMP', count: 10, interval: 0.9, delay: 5 }
    ]
  },
  {
    waveNumber: 12,
    name: 'Đợt 12: Đại Chiến Cầu Tử Thần - Đại Hắc Long',
    rewardGold: 350,
    enemies: [
      { typeId: 'ROCK_GOLEM', count: 5, interval: 2.0, delay: 0 },
      { typeId: 'SHADOW_WRAITH', count: 6, interval: 1.5, delay: 3 },
      { typeId: 'DARK_DRAGON_BOSS', count: 1, interval: 1.0, delay: 7 }
    ]
  }
];

// 3. Waves for Map 3: Hẻm Núi Mãng Xà (15 Waves)
const WAVES_SERPENT_CANYON: WaveConfig[] = [
  ...WAVES_TWIN_CROSSROADS.slice(0, 9),
  {
    waveNumber: 10,
    name: 'Đợt 10: Tiền Trạm Trùm - Khổng Lồ Nham Thạch',
    rewardGold: 180,
    enemies: [
      { typeId: 'ROCK_GOLEM', count: 6, interval: 2.0, delay: 0 },
      { typeId: 'FIRE_IMP', count: 12, interval: 0.8, delay: 3 }
    ]
  },
  {
    waveNumber: 11,
    name: 'Đợt 11: Mãng Xà Trườn Hẻm',
    rewardGold: 195,
    enemies: [
      { typeId: 'AQUA_SERPENT', count: 10, interval: 1.3, delay: 0 },
      { typeId: 'STICK_RUNNER', count: 15, interval: 0.7, delay: 2 }
    ]
  },
  {
    waveNumber: 12,
    name: 'Đợt 12: Không Kích Hẻm Núi',
    rewardGold: 210,
    enemies: [
      { typeId: 'WINGED_GARGOYLE', count: 10, interval: 1.4, delay: 0 },
      { typeId: 'SHADOW_WRAITH', count: 7, interval: 1.6, delay: 3 }
    ]
  },
  {
    waveNumber: 13,
    name: 'Đợt 13: Bão Lửa Vách Đá',
    rewardGold: 230,
    enemies: [
      { typeId: 'FIRE_IMP', count: 14, interval: 0.8, delay: 0 },
      { typeId: 'ROCK_GOLEM', count: 5, interval: 2.2, delay: 3 },
      { typeId: 'AQUA_SERPENT', count: 7, interval: 1.5, delay: 6 }
    ]
  },
  {
    waveNumber: 14,
    name: 'Đợt 14: Ác Mộng Trùng Điệp',
    rewardGold: 260,
    enemies: [
      { typeId: 'SHADOW_WRAITH', count: 8, interval: 1.4, delay: 0 },
      { typeId: 'WINGED_GARGOYLE', count: 8, interval: 1.3, delay: 2 },
      { typeId: 'ROCK_GOLEM', count: 6, interval: 2.0, delay: 5 }
    ]
  },
  {
    waveNumber: 15,
    name: 'Đợt 15: Quyết Chiến Đỉnh Hẻm - Song Quái Vương',
    rewardGold: 450,
    enemies: [
      { typeId: 'STICK_WARRIOR', count: 12, interval: 0.9, delay: 0 },
      { typeId: 'ROCK_GOLEM', count: 6, interval: 2.0, delay: 3 },
      { typeId: 'DARK_DRAGON_BOSS', count: 1, interval: 1.0, delay: 8 }
    ]
  }
];

// 4. Waves for Map 4: Pháo Đài Đồng Bằng (20 Waves)
const WAVES_DELTA_FORTRESS: WaveConfig[] = [
  ...WAVES_SERPENT_CANYON.slice(0, 14),
  {
    waveNumber: 15,
    name: 'Đợt 15: Đại Trận Chiến Giữa Kỳ',
    rewardGold: 270,
    enemies: [
      { typeId: 'DARK_DRAGON_BOSS', count: 1, interval: 1.0, delay: 0 },
      { typeId: 'STICK_WARRIOR', count: 10, interval: 1.0, delay: 4 }
    ]
  },
  {
    waveNumber: 16,
    name: 'Đợt 16: Thủy Hỏa Tương Tàn',
    rewardGold: 280,
    enemies: [
      { typeId: 'FIRE_IMP', count: 15, interval: 0.7, delay: 0 },
      { typeId: 'AQUA_SERPENT', count: 12, interval: 1.2, delay: 2 }
    ]
  },
  {
    waveNumber: 17,
    name: 'Đợt 17: Quân Đoàn Hư Vô Tối Thượng',
    rewardGold: 300,
    enemies: [
      { typeId: 'SHADOW_WRAITH', count: 10, interval: 1.2, delay: 0 },
      { typeId: 'WINGED_GARGOYLE', count: 10, interval: 1.2, delay: 2 },
      { typeId: 'ROCK_GOLEM', count: 6, interval: 2.0, delay: 5 }
    ]
  },
  {
    waveNumber: 18,
    name: 'Đợt 18: Công Thành Khổng Lồ',
    rewardGold: 320,
    enemies: [
      { typeId: 'ROCK_GOLEM', count: 8, interval: 1.8, delay: 0 },
      { typeId: 'STICK_RUNNER', count: 20, interval: 0.6, delay: 2 },
      { typeId: 'AQUA_SERPENT', count: 10, interval: 1.2, delay: 5 }
    ]
  },
  {
    waveNumber: 19,
    name: 'Đợt 19: Cuộc Đổ Bộ Tận Diệt',
    rewardGold: 360,
    enemies: [
      { typeId: 'STICK_WARRIOR', count: 15, interval: 0.8, delay: 0 },
      { typeId: 'SHADOW_WRAITH', count: 10, interval: 1.1, delay: 3 },
      { typeId: 'WINGED_GARGOYLE', count: 12, interval: 1.0, delay: 5 },
      { typeId: 'FIRE_IMP', count: 15, interval: 0.7, delay: 7 }
    ]
  },
  {
    waveNumber: 20,
    name: 'Đợt 20: Chung Cuộc Đại Thắng - Đại Hắc Long Tái Sinh',
    rewardGold: 600,
    enemies: [
      { typeId: 'ROCK_GOLEM', count: 8, interval: 1.8, delay: 0 },
      { typeId: 'SHADOW_WRAITH', count: 8, interval: 1.3, delay: 3 },
      { typeId: 'AQUA_SERPENT', count: 10, interval: 1.2, delay: 5 },
      { typeId: 'DARK_DRAGON_BOSS', count: 1, interval: 1.0, delay: 8 }
    ]
  }
];

export const MAPS_CONFIG: MapConfig[] = [
  // 1. Thung Lũng Khởi Nguyên (10 Đợt)
  {
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
    waves: WAVES_VALLEY_ORIGIN
  },

  // 2. Giao Lộ Sinh Tử (12 Đợt)
  {
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
    waves: WAVES_TWIN_CROSSROADS
  },

  // 3. Hẻm Núi Mãng Xà (15 Đợt)
  {
    id: 'serpent_canyon',
    name: 'Hẻm Núi Mãng Xà',
    subtitle: 'Địa hình zíc-zắc 3 tầng',
    description: 'Đường bộ khúc khuỷu kéo dài cho phép đặt tháp tập trung hỏa lực tối đa.',
    themeColor: '#1c1917',
    roadColor: '#a16207',
    riverColor: '#0ea5e9',
    width: 1000,
    height: 650,
    roadWidth: 40,
    riverWidth: 36,
    groundWaypoints: [
      { x: 40, y: 120 },
      { x: 860, y: 120 },
      { x: 860, y: 300 },
      { x: 160, y: 300 },
      { x: 160, y: 500 },
      { x: 860, y: 500 },
      { x: 920, y: 500 }
    ],
    waterWaypoints: [
      { x: 0, y: 300 },
      { x: 120, y: 400 },
      { x: 340, y: 400 },
      { x: 560, y: 400 },
      { x: 740, y: 400 },
      { x: 880, y: 420 },
      { x: 920, y: 500 }
    ],
    airStart: { x: 40, y: 50 },
    airWaypoints: [
      { x: 40, y: 50 },
      { x: 450, y: 240 },
      { x: 750, y: 380 },
      { x: 920, y: 500 }
    ],
    playerBase: { x: 920, y: 500, radius: 45 },
    groundSpawn: { x: 40, y: 120 },
    waterSpawn: { x: 0, y: 300 },
    towerSlots: [],
    waves: WAVES_SERPENT_CANYON
  },

  // 4. Pháo Đài Đồng Bằng (20 Đợt)
  {
    id: 'delta_fortress',
    name: 'Pháo Đài Đồng Bằng',
    subtitle: 'Song tuyến hợp lưu về thành',
    description: 'Đường bộ từ Tây Nam và thủy lộ từ Tây Bắc hợp lưu áp sát thành trì phía Đông.',
    themeColor: '#0f172a',
    roadColor: '#b45309',
    riverColor: '#0284c7',
    width: 1000,
    height: 650,
    roadWidth: 42,
    riverWidth: 40,
    groundWaypoints: [
      { x: 40, y: 520 },
      { x: 260, y: 520 },
      { x: 400, y: 420 },
      { x: 580, y: 420 },
      { x: 720, y: 340 },
      { x: 900, y: 340 }
    ],
    waterWaypoints: [
      { x: 40, y: 120 },
      { x: 280, y: 120 },
      { x: 420, y: 240 },
      { x: 600, y: 240 },
      { x: 720, y: 340 },
      { x: 900, y: 340 }
    ],
    airStart: { x: 40, y: 300 },
    airWaypoints: [
      { x: 40, y: 300 },
      { x: 450, y: 300 },
      { x: 900, y: 340 }
    ],
    playerBase: { x: 900, y: 340, radius: 45 },
    groundSpawn: { x: 40, y: 520 },
    waterSpawn: { x: 40, y: 120 },
    towerSlots: [],
    waves: WAVES_DELTA_FORTRESS
  }
];

export const MAP_CONFIG = MAPS_CONFIG[0];
export const WAVES_CONFIG = MAP_CONFIG.waves;
