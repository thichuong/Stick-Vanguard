import { MovementType, NavigationMode, ElementalProfile } from '../../types/elements.types.js';
import { EnemyAbilityConfig } from '../../types/entities.types.js';

export type EnemyTierCategory = 'NORMAL' | 'ELITE' | 'BOSS';

export interface CrowdControlModifiers {
  /** Tỉ lệ hiệu quả (VD: quãng đường đẩy lùi, % làm chậm). 0 = miễn nhiễm, 0.5 = 50%, 1.0 = 100% */
  effectEfficiency: number;
  /** Tỉ lệ thời gian duy trì (VD: thời gian choáng, đóng băng, làm chậm). 0 = miễn nhiễm, 0.5 = 50%, 1.0 = 100% */
  durationEfficiency: number;
}

export interface TierCCConfig {
  hardCC: CrowdControlModifiers;
  softCC: CrowdControlModifiers;
}

export interface EnemyBlueprint {
  typeId: string;
  name: string;
  description: string;
  hp: number;
  speed: number;
  damage: number;
  attackSpeed: number;
  rewardGold: number;
  movementType: MovementType;
  navigationMode: NavigationMode;
  elementalProfile: ElementalProfile;
  tags: string[];
  altitude: number; // 0 for ground/water, > 0 for air
  size: number;
  color: string;
  abilities?: EnemyAbilityConfig[];
  /** Ghi đè tỉ lệ nhận khống chế riêng cho quái (nếu không khai báo sẽ lấy theo bậc BOSS / ELITE / NORMAL trong ENEMY_CC_CONFIG) */
  ccResistance?: {
    hardCC?: Partial<CrowdControlModifiers>;
    softCC?: Partial<CrowdControlModifiers>;
  };
}

