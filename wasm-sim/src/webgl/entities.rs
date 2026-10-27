#![allow(dead_code)]

use super::primitives::parse_hex_color;
use super::WebGl2Renderer;
use crate::config::GameConfigRegistry;
use crate::types::{
    MovementType, SoldierCombatMode, SoldierState, SummonUnitArchetype, TowerBranch, TowerType,
};
use std::f32::consts::PI;

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum EnemyArchetype {
    Dragon,
    Serpent,
    AvianBat,
    Arachnid,
    TurtleBeast,
    SlimeCrystal,
    Colossus,
    WraithReaper,
    Siren,
    Humanoid,
}

pub fn get_enemy_archetype(type_id: &str) -> EnemyArchetype {
    match type_id {
        "DARK_DRAGON_BOSS" | "WYVERN_RAIDER" | "DRAKE_WARRIOR" | "RIVER_DRAKE" => {
            EnemyArchetype::Dragon
        }
        "AQUA_SERPENT" | "SPARK_EEL" | "VOID_HYDRA_BOSS" => EnemyArchetype::Serpent,
        "WINGED_GARGOYLE"
        | "TOXIC_BAT"
        | "FAIRY_SPRITE"
        | "SERAPH_VALKYRIE"
        | "EMP_DRONE"
        | "ARCHANGEL_MONARCH_BOSS"
        | "CELESTIAL_FAIRY" => EnemyArchetype::AvianBat,
        "VENOM_ARACHNID" => EnemyArchetype::Arachnid,
        "MOSS_TURTLE" | "PLAGUE_LEVIATHAN" | "ABYSSAL_CRAB" => EnemyArchetype::TurtleBeast,
        "MAGMA_SLIME" | "EMBER_BLOB" | "ICE_SHARDLING" => EnemyArchetype::SlimeCrystal,
        "ROCK_GOLEM"
        | "FROST_CRYSTAL_GOLEM"
        | "IRON_COLOSSUS"
        | "CHRONO_DESTROYER_BOSS"
        | "ANCIENT_TREANT_BOSS"
        | "IRON_OVERLORD_BOSS"
        | "INFERNO_MONARCH_BOSS"
        | "GLACIAL_TITAN_BOSS" => EnemyArchetype::Colossus,
        "SHADOW_WRAITH" | "PHANTOM_REAPER" | "SPECTRAL_BANSHEE" | "HEX_DEGRADER"
        | "SOUL_EMPEROR_BOSS" => EnemyArchetype::WraithReaper,
        "STORM_CALLER_SIREN" | "TIDAL_PRIESTESS" | "TEMPEST_LEVIATHAN_BOSS" => {
            EnemyArchetype::Siren
        }
        _ => EnemyArchetype::Humanoid,
    }
}

impl WebGl2Renderer {
    pub(crate) fn render_roadside_tower(
        &mut self,
        registry: &GameConfigRegistry,
        tower: &crate::types::TowerEntity,
        is_selected: bool,
        anim_time: f32,
    ) {
        let x = tower.x;
        let y = tower.y;

        let base_fill = if is_selected {
            parse_hex_color("#1e40af", 1.0)
        } else {
            parse_hex_color("#334155", 1.0)
        };
        let base_stroke = if is_selected {
            parse_hex_color("#60a5fa", 1.0)
        } else {
            parse_hex_color("#64748b", 1.0)
        };
        self.draw_circle(x, y, 18.0, 20, base_fill);
        self.draw_ring(x, y, 18.0, 2.5, 20, base_stroke);

        if let Some(sec_el) = tower.secondary_element {
            if tower.tower_type != TowerType::MAGE {
                let ec = parse_hex_color(registry.get_element_color(sec_el), 0.9);
                self.draw_ring(x, y, 20.5, 1.8, 20, ec);
            }
        }

        if let Some(ref buffed) = tower.buffed_elements {
            if let Some(&b0) = buffed.first() {
                let bc = parse_hex_color(registry.get_element_color(b0), 0.85);
                self.draw_ring(x, y, 22.5 + (anim_time * 4.0).sin() * 1.5, 1.8, 20, bc);
            }
        }

        match tower.tower_type {
            TowerType::BARRACKS => {
                let c = if tower.tier == 4 && tower.branch == Some(TowerBranch::A) {
                    parse_hex_color("#fef08a", 1.0)
                } else {
                    parse_hex_color("#94a3b8", 1.0)
                };
                self.draw_rect(x - 12.0, y - 10.0, 24.0, 18.0, c);
                self.draw_rect(x - 4.0, y - 1.0, 8.0, 9.0, parse_hex_color("#1e293b", 1.0));
                self.draw_line(
                    x + 6.0,
                    y - 10.0,
                    x + 6.0,
                    y - 22.0,
                    2.0,
                    parse_hex_color("#ef4444", 1.0),
                );
            }
            TowerType::ARCHER => {
                let wood = parse_hex_color("#78350f", 1.0);
                self.draw_line(x - 9.0, y + 10.0, x - 6.0, y - 14.0, 3.0, wood);
                self.draw_line(x + 9.0, y + 10.0, x + 6.0, y - 14.0, 3.0, wood);
                self.draw_rect(
                    x - 11.0,
                    y - 16.0,
                    22.0,
                    5.0,
                    parse_hex_color("#92400e", 1.0),
                );
                let green = parse_hex_color("#10b981", 1.0);
                self.draw_circle(x, y - 22.0, 4.0, 10, green);
            }
            TowerType::MAGE => {
                let spire = parse_hex_color("#475569", 1.0);
                self.draw_triangle(x - 8.0, y + 8.0, x, y - 14.0, x + 8.0, y + 8.0, spire);
                let fy = y - 24.0 + (anim_time * 3.0).sin() * 3.0;
                let c1 = parse_hex_color(registry.get_element_color(tower.element), 1.0);
                if let Some(sec) = tower.secondary_element {
                    let c2 = parse_hex_color(registry.get_element_color(sec), 1.0);
                    let ang = anim_time * 3.0;
                    self.draw_circle(x + ang.cos() * 7.0, fy + ang.sin() * 3.0, 5.0, 12, c1);
                    self.draw_circle(
                        x + (ang + PI).cos() * 7.0,
                        fy + (ang + PI).sin() * 3.0,
                        5.0,
                        12,
                        c2,
                    );
                } else {
                    self.draw_circle(x, fy, 6.0, 12, c1);
                }
            }
            TowerType::ARTILLERY => {
                self.draw_circle(x, y - 2.0, 11.0, 16, parse_hex_color("#1e293b", 1.0));
                self.draw_rect(
                    x - 5.0,
                    y - 14.0,
                    10.0,
                    14.0,
                    parse_hex_color("#334155", 1.0),
                );
            }
            TowerType::DragonNest => {
                self.draw_circle(x, y, 13.0, 16, parse_hex_color("#7c2d12", 1.0));
                self.draw_circle(x, y - 4.0, 7.0, 14, parse_hex_color("#f97316", 1.0));
            }
            TowerType::FairyTree => {
                self.draw_rect(x - 4.0, y - 6.0, 8.0, 14.0, parse_hex_color("#78350f", 1.0));
                self.draw_circle(x, y - 12.0, 12.0, 16, parse_hex_color("#f472b6", 0.9));
            }
            TowerType::HeroicAltar => {
                self.draw_rect(
                    x - 10.0,
                    y - 8.0,
                    20.0,
                    16.0,
                    parse_hex_color("#312e81", 1.0),
                );
                self.draw_circle(
                    x,
                    y - 14.0 + (anim_time * 3.0).sin() * 2.0,
                    6.0,
                    14,
                    parse_hex_color("#818cf8", 0.95),
                );
            }
            _ => {}
        }

        // Tier pips
        let star_c = parse_hex_color("#facc15", 1.0);
        let tier_count = tower.tier as usize;
        let start_x = x - ((tier_count.saturating_sub(1)) as f32) * 4.5;
        for i in 0..tier_count {
            self.draw_circle(start_x + (i as f32) * 9.0, y + 16.0, 2.8, 8, star_c);
        }

        // Disabled overlay
        if tower.disabled_timer.unwrap_or(0.0) > 0.0 {
            self.draw_ring(x, y, 20.0, 2.5, 16, parse_hex_color("#facc15", 0.9));
        }
    }

