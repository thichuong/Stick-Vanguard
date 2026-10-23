import { StatusEffectType } from '../../types/elements.types.js';
import { EnemyTierCategory, TierCCConfig } from './types.js';

/** Danh sách các hiệu ứng thuộc nhóm Khống Chế Cứng (Hard CC) */
export const HARD_CC_STATUS_TYPES: StatusEffectType[] = [
  'FREEZE',    // Đóng băng (Hệ Băng)
  'SHOCK',     // Choáng giật điện (Hệ Sét)
  'ROOT',      // Trói chân (Hệ Cỏ)
  'KNOCKBACK'  // Đẩy lùi (Hệ Gió / Hệ Ma)
];

/** Danh sách các hiệu ứng thuộc nhóm Khống Chế Mềm (Soft CC) */
export const SOFT_CC_STATUS_TYPES: StatusEffectType[] = [
  'SLOW',      // Làm chậm tốc chạy (Nước, Đất, Băng, Cỏ)
  'CHARM'      // Mê hoặc làm chậm (Hệ Tiên)
];

/**
 * Bảng cấu hình tỉ lệ nhận hiệu ứng Khống Chế Cứng & Khống Chế Mềm theo phân hạng quái
 * - effectEfficiency: Hệ số nhân độ mạnh hiệu ứng (quãng đường đẩy lùi, % làm chậm...)
 * - durationEfficiency: Hệ số nhân thời gian duy trì hiệu ứng (thời gian đóng băng, choáng, làm chậm...)
 */
export const ENEMY_CC_CONFIG: Record<EnemyTierCategory, TierCCConfig> = {
  NORMAL: {
    hardCC: {
      effectEfficiency: 1.0,
      durationEfficiency: 1.0
    },
    softCC: {
      effectEfficiency: 1.0,
      durationEfficiency: 1.0
    }
  },
  ELITE: {
    hardCC: {
      effectEfficiency: 0.5,
      durationEfficiency: 0.5
    },
    softCC: {
      effectEfficiency: 1.0,
      durationEfficiency: 1.0
    }
  },
  BOSS: {
    hardCC: {
      effectEfficiency: 0.0,
      durationEfficiency: 0.0
    },
    softCC: {
      effectEfficiency: 0.5,
      durationEfficiency: 0.5
    }
  }
};

