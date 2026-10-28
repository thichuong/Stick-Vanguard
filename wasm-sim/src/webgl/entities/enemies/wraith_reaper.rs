#![allow(dead_code)]

use crate::types::EnemyEntity;
use crate::webgl::WebGl2Renderer;

impl WebGl2Renderer {
    #[allow(clippy::too_many_arguments)]
    pub(crate) fn render_enemy_wraith_reaper(
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
        let is_reaper = enemy.type_id == "PHANTOM_REAPER" || enemy.type_id == "SOUL_EMPEROR_BOSS";
        let is_banshee = enemy.type_id == "SPECTRAL_BANSHEE";
        let is_degrader = enemy.type_id == "HEX_DEGRADER";
        let is_emperor = enemy.type_id == "SOUL_EMPEROR_BOSS" || is_boss;

        let s = size * 0.9;
        let hover = (anim_time * 5.5).sin() * 4.5;
        let cloak_wave = (anim_time * 8.0).sin() * (s * 0.25);
        let cy = draw_y - s * 0.25 + hover;

        // 1. Flowing Ethereal Ghost Cloak (Legless ghost wisps)
        let mut cloak_fill = elem_col;
        cloak_fill[3] = 0.55;

        let hood_top_y = cy - s * 0.55;
        let chest_y = cy - s * 0.1;
        let tail_l_x = x - dir * (s * 0.45) - cloak_wave;
        let tail_l_y = cy + s * 0.75;
        let tail_m_x = x + cloak_wave * 0.5;
        let tail_m_y = cy + s * 0.9;
        let tail_r_x = x + dir * (s * 0.45) + cloak_wave;
        let tail_r_y = cy + s * 0.7;

        // Triangles forming flowing ghostly shroud
        self.draw_triangle(
            x, chest_y, tail_l_x, tail_l_y, tail_m_x, tail_m_y, cloak_fill,
        );
        self.draw_triangle(
            x, chest_y, tail_m_x, tail_m_y, tail_r_x, tail_r_y, cloak_fill,
        );
        self.draw_triangle(
            x - s * 0.35,
            chest_y,
            x,
            hood_top_y,
            x + s * 0.35,
            chest_y,
            elem_col,
        );

        // Ghostly robe tatter lines
        self.draw_line(x, chest_y, tail_l_x, tail_l_y, 2.0, sec_col);
        self.draw_line(x, chest_y, tail_m_x, tail_m_y, 2.2, sec_col);
        self.draw_line(x, chest_y, tail_r_x, tail_r_y, 2.0, sec_col);

        // 2. Deep Shadow Hood & Piercing Soul Eyes
        let head_y = hood_top_y + s * 0.18;
        let head_r = s * 0.26;
        self.draw_circle(x, head_y, head_r, 24, [0.06, 0.08, 0.14, 0.95]);
        self.draw_ring(x, head_y, head_r, 1.8, 24, sec_col);

        // Soul Flame Eyes
        let eye_col = if is_banshee {
            [0.95, 0.45, 0.95, 1.0]
        } else if is_reaper {
            [0.35, 0.85, 0.98, 1.0]
        } else {
            [0.85, 0.95, 0.25, 1.0]
        };
        self.draw_circle(x + dir * (head_r * 0.4), head_y - 1.5, 2.2, 12, eye_col);

        // 3. Hex Degrader Curse Seal
        if is_degrader {
            let rot = anim_time * 3.0;
            self.draw_ring(x, hood_top_y - 8.0, 7.0, 1.6, 24, [0.85, 0.35, 0.95, 0.95]);
            self.draw_line(
                x + rot.cos() * 7.0,
                hood_top_y - 8.0 + rot.sin() * 7.0,
                x - rot.cos() * 7.0,
                hood_top_y - 8.0 - rot.sin() * 7.0,
                1.5,
                [0.85, 0.35, 0.95, 0.95],
            );
        }

        // 4. Spectral Banshee Screaming Shockwave
        if is_banshee {
            // Streaming disheveled hair
            for &side_i in &[-1.0_f32, 1.0_f32] {
                let hx = x - dir * (s * 0.3) + side_i * 4.0;
                let hy = head_y - s * 0.2;
                self.draw_line(x, head_y, hx, hy - cloak_wave, 2.0, sec_col);
            }
            // Sonic scream pulse rings
            let scream_r = (anim_time * 12.0) % 18.0;
            self.draw_ring(
                x + dir * (s * 0.45),
                head_y,
                scream_r + 4.0,
                1.4,
                12,
                [0.95, 0.45, 0.95, (1.0 - scream_r / 18.0) * 0.7],
            );
        }

        // 5. Death's Scythe & Soul Emperor Wisps
        if is_reaper {
            let swing = ((anim_time * 7.0).sin().max(0.0)) * 16.0 * dir;

            // Scythe Staff
            let staff_top_x = x + dir * (s * 0.6) + swing;
            let staff_top_y = cy - s * 0.85;
            let staff_bot_x = x + dir * (s * 0.15);
            let staff_bot_y = cy + s * 0.65;

            self.draw_line(
                staff_top_x,
                staff_top_y,
                staff_bot_x,
                staff_bot_y,
                2.6,
                [0.35, 0.3, 0.25, 1.0],
            );

            // Crescent Scythe Blade
            let blade_tip_x = staff_top_x + dir * (s * 0.75);
            let blade_tip_y = staff_top_y - s * 0.2;
            let blade_mid_x = staff_top_x + dir * (s * 0.5);
            let blade_mid_y = staff_top_y + s * 0.25;

            self.draw_triangle(
                staff_top_x,
                staff_top_y,
                blade_tip_x,
                blade_tip_y,
                blade_mid_x,
                blade_mid_y,
                sec_col,
            );
            self.draw_line(
                staff_top_x,
                staff_top_y,
                blade_tip_x,
                blade_tip_y,
                2.4,
                [0.95, 0.95, 1.0, 1.0],
            );

            if is_emperor {
                // Orbiting Soul Wisps
                for i in 0..3 {
                    let w_ang = anim_time * 3.5 + (i as f32) * 2.094;
                    let wx = x + w_ang.cos() * (s * 0.9);
                    let wy = cy + w_ang.sin() * (s * 0.5);
                    self.draw_circle(wx, wy, 3.2, 16, [0.38, 0.85, 0.98, 0.95]);
                    self.draw_circle(wx, wy, 1.6, 12, [1.0, 1.0, 1.0, 1.0]);
                }
            }
        }
    }
}