    pub(crate) fn render_trap(
        &mut self,
        registry: &GameConfigRegistry,
        trap: &crate::types::TowerEntity,
        is_selected: bool,
        _anim_time: f32,
    ) {
        let x = trap.x;
        let y = trap.y;
        let elem_c = parse_hex_color(registry.get_element_color(trap.element), 0.85);
        self.draw_circle(x, y, 13.0, 14, parse_hex_color("#1e293b", 0.85));
        self.draw_ring(x, y, 13.0, if is_selected { 2.5 } else { 1.8 }, 14, elem_c);
        if trap.attack_cooldown <= 0.0 {
            self.draw_circle(x, y, 5.5, 10, elem_c);
        }
    }

    pub(crate) fn render_soldier(
        &mut self,
        registry: &GameConfigRegistry,
        s: &crate::types::SoldierEntity,
        anim_time: f32,
        alpha: f32,
    ) {
        let x = s.prev_x.map(|px| px + (s.x - px) * alpha).unwrap_or(s.x);
        let y = s.prev_y.map(|py| py + (s.y - py) * alpha).unwrap_or(s.y);

        if s.state == SoldierState::DEAD {
            let ratio = 1.0 - (s.respawn_timer / s.respawn_delay.max(0.1)).clamp(0.0, 1.0);
            self.draw_ring(x, y, 9.0, 2.0, 14, [0.58, 0.64, 0.72, 0.5]);
            self.draw_circle(x, y, 9.0 * ratio, 14, [0.22, 0.74, 0.97, 0.35]);
            return;
        }

        // Shadow
        self.draw_ellipse(x, y + 4.0, 9.0, 4.5, 12, [0.0, 0.0, 0.0, 0.35]);

        let is_spirit = s.is_spirit.unwrap_or(false);
        let body_alpha = if is_spirit {
            0.72 + (anim_time * 5.0).sin() * 0.15
        } else {
            1.0
        };

        let elem_col = if is_spirit {
            parse_hex_color("#818cf8", body_alpha)
        } else {
            parse_hex_color(registry.get_element_color(s.element), body_alpha)
        };

        let sec_col = if is_spirit {
            parse_hex_color("#c7d2fe", body_alpha)
        } else if let Some(sec) = s.secondary_element {
            parse_hex_color(registry.get_element_color(sec), body_alpha)
        } else {
            elem_col
        };

        let arch = s.archetype.unwrap_or(SummonUnitArchetype::SOLDIER);
        match arch {
            SummonUnitArchetype::DRAGON => {
                self.render_dragon_unit(s, x, y, anim_time, elem_col, sec_col, is_spirit);
            }
            SummonUnitArchetype::FAIRY => {
                self.render_fairy_unit(s, x, y, anim_time, elem_col, sec_col, is_spirit);
            }
            SummonUnitArchetype::SOLDIER => {
                self.render_stickman_soldier_unit(s, x, y, anim_time, elem_col, sec_col, is_spirit);
            }
        }

        // Health bar
        let hp_ratio = (s.hp / s.max_hp.max(1.0)).clamp(0.0, 1.0);
        let bw = 24.0;
        let bx = x - bw * 0.5;
        let by = y - 25.0;
        self.draw_rect(bx, by, bw, 3.5, [0.06, 0.09, 0.16, 0.85]);
        self.draw_rect(bx, by, bw * hp_ratio, 3.5, [0.13, 0.77, 0.37, 0.95]);
    }

