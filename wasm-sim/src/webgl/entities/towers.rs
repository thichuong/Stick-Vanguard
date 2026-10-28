#![allow(dead_code)]

use crate::config::GameConfigRegistry;
use crate::types::{TowerBranch, TowerType};
use crate::webgl::primitives::{element_color_rgba, parse_hex_color};
use crate::webgl::WebGl2Renderer;
use std::f32::consts::PI;

impl WebGl2Renderer {
    pub(crate) fn render_roadside_tower(
        &mut self,
        registry: &GameConfigRegistry,
        tower: &crate::types::TowerEntity,
        is_selected: bool,
        anim_time: f32,
    ) {
        let x = tower.x;
        let y = tower.y;

        let base_fill = if is_selected {
            parse_hex_color("#1e40af", 1.0)
        } else {
            parse_hex_color("#334155", 1.0)
        };
        let base_stroke = if is_selected {
            parse_hex_color("#60a5fa", 1.0)
        } else {
            parse_hex_color("#64748b", 1.0)
        };
        self.draw_circle(x, y, 18.0, 36, base_fill);
        self.draw_ring(x, y, 18.0, 2.5, 36, base_stroke);

        if let Some(sec_el) = tower.secondary_element {
            if tower.tower_type != TowerType::MAGE {
                let ec = element_color_rgba(registry, sec_el, 0.9);
                self.draw_ring(x, y, 20.5, 1.8, 36, ec);
            }
        }

        if let Some(ref buffed) = tower.buffed_elements {
            if let Some(&b0) = buffed.first() {
                let bc = element_color_rgba(registry, b0, 0.85);
                self.draw_ring(x, y, 22.5 + (anim_time * 4.0).sin() * 1.5, 1.8, 36, bc);
            }
        }

        match tower.tower_type {
            TowerType::BARRACKS => {
                let c = if tower.tier == 4 && tower.branch == Some(TowerBranch::A) {
                    parse_hex_color("#fef08a", 1.0)
                } else {
                    parse_hex_color("#94a3b8", 1.0)
                };
                self.draw_rounded_rect(x - 12.0, y - 10.0, 24.0, 18.0, 2.5, c);
                self.draw_rounded_rect(
                    x - 4.0,
                    y - 1.0,
                    8.0,
                    9.0,
                    1.5,
                    parse_hex_color("#1e293b", 1.0),
                );
                self.draw_line(
                    x + 6.0,
                    y - 10.0,
                    x + 6.0,
                    y - 22.0,
                    2.0,
                    parse_hex_color("#ef4444", 1.0),
                );
            }
            TowerType::ARCHER => {
                let wood = parse_hex_color("#78350f", 1.0);
                self.draw_line(x - 9.0, y + 10.0, x - 6.0, y - 14.0, 3.0, wood);
                self.draw_line(x + 9.0, y + 10.0, x + 6.0, y - 14.0, 3.0, wood);
                self.draw_rounded_rect(
                    x - 11.0,
                    y - 16.0,
                    22.0,
                    5.0,
                    2.0,
                    parse_hex_color("#92400e", 1.0),
                );
                let green = parse_hex_color("#10b981", 1.0);
                self.draw_circle(x, y - 22.0, 4.0, 20, green);
            }
            TowerType::MAGE => {
                let spire = parse_hex_color("#475569", 1.0);
                self.draw_triangle(x - 8.0, y + 8.0, x, y - 14.0, x + 8.0, y + 8.0, spire);
                let fy = y - 24.0 + (anim_time * 3.0).sin() * 3.0;
                let c1 = element_color_rgba(registry, tower.element, 1.0);
                if let Some(sec) = tower.secondary_element {
                    let c2 = element_color_rgba(registry, sec, 1.0);
                    let ang = anim_time * 3.0;
                    self.draw_circle(x + ang.cos() * 7.0, fy + ang.sin() * 3.0, 5.0, 24, c1);
                    self.draw_circle(
                        x + (ang + PI).cos() * 7.0,
                        fy + (ang + PI).sin() * 3.0,
                        5.0,
                        24,
                        c2,
                    );
                } else {
                    self.draw_circle(x, fy, 6.0, 24, c1);
                }
            }
            TowerType::ARTILLERY => {
                self.draw_circle(x, y - 2.0, 11.0, 28, parse_hex_color("#1e293b", 1.0));
                self.draw_rounded_rect(
                    x - 5.0,
                    y - 14.0,
                    10.0,
                    14.0,
                    2.0,
                    parse_hex_color("#334155", 1.0),
                );
            }
            TowerType::DragonNest => {
                self.draw_circle(x, y, 13.0, 28, parse_hex_color("#7c2d12", 1.0));
                self.draw_circle(x, y - 4.0, 7.0, 24, parse_hex_color("#f97316", 1.0));
            }
            TowerType::FairyTree => {
                self.draw_rounded_rect(
                    x - 4.0,
                    y - 6.0,
                    8.0,
                    14.0,
                    2.0,
                    parse_hex_color("#78350f", 1.0),
                );
                self.draw_circle(x, y - 12.0, 12.0, 28, parse_hex_color("#f472b6", 0.9));
            }
            TowerType::HeroicAltar => {
                self.draw_rounded_rect(
                    x - 10.0,
                    y - 8.0,
                    20.0,
                    16.0,
                    2.5,
                    parse_hex_color("#312e81", 1.0),
                );
                self.draw_circle(
                    x,
                    y - 14.0 + (anim_time * 3.0).sin() * 2.0,
                    6.0,
                    24,
                    parse_hex_color("#818cf8", 0.95),
                );
            }
            _ => {}
        }

        // Tier pips
        let star_c = parse_hex_color("#facc15", 1.0);
        let tier_count = tower.tier as usize;
        let start_x = x - ((tier_count.saturating_sub(1)) as f32) * 4.5;
        for i in 0..tier_count {
            self.draw_circle(start_x + (i as f32) * 9.0, y + 16.0, 2.8, 16, star_c);
        }

        // Disabled overlay
        if tower.disabled_timer.unwrap_or(0.0) > 0.0 {
            self.draw_ring(x, y, 20.0, 2.5, 32, parse_hex_color("#facc15", 0.9));
        }
    }

    pub(crate) fn render_trap(
        &mut self,
        registry: &GameConfigRegistry,
        trap: &crate::types::TowerEntity,
        is_selected: bool,
        _anim_time: f32,
    ) {
        let x = trap.x;
        let y = trap.y;
        let elem_c = element_color_rgba(registry, trap.element, 0.85);
        self.draw_circle(x, y, 13.0, 24, parse_hex_color("#1e293b", 0.85));
        self.draw_ring(x, y, 13.0, if is_selected { 2.5 } else { 1.8 }, 24, elem_c);
        if trap.attack_cooldown <= 0.0 {
            self.draw_circle(x, y, 5.5, 20, elem_c);
        }
    }
}
