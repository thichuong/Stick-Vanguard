use crate::config::{GameConfigRegistry, LaneItem, MapConfig, WaveConfig, WaveEnemyEntry};
use crate::types::{EnemyEntity, EnemyState, MovementType, NavigationMode};
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ActiveSpawner {
    pub type_id: String,
    pub remaining_count: usize,
    pub interval: f32,
    pub timer: f32,
    pub lane_cursor: usize,
    #[serde(default)]
    pub wave_index: usize,
}

#[derive(Clone, Debug, Default)]
pub struct WaveSystem {
    pub current_wave_index: usize,
    pub is_wave_in_progress: bool,
    pub wave_time: f32,
    pub custom_total_waves: usize,
    pub active_spawners: Vec<ActiveSpawner>,
    pub enemy_counter: u32,
    pub ground_lane_index: usize,
    pub water_lane_index: usize,
    pub air_lane_index: usize,
    pub pending_rewards: Vec<u32>,
}

impl WaveSystem {
    pub fn new(total_waves: usize) -> Self {
        WaveSystem {
            current_wave_index: 0,
            is_wave_in_progress: false,
            wave_time: 0.0,
            custom_total_waves: total_waves.clamp(1, 100),
            active_spawners: Vec::new(),
            enemy_counter: 0,
            ground_lane_index: 0,
            water_lane_index: 0,
            air_lane_index: 0,
            pending_rewards: Vec::new(),
        }
    }

    pub fn reset(&mut self) {
        self.current_wave_index = 0;
        self.is_wave_in_progress = false;
        self.wave_time = 0.0;
        self.active_spawners.clear();
        self.pending_rewards.clear();
        self.ground_lane_index = 0;
        self.water_lane_index = 0;
        self.air_lane_index = 0;
    }

    pub fn set_total_waves(&mut self, waves: usize) {
        self.custom_total_waves = waves.clamp(1, 100);
        if self.current_wave_index >= self.custom_total_waves {
            self.current_wave_index = self.custom_total_waves.saturating_sub(1);
        }
    }

    pub fn get_total_waves(&self) -> usize {
        self.custom_total_waves
    }

    pub fn get_wave_hp_multiplier(&self, wave_index: usize) -> f32 {
        let wave_num = wave_index + 1;
        if wave_num <= 10 {
            1.0
        } else {
            let extra = (wave_num - 10) as f32;
            1.0 + extra * 0.1
        }
    }

