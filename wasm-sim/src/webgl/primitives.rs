#![allow(dead_code, clippy::approx_constant, clippy::excessive_precision)]

use super::WebGl2Renderer;
use crate::config::GameConfigRegistry;
use crate::types::{ElementType, Vector2D};
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

pub const CIRCLE_TABLE_6: [(f32, f32); 6] = [
    (1.0000000, 0.0000000),
    (0.5000000, 0.8660254),
    (-0.5000000, 0.8660254),
    (-1.0000000, 0.0000000),
    (-0.5000000, -0.8660254),
    (0.5000000, -0.8660254),
];

pub const CIRCLE_TABLE_8: [(f32, f32); 8] = [
    (1.0000000, 0.0000000),
    (0.7071068, 0.7071068),
    (0.0000000, 1.0000000),
    (-0.7071068, 0.7071068),
    (-1.0000000, 0.0000000),
    (-0.7071068, -0.7071068),
    (-0.0000000, -1.0000000),
    (0.7071068, -0.7071068),
];

pub const CIRCLE_TABLE_10: [(f32, f32); 10] = [
    (1.0000000, 0.0000000),
    (0.8090170, 0.5877853),
    (0.3090170, 0.9510565),
    (-0.3090170, 0.9510565),
    (-0.8090170, 0.5877853),
    (-1.0000000, 0.0000000),
    (-0.8090170, -0.5877853),
    (-0.3090170, -0.9510565),
    (0.3090170, -0.9510565),
    (0.8090170, -0.5877853),
];

pub const CIRCLE_TABLE_12: [(f32, f32); 12] = [
    (1.0000000, 0.0000000),
    (0.8660254, 0.5000000),
    (0.5000000, 0.8660254),
    (0.0000000, 1.0000000),
    (-0.5000000, 0.8660254),
    (-0.8660254, 0.5000000),
    (-1.0000000, 0.0000000),
    (-0.8660254, -0.5000000),
    (-0.5000000, -0.8660254),
    (-0.0000000, -1.0000000),
    (0.5000000, -0.8660254),
    (0.8660254, -0.5000000),
];

pub const CIRCLE_TABLE_14: [(f32, f32); 14] = [
    (1.0000000, 0.0000000),
    (0.9009689, 0.4338837),
    (0.6234898, 0.7818315),
    (0.2225209, 0.9749279),
    (-0.2225209, 0.9749279),
    (-0.6234898, 0.7818315),
    (-0.9009689, 0.4338837),
    (-1.0000000, 0.0000000),
    (-0.9009689, -0.4338837),
    (-0.6234898, -0.7818315),
    (-0.2225209, -0.9749279),
    (0.2225209, -0.9749279),
    (0.6234898, -0.7818315),
    (0.9009689, -0.4338837),
];

pub const CIRCLE_TABLE_16: [(f32, f32); 16] = [
    (1.0000000, 0.0000000),
    (0.9238795, 0.3826834),
    (0.7071068, 0.7071068),
    (0.3826834, 0.9238795),
    (0.0000000, 1.0000000),
    (-0.3826834, 0.9238795),
    (-0.7071068, 0.7071068),
    (-0.9238795, 0.3826834),
    (-1.0000000, 0.0000000),
    (-0.9238795, -0.3826834),
    (-0.7071068, -0.7071068),
    (-0.3826834, -0.9238795),
    (-0.0000000, -1.0000000),
    (0.3826834, -0.9238795),
    (0.7071068, -0.7071068),
    (0.9238795, -0.3826834),
];

pub const CIRCLE_TABLE_20: [(f32, f32); 20] = [
    (1.0000000, 0.0000000),
    (0.9510565, 0.3090170),
    (0.8090170, 0.5877853),
    (0.5877853, 0.8090170),
    (0.3090170, 0.9510565),
    (0.0000000, 1.0000000),
    (-0.3090170, 0.9510565),
    (-0.5877853, 0.8090170),
    (-0.8090170, 0.5877853),
    (-0.9510565, 0.3090170),
    (-1.0000000, 0.0000000),
    (-0.9510565, -0.3090170),
    (-0.8090170, -0.5877853),
    (-0.5877853, -0.8090170),
    (-0.3090170, -0.9510565),
    (-0.0000000, -1.0000000),
    (0.3090170, -0.9510565),
    (0.5877853, -0.8090170),
    (0.8090170, -0.5877853),
    (0.9510565, -0.3090170),
];

