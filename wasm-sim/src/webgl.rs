#![allow(dead_code)]

use crate::config::GameConfigRegistry;
use crate::state::RustGameState;
use crate::types::{
    EnemyState, MovementType, PlacementType, SoldierCombatMode, SoldierState,
    SummonUnitArchetype, TowerBranch, TowerType, Vector2D,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::f32::consts::PI;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    pub type JsWebGl2Context;
    pub type JsWebGlShader;
    pub type JsWebGlProgram;
    pub type JsWebGlBuffer;
    pub type JsWebGlVao;
    pub type JsWebGlTexture;
    pub type JsWebGlUniformLocation;

    #[wasm_bindgen(method, js_name = viewport)]
    pub fn viewport(this: &JsWebGl2Context, x: i32, y: i32, width: i32, height: i32);

    #[wasm_bindgen(method, js_name = clearColor)]
    pub fn clear_color(this: &JsWebGl2Context, r: f32, g: f32, b: f32, a: f32);

    #[wasm_bindgen(method, js_name = clear)]
    pub fn clear(this: &JsWebGl2Context, mask: u32);

    #[wasm_bindgen(method, js_name = enable)]
    pub fn enable(this: &JsWebGl2Context, cap: u32);

    #[wasm_bindgen(method, js_name = blendFunc)]
    pub fn blend_func(this: &JsWebGl2Context, sfactor: u32, dfactor: u32);

    #[wasm_bindgen(method, js_name = createShader)]
    pub fn create_shader(this: &JsWebGl2Context, shader_type: u32) -> Option<JsWebGlShader>;

    #[wasm_bindgen(method, js_name = shaderSource)]
    pub fn shader_source(this: &JsWebGl2Context, shader: &JsWebGlShader, source: &str);

    #[wasm_bindgen(method, js_name = compileShader)]
    pub fn compile_shader(this: &JsWebGl2Context, shader: &JsWebGlShader);

    #[wasm_bindgen(method, js_name = createProgram)]
    pub fn create_program(this: &JsWebGl2Context) -> Option<JsWebGlProgram>;

    #[wasm_bindgen(method, js_name = attachShader)]
    pub fn attach_shader(this: &JsWebGl2Context, program: &JsWebGlProgram, shader: &JsWebGlShader);

    #[wasm_bindgen(method, js_name = linkProgram)]
    pub fn link_program(this: &JsWebGl2Context, program: &JsWebGlProgram);

    #[wasm_bindgen(method, js_name = useProgram)]
    pub fn use_program(this: &JsWebGl2Context, program: Option<&JsWebGlProgram>);

    #[wasm_bindgen(method, js_name = createBuffer)]
    pub fn create_buffer(this: &JsWebGl2Context) -> Option<JsWebGlBuffer>;

    #[wasm_bindgen(method, js_name = bindBuffer)]
    pub fn bind_buffer(this: &JsWebGl2Context, target: u32, buffer: Option<&JsWebGlBuffer>);

    #[wasm_bindgen(method, js_name = bufferData)]
    pub fn buffer_data_f32(
        this: &JsWebGl2Context,
        target: u32,
        data: &[f32],
        usage: u32,
    );

    #[wasm_bindgen(method, js_name = createVertexArray)]
    pub fn create_vertex_array(this: &JsWebGl2Context) -> Option<JsWebGlVao>;

    #[wasm_bindgen(method, js_name = bindVertexArray)]
    pub fn bind_vertex_array(this: &JsWebGl2Context, vao: Option<&JsWebGlVao>);

    #[wasm_bindgen(method, js_name = enableVertexAttribArray)]
    pub fn enable_vertex_attrib_array(this: &JsWebGl2Context, index: u32);

    #[wasm_bindgen(method, js_name = vertexAttribPointer)]
    pub fn vertex_attrib_pointer(
        this: &JsWebGl2Context,
        index: u32,
        size: i32,
        data_type: u32,
        normalized: bool,
        stride: i32,
        offset: i32,
    );

    #[wasm_bindgen(method, js_name = getUniformLocation)]
    pub fn get_uniform_location(
        this: &JsWebGl2Context,
        program: &JsWebGlProgram,
        name: &str,
    ) -> Option<JsWebGlUniformLocation>;

    #[wasm_bindgen(method, js_name = uniform2f)]
    pub fn uniform2f(
        this: &JsWebGl2Context,
        location: Option<&JsWebGlUniformLocation>,
        x: f32,
        y: f32,
    );

    #[wasm_bindgen(method, js_name = uniform1i)]
    pub fn uniform1i(
        this: &JsWebGl2Context,
        location: Option<&JsWebGlUniformLocation>,
        v: i32,
    );

    #[wasm_bindgen(method, js_name = drawArrays)]
    pub fn draw_arrays(this: &JsWebGl2Context, mode: u32, first: i32, count: i32);

    #[wasm_bindgen(method, js_name = createTexture)]
    pub fn create_texture(this: &JsWebGl2Context) -> Option<JsWebGlTexture>;

    #[wasm_bindgen(method, js_name = activeTexture)]
    pub fn active_texture(this: &JsWebGl2Context, texture: u32);

    #[wasm_bindgen(method, js_name = bindTexture)]
    pub fn bind_texture(this: &JsWebGl2Context, target: u32, texture: Option<&JsWebGlTexture>);

    #[wasm_bindgen(method, js_name = texParameteri)]
    pub fn tex_parameteri(this: &JsWebGl2Context, target: u32, pname: u32, param: i32);

    #[wasm_bindgen(method, catch, js_name = texImage2D)]
    pub fn tex_image_2d_element(
        this: &JsWebGl2Context,
        target: u32,
        level: i32,
        internalformat: i32,
        format: u32,
        data_type: u32,
        source: &JsValue,
    ) -> Result<(), JsValue>;
}