    pub fn generate_wave_config(
        &self,
        registry: &GameConfigRegistry,
        map: &MapConfig,
        wave_idx: usize,
    ) -> WaveConfig {
        let wave_num = wave_idx + 1;
        let map_waves = &map.waves;

        if wave_num <= 10 {
            if let Some(base_wave) = map_waves.get(wave_idx) {
                return WaveConfig {
                    wave_number: wave_num,
                    name: base_wave.name.clone(),
                    reward_gold: base_wave.reward_gold,
                    enemies: base_wave.enemies.clone(),
                };
            }
        }

        let n = wave_num / 10;
        let fallback_wave = map_waves.get(8).or_else(|| map_waves.last());

        let ext_wave_template: Option<&WaveConfig> = if let Some(ref ext_list) = map.extended_waves
        {
            if !ext_list.is_empty() {
                ext_list
                    .get((wave_num.saturating_sub(11)) % ext_list.len())
                    .or_else(|| ext_list.first())
            } else {
                fallback_wave
            }
        } else {
            fallback_wave
        };

        let wave10 = map_waves.get(9).or_else(|| map_waves.last());

        let boss_entries_in_wave10: Vec<WaveEnemyEntry> = wave10
            .map(|w| {
                w.enemies
                    .iter()
                    .filter(|e| {
                        registry
                            .enemies
                            .get(&e.type_id)
                            .map(|bp| bp.tags.iter().any(|t| t == "BOSS"))
                            .unwrap_or(false)
                    })
                    .cloned()
                    .collect()
            })
            .unwrap_or_default();

        if wave_num.is_multiple_of(5) {
            // BOSS WAVE
            let minion_enemies: Vec<WaveEnemyEntry> = ext_wave_template
                .map(|w| {
                    w.enemies
                        .iter()
                        .filter(|e| {
                            !registry
                                .enemies
                                .get(&e.type_id)
                                .map(|bp| bp.tags.iter().any(|t| t == "BOSS"))
                                .unwrap_or(false)
                        })
                        .map(|entry| WaveEnemyEntry {
                            type_id: entry.type_id.clone(),
                            count: entry.count * n,
                            interval: entry.interval,
                            delay: entry.delay,
                        })
                        .collect()
                })
                .unwrap_or_default();

            let bosses_to_spawn = if !boss_entries_in_wave10.is_empty() {
                boss_entries_in_wave10
            } else {
                vec![WaveEnemyEntry {
                    type_id: "ANCIENT_TREANT_BOSS".to_string(),
                    count: 1,
                    interval: 1.0,
                    delay: 0.0,
                }]
            };

            let mut boss_enemies = Vec::new();
            for b_entry in bosses_to_spawn {
                let nav_mode = registry
                    .enemies
                    .get(&b_entry.type_id)
                    .map(|bp| bp.navigation_mode)
                    .unwrap_or(NavigationMode::GroundPath);
                let traversable_lanes = map.get_traversable_lane_count(nav_mode);
                boss_enemies.push(WaveEnemyEntry {
                    type_id: b_entry.type_id,
                    count: (traversable_lanes * n).max(1),
                    interval: if b_entry.interval > 0.0 {
                        b_entry.interval
                    } else {
                        1.0
                    },
                    delay: b_entry.delay.max(0.0),
                });
            }

            let base_reward = ext_wave_template.map(|w| w.reward_gold).unwrap_or(220)
                + wave10.map(|w| w.reward_gold).unwrap_or(300);

            let mut all_enemies = minion_enemies;
            all_enemies.extend(boss_enemies);

            return WaveConfig {
                wave_number: wave_num,
                name: format!("Đợt {}: Đại Trận Chiến Trùm Toàn Tuyến (x{})", wave_num, n),
                reward_gold: base_reward * (n as u32),
                enemies: all_enemies,
            };
        }

        // REGULAR EXTENDED WAVE
        let enemies: Vec<WaveEnemyEntry> = ext_wave_template
            .map(|w| {
                w.enemies
                    .iter()
                    .map(|entry| WaveEnemyEntry {
                        type_id: entry.type_id.clone(),
                        count: entry.count * n,
                        interval: entry.interval,
                        delay: entry.delay,
                    })
                    .collect()
            })
            .unwrap_or_default();

        let tpl_name = ext_wave_template
            .map(|w| w.name.clone())
            .unwrap_or_else(|| format!("Đợt {}", wave_num));
        let tpl_reward = ext_wave_template.map(|w| w.reward_gold).unwrap_or(200);

        WaveConfig {
            wave_number: wave_num,
            name: format!("{} (x{})", tpl_name, n),
            reward_gold: tpl_reward * (n as u32),
            enemies,
        }
    }

    pub fn get_current_wave_config(
        &self,
        registry: &GameConfigRegistry,
        map: &MapConfig,
    ) -> WaveConfig {
        self.generate_wave_config(registry, map, self.current_wave_index)
    }

    pub fn start_wave(
        &mut self,
        registry: &GameConfigRegistry,
        map: &MapConfig,
        wave_num: Option<usize>,
    ) -> bool {
        if let Some(wn) = wave_num {
            self.current_wave_index = wn.saturating_sub(1);
        } else if self.current_wave_index >= self.get_total_waves() {
            return false;
        }

        let config = self.get_current_wave_config(registry, map);
        let this_wave_idx = self.current_wave_index;
        self.pending_rewards.clear();
        self.pending_rewards.push(config.reward_gold);

        self.is_wave_in_progress = true;
        self.wave_time = 0.0;
        self.active_spawners = config
            .enemies
            .into_iter()
            .map(|entry| ActiveSpawner {
                type_id: entry.type_id,
                remaining_count: entry.count,
                interval: entry.interval,
                timer: entry.delay,
                lane_cursor: 0,
                wave_index: this_wave_idx,
            })
            .collect();

        true
    }

    pub fn call_wave_early(&mut self, registry: &GameConfigRegistry, map: &MapConfig) -> bool {
        if !self.is_wave_in_progress || self.current_wave_index + 1 >= self.get_total_waves() {
            return false;
        }

        self.current_wave_index += 1;
        let config = self.get_current_wave_config(registry, map);
        let this_wave_idx = self.current_wave_index;
        self.pending_rewards.push(config.reward_gold);

        let new_spawners: Vec<ActiveSpawner> = config
            .enemies
            .into_iter()
            .map(|entry| ActiveSpawner {
                type_id: entry.type_id,
                remaining_count: entry.count,
                interval: entry.interval,
                timer: entry.delay,
                lane_cursor: 0,
                wave_index: this_wave_idx,
            })
            .collect();

        self.active_spawners.extend(new_spawners);
        true
    }

