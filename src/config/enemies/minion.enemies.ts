import { EnemyBlueprint } from './types.js';

export const MINION_ENEMIES: Record<string, EnemyBlueprint> = {
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
  }
};

