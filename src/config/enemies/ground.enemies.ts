import { EnemyBlueprint } from './types.js';

export const GROUND_ENEMIES: Record<string, EnemyBlueprint> = {
  // 1. Quái Chạy Nhanh (Đi Bộ)
  'STICK_RUNNER': {
    typeId: 'STICK_RUNNER',
    name: 'Que Chạy Nhanh',
    description: 'Chạy nhanh, máu thấp, thường đi theo bầy.',
    hp: 45,
    speed: 68,
    damage: 6,
    attackSpeed: 1.2,
    rewardGold: 6,
    movementType: 'WALK',
    navigationMode: 'GROUND_PATH',
    elementalProfile: {
      primaryElement: 'PHYSICAL',
      immunities: []
    },
    tags: ['SWARM'],
    altitude: 0,
    size: 14,
    color: '#e2e8f0'
  },

  // 2. Que Kiếm Sĩ (Đi Bộ)
  'STICK_WARRIOR': {
    typeId: 'STICK_WARRIOR',
    name: 'Que Kiếm Sĩ',
    description: 'Chiến binh cận chiến cân bằng máu và sát thương.',
    hp: 110,
    speed: 46,
    damage: 14,
    attackSpeed: 1.0,
    rewardGold: 12,
    movementType: 'WALK',
    navigationMode: 'GROUND_PATH',
    elementalProfile: {
      primaryElement: 'PHYSICAL',
      immunities: []
    },
    tags: [],
    altitude: 0,
    size: 17,
    color: '#cbd5e1'
  },

  // 3. Người Đá Khổng Lồ (Miễn nhiễm Vật Lý & Sét)
  'ROCK_GOLEM': {
    typeId: 'ROCK_GOLEM',
    name: 'Khổng Lồ Thạch Nham',
    description: 'Hệ Đất (EARTH). Miễn nhiễm Vật lý & Sét! Nhận thêm sát thương từ Nước & Băng.',
    hp: 280,
    speed: 26,
    damage: 28,
    attackSpeed: 0.7,
    rewardGold: 25,
    movementType: 'WALK',
    navigationMode: 'GROUND_PATH',
    elementalProfile: {
      primaryElement: 'EARTH',
      immunities: ['PHYSICAL', 'LIGHTNING'],
    },
    tags: ['ARMORED'],
    altitude: 0,
    size: 24,
    color: '#b45309'
  },

  // 4. Quỷ Lửa (Miễn nhiễm Lửa)
  'FIRE_IMP': {
    typeId: 'FIRE_IMP',
    name: 'Tiểu Quỷ Hỏa Diệm',
    description: 'Hệ Lửa (FIRE). Chạy nhanh, miễn nhiễm Lửa hoàn toàn, sợ Nước (x2 sát thương).',
    hp: 95,
    speed: 58,
    damage: 18,
    attackSpeed: 1.3,
    rewardGold: 16,
    movementType: 'WALK',
    navigationMode: 'GROUND_PATH',
    elementalProfile: {
      primaryElement: 'FIRE',
      immunities: ['FIRE'],
    },
    tags: ['FAST'],
    altitude: 0,
    size: 15,
    color: '#ef4444'
  },

  // 7. Bóng Ma Hư Vô (Không Thể Bị Lính Chặn - Unblockable)
  'SHADOW_WRAITH': {
    typeId: 'SHADOW_WRAITH',
    name: 'Hồn Ma Hư Vô',
    description: 'Hệ Bóng Tối (DARK). Lướt qua lính bộ binh (Không thể bị chặn), miễn nhiễm Vật Lý, sợ Ánh Sáng.',
    hp: 160,
    speed: 44,
    damage: 24,
    attackSpeed: 1.0,
    rewardGold: 26,
    movementType: 'WALK',
    navigationMode: 'GROUND_PATH',
    elementalProfile: {
      primaryElement: 'DARK',
      immunities: ['PHYSICAL'],
    },
    tags: ['UNBLOCKABLE', 'GHOST'],
    altitude: 6,
    size: 18,
    color: '#a855f7'
  },

  // 18. Mộc Tinh Chiến Binh (Hệ Cỏ - WALK, Tộc Thung Lũng Rừng Xanh)
  'TREANT_GUARD': {
    typeId: 'TREANT_GUARD',
    name: 'Mộc Tinh Chiến Binh',
    description: 'Hệ Cỏ (GRASS). Thể xác vỏ cây cổ thụ cứng cáp, kháng Đất & Nước, sợ Lửa & Băng.',
    hp: 240,
    speed: 36,
    damage: 18,
    attackSpeed: 0.9,
    rewardGold: 22,
    movementType: 'WALK',
    navigationMode: 'GROUND_PATH',
    elementalProfile: {
      primaryElement: 'GRASS',
      immunities: [],
    },
    tags: ['ARMORED'],
    altitude: 0,
    size: 21,
    color: '#16a34a'
  },

  // 21. Chiến Binh Thiết Giáp (Hệ Thép - WALK, Tộc Giao Lộ & Pháo Đài)
  'STEEL_VANGUARD': {
    typeId: 'STEEL_VANGUARD',
    name: 'Chiến Binh Thiết Giáp',
    description: 'Hệ Thép (STEEL). Toàn thân bọc giáp sắt kiên cố, miễn nhiễm sát thương Thép & Độc, sợ Lửa & Đất.',
    hp: 260,
    speed: 34,
    damage: 22,
    attackSpeed: 0.9,
    rewardGold: 26,
    movementType: 'WALK',
    navigationMode: 'GROUND_PATH',
    elementalProfile: {
      primaryElement: 'STEEL',
      immunities: ['POISON'],
    },
    tags: ['ARMORED'],
    altitude: 0,
    size: 20,
    color: '#64748b'
  },

  // 23. Long Nhân Chiến Sĩ (Hệ Rồng + Lửa - WALK, Tộc Hẻm Núi & Núi Lửa)
  'DRAKE_WARRIOR': {
    typeId: 'DRAKE_WARRIOR',
    name: 'Long Nhân Hỏa Nham',
    description: 'Hệ Rồng + Lửa (DRAGON + FIRE). Chiến binh mang dòng máu loài rồng, hung hãn và trâu máu, sợ Băng & Tiên.',
    hp: 280,
    speed: 42,
    damage: 26,
    attackSpeed: 1.1,
    rewardGold: 28,
    movementType: 'WALK',
    navigationMode: 'GROUND_PATH',
    elementalProfile: {
      primaryElement: 'DRAGON',
      secondaryElement: 'FIRE',
      immunities: ['FIRE'],
    },
    tags: [],
    altitude: 0,
    size: 22,
    color: '#ea580c'
  },

  // 26. U Hồn Tử Thần (Hệ Ma + Bóng Tối - WALK, Tộc Cổ Thành Hư Vô)
  'PHANTOM_REAPER': {
    typeId: 'PHANTOM_REAPER',
    name: 'U Hồn Tử Thần',
    description: 'Hệ Ma + Hắc Ám (GHOST + DARK). Lướt qua lính bộ binh (Không thể bị chặn), miễn nhiễm Vật Lý, sợ Ánh Sáng.',
    hp: 185,
    speed: 46,
    damage: 28,
    attackSpeed: 1.0,
    rewardGold: 30,
    movementType: 'WALK',
    navigationMode: 'GROUND_PATH',
    elementalProfile: {
      primaryElement: 'GHOST',
      secondaryElement: 'DARK',
      immunities: ['PHYSICAL', 'POISON'],
    },
    tags: ['UNBLOCKABLE', 'GHOST'],
    altitude: 8,
    size: 20,
    color: '#c084fc'
  },

  // 28. Nhện Độc Đầm Lầy (Hệ Độc + Cỏ - WALK, Tộc Đầm Lầy Tử Khí)
  'VENOM_ARACHNID': {
    typeId: 'VENOM_ARACHNID',
    name: 'Nhện Độc Đầm Lầy',
    description: 'Hệ Độc + Cỏ (POISON + GRASS). Di chuyển nhanh, đi theo đàn đông đúc, miễn nhiễm Độc, cực sợ Lửa.',
    hp: 110,
    speed: 64,
    damage: 14,
    attackSpeed: 1.3,
    rewardGold: 14,
    movementType: 'WALK',
    navigationMode: 'GROUND_PATH',
    elementalProfile: {
      primaryElement: 'POISON',
      secondaryElement: 'GRASS',
      immunities: ['POISON'],
    },
    tags: ['SWARM', 'FAST'],
    altitude: 0,
    size: 15,
    color: '#84cc16'
  }
};