    pub fn update<FS, FC>(
        &mut self,
        registry: &GameConfigRegistry,
        map: &MapConfig,
        dt: f32,
        active_enemies_count: usize,
        mut on_spawn_enemy: FS,
        mut on_wave_complete: FC,
    ) where
        FS: FnMut(EnemyEntity),
        FC: FnMut(u32),
    {
        if !self.is_wave_in_progress {
            return;
        }

        self.wave_time += dt;
        let mut all_spawned = true;

        for i in 0..self.active_spawners.len() {
            if self.active_spawners[i].remaining_count > 0 {
                all_spawned = false;
                self.active_spawners[i].timer -= dt;
                if self.active_spawners[i].timer <= 0.0 {
                    self.active_spawners[i].timer = self.active_spawners[i].interval;
                    self.active_spawners[i].remaining_count -= 1;
                    let forced_lane = self.active_spawners[i].lane_cursor;
                    self.active_spawners[i].lane_cursor += 1;
                    let type_id = self.active_spawners[i].type_id.clone();
                    let spawner_wave_idx = self.active_spawners[i].wave_index;

                    if let Some(enemy) = self.create_enemy(
                        registry,
                        map,
                        &type_id,
                        Some(forced_lane),
                        Some(spawner_wave_idx),
                    ) {
                        on_spawn_enemy(enemy);
                    }
                }
            }
        }

        // Dọn dẹp bớt các spawner đã hoàn tất sinh quái
        self.active_spawners.retain(|s| s.remaining_count > 0);

        if all_spawned && active_enemies_count == 0 {
            self.is_wave_in_progress = false;
            let total_reward: u32 = if !self.pending_rewards.is_empty() {
                self.pending_rewards.drain(..).sum()
            } else {
                let config = self.get_current_wave_config(registry, map);
                config.reward_gold
            };
            on_wave_complete(total_reward);

            if self.current_wave_index + 1 < self.get_total_waves() {
                self.current_wave_index += 1;
            }
        }
    }

