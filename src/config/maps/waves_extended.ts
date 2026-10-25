import { WaveConfig } from '../map.config.js';

// Map 1: Thung Lũng Khởi Nguyên (Mộc Tinh & Tiên Linh)
export const EXTENDED_WAVES_VALLEY_ORIGIN: WaveConfig[] = [
  {
    waveNumber: 11,
    name: 'Mở Rộng 1: Đại Quân Mộc Tinh Cuồng Nộ',
    rewardGold: 220,
    enemies: [
      { typeId: 'TREANT_GUARD', count: 12, interval: 1.4, delay: 0 },
      { typeId: 'FAIRY_SPRITE', count: 14, interval: 1.2, delay: 2 },
      { typeId: 'MOSS_TURTLE', count: 10, interval: 1.6, delay: 4 },
      { typeId: 'ROCK_GOLEM', count: 6, interval: 2.0, delay: 6 }
    ]
  },
  {
    waveNumber: 12,
    name: 'Mở Rộng 2: Bão Tố Hoa Gió & Thần Mộc',
    rewardGold: 250,
    enemies: [
      { typeId: 'TREANT_GUARD', count: 14, interval: 1.2, delay: 0 },
      { typeId: 'FAIRY_SPRITE', count: 18, interval: 1.0, delay: 2 },
      { typeId: 'MOSS_TURTLE', count: 12, interval: 1.4, delay: 4 },
      { typeId: 'SHADOW_WRAITH', count: 8, interval: 1.5, delay: 6 }
    ]
  }
];

// Map 2: Giao Lộ Sinh Tử (Thiết Giáp Cơ Giới)
export const EXTENDED_WAVES_TWIN_CROSSROADS: WaveConfig[] = [
  {
    waveNumber: 11,
    name: 'Mở Rộng 1: Quân Đoàn Thép Đột Kích Cầu',
    rewardGold: 230,
    enemies: [
      { typeId: 'STEEL_VANGUARD', count: 14, interval: 1.2, delay: 0 },
      { typeId: 'IRON_COLOSSUS', count: 4, interval: 2.5, delay: 2 },
      { typeId: 'SPARK_EEL', count: 12, interval: 1.4, delay: 4 },
      { typeId: 'WINGED_GARGOYLE', count: 12, interval: 1.3, delay: 6 }
    ]
  },
  {
    waveNumber: 12,
    name: 'Mở Rộng 2: Khổng Lồ Sấm Sét Song Hành',
    rewardGold: 260,
    enemies: [
      { typeId: 'IRON_COLOSSUS', count: 6, interval: 2.2, delay: 0 },
      { typeId: 'STEEL_VANGUARD', count: 16, interval: 1.0, delay: 2 },
      { typeId: 'SPARK_EEL', count: 14, interval: 1.2, delay: 4 },
      { typeId: 'WINGED_GARGOYLE', count: 16, interval: 1.0, delay: 6 }
    ]
  }
];

// Map 3: Hẻm Núi Mãng Xà (Long Huyết Thạch Nham)
export const EXTENDED_WAVES_SERPENT_CANYON: WaveConfig[] = [
  {
    waveNumber: 11,
    name: 'Mở Rộng 1: Long Huyết Vách Đá Cuộn Trào',
    rewardGold: 235,
    enemies: [
      { typeId: 'DRAKE_WARRIOR', count: 14, interval: 1.2, delay: 0 },
      { typeId: 'ROCK_GOLEM', count: 8, interval: 1.8, delay: 2 },
      { typeId: 'WYVERN_RAIDER', count: 12, interval: 1.3, delay: 4 },
      { typeId: 'RIVER_DRAKE', count: 10, interval: 1.5, delay: 6 }
    ]
  },
  {
    waveNumber: 12,
    name: 'Mở Rộng 2: Cuồng Long Đáy Vực Hỗn Chiến',
    rewardGold: 270,
    enemies: [
      { typeId: 'DRAKE_WARRIOR', count: 16, interval: 1.0, delay: 0 },
      { typeId: 'WYVERN_RAIDER', count: 16, interval: 1.1, delay: 2 },
      { typeId: 'ROCK_GOLEM', count: 10, interval: 1.6, delay: 5 },
      { typeId: 'RIVER_DRAKE', count: 12, interval: 1.3, delay: 7 }
    ]
  }
];

// Map 4: Pháo Đài Đồng Bằng (Hải Thần Bão Tố)
export const EXTENDED_WAVES_DELTA_FORTRESS: WaveConfig[] = [
  {
    waveNumber: 11,
    name: 'Mở Rộng 1: Bão Biển Tràn Cửa Thành',
    rewardGold: 240,
    enemies: [
      { typeId: 'STORM_CALLER_SIREN', count: 8, interval: 1.6, delay: 0 },
      { typeId: 'STEEL_VANGUARD', count: 14, interval: 1.2, delay: 2 },
      { typeId: 'AQUA_SERPENT', count: 14, interval: 1.2, delay: 4 },
      { typeId: 'WINGED_GARGOYLE', count: 12, interval: 1.3, delay: 6 }
    ]
  },
  {
    waveNumber: 12,
    name: 'Mở Rộng 2: Đại Triều Hải Thần Hợp Lực',
    rewardGold: 280,
    enemies: [
      { typeId: 'STORM_CALLER_SIREN', count: 10, interval: 1.4, delay: 0 },
      { typeId: 'AQUA_SERPENT', count: 16, interval: 1.0, delay: 2 },
      { typeId: 'STEEL_VANGUARD', count: 16, interval: 1.1, delay: 4 },
      { typeId: 'WINGED_GARGOYLE', count: 16, interval: 1.1, delay: 6 }
    ]
  }
];

