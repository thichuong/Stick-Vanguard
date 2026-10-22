import { MovementType, NavigationMode } from '../types/elements.types.js';
import { ElementalProfile } from '../types/elements.types.js';
import { DeathSpawnConfig, SummonAbilityConfig } from '../types/entities.types.js';

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
  deathSpawn?: DeathSpawnConfig;
  summonConfig?: SummonAbilityConfig;
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
  },

  // 9. Khối Dung Nham Phân Tách (2 Thuộc tính: Lửa + Đất, chết sinh 2 giọt lửa con)
  'MAGMA_SLIME': {
    typeId: 'MAGMA_SLIME',
    name: 'Khối Dung Nham Phân Tách',
    description: 'Hệ Lửa + Đất (FIRE + EARTH). Khi chết tự động phân tách thành 2 Giọt Dung Nham con!',
    hp: 210,
    speed: 38,
    damage: 16,
    attackSpeed: 0.9,
    rewardGold: 18,
    movementType: 'WALK',
    navigationMode: 'GROUND_PATH',
    elementalProfile: {
      primaryElement: 'FIRE',
      secondaryElement: 'EARTH',
      immunities: ['FIRE'],
      damageMultipliers: {
        WATER: 2.2,
        ICE: 1.5
      }
    },
    tags: ['SPLITTER'],
    altitude: 0,
    size: 21,
    color: '#ea580c',
    deathSpawn: {
      typeId: 'EMBER_BLOB',
      count: 2
    }
  },

  // 10. Giọt Dung Nham Con (Sinh ra từ Magma Slime)
  'EMBER_BLOB': {
    typeId: 'EMBER_BLOB',
    name: 'Giọt Dung Nham Con',
    description: 'Hệ Lửa + Đất. Sinh ra khi Khối Dung Nham vỡ vụn. Di chuyển nhanh nhẹn.',
    hp: 85,
    speed: 62,
    damage: 10,
    attackSpeed: 1.2,
    rewardGold: 7,
    movementType: 'WALK',
    navigationMode: 'GROUND_PATH',
    elementalProfile: {
      primaryElement: 'FIRE',
      secondaryElement: 'EARTH',
      immunities: ['FIRE'],
      damageMultipliers: {
        WATER: 1.8
      }
    },
    tags: ['SWARM'],
    altitude: 0,
    size: 13,
    color: '#f97316'
  },

  // 11. Tinh Thể Băng Nham (2 Thuộc tính: Băng + Đất, chết vỡ thành 3 Mảnh Băng Tinh)
  'FROST_CRYSTAL_GOLEM': {
    typeId: 'FROST_CRYSTAL_GOLEM',
    name: 'Khổng Lồ Băng Nham',
    description: 'Hệ Băng + Đất (ICE + EARTH). Giáp dày chống chịu cao. Khi vỡ vụn sinh ra 3 Mảnh Băng Tinh!',
    hp: 360,
    speed: 28,
    damage: 30,
    attackSpeed: 0.7,
    rewardGold: 32,
    movementType: 'WALK',
    navigationMode: 'GROUND_PATH',
    elementalProfile: {
      primaryElement: 'ICE',
      secondaryElement: 'EARTH',
      immunities: ['PHYSICAL', 'ICE'],
      damageMultipliers: {
        FIRE: 2.2,
        LIGHTNING: 0.5
      }
    },
    tags: ['ARMORED', 'SPLITTER'],
    altitude: 0,
    size: 26,
    color: '#0284c7',
    deathSpawn: {
      typeId: 'ICE_SHARDLING',
      count: 3
    }
  },

  // 12. Mảnh Băng Tinh (Sinh ra từ Frost Crystal Golem)
  'ICE_SHARDLING': {
    typeId: 'ICE_SHARDLING',
    name: 'Mảnh Băng Tinh',
    description: 'Hệ Băng + Gió (ICE + WIND). Mảnh vụn băng trượt siêu tốc trên mặt đường.',
    hp: 90,
    speed: 70,
    damage: 9,
    attackSpeed: 1.3,
    rewardGold: 8,
    movementType: 'WALK',
    navigationMode: 'GROUND_PATH',
    elementalProfile: {
      primaryElement: 'ICE',
      secondaryElement: 'WIND',
      immunities: [],
      damageMultipliers: {
        FIRE: 2.0
      }
    },
    tags: ['FAST', 'SWARM'],
    altitude: 0,
    size: 13,
    color: '#38bdf8'
  },

  // 13. Pháp Sư Chiêu Hồn (2 Thuộc tính: Bóng Tối + Băng, triệu hồi Khô Cốt trên đường đi & khi chết)
  'NECRO_WARLOCK': {
    typeId: 'NECRO_WARLOCK',
    name: 'Pháp Sư Chiêu Hồn',
    description: 'Hệ Bóng Tối + Băng (DARK + ICE). Vừa đi vừa triệu hồi 2 Khô Cốt mỗi 5.5s; giải phóng thêm khi chết!',
    hp: 280,
    speed: 34,
    damage: 22,
    attackSpeed: 0.9,
    rewardGold: 35,
    movementType: 'WALK',
    navigationMode: 'GROUND_PATH',
    elementalProfile: {
      primaryElement: 'DARK',
      secondaryElement: 'ICE',
      immunities: ['PHYSICAL'],
      damageMultipliers: {
        LIGHT: 2.2,
        FIRE: 1.6
      }
    },
    tags: ['SUMMONER', 'MAGE'],
    altitude: 0,
    size: 20,
    color: '#9333ea',
    summonConfig: {
      typeId: 'SKELETON_MINION',
      count: 2,
      interval: 5.5
    },
    deathSpawn: {
      typeId: 'SKELETON_MINION',
      count: 2
    }
  },

  // 14. Khô Cốt Nô Bộc (Triệu hồi bởi Pháp Sư Chiêu Hồn)
  'SKELETON_MINION': {
    typeId: 'SKELETON_MINION',
    name: 'Khô Cốt Nô Bộc',
    description: 'Hệ Bóng Tối + Vật Lý. Xương người que trỗi dậy từ đất theo lệnh gọi của Pháp Sư.',
    hp: 75,
    speed: 52,
    damage: 11,
    attackSpeed: 1.1,
    rewardGold: 5,
    movementType: 'WALK',
    navigationMode: 'GROUND_PATH',
    elementalProfile: {
      primaryElement: 'DARK',
      secondaryElement: 'PHYSICAL',
      immunities: [],
      damageMultipliers: {
        LIGHT: 2.0
      }
    },
    tags: ['SWARM', 'MINION'],
    altitude: 0,
    size: 14,
    color: '#a855f7'
  },

  // 15. Tiên Cá Gọi Bão (2 Thuộc tính: Nước + Sét, bơi sông & triệu hồi Lươn Điện)
  'STORM_CALLER_SIREN': {
    typeId: 'STORM_CALLER_SIREN',
    name: 'Tiên Cá Gọi Bão',
    description: 'Hệ Nước + Sét (WATER + LIGHTNING). Bơi theo sông nước, định kỳ gọi bầy Lươn Điện hộ tống!',
    hp: 310,
    speed: 40,
    damage: 24,
    attackSpeed: 1.0,
    rewardGold: 38,
    movementType: 'SWIM',
    navigationMode: 'WATER_PATH',
    elementalProfile: {
      primaryElement: 'WATER',
      secondaryElement: 'LIGHTNING',
      immunities: ['WATER', 'FIRE'],
      damageMultipliers: {
        EARTH: 1.8,
        ICE: 1.3
      }
    },
    tags: ['AQUATIC', 'SUMMONER'],
    altitude: 0,
    size: 21,
    color: '#06b6d4',
    summonConfig: {
      typeId: 'SPARK_EEL',
      count: 2,
      interval: 6.0
    }
  },

  // 16. Lươn Điện Thủy Tộc (Triệu hồi bởi Tiên Cá Gọi Bão)
  'SPARK_EEL': {
    typeId: 'SPARK_EEL',
    name: 'Lươn Điện Thủy Tộc',
    description: 'Hệ Nước + Sét. Thủy quái lươn điện phóng nhanh như chớp dưới dòng sông.',
    hp: 110,
    speed: 64,
    damage: 14,
    attackSpeed: 1.2,
    rewardGold: 8,
    movementType: 'SWIM',
    navigationMode: 'WATER_PATH',
    elementalProfile: {
      primaryElement: 'WATER',
      secondaryElement: 'LIGHTNING',
      immunities: ['WATER'],
      damageMultipliers: {
        EARTH: 1.7
      }
    },
    tags: ['AQUATIC', 'FAST', 'MINION'],
    altitude: 0,
    size: 15,
    color: '#0ea5e9'
  },

  // 17. Trùm Mãng Xà Hư Không (2 Thuộc tính: Bóng Tối + Lửa, Triệu hồi quái và Phân tách khi chết)
  'VOID_HYDRA_BOSS': {
    typeId: 'VOID_HYDRA_BOSS',
    name: 'Trùm Mãng Xà Hư Không',
    description: 'Đại Trùm Mặt Đất! Hệ Bóng Tối + Lửa (DARK + FIRE). Vừa triệu hồi quái vừa phân tách khi bị tiêu diệt!',
    hp: 1500,
    speed: 30,
    damage: 60,
    attackSpeed: 1.1,
    rewardGold: 180,
    movementType: 'WALK',
    navigationMode: 'GROUND_PATH',
    elementalProfile: {
      primaryElement: 'DARK',
      secondaryElement: 'FIRE',
      immunities: ['FIRE'],
      damageMultipliers: {
        LIGHT: 1.8,
        WATER: 1.5,
        DARK: 0.3
      }
    },
    tags: ['BOSS', 'SUMMONER', 'SPLITTER'],
    altitude: 0,
    size: 34,
    color: '#b91c1c',
    summonConfig: {
      typeId: 'FIRE_IMP',
      count: 2,
      interval: 7.0
    },
    deathSpawn: {
      typeId: 'MAGMA_SLIME',
      count: 2
    }
  }
};

