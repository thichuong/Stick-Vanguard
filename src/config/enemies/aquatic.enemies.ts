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
  }
};

