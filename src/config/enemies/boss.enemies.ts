import { EnemyBlueprint } from './types.js';

export const BOSS_ENEMIES: Record<string, EnemyBlueprint> = {
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
  }
};

