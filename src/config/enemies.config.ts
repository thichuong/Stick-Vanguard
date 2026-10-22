import { MovementType, NavigationMode } from '../types/elements.types.js';
import { ElementalProfile } from '../types/elements.types.js';

export interface EnemyBlueprint {
  typeId: string;
  name: string;
  description: string;
  hp: number;
  speed: number;
  damage: number;
  attackSpeed: number;
  rewardGold: number;
  movementType: MovementType;
  navigationMode: NavigationMode;
  elementalProfile: ElementalProfile;
  tags: string[];
  altitude: number; // 0 for ground/water, > 0 for air
  size: number;
  color: string;
}

export const ENEMY_BLUEPRINTS: Record<string, EnemyBlueprint> = {
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
      immunities: ['PHYSICAL', 'LIGHTNING'], // 100% IMMUNE to Physical & Lightning!
      damageMultipliers: {
        WATER: 1.75,
        ICE: 1.5,
        EARTH: 0.2
      }
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
      immunities: ['FIRE'], // Immune to fire
      damageMultipliers: {
        WATER: 2.0,
        ICE: 1.4
      }
    },
    tags: ['FAST'],
    altitude: 0,
    size: 15,
    color: '#ef4444'
  },

  // 5. Quái Bay Có Cánh (Bay Tự Do Cắt Ngang Bản Đồ)
  'WINGED_GARGOYLE': {
    typeId: 'WINGED_GARGOYLE',
    name: 'Que Dơi Phong Thần',
    description: 'Hệ Gió (WIND). Bay trên không ngoài đường bộ! Bỏ qua bẫy đất và lính bộ binh.',
    hp: 130,
    speed: 52,
    damage: 16,
    attackSpeed: 1.1,
    rewardGold: 20,
    movementType: 'FLY',
    navigationMode: 'AIR_DIRECT', // Flies freely across the map!
    elementalProfile: {
      primaryElement: 'WIND',
      immunities: ['EARTH'], // Earth artillery can't hit it
      damageMultipliers: {
        LIGHTNING: 1.6,
        WIND: 0.4
      }
    },
    tags: ['FLYING'],
    altitude: 28,
    size: 18,
    color: '#34d399'
  },

  // 6. Rắn Nước Thủy Quái (Bơi Dưới Kênh Sông)
  'AQUA_SERPENT': {
    typeId: 'AQUA_SERPENT',
    name: 'Thủy Xà Sông Sâu',
    description: 'Hệ Nước (WATER). Bơi theo dòng sông, miễn nhiễm Lửa, sợ Sét (x2 sát thương).',
    hp: 175,
    speed: 48,
    damage: 20,
    attackSpeed: 0.9,
    rewardGold: 22,
    movementType: 'SWIM',
    navigationMode: 'WATER_PATH',
    elementalProfile: {
      primaryElement: 'WATER',
      immunities: ['FIRE'],
      damageMultipliers: {
        LIGHTNING: 2.0,
        EARTH: 1.3,
        WATER: 0.2
      }
    },
    tags: ['AQUATIC'],
    altitude: 0,
    size: 19,
    color: '#38bdf8'
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
      immunities: ['PHYSICAL'], // Melee weapons do zero damage!
      damageMultipliers: {
        LIGHT: 2.0,
        DARK: 0.2
      }
    },
    tags: ['UNBLOCKABLE', 'GHOST'],
    altitude: 6,
    size: 18,
    color: '#a855f7'
  },

  // 8. Trùm Rồng Que Hắc Ám (Bay, Nhiều Kháng Hệ, Boss)
  'DARK_DRAGON_BOSS': {
    typeId: 'DARK_DRAGON_BOSS',
    name: 'Đại Hắc Long Ma Vương',
    description: 'Trùm Bay Tối Thượng! Máu cực lớn, miễn nhiễm Đất & Lửa, đòi hỏi phối hợp toàn quân.',
    hp: 1200,
    speed: 32,
    damage: 55,
    attackSpeed: 1.2,
    rewardGold: 150,
    movementType: 'FLY',
    navigationMode: 'AIR_WAYPOINTS',
    elementalProfile: {
      primaryElement: 'DARK',
      immunities: ['EARTH', 'FIRE'],
      damageMultipliers: {
        LIGHT: 1.6,
        PHYSICAL: 0.7,
        DARK: 0.3
      }
    },
    tags: ['BOSS', 'FLYING'],
    altitude: 35,
    size: 32,
    color: '#7c3aed'
  }
};

