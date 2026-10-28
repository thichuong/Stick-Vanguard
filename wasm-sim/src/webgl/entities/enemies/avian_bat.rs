#![allow(dead_code)]

use crate::types::EnemyEntity;
use crate::webgl::WebGl2Renderer;

impl WebGl2Renderer {
    #[allow(clippy::too_many_arguments)]
    pub(crate) fn render_enemy_avian_bat(
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
        let is_celestial = enemy.type_id == "CELESTIAL_FAIRY";
        let is_fairy = enemy.type_id == "FAIRY_SPRITE" || is_celestial;
        let is_angel = enemy.type_id == "SERAPH_VALKYRIE"
            || enemy.type_id == "ARCHANGEL_MONARCH_BOSS"
            || is_boss;
        let is_drone = enemy.type_id == "EMP_DRONE";

        let s = size * 0.85;
        let bob = (anim_time * 7.0).sin() * 3.5;
        let cy = draw_y - s * 0.25 + bob;

        if is_drone {
            // --- Mechanical EMP Drone ---
            self.draw_circle(x, cy, s * 0.38, 14, elem_col);
            self.draw_ring(x, cy, s * 0.38, 2.0, 14, [0.38, 0.85, 0.98, 0.9]);

            // Central pulsing electro scanner lens
            let pulse = (anim_time * 10.0).sin() * 0.2 + 0.8;
            self.draw_circle(x, cy, s * 0.18 * pulse, 10, [0.15, 0.95, 1.0, 1.0]);

            // Rotating twin rotor arms
            let rot = anim_time * 18.0;
            for &side in &[-1.0_f32, 1.0_f32] {
                let arm_x = x + side * (s * 0.65);
                self.draw_line(x, cy, arm_x, cy - 2.0, 2.4, [0.4, 0.45, 0.55, 1.0]);
                // Rotor blades
                let blade_w = (rot * side).sin() * (s * 0.45);
                self.draw_line(
                    arm_x - blade_w,
                    cy - 4.0,
                    arm_x + blade_w,
                    cy - 4.0,
                    1.8,
                    sec_col,
                );
                self.draw_circle(arm_x, cy - 4.0, 2.2, 8, [0.95, 0.95, 0.95, 1.0]);
            }
            // Antennas
            self.draw_line(x - 3.0, cy - s * 0.35, x - 5.0, cy - s * 0.65, 1.5, sec_col);
            self.draw_line(x + 3.0, cy - s * 0.35, x + 5.0, cy - s * 0.65, 1.5, sec_col);
        } else if is_angel {
            // --- Holy Seraph Valkyrie & Archangel Monarch ---
            let wing_flap = (anim_time * 8.0).sin() * 12.0;

            // 6 Radiant Feathered Wings
            let wing_tiers = [
                (-s * 0.55, 1.4_f32, wing_flap * 1.2), // Upper wings
                (-s * 0.2, 1.25_f32, wing_flap * 0.8), // Middle wings
                (s * 0.15, 0.95_f32, wing_flap * 0.5), // Lower wings
            ];

            let mut wing_mem = sec_col;
            wing_mem[3] = 0.5;

            for &(wy, span_mult, flap_val) in &wing_tiers {
                for &side in &[-1.0_f32, 1.0_f32] {
                    let w_root_x = x + side * 4.0;
                    let w_root_y = cy + wy;
                    let w_mid_x = x + side * (s * span_mult * 0.6);
                    let w_mid_y = w_root_y - s * 0.45 + flap_val * side;
                    let w_tip_x = x + side * (s * span_mult);
                    let w_tip_y = w_mid_y + s * 0.25;

                    self.draw_line(
                        w_root_x,
                        w_root_y,
                        w_mid_x,
                        w_mid_y,
                        2.2,
                        [0.99, 0.95, 0.75, 1.0],
                    );
                    self.draw_line(
                        w_mid_x,
                        w_mid_y,
                        w_tip_x,
                        w_tip_y,
                        2.0,
                        [0.99, 0.95, 0.75, 1.0],
                    );
                    self.draw_triangle(
                        w_root_x, w_root_y, w_mid_x, w_mid_y, w_tip_x, w_tip_y, wing_mem,
                    );
                }
            }

            // Divine floating Halo
            self.draw_ellipse(x, cy - s * 0.85, 7.5, 3.0, 14, [0.99, 0.92, 0.35, 0.95]);

            // Slender stick body & white sacred tunic
            let head_y = cy - s * 0.55;
            self.draw_circle(x, head_y, s * 0.24, 12, elem_col);
            self.draw_line(x, head_y + s * 0.2, x, cy + s * 0.45, 2.6, elem_col);

            // Sacred golden lance / spear of light
            let lance_x = x + dir * (s * 0.55);
            self.draw_line(
                lance_x,
                cy - s * 0.9,
                lance_x,
                cy + s * 0.7,
                2.2,
                [0.99, 0.88, 0.25, 1.0],
            );
            self.draw_triangle(
                lance_x - 3.0,
                cy - s * 0.75,
                lance_x,
                cy - s * 1.05,
                lance_x + 3.0,
                cy - s * 0.75,
                [1.0, 1.0, 1.0, 1.0],
            );
        } else if is_fairy {
            // --- Luminescent Fairy Sprite & Celestial Fairy ---
            let wing_flap = (anim_time * 16.0).sin();

            // Head & Body
            let head_y = cy - s * 0.45;
            self.draw_circle(x, head_y, s * 0.22, 12, elem_col);
            self.draw_line(x, head_y + s * 0.18, x, cy + s * 0.35, 2.2, elem_col);
            // Dainty bent legs
            self.draw_line(
                x,
                cy + s * 0.35,
                x - dir * 4.0,
                cy + s * 0.65,
                1.8,
                elem_col,
            );

            if is_celestial {
                // Golden halo for Celestial Fairy
                self.draw_ellipse(x, head_y - 6.0, 6.0, 2.2, 12, [0.99, 0.92, 0.35, 0.95]);
            }

            // 4 Translucent Shimmering Wings (Dragonfly / Butterfly style)
            let mut wing_fill = sec_col;
            wing_fill[3] = 0.45;

            for &side in &[-1.0_f32, 1.0_f32] {
                // Upper wing
                let uw_cx = x + side * (s * 0.65);
                let uw_cy = cy - s * 0.35 + wing_flap * 4.0 * side;
                self.draw_ellipse(uw_cx, uw_cy, s * 0.65, s * 0.28, 12, wing_fill);
                self.draw_ring(uw_cx, uw_cy, s * 0.65, 1.4, 12, sec_col);

                // Lower wing
                let lw_cx = x + side * (s * 0.45);
                let lw_cy = cy + s * 0.05 - wing_flap * 3.0 * side;
                self.draw_ellipse(lw_cx, lw_cy, s * 0.45, s * 0.2, 10, wing_fill);
                self.draw_ring(lw_cx, lw_cy, s * 0.45, 1.2, 10, sec_col);
            }

            // Magic Wand with star gem
            let wand_x = x + dir * (s * 0.45);
            self.draw_line(
                x,
                cy - s * 0.1,
                wand_x,
                cy - s * 0.1,
                1.6,
                [0.99, 0.92, 0.35, 1.0],
            );
            self.draw_circle(wand_x, cy - s * 0.1, 3.0, 8, [1.0, 1.0, 1.0, 1.0]);
        } else {
            // --- Toxic Bat & Winged Gargoyle ---
            let wing_flap = (anim_time * 13.0).sin() * 16.0;

            // Hunched Torso
            let body_y = cy;
            self.draw_circle(x, body_y, s * 0.35, 12, elem_col);

            // Bat Head with pointed devil ears
            let head_x = x + dir * 3.0;
            let head_y = body_y - s * 0.32;
            self.draw_circle(head_x, head_y, s * 0.24, 10, elem_col);

            // Pointed Ears
            self.draw_triangle(
                head_x - 3.0,
                head_y - s * 0.15,
                head_x - 6.0,
                head_y - s * 0.55,
                head_x,
                head_y - s * 0.2,
                sec_col,
            );
            self.draw_triangle(
                head_x,
                head_y - s * 0.2,
                head_x + 3.0,
                head_y - s * 0.55,
                head_x + 6.0,
                head_y - s * 0.15,
                sec_col,
            );

            // Fierce Red Glowing Eyes
            self.draw_circle(
                head_x + dir * 2.5,
                head_y - 1.0,
                1.6,
                6,
                [0.95, 0.15, 0.15, 1.0],
            );

            // Talons tucked beneath
            self.draw_line(
                x,
                body_y + s * 0.3,
                x - dir * 4.0,
                body_y + s * 0.55,
                2.0,
                elem_col,
            );
            self.draw_line(
                x - dir * 4.0,
                body_y + s * 0.55,
                x - dir * 7.0,
                body_y + s * 0.65,
                1.8,
                sec_col,
            );

            // Articulated Bat Wings with webbing
            let mut mem_col = sec_col;
            mem_col[3] = 0.42;

            for &side in &[-1.0_f32, 1.0_f32] {
                let span = s * 1.35;
                let root_x = x;
                let root_y = body_y - s * 0.1;
                let elbow_x = x + side * (span * 0.5);
                let elbow_y = root_y - span * 0.45 + wing_flap * side;
                let tip_x = x + side * span;
                let tip_y = elbow_y + span * 0.35;

                // Arm bones
                self.draw_line(root_x, root_y, elbow_x, elbow_y, 2.5, elem_col);
                self.draw_line(elbow_x, elbow_y, tip_x, tip_y, 2.2, elem_col);

                // Membrane triangles
                let rib_x = elbow_x + side * (span * 0.25);
                let rib_y = root_y + s * 0.25;
                self.draw_triangle(root_x, root_y, elbow_x, elbow_y, rib_x, rib_y, mem_col);
                self.draw_triangle(elbow_x, elbow_y, tip_x, tip_y, rib_x, rib_y, mem_col);
                self.draw_line(elbow_x, elbow_y, rib_x, rib_y, 1.4, sec_col);
            }
        }
    }
}
