import { EnemyBlueprint } from './types.js';

export const ELITE_ENEMIES: Record<string, EnemyBlueprint> = {
  // 9. Khối Dung Nham Phân Tách (2 Thuộc tính: Lửa + Đất, chết sinh 2 giọt lửa con)
  'MAGMA_SLIME': {
    typeId: 'MAGMA_SLIME',
    name: 'Khối Dung Nham Phân Tách',
    description: 'Quái Tinh Anh Hệ Lửa + Đất (FIRE + EARTH). Khi chết tự động phân tách thành 2 Giọt Dung Nham con!',
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
    tags: ['ELITE', 'SPLITTER'],
    altitude: 0,
    size: 21,
    color: '#ea580c',
    abilities: [
      { type: 'DEATH_SPAWN', spawnTypeId: 'EMBER_BLOB', count: 2 }
    ]
  },

  // 11. Tinh Thể Băng Nham (2 Thuộc tính: Băng + Đất, chết vỡ thành 3 Mảnh Băng Tinh)
  'FROST_CRYSTAL_GOLEM': {
    typeId: 'FROST_CRYSTAL_GOLEM',
    name: 'Khổng Lồ Băng Nham',
    description: 'Quái Tinh Anh Hệ Băng + Đất (ICE + EARTH). Giáp dày chống chịu cao. Khi vỡ vụn sinh ra 3 Mảnh Băng Tinh!',
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
    tags: ['ELITE', 'ARMORED', 'SPLITTER'],
    altitude: 0,
    size: 26,
    color: '#0284c7',
    abilities: [
      { type: 'DEATH_SPAWN', spawnTypeId: 'ICE_SHARDLING', count: 3 }
    ]
  },

  // 13. Pháp Sư Chiêu Hồn (2 Thuộc tính: Bóng Tối + Băng, triệu hồi Khô Cốt trên đường đi & khi chết)
  'NECRO_WARLOCK': {
    typeId: 'NECRO_WARLOCK',
    name: 'Pháp Sư Chiêu Hồn',
    description: 'Quái Tinh Anh Hệ Bóng Tối + Băng (DARK + ICE). Vừa đi vừa triệu hồi 2 Khô Cốt mỗi 5.5s; giải phóng thêm khi chết!',
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
    tags: ['ELITE', 'SUMMONER', 'MAGE'],
    altitude: 0,
    size: 20,
    color: '#9333ea',
    abilities: [
      { type: 'SUMMON', spawnTypeId: 'SKELETON_MINION', count: 2, interval: 5.5 },
      { type: 'DEATH_SPAWN', spawnTypeId: 'SKELETON_MINION', count: 2 }
    ]
  },

  // 15. Tiên Cá Gọi Bão (2 Thuộc tính: Nước + Sét, bơi sông & triệu hồi Lươn Điện)
  'STORM_CALLER_SIREN': {
    typeId: 'STORM_CALLER_SIREN',
    name: 'Tiên Cá Gọi Bão',
    description: 'Quái Tinh Anh Hệ Nước + Sét (WATER + LIGHTNING). Bơi theo sông nước, định kỳ gọi bầy Lươn Điện hộ tống!',
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
    tags: ['ELITE', 'AQUATIC', 'SUMMONER'],
    altitude: 0,
    size: 21,
    color: '#06b6d4',
    abilities: [
      { type: 'SUMMON', spawnTypeId: 'SPARK_EEL', count: 2, interval: 6.0 }
    ]
  },

  // 22. Khổng Lồ Thép (Hệ Thép + Sét - WALK, Tộc Thiết Giáp)
  'IRON_COLOSSUS': {
    typeId: 'IRON_COLOSSUS',
    name: 'Khổng Lồ Thép Sét',
    description: 'Quái Tinh Anh Hệ Thép + Sét (STEEL + LIGHTNING). Pháo đài thép di động, phân tách thành 2 Chiến Binh Thiết Giáp khi ngã xuống!',
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
    tags: ['ELITE', 'ARMORED', 'SPLITTER'],
    altitude: 0,
    size: 28,
    color: '#475569',
    abilities: [
      { type: 'DEATH_SPAWN', spawnTypeId: 'STEEL_VANGUARD', count: 2 }
    ]
  },

  // 30. Thủy Quái Kịch Độc (Hệ Độc + Nước - SWIM, Tộc Đầm Lầy)
  'PLAGUE_LEVIATHAN': {
    typeId: 'PLAGUE_LEVIATHAN',
    name: 'Thủy Quái Kịch Độc',
    description: 'Quái Tinh Anh Hệ Độc + Nước (POISON + WATER). Quái vật khổng lồ bơi dưới kênh bùn, triệu hồi Nhện Độc và miễn nhiễm nọc độc.',
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
    tags: ['ELITE', 'AQUATIC', 'SUMMONER'],
    altitude: 0,
    size: 24,
    color: '#4d7c0f',
    abilities: [
      { type: 'SUMMON', spawnTypeId: 'VENOM_ARACHNID', count: 2, interval: 6.0 }
    ]
  },

  // 38. Pháp Sư Hủy Cấp (Hệ Bóng Tối + Ma - WALK, Tinh Anh Tộc Hắc Tinh)
  'HEX_DEGRADER': {
    typeId: 'HEX_DEGRADER',
    name: 'Pháp Sư Hủy Cấp',
    description: 'Quái Tinh Anh Hệ Bóng Tối + Ma (DARK + GHOST). Pháp sư tà thuật sở hữu quyền năng hạ cấp tháp phòng thủ (làm tháp tụt 1 cấp hoặc phá hủy hoàn toàn nếu ở cấp 1).',
    hp: 420,
    speed: 30,
    damage: 32,
    attackSpeed: 0.8,
    rewardGold: 55,
    movementType: 'WALK',
    navigationMode: 'GROUND_PATH',
    elementalProfile: {
      primaryElement: 'DARK',
      secondaryElement: 'GHOST',
      immunities: ['PHYSICAL', 'DARK'],
    },
    tags: ['ELITE', 'SABOTEUR', 'UNBLOCKABLE', 'GHOST'],
    altitude: 4,
    size: 24,
    color: '#6b21a8',
    abilities: [
      { type: 'DOWNGRADE_TOWER', interval: 9.0, radius: 155, value: 1, duration: 0, maxTargets: 1 },
      { type: 'MAGIC_SHIELD_AURA', interval: 7.0, radius: 120, value: 140 }
    ]
  }
};