    #[allow(clippy::too_many_arguments)]
    fn render_dragon_unit(
        &mut self,
        s: &crate::types::SoldierEntity,
        x: f32,
        base_y: f32,
        anim_time: f32,
        elem_col: [f32; 4],
        sec_col: [f32; 4],
        is_spirit: bool,
    ) {
        let hover = (anim_time * 5.0).sin() * 3.5;
        let y = base_y - 12.0 + hover;
        let facing = s.facing.unwrap_or(0.0);
        let cos_a = facing.cos();
        let sin_a = facing.sin();
        let tier = s.tier;
        let branch = s.branch;

        let rot = |ox: f32, oy: f32| -> (f32, f32) {
            (x + ox * cos_a - oy * sin_a, y + ox * sin_a + oy * cos_a)
        };

        // Ghostly summoning ring / aura for Spirit Dragon
        if is_spirit {
            let aura_col = [0.51, 0.55, 0.97, 0.5 + (anim_time * 6.0).sin() * 0.2];
            self.draw_ring(x, y, 18.0, 1.8, 18, aura_col);
        }

        // Flight & Tail flap animation
        let is_moving =
            s.state == SoldierState::MovingToEngage || s.state == SoldierState::MovingToRally;
        let flap_speed = if is_moving { 14.0 } else { 8.0 };
        let flap = (anim_time * flap_speed).sin() * 8.0;
        let tail_wiggle = (anim_time * (if is_moving { 10.0 } else { 6.0 })).sin() * 5.0;

        // Tail segments
        let (t0_x, t0_y) = rot(-6.0, 0.0);
        let (t1_x, t1_y) = rot(-14.0, tail_wiggle * 0.6);
        let (t2_x, t2_y) = rot(-22.0, tail_wiggle * 1.2);
        self.draw_line(t0_x, t0_y, t1_x, t1_y, 3.2, elem_col);
        self.draw_line(t1_x, t1_y, t2_x, t2_y, 2.5, elem_col);

        // Tail spade / fin
        let (sp0_x, sp0_y) = rot(-27.0, tail_wiggle * 1.2);
        let (sp1_x, sp1_y) = rot(-21.0, tail_wiggle * 1.2 - 5.0);
        let (sp2_x, sp2_y) = rot(-21.0, tail_wiggle * 1.2 + 5.0);
        self.draw_triangle(sp0_x, sp0_y, sp1_x, sp1_y, sp2_x, sp2_y, sec_col);

        // Tier 4A: Divine Golden Dragon (Halo & 4 Wings)
        if tier == 4 && branch == Some(TowerBranch::A) {
            let halo_col = [0.99, 0.94, 0.54, 0.85];
            self.draw_ring(x - cos_a * 6.0, y - sin_a * 6.0, 15.0, 2.0, 18, halo_col);
            let rear_flap = (anim_time * flap_speed + 0.8).sin() * 6.0;
            let (rw1_a, rw1_b) = rot(-8.0, -15.0 - rear_flap);
            let (rw2_a, rw2_b) = rot(-8.0, 15.0 + rear_flap);
            let (rw_c, rw_d) = rot(-6.0, 0.0);
            self.draw_triangle(
                rw_c,
                rw_d,
                rw1_a,
                rw1_b,
                rw_c - cos_a * 4.0,
                rw_d - sin_a * 4.0,
                halo_col,
            );
            self.draw_triangle(
                rw_c,
                rw_d,
                rw2_a,
                rw2_b,
                rw_c - cos_a * 4.0,
                rw_d - sin_a * 4.0,
                halo_col,
            );
        }

        // Tier 4B: Infernal Dread Dragon (Spine flames & magma spikes)
        if tier == 4 && branch == Some(TowerBranch::B) {
            let flame_col = [0.94, 0.25, 0.1, 0.9];
            for i in 0..3 {
                let off_x = -4.0 - (i as f32) * 5.0;
                let flame_h = 3.5 + (anim_time * 12.0 + (i as f32) * 2.0).sin().abs() * 3.5;
                let (f_base1_x, f_base1_y) = rot(off_x - 2.0, 0.0);
                let (f_base2_x, f_base2_y) = rot(off_x + 2.0, 0.0);
                let (f_tip_x, f_tip_y) = rot(off_x, -flame_h);
                self.draw_triangle(
                    f_base1_x, f_base1_y, f_tip_x, f_tip_y, f_base2_x, f_base2_y, flame_col,
                );
            }
        }

        // Left Wing (-Y in local coordinates)
        let wing_span = if tier >= 3 {
            22.0
        } else if tier == 2 {
            17.0
        } else {
            13.0
        };
        let (w_root1_x, w_root1_y) = rot(-2.0, -3.0);
        let (w_tip1_x, w_tip1_y) = rot(2.0, -wing_span - flap);
        let (w_back1_x, w_back1_y) = rot(-10.0, -12.0);
        self.draw_triangle(
            w_root1_x, w_root1_y, w_tip1_x, w_tip1_y, w_back1_x, w_back1_y, sec_col,
        );
        self.draw_line(w_root1_x, w_root1_y, w_tip1_x, w_tip1_y, 2.2, elem_col);

        // Right Wing (+Y in local coordinates)
        let (w_root2_x, w_root2_y) = rot(-2.0, 3.0);
        let (w_tip2_x, w_tip2_y) = rot(2.0, wing_span + flap);
        let (w_back2_x, w_back2_y) = rot(-10.0, 12.0);
        self.draw_triangle(
            w_root2_x, w_root2_y, w_tip2_x, w_tip2_y, w_back2_x, w_back2_y, sec_col,
        );
        self.draw_line(w_root2_x, w_root2_y, w_tip2_x, w_tip2_y, 2.2, elem_col);

        // Torso / Body (Aerodynamic Ellipse)
        let body_rx = if tier >= 3 { 9.5 } else { 7.5 };
        let body_ry = if tier >= 3 { 6.5 } else { 5.0 };
        self.draw_ellipse(x, y, body_rx, body_ry, 14, elem_col);

        // Neck & Head (+X forward)
        let (neck_x, neck_y) = rot(body_rx * 0.7, 0.0);
        let (head_x, head_y) = rot(body_rx * 1.5, 0.0);
        self.draw_line(neck_x, neck_y, head_x, head_y, 3.5, elem_col);
        let head_r = if tier >= 3 { 5.2 } else { 4.0 };
        self.draw_circle(head_x, head_y, head_r, 12, elem_col);

        // Horns
        let horn_len = if tier >= 3 { 9.5 } else { 6.0 };
        let horn_col = if tier == 4 && branch == Some(TowerBranch::A) {
            [0.99, 0.94, 0.54, 1.0]
        } else if tier == 4 && branch == Some(TowerBranch::B) {
            [0.94, 0.2, 0.1, 1.0]
        } else {
            sec_col
        };
        let (h1_x, h1_y) = rot(body_rx * 1.3 - horn_len * 0.6, -horn_len);
        let (h2_x, h2_y) = rot(body_rx * 1.3 - horn_len * 0.6, horn_len);
        self.draw_line(head_x, head_y, h1_x, h1_y, 2.2, horn_col);
        self.draw_line(head_x, head_y, h2_x, h2_y, 2.2, horn_col);

        // Glowing Dragon Eyes
        let eye_col = [1.0, 0.95, 0.3, 0.95];
        let (eye1_x, eye1_y) = rot(body_rx * 1.6, -1.8);
        let (eye2_x, eye2_y) = rot(body_rx * 1.6, 1.8);
        self.draw_circle(eye1_x, eye1_y, 1.3, 6, eye_col);
        self.draw_circle(eye2_x, eye2_y, 1.3, 6, eye_col);
    }

