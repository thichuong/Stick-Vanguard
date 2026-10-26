import {
  MovementType,
  NavigationMode,
  ElementType,
  StatusEffect,
  ElementalProfile,
  TargetingFilter,
  DamagePayload
} from './elements.types.js';

export interface Vector2D {
  x: number;
  y: number;
}

export type PlacementType = 'ROADSIDE' | 'PATH_TRAP' | 'WATER_TRAP';

export type TowerCategory = 'DEFENSE' | 'SUMMON' | 'TRAP';

export type SummonUnitArchetype = 'SOLDIER' | 'DRAGON' | 'FAIRY';

export type TowerType =
  | 'BARRACKS'
  | 'ARCHER'
  | 'MAGE'
  | 'ARTILLERY'
  | 'DRAGON_NEST'
  | 'FAIRY_TREE'
  | 'HEROIC_ALTAR'
  | 'TRAP_SPIKE'
  | 'TRAP_FIRE'
  | 'TRAP_FROST'
  | 'TRAP_NET';

export type TowerTier = 1 | 2 | 3 | 4;
export type TowerBranch = 'A' | 'B';
export type SoldierCombatMode = 'MELEE' | 'RANGED';

export type SoldierState =
  | 'IDLE'
  | 'MOVING_TO_RALLY'
  | 'MOVING_TO_ENGAGE'
  | 'ATTACKING'
  | 'DEAD';

export type EnemyState =
  | 'WALKING'
  | 'FLYING'
  | 'SWIMMING'
  | 'ENGAGED'
  | 'ATTACKING'
  | 'DEAD';

export interface DeathSpawnConfig {
  typeId: string;
  count: number;
}

export interface SummonAbilityConfig {
  typeId: string;
  count: number;
  interval: number; // in seconds
}

export type EnemyAbilityType =
  | 'SUMMON'                // Triệu hồi quái hộ tống định kỳ trên đường đi
  | 'DEATH_SPAWN'           // Phân tách / sinh quái con khi bị tiêu diệt
  | 'DISABLE_TOWER'         // Vô hiệu hóa tháp trong tầm
  | 'DOWNGRADE_TOWER'       // Làm tháp rơi 1 cấp (hoặc phá hủy nếu cấp 1)
  | 'ARMOR_SHIELD_AURA'     // Tạo Giáp Ảo chặn sát thương vật lý cho bản thân & quái xung quanh
  | 'MAGIC_SHIELD_AURA'     // Tạo Khiên Phép chặn sát thương phép cho bản thân & quái xung quanh
  | 'HEAL_AURA'             // Hồi máu cho bản thân & quái xung quanh
  | 'DAMAGE_REDUCTION_AURA'; // Giảm % sát thương nhận vào cho bản thân & quái xung quanh

export interface EnemyAbilityConfig {
  type: EnemyAbilityType;
  interval?: number;      // Chu kỳ kích hoạt (giây) - dùng cho các kỹ năng chủ động định kỳ
  radius?: number;        // Bán kính tác dụng lên tháp hoặc đồng minh (px)
  value?: number;         // Lượng giáp/khiên, lượng máu hồi, hoặc % giảm sát thương (0 - 0.6)
  duration?: number;      // Thời gian vô hiệu hóa tháp hoặc thời gian tồn tại buff giảm sát thương
  maxTargets?: number;    // Số tháp tối đa bị tác động mỗi lần tung chiêu (mặc định 1)
  spawnTypeId?: string;   // Mã loại quái được triệu hồi (SUMMON) hoặc phân tách (DEATH_SPAWN)
  count?: number;         // Số lượng quái sinh ra (SUMMON / DEATH_SPAWN)
}

