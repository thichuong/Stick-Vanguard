use crate::audio::RustSoundSystem;
use crate::config::{GameConfigRegistry, HYBRID_ELEMENT_DMG_RATIO, MAGE_SECONDARY_DMG_RATIO};
use crate::navigation::NavigationSystem;
use crate::rules::{SimpleRng, TargetingRuleEngine};
use crate::spatial::SpatialGrid;
use crate::state::RustGameState;
use crate::types::{
    BonusElementEntry, DamagePayload, ElementType, EnemyAbilityConfig, EnemyAbilityType,
    EnemyEntity, EnemyState, MovementType, PlacementType, ProjectileEntity, SoldierCombatMode,
    SoldierState, StatusEffectPayload, StatusEffectType, SummonUnitArchetype,
    TowerBranch, TowerType, Vector2D,
};
use crate::wave::WaveSystem;
use std::collections::HashSet;

pub struct EnemySkillSystem;

impl EnemySkillSystem {
    pub fn update(
        registry: &GameConfigRegistry,
        state: &mut RustGameState,
        nav: &NavigationSystem,
        wave: &mut WaveSystem,
        spatial: &SpatialGrid,
        audio: &mut RustSoundSystem,
        rng: &mut SimpleRng,
        dt: f32,
        total_anim_time: f32,
    ) {
        let enemy_count = state.enemies.len();
        for e_idx in 0..enemy_count {
            if e_idx >= state.enemies.len() {
                break;
            }
            if state.enemies[e_idx].hp <= 0.0 || state.enemies[e_idx].state == EnemyState::DEAD {
                continue;
            }
            if TargetingRuleEngine::is_enemy_stunned_or_frozen(&state.enemies[e_idx]) {
                continue;
            }

            let Some(abilities) = state.enemies[e_idx].abilities.clone() else {
                continue;
            };
            if state.enemies[e_idx].ability_timers.is_none() {
                state.enemies[e_idx].ability_timers =
                    Some(abilities.iter().map(|a| a.interval.unwrap_or(6.0)).collect());
            }

            for a_idx in 0..abilities.len() {
                let ability = &abilities[a_idx];
                if ability.ability_type == EnemyAbilityType::DeathSpawn {
                    continue;
                }

                let interval = ability.interval.unwrap_or(6.0);
                let mut should_fire = false;
                if let Some(ref mut timers) = state.enemies[e_idx].ability_timers {
                    if let Some(t) = timers.get_mut(a_idx) {
                        *t -= dt;
                        if *t <= 0.0 {
                            *t = interval;
                            should_fire = true;
                        }
                    }
                }

                if should_fire {
                    let src_enemy = state.enemies[e_idx].clone();
                    Self::execute_ability(
                        registry,
                        state,
                        nav,
                        wave,
                        spatial,
                        audio,
                        rng,
                        &src_enemy,
                        ability,
                        total_anim_time,
                    );
                }
            }
        }
    }

    pub fn handle_death(
        registry: &GameConfigRegistry,
        state: &mut RustGameState,
        nav: &NavigationSystem,
        wave: &mut WaveSystem,
        audio: &mut RustSoundSystem,
        rng: &mut SimpleRng,
        enemy: &EnemyEntity,
        total_anim_time: f32,
    ) {
        let Some(ref abilities) = enemy.abilities else {
            return;
        };

        for ability in abilities {
            if ability.ability_type == EnemyAbilityType::DeathSpawn {
                let Some(ref spawn_type_id) = ability.spawn_type_id else {
                    continue;
                };
                let count = ability.count.unwrap_or(1);
                audio.play_enemy_skill("SPLIT");
                state.add_floating_text(
                    "💥 Phân tách!",
                    enemy.x,
                    enemy.y - 24.0,
                    "#f97316",
                    15.0,
                );

                let lane_idx = enemy.lane_index.unwrap_or(0);
                for s in 0..count {
                    let offset = (s as f32 - (count as f32 - 1.0) / 2.0) * 12.0;
                    let child_dist = (enemy.path_distance + offset).max(0.0);
                    let (child_pos, child_facing, _) = nav.get_point_along_path(
                        enemy.navigation_mode,
                        child_dist,
                        total_anim_time,
                        lane_idx,
                    );

                    if let Some(mut child) = wave.spawn_minion_at(
                        registry,
                        spawn_type_id,
                        child_dist,
                        child_pos.x,
                        child_pos.y,
                        lane_idx,
                    ) {
                        if let Some(path_info) =
                            nav.get_path_info(child.navigation_mode, lane_idx)
                        {
                            child.path_total_length = path_info.total_length;
                        }
                        child.facing = child_facing;
                        child.prev_x = Some(child.x);
                        child.prev_y = Some(child.y);
                        state.enemies.push(child);
                        state.add_explosion_particles(
                            rng,
                            child_pos.x,
                            child_pos.y,
                            "#f97316",
                            5,
                        );
                    }
                }
            }
        }
    }

    #[allow(clippy::too_many_arguments)]
    fn execute_ability(
        registry: &GameConfigRegistry,
        state: &mut RustGameState,
        nav: &NavigationSystem,
        wave: &mut WaveSystem,
        spatial: &SpatialGrid,
        audio: &mut RustSoundSystem,
        rng: &mut SimpleRng,
        source_enemy: &EnemyEntity,
        ability: &EnemyAbilityConfig,
        total_anim_time: f32,
    ) {
        match ability.ability_type {
            EnemyAbilityType::SUMMON => {
                let Some(ref spawn_type_id) = ability.spawn_type_id else {
                    return;
                };
                let count = ability.count.unwrap_or(1);
                audio.play_enemy_skill("SUMMON");
                state.add_floating_text(
                    "🔮 Triệu hồi!",
                    source_enemy.x,
                    source_enemy.y - 20.0,
                    "#a855f7",
                    15.0,
                );
                state.add_explosion_particles(
                    rng,
                    source_enemy.x,
                    source_enemy.y,
                    "#a855f7",
                    10,
                );

                let lane_idx = source_enemy.lane_index.unwrap_or(0);
                for s in 0..count {
                    let offset = ((s + 1) as f32) * 14.0;
                    let minion_dist = (source_enemy.path_distance - offset).max(0.0);
                    let (m_pos, m_facing, _) = nav.get_point_along_path(
                        source_enemy.navigation_mode,
                        minion_dist,
                        total_anim_time,
                        lane_idx,
                    );
                    if let Some(mut minion) = wave.spawn_minion_at(
                        registry,
                        spawn_type_id,
                        minion_dist,
                        m_pos.x,
                        m_pos.y,
                        lane_idx,
                    ) {
                        if let Some(path_info) =
                            nav.get_path_info(minion.navigation_mode, lane_idx)
                        {
                            minion.path_total_length = path_info.total_length;
                        }
                        minion.facing = m_facing;
                        minion.prev_x = Some(minion.x);
                        minion.prev_y = Some(minion.y);
                        state.enemies.push(minion);
                    }
                }
            }
            EnemyAbilityType::DisableTower => {
                let max_targets = ability.max_targets.unwrap_or(1);
                let radius = ability.radius.unwrap_or(150.0);
                let duration = ability.duration.unwrap_or(3.5);

                let mut valid_towers: Vec<(usize, f32)> = state
                    .towers
                    .iter()
                    .enumerate()
                    .filter(|(_, t)| t.placement == PlacementType::ROADSIDE)
                    .map(|(idx, t)| {
                        let d = ((t.x - source_enemy.x).powi(2) + (t.y - source_enemy.y).powi(2))
                            .sqrt();
                        (idx, d)
                    })
                    .filter(|(_, d)| *d <= radius)
                    .collect();

                valid_towers
                    .sort_by(|a, b| a.1.partial_cmp(&b.1).unwrap_or(std::cmp::Ordering::Equal));

                for (t_idx, _) in valid_towers.into_iter().take(max_targets) {
                    let cur_dis = state.towers[t_idx].disabled_timer.unwrap_or(0.0);
                    state.towers[t_idx].disabled_timer = Some(cur_dis.max(duration));
                    let tx = state.towers[t_idx].x;
                    let ty = state.towers[t_idx].y;
                    audio.play_tower_damaged("DISABLED");
                    state.add_floating_text("⚡ VÔ HIỆU THÁP!", tx, ty - 22.0, "#facc15", 14.0);
                    state.add_explosion_particles(rng, tx, ty, "#facc15", 10);
                    state.add_explosion_particles(
                        rng,
                        source_enemy.x,
                        source_enemy.y,
                        "#a855f7",
                        6,
                    );
                }
            }
            EnemyAbilityType::DowngradeTower => {
                let radius = ability.radius.unwrap_or(160.0);
                let mut closest_id: Option<String> = None;
                let mut min_dist = radius;

                for t in &state.towers {
                    let dist =
                        ((t.x - source_enemy.x).powi(2) + (t.y - source_enemy.y).powi(2)).sqrt();
                    if dist <= min_dist {
                        min_dist = dist;
                        closest_id = Some(t.id.clone());
                    }
                }

                if let Some(tid) = closest_id {
                    state.add_explosion_particles(
                        rng,
                        source_enemy.x,
                        source_enemy.y,
                        "#7c3aed",
                        12,
                    );
                    state.downgrade_or_destroy_tower(registry, audio, rng, &tid);
                }
            }
            EnemyAbilityType::ArmorShieldAura => {
                let radius = ability.radius.unwrap_or(110.0);
                let shield_val = ability.value.unwrap_or(80.0);
                let indices = spatial.query_radius_indices(
                    &state.enemies,
                    source_enemy.x,
                    source_enemy.y,
                    radius,
                );
                for idx in indices {
                    if idx >= state.enemies.len() {
                        continue;
                    }
                    let ex = state.enemies[idx].x;
                    let ey = state.enemies[idx].y;
                    let cur_shield = state.enemies[idx].armor_shield.unwrap_or(0.0);
                    let new_shield = (cur_shield + shield_val).min(shield_val * 2.5);
                    let cur_max = state.enemies[idx].max_armor_shield.unwrap_or(0.0);
                    state.enemies[idx].armor_shield = Some(new_shield);
                    state.enemies[idx].max_armor_shield = Some(cur_max.max(new_shield));
                    state.add_floating_text("🛡️ +Giáp Ảo!", ex, ey - 18.0, "#e2e8f0", 12.0);
                    state.add_explosion_particles(rng, ex, ey, "#e2e8f0", 5);
                }
            }
            EnemyAbilityType::MagicShieldAura => {
                let radius = ability.radius.unwrap_or(120.0);
                let shield_val = ability.value.unwrap_or(90.0);
                let indices = spatial.query_radius_indices(
                    &state.enemies,
                    source_enemy.x,
                    source_enemy.y,
                    radius,
                );
                for idx in indices {
                    if idx >= state.enemies.len() {
                        continue;
                    }
                    let ex = state.enemies[idx].x;
                    let ey = state.enemies[idx].y;
                    let cur_shield = state.enemies[idx].magic_shield.unwrap_or(0.0);
                    let new_shield = (cur_shield + shield_val).min(shield_val * 2.5);
                    let cur_max = state.enemies[idx].max_magic_shield.unwrap_or(0.0);
                    state.enemies[idx].magic_shield = Some(new_shield);
                    state.enemies[idx].max_magic_shield = Some(cur_max.max(new_shield));
                    state.add_floating_text("🔮 +Khiên Phép!", ex, ey - 18.0, "#c084fc", 12.0);
                    state.add_explosion_particles(rng, ex, ey, "#c084fc", 5);
                }
            }
            EnemyAbilityType::HealAura => {
                let radius = ability.radius.unwrap_or(120.0);
                let heal_amt = ability.value.unwrap_or(80.0);
                let indices = spatial.query_radius_indices(
                    &state.enemies,
                    source_enemy.x,
                    source_enemy.y,
                    radius,
                );
                for idx in indices {
                    if idx >= state.enemies.len() {
                        continue;
                    }
                    let hp = state.enemies[idx].hp;
                    let max_hp = state.enemies[idx].max_hp;
                    if hp > 0.0 && hp < max_hp {
                        let actual_heal = heal_amt.min(max_hp - hp).round();
                        state.enemies[idx].hp += actual_heal;
                        let ex = state.enemies[idx].x;
                        let ey = state.enemies[idx].y;
                        state.add_floating_text(
                            &format!("+{} ❤️", actual_heal as i32),
                            ex,
                            ey - 16.0,
                            "#22c55e",
                            13.0,
                        );
                        state.add_explosion_particles(rng, ex, ey, "#22c55e", 5);
                    }
                }
            }
            EnemyAbilityType::DamageReductionAura => {
                let radius = ability.radius.unwrap_or(110.0);
                let ratio = ability.value.unwrap_or(0.25).min(0.6);
                let duration = ability.duration.unwrap_or(4.0);
                let indices = spatial.query_radius_indices(
                    &state.enemies,
                    source_enemy.x,
                    source_enemy.y,
                    radius,
                );
                for idx in indices {
                    if idx >= state.enemies.len() {
                        continue;
                    }
                    let ex = state.enemies[idx].x;
                    let ey = state.enemies[idx].y;
                    TargetingRuleEngine::apply_damage_reduction(
                        &mut state.enemies[idx],
                        ratio,
                        duration,
                    );
                    state.add_floating_text(
                        "🛡️ GIẢM SÁT THƯƠNG!",
                        ex,
                        ey - 20.0,
                        "#38bdf8",
                        12.0,
                    );
                }
            }
            EnemyAbilityType::DeathSpawn => {}
        }
    }
}