    #[allow(clippy::too_many_arguments)]
    fn render_fairy_unit(
        &mut self,
        s: &crate::types::SoldierEntity,
        x: f32,
        base_y: f32,
        anim_time: f32,
        elem_col: [f32; 4],
        sec_col: [f32; 4],
        is_spirit: bool,
    ) {
        let hover = (anim_time * 6.0).sin() * 3.5;
        let y = base_y - 10.0 + hover;
        let tier = s.tier;
        let branch = s.branch;
        let flutter = (anim_time * 18.0).sin() * 5.5;

        // Spirit glow
        if is_spirit {
            let aura_col = [0.51, 0.55, 0.97, 0.45 + (anim_time * 5.0).sin() * 0.2];
            self.draw_ring(x, y, 14.0, 1.5, 14, aura_col);
        }

        // Tier 4A: Celestial Queen Crown & Holy Halo
        if tier == 4 && branch == Some(TowerBranch::A) {
            let halo_col = [0.99, 0.94, 0.54, 0.85];
            self.draw_ring(x, y - 4.0, 15.0, 1.8, 16, halo_col);
            let scepter_top_y = y - 10.0;
            self.draw_line(x + 8.0, y + 4.0, x + 8.0, scepter_top_y, 1.8, halo_col);
            self.draw_circle(x + 8.0, scepter_top_y, 2.5, 8, [1.0, 1.0, 1.0, 0.95]);
        }

        // Tier 4B: Twilight Tempest - Orbiting Barrier Orbs & Arcane Circle
        if tier == 4 && branch == Some(TowerBranch::B) {
            self.draw_ring(x, base_y + 2.0, 11.0, 1.2, 12, sec_col);
            for i in 0..3 {
                let ang = anim_time * 4.0 + (i as f32) * (PI * 2.0 / 3.0);
                let ox = x + ang.cos() * 12.0;
                let oy = y + ang.sin() * 6.0;
                self.draw_circle(ox, oy, 2.2, 8, sec_col);
            }
        }

        // 4 Butterfly / Fairy wings
        let wing_w = if tier >= 3 { 14.0 } else { 10.0 };
        let wing_h = if tier >= 3 { 10.0 } else { 7.0 };

        // Upper Left Wing
        self.draw_triangle(
            x - 2.0,
            y - 2.0,
            x - wing_w,
            y - wing_h + flutter,
            x - 4.0,
            y - 8.0,
            sec_col,
        );
        // Upper Right Wing
        self.draw_triangle(
            x + 2.0,
            y - 2.0,
            x + wing_w,
            y - wing_h + flutter,
            x + 4.0,
            y - 8.0,
            sec_col,
        );
        // Lower Left Wing
        self.draw_triangle(
            x - 2.0,
            y,
            x - wing_w * 0.7,
            y + wing_h * 0.7 - flutter * 0.5,
            x - 2.0,
            y + 5.0,
            elem_col,
        );
        // Lower Right Wing
        self.draw_triangle(
            x + 2.0,
            y,
            x + wing_w * 0.7,
            y + wing_h * 0.7 - flutter * 0.5,
            x + 2.0,
            y + 5.0,
            elem_col,
        );

        // Core Glowing Body
        let body_r = if tier >= 3 { 5.5 } else { 4.5 };
        self.draw_circle(x, y, body_r, 14, elem_col);
        self.draw_circle(x, y, body_r * 0.5, 10, [1.0, 1.0, 1.0, 0.9]);

        // Tier 2+ Petal Skirt
        if tier >= 2 {
            self.draw_triangle(x - 4.0, y + 2.0, x, y + 9.0, x + 4.0, y + 2.0, sec_col);
        }

        // Tier 3+ Crown / Tiara
        if tier >= 3 {
            let crown_col = if branch == Some(TowerBranch::A) {
                [0.99, 0.94, 0.54, 1.0]
            } else {
                sec_col
            };
            self.draw_triangle(
                x - 3.0,
                y - body_r,
                x,
                y - body_r - 4.0,
                x + 3.0,
                y - body_r,
                crown_col,
            );
        }

        // Orbiting Stardust motes for Tier 2+
        if tier >= 2 && branch != Some(TowerBranch::B) {
            let spark_x = x + (anim_time * 3.0).cos() * 9.0;
            let spark_y = y + (anim_time * 3.0).sin() * 5.0;
            self.draw_circle(spark_x, spark_y, 1.8, 6, [1.0, 1.0, 1.0, 0.85]);
        }
    }

