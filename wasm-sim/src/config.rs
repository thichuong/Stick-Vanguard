use crate::types::{
    CustomCCResistance, ElementType, ElementalProfile, EnemyAbilityConfig, MovementType,
    NavigationMode, PlacementType, SummonUnitArchetype, TargetingFilter, TowerBranch,
    TowerCategory, TowerType, Vector2D, StatusEffectType,
};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

pub const ELEMENT_IMBUE_COST: u32 = 40;
pub const MAGE_SECOND_ELEMENT_COST: u32 = 50;
pub const HYBRID_ELEMENT_DMG_RATIO: f32 = 0.45;
pub const MAGE_SECONDARY_DMG_RATIO: f32 = 1.0;

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ElementCombatStats {
    pub vs_walk_multiplier: Option<f32>,
    pub vs_fly_multiplier: Option<f32>,
    pub vs_boss_elite_multiplier: Option<f32>,
    pub status_duration: Option<f32>,
    pub status_value: Option<f32>,
    pub slow_duration: Option<f32>,
    pub slow_ratio: Option<f32>,
    pub proc_chance: Option<f32>,
    pub proc_duration: Option<f32>,
    pub knockback_chance_ground: Option<f32>,
    pub knockback_chance_fly: Option<f32>,
    pub knockback_distance_ground: Option<f32>,
    pub knockback_distance_fly: Option<f32>,
    pub dot_tick_interval: Option<f32>,
    pub dot_damage_ratio: Option<f32>,
    pub dot_min_damage: Option<f32>,
    pub max_stacks: Option<f32>,
    pub damage_per_stack: Option<f32>,
    pub chain_damage_ratio: Option<f32>,
    pub chain_range: Option<f32>,
    pub soldier_heal_on_hit: Option<f32>,
    pub damage_amp: Option<f32>,
    pub bypass_physical_resist: Option<bool>,
    pub attack_speed_reduction: Option<f32>,
    pub enemy_damage_reduction: Option<f32>,
    pub missing_hp_damage_ratio: Option<f32>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ElementalReaction {
    pub id: String,
    pub name: String,
    pub required_status: StatusEffectType,
    pub trigger_element: ElementType,
    pub damage_multiplier: f32,
    pub bonus_effect: Option<String>,
    pub label: String,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum EnemyTierCategory {
    NORMAL,
    ELITE,
    BOSS,
}

#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CrowdControlModifiers {
    pub effect_efficiency: f32,
    pub duration_efficiency: f32,
}

#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct TierCCConfig {
    #[serde(rename = "hardCC")]
    pub hard_cc: CrowdControlModifiers,
    #[serde(rename = "softCC")]
    pub soft_cc: CrowdControlModifiers,
}