pub struct TrapSystem;

impl TrapSystem {
    pub fn update_traps(
        registry: &GameConfigRegistry,
        state: &mut RustGameState,
        spatial: &SpatialGrid,
        audio: &mut RustSoundSystem,
        rng: &mut SimpleRng,
        dt: f32,
    ) {
        let global_dmg_mult = state.damage_multiplier;
        for t_idx in 0..state.towers.len() {
            if state.towers[t_idx].placement == PlacementType::ROADSIDE {
                continue;
            }

            if state.towers[t_idx].attack_cooldown > 0.0 {
                state.towers[t_idx].attack_cooldown -= dt;
            }
            if state.towers[t_idx].attack_cooldown > 0.0 {
                continue;
            }

            let trap_x = state.towers[t_idx].x;
            let trap_y = state.towers[t_idx].y;
            let trigger_radius = state.towers[t_idx].trigger_radius.unwrap_or(35.0);
            let filter = state.towers[t_idx].targeting_filter.clone();

            let candidate_indices =
                spatial.query_radius_indices(&state.enemies, trap_x, trap_y, trigger_radius);
            let has_triggered = candidate_indices
                .iter()
                .any(|&idx| TargetingRuleEngine::can_target(&filter, &state.enemies[idx]));

            if !has_triggered {
                continue;
            }

            let rearm = state.towers[t_idx].rearm_timer.unwrap_or(3.0);
            state.towers[t_idx].attack_cooldown = rearm;

            let aoe_radius = state.towers[t_idx].aoe_radius.unwrap_or(trigger_radius);
            let trap_dmg = state.towers[t_idx].damage;
            let trap_elem = state.towers[t_idx].element;
            let trap_type = state.towers[t_idx].tower_type;
            let trap_id = state.towers[t_idx].id.clone();

            let aoe_indices =
                spatial.query_radius_indices(&state.enemies, trap_x, trap_y, aoe_radius);
            let elem_color = registry.get_element_color(trap_elem).to_string();

            audio.play_trap_trigger(trap_type.as_str());
            state.add_explosion_particles(rng, trap_x, trap_y, &elem_color, 14);

            for e_idx in aoe_indices {
                if e_idx >= state.enemies.len() {
                    continue;
                }
                if !TargetingRuleEngine::can_target(&filter, &state.enemies[e_idx]) {
                    continue;
                }

                let payload = DamagePayload {
                    amount: trap_dmg,
                    element: trap_elem,
                    secondary_amount: None,
                    secondary_element: None,
                    bonus_elements: None,
                    is_crit: None,
                    source_id: trap_id.clone(),
                    status_effect: None,
                    secondary_status_effect: None,
                };

                let calc = TargetingRuleEngine::calculate_damage(
                    registry,
                    global_dmg_mult,
                    &payload,
                    &state.enemies[e_idx],
                );

                if !calc.is_immune {
                    TargetingRuleEngine::apply_damage_to_enemy(
                        &mut state.enemies[e_idx],
                        &calc,
                        trap_elem,
                        None,
                    );
                    TargetingRuleEngine::apply_elemental_hit_effects(
                        registry,
                        rng,
                        &mut state.enemies[e_idx],
                        trap_elem,
                        trap_dmg,
                    );
                    if trap_type == TowerType::TrapFrost {
                        TargetingRuleEngine::apply_status_effect(
                            registry,
                            &mut state.enemies[e_idx],
                            StatusEffectPayload {
                                effect_type: StatusEffectType::WET,
                                duration: 4.0,
                                value: 1.0,
                            },
                        );
                    }
                }

                let ex = state.enemies[e_idx].x;
                let ey = state.enemies[e_idx].y;
                if calc.is_immune {
                    state.add_floating_text("MIỄN NHIỄM!", ex, ey - 14.0, "#94a3b8", 13.0);
                } else {
                    let lbl_prefix = calc
                        .label
                        .as_ref()
                        .map(|l| format!("{} ", l))
                        .unwrap_or_default();
                    state.add_floating_text(
                        &format!("{}-{}", lbl_prefix, calc.final_damage as i32),
                        ex,
                        ey - 14.0,
                        &elem_color,
                        13.0,
                    );
                }
            }
        }
    }
}

pub struct CombatSystem;

