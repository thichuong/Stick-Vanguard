#![allow(dead_code)]

use crate::types::EnemyEntity;
use crate::webgl::WebGl2Renderer;

impl WebGl2Renderer {
    #[allow(clippy::too_many_arguments)]
    pub(crate) fn render_enemy_humanoid(
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
        let s = size * 0.9;
        let id = enemy.type_id.as_str();

        let is_runner = id == "STICK_RUNNER";
        let is_warlock = id == "NECRO_WARLOCK";
        let is_skeleton = id == "SKELETON_MINION";
        let is_imp = id == "FIRE_IMP";
        let is_treant = id == "TREANT_GUARD";
        let is_vanguard = id == "STEEL_VANGUARD";
        let is_paladin = id == "LIGHT_PALADIN";
        let is_saboteur = id == "VOID_SABOTEUR";
        let is_shaman = id == "DRUID_SHAMAN";

        // Locomotion physics
        let walk_speed = if is_runner { 15.0 } else { 9.0 };
        let walk = (anim_time * walk_speed).sin();
        let stride = walk * (if is_runner { s * 0.45 } else { s * 0.3 });
        let lean_x = if is_runner { dir * 7.0 } else { 0.0 };

        let head_r = s * 0.28;
        let body_y = draw_y - s * 0.15;
        let head_y = body_y - s * 0.55;

        // 1. Head & Special Headgear
        let head_cx = x + lean_x;
        self.draw_circle(head_cx, head_y, head_r, 12, elem_col);

        // Eyes
        let eye_col = if is_imp {
            [0.99, 0.94, 0.35, 1.0]
        } else if is_skeleton {
            [0.1, 0.1, 0.15, 1.0]
        } else {
            [0.08, 0.12, 0.18, 1.0]
        };
        self.draw_circle(head_cx + dir * (head_r * 0.4), head_y - 1.0, 1.6, 6, eye_col);

        // Headgear variations
        if is_runner {
            // Red ninja bandana flying back in wind
            let band_tail_x = head_cx - dir * (head_r + 10.0);
            let band_tail_y = head_y + walk * 4.0;
            self.draw_line(head_cx - dir * head_r, head_y, band_tail_x, band_tail_y, 2.2, [0.94, 0.2, 0.2, 1.0]);
            self.draw_circle(head_cx, head_y - head_r * 0.5, head_r * 0.8, 10, [0.94, 0.2, 0.2, 0.4]);
        } else if is_imp {
            // Imp devil horns
            self.draw_triangle(
                head_cx - 4.0,
                head_y - head_r,
                head_cx - 6.0,
                head_y - head_r - 7.0,
                head_cx - 1.0,
                head_y - head_r,
                [0.85, 0.15, 0.15, 1.0],
            );
            self.draw_triangle(
                head_cx + 1.0,
                head_y - head_r,
                head_cx + 6.0,
                head_y - head_r - 7.0,
                head_cx + 4.0,
                head_y - head_r,
                [0.85, 0.15, 0.15, 1.0],
            );
        } else if is_treant {
            // Leafy tree branches sprouting from head
            self.draw_line(head_cx, head_y - head_r, head_cx, head_y - head_r - 8.0, 2.2, [0.45, 0.25, 0.15, 1.0]);
            self.draw_circle(head_cx + 4.0, head_y - head_r - 9.0, 3.2, 8, [0.2, 0.75, 0.25, 0.95]);
        } else if is_vanguard || is_paladin {
            // Helmet visor crest
            self.draw_line(head_cx - 4.0, head_y - 1.5, head_cx + 4.0, head_y - 1.5, 2.0, sec_col);
            if is_paladin {
                // Golden halo crest
                self.draw_ellipse(head_cx, head_y - head_r - 4.0, 5.0, 2.0, 10, [0.99, 0.92, 0.35, 0.95]);
            }
        } else if is_shaman {
            // Antler horns
            self.draw_line(head_cx - 3.0, head_y - head_r, head_cx - 7.0, head_y - head_r - 7.0, 2.0, sec_col);
            self.draw_line(head_cx + 3.0, head_y - head_r, head_cx + 7.0, head_y - head_r - 7.0, 2.0, sec_col);
        }

        // 2. Spine & Ribs
        let neck_y = head_y + head_r;
        let pelvis_x = x;
        let pelvis_y = body_y + s * 0.22;
        self.draw_line(head_cx, neck_y, pelvis_x, pelvis_y, 2.8, elem_col);

        // Skeleton Ribs
        if is_skeleton {
            for r in 0..3 {
                let ry = neck_y + 4.0 + (r as f32) * 4.0;
                self.draw_line(x - 5.0, ry, x + 5.0, ry, 1.8, [0.95, 0.95, 0.95, 1.0]);
            }
        }

        // Imp pointy spade tail
        if is_imp {
            let tail_tip_x = x - dir * (s * 0.6);
            let tail_tip_y = pelvis_y - (anim_time * 8.0).sin() * 5.0;
            self.draw_line(pelvis_x, pelvis_y, tail_tip_x, tail_tip_y, 2.0, elem_col);
            self.draw_triangle(
                tail_tip_x,
                tail_tip_y - 4.0,
                tail_tip_x - dir * 6.0,
                tail_tip_y,
                tail_tip_x,
                tail_tip_y + 4.0,
                [0.9, 0.2, 0.2, 1.0],
            );
        }

        // 3. Legs (Dynamic Running / Walking Gait)
        let foot_l_x = pelvis_x - dir * 4.0 - stride;
        let foot_l_y = pelvis_y + s * 0.55;
        let foot_r_x = pelvis_x + dir * 6.0 + stride;
        let foot_r_y = pelvis_y + s * 0.55;

        self.draw_line(pelvis_x, pelvis_y, foot_l_x, foot_l_y, 2.4, elem_col);
        self.draw_line(pelvis_x, pelvis_y, foot_r_x, foot_r_y, 2.4, elem_col);

        // 4. Arms & Weapons
        let shoulder_y = neck_y + 4.0;
        let hand_swing = (anim_time * 10.0).sin() * 6.0;
        let weapon_hand_x = x + dir * (s * 0.55) + dir * hand_swing;
        let weapon_hand_y = shoulder_y + 2.0 - walk * 3.0;

        // Front arm
        self.draw_line(head_cx, shoulder_y, weapon_hand_x, weapon_hand_y, 2.4, elem_col);
        // Back arm
        self.draw_line(head_cx, shoulder_y, x - dir * (s * 0.35), shoulder_y + 4.0 + walk * 3.0, 2.2, elem_col);

        // Weapon Render by Archetype Role
        if is_warlock {
            // Necromancer Bone Staff with glowing purple skull orb
            self.draw_line(weapon_hand_x, weapon_hand_y - 18.0, weapon_hand_x, weapon_hand_y + 12.0, 2.2, [0.35, 0.3, 0.25, 1.0]);
            self.draw_circle(weapon_hand_x, weapon_hand_y - 18.0, 4.5, 10, sec_col);
            self.draw_circle(weapon_hand_x, weapon_hand_y - 18.0, 2.0, 6, [0.95, 0.5, 1.0, 1.0]);
        } else if is_imp {
            // Fire Trident
            self.draw_line(weapon_hand_x, weapon_hand_y - 12.0, weapon_hand_x, weapon_hand_y + 8.0, 2.0, [0.95, 0.45, 0.1, 1.0]);
            self.draw_line(weapon_hand_x - 3.5, weapon_hand_y - 12.0, weapon_hand_x - 3.5, weapon_hand_y - 16.0, 1.6, [0.95, 0.45, 0.1, 1.0]);
            self.draw_line(weapon_hand_x + 3.5, weapon_hand_y - 12.0, weapon_hand_x + 3.5, weapon_hand_y - 16.0, 1.6, [0.95, 0.45, 0.1, 1.0]);
            self.draw_line(weapon_hand_x, weapon_hand_y - 12.0, weapon_hand_x, weapon_hand_y - 18.0, 1.8, [0.95, 0.45, 0.1, 1.0]);
        } else if is_vanguard || is_paladin || id == "STICK_WARRIOR" {
            // Knight Sword & Shield
            self.draw_line(weapon_hand_x, weapon_hand_y, weapon_hand_x + dir * 14.0, weapon_hand_y - 12.0, 2.6, sec_col);
            self.draw_line(weapon_hand_x + dir * 3.0, weapon_hand_y - 2.0, weapon_hand_x - dir * 2.0, weapon_hand_y + 4.0, 2.0, sec_col);

            // Shield on back arm
            let shield_x = x - dir * (s * 0.25);
            let shield_y = shoulder_y + 4.0;
            self.draw_circle(shield_x, shield_y, s * 0.24, 10, sec_col);
            self.draw_ring(shield_x, shield_y, s * 0.24, 1.8, 10, elem_col);
        } else if is_saboteur {
            // Dual Void Daggers
            self.draw_line(weapon_hand_x, weapon_hand_y, weapon_hand_x + dir * 8.0, weapon_hand_y - 8.0, 2.2, sec_col);
            self.draw_line(x - dir * (s * 0.35), shoulder_y + 4.0, x - dir * (s * 0.45), shoulder_y - 4.0, 2.2, sec_col);
        } else if is_shaman {
            // Druid Oak Staff with emerald gem
            self.draw_line(weapon_hand_x, weapon_hand_y - 16.0, weapon_hand_x, weapon_hand_y + 10.0, 2.2, [0.45, 0.28, 0.15, 1.0]);
            self.draw_circle(weapon_hand_x, weapon_hand_y - 16.0, 3.5, 8, [0.2, 0.85, 0.3, 0.95]);
        }
    }
}