const GL_COLOR_BUFFER_BIT: u32 = 0x0000_4000;
const GL_BLEND: u32 = 0x0BE2;
const GL_SRC_ALPHA: u32 = 0x0302;
const GL_ONE_MINUS_SRC_ALPHA: u32 = 0x0303;
const GL_VERTEX_SHADER: u32 = 0x8B31;
const GL_FRAGMENT_SHADER: u32 = 0x8B30;
const GL_ARRAY_BUFFER: u32 = 0x8892;
const GL_DYNAMIC_DRAW: u32 = 0x88E8;
const GL_FLOAT: u32 = 0x1406;
const GL_TRIANGLES: u32 = 0x0004;
const GL_TEXTURE_2D: u32 = 0x0DE1;
const GL_TEXTURE0: u32 = 0x84C0;
const GL_TEXTURE_MIN_FILTER: u32 = 0x2801;
const GL_TEXTURE_MAG_FILTER: u32 = 0x2800;
const GL_TEXTURE_WRAP_S: u32 = 0x2802;
const GL_TEXTURE_WRAP_T: u32 = 0x2803;
const GL_LINEAR: i32 = 0x2601;
const GL_CLAMP_TO_EDGE: i32 = 0x812F;
const GL_RGBA: u32 = 0x1908;
const GL_UNSIGNED_BYTE: u32 = 0x1401;

