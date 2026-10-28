#![allow(dead_code)]

pub mod codex;
pub mod entities;
pub mod gl_bindings;
pub mod primitives;
pub mod scene;

pub use entities::{get_enemy_archetype, EnemyArchetype};
pub use gl_bindings::*;
pub use primitives::{element_color_rgba, parse_element_str, parse_hex_color, AtlasUvRect};

use std::collections::HashMap;
use wasm_bindgen::prelude::*;

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

    pub fn flush(&mut self) {
        #[cfg(target_arch = "wasm32")]
        {
            let Some(ref gl) = self.gl else {
                return;
            };
            let buf_w = gl.drawing_buffer_width();
            let buf_h = gl.drawing_buffer_height();
            let vp_w = if buf_w > 0 { buf_w } else { self.width as i32 };
            let vp_h = if buf_h > 0 { buf_h } else { self.height as i32 };
            gl.viewport(0, 0, vp_w, vp_h);
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