pub const CIRCLE_TABLE_24: [(f32, f32); 24] = [
    (1.0000000, 0.0000000),
    (0.9659258, 0.2588190),
    (0.8660254, 0.5000000),
    (0.7071068, 0.7071068),
    (0.5000000, 0.8660254),
    (0.2588190, 0.9659258),
    (0.0000000, 1.0000000),
    (-0.2588190, 0.9659258),
    (-0.5000000, 0.8660254),
    (-0.7071068, 0.7071068),
    (-0.8660254, 0.5000000),
    (-0.9659258, 0.2588190),
    (-1.0000000, 0.0000000),
    (-0.9659258, -0.2588190),
    (-0.8660254, -0.5000000),
    (-0.7071068, -0.7071068),
    (-0.5000000, -0.8660254),
    (-0.2588190, -0.9659258),
    (-0.0000000, -1.0000000),
    (0.2588190, -0.9659258),
    (0.5000000, -0.8660254),
    (0.7071068, -0.7071068),
    (0.8660254, -0.5000000),
    (0.9659258, -0.2588190),
];

pub const CIRCLE_TABLE_28: [(f32, f32); 28] = [
    (1.0000000, 0.0000000),
    (0.9749279, 0.2225209),
    (0.9009689, 0.4338837),
    (0.7818315, 0.6234898),
    (0.6234898, 0.7818315),
    (0.4338837, 0.9009689),
    (0.2225209, 0.9749279),
    (0.0000000, 1.0000000),
    (-0.2225209, 0.9749279),
    (-0.4338837, 0.9009689),
    (-0.6234898, 0.7818315),
    (-0.7818315, 0.6234898),
    (-0.9009689, 0.4338837),
    (-0.9749279, 0.2225209),
    (-1.0000000, 0.0000000),
    (-0.9749279, -0.2225209),
    (-0.9009689, -0.4338837),
    (-0.7818315, -0.6234898),
    (-0.6234898, -0.7818315),
    (-0.4338837, -0.9009689),
    (-0.2225209, -0.9749279),
    (-0.0000000, -1.0000000),
    (0.2225209, -0.9749279),
    (0.4338837, -0.9009689),
    (0.6234898, -0.7818315),
    (0.7818315, -0.6234898),
    (0.9009689, -0.4338837),
    (0.9749279, -0.2225209),
];

pub const CIRCLE_TABLE_32: [(f32, f32); 32] = [
    (1.0000000, 0.0000000),
    (0.9807853, 0.1950903),
    (0.9238795, 0.3826834),
    (0.8314696, 0.5555702),
    (0.7071068, 0.7071068),
    (0.5555702, 0.8314696),
    (0.3826834, 0.9238795),
    (0.1950903, 0.9807853),
    (0.0000000, 1.0000000),
    (-0.1950903, 0.9807853),
    (-0.3826834, 0.9238795),
    (-0.5555702, 0.8314696),
    (-0.7071068, 0.7071068),
    (-0.8314696, 0.5555702),
    (-0.9238795, 0.3826834),
    (-0.9807853, 0.1950903),
    (-1.0000000, 0.0000000),
    (-0.9807853, -0.1950903),
    (-0.9238795, -0.3826834),
    (-0.8314696, -0.5555702),
    (-0.7071068, -0.7071068),
    (-0.5555702, -0.8314696),
    (-0.3826834, -0.9238795),
    (-0.1950903, -0.9807853),
    (0.0000000, -1.0000000),
    (0.1950903, -0.9807853),
    (0.3826834, -0.9238795),
    (0.5555702, -0.8314696),
    (0.7071068, -0.7071068),
    (0.8314696, -0.5555702),
    (0.9238795, -0.3826834),
    (0.9807853, -0.1950903),
];

pub const CIRCLE_TABLE_36: [(f32, f32); 36] = [
    (1.0000000, 0.0000000),
    (0.9848078, 0.1736482),
    (0.9396926, 0.3420201),
    (0.8660254, 0.5000000),
    (0.7660444, 0.6427876),
    (0.6427876, 0.7660444),
    (0.5000000, 0.8660254),
    (0.3420201, 0.9396926),
    (0.1736482, 0.9848078),
    (0.0000000, 1.0000000),
    (-0.1736482, 0.9848078),
    (-0.3420201, 0.9396926),
    (-0.5000000, 0.8660254),
    (-0.6427876, 0.7660444),
    (-0.7660444, 0.6427876),
    (-0.8660254, 0.5000000),
    (-0.9396926, 0.3420201),
    (-0.9848078, 0.1736482),
    (-1.0000000, 0.0000000),
    (-0.9848078, -0.1736482),
    (-0.9396926, -0.3420201),
    (-0.8660254, -0.5000000),
    (-0.7660444, -0.6427876),
    (-0.6427876, -0.7660444),
    (-0.5000000, -0.8660254),
    (-0.3420201, -0.9396926),
    (-0.1736482, -0.9848078),
    (-0.0000000, -1.0000000),
    (0.1736482, -0.9848078),
    (0.3420201, -0.9396926),
    (0.5000000, -0.8660254),
    (0.6427876, -0.7660444),
    (0.7660444, -0.6427876),
    (0.8660254, -0.5000000),
    (0.9396926, -0.3420201),
    (0.9848078, -0.1736482),
];