impl CombatSystem {
    pub fn update_combat(
        registry: &GameConfigRegistry,
        state: &mut RustGameState,
        spatial: &SpatialGrid,
        audio: &mut RustSoundSystem,
        rng: &mut SimpleRng,
        dt: f32,
    ) {
        let mut dead_soldier_ids: Vec<String> = Vec::new();
        let global_dmg_mult = state.damage_multiplier;

        for s_idx in 0..state.soldiers.len() {
            // 1. Respawn timer if dead
            if state.soldiers[s_idx].state == SoldierState::DEAD {
                state.soldiers[s_idx].respawn_timer -= dt;
                if state.soldiers[s_idx].respawn_timer <= 0.0 {
                    state.soldiers[s_idx].state = SoldierState::MovingToRally;
                    state.soldiers[s_idx].hp = state.soldiers[s_idx].max_hp;
                    state.soldiers[s_idx].x = state.soldiers[s_idx].rally_point.x;
                    state.soldiers[s_idx].y = state.soldiers[s_idx].rally_point.y;
                    state.soldiers[s_idx].engaged_enemy_id = None;
                }
                continue;
            }

            // 2. Self-healing
            let regen = state.soldiers[s_idx].soldier_regen.unwrap_or_else(|| {
                if state.soldiers[s_idx].branch == Some(TowerBranch::A)
                    && state.soldiers[s_idx].tier == 4
                {
                    15.0
                } else {
                    0.0
                }
            });
            if regen > 0.0 && state.soldiers[s_idx].hp < state.soldiers[s_idx].max_hp {
                state.soldiers[s_idx].hp = (state.soldiers[s_idx].hp + regen * dt)
                    .min(state.soldiers[s_idx].max_hp);
            }

            // Ranged mode
            if state.soldiers[s_idx].combat_mode == SoldierCombatMode::RANGED {
                if let Some(dead_sid) = Self::update_ranged_soldier(
                    registry,
                    state,
                    spatial,
                    audio,
                    rng,
                    s_idx,
                    dt,
                    global_dmg_mult,
                ) {
                    dead_soldier_ids.push(dead_sid);
                }
                continue;
            }

            // 3. Melee mode: Check engaged enemy validity
            let mut current_enemy_idx: Option<usize> = None;
            if let Some(ref eng_id) = state.soldiers[s_idx].engaged_enemy_id {
                current_enemy_idx = state.enemies.iter().position(|e| {
                    &e.id == eng_id && e.hp > 0.0 && e.state != EnemyState::DEAD
                });
                if current_enemy_idx.is_none() {
                    state.soldiers[s_idx].engaged_enemy_id = None;
                    state.soldiers[s_idx].state = SoldierState::MovingToRally;
                }
            }

            // 4. Find new enemy to intercept
            if current_enemy_idx.is_none() {
                let rp = state.soldiers[s_idx].rally_point;
                let can_block_air = state.soldiers[s_idx].can_block_air.unwrap_or(false);
                if let Some(found_idx) =
                    Self::find_unengaged_enemy_near(&state.enemies, spatial, rp, 95.0, can_block_air)
                {
                    let eid = state.enemies[found_idx].id.clone();
                    let sid = state.soldiers[s_idx].id.clone();
                    state.soldiers[s_idx].engaged_enemy_id = Some(eid);
                    state.enemies[found_idx].engaged_by_soldier_id = Some(sid);
                    state.enemies[found_idx].state = EnemyState::ENGAGED;
                    state.soldiers[s_idx].state = SoldierState::MovingToEngage;
                    current_enemy_idx = Some(found_idx);
                } else {
                    let can_air = state.soldiers[s_idx].can_target_air.unwrap_or(false)
                        || state.soldiers[s_idx].can_target_swim.unwrap_or(false)
                        || state.soldiers[s_idx].archetype == Some(SummonUnitArchetype::DRAGON)
                        || state.soldiers[s_idx].archetype == Some(SummonUnitArchetype::FAIRY);
                    if can_air {
                        Self::check_aerial_soldier_attack(
                            registry,
                            state,
                            spatial,
                            audio,
                            rng,
                            s_idx,
                            dt,
                            global_dmg_mult,
                        );
                    }
                }
            }

            // 5. State machine execution for Melee
            if let Some(e_idx) = current_enemy_idx {
                let sx = state.soldiers[s_idx].x;
                let sy = state.soldiers[s_idx].y;
                let ex = state.enemies[e_idx].x;
                let ey = state.enemies[e_idx].y;
                let dist = ((sx - ex).powi(2) + (sy - ey).powi(2)).sqrt();
                let angle = (ey - sy).atan2(ex - sx);
                state.soldiers[s_idx].facing = Some(angle);

                if dist > 24.0 {
                    state.soldiers[s_idx].state = SoldierState::MovingToEngage;
                    let move_speed = 80.0;
                    state.soldiers[s_idx].x += angle.cos() * move_speed * dt;
                    state.soldiers[s_idx].y += angle.sin() * move_speed * dt;
                } else {
                    state.soldiers[s_idx].state = SoldierState::ATTACKING;
                    state.enemies[e_idx].state = EnemyState::ATTACKING;

                    state.soldiers[s_idx].attack_cooldown -= dt;
                    if state.soldiers[s_idx].attack_cooldown <= 0.0 {
                        state.soldiers[s_idx].attack_cooldown =
                            1.0 / state.soldiers[s_idx].attack_speed.max(0.1);

                        Self::perform_soldier_hybrid_hit(
                            registry,
                            state,
                            spatial,
                            audio,
                            rng,
                            s_idx,
                            e_idx,
                            true,
                            global_dmg_mult,
                        );

                        if state.enemies[e_idx].hp <= 0.0 {
                            state.enemies[e_idx].state = EnemyState::DEAD;
                            state.enemies[e_idx].engaged_by_soldier_id = None;
                            state.soldiers[s_idx].engaged_enemy_id = None;
                            state.soldiers[s_idx].state = SoldierState::MovingToRally;
                            continue;
                        }
                    }

                    // Enemy attacks soldier
                    if !TargetingRuleEngine::is_enemy_stunned_or_frozen(&state.enemies[e_idx]) {
                        state.enemies[e_idx].attack_cooldown -= dt;
                        if state.enemies[e_idx].attack_cooldown <= 0.0 {
                            let atk_mult = TargetingRuleEngine::get_enemy_attack_speed_multiplier(
                                registry,
                                &state.enemies[e_idx],
                            );
                            state.enemies[e_idx].attack_cooldown = 1.0
                                / (state.enemies[e_idx].attack_speed * atk_mult).max(0.1);

                            let calc =
                                TargetingRuleEngine::calculate_enemy_damage_to_soldier_detailed(
                                    registry,
                                    &state.enemies[e_idx],
                                    &state.soldiers[s_idx],
                                );
                            state.soldiers[s_idx].hp -= calc.final_damage;

                            let disp_elem = calc.secondary_element.unwrap_or(calc.primary_element);
                            let color = registry.get_element_color(disp_elem).to_string();
                            audio.play_hit(false, calc.label.is_some(), true);

                            let lbl_prefix = calc
                                .label
                                .as_ref()
                                .map(|l| format!("{} ", l))
                                .unwrap_or_default();
                            state.add_floating_text(
                                &format!("{}-{}", lbl_prefix, calc.final_damage as i32),
                                sx,
                                sy - 12.0,
                                &color,
                                13.0,
                            );
                            state.add_explosion_particles(rng, sx, sy, &color, 4);

                            if state.soldiers[s_idx].hp <= 0.0 {
                                state.soldiers[s_idx].state = SoldierState::DEAD;
                                state.soldiers[s_idx].respawn_timer =
                                    state.soldiers[s_idx].respawn_delay;
                                state.soldiers[s_idx].engaged_enemy_id = None;
                                state.enemies[e_idx].engaged_by_soldier_id = None;
                                state.enemies[e_idx].state = EnemyState::WALKING;
                                dead_soldier_ids.push(state.soldiers[s_idx].id.clone());
                            }
                        }
                    }
                }
            } else {
                // Return to rally point if displaced
                let sx = state.soldiers[s_idx].x;
                let sy = state.soldiers[s_idx].y;
                let rp = state.soldiers[s_idx].rally_point;
                let dist_to_rally = ((sx - rp.x).powi(2) + (sy - rp.y).powi(2)).sqrt();
                if dist_to_rally > 6.0 {
                    state.soldiers[s_idx].state = SoldierState::MovingToRally;
                    let angle = (rp.y - sy).atan2(rp.x - sx);
                    state.soldiers[s_idx].facing = Some(angle);
                    let move_speed = 65.0;
                    state.soldiers[s_idx].x += angle.cos() * move_speed * dt;
                    state.soldiers[s_idx].y += angle.sin() * move_speed * dt;
                } else if state.soldiers[s_idx].state != SoldierState::ATTACKING {
                    state.soldiers[s_idx].state = SoldierState::IDLE;
                }
            }
        }

        for sid in dead_soldier_ids {
            audio.play_soldier_death();
            state.handle_soldier_death(registry, audio, rng, &sid);
        }
    }