const COLOR_VERT_SRC: &str = r#"#version 300 es
precision highp float;
layout(location = 0) in vec2 a_pos;
layout(location = 1) in vec4 a_color;
uniform vec2 u_resolution;
out vec4 v_color;
void main() {
    vec2 clip = (a_pos / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
    v_color = a_color;
}
"#;

const COLOR_FRAG_SRC: &str = r#"#version 300 es
precision mediump float;
in vec4 v_color;
out vec4 outColor;
void main() {
    outColor = v_color;
}
"#;

const TEX_VERT_SRC: &str = r#"#version 300 es
precision highp float;
layout(location = 0) in vec2 a_pos;
layout(location = 1) in vec2 a_uv;
layout(location = 2) in vec4 a_tint;
uniform vec2 u_resolution;
out vec2 v_uv;
out vec4 v_tint;
void main() {
    vec2 clip = (a_pos / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
    v_uv = a_uv;
    v_tint = a_tint;
}
"#;

const TEX_FRAG_SRC: &str = r#"#version 300 es
precision mediump float;
in vec2 v_uv;
in vec4 v_tint;
uniform sampler2D u_tex;
out vec4 outColor;
void main() {
    vec4 texColor = texture(u_tex, v_uv);
    outColor = texColor * v_tint;
}
"#;

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

pub struct WebGl2Renderer {
    pub width: f32,
    pub height: f32,
    /// 6 floats per vertex: [x, y, r, g, b, a]
    pub color_vertices: Vec<f32>,
    /// 8 floats per vertex: [x, y, u, v, r, g, b, a]
    pub tex_vertices: Vec<f32>,
    pub atlas_uvs: HashMap<String, AtlasUvRect>,
    pub has_atlas_texture: bool,

    #[cfg(target_arch = "wasm32")]
    gl: Option<JsWebGl2Context>,
    #[cfg(target_arch = "wasm32")]
    color_program: Option<JsWebGlProgram>,
    #[cfg(target_arch = "wasm32")]
    color_vao: Option<JsWebGlVao>,
    #[cfg(target_arch = "wasm32")]
    color_vbo: Option<JsWebGlBuffer>,
    #[cfg(target_arch = "wasm32")]
    color_res_loc: Option<JsWebGlUniformLocation>,

    #[cfg(target_arch = "wasm32")]
    tex_program: Option<JsWebGlProgram>,
    #[cfg(target_arch = "wasm32")]
    tex_vao: Option<JsWebGlVao>,
    #[cfg(target_arch = "wasm32")]
    tex_vbo: Option<JsWebGlBuffer>,
    #[cfg(target_arch = "wasm32")]
    tex_res_loc: Option<JsWebGlUniformLocation>,
    #[cfg(target_arch = "wasm32")]
    tex_sampler_loc: Option<JsWebGlUniformLocation>,
    #[cfg(target_arch = "wasm32")]
    atlas_texture: Option<JsWebGlTexture>,
}

impl Default for WebGl2Renderer {
    fn default() -> Self {
        Self::new(1000.0, 650.0)
    }
}

impl WebGl2Renderer {
    pub fn new(width: f32, height: f32) -> Self {
        WebGl2Renderer {
            width,
            height,
            color_vertices: Vec::with_capacity(65536),
            tex_vertices: Vec::with_capacity(32768),
            atlas_uvs: HashMap::new(),
            has_atlas_texture: false,
            #[cfg(target_arch = "wasm32")]
            gl: None,
            #[cfg(target_arch = "wasm32")]
            color_program: None,
            #[cfg(target_arch = "wasm32")]
            color_vao: None,
            #[cfg(target_arch = "wasm32")]
            color_vbo: None,
            #[cfg(target_arch = "wasm32")]
            color_res_loc: None,
            #[cfg(target_arch = "wasm32")]
            tex_program: None,
            #[cfg(target_arch = "wasm32")]
            tex_vao: None,
            #[cfg(target_arch = "wasm32")]
            tex_vbo: None,
            #[cfg(target_arch = "wasm32")]
            tex_res_loc: None,
            #[cfg(target_arch = "wasm32")]
            tex_sampler_loc: None,
            #[cfg(target_arch = "wasm32")]
            atlas_texture: None,
        }
    }

    #[cfg(target_arch = "wasm32")]
    pub fn init_context(&mut self, gl_val: JsValue) -> bool {
        let gl: JsWebGl2Context = gl_val.unchecked_into();

        // Compile color shader program
        let Some(vs) = gl.create_shader(GL_VERTEX_SHADER) else {
            return false;
        };
        gl.shader_source(&vs, COLOR_VERT_SRC);
        gl.compile_shader(&vs);

        let Some(fs) = gl.create_shader(GL_FRAGMENT_SHADER) else {
            return false;
        };
        gl.shader_source(&fs, COLOR_FRAG_SRC);
        gl.compile_shader(&fs);

        let Some(prog) = gl.create_program() else {
            return false;
        };
        gl.attach_shader(&prog, &vs);
        gl.attach_shader(&prog, &fs);
        gl.link_program(&prog);

        let vao = gl.create_vertex_array();
        let vbo = gl.create_buffer();
        gl.bind_vertex_array(vao.as_ref());
        gl.bind_buffer(GL_ARRAY_BUFFER, vbo.as_ref());
        // stride = 6 * 4 = 24 bytes
        gl.enable_vertex_attrib_array(0);
        gl.vertex_attrib_pointer(0, 2, GL_FLOAT, false, 24, 0);
        gl.enable_vertex_attrib_array(1);
        gl.vertex_attrib_pointer(1, 4, GL_FLOAT, false, 24, 8);
        let res_loc = gl.get_uniform_location(&prog, "u_resolution");

        // Compile textured shader program
        let Some(tvs) = gl.create_shader(GL_VERTEX_SHADER) else {
            return false;
        };
        gl.shader_source(&tvs, TEX_VERT_SRC);
        gl.compile_shader(&tvs);

        let Some(tfs) = gl.create_shader(GL_FRAGMENT_SHADER) else {
            return false;
        };
        gl.shader_source(&tfs, TEX_FRAG_SRC);
        gl.compile_shader(&tfs);

        let Some(tprog) = gl.create_program() else {
            return false;
        };
        gl.attach_shader(&tprog, &tvs);
        gl.attach_shader(&tprog, &tfs);
        gl.link_program(&tprog);

        let tvao = gl.create_vertex_array();
        let tvbo = gl.create_buffer();
        gl.bind_vertex_array(tvao.as_ref());
        gl.bind_buffer(GL_ARRAY_BUFFER, tvbo.as_ref());
        // stride = 8 * 4 = 32 bytes
        gl.enable_vertex_attrib_array(0);
        gl.vertex_attrib_pointer(0, 2, GL_FLOAT, false, 32, 0);
        gl.enable_vertex_attrib_array(1);
        gl.vertex_attrib_pointer(1, 2, GL_FLOAT, false, 32, 8);
        gl.enable_vertex_attrib_array(2);
        gl.vertex_attrib_pointer(2, 4, GL_FLOAT, false, 32, 16);
        let tres_loc = gl.get_uniform_location(&tprog, "u_resolution");
        let tsampler_loc = gl.get_uniform_location(&tprog, "u_tex");

        gl.bind_vertex_array(None);
        gl.enable(GL_BLEND);
        gl.blend_func(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

        self.color_program = Some(prog);
        self.color_vao = vao;
        self.color_vbo = vbo;
        self.color_res_loc = res_loc;

        self.tex_program = Some(tprog);
        self.tex_vao = tvao;
        self.tex_vbo = tvbo;
        self.tex_res_loc = tres_loc;
        self.tex_sampler_loc = tsampler_loc;
        self.gl = Some(gl);
        true
    }

    #[cfg(target_arch = "wasm32")]
    pub fn upload_atlas(&mut self, image_source: &JsValue, manifest_json: &str) -> bool {
        if let Ok(map) = serde_json::from_str::<HashMap<String, AtlasUvRect>>(manifest_json) {
            self.atlas_uvs = map;
        }
        let Some(ref gl) = self.gl else {
            return false;
        };
        let tex = self.atlas_texture.take().or_else(|| gl.create_texture());
        let Some(ref t) = tex else {
            return false;
        };
        gl.active_texture(GL_TEXTURE0);
        gl.bind_texture(GL_TEXTURE_2D, Some(t));
        gl.tex_parameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
        gl.tex_parameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
        gl.tex_parameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
        gl.tex_parameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
        let ok = gl
            .tex_image_2d_element(
                GL_TEXTURE_2D,
                0,
                GL_RGBA as i32,
                GL_RGBA,
                GL_UNSIGNED_BYTE,
                image_source,
            )
            .is_ok();
        self.atlas_texture = tex;
        self.has_atlas_texture = ok;
        ok
    }

    #[cfg(not(target_arch = "wasm32"))]
    pub fn init_context(&mut self, _gl_val: JsValue) -> bool {
        true
    }

    #[cfg(not(target_arch = "wasm32"))]
    pub fn upload_atlas(&mut self, _image_source: &JsValue, manifest_json: &str) -> bool {
        if let Ok(map) = serde_json::from_str::<HashMap<String, AtlasUvRect>>(manifest_json) {
            self.atlas_uvs = map;
            self.has_atlas_texture = true;
            return true;
        }
        false
    }

    #[inline]
    fn push_vertex(&mut self, x: f32, y: f32, c: [f32; 4]) {
        self.color_vertices
            .extend_from_slice(&[x, y, c[0], c[1], c[2], c[3]]);
    }

    pub fn draw_triangle(&mut self, x1: f32, y1: f32, x2: f32, y2: f32, x3: f32, y3: f32, c: [f32; 4]) {
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
        let river_flow = parse_hex_color("#7dd3fc", 0.85);

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
            self.draw_ring(gs.x, gs.y, 22.0 + pulse, 2.0, 20, [0.937, 0.267, 0.267, 0.4]);
            self.draw_circle(gs.x, gs.y, 18.0, 20, parse_hex_color("#ef4444", 1.0));
            let _ = self.draw_atlas_quad("UI_SKULL", gs.x, gs.y, 18.0, 18.0, false, [1.0, 1.0, 1.0, 1.0]);
        }

        for (idx, ws) in crate::config::MapConfig::get_unique_lane_spawns(&map.water_lanes)
            .iter()
            .enumerate()
        {
            let pulse = (anim_time * 3.5 + idx as f32).sin() * 2.5;
            self.draw_ring(ws.x, ws.y, 21.0 + pulse, 2.0, 20, [0.22, 0.74, 0.97, 0.45]);
            self.draw_circle(ws.x, ws.y, 17.0, 20, parse_hex_color("#0284c7", 1.0));
            let _ = self.draw_atlas_quad("UI_SWIM", ws.x, ws.y, 18.0, 18.0, false, [1.0, 1.0, 1.0, 1.0]);
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
            self.draw_ring(base.x, base.y, 28.0, 3.0, 24, parse_hex_color("#60a5fa", 1.0));
            self.draw_circle(base.x, base.y, 16.0, 20, parse_hex_color("#3b82f6", 1.0));
            let _ = self.draw_atlas_quad(
                "UI_CASTLE",
                base.x,
                base.y,
                22.0,
                22.0,
                false,
                [1.0, 1.0, 1.0, 1.0],
            );
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
                        self.draw_circle(mx, my, bp.range, 36, [preview_col[0], preview_col[1], preview_col[2], 0.08]);
                        self.draw_ring(mx, my, bp.range, 1.5, 36, preview_col);
                    }
                    self.draw_circle(mx, my, 18.0, 20, preview_col);
                }
            }
        } else if state.is_setting_rally_point {
            if let Some(ref sel_id) = state.selected_tower_id {
                if let Some(t) = state.towers.iter().find(|t| &t.id == sel_id) {
                    self.draw_ring(t.x, t.y, t.range, 2.0, 36, [0.918, 0.702, 0.031, 0.65]);
                    self.draw_dashed_line(
                        t.x,
                        t.y,
                        state.mouse_pos.x,
                        state.mouse_pos.y,
                        2.0,
                        5.0,
                        5.0,
                        0.0,
                        [0.918, 0.702, 0.031, 0.75],
                    );
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
                let c = parse_hex_color(registry.get_element_color(tower.element), 0.12);
                self.draw_circle(tower.x, tower.y, tower.range, 36, c);
                let ring_c = parse_hex_color(registry.get_element_color(tower.element), 0.45);
                self.draw_ring(tower.x, tower.y, tower.range, 1.8, 36, ring_c);
            }

            if is_selected {
                self.draw_circle(tower.x, tower.y, tower.range, 36, [1.0, 1.0, 1.0, 0.05]);
                self.draw_ring(tower.x, tower.y, tower.range, 1.5, 36, [1.0, 1.0, 1.0, 0.38]);

                if tower.tower_type.is_summon() {
                    if let Some(rp) = tower.rally_point {
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
                        self.draw_circle(rp.x, rp.y, 6.0, 12, parse_hex_color("#eab308", 0.85));
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
            let px = p
                .prev_x
                .map(|px| px + (p.x - px) * alpha)
                .unwrap_or(p.x);
            let py = p
                .prev_y
                .map(|py| py + (p.y - py) * alpha)
                .unwrap_or(p.y);
            let disp_elem = p
                .damage_payload
                .secondary_element
                .unwrap_or(p.damage_payload.element);
            let c = parse_hex_color(registry.get_element_color(disp_elem), 0.95);
            let rad = if p.is_parabolic { 6.0 } else { 4.0 };
            self.draw_circle(px, py, rad, 10, c);
            self.draw_circle(px, py, rad * 0.5, 8, [1.0, 1.0, 1.0, 0.9]);
        }

        // 11. Particles
        for pt in &state.particles {
            let px = pt
                .prev_x
                .map(|px| px + (pt.x - px) * alpha)
                .unwrap_or(pt.x);
            let py = pt
                .prev_y
                .map(|py| py + (pt.y - py) * alpha)
                .unwrap_or(pt.y);
            let ratio = (pt.life_time / pt.max_life_time.max(0.01)).clamp(0.0, 1.0);
            let c = parse_hex_color(&pt.color, ratio);
            self.draw_circle(px, py, pt.size * ratio.max(0.4), 8, c);
        }
    }

    fn render_roadside_tower(
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
        self.draw_circle(x, y, 18.0, 20, base_fill);
        self.draw_ring(x, y, 18.0, 2.5, 20, base_stroke);

        if let Some(sec_el) = tower.secondary_element {
            if tower.tower_type != TowerType::MAGE {
                let ec = parse_hex_color(registry.get_element_color(sec_el), 0.9);
                self.draw_ring(x, y, 20.5, 1.8, 20, ec);
            }
        }

        if let Some(ref buffed) = tower.buffed_elements {
            if let Some(&b0) = buffed.first() {
                let bc = parse_hex_color(registry.get_element_color(b0), 0.85);
                self.draw_ring(
                    x,
                    y,
                    22.5 + (anim_time * 4.0).sin() * 1.5,
                    1.8,
                    20,
                    bc,
                );
            }
        }

        match tower.tower_type {
            TowerType::BARRACKS => {
                let c = if tower.tier == 4 && tower.branch == Some(TowerBranch::A) {
                    parse_hex_color("#fef08a", 1.0)
                } else {
                    parse_hex_color("#94a3b8", 1.0)
                };
                self.draw_rect(x - 12.0, y - 10.0, 24.0, 18.0, c);
                self.draw_rect(
                    x - 4.0,
                    y - 1.0,
                    8.0,
                    9.0,
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
                self.draw_rect(
                    x - 11.0,
                    y - 16.0,
                    22.0,
                    5.0,
                    parse_hex_color("#92400e", 1.0),
                );
                let green = parse_hex_color("#10b981", 1.0);
                self.draw_circle(x, y - 22.0, 4.0, 10, green);
            }
            TowerType::MAGE => {
                let spire = parse_hex_color("#475569", 1.0);
                self.draw_triangle(x - 8.0, y + 8.0, x, y - 14.0, x + 8.0, y + 8.0, spire);
                let fy = y - 24.0 + (anim_time * 3.0).sin() * 3.0;
                let c1 = parse_hex_color(registry.get_element_color(tower.element), 1.0);
                if let Some(sec) = tower.secondary_element {
                    let c2 = parse_hex_color(registry.get_element_color(sec), 1.0);
                    let ang = anim_time * 3.0;
                    self.draw_circle(x + ang.cos() * 7.0, fy + ang.sin() * 3.0, 5.0, 12, c1);
                    self.draw_circle(
                        x + (ang + PI).cos() * 7.0,
                        fy + (ang + PI).sin() * 3.0,
                        5.0,
                        12,
                        c2,
                    );
                } else {
                    self.draw_circle(x, fy, 6.0, 12, c1);
                }
            }
            TowerType::ARTILLERY => {
                self.draw_circle(x, y - 2.0, 11.0, 16, parse_hex_color("#1e293b", 1.0));
                self.draw_rect(
                    x - 5.0,
                    y - 14.0,
                    10.0,
                    14.0,
                    parse_hex_color("#334155", 1.0),
                );
            }
            TowerType::DragonNest => {
                self.draw_circle(x, y, 13.0, 16, parse_hex_color("#7c2d12", 1.0));
                self.draw_circle(x, y - 4.0, 7.0, 14, parse_hex_color("#f97316", 1.0));
            }
            TowerType::FairyTree => {
                self.draw_rect(
                    x - 4.0,
                    y - 6.0,
                    8.0,
                    14.0,
                    parse_hex_color("#78350f", 1.0),
                );
                self.draw_circle(x, y - 12.0, 12.0, 16, parse_hex_color("#f472b6", 0.9));
            }
            TowerType::HeroicAltar => {
                self.draw_rect(
                    x - 10.0,
                    y - 8.0,
                    20.0,
                    16.0,
                    parse_hex_color("#312e81", 1.0),
                );
                self.draw_circle(
                    x,
                    y - 14.0 + (anim_time * 3.0).sin() * 2.0,
                    6.0,
                    14,
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
            self.draw_circle(start_x + (i as f32) * 9.0, y + 16.0, 2.8, 8, star_c);
        }

        // Disabled overlay
        if tower.disabled_timer.unwrap_or(0.0) > 0.0 {
            self.draw_ring(x, y, 20.0, 2.5, 16, parse_hex_color("#facc15", 0.9));
        }
    }

    fn render_trap(
        &mut self,
        registry: &GameConfigRegistry,
        trap: &crate::types::TowerEntity,
        is_selected: bool,
        _anim_time: f32,
    ) {
        let x = trap.x;
        let y = trap.y;
        let elem_c = parse_hex_color(registry.get_element_color(trap.element), 0.85);
        self.draw_circle(x, y, 13.0, 14, parse_hex_color("#1e293b", 0.85));
        self.draw_ring(
            x,
            y,
            13.0,
            if is_selected { 2.5 } else { 1.8 },
            14,
            elem_c,
        );
        if trap.attack_cooldown <= 0.0 {
            self.draw_circle(x, y, 5.5, 10, elem_c);
        }
    }

    fn render_soldier(
        &mut self,
        registry: &GameConfigRegistry,
        s: & crate::types::SoldierEntity,
        anim_time: f32,
        alpha: f32,
    ) {
        let x = s.prev_x.map(|px| px + (s.x - px) * alpha).unwrap_or(s.x);
        let y = s.prev_y.map(|py| py + (s.y - py) * alpha).unwrap_or(s.y);

        if s.state == SoldierState::DEAD {
            let ratio = 1.0 - (s.respawn_timer / s.respawn_delay.max(0.1)).clamp(0.0, 1.0);
            self.draw_ring(x, y, 9.0, 2.0, 14, [0.58, 0.64, 0.72, 0.5]);
            self.draw_circle(x, y, 9.0 * ratio, 14, [0.22, 0.74, 0.97, 0.35]);
            return;
        }

        // Shadow
        self.draw_ellipse(x, y + 4.0, 9.0, 4.5, 12, [0.0, 0.0, 0.0, 0.35]);

        let is_spirit = s.is_spirit.unwrap_or(false);
        let body_alpha = if is_spirit { 0.78 } else { 1.0 };
        let elem_col = if is_spirit {
            parse_hex_color("#818cf8", body_alpha)
        } else if let Some(sec) = s.secondary_element {
            parse_hex_color(registry.get_element_color(sec), body_alpha)
        } else {
            parse_hex_color(registry.get_element_color(s.element), body_alpha)
        };

        let arch = s.archetype.unwrap_or(SummonUnitArchetype::SOLDIER);
        match arch {
            SummonUnitArchetype::DRAGON => {
                let hover = (anim_time * 5.0).sin() * 3.0;
                let dy = y - 10.0 + hover;
                let wing_flap = (anim_time * 10.0).sin() * 6.0;
                self.draw_triangle(x, dy, x - 16.0, dy - 8.0 + wing_flap, x - 8.0, dy + 4.0, elem_col);
                self.draw_triangle(x, dy, x + 16.0, dy - 8.0 + wing_flap, x + 8.0, dy + 4.0, elem_col);
                self.draw_circle(x, dy, 8.0, 14, elem_col);
            }
            SummonUnitArchetype::FAIRY => {
                let hover = (anim_time * 6.0).sin() * 2.5;
                let dy = y - 8.0 + hover;
                self.draw_circle(x, dy, 6.0, 12, elem_col);
                self.draw_circle(x, dy, 3.0, 10, [1.0, 1.0, 1.0, 0.9]);
            }
            SummonUnitArchetype::SOLDIER => {
                // Stickman soldier
                self.draw_circle(x, y - 14.0, 4.5, 12, elem_col);
                self.draw_line(x, y - 9.5, x, y - 2.0, 2.2, elem_col);
                self.draw_line(x, y - 2.0, x - 4.0, y + 4.0, 2.0, elem_col);
                self.draw_line(x, y - 2.0, x + 4.0, y + 4.0, 2.0, elem_col);
                if s.combat_mode == SoldierCombatMode::RANGED {
                    self.draw_line(x + 3.0, y - 11.0, x + 7.0, y - 4.0, 1.8, [0.96, 0.62, 0.04, 1.0]);
                } else {
                    self.draw_line(x + 4.0, y - 7.0, x + 10.0, y - 13.0, 2.0, [0.89, 0.91, 0.94, 1.0]);
                }
            }
        }

        // Health bar
        let hp_ratio = (s.hp / s.max_hp.max(1.0)).clamp(0.0, 1.0);
        let bw = 22.0;
        let bx = x - bw * 0.5;
        let by = y - 24.0;
        self.draw_rect(bx, by, bw, 3.5, [0.06, 0.09, 0.16, 0.85]);
        self.draw_rect(bx, by, bw * hp_ratio, 3.5, [0.13, 0.77, 0.37, 0.95]);
    }

    fn render_enemy(
        &mut self,
        registry: &GameConfigRegistry,
        enemy: &crate::types::EnemyEntity,
        anim_time: f32,
        alpha: f32,
    ) {
        let x = enemy
            .prev_x
            .map(|px| {
                if (enemy.x - px).hypot(enemy.y - enemy.prev_y.unwrap_or(enemy.y)) > 80.0 {
                    enemy.x
                } else {
                    px + (enemy.x - px) * alpha
                }
            })
            .unwrap_or(enemy.x);
        let y = enemy
            .prev_y
            .map(|py| {
                if (enemy.x - enemy.prev_x.unwrap_or(enemy.x)).hypot(enemy.y - py) > 80.0 {
                    enemy.y
                } else {
                    py + (enemy.y - py) * alpha
                }
            })
            .unwrap_or(enemy.y);

        let size = enemy.size;
        let draw_y = y - enemy.altitude;

        // 1. Shadow
        let shadow_scale = (1.0 - enemy.altitude / 60.0).max(0.4);
        self.draw_ellipse(
            x,
            y + 4.0,
            size * 0.7 * shadow_scale,
            size * 0.35 * shadow_scale,
            12,
            [0.0, 0.0, 0.0, 0.35],
        );

        // 2. Water ripples
        if enemy.movement_type == MovementType::SWIM {
            let ripple = (anim_time * 2.0) % 1.0;
            self.draw_ring(
                x,
                y + 2.0,
                12.0 + ripple * 6.0,
                1.2,
                14,
                [0.49, 0.83, 0.99, 0.55],
            );
        }

        let elem_hex = registry.get_element_color(enemy.elemental_profile.primary_element);
        let elem_col = parse_hex_color(elem_hex, 1.0);

        // 3. Shield auras
        if enemy.armor_shield.unwrap_or(0.0) > 0.0 || enemy.magic_shield.unwrap_or(0.0) > 0.0 {
            let sc = if enemy.magic_shield.unwrap_or(0.0) > 0.0 {
                parse_hex_color("#c084fc", 0.8)
            } else {
                parse_hex_color("#e2e8f0", 0.8)
            };
            self.draw_ring(x, draw_y - size * 0.2, size * 0.95, 2.0, 18, sc);
        }

        // 4. Try GPU Atlas sprite first, fallback to procedural vector body
        let flip_x = enemy.facing.abs() > PI * 0.5;
        let frame_idx = (((anim_time * 8.0) as usize) % 4) + 1;
        let atlas_key = format!("ENEMY_{}_{}", enemy.type_id, frame_idx);
        let sprite_size = (size * 2.8).max(36.0);
        if !self.draw_atlas_quad(
            &atlas_key,
            x,
            draw_y - size * 0.3,
            sprite_size,
            sprite_size,
            flip_x,
            [1.0, 1.0, 1.0, 1.0],
        ) {
            // Procedural vector body fallback
            self.draw_circle(x, draw_y - size * 0.65, size * 0.38, 14, elem_col);
            self.draw_line(
                x,
                draw_y - size * 0.3,
                x,
                draw_y + size * 0.15,
                (size * 0.18).max(2.0),
                elem_col,
            );
            let stride = (anim_time * 10.0).sin() * size * 0.25;
            self.draw_line(
                x,
                draw_y + size * 0.15,
                x - stride,
                draw_y + size * 0.45,
                2.0,
                elem_col,
            );
            self.draw_line(
                x,
                draw_y + size * 0.15,
                x + stride,
                draw_y + size * 0.45,
                2.0,
                elem_col,
            );
        }

        // 5. Health Bar & Shields
        let is_boss = enemy.tags.iter().any(|t| t == "BOSS");
        let is_elite = enemy.tags.iter().any(|t| t == "ELITE");
        let bar_w = if is_boss {
            54.0
        } else if is_elite {
            36.0
        } else {
            26.0
        };
        let bar_h = if is_boss { 5.5 } else { 4.0 };
        let bx = x - bar_w * 0.5;
        let by = draw_y - size - 12.0;

        self.draw_rect(bx, by, bar_w, bar_h, [0.06, 0.09, 0.16, 0.88]);
        let hp_ratio = (enemy.hp / enemy.max_hp.max(1.0)).clamp(0.0, 1.0);
        let hp_col = if hp_ratio > 0.5 {
            [0.133, 0.773, 0.369, 0.95]
        } else if hp_ratio > 0.25 {
            [0.918, 0.702, 0.031, 0.95]
        } else {
            [0.937, 0.267, 0.267, 0.95]
        };
        self.draw_rect(bx, by, bar_w * hp_ratio, bar_h, hp_col);
    }

    pub fn render_codex_enemy_preview(
        &mut self,
        registry: &GameConfigRegistry,
        type_id: &str,
        anim_time: f32,
        width: f32,
        height: f32,
    ) -> bool {
        let Some(bp) = registry.enemies.get(type_id) else {
            return false;
        };

        self.width = width;
        self.height = height;
        self.color_vertices.clear();
        self.tex_vertices.clear();

        let cx = width * 0.5;
        let is_boss = bp.tags.iter().any(|t| t == "BOSS");
        let is_flying = bp.movement_type == MovementType::FLY;
        let is_swimmer = bp.movement_type == MovementType::SWIM;
        let cy = if is_boss { height * 0.74 } else { height * 0.70 };
        let alt = if is_flying {
            if is_boss { 26.0 } else { 22.0 }
        } else {
            0.0
        };

        // 1. Ambient radial element glow
        let elem_color_hex = registry.get_element_color(bp.elemental_profile.primary_element);
        let glow_col = parse_hex_color(elem_color_hex, 0.22);
        self.draw_circle(cx, cy - 20.0, 60.0, 24, glow_col);

        // 2. Floor pedestal line
        let floor_col = if is_swimmer {
            parse_hex_color("#38bdf8", 0.45)
        } else {
            parse_hex_color("#475569", 0.45)
        };
        self.draw_line(cx - 75.0, cy + 8.0, cx + 75.0, cy + 8.0, 1.5, floor_col);

        // 3. Mock enemy entity for render_enemy
        let mock = crate::types::EnemyEntity {
            id: "codex_preview".to_string(),
            type_id: type_id.to_string(),
            x: cx,
            y: cy,
            size: bp.size,
            altitude: alt,
            movement_type: bp.movement_type,
            navigation_mode: bp.navigation_mode,
            elemental_profile: bp.elemental_profile.clone(),
            tags: bp.tags.clone(),
            hp: bp.hp,
            max_hp: bp.hp,
            speed: bp.speed,
            base_speed: bp.speed,
            damage: bp.damage,
            attack_speed: bp.attack_speed,
            reward_gold: bp.reward_gold,
            path_distance: 0.0,
            path_total_length: 100.0,
            state: if is_flying {
                EnemyState::FLYING
            } else if is_swimmer {
                EnemyState::SWIMMING
            } else {
                EnemyState::WALKING
            },
            facing: 0.0,
            ..Default::default()
        };

        self.render_enemy(registry, &mock, anim_time, 1.0);
        self.flush();
        true
    }

    pub fn render_codex_soldier_preview(
        &mut self,
        registry: &GameConfigRegistry,
        soldier_type: &str,
        stance: &str,
        anim_time: f32,
        width: f32,
        height: f32,
    ) -> bool {
        self.width = width;
        self.height = height;
        self.color_vertices.clear();
        self.tex_vertices.clear();

        let cx = width * 0.5;
        let cy = height * 0.68;

        let (arch, elem, is_spirit) = match soldier_type {
            "DRAGON" | "DRAGON_NEST" => (
                SummonUnitArchetype::DRAGON,
                crate::types::ElementType::FIRE,
                false,
            ),
            "FAIRY" | "FAIRY_TREE" => (
                SummonUnitArchetype::FAIRY,
                crate::types::ElementType::LIGHT,
                false,
            ),
            "HEROIC_SPIRIT" | "HEROIC_ALTAR" => (
                SummonUnitArchetype::SOLDIER,
                crate::types::ElementType::GHOST,
                true,
            ),
            _ => (
                SummonUnitArchetype::SOLDIER,
                crate::types::ElementType::PHYSICAL,
                false,
            ),
        };

        let mode = if stance.eq_ignore_ascii_case("RANGED") {
            SoldierCombatMode::RANGED
        } else {
            SoldierCombatMode::MELEE
        };

        let elem_hex = registry.get_element_color(elem);
        let glow_col = parse_hex_color(elem_hex, 0.22);
        self.draw_circle(cx, cy - 16.0, 50.0, 20, glow_col);

        let floor_col = parse_hex_color("#475569", 0.45);
        self.draw_line(cx - 65.0, cy + 8.0, cx + 65.0, cy + 8.0, 1.5, floor_col);

        let mock = crate::types::SoldierEntity {
            id: "codex_soldier".to_string(),
            tower_id: "preview_tower".to_string(),
            x: cx,
            y: cy,
            hp: 200.0,
            max_hp: 200.0,
            element: elem,
            combat_mode: mode,
            archetype: Some(arch),
            is_spirit: Some(is_spirit),
            state: SoldierState::IDLE,
            ..Default::default()
        };

        self.render_soldier(registry, &mock, anim_time, 1.0);
        self.flush();
        true
    }

    pub fn flush(&self) {
        #[cfg(target_arch = "wasm32")]
        {
            let Some(ref gl) = self.gl else {
                return;
            };
            gl.viewport(0, 0, self.width as i32, self.height as i32);
            gl.clear_color(0.06, 0.09, 0.16, 1.0);
            gl.clear(GL_COLOR_BUFFER_BIT);

            if !self.color_vertices.is_empty() {
                gl.use_program(self.color_program.as_ref());
                gl.uniform2f(self.color_res_loc.as_ref(), self.width, self.height);
                gl.bind_vertex_array(self.color_vao.as_ref());
                gl.bind_buffer(GL_ARRAY_BUFFER, self.color_vbo.as_ref());
                gl.buffer_data_f32(GL_ARRAY_BUFFER, &self.color_vertices, GL_DYNAMIC_DRAW);
                let count = (self.color_vertices.len() / 6) as i32;
                gl.draw_arrays(GL_TRIANGLES, 0, count);
            }

            if !self.tex_vertices.is_empty() && self.has_atlas_texture {
                gl.use_program(self.tex_program.as_ref());
                gl.uniform2f(self.tex_res_loc.as_ref(), self.width, self.height);
                gl.uniform1i(self.tex_sampler_loc.as_ref(), 0);
                gl.active_texture(GL_TEXTURE0);
                gl.bind_texture(GL_TEXTURE_2D, self.atlas_texture.as_ref());
                gl.bind_vertex_array(self.tex_vao.as_ref());
                gl.bind_buffer(GL_ARRAY_BUFFER, self.tex_vbo.as_ref());
                gl.buffer_data_f32(GL_ARRAY_BUFFER, &self.tex_vertices, GL_DYNAMIC_DRAW);
                let count = (self.tex_vertices.len() / 8) as i32;
                gl.draw_arrays(GL_TRIANGLES, 0, count);
            }

            gl.bind_vertex_array(None);
        }
    }
}