pub const CIRCLE_TABLE_48: [(f32, f32); 48] = [
    (1.0000000, 0.0000000),
    (0.9914449, 0.1305262),
    (0.9659258, 0.2588190),
    (0.9238795, 0.3826834),
    (0.8660254, 0.5000000),
    (0.7933533, 0.6087614),
    (0.7071068, 0.7071068),
    (0.6087614, 0.7933533),
    (0.5000000, 0.8660254),
    (0.3826834, 0.9238795),
    (0.2588190, 0.9659258),
    (0.1305262, 0.9914449),
    (0.0000000, 1.0000000),
    (-0.1305262, 0.9914449),
    (-0.2588190, 0.9659258),
    (-0.3826834, 0.9238795),
    (-0.5000000, 0.8660254),
    (-0.6087614, 0.7933533),
    (-0.7071068, 0.7071068),
    (-0.7933533, 0.6087614),
    (-0.8660254, 0.5000000),
    (-0.9238795, 0.3826834),
    (-0.9659258, 0.2588190),
    (-0.9914449, 0.1305262),
    (-1.0000000, 0.0000000),
    (-0.9914449, -0.1305262),
    (-0.9659258, -0.2588190),
    (-0.9238795, -0.3826834),
    (-0.8660254, -0.5000000),
    (-0.7933533, -0.6087614),
    (-0.7071068, -0.7071068),
    (-0.6087614, -0.7933533),
    (-0.5000000, -0.8660254),
    (-0.3826834, -0.9238795),
    (-0.2588190, -0.9659258),
    (-0.1305262, -0.9914449),
    (0.0000000, -1.0000000),
    (0.1305262, -0.9914449),
    (0.2588190, -0.9659258),
    (0.3826834, -0.9238795),
    (0.5000000, -0.8660254),
    (0.6087614, -0.7933533),
    (0.7071068, -0.7071068),
    (0.7933533, -0.6087614),
    (0.8660254, -0.5000000),
    (0.9238795, -0.3826834),
    (0.9659258, -0.2588190),
    (0.9914449, -0.1305262),
];

pub const CIRCLE_TABLE_64: [(f32, f32); 64] = [
    (1.0000000, 0.0000000),
    (0.9951847, 0.0980171),
    (0.9807853, 0.1950903),
    (0.9569403, 0.2902847),
    (0.9238795, 0.3826834),
    (0.8819213, 0.4713967),
    (0.8314696, 0.5555702),
    (0.7730105, 0.6343933),
    (0.7071068, 0.7071068),
    (0.6343933, 0.7730105),
    (0.5555702, 0.8314696),
    (0.4713967, 0.8819213),
    (0.3826834, 0.9238795),
    (0.2902847, 0.9569403),
    (0.1950903, 0.9807853),
    (0.0980171, 0.9951847),
    (0.0000000, 1.0000000),
    (-0.0980171, 0.9951847),
    (-0.1950903, 0.9807853),
    (-0.2902847, 0.9569403),
    (-0.3826834, 0.9238795),
    (-0.4713967, 0.8819213),
    (-0.5555702, 0.8314696),
    (-0.6343933, 0.7730105),
    (-0.7071068, 0.7071068),
    (-0.7730105, 0.6343933),
    (-0.8314696, 0.5555702),
    (-0.8819213, 0.4713967),
    (-0.9238795, 0.3826834),
    (-0.9569403, 0.2902847),
    (-0.9807853, 0.1950903),
    (-0.9951847, 0.0980171),
    (-1.0000000, 0.0000000),
    (-0.9951847, -0.0980171),
    (-0.9807853, -0.1950903),
    (-0.9569403, -0.2902847),
    (-0.9238795, -0.3826834),
    (-0.8819213, -0.4713967),
    (-0.8314696, -0.5555702),
    (-0.7730105, -0.6343933),
    (-0.7071068, -0.7071068),
    (-0.6343933, -0.7730105),
    (-0.5555702, -0.8314696),
    (-0.4713967, -0.8819213),
    (-0.3826834, -0.9238795),
    (-0.2902847, -0.9569403),
    (-0.1950903, -0.9807853),
    (-0.0980171, -0.9951847),
    (0.0000000, -1.0000000),
    (0.0980171, -0.9951847),
    (0.1950903, -0.9807853),
    (0.2902847, -0.9569403),
    (0.3826834, -0.9238795),
    (0.4713967, -0.8819213),
    (0.5555702, -0.8314696),
    (0.6343933, -0.7730105),
    (0.7071068, -0.7071068),
    (0.7730105, -0.6343933),
    (0.8314696, -0.5555702),
    (0.8819213, -0.4713967),
    (0.9238795, -0.3826834),
    (0.9569403, -0.2902847),
    (0.9807853, -0.1950903),
    (0.9951847, -0.0980171),
];