    #[allow(clippy::too_many_arguments)]
    fn update_ranged_soldier(
        registry: &GameConfigRegistry,
        state: &mut RustGameState,
        spatial: &SpatialGrid,
        audio: &mut RustSoundSystem,
        rng: &mut SimpleRng,
        s_idx: usize,
        dt: f32,
        global_dmg_mult: f32,
    ) -> Option<String> {
        let sx = state.soldiers[s_idx].x;
        let sy = state.soldiers[s_idx].y;
        let rp = state.soldiers[s_idx].rally_point;
        let dist_to_rally = ((sx - rp.x).powi(2) + (sy - rp.y).powi(2)).sqrt();
        if dist_to_rally > 6.0 {
            state.soldiers[s_idx].state = SoldierState::MovingToRally;
            let angle = (rp.y - sy).atan2(rp.x - sx);
            let move_speed = 65.0;
            state.soldiers[s_idx].x += angle.cos() * move_speed * dt;
            state.soldiers[s_idx].y += angle.sin() * move_speed * dt;
        } else {
            state.soldiers[s_idx].state = SoldierState::IDLE;
        }

        if state.soldiers[s_idx].attack_cooldown > 0.0 {
            state.soldiers[s_idx].attack_cooldown -= dt;
        }

        // Melee defense check if enemy walks on top of ranged soldier
        let melee_indices = spatial.query_radius_indices(&state.enemies, sx, sy, 22.0);
        for e_idx in melee_indices {
            if state.enemies[e_idx].movement_type != MovementType::WALK {
                continue;
            }
            if !TargetingRuleEngine::is_enemy_stunned_or_frozen(&state.enemies[e_idx]) {
                state.enemies[e_idx].attack_cooldown -= dt;
                if state.enemies[e_idx].attack_cooldown <= 0.0 {
                    let atk_mult = TargetingRuleEngine::get_enemy_attack_speed_multiplier(
                        registry,
                        &state.enemies[e_idx],
                    );
                    state.enemies[e_idx].attack_cooldown =
                        1.0 / (state.enemies[e_idx].attack_speed * atk_mult).max(0.1);
                    let calc = TargetingRuleEngine::calculate_enemy_damage_to_soldier_detailed(
                        registry,
                        &state.enemies[e_idx],
                        &state.soldiers[s_idx],
                    );
                    state.soldiers[s_idx].hp -= calc.final_damage;

                    let disp_elem = calc.secondary_element.unwrap_or(calc.primary_element);
                    let color = registry.get_element_color(disp_elem).to_string();
                    audio.play_hit(false, calc.label.is_some(), true);

                    let lbl_prefix = calc
                        .label
                        .as_ref()
                        .map(|l| format!("{} ", l))
                        .unwrap_or_default();
                    state.add_floating_text(
                        &format!("{}-{}", lbl_prefix, calc.final_damage as i32),
                        sx,
                        sy - 12.0,
                        &color,
                        13.0,
                    );
                    state.add_explosion_particles(rng, sx, sy, &color, 4);

                    if state.soldiers[s_idx].hp <= 0.0 {
                        state.soldiers[s_idx].state = SoldierState::DEAD;
                        state.soldiers[s_idx].respawn_timer = state.soldiers[s_idx].respawn_delay;
                        return Some(state.soldiers[s_idx].id.clone());
                    }
                }
            }
        }

        if state.soldiers[s_idx].attack_cooldown > 0.0 {
            return None;
        }

        let range = state.soldiers[s_idx].ranged_range.unwrap_or(150.0);
        let best_idx = spatial.find_best_target_index(&state.enemies, sx, sy, range, |_| true)?;

        state.soldiers[s_idx].attack_cooldown =
            1.0 / state.soldiers[s_idx].attack_speed.max(0.1);
        state.soldiers[s_idx].state = SoldierState::ATTACKING;

        audio.play_shoot("JAVELIN");
        Self::perform_soldier_hybrid_hit(
            registry,
            state,
            spatial,
            audio,
            rng,
            s_idx,
            best_idx,
            false,
            global_dmg_mult,
        );

        None
    }

    #[allow(clippy::too_many_arguments)]
    fn check_aerial_soldier_attack(
        registry: &GameConfigRegistry,
        state: &mut RustGameState,
        spatial: &SpatialGrid,
        audio: &mut RustSoundSystem,
        rng: &mut SimpleRng,
        s_idx: usize,
        dt: f32,
        global_dmg_mult: f32,
    ) {
        if state.soldiers[s_idx].attack_cooldown > 0.0 {
            state.soldiers[s_idx].attack_cooldown -= dt;
        }

        let arch = state.soldiers[s_idx].archetype;
        let spirit_arch = state.soldiers[s_idx].spirit_source_archetype;
        let is_dragon = arch == Some(SummonUnitArchetype::DRAGON)
            || (state.soldiers[s_idx].is_spirit.unwrap_or(false)
                && spirit_arch == Some(SummonUnitArchetype::DRAGON));
        let is_fairy = arch == Some(SummonUnitArchetype::FAIRY)
            || (state.soldiers[s_idx].is_spirit.unwrap_or(false)
                && spirit_arch == Some(SummonUnitArchetype::FAIRY));
        let can_hit_all =
            is_dragon || is_fairy || state.soldiers[s_idx].can_target_swim.unwrap_or(false);

        let sx = state.soldiers[s_idx].x;
        let sy = state.soldiers[s_idx].y;
        let range = state.soldiers[s_idx].ranged_range.unwrap_or(130.0);

        let best_idx = spatial.find_best_target_index(&state.enemies, sx, sy, range, |e| {
            if can_hit_all {
                true
            } else {
                e.movement_type == MovementType::FLY
            }
        });

        let Some(target_idx) = best_idx else {
            if state.soldiers[s_idx].state == SoldierState::ATTACKING {
                state.soldiers[s_idx].state = SoldierState::IDLE;
            }
            return;
        };

        let tx = state.enemies[target_idx].x;
        let ty = state.enemies[target_idx].y;
        state.soldiers[s_idx].facing = Some((ty - sy).atan2(tx - sx));
        state.soldiers[s_idx].state = SoldierState::ATTACKING;

        if state.soldiers[s_idx].attack_cooldown > 0.0 {
            return;
        }

        state.soldiers[s_idx].attack_cooldown =
            1.0 / state.soldiers[s_idx].attack_speed.max(0.2);

        if !can_hit_all {
            let javelin_dmg = state.soldiers[s_idx].damage * 0.9;
            let payload = DamagePayload {
                amount: javelin_dmg,
                element: ElementType::LIGHTNING,
                secondary_amount: None,
                secondary_element: None,
                bonus_elements: None,
                is_crit: None,
                source_id: state.soldiers[s_idx].id.clone(),
                status_effect: None,
                secondary_status_effect: None,
            };
            let calc = TargetingRuleEngine::calculate_damage(
                registry,
                global_dmg_mult,
                &payload,
                &state.enemies[target_idx],
            );
            if !calc.is_immune {
                TargetingRuleEngine::apply_damage_to_enemy(
                    &mut state.enemies[target_idx],
                    &calc,
                    ElementType::LIGHTNING,
                    None,
                );
                TargetingRuleEngine::apply_elemental_hit_effects(
                    registry,
                    rng,
                    &mut state.enemies[target_idx],
                    ElementType::LIGHTNING,
                    javelin_dmg,
                );
            }
            audio.play_shoot("JAVELIN");
            audio.play_hit(calc.is_immune, calc.label.is_some() && !calc.is_immune, false);
            let color = registry.get_element_color(ElementType::LIGHTNING).to_string();
            let draw_y = ty - state.enemies[target_idx].altitude;
            if calc.is_immune {
                state.add_floating_text("MIỄN NHIỄM!", tx, draw_y - 12.0, "#94a3b8", 13.0);
            } else {
                let lbl_prefix = calc
                    .label
                    .as_ref()
                    .map(|l| format!("{} ", l))
                    .unwrap_or_default();
                state.add_floating_text(
                    &format!("{}-{}", lbl_prefix, calc.final_damage as i32),
                    tx,
                    draw_y - 12.0,
                    &color,
                    13.0,
                );
            }
            state.add_explosion_particles(rng, tx, draw_y, &color, 4);
            return;
        }

        Self::perform_soldier_hybrid_hit(
            registry,
            state,
            spatial,
            audio,
            rng,
            s_idx,
            target_idx,
            true,
            global_dmg_mult,
        );
    }

