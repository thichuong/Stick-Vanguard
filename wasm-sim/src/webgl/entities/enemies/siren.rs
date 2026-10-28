#![allow(dead_code)]

use crate::types::EnemyEntity;
use crate::webgl::WebGl2Renderer;

impl WebGl2Renderer {
    #[allow(clippy::too_many_arguments)]
    pub(crate) fn render_enemy_siren(
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
        let is_priestess = enemy.type_id == "TIDAL_PRIESTESS";
        let is_tempest = enemy.type_id == "TEMPEST_LEVIATHAN_BOSS" || is_boss;

        let s = size * 0.85;
        let body_y = draw_y - s * 0.15;
        let tail_wave = (anim_time * 8.0).sin() * (s * 0.35);

        // 1. Humanoid Upper Torso
        let head_y = body_y - s * 0.6;
        let head_r = s * 0.25;

        // Head
        self.draw_circle(x, head_y, head_r, 12, elem_col);
        self.draw_circle(
            x + dir * (head_r * 0.4),
            head_y - 1.0,
            1.8,
            6,
            [0.38, 0.85, 0.98, 1.0],
        );

        // Coral Tiara / Royal Pearl Crown
        self.draw_triangle(
            x - 5.0,
            head_y - head_r,
            x,
            head_y - head_r - 6.0,
            x + 5.0,
            head_y - head_r,
            sec_col,
        );
        self.draw_circle(x, head_y - head_r - 6.0, 1.8, 6, [1.0, 1.0, 1.0, 1.0]);

        // Flowing aquatic hair
        self.draw_line(
            x - dir * (head_r * 0.5),
            head_y,
            x - dir * (s * 0.45),
            head_y + s * 0.25 - tail_wave * 0.4,
            2.2,
            sec_col,
        );

        // Slender spine
        let spine_bot_y = body_y + s * 0.1;
        self.draw_line(x, head_y + head_r, x, spine_bot_y, 2.6, elem_col);

        // 2. Curving Mermaid Tail (Sinusoidal swimming movement)
        let tail_mid_x = x - dir * (s * 0.38) + tail_wave * 0.35;
        let tail_mid_y = spine_bot_y + s * 0.35;
        let tail_tip_x = tail_mid_x - dir * (s * 0.42);
        let tail_tip_y = tail_mid_y + s * 0.38 + tail_wave;

        self.draw_line(x, spine_bot_y, tail_mid_x, tail_mid_y, 3.8, sec_col);
        self.draw_line(tail_mid_x, tail_mid_y, tail_tip_x, tail_tip_y, 2.8, sec_col);

        // Tail Fluke / Double Fins
        self.draw_triangle(
            tail_tip_x,
            tail_tip_y,
            tail_tip_x - dir * 8.0,
            tail_tip_y - 7.0,
            tail_tip_x - dir * 12.0,
            tail_tip_y,
            sec_col,
        );
        self.draw_triangle(
            tail_tip_x,
            tail_tip_y,
            tail_tip_x - dir * 8.0,
            tail_tip_y + 7.0,
            tail_tip_x - dir * 12.0,
            tail_tip_y,
            sec_col,
        );

        // 3. Storm Trident / Tidal Pearl Scepter
        let staff_x = x + dir * (s * 0.52);
        let staff_top_y = head_y - s * 0.35;
        let staff_bot_y = spine_bot_y + s * 0.35;

        // Staff line
        self.draw_line(
            staff_x,
            staff_top_y,
            staff_x,
            staff_bot_y,
            2.2,
            [0.99, 0.92, 0.35, 1.0],
        );

        if is_priestess {
            // Tidal Scepter Pearl
            self.draw_circle(staff_x, staff_top_y, 4.0, 10, [0.75, 0.95, 1.0, 1.0]);
            self.draw_ring(staff_x, staff_top_y, 6.0, 1.4, 10, [0.38, 0.85, 0.98, 0.8]);
        } else {
            // Storm Trident prongs
            self.draw_line(
                staff_x - 4.5,
                staff_top_y + 6.0,
                staff_x - 4.5,
                staff_top_y - 4.0,
                1.8,
                [0.99, 0.92, 0.35, 1.0],
            );
            self.draw_line(
                staff_x + 4.5,
                staff_top_y + 6.0,
                staff_x + 4.5,
                staff_top_y - 4.0,
                1.8,
                [0.99, 0.92, 0.35, 1.0],
            );
            self.draw_line(
                staff_x,
                staff_top_y,
                staff_x,
                staff_top_y - 7.0,
                2.0,
                [0.99, 0.92, 0.35, 1.0],
            );

            // Lightning spark on trident for Tempest Leviathan
            if is_tempest {
                self.draw_circle(staff_x, staff_top_y - 7.0, 3.0, 8, [0.38, 0.9, 1.0, 0.95]);
            }
        }

        // Arm holding staff
        self.draw_line(x, head_y + head_r + 4.0, staff_x, body_y, 2.0, elem_col);

        // 4. Water splash rings at base
        let splash_r = (anim_time * 4.0) % 1.0;
        self.draw_ellipse(
            x,
            draw_y + s * 0.2,
            s * 0.6 + splash_r * 6.0,
            s * 0.25 + splash_r * 3.0,
            12,
            [0.38, 0.85, 0.98, (1.0 - splash_r) * 0.6],
        );
    }
}