    #[allow(clippy::too_many_arguments)]
    fn render_stickman_soldier_unit(
        &mut self,
        s: &crate::types::SoldierEntity,
        x: f32,
        y: f32,
        anim_time: f32,
        elem_col: [f32; 4],
        sec_col: [f32; 4],
        is_spirit: bool,
    ) {
        let tier = s.tier;
        let branch = s.branch;
        let facing = s.facing.unwrap_or(0.0);
        let dir = if facing.abs() > PI * 0.5 { -1.0 } else { 1.0 };

        let is_moving =
            s.state == SoldierState::MovingToEngage || s.state == SoldierState::MovingToRally;
        let is_attacking = s.state == SoldierState::ATTACKING;
        let walk = if is_moving {
            (anim_time * 10.0).sin() * 5.0
        } else {
            0.0
        };
        let swing = if is_attacking {
            (anim_time * 14.0).sin() * 8.0
        } else {
            0.0
        };

        // 1. Runic Summoning Ring for Heroic Spirit
        if is_spirit {
            let spirit_aura = [0.51, 0.55, 0.97, 0.6 + (anim_time * 5.0).sin() * 0.2];
            self.draw_ring(x, y + 4.0, 13.0, 1.5, 16, spirit_aura);
            self.draw_line(x - 15.0, y + 4.0, x - 11.0, y + 4.0, 1.5, spirit_aura);
            self.draw_line(x + 11.0, y + 4.0, x + 15.0, y + 4.0, 1.5, spirit_aura);
        }

        // 2. Tier 4B Spartan Cape (Behind soldier)
        if tier == 4 && branch == Some(TowerBranch::B) {
            let cape_wave = (anim_time * 8.0).sin() * 4.0;
            let cape_col = [0.86, 0.15, 0.15, 0.95];
            self.draw_triangle(
                x - dir * 2.0,
                y - 10.0,
                x - dir * 13.0,
                y - 2.0 + cape_wave,
                x - dir * 9.0,
                y + 8.0 + cape_wave,
                cape_col,
            );
        }

        // 3. Tier 4A Paladin Holy Halo & Light Wings
        if tier == 4 && branch == Some(TowerBranch::A) {
            let halo_col = [0.99, 0.94, 0.54, 0.9];
            self.draw_ellipse(x, y - 23.0, 6.5, 2.5, 12, halo_col);
            let wing_aura = [0.99, 0.94, 0.54, 0.45];
            self.draw_triangle(
                x,
                y - 10.0,
                x - dir * 9.0,
                y - 16.0,
                x - dir * 6.0,
                y - 6.0,
                wing_aura,
            );
        }

        // 4. Stickman Skeleton
        let body_color = if is_spirit {
            elem_col
        } else if tier >= 3 {
            [0.95, 0.96, 0.98, 1.0]
        } else {
            [0.8, 0.84, 0.89, 1.0]
        };

        let head_y = y - 15.0;
        let head_r = if tier >= 3 { 5.0 } else { 4.5 };
        self.draw_circle(x, head_y, head_r, 12, body_color);

        // Spine
        self.draw_line(
            x,
            head_y + head_r,
            x,
            y - 2.0,
            if tier >= 3 { 2.8 } else { 2.2 },
            body_color,
        );

        // Helmet Crest / Spartan Plume
        if tier == 4 && branch == Some(TowerBranch::B) {
            self.draw_triangle(
                x - dir * 3.0,
                head_y - head_r,
                x,
                head_y - head_r - 6.0,
                x + dir * 3.0,
                head_y - head_r,
                [0.92, 0.18, 0.18, 1.0],
            );
        } else if tier >= 3 {
            let plume_col = if branch == Some(TowerBranch::A) {
                [0.23, 0.51, 0.96, 1.0]
            } else {
                sec_col
            };
            self.draw_triangle(
                x - dir * 2.5,
                head_y - head_r,
                x,
                head_y - head_r - 5.0,
                x + dir * 2.5,
                head_y - head_r,
                plume_col,
            );
        }

        // Legs with Walk Cycle
        let leg_thick = if tier >= 3 { 2.4 } else { 2.0 };
        self.draw_line(
            x,
            y - 2.0,
            x + dir * 4.0 + walk,
            y + 6.0,
            leg_thick,
            body_color,
        );
        self.draw_line(
            x,
            y - 2.0,
            x - dir * 4.0 - walk,
            y + 6.0,
            leg_thick,
            body_color,
        );

        // Arms & Weapons
        let is_ranged = s.combat_mode == SoldierCombatMode::RANGED;
        if is_ranged {
            let bow_x = x - dir * 4.0;
            let bow_col = [0.55, 0.32, 0.18, 1.0];
            self.draw_line(bow_x, y - 12.0, bow_x, y - 1.0, 2.2, bow_col);
            let arrow_end_x = x + dir * 8.0 + dir * swing;
            self.draw_line(bow_x, y - 6.5, arrow_end_x, y - 6.5, 1.8, elem_col);
            self.draw_triangle(
                arrow_end_x,
                y - 8.5,
                arrow_end_x + dir * 3.5,
                y - 6.5,
                arrow_end_x,
                y - 4.5,
                elem_col,
            );
        } else {
            // Melee Offhand Shield (Tier 2+)
            if tier >= 2 {
                let shield_x = x - dir * 6.5;
                let shield_y = y - 6.0;
                if tier == 4 && branch == Some(TowerBranch::A) {
                    self.draw_rect(
                        shield_x - 3.5,
                        shield_y - 5.0,
                        7.0,
                        10.0,
                        [0.99, 0.94, 0.54, 0.95],
                    );
                    self.draw_line(
                        shield_x,
                        shield_y - 4.0,
                        shield_x,
                        shield_y + 4.0,
                        1.8,
                        [1.0, 1.0, 1.0, 1.0],
                    );
                    self.draw_line(
                        shield_x - 2.5,
                        shield_y,
                        shield_x + 2.5,
                        shield_y,
                        1.8,
                        [1.0, 1.0, 1.0, 1.0],
                    );
                } else if tier == 4 && branch == Some(TowerBranch::B) {
                    self.draw_circle(shield_x, shield_y, 5.0, 12, [0.78, 0.45, 0.18, 1.0]);
                    self.draw_line(
                        shield_x - 2.0,
                        shield_y + 2.0,
                        shield_x,
                        shield_y - 3.0,
                        1.5,
                        [0.95, 0.85, 0.3, 1.0],
                    );
                    self.draw_line(
                        shield_x,
                        shield_y - 3.0,
                        shield_x + 2.0,
                        shield_y + 2.0,
                        1.5,
                        [0.95, 0.85, 0.3, 1.0],
                    );
                } else if tier == 3 {
                    self.draw_rect(
                        shield_x - 3.0,
                        shield_y - 5.0,
                        6.0,
                        9.0,
                        [0.38, 0.44, 0.52, 1.0],
                    );
                    self.draw_ring(shield_x, shield_y, 3.5, 1.2, 8, sec_col);
                } else {
                    self.draw_circle(shield_x, shield_y, 4.0, 10, [0.45, 0.5, 0.58, 1.0]);
                }
            }

            // Mainhand Weapon (+dir)
            let hand_x = x + dir * 3.0;
            let hand_y = y - 5.0;
            if tier == 4 && branch == Some(TowerBranch::B) {
                let tip_x = x + dir * 16.0 + dir * swing;
                let tip_y = y - 16.0 - swing;
                self.draw_line(
                    hand_x - dir * 4.0,
                    hand_y + 4.0,
                    tip_x,
                    tip_y,
                    2.5,
                    [0.65, 0.5, 0.35, 1.0],
                );
                self.draw_triangle(
                    tip_x - dir * 2.0,
                    tip_y + 2.0,
                    tip_x + dir * 5.0,
                    tip_y - 3.0,
                    tip_x + dir * 2.0,
                    tip_y + 4.0,
                    elem_col,
                );
            } else {
                let blade_len = if tier >= 3 {
                    13.0
                } else if tier == 2 {
                    10.0
                } else {
                    7.0
                };
                let tip_x = x + dir * (blade_len + 1.0) + dir * swing;
                let tip_y = y - blade_len - swing;
                self.draw_line(
                    hand_x,
                    hand_y,
                    tip_x,
                    tip_y,
                    if tier >= 3 { 2.6 } else { 2.0 },
                    elem_col,
                );
                self.draw_line(
                    hand_x - 1.5,
                    hand_y - 1.5,
                    hand_x + 1.5,
                    hand_y + 1.5,
                    2.0,
                    sec_col,
                );
            }
        }
    }