pub const CIRCLE_TABLE_72: [(f32, f32); 72] = [
    (1.0000000, 0.0000000),
    (0.9961947, 0.0871557),
    (0.9848078, 0.1736482),
    (0.9659258, 0.2588190),
    (0.9396926, 0.3420201),
    (0.9063078, 0.4226183),
    (0.8660254, 0.5000000),
    (0.8191520, 0.5735764),
    (0.7660444, 0.6427876),
    (0.7071068, 0.7071068),
    (0.6427876, 0.7660444),
    (0.5735764, 0.8191520),
    (0.5000000, 0.8660254),
    (0.4226183, 0.9063078),
    (0.3420201, 0.9396926),
    (0.2588190, 0.9659258),
    (0.1736482, 0.9848078),
    (0.0871557, 0.9961947),
    (0.0000000, 1.0000000),
    (-0.0871557, 0.9961947),
    (-0.1736482, 0.9848078),
    (-0.2588190, 0.9659258),
    (-0.3420201, 0.9396926),
    (-0.4226183, 0.9063078),
    (-0.5000000, 0.8660254),
    (-0.5735764, 0.8191520),
    (-0.6427876, 0.7660444),
    (-0.7071068, 0.7071068),
    (-0.7660444, 0.6427876),
    (-0.8191520, 0.5735764),
    (-0.8660254, 0.5000000),
    (-0.9063078, 0.4226183),
    (-0.9396926, 0.3420201),
    (-0.9659258, 0.2588190),
    (-0.9848078, 0.1736482),
    (-0.9961947, 0.0871557),
    (-1.0000000, 0.0000000),
    (-0.9961947, -0.0871557),
    (-0.9848078, -0.1736482),
    (-0.9659258, -0.2588190),
    (-0.9396926, -0.3420201),
    (-0.9063078, -0.4226183),
    (-0.8660254, -0.5000000),
    (-0.8191520, -0.5735764),
    (-0.7660444, -0.6427876),
    (-0.7071068, -0.7071068),
    (-0.6427876, -0.7660444),
    (-0.5735764, -0.8191520),
    (-0.5000000, -0.8660254),
    (-0.4226183, -0.9063078),
    (-0.3420201, -0.9396926),
    (-0.2588190, -0.9659258),
    (-0.1736482, -0.9848078),
    (-0.0871557, -0.9961947),
    (0.0000000, -1.0000000),
    (0.0871557, -0.9961947),
    (0.1736482, -0.9848078),
    (0.2588190, -0.9659258),
    (0.3420201, -0.9396926),
    (0.4226183, -0.9063078),
    (0.5000000, -0.8660254),
    (0.5735764, -0.8191520),
    (0.6427876, -0.7660444),
    (0.7071068, -0.7071068),
    (0.7660444, -0.6427876),
    (0.8191520, -0.5735764),
    (0.8660254, -0.5000000),
    (0.9063078, -0.4226183),
    (0.9396926, -0.3420201),
    (0.9659258, -0.2588190),
    (0.9848078, -0.1736482),
    (0.9961947, -0.0871557),
];

pub const QUARTER_TABLE_6: [(f32, f32); 7] = [
    (1.0000000, 0.0000000),
    (0.9659258, 0.2588190),
    (0.8660254, 0.5000000),
    (0.7071068, 0.7071068),
    (0.5000000, 0.8660254),
    (0.2588190, 0.9659258),
    (0.0000000, 1.0000000),
];

