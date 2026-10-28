#![allow(dead_code)]

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

    #[wasm_bindgen(method, getter, js_name = drawingBufferWidth)]
    pub fn drawing_buffer_width(this: &JsWebGl2Context) -> i32;

    #[wasm_bindgen(method, getter, js_name = drawingBufferHeight)]
    pub fn drawing_buffer_height(this: &JsWebGl2Context) -> i32;

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
    pub fn buffer_data_f32(this: &JsWebGl2Context, target: u32, data: &[f32], usage: u32);

    #[wasm_bindgen(method, js_name = bufferSubData)]
    pub fn buffer_sub_data_f32(this: &JsWebGl2Context, target: u32, offset: i32, data: &[f32]);

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
    pub fn uniform1i(this: &JsWebGl2Context, location: Option<&JsWebGlUniformLocation>, v: i32);

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

pub const GL_COLOR_BUFFER_BIT: u32 = 0x0000_4000;
pub const GL_BLEND: u32 = 0x0BE2;
pub const GL_SRC_ALPHA: u32 = 0x0302;
pub const GL_ONE_MINUS_SRC_ALPHA: u32 = 0x0303;
pub const GL_VERTEX_SHADER: u32 = 0x8B31;
pub const GL_FRAGMENT_SHADER: u32 = 0x8B30;
pub const GL_ARRAY_BUFFER: u32 = 0x8892;
pub const GL_DYNAMIC_DRAW: u32 = 0x88E8;
pub const GL_FLOAT: u32 = 0x1406;
pub const GL_TRIANGLES: u32 = 0x0004;
pub const GL_TEXTURE_2D: u32 = 0x0DE1;
pub const GL_TEXTURE0: u32 = 0x84C0;
pub const GL_TEXTURE_MIN_FILTER: u32 = 0x2801;
pub const GL_TEXTURE_MAG_FILTER: u32 = 0x2800;
pub const GL_TEXTURE_WRAP_S: u32 = 0x2802;
pub const GL_TEXTURE_WRAP_T: u32 = 0x2803;
pub const GL_LINEAR: i32 = 0x2601;
pub const GL_CLAMP_TO_EDGE: i32 = 0x812F;
pub const GL_RGBA: u32 = 0x1908;
pub const GL_UNSIGNED_BYTE: u32 = 0x1401;

pub const COLOR_VERT_SRC: &str = r#"#version 300 es
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

pub const COLOR_FRAG_SRC: &str = r#"#version 300 es
precision mediump float;
in vec4 v_color;
out vec4 outColor;
void main() {
    outColor = v_color;
}
"#;

pub const TEX_VERT_SRC: &str = r#"#version 300 es
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

pub const TEX_FRAG_SRC: &str = r#"#version 300 es
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