    pub(crate) fn render_enemy(
        &mut self,
        registry: &GameConfigRegistry,
        enemy: &crate::types::EnemyEntity,
        anim_time: f32,
        alpha: f32,
    ) {
        let x = enemy
            .prev_x
            .map(|px| {
                if (enemy.x - px).hypot(enemy.y - enemy.prev_y.unwrap_or(enemy.y)) > 80.0 {
                    enemy.x
                } else {
                    px + (enemy.x - px) * alpha
                }
            })
            .unwrap_or(enemy.x);
        let y = enemy
            .prev_y
            .map(|py| {
                if (enemy.x - enemy.prev_x.unwrap_or(enemy.x)).hypot(enemy.y - py) > 80.0 {
                    enemy.y
                } else {
                    py + (enemy.y - py) * alpha
                }
            })
            .unwrap_or(enemy.y);

        let size = enemy.size;
        let draw_y = y - enemy.altitude;
        let is_boss = enemy.tags.iter().any(|t| t == "BOSS");
        let is_elite = enemy.tags.iter().any(|t| t == "ELITE");
        let is_ghost = enemy.tags.iter().any(|t| t == "GHOST");

        // 1. Ground Shadow (scaled by altitude)
        let shadow_scale = (1.0 - enemy.altitude / 60.0).max(0.35);
        self.draw_ellipse(
            x,
            y + 4.0,
            size * 0.7 * shadow_scale,
            size * 0.35 * shadow_scale,
            12,
            [0.0, 0.0, 0.0, 0.35],
        );

        // 2. Water ripples for Swimming Enemy
        if enemy.movement_type == MovementType::SWIM {
            let ripple = (anim_time * 2.0) % 1.0;
            self.draw_ring(
                x,
                y + 2.0,
                size * 0.8 + ripple * 8.0,
                1.4,
                14,
                [0.38, 0.74, 0.98, 0.6],
            );
        }

        // 3. Ghost translucency / Spectral pulse
        let ghost_alpha = if is_ghost {
            0.68 + (anim_time * 5.0).sin() * 0.18
        } else {
            1.0
        };

        let elem_hex = registry.get_element_color(enemy.elemental_profile.primary_element);
        let elem_col = parse_hex_color(elem_hex, ghost_alpha);
        let sec_elem = enemy.elemental_profile.secondary_element;
        let sec_col = sec_elem
            .map(|e| parse_hex_color(registry.get_element_color(e), ghost_alpha))
            .unwrap_or(elem_col);

        // 4. Boss & Elite Auras
        if is_boss {
            let boss_aura = [0.95, 0.75, 0.1, 0.45 + (anim_time * 4.0).sin() * 0.2];
            self.draw_ring(x, y + 2.0, size * 1.25, 2.2, 22, boss_aura);
        } else if is_elite {
            let elite_aura = [0.85, 0.35, 0.95, 0.4 + (anim_time * 5.0).sin() * 0.15];
            self.draw_ring(x, y + 2.0, size * 1.05, 1.8, 18, elite_aura);
        }

        // 5. Dual Element Ring / Shield Aura
        if sec_elem.is_some() {
            self.draw_ring(
                x,
                draw_y - size * 0.2,
                size * 0.9 + (anim_time * 6.0).sin() * 2.0,
                1.6,
                18,
                [sec_col[0], sec_col[1], sec_col[2], 0.45],
            );
        }

        // Shield Rings (Armor / Magic)
        if enemy.armor_shield.unwrap_or(0.0) > 0.0 || enemy.magic_shield.unwrap_or(0.0) > 0.0 {
            let sc = if enemy.magic_shield.unwrap_or(0.0) > 0.0 {
                parse_hex_color("#c084fc", 0.85)
            } else {
                parse_hex_color("#e2e8f0", 0.85)
            };
            self.draw_ring(x, draw_y - size * 0.2, size * 1.05, 2.2, 20, sc);
        }

        // 6. Draw Body (Texture Atlas Quad first, or Full Procedural Archetype)
        let flip_x = enemy.facing.abs() > PI * 0.5;
        let dir = if flip_x { -1.0 } else { 1.0 };
        let frame_idx = (((anim_time * 8.0) as usize) % 4) + 1;
        let atlas_key = format!("ENEMY_{}_{}", enemy.type_id, frame_idx);
        let sprite_size = (size * 2.8).max(36.0);

        let drew_atlas = self.draw_atlas_quad(
            &atlas_key,
            x,
            draw_y - size * 0.3,
            sprite_size,
            sprite_size,
            flip_x,
            [1.0, 1.0, 1.0, ghost_alpha],
        );

        if !drew_atlas {
            self.render_enemy_procedural_archetype(
                enemy, x, draw_y, size, dir, anim_time, elem_col, sec_col, is_boss,
            );
        }

        // 7. Boss Crown Overlay if Boss
        if is_boss {
            let crown_y = draw_y - size * 0.95;
            let crown_col = [0.99, 0.88, 0.25, 0.95];
            self.draw_triangle(
                x - 8.0,
                crown_y,
                x - 5.0,
                crown_y - 6.0,
                x - 2.0,
                crown_y,
                crown_col,
            );
            self.draw_triangle(
                x - 3.0,
                crown_y,
                x,
                crown_y - 9.0,
                x + 3.0,
                crown_y,
                crown_col,
            );
            self.draw_triangle(
                x + 2.0,
                crown_y,
                x + 5.0,
                crown_y - 6.0,
                x + 8.0,
                crown_y,
                crown_col,
            );
        }

        // 8. Health Bar & Shields
        let bar_w = if is_boss {
            54.0
        } else if is_elite {
            36.0
        } else {
            26.0
        };
        let bar_h = if is_boss { 5.5 } else { 4.0 };
        let bx = x - bar_w * 0.5;
        let by = draw_y - size - 12.0;

        self.draw_rect(bx, by, bar_w, bar_h, [0.06, 0.09, 0.16, 0.88]);
        let hp_ratio = (enemy.hp / enemy.max_hp.max(1.0)).clamp(0.0, 1.0);
        let hp_col = if hp_ratio > 0.5 {
            [0.133, 0.773, 0.369, 0.95]
        } else if hp_ratio > 0.25 {
            [0.918, 0.702, 0.031, 0.95]
        } else {
            [0.937, 0.267, 0.267, 0.95]
        };
        self.draw_rect(bx, by, bar_w * hp_ratio, bar_h, hp_col);

        // Armor shield bar (silver)
        if let Some(armor_s) = enemy.armor_shield {
            if armor_s > 0.0 {
                let max_as = enemy.max_armor_shield.unwrap_or(armor_s).max(1.0);
                let as_ratio = (armor_s / max_as).clamp(0.0, 1.0);
                self.draw_rect(bx, by - 3.0, bar_w * as_ratio, 2.0, [0.85, 0.9, 0.95, 0.9]);
            }
        }
        // Magic shield bar (purple)
        if let Some(magic_s) = enemy.magic_shield {
            if magic_s > 0.0 {
                let max_ms = enemy.max_magic_shield.unwrap_or(magic_s).max(1.0);
                let ms_ratio = (magic_s / max_ms).clamp(0.0, 1.0);
                self.draw_rect(bx, by - 3.0, bar_w * ms_ratio, 2.0, [0.75, 0.52, 0.99, 0.9]);
            }
        }
    }

