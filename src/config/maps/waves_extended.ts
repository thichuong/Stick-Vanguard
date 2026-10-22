import { WaveConfig } from '../map.config.js';

/**
 * Chuỗi Waves mở rộng sau Wave 10 (Wave 11 - Wave 20):
 * - Độ khó tăng vọt: Spawn dồn dập, kết hợp đa tuyến đồng thời (Bộ, Bay, Nước).
 * - Xuất quái đầy đủ 100% chủng loại:
 *   + Quái đi bộ: Swarm (Runner), Melee (Warrior), Kháng Vật lý & Sét (Rock Golem),
 *     Kháng Lửa (Fire Imp), Phân tách Dung Nham (Magma Slime), Kháng Băng & Phân tách (Frost Crystal Golem),
 *     Xuyên lính chặn (Shadow Wraith), Triệu hồi quái (Necro Warlock).
 *   + Quái bay: Không kích bầy đàn (Winged Gargoyle), Rồng Hắc Ám (Dark Dragon Boss).
 *   + Quái dưới nước: Lướt sóng (Aqua Serpent), Triệu hồi lôi điện (Storm Caller Siren), Kháng Lôi (Spark Eel).
 *   + Trùm tối thượng: Dark Dragon Boss, Void Hydra Boss.
 * - Số lượng quái tăng liên tục theo mỗi wave, áp lực tăng dần.
 */
