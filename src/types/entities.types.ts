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

export type TowerType =
  | 'BARRACKS'
  | 'ARCHER'
  | 'MAGE'
  | 'ARTILLERY'
  | 'TRAP_SPIKE'
  | 'TRAP_FIRE'
  | 'TRAP_FROST'
  | 'TRAP_NET';

export type TowerTier = 1 | 2 | 3 | 4;
export type TowerBranch = 'A' | 'B';

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
  state: SoldierState;
  engagedEnemyId: string | null;
  rallyPoint: Vector2D;
  targetPos: Vector2D;
  armor: number; // 0 to 1 physical damage reduction
  magicResist: number;
  respawnTimer: number; // seconds remaining if dead
  respawnDelay: number;
  tier: TowerTier;
  branch?: TowerBranch;
  canTargetAir?: boolean;
  rangedDamage?: number;
  rangedRange?: number;
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
}

export interface TowerEntity {
  id: string;
  slotId: string;
  name: string;
  type: TowerType;
  tier: TowerTier;
  branch?: TowerBranch;
  x: number;
  y: number;
  range: number;
  damage: number;
  fireRate: number; // attacks per second
  attackCooldown: number;
  element: ElementType;
  targetingFilter: TargetingFilter;
  placement: PlacementType;
  cost: number;
  totalInvested: number;
  rallyPoint?: Vector2D;
  soldierIds?: string[];
  maxSoldiers?: number;
  trapCharges?: number;
  maxTrapCharges?: number;
  triggerRadius?: number;
  isArmed?: boolean;
  rearmTimer?: number;
  aoeRadius?: number;
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

