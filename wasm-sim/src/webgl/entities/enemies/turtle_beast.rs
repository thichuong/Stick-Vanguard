#![allow(dead_code)]

use crate::types::EnemyEntity;
use crate::webgl::WebGl2Renderer;

impl WebGl2Renderer {
    #[allow(clippy::too_many_arguments)]
    pub(crate) fn render_enemy_turtle_beast(
        &mut self,
        enemy: &EnemyEntity,
        x: f32,
        draw_y: f32,
        size: f32,
        dir: f32,
        anim_time: f32,
        elem_col: [f32; 4],
        sec_col: [f32; 4],
        _is_boss: bool,
    ) {
        let is_leviathan = enemy.type_id == "PLAGUE_LEVIATHAN";
        let is_crab = enemy.type_id == "ABYSSAL_CRAB";
        let s = size * 0.85;

        if is_crab {
            // --- Abyssal Crab ---
            let body_y = draw_y - s * 0.15;

            // Wide carapace with spiky lateral rims
            self.draw_ellipse(x, body_y, s * 0.65, s * 0.45, 24, elem_col);
            self.draw_ring(x, body_y, s * 0.65, 2.0, 24, sec_col);

            // Carapace dorsal ridges
            self.draw_line(x - s * 0.35, body_y, x + s * 0.35, body_y, 2.0, sec_col);

            // Stalk eyes
            for &side in &[-1.0_f32, 1.0_f32] {
                let eye_stem_x = x + dir * (s * 0.2) + side * 5.0;
                let eye_stem_y = body_y - s * 0.35;
                self.draw_line(
                    eye_stem_x,
                    body_y - s * 0.2,
                    eye_stem_x,
                    eye_stem_y,
                    2.2,
                    elem_col,
                );
                self.draw_circle(eye_stem_x, eye_stem_y, 2.4, 16, [0.15, 0.2, 0.25, 1.0]);
                self.draw_circle(eye_stem_x, eye_stem_y, 1.2, 12, [0.99, 0.92, 0.35, 1.0]);
            }

            // Giant crushing pincer claws
            let claw_snap = (anim_time * 8.0).sin() * 4.0;
            for &side in &[-1.0_f32, 1.0_f32] {
                let arm_root_x = x + dir * (s * 0.35);
                let arm_root_y = body_y + side * (s * 0.25);
                let wrist_x = arm_root_x + dir * (s * 0.45);
                let wrist_y = arm_root_y + side * (s * 0.2);

                self.draw_line(arm_root_x, arm_root_y, wrist_x, wrist_y, 3.2, elem_col);

                // Main claw pincer
                let claw_tip_x = wrist_x + dir * (s * 0.35);
                let claw_tip_y = wrist_y + side * 4.0;
                self.draw_triangle(
                    wrist_x,
                    wrist_y - 4.0,
                    claw_tip_x,
                    claw_tip_y + claw_snap * side,
                    wrist_x,
                    wrist_y + 4.0,
                    sec_col,
                );
            }

            // 6 Scurrying crab legs
            for leg_i in 0..3 {
                let gait = (anim_time * 12.0 + leg_i as f32 * 2.0).sin() * 4.0;
                let lx = x - s * 0.3 + (leg_i as f32) * (s * 0.28);
                // Upper leg
                self.draw_line(
                    lx,
                    body_y,
                    lx - dir * 4.0,
                    body_y + s * 0.45 + gait,
                    2.2,
                    elem_col,
                );
                // Lower leg
                self.draw_line(
                    lx,
                    body_y,
                    lx + dir * 4.0,
                    body_y - s * 0.45 - gait,
                    2.2,
                    elem_col,
                );
            }
        } else if is_leviathan {
            // --- Plague Leviathan (Giant Armored Sea Behemoth) ---
            let body_y = draw_y - s * 0.1;

            // Heavy armored body
            self.draw_ellipse(x, body_y, s * 0.78, s * 0.48, 28, elem_col);
            self.draw_ring(x, body_y, s * 0.78, 2.4, 28, sec_col);

            // Toxic dorsal spikes
            for i in -2..=2 {
                let sp_x = x + (i as f32) * (s * 0.28);
                let sp_h = (3.0 - (i as f32).abs()) * (s * 0.18) + 6.0;
                self.draw_triangle(
                    sp_x - 4.5,
                    body_y - s * 0.35,
                    sp_x,
                    body_y - s * 0.35 - sp_h,
                    sp_x + 4.5,
                    body_y - s * 0.35,
                    [0.65, 0.95, 0.2, 0.95],
                );
            }

            // Massive gaping jaws
            let jaw_x = x + dir * (s * 0.7);
            let jaw_y = body_y;
            self.draw_circle(jaw_x, jaw_y, s * 0.3, 24, elem_col);
            self.draw_circle(
                jaw_x + dir * 3.0,
                jaw_y - 2.0,
                2.2,
                12,
                [0.95, 0.2, 0.2, 1.0],
            );

            // Razor teeth
            self.draw_triangle(
                jaw_x,
                jaw_y - 4.0,
                jaw_x + dir * 6.0,
                jaw_y,
                jaw_x,
                jaw_y + 4.0,
                [0.95, 0.95, 0.85, 1.0],
            );
        } else {
            // --- Moss Turtle ---
            let body_y = draw_y - s * 0.05;

            // 1. Hexagonal Domed Shell
            let shell_w = s * 0.72;
            let shell_h = s * 0.52;
            self.draw_ellipse(x, body_y, shell_w, shell_h, 28, elem_col);
            self.draw_ring(x, body_y, shell_w, 2.2, 28, sec_col);

            // Hexagonal shell plates & mossy markings
            self.draw_ellipse(x, body_y, shell_w * 0.55, shell_h * 0.55, 24, sec_col);
            self.draw_line(
                x - shell_w * 0.6,
                body_y,
                x + shell_w * 0.6,
                body_y,
                1.8,
                sec_col,
            );
            self.draw_line(
                x,
                body_y - shell_h * 0.6,
                x,
                body_y + shell_h * 0.6,
                1.8,
                sec_col,
            );

            // 2. Extending wrinkly neck & bobbing head
            let neck_bob = (anim_time * 6.0).sin() * 3.5;
            let head_x = x + dir * (shell_w + 6.0 + neck_bob);
            let head_y = body_y - 2.0;

            self.draw_line(
                x + dir * (shell_w * 0.6),
                body_y,
                head_x,
                head_y,
                3.2,
                elem_col,
            );
            self.draw_circle(head_x, head_y, 5.5, 24, elem_col);
            self.draw_circle(
                head_x + dir * 2.0,
                head_y - 1.2,
                1.6,
                12,
                [0.08, 0.12, 0.18, 1.0],
            );

            // 3. 4 Paddling flippers / club feet
            let paddle = (anim_time * 7.5).sin() * 5.0;
            for &side in &[-1.0_f32, 1.0_f32] {
                // Front flipper
                let f_root_x = x + dir * (shell_w * 0.4);
                let f_root_y = body_y + side * (shell_h * 0.55);
                let f_tip_x = f_root_x + dir * (shell_w * 0.45);
                let f_tip_y = f_root_y + side * 8.0 + paddle;
                self.draw_line(f_root_x, f_root_y, f_tip_x, f_tip_y, 3.2, elem_col);

                // Rear flipper
                let r_root_x = x - dir * (shell_w * 0.4);
                let r_root_y = body_y + side * (shell_h * 0.55);
                let r_tip_x = r_root_x - dir * (shell_w * 0.35);
                let r_tip_y = r_root_y + side * 6.0 - paddle;
                self.draw_line(r_root_x, r_root_y, r_tip_x, r_tip_y, 3.0, elem_col);
            }
        }
    }
}
