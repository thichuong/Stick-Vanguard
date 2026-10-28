#![allow(dead_code)]

use crate::types::EnemyEntity;
use crate::webgl::WebGl2Renderer;

impl WebGl2Renderer {
    #[allow(clippy::too_many_arguments)]
    pub(crate) fn render_enemy_slime_crystal(
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
        let is_shard = enemy.type_id == "ICE_SHARDLING";
        let s = size * 0.85;

        if is_shard {
            // --- Ice Shardling (Multifaceted Spinning Ice Crystal) ---
            let rot = anim_time * 3.5;
            let shard_y = draw_y - s * 0.25 + (anim_time * 5.0).sin() * 3.0;

            // Rotating central diamond crystal
            let w = s * 0.55;
            let h = s * 0.8;

            let cos_r = rot.cos();
            let sin_r = rot.sin();

            // Transform diamond corners [top, right, bottom, left]
            let pts = [
                (0.0_f32, -h),
                (w * cos_r, sin_r * (h * 0.3)),
                (0.0_f32, h),
                (-w * cos_r, -sin_r * (h * 0.3)),
            ];

            // 4 Crystal Facets
            let mut facet_col1 = elem_col;
            facet_col1[3] = 0.85;
            let mut facet_col2 = sec_col;
            facet_col2[3] = 0.55;

            self.draw_triangle(
                x,
                shard_y,
                x + pts[0].0,
                shard_y + pts[0].1,
                x + pts[1].0,
                shard_y + pts[1].1,
                facet_col1,
            );
            self.draw_triangle(
                x,
                shard_y,
                x + pts[1].0,
                shard_y + pts[1].1,
                x + pts[2].0,
                shard_y + pts[2].1,
                facet_col2,
            );
            self.draw_triangle(
                x,
                shard_y,
                x + pts[2].0,
                shard_y + pts[2].1,
                x + pts[3].0,
                shard_y + pts[3].1,
                facet_col1,
            );
            self.draw_triangle(
                x,
                shard_y,
                x + pts[3].0,
                shard_y + pts[3].1,
                x + pts[0].0,
                shard_y + pts[0].1,
                facet_col2,
            );

            // Facet edge highlights
            self.draw_line(
                x + pts[0].0,
                shard_y + pts[0].1,
                x + pts[2].0,
                shard_y + pts[2].1,
                1.8,
                [1.0, 1.0, 1.0, 0.9],
            );
            self.draw_line(
                x + pts[1].0,
                shard_y + pts[1].1,
                x + pts[3].0,
                shard_y + pts[3].1,
                1.5,
                [0.8, 0.95, 1.0, 0.8],
            );

            // Orbiting satellite mini-crystals
            for i in 0..3 {
                let sat_ang = rot * 1.5 + (i as f32) * 2.094;
                let sat_x = x + sat_ang.cos() * (s * 0.85);
                let sat_y = shard_y + sat_ang.sin() * (s * 0.45);
                self.draw_triangle(
                    sat_x,
                    sat_y - 4.5,
                    sat_x + 3.5,
                    sat_y + 3.0,
                    sat_x - 3.5,
                    sat_y + 3.0,
                    [0.85, 0.95, 1.0, 0.9],
                );
            }
        } else {
            // --- Magma Slime / Ember Blob (Squash & Stretch Gelatin Physics) ---
            let bounce_cycle = ((anim_time * 9.0).sin()).abs();
            let squash_x = 1.0 + (1.0 - bounce_cycle) * 0.35;
            let squash_y = 1.0 + bounce_cycle * 0.32;

            let rx = s * 0.58 * squash_x;
            let ry = s * 0.45 * squash_y;
            let body_y = draw_y + s * 0.1 - bounce_cycle * 9.0;

            // 1. Gelatinous Slime Droplet Body
            self.draw_ellipse(x, body_y, rx, ry, 16, elem_col);
            self.draw_ring(x, body_y, rx, 2.0, 16, sec_col);

            // Droplet peak on top
            let peak_y = body_y - ry * 1.25;
            self.draw_triangle(
                x - rx * 0.45,
                body_y - ry * 0.3,
                x,
                peak_y,
                x + rx * 0.45,
                body_y - ry * 0.3,
                elem_col,
            );

            // 2. Inner Glowing Hot Molten Core
            let core_r = (rx * 0.38).min(ry * 0.45);
            self.draw_circle(x, body_y - ry * 0.15, core_r, 12, [1.0, 0.95, 0.45, 0.95]);
            self.draw_circle(
                x,
                body_y - ry * 0.15,
                core_r * 0.5,
                8,
                [1.0, 1.0, 1.0, 0.95],
            );

            // 3. Expressive Angry Stick Eyes
            let eye_x = x + dir * (rx * 0.32);
            let eye_y = body_y - ry * 0.35;
            self.draw_circle(eye_x, eye_y, 2.4, 8, [0.08, 0.12, 0.18, 1.0]);
            self.draw_circle(eye_x, eye_y, 1.0, 6, [1.0, 0.9, 0.2, 1.0]);
            // Angry brow
            self.draw_line(
                eye_x - dir * 3.5,
                eye_y - 3.5,
                eye_x + dir * 3.5,
                eye_y - 1.5,
                1.8,
                [0.08, 0.12, 0.18, 1.0],
            );

            // 4. Molten heat bubble popping
            let bubble_t = (anim_time * 5.0) % 1.0;
            let bubble_x = x - dir * (rx * 0.35);
            let bubble_y = body_y - ry * 0.2 - bubble_t * 8.0;
            self.draw_circle(
                bubble_x,
                bubble_y,
                1.8 * (1.0 - bubble_t),
                6,
                [1.0, 0.6, 0.1, 0.9],
            );
        }
    }
}