export const WAVES_EXTENDED_POST_10: WaveConfig[] = [
  // Wave 11: Tổng ~50 quái (Tam Tuyến Tràn Lập)
  {
    waveNumber: 11,
    name: 'Đợt 11: Bão Tố Đa Chiều (Bộ, Bay & Nước Tăng Cường)',
    rewardGold: 210,
    enemies: [
      { typeId: 'STICK_WARRIOR', count: 12, interval: 1.0, delay: 0 },
      { typeId: 'AQUA_SERPENT', count: 10, interval: 1.4, delay: 2 },
      { typeId: 'WINGED_GARGOYLE', count: 10, interval: 1.2, delay: 4 },
      { typeId: 'MAGMA_SLIME', count: 6, interval: 1.8, delay: 6 },
      { typeId: 'FIRE_IMP', count: 12, interval: 0.8, delay: 8 }
    ]
  },

  // Wave 12: Tổng ~58 quái (Triệu Hồi & Thiết Giáp)
  {
    waveNumber: 12,
    name: 'Đợt 12: Triệu Hồi Hắc Ám (Vong Linh & Lôi Điện)',
    rewardGold: 235,
    enemies: [
      { typeId: 'ROCK_GOLEM', count: 6, interval: 2.0, delay: 0 },
      { typeId: 'NECRO_WARLOCK', count: 4, interval: 2.2, delay: 2 },
      { typeId: 'STORM_CALLER_SIREN', count: 6, interval: 1.8, delay: 4 },
      { typeId: 'WINGED_GARGOYLE', count: 14, interval: 1.0, delay: 6 },
      { typeId: 'STICK_RUNNER', count: 22, interval: 0.5, delay: 8 },
      { typeId: 'SPARK_EEL', count: 6, interval: 1.4, delay: 10 }
    ]
  },

  // Wave 13: Tổng ~76 quái (Băng Hỏa & Phân Tách)
  {
    waveNumber: 13,
    name: 'Đợt 13: Băng Hỏa Song Hành (Đại Quân Phân Tách)',
    rewardGold: 265,
    enemies: [
      { typeId: 'FROST_CRYSTAL_GOLEM', count: 6, interval: 2.0, delay: 0 },
      { typeId: 'MAGMA_SLIME', count: 10, interval: 1.5, delay: 2 },
      { typeId: 'AQUA_SERPENT', count: 12, interval: 1.2, delay: 4 },
      { typeId: 'SPARK_EEL', count: 8, interval: 1.2, delay: 6 },
      { typeId: 'SHADOW_WRAITH', count: 10, interval: 1.1, delay: 8 },
      { typeId: 'WINGED_GARGOYLE', count: 16, interval: 0.9, delay: 10 },
      { typeId: 'FIRE_IMP', count: 14, interval: 0.7, delay: 12 }
    ]
  },

  // Wave 14: Tổng ~84 quái (Không Kích & Vong Hồn)
  {
    waveNumber: 14,
    name: 'Đợt 14: Cuồng Nộ Không Gian (Không Kích & Vong Hồn)',
    rewardGold: 295,
    enemies: [
      { typeId: 'SHADOW_WRAITH', count: 12, interval: 1.0, delay: 0 },
      { typeId: 'NECRO_WARLOCK', count: 6, interval: 1.8, delay: 2 },
      { typeId: 'STORM_CALLER_SIREN', count: 8, interval: 1.5, delay: 4 },
      { typeId: 'ROCK_GOLEM', count: 8, interval: 1.8, delay: 6 },
      { typeId: 'WINGED_GARGOYLE', count: 20, interval: 0.8, delay: 8 },
      { typeId: 'STICK_WARRIOR', count: 16, interval: 0.8, delay: 10 },
      { typeId: 'AQUA_SERPENT', count: 14, interval: 1.0, delay: 12 }
    ]
  },

  // Wave 15: Boss + ~68 quái tinh nhuệ (Đại Trận Chiến Giữa Kỳ)
  {
    waveNumber: 15,
    name: 'Đợt 15: Đại Trận Chiến Giữa Kỳ - Hắc Long Cuồng Nộ',
    rewardGold: 450,
    enemies: [
      { typeId: 'DARK_DRAGON_BOSS', count: 1, interval: 1.0, delay: 0 },
      { typeId: 'ROCK_GOLEM', count: 8, interval: 1.6, delay: 2 },
      { typeId: 'FROST_CRYSTAL_GOLEM', count: 7, interval: 1.8, delay: 4 },
      { typeId: 'STORM_CALLER_SIREN', count: 8, interval: 1.4, delay: 6 },
      { typeId: 'WINGED_GARGOYLE', count: 18, interval: 0.8, delay: 8 },
      { typeId: 'MAGMA_SLIME', count: 10, interval: 1.4, delay: 10 },
      { typeId: 'STICK_WARRIOR', count: 16, interval: 0.7, delay: 12 }
    ]
  },

  // Wave 16: Tổng ~98 quái (Quân Đoàn Thạch Băng)
  {
    waveNumber: 16,
    name: 'Đợt 16: Thủy Lục Giao Tranh (Quân Đoàn Thạch Băng)',
    rewardGold: 340,
    enemies: [
      { typeId: 'FROST_CRYSTAL_GOLEM', count: 9, interval: 1.6, delay: 0 },
      { typeId: 'MAGMA_SLIME', count: 13, interval: 1.2, delay: 2 },
      { typeId: 'SPARK_EEL', count: 14, interval: 1.0, delay: 4 },
      { typeId: 'AQUA_SERPENT', count: 16, interval: 0.9, delay: 6 },
      { typeId: 'WINGED_GARGOYLE', count: 22, interval: 0.7, delay: 8 },
      { typeId: 'NECRO_WARLOCK', count: 7, interval: 1.8, delay: 10 },
      { typeId: 'FIRE_IMP', count: 18, interval: 0.6, delay: 12 }
    ]
  },

  // Wave 17: Tổng ~110 quái (Bóng Ma Đột Phá)
  {
    waveNumber: 17,
    name: 'Đợt 17: Cuồng Triều Vong Mệnh (Bóng Ma Đột Phá)',
    rewardGold: 380,
    enemies: [
      { typeId: 'SHADOW_WRAITH', count: 16, interval: 0.8, delay: 0 },
      { typeId: 'NECRO_WARLOCK', count: 8, interval: 1.6, delay: 2 },
      { typeId: 'ROCK_GOLEM', count: 10, interval: 1.5, delay: 4 },
      { typeId: 'STORM_CALLER_SIREN', count: 10, interval: 1.3, delay: 6 },
      { typeId: 'WINGED_GARGOYLE', count: 24, interval: 0.6, delay: 8 },
      { typeId: 'SPARK_EEL', count: 14, interval: 1.0, delay: 10 },
      { typeId: 'STICK_RUNNER', count: 28, interval: 0.4, delay: 12 }
    ]
  },

  // Wave 18: Tổng ~134 quái (Biển Quái Hỗn Hợp Tối Thượng)
  {
    waveNumber: 18,
    name: 'Đợt 18: Thần Khúc Hư Vô (Biển Quái Hỗn Hợp Tối Thượng)',
    rewardGold: 430,
    enemies: [
      { typeId: 'FROST_CRYSTAL_GOLEM', count: 11, interval: 1.5, delay: 0 },
      { typeId: 'MAGMA_SLIME', count: 15, interval: 1.0, delay: 2 },
      { typeId: 'AQUA_SERPENT', count: 18, interval: 0.8, delay: 4 },
      { typeId: 'SPARK_EEL', count: 16, interval: 0.9, delay: 6 },
      { typeId: 'SHADOW_WRAITH', count: 18, interval: 0.8, delay: 8 },
      { typeId: 'WINGED_GARGOYLE', count: 26, interval: 0.5, delay: 10 },
      { typeId: 'ROCK_GOLEM', count: 10, interval: 1.4, delay: 12 },
      { typeId: 'FIRE_IMP', count: 20, interval: 0.5, delay: 14 }
    ]
  },

  // Wave 19: Tổng ~144 quái (Quân Đoàn Diệt Tuyệt Tối Cao)
  {
    waveNumber: 19,
    name: 'Đợt 19: Tiền Đại Họa - Quân Đoàn Diệt Tuyệt Tối Cao',
    rewardGold: 490,
    enemies: [
      { typeId: 'ROCK_GOLEM', count: 12, interval: 1.4, delay: 0 },
      { typeId: 'FROST_CRYSTAL_GOLEM', count: 12, interval: 1.4, delay: 2 },
      { typeId: 'NECRO_WARLOCK', count: 10, interval: 1.5, delay: 4 },
      { typeId: 'STORM_CALLER_SIREN', count: 12, interval: 1.1, delay: 6 },
      { typeId: 'WINGED_GARGOYLE', count: 28, interval: 0.5, delay: 8 },
      { typeId: 'STICK_RUNNER', count: 32, interval: 0.35, delay: 10 },
      { typeId: 'SHADOW_WRAITH', count: 18, interval: 0.7, delay: 12 },
      { typeId: 'MAGMA_SLIME', count: 16, interval: 0.9, delay: 14 }
    ]
  },

  // Wave 20: 2 Bosses + ~114 quái tinh nhuệ tối cao (Chung Cuộc Tận Diệt)
  {
    waveNumber: 20,
    name: 'Đợt 20: Chung Cuộc Tận Diệt - Song Trùm Ma Vương Tối Thượng',
    rewardGold: 850,
    enemies: [
      { typeId: 'VOID_HYDRA_BOSS', count: 1, interval: 1.0, delay: 0 },
      { typeId: 'DARK_DRAGON_BOSS', count: 1, interval: 1.0, delay: 6 },
      { typeId: 'FROST_CRYSTAL_GOLEM', count: 12, interval: 1.3, delay: 2 },
      { typeId: 'ROCK_GOLEM', count: 12, interval: 1.3, delay: 4 },
      { typeId: 'NECRO_WARLOCK', count: 9, interval: 1.6, delay: 6 },
      { typeId: 'STORM_CALLER_SIREN', count: 11, interval: 1.1, delay: 7 },
      { typeId: 'WINGED_GARGOYLE', count: 28, interval: 0.5, delay: 9 },
      { typeId: 'AQUA_SERPENT', count: 18, interval: 0.7, delay: 11 },
      { typeId: 'SHADOW_WRAITH', count: 18, interval: 0.7, delay: 13 }
    ]
  }
];