impl TierCCConfig {
    pub fn default_for_tier(tier: EnemyTierCategory) -> Self {
        match tier {
            EnemyTierCategory::NORMAL => TierCCConfig {
                hard_cc: CrowdControlModifiers {
                    effect_efficiency: 1.0,
                    duration_efficiency: 1.0,
                },
                soft_cc: CrowdControlModifiers {
                    effect_efficiency: 1.0,
                    duration_efficiency: 1.0,
                },
            },
            EnemyTierCategory::ELITE => TierCCConfig {
                hard_cc: CrowdControlModifiers {
                    effect_efficiency: 0.5,
                    duration_efficiency: 0.5,
                },
                soft_cc: CrowdControlModifiers {
                    effect_efficiency: 1.0,
                    duration_efficiency: 1.0,
                },
            },
            EnemyTierCategory::BOSS => TierCCConfig {
                hard_cc: CrowdControlModifiers {
                    effect_efficiency: 0.0,
                    duration_efficiency: 0.0,
                },
                soft_cc: CrowdControlModifiers {
                    effect_efficiency: 0.5,
                    duration_efficiency: 0.5,
                },
            },
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TowerBlueprint {
    #[serde(rename = "type")]
    pub tower_type: TowerType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub category: Option<TowerCategory>,
    pub tier: u8,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub branch: Option<TowerBranch>,
    pub name: String,
    #[serde(default)]
    pub description: String,
    pub cost: u32,
    pub placement: PlacementType,
    pub range: f32,
    pub damage: f32,
    pub fire_rate: f32,
    pub element: ElementType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub default_secondary_element: Option<ElementType>,
    pub targeting_filter: TargetingFilter,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub aoe_radius: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_parabolic: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_soldiers: Option<usize>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub soldier_hp: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub soldier_armor: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub soldier_respawn: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub soldier_regen: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub can_target_air: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub can_block_air: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub can_target_swim: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub archetype: Option<SummonUnitArchetype>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub resurrect_chance: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub spirit_stat_multiplier: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub spirit_ghost_ratio: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_trap_charges: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub trigger_radius: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rearm_time: Option<f32>,
    #[serde(default)]
    pub color: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EnemyBlueprint {
    pub type_id: String,
    pub name: String,
    #[serde(default)]
    pub description: String,
    pub hp: f32,
    pub speed: f32,
    pub damage: f32,
    pub attack_speed: f32,
    pub reward_gold: u32,
    pub movement_type: MovementType,
    pub navigation_mode: NavigationMode,
    pub elemental_profile: ElementalProfile,
    #[serde(default)]
    pub tags: Vec<String>,
    pub altitude: f32,
    pub size: f32,
    #[serde(default)]
    pub color: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub abilities: Option<Vec<EnemyAbilityConfig>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cc_resistance: Option<CustomCCResistance>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WaveEnemyEntry {
    pub type_id: String,
    pub count: usize,
    pub interval: f32,
    pub delay: f32,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WaveConfig {
    pub wave_number: usize,
    pub name: String,
    pub reward_gold: u32,
    pub enemies: Vec<WaveEnemyEntry>,
}

#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlayerBaseConfig {
    pub x: f32,
    pub y: f32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub radius: Option<f32>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(untagged)]
pub enum LaneItem {
    Point(Vector2D),
    BaseNumber(usize),
}

pub type MapLane = Vec<LaneItem>;

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MapConfig {
    pub id: String,
    pub name: String,
    #[serde(default)]
    pub subtitle: String,
    #[serde(default)]
    pub description: String,
    #[serde(default)]
    pub theme_color: String,
    #[serde(default)]
    pub road_color: String,
    #[serde(default)]
    pub river_color: String,
    pub width: Option<f32>,
    pub height: Option<f32>,
    pub road_width: Option<f32>,
    pub river_width: Option<f32>,
    #[serde(default)]
    pub player_bases: Vec<PlayerBaseConfig>,
    #[serde(default)]
    pub ground_lanes: Vec<MapLane>,
    #[serde(default)]
    pub water_lanes: Vec<MapLane>,
    #[serde(default)]
    pub air_lanes: Vec<MapLane>,
    #[serde(default)]
    pub waves: Vec<WaveConfig>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub extended_waves: Option<Vec<WaveConfig>>,
}

#[derive(Clone, Copy, Debug)]
pub struct ResolvedBase {
    pub x: f32,
    pub y: f32,
    pub radius: f32,
}

impl MapConfig {
    pub fn get_map_bases(&self) -> Vec<ResolvedBase> {
        if !self.player_bases.is_empty() {
            self.player_bases
                .iter()
                .map(|b| ResolvedBase {
                    x: b.x,
                    y: b.y,
                    radius: b.radius.unwrap_or(42.0),
                })
                .collect()
        } else {
            vec![ResolvedBase {
                x: 500.0,
                y: 325.0,
                radius: 42.0,
            }]
        }
    }

    pub fn resolve_lane_waypoints(lane: &[LaneItem], bases: &[PlayerBaseConfig]) -> Vec<Vector2D> {
        if lane.is_empty() {
            return Vec::new();
        }

        let mut points = Vec::with_capacity(lane.len());
        let mut base_num: Option<usize> = None;

        for (idx, item) in lane.iter().enumerate() {
            match item {
                LaneItem::Point(pt) => {
                    if idx < lane.len() - 1 {
                        points.push(*pt);
                    } else {
                        // In case lane didn't end with number, keep point
                        points.push(*pt);
                    }
                }
                LaneItem::BaseNumber(num) => {
                    base_num = Some(*num);
                }
            }
        }

        if let Some(num) = base_num {
            if !bases.is_empty() {
                let base_idx = num.saturating_sub(1).min(bases.len() - 1);
                let b = bases[base_idx];
                points.push(Vector2D { x: b.x, y: b.y });
            }
        } else if !bases.is_empty() && lane.len() >= 1 {
            // If last element was not BaseNumber, check if we already pushed all points
        }

        points
    }

    pub fn get_resolved_ground_lanes(&self) -> Vec<Vec<Vector2D>> {
        self.ground_lanes
            .iter()
            .map(|lane| Self::resolve_lane_waypoints(lane, &self.player_bases))
            .collect()
    }

    pub fn get_resolved_water_lanes(&self) -> Vec<Vec<Vector2D>> {
        self.water_lanes
            .iter()
            .map(|lane| Self::resolve_lane_waypoints(lane, &self.player_bases))
            .collect()
    }

    pub fn get_resolved_air_lanes(&self) -> Vec<Vec<Vector2D>> {
        self.air_lanes
            .iter()
            .map(|lane| Self::resolve_lane_waypoints(lane, &self.player_bases))
            .collect()
    }

    pub fn get_unique_lane_spawns(lanes: &[MapLane]) -> Vec<Vector2D> {
        let mut seen = HashSet::new();
        let mut spawns = Vec::new();
        for lane in lanes {
            if let Some(LaneItem::Point(first)) = lane.first() {
                let key = format!("{},{}", first.x, first.y);
                if seen.insert(key) {
                    spawns.push(*first);
                }
            }
        }
        spawns
    }

    pub fn get_traversable_lane_count(&self, nav_mode: NavigationMode) -> usize {
        match nav_mode {
            NavigationMode::WaterPath => self.water_lanes.len().max(1),
            NavigationMode::AirDirect | NavigationMode::AirWaypoints => self.air_lanes.len().max(1),
            NavigationMode::GroundPath => self.ground_lanes.len().max(1),
        }
    }
}

pub fn get_distance_to_segment(
    px: f32,
    py: f32,
    x1: f32,
    y1: f32,
    x2: f32,
    y2: f32,
) -> (f32, Vector2D) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    let len_sq = dx * dx + dy * dy;

    if len_sq == 0.0 {
        let dist = ((px - x1).powi(2) + (py - y1).powi(2)).sqrt();
        return (dist, Vector2D { x: x1, y: y1 });
    }

    let t = (((px - x1) * dx + (py - y1) * dy) / len_sq).clamp(0.0, 1.0);
    let proj_x = x1 + t * dx;
    let proj_y = y1 + t * dy;
    let dist = ((px - proj_x).powi(2) + (py - proj_y).powi(2)).sqrt();

    (dist, Vector2D { x: proj_x, y: proj_y })
}

pub fn get_distance_to_polyline(px: f32, py: f32, waypoints: &[Vector2D]) -> (f32, Vector2D) {
    if waypoints.is_empty() {
        return (f32::INFINITY, Vector2D { x: px, y: py });
    }
    if waypoints.len() == 1 {
        let pt = waypoints[0];
        let dist = ((px - pt.x).powi(2) + (py - pt.y).powi(2)).sqrt();
        return (dist, pt);
    }

    let mut min_distance = f32::INFINITY;
    let mut closest_point = waypoints[0];

    for i in 0..(waypoints.len() - 1) {
        let p1 = waypoints[i];
        let p2 = waypoints[i + 1];
        let (dist, pt) = get_distance_to_segment(px, py, p1.x, p1.y, p2.x, p2.y);
        if dist < min_distance {
            min_distance = dist;
            closest_point = pt;
        }
    }

    (min_distance, closest_point)
}

pub fn get_distance_to_polylines(
    px: f32,
    py: f32,
    polylines: &[Vec<Vector2D>],
) -> (f32, Vector2D, isize) {
    if polylines.is_empty() {
        return (f32::INFINITY, Vector2D { x: px, y: py }, -1);
    }

    let mut min_distance = f32::INFINITY;
    let mut closest_point = Vector2D { x: px, y: py };
    let mut best_lane_index: isize = 0;

    for (i, lane) in polylines.iter().enumerate() {
        if lane.is_empty() {
            continue;
        }
        let (dist, pt) = get_distance_to_polyline(px, py, lane);
        if dist < min_distance {
            min_distance = dist;
            closest_point = pt;
            best_lane_index = i as isize;
        }
    }

    (min_distance, closest_point, best_lane_index)
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GameConfigRegistry {
    #[serde(default)]
    pub towers: HashMap<String, TowerBlueprint>,
    #[serde(default)]
    pub enemies: HashMap<String, EnemyBlueprint>,
    #[serde(default)]
    pub maps: Vec<MapConfig>,
    #[serde(default)]
    pub element_matchups: HashMap<ElementType, HashMap<ElementType, f32>>,
    #[serde(default)]
    pub element_reactions: Vec<ElementalReaction>,
    #[serde(default)]
    pub element_combat_stats: HashMap<ElementType, ElementCombatStats>,
    #[serde(default)]
    pub element_colors: HashMap<ElementType, String>,
    #[serde(default)]
    pub element_names: HashMap<ElementType, String>,
    #[serde(default)]
    pub cc_config: HashMap<EnemyTierCategory, TierCCConfig>,
}

impl GameConfigRegistry {
    pub fn get_element_color(&self, elem: ElementType) -> &str {
        if let Some(c) = self.element_colors.get(&elem) {
            return c.as_str();
        }
        match elem {
            ElementType::PHYSICAL => "#94a3b8",
            ElementType::FIRE => "#ef4444",
            ElementType::WATER => "#3b82f6",
            ElementType::EARTH => "#d97706",
            ElementType::WIND => "#10b981",
            ElementType::LIGHTNING => "#eab308",
            ElementType::ICE => "#06b6d4",
            ElementType::LIGHT => "#fde047",
            ElementType::DARK => "#9333ea",
            ElementType::GRASS => "#22c55e",
            ElementType::POISON => "#a855f7",
            ElementType::STEEL => "#cbd5e1",
            ElementType::GHOST => "#818cf8",
            ElementType::DRAGON => "#f97316",
            ElementType::FAIRY => "#f472b6",
        }
    }

    pub fn get_element_name(&self, elem: ElementType) -> &str {
        if let Some(n) = self.element_names.get(&elem) {
            return n.as_str();
        }
        match elem {
            ElementType::PHYSICAL => "Vật Lý",
            ElementType::FIRE => "Hỏa",
            ElementType::WATER => "Thủy",
            ElementType::EARTH => "Thổ",
            ElementType::WIND => "Phong",
            ElementType::LIGHTNING => "Lôi",
            ElementType::ICE => "Băng",
            ElementType::LIGHT => "Quang",
            ElementType::DARK => "Ám",
            ElementType::GRASS => "Thảo",
            ElementType::POISON => "Độc",
            ElementType::STEEL => "Thép",
            ElementType::GHOST => "Ma",
            ElementType::DRAGON => "Rồng",
            ElementType::FAIRY => "Tiên",
        }
    }

    pub fn get_matchup(&self, attacker: ElementType, defender: ElementType) -> f32 {
        self.element_matchups
            .get(&attacker)
            .and_then(|row| row.get(&defender))
            .copied()
            .unwrap_or(1.0)
    }

    pub fn get_cc_config(&self, tier: EnemyTierCategory) -> TierCCConfig {
        self.cc_config
            .get(&tier)
            .copied()
            .unwrap_or_else(|| TierCCConfig::default_for_tier(tier))
    }
}

