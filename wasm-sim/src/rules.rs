use crate::config::{CrowdControlModifiers, EnemyTierCategory, GameConfigRegistry, TierCCConfig};
use crate::types::{
    DamagePayload, DamageReductionBuff, ElementType, ElementalProfile, EnemyEntity, EnemyState,
    MovementType, SoldierEntity, StatusEffect, StatusEffectPayload, StatusEffectType,
    TargetingFilter,
};
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug)]
pub struct SimpleRng {
    state: u64,
}

impl Default for SimpleRng {
    fn default() -> Self {
        Self::new(0x853c49e6748fea9b)
    }
}

impl SimpleRng {
    pub fn new(seed: u64) -> Self {
        SimpleRng {
            state: if seed == 0 { 0x853c49e6748fea9b } else { seed },
        }
    }

    pub fn next_u32(&mut self) -> u32 {
        let mut x = self.state;
        x ^= x << 13;
        x ^= x >> 7;
        x ^= x << 17;
        self.state = x;
        (x >> 32) as u32
    }

    /// Returns a float in [0.0, 1.0)
    pub fn next_f32(&mut self) -> f32 {
        (self.next_u32() as f64 / (u32::MAX as f64 + 1.0)) as f32
    }
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DamageCalculationResult {
    pub final_damage: f32,
    pub is_immune: bool,
    pub multiplier: f32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub label: Option<String>,
    pub reaction_triggered: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reaction_label: Option<String>,
    pub primary_damage: f32,
    pub secondary_damage: f32,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EnemyToSoldierDamageResult {
    pub final_damage: f32,
    pub primary_damage: f32,
    pub secondary_damage: f32,
    pub primary_element: ElementType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub secondary_element: Option<ElementType>,
    pub multiplier: f32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub label: Option<String>,
}

pub struct TargetingRuleEngine;

impl TargetingRuleEngine {
    pub fn can_target(filter: &TargetingFilter, enemy: &EnemyEntity) -> bool {
        if enemy.hp <= 0.0 || enemy.state == EnemyState::DEAD {
            return false;
        }

        if !filter.allowed_movement.contains(&enemy.movement_type) {
            return false;
        }

        if let Some(excluded_elems) = &filter.excluded_elements {
            if excluded_elems.contains(&enemy.elemental_profile.primary_element) {
                return false;
            }
        }

        if let Some(excluded_tags) = &filter.excluded_tags {
            for tag in excluded_tags {
                if enemy.tags.contains(tag) {
                    return false;
                }
            }
        }

        true
    }

    pub fn calculate_elemental_matchup(
        registry: &GameConfigRegistry,
        attacker: ElementType,
        profile: &ElementalProfile,
    ) -> f32 {
        if profile.immunities.contains(&attacker) {
            return 0.0;
        }

        let p_match = registry.get_matchup(attacker, profile.primary_element);

        if let Some(sec_elem) = profile.secondary_element {
            if sec_elem != ElementType::PHYSICAL {
                let s_match = registry.get_matchup(attacker, sec_elem);
                let combined = (p_match * s_match).clamp(0.1, 3.0);
                return (combined * 100.0).round() / 100.0;
            }
        }

        p_match
    }

    pub fn calculate_single_damage(
        registry: &GameConfigRegistry,
        global_dmg_mult: f32,
        amount: f32,
        element: ElementType,
        is_crit: bool,
        enemy: &EnemyEntity,
    ) -> DamageCalculationResult {
        let profile = &enemy.elemental_profile;

        if profile.immunities.contains(&element) {
            return DamageCalculationResult {
                final_damage: 0.0,
                is_immune: true,
                multiplier: 0.0,
                label: Some("MIỄN NHIỄM!".to_string()),
                reaction_triggered: false,
                reaction_label: None,
                primary_damage: 0.0,
                secondary_damage: 0.0,
            };
        }

        let mut multiplier = Self::calculate_elemental_matchup(registry, element, profile);

        // Status effect interactions & Elemental Reactions
        let mut best_reaction_mult: f32 = 0.0;
        let mut best_reaction_req: Option<StatusEffectType> = None;
        let mut reaction_label: Option<String> = None;

        for reaction in &registry.element_reactions {
            if reaction.trigger_element == element
                && enemy
                    .status_effects
                    .iter()
                    .any(|s| s.effect_type == reaction.required_status)
                && reaction.damage_multiplier > best_reaction_mult
            {
                best_reaction_mult = reaction.damage_multiplier;
                best_reaction_req = Some(reaction.required_status);
                reaction_label = Some(reaction.label.clone());
            }
        }

        if best_reaction_mult > 0.0 {
            multiplier *= best_reaction_mult;
        }

        // SUNDER
        let has_sunder = enemy
            .status_effects
            .iter()
            .any(|s| s.effect_type == StatusEffectType::SUNDER);
        if has_sunder {
            let steel_stats = registry.element_combat_stats.get(&ElementType::STEEL);
            let bypass = steel_stats
                .and_then(|s| s.bypass_physical_resist)
                .unwrap_or(true);
            let amp = steel_stats.and_then(|s| s.damage_amp).unwrap_or(0.30);

            if element == ElementType::PHYSICAL && multiplier < 1.0 && bypass {
                multiplier = 1.0;
            }
            if best_reaction_req != Some(StatusEffectType::SUNDER) {
                multiplier *= 1.0 + amp;
            }
        }

        // CURSE
        let has_curse = enemy
            .status_effects
            .iter()
            .any(|s| s.effect_type == StatusEffectType::CURSE);
        if has_curse && element != ElementType::FAIRY && element != ElementType::LIGHT {
            let amp = registry
                .element_combat_stats
                .get(&ElementType::DARK)
                .and_then(|s| s.damage_amp)
                .unwrap_or(0.35);
            if best_reaction_req != Some(StatusEffectType::CURSE) {
                multiplier *= 1.0 + amp;
            }
        }

        // CHARM
        let has_charm = enemy
            .status_effects
            .iter()
            .any(|s| s.effect_type == StatusEffectType::CHARM);
        if has_charm
            && !matches!(
                element,
                ElementType::PHYSICAL
                    | ElementType::DARK
                    | ElementType::GHOST
                    | ElementType::POISON
            )
        {
            let amp = registry
                .element_combat_stats
                .get(&ElementType::FAIRY)
                .and_then(|s| s.damage_amp)
                .unwrap_or(0.25);
            if best_reaction_req != Some(StatusEffectType::CHARM) {
                multiplier *= 1.0 + amp;
            }
        }

        // DRAGON_AWE
        let has_dragon_awe = enemy
            .status_effects
            .iter()
            .any(|s| s.effect_type == StatusEffectType::DragonAwe);
        if has_dragon_awe && element != ElementType::DRAGON {
            let amp = registry
                .element_combat_stats
                .get(&ElementType::DRAGON)
                .and_then(|s| s.damage_amp)
                .unwrap_or(0.25);
            if best_reaction_req != Some(StatusEffectType::DragonAwe) {
                multiplier *= 1.0 + amp;
            }
        }

        // SOUL_DRAIN
        let has_soul_drain = enemy
            .status_effects
            .iter()
            .any(|s| s.effect_type == StatusEffectType::SoulDrain);
        if has_soul_drain && enemy.max_hp > 0.0 {
            let missing_ratio = (1.0 - enemy.hp / enemy.max_hp).max(0.0);
            let execute_ratio = registry
                .element_combat_stats
                .get(&ElementType::GHOST)
                .and_then(|s| s.missing_hp_damage_ratio)
                .unwrap_or(0.4);
            multiplier *= 1.0 + missing_ratio * execute_ratio;
        }

        // DRAGON vs BOSS / ELITE
        if element == ElementType::DRAGON
            && (enemy.tags.iter().any(|t| t == "BOSS" || t == "ELITE"))
        {
            let vs_boss = registry
                .element_combat_stats
                .get(&ElementType::DRAGON)
                .and_then(|s| s.vs_boss_elite_multiplier)
                .unwrap_or(1.35);
            multiplier *= vs_boss;
        }

        // WIND vs FLY
        if element == ElementType::WIND && enemy.movement_type == MovementType::FLY {
            let vs_fly = registry
                .element_combat_stats
                .get(&ElementType::WIND)
                .and_then(|s| s.vs_fly_multiplier)
                .unwrap_or(1.0);
            multiplier *= vs_fly;
        }

        // EARTH vs WALK
        if element == ElementType::EARTH && enemy.movement_type == MovementType::WALK {
            let vs_walk = registry
                .element_combat_stats
                .get(&ElementType::EARTH)
                .and_then(|s| s.vs_walk_multiplier)
                .unwrap_or(1.2);
            multiplier *= vs_walk;
        }

        if is_crit {
            multiplier *= 1.5;
        }

        let effective_reduction = Self::get_effective_damage_reduction_ratio(enemy);
        if effective_reduction > 0.0 {
            multiplier *= (1.0 - effective_reduction).max(0.25);
        }

        let final_damage = (amount * multiplier * global_dmg_mult).round().max(1.0);

        let label = if let Some(ref r_lbl) = reaction_label {
            Some(r_lbl.clone())
        } else if multiplier >= 1.4 {
            Some("KHẮC HỆ!".to_string())
        } else if multiplier <= 0.6 {
            Some("KHÁNG!".to_string())
        } else {
            None
        };

        DamageCalculationResult {
            final_damage,
            is_immune: false,
            multiplier,
            label,
            reaction_triggered: reaction_label.is_some(),
            reaction_label,
            primary_damage: final_damage,
            secondary_damage: 0.0,
        }
    }

    pub fn calculate_damage(
        registry: &GameConfigRegistry,
        global_dmg_mult: f32,
        payload: &DamagePayload,
        enemy: &EnemyEntity,
    ) -> DamageCalculationResult {
        let is_crit = payload.is_crit.unwrap_or(false);
        let primary = Self::calculate_single_damage(
            registry,
            global_dmg_mult,
            payload.amount,
            payload.element,
            is_crit,
            enemy,
        );

        let mut total_base = payload.amount;
        let mut all_immune = primary.is_immune;
        let mut final_damage = if primary.is_immune {
            0.0
        } else {
            primary.final_damage
        };
        let mut super_effective_label = primary
            .label
            .as_ref()
            .filter(|l| l.as_str() != "KHÁNG!")
            .cloned();
        let mut all_resist = primary.label.as_deref() == Some("KHÁNG!");
        let mut secondary_damage = 0.0;

        if let (Some(sec_elem), Some(sec_amt)) =
            (payload.secondary_element, payload.secondary_amount)
        {
            if sec_amt > 0.0 {
                let secondary = Self::calculate_single_damage(
                    registry,
                    global_dmg_mult,
                    sec_amt,
                    sec_elem,
                    is_crit,
                    enemy,
                );
                total_base += sec_amt;
                if !secondary.is_immune {
                    all_immune = false;
                    final_damage += secondary.final_damage;
                    secondary_damage = secondary.final_damage;
                }
                if let Some(ref lbl) = secondary.label {
                    if lbl != "KHÁNG!" {
                        super_effective_label = Some(lbl.clone());
                    }
                }
                if secondary.label.as_deref() != Some("KHÁNG!") {
                    all_resist = false;
                }
            }
        }

        if let Some(ref bonuses) = payload.bonus_elements {
            for bonus in bonuses {
                if bonus.amount > 0.0 {
                    let b_calc = Self::calculate_single_damage(
                        registry,
                        global_dmg_mult,
                        bonus.amount,
                        bonus.element,
                        is_crit,
                        enemy,
                    );
                    total_base += bonus.amount;
                    if !b_calc.is_immune {
                        all_immune = false;
                        final_damage += b_calc.final_damage;
                    }
                    if let Some(ref lbl) = b_calc.label {
                        if lbl != "KHÁNG!" {
                            super_effective_label = Some(lbl.clone());
                        }
                    }
                    if b_calc.label.as_deref() != Some("KHÁNG!") {
                        all_resist = false;
                    }
                }
            }
        }

        let has_bonus = payload
            .bonus_elements
            .as_ref()
            .map(|b| !b.is_empty())
            .unwrap_or(false);
        if payload.secondary_element.is_none() && !has_bonus {
            return primary;
        }

        let combined_multiplier = if total_base > 0.0 {
            final_damage / total_base
        } else {
            1.0
        };

        let label = if all_immune {
            Some("MIỄN NHIỄM!".to_string())
        } else if super_effective_label.is_some() {
            super_effective_label
        } else if all_resist {
            Some("KHÁNG!".to_string())
        } else {
            None
        };

        DamageCalculationResult {
            final_damage,
            is_immune: all_immune,
            multiplier: combined_multiplier,
            label,
            reaction_triggered: primary.reaction_triggered,
            reaction_label: primary.reaction_label,
            primary_damage: primary.final_damage,
            secondary_damage,
        }
    }

    pub fn apply_damage_to_enemy(
        enemy: &mut EnemyEntity,
        calc: &DamageCalculationResult,
        element: ElementType,
        secondary_element: Option<ElementType>,
    ) -> (f32, f32) {
        if calc.is_immune || calc.final_damage <= 0.0 {
            return (0.0, 0.0);
        }

        let mut total_shield_absorbed = 0.0;
        let mut total_hp_lost = 0.0;

        let mut absorb_component = |dmg: f32, elem: ElementType| {
            let mut remaining = dmg;
            if elem == ElementType::PHYSICAL {
                if let Some(shield) = enemy.armor_shield.as_mut() {
                    if *shield > 0.0 {
                        let absorbed = (*shield).min(remaining);
                        *shield -= absorbed;
                        remaining -= absorbed;
                        total_shield_absorbed += absorbed;
                    }
                }
            } else {
                if let Some(shield) = enemy.magic_shield.as_mut() {
                    if *shield > 0.0 {
                        let absorbed = (*shield).min(remaining);
                        *shield -= absorbed;
                        remaining -= absorbed;
                        total_shield_absorbed += absorbed;
                    }
                }
            }

            if remaining > 0.0 {
                enemy.hp = (enemy.hp - remaining).max(0.0);
                total_hp_lost += remaining;
            }
        };

        if calc.secondary_damage > 0.0 {
            absorb_component(calc.primary_damage, element);
            absorb_component(calc.secondary_damage, secondary_element.unwrap_or(element));
        } else {
            absorb_component(calc.final_damage, element);
        }

        if enemy.hp <= 0.0 {
            enemy.state = EnemyState::DEAD;
        }

        (total_hp_lost, total_shield_absorbed)
    }

    pub fn apply_raw_damage_to_enemy(
        enemy: &mut EnemyEntity,
        damage: f32,
        element: ElementType,
    ) -> (f32, f32) {
        let calc = DamageCalculationResult {
            final_damage: damage,
            is_immune: false,
            multiplier: 1.0,
            label: None,
            reaction_triggered: false,
            reaction_label: None,
            primary_damage: damage,
            secondary_damage: 0.0,
        };
        Self::apply_damage_to_enemy(enemy, &calc, element, None)
    }

    pub fn apply_all_payload_effects(
        registry: &GameConfigRegistry,
        rng: &mut SimpleRng,
        enemy: &mut EnemyEntity,
        payload: &DamagePayload,
    ) {
        if payload.element != ElementType::PHYSICAL {
            Self::apply_elemental_hit_effects(
                registry,
                rng,
                enemy,
                payload.element,
                payload.amount,
            );
        }
        if let (Some(sec_elem), Some(sec_amt)) =
            (payload.secondary_element, payload.secondary_amount)
        {
            if sec_amt > 0.0 {
                Self::apply_elemental_hit_effects(registry, rng, enemy, sec_elem, sec_amt);
            }
        }
        if let Some(ref bonuses) = payload.bonus_elements {
            for b in bonuses {
                if b.amount > 0.0 && b.element != ElementType::PHYSICAL {
                    Self::apply_elemental_hit_effects(registry, rng, enemy, b.element, b.amount);
                }
            }
        }
    }

    pub fn apply_elemental_hit_effects(
        registry: &GameConfigRegistry,
        rng: &mut SimpleRng,
        enemy: &mut EnemyEntity,
        element: ElementType,
        base_damage: f32,
    ) {
        if element == ElementType::PHYSICAL || enemy.elemental_profile.immunities.contains(&element)
        {
            return;
        }

        Self::apply_reaction_bonus_effects(registry, enemy, element, base_damage);

        let stats = registry.element_combat_stats.get(&element);

        match element {
            ElementType::FIRE => {
                let dur = stats.and_then(|s| s.status_duration).unwrap_or(3.0);
                let min_dmg = stats.and_then(|s| s.dot_min_damage).unwrap_or(5.0);
                let ratio = stats.and_then(|s| s.dot_damage_ratio).unwrap_or(0.2);
                let val = (base_damage * ratio).round().max(min_dmg);
                Self::apply_status_effect(
                    registry,
                    enemy,
                    StatusEffectPayload {
                        effect_type: StatusEffectType::BURN,
                        duration: dur,
                        value: val,
                    },
                );
            }
            ElementType::WATER => {
                let dur = stats.and_then(|s| s.status_duration).unwrap_or(4.0);
                let slow_dur = stats.and_then(|s| s.slow_duration).unwrap_or(2.5);
                let slow_val = stats.and_then(|s| s.slow_ratio).unwrap_or(0.2);
                Self::apply_status_effect(
                    registry,
                    enemy,
                    StatusEffectPayload {
                        effect_type: StatusEffectType::WET,
                        duration: dur,
                        value: 0.0,
                    },
                );
                Self::apply_status_effect(
                    registry,
                    enemy,
                    StatusEffectPayload {
                        effect_type: StatusEffectType::SLOW,
                        duration: slow_dur,
                        value: slow_val,
                    },
                );
            }
            ElementType::EARTH => {
                let slow_dur = stats.and_then(|s| s.slow_duration).unwrap_or(2.5);
                let slow_val = stats.and_then(|s| s.slow_ratio).unwrap_or(0.35);
                Self::apply_status_effect(
                    registry,
                    enemy,
                    StatusEffectPayload {
                        effect_type: StatusEffectType::SLOW,
                        duration: slow_dur,
                        value: slow_val,
                    },
                );
            }
            ElementType::WIND => {
                let is_fly = enemy.movement_type == MovementType::FLY;
                let chance = if is_fly {
                    stats.and_then(|s| s.knockback_chance_fly).unwrap_or(0.55)
                } else {
                    stats
                        .and_then(|s| s.knockback_chance_ground)
                        .unwrap_or(0.25)
                };
                if rng.next_f32() < chance {
                    let dist = if is_fly {
                        stats.and_then(|s| s.knockback_distance_fly).unwrap_or(20.0)
                    } else {
                        stats
                            .and_then(|s| s.knockback_distance_ground)
                            .unwrap_or(12.0)
                    };
                    Self::apply_knockback(registry, enemy, dist);
                }
            }
            ElementType::LIGHTNING => {
                let dur = stats.and_then(|s| s.status_duration).unwrap_or(0.35);
                let val = stats.and_then(|s| s.status_value).unwrap_or(0.35);
                Self::apply_status_effect(
                    registry,
                    enemy,
                    StatusEffectPayload {
                        effect_type: StatusEffectType::SHOCK,
                        duration: dur,
                        value: val,
                    },
                );
            }
            ElementType::ICE => {
                let slow_dur = stats.and_then(|s| s.slow_duration).unwrap_or(3.0);
                let slow_val = stats.and_then(|s| s.slow_ratio).unwrap_or(0.45);
                Self::apply_status_effect(
                    registry,
                    enemy,
                    StatusEffectPayload {
                        effect_type: StatusEffectType::SLOW,
                        duration: slow_dur,
                        value: slow_val,
                    },
                );
                let proc_chance = stats.and_then(|s| s.proc_chance).unwrap_or(0.25);
                if rng.next_f32() < proc_chance {
                    let proc_dur = stats.and_then(|s| s.proc_duration).unwrap_or(0.6);
                    Self::apply_status_effect(
                        registry,
                        enemy,
                        StatusEffectPayload {
                            effect_type: StatusEffectType::FREEZE,
                            duration: proc_dur,
                            value: 0.0,
                        },
                    );
                }
            }
            ElementType::LIGHT => {
                if matches!(
                    enemy.elemental_profile.primary_element,
                    ElementType::DARK | ElementType::GHOST
                ) {
                    let dur = stats.and_then(|s| s.status_duration).unwrap_or(2.5);
                    let min_dmg = stats.and_then(|s| s.dot_min_damage).unwrap_or(6.0);
                    let ratio = stats.and_then(|s| s.dot_damage_ratio).unwrap_or(0.25);
                    Self::apply_status_effect(
                        registry,
                        enemy,
                        StatusEffectPayload {
                            effect_type: StatusEffectType::BURN,
                            duration: dur,
                            value: (base_damage * ratio).round().max(min_dmg),
                        },
                    );
                }
            }
            ElementType::DARK => {
                let dur = stats.and_then(|s| s.status_duration).unwrap_or(3.5);
                let val = stats.and_then(|s| s.status_value).unwrap_or(0.35);
                Self::apply_status_effect(
                    registry,
                    enemy,
                    StatusEffectPayload {
                        effect_type: StatusEffectType::CURSE,
                        duration: dur,
                        value: val,
                    },
                );
            }
            ElementType::GRASS => {
                let slow_dur = stats.and_then(|s| s.slow_duration).unwrap_or(3.0);
                let slow_val = stats.and_then(|s| s.slow_ratio).unwrap_or(0.30);
                Self::apply_status_effect(
                    registry,
                    enemy,
                    StatusEffectPayload {
                        effect_type: StatusEffectType::SLOW,
                        duration: slow_dur,
                        value: slow_val,
                    },
                );
                let proc_chance = stats.and_then(|s| s.proc_chance).unwrap_or(0.30);
                if rng.next_f32() < proc_chance {
                    let proc_dur = stats.and_then(|s| s.proc_duration).unwrap_or(1.0);
                    Self::apply_status_effect(
                        registry,
                        enemy,
                        StatusEffectPayload {
                            effect_type: StatusEffectType::ROOT,
                            duration: proc_dur,
                            value: 0.0,
                        },
                    );
                }
            }
            ElementType::POISON => {
                let max_st = stats.and_then(|s| s.max_stacks).unwrap_or(3.0);
                let dur = stats.and_then(|s| s.status_duration).unwrap_or(4.0);
                let existing = enemy
                    .status_effects
                    .iter()
                    .find(|s| s.effect_type == StatusEffectType::POISON)
                    .map(|s| s.value)
                    .unwrap_or(0.0);
                let stacks = if existing > 0.0 {
                    (existing + 1.0).min(max_st)
                } else {
                    1.0
                };
                Self::apply_status_effect(
                    registry,
                    enemy,
                    StatusEffectPayload {
                        effect_type: StatusEffectType::POISON,
                        duration: dur,
                        value: stacks,
                    },
                );
            }
            ElementType::STEEL => {
                let dur = stats.and_then(|s| s.status_duration).unwrap_or(4.0);
                let val = stats.and_then(|s| s.status_value).unwrap_or(0.30);
                Self::apply_status_effect(
                    registry,
                    enemy,
                    StatusEffectPayload {
                        effect_type: StatusEffectType::SUNDER,
                        duration: dur,
                        value: val,
                    },
                );
            }
            ElementType::GHOST => {
                let dur = stats.and_then(|s| s.status_duration).unwrap_or(3.0);
                let val = stats.and_then(|s| s.status_value).unwrap_or(0.20);
                Self::apply_status_effect(
                    registry,
                    enemy,
                    StatusEffectPayload {
                        effect_type: StatusEffectType::SoulDrain,
                        duration: dur,
                        value: val,
                    },
                );
                let chance = stats.and_then(|s| s.knockback_chance_ground).unwrap_or(1.0);
                if rng.next_f32() < chance {
                    let dist = stats
                        .and_then(|s| s.knockback_distance_ground)
                        .unwrap_or(10.0);
                    Self::apply_knockback(registry, enemy, dist);
                }
            }
            ElementType::DRAGON => {
                let dur = stats.and_then(|s| s.status_duration).unwrap_or(3.5);
                let val = stats.and_then(|s| s.status_value).unwrap_or(0.25);
                Self::apply_status_effect(
                    registry,
                    enemy,
                    StatusEffectPayload {
                        effect_type: StatusEffectType::DragonAwe,
                        duration: dur,
                        value: val,
                    },
                );
            }
            ElementType::FAIRY => {
                let dur = stats.and_then(|s| s.status_duration).unwrap_or(3.0);
                let val = stats.and_then(|s| s.slow_ratio).unwrap_or(0.35);
                Self::apply_status_effect(
                    registry,
                    enemy,
                    StatusEffectPayload {
                        effect_type: StatusEffectType::CHARM,
                        duration: dur,
                        value: val,
                    },
                );
            }
            ElementType::PHYSICAL => {}
        }
    }

    pub fn apply_reaction_bonus_effects(
        registry: &GameConfigRegistry,
        enemy: &mut EnemyEntity,
        element: ElementType,
        base_damage: f32,
    ) {
        let has_status = |st: StatusEffectType, e: &EnemyEntity| {
            e.status_effects.iter().any(|s| s.effect_type == st)
        };

        // 1. PERMAFROST: WET + ICE
        if element == ElementType::ICE && has_status(StatusEffectType::WET, enemy) {
            let proc_dur = registry
                .element_combat_stats
                .get(&ElementType::ICE)
                .and_then(|s| s.proc_duration)
                .unwrap_or(0.6);
            Self::apply_status_effect(
                registry,
                enemy,
                StatusEffectPayload {
                    effect_type: StatusEffectType::FREEZE,
                    duration: (proc_dur * 1.33).max(0.8),
                    value: 0.0,
                },
            );
        }

        // 2. OVERGROWTH: WET + GRASS
        if element == ElementType::GRASS && has_status(StatusEffectType::WET, enemy) {
            Self::apply_status_effect(
                registry,
                enemy,
                StatusEffectPayload {
                    effect_type: StatusEffectType::ROOT,
                    duration: 1.5,
                    value: 0.0,
                },
            );
        }

        // 3. ELECTRO_CHARGED: WET + LIGHTNING
        if element == ElementType::LIGHTNING && has_status(StatusEffectType::WET, enemy) {
            Self::apply_status_effect(
                registry,
                enemy,
                StatusEffectPayload {
                    effect_type: StatusEffectType::SHOCK,
                    duration: 0.7,
                    value: 0.35,
                },
            );
        }

        // 4. COMBUSTION & BURNING_VINES: POISON/ROOT + FIRE
        if element == ElementType::FIRE
            && (has_status(StatusEffectType::POISON, enemy)
                || has_status(StatusEffectType::ROOT, enemy))
        {
            Self::apply_status_effect(
                registry,
                enemy,
                StatusEffectPayload {
                    effect_type: StatusEffectType::BURN,
                    duration: 3.5,
                    value: (base_damage * 0.3).round().max(8.0),
                },
            );
        }

        // 5. SHATTER / SHATTER_EARTH: FREEZE + STEEL / EARTH
        if (element == ElementType::STEEL || element == ElementType::EARTH)
            && has_status(StatusEffectType::FREEZE, enemy)
        {
            enemy
                .status_effects
                .retain(|s| s.effect_type != StatusEffectType::FREEZE);
            if element == ElementType::STEEL {
                Self::apply_status_effect(
                    registry,
                    enemy,
                    StatusEffectPayload {
                        effect_type: StatusEffectType::SUNDER,
                        duration: 4.0,
                        value: 0.3,
                    },
                );
            } else {
                Self::apply_status_effect(
                    registry,
                    enemy,
                    StatusEffectPayload {
                        effect_type: StatusEffectType::SLOW,
                        duration: 3.0,
                        value: 0.45,
                    },
                );
            }
        }

        // 6. CORROSION: SUNDER + POISON
        if element == ElementType::POISON && has_status(StatusEffectType::SUNDER, enemy) {
            let existing = enemy
                .status_effects
                .iter()
                .find(|s| s.effect_type == StatusEffectType::POISON)
                .map(|s| s.value)
                .unwrap_or(0.0);
            let new_stacks = if existing > 0.0 {
                (existing + 2.0).min(3.0)
            } else {
                2.0
            };
            Self::apply_status_effect(
                registry,
                enemy,
                StatusEffectPayload {
                    effect_type: StatusEffectType::POISON,
                    duration: 5.0,
                    value: new_stacks,
                },
            );
        }

        // 7. SWIRL: BURN + WIND
        if element == ElementType::WIND && has_status(StatusEffectType::BURN, enemy) {
            Self::apply_knockback(registry, enemy, 10.0);
            if let Some(burn) = enemy
                .status_effects
                .iter_mut()
                .find(|s| s.effect_type == StatusEffectType::BURN)
            {
                burn.duration = burn.duration.max(3.5);
            }
        }

        // 8. ABYSSAL_SOUL: CURSE + GHOST
        if element == ElementType::GHOST && has_status(StatusEffectType::CURSE, enemy) {
            Self::apply_knockback(registry, enemy, 15.0);
            Self::apply_status_effect(
                registry,
                enemy,
                StatusEffectPayload {
                    effect_type: StatusEffectType::SoulDrain,
                    duration: 4.5,
                    value: 0.25,
                },
            );
        }
    }

    pub fn get_crowd_control_modifiers(
        registry: &GameConfigRegistry,
        enemy: &EnemyEntity,
    ) -> TierCCConfig {
        let tier = if enemy.tags.iter().any(|t| t == "BOSS") {
            EnemyTierCategory::BOSS
        } else if enemy.tags.iter().any(|t| t == "ELITE") {
            EnemyTierCategory::ELITE
        } else {
            EnemyTierCategory::NORMAL
        };

        let base_cfg = registry.get_cc_config(tier);
        let custom = enemy.cc_resistance.as_ref();

        TierCCConfig {
            hard_cc: CrowdControlModifiers {
                effect_efficiency: custom
                    .and_then(|c| c.hard_cc)
                    .and_then(|h| h.effect_efficiency)
                    .unwrap_or(base_cfg.hard_cc.effect_efficiency),
                duration_efficiency: custom
                    .and_then(|c| c.hard_cc)
                    .and_then(|h| h.duration_efficiency)
                    .unwrap_or(base_cfg.hard_cc.duration_efficiency),
            },
            soft_cc: CrowdControlModifiers {
                effect_efficiency: custom
                    .and_then(|c| c.soft_cc)
                    .and_then(|s| s.effect_efficiency)
                    .unwrap_or(base_cfg.soft_cc.effect_efficiency),
                duration_efficiency: custom
                    .and_then(|c| c.soft_cc)
                    .and_then(|s| s.duration_efficiency)
                    .unwrap_or(base_cfg.soft_cc.duration_efficiency),
            },
        }
    }

    pub fn apply_knockback(
        registry: &GameConfigRegistry,
        enemy: &mut EnemyEntity,
        base_distance: f32,
    ) -> f32 {
        let cc = Self::get_crowd_control_modifiers(registry, enemy);
        if cc.hard_cc.effect_efficiency <= 0.0 || cc.hard_cc.duration_efficiency <= 0.0 {
            return 0.0;
        }
        let actual_dist = base_distance * cc.hard_cc.effect_efficiency;
        if actual_dist > 0.0 {
            enemy.path_distance = (enemy.path_distance - actual_dist).max(0.0);
        }
        actual_dist
    }

    pub fn is_enemy_stunned_or_frozen(enemy: &EnemyEntity) -> bool {
        enemy.status_effects.iter().any(|s| {
            s.effect_type == StatusEffectType::FREEZE || s.effect_type == StatusEffectType::SHOCK
        })
    }

    pub fn get_enemy_attack_speed_multiplier(
        registry: &GameConfigRegistry,
        enemy: &EnemyEntity,
    ) -> f32 {
        let mut mult: f32 = 1.0;
        if enemy
            .status_effects
            .iter()
            .any(|s| s.effect_type == StatusEffectType::POISON)
        {
            let red = registry
                .element_combat_stats
                .get(&ElementType::POISON)
                .and_then(|s| s.attack_speed_reduction)
                .unwrap_or(0.2);
            mult = mult.min(1.0 - red);
        }
        if enemy
            .status_effects
            .iter()
            .any(|s| s.effect_type == StatusEffectType::CHARM)
        {
            let red = registry
                .element_combat_stats
                .get(&ElementType::FAIRY)
                .and_then(|s| s.attack_speed_reduction)
                .unwrap_or(0.3);
            mult = mult.min(1.0 - red);
        }
        mult
    }

    pub fn get_soldier_elements(soldier: &SoldierEntity) -> Vec<ElementType> {
        let mut elements = vec![soldier.element];
        if let Some(sec) = soldier.secondary_element {
            if !elements.contains(&sec) {
                elements.push(sec);
            }
        }
        if soldier.is_spirit.unwrap_or(false) && !elements.contains(&ElementType::GHOST) {
            elements.push(ElementType::GHOST);
        }
        if let Some(ref buffed) = soldier.buffed_elements {
            for &b in buffed {
                if !elements.contains(&b) {
                    elements.push(b);
                }
            }
        }
        elements
    }

    pub fn calculate_soldier_defensive_multiplier(
        registry: &GameConfigRegistry,
        attacker_elem: ElementType,
        soldier: &SoldierEntity,
    ) -> (f32, f32, f32) {
        let soldier_elements = Self::get_soldier_elements(soldier);
        let mut matchup_mult_f64 = 1.0f64;

        for s_elem in soldier_elements {
            matchup_mult_f64 *= registry.get_matchup(attacker_elem, s_elem) as f64;
        }

        let matchup_mult =
            (((matchup_mult_f64.clamp(0.1, 3.0) * 100.0 + 1e-4).round()) / 100.0) as f32;

        let reduction = if attacker_elem == ElementType::PHYSICAL {
            soldier.armor.clamp(0.0, 0.9)
        } else {
            soldier.magic_resist.clamp(0.0, 0.9)
        };

        let intake_ratio = (matchup_mult * (1.0 - reduction) * 100.0).round() / 100.0;
        (matchup_mult, reduction, intake_ratio)
    }

    pub fn calculate_enemy_damage_to_soldier_detailed(
        registry: &GameConfigRegistry,
        enemy: &EnemyEntity,
        soldier: &SoldierEntity,
    ) -> EnemyToSoldierDamageResult {
        let has_dragon_awe = enemy
            .status_effects
            .iter()
            .any(|s| s.effect_type == StatusEffectType::DragonAwe);
        let mut base_enemy_dmg = enemy.damage;
        if has_dragon_awe {
            let red = registry
                .element_combat_stats
                .get(&ElementType::DRAGON)
                .and_then(|s| s.enemy_damage_reduction)
                .unwrap_or(0.25);
            base_enemy_dmg *= 1.0 - red;
        }

        let primary_element = enemy.elemental_profile.primary_element;
        let (p_mult, p_red, _) =
            Self::calculate_soldier_defensive_multiplier(registry, primary_element, soldier);
        let primary_damage = (base_enemy_dmg * p_mult * (1.0 - p_red)).round().max(1.0);

        let mut secondary_damage = 0.0;
        let secondary_element = enemy.elemental_profile.secondary_element;
        if let Some(sec_elem) = secondary_element {
            let (s_mult, s_red, _) =
                Self::calculate_soldier_defensive_multiplier(registry, sec_elem, soldier);
            secondary_damage = (base_enemy_dmg * s_mult * (1.0 - s_red)).round().max(1.0);
        }

        let final_damage = primary_damage + secondary_damage;
        let total_base = if secondary_element.is_some() {
            base_enemy_dmg * 2.0
        } else {
            base_enemy_dmg
        };
        let combined_multiplier = if total_base > 0.0 {
            final_damage / total_base
        } else {
            1.0
        };

        let label = if combined_multiplier >= 1.4 {
            Some("KHẮC HỆ!".to_string())
        } else if combined_multiplier <= 0.6 {
            Some("KHÁNG!".to_string())
        } else {
            None
        };

        EnemyToSoldierDamageResult {
            final_damage,
            primary_damage,
            secondary_damage,
            primary_element,
            secondary_element,
            multiplier: combined_multiplier,
            label,
        }
    }

    pub fn apply_status_effect(
        registry: &GameConfigRegistry,
        enemy: &mut EnemyEntity,
        payload: StatusEffectPayload,
    ) {
        let cc = Self::get_crowd_control_modifiers(registry, enemy);
        let mut final_duration = payload.duration;
        let mut final_value = payload.value;

        if payload.effect_type.is_hard_cc() {
            if cc.hard_cc.duration_efficiency <= 0.0 || cc.hard_cc.effect_efficiency <= 0.0 {
                return;
            }
            final_duration *= cc.hard_cc.duration_efficiency;
            final_value *= cc.hard_cc.effect_efficiency;
        } else if payload.effect_type.is_soft_cc() {
            if cc.soft_cc.duration_efficiency <= 0.0 || cc.soft_cc.effect_efficiency <= 0.0 {
                return;
            }
            final_duration *= cc.soft_cc.duration_efficiency;
            final_value *= cc.soft_cc.effect_efficiency;
        }

        if let Some(existing) = enemy
            .status_effects
            .iter_mut()
            .find(|s| s.effect_type == payload.effect_type)
        {
            existing.duration = existing.duration.max(final_duration);
            existing.value = existing.value.max(final_value);
        } else {
            enemy.status_effects.push(StatusEffect {
                effect_type: payload.effect_type,
                duration: final_duration,
                value: final_value,
                tick_timer: 0.0,
            });
        }
    }

    pub fn update_status_effects<F>(
        registry: &GameConfigRegistry,
        global_dmg_mult: f32,
        enemy: &mut EnemyEntity,
        dt: f32,
        mut on_dot_damage: F,
    ) where
        F: FnMut(f32, ElementType),
    {
        let mut speed_mult: f32 = 1.0;

        for i in (0..enemy.status_effects.len()).rev() {
            enemy.status_effects[i].duration -= dt;
            let eff_type = enemy.status_effects[i].effect_type;
            let eff_val = enemy.status_effects[i].value;

            match eff_type {
                StatusEffectType::BURN => {
                    enemy.status_effects[i].tick_timer += dt;
                    let tick_int = registry
                        .element_combat_stats
                        .get(&ElementType::FIRE)
                        .and_then(|s| s.dot_tick_interval)
                        .unwrap_or(0.5);
                    if enemy.status_effects[i].tick_timer >= tick_int {
                        enemy.status_effects[i].tick_timer = 0.0;
                        let scaled_dmg = (eff_val * global_dmg_mult).round().max(1.0);
                        on_dot_damage(scaled_dmg, ElementType::FIRE);
                    }
                }
                StatusEffectType::POISON => {
                    enemy.status_effects[i].tick_timer += dt;
                    let poison_stats = registry.element_combat_stats.get(&ElementType::POISON);
                    let tick_int = poison_stats
                        .and_then(|s| s.dot_tick_interval)
                        .unwrap_or(0.5);
                    if enemy.status_effects[i].tick_timer >= tick_int {
                        enemy.status_effects[i].tick_timer = 0.0;
                        let stacks = eff_val.max(1.0);
                        let dmg_per_stack =
                            poison_stats.and_then(|s| s.damage_per_stack).unwrap_or(4.0);
                        let min_dmg = poison_stats.and_then(|s| s.dot_min_damage).unwrap_or(3.0);
                        let poison_dmg = (stacks * dmg_per_stack * global_dmg_mult)
                            .round()
                            .max(min_dmg);
                        on_dot_damage(poison_dmg, ElementType::POISON);
                    }
                }
                StatusEffectType::SLOW | StatusEffectType::CHARM => {
                    speed_mult = speed_mult.min(1.0 - eff_val);
                }
                StatusEffectType::FREEZE | StatusEffectType::ROOT | StatusEffectType::SHOCK => {
                    speed_mult = 0.0;
                }
                _ => {}
            }

            if enemy.status_effects[i].duration <= 0.0 {
                enemy.status_effects.remove(i);
            }
        }

        let has_buffs = enemy
            .damage_reduction_buffs
            .as_ref()
            .map(|b| !b.is_empty())
            .unwrap_or(false);
        if has_buffs {
            if let Some(ref mut buffs) = enemy.damage_reduction_buffs {
                for i in (0..buffs.len()).rev() {
                    buffs[i].duration -= dt;
                    if buffs[i].duration <= 0.0 {
                        buffs.remove(i);
                    }
                }
            }
            Self::sync_effective_damage_reduction(enemy);
        } else if let Some(timer) = enemy.damage_reduction_timer.as_mut() {
            if *timer > 0.0 {
                *timer -= dt;
                if *timer <= 0.0 {
                    *timer = 0.0;
                    enemy.damage_reduction_ratio = Some(0.0);
                }
            }
        }

        enemy.speed = enemy.base_speed * speed_mult.max(0.0);
    }

    pub fn apply_damage_reduction(enemy: &mut EnemyEntity, ratio: f32, duration: f32) {
        let clamped_ratio = ratio.clamp(0.0, 0.6);
        if clamped_ratio <= 0.0 || duration <= 0.0 {
            return;
        }

        if enemy.damage_reduction_buffs.is_none() {
            let mut list = Vec::new();
            if let (Some(r), Some(t)) = (enemy.damage_reduction_ratio, enemy.damage_reduction_timer)
            {
                if r > 0.0 && t > 0.0 {
                    list.push(DamageReductionBuff {
                        ratio: r,
                        duration: t,
                    });
                }
            }
            enemy.damage_reduction_buffs = Some(list);
        }

        if let Some(ref mut buffs) = enemy.damage_reduction_buffs {
            if let Some(existing) = buffs
                .iter_mut()
                .find(|b| (b.ratio - clamped_ratio).abs() < 0.001)
            {
                existing.duration = existing.duration.max(duration);
            } else {
                buffs.push(DamageReductionBuff {
                    ratio: clamped_ratio,
                    duration,
                });
            }
        }

        Self::sync_effective_damage_reduction(enemy);
    }

    pub fn sync_effective_damage_reduction(enemy: &mut EnemyEntity) {
        let Some(ref buffs) = enemy.damage_reduction_buffs else {
            enemy.damage_reduction_ratio = Some(0.0);
            enemy.damage_reduction_timer = Some(0.0);
            return;
        };

        if buffs.is_empty() {
            enemy.damage_reduction_ratio = Some(0.0);
            enemy.damage_reduction_timer = Some(0.0);
            return;
        }

        let mut best_ratio = 0.0;
        let mut best_timer = 0.0;

        for b in buffs {
            if b.duration > 0.0 {
                if b.ratio > best_ratio {
                    best_ratio = b.ratio;
                    best_timer = b.duration;
                } else if (b.ratio - best_ratio).abs() < 0.001 {
                    best_timer = best_timer.max(b.duration);
                }
            }
        }

        enemy.damage_reduction_ratio = Some(best_ratio);
        enemy.damage_reduction_timer = Some(best_timer);
    }

    pub fn get_effective_damage_reduction_ratio(enemy: &EnemyEntity) -> f32 {
        if let Some(ref buffs) = enemy.damage_reduction_buffs {
            if !buffs.is_empty() {
                let mut best = 0.0;
                for b in buffs {
                    if b.duration > 0.0 && b.ratio > best {
                        best = b.ratio;
                    }
                }
                return best;
            }
        }

        if let (Some(r), Some(t)) = (enemy.damage_reduction_ratio, enemy.damage_reduction_timer) {
            if t > 0.0 && r > 0.0 {
                return r;
            }
        }

        0.0
    }
}
