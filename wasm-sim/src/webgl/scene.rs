#![allow(dead_code)]

use super::primitives::{element_color_rgba, parse_hex_color};
use super::WebGl2Renderer;
use crate::config::GameConfigRegistry;
use crate::state::RustGameState;
use crate::types::{ElementType, EnemyState, PlacementType, TowerBranch, TowerType};

impl WebGl2Renderer {
    pub fn build_scene(
        &mut self,
        registry: &GameConfigRegistry,
        state: &RustGameState,
        anim_time: f32,
        alpha: f32,
    ) {
        self.color_vertices.clear();
        self.tex_vertices.clear();

        let map = &state.current_map;
        let width = map.width.unwrap_or(1000.0);
        let height = map.height.unwrap_or(650.0);
        self.width = width;
        self.height = height;

        // 1. Tactical Background & Grid
        let bg_color = if map.theme_color.is_empty() {
            parse_hex_color("#1e293b", 1.0)
        } else {
            parse_hex_color(&map.theme_color, 1.0)
        };
        self.draw_rect(0.0, 0.0, width, height, bg_color);

        let grid_color = parse_hex_color("#334155", 0.45);
        let mut gx = 0.0;
        while gx <= width {
            self.draw_line(gx, 0.0, gx, height, 1.0, grid_color);
            gx += 40.0;
        }
        let mut gy = 0.0;
        while gy <= height {
            self.draw_line(0.0, gy, width, gy, 1.0, grid_color);
            gy += 40.0;
        }

        // 2. Ground Roads
        let road_w = map.road_width.unwrap_or(42.0);
        let road_col = if map.road_color.is_empty() {
            parse_hex_color("#b45309", 1.0)
        } else {
            parse_hex_color(&map.road_color, 1.0)
        };
        let road_border = parse_hex_color("#78350f", 1.0);
        let road_dash = parse_hex_color("#d97706", 0.85);

        for lane in map.get_resolved_ground_lanes() {
            self.draw_polyline(&lane, road_w + 6.0, road_border);
            self.draw_polyline(&lane, road_w, road_col);
            for i in 0..lane.len().saturating_sub(1) {
                self.draw_dashed_line(
                    lane[i].x,
                    lane[i].y,
                    lane[i + 1].x,
                    lane[i + 1].y,
                    2.0,
                    8.0,
                    12.0,
                    0.0,
                    road_dash,
                );
            }
        }

        // 3. Rivers
        let river_w = map.river_width.unwrap_or(38.0);
        let river_col = if map.river_color.is_empty() {
            parse_hex_color("#0284c7", 1.0)
        } else {
            parse_hex_color(&map.river_color, 1.0)
        };
        let river_border = parse_hex_color("#0369a1", 1.0);
        let river_flow = [0.490, 0.827, 0.988, 0.85];

        for lane in map.get_resolved_water_lanes() {
            self.draw_polyline(&lane, river_w + 6.0, river_border);
            self.draw_polyline(&lane, river_w, river_col);
            for i in 0..lane.len().saturating_sub(1) {
                self.draw_dashed_line(
                    lane[i].x,
                    lane[i].y,
                    lane[i + 1].x,
                    lane[i + 1].y,
                    2.0,
                    14.0,
                    20.0,
                    -anim_time * 40.0,
                    river_flow,
                );
            }
        }

        // 4. Air Corridors
        let air_col = [0.204, 0.827, 0.60, 0.28];
        for (idx, lane) in map.get_resolved_air_lanes().iter().enumerate() {
            for i in 0..lane.len().saturating_sub(1) {
                self.draw_dashed_line(
                    lane[i].x,
                    lane[i].y,
                    lane[i + 1].x,
                    lane[i + 1].y,
                    2.0,
                    6.0,
                    10.0,
                    -anim_time * 25.0 - (idx as f32) * 5.0,
                    air_col,
                );
            }
        }

        // 5. Spawners & Bases
        for (idx, gs) in crate::config::MapConfig::get_unique_lane_spawns(&map.ground_lanes)
            .iter()
            .enumerate()
        {
            let pulse = (anim_time * 4.0 + idx as f32).sin() * 2.0;
            self.draw_ring(
                gs.x,
                gs.y,
                22.0 + pulse,
                2.0,
                20,
                [0.937, 0.267, 0.267, 0.4],
            );
            self.draw_circle(gs.x, gs.y, 18.0, 20, parse_hex_color("#ef4444", 1.0));
            // Procedural Skull Icon
            self.draw_circle(gs.x, gs.y - 2.0, 7.5, 14, [1.0, 1.0, 1.0, 0.95]);
            self.draw_rect(gs.x - 3.5, gs.y + 3.0, 7.0, 4.0, [1.0, 1.0, 1.0, 0.95]);
            self.draw_circle(gs.x - 2.5, gs.y - 1.5, 2.0, 10, [0.15, 0.15, 0.2, 1.0]);
            self.draw_circle(gs.x + 2.5, gs.y - 1.5, 2.0, 10, [0.15, 0.15, 0.2, 1.0]);
            self.draw_line(
                gs.x,
                gs.y + 1.0,
                gs.x,
                gs.y + 3.5,
                1.2,
                [0.15, 0.15, 0.2, 1.0],
            );
        }

        for (idx, ws) in crate::config::MapConfig::get_unique_lane_spawns(&map.water_lanes)
            .iter()
            .enumerate()
        {
            let pulse = (anim_time * 3.5 + idx as f32).sin() * 2.5;
            self.draw_ring(ws.x, ws.y, 21.0 + pulse, 2.0, 20, [0.22, 0.74, 0.97, 0.45]);
            self.draw_circle(ws.x, ws.y, 17.0, 20, parse_hex_color("#0284c7", 1.0));
            // Procedural Water Waves Icon
            let wave_col = [1.0, 1.0, 1.0, 0.95];
            self.draw_line(
                ws.x - 7.0,
                ws.y - 3.0,
                ws.x - 2.0,
                ws.y - 5.0,
                2.0,
                wave_col,
            );
            self.draw_line(
                ws.x - 2.0,
                ws.y - 5.0,
                ws.x + 3.0,
                ws.y - 2.0,
                2.0,
                wave_col,
            );
            self.draw_line(
                ws.x + 3.0,
                ws.y - 2.0,
                ws.x + 7.0,
                ws.y - 4.0,
                2.0,
                wave_col,
            );
            self.draw_line(
                ws.x - 7.0,
                ws.y + 3.0,
                ws.x - 2.0,
                ws.y + 1.0,
                2.0,
                wave_col,
            );
            self.draw_line(
                ws.x - 2.0,
                ws.y + 1.0,
                ws.x + 3.0,
                ws.y + 4.0,
                2.0,
                wave_col,
            );
            self.draw_line(
                ws.x + 3.0,
                ws.y + 4.0,
                ws.x + 7.0,
                ws.y + 2.0,
                2.0,
                wave_col,
            );
        }

        for (idx, base) in map.get_map_bases().iter().enumerate() {
            let pulse = (anim_time * 2.5 + idx as f32).sin() * 3.0;
            self.draw_ring(
                base.x,
                base.y,
                base.radius + pulse,
                2.5,
                28,
                [0.23, 0.51, 0.96, 0.35],
            );
            self.draw_circle(base.x, base.y, 28.0, 24, parse_hex_color("#1e3a8a", 1.0));
            self.draw_ring(
                base.x,
                base.y,
                28.0,
                3.0,
                24,
                parse_hex_color("#60a5fa", 1.0),
            );
            self.draw_circle(base.x, base.y, 16.0, 20, parse_hex_color("#3b82f6", 1.0));
            // Procedural Castle Keep Icon
            let castle_col = [1.0, 1.0, 1.0, 0.95];
            self.draw_rect(base.x - 8.0, base.y - 2.0, 16.0, 10.0, castle_col);
            self.draw_rect(base.x - 8.0, base.y - 7.0, 4.0, 5.0, castle_col);
            self.draw_rect(base.x - 2.0, base.y - 7.0, 4.0, 5.0, castle_col);
            self.draw_rect(base.x + 4.0, base.y - 7.0, 4.0, 5.0, castle_col);
            self.draw_rect(
                base.x - 2.5,
                base.y + 2.0,
                5.0,
                6.0,
                [0.12, 0.23, 0.54, 1.0],
            );
            self.draw_circle(base.x, base.y + 2.0, 2.5, 10, [0.12, 0.23, 0.54, 1.0]);
        }

        // 6. Placement Preview Cursor
        if let Some(active_type) = state.active_placement_type {
            let mx = state.mouse_pos.x;
            let my = state.mouse_pos.y;
            if mx > 0.0 && my > 0.0 {
                let val = state.validate_placement(mx, my, active_type.as_str());
                let bp_key = if active_type.is_trap() {
                    active_type.as_str().to_string()
                } else {
                    format!("{}_1", active_type.as_str())
                };
                if let Some(bp) = registry.towers.get(&bp_key) {
                    let preview_col = if val.valid {
                        [0.133, 0.773, 0.369, 0.45]
                    } else {
                        [0.937, 0.267, 0.267, 0.45]
                    };
                    if bp.range > 0.0 {
                        self.draw_circle(
                            mx,
                            my,
                            bp.range,
                            36,
                            [preview_col[0], preview_col[1], preview_col[2], 0.08],
                        );
                        self.draw_ring(mx, my, bp.range, 1.5, 36, preview_col);
                    }
                    self.draw_circle(mx, my, 18.0, 20, preview_col);
                }
            }
        } else if let Some(ref pt) = state.selected_build_point {
            let is_trap = pt.valid_for == "TRAP";
            let col = if is_trap {
                [0.96, 0.62, 0.12, 0.85]
            } else {
                [0.22, 0.74, 0.97, 0.85]
            };
            self.draw_ring(pt.x, pt.y, 22.0, 2.0, 24, col);
            self.draw_circle(pt.x, pt.y, 4.0, 10, col);

            if let Some(hover_type) = state.hovered_build_tower_type {
                let bp_key = if hover_type.is_trap() {
                    hover_type.as_str().to_string()
                } else {
                    format!("{}_1", hover_type.as_str())
                };
                if let Some(bp) = registry.towers.get(&bp_key) {
                    if bp.range > 0.0 {
                        self.draw_circle(
                            pt.x,
                            pt.y,
                            bp.range,
                            36,
                            [col[0], col[1], col[2], 0.08],
                        );
                        self.draw_ring(pt.x, pt.y, bp.range, 1.5, 36, col);
                    }
                }
            }
        } else if state.is_setting_rally_point {
            if let Some(ref sel_id) = state.selected_tower_id {
                if let Some(t) = state.towers.iter().find(|t| &t.id == sel_id) {
                    self.draw_ring(t.x, t.y, t.range, 2.0, 36, [0.918, 0.702, 0.031, 0.65]);
                }
            }
        }

        // 7. Towers & Traps
        for tower in &state.towers {
            let is_selected = state.selected_tower_id.as_deref() == Some(tower.id.as_str());

            if tower.tower_type == TowerType::MAGE
                && tower.tier == 4
                && tower.branch == Some(TowerBranch::A)
            {
                let c = element_color_rgba(registry, tower.element, 0.12);
                self.draw_circle(tower.x, tower.y, tower.range, 36, c);
                let ring_c = element_color_rgba(registry, tower.element, 0.45);
                self.draw_ring(tower.x, tower.y, tower.range, 1.8, 36, ring_c);
            }

            if is_selected {
                self.draw_circle(tower.x, tower.y, tower.range, 36, [1.0, 1.0, 1.0, 0.05]);
                self.draw_ring(
                    tower.x,
                    tower.y,
                    tower.range,
                    1.5,
                    36,
                    [1.0, 1.0, 1.0, 0.38],
                );

                if tower.tower_type.is_summon() && !state.is_setting_rally_point {
                    if let Some(rp) = tower.rally_point {
                        if rp.x > 0.0 && rp.y > 0.0 {
                            self.draw_dashed_line(
                                tower.x,
                                tower.y,
                                rp.x,
                                rp.y,
                                2.0,
                                5.0,
                                5.0,
                                0.0,
                                [0.918, 0.702, 0.031, 0.75],
                            );
                            self.draw_circle(rp.x, rp.y, 6.0, 12, [0.918, 0.702, 0.031, 0.85]);
                        }
                    }
                }

                if tower.tower_type == TowerType::MAGE
                    && tower.tier == 4
                    && tower.branch == Some(TowerBranch::B)
                {
                    for other in &state.towers {
                        if other.buff_source_id.as_deref() == Some(tower.id.as_str()) {
                            self.draw_dashed_line(
                                tower.x,
                                tower.y,
                                other.x,
                                other.y,
                                1.8,
                                5.0,
                                5.0,
                                0.0,
                                [0.659, 0.333, 0.969, 0.65],
                            );
                        }
                    }
                }
            }

            if tower.placement == PlacementType::ROADSIDE {
                self.render_roadside_tower(registry, tower, is_selected, anim_time);
            } else {
                self.render_trap(registry, tower, is_selected, anim_time);
            }
        }

        // 8. Summoned Soldiers / Dragons / Fairies
        for soldier in &state.soldiers {
            self.render_soldier(registry, soldier, anim_time, alpha);
        }

        // 9. Enemies
        for enemy in &state.enemies {
            if enemy.hp <= 0.0 || enemy.state == EnemyState::DEAD {
                continue;
            }
            self.render_enemy(registry, enemy, anim_time, alpha);
        }

        // 10. Projectiles
        for p in &state.projectiles {
            let px = p.prev_x.map(|px| px + (p.x - px) * alpha).unwrap_or(p.x);
            let py = p.prev_y.map(|py| py + (py - py) * alpha).unwrap_or(p.y);
            let disp_elem = p
                .damage_payload
                .secondary_element
                .unwrap_or(p.damage_payload.element);
            let c = element_color_rgba(registry, disp_elem, 0.95);

            let is_dragon_shot = p.damage_payload.element == ElementType::DRAGON
                || (p.aoe_radius >= 45.0 && !p.is_parabolic);
            let is_fairy_shot = p.damage_payload.element == ElementType::FAIRY;
            let is_soldier_javelin = p.damage_payload.source_id.starts_with("soldier-");

            if is_dragon_shot {
                // Large fiery dragon breath orb with outer halo & hot molten core
                let rad = 7.0;
                let mut halo = c;
                halo[3] = 0.35;
                self.draw_circle(px, py, rad * 1.6, 12, halo);
                self.draw_circle(px, py, rad, 10, c);
                self.draw_circle(px, py, rad * 0.55, 8, [1.0, 0.94, 0.55, 0.95]);
            } else if is_fairy_shot {
                // Starlight fey missile with radiant fairy aura & glowing white-pink core
                let rad = 5.0;
                let fairy_color = element_color_rgba(registry, ElementType::FAIRY, 0.40);
                self.draw_circle(px, py, rad * 1.6, 10, fairy_color);
                self.draw_circle(px, py, rad, 8, c);
                self.draw_circle(px, py, rad * 0.5, 6, [1.0, 1.0, 1.0, 0.95]);
            } else if is_soldier_javelin {
                // Sleek javelin / throwing arrow with sharp front core
                let rad = 4.0;
                let mut glow = c;
                glow[3] = 0.45;
                self.draw_circle(px, py, rad * 1.35, 8, glow);
                self.draw_circle(px, py, rad, 8, c);
                self.draw_circle(px, py, rad * 0.45, 6, [1.0, 1.0, 1.0, 0.9]);
            } else {
                let rad = if p.is_parabolic { 6.0 } else { 4.0 };
                self.draw_circle(px, py, rad, 10, c);
                self.draw_circle(px, py, rad * 0.5, 8, [1.0, 1.0, 1.0, 0.9]);
            }
        }

        // 11. Particles (Fast Quad / Diamond for size <= 3.5, LUT Circle for larger)
        for pt in &state.particles {
            let px = pt.prev_x.map(|px| px + (pt.x - px) * alpha).unwrap_or(pt.x);
            let py = pt.prev_y.map(|py| py + (pt.y - py) * alpha).unwrap_or(pt.y);
            let ratio = (pt.life_time / pt.max_life_time.max(0.01)).clamp(0.0, 1.0);
            let c = parse_hex_color(&pt.color, ratio);
            let r = pt.size * ratio.max(0.4);
            if r <= 3.5 {
                self.color_vertices.reserve(36);
                self.color_vertices.extend_from_slice(&[
                    px, py - r, c[0], c[1], c[2], c[3],
                    px + r, py, c[0], c[1], c[2], c[3],
                    px, py + r, c[0], c[1], c[2], c[3],
                    px, py - r, c[0], c[1], c[2], c[3],
                    px, py + r, c[0], c[1], c[2], c[3],
                    px - r, py, c[0], c[1], c[2], c[3],
                ]);
            } else {
                self.draw_circle(px, py, r, 8, c);
            }
        }
    }
}
