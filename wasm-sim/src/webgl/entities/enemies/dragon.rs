#![allow(dead_code)]

use crate::types::EnemyEntity;
use crate::webgl::WebGl2Renderer;

impl WebGl2Renderer {
    #[allow(clippy::too_many_arguments)]
    pub(crate) fn render_enemy_dragon(
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
        let is_aquatic = enemy.type_id == "RIVER_DRAKE";
        let is_grounded = enemy.type_id == "DRAKE_WARRIOR";
        let s = size * 0.85;

        let wing_flap = (anim_time * 11.0).sin();
        let tail_wag = (anim_time * 7.5).sin() * (s * 0.35);
        let neck_bob = (anim_time * 6.0).sin() * 2.5;

        let body_x = x;
        let body_y = draw_y - s * 0.15;

        // 1. Tail & Spine
        let tail_base_x = body_x - dir * (s * 0.45);
        let tail_base_y = body_y + s * 0.1;
        let tail_mid_x = tail_base_x - dir * (s * 0.55) + tail_wag * 0.3;
        let tail_mid_y = tail_base_y + tail_wag * 0.4;
        let tail_tip_x = tail_mid_x - dir * (s * 0.6);
        let tail_tip_y = tail_mid_y + tail_wag * 0.8;

        // Spine lines
        self.draw_line(body_x, body_y, tail_base_x, tail_base_y, 3.2, elem_col);
        self.draw_line(tail_base_x, tail_base_y, tail_mid_x, tail_mid_y, 2.6, elem_col);
        self.draw_line(tail_mid_x, tail_mid_y, tail_tip_x, tail_tip_y, 2.2, elem_col);

        // Dorsal spikes on tail
        self.draw_triangle(
            tail_base_x,
            tail_base_y - 2.0,
            tail_base_x - dir * 4.0,
            tail_base_y - 8.0,
            tail_base_x - dir * 7.0,
            tail_base_y - 1.0,
            sec_col,
        );
        self.draw_triangle(
            tail_mid_x,
            tail_mid_y - 2.0,
            tail_mid_x - dir * 3.0,
            tail_mid_y - 6.0,
            tail_mid_x - dir * 6.0,
            tail_mid_y - 1.0,
            sec_col,
        );

        // Tail spade / blade
        self.draw_triangle(
            tail_tip_x,
            tail_tip_y - 5.0,
            tail_tip_x - dir * 12.0,
            tail_tip_y,
            tail_tip_x,
            tail_tip_y + 5.0,
            sec_col,
        );

        // 2. Dragon Torso (muscular aerodynamic oval)
        self.draw_ellipse(body_x, body_y, s * 0.6, s * 0.42, 14, elem_col);
        // Chest plates
        self.draw_ellipse(
            body_x + dir * (s * 0.15),
            body_y + s * 0.1,
            s * 0.35,
            s * 0.25,
            10,
            sec_col,
        );

        // 3. Neck & Horned Dragon Head
        let neck_base_x = body_x + dir * (s * 0.35);
        let neck_base_y = body_y - s * 0.1;
        let head_x = neck_base_x + dir * (s * 0.55);
        let head_y = neck_base_y - s * 0.45 + neck_bob;

        self.draw_line(neck_base_x, neck_base_y, head_x, head_y, 3.5, elem_col);

        // Head skull (elongated jaw)
        let snout_x = head_x + dir * (s * 0.5);
        let snout_y = head_y + 1.0;
        self.draw_triangle(
            head_x - dir * (s * 0.2),
            head_y - s * 0.25,
            snout_x,
            snout_y - 2.0,
            head_x - dir * (s * 0.1),
            head_y + s * 0.22,
            elem_col,
        );
        // Lower jaw
        self.draw_line(
            head_x,
            head_y + s * 0.15,
            snout_x - dir * 2.0,
            snout_y + 3.0,
            2.0,
            elem_col,
        );

        // Horns sweeping backwards
        let horn_top_x = head_x - dir * (s * 0.55);
        let horn_top_y = head_y - s * 0.5;
        self.draw_line(head_x, head_y - s * 0.2, horn_top_x, horn_top_y, 2.8, sec_col);
        if is_boss {
            // Secondary horned crown for dark dragon boss
            self.draw_line(
                head_x + dir * 2.0,
                head_y - s * 0.22,
                horn_top_x + dir * 4.0,
                horn_top_y + 5.0,
                2.2,
                [0.98, 0.75, 0.15, 1.0],
            );
        }

        // Fiery glowing eye
        self.draw_circle(
            head_x + dir * (s * 0.12),
            head_y - 2.0,
            if is_boss { 2.8 } else { 2.0 },
            8,
            [0.99, 0.94, 0.35, 1.0],
        );

        // Fire breath burst for Boss or attacking dragon
        if is_boss {
            let breath_pulse = (anim_time * 8.0).sin().max(0.0);
            if breath_pulse > 0.2 {
                let fx = snout_x + dir * (8.0 + breath_pulse * 12.0);
                let fy = snout_y + (anim_time * 12.0).sin() * 2.0;
                self.draw_triangle(
                    snout_x,
                    snout_y - 3.0,
                    fx,
                    fy,
                    snout_x,
                    snout_y + 3.0,
                    [0.98, 0.45, 0.08, 0.75 * breath_pulse],
                );
            }
        }

        // 4. Articulated Dragon Wings (if not aquatic)
        if !is_aquatic {
            let wing_span = if is_boss { s * 1.5 } else { s * 1.25 };
            let flap_angle = wing_flap * 20.0;

            // Wings on both sides for 3D depth
            for &side_dir in &[-1.0_f32, 1.0_f32] {
                let w_root_x = body_x - dir * (s * 0.1) * side_dir;
                let w_root_y = body_y - s * 0.2;

                let elbow_x = w_root_x - dir * (wing_span * 0.35);
                let elbow_y = w_root_y - wing_span * 0.7 + flap_angle * side_dir;

                let tip_x = w_root_x + dir * (wing_span * 0.75);
                let tip_y = elbow_y - wing_span * 0.35;

                // Wing bones
                self.draw_line(w_root_x, w_root_y, elbow_x, elbow_y, 2.5, elem_col);
                self.draw_line(elbow_x, elbow_y, tip_x, tip_y, 2.2, elem_col);

                // Wing membrane (semi-transparent bat wing webs)
                let web_mid_x = elbow_x + dir * 6.0;
                let web_mid_y = elbow_y + 14.0;
                let mut mem_col = sec_col;
                mem_col[3] = 0.38;

                self.draw_triangle(w_root_x, w_root_y, elbow_x, elbow_y, web_mid_x, web_mid_y, mem_col);
                self.draw_triangle(elbow_x, elbow_y, tip_x, tip_y, web_mid_x, web_mid_y, mem_col);

                // Finger struts
                self.draw_line(elbow_x, elbow_y, web_mid_x, web_mid_y, 1.5, sec_col);
            }
        }

        // 5. Claws / Legs (for Grounded Drake Warrior or River Drake)
        if is_grounded || is_aquatic {
            let leg_stride = (anim_time * 8.0).sin() * 5.0;
            let hip_f_x = body_x + dir * (s * 0.25);
            let hip_f_y = body_y + s * 0.2;
            let foot_f_x = hip_f_x + dir * (s * 0.2) + leg_stride;
            let foot_f_y = hip_f_y + s * 0.45;

            let hip_r_x = body_x - dir * (s * 0.25);
            let hip_r_y = body_y + s * 0.2;
            let foot_r_x = hip_r_x - dir * (s * 0.15) - leg_stride;
            let foot_r_y = hip_r_y + s * 0.45;

            // Front raptor leg
            self.draw_line(hip_f_x, hip_f_y, foot_f_x, foot_f_y, 2.6, elem_col);
            self.draw_line(foot_f_x, foot_f_y, foot_f_x + dir * 5.0, foot_f_y, 2.0, sec_col);

            // Rear raptor leg
            self.draw_line(hip_r_x, hip_r_y, foot_r_x, foot_r_y, 2.6, elem_col);
            self.draw_line(foot_r_x, foot_r_y, foot_r_x + dir * 5.0, foot_r_y, 2.0, sec_col);
        }
    }
}

