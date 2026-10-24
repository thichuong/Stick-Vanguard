import { EnemyBlueprint } from './types.js';

export const BOSS_ENEMIES: Record<string, EnemyBlueprint> = {
  // Map 1: Cổ Thụ Tinh Vương (Hệ Cỏ + Tiên - WALK, Trùm Thung Lũng Khởi Nguyên)
  'ANCIENT_TREANT_BOSS': {
    typeId: 'ANCIENT_TREANT_BOSS',
    name: 'Cổ Thụ Tinh Vương',
    description: 'Đại Trùm Rừng Thần! Hệ Cỏ + Tiên (GRASS + FAIRY). Khổng lồ cổ thụ ngàn năm, triệu hồi Mộc Tinh, hồi máu đại ngàn và phân tách thành bầy Tiên Linh Hoa Gió khi ngã xuống.',
    hp: 2200,
    speed: 26,
    damage: 50,
    attackSpeed: 1.0,
    rewardGold: 160,
    movementType: 'WALK',
    navigationMode: 'GROUND_PATH',
    elementalProfile: {
      primaryElement: 'GRASS',
      secondaryElement: 'FAIRY',
      immunities: ['EARTH', 'WATER', 'DRAGON'],
    },
    tags: ['BOSS', 'SUMMONER', 'SPLITTER', 'HEALER', 'SUPPORT'],
    altitude: 0,
    size: 34,
    color: '#15803d',
    abilities: [
      { type: 'SUMMON', spawnTypeId: 'TREANT_GUARD', count: 2, interval: 7.5 },
      { type: 'DEATH_SPAWN', spawnTypeId: 'FAIRY_SPRITE', count: 3 },
      { type: 'HEAL_AURA', interval: 6.0, radius: 140, value: 180 },
      { type: 'ARMOR_SHIELD_AURA', interval: 7.0, radius: 140, value: 240 }
    ]
  },

  // Map 2: Thiết Giáp Lôi Đế (Hệ Thép + Sét - WALK, Trùm Giao Lộ Sinh Tử)
  'IRON_OVERLORD_BOSS': {
    typeId: 'IRON_OVERLORD_BOSS',
    name: 'Thiết Giáp Lôi Đế',
    description: 'Đại Trùm Cơ Giới! Hệ Thép + Sét (STEEL + LIGHTNING). Pháo đài bọc giáp kiên cố, phóng xung điện từ vô hiệu hóa tháp, tạo Giáp Ảo khổng lồ và triệu hồi Chiến Binh Thiết Giáp.',
    hp: 2500,
    speed: 25,
    damage: 55,
    attackSpeed: 0.9,
    rewardGold: 170,
    movementType: 'WALK',
    navigationMode: 'GROUND_PATH',
    elementalProfile: {
      primaryElement: 'STEEL',
      secondaryElement: 'LIGHTNING',
      immunities: ['POISON', 'LIGHTNING'],
    },
    tags: ['BOSS', 'ARMORED', 'SUMMONER', 'SPLITTER', 'SABOTEUR'],
    altitude: 0,
    size: 35,
    color: '#334155',
    abilities: [
      { type: 'SUMMON', spawnTypeId: 'STEEL_VANGUARD', count: 2, interval: 7.5 },
      { type: 'DEATH_SPAWN', spawnTypeId: 'IRON_COLOSSUS', count: 2 },
      { type: 'ARMOR_SHIELD_AURA', interval: 6.5, radius: 140, value: 300 },
      { type: 'DISABLE_TOWER', interval: 7.0, radius: 170, value: 2, duration: 3.5, maxTargets: 2 }
    ]
  },

  // Map 3: Đại Hắc Long Ma Vương (Hệ Rồng + Hắc Ám - FLY, Trùm Hẻm Núi Mãng Xà)
  'DARK_DRAGON_BOSS': {
    typeId: 'DARK_DRAGON_BOSS',
    name: 'Đại Hắc Long Ma Vương',
    description: 'Trùm Bay Tối Thượng! Hệ Rồng + Hắc Ám (DRAGON + DARK). Máu cực lớn, miễn nhiễm Đất & Lửa, định kỳ gọi Phi Long cuồng phong và phun hơi thở bóng tối vô hiệu hóa tháp.',
    hp: 2400,
    speed: 32,
    damage: 55,
    attackSpeed: 1.2,
    rewardGold: 180,
    movementType: 'FLY',
    navigationMode: 'AIR_WAYPOINTS',
    elementalProfile: {
      primaryElement: 'DRAGON',
      secondaryElement: 'DARK',
      immunities: ['EARTH', 'FIRE'],
    },
    tags: ['BOSS', 'FLYING', 'SUMMONER', 'SABOTEUR', 'SUPPORT'],
    altitude: 35,
    size: 32,
    color: '#7c3aed',
    abilities: [
      { type: 'SUMMON', spawnTypeId: 'WYVERN_RAIDER', count: 2, interval: 8.0 },
      { type: 'DISABLE_TOWER', interval: 7.0, radius: 175, value: 2, duration: 3.5, maxTargets: 2 },
      { type: 'MAGIC_SHIELD_AURA', interval: 7.0, radius: 140, value: 280 },
      { type: 'DAMAGE_REDUCTION_AURA', interval: 7.5, radius: 140, value: 0.3, duration: 4.0 }
    ]
  },

  // Map 4: Hải Vương Cuồng Lôi (Hệ Nước + Sét - SWIM, Trùm Pháo Đài Đồng Bằng)
  'TEMPEST_LEVIATHAN_BOSS': {
    typeId: 'TEMPEST_LEVIATHAN_BOSS',
    name: 'Hải Vương Cuồng Lôi',
    description: 'Đại Trùm Thủy Tộc! Hệ Nước + Sét (WATER + LIGHTNING). Chúa tể đại dương lướt trên sóng cả, triệu hồi bầy Lươn Điện, tạo Khiên Phép thanh tẩy và phóng sét tê liệt tháp.',
    hp: 2450,
    speed: 32,
    damage: 52,
    attackSpeed: 1.0,
    rewardGold: 185,
    movementType: 'SWIM',
    navigationMode: 'WATER_PATH',
    elementalProfile: {
      primaryElement: 'WATER',
      secondaryElement: 'LIGHTNING',
      immunities: ['WATER', 'FIRE'],
    },
    tags: ['BOSS', 'AQUATIC', 'SUMMONER', 'HEALER', 'SABOTEUR'],
    altitude: 0,
    size: 34,
    color: '#0284c7',
    abilities: [
      { type: 'SUMMON', spawnTypeId: 'SPARK_EEL', count: 3, interval: 6.5 },
      { type: 'MAGIC_SHIELD_AURA', interval: 6.5, radius: 145, value: 280 },
      { type: 'HEAL_AURA', interval: 6.0, radius: 145, value: 180 },
      { type: 'DISABLE_TOWER', interval: 7.0, radius: 175, value: 2, duration: 3.5, maxTargets: 2 }
    ]
  },

  // Map 5: Hỏa Ngục Viêm Đế (Hệ Lửa + Rồng - WALK, Trùm Hỏa Ngục Núi Lửa)
  'INFERNO_MONARCH_BOSS': {
    typeId: 'INFERNO_MONARCH_BOSS',
    name: 'Hỏa Ngục Viêm Đế',
    description: 'Đại Trùm Hỏa Diệm! Hệ Lửa + Rồng (FIRE + DRAGON). Bước ra từ tâm núi lửa, triệu hồi Tiểu Quỷ Hỏa Diệm, bọc Giáp Ảo nham thạch và phun dung nham hạ cấp tháp!',
    hp: 2700,
    speed: 28,
    damage: 60,
    attackSpeed: 1.0,
    rewardGold: 195,
    movementType: 'WALK',
    navigationMode: 'GROUND_PATH',
    elementalProfile: {
      primaryElement: 'FIRE',
      secondaryElement: 'DRAGON',
      immunities: ['FIRE', 'ICE'],
    },
    tags: ['BOSS', 'SUMMONER', 'SPLITTER', 'SABOTEUR', 'ARMORED'],
    altitude: 0,
    size: 35,
    color: '#ea580c',
    abilities: [
      { type: 'SUMMON', spawnTypeId: 'FIRE_IMP', count: 3, interval: 6.5 },
      { type: 'DEATH_SPAWN', spawnTypeId: 'MAGMA_SLIME', count: 2 },
      { type: 'ARMOR_SHIELD_AURA', interval: 7.0, radius: 140, value: 280 },
      { type: 'DOWNGRADE_TOWER', interval: 10.5, radius: 165, value: 1, duration: 0, maxTargets: 1 }
    ]
  },

  // Map 6: Băng Đế Cực Hàn (Hệ Băng + Tiên - WALK, Trùm Băng Đảo Cực Bắc)
  'GLACIAL_TITAN_BOSS': {
    typeId: 'GLACIAL_TITAN_BOSS',
    name: 'Băng Đế Cực Hàn',
    description: 'Đại Trùm Băng Giá! Hệ Băng + Tiên (ICE + FAIRY). Khổng lồ băng tinh cổ đại, tạo cả Giáp Ảo lẫn Khiên Phép, triệu hồi Mảnh Băng Tinh trượt nhanh và đóng băng tháp.',
    hp: 2650,
    speed: 26,
    damage: 56,
    attackSpeed: 0.9,
    rewardGold: 190,
    movementType: 'WALK',
    navigationMode: 'GROUND_PATH',
    elementalProfile: {
      primaryElement: 'ICE',
      secondaryElement: 'FAIRY',
      immunities: ['ICE', 'DRAGON'],
    },
    tags: ['BOSS', 'ARMORED', 'SUMMONER', 'SPLITTER', 'SABOTEUR'],
    altitude: 0,
    size: 35,
    color: '#38bdf8',
    abilities: [
      { type: 'SUMMON', spawnTypeId: 'ICE_SHARDLING', count: 3, interval: 6.5 },
      { type: 'DEATH_SPAWN', spawnTypeId: 'FROST_CRYSTAL_GOLEM', count: 2 },
      { type: 'ARMOR_SHIELD_AURA', interval: 6.5, radius: 145, value: 280 },
      { type: 'DISABLE_TOWER', interval: 7.0, radius: 175, value: 2, duration: 4.0, maxTargets: 2 }
    ]
  },

  // Map 7: U Minh Tử Đế (Hệ Ma + Hắc Ám - WALK, Trùm Cổ Thành Hư Vô)
  'SOUL_EMPEROR_BOSS': {
    typeId: 'SOUL_EMPEROR_BOSS',
    name: 'U Minh Tử Đế',
    description: 'Đại Trùm Vong Linh! Hệ Ma + Hắc Ám (GHOST + DARK). Lướt qua lính bộ binh (Không thể bị chặn), triệu hồi bầy Khô Cốt, hạ cấp tháp đối phương và phân tách thành U Hồn Tử Thần.',
    hp: 2350,
    speed: 30,
    damage: 58,
    attackSpeed: 1.0,
    rewardGold: 195,
    movementType: 'WALK',
    navigationMode: 'GROUND_PATH',
    elementalProfile: {
      primaryElement: 'GHOST',
      secondaryElement: 'DARK',
      immunities: ['PHYSICAL', 'POISON'],
    },
    tags: ['BOSS', 'GHOST', 'UNBLOCKABLE', 'SUMMONER', 'SPLITTER', 'SABOTEUR', 'HEALER'],
    altitude: 6,
    size: 33,
    color: '#9333ea',
    abilities: [
      { type: 'SUMMON', spawnTypeId: 'SKELETON_MINION', count: 3, interval: 6.0 },
      { type: 'DEATH_SPAWN', spawnTypeId: 'PHANTOM_REAPER', count: 2 },
      { type: 'MAGIC_SHIELD_AURA', interval: 6.5, radius: 145, value: 300 },
      { type: 'DOWNGRADE_TOWER', interval: 10.0, radius: 170, value: 1, duration: 0, maxTargets: 1 },
      { type: 'HEAL_AURA', interval: 6.0, radius: 140, value: 180 }
    ]
  },

  // Map 8: Trùm Mãng Xà Hư Không (Hệ Rồng + Độc - WALK, Trùm Đầm Lầy Tử Khí)
  'VOID_HYDRA_BOSS': {
    typeId: 'VOID_HYDRA_BOSS',
    name: 'Trùm Mãng Xà Hư Không',
    description: 'Đại Trùm Mặt Đất! Hệ Rồng + Độc (DRAGON + POISON). Mãng xà 3 đầu uốn lượn, vừa triệu hồi quái và phân tách khi bị tiêu diệt, vừa liên tục hồi máu và tạo giáp ảo.',
    hp: 3000,
    speed: 30,
    damage: 60,
    attackSpeed: 1.1,
    rewardGold: 200,
    movementType: 'WALK',
    navigationMode: 'GROUND_PATH',
    elementalProfile: {
      primaryElement: 'DRAGON',
      secondaryElement: 'POISON',
      immunities: ['POISON', 'FIRE'],
    },
    tags: ['BOSS', 'SUMMONER', 'SPLITTER', 'HEALER', 'SABOTEUR'],
    altitude: 0,
    size: 34,
    color: '#b91c1c',
    abilities: [
      { type: 'SUMMON', spawnTypeId: 'FIRE_IMP', count: 2, interval: 7.0 },
      { type: 'DEATH_SPAWN', spawnTypeId: 'MAGMA_SLIME', count: 2 },
      { type: 'HEAL_AURA', interval: 5.5, radius: 140, value: 220 },
      { type: 'ARMOR_SHIELD_AURA', interval: 7.0, radius: 140, value: 260 },
      { type: 'DISABLE_TOWER', interval: 7.5, radius: 165, value: 2, duration: 3.5, maxTargets: 2 }
    ]
  },

  // Map 9: Đại Thiên Sứ Tối Thượng (Hệ Quang + Tiên - FLY, Trùm Thánh Điện Thiên Không)
  'ARCHANGEL_MONARCH_BOSS': {
    typeId: 'ARCHANGEL_MONARCH_BOSS',
    name: 'Đại Thiên Sứ Tối Thượng',
    description: 'Đại Trùm Không Gian! Hệ Quang Minh + Tiên (LIGHT + FAIRY). Sải cánh 6 cánh rực rỡ, vừa có Giáp Ảo & Khiên Phép khổng lồ, vừa hồi phục và vô hiệu hóa tháp đối phương.',
    hp: 2200,
    speed: 28,
    damage: 50,
    attackSpeed: 1.1,
    rewardGold: 200,
    movementType: 'FLY',
    navigationMode: 'AIR_WAYPOINTS',
    elementalProfile: {
      primaryElement: 'LIGHT',
      secondaryElement: 'FAIRY',
      immunities: ['DARK', 'DRAGON', 'EARTH'],
    },
    tags: ['BOSS', 'FLYING', 'SUPPORT', 'HEALER', 'SABOTEUR'],
    altitude: 38,
    size: 34,
    color: '#fef08a',
    abilities: [
      { type: 'MAGIC_SHIELD_AURA', interval: 7.0, radius: 140, value: 300 },
      { type: 'ARMOR_SHIELD_AURA', interval: 7.0, radius: 140, value: 300 },
      { type: 'HEAL_AURA', interval: 6.0, radius: 140, value: 180 },
      { type: 'DAMAGE_REDUCTION_AURA', interval: 7.0, radius: 140, value: 0.35, duration: 4.5 },
      { type: 'DISABLE_TOWER', interval: 7.0, radius: 180, value: 2, duration: 4.0, maxTargets: 2 }
    ]
  },

  // Map 10: Trùm Hắc Tinh Hủy Diệt (Hệ Bóng Tối + Thép - WALK, Trùm Vực Thẳm Hắc Tinh)
  'CHRONO_DESTROYER_BOSS': {
    typeId: 'CHRONO_DESTROYER_BOSS',
    name: 'Trùm Hắc Tinh Hủy Diệt',
    description: 'Đại Trùm Hắc Tinh! Hệ Bóng Tối + Thép (DARK + STEEL). Cỗ máy hủy diệt vũ trụ, liên tục phát sóng hạ cấp tháp, đóng băng tháp và triệu hồi Kẻ Phá Hoại!',
    hp: 2600,
    speed: 24,
    damage: 65,
    attackSpeed: 0.9,
    rewardGold: 220,
    movementType: 'WALK',
    navigationMode: 'GROUND_PATH',
    elementalProfile: {
      primaryElement: 'DARK',
      secondaryElement: 'STEEL',
      immunities: ['POISON', 'LIGHTNING', 'PHYSICAL'],
    },
    tags: ['BOSS', 'ARMORED', 'SABOTEUR', 'SUMMONER'],
    altitude: 0,
    size: 36,
    color: '#312e81',
    abilities: [
      { type: 'SUMMON', spawnTypeId: 'VOID_SABOTEUR', count: 2, interval: 7.5 },
      { type: 'DOWNGRADE_TOWER', interval: 10.0, radius: 175, value: 1, duration: 0, maxTargets: 1 },
      { type: 'DISABLE_TOWER', interval: 7.0, radius: 180, value: 2, duration: 3.5, maxTargets: 2 },
      { type: 'ARMOR_SHIELD_AURA', interval: 8.0, radius: 140, value: 350 }
    ]
  }
};
