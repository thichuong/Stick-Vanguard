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
    },
    tags: ['UNBLOCKABLE', 'GHOST'],
    altitude: 6,
    size: 18,
    color: '#a855f7'
  },

  // 8. Trùm Rồng Que Hắc Ám (Bay, Long Tộc + Hắc Ám, Boss)
  'DARK_DRAGON_BOSS': {
    typeId: 'DARK_DRAGON_BOSS',
    name: 'Đại Hắc Long Ma Vương',
    description: 'Trùm Bay Tối Thượng! Hệ Rồng + Hắc Ám (DRAGON + DARK). Máu cực lớn, miễn nhiễm Đất & Lửa, cực sợ Băng & Tiên.',
    hp: 2400,
    speed: 32,
    damage: 55,
    attackSpeed: 1.2,
    rewardGold: 150,
    movementType: 'FLY',
    navigationMode: 'AIR_WAYPOINTS',
    elementalProfile: {
      primaryElement: 'DRAGON',
      secondaryElement: 'DARK',
      immunities: ['EARTH', 'FIRE'],
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
    },
    tags: ['AQUATIC', 'FAST', 'MINION'],
    altitude: 0,
    size: 15,
    color: '#0ea5e9'
  },

  // 17. Trùm Mãng Xà Hư Không (2 Thuộc tính: Rồng + Độc, Triệu hồi quái và Phân tách khi chết)
  'VOID_HYDRA_BOSS': {
    typeId: 'VOID_HYDRA_BOSS',
    name: 'Trùm Mãng Xà Hư Không',
    description: 'Đại Trùm Mặt Đất! Hệ Rồng + Độc (DRAGON + POISON). Vừa triệu hồi quái vừa phân tách khi bị tiêu diệt!',
    hp: 1500,
    speed: 30,
    damage: 60,
    attackSpeed: 1.1,
    rewardGold: 180,
    movementType: 'WALK',
    navigationMode: 'GROUND_PATH',
    elementalProfile: {
      primaryElement: 'DRAGON',
      secondaryElement: 'POISON',
      immunities: ['POISON', 'FIRE'],
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
  },

  // === CÁC CHỦNG LOẠI QUÁI THEO HỆ MỚI & TỘC BẢN ĐỒ ===

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

  // 19. Tiên Linh Hoa Gió (Hệ Tiên + Gió - FLY, Tộc Thung Lũng & Cực Bắc)
  'FAIRY_SPRITE': {
    typeId: 'FAIRY_SPRITE',
    name: 'Tiên Linh Hoa Gió',
    description: 'Hệ Tiên + Gió (FAIRY + WIND). Bay lượn nhanh thoăn thoắt, né tránh lính chặn, sợ Thép & Độc.',
    hp: 120,
    speed: 62,
    damage: 15,
    attackSpeed: 1.2,
    rewardGold: 18,
    movementType: 'FLY',
    navigationMode: 'AIR_DIRECT',
    elementalProfile: {
      primaryElement: 'FAIRY',
      secondaryElement: 'WIND',
      immunities: ['DRAGON'],
    },
    tags: ['FLYING', 'FAST'],
    altitude: 28,
    size: 16,
    color: '#f472b6'
  },

  // 20. Rùa Rêu Suối Nguồn (Hệ Cỏ + Nước - SWIM, Tộc Thung Lũng)
  'MOSS_TURTLE': {
    typeId: 'MOSS_TURTLE',
    name: 'Rùa Rêu Suối Nguồn',
    description: 'Hệ Cỏ + Nước (GRASS + WATER). Bơi theo dòng suối, mai rêu giảm sát thương vật lý, sợ Lửa & Băng.',
    hp: 250,
    speed: 38,
    damage: 16,
    attackSpeed: 0.8,
    rewardGold: 24,
    movementType: 'SWIM',
    navigationMode: 'WATER_PATH',
    elementalProfile: {
      primaryElement: 'GRASS',
      secondaryElement: 'WATER',
      immunities: [],
    },
    tags: ['AQUATIC', 'ARMORED'],
    altitude: 0,
    size: 22,
    color: '#15803d'
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

  // 22. Khổng Lồ Thép (Hệ Thép + Sét - WALK, Tộc Thiết Giáp)
  'IRON_COLOSSUS': {
    typeId: 'IRON_COLOSSUS',
    name: 'Khổng Lồ Thép Sét',
    description: 'Hệ Thép + Sét (STEEL + LIGHTNING). Pháo đài thép di động, phân tách thành 2 Chiến Binh Thiết Giáp khi ngã xuống!',
    hp: 440,
    speed: 24,
    damage: 34,
    attackSpeed: 0.7,
    rewardGold: 45,
    movementType: 'WALK',
    navigationMode: 'GROUND_PATH',
    elementalProfile: {
      primaryElement: 'STEEL',
      secondaryElement: 'LIGHTNING',
      immunities: ['POISON', 'LIGHTNING'],
    },
    tags: ['ARMORED', 'SPLITTER'],
    altitude: 0,
    size: 28,
    color: '#475569',
    deathSpawn: {
      typeId: 'STEEL_VANGUARD',
      count: 2
    }
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

  // 24. Phi Long Xung Kích (Hệ Rồng + Gió - FLY, Tộc Hẻm Núi Mãng Xà)
  'WYVERN_RAIDER': {
    typeId: 'WYVERN_RAIDER',
    name: 'Phi Long Cuồng Phong',
    description: 'Hệ Rồng + Gió (DRAGON + WIND). Quái bay tinh nhuệ tốc độ cao, sải cánh lướt qua mọi bẫy đất, sợ Băng & Tiên.',
    hp: 170,
    speed: 58,
    damage: 20,
    attackSpeed: 1.2,
    rewardGold: 25,
    movementType: 'FLY',
    navigationMode: 'AIR_WAYPOINTS',
    elementalProfile: {
      primaryElement: 'DRAGON',
      secondaryElement: 'WIND',
      immunities: ['EARTH'],
    },
    tags: ['FLYING', 'FAST'],
    altitude: 30,
    size: 20,
    color: '#d97706'
  },

  // 25. Giao Long Sông Sâu (Hệ Rồng + Nước - SWIM, Tộc Hẻm Núi)
  'RIVER_DRAKE': {
    typeId: 'RIVER_DRAKE',
    name: 'Giao Long Đáy Vực',
    description: 'Hệ Rồng + Nước (DRAGON + WATER). Thủy quái rồng bơi lội dưới lòng sông hẻm núi, chống chịu cao, sợ Băng & Tiên.',
    hp: 310,
    speed: 44,
    damage: 25,
    attackSpeed: 0.9,
    rewardGold: 32,
    movementType: 'SWIM',
    navigationMode: 'WATER_PATH',
    elementalProfile: {
      primaryElement: 'DRAGON',
      secondaryElement: 'WATER',
      immunities: ['WATER', 'FIRE'],
    },
    tags: ['AQUATIC'],
    altitude: 0,
    size: 24,
    color: '#0284c7'
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

  // 27. Oán Hồn Không Trung (Hệ Ma + Băng - FLY, Tộc Cổ Thành)
  'SPECTRAL_BANSHEE': {
    typeId: 'SPECTRAL_BANSHEE',
    name: 'Oán Hồn Không Trung',
    description: 'Hệ Ma + Băng (GHOST + ICE). Tiếng thét linh hồn vang vọng trên bầu trời, miễn nhiễm Vật Lý, sợ Ánh Sáng & Lửa.',
    hp: 145,
    speed: 54,
    damage: 22,
    attackSpeed: 1.1,
    rewardGold: 25,
    movementType: 'FLY',
    navigationMode: 'AIR_DIRECT',
    elementalProfile: {
      primaryElement: 'GHOST',
      secondaryElement: 'ICE',
      immunities: ['PHYSICAL', 'ICE'],
    },
    tags: ['FLYING', 'GHOST'],
    altitude: 30,
    size: 18,
    color: '#a855f7'
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
  },

  // 29. Dơi Huyết Độc (Hệ Độc + Gió - FLY, Tộc Đầm Lầy)
  'TOXIC_BAT': {
    typeId: 'TOXIC_BAT',
    name: 'Dơi Huyết Độc',
    description: 'Hệ Độc + Gió (POISON + WIND). Quái bay gieo rắc dịch bệnh, tấn công nhanh nhẹn, sợ Đá & Băng.',
    hp: 130,
    speed: 60,
    damage: 17,
    attackSpeed: 1.2,
    rewardGold: 20,
    movementType: 'FLY',
    navigationMode: 'AIR_DIRECT',
    elementalProfile: {
      primaryElement: 'POISON',
      secondaryElement: 'WIND',
      immunities: ['POISON', 'EARTH'],
    },
    tags: ['FLYING', 'FAST'],
    altitude: 28,
    size: 16,
    color: '#65a30d'
  },

  // 30. Thủy Quái Kịch Độc (Hệ Độc + Nước - SWIM, Tộc Đầm Lầy)
  'PLAGUE_LEVIATHAN': {
    typeId: 'PLAGUE_LEVIATHAN',
    name: 'Thủy Quái Kịch Độc',
    description: 'Hệ Độc + Nước (POISON + WATER). Quái vật khổng lồ bơi dưới kênh bùn, triệu hồi Nhện Độc và miễn nhiễm nọc độc.',
    hp: 340,
    speed: 38,
    damage: 26,
    attackSpeed: 0.9,
    rewardGold: 40,
    movementType: 'SWIM',
    navigationMode: 'WATER_PATH',
    elementalProfile: {
      primaryElement: 'POISON',
      secondaryElement: 'WATER',
      immunities: ['POISON', 'WATER'],
    },
    tags: ['AQUATIC', 'SUMMONER'],
    altitude: 0,
    size: 24,
    color: '#4d7c0f',
    summonConfig: {
      typeId: 'VENOM_ARACHNID',
      count: 2,
      interval: 6.0
    }
  }
};