    #[allow(clippy::too_many_arguments)]
    fn perform_soldier_hybrid_hit(
        registry: &GameConfigRegistry,
        state: &mut RustGameState,
        spatial: &SpatialGrid,
        audio: &mut RustSoundSystem,
        rng: &mut SimpleRng,
        s_idx: usize,
        target_idx: usize,
        is_melee: bool,
        global_dmg_mult: f32,
    ) {
        let s_dmg = state.soldiers[s_idx].damage;
        let primary_elem = state.soldiers[s_idx].element;
        let sec_elem = state.soldiers[s_idx].secondary_element;
        let arch = state.soldiers[s_idx].archetype;
        let is_dragon_or_fairy =
            arch == Some(SummonUnitArchetype::DRAGON) || arch == Some(SummonUnitArchetype::FAIRY);
        let sec_ratio = if is_dragon_or_fairy { 0.60 } else { 0.45 };
        let sec_amt = sec_elem.map(|_| (s_dmg * sec_ratio).round().max(1.0));

        let mut bonus_elements: Vec<BonusElementEntry> = state.soldiers[s_idx]
            .buffed_elements
            .as_ref()
            .map(|list| {
                list.iter()
                    .map(|&el| BonusElementEntry {
                        element: el,
                        amount: (s_dmg * 0.45).round().max(1.0),
                    })
                    .collect()
            })
            .unwrap_or_default();

        if state.soldiers[s_idx].is_spirit.unwrap_or(false) {
            let g_ratio = state.soldiers[s_idx].spirit_ghost_ratio.unwrap_or(0.5);
            bonus_elements.push(BonusElementEntry {
                element: ElementType::GHOST,
                amount: (s_dmg * g_ratio).round().max(1.0),
            });
        }

        let sid = state.soldiers[s_idx].id.clone();
        let aoe_rad = state.soldiers[s_idx].aoe_radius.unwrap_or(0.0);
        let has_light = primary_elem == ElementType::LIGHT
            || sec_elem == Some(ElementType::LIGHT)
            || state.soldiers[s_idx]
                .buffed_elements
                .as_ref()
                .map(|b| b.contains(&ElementType::LIGHT))
                .unwrap_or(false);
        let has_grass = primary_elem == ElementType::GRASS
            || sec_elem == Some(ElementType::GRASS)
            || state.soldiers[s_idx]
                .buffed_elements
                .as_ref()
                .map(|b| b.contains(&ElementType::GRASS))
                .unwrap_or(false);
        let has_lightning = sec_elem == Some(ElementType::LIGHTNING)
            || state.soldiers[s_idx]
                .buffed_elements
                .as_ref()
                .map(|b| b.contains(&ElementType::LIGHTNING))
                .unwrap_or(false);

        let display_element = bonus_elements
            .first()
            .map(|b| b.element)
            .or(sec_elem)
            .unwrap_or(primary_elem);
        let color = registry.get_element_color(display_element).to_string();

        let payload = DamagePayload {
            amount: s_dmg,
            element: primary_elem,
            secondary_amount: sec_amt,
            secondary_element: sec_elem,
            bonus_elements: if bonus_elements.is_empty() {
                None
            } else {
                Some(bonus_elements.clone())
            },
            is_crit: None,
            source_id: sid.clone(),
            status_effect: None,
            secondary_status_effect: None,
        };

        let calc = TargetingRuleEngine::calculate_damage(
            registry,
            global_dmg_mult,
            &payload,
            &state.enemies[target_idx],
        );

        if !calc.is_immune {
            TargetingRuleEngine::apply_damage_to_enemy(
                &mut state.enemies[target_idx],
                &calc,
                primary_elem,
                sec_elem,
            );
            TargetingRuleEngine::apply_all_payload_effects(
                registry,
                rng,
                &mut state.enemies[target_idx],
                &payload,
            );

            if has_light {
                let heal = registry
                    .element_combat_stats
                    .get(&ElementType::LIGHT)
                    .and_then(|s| s.soldier_heal_on_hit)
                    .unwrap_or(5.0);
                state.soldiers[s_idx].hp =
                    (state.soldiers[s_idx].hp + heal).min(state.soldiers[s_idx].max_hp);
            } else if has_grass {
                let heal = registry
                    .element_combat_stats
                    .get(&ElementType::GRASS)
                    .and_then(|s| s.soldier_heal_on_hit)
                    .unwrap_or(3.0);
                state.soldiers[s_idx].hp =
                    (state.soldiers[s_idx].hp + heal).min(state.soldiers[s_idx].max_hp);
            }
        }

        let tx = state.enemies[target_idx].x;
        let ty = state.enemies[target_idx].y;
        let draw_y = ty - state.enemies[target_idx].altitude;
        audio.play_hit(calc.is_immune, calc.label.is_some() && !calc.is_immune, is_melee);

        if calc.is_immune {
            state.add_floating_text("MIỄN NHIỄM!", tx, draw_y - 12.0, "#94a3b8", 13.0);
        } else {
            let lbl_prefix = calc
                .label
                .as_ref()
                .map(|l| format!("{} ", l))
                .unwrap_or_default();
            state.add_floating_text(
                &format!("{}-{}", lbl_prefix, calc.final_damage as i32),
                tx,
                draw_y - 12.0,
                &color,
                13.0,
            );
        }
        state.add_explosion_particles(rng, tx, draw_y, &color, 4);

        // Dragon AoE splash
        if aoe_rad > 0.0 {
            let splash_amt = (s_dmg * 0.70).round().max(1.0);
            let splash_payload = DamagePayload {
                amount: splash_amt,
                element: primary_elem,
                secondary_amount: sec_elem.map(|_| (splash_amt * 0.45).round().max(1.0)),
                secondary_element: sec_elem,
                bonus_elements: if bonus_elements.is_empty() {
                    None
                } else {
                    Some(bonus_elements)
                },
                is_crit: None,
                source_id: sid.clone(),
                status_effect: None,
                secondary_status_effect: None,
            };

            let splash_indices = spatial.query_radius_indices(&state.enemies, tx, ty, aoe_rad);
            for other_idx in splash_indices {
                if other_idx == target_idx || other_idx >= state.enemies.len() {
                    continue;
                }
                let s_calc = TargetingRuleEngine::calculate_damage(
                    registry,
                    global_dmg_mult,
                    &splash_payload,
                    &state.enemies[other_idx],
                );
                if !s_calc.is_immune {
                    TargetingRuleEngine::apply_damage_to_enemy(
                        &mut state.enemies[other_idx],
                        &s_calc,
                        primary_elem,
                        sec_elem,
                    );
                    TargetingRuleEngine::apply_all_payload_effects(
                        registry,
                        rng,
                        &mut state.enemies[other_idx],
                        &splash_payload,
                    );
                }
                let ox = state.enemies[other_idx].x;
                let oy = state.enemies[other_idx].y - state.enemies[other_idx].altitude;
                if s_calc.is_immune {
                    state.add_floating_text("MIỄN NHIỄM!", ox, oy - 12.0, "#94a3b8", 13.0);
                } else {
                    let lbl_prefix = s_calc
                        .label
                        .as_ref()
                        .map(|l| format!("{} ", l))
                        .unwrap_or_default();
                    state.add_floating_text(
                        &format!("{}-{}", lbl_prefix, s_calc.final_damage as i32),
                        ox,
                        oy - 12.0,
                        &color,
                        13.0,
                    );
                }
            }
        }

        // Lightning chain bounce
        if has_lightning && state.enemies[target_idx].hp > 0.0 {
            let chain_ratio = registry
                .element_combat_stats
                .get(&ElementType::LIGHTNING)
                .and_then(|s| s.chain_damage_ratio)
                .unwrap_or(0.35);
            let chain_range = registry
                .element_combat_stats
                .get(&ElementType::LIGHTNING)
                .and_then(|s| s.chain_range)
                .unwrap_or(110.0);
            let chain_dmg = (s_dmg * chain_ratio).round().max(1.0);
            let target_id = state.enemies[target_idx].id.clone();

            if let Some(c_idx) = spatial.find_closest_index(
                &state.enemies,
                tx,
                ty,
                chain_range,
                |other| other.id != target_id,
            ) {
                let c_payload = DamagePayload {
                    amount: chain_dmg,
                    element: ElementType::LIGHTNING,
                    secondary_amount: None,
                    secondary_element: None,
                    bonus_elements: None,
                    is_crit: None,
                    source_id: sid,
                    status_effect: None,
                    secondary_status_effect: None,
                };
                let c_calc = TargetingRuleEngine::calculate_damage(
                    registry,
                    global_dmg_mult,
                    &c_payload,
                    &state.enemies[c_idx],
                );
                if !c_calc.is_immune {
                    TargetingRuleEngine::apply_damage_to_enemy(
                        &mut state.enemies[c_idx],
                        &c_calc,
                        ElementType::LIGHTNING,
                        None,
                    );
                    TargetingRuleEngine::apply_elemental_hit_effects(
                        registry,
                        rng,
                        &mut state.enemies[c_idx],
                        ElementType::LIGHTNING,
                        chain_dmg,
                    );
                }
                let cx = state.enemies[c_idx].x;
                let cy = state.enemies[c_idx].y - state.enemies[c_idx].altitude;
                let l_color = registry
                    .get_element_color(ElementType::LIGHTNING)
                    .to_string();
                if !c_calc.is_immune {
                    state.add_floating_text(
                        &format!("-{}", c_calc.final_damage as i32),
                        cx,
                        cy - 12.0,
                        &l_color,
                        13.0,
                    );
                }
            }
        }
    }

    pub fn find_unengaged_enemy_near(
        enemies: &[EnemyEntity],
        spatial: &SpatialGrid,
        rally_point: Vector2D,
        radius: f32,
        can_block_air: bool,
    ) -> Option<usize> {
        spatial.find_closest_index(enemies, rally_point.x, rally_point.y, radius, |enemy| {
            if enemy.hp <= 0.0 || enemy.state == EnemyState::DEAD {
                return false;
            }
            if enemy.movement_type != MovementType::WALK {
                if !can_block_air || enemy.movement_type != MovementType::FLY {
                    return false;
                }
            }
            if enemy.tags.iter().any(|t| t == "UNBLOCKABLE") {
                return false;
            }
            if enemy.engaged_by_soldier_id.is_some() {
                return false;
            }
            true
        })
    }
}

pub struct TowerSystem;