// Map 5: Hỏa Ngục Núi Lửa (Hỏa Ngục Viêm Long)
export const EXTENDED_WAVES_INFERNAL_CALDERA: WaveConfig[] = [
  {
    waveNumber: 11,
    name: 'Mở Rộng 1: Dung Nham Băng Trụ Song Cánh',
    rewardGold: 245,
    enemies: [
      { typeId: 'MAGMA_SLIME', count: 12, interval: 1.4, delay: 0 },
      { typeId: 'FIRE_IMP', count: 18, interval: 0.8, delay: 2 },
      { typeId: 'AQUA_SERPENT', count: 12, interval: 1.3, delay: 4 },
      { typeId: 'ROCK_GOLEM', count: 8, interval: 1.8, delay: 6 }
    ]
  },
  {
    waveNumber: 12,
    name: 'Mở Rộng 2: Biển Lửa Viêm Long Giáng Lâm',
    rewardGold: 290,
    enemies: [
      { typeId: 'MAGMA_SLIME', count: 14, interval: 1.2, delay: 0 },
      { typeId: 'FIRE_IMP', count: 22, interval: 0.7, delay: 2 },
      { typeId: 'WINGED_GARGOYLE', count: 16, interval: 1.0, delay: 5 },
      { typeId: 'AQUA_SERPENT', count: 14, interval: 1.2, delay: 7 }
    ]
  }
];

// Map 6: Băng Đảo Cực Bắc (Hàn Băng Tuyết Linh)
export const EXTENDED_WAVES_FROZEN_CITADEL: WaveConfig[] = [
  {
    waveNumber: 11,
    name: 'Mở Rộng 1: Khổng Lồ Băng Tinh Đột Kích',
    rewardGold: 250,
    enemies: [
      { typeId: 'FROST_CRYSTAL_GOLEM', count: 10, interval: 1.6, delay: 0 },
      { typeId: 'STORM_CALLER_SIREN', count: 8, interval: 1.6, delay: 2 },
      { typeId: 'AQUA_SERPENT', count: 14, interval: 1.2, delay: 4 },
      { typeId: 'FAIRY_SPRITE', count: 14, interval: 1.1, delay: 6 }
    ]
  },
  {
    waveNumber: 12,
    name: 'Mở Rộng 2: Bão Tuyết Cực Bắc Tận Diệt',
    rewardGold: 295,
    enemies: [
      { typeId: 'FROST_CRYSTAL_GOLEM', count: 12, interval: 1.4, delay: 0 },
      { typeId: 'STORM_CALLER_SIREN', count: 10, interval: 1.4, delay: 2 },
      { typeId: 'WINGED_GARGOYLE', count: 16, interval: 1.0, delay: 4 },
      { typeId: 'AQUA_SERPENT', count: 16, interval: 1.0, delay: 6 }
    ]
  }
];

// Map 7: Cổ Thành Hư Vô (Vong Linh U Hồn)
export const EXTENDED_WAVES_ANCIENT_NECROPOLIS: WaveConfig[] = [
  {
    waveNumber: 11,
    name: 'Mở Rộng 1: Triệu Hồi Vong Linh Tam Lộ',
    rewardGold: 255,
    enemies: [
      { typeId: 'SHADOW_WRAITH', count: 14, interval: 1.2, delay: 0 },
      { typeId: 'NECRO_WARLOCK', count: 8, interval: 1.8, delay: 2 },
      { typeId: 'AQUA_SERPENT', count: 12, interval: 1.3, delay: 4 },
      { typeId: 'SPECTRAL_BANSHEE', count: 12, interval: 1.2, delay: 6 }
    ]
  },
  {
    waveNumber: 12,
    name: 'Mở Rộng 2: Dạ Quỷ Hư Vô Xuyên Giáp',
    rewardGold: 300,
    enemies: [
      { typeId: 'SHADOW_WRAITH', count: 18, interval: 1.0, delay: 0 },
      { typeId: 'NECRO_WARLOCK', count: 10, interval: 1.6, delay: 2 },
      { typeId: 'PHANTOM_REAPER', count: 8, interval: 1.8, delay: 4 },
      { typeId: 'SPECTRAL_BANSHEE', count: 14, interval: 1.1, delay: 6 }
    ]
  }
];

