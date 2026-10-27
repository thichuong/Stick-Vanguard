#![allow(dead_code)]

use super::WebGl2Renderer;
use crate::types::Vector2D;
use serde::{Deserialize, Serialize};
use std::f32::consts::PI;

#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AtlasUvRect {
    pub u0: f32,
    pub v0: f32,
    pub u1: f32,
    pub v1: f32,
    pub w: f32,
    pub h: f32,
}

pub fn parse_hex_color(hex: &str, alpha: f32) -> [f32; 4] {
    let s = hex.trim().trim_start_matches('#');
    if s.len() >= 6 {
        let r = u8::from_str_radix(&s[0..2], 16).unwrap_or(255) as f32 / 255.0;
        let g = u8::from_str_radix(&s[2..4], 16).unwrap_or(255) as f32 / 255.0;
        let b = u8::from_str_radix(&s[4..6], 16).unwrap_or(255) as f32 / 255.0;
        [r, g, b, alpha]
    } else {
        [1.0, 1.0, 1.0, alpha]
    }
}

pub fn parse_element_str(s: &str) -> Option<crate::types::ElementType> {
    match s.trim().to_uppercase().as_str() {
        "FIRE" => Some(crate::types::ElementType::FIRE),
        "WATER" => Some(crate::types::ElementType::WATER),
        "EARTH" => Some(crate::types::ElementType::EARTH),
        "WIND" => Some(crate::types::ElementType::WIND),
        "LIGHTNING" => Some(crate::types::ElementType::LIGHTNING),
        "ICE" => Some(crate::types::ElementType::ICE),
        "LIGHT" => Some(crate::types::ElementType::LIGHT),
        "DARK" => Some(crate::types::ElementType::DARK),
        "GRASS" => Some(crate::types::ElementType::GRASS),
        "POISON" => Some(crate::types::ElementType::POISON),
        "STEEL" => Some(crate::types::ElementType::STEEL),
        "GHOST" => Some(crate::types::ElementType::GHOST),
        "DRAGON" => Some(crate::types::ElementType::DRAGON),
        "FAIRY" => Some(crate::types::ElementType::FAIRY),
        "PHYSICAL" => Some(crate::types::ElementType::PHYSICAL),
        _ => None,
    }
}

impl WebGl2Renderer {
    #[inline]
    pub fn push_vertex(&mut self, x: f32, y: f32, c: [f32; 4]) {
        self.color_vertices
            .extend_from_slice(&[x, y, c[0], c[1], c[2], c[3]]);
    }

    #[allow(clippy::too_many_arguments)]
    pub fn draw_triangle(
        &mut self,
        x1: f32,
        y1: f32,
        x2: f32,
        y2: f32,
        x3: f32,
        y3: f32,
        c: [f32; 4],
    ) {
        self.push_vertex(x1, y1, c);
        self.push_vertex(x2, y2, c);
        self.push_vertex(x3, y3, c);
    }

    pub fn draw_rect(&mut self, x: f32, y: f32, w: f32, h: f32, c: [f32; 4]) {
        let x2 = x + w;
        let y2 = y + h;
        self.push_vertex(x, y, c);
        self.push_vertex(x2, y, c);
        self.push_vertex(x2, y2, c);
        self.push_vertex(x, y, c);
        self.push_vertex(x2, y2, c);
        self.push_vertex(x, y2, c);
    }

    pub fn draw_line(&mut self, x1: f32, y1: f32, x2: f32, y2: f32, thickness: f32, c: [f32; 4]) {
        let dx = x2 - x1;
        let dy = y2 - y1;
        let len = (dx * dx + dy * dy).sqrt();
        if len < 0.001 {
            return;
        }
        let nx = -dy / len * (thickness * 0.5);
        let ny = dx / len * (thickness * 0.5);

        self.push_vertex(x1 + nx, y1 + ny, c);
        self.push_vertex(x1 - nx, y1 - ny, c);
        self.push_vertex(x2 - nx, y2 - ny, c);

        self.push_vertex(x1 + nx, y1 + ny, c);
        self.push_vertex(x2 - nx, y2 - ny, c);
        self.push_vertex(x2 + nx, y2 + ny, c);
    }

    #[allow(clippy::too_many_arguments)]
    pub fn draw_dashed_line(
        &mut self,
        x1: f32,
        y1: f32,
        x2: f32,
        y2: f32,
        thickness: f32,
        dash_len: f32,
        gap_len: f32,
        offset: f32,
        c: [f32; 4],
    ) {
        let dx = x2 - x1;
        let dy = y2 - y1;
        let total_len = (dx * dx + dy * dy).sqrt();
        if total_len < 1.0 {
            return;
        }
        let ux = dx / total_len;
        let uy = dy / total_len;
        let step = (dash_len + gap_len).max(2.0);
        let mut d = -(offset.rem_euclid(step));
        while d < total_len {
            let s = d.max(0.0);
            let e = (d + dash_len).min(total_len);
            if e > s {
                self.draw_line(
                    x1 + ux * s,
                    y1 + uy * s,
                    x1 + ux * e,
                    y1 + uy * e,
                    thickness,
                    c,
                );
            }
            d += step;
        }
    }

