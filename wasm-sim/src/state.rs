use crate::audio::RustSoundSystem;
use crate::config::{
    get_distance_to_polylines, GameConfigRegistry, MapConfig, TowerBlueprint, ELEMENT_IMBUE_COST,
    MAGE_SECOND_ELEMENT_COST,
};
use crate::rules::SimpleRng;
use crate::types::{
    ElementType, EnemyEntity, FloatingText, MovementType, Particle, ParticleShape, PlacementType,
    ProjectileEntity, SoldierCombatMode, SoldierEntity, SoldierState, SummonUnitArchetype,
    TargetingFilter, TowerBranch, TowerEntity, TowerSlot, TowerType, Vector2D,
};
use serde::{Deserialize, Serialize};
use std::f32::consts::PI;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlacementValidationResult {
    pub valid: bool,
    pub placement: PlacementType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reason: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RustGameState {
    pub gold: i32,
    pub lives: i32,
    pub max_lives: i32,
    pub game_speed: f32,
    pub is_paused: bool,
    pub is_game_over: bool,
    pub is_victory: bool,

    pub custom_total_waves: usize,
    pub gold_multiplier: f32,
    pub damage_multiplier: f32,

    pub sound_enabled: bool,
    pub sound_volume: f32,

    pub current_map_id: String,
    pub current_map: MapConfig,

    pub tower_slots: Vec<TowerSlot>,
    pub towers: Vec<TowerEntity>,
    pub soldiers: Vec<SoldierEntity>,
    pub enemies: Vec<EnemyEntity>,
    pub projectiles: Vec<ProjectileEntity>,
    pub floating_texts: Vec<FloatingText>,
    pub particles: Vec<Particle>,

    pub selected_slot_id: Option<String>,
    pub selected_tower_id: Option<String>,
    pub is_setting_rally_point: bool,
    pub active_placement_type: Option<TowerType>,
    pub hovered_slot_id: Option<String>,
    pub hovered_tower_id: Option<String>,
    pub mouse_pos: Vector2D,

    #[serde(default)]
    pub tower_id_counter: u32,
    #[serde(default)]
    pub soldier_id_counter: u32,
    #[serde(default)]
    pub text_id_counter: u32,
    #[serde(default)]
    pub particle_id_counter: u32,
}

impl Default for RustGameState {
    fn default() -> Self {
        Self::new()
    }
}

impl RustGameState {
    pub fn new() -> Self {
        let mut s = RustGameState {
            gold: 320,
            lives: 20,
            max_lives: 20,
            game_speed: 1.0,
            is_paused: false,
            is_game_over: false,
            is_victory: false,
            custom_total_waves: 15,
            gold_multiplier: 1.0,
            damage_multiplier: 1.0,
            sound_enabled: true,
            sound_volume: 0.7,
            current_map_id: "VALLEY_ORIGIN".to_string(),
            current_map: MapConfig::default(),
            tower_slots: Vec::new(),
            towers: Vec::new(),
            soldiers: Vec::new(),
            enemies: Vec::new(),
            projectiles: Vec::new(),
            floating_texts: Vec::new(),
            particles: Vec::new(),
            selected_slot_id: None,
            selected_tower_id: None,
            is_setting_rally_point: false,
            active_placement_type: None,
            hovered_slot_id: None,
            hovered_tower_id: None,
            mouse_pos: Vector2D { x: 0.0, y: 0.0 },
            tower_id_counter: 0,
            soldier_id_counter: 0,
            text_id_counter: 0,
            particle_id_counter: 0,
        };
        s.reset();
        s
    }

    pub fn set_map(&mut self, registry: &GameConfigRegistry, map_id: &str) -> bool {
        if let Some(found) = registry.maps.iter().find(|m| m.id == map_id) {
            self.current_map_id = found.id.clone();
            self.current_map = found.clone();
            self.reset();
            return true;
        }
        false
    }

    pub fn reset(&mut self) {
        self.gold = 320;
        self.lives = 20;
        if (self.game_speed - 1.0).abs() > 0.01 && (self.game_speed - 2.0).abs() > 0.01 {
            self.game_speed = 1.0;
        }
        self.is_paused = false;
        self.is_game_over = false;
        self.is_victory = false;
        self.selected_slot_id = None;
        self.selected_tower_id = None;
        self.is_setting_rally_point = false;
        self.active_placement_type = None;
        self.hovered_slot_id = None;
        self.hovered_tower_id = None;

        self.tower_slots = vec![
            TowerSlot {
                id: "slot-r1".to_string(),
                x: 150.0,
                y: 105.0,
                placement: PlacementType::ROADSIDE,
                current_tower_id: None,
            },
            TowerSlot {
                id: "slot-r2".to_string(),
                x: 230.0,
                y: 245.0,
                placement: PlacementType::ROADSIDE,
                current_tower_id: None,
            },
            TowerSlot {
                id: "slot-r3".to_string(),
                x: 235.0,
                y: 365.0,
                placement: PlacementType::ROADSIDE,
                current_tower_id: None,
            },
        ];

        self.towers.clear();
        self.soldiers.clear();
        self.enemies.clear();
        self.projectiles.clear();
        self.floating_texts.clear();
        self.particles.clear();
    }

    pub fn validate_placement(&self, x: f32, y: f32, type_str: &str) -> PlacementValidationResult {
        let is_trap = type_str == "TRAP_GENERIC" || type_str.starts_with("TRAP_");
        let width = self.current_map.width.unwrap_or(1000.0);
        let height = self.current_map.height.unwrap_or(650.0);

        let margin = 26.0;
        if x < margin || x > width - margin || y < margin || y > height - margin {
            return PlacementValidationResult {
                valid: false,
                placement: PlacementType::ROADSIDE,
                reason: Some("Vị trí nằm ngoài phạm vi chiến trường!".to_string()),
            };
        }

        for base in self.current_map.get_map_bases() {
            let dist = ((x - base.x).powi(2) + (y - base.y).powi(2)).sqrt();
            if dist < base.radius + 14.0 {
                return PlacementValidationResult {
                    valid: false,
                    placement: PlacementType::ROADSIDE,
                    reason: Some("Quá gần căn cứ trung tâm!".to_string()),
                };
            }
        }

        for sp in MapConfig::get_unique_lane_spawns(&self.current_map.ground_lanes) {
            if ((x - sp.x).powi(2) + (y - sp.y).powi(2)).sqrt() < 30.0 {
                return PlacementValidationResult {
                    valid: false,
                    placement: PlacementType::ROADSIDE,
                    reason: Some("Quá gần cổng quái xuất phát!".to_string()),
                };
            }
        }

        for sp in MapConfig::get_unique_lane_spawns(&self.current_map.water_lanes) {
            if ((x - sp.x).powi(2) + (y - sp.y).powi(2)).sqrt() < 30.0 {
                return PlacementValidationResult {
                    valid: false,
                    placement: PlacementType::ROADSIDE,
                    reason: Some("Quá gần cổng thủy quái!".to_string()),
                };
            }
        }

        let ground_lanes = self.current_map.get_resolved_ground_lanes();
        let water_lanes = self.current_map.get_resolved_water_lanes();

        let (road_dist, _, _) = get_distance_to_polylines(x, y, &ground_lanes);
        let (river_dist, _, _) = get_distance_to_polylines(x, y, &water_lanes);

        let road_half_width = 22.0;
        let river_half_width = 20.0;

        let is_on_road = road_dist <= road_half_width;
        let is_on_river = river_dist <= river_half_width;

        let min_dist_to_other = if is_trap { 26.0 } else { 34.0 };
        for existing in &self.towers {
            let d = ((x - existing.x).powi(2) + (y - existing.y).powi(2)).sqrt();
            if d < min_dist_to_other {
                return PlacementValidationResult {
                    valid: false,
                    placement: if is_trap {
                        PlacementType::PathTrap
                    } else {
                        PlacementType::ROADSIDE
                    },
                    reason: Some("Quá gần công trình khác!".to_string()),
                };
            }
        }

        if is_trap {
            if !is_on_road && !is_on_river {
                return PlacementValidationResult {
                    valid: false,
                    placement: PlacementType::PathTrap,
                    reason: Some("Bẫy phải đặt trên đường hoặc trên sông!".to_string()),
                };
            }
            PlacementValidationResult {
                valid: true,
                placement: if is_on_river {
                    PlacementType::WaterTrap
                } else {
                    PlacementType::PathTrap
                },
                reason: None,
            }
        } else {
            if road_dist < road_half_width + 14.0 {
                return PlacementValidationResult {
                    valid: false,
                    placement: PlacementType::ROADSIDE,
                    reason: Some("Tháp không được đặt trên đường!".to_string()),
                };
            }
            if river_dist < river_half_width + 14.0 {
                return PlacementValidationResult {
                    valid: false,
                    placement: PlacementType::ROADSIDE,
                    reason: Some("Tháp không được đặt dưới dòng sông!".to_string()),
                };
            }
            PlacementValidationResult {
                valid: true,
                placement: PlacementType::ROADSIDE,
                reason: None,
            }
        }
    }

    pub fn build_tower_at(
        &mut self,
        registry: &GameConfigRegistry,
        audio: &mut RustSoundSystem,
        x: f32,
        y: f32,
        tower_type: TowerType,
    ) -> bool {
        let type_str = tower_type.as_str();
        let bp_key = if tower_type.is_trap() {
            type_str.to_string()
        } else {
            format!("{}_1", type_str)
        };

        let Some(bp) = registry.towers.get(&bp_key).cloned() else {
            return false;
        };

        let validation = self.validate_placement(x, y, type_str);
        if !validation.valid {
            audio.play_error();
            let reason = validation
                .reason
                .unwrap_or_else(|| "Vị trí không hợp lệ!".to_string());
            self.add_floating_text(&reason, x, y - 10.0, "#ef4444", 13.0);
            return false;
        }

        if self.gold < bp.cost as i32 {
            audio.play_error();
            self.add_floating_text("Không đủ vàng!", x, y - 10.0, "#ef4444", 13.0);
            return false;
        }

        self.gold -= bp.cost as i32;
        self.tower_id_counter += 1;
        let tower_id = format!("tower-{}", self.tower_id_counter);

        let mut rally_point: Option<Vector2D> = None;
        let mut soldier_ids: Option<Vec<String>> = None;

        if bp.tower_type.is_summon() {
            let ground_lanes = self.current_map.get_resolved_ground_lanes();
            let (_, closest_pt, _) = get_distance_to_polylines(x, y, &ground_lanes);
            let dist_to_closest = ((closest_pt.x - x).powi(2) + (closest_pt.y - y).powi(2)).sqrt();

            let rp = if dist_to_closest <= bp.range {
                closest_pt
            } else {
                let angle = (closest_pt.y - y).atan2(closest_pt.x - x);
                Vector2D {
                    x: (x + angle.cos() * (bp.range - 10.0)).round(),
                    y: (y + angle.sin() * (bp.range - 10.0)).round(),
                }
            };
            rally_point = Some(rp);

            match bp.tower_type {
                TowerType::BARRACKS => {
                    let count = bp.max_soldiers.unwrap_or(3);
                    let mut ids = Vec::with_capacity(count);
                    for i in 0..count {
                        self.soldier_id_counter += 1;
                        let sid = format!("soldier-{}", self.soldier_id_counter);
                        ids.push(sid.clone());

                        let offset_angle = (i as f32 / 3.0) * PI * 2.0;
                        let ix = rp.x + offset_angle.cos() * 12.0;
                        let iy = rp.y + offset_angle.sin() * 12.0;
                        let s_hp = bp.soldier_hp.unwrap_or(100.0);
                        let s_armor = bp.soldier_armor.unwrap_or(0.1);

                        self.soldiers.push(SoldierEntity {
                            id: sid,
                            tower_id: tower_id.clone(),
                            name: format!("Lính {}", i + 1),
                            archetype: Some(SummonUnitArchetype::SOLDIER),
                            x: ix,
                            y: iy,
                            prev_x: Some(ix),
                            prev_y: Some(iy),
                            hp: s_hp,
                            max_hp: s_hp,
                            base_max_hp: s_hp,
                            damage: bp.damage,
                            base_damage: bp.damage,
                            attack_speed: bp.fire_rate,
                            attack_cooldown: 0.5,
                            element: ElementType::PHYSICAL,
                            secondary_element: None,
                            combat_mode: SoldierCombatMode::MELEE,
                            state: SoldierState::IDLE,
                            engaged_enemy_id: None,
                            rally_point: Vector2D { x: ix, y: iy },
                            target_pos: Vector2D { x: ix, y: iy },
                            armor: s_armor,
                            base_armor: s_armor,
                            magic_resist: 0.1,
                            respawn_timer: 0.0,
                            respawn_delay: bp.soldier_respawn.unwrap_or(8.0),
                            soldier_regen: Some(bp.soldier_regen.unwrap_or(0.0)),
                            tier: 1,
                            branch: None,
                            can_target_air: None,
                            can_block_air: None,
                            can_target_swim: None,
                            is_spirit: None,
                            spirit_source_archetype: None,
                            spirit_ghost_ratio: None,
                            aoe_radius: None,
                            buffed_elements: None,
                            ranged_damage: None,
                            ranged_range: Some(145.0),
                            facing: Some(0.0),
                        });
                    }
                    soldier_ids = Some(ids);
                }
                TowerType::DragonNest => {
                    self.soldier_id_counter += 1;
                    let sid = format!("dragon-{}", self.soldier_id_counter);
                    let s_hp = bp.soldier_hp.unwrap_or(220.0);
                    let s_armor = bp.soldier_armor.unwrap_or(0.2);

                    self.soldiers.push(SoldierEntity {
                        id: sid.clone(),
                        tower_id: tower_id.clone(),
                        name: "Hỏa Long".to_string(),
                        archetype: Some(SummonUnitArchetype::DRAGON),
                        can_block_air: Some(true),
                        can_target_air: Some(true),
                        can_target_swim: Some(true),
                        aoe_radius: Some(bp.aoe_radius.unwrap_or(55.0)),
                        x: rp.x,
                        y: rp.y,
                        prev_x: Some(rp.x),
                        prev_y: Some(rp.y),
                        hp: s_hp,
                        max_hp: s_hp,
                        base_max_hp: s_hp,
                        damage: bp.damage,
                        base_damage: bp.damage,
                        attack_speed: bp.fire_rate,
                        attack_cooldown: 0.5,
                        element: ElementType::DRAGON,
                        secondary_element: Some(ElementType::FIRE),
                        combat_mode: SoldierCombatMode::MELEE,
                        state: SoldierState::IDLE,
                        facing: Some(0.0),
                        engaged_enemy_id: None,
                        rally_point: rp,
                        target_pos: rp,
                        armor: s_armor,
                        base_armor: s_armor,
                        magic_resist: 0.2,
                        respawn_timer: 0.0,
                        respawn_delay: bp.soldier_respawn.unwrap_or(9.0),
                        soldier_regen: Some(bp.soldier_regen.unwrap_or(0.0)),
                        tier: 1,
                        branch: None,
                        is_spirit: None,
                        spirit_source_archetype: None,
                        spirit_ghost_ratio: None,
                        buffed_elements: None,
                        ranged_damage: None,
                        ranged_range: None,
                    });
                    soldier_ids = Some(vec![sid]);
                }
                TowerType::FairyTree => {
                    let count = bp.max_soldiers.unwrap_or(2);
                    let mut ids = Vec::with_capacity(count);
                    for i in 0..count {
                        self.soldier_id_counter += 1;
                        let sid = format!("fairy-{}", self.soldier_id_counter);
                        ids.push(sid.clone());

                        let offset_angle = (i as f32 / count as f32) * PI * 2.0;
                        let ix = rp.x + offset_angle.cos() * 14.0;
                        let iy = rp.y + offset_angle.sin() * 14.0;
                        let s_hp = bp.soldier_hp.unwrap_or(80.0);
                        let s_armor = bp.soldier_armor.unwrap_or(0.1);

                        self.soldiers.push(SoldierEntity {
                            id: sid,
                            tower_id: tower_id.clone(),
                            name: format!("Tiên {}", i + 1),
                            archetype: Some(SummonUnitArchetype::FAIRY),
                            can_block_air: Some(true),
                            can_target_air: Some(true),
                            can_target_swim: Some(true),
                            x: ix,
                            y: iy,
                            prev_x: Some(ix),
                            prev_y: Some(iy),
                            hp: s_hp,
                            max_hp: s_hp,
                            base_max_hp: s_hp,
                            damage: bp.damage,
                            base_damage: bp.damage,
                            attack_speed: bp.fire_rate,
                            attack_cooldown: 0.5,
                            element: ElementType::FAIRY,
                            secondary_element: Some(ElementType::LIGHT),
                            combat_mode: SoldierCombatMode::MELEE,
                            state: SoldierState::IDLE,
                            engaged_enemy_id: None,
                            rally_point: Vector2D { x: ix, y: iy },
                            target_pos: Vector2D { x: ix, y: iy },
                            armor: s_armor,
                            base_armor: s_armor,
                            magic_resist: 0.15,
                            respawn_timer: 0.0,
                            respawn_delay: bp.soldier_respawn.unwrap_or(7.0),
                            soldier_regen: Some(bp.soldier_regen.unwrap_or(0.0)),
                            tier: 1,
                            branch: None,
                            is_spirit: None,
                            spirit_source_archetype: None,
                            spirit_ghost_ratio: None,
                            aoe_radius: None,
                            buffed_elements: None,
                            ranged_damage: None,
                            ranged_range: None,
                            facing: Some(0.0),
                        });
                    }
                    soldier_ids = Some(ids);
                }
                TowerType::HeroicAltar => {
                    soldier_ids = Some(Vec::new());
                }
                _ => {}
            }
        }

        let default_element = match bp.tower_type {
            TowerType::DragonNest => ElementType::DRAGON,
            TowerType::FairyTree => ElementType::FAIRY,
            TowerType::HeroicAltar => ElementType::GHOST,
            TowerType::MAGE => ElementType::DARK,
            _ => {
                if bp.tower_type.is_trap() {
                    bp.element
                } else {
                    ElementType::PHYSICAL
                }
            }
        };

        let default_secondary = match bp.tower_type {
            TowerType::DragonNest => Some(ElementType::FIRE),
            TowerType::FairyTree => Some(ElementType::LIGHT),
            _ => None,
        };

        self.towers.push(TowerEntity {
            id: tower_id.clone(),
            slot_id: None,
            name: bp.name,
            tower_type: bp.tower_type,
            category: bp.category,
            tier: bp.tier,
            branch: bp.branch,
            x,
            y,
            range: bp.range,
            damage: bp.damage,
            fire_rate: bp.fire_rate,
            attack_cooldown: 0.5,
            element: default_element,
            secondary_element: default_secondary,
            soldier_mode: if bp.tower_type == TowerType::BARRACKS {
                Some(SoldierCombatMode::MELEE)
            } else {
                None
            },
            targeting_filter: bp.targeting_filter,
            placement: validation.placement,
            cost: bp.cost,
            total_invested: bp.cost,
            rally_point,
            soldier_ids,
            max_soldiers: bp.max_soldiers,
            resurrect_chance: bp.resurrect_chance,
            spirit_stat_multiplier: bp.spirit_stat_multiplier,
            spirit_ghost_ratio: Some(bp.spirit_ghost_ratio.unwrap_or(0.5)),
            trap_charges: bp.max_trap_charges,
            max_trap_charges: bp.max_trap_charges,
            trigger_radius: bp.trigger_radius,
            is_armed: None,
            rearm_timer: bp.rearm_time,
            aoe_radius: bp.aoe_radius,
            buffed_elements: None,
            buff_source_id: None,
            aura_tick_timer: None,
            disabled_timer: None,
        });

        self.selected_tower_id = Some(tower_id);
        self.selected_slot_id = None;

        self.recalculate_tower_buffs();

        audio.play_build();
        self.add_floating_text(&format!("-{} 🪙", bp.cost), x, y - 15.0, "#eab308", 13.0);
        true
    }

    pub fn build_tower(
        &mut self,
        registry: &GameConfigRegistry,
        audio: &mut RustSoundSystem,
        slot_id: &str,
        tower_type: TowerType,
    ) -> bool {
        let Some(slot_idx) = self.tower_slots.iter().position(|s| s.id == slot_id) else {
            return false;
        };
        if self.tower_slots[slot_idx].current_tower_id.is_some() {
            return false;
        }
        let sx = self.tower_slots[slot_idx].x;
        let sy = self.tower_slots[slot_idx].y;

        let built = self.build_tower_at(registry, audio, sx, sy, tower_type);
        if built {
            let tid = self.selected_tower_id.clone();
            self.tower_slots[slot_idx].current_tower_id = tid.clone();
            if let Some(ref tower_id) = tid {
                if let Some(t) = self.towers.iter_mut().find(|t| &t.id == tower_id) {
                    t.slot_id = Some(slot_id.to_string());
                }
            }
        }
        built
    }

    pub fn upgrade_tower(
        &mut self,
        registry: &GameConfigRegistry,
        audio: &mut RustSoundSystem,
        tower_id: &str,
        branch: Option<TowerBranch>,
    ) -> bool {
        let Some(t_idx) = self.towers.iter().position(|t| t.id == tower_id) else {
            return false;
        };
        if self.towers[t_idx].tier >= 4 {
            return false;
        }

        let next_tier = self.towers[t_idx].tier + 1;
        let type_str = self.towers[t_idx].tower_type.as_str();
        let next_key = if next_tier == 4 {
            let Some(b) = branch else {
                return false;
            };
            format!("{}_4_{}", type_str, b.as_str())
        } else {
            format!("{}_{}", type_str, next_tier)
        };

        let Some(next_bp) = registry.towers.get(&next_key).cloned() else {
            return false;
        };

        let tx = self.towers[t_idx].x;
        let ty = self.towers[t_idx].y;

        if self.gold < next_bp.cost as i32 {
            audio.play_error();
            self.add_floating_text("Không đủ vàng nâng cấp!", tx, ty, "#ef4444", 13.0);
            return false;
        }

        self.gold -= next_bp.cost as i32;

        {
            let tower = &mut self.towers[t_idx];
            tower.tier = next_tier;
            tower.branch = branch;
            tower.name = next_bp.name.clone();
            tower.damage = next_bp.damage;
            tower.range = next_bp.range;
            tower.fire_rate = next_bp.fire_rate;

            match tower.tower_type {
                TowerType::DragonNest => tower.element = ElementType::DRAGON,
                TowerType::FairyTree => tower.element = ElementType::FAIRY,
                TowerType::HeroicAltar => tower.element = ElementType::GHOST,
                TowerType::MAGE => {}
                _ => tower.element = ElementType::PHYSICAL,
            }

            if tower.tower_type == TowerType::BARRACKS
                && tower.soldier_mode == Some(SoldierCombatMode::RANGED)
            {
                tower.targeting_filter = TargetingFilter {
                    allowed_movement: vec![
                        MovementType::WALK,
                        MovementType::SWIM,
                        MovementType::FLY,
                    ],
                    excluded_elements: None,
                    excluded_tags: None,
                    skip_immune_targets: None,
                };
            } else {
                tower.targeting_filter = next_bp.targeting_filter.clone();
            }

            tower.total_invested += next_bp.cost;
            if next_bp.aoe_radius.is_some() {
                tower.aoe_radius = next_bp.aoe_radius;
            }
        }

        let t_type = self.towers[t_idx].tower_type;
        let r_point = self.towers[t_idx]
            .rally_point
            .unwrap_or(Vector2D { x: tx, y: ty });
        let t_sec_elem = self.towers[t_idx].secondary_element;
        let t_buffed = self.towers[t_idx].buffed_elements.clone();
        let t_soldier_mode = self.towers[t_idx]
            .soldier_mode
            .unwrap_or(SoldierCombatMode::MELEE);

        match t_type {
            TowerType::DragonNest => {
                self.towers[t_idx].max_soldiers = Some(1);
                let sids = self.towers[t_idx].soldier_ids.clone().unwrap_or_default();
                for sid in sids {
                    if let Some(dragon) = self.soldiers.iter_mut().find(|s| s.id == sid) {
                        if dragon.state != SoldierState::DEAD && dragon.tier > next_tier {
                            dragon.rally_point = r_point;
                            continue;
                        }
                        dragon.tier = next_tier;
                        dragon.branch = branch;
                        dragon.base_max_hp = next_bp.soldier_hp.unwrap_or(dragon.base_max_hp);
                        dragon.base_damage = next_bp.damage;
                        dragon.base_armor = next_bp.soldier_armor.unwrap_or(dragon.base_armor);
                        dragon.max_hp = dragon.base_max_hp;
                        dragon.hp = dragon.max_hp;
                        dragon.damage = dragon.base_damage;
                        dragon.armor = dragon.base_armor;
                        dragon.aoe_radius = next_bp.aoe_radius.or(dragon.aoe_radius);
                        dragon.soldier_regen = Some(next_bp.soldier_regen.unwrap_or(0.0));
                        dragon.attack_speed = next_bp.fire_rate;
                        dragon.rally_point = r_point;
                        if dragon.state == SoldierState::DEAD {
                            dragon.state = SoldierState::IDLE;
                            dragon.respawn_timer = 0.0;
                            dragon.x = r_point.x;
                            dragon.y = r_point.y;
                            dragon.target_pos = r_point;
                        }
                    }
                }
            }
            TowerType::FairyTree => {
                let target_max = next_bp.max_soldiers.unwrap_or(2);
                self.towers[t_idx].max_soldiers = Some(target_max);
                let mut sids = self.towers[t_idx].soldier_ids.clone().unwrap_or_default();

                while sids.len() < target_max {
                    self.soldier_id_counter += 1;
                    let new_fid = format!("fairy-{}", self.soldier_id_counter);
                    let f_idx = sids.len();
                    sids.push(new_fid.clone());

                    let offset_angle = (f_idx as f32 / target_max as f32) * PI * 2.0;
                    let ix = r_point.x + offset_angle.cos() * 14.0;
                    let iy = r_point.y + offset_angle.sin() * 14.0;
                    let s_hp = next_bp.soldier_hp.unwrap_or(80.0);
                    let s_armor = next_bp.soldier_armor.unwrap_or(0.1);

                    self.soldiers.push(SoldierEntity {
                        id: new_fid,
                        tower_id: tower_id.to_string(),
                        name: format!("Tiên {}", f_idx + 1),
                        archetype: Some(SummonUnitArchetype::FAIRY),
                        can_block_air: Some(true),
                        can_target_air: Some(true),
                        can_target_swim: Some(true),
                        x: ix,
                        y: iy,
                        prev_x: Some(ix),
                        prev_y: Some(iy),
                        hp: s_hp,
                        max_hp: s_hp,
                        base_max_hp: s_hp,
                        damage: next_bp.damage,
                        base_damage: next_bp.damage,
                        attack_speed: next_bp.fire_rate,
                        attack_cooldown: 0.5,
                        element: ElementType::FAIRY,
                        secondary_element: Some(t_sec_elem.unwrap_or(ElementType::LIGHT)),
                        buffed_elements: t_buffed.clone(),
                        combat_mode: SoldierCombatMode::MELEE,
                        state: SoldierState::IDLE,
                        facing: Some(0.0),
                        engaged_enemy_id: None,
                        rally_point: Vector2D { x: ix, y: iy },
                        target_pos: Vector2D { x: ix, y: iy },
                        armor: s_armor,
                        base_armor: s_armor,
                        magic_resist: 0.15,
                        respawn_timer: 0.0,
                        respawn_delay: next_bp.soldier_respawn.unwrap_or(7.0),
                        soldier_regen: Some(next_bp.soldier_regen.unwrap_or(0.0)),
                        tier: next_tier,
                        branch,
                        is_spirit: None,
                        spirit_source_archetype: None,
                        spirit_ghost_ratio: None,
                        aoe_radius: None,
                        ranged_damage: None,
                        ranged_range: None,
                    });
                }

                let total_count = sids.len();
                for (i, sid) in sids.iter().enumerate() {
                    if let Some(fairy) = self.soldiers.iter_mut().find(|s| &s.id == sid) {
                        if !(fairy.state != SoldierState::DEAD && fairy.tier > next_tier) {
                            fairy.tier = next_tier;
                            fairy.branch = branch;
                            fairy.base_max_hp = next_bp.soldier_hp.unwrap_or(fairy.base_max_hp);
                            fairy.base_damage = next_bp.damage;
                            fairy.base_armor = next_bp.soldier_armor.unwrap_or(fairy.base_armor);
                            fairy.max_hp = fairy.base_max_hp;
                            fairy.hp = fairy.max_hp;
                            fairy.damage = fairy.base_damage;
                            fairy.armor = fairy.base_armor;
                            fairy.soldier_regen = Some(next_bp.soldier_regen.unwrap_or(0.0));
                            fairy.attack_speed = next_bp.fire_rate;
                            if fairy.state == SoldierState::DEAD {
                                fairy.state = SoldierState::IDLE;
                                fairy.respawn_timer = 0.0;
                                fairy.x = r_point.x;
                                fairy.y = r_point.y;
                                fairy.target_pos = r_point;
                            }
                        }
                        let offset_angle = (i as f32 / total_count as f32) * PI * 2.0;
                        fairy.rally_point = Vector2D {
                            x: r_point.x + offset_angle.cos() * 14.0,
                            y: r_point.y + offset_angle.sin() * 14.0,
                        };
                        if fairy.state == SoldierState::IDLE {
                            fairy.target_pos = fairy.rally_point;
                        }
                    }
                }
                self.towers[t_idx].soldier_ids = Some(sids);
            }
            TowerType::HeroicAltar => {
                let tower = &mut self.towers[t_idx];
                tower.max_soldiers = Some(next_bp.max_soldiers.unwrap_or(2));
                tower.resurrect_chance = Some(next_bp.resurrect_chance.unwrap_or(0.3));
                tower.spirit_stat_multiplier = next_bp.spirit_stat_multiplier;
                let default_ratio = if next_bp.tier == 4 && next_bp.branch == Some(TowerBranch::B) {
                    1.0
                } else {
                    0.5
                };
                tower.spirit_ghost_ratio =
                    Some(next_bp.spirit_ghost_ratio.unwrap_or(default_ratio));
                tower.aoe_radius = next_bp.aoe_radius;
                let sids = tower.soldier_ids.clone().unwrap_or_default();
                let mult = tower.spirit_stat_multiplier.unwrap_or(1.0);
                for sid in sids {
                    if let Some(spirit) = self.soldiers.iter_mut().find(|s| s.id == sid) {
                        if spirit.state != SoldierState::DEAD {
                            spirit.tier = next_tier;
                            spirit.branch = branch;
                            spirit.max_hp = (spirit.base_max_hp * mult).round();
                            spirit.damage = (spirit.base_damage * mult).round();
                            spirit.hp = spirit.max_hp;
                        }
                    }
                }
            }
            TowerType::BARRACKS => {
                let target_max = next_bp.max_soldiers.unwrap_or(3);
                self.towers[t_idx].max_soldiers = Some(target_max);
                let mut sids = self.towers[t_idx].soldier_ids.clone().unwrap_or_default();

                while sids.len() < target_max {
                    self.soldier_id_counter += 1;
                    let new_sid = format!("soldier-{}", self.soldier_id_counter);
                    let s_idx = sids.len();
                    sids.push(new_sid.clone());

                    let offset_angle = (s_idx as f32 / target_max as f32) * PI * 2.0;
                    let ix = r_point.x + offset_angle.cos() * 12.0;
                    let iy = r_point.y + offset_angle.sin() * 12.0;
                    let s_hp = next_bp.soldier_hp.unwrap_or(100.0);
                    let s_armor = next_bp.soldier_armor.unwrap_or(0.1);

                    self.soldiers.push(SoldierEntity {
                        id: new_sid,
                        tower_id: tower_id.to_string(),
                        name: format!("Lính {}", s_idx + 1),
                        archetype: Some(SummonUnitArchetype::SOLDIER),
                        x: ix,
                        y: iy,
                        prev_x: Some(ix),
                        prev_y: Some(iy),
                        hp: s_hp,
                        max_hp: s_hp,
                        base_max_hp: s_hp,
                        damage: next_bp.damage,
                        base_damage: next_bp.damage,
                        attack_speed: next_bp.fire_rate,
                        attack_cooldown: 0.5,
                        element: ElementType::PHYSICAL,
                        secondary_element: t_sec_elem,
                        buffed_elements: t_buffed.clone(),
                        combat_mode: t_soldier_mode,
                        state: SoldierState::IDLE,
                        engaged_enemy_id: None,
                        rally_point: Vector2D { x: ix, y: iy },
                        target_pos: Vector2D { x: ix, y: iy },
                        armor: s_armor,
                        base_armor: s_armor,
                        magic_resist: 0.1,
                        respawn_timer: 0.0,
                        respawn_delay: next_bp.soldier_respawn.unwrap_or(7.0),
                        soldier_regen: Some(next_bp.soldier_regen.unwrap_or(0.0)),
                        tier: next_tier,
                        branch,
                        ranged_range: Some(135.0 + (next_tier as f32) * 12.0),
                        can_target_air: None,
                        can_block_air: None,
                        can_target_swim: None,
                        is_spirit: None,
                        spirit_source_archetype: None,
                        spirit_ghost_ratio: None,
                        aoe_radius: None,
                        ranged_damage: None,
                        facing: Some(0.0),
                    });
                }

                let total_count = sids.len();
                for (i, sid) in sids.iter().enumerate() {
                    if let Some(soldier) = self.soldiers.iter_mut().find(|s| &s.id == sid) {
                        if !(soldier.state != SoldierState::DEAD && soldier.tier > next_tier) {
                            soldier.tier = next_tier;
                            soldier.branch = branch;
                            soldier.base_max_hp = next_bp.soldier_hp.unwrap_or(soldier.base_max_hp);
                            soldier.base_damage = next_bp.damage;
                            soldier.base_armor =
                                next_bp.soldier_armor.unwrap_or(soldier.base_armor);
                            soldier.soldier_regen = Some(next_bp.soldier_regen.unwrap_or(0.0));
                            soldier.secondary_element = t_sec_elem;
                            soldier.buffed_elements = t_buffed.clone();

                            if soldier.combat_mode == SoldierCombatMode::RANGED {
                                soldier.max_hp = (soldier.base_max_hp * 0.65).round().max(1.0);
                                soldier.damage = (soldier.base_damage * 0.70).round().max(1.0);
                                soldier.armor = (soldier.base_armor * 0.5 * 100.0).round() / 100.0;
                                soldier.can_target_air = Some(true);
                                soldier.ranged_range = Some(135.0 + (next_tier as f32) * 12.0);
                            } else {
                                soldier.max_hp = soldier.base_max_hp;
                                soldier.damage = soldier.base_damage;
                                soldier.armor = soldier.base_armor;
                                soldier.can_target_air = Some(false);
                            }
                            soldier.hp = soldier.max_hp;
                            if soldier.state == SoldierState::DEAD {
                                soldier.state = SoldierState::IDLE;
                                soldier.respawn_timer = 0.0;
                                soldier.x = r_point.x;
                                soldier.y = r_point.y;
                                soldier.target_pos = r_point;
                            }
                        }
                        let offset_angle = (i as f32 / total_count as f32) * PI * 2.0;
                        soldier.rally_point = Vector2D {
                            x: r_point.x + offset_angle.cos() * 12.0,
                            y: r_point.y + offset_angle.sin() * 12.0,
                        };
                        if soldier.state == SoldierState::IDLE {
                            soldier.target_pos = soldier.rally_point;
                        }
                    }
                }
                self.towers[t_idx].soldier_ids = Some(sids);
            }
            _ => {}
        }

        if t_type == TowerType::MAGE
            && next_tier == 4
            && branch == Some(TowerBranch::B)
            && self.towers[t_idx].secondary_element.is_none()
        {
            self.towers[t_idx].secondary_element =
                if self.towers[t_idx].element == ElementType::LIGHTNING {
                    Some(ElementType::FIRE)
                } else {
                    Some(ElementType::LIGHTNING)
                };
        }

        self.recalculate_tower_buffs();
        audio.play_upgrade();
        self.add_floating_text(
            &format!("CẤP {}! -{} 🪙", next_tier, next_bp.cost),
            tx,
            ty - 20.0,
            "#38bdf8",
            13.0,
        );
        true
    }

    pub fn sync_soldier_stats_to_tower_blueprint(soldier: &mut SoldierEntity, bp: &TowerBlueprint) {
        soldier.tier = bp.tier;
        soldier.branch = bp.branch;
        soldier.base_max_hp = bp.soldier_hp.unwrap_or(soldier.base_max_hp);
        soldier.base_damage = bp.damage;
        soldier.base_armor = bp.soldier_armor.unwrap_or(soldier.base_armor);
        soldier.soldier_regen = Some(bp.soldier_regen.unwrap_or(0.0));
        soldier.attack_speed = bp.fire_rate;
        if bp.aoe_radius.is_some() {
            soldier.aoe_radius = bp.aoe_radius;
        }
        if let Some(resp) = bp.soldier_respawn {
            soldier.respawn_delay = resp;
        }

        if soldier.combat_mode == SoldierCombatMode::RANGED {
            soldier.max_hp = (soldier.base_max_hp * 0.65).round().max(1.0);
            soldier.damage = (soldier.base_damage * 0.70).round().max(1.0);
            soldier.armor = (soldier.base_armor * 0.5 * 100.0).round() / 100.0;
            soldier.can_target_air = Some(true);
            soldier.ranged_range = Some(135.0 + (soldier.tier as f32) * 12.0);
        } else {
            soldier.max_hp = soldier.base_max_hp;
            soldier.damage = soldier.base_damage;
            soldier.armor = soldier.base_armor;
            if soldier.archetype != Some(SummonUnitArchetype::DRAGON)
                && soldier.archetype != Some(SummonUnitArchetype::FAIRY)
            {
                soldier.can_target_air = Some(false);
            }
        }
    }

    pub fn downgrade_or_destroy_tower(
        &mut self,
        registry: &GameConfigRegistry,
        audio: &mut RustSoundSystem,
        rng: &mut SimpleRng,
        tower_id: &str,
    ) -> &'static str {
        let Some(t_idx) = self.towers.iter().position(|t| t.id == tower_id) else {
            return "NONE";
        };

        let tx = self.towers[t_idx].x;
        let ty = self.towers[t_idx].y;

        if self.towers[t_idx].tier > 1 {
            let prev_tier = self.towers[t_idx].tier - 1;
            self.towers[t_idx].tier = prev_tier;
            self.towers[t_idx].branch = None;

            let prev_key = format!("{}_{}", self.towers[t_idx].tower_type.as_str(), prev_tier);
            if let Some(prev_bp) = registry.towers.get(&prev_key).cloned() {
                let mut sids = self.towers[t_idx].soldier_ids.clone().unwrap_or_default();
                let target_max: usize;

                {
                    let tower = &mut self.towers[t_idx];
                    tower.name = prev_bp.name.clone();
                    tower.damage = prev_bp.damage;
                    tower.range = prev_bp.range;
                    tower.fire_rate = prev_bp.fire_rate;
                    tower.aoe_radius = prev_bp.aoe_radius;

                    match tower.tower_type {
                        TowerType::DragonNest => {
                            tower.element = ElementType::DRAGON;
                            tower.max_soldiers = Some(1);
                        }
                        TowerType::FairyTree => {
                            tower.element = ElementType::FAIRY;
                            tower.max_soldiers = Some(prev_bp.max_soldiers.unwrap_or(2));
                        }
                        TowerType::HeroicAltar => {
                            tower.element = ElementType::GHOST;
                            tower.max_soldiers = Some(prev_bp.max_soldiers.unwrap_or(2));
                            tower.resurrect_chance = Some(prev_bp.resurrect_chance.unwrap_or(0.3));
                            tower.spirit_stat_multiplier = prev_bp.spirit_stat_multiplier;
                            tower.spirit_ghost_ratio =
                                Some(prev_bp.spirit_ghost_ratio.unwrap_or(0.5));
                            tower.aoe_radius = prev_bp.aoe_radius;
                        }
                        TowerType::BARRACKS => {
                            tower.max_soldiers = Some(prev_bp.max_soldiers.unwrap_or(3));
                            if tower.soldier_mode == Some(SoldierCombatMode::RANGED) {
                                tower.targeting_filter = TargetingFilter {
                                    allowed_movement: vec![
                                        MovementType::WALK,
                                        MovementType::SWIM,
                                        MovementType::FLY,
                                    ],
                                    excluded_elements: None,
                                    excluded_tags: None,
                                    skip_immune_targets: None,
                                };
                            } else {
                                tower.targeting_filter = prev_bp.targeting_filter.clone();
                            }
                        }
                        _ => {
                            if tower.tower_type != TowerType::MAGE {
                                tower.element = ElementType::PHYSICAL;
                            }
                            tower.targeting_filter = prev_bp.targeting_filter.clone();
                        }
                    }

                    target_max = tower.max_soldiers.unwrap_or(1);
                }

                if !sids.is_empty() {
                    for i in (0..sids.len()).rev() {
                        if sids.len() <= target_max {
                            break;
                        }
                        let sid = &sids[i];
                        let is_dead = self
                            .soldiers
                            .iter()
                            .find(|s| &s.id == sid)
                            .map(|s| s.state == SoldierState::DEAD || s.hp <= 0.0)
                            .unwrap_or(false);
                        if is_dead {
                            let removed_id = sids.remove(i);
                            self.soldiers.retain(|s| s.id != removed_id);
                        }
                    }

                    for sid in &sids {
                        if let Some(soldier) = self.soldiers.iter_mut().find(|s| &s.id == sid) {
                            if soldier.state == SoldierState::DEAD || soldier.hp <= 0.0 {
                                Self::sync_soldier_stats_to_tower_blueprint(soldier, &prev_bp);
                                soldier.hp = 0.0;
                            }
                        }
                    }
                    self.towers[t_idx].soldier_ids = Some(sids);
                }
            }

            self.recalculate_tower_buffs();
            audio.play_tower_damaged("DOWNGRADED");
            self.add_floating_text(
                &format!("⬇️ RƠI CẤP (CẤP {})!", prev_tier),
                tx,
                ty - 20.0,
                "#ef4444",
                16.0,
            );
            self.add_explosion_particles(rng, tx, ty, "#ef4444", 12);
            return "DOWNGRADED";
        }

        // Destroyed
        if let Some(ref slot_id) = self.towers[t_idx].slot_id {
            if let Some(slot) = self.tower_slots.iter_mut().find(|s| &s.id == slot_id) {
                slot.current_tower_id = None;
            }
        }
        if let Some(ref sids) = self.towers[t_idx].soldier_ids {
            self.soldiers.retain(|s| !sids.contains(&s.id));
        }
        self.towers.remove(t_idx);
        if self.selected_tower_id.as_deref() == Some(tower_id) {
            self.selected_tower_id = None;
            self.is_setting_rally_point = false;
        }

        self.recalculate_tower_buffs();
        audio.play_tower_damaged("DESTROYED");
        self.add_floating_text("💥 PHÁ HỦY THÁP!", tx, ty - 20.0, "#dc2626", 18.0);
        self.add_explosion_particles(rng, tx, ty, "#dc2626", 22);
        "DESTROYED"
    }

    pub fn set_tower_element(
        &mut self,
        registry: &GameConfigRegistry,
        audio: &mut RustSoundSystem,
        tower_id: &str,
        element: ElementType,
        slot_index: u8,
    ) -> bool {
        if element == ElementType::PHYSICAL {
            return false;
        }
        let Some(t_idx) = self.towers.iter().position(|t| t.id == tower_id) else {
            return false;
        };
        if self.towers[t_idx].tower_type == TowerType::HeroicAltar {
            return false;
        }

        let cost = if self.towers[t_idx].tower_type == TowerType::MAGE && slot_index == 2 {
            MAGE_SECOND_ELEMENT_COST
        } else {
            ELEMENT_IMBUE_COST
        };

        let tx = self.towers[t_idx].x;
        let ty = self.towers[t_idx].y;

        if self.gold < cost as i32 {
            audio.play_error();
            self.add_floating_text("Không đủ vàng gắn nguyên tố!", tx, ty, "#ef4444", 13.0);
            return false;
        }

        self.gold -= cost as i32;
        self.towers[t_idx].total_invested += cost;

        if self.towers[t_idx].tower_type == TowerType::MAGE {
            if slot_index == 1 {
                self.towers[t_idx].element = element;
            } else {
                self.towers[t_idx].secondary_element = Some(element);
            }
        } else {
            self.towers[t_idx].secondary_element = Some(element);
            let sids = self.towers[t_idx].soldier_ids.clone().unwrap_or_default();
            for sid in sids {
                if let Some(soldier) = self.soldiers.iter_mut().find(|s| s.id == sid) {
                    soldier.secondary_element = Some(element);
                }
            }
        }

        let elem_name = registry.get_element_name(element).to_string();
        self.recalculate_tower_buffs();
        audio.play_imbue();
        self.add_floating_text(
            &format!("✨ Thuộc tính {}! -{} 🪙", elem_name, cost),
            tx,
            ty - 20.0,
            "#facc15",
            13.0,
        );
        true
    }

    pub fn set_barracks_soldier_mode(
        &mut self,
        audio: &mut RustSoundSystem,
        tower_id: &str,
        mode: SoldierCombatMode,
    ) -> bool {
        let Some(t_idx) = self.towers.iter().position(|t| t.id == tower_id) else {
            return false;
        };
        if self.towers[t_idx].tower_type != TowerType::BARRACKS {
            return false;
        }

        let tx = self.towers[t_idx].x;
        let ty = self.towers[t_idx].y;
        self.towers[t_idx].soldier_mode = Some(mode);
        self.towers[t_idx].targeting_filter = if mode == SoldierCombatMode::MELEE {
            TargetingFilter {
                allowed_movement: vec![MovementType::WALK],
                excluded_elements: None,
                excluded_tags: None,
                skip_immune_targets: None,
            }
        } else {
            TargetingFilter {
                allowed_movement: vec![MovementType::WALK, MovementType::SWIM, MovementType::FLY],
                excluded_elements: None,
                excluded_tags: None,
                skip_immune_targets: None,
            }
        };

        let sids = self.towers[t_idx].soldier_ids.clone().unwrap_or_default();
        for sid in sids {
            if let Some(soldier) = self.soldiers.iter_mut().find(|s| s.id == sid) {
                let hp_ratio = if soldier.max_hp > 0.0 {
                    soldier.hp / soldier.max_hp
                } else {
                    1.0
                };
                soldier.combat_mode = mode;

                if mode == SoldierCombatMode::MELEE {
                    soldier.max_hp = soldier.base_max_hp;
                    soldier.damage = soldier.base_damage;
                    soldier.armor = soldier.base_armor;
                    soldier.can_target_air = Some(false);
                } else {
                    soldier.max_hp = (soldier.base_max_hp * 0.65).round().max(1.0);
                    soldier.damage = (soldier.base_damage * 0.70).round().max(1.0);
                    soldier.armor = (soldier.base_armor * 0.5 * 100.0).round() / 100.0;
                    soldier.can_target_air = Some(true);
                    soldier.ranged_range = Some(135.0 + (soldier.tier as f32) * 12.0);
                }

                soldier.hp = (soldier.max_hp * hp_ratio).round().max(1.0);
                soldier.engaged_enemy_id = None;
                soldier.facing = Some(
                    (soldier.rally_point.y - soldier.y).atan2(soldier.rally_point.x - soldier.x),
                );
                soldier.state = SoldierState::MovingToRally;
            }
        }

        let label = if mode == SoldierCombatMode::MELEE {
            "Chuyển sang: ⚔️ Lính Cận Chiến!"
        } else {
            "Chuyển sang: 🏹 Lính Bắn Tên!"
        };
        self.add_floating_text(label, tx, ty - 15.0, "#38bdf8", 13.0);
        audio.play_rally();
        true
    }

    pub fn sell_tower(&mut self, audio: &mut RustSoundSystem, tower_id: &str) -> bool {
        let Some(t_idx) = self.towers.iter().position(|t| t.id == tower_id) else {
            return false;
        };
        let tower = self.towers.remove(t_idx);
        let refund = ((tower.total_invested as f32) * 0.7).round() as i32;
        self.gold += refund;

        if let Some(ref slot_id) = tower.slot_id {
            if let Some(slot) = self.tower_slots.iter_mut().find(|s| &s.id == slot_id) {
                slot.current_tower_id = None;
            }
        }

        if let Some(ref sids) = tower.soldier_ids {
            self.soldiers.retain(|s| !sids.contains(&s.id));
        }

        self.selected_tower_id = None;
        self.is_setting_rally_point = false;

        self.recalculate_tower_buffs();
        audio.play_sell();
        self.add_floating_text(
            &format!("+{} 🪙 Bán tháp", refund),
            tower.x,
            tower.y,
            "#22c55e",
            13.0,
        );
        true
    }

    pub fn set_rally_point(
        &mut self,
        audio: &mut RustSoundSystem,
        tower_id: &str,
        target_x: f32,
        target_y: f32,
    ) -> bool {
        self.is_setting_rally_point = false;
        let Some(t_idx) = self.towers.iter().position(|t| t.id == tower_id) else {
            return false;
        };
        if !self.towers[t_idx].tower_type.is_summon() {
            return false;
        }

        let dist = ((target_x - self.towers[t_idx].x).powi(2)
            + (target_y - self.towers[t_idx].y).powi(2))
        .sqrt();
        if dist > self.towers[t_idx].range {
            audio.play_error();
            self.add_floating_text(
                "Ngoài phạm vi điều động!",
                target_x,
                target_y,
                "#ef4444",
                13.0,
            );
            return false;
        }

        self.towers[t_idx].rally_point = Some(Vector2D {
            x: target_x,
            y: target_y,
        });

        let sids = self.towers[t_idx].soldier_ids.clone().unwrap_or_default();
        let total = sids.len().max(1);
        for (i, sid) in sids.iter().enumerate() {
            if let Some(soldier) = self.soldiers.iter_mut().find(|s| &s.id == sid) {
                if soldier.state != SoldierState::DEAD {
                    let offset_angle = (i as f32 / total as f32) * PI * 2.0;
                    soldier.rally_point = Vector2D {
                        x: target_x + offset_angle.cos() * 12.0,
                        y: target_y + offset_angle.sin() * 12.0,
                    };
                    soldier.engaged_enemy_id = None;
                    soldier.facing = Some(
                        (soldier.rally_point.y - soldier.y)
                            .atan2(soldier.rally_point.x - soldier.x),
                    );
                    soldier.state = SoldierState::MovingToRally;
                }
            }
        }

        self.is_setting_rally_point = false;
        audio.play_rally();
        self.add_floating_text(
            "🚩 Đã đổi điểm tập kết!",
            target_x,
            target_y - 10.0,
            "#eab308",
            13.0,
        );
        true
    }

    pub fn handle_soldier_death(
        &mut self,
        registry: &GameConfigRegistry,
        audio: &mut RustSoundSystem,
        rng: &mut SimpleRng,
        soldier_id: &str,
    ) {
        let Some(s_idx) = self.soldiers.iter().position(|s| s.id == soldier_id) else {
            return;
        };
        let dead_snapshot = self.soldiers[s_idx].clone();

        if !dead_snapshot.is_spirit.unwrap_or(false) {
            self.try_spawn_heroic_spirit(audio, rng, &dead_snapshot);
        }

        if dead_snapshot.is_spirit.unwrap_or(false) {
            self.soldiers.retain(|s| s.id != soldier_id);
            if let Some(altar) = self
                .towers
                .iter_mut()
                .find(|t| t.id == dead_snapshot.tower_id)
            {
                if let Some(ref mut sids) = altar.soldier_ids {
                    sids.retain(|id| id != soldier_id);
                }
            }
            return;
        }

        let Some(t_idx) = self
            .towers
            .iter()
            .position(|t| t.id == dead_snapshot.tower_id)
        else {
            self.soldiers.retain(|s| s.id != soldier_id);
            return;
        };

        let current_cap = self.towers[t_idx].max_soldiers.unwrap_or(1);
        let total_assigned = self.towers[t_idx]
            .soldier_ids
            .as_ref()
            .map(|v| v.len())
            .unwrap_or(0);

        if total_assigned > current_cap {
            self.soldiers.retain(|s| s.id != soldier_id);
            if let Some(ref mut sids) = self.towers[t_idx].soldier_ids {
                sids.retain(|id| id != soldier_id);
            }
            return;
        }

        let bp_key = if let Some(b) = self.towers[t_idx].branch {
            format!(
                "{}_{}_{}",
                self.towers[t_idx].tower_type.as_str(),
                self.towers[t_idx].tier,
                b.as_str()
            )
        } else {
            format!(
                "{}_{}",
                self.towers[t_idx].tower_type.as_str(),
                self.towers[t_idx].tier
            )
        };

        if let Some(current_bp) = registry.towers.get(&bp_key) {
            if let Some(soldier) = self.soldiers.iter_mut().find(|s| s.id == soldier_id) {
                Self::sync_soldier_stats_to_tower_blueprint(soldier, current_bp);
                soldier.hp = 0.0;
                soldier.state = SoldierState::DEAD;
                soldier.respawn_timer = soldier.respawn_delay;
            }
        }
    }

    pub fn try_spawn_heroic_spirit(
        &mut self,
        audio: &mut RustSoundSystem,
        rng: &mut SimpleRng,
        dead_soldier: &SoldierEntity,
    ) -> bool {
        if dead_soldier.is_spirit.unwrap_or(false) {
            return false;
        }

        let mut candidate_indices: Vec<(usize, f32)> = self
            .towers
            .iter()
            .enumerate()
            .filter(|(_, t)| {
                t.tower_type == TowerType::HeroicAltar
                    && t.disabled_timer.unwrap_or(0.0) <= 0.0
                    && t.soldier_ids.as_ref().map(|v| v.len()).unwrap_or(0)
                        < t.max_soldiers.unwrap_or(2)
            })
            .map(|(idx, t)| {
                let dist = ((dead_soldier.x - t.x).powi(2) + (dead_soldier.y - t.y).powi(2)).sqrt();
                (idx, dist)
            })
            .collect();

        if candidate_indices.is_empty() {
            return false;
        }

        candidate_indices
            .sort_by(|a, b| a.1.partial_cmp(&b.1).unwrap_or(std::cmp::Ordering::Equal));
        let altar_idx = candidate_indices[0].0;
        let chance = self.towers[altar_idx].resurrect_chance.unwrap_or(0.3);

        if rng.next_f32() >= chance {
            return false;
        }

        self.soldier_id_counter += 1;
        let spirit_id = format!("spirit-{}", self.soldier_id_counter);
        let altar_id = self.towers[altar_idx].id.clone();
        let altar_tier = self.towers[altar_idx].tier;
        let default_ghost_ratio =
            if altar_tier == 4 && self.towers[altar_idx].branch == Some(TowerBranch::B) {
                1.0
            } else {
                0.5
            };
        let spirit_ghost_ratio = self.towers[altar_idx]
            .spirit_ghost_ratio
            .unwrap_or(default_ghost_ratio);
        let mult = self.towers[altar_idx].spirit_stat_multiplier.unwrap_or(1.0);

        if let Some(ref mut sids) = self.towers[altar_idx].soldier_ids {
            sids.push(spirit_id.clone());
        } else {
            self.towers[altar_idx].soldier_ids = Some(vec![spirit_id.clone()]);
        }

        let spirit_hp = (dead_soldier.base_max_hp * mult).round().max(1.0);
        let spirit_dmg = (dead_soldier.base_damage * mult).round().max(1.0);
        let arch = dead_soldier
            .archetype
            .unwrap_or(SummonUnitArchetype::SOLDIER);

        self.soldiers.push(SoldierEntity {
            id: spirit_id,
            tower_id: altar_id,
            name: format!("Anh Linh {}", dead_soldier.name),
            archetype: Some(arch),
            is_spirit: Some(true),
            spirit_source_archetype: Some(arch),
            spirit_ghost_ratio: Some(spirit_ghost_ratio),
            x: dead_soldier.x,
            y: dead_soldier.y,
            prev_x: Some(dead_soldier.x),
            prev_y: Some(dead_soldier.y),
            hp: spirit_hp,
            max_hp: spirit_hp,
            base_max_hp: spirit_hp,
            damage: spirit_dmg,
            base_damage: spirit_dmg,
            attack_speed: dead_soldier.attack_speed,
            attack_cooldown: 0.5,
            element: dead_soldier.element,
            secondary_element: dead_soldier.secondary_element,
            combat_mode: dead_soldier.combat_mode,
            state: SoldierState::IDLE,
            engaged_enemy_id: None,
            rally_point: dead_soldier.rally_point,
            target_pos: dead_soldier.rally_point,
            armor: dead_soldier.base_armor,
            base_armor: dead_soldier.base_armor,
            magic_resist: dead_soldier.magic_resist,
            respawn_timer: 0.0,
            respawn_delay: 999999.0,
            tier: altar_tier,
            branch: dead_soldier.branch,
            soldier_regen: dead_soldier.soldier_regen,
            can_block_air: dead_soldier.can_block_air,
            can_target_air: dead_soldier.can_target_air,
            can_target_swim: dead_soldier.can_target_swim,
            aoe_radius: dead_soldier.aoe_radius,
            buffed_elements: None,
            ranged_damage: dead_soldier.ranged_damage,
            ranged_range: dead_soldier.ranged_range,
            facing: dead_soldier.facing,
        });

        self.recalculate_tower_buffs();
        self.add_floating_text(
            "👻 ANH LINH HỒI SINH!",
            dead_soldier.x,
            dead_soldier.y - 20.0,
            "#818cf8",
            16.0,
        );
        self.add_explosion_particles(rng, dead_soldier.x, dead_soldier.y, "#818cf8", 15);
        audio.play_enemy_skill("SUMMON");
        true
    }

    pub fn recalculate_tower_buffs(&mut self) {
        let mage4b_list: Vec<(String, f32, f32, f32, ElementType, ElementType)> = self
            .towers
            .iter()
            .filter(|t| {
                t.tower_type == TowerType::MAGE && t.tier == 4 && t.branch == Some(TowerBranch::B)
            })
            .map(|t| {
                let e1 = t.element;
                let e2 = t.secondary_element.unwrap_or(t.element);
                (t.id.clone(), t.x, t.y, t.range, e1, e2)
            })
            .collect();

        for t in &mut self.towers {
            t.buffed_elements = None;
            t.buff_source_id = None;
        }
        for s in &mut self.soldiers {
            s.buffed_elements = None;
        }

        if mage4b_list.is_empty() {
            return;
        }

        for t_idx in 0..self.towers.len() {
            if self.towers[t_idx].placement != PlacementType::ROADSIDE {
                continue;
            }
            let tx = self.towers[t_idx].x;
            let ty = self.towers[t_idx].y;
            let tid = self.towers[t_idx].id.clone();

            let mut best_mage: Option<&(String, f32, f32, f32, ElementType, ElementType)> = None;
            let mut min_dist = f32::INFINITY;

            for m in &mage4b_list {
                if m.0 == tid {
                    continue;
                }
                let dist = ((tx - m.1).powi(2) + (ty - m.2).powi(2)).sqrt();
                if dist <= m.3 && dist < min_dist {
                    min_dist = dist;
                    best_mage = Some(m);
                }
            }

            if let Some(m) = best_mage {
                let buffed = vec![m.4, m.5];
                self.towers[t_idx].buff_source_id = Some(m.0.clone());
                self.towers[t_idx].buffed_elements = Some(buffed.clone());

                let sids = self.towers[t_idx].soldier_ids.clone().unwrap_or_default();
                for sid in sids {
                    if let Some(soldier) = self.soldiers.iter_mut().find(|s| s.id == sid) {
                        soldier.buffed_elements = Some(buffed.clone());
                    }
                }
            }
        }
    }

    pub fn add_floating_text(&mut self, text: &str, x: f32, y: f32, color: &str, size: f32) {
        if self.floating_texts.len() >= 150 {
            return;
        }
        self.text_id_counter += 1;
        self.floating_texts.push(FloatingText {
            id: format!("ft-{}", self.text_id_counter),
            text: text.to_string(),
            x,
            y,
            color: color.to_string(),
            life_time: 1.0,
            max_life_time: 1.0,
            size,
        });
    }

    pub fn add_explosion_particles(
        &mut self,
        rng: &mut SimpleRng,
        x: f32,
        y: f32,
        color: &str,
        count: usize,
    ) {
        let actual_count = if self.particles.len() > 500 {
            (count / 4).max(1)
        } else if self.particles.len() > 250 {
            (count / 2).max(2)
        } else {
            count
        };

        for _ in 0..actual_count {
            self.particle_id_counter += 1;
            let angle = rng.next_f32() * PI * 2.0;
            let speed = 40.0 + rng.next_f32() * 80.0;
            let life = 0.6 + rng.next_f32() * 0.3;
            let size = 2.5 + rng.next_f32() * 2.5;

            self.particles.push(Particle {
                id: format!("pt-{}", self.particle_id_counter),
                x,
                y,
                prev_x: Some(x),
                prev_y: Some(y),
                vx: angle.cos() * speed,
                vy: angle.sin() * speed,
                color: color.to_string(),
                size,
                life_time: life,
                max_life_time: life,
                shape: ParticleShape::CIRCLE,
            });
        }
    }
}
