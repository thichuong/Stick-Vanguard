#![allow(dead_code)]

use crate::types::EnemyEntity;
use crate::webgl::WebGl2Renderer;

impl WebGl2Renderer {
    #[allow(clippy::too_many_arguments)]
    pub(crate) fn render_enemy_arachnid(
        &mut self,
        _enemy: &EnemyEntity,
        x: f32,
        draw_y: f32,
        size: f32,
        dir: f32,
        anim_time: f32,
        elem_col: [f32; 4],
        sec_col: [f32; 4],
        _is_boss: bool,
    ) {
        let s = size * 0.85;
        let body_y = draw_y - s * 0.1;

        // 1. Poison Abdomen (bulbous rear sack)
        let abd_x = x - dir * (s * 0.42);
        let abd_y = body_y - s * 0.1;
        self.draw_ellipse(abd_x, abd_y, s * 0.52, s * 0.38, 14, elem_col);
        self.draw_ring(abd_x, abd_y, s * 0.52, 1.8, 14, sec_col);

        // Fluorescent poison hourglass / warning skull marking
        let mark_pulse = (anim_time * 6.0).sin() * 0.15 + 0.85;
        self.draw_circle(abd_x, abd_y, 3.2 * mark_pulse, 8, [0.55, 0.95, 0.15, 0.95]);
        self.draw_triangle(
            abd_x - 3.0,
            abd_y - 4.0,
            abd_x,
            abd_y,
            abd_x + 3.0,
            abd_y - 4.0,
            [0.55, 0.95, 0.15, 0.95],
        );
        self.draw_triangle(
            abd_x - 3.0,
            abd_y + 4.0,
            abd_x,
            abd_y,
            abd_x + 3.0,
            abd_y + 4.0,
            [0.55, 0.95, 0.15, 0.95],
        );

        // 2. Cephalothorax (front head/thorax)
        let head_x = x + dir * (s * 0.28);
        let head_y = body_y - s * 0.05;
        self.draw_circle(head_x, head_y, s * 0.28, 12, elem_col);

        // Cluster of 4 predatory red eyes
        for &(ox, oy) in &[(dir * 3.0, -3.0), (dir * 4.5, -1.0), (dir * 4.5, 1.5), (dir * 3.0, 3.5)] {
            self.draw_circle(head_x + ox, head_y + oy, 1.4, 6, [0.96, 0.2, 0.2, 1.0]);
        }

        // Chelicerae & Dripping Poison Fangs
        let bite_anim = (anim_time * 10.0).sin() * 2.5;
        let fang_top_x = head_x + dir * (s * 0.26) + dir * bite_anim;
        let fang_bot_x = head_x + dir * (s * 0.45) + dir * bite_anim;

        self.draw_line(fang_top_x, head_y - 3.5, fang_bot_x, head_y - 1.0, 2.2, [0.96, 0.2, 0.2, 1.0]);
        self.draw_line(fang_top_x, head_y + 3.5, fang_bot_x, head_y + 1.0, 2.2, [0.96, 0.2, 0.2, 1.0]);
        // Venom droplets
        self.draw_circle(fang_bot_x, head_y, 1.8, 6, [0.45, 0.95, 0.1, 0.95]);

        // 3. 8 Multi-jointed Spider Legs (4 per side with realistic alternating crawl gait)
        let leg_count = 4;
        for i in 0..leg_count {
            let leg_phase = anim_time * 12.0 + (i as f32) * 1.57;
            let leg_lift = leg_phase.sin() * (s * 0.22);
            let leg_reach = leg_phase.cos() * (s * 0.18);

            let spread_x = x + ((i as f32) - 1.5) * (s * 0.22);

            // Upper knee (joint 1) arches high
            let knee_up_x = spread_x + dir * leg_reach - dir * 4.0;
            let knee_up_y = body_y - s * 0.55 + leg_lift;
            // Foot tip (joint 2) plants on ground
            let foot_up_x = knee_up_x - dir * (s * 0.25);
            let foot_up_y = body_y - s * 0.85 + leg_lift.max(0.0);

            // Left / Upper side legs
            self.draw_line(x, body_y, knee_up_x, knee_up_y, 2.0, elem_col);
            self.draw_line(knee_up_x, knee_up_y, foot_up_x, foot_up_y, 1.8, sec_col);

            // Lower / Bottom side legs (alternating phase)
            let knee_dn_x = spread_x - dir * leg_reach + dir * 4.0;
            let knee_dn_y = body_y + s * 0.45 - leg_lift;
            let foot_dn_x = knee_dn_x + dir * (s * 0.25);
            let foot_dn_y = body_y + s * 0.85 - leg_lift.max(0.0);

            self.draw_line(x, body_y, knee_dn_x, knee_dn_y, 2.0, elem_col);
            self.draw_line(knee_dn_x, knee_dn_y, foot_dn_x, foot_dn_y, 1.8, sec_col);
        }
    }
}