impl TowerSystem {
    pub fn update_towers(
        registry: &GameConfigRegistry,
        state: &mut RustGameState,
        spatial: &SpatialGrid,
        audio: &mut RustSoundSystem,
        rng: &mut SimpleRng,
        proj_counter: &mut u32,
        dt: f32,
    ) {
        let global_dmg_mult = state.damage_multiplier;
        for t_idx in 0..state.towers.len() {
            if let Some(dis) = state.towers[t_idx].disabled_timer.as_mut() {
                if *dis > 0.0 {
                    *dis = (*dis - dt).max(0.0);
                    continue;
                }
            }

            if state.towers[t_idx].attack_cooldown > 0.0 {
                state.towers[t_idx].attack_cooldown -= dt;
            }

            if !state.towers[t_idx].tower_type.is_defense()
                || state.towers[t_idx].placement != PlacementType::ROADSIDE
            {
                continue;
            }

            // Mage 4_A continuous area DPS
            if state.towers[t_idx].tower_type == TowerType::MAGE
                && state.towers[t_idx].tier == 4
                && state.towers[t_idx].branch == Some(TowerBranch::A)
            {
                let cur_tick = state.towers[t_idx].aura_tick_timer.unwrap_or(0.0) + dt;
                if cur_tick >= 0.5 {
                    state.towers[t_idx].aura_tick_timer = Some(0.0);
                    let tick_dmg = (state.towers[t_idx].damage * 0.5).round().max(1.0);
                    let t_elem = state.towers[t_idx].element;
                    let sec_elem = state.towers[t_idx].secondary_element;
                    let sec_dmg = sec_elem.map(|_| tick_dmg);
                    let bonus_elements = state.towers[t_idx].buffed_elements.as_ref().map(|b| {
                        b.iter()
                            .map(|&el| BonusElementEntry {
                                element: el,
                                amount: tick_dmg,
                            })
                            .collect()
                    });
                    let tid = state.towers[t_idx].id.clone();
                    let tx = state.towers[t_idx].x;
                    let ty = state.towers[t_idx].y;
                    let trange = state.towers[t_idx].range;
                    let filter = state.towers[t_idx].targeting_filter.clone();
                    let color = registry.get_element_color(t_elem).to_string();

                    let payload = DamagePayload {
                        amount: tick_dmg,
                        element: t_elem,
                        secondary_amount: sec_dmg,
                        secondary_element: sec_elem,
                        bonus_elements,
                        is_crit: None,
                        source_id: tid,
                        status_effect: None,
                        secondary_status_effect: None,
                    };

                    let indices = spatial.query_radius_indices(&state.enemies, tx, ty, trange);
                    for e_idx in indices {
                        if e_idx >= state.enemies.len() {
                            continue;
                        }
                        if !TargetingRuleEngine::can_target(&filter, &state.enemies[e_idx]) {
                            continue;
                        }
                        let calc = TargetingRuleEngine::calculate_damage(
                            registry,
                            global_dmg_mult,
                            &payload,
                            &state.enemies[e_idx],
                        );
                        if !calc.is_immune {
                            TargetingRuleEngine::apply_damage_to_enemy(
                                &mut state.enemies[e_idx],
                                &calc,
                                t_elem,
                                sec_elem,
                            );
                            TargetingRuleEngine::apply_all_payload_effects(
                                registry,
                                rng,
                                &mut state.enemies[e_idx],
                                &payload,
                            );
                            let ex = state.enemies[e_idx].x;
                            let ey = state.enemies[e_idx].y;
                            audio.play_hit(false, false, false);
                            state.add_floating_text(
                                &format!("-{}", calc.final_damage as i32),
                                ex,
                                ey - 14.0,
                                &color,
                                13.0,
                            );
                            state.add_explosion_particles(rng, ex, ey, &color, 4);
                        }
                    }
                } else {
                    state.towers[t_idx].aura_tick_timer = Some(cur_tick);
                }
                continue;
            }

            if state.towers[t_idx].attack_cooldown > 0.0 {
                continue;
            }

            let tx = state.towers[t_idx].x;
            let ty = state.towers[t_idx].y;
            let trange = state.towers[t_idx].range;
            let filter = state.towers[t_idx].targeting_filter.clone();

            let Some(target_idx) =
                spatial.find_best_target_index(&state.enemies, tx, ty, trange, |e| {
                    TargetingRuleEngine::can_target(&filter, e)
                })
            else {
                continue;
            };

            let tower = &mut state.towers[t_idx];
            tower.attack_cooldown = 1.0 / tower.fire_rate.max(0.1);
            *proj_counter += 1;

            let is_parabolic = tower.tower_type == TowerType::ARTILLERY;
            let aoe_radius = tower
                .aoe_radius
                .unwrap_or(if is_parabolic { 75.0 } else { 0.0 });
            let proj_speed = if is_parabolic {
                220.0
            } else if tower.tower_type == TowerType::ARCHER {
                440.0
            } else {
                340.0
            };

            let (primary_element, primary_amount, secondary_element, secondary_amount) =
                if tower.tower_type == TowerType::MAGE {
                    let sec_amt = tower
                        .secondary_element
                        .map(|_| (tower.damage * MAGE_SECONDARY_DMG_RATIO).round().max(1.0));
                    (tower.element, tower.damage, tower.secondary_element, sec_amt)
                } else {
                    let sec_amt = tower
                        .secondary_element
                        .map(|_| (tower.damage * HYBRID_ELEMENT_DMG_RATIO).round().max(1.0));
                    (
                        ElementType::PHYSICAL,
                        tower.damage,
                        tower.secondary_element,
                        sec_amt,
                    )
                };

            let bonus_elements: Option<Vec<BonusElementEntry>> =
                tower.buffed_elements.as_ref().map(|b| {
                    b.iter()
                        .map(|&el| BonusElementEntry {
                            element: el,
                            amount: if tower.tower_type == TowerType::MAGE {
                                tower.damage
                            } else {
                                (tower.damage * HYBRID_ELEMENT_DMG_RATIO).round().max(1.0)
                            },
                        })
                        .collect()
                });

            let has_lightning = primary_element == ElementType::LIGHTNING
                || secondary_element == Some(ElementType::LIGHTNING)
                || bonus_elements
                    .as_ref()
                    .map(|b| b.iter().any(|x| x.element == ElementType::LIGHTNING))
                    .unwrap_or(false);

            let chain_count = if has_lightning {
                if tower.tower_type == TowerType::MAGE {
                    if tower.tier == 4 && tower.branch == Some(TowerBranch::B) {
                        4
                    } else {
                        2
                    }
                } else {
                    1
                }
            } else {
                0
            };

            let shoot_type = match tower.tower_type {
                TowerType::ARTILLERY => "ARTILLERY",
                TowerType::MAGE => "MAGE",
                _ => "ARCHER",
            };
            let tid = tower.id.clone();

            let target_x = state.enemies[target_idx].x;
            let target_y = state.enemies[target_idx].y;
            let target_id = if is_parabolic {
                None
            } else {
                Some(state.enemies[target_idx].id.clone())
            };

            audio.play_shoot(shoot_type);
            state.projectiles.push(ProjectileEntity {
                id: format!("proj-{}", *proj_counter),
                source_tower_id: tid.clone(),
                x: tx,
                y: ty - 14.0,
                prev_x: Some(tx),
                prev_y: Some(ty - 14.0),
                start_x: tx,
                start_y: ty - 14.0,
                target_x,
                target_y,
                target_enemy_id: target_id,
                speed: proj_speed,
                damage_payload: DamagePayload {
                    amount: primary_amount,
                    element: primary_element,
                    secondary_amount,
                    secondary_element,
                    bonus_elements,
                    is_crit: None,
                    source_id: tid,
                    status_effect: None,
                    secondary_status_effect: None,
                },
                aoe_radius,
                is_parabolic,
                arc_height: if is_parabolic { 70.0 } else { 0.0 },
                progress: 0.0,
                chain_count: Some(chain_count),
                color: None,
            });
        }
    }
}

pub struct ProjectileSystem;

impl ProjectileSystem {
    pub fn update_projectiles(
        registry: &GameConfigRegistry,
        state: &mut RustGameState,
        spatial: &SpatialGrid,
        audio: &mut RustSoundSystem,
        rng: &mut SimpleRng,
        dt: f32,
    ) {
        let global_dmg_mult = state.damage_multiplier;

        for i in (0..state.projectiles.len()).rev() {
            state.projectiles[i].prev_x = Some(state.projectiles[i].x);
            state.projectiles[i].prev_y = Some(state.projectiles[i].y);

            if let Some(ref target_id) = state.projectiles[i].target_enemy_id {
                if let Some(target) = state
                    .enemies
                    .iter()
                    .find(|e| &e.id == target_id && e.hp > 0.0 && e.state != EnemyState::DEAD)
                {
                    state.projectiles[i].target_x = target.x;
                    state.projectiles[i].target_y = target.y - target.altitude;
                }
            }

            if state.projectiles[i].is_parabolic {
                let p = &mut state.projectiles[i];
                let total_dist =
                    ((p.target_x - p.start_x).powi(2) + (p.target_y - p.start_y).powi(2)).sqrt();
                let flight_time = (total_dist / p.speed).max(0.2);
                p.progress += dt / flight_time;

                let t = p.progress.min(1.0);
                let gx = p.start_x + (p.target_x - p.start_x) * t;
                let gy = p.start_y + (p.target_y - p.start_y) * t;
                let arc = 4.0 * p.arc_height * t * (1.0 - t);
                p.x = gx;
                p.y = gy - arc;

                if p.progress >= 1.0 {
                    let finished_proj = state.projectiles.swap_remove(i);
                    Self::handle_aoe_impact(
                        registry,
                        state,
                        spatial,
                        audio,
                        rng,
                        &finished_proj,
                        global_dmg_mult,
                    );
                }
            } else {
                let dx = state.projectiles[i].target_x - state.projectiles[i].x;
                let dy = state.projectiles[i].target_y - state.projectiles[i].y;
                let dist_sq = dx * dx + dy * dy;
                let step = state.projectiles[i].speed * dt;

                if dist_sq <= step * step || dist_sq < 144.0 {
                    let mut finished_proj = state.projectiles.swap_remove(i);
                    finished_proj.x = finished_proj.target_x;
                    finished_proj.y = finished_proj.target_y;

                    if finished_proj.aoe_radius > 0.0 {
                        Self::handle_aoe_impact(
                            registry,
                            state,
                            spatial,
                            audio,
                            rng,
                            &finished_proj,
                            global_dmg_mult,
                        );
                    } else {
                        Self::handle_single_impact(
                            registry,
                            state,
                            spatial,
                            audio,
                            rng,
                            &finished_proj,
                            global_dmg_mult,
                        );
                    }
                } else {
                    let dist = dist_sq.sqrt();
                    state.projectiles[i].x += (dx / dist) * step;
                    state.projectiles[i].y += (dy / dist) * step;
                }
            }
        }
    }