export interface SoldierEntity {
  id: string;
  towerId: string;
  name: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  damage: number;
  attackSpeed: number; // attacks per second
  attackCooldown: number;
  element: ElementType;
  secondaryElement?: ElementType | null;
  combatMode: SoldierCombatMode;
  state: SoldierState;
  engagedEnemyId: string | null;
  rallyPoint: Vector2D;
  targetPos: Vector2D;
  armor: number; // 0 to 1 physical damage reduction
  magicResist: number;
  respawnTimer: number; // seconds remaining if dead
  respawnDelay: number;
  soldierRegen?: number; // HP regenerated per second
  tier: TowerTier;
  branch?: TowerBranch;
  canTargetAir?: boolean;
  canBlockAir?: boolean;
  canTargetSwim?: boolean;
  archetype?: SummonUnitArchetype;
  isSpirit?: boolean;
  spiritSourceArchetype?: SummonUnitArchetype;
  spiritGhostRatio?: number;
  aoeRadius?: number;
  buffedElements?: ElementType[];
  rangedDamage?: number;
  rangedRange?: number;
  baseMaxHp: number;
  baseDamage: number;
  baseArmor: number;
  facing?: number; // radians angle facing
}

export interface EnemyEntity {
  id: string;
  typeId: string;
  name: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  baseSpeed: number;
  damage: number;
  attackSpeed: number;
  attackCooldown: number;
  rewardGold: number;
  movementType: MovementType;
  navigationMode: NavigationMode;
  pathDistance: number; // progress along path in pixels
  pathTotalLength: number;
  elementalProfile: ElementalProfile;
  state: EnemyState;
  engagedBySoldierId: string | null;
  statusEffects: StatusEffect[];
  tags: string[]; // e.g. ['UNBLOCKABLE', 'BOSS', 'SWARM']
  altitude: number; // 0 for ground/water, > 0 for flying
  size: number;
  facing: number; // radians
  laneIndex?: number; // 0-based lane index for multi-lane maps
  deathSpawn?: DeathSpawnConfig;
  summonConfig?: SummonAbilityConfig;
  summonTimer?: number;
  ccResistance?: {
    hardCC?: { effectEfficiency?: number; durationEfficiency?: number };
    softCC?: { effectEfficiency?: number; durationEfficiency?: number };
  };
  abilities?: EnemyAbilityConfig[];
  abilityTimers?: number[];
  armorShield?: number;
  maxArmorShield?: number;
  magicShield?: number;
  maxMagicShield?: number;
  damageReductionRatio?: number;
  damageReductionTimer?: number;
}

export interface TowerEntity {
  id: string;
  slotId?: string;
  name: string;
  type: TowerType;
  category?: TowerCategory;
  tier: TowerTier;
  branch?: TowerBranch;
  x: number;
  y: number;
  range: number;
  damage: number;
  fireRate: number; // attacks per second
  attackCooldown: number;
  element: ElementType;
  secondaryElement?: ElementType | null;
  soldierMode?: SoldierCombatMode;
  targetingFilter: TargetingFilter;
  placement: PlacementType;
  cost: number;
  totalInvested: number;
  rallyPoint?: Vector2D;
  soldierIds?: string[];
  maxSoldiers?: number;
  resurrectChance?: number;
  spiritStatMultiplier?: number;
  spiritGhostRatio?: number;
  trapCharges?: number;
  maxTrapCharges?: number;
  triggerRadius?: number;
  isArmed?: boolean;
  rearmTimer?: number;
  aoeRadius?: number;
  buffedElements?: ElementType[];
  buffSourceId?: string | null;
  auraTickTimer?: number;
  disabledTimer?: number;
}

export interface ProjectileEntity {
  id: string;
  sourceTowerId: string;
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  targetEnemyId?: string;
  speed: number;
  damagePayload: DamagePayload;
  aoeRadius: number;
  isParabolic: boolean;
  arcHeight: number;
  progress: number; // 0 to 1 for parabolic
  chainCount?: number;
  color?: string;
}

export interface TowerSlot {
  id: string;
  x: number;
  y: number;
  placement: PlacementType;
  currentTowerId: string | null;
}

export interface BuildCursorTarget {
  x: number;
  y: number;
  terrain: 'ROAD' | 'WATER' | 'LAND' | 'INVALID';
  validFor: 'TOWER' | 'TRAP' | 'NONE';
  placement: PlacementType;
  reason?: string;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  lifeTime: number;
  maxLifeTime: number;
  size: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  lifeTime: number;
  maxLifeTime: number;
  shape: 'CIRCLE' | 'LINE' | 'SPARK';
}

