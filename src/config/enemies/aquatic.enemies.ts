import { EnemyBlueprint } from './types.js';

export const AQUATIC_ENEMIES: Record<string, EnemyBlueprint> = {
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

  // 36. Vu Nữ Thủy Triều (Hệ Nước + Tiên - SWIM, Tộc Thánh Điện)
  'TIDAL_PRIESTESS': {
    typeId: 'TIDAL_PRIESTESS',
    name: 'Vu Nữ Thủy Triều',
    description: 'Hệ Nước + Tiên (WATER + FAIRY). Lướt trên dòng sông, tạo Khiên Phép thanh tẩy và liên tục hồi máu cho thủy quái đồng hành.',
    hp: 240,
    speed: 42,
    damage: 18,
    attackSpeed: 1.0,
    rewardGold: 30,
    movementType: 'SWIM',
    navigationMode: 'WATER_PATH',
    elementalProfile: {
      primaryElement: 'WATER',
      secondaryElement: 'FAIRY',
      immunities: ['WATER', 'DRAGON'],
    },
    tags: ['AQUATIC', 'SUPPORT', 'HEALER'],
    altitude: 0,
    size: 21,
    color: '#06b6d4',
    abilities: [
      { type: 'HEAL_AURA', interval: 5.0, radius: 120, value: 90 },
      { type: 'MAGIC_SHIELD_AURA', interval: 6.0, radius: 120, value: 80 }
    ]
  },

  // 37. Cự Giải Thiết Giáp (Hệ Nước + Thép - SWIM, Tộc Hắc Tinh)
  'ABYSSAL_CRAB': {
    typeId: 'ABYSSAL_CRAB',
    name: 'Cự Giải Thiết Giáp',
    description: 'Hệ Nước + Thép (WATER + STEEL). Bò dưới đáy kênh sông với lớp mai thép siêu dày, tạo Giáp Ảo và hào quang giảm sát thương cho bầy thủy quái.',
    hp: 350,
    speed: 34,
    damage: 25,
    attackSpeed: 0.8,
    rewardGold: 35,
    movementType: 'SWIM',
    navigationMode: 'WATER_PATH',
    elementalProfile: {
      primaryElement: 'WATER',
      secondaryElement: 'STEEL',
      immunities: ['WATER', 'POISON'],
    },
    tags: ['AQUATIC', 'ARMORED', 'SUPPORT'],
    altitude: 0,
    size: 23,
    color: '#334155',
    abilities: [
      { type: 'ARMOR_SHIELD_AURA', interval: 6.5, radius: 110, value: 130 },
      { type: 'DAMAGE_REDUCTION_AURA', interval: 6.5, radius: 110, value: 0.3, duration: 4.0 }
    ]
  }
};