// Map 8: Đầm Lầy Tử Khí (Độc Trùng Biến Dị)
export const EXTENDED_WAVES_PLAGUE_MORASS: WaveConfig[] = [
  {
    waveNumber: 11,
    name: 'Mở Rộng 1: Độc Trùng Kênh Bùn Trỗi Dậy',
    rewardGold: 260,
    enemies: [
      { typeId: 'VENOM_ARACHNID', count: 14, interval: 1.2, delay: 0 },
      { typeId: 'PLAGUE_LEVIATHAN', count: 6, interval: 2.0, delay: 2 },
      { typeId: 'TOXIC_BAT', count: 14, interval: 1.2, delay: 4 },
      { typeId: 'SPARK_EEL', count: 12, interval: 1.3, delay: 6 }
    ]
  },
  {
    waveNumber: 12,
    name: 'Mở Rộng 2: Bão Tử Khí Đầm Lầy Tận Diệt',
    rewardGold: 310,
    enemies: [
      { typeId: 'VENOM_ARACHNID', count: 16, interval: 1.0, delay: 0 },
      { typeId: 'PLAGUE_LEVIATHAN', count: 8, interval: 1.8, delay: 2 },
      { typeId: 'TOXIC_BAT', count: 16, interval: 1.0, delay: 4 },
      { typeId: 'SHADOW_WRAITH', count: 12, interval: 1.2, delay: 6 }
    ]
  }
];

// Map 9: Thánh Điện Thiên Không (Thiên Sứ Quang Phong)
export const EXTENDED_WAVES_CELESTIAL_SANCTUM: WaveConfig[] = [
  {
    waveNumber: 11,
    name: 'Mở Rộng 1: Kỵ Binh Ánh Sáng & Thiên Sứ',
    rewardGold: 270,
    enemies: [
      { typeId: 'LIGHT_PALADIN', count: 12, interval: 1.4, delay: 0 },
      { typeId: 'SERAPH_VALKYRIE', count: 12, interval: 1.3, delay: 2 },
      { typeId: 'TIDAL_PRIESTESS', count: 10, interval: 1.5, delay: 4 },
      { typeId: 'HEX_DEGRADER', count: 6, interval: 2.2, delay: 6 }
    ]
  },
  {
    waveNumber: 12,
    name: 'Mở Rộng 2: Thánh Quang Phá Giáp Tối Cao',
    rewardGold: 320,
    enemies: [
      { typeId: 'LIGHT_PALADIN', count: 14, interval: 1.2, delay: 0 },
      { typeId: 'SERAPH_VALKYRIE', count: 16, interval: 1.0, delay: 2 },
      { typeId: 'HEX_DEGRADER', count: 8, interval: 2.0, delay: 4 },
      { typeId: 'TIDAL_PRIESTESS', count: 12, interval: 1.3, delay: 6 }
    ]
  }
];

// Map 10: Vực Thẳm Hắc Tinh (Hắc Tinh Phá Tháp)
export const EXTENDED_WAVES_VOID_SINGULARITY: WaveConfig[] = [
  {
    waveNumber: 11,
    name: 'Mở Rộng 1: Phá Hoại Cơ Giới Hư Không',
    rewardGold: 280,
    enemies: [
      { typeId: 'VOID_SABOTEUR', count: 12, interval: 1.4, delay: 0 },
      { typeId: 'HEX_DEGRADER', count: 8, interval: 2.0, delay: 2 },
      { typeId: 'EMP_DRONE', count: 14, interval: 1.2, delay: 4 },
      { typeId: 'ABYSSAL_CRAB', count: 10, interval: 1.6, delay: 6 }
    ]
  },
  {
    waveNumber: 12,
    name: 'Mở Rộng 2: Hố Đen Diệt Tuyệt Tối Thượng',
    rewardGold: 340,
    enemies: [
      { typeId: 'HEX_DEGRADER', count: 10, interval: 1.8, delay: 0 },
      { typeId: 'VOID_SABOTEUR', count: 14, interval: 1.2, delay: 2 },
      { typeId: 'EMP_DRONE', count: 18, interval: 1.0, delay: 4 },
      { typeId: 'ABYSSAL_CRAB', count: 12, interval: 1.4, delay: 6 }
    ]
  }
];

export const MAP_EXTENDED_WAVES: Record<string, WaveConfig[]> = {
  valley_origin: EXTENDED_WAVES_VALLEY_ORIGIN,
  twin_crossroads: EXTENDED_WAVES_TWIN_CROSSROADS,
  serpent_canyon: EXTENDED_WAVES_SERPENT_CANYON,
  delta_fortress: EXTENDED_WAVES_DELTA_FORTRESS,
  infernal_caldera: EXTENDED_WAVES_INFERNAL_CALDERA,
  frozen_citadel: EXTENDED_WAVES_FROZEN_CITADEL,
  ancient_necropolis: EXTENDED_WAVES_ANCIENT_NECROPOLIS,
  plague_morass: EXTENDED_WAVES_PLAGUE_MORASS,
  celestial_sanctum: EXTENDED_WAVES_CELESTIAL_SANCTUM,
  void_singularity: EXTENDED_WAVES_VOID_SINGULARITY
};

// Giữ lại WAVES_EXTENDED_POST_10 để tương thích ngược nếu có import
export const WAVES_EXTENDED_POST_10: WaveConfig[] = EXTENDED_WAVES_VALLEY_ORIGIN;
