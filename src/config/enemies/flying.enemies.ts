import { EnemyBlueprint } from './types.js';

export const FLYING_ENEMIES: Record<string, EnemyBlueprint> = {
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
  }
};

