import {
  PlacementType,
  TowerTier,
  TowerType,
  TowerBranch
} from '../types/entities.types.js';
import { ElementType, TargetingFilter } from '../types/elements.types.js';

export interface TowerBlueprint {
  type: TowerType;
  tier: TowerTier;
  branch?: TowerBranch;
  name: string;
  description: string;
  cost: number;
  placement: PlacementType;
  range: number;
  damage: number;
  fireRate: number; // shots per sec
  element: ElementType;
  targetingFilter: TargetingFilter;
  aoeRadius?: number;
  isParabolic?: boolean;
  maxSoldiers?: number;
  soldierHp?: number;
  soldierArmor?: number;
  soldierRespawn?: number;
  canTargetAir?: boolean;
  maxTrapCharges?: number;
  triggerRadius?: number;
  rearmTime?: number;
  color: string;
}

export const TOWER_BLUEPRINTS: Record<string, TowerBlueprint> = {
  // === BARRACKS (ROAD-SIDE) ===
  'BARRACKS_1': {
    type: 'BARRACKS',
    tier: 1,
    name: 'Trại Dân Quân',
    description: 'Triệu tập 3 lính dân quân người que đứng chặn quái đi bộ trên đường.',
    cost: 70,
    placement: 'ROADSIDE',
    range: 120, // Rally point selection range
    damage: 8,
    fireRate: 1.0,
    element: 'PHYSICAL',
    targetingFilter: { allowedMovement: ['WALK'] },
    maxSoldiers: 3,
    soldierHp: 100,
    soldierArmor: 0.1,
    soldierRespawn: 8,
    color: '#94a3b8'
  },
  'BARRACKS_2': {
    type: 'BARRACKS',
    tier: 2,
    name: 'Doanh Trại Bộ Binh',
    description: 'Trang bị khiên tròn và kiếm sắt, giáp và máu tăng đáng kể.',
    cost: 110,
    placement: 'ROADSIDE',
    range: 135,
    damage: 15,
    fireRate: 1.1,
    element: 'PHYSICAL',
    targetingFilter: { allowedMovement: ['WALK'] },
    maxSoldiers: 3,
    soldierHp: 180,
    soldierArmor: 0.25,
    soldierRespawn: 8,
    color: '#64748b'
  },
  'BARRACKS_3': {
    type: 'BARRACKS',
    tier: 3,
    name: 'Thành Trì Hiệp Sĩ',
    description: 'Hiệp sĩ giáp thép dũng mãnh, khả năng chống chịu và sát thương cao.',
    cost: 160,
    placement: 'ROADSIDE',
    range: 150,
    damage: 26,
    fireRate: 1.2,
    element: 'PHYSICAL',
    targetingFilter: { allowedMovement: ['WALK'] },
    maxSoldiers: 3,
    soldierHp: 280,
    soldierArmor: 0.4,
    soldierRespawn: 7,
    color: '#475569'
  },
  'BARRACKS_4_A': {
    type: 'BARRACKS',
    tier: 4,
    branch: 'A',
    name: 'Thánh Kỵ Sĩ Ánh Sáng (Paladin)',
    description: 'Hệ Ánh Sáng (LIGHT). Khiên thánh thần, giáp cực dày, tự hồi máu liên tục.',
    cost: 230,
    placement: 'ROADSIDE',
    range: 160,
    damage: 42,
    fireRate: 1.3,
    element: 'LIGHT',
    targetingFilter: { allowedMovement: ['WALK'] },
    maxSoldiers: 3,
    soldierHp: 450,
    soldierArmor: 0.6,
    soldierRespawn: 6,
    color: '#fef08a'
  },
  'BARRACKS_4_B': {
    type: 'BARRACKS',
    tier: 4,
    branch: 'B',
    name: 'Chiến Binh Phong Lôi (Tempest Spartan)',
    description: 'Hệ Sét (LIGHTNING). Chặn quái bộ VÀ có thể phóng lao sét tiêu diệt quái bay (FLY)!',
    cost: 230,
    placement: 'ROADSIDE',
    range: 160,
    damage: 48,
    fireRate: 1.4,
    element: 'LIGHTNING',
    targetingFilter: { allowedMovement: ['WALK', 'FLY'] },
    maxSoldiers: 3,
    soldierHp: 340,
    soldierArmor: 0.35,
    soldierRespawn: 6,
    canTargetAir: true,
    color: '#f59e0b'
  },

  // === ARCHER (ROAD-SIDE) ===
  'ARCHER_1': {
    type: 'ARCHER',
    tier: 1,
    name: 'Chòi Cung Thủ',
    description: 'Bắn nhanh, sát thương vật lý đơn mục tiêu. Tấn công được cả quái Bay, Đi bộ, Bơi.',
    cost: 60,
    placement: 'ROADSIDE',
    range: 140,
    damage: 9,
    fireRate: 1.5,
    element: 'PHYSICAL',
    targetingFilter: { allowedMovement: ['WALK', 'FLY', 'SWIM'] },
    color: '#10b981'
  },
  'ARCHER_2': {
    type: 'ARCHER',
    tier: 2,
    name: 'Tháp Xạ Thủ',
    description: 'Tăng tầm bắn và tốc độ giương tên.',
    cost: 95,
    placement: 'ROADSIDE',
    range: 165,
    damage: 17,
    fireRate: 1.7,
    element: 'PHYSICAL',
    targetingFilter: { allowedMovement: ['WALK', 'FLY', 'SWIM'] },
    color: '#059669'
  },
  'ARCHER_3': {
    type: 'ARCHER',
    tier: 3,
    name: 'Tháp Thiện Xạ',
    description: 'Bắn tỉa chính xác với sát thương cao.',
    cost: 150,
    placement: 'ROADSIDE',
    range: 190,
    damage: 28,
    fireRate: 2.0,
    element: 'PHYSICAL',
    targetingFilter: { allowedMovement: ['WALK', 'FLY', 'SWIM'] },
    color: '#047857'
  },
  'ARCHER_4_A': {
    type: 'ARCHER',
    tier: 4,
    branch: 'A',
    name: 'Cung Bão Tố (Tempest Bow)',
    description: 'Hệ Gió (WIND). Bắn cực nhanh, đẩy lùi nhẹ quái bay và gây x1.5 sát thương lên quái FLY.',
    cost: 220,
    placement: 'ROADSIDE',
    range: 220,
    damage: 40,
    fireRate: 2.6,
    element: 'WIND',
    targetingFilter: { allowedMovement: ['WALK', 'FLY', 'SWIM'] },
    color: '#34d399'
  },
  'ARCHER_4_B': {
    type: 'ARCHER',
    tier: 4,
    branch: 'B',
    name: 'Nỏ Hàn Băng (Frost Crossbow)',
    description: 'Hệ Băng (ICE). Mũi tên băng làm chậm 50% tốc độ di chuyển và có tỉ lệ đóng băng.',
    cost: 220,
    placement: 'ROADSIDE',
    range: 200,
    damage: 46,
    fireRate: 2.2,
    element: 'ICE',
    targetingFilter: { allowedMovement: ['WALK', 'FLY', 'SWIM'] },
    color: '#06b6d4'
  },

  // === MAGE (ROAD-SIDE) ===
  'MAGE_1': {
    type: 'MAGE',
    tier: 1,
    name: 'Tháp Pháp Sư',
    description: 'Bắn tia phép phá giáp, tấn công được mọi loại di chuyển.',
    cost: 75,
    placement: 'ROADSIDE',
    range: 130,
    damage: 16,
    fireRate: 0.9,
    element: 'DARK',
    targetingFilter: { allowedMovement: ['WALK', 'FLY', 'SWIM'] },
    color: '#a855f7'
  },
  'MAGE_2': {
    type: 'MAGE',
    tier: 2,
    name: 'Đại Pháp Sư',
    description: 'Tia phép năng lượng đậm đặc hơn, tầm bắn xa hơn.',
    cost: 120,
    placement: 'ROADSIDE',
    range: 150,
    damage: 32,
    fireRate: 1.0,
    element: 'DARK',
    targetingFilter: { allowedMovement: ['WALK', 'FLY', 'SWIM'] },
    color: '#9333ea'
  },
  'MAGE_3': {
    type: 'MAGE',
    tier: 3,
    name: 'Tháp Thượng Cổ',
    description: 'Sát thương phép thuật mạnh mẽ, làm suy yếu phòng thủ mục tiêu.',
    cost: 170,
    placement: 'ROADSIDE',
    range: 175,
    damage: 54,
    fireRate: 1.1,
    element: 'DARK',
    targetingFilter: { allowedMovement: ['WALK', 'FLY', 'SWIM'] },
    color: '#7e22ce'
  },
  'MAGE_4_A': {
    type: 'MAGE',
    tier: 4,
    branch: 'A',
    name: 'Hỏa Ngục Hắc Ám (Hellfire Archon)',
    description: 'Hệ Lửa (FIRE). Bắn cầu lửa hắc ám phát nổ diện rộng, thiêu đốt quái theo thời gian.',
    cost: 240,
    placement: 'ROADSIDE',
    range: 185,
    damage: 85,
    fireRate: 1.0,
    element: 'FIRE',
    targetingFilter: { allowedMovement: ['WALK', 'FLY', 'SWIM'] },
    aoeRadius: 65,
    color: '#ef4444'
  },
  'MAGE_4_B': {
    type: 'MAGE',
    tier: 4,
    branch: 'B',
    name: 'Quang Điện Tinh Cầu (Radiant Arcane)',
    description: 'Hệ Ánh Sáng (LIGHT). Tia laser xuyên thấu liên tục, giật lan sét qua các quái lân cận.',
    cost: 240,
    placement: 'ROADSIDE',
    range: 195,
    damage: 75,
    fireRate: 1.5,
    element: 'LIGHT',
    targetingFilter: { allowedMovement: ['WALK', 'FLY', 'SWIM'] },
    color: '#facc15'
  },

  // === ARTILLERY (ROAD-SIDE) ===
  'ARTILLERY_1': {
    type: 'ARTILLERY',
    tier: 1,
    name: 'Pháo Cối Đá',
    description: 'Bắn đạn cầu vồng nổ lan. Chỉ tấn công quái Đi Bộ và Bơi, KHÔNG bắn được quái Bay!',
    cost: 80,
    placement: 'ROADSIDE',
    range: 135,
    damage: 28,
    fireRate: 0.6,
    element: 'EARTH',
    targetingFilter: { allowedMovement: ['WALK', 'SWIM'] }, // NO FLY!
    aoeRadius: 60,
    isParabolic: true,
    color: '#d97706'
  },
  'ARTILLERY_2': {
    type: 'ARTILLERY',
    tier: 2,
    name: 'Pháo Đồng Hạng Nặng',
    description: 'Tăng bán kính nổ lan và sát thương địa chấn.',
    cost: 130,
    placement: 'ROADSIDE',
    range: 155,
    damage: 55,
    fireRate: 0.65,
    element: 'EARTH',
    targetingFilter: { allowedMovement: ['WALK', 'SWIM'] },
    aoeRadius: 75,
    isParabolic: true,
    color: '#b45309'
  },
  'ARTILLERY_3': {
    type: 'ARTILLERY',
    tier: 3,
    name: 'Đại Bác Thần Công',
    description: 'Sức công phá khủng khiếp lên các đàn quái bộ đông đúc.',
    cost: 180,
    placement: 'ROADSIDE',
    range: 180,
    damage: 90,
    fireRate: 0.7,
    element: 'EARTH',
    targetingFilter: { allowedMovement: ['WALK', 'SWIM'] },
    aoeRadius: 90,
    isParabolic: true,
    color: '#92400e'
  },
  'ARTILLERY_4_A': {
    type: 'ARTILLERY',
    tier: 4,
    branch: 'A',
    name: 'Đại Bác Dung Nham (Magma Mortar)',
    description: 'Hệ Lửa (FIRE). Bắn đạn dung nham tạo vùng đất cháy thiêu đốt quái dẫm qua.',
    cost: 260,
    placement: 'ROADSIDE',
    range: 200,
    damage: 140,
    fireRate: 0.75,
    element: 'FIRE',
    targetingFilter: { allowedMovement: ['WALK', 'SWIM'] },
    aoeRadius: 105,
    isParabolic: true,
    color: '#f97316'
  },
  'ARTILLERY_4_B': {
    type: 'ARTILLERY',
    tier: 4,
    branch: 'B',
    name: 'Tháp Từ Trường Sét (Tesla Dynamo)',
    description: 'Hệ Sét (LIGHTNING). Phóng bom điện từ giật sét dây chuyền gây choáng.',
    cost: 260,
    placement: 'ROADSIDE',
    range: 190,
    damage: 130,
    fireRate: 0.8,
    element: 'LIGHTNING',
    targetingFilter: { allowedMovement: ['WALK', 'SWIM'] },
    aoeRadius: 95,
    isParabolic: true,
    color: '#eab308'
  },

  // === ON-PATH TRAPS (ĐẶT TRỰC TIẾP TRÊN ĐƯỜNG & NƯỚC) ===
  'TRAP_SPIKE': {
    type: 'TRAP_SPIKE',
    tier: 1,
    name: 'Bẫy Chông Đất',
    description: 'Đặt trên đường đi. Chông nhọn đâm lên khi quái Đi Bộ dẫm qua. Quái Bay hoàn toàn miễn nhiễm!',
    cost: 45,
    placement: 'PATH_TRAP',
    range: 40,
    triggerRadius: 35,
    damage: 35,
    fireRate: 1.0,
    element: 'EARTH',
    targetingFilter: { allowedMovement: ['WALK'] },
    maxTrapCharges: 6,
    rearmTime: 3.0,
    color: '#78716c'
  },
  'TRAP_FIRE': {
    type: 'TRAP_FIRE',
    tier: 1,
    name: 'Mìn Hỏa Phù',
    description: 'Đặt trên đường đi. Phát nổ diện rộng hệ Lửa khi quái đi bộ dẫm phải.',
    cost: 55,
    placement: 'PATH_TRAP',
    range: 50,
    triggerRadius: 40,
    damage: 75,
    fireRate: 1.0,
    element: 'FIRE',
    targetingFilter: { allowedMovement: ['WALK'] },
    aoeRadius: 70,
    maxTrapCharges: 3,
    rearmTime: 4.5,
    color: '#dc2626'
  },
  'TRAP_FROST': {
    type: 'TRAP_FROST',
    tier: 1,
    name: 'Bẫy Băng & Thủy Lôi',
    description: 'Đặt được trên đường bộ HOẶC dưới lòng sông. Làm ướt và đóng băng quái bộ và quái bơi.',
    cost: 50,
    placement: 'PATH_TRAP', // can also be placed on WATER_TRAP
    range: 45,
    triggerRadius: 40,
    damage: 40,
    fireRate: 1.0,
    element: 'ICE',
    targetingFilter: { allowedMovement: ['WALK', 'SWIM'] },
    aoeRadius: 60,
    maxTrapCharges: 4,
    rearmTime: 3.5,
    color: '#38bdf8'
  },
  'TRAP_NET': {
    type: 'TRAP_NET',
    tier: 1,
    name: 'Cọc Lưới Phong Lôi',
    description: 'Đặt trên đường bộ. Phóng lưới điện từ giật sét và kéo chậm cả quái Bay (FLY) lẫn Đi Bộ!',
    cost: 65,
    placement: 'PATH_TRAP',
    range: 75,
    triggerRadius: 65,
    damage: 50,
    fireRate: 1.0,
    element: 'LIGHTNING',
    targetingFilter: { allowedMovement: ['WALK', 'FLY'] },
    maxTrapCharges: 4,
    rearmTime: 4.0,
    color: '#fbbf24'
  }
};

