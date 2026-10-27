#![allow(dead_code)]

use crate::types::EnemyEntity;
use crate::webgl::WebGl2Renderer;

impl WebGl2Renderer {
    #[allow(clippy::too_many_arguments)]
    pub(crate) fn render_enemy_serpent(
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
        let is_hydra = enemy.type_id == "VOID_HYDRA_BOSS";
        let is_eel = enemy.type_id == "SPARK_EEL";
        let s = size * 0.85;

        let num_segs = if is_hydra { 10 } else { 8 };
        let seg_len = (s * 1.9) / (num_segs as f32);
        let wave_freq = if is_eel { 12.0 } else { 8.0 };
        let wave_amp = s * 0.32;

        let mut seg_points: Vec<(f32, f32, f32)> = Vec::with_capacity(num_segs);

        // 1. Calculate undulating sinusoidal spine points
        for i in 0..num_segs {
            let ratio = (i as f32) / (num_segs as f32);
            let px = x - dir * ((i as f32) * seg_len) + dir * (s * 0.35);
            let wave = (anim_time * wave_freq - (i as f32) * 0.75).sin() * wave_amp * (1.0 - ratio * 0.35);
            let py = draw_y - s * 0.1 + wave;
            let radius = s * (0.45 - ratio * 0.28).max(0.12);
            seg_points.push((px, py, radius));
        }

        // 2. Draw body segments from tail to head
        for i in (1..num_segs).rev() {
            let (x1, y1, r1) = seg_points[i - 1];
            let (x2, y2, r2) = seg_points[i];

            // Segment link
            let col = if i % 2 == 0 { elem_col } else { sec_col };
            self.draw_line(x1, y1, x2, y2, (r1 + r2) * 0.95, col);
            self.draw_circle(x2, y2, r2, 10, col);
        }
        if let Some(&(hx, hy, hr)) = seg_points.first() {
            self.draw_circle(hx, hy, hr, 12, elem_col);
        }

        // 3. Eel dorsal lightning fin & electric spikes
        if is_eel {
            for i in (0..num_segs.saturating_sub(1)).step_by(2) {
                let (px, py, _) = seg_points[i];
                let fin_tip_x = px - dir * 2.0;
                let fin_tip_y = py - s * 0.38 - (anim_time * 15.0 + i as f32).sin().abs() * 3.0;
                self.draw_line(px, py, fin_tip_x, fin_tip_y, 1.8, [0.99, 0.92, 0.2, 0.95]);
                if i + 1 < num_segs {
                    let (nx, ny, _) = seg_points[i + 1];
                    self.draw_line(fin_tip_x, fin_tip_y, nx, ny, 1.5, [0.38, 0.85, 0.98, 0.9]);
                }
            }
        }

        // 4. Void Hydra 3 Heads vs Single Serpent Head
        let base_pt = seg_points[0];
        let head_offsets: &[(f32, f32)] = if is_hydra {
            &[(-s * 0.45, -0.6), (0.0, 0.0), (s * 0.45, 0.6)]
        } else {
            &[(0.0, 0.0)]
        };

        for (idx, &(y_off, phase_off)) in head_offsets.iter().enumerate() {
            let head_anim = (anim_time * 6.5 + phase_off * 2.2).sin() * (s * 0.18);
            let neck_mid_x = base_pt.0 + dir * (s * 0.35);
            let neck_mid_y = base_pt.1 + y_off * 0.5 + head_anim * 0.5;

            let hx = base_pt.0 + dir * (s * 0.75);
            let hy = base_pt.1 + y_off * 0.8 + head_anim;

            // Draw neck curve
            self.draw_line(base_pt.0, base_pt.1, neck_mid_x, neck_mid_y, 3.2, elem_col);
            self.draw_line(neck_mid_x, neck_mid_y, hx, hy, 2.8, elem_col);

            // Serpent / Hydra Head (Diamond viper wedge)
            let head_w = if is_hydra && idx == 1 { s * 0.48 } else { s * 0.38 };
            let head_tip_x = hx + dir * head_w;
            let head_tip_y = hy;

            self.draw_triangle(
                hx - dir * 4.0,
                hy - head_w * 0.45,
                head_tip_x,
                head_tip_y,
                hx - dir * 4.0,
                hy + head_w * 0.45,
                elem_col,
            );
            self.draw_circle(hx, hy, head_w * 0.38, 10, elem_col);

            // Void horns for Hydra heads
            if is_hydra {
                self.draw_line(
                    hx - dir * 2.0,
                    hy - head_w * 0.35,
                    hx - dir * (s * 0.35),
                    hy - head_w * 0.85,
                    2.2,
                    sec_col,
                );
            }

            // Slit eye
            let eye_col = if is_hydra {
                [0.96, 0.25, 0.37, 1.0]
            } else {
                [0.99, 0.94, 0.35, 1.0]
            };
            self.draw_circle(hx + dir * 2.0, hy - 2.0, 1.8, 6, eye_col);

            // Flicking red forked tongue
            let tongue_cycle = ((anim_time * 14.0 + (idx as f32) * 1.5).sin()).max(0.0);
            if tongue_cycle > 0.3 {
                let tx = head_tip_x + dir * (6.0 * tongue_cycle);
                self.draw_line(head_tip_x, head_tip_y, tx, head_tip_y, 1.6, [0.95, 0.2, 0.2, 1.0]);
                self.draw_line(tx, head_tip_y, tx + dir * 3.5, head_tip_y - 2.5, 1.2, [0.95, 0.2, 0.2, 1.0]);
                self.draw_line(tx, head_tip_y, tx + dir * 3.5, head_tip_y + 2.5, 1.2, [0.95, 0.2, 0.2, 1.0]);
            }
        }
    }
}