    fn handle_single_impact(
        registry: &GameConfigRegistry,
        state: &mut RustGameState,
        spatial: &SpatialGrid,
        audio: &mut RustSoundSystem,
        rng: &mut SimpleRng,
        p: &ProjectileEntity,
        global_dmg_mult: f32,
    ) {
        let mut target_idx = p.target_enemy_id.as_ref().and_then(|tid| {
            state
                .enemies
                .iter()
                .position(|e| &e.id == tid && e.hp > 0.0 && e.state != EnemyState::DEAD)
        });

        if target_idx.is_none() {
            target_idx = spatial.find_closest_index(&state.enemies, p.x, p.y, 24.0, |_| true);
        }

        let Some(e_idx) = target_idx else {
            return;
        };

        let calc = TargetingRuleEngine::calculate_damage(
            registry,
            global_dmg_mult,
            &p.damage_payload,
            &state.enemies[e_idx],
        );

        if !calc.is_immune {
            TargetingRuleEngine::apply_damage_to_enemy(
                &mut state.enemies[e_idx],
                &calc,
                p.damage_payload.element,
                p.damage_payload.secondary_element,
            );
            TargetingRuleEngine::apply_all_payload_effects(
                registry,
                rng,
                &mut state.enemies[e_idx],
                &p.damage_payload,
            );
        }

        let disp_elem = p
            .damage_payload
            .bonus_elements
            .as_ref()
            .and_then(|b| b.first().map(|x| x.element))
            .or(p.damage_payload.secondary_element)
            .unwrap_or(p.damage_payload.element);
        let color = registry.get_element_color(disp_elem).to_string();

        let tx = state.enemies[e_idx].x;
        let ty = state.enemies[e_idx].y - state.enemies[e_idx].altitude;
        audio.play_hit(calc.is_immune, calc.label.is_some() && !calc.is_immune, false);

        if calc.is_immune {
            state.add_floating_text("MIỄN NHIỄM!", tx, ty - 14.0, "#94a3b8", 13.0);
        } else {
            let lbl_prefix = calc
                .label
                .as_ref()
                .map(|l| format!("{} ", l))
                .unwrap_or_default();
            state.add_floating_text(
                &format!("{}-{}", lbl_prefix, calc.final_damage as i32),
                tx,
                ty - 14.0,
                &color,
                13.0,
            );
        }
        state.add_explosion_particles(rng, tx, ty, &color, 6);

        // Chain lightning bounce
        let bounces = p.chain_count.unwrap_or(0);
        if bounces > 0 {
            let mut remaining = bounces;
            let mut prev_x = state.enemies[e_idx].x;
            let mut prev_y = state.enemies[e_idx].y;
            let mut hit_set = HashSet::new();
            hit_set.insert(state.enemies[e_idx].id.clone());

            let candidates = spatial.query_radius_indices(&state.enemies, prev_x, prev_y, 130.0);
            for next_idx in candidates {
                if remaining == 0 || next_idx >= state.enemies.len() {
                    break;
                }
                if state.enemies[next_idx].hp <= 0.0
                    || state.enemies[next_idx].state == EnemyState::DEAD
                    || hit_set.contains(&state.enemies[next_idx].id)
                {
                    continue;
                }

                let dx = state.enemies[next_idx].x - prev_x;
                let dy = state.enemies[next_idx].y - prev_y;
                if dx * dx + dy * dy <= 130.0 * 130.0 {
                    hit_set.insert(state.enemies[next_idx].id.clone());
                    remaining -= 1;

                    let mut chain_payload = p.damage_payload.clone();
                    chain_payload.amount = (chain_payload.amount * 0.7).round();
                    chain_payload.secondary_amount =
                        chain_payload.secondary_amount.map(|a| (a * 0.7).round());

                    let c_calc = TargetingRuleEngine::calculate_damage(
                        registry,
                        global_dmg_mult,
                        &chain_payload,
                        &state.enemies[next_idx],
                    );
                    if !c_calc.is_immune {
                        TargetingRuleEngine::apply_damage_to_enemy(
                            &mut state.enemies[next_idx],
                            &c_calc,
                            chain_payload.element,
                            chain_payload.secondary_element,
                        );
                        TargetingRuleEngine::apply_all_payload_effects(
                            registry,
                            rng,
                            &mut state.enemies[next_idx],
                            &chain_payload,
                        );
                    }

                    let nx = state.enemies[next_idx].x;
                    let ny = state.enemies[next_idx].y - state.enemies[next_idx].altitude;
                    if c_calc.is_immune {
                        state.add_floating_text("MIỄN NHIỄM!", nx, ny - 14.0, "#94a3b8", 13.0);
                    } else {
                        let lbl_prefix = c_calc
                            .label
                            .as_ref()
                            .map(|l| format!("{} ", l))
                            .unwrap_or_default();
                        state.add_floating_text(
                            &format!("{}-{}", lbl_prefix, c_calc.final_damage as i32),
                            nx,
                            ny - 14.0,
                            &color,
                            13.0,
                        );
                    }
                    state.add_explosion_particles(rng, nx, ny, &color, 6);

                    prev_x = state.enemies[next_idx].x;
                    prev_y = state.enemies[next_idx].y;
                }
            }
        }
    }

    fn handle_aoe_impact(
        registry: &GameConfigRegistry,
        state: &mut RustGameState,
        spatial: &SpatialGrid,
        audio: &mut RustSoundSystem,
        rng: &mut SimpleRng,
        p: &ProjectileEntity,
        global_dmg_mult: f32,
    ) {
        let disp_elem = p
            .damage_payload
            .secondary_element
            .unwrap_or(p.damage_payload.element);
        let color = registry.get_element_color(disp_elem).to_string();

        audio.play_explosion("SMALL");
        state.add_explosion_particles(rng, p.target_x, p.target_y, &color, 16);

        let aoe_indices =
            spatial.query_radius_indices(&state.enemies, p.target_x, p.target_y, p.aoe_radius);

        for e_idx in aoe_indices {
            if e_idx >= state.enemies.len() {
                continue;
            }
            if p.is_parabolic && state.enemies[e_idx].movement_type == MovementType::FLY {
                continue;
            }

            let dx = state.enemies[e_idx].x - p.target_x;
            let dy = state.enemies[e_idx].y - p.target_y;
            let dist = (dx * dx + dy * dy).sqrt();
            if dist <= p.aoe_radius {
                let falloff = (1.0 - (dist / p.aoe_radius.max(1.0)) * 0.6).max(0.4);
                let bonus_elements = p.damage_payload.bonus_elements.as_ref().map(|b| {
                    b.iter()
                        .map(|x| BonusElementEntry {
                            element: x.element,
                            amount: (x.amount * falloff).round(),
                        })
                        .collect()
                });

                let payload = DamagePayload {
                    amount: (p.damage_payload.amount * falloff).round(),
                    element: p.damage_payload.element,
                    secondary_amount: p
                        .damage_payload
                        .secondary_amount
                        .map(|a| (a * falloff).round()),
                    secondary_element: p.damage_payload.secondary_element,
                    bonus_elements,
                    is_crit: p.damage_payload.is_crit,
                    source_id: p.damage_payload.source_id.clone(),
                    status_effect: None,
                    secondary_status_effect: None,
                };

                let calc = TargetingRuleEngine::calculate_damage(
                    registry,
                    global_dmg_mult,
                    &payload,
                    &state.enemies[e_idx],
                );
                if !calc.is_immune {
                    TargetingRuleEngine::apply_damage_to_enemy(
                        &mut state.enemies[e_idx],
                        &calc,
                        payload.element,
                        payload.secondary_element,
                    );
                    TargetingRuleEngine::apply_all_payload_effects(
                        registry,
                        rng,
                        &mut state.enemies[e_idx],
                        &payload,
                    );
                }

                let ex = state.enemies[e_idx].x;
                let ey = state.enemies[e_idx].y - state.enemies[e_idx].altitude;
                audio.play_hit(calc.is_immune, calc.label.is_some() && !calc.is_immune, false);
                if calc.is_immune {
                    state.add_floating_text("MIỄN NHIỄM!", ex, ey - 14.0, "#94a3b8", 13.0);
                } else {
                    let lbl_prefix = calc
                        .label
                        .as_ref()
                        .map(|l| format!("{} ", l))
                        .unwrap_or_default();
                    state.add_floating_text(
                        &format!("{}-{}", lbl_prefix, calc.final_damage as i32),
                        ex,
                        ey - 14.0,
                        &color,
                        13.0,
                    );
                }
                state.add_explosion_particles(rng, ex, ey, &color, 6);
            }
        }
    }
}

pub struct RustSimulationEngine {
    pub accumulator: f32,
    pub interpolation_alpha: f32,
    pub total_anim_time: f32,
    pub proj_counter: u32,
}

impl Default for RustSimulationEngine {
    fn default() -> Self {
        Self::new()
    }
}

impl RustSimulationEngine {
    pub const FIXED_DT: f32 = 1.0 / 60.0;
    pub const MAX_SUB_STEPS: u32 = 4;

    pub fn new() -> Self {
        RustSimulationEngine {
            accumulator: 0.0,
            interpolation_alpha: 1.0,
            total_anim_time: 0.0,
            proj_counter: 0,
        }
    }

