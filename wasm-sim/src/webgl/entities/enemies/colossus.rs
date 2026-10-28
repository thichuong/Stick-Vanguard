#![allow(dead_code)]

use crate::types::EnemyEntity;
use crate::webgl::WebGl2Renderer;

impl WebGl2Renderer {
    #[allow(clippy::too_many_arguments)]
    pub(crate) fn render_enemy_colossus(
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
        let is_ice =
            enemy.type_id == "FROST_CRYSTAL_GOLEM" || enemy.type_id == "GLACIAL_TITAN_BOSS";
        let is_iron = enemy.type_id == "IRON_COLOSSUS" || enemy.type_id == "IRON_OVERLORD_BOSS";
        let is_treant = enemy.type_id == "ANCIENT_TREANT_BOSS";
        let is_chrono = enemy.type_id == "CHRONO_DESTROYER_BOSS";
        let is_inferno = enemy.type_id == "INFERNO_MONARCH_BOSS";

        let s = size * 0.9;
        let heavy_step = (anim_time * 5.0).sin() * 5.5;
        let punch = ((anim_time * 7.0).sin().max(0.0)) * (s * 0.35) * dir;

        let body_y = draw_y - s * 0.15;

        // 1. Massive Inverted Trapezoid Torso (Hulking boulder/steel body)
        let shoulder_w = s * 0.65;
        let waist_w = s * 0.38;
        let torso_top = body_y - s * 0.42;
        let torso_bot = body_y + s * 0.18;

        // Draw trapezoid torso using two triangles
        self.draw_triangle(
            x - shoulder_w,
            torso_top,
            x + shoulder_w,
            torso_top,
            x + waist_w,
            torso_bot,
            elem_col,
        );
        self.draw_triangle(
            x - shoulder_w,
            torso_top,
            x + waist_w,
            torso_bot,
            x - waist_w,
            torso_bot,
            elem_col,
        );

        // Torso outline
        self.draw_line(
            x - shoulder_w,
            torso_top,
            x + shoulder_w,
            torso_top,
            2.5,
            sec_col,
        );
        self.draw_line(
            x + shoulder_w,
            torso_top,
            x + waist_w,
            torso_bot,
            2.5,
            sec_col,
        );
        self.draw_line(x + waist_w, torso_bot, x - waist_w, torso_bot, 2.5, sec_col);
        self.draw_line(
            x - waist_w,
            torso_bot,
            x - shoulder_w,
            torso_top,
            2.5,
            sec_col,
        );

        // 2. Glowing Elemental Chest Rune Core
        let core_y = body_y - s * 0.12;
        let core_pulse = (anim_time * 6.0).sin() * 0.15 + 0.85;

        if is_chrono {
            // Chrono gear rune
            self.draw_circle(x, core_y, 7.0 * core_pulse, 24, [0.38, 0.85, 0.98, 0.95]);
            self.draw_ring(
                x,
                core_y,
                7.0 * core_pulse,
                1.8,
                24,
                [0.99, 0.92, 0.35, 1.0],
            );
        } else if is_inferno {
            // Blazing magma core
            self.draw_circle(x, core_y, 7.5 * core_pulse, 24, [0.98, 0.45, 0.08, 0.95]);
            self.draw_circle(x, core_y, 3.5, 16, [1.0, 0.95, 0.35, 1.0]);
        } else {
            // Elemental stone plate core
            self.draw_rounded_rect(x - 5.0, core_y - 5.0, 10.0, 10.0, 2.0, sec_col);
            self.draw_circle(x, core_y, 2.5, 16, [1.0, 1.0, 1.0, 0.95]);
        }

        // 3. Compact Armored Head / Helm
        let head_y = torso_top - s * 0.22;
        let head_r = s * 0.24;
        self.draw_circle(x, head_y, head_r, 28, elem_col);
        self.draw_ring(x, head_y, head_r, 2.0, 28, sec_col);

        // Visor slit with glowing eyes
        let visor_w = head_r * 0.65;
        self.draw_line(
            x - dir * 2.0,
            head_y - 1.0,
            x + dir * visor_w,
            head_y - 1.0,
            2.2,
            [0.99, 0.92, 0.35, 1.0],
        );

        // 4. Massive Shoulder Pauldrons & Unique Boss Features
        for &side in &[-1.0_f32, 1.0_f32] {
            let sp_x = x + side * shoulder_w;
            let sp_y = torso_top + 2.0;

            // Shoulder boulder
            self.draw_circle(sp_x, sp_y, s * 0.22, 20, elem_col);
            self.draw_ring(sp_x, sp_y, s * 0.22, 1.8, 20, sec_col);

            if is_ice {
                // Jagged ice spikes protruding from shoulders
                self.draw_triangle(
                    sp_x - 4.0,
                    sp_y - s * 0.1,
                    sp_x,
                    sp_y - s * 0.45,
                    sp_x + 4.0,
                    sp_y - s * 0.1,
                    [0.72, 0.9, 0.99, 0.95],
                );
            } else if is_iron {
                // Steel armor rivets
                self.draw_circle(sp_x, sp_y, 3.0, 16, [0.85, 0.9, 0.95, 1.0]);
            } else if is_treant {
                // Mossy leafy branches
                self.draw_line(
                    sp_x,
                    sp_y - s * 0.1,
                    sp_x + side * 6.0,
                    sp_y - s * 0.4,
                    2.4,
                    [0.15, 0.65, 0.2, 1.0],
                );
                self.draw_circle(
                    sp_x + side * 6.0,
                    sp_y - s * 0.4,
                    3.5,
                    8,
                    [0.22, 0.78, 0.25, 0.9],
                );
            } else if is_inferno || is_boss {
                // Fiery molten shoulder spikes
                self.draw_triangle(
                    sp_x - 3.5,
                    sp_y,
                    sp_x + side * 5.0,
                    sp_y - s * 0.35,
                    sp_x + 3.5,
                    sp_y,
                    [0.95, 0.4, 0.1, 0.95],
                );
            }
        }

        // 5. Heavy Pillar Legs (Earth-shaking Stomp)
        let leg_w = s * 0.28;
        let leg_h = s * 0.45;

        // Left leg
        let l_leg_x = x - waist_w * 0.7;
        let l_leg_y = torso_bot;
        self.draw_rect(
            l_leg_x - leg_w * 0.5,
            l_leg_y,
            leg_w,
            leg_h + heavy_step,
            elem_col,
        );
        self.draw_rect(
            l_leg_x - leg_w * 0.5 - 2.0,
            l_leg_y + leg_h + heavy_step - 4.0,
            leg_w + 4.0,
            5.0,
            sec_col,
        );

        // Right leg
        let r_leg_x = x + waist_w * 0.7;
        let r_leg_y = torso_bot;
        self.draw_rect(
            r_leg_x - leg_w * 0.5,
            r_leg_y,
            leg_w,
            leg_h - heavy_step,
            elem_col,
        );
        self.draw_rect(
            r_leg_x - leg_w * 0.5 - 2.0,
            r_leg_y + leg_h - heavy_step - 4.0,
            leg_w + 4.0,
            5.0,
            sec_col,
        );

        // 6. Giant Boulder / Sledgehammer Arms
        // Rear arm
        let arm_r_root_x = x - dir * shoulder_w;
        let arm_r_fist_x = arm_r_root_x - dir * 8.0;
        let arm_r_fist_y = torso_bot + 4.0;
        self.draw_line(
            arm_r_root_x,
            torso_top + 4.0,
            arm_r_fist_x,
            arm_r_fist_y,
            4.5,
            elem_col,
        );
        self.draw_circle(arm_r_fist_x, arm_r_fist_y, s * 0.2, 20, sec_col);

        // Front punch arm
        let arm_f_root_x = x + dir * shoulder_w;
        let arm_f_fist_x = arm_f_root_x + dir * (s * 0.3) + punch;
        let arm_f_fist_y = torso_bot;
        self.draw_line(
            arm_f_root_x,
            torso_top + 4.0,
            arm_f_fist_x,
            arm_f_fist_y,
            5.0,
            elem_col,
        );
        self.draw_circle(arm_f_fist_x, arm_f_fist_y, s * 0.24, 20, sec_col);
    }
}
