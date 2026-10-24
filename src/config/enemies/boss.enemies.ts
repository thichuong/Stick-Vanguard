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
  },

  // 39. Đại Thiên Sứ Tối Thượng (Hệ Quang + Tiên - FLY, Trùm Thánh Điện)
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
    tags: ['BOSS', 'FLYING', 'SUPPORT', 'HEALER'],
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

  // 40. Trùm Hắc Tinh Hủy Diệt (Hệ Bóng Tối + Thép - WALK, Trùm Vực Thẳm)
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
    summonConfig: {
      typeId: 'VOID_SABOTEUR',
      count: 2,
      interval: 7.5
    },
    abilities: [
      { type: 'DOWNGRADE_TOWER', interval: 10.0, radius: 175, value: 1, duration: 0, maxTargets: 1 },
      { type: 'DISABLE_TOWER', interval: 7.0, radius: 180, value: 2, duration: 3.5, maxTargets: 2 },
      { type: 'ARMOR_SHIELD_AURA', interval: 8.0, radius: 140, value: 350 }
    ]
  }
};