    pub fn draw_circle(&mut self, cx: f32, cy: f32, radius: f32, segments: usize, c: [f32; 4]) {
        self.draw_ellipse(cx, cy, radius, radius, segments, c);
    }

    pub fn draw_ellipse(
        &mut self,
        cx: f32,
        cy: f32,
        rx: f32,
        ry: f32,
        segments: usize,
        c: [f32; 4],
    ) {
        let segs = segments.max(6);
        let step = (PI * 2.0) / (segs as f32);
        for i in 0..segs {
            let a1 = (i as f32) * step;
            let a2 = ((i + 1) as f32) * step;
            self.push_vertex(cx, cy, c);
            self.push_vertex(cx + a1.cos() * rx, cy + a1.sin() * ry, c);
            self.push_vertex(cx + a2.cos() * rx, cy + a2.sin() * ry, c);
        }
    }

    pub fn draw_ring(
        &mut self,
        cx: f32,
        cy: f32,
        radius: f32,
        thickness: f32,
        segments: usize,
        c: [f32; 4],
    ) {
        let segs = segments.max(8);
        let step = (PI * 2.0) / (segs as f32);
        let r_in = (radius - thickness * 0.5).max(0.0);
        let r_out = radius + thickness * 0.5;
        for i in 0..segs {
            let a1 = (i as f32) * step;
            let a2 = ((i + 1) as f32) * step;
            let (c1, s1) = (a1.cos(), a1.sin());
            let (c2, s2) = (a2.cos(), a2.sin());

            let x1_in = cx + c1 * r_in;
            let y1_in = cy + s1 * r_in;
            let x1_out = cx + c1 * r_out;
            let y1_out = cy + s1 * r_out;
            let x2_in = cx + c2 * r_in;
            let y2_in = cy + s2 * r_in;
            let x2_out = cx + c2 * r_out;
            let y2_out = cy + s2 * r_out;

            self.push_vertex(x1_in, y1_in, c);
            self.push_vertex(x1_out, y1_out, c);
            self.push_vertex(x2_out, y2_out, c);

            self.push_vertex(x1_in, y1_in, c);
            self.push_vertex(x2_out, y2_out, c);
            self.push_vertex(x2_in, y2_in, c);
        }
    }

    pub fn draw_polyline(&mut self, pts: &[Vector2D], width: f32, c: [f32; 4]) {
        if pts.len() < 2 {
            return;
        }
        let half = width * 0.5;
        for i in 0..(pts.len() - 1) {
            self.draw_line(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y, width, c);
            self.draw_circle(pts[i].x, pts[i].y, half, 10, c);
        }
        if let Some(last) = pts.last() {
            self.draw_circle(last.x, last.y, half, 10, c);
        }
    }

    #[allow(clippy::too_many_arguments)]
    pub fn draw_atlas_quad(
        &mut self,
        key: &str,
        cx: f32,
        cy: f32,
        w: f32,
        h: f32,
        flip_x: bool,
        tint: [f32; 4],
    ) -> bool {
        if !self.has_atlas_texture {
            return false;
        }
        let Some(&uv) = self.atlas_uvs.get(key) else {
            return false;
        };

        let x0 = cx - w * 0.5;
        let y0 = cy - h * 0.5;
        let x1 = cx + w * 0.5;
        let y1 = cy + h * 0.5;

        let (u_left, u_right) = if flip_x {
            (uv.u1, uv.u0)
        } else {
            (uv.u0, uv.u1)
        };

        let push_tv = |buf: &mut Vec<f32>, x: f32, y: f32, u: f32, v: f32, c: [f32; 4]| {
            buf.extend_from_slice(&[x, y, u, v, c[0], c[1], c[2], c[3]]);
        };

        push_tv(&mut self.tex_vertices, x0, y0, u_left, uv.v0, tint);
        push_tv(&mut self.tex_vertices, x1, y0, u_right, uv.v0, tint);
        push_tv(&mut self.tex_vertices, x1, y1, u_right, uv.v1, tint);

        push_tv(&mut self.tex_vertices, x0, y0, u_left, uv.v0, tint);
        push_tv(&mut self.tex_vertices, x1, y1, u_right, uv.v1, tint);
        push_tv(&mut self.tex_vertices, x0, y1, u_left, uv.v1, tint);
        true
    }
}