    pub fn create_enemy(
        &mut self,
        registry: &GameConfigRegistry,
        map: &MapConfig,
        type_id: &str,
        forced_lane_index: Option<usize>,
        spawner_wave_index: Option<usize>,
    ) -> Option<EnemyEntity> {
        let bp = registry.enemies.get(type_id)?;
        self.enemy_counter += 1;

        let eff_wave_idx = spawner_wave_index.unwrap_or(self.current_wave_index);
        let hp_mult = self.get_wave_hp_multiplier(eff_wave_idx);
        let final_hp = (bp.hp * hp_mult).round().max(1.0);

        let lane_index: usize;
        let mut start_x = 40.0;
        let mut start_y = 160.0;

        match bp.navigation_mode {
            NavigationMode::WaterPath => {
                let count = map.water_lanes.len().max(1);
                let raw_idx = forced_lane_index.unwrap_or_else(|| {
                    let v = self.water_lane_index;
                    self.water_lane_index += 1;
                    v
                });
                lane_index = raw_idx % count;
                if let Some(Some(LaneItem::Point(pt))) =
                    map.water_lanes.get(lane_index).map(|l| l.first())
                {
                    start_x = pt.x;
                    start_y = pt.y;
                }
            }
            NavigationMode::AirDirect | NavigationMode::AirWaypoints => {
                let count = map.air_lanes.len().max(1);
                let raw_idx = forced_lane_index.unwrap_or_else(|| {
                    let v = self.air_lane_index;
                    self.air_lane_index += 1;
                    v
                });
                lane_index = raw_idx % count;
                if let Some(Some(LaneItem::Point(pt))) =
                    map.air_lanes.get(lane_index).map(|l| l.first())
                {
                    start_x = pt.x;
                    start_y = pt.y;
                }
            }
            NavigationMode::GroundPath => {
                let count = map.ground_lanes.len().max(1);
                let raw_idx = forced_lane_index.unwrap_or_else(|| {
                    let v = self.ground_lane_index;
                    self.ground_lane_index += 1;
                    v
                });
                lane_index = raw_idx % count;
                if let Some(Some(LaneItem::Point(pt))) =
                    map.ground_lanes.get(lane_index).map(|l| l.first())
                {
                    start_x = pt.x;
                    start_y = pt.y;
                }
            }
        }

        let initial_state = match bp.movement_type {
            MovementType::FLY => EnemyState::FLYING,
            MovementType::SWIM => EnemyState::SWIMMING,
            MovementType::WALK => EnemyState::WALKING,
        };

        let ability_timers = bp
            .abilities
            .as_ref()
            .map(|abs| abs.iter().map(|a| a.interval.unwrap_or(0.0)).collect());

        Some(EnemyEntity {
            id: format!("enemy-{}", self.enemy_counter),
            type_id: bp.type_id.clone(),
            name: bp.name.clone(),
            x: start_x,
            y: start_y,
            prev_x: Some(start_x),
            prev_y: Some(start_y),
            hp: final_hp,
            max_hp: final_hp,
            speed: bp.speed,
            base_speed: bp.speed,
            damage: bp.damage,
            attack_speed: bp.attack_speed,
            attack_cooldown: 1.0,
            reward_gold: bp.reward_gold,
            movement_type: bp.movement_type,
            navigation_mode: bp.navigation_mode,
            path_distance: 0.0,
            path_total_length: 1000.0,
            elemental_profile: bp.elemental_profile.clone(),
            state: initial_state,
            engaged_by_soldier_id: None,
            status_effects: Vec::new(),
            tags: bp.tags.clone(),
            altitude: bp.altitude,
            size: bp.size,
            facing: 0.0,
            lane_index: Some(lane_index),
            cc_resistance: bp.cc_resistance,
            abilities: bp.abilities.clone(),
            ability_timers,
            armor_shield: Some(0.0),
            max_armor_shield: Some(0.0),
            magic_shield: Some(0.0),
            max_magic_shield: Some(0.0),
            damage_reduction_ratio: Some(0.0),
            damage_reduction_timer: Some(0.0),
            damage_reduction_buffs: None,
        })
    }

    pub fn spawn_minion_at(
        &mut self,
        registry: &GameConfigRegistry,
        type_id: &str,
        path_distance: f32,
        x: f32,
        y: f32,
        lane_index: usize,
    ) -> Option<EnemyEntity> {
        let bp = registry.enemies.get(type_id)?;
        self.enemy_counter += 1;
        let hp_mult = self.get_wave_hp_multiplier(self.current_wave_index);
        let final_hp = (bp.hp * hp_mult).round().max(1.0);

        let initial_state = match bp.movement_type {
            MovementType::FLY => EnemyState::FLYING,
            MovementType::SWIM => EnemyState::SWIMMING,
            MovementType::WALK => EnemyState::WALKING,
        };

        let ability_timers = bp
            .abilities
            .as_ref()
            .map(|abs| abs.iter().map(|a| a.interval.unwrap_or(0.0)).collect());

        Some(EnemyEntity {
            id: format!("enemy-{}", self.enemy_counter),
            type_id: bp.type_id.clone(),
            name: bp.name.clone(),
            x,
            y,
            prev_x: Some(x),
            prev_y: Some(y),
            hp: final_hp,
            max_hp: final_hp,
            speed: bp.speed,
            base_speed: bp.speed,
            damage: bp.damage,
            attack_speed: bp.attack_speed,
            attack_cooldown: 1.0,
            reward_gold: bp.reward_gold,
            movement_type: bp.movement_type,
            navigation_mode: bp.navigation_mode,
            path_distance,
            path_total_length: 1000.0,
            elemental_profile: bp.elemental_profile.clone(),
            state: initial_state,
            engaged_by_soldier_id: None,
            status_effects: Vec::new(),
            tags: bp.tags.clone(),
            altitude: bp.altitude,
            size: bp.size,
            facing: 0.0,
            lane_index: Some(lane_index),
            cc_resistance: bp.cc_resistance,
            abilities: bp.abilities.clone(),
            ability_timers,
            armor_shield: Some(0.0),
            max_armor_shield: Some(0.0),
            magic_shield: Some(0.0),
            max_magic_shield: Some(0.0),
            damage_reduction_ratio: Some(0.0),
            damage_reduction_timer: Some(0.0),
            damage_reduction_buffs: None,
        })
    }
}