#[inline]
pub fn get_unit_circle_table(segments: usize) -> Option<&'static [(f32, f32)]> {
    match segments {
        6 => Some(&CIRCLE_TABLE_6),
        8 => Some(&CIRCLE_TABLE_8),
        10 => Some(&CIRCLE_TABLE_10),
        12 => Some(&CIRCLE_TABLE_12),
        14 => Some(&CIRCLE_TABLE_14),
        16 => Some(&CIRCLE_TABLE_16),
        20 => Some(&CIRCLE_TABLE_20),
        24 => Some(&CIRCLE_TABLE_24),
        28 => Some(&CIRCLE_TABLE_28),
        32 => Some(&CIRCLE_TABLE_32),
        36 => Some(&CIRCLE_TABLE_36),
        48 => Some(&CIRCLE_TABLE_48),
        64 => Some(&CIRCLE_TABLE_64),
        72 => Some(&CIRCLE_TABLE_72),
        _ => None,
    }
}

/// Adaptive segment count based on radius for silky smooth curves without facets
#[inline]
pub fn smooth_circle_segments(radius: f32) -> usize {
    if radius <= 4.0 {
        16
    } else if radius <= 10.0 {
        24
    } else if radius <= 25.0 {
        32
    } else if radius <= 60.0 {
        48
    } else if radius <= 120.0 {
        64
    } else {
        72
    }
}

/// Fast bitwise hex color parser (zero string allocation or string slicing)
#[inline]
pub fn parse_hex_color(hex: &str, alpha: f32) -> [f32; 4] {
    let bytes = hex.as_bytes();
    let mut i = 0;
    while i < bytes.len() && (bytes[i] == b'#' || bytes[i].is_ascii_whitespace()) {
        i += 1;
    }
    if bytes.len() >= i + 6 {
        #[inline(always)]
        const fn hex_val(b: u8) -> u32 {
            match b {
                b'0'..=b'9' => (b - b'0') as u32,
                b'a'..=b'f' => (b - b'a' + 10) as u32,
                b'A'..=b'F' => (b - b'A' + 10) as u32,
                _ => 0,
            }
        }
        const INV_255: f32 = 1.0 / 255.0;
        let r = ((hex_val(bytes[i]) << 4) | hex_val(bytes[i + 1])) as f32 * INV_255;
        let g = ((hex_val(bytes[i + 2]) << 4) | hex_val(bytes[i + 3])) as f32 * INV_255;
        let b = ((hex_val(bytes[i + 4]) << 4) | hex_val(bytes[i + 5])) as f32 * INV_255;
        [r, g, b, alpha]
    } else {
        [1.0, 1.0, 1.0, alpha]
    }
}

/// Direct element color lookup without dictionary lookup or string parsing
#[inline]
pub fn element_color_rgba(
    registry: &GameConfigRegistry,
    elem: ElementType,
    alpha: f32,
) -> [f32; 4] {
    if registry.element_colors.is_empty() {
        let [r, g, b] = match elem {
            ElementType::PHYSICAL => [0.580, 0.639, 0.722], // #94a3b8
            ElementType::FIRE => [0.937, 0.267, 0.267],     // #ef4444
            ElementType::WATER => [0.231, 0.510, 0.965],    // #3b82f6
            ElementType::EARTH => [0.851, 0.467, 0.024],    // #d97706
            ElementType::WIND => [0.063, 0.725, 0.506],     // #10b981
            ElementType::LIGHTNING => [0.918, 0.702, 0.031], // #eab308
            ElementType::ICE => [0.024, 0.714, 0.831],      // #06b6d4
            ElementType::LIGHT => [0.992, 0.878, 0.278],    // #fde047
            ElementType::DARK => [0.576, 0.200, 0.918],     // #9333ea
            ElementType::GRASS => [0.133, 0.773, 0.369],    // #22c55e
            ElementType::POISON => [0.659, 0.333, 0.969],   // #a855f7
            ElementType::STEEL => [0.796, 0.835, 0.882],    // #cbd5e1
            ElementType::GHOST => [0.506, 0.549, 0.973],    // #818cf8
            ElementType::DRAGON => [0.976, 0.451, 0.086],   // #f97316
            ElementType::FAIRY => [0.957, 0.447, 0.714],    // #f472b6
        };
        [r, g, b, alpha]
    } else {
        parse_hex_color(registry.get_element_color(elem), alpha)
    }
}

