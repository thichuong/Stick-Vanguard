#![allow(dead_code)]

use super::primitives::{parse_element_str, parse_hex_color};
use super::WebGl2Renderer;
use crate::config::GameConfigRegistry;
use crate::types::{
    EnemyState, MovementType, SoldierCombatMode, SoldierState, SummonUnitArchetype, TowerBranch,
};

impl WebGl2Renderer {
    pub fn render_codex_enemy_preview(
        &mut self,
        registry: &GameConfigRegistry,
        type_id: &str,
        anim_time: f32,
        width: f32,
        height: f32,
    ) -> bool {
        let Some(bp) = registry.enemies.get(type_id) else {
            return false;
        };

        self.width = width;
        self.height = height;
        self.color_vertices.clear();
        self.tex_vertices.clear();

        let cx = width * 0.5;
        let is_boss = bp.tags.iter().any(|t| t == "BOSS");
        let is_flying = bp.movement_type == MovementType::FLY;
        let is_swimmer = bp.movement_type == MovementType::SWIM;
        let cy = if is_boss {
            height * 0.74
        } else {
            height * 0.70
        };
        let alt = if is_flying {
            if is_boss {
                26.0
            } else {
                22.0
            }
        } else {
            0.0
        };

        // 1. Ambient radial element glow
        let elem_color_hex = registry.get_element_color(bp.elemental_profile.primary_element);
        let glow_col = parse_hex_color(elem_color_hex, 0.22);
        self.draw_circle(cx, cy - 20.0, 60.0, 24, glow_col);

        // 2. Floor pedestal line
        let floor_col = if is_swimmer {
            parse_hex_color("#38bdf8", 0.45)
        } else {
            parse_hex_color("#475569", 0.45)
        };
        self.draw_line(cx - 75.0, cy + 8.0, cx + 75.0, cy + 8.0, 1.5, floor_col);

        // 3. Mock enemy entity for render_enemy
        let mock = crate::types::EnemyEntity {
            id: "codex_preview".to_string(),
            type_id: type_id.to_string(),
            x: cx,
            y: cy,
            size: bp.size,
            altitude: alt,
            movement_type: bp.movement_type,
            navigation_mode: bp.navigation_mode,
            elemental_profile: bp.elemental_profile.clone(),
            tags: bp.tags.clone(),
            hp: bp.hp,
            max_hp: bp.hp,
            speed: bp.speed,
            base_speed: bp.speed,
            damage: bp.damage,
            attack_speed: bp.attack_speed,
            reward_gold: bp.reward_gold,
            path_distance: 0.0,
            path_total_length: 100.0,
            state: if is_flying {
                EnemyState::FLYING
            } else if is_swimmer {
                EnemyState::SWIMMING
            } else {
                EnemyState::WALKING
            },
            facing: 0.0,
            ..Default::default()
        };

        self.render_enemy(registry, &mock, anim_time, 1.0);
        self.flush();
        true
    }

    pub fn render_codex_soldier_preview(
        &mut self,
        registry: &GameConfigRegistry,
        soldier_type: &str,
        stance: &str,
        anim_time: f32,
        width: f32,
        height: f32,
    ) -> bool {
        self.width = width;
        self.height = height;
        self.color_vertices.clear();
        self.tex_vertices.clear();

        let cx = width * 0.5;
        let cy = height * 0.68;

        let parts: Vec<&str> = soldier_type.split('|').collect();
        let key_part = parts.first().copied().unwrap_or(soldier_type);
        let elem_part = parts.get(1).copied();

        let mut tier: u8 = 1;
        let mut branch: Option<TowerBranch> = None;
        if key_part.contains("_4_A") || key_part.contains("4_A") {
            tier = 4;
            branch = Some(TowerBranch::A);
        } else if key_part.contains("_4_B") || key_part.contains("4_B") {
            tier = 4;
            branch = Some(TowerBranch::B);
        } else if key_part.contains("_3") || key_part.contains("3") {
            tier = 3;
        } else if key_part.contains("_2") || key_part.contains("2") {
            tier = 2;
        }

        let (arch, default_elem, is_spirit) = if key_part.contains("DRAGON") {
            (
                SummonUnitArchetype::DRAGON,
                crate::types::ElementType::FIRE,
                false,
            )
        } else if key_part.contains("FAIRY") {
            (
                SummonUnitArchetype::FAIRY,
                crate::types::ElementType::LIGHT,
                false,
            )
        } else if key_part.contains("HEROIC") || key_part.contains("SPIRIT") {
            (
                SummonUnitArchetype::SOLDIER,
                crate::types::ElementType::GHOST,
                true,
            )
        } else {
            (
                SummonUnitArchetype::SOLDIER,
                crate::types::ElementType::PHYSICAL,
                false,
            )
        };

        let elem = elem_part
            .and_then(parse_element_str)
            .unwrap_or(default_elem);

        let mode = if stance.eq_ignore_ascii_case("RANGED") {
            SoldierCombatMode::RANGED
        } else {
            SoldierCombatMode::MELEE
        };

        let elem_hex = registry.get_element_color(elem);
        let glow_col = parse_hex_color(elem_hex, 0.25);
        self.draw_circle(cx, cy - 16.0, 52.0, 22, glow_col);

        let floor_col = parse_hex_color("#475569", 0.45);
        self.draw_line(cx - 65.0, cy + 8.0, cx + 65.0, cy + 8.0, 1.5, floor_col);

        let mock = crate::types::SoldierEntity {
            id: "codex_soldier".to_string(),
            tower_id: "preview_tower".to_string(),
            x: cx,
            y: cy,
            hp: 200.0,
            max_hp: 200.0,
            element: elem,
            combat_mode: mode,
            archetype: Some(arch),
            is_spirit: Some(is_spirit),
            tier,
            branch,
            facing: Some(0.0),
            state: SoldierState::IDLE,
            ..Default::default()
        };

        self.render_soldier(registry, &mock, anim_time, 1.0);
        self.flush();
        true
    }
}