    pub fn update(
        &mut self,
        registry: &GameConfigRegistry,
        state: &mut RustGameState,
        nav: &NavigationSystem,
        wave: &mut WaveSystem,
        spatial: &mut SpatialGrid,
        audio: &mut RustSoundSystem,
        rng: &mut SimpleRng,
        raw_dt: f32,
    ) {
        let effective_dt =
            raw_dt.min(0.1) * if state.is_paused { 0.0 } else { state.game_speed };
        self.total_anim_time += effective_dt;
        audio.advance_clock(effective_dt);

        if state.is_paused || state.is_game_over || state.is_victory {
            return;
        }

        self.accumulator += effective_dt;
        let mut sub_steps = 0;

        while self.accumulator >= Self::FIXED_DT && sub_steps < Self::MAX_SUB_STEPS {
            self.tick(
                registry,
                state,
                nav,
                wave,
                spatial,
                audio,
                rng,
                Self::FIXED_DT,
            );
            self.accumulator -= Self::FIXED_DT;
            sub_steps += 1;
        }

        if self.accumulator > Self::FIXED_DT * 2.0 {
            self.accumulator = 0.0;
        }

        self.interpolation_alpha = (self.accumulator / Self::FIXED_DT).clamp(0.0, 1.0);
    }

    #[allow(clippy::too_many_arguments)]
    pub fn tick(
        &mut self,
        registry: &GameConfigRegistry,
        state: &mut RustGameState,
        nav: &NavigationSystem,
        wave: &mut WaveSystem,
        spatial: &mut SpatialGrid,
        audio: &mut RustSoundSystem,
        rng: &mut SimpleRng,
        dt: f32,
    ) {
        wave.set_total_waves(state.custom_total_waves);

        // 0. Record previous positions
        for e in &mut state.enemies {
            e.prev_x = Some(e.x);
            e.prev_y = Some(e.y);
        }
        for s in &mut state.soldiers {
            s.prev_x = Some(s.x);
            s.prev_y = Some(s.y);
        }
        for p in &mut state.projectiles {
            p.prev_x = Some(p.x);
            p.prev_y = Some(p.y);
        }

        // 1. Rebuild spatial grid
        spatial.rebuild(&state.enemies);

        // 2. Wave spawning
        let current_map = state.current_map.clone();
        let active_count = state.enemies.len();
        let anim_time = self.total_anim_time;
        let mut spawned_enemies = Vec::new();
        let mut wave_reward: Option<u32> = None;

        wave.update(
            registry,
            &current_map,
            dt,
            active_count,
            |mut new_enemy| {
                let lane_idx = new_enemy.lane_index.unwrap_or(0);
                if let Some(p_info) = nav.get_path_info(new_enemy.navigation_mode, lane_idx) {
                    new_enemy.path_total_length = p_info.total_length;
                }
                nav.update_enemy_transform(&mut new_enemy, anim_time);
                new_enemy.prev_x = Some(new_enemy.x);
                new_enemy.prev_y = Some(new_enemy.y);
                spawned_enemies.push(new_enemy);
            },
            |reward| {
                wave_reward = Some(reward);
            },
        );

        state.enemies.extend(spawned_enemies);
        if let Some(reward) = wave_reward {
            let scaled = ((reward as f32) * state.gold_multiplier).round().max(1.0) as i32;
            state.gold += scaled;
            state.add_floating_text(
                &format!("+{} 🪙 Hoàn thành Đợt!", scaled),
                500.0,
                100.0,
                "#22c55e",
                18.0,
            );
            audio.play_wave_complete();
            if wave.current_wave_index >= wave.get_total_waves().saturating_sub(1)
                && !wave.is_wave_in_progress
                && state.enemies.is_empty()
            {
                state.is_victory = true;
                audio.play_victory();
            }
        }

        // 3. Enemy skills
        EnemySkillSystem::update(
            registry,
            state,
            nav,
            wave,
            spatial,
            audio,
            rng,
            dt,
            self.total_anim_time,
        );

        // 4. Update enemies along path & handle deaths / base damage
        self.update_enemies(registry, state, nav, wave, audio, rng, dt);

        // Rebuild spatial grid after movements
        spatial.rebuild(&state.enemies);

        // 5. Update Traps
        TrapSystem::update_traps(registry, state, spatial, audio, rng, dt);

        // 6. Update Soldiers & Combat
        CombatSystem::update_combat(registry, state, spatial, audio, rng, dt);

        // 7. Update Towers
        TowerSystem::update_towers(
            registry,
            state,
            spatial,
            audio,
            rng,
            &mut self.proj_counter,
            dt,
        );

        // 8. Update Projectiles
        ProjectileSystem::update_projectiles(registry, state, spatial, audio, rng, dt);

        // 9. Update Particles
        for i in (0..state.particles.len()).rev() {
            state.particles[i].prev_x = Some(state.particles[i].x);
            state.particles[i].prev_y = Some(state.particles[i].y);
            let vx = state.particles[i].vx;
            let vy = state.particles[i].vy;
            state.particles[i].x += vx * dt;
            state.particles[i].y += vy * dt;
            state.particles[i].life_time -= dt;
            if state.particles[i].life_time <= 0.0 {
                state.particles.swap_remove(i);
            }
        }

        // 10. Update Floating Texts
        for i in (0..state.floating_texts.len()).rev() {
            state.floating_texts[i].y -= 22.0 * dt;
            state.floating_texts[i].life_time -= dt;
            if state.floating_texts[i].life_time <= 0.0 {
                state.floating_texts.swap_remove(i);
            }
        }
    }

    fn update_enemies(
        &mut self,
        registry: &GameConfigRegistry,
        state: &mut RustGameState,
        nav: &NavigationSystem,
        wave: &mut WaveSystem,
        audio: &mut RustSoundSystem,
        rng: &mut SimpleRng,
        dt: f32,
    ) {
        let base_pos = state
            .current_map
            .get_map_bases()
            .first()
            .map(|b| (b.x, b.y))
            .unwrap_or((500.0, 325.0));
        let global_dmg_mult = state.damage_multiplier;

        for i in (0..state.enemies.len()).rev() {
            let mut dot_events: Vec<(f32, ElementType)> = Vec::new();
            TargetingRuleEngine::update_status_effects(
                registry,
                global_dmg_mult,
                &mut state.enemies[i],
                dt,
                |dmg, elem| {
                    dot_events.push((dmg, elem));
                },
            );

            for (dmg, elem) in dot_events {
                TargetingRuleEngine::apply_raw_damage_to_enemy(&mut state.enemies[i], dmg, elem);
                let ex = state.enemies[i].x;
                let ey = state.enemies[i].y;
                let color = registry.get_element_color(elem).to_string();
                state.add_floating_text(&format!("-{}", dmg as i32), ex, ey - 12.0, &color, 13.0);
                if state.enemies[i].hp <= 0.0 {
                    state.enemies[i].state = EnemyState::DEAD;
                }
            }

            if state.enemies[i].hp <= 0.0 || state.enemies[i].state == EnemyState::DEAD {
                let dead_enemy = state.enemies.swap_remove(i);
                let tier = if dead_enemy.tags.iter().any(|t| t == "BOSS") {
                    "BOSS"
                } else if dead_enemy.tags.iter().any(|t| t == "ELITE") {
                    "ELITE"
                } else {
                    "NORMAL"
                };
                audio.play_enemy_death(tier);

                let scaled_gold = if dead_enemy.reward_gold > 0 {
                    ((dead_enemy.reward_gold as f32) * state.gold_multiplier)
                        .round()
                        .max(1.0) as i32
                } else {
                    0
                };
                state.gold += scaled_gold;
                if scaled_gold > 0 {
                    state.add_floating_text(
                        &format!("+{} 🪙", scaled_gold),
                        dead_enemy.x,
                        dead_enemy.y - 10.0,
                        "#facc15",
                        14.0,
                    );
                }
                let p_color = registry
                    .get_element_color(dead_enemy.elemental_profile.primary_element)
                    .to_string();
                state.add_explosion_particles(rng, dead_enemy.x, dead_enemy.y, &p_color, 8);

                EnemySkillSystem::handle_death(
                    registry,
                    state,
                    nav,
                    wave,
                    audio,
                    rng,
                    &dead_enemy,
                    self.total_anim_time,
                );
                continue;
            }

            if state.enemies[i].state == EnemyState::ENGAGED
                || state.enemies[i].state == EnemyState::ATTACKING
            {
                continue;
            }

            let speed = state.enemies[i].speed;
            state.enemies[i].path_distance += speed * dt;
            let is_finished =
                nav.update_enemy_transform(&mut state.enemies[i], self.total_anim_time);

            if is_finished {
                let finished_enemy = state.enemies.swap_remove(i);
                let is_boss = finished_enemy.tags.iter().any(|t| t == "BOSS");
                let dmg_to_base = if is_boss { 5 } else { 1 };
                state.lives -= dmg_to_base;
                audio.play_base_damaged(is_boss);
                let hx = if finished_enemy.x != 0.0 {
                    finished_enemy.x
                } else {
                    base_pos.0
                };
                let hy = if finished_enemy.y != 0.0 {
                    finished_enemy.y
                } else {
                    base_pos.1
                };
                state.add_floating_text(
                    &format!("-{} ❤️", dmg_to_base),
                    hx,
                    hy - 20.0,
                    "#ef4444",
                    16.0,
                );
                state.add_explosion_particles(rng, hx, hy, "#ef4444", 15);

                if state.lives <= 0 {
                    state.lives = 0;
                    state.is_game_over = true;
                    audio.play_game_over();
                }
            }
        }
    }
}
