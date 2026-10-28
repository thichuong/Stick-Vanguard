#![allow(dead_code)]

pub mod arachnid;
pub mod avian_bat;
pub mod colossus;
pub mod dragon;
pub mod humanoid;
pub mod serpent;
pub mod siren;
pub mod slime_crystal;
pub mod turtle_beast;
pub mod wraith_reaper;

use crate::config::GameConfigRegistry;
use crate::types::{EnemyEntity, MovementType};
use crate::webgl::primitives::element_color_rgba;
use crate::webgl::WebGl2Renderer;
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
    pub(crate) fn render_enemy(
        &mut self,
        registry: &GameConfigRegistry,
        enemy: &EnemyEntity,
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
            24,
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
                28,
                [0.38, 0.74, 0.98, 0.6],
            );
        }

        // 3. Ghost translucency / Spectral pulse
        let ghost_alpha = if is_ghost {
            0.68 + (anim_time * 5.0).sin() * 0.18
        } else {
            1.0
        };

        let elem_col = element_color_rgba(
            registry,
            enemy.elemental_profile.primary_element,
            ghost_alpha,
        );
        let sec_elem = enemy.elemental_profile.secondary_element;
        let sec_col = sec_elem
            .map(|e| element_color_rgba(registry, e, ghost_alpha))
            .unwrap_or(elem_col);

        // 4. Boss & Elite Auras
        if is_boss {
            let boss_aura = [0.95, 0.75, 0.1, 0.45 + (anim_time * 4.0).sin() * 0.2];
            self.draw_ring(x, y + 2.0, size * 1.25, 2.2, 48, boss_aura);
        } else if is_elite {
            let elite_aura = [0.85, 0.35, 0.95, 0.4 + (anim_time * 5.0).sin() * 0.15];
            self.draw_ring(x, y + 2.0, size * 1.05, 1.8, 36, elite_aura);
        }

        // 5. Dual Element Ring / Shield Aura
        if sec_elem.is_some() {
            self.draw_ring(
                x,
                draw_y - size * 0.2,
                size * 0.9 + (anim_time * 6.0).sin() * 2.0,
                1.6,
                36,
                [sec_col[0], sec_col[1], sec_col[2], 0.45],
            );
        }

        // Shield Rings (Armor / Magic)
        if enemy.armor_shield.unwrap_or(0.0) > 0.0 || enemy.magic_shield.unwrap_or(0.0) > 0.0 {
            let sc = if enemy.magic_shield.unwrap_or(0.0) > 0.0 {
                [0.753, 0.518, 0.988, 0.85]
            } else {
                [0.886, 0.910, 0.941, 0.85]
            };
            self.draw_ring(x, draw_y - size * 0.2, size * 1.05, 2.2, 48, sc);
        }

        // 6. Draw Body (Modular WebGL2 Procedural Archetypes)
        let flip_x = enemy.facing.abs() > PI * 0.5;
        let dir = if flip_x { -1.0 } else { 1.0 };
        self.render_enemy_procedural_archetype(
            enemy, x, draw_y, size, dir, anim_time, elem_col, sec_col, is_boss,
        );

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

        self.draw_rounded_rect(bx, by, bar_w, bar_h, bar_h * 0.5, [0.06, 0.09, 0.16, 0.88]);
        let hp_ratio = (enemy.hp / enemy.max_hp.max(1.0)).clamp(0.0, 1.0);
        let hp_col = if hp_ratio > 0.5 {
            [0.133, 0.773, 0.369, 0.95]
        } else if hp_ratio > 0.25 {
            [0.918, 0.702, 0.031, 0.95]
        } else {
            [0.937, 0.267, 0.267, 0.95]
        };
        self.draw_rounded_rect(
            bx,
            by,
            (bar_w * hp_ratio).max(1.0),
            bar_h,
            bar_h * 0.5,
            hp_col,
        );

        // Armor shield bar (silver, rounded pill)
        if let Some(armor_s) = enemy.armor_shield {
            if armor_s > 0.0 {
                let max_as = enemy.max_armor_shield.unwrap_or(armor_s).max(1.0);
                let as_ratio = (armor_s / max_as).clamp(0.0, 1.0);
                self.draw_rounded_rect(
                    bx,
                    by - 3.0,
                    (bar_w * as_ratio).max(1.0),
                    2.0,
                    1.0,
                    [0.85, 0.9, 0.95, 0.9],
                );
            }
        }
        // Magic shield bar (purple, rounded pill)
        if let Some(magic_s) = enemy.magic_shield {
            if magic_s > 0.0 {
                let max_ms = enemy.max_magic_shield.unwrap_or(magic_s).max(1.0);
                let ms_ratio = (magic_s / max_ms).clamp(0.0, 1.0);
                self.draw_rounded_rect(
                    bx,
                    by - 3.0,
                    (bar_w * ms_ratio).max(1.0),
                    2.0,
                    1.0,
                    [0.75, 0.52, 0.99, 0.9],
                );
            }
        }
    }

    #[allow(clippy::too_many_arguments)]
    fn render_enemy_procedural_archetype(
        &mut self,
        enemy: &EnemyEntity,
        x: f32,
        draw_y: f32,
        size: f32,
        dir: f32,
        anim_time: f32,
        elem_col: [f32; 4],
        sec_col: [f32; 4],
        is_boss: bool,
    ) {
        let arch = get_enemy_archetype(&enemy.type_id);
        match arch {
            EnemyArchetype::Dragon => {
                self.render_enemy_dragon(
                    enemy, x, draw_y, size, dir, anim_time, elem_col, sec_col, is_boss,
                );
            }
            EnemyArchetype::Serpent => {
                self.render_enemy_serpent(
                    enemy, x, draw_y, size, dir, anim_time, elem_col, sec_col, is_boss,
                );
            }
            EnemyArchetype::AvianBat => {
                self.render_enemy_avian_bat(
                    enemy, x, draw_y, size, dir, anim_time, elem_col, sec_col, is_boss,
                );
            }
            EnemyArchetype::Arachnid => {
                self.render_enemy_arachnid(
                    enemy, x, draw_y, size, dir, anim_time, elem_col, sec_col, is_boss,
                );
            }
            EnemyArchetype::TurtleBeast => {
                self.render_enemy_turtle_beast(
                    enemy, x, draw_y, size, dir, anim_time, elem_col, sec_col, is_boss,
                );
            }
            EnemyArchetype::SlimeCrystal => {
                self.render_enemy_slime_crystal(
                    enemy, x, draw_y, size, dir, anim_time, elem_col, sec_col, is_boss,
                );
            }
            EnemyArchetype::Colossus => {
                self.render_enemy_colossus(
                    enemy, x, draw_y, size, dir, anim_time, elem_col, sec_col, is_boss,
                );
            }
            EnemyArchetype::WraithReaper => {
                self.render_enemy_wraith_reaper(
                    enemy, x, draw_y, size, dir, anim_time, elem_col, sec_col, is_boss,
                );
            }
            EnemyArchetype::Siren => {
                self.render_enemy_siren(
                    enemy, x, draw_y, size, dir, anim_time, elem_col, sec_col, is_boss,
                );
            }
            EnemyArchetype::Humanoid => {
                self.render_enemy_humanoid(
                    enemy, x, draw_y, size, dir, anim_time, elem_col, sec_col, is_boss,
                );
            }
        }
    }
}