pub fn parse_element_str(s: &str) -> Option<ElementType> {
    match s.trim().to_uppercase().as_str() {
        "FIRE" => Some(ElementType::FIRE),
        "WATER" => Some(ElementType::WATER),
        "EARTH" => Some(ElementType::EARTH),
        "WIND" => Some(ElementType::WIND),
        "LIGHTNING" => Some(ElementType::LIGHTNING),
        "ICE" => Some(ElementType::ICE),
        "LIGHT" => Some(ElementType::LIGHT),
        "DARK" => Some(ElementType::DARK),
        "GRASS" => Some(ElementType::GRASS),
        "POISON" => Some(ElementType::POISON),
        "STEEL" => Some(ElementType::STEEL),
        "GHOST" => Some(ElementType::GHOST),
        "DRAGON" => Some(ElementType::DRAGON),
        "FAIRY" => Some(ElementType::FAIRY),
        "PHYSICAL" => Some(ElementType::PHYSICAL),
        _ => None,
    }
}

impl WebGl2Renderer {
    #[inline(always)]
    pub fn push_vertex(&mut self, x: f32, y: f32, c: [f32; 4]) {
        self.color_vertices
            .extend_from_slice(&[x, y, c[0], c[1], c[2], c[3]]);
    }

    #[inline]
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
        self.color_vertices.reserve(18);
        self.color_vertices.extend_from_slice(&[
            x1, y1, c[0], c[1], c[2], c[3], x2, y2, c[0], c[1], c[2], c[3], x3, y3, c[0], c[1],
            c[2], c[3],
        ]);
    }

    #[inline]
    pub fn draw_rect(&mut self, x: f32, y: f32, w: f32, h: f32, c: [f32; 4]) {
        let x2 = x + w;
        let y2 = y + h;
        self.color_vertices.reserve(36);
        self.color_vertices.extend_from_slice(&[
            x, y, c[0], c[1], c[2], c[3], x2, y, c[0], c[1], c[2], c[3], x2, y2, c[0], c[1], c[2],
            c[3], x, y, c[0], c[1], c[2], c[3], x2, y2, c[0], c[1], c[2], c[3], x, y2, c[0], c[1],
            c[2], c[3],
        ]);
    }

    /// High quality rounded rectangle with smooth quarter-circle corners
    pub fn draw_rounded_rect(&mut self, x: f32, y: f32, w: f32, h: f32, radius: f32, c: [f32; 4]) {
        if w <= 0.0 || h <= 0.0 {
            return;
        }
        let r = radius.max(0.0).min(w * 0.5).min(h * 0.5);
        if r <= 0.5 {
            self.draw_rect(x, y, w, h, c);
            return;
        }

        // Core rectangles
        self.draw_rect(x + r, y, w - 2.0 * r, h, c);
        if h > 2.0 * r {
            self.draw_rect(x, y + r, r, h - 2.0 * r, c);
            self.draw_rect(x + w - r, y + r, r, h - 2.0 * r, c);
        }

        // 4 corner quarter-circles (6 triangles each = 24 triangles = 432 floats)
        let q = &QUARTER_TABLE_6;
        let q_len = q.len();
        self.color_vertices.reserve(432);

        // Top-left corner
        let tl_x = x + r;
        let tl_y = y + r;
        for i in 0..(q_len - 1) {
            let (c1, s1) = q[i];
            let (c2, s2) = q[i + 1];
            self.color_vertices.extend_from_slice(&[
                tl_x,
                tl_y,
                c[0],
                c[1],
                c[2],
                c[3],
                tl_x - c1 * r,
                tl_y - s1 * r,
                c[0],
                c[1],
                c[2],
                c[3],
                tl_x - c2 * r,
                tl_y - s2 * r,
                c[0],
                c[1],
                c[2],
                c[3],
            ]);
        }

        // Top-right corner
        let tr_x = x + w - r;
        let tr_y = y + r;
        for i in 0..(q_len - 1) {
            let (c1, s1) = q[i];
            let (c2, s2) = q[i + 1];
            self.color_vertices.extend_from_slice(&[
                tr_x,
                tr_y,
                c[0],
                c[1],
                c[2],
                c[3],
                tr_x + s1 * r,
                tr_y - c1 * r,
                c[0],
                c[1],
                c[2],
                c[3],
                tr_x + s2 * r,
                tr_y - c2 * r,
                c[0],
                c[1],
                c[2],
                c[3],
            ]);
        }

        // Bottom-right corner
        let br_x = x + w - r;
        let br_y = y + h - r;
        for i in 0..(q_len - 1) {
            let (c1, s1) = q[i];
            let (c2, s2) = q[i + 1];
            self.color_vertices.extend_from_slice(&[
                br_x,
                br_y,
                c[0],
                c[1],
                c[2],
                c[3],
                br_x + c1 * r,
                br_y + s1 * r,
                c[0],
                c[1],
                c[2],
                c[3],
                br_x + c2 * r,
                br_y + s2 * r,
                c[0],
                c[1],
                c[2],
                c[3],
            ]);
        }

        // Bottom-left corner
        let bl_x = x + r;
        let bl_y = y + h - r;
        for i in 0..(q_len - 1) {
            let (c1, s1) = q[i];
            let (c2, s2) = q[i + 1];
            self.color_vertices.extend_from_slice(&[
                bl_x,
                bl_y,
                c[0],
                c[1],
                c[2],
                c[3],
                bl_x - s1 * r,
                bl_y + c1 * r,
                c[0],
                c[1],
                c[2],
                c[3],
                bl_x - s2 * r,
                bl_y + c2 * r,
                c[0],
                c[1],
                c[2],
                c[3],
            ]);
        }
    }

    #[inline]
    pub fn draw_line(&mut self, x1: f32, y1: f32, x2: f32, y2: f32, thickness: f32, c: [f32; 4]) {
        let dx = x2 - x1;
        let dy = y2 - y1;
        let len_sq = dx * dx + dy * dy;
        if len_sq < 0.000001 {
            return;
        }
        let inv_len = (thickness * 0.5) / len_sq.sqrt();
        let nx = -dy * inv_len;
        let ny = dx * inv_len;

        let p1x = x1 + nx;
        let p1y = y1 + ny;
        let p2x = x1 - nx;
        let p2y = y1 - ny;
        let p3x = x2 + nx;
        let p3y = y2 + ny;
        let p4x = x2 - nx;
        let p4y = y2 - ny;

        self.color_vertices.reserve(36);
        self.color_vertices.extend_from_slice(&[
            p1x, p1y, c[0], c[1], c[2], c[3], p2x, p2y, c[0], c[1], c[2], c[3], p4x, p4y, c[0],
            c[1], c[2], c[3], p1x, p1y, c[0], c[1], c[2], c[3], p4x, p4y, c[0], c[1], c[2], c[3],
            p3x, p3y, c[0], c[1], c[2], c[3],
        ]);
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
        let inv_total_len = 1.0 / total_len;
        let ux = dx * inv_total_len;
        let uy = dy * inv_total_len;
        let step = (dash_len + gap_len).max(2.0);

        // Precalculate normal vector once for ALL dashes
        let half_t = thickness * 0.5;
        let nx = -uy * half_t;
        let ny = ux * half_t;

        let mut d = -(offset.rem_euclid(step));
        while d < total_len {
            let s = d.max(0.0);
            let e = (d + dash_len).min(total_len);
            if e > s {
                let sx = x1 + ux * s;
                let sy = y1 + uy * s;
                let ex = x1 + ux * e;
                let ey = y1 + uy * e;

                self.color_vertices.reserve(36);
                self.color_vertices.extend_from_slice(&[
                    sx + nx,
                    sy + ny,
                    c[0],
                    c[1],
                    c[2],
                    c[3],
                    sx - nx,
                    sy - ny,
                    c[0],
                    c[1],
                    c[2],
                    c[3],
                    ex - nx,
                    ey - ny,
                    c[0],
                    c[1],
                    c[2],
                    c[3],
                    sx + nx,
                    sy + ny,
                    c[0],
                    c[1],
                    c[2],
                    c[3],
                    ex - nx,
                    ey - ny,
                    c[0],
                    c[1],
                    c[2],
                    c[3],
                    ex + nx,
                    ey + ny,
                    c[0],
                    c[1],
                    c[2],
                    c[3],
                ]);
            }
            d += step;
        }
    }

    #[inline]
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
        self.color_vertices.reserve(segs * 18);

        if let Some(table) = get_unit_circle_table(segs) {
            let n = table.len();
            for i in 0..n {
                let p1 = table[i];
                let p2 = if i + 1 < n { table[i + 1] } else { table[0] };
                self.color_vertices.extend_from_slice(&[
                    cx,
                    cy,
                    c[0],
                    c[1],
                    c[2],
                    c[3],
                    cx + p1.0 * rx,
                    cy + p1.1 * ry,
                    c[0],
                    c[1],
                    c[2],
                    c[3],
                    cx + p2.0 * rx,
                    cy + p2.1 * ry,
                    c[0],
                    c[1],
                    c[2],
                    c[3],
                ]);
            }
        } else {
            let step = (PI * 2.0) / (segs as f32);
            let mut prev_x = rx;
            let mut prev_y = 0.0;
            for i in 1..=segs {
                let a = (i as f32) * step;
                let (s, cos_val) = a.sin_cos();
                let cur_x = cos_val * rx;
                let cur_y = s * ry;
                self.color_vertices.extend_from_slice(&[
                    cx,
                    cy,
                    c[0],
                    c[1],
                    c[2],
                    c[3],
                    cx + prev_x,
                    cy + prev_y,
                    c[0],
                    c[1],
                    c[2],
                    c[3],
                    cx + cur_x,
                    cy + cur_y,
                    c[0],
                    c[1],
                    c[2],
                    c[3],
                ]);
                prev_x = cur_x;
                prev_y = cur_y;
            }
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
        self.color_vertices.reserve(segs * 36);
        let r_in = (radius - thickness * 0.5).max(0.0);
        let r_out = radius + thickness * 0.5;

        if let Some(table) = get_unit_circle_table(segs) {
            let n = table.len();
            for i in 0..n {
                let (c1, s1) = table[i];
                let (c2, s2) = if i + 1 < n { table[i + 1] } else { table[0] };

                let x1_in = cx + c1 * r_in;
                let y1_in = cy + s1 * r_in;
                let x1_out = cx + c1 * r_out;
                let y1_out = cy + s1 * r_out;
                let x2_in = cx + c2 * r_in;
                let y2_in = cy + s2 * r_in;
                let x2_out = cx + c2 * r_out;
                let y2_out = cy + s2 * r_out;

                self.color_vertices.extend_from_slice(&[
                    x1_in, y1_in, c[0], c[1], c[2], c[3], x1_out, y1_out, c[0], c[1], c[2], c[3],
                    x2_out, y2_out, c[0], c[1], c[2], c[3], x1_in, y1_in, c[0], c[1], c[2], c[3],
                    x2_out, y2_out, c[0], c[1], c[2], c[3], x2_in, y2_in, c[0], c[1], c[2], c[3],
                ]);
            }
        } else {
            let step = (PI * 2.0) / (segs as f32);
            let mut prev_c = 1.0;
            let mut prev_s = 0.0;
            for i in 1..=segs {
                let a = (i as f32) * step;
                let (cur_s, cur_c) = a.sin_cos();

                let x1_in = cx + prev_c * r_in;
                let y1_in = cy + prev_s * r_in;
                let x1_out = cx + prev_c * r_out;
                let y1_out = cy + prev_s * r_out;
                let x2_in = cx + cur_c * r_in;
                let y2_in = cy + cur_s * r_in;
                let x2_out = cx + cur_c * r_out;
                let y2_out = cy + cur_s * r_out;

                self.color_vertices.extend_from_slice(&[
                    x1_in, y1_in, c[0], c[1], c[2], c[3], x1_out, y1_out, c[0], c[1], c[2], c[3],
                    x2_out, y2_out, c[0], c[1], c[2], c[3], x1_in, y1_in, c[0], c[1], c[2], c[3],
                    x2_out, y2_out, c[0], c[1], c[2], c[3], x2_in, y2_in, c[0], c[1], c[2], c[3],
                ]);

                prev_c = cur_c;
                prev_s = cur_s;
            }
        }
    }

    pub fn draw_polyline(&mut self, pts: &[Vector2D], width: f32, c: [f32; 4]) {
        if pts.len() < 2 {
            return;
        }
        let half = width * 0.5;
        let cap_segs = smooth_circle_segments(half).max(24);
        for i in 0..(pts.len() - 1) {
            self.draw_line(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y, width, c);
            self.draw_circle(pts[i].x, pts[i].y, half, cap_segs, c);
        }
        if let Some(last) = pts.last() {
            self.draw_circle(last.x, last.y, half, cap_segs, c);
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

        self.tex_vertices.reserve(48);
        self.tex_vertices.extend_from_slice(&[
            x0, y0, u_left, uv.v0, tint[0], tint[1], tint[2], tint[3], x1, y0, u_right, uv.v0,
            tint[0], tint[1], tint[2], tint[3], x1, y1, u_right, uv.v1, tint[0], tint[1], tint[2],
            tint[3], x0, y0, u_left, uv.v0, tint[0], tint[1], tint[2], tint[3], x1, y1, u_right,
            uv.v1, tint[0], tint[1], tint[2], tint[3], x0, y1, u_left, uv.v1, tint[0], tint[1],
            tint[2], tint[3],
        ]);
        true
    }
}