    #[allow(clippy::too_many_arguments)]
    fn render_enemy_procedural_archetype(
        &mut self,
        enemy: &crate::types::EnemyEntity,
        x: f32,
        draw_y: f32,
        size: f32,
        dir: f32,
        anim_time: f32,
        elem_col: [f32; 4],
        sec_col: [f32; 4],
        _is_boss: bool,
    ) {
        let arch = get_enemy_archetype(&enemy.type_id);
        match arch {
            EnemyArchetype::Dragon => {
                let flap = (anim_time * 10.0).sin() * 7.0;
                let body_y = draw_y - size * 0.2;
                self.draw_triangle(
                    x,
                    body_y,
                    x - dir * size * 1.4,
                    body_y - size * 1.1 + flap,
                    x - dir * size * 0.8,
                    body_y + size * 0.3,
                    sec_col,
                );
                self.draw_triangle(
                    x,
                    body_y,
                    x + dir * size * 1.4,
                    body_y - size * 1.1 + flap,
                    x + dir * size * 0.8,
                    body_y + size * 0.3,
                    sec_col,
                );
                self.draw_ellipse(x, body_y, size * 0.6, size * 0.45, 14, elem_col);
                let head_x = x + dir * size * 0.65;
                let head_y = body_y - size * 0.3;
                self.draw_circle(head_x, head_y, size * 0.35, 12, elem_col);
                self.draw_line(
                    head_x,
                    head_y - size * 0.2,
                    head_x - dir * size * 0.4,
                    head_y - size * 0.7,
                    2.5,
                    sec_col,
                );
                let tail_w = (anim_time * 8.0).sin() * size * 0.3;
                self.draw_line(
                    x - dir * size * 0.5,
                    body_y,
                    x - dir * size * 1.2,
                    body_y + tail_w,
                    2.5,
                    elem_col,
                );
                self.draw_triangle(
                    x - dir * size * 1.2,
                    body_y + tail_w - 4.0,
                    x - dir * size * 1.5,
                    body_y + tail_w,
                    x - dir * size * 1.2,
                    body_y + tail_w + 4.0,
                    sec_col,
                );
            }
            EnemyArchetype::Serpent => {
                let num_segs = if enemy.type_id == "VOID_HYDRA_BOSS" {
                    9
                } else {
                    7
                };
                let is_hydra = enemy.type_id == "VOID_HYDRA_BOSS";
                for i in (0..num_segs).rev() {
                    let t = (i as f32) / (num_segs as f32);
                    let seg_x = x - dir * (t * size * 1.8);
                    let wave = (anim_time * 8.0 + (i as f32) * 0.8).sin() * size * 0.35;
                    let seg_y = draw_y - size * 0.1 + wave;
                    let seg_r = size * (0.42 - t * 0.22);
                    let c = if i % 2 == 0 { elem_col } else { sec_col };
                    self.draw_circle(seg_x, seg_y, seg_r.max(2.0), 10, c);
                }
                let head_x = x + dir * size * 0.4;
                let head_y = draw_y - size * 0.2 + (anim_time * 8.0).sin() * size * 0.2;
                if is_hydra {
                    self.draw_circle(head_x, head_y - size * 0.4, size * 0.3, 10, elem_col);
                    self.draw_circle(head_x + dir * size * 0.2, head_y, size * 0.35, 12, elem_col);
                    self.draw_circle(head_x, head_y + size * 0.4, size * 0.3, 10, elem_col);
                } else {
                    self.draw_circle(head_x, head_y, size * 0.38, 12, elem_col);
                    self.draw_line(
                        head_x + dir * size * 0.35,
                        head_y,
                        head_x + dir * size * 0.65,
                        head_y,
                        1.5,
                        [0.95, 0.2, 0.2, 1.0],
                    );
                }
            }
            EnemyArchetype::AvianBat => {
                let flap = (anim_time * 12.0).sin() * size * 0.5;
                let body_y = draw_y - size * 0.3;
                self.draw_triangle(
                    x,
                    body_y,
                    x - dir * size * 1.3,
                    body_y - size * 0.8 + flap,
                    x - dir * size * 0.4,
                    body_y + size * 0.3,
                    sec_col,
                );
                self.draw_triangle(
                    x,
                    body_y,
                    x + dir * size * 1.3,
                    body_y - size * 0.8 + flap,
                    x + dir * size * 0.4,
                    body_y + size * 0.3,
                    sec_col,
                );
                self.draw_circle(x, body_y, size * 0.4, 12, elem_col);
                self.draw_circle(
                    x + dir * size * 0.2,
                    body_y - size * 0.1,
                    2.0,
                    6,
                    [1.0, 0.9, 0.2, 1.0],
                );
            }
            EnemyArchetype::Arachnid => {
                let body_y = draw_y - size * 0.1;
                self.draw_ellipse(
                    x - dir * size * 0.4,
                    body_y - size * 0.2,
                    size * 0.5,
                    size * 0.4,
                    12,
                    elem_col,
                );
                self.draw_circle(x + dir * size * 0.2, body_y, size * 0.3, 10, sec_col);
                for leg_i in 0..3 {
                    let gait = (anim_time * 12.0 + (leg_i as f32) * 1.8).sin() * size * 0.25;
                    let base_x = x - size * 0.2 + (leg_i as f32) * size * 0.25;
                    let knee_l_x = base_x - size * 0.6;
                    let knee_l_y = body_y - size * 0.4 + gait;
                    self.draw_line(base_x, body_y, knee_l_x, knee_l_y, 1.8, elem_col);
                    self.draw_line(
                        knee_l_x,
                        knee_l_y,
                        knee_l_x - size * 0.3,
                        body_y + size * 0.4,
                        1.8,
                        elem_col,
                    );
                    let knee_r_x = base_x + size * 0.6;
                    let knee_r_y = body_y - size * 0.4 - gait;
                    self.draw_line(base_x, body_y, knee_r_x, knee_r_y, 1.8, elem_col);
                    self.draw_line(
                        knee_r_x,
                        knee_r_y,
                        knee_r_x + size * 0.3,
                        body_y + size * 0.4,
                        1.8,
                        elem_col,
                    );
                }
            }
            EnemyArchetype::TurtleBeast => {
                let body_y = draw_y;
                self.draw_ellipse(
                    x,
                    body_y - size * 0.2,
                    size * 0.65,
                    size * 0.45,
                    14,
                    elem_col,
                );
                self.draw_ring(x, body_y - size * 0.2, size * 0.65, 2.2, 14, sec_col);
                let walk = (anim_time * 8.0).sin() * size * 0.2;
                self.draw_line(
                    x - size * 0.4,
                    body_y + size * 0.1,
                    x - size * 0.5 - walk,
                    body_y + size * 0.4,
                    3.0,
                    elem_col,
                );
                self.draw_line(
                    x + size * 0.4,
                    body_y + size * 0.1,
                    x + size * 0.5 + walk,
                    body_y + size * 0.4,
                    3.0,
                    elem_col,
                );
                self.draw_circle(
                    x + dir * size * 0.6,
                    body_y - size * 0.15,
                    size * 0.25,
                    10,
                    elem_col,
                );
            }
            EnemyArchetype::SlimeCrystal => {
                let squish = (anim_time * 6.0).sin() * 0.18;
                let body_rx = size * 0.55 * (1.0 + squish);
                let body_ry = size * 0.45 * (1.0 - squish);
                let body_y = draw_y + size * 0.1;
                self.draw_ellipse(x, body_y, body_rx, body_ry, 16, elem_col);
                let shard_y = body_y - size * 0.1 + (anim_time * 4.0).sin() * 3.0;
                self.draw_triangle(
                    x,
                    shard_y - size * 0.3,
                    x - size * 0.2,
                    shard_y,
                    x + size * 0.2,
                    shard_y,
                    sec_col,
                );
                self.draw_triangle(
                    x,
                    shard_y + size * 0.3,
                    x - size * 0.2,
                    shard_y,
                    x + size * 0.2,
                    shard_y,
                    sec_col,
                );
            }
            EnemyArchetype::Colossus => {
                let stride = (anim_time * 6.0).sin() * size * 0.2;
                let body_y = draw_y - size * 0.2;
                self.draw_rect(
                    x - size * 0.5,
                    body_y - size * 0.4,
                    size * 1.0,
                    size * 0.7,
                    elem_col,
                );
                self.draw_circle(
                    x - size * 0.55,
                    body_y - size * 0.35,
                    size * 0.28,
                    10,
                    sec_col,
                );
                self.draw_circle(
                    x + size * 0.55,
                    body_y - size * 0.35,
                    size * 0.28,
                    10,
                    sec_col,
                );
                self.draw_circle(x, body_y - size * 0.1, size * 0.22, 12, sec_col);
                self.draw_circle(x, body_y - size * 0.1, size * 0.1, 8, [1.0, 1.0, 1.0, 0.95]);
                self.draw_rect(
                    x - size * 0.4,
                    body_y + size * 0.3,
                    size * 0.3,
                    size * 0.4 + stride,
                    elem_col,
                );
                self.draw_rect(
                    x + size * 0.1,
                    body_y + size * 0.3,
                    size * 0.3,
                    size * 0.4 - stride,
                    elem_col,
                );
                self.draw_circle(x, body_y - size * 0.6, size * 0.28, 10, elem_col);
            }
            EnemyArchetype::WraithReaper => {
                let float_y = draw_y - size * 0.3 + (anim_time * 4.0).sin() * 4.0;
                let wave = (anim_time * 7.0).sin() * size * 0.2;
                self.draw_triangle(
                    x - size * 0.4,
                    float_y,
                    x,
                    float_y - size * 0.6,
                    x + size * 0.4,
                    float_y,
                    elem_col,
                );
                self.draw_triangle(
                    x - size * 0.35,
                    float_y,
                    x - dir * wave,
                    float_y + size * 0.8,
                    x + size * 0.35,
                    float_y,
                    elem_col,
                );
                self.draw_circle(
                    x + dir * size * 0.1,
                    float_y - size * 0.3,
                    size * 0.25,
                    10,
                    [0.08, 0.08, 0.12, 0.95],
                );
                self.draw_circle(
                    x + dir * size * 0.15,
                    float_y - size * 0.32,
                    2.0,
                    6,
                    sec_col,
                );
                let scythe_x = x + dir * size * 0.6;
                let scythe_y = float_y - size * 0.5;
                self.draw_line(
                    scythe_x - dir * size * 0.3,
                    float_y + size * 0.6,
                    scythe_x,
                    scythe_y,
                    2.2,
                    [0.3, 0.25, 0.2, 1.0],
                );
                self.draw_triangle(
                    scythe_x,
                    scythe_y,
                    scythe_x + dir * size * 0.7,
                    scythe_y - size * 0.3,
                    scythe_x + dir * size * 0.4,
                    scythe_y + size * 0.2,
                    sec_col,
                );
            }
            EnemyArchetype::Siren => {
                let body_y = draw_y - size * 0.3;
                let tail_wave = (anim_time * 8.0).sin() * size * 0.3;
                self.draw_circle(x, body_y - size * 0.3, size * 0.3, 10, elem_col);
                self.draw_line(
                    x,
                    body_y - size * 0.1,
                    x,
                    body_y + size * 0.2,
                    2.5,
                    elem_col,
                );
                self.draw_line(
                    x,
                    body_y + size * 0.2,
                    x - dir * tail_wave,
                    body_y + size * 0.6,
                    3.2,
                    sec_col,
                );
                self.draw_triangle(
                    x - dir * tail_wave,
                    body_y + size * 0.6,
                    x - dir * tail_wave - dir * size * 0.3,
                    body_y + size * 0.9,
                    x - dir * tail_wave + dir * size * 0.3,
                    body_y + size * 0.9,
                    sec_col,
                );
            }
            EnemyArchetype::Humanoid => {
                let stride = (anim_time * 10.0).sin() * size * 0.25;
                let body_y = draw_y - size * 0.1;
                let head_y = body_y - size * 0.55;
                self.draw_circle(x, head_y, size * 0.35, 12, elem_col);
                self.draw_line(
                    x,
                    head_y + size * 0.2,
                    x,
                    body_y + size * 0.15,
                    (size * 0.18).max(2.2),
                    elem_col,
                );
                self.draw_line(
                    x,
                    body_y + size * 0.15,
                    x - dir * stride,
                    body_y + size * 0.5,
                    2.2,
                    elem_col,
                );
                self.draw_line(
                    x,
                    body_y + size * 0.15,
                    x + dir * stride,
                    body_y + size * 0.5,
                    2.2,
                    elem_col,
                );
                let swing = (anim_time * 12.0).sin() * size * 0.3;
                self.draw_line(
                    x + dir * size * 0.2,
                    body_y - size * 0.1,
                    x + dir * size * 0.7 + dir * swing,
                    body_y - size * 0.5 - swing,
                    2.2,
                    sec_col,
                );
            }
        }
    }
}
