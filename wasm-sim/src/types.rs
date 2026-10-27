use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize, Default)]
pub enum MovementType {
    #[default]
    WALK,
    FLY,
    SWIM,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize, Default)]
pub enum NavigationMode {
    #[serde(rename = "GROUND_PATH")]
    #[default]
    GroundPath,
    #[serde(rename = "WATER_PATH")]
    WaterPath,
    #[serde(rename = "AIR_DIRECT")]
    AirDirect,
    #[serde(rename = "AIR_WAYPOINTS")]
    AirWaypoints,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize, Default)]
pub enum ElementType {
    #[default]
    PHYSICAL,
    FIRE,
    WATER,
    EARTH,
    WIND,
    LIGHTNING,
    ICE,
    LIGHT,
    DARK,
    GRASS,
    POISON,
    STEEL,
    GHOST,
    DRAGON,
    FAIRY,
}

impl ElementType {
    pub fn as_str(&self) -> &'static str {
        match self {
            ElementType::PHYSICAL => "PHYSICAL",
            ElementType::FIRE => "FIRE",
            ElementType::WATER => "WATER",
            ElementType::EARTH => "EARTH",
            ElementType::WIND => "WIND",
            ElementType::LIGHTNING => "LIGHTNING",
            ElementType::ICE => "ICE",
            ElementType::LIGHT => "LIGHT",
            ElementType::DARK => "DARK",
            ElementType::GRASS => "GRASS",
            ElementType::POISON => "POISON",
            ElementType::STEEL => "STEEL",
            ElementType::GHOST => "GHOST",
            ElementType::DRAGON => "DRAGON",
            ElementType::FAIRY => "FAIRY",
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum StatusEffectType {
    BURN,
    WET,
    SLOW,
    FREEZE,
    SHOCK,
    KNOCKBACK,
    CURSE,
    ROOT,
    POISON,
    SUNDER,
    #[serde(rename = "SOUL_DRAIN")]
    SoulDrain,
    #[serde(rename = "DRAGON_AWE")]
    DragonAwe,
    CHARM,
}

impl StatusEffectType {
    pub fn is_hard_cc(&self) -> bool {
        matches!(
            self,
            StatusEffectType::FREEZE | StatusEffectType::SHOCK | StatusEffectType::ROOT
        )
    }

    pub fn is_soft_cc(&self) -> bool {
        matches!(self, StatusEffectType::SLOW | StatusEffectType::CHARM)
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StatusEffect {
    #[serde(rename = "type")]
    pub effect_type: StatusEffectType,
    pub duration: f32,
    pub value: f32,
    #[serde(default)]
    pub tick_timer: f32,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(default, rename_all = "camelCase")]
pub struct ElementalProfile {
    pub primary_element: ElementType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub secondary_element: Option<ElementType>,
    #[serde(default)]
    pub immunities: Vec<ElementType>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub damage_multipliers: Option<HashMap<ElementType, f32>>,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(default, rename_all = "camelCase")]
pub struct TargetingFilter {
    #[serde(default)]
    pub allowed_movement: Vec<MovementType>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub excluded_elements: Option<Vec<ElementType>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub excluded_tags: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub skip_immune_targets: Option<bool>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BonusElementEntry {
    pub element: ElementType,
    pub amount: f32,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StatusEffectPayload {
    #[serde(rename = "type")]
    pub effect_type: StatusEffectType,
    pub duration: f32,
    pub value: f32,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(default, rename_all = "camelCase")]
pub struct DamagePayload {
    pub amount: f32,
    pub element: ElementType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub secondary_amount: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub secondary_element: Option<ElementType>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bonus_elements: Option<Vec<BonusElementEntry>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_crit: Option<bool>,
    #[serde(default)]
    pub source_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status_effect: Option<StatusEffectPayload>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub secondary_status_effect: Option<StatusEffectPayload>,
}

#[derive(Clone, Copy, Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct Vector2D {
    pub x: f32,
    pub y: f32,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize, Default)]
pub enum PlacementType {
    #[default]
    ROADSIDE,
    #[serde(rename = "PATH_TRAP")]
    PathTrap,
    #[serde(rename = "WATER_TRAP")]
    WaterTrap,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum TowerCategory {
    DEFENSE,
    SUMMON,
    TRAP,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum SummonUnitArchetype {
    SOLDIER,
    DRAGON,
    FAIRY,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize, Default)]
pub enum TowerType {
    BARRACKS,
    #[default]
    ARCHER,
    MAGE,
    ARTILLERY,
    #[serde(rename = "DRAGON_NEST")]
    DragonNest,
    #[serde(rename = "FAIRY_TREE")]
    FairyTree,
    #[serde(rename = "HEROIC_ALTAR")]
    HeroicAltar,
    #[serde(rename = "TRAP_SPIKE")]
    TrapSpike,
    #[serde(rename = "TRAP_FIRE")]
    TrapFire,
    #[serde(rename = "TRAP_FROST")]
    TrapFrost,
    #[serde(rename = "TRAP_NET")]
    TrapNet,
}

impl TowerType {
    pub fn as_str(&self) -> &'static str {
        match self {
            TowerType::BARRACKS => "BARRACKS",
            TowerType::ARCHER => "ARCHER",
            TowerType::MAGE => "MAGE",
            TowerType::ARTILLERY => "ARTILLERY",
            TowerType::DragonNest => "DRAGON_NEST",
            TowerType::FairyTree => "FAIRY_TREE",
            TowerType::HeroicAltar => "HEROIC_ALTAR",
            TowerType::TrapSpike => "TRAP_SPIKE",
            TowerType::TrapFire => "TRAP_FIRE",
            TowerType::TrapFrost => "TRAP_FROST",
            TowerType::TrapNet => "TRAP_NET",
        }
    }

    pub fn is_trap(&self) -> bool {
        matches!(
            self,
            TowerType::TrapSpike | TowerType::TrapFire | TowerType::TrapFrost | TowerType::TrapNet
        )
    }

    pub fn is_defense(&self) -> bool {
        matches!(
            self,
            TowerType::ARCHER | TowerType::MAGE | TowerType::ARTILLERY
        )
    }

    pub fn is_summon(&self) -> bool {
        matches!(
            self,
            TowerType::BARRACKS
                | TowerType::DragonNest
                | TowerType::FairyTree
                | TowerType::HeroicAltar
        )
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum TowerBranch {
    A,
    B,
}

impl TowerBranch {
    pub fn as_str(&self) -> &'static str {
        match self {
            TowerBranch::A => "A",
            TowerBranch::B => "B",
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize, Default)]
pub enum SoldierCombatMode {
    #[default]
    MELEE,
    RANGED,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize, Default)]
pub enum SoldierState {
    #[default]
    IDLE,
    #[serde(rename = "MOVING_TO_RALLY")]
    MovingToRally,
    #[serde(rename = "MOVING_TO_ENGAGE")]
    MovingToEngage,
    ATTACKING,
    DEAD,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize, Default)]
pub enum EnemyState {
    #[default]
    WALKING,
    FLYING,
    SWIMMING,
    ENGAGED,
    ATTACKING,
    DEAD,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum EnemyAbilityType {
    SUMMON,
    #[serde(rename = "DEATH_SPAWN")]
    DeathSpawn,
    #[serde(rename = "DISABLE_TOWER")]
    DisableTower,
    #[serde(rename = "DOWNGRADE_TOWER")]
    DowngradeTower,
    #[serde(rename = "ARMOR_SHIELD_AURA")]
    ArmorShieldAura,
    #[serde(rename = "MAGIC_SHIELD_AURA")]
    MagicShieldAura,
    #[serde(rename = "HEAL_AURA")]
    HealAura,
    #[serde(rename = "DAMAGE_REDUCTION_AURA")]
    DamageReductionAura,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EnemyAbilityConfig {
    #[serde(rename = "type")]
    pub ability_type: EnemyAbilityType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub interval: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub radius: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub duration: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_targets: Option<usize>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub spawn_type_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub count: Option<usize>,
}

#[derive(Clone, Copy, Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PartialCCModifier {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub effect_efficiency: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub duration_efficiency: Option<f32>,
}

#[derive(Clone, Copy, Debug, Default, Serialize, Deserialize)]
pub struct CustomCCResistance {
    #[serde(rename = "hardCC", skip_serializing_if = "Option::is_none")]
    pub hard_cc: Option<PartialCCModifier>,
    #[serde(rename = "softCC", skip_serializing_if = "Option::is_none")]
    pub soft_cc: Option<PartialCCModifier>,
}

#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DamageReductionBuff {
    pub ratio: f32,
    pub duration: f32,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(default, rename_all = "camelCase")]
pub struct SoldierEntity {
    pub id: String,
    pub tower_id: String,
    pub name: String,
    pub x: f32,
    pub y: f32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub prev_x: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub prev_y: Option<f32>,
    pub hp: f32,
    pub max_hp: f32,
    pub damage: f32,
    pub attack_speed: f32,
    pub attack_cooldown: f32,
    pub element: ElementType,
    pub secondary_element: Option<ElementType>,
    pub combat_mode: SoldierCombatMode,
    pub state: SoldierState,
    pub engaged_enemy_id: Option<String>,
    pub rally_point: Vector2D,
    pub target_pos: Vector2D,
    pub armor: f32,
    pub magic_resist: f32,
    pub respawn_timer: f32,
    pub respawn_delay: f32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub soldier_regen: Option<f32>,
    pub tier: u8,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub branch: Option<TowerBranch>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub can_target_air: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub can_block_air: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub can_target_swim: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub archetype: Option<SummonUnitArchetype>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_spirit: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub spirit_source_archetype: Option<SummonUnitArchetype>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub spirit_ghost_ratio: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub aoe_radius: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub buffed_elements: Option<Vec<ElementType>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ranged_damage: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ranged_range: Option<f32>,
    pub base_max_hp: f32,
    pub base_damage: f32,
    pub base_armor: f32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub facing: Option<f32>,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(default, rename_all = "camelCase")]
pub struct EnemyEntity {
    pub id: String,
    pub type_id: String,
    pub name: String,
    pub x: f32,
    pub y: f32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub prev_x: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub prev_y: Option<f32>,
    pub hp: f32,
    pub max_hp: f32,
    pub speed: f32,
    pub base_speed: f32,
    pub damage: f32,
    pub attack_speed: f32,
    pub attack_cooldown: f32,
    pub reward_gold: u32,
    pub movement_type: MovementType,
    pub navigation_mode: NavigationMode,
    pub path_distance: f32,
    pub path_total_length: f32,
    pub elemental_profile: ElementalProfile,
    pub state: EnemyState,
    pub engaged_by_soldier_id: Option<String>,
    #[serde(default)]
    pub status_effects: Vec<StatusEffect>,
    #[serde(default)]
    pub tags: Vec<String>,
    pub altitude: f32,
    pub size: f32,
    pub facing: f32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub lane_index: Option<usize>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cc_resistance: Option<CustomCCResistance>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub abilities: Option<Vec<EnemyAbilityConfig>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ability_timers: Option<Vec<f32>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub armor_shield: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_armor_shield: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub magic_shield: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_magic_shield: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub damage_reduction_ratio: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub damage_reduction_timer: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub damage_reduction_buffs: Option<Vec<DamageReductionBuff>>,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(default, rename_all = "camelCase")]
pub struct TowerEntity {
    pub id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub slot_id: Option<String>,
    pub name: String,
    #[serde(rename = "type")]
    pub tower_type: TowerType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub category: Option<TowerCategory>,
    pub tier: u8,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub branch: Option<TowerBranch>,
    pub x: f32,
    pub y: f32,
    pub range: f32,
    pub damage: f32,
    pub fire_rate: f32,
    pub attack_cooldown: f32,
    pub element: ElementType,
    pub secondary_element: Option<ElementType>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub soldier_mode: Option<SoldierCombatMode>,
    pub targeting_filter: TargetingFilter,
    pub placement: PlacementType,
    pub cost: u32,
    pub total_invested: u32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rally_point: Option<Vector2D>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub soldier_ids: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_soldiers: Option<usize>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub resurrect_chance: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub spirit_stat_multiplier: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub spirit_ghost_ratio: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub trap_charges: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_trap_charges: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub trigger_radius: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_armed: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rearm_timer: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub aoe_radius: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub buffed_elements: Option<Vec<ElementType>>,
    pub buff_source_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub aura_tick_timer: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub disabled_timer: Option<f32>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectileEntity {
    pub id: String,
    pub source_tower_id: String,
    pub x: f32,
    pub y: f32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub prev_x: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub prev_y: Option<f32>,
    pub start_x: f32,
    pub start_y: f32,
    pub target_x: f32,
    pub target_y: f32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub target_enemy_id: Option<String>,
    pub speed: f32,
    pub damage_payload: DamagePayload,
    pub aoe_radius: f32,
    pub is_parabolic: bool,
    pub arc_height: f32,
    pub progress: f32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub chain_count: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub color: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TowerSlot {
    pub id: String,
    pub x: f32,
    pub y: f32,
    pub placement: PlacementType,
    pub current_tower_id: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FloatingText {
    pub id: String,
    pub text: String,
    pub x: f32,
    pub y: f32,
    pub color: String,
    pub life_time: f32,
    pub max_life_time: f32,
    pub size: f32,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize, Default)]
pub enum ParticleShape {
    #[default]
    CIRCLE,
    LINE,
    SPARK,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Particle {
    pub id: String,
    pub x: f32,
    pub y: f32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub prev_x: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub prev_y: Option<f32>,
    pub vx: f32,
    pub vy: f32,
    pub color: String,
    pub size: f32,
    pub life_time: f32,
    pub max_life_time: f32,
    pub shape: ParticleShape,
}
