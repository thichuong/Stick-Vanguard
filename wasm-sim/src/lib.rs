use std::cell::RefCell;
use wasm_bindgen::prelude::*;

pub mod types;
pub mod config;
pub mod navigation;
pub mod spatial;
pub mod rules;
pub mod wave;
pub mod audio;
pub mod state;
pub mod systems;
pub mod webgl;

use crate::audio::RustSoundSystem;
use crate::config::{GameConfigRegistry, MapConfig};
use crate::navigation::NavigationSystem;
use crate::rules::{SimpleRng, TargetingRuleEngine};
use crate::spatial::SpatialGrid;
use crate::state::RustGameState;
use crate::systems::RustSimulationEngine;
use crate::types::{
    DamagePayload, ElementType, ElementalProfile, EnemyEntity, SoldierCombatMode, SoldierEntity,
    SoldierState, StatusEffectPayload, TargetingFilter, TowerBranch, TowerEntity, TowerType,
};
use crate::wave::WaveSystem;
use crate::webgl::WebGl2Renderer;

const STRIDE: usize = 12;
const CELL_SIZE: f32 = 64.0;
const COLS: usize = 16; // 1000 / 64
const ROWS: usize = 11; // 650 / 64
const TOTAL_CELLS: usize = COLS * ROWS;

#[derive(Clone, Debug)]
pub struct PathSegment {
    pub p1_x: f32,
    pub p1_y: f32,
    pub p2_x: f32,
    pub p2_y: f32,
    pub length: f32,
    pub cumulative_length: f32,
}

#[derive(Clone, Debug, Default)]
pub struct PathLane {
    pub segments: Vec<PathSegment>,
    pub total_length: f32,
}

impl PathLane {
    pub fn from_waypoints(waypoints: &[f32]) -> Self {
        let count = waypoints.len() / 2;
        if count < 2 {
            return PathLane::default();
        }

        let mut segments = Vec::with_capacity(count - 1);
        let mut total_length = 0.0;

        for i in 0..(count - 1) {
            let p1_x = waypoints[i * 2];
            let p1_y = waypoints[i * 2 + 1];
            let p2_x = waypoints[(i + 1) * 2];
            let p2_y = waypoints[(i + 1) * 2 + 1];

            let dx = p2_x - p1_x;
            let dy = p2_y - p1_y;
            let length = (dx * dx + dy * dy).sqrt();
            total_length += length;

            segments.push(PathSegment {
                p1_x,
                p1_y,
                p2_x,
                p2_y,
                length,
                cumulative_length: total_length,
            });
        }

        PathLane {
            segments,
            total_length,
        }
    }

    pub fn find_segment(&self, distance: f32) -> usize {
        if self.segments.is_empty() {
            return 0;
        }

        let mut low = 0usize;
        let mut high = self.segments.len() - 1;

        while low <= high {
            let mid = (low + high) >> 1;
            let seg = &self.segments[mid];
            let prev_cum = seg.cumulative_length - seg.length;

            if distance < prev_cum {
                if mid == 0 {
                    break;
                }
                high = mid - 1;
            } else if distance > seg.cumulative_length {
                low = mid + 1;
            } else {
                return mid;
            }
        }

        low.min(self.segments.len() - 1)
    }
}

#[derive(Clone, Debug)]
pub struct EnemyPod {
    pub id: u32,
    pub x: f32,
    pub y: f32,
    pub prev_x: f32,
    pub prev_y: f32,
    pub speed: f32,
    pub path_distance: f32,
    pub facing: f32,
    pub hp_ratio: f32,
    pub altitude: f32,
    pub state: u32,    // 0=Walking, 1=Flying, 2=Swimming, 3=Engaged, 4=Attacking, 5=Dead
    pub size: f32,
    pub nav_mode: u32, // 0=Ground, 1=Water, 2=AirDirect, 3=AirWaypoints
    pub lane_index: u32,
    pub has_finished: bool,
    pub is_alive: bool,
}

pub struct SimulationWorld {
    pub width: f32,
    pub height: f32,
    pub ground_lanes: Vec<PathLane>,
    pub water_lanes: Vec<PathLane>,
    pub air_lanes: Vec<PathLane>,

    pub enemies: Vec<EnemyPod>,
    pub enemy_id_to_index: Vec<Option<usize>>,

    pub grid_cells: Vec<Vec<u32>>,
    pub render_buffer: Vec<f32>,
    pub query_result_ids: Vec<u32>,
}

impl SimulationWorld {
    pub fn new(width: f32, height: f32) -> Self {
        let mut grid_cells = Vec::with_capacity(TOTAL_CELLS);
        for _ in 0..TOTAL_CELLS {
            grid_cells.push(Vec::with_capacity(16));
        }

        SimulationWorld {
            width,
            height,
            ground_lanes: Vec::new(),
            water_lanes: Vec::new(),
            air_lanes: Vec::new(),
            enemies: Vec::with_capacity(512),
            enemy_id_to_index: vec![None; 4096],
            grid_cells,
            render_buffer: Vec::with_capacity(512 * STRIDE),
            query_result_ids: Vec::with_capacity(256),
        }
    }

    pub fn set_path(&mut self, mode: u32, lane_index: u32, waypoints: &[f32]) {
        let lane = PathLane::from_waypoints(waypoints);
        let target = match mode {
            1 => &mut self.water_lanes,
            2 | 3 => &mut self.air_lanes,
            _ => &mut self.ground_lanes,
        };

        let idx = lane_index as usize;
        if idx >= target.len() {
            target.resize(idx + 1, PathLane::default());
        }
        target[idx] = lane;
    }

    pub fn clear_paths(&mut self) {
        self.ground_lanes.clear();
        self.water_lanes.clear();
        self.air_lanes.clear();
    }

    #[allow(clippy::too_many_arguments)]
    pub fn spawn_enemy(
        &mut self,
        id: u32,
        speed: f32,
        path_distance: f32,
        nav_mode: u32,
        lane_index: u32,
        size: f32,
        altitude: f32,
        hp_ratio: f32,
        state: u32,
        init_x: f32,
        init_y: f32,
        facing: f32,
    ) {
        let (x, y, face) = if init_x == 0.0 && init_y == 0.0 {
            if let Some(path) = Self::resolve_path_lane(
                &self.ground_lanes,
                &self.water_lanes,
                &self.air_lanes,
                nav_mode,
                lane_index,
            ) {
                if let Some(seg) = path.segments.first() {
                    let dx = seg.p2_x - seg.p1_x;
                    let dy = seg.p2_y - seg.p1_y;
                    (seg.p1_x, seg.p1_y, dy.atan2(dx))
                } else {
                    (0.0, 0.0, 0.0)
                }
            } else {
                (0.0, 0.0, 0.0)
            }
        } else {
            (init_x, init_y, facing)
        };

        let pod = EnemyPod {
            id,
            x,
            y,
            prev_x: x,
            prev_y: y,
            speed,
            path_distance,
            facing: face,
            hp_ratio,
            altitude,
            state,
            size,
            nav_mode,
            lane_index,
            has_finished: false,
            is_alive: true,
        };

        let idx = self.enemies.len();
        self.enemies.push(pod);

        let id_usize = id as usize;
        if id_usize >= self.enemy_id_to_index.len() {
            self.enemy_id_to_index.resize(id_usize + 1024, None);
        }
        self.enemy_id_to_index[id_usize] = Some(idx);
    }

    pub fn remove_enemy(&mut self, id: u32) -> bool {
        let id_usize = id as usize;
        if id_usize >= self.enemy_id_to_index.len() {
            return false;
        }

        if let Some(idx) = self.enemy_id_to_index[id_usize] {
            if idx < self.enemies.len() {
                self.enemies.swap_remove(idx);
                self.enemy_id_to_index[id_usize] = None;
                if idx < self.enemies.len() {
                    let swapped_id = self.enemies[idx].id as usize;
                    if swapped_id < self.enemy_id_to_index.len() {
                        self.enemy_id_to_index[swapped_id] = Some(idx);
                    }
                }
                return true;
            }
        }
        false
    }

    pub fn clear_enemies(&mut self) {
        self.enemies.clear();
        self.enemy_id_to_index.fill(None);
        self.render_buffer.clear();
        for cell in self.grid_cells.iter_mut() {
            cell.clear();
        }
    }

    fn resolve_path_lane<'a>(
        ground: &'a [PathLane],
        water: &'a [PathLane],
        air: &'a [PathLane],
        mode: u32,
        lane_index: u32,
    ) -> Option<&'a PathLane> {
        let target = match mode {
            1 => water,
            2 | 3 => air,
            _ => ground,
        };

        if target.is_empty() {
            ground.first()
        } else {
            let idx = (lane_index as usize) % target.len();
            target.get(idx).or_else(|| ground.first())
        }
    }

    pub fn rebuild_spatial_grid(&mut self) {
        for cell in self.grid_cells.iter_mut() {
            cell.clear();
        }

        for e in &self.enemies {
            if !e.is_alive || e.state == 5 {
                continue;
            }

            let col = ((e.x / CELL_SIZE).floor() as isize).clamp(0, (COLS - 1) as isize) as usize;
            let row = ((e.y / CELL_SIZE).floor() as isize).clamp(0, (ROWS - 1) as isize) as usize;
            let cell_idx = row * COLS + col;
            if let Some(cell) = self.grid_cells.get_mut(cell_idx) {
                cell.push(e.id);
            }
        }
    }

    pub fn step_simulation(&mut self, dt: f32, anim_time: f32) {
        let enemy_count = self.enemies.len();
        self.render_buffer.resize(enemy_count * STRIDE, 0.0);

        let ground = &self.ground_lanes;
        let water = &self.water_lanes;
        let air = &self.air_lanes;

        for i in 0..enemy_count {
            let e = &mut self.enemies[i];
            if !e.is_alive || e.state == 5 {
                continue;
            }

            e.prev_x = e.x;
            e.prev_y = e.y;

            if e.state != 3 && e.state != 4 {
                e.path_distance += e.speed * dt;

                if let Some(path) =
                    Self::resolve_path_lane(ground, water, air, e.nav_mode, e.lane_index)
                {
                    if path.segments.is_empty() {
                        e.has_finished = true;
                    } else if e.path_distance >= path.total_length {
                        let last_seg = &path.segments[path.segments.len() - 1];
                        e.x = last_seg.p2_x;
                        e.y = last_seg.p2_y;
                        e.facing = 0.0;
                        e.has_finished = true;
                    } else if e.path_distance <= 0.0 {
                        let first_seg = &path.segments[0];
                        e.x = first_seg.p1_x;
                        e.y = first_seg.p1_y;
                        let dx = first_seg.p2_x - first_seg.p1_x;
                        let dy = first_seg.p2_y - first_seg.p1_y;
                        e.facing = dy.atan2(dx);
                    } else {
                        let seg_idx = path.find_segment(e.path_distance);
                        let seg = &path.segments[seg_idx];
                        let prev_cum = seg.cumulative_length - seg.length;
                        let seg_dist = e.path_distance - prev_cum;
                        let t = if seg.length > 0.0 {
                            seg_dist / seg.length
                        } else {
                            0.0
                        };

                        let mut cur_x = seg.p1_x + (seg.p2_x - seg.p1_x) * t;
                        let mut cur_y = seg.p1_y + (seg.p2_y - seg.p1_y) * t;

                        let dx = seg.p2_x - seg.p1_x;
                        let dy = seg.p2_y - seg.p1_y;
                        let facing = dy.atan2(dx);

                        if e.nav_mode == 2 {
                            let perp_x = -facing.sin();
                            let perp_y = facing.cos();
                            let wobble = (anim_time * 3.0
                                + e.path_distance * 0.05
                                + (e.lane_index as f32))
                                .sin()
                                * 8.0;
                            cur_x += perp_x * wobble;
                            cur_y += perp_y * wobble;
                        } else if e.nav_mode == 1 {
                            cur_y +=
                                (anim_time * 4.0 + cur_x * 0.04 + (e.lane_index as f32)).sin()
                                    * 3.0;
                        }

                        e.x = cur_x;
                        e.y = cur_y;
                        e.facing = facing;
                    }
                }
            }

            let offset = i * STRIDE;
            self.render_buffer[offset] = e.id as f32;
            self.render_buffer[offset + 1] = e.x;
            self.render_buffer[offset + 2] = e.y;
            self.render_buffer[offset + 3] = e.prev_x;
            self.render_buffer[offset + 4] = e.prev_y;
            self.render_buffer[offset + 5] = e.facing;
            self.render_buffer[offset + 6] = e.hp_ratio;
            self.render_buffer[offset + 7] = e.altitude;
            self.render_buffer[offset + 8] = e.state as f32;
            self.render_buffer[offset + 9] = e.size;
            self.render_buffer[offset + 10] = e.path_distance;
            self.render_buffer[offset + 11] = if e.has_finished { 1.0 } else { 0.0 };
        }

        self.rebuild_spatial_grid();
    }

    pub fn find_best_target_in_range(&self, x: f32, y: f32, range: f32, mode: u32) -> u32 {
        if range <= 0.0 {
            return 0;
        }

        let min_x = x - range;
        let max_x = x + range;
        let min_y = y - range;
        let max_y = y + range;

        if max_x < 0.0 || min_x >= self.width || max_y < 0.0 || min_y >= self.height {
            return 0;
        }

        let clamped_min_x = min_x.max(0.0);
        let clamped_max_x = max_x.min(self.width - 1.0);
        let clamped_min_y = min_y.max(0.0);
        let clamped_max_y = max_y.min(self.height - 1.0);

        if clamped_min_x > clamped_max_x || clamped_min_y > clamped_max_y {
            return 0;
        }

        let col_min =
            ((clamped_min_x / CELL_SIZE).floor() as isize).clamp(0, (COLS - 1) as isize) as usize;
        let col_max =
            ((clamped_max_x / CELL_SIZE).floor() as isize).clamp(0, (COLS - 1) as isize) as usize;
        let row_min =
            ((clamped_min_y / CELL_SIZE).floor() as isize).clamp(0, (ROWS - 1) as isize) as usize;
        let row_max =
            ((clamped_max_y / CELL_SIZE).floor() as isize).clamp(0, (ROWS - 1) as isize) as usize;

        if col_min > col_max || row_min > row_max {
            return 0;
        }

        let range_sq = range * range;
        let mut best_id: u32 = 0;
        let mut best_score: f32 = match mode {
            1 => f32::MAX, // CLOSEST
            2 => -1.0,     // STRONGEST
            3 => f32::MAX, // WEAKEST
            _ => -1.0,     // FIRST
        };

        for r in row_min..=row_max {
            for c in col_min..=col_max {
                let cell_idx = r * COLS + c;
                if let Some(cell) = self.grid_cells.get(cell_idx) {
                    for &enemy_id in cell {
                        let id_usize = enemy_id as usize;
                        if let Some(Some(idx)) = self.enemy_id_to_index.get(id_usize) {
                            if let Some(e) = self.enemies.get(*idx) {
                                if !e.is_alive || e.state == 5 || e.id != enemy_id {
                                    continue;
                                }

                                let dx = e.x - x;
                                let dy = e.y - y;
                                let dist_sq = dx * dx + dy * dy;

                                if dist_sq <= range_sq {
                                    match mode {
                                        1 => {
                                            if dist_sq < best_score {
                                                best_score = dist_sq;
                                                best_id = e.id;
                                            }
                                        }
                                        2 => {
                                            if e.hp_ratio > best_score {
                                                best_score = e.hp_ratio;
                                                best_id = e.id;
                                            }
                                        }
                                        3 => {
                                            if e.hp_ratio < best_score {
                                                best_score = e.hp_ratio;
                                                best_id = e.id;
                                            }
                                        }
                                        _ => {
                                            if e.path_distance > best_score {
                                                best_score = e.path_distance;
                                                best_id = e.id;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        best_id
    }

    pub fn query_radius(&mut self, x: f32, y: f32, radius: f32) -> usize {
        self.query_result_ids.clear();

        if radius <= 0.0 {
            return 0;
        }

        let min_x = x - radius;
        let max_x = x + radius;
        let min_y = y - radius;
        let max_y = y + radius;

        if max_x < 0.0 || min_x >= self.width || max_y < 0.0 || min_y >= self.height {
            return 0;
        }

        let clamped_min_x = min_x.max(0.0);
        let clamped_max_x = max_x.min(self.width - 1.0);
        let clamped_min_y = min_y.max(0.0);
        let clamped_max_y = max_y.min(self.height - 1.0);

        if clamped_min_x > clamped_max_x || clamped_min_y > clamped_max_y {
            return 0;
        }

        let col_min =
            ((clamped_min_x / CELL_SIZE).floor() as isize).clamp(0, (COLS - 1) as isize) as usize;
        let col_max =
            ((clamped_max_x / CELL_SIZE).floor() as isize).clamp(0, (COLS - 1) as isize) as usize;
        let row_min =
            ((clamped_min_y / CELL_SIZE).floor() as isize).clamp(0, (ROWS - 1) as isize) as usize;
        let row_max =
            ((clamped_max_y / CELL_SIZE).floor() as isize).clamp(0, (ROWS - 1) as isize) as usize;

        if col_min > col_max || row_min > row_max {
            return 0;
        }

        let radius_sq = radius * radius;

        for r in row_min..=row_max {
            for c in col_min..=col_max {
                let cell_idx = r * COLS + c;
                if let Some(cell) = self.grid_cells.get(cell_idx) {
                    for &enemy_id in cell {
                        let id_usize = enemy_id as usize;
                        if let Some(Some(idx)) = self.enemy_id_to_index.get(id_usize) {
                            if let Some(e) = self.enemies.get(*idx) {
                                if !e.is_alive || e.state == 5 || e.id != enemy_id {
                                    continue;
                                }

                                let dx = e.x - x;
                                let dy = e.y - y;
                                if dx * dx + dy * dy <= radius_sq {
                                    self.query_result_ids.push(e.id);
                                }
                            }
                        }
                    }
                }
            }
        }

        self.query_result_ids.len()
    }
}

pub struct EngineContext {
    pub registry: GameConfigRegistry,
    pub state: RustGameState,
    pub nav: NavigationSystem,
    pub wave: WaveSystem,
    pub spatial: SpatialGrid,
    pub audio: RustSoundSystem,
    pub rng: SimpleRng,
    pub sim: RustSimulationEngine,
    pub renderer: WebGl2Renderer,
}

impl Default for EngineContext {
    fn default() -> Self {
        Self::new()
    }
}

impl EngineContext {
    pub fn new() -> Self {
        EngineContext {
            registry: GameConfigRegistry::default(),
            state: RustGameState::new(),
            nav: NavigationSystem::new(),
            wave: WaveSystem::new(15),
            spatial: SpatialGrid::new(1000.0, 650.0),
            audio: RustSoundSystem::new(),
            rng: SimpleRng::new(0x9E37_79B9),
            sim: RustSimulationEngine::new(),
            renderer: WebGl2Renderer::new(1000.0, 650.0),
        }
    }

    pub fn load_config(&mut self, json: &str) -> bool {
        if let Ok(reg) = serde_json::from_str::<GameConfigRegistry>(json) {
            self.registry = reg;
            let map_id = if self.state.current_map_id.is_empty() {
                "VALLEY_ORIGIN".to_string()
            } else {
                self.state.current_map_id.clone()
            };
            if !self.set_map(&map_id) {
                if let Some(first_map) = self.registry.maps.first() {
                    let first_id = first_map.id.clone();
                    self.set_map(&first_id);
                }
            }
            true
        } else {
            false
        }
    }

    pub fn set_map(&mut self, map_id: &str) -> bool {
        let ok = self.state.set_map(&self.registry, map_id);
        if ok {
            self.nav.rebuild_from_map(&self.state.current_map);
            self.wave.reset();
            self.wave.set_total_waves(self.state.custom_total_waves);
            self.spatial.clear();
        }
        ok
    }

    pub fn reset(&mut self) {
        self.state.reset();
        self.nav.rebuild_from_map(&self.state.current_map);
        self.wave.reset();
        self.wave.set_total_waves(self.state.custom_total_waves);
        self.spatial.clear();
        self.sim.accumulator = 0.0;
        self.sim.interpolation_alpha = 1.0;
    }

    pub fn tick(&mut self, dt: f32) {
        self.sim.tick(
            &self.registry,
            &mut self.state,
            &self.nav,
            &mut self.wave,
            &mut self.spatial,
            &mut self.audio,
            &mut self.rng,
            dt,
        );
    }

    pub fn update(&mut self, raw_dt: f32) {
        self.sim.update(
            &self.registry,
            &mut self.state,
            &self.nav,
            &mut self.wave,
            &mut self.spatial,
            &mut self.audio,
            &mut self.rng,
            raw_dt,
        );
    }
}

thread_local! {
    static WORLD: RefCell<SimulationWorld> = RefCell::new(SimulationWorld::new(1000.0, 650.0));
    static CTX: RefCell<EngineContext> = RefCell::new(EngineContext::new());
    static CODEX_RENDERER: RefCell<WebGl2Renderer> = RefCell::new(WebGl2Renderer::new(240.0, 200.0));
}

#[wasm_bindgen]
pub fn init_world(width: f32, height: f32) {
    WORLD.with(|w| {
        *w.borrow_mut() = SimulationWorld::new(width, height);
    });
}

#[wasm_bindgen]
pub fn set_path(mode: u32, lane_index: u32, waypoints: &[f32]) {
    WORLD.with(|w| {
        w.borrow_mut().set_path(mode, lane_index, waypoints);
    });
}

#[wasm_bindgen]
pub fn clear_paths() {
    WORLD.with(|w| {
        w.borrow_mut().clear_paths();
    });
}

#[wasm_bindgen]
#[allow(clippy::too_many_arguments)]
pub fn spawn_enemy(
    id: u32,
    speed: f32,
    path_distance: f32,
    nav_mode: u32,
    lane_index: u32,
    size: f32,
    altitude: f32,
    hp_ratio: f32,
    state: u32,
    init_x: f32,
    init_y: f32,
    facing: f32,
) {
    WORLD.with(|w| {
        w.borrow_mut().spawn_enemy(
            id,
            speed,
            path_distance,
            nav_mode,
            lane_index,
            size,
            altitude,
            hp_ratio,
            state,
            init_x,
            init_y,
            facing,
        );
    });
}

#[wasm_bindgen]
pub fn remove_enemy(id: u32) -> bool {
    WORLD.with(|w| w.borrow_mut().remove_enemy(id))
}

#[wasm_bindgen]
pub fn clear_enemies() {
    WORLD.with(|w| w.borrow_mut().clear_enemies());
}

#[wasm_bindgen]
pub fn step_simulation(dt: f32, anim_time: f32) {
    WORLD.with(|w| {
        w.borrow_mut().step_simulation(dt, anim_time);
    });
}

#[wasm_bindgen]
pub fn rebuild_spatial_grid() {
    WORLD.with(|w| {
        w.borrow_mut().rebuild_spatial_grid();
    });
}

#[wasm_bindgen]
pub fn get_enemy_count() -> usize {
    WORLD.with(|w| w.borrow().enemies.len())
}

#[wasm_bindgen]
pub fn get_render_stride() -> usize {
    STRIDE
}

#[wasm_bindgen]
pub fn get_render_buffer_ptr() -> *const f32 {
    WORLD.with(|w| w.borrow().render_buffer.as_ptr())
}

#[wasm_bindgen]
pub fn get_render_buffer_len() -> usize {
    WORLD.with(|w| w.borrow().render_buffer.len())
}

#[wasm_bindgen]
pub fn find_best_target_in_range(x: f32, y: f32, range: f32, mode: u32) -> u32 {
    WORLD.with(|w| w.borrow().find_best_target_in_range(x, y, range, mode))
}

#[wasm_bindgen]
pub fn query_radius(x: f32, y: f32, radius: f32) -> usize {
    WORLD.with(|w| w.borrow_mut().query_radius(x, y, radius))
}

#[wasm_bindgen]
pub fn get_query_results_ptr() -> *const u32 {
    WORLD.with(|w| w.borrow().query_result_ids.as_ptr())
}

#[wasm_bindgen]
pub fn get_query_results_len() -> usize {
    WORLD.with(|w| w.borrow().query_result_ids.len())
}

#[wasm_bindgen]
pub fn update_enemy_status(id: u32, speed: f32, hp_ratio: f32, state: u32) {
    WORLD.with(|w| {
        let mut world = w.borrow_mut();
        let id_usize = id as usize;
        let idx_opt = world.enemy_id_to_index.get(id_usize).copied().flatten();
        if let Some(idx) = idx_opt {
            if let Some(e) = world.enemies.get_mut(idx) {
                e.speed = speed;
                e.hp_ratio = hp_ratio;
                e.state = state;
            }
        }
    });
}

#[wasm_bindgen]
pub fn has_enemy_finished(id: u32) -> bool {
    WORLD.with(|w| {
        let world = w.borrow();
        let id_usize = id as usize;
        let idx_opt = world.enemy_id_to_index.get(id_usize).copied().flatten();
        if let Some(idx) = idx_opt {
            if let Some(e) = world.enemies.get(idx) {
                return e.has_finished;
            }
        }
        false
    })
}

// =========================================================================
// Full Rust WASM Engine, Config, Rules, Audio, and WebGL2 Renderer Exports
// =========================================================================

#[wasm_bindgen]
pub fn load_game_config(json: &str) -> bool {
    CTX.with(|c| c.borrow_mut().load_config(json))
}

#[wasm_bindgen]
pub fn init_webgl_renderer(gl_ctx: JsValue) -> bool {
    CTX.with(|c| c.borrow_mut().renderer.init_context(gl_ctx))
}

#[wasm_bindgen]
pub fn upload_webgl_atlas(image: JsValue, manifest_json: &str) -> bool {
    CTX.with(|c| c.borrow_mut().renderer.upload_atlas(&image, manifest_json))
}

#[wasm_bindgen]
pub fn init_codex_webgl_renderer(gl_ctx: JsValue) -> bool {
    CODEX_RENDERER.with(|r| r.borrow_mut().init_context(gl_ctx))
}

#[wasm_bindgen]
pub fn upload_codex_webgl_atlas(image: JsValue, manifest_json: &str) -> bool {
    CODEX_RENDERER.with(|r| r.borrow_mut().upload_atlas(&image, manifest_json))
}

#[wasm_bindgen]
pub fn render_codex_enemy_webgl(enemy_type_id: &str, anim_time: f32, width: f32, height: f32) -> bool {
    CTX.with(|c| {
        let ctx = c.borrow();
        CODEX_RENDERER.with(|r| {
            r.borrow_mut().render_codex_enemy_preview(&ctx.registry, enemy_type_id, anim_time, width, height)
        })
    })
}

#[wasm_bindgen]
pub fn render_codex_soldier_webgl(soldier_type: &str, stance: &str, anim_time: f32, width: f32, height: f32) -> bool {
    CTX.with(|c| {
        let ctx = c.borrow();
        CODEX_RENDERER.with(|r| {
            r.borrow_mut().render_codex_soldier_preview(&ctx.registry, soldier_type, stance, anim_time, width, height)
        })
    })
}

#[wasm_bindgen]
pub fn render_webgl_frame() {
    CTX.with(|c| {
        let mut ctx = c.borrow_mut();
        let anim_time = ctx.sim.total_anim_time;
        let alpha = ctx.sim.interpolation_alpha;
        let EngineContext {
            ref registry,
            ref state,
            ref mut renderer,
            ..
        } = *ctx;
        renderer.build_scene(registry, state, anim_time, alpha);
        renderer.flush();
    });
}

#[wasm_bindgen]
pub fn render_custom_state_webgl(state_json: &str, anim_time: f32, alpha: f32) -> usize {
    if let Ok(custom_state) = serde_json::from_str::<RustGameState>(state_json) {
        CTX.with(|c| {
            let mut ctx = c.borrow_mut();
            let EngineContext {
                ref registry,
                ref mut renderer,
                ..
            } = *ctx;
            renderer.build_scene(registry, &custom_state, anim_time, alpha);
            renderer.flush();
            renderer.color_vertices.len() + renderer.tex_vertices.len()
        })
    } else {
        0
    }
}

#[wasm_bindgen]
pub fn engine_step_and_render(raw_dt: f32) -> String {
    CTX.with(|c| {
        let mut ctx = c.borrow_mut();
        ctx.update(raw_dt);

        let anim_time = ctx.sim.total_anim_time;
        let alpha = ctx.sim.interpolation_alpha;
        let EngineContext {
            ref registry,
            ref state,
            ref mut renderer,
            ref wave,
            ..
        } = *ctx;

        renderer.build_scene(registry, state, anim_time, alpha);
        renderer.flush();

        serde_json::to_string(&serde_json::json!({
            "gold": state.gold,
            "lives": state.lives,
            "maxLives": state.max_lives,
            "currentWaveIndex": wave.current_wave_index,
            "totalWaves": wave.custom_total_waves,
            "isWaveInProgress": wave.is_wave_in_progress,
            "isGameOver": state.is_game_over,
            "isVictory": state.is_victory,
            "enemyCount": state.enemies.len(),
            "towerCount": state.towers.len(),
            "gameSpeed": state.game_speed,
            "isPaused": state.is_paused,
            "animTime": anim_time,
            "alpha": alpha,
            "floatingTexts": &state.floating_texts,
            "soldiers": &state.soldiers,
        }))
        .unwrap_or_default()
    })
}

#[wasm_bindgen]
pub fn engine_sync_towers_and_soldiers(
    towers_json: &str,
    soldiers_json: &str,
    gold: Option<i32>,
    lives: Option<i32>,
) -> bool {
    let towers_res: Result<Vec<TowerEntity>, _> = serde_json::from_str(towers_json);
    let soldiers_res: Result<Vec<SoldierEntity>, _> = serde_json::from_str(soldiers_json);
    if let (Ok(towers), Ok(soldiers)) = (towers_res, soldiers_res) {
        CTX.with(|c| {
            let mut ctx = c.borrow_mut();
            ctx.state.towers = towers;

            // Retain living soldiers whose towers still exist (e.g. if a summon tower was sold)
            let valid_tower_ids: std::collections::HashSet<String> =
                ctx.state.towers.iter().map(|t| t.id.clone()).collect();
            ctx.state.soldiers.retain(|s| valid_tower_ids.contains(&s.tower_id));

            for incoming in soldiers {
                if let Some(existing) = ctx.state.soldiers.iter_mut().find(|s| s.id == incoming.id) {
                    let tier_changed = existing.tier != incoming.tier || existing.branch != incoming.branch;

                    existing.tier = incoming.tier;
                    existing.branch = incoming.branch;
                    existing.base_damage = incoming.base_damage;
                    existing.base_max_hp = incoming.base_max_hp;
                    existing.max_hp = incoming.max_hp;
                    existing.armor = incoming.armor;
                    existing.magic_resist = incoming.magic_resist;
                    existing.element = incoming.element;
                    existing.secondary_element = incoming.secondary_element;
                    existing.combat_mode = incoming.combat_mode;

                    // Fully restore soldier HP to max_hp upon upgrade (tier/branch change or incoming full hp)
                    if tier_changed || incoming.hp >= incoming.max_hp {
                        existing.hp = existing.max_hp;
                        if existing.state == SoldierState::DEAD {
                            existing.state = SoldierState::IDLE;
                            existing.respawn_timer = 0.0;
                            existing.x = existing.rally_point.x;
                            existing.y = existing.rally_point.y;
                            existing.target_pos = existing.rally_point;
                        }
                    }

                    let rp_changed = (existing.rally_point.x - incoming.rally_point.x).abs() > 1.0
                        || (existing.rally_point.y - incoming.rally_point.y).abs() > 1.0;
                    if rp_changed {
                        existing.rally_point = incoming.rally_point;
                        existing.state = SoldierState::MovingToRally;
                    }
                } else {
                    ctx.state.soldiers.push(incoming);
                }
            }

            if let Some(g) = gold {
                ctx.state.gold = g;
            }
            if let Some(l) = lives {
                ctx.state.lives = l;
            }
            ctx.state.recalculate_tower_buffs();
        });
        true
    } else {
        false
    }
}

#[wasm_bindgen]
pub fn engine_call_wave_early() -> String {
    CTX.with(|c| {
        let mut ctx = c.borrow_mut();
        if ctx.state.is_game_over || ctx.state.is_victory {
            return serde_json::json!({ "ok": false }).to_string();
        }
        ctx.audio.play_wave_start();
        let mut bonus_gold = 0;
        if ctx.wave.is_wave_in_progress {
            if ctx.wave.current_wave_index + 1 < ctx.wave.custom_total_waves {
                let base_bonus = 25.0;
                let bonus = ((base_bonus * ctx.state.gold_multiplier).round() as i32).max(1);
                ctx.state.gold += bonus;
                bonus_gold = bonus;
                ctx.state.add_floating_text(
                    &format!("+{} 🪙 Gọi đợt sớm!", bonus),
                    500.0,
                    80.0,
                    "#facc15",
                    15.0,
                );
                let EngineContext { ref registry, ref state, ref mut wave, .. } = *ctx;
                wave.call_wave_early(registry, &state.current_map);
            }
        } else {
            if ctx.wave.current_wave_index < ctx.wave.custom_total_waves {
                let wave_num = ctx.wave.current_wave_index + 1;
                let EngineContext { ref registry, ref state, ref mut wave, .. } = *ctx;
                wave.start_wave(registry, &state.current_map, Some(wave_num));
            }
        }
        serde_json::json!({
            "ok": true,
            "bonusGold": bonus_gold,
            "currentWaveIndex": ctx.wave.current_wave_index,
            "isWaveInProgress": ctx.wave.is_wave_in_progress,
        })
        .to_string()
    })
}

#[wasm_bindgen]
pub fn engine_set_game_settings(custom_waves: usize, gold_mult: f32, dmg_mult: f32, speed: f32, paused: bool) {
    CTX.with(|c| {
        let mut ctx = c.borrow_mut();
        ctx.state.custom_total_waves = custom_waves;
        ctx.wave.set_total_waves(custom_waves);
        ctx.state.gold_multiplier = gold_mult;
        ctx.state.damage_multiplier = dmg_mult;
        ctx.state.game_speed = speed;
        ctx.state.is_paused = paused;
    });
}

#[wasm_bindgen]
pub fn engine_get_tower_info(tower_id: &str) -> String {
    CTX.with(|c| {
        let ctx = c.borrow();
        if let Some(t) = ctx.state.towers.iter().find(|t| t.id == tower_id) {
            serde_json::to_string(t).unwrap_or_default()
        } else {
            String::new()
        }
    })
}

#[wasm_bindgen]
pub fn engine_set_selected_tower(tower_id: Option<String>, is_setting_rally: bool) {
    CTX.with(|c| {
        let mut ctx = c.borrow_mut();
        ctx.state.selected_tower_id = tower_id;
        ctx.state.is_setting_rally_point = is_setting_rally;
    });
}

#[wasm_bindgen]
pub fn audio_init() {
    CTX.with(|c| c.borrow_mut().audio.init());
}

#[wasm_bindgen]
pub fn engine_set_map(map_id: &str) -> String {
    CTX.with(|c| {
        let mut ctx = c.borrow_mut();
        ctx.set_map(map_id);
        serde_json::to_string(&ctx.state).unwrap_or_default()
    })
}

#[wasm_bindgen]
pub fn engine_reset() -> String {
    CTX.with(|c| {
        let mut ctx = c.borrow_mut();
        ctx.reset();
        serde_json::to_string(&ctx.state).unwrap_or_default()
    })
}

#[wasm_bindgen]
pub fn engine_get_state_json() -> String {
    CTX.with(|c| {
        let ctx = c.borrow();
        serde_json::to_string(&ctx.state).unwrap_or_default()
    })
}

#[wasm_bindgen]
pub fn engine_set_state_json(json: &str) -> bool {
    if let Ok(new_state) = serde_json::from_str::<RustGameState>(json) {
        CTX.with(|c| {
            let mut ctx = c.borrow_mut();
            ctx.nav.rebuild_from_map(&new_state.current_map);
            ctx.wave.set_total_waves(new_state.custom_total_waves);
            ctx.state = new_state;
        });
        true
    } else {
        false
    }
}

#[wasm_bindgen]
pub fn engine_tick(dt: f32) -> String {
    CTX.with(|c| {
        let mut ctx = c.borrow_mut();
        ctx.tick(dt);
        serde_json::to_string(&ctx.state).unwrap_or_default()
    })
}

#[wasm_bindgen]
pub fn engine_update(raw_dt: f32) -> String {
    CTX.with(|c| {
        let mut ctx = c.borrow_mut();
        ctx.update(raw_dt);
        serde_json::to_string(&ctx.state).unwrap_or_default()
    })
}

#[wasm_bindgen]
pub fn engine_get_interpolation_alpha() -> f32 {
    CTX.with(|c| c.borrow().sim.interpolation_alpha)
}

#[wasm_bindgen]
pub fn engine_get_wave_status_json() -> String {
    CTX.with(|c| {
        let ctx = c.borrow();
        serde_json::json!({
            "currentWaveIndex": ctx.wave.current_wave_index,
            "isWaveInProgress": ctx.wave.is_wave_in_progress,
            "waveTime": ctx.wave.wave_time,
            "customTotalWaves": ctx.wave.custom_total_waves,
            "activeSpawners": ctx.wave.active_spawners,
        })
        .to_string()
    })
}

#[wasm_bindgen]
pub fn engine_start_wave(wave_num: Option<usize>) -> String {
    CTX.with(|c| {
        let mut ctx = c.borrow_mut();
        let EngineContext {
            ref registry,
            ref state,
            ref mut wave,
            ref mut audio,
            ..
        } = *ctx;
        let ok = wave.start_wave(registry, &state.current_map, wave_num);
        if ok {
            audio.play_wave_start();
        }
        serde_json::json!({
            "ok": ok,
            "currentWaveIndex": wave.current_wave_index,
            "isWaveInProgress": wave.is_wave_in_progress,
        })
        .to_string()
    })
}

#[wasm_bindgen]
pub fn engine_validate_placement(x: f32, y: f32, tower_type_str: &str) -> String {
    CTX.with(|c| {
        let ctx = c.borrow();
        let res = ctx.state.validate_placement(x, y, tower_type_str);
        serde_json::to_string(&res).unwrap_or_default()
    })
}

#[wasm_bindgen]
pub fn engine_build_tower_at(x: f32, y: f32, tower_type_str: &str) -> String {
    let parsed_type: Result<TowerType, _> =
        serde_json::from_value(serde_json::Value::String(tower_type_str.to_string()));
    if let Ok(tower_type) = parsed_type {
        CTX.with(|c| {
            let mut ctx = c.borrow_mut();
            let EngineContext {
                ref registry,
                ref mut state,
                ref mut audio,
                ..
            } = *ctx;
            let ok = state.build_tower_at(registry, audio, x, y, tower_type);
            serde_json::json!({
                "ok": ok,
                "state": state
            })
            .to_string()
        })
    } else {
        serde_json::json!({ "ok": false }).to_string()
    }
}

#[wasm_bindgen]
pub fn engine_build_tower(slot_id: &str, tower_type_str: &str) -> String {
    let parsed_type: Result<TowerType, _> =
        serde_json::from_value(serde_json::Value::String(tower_type_str.to_string()));
    if let Ok(tower_type) = parsed_type {
        CTX.with(|c| {
            let mut ctx = c.borrow_mut();
            let EngineContext {
                ref registry,
                ref mut state,
                ref mut audio,
                ..
            } = *ctx;
            let ok = state.build_tower(registry, audio, slot_id, tower_type);
            serde_json::json!({
                "ok": ok,
                "state": state
            })
            .to_string()
        })
    } else {
        serde_json::json!({ "ok": false }).to_string()
    }
}

#[wasm_bindgen]
pub fn engine_upgrade_tower(tower_id: &str, branch_str: Option<String>) -> String {
    let branch = branch_str
        .and_then(|b| serde_json::from_value::<TowerBranch>(serde_json::Value::String(b)).ok());
    CTX.with(|c| {
        let mut ctx = c.borrow_mut();
        let EngineContext {
            ref registry,
            ref mut state,
            ref mut audio,
            ..
        } = *ctx;
        let ok = state.upgrade_tower(registry, audio, tower_id, branch);
        serde_json::json!({
            "ok": ok,
            "state": state
        })
        .to_string()
    })
}

#[wasm_bindgen]
pub fn engine_downgrade_or_destroy_tower(tower_id: &str) -> String {
    CTX.with(|c| {
        let mut ctx = c.borrow_mut();
        let EngineContext {
            ref registry,
            ref mut state,
            ref mut audio,
            ref mut rng,
            ..
        } = *ctx;
        let res = state.downgrade_or_destroy_tower(registry, audio, rng, tower_id);
        serde_json::json!({
            "result": res,
            "state": state
        })
        .to_string()
    })
}

#[wasm_bindgen]
pub fn engine_set_tower_element(tower_id: &str, element_str: &str, slot_idx: u8) -> String {
    let parsed_elem: Result<ElementType, _> =
        serde_json::from_value(serde_json::Value::String(element_str.to_string()));
    if let Ok(elem) = parsed_elem {
        CTX.with(|c| {
            let mut ctx = c.borrow_mut();
            let EngineContext {
                ref registry,
                ref mut state,
                ref mut audio,
                ..
            } = *ctx;
            let ok = state.set_tower_element(registry, audio, tower_id, elem, slot_idx);
            serde_json::json!({
                "ok": ok,
                "state": state
            })
            .to_string()
        })
    } else {
        serde_json::json!({ "ok": false }).to_string()
    }
}

#[wasm_bindgen]
pub fn engine_set_barracks_mode(tower_id: &str, mode_str: &str) -> String {
    let parsed_mode: Result<SoldierCombatMode, _> =
        serde_json::from_value(serde_json::Value::String(mode_str.to_string()));
    if let Ok(mode) = parsed_mode {
        CTX.with(|c| {
            let mut ctx = c.borrow_mut();
            let EngineContext {
                ref mut state,
                ref mut audio,
                ..
            } = *ctx;
            let ok = state.set_barracks_soldier_mode(audio, tower_id, mode);
            serde_json::json!({
                "ok": ok,
                "state": state
            })
            .to_string()
        })
    } else {
        serde_json::json!({ "ok": false }).to_string()
    }
}

#[wasm_bindgen]
pub fn engine_sell_tower(tower_id: &str) -> String {
    CTX.with(|c| {
        let mut ctx = c.borrow_mut();
        let EngineContext {
            ref mut state,
            ref mut audio,
            ..
        } = *ctx;
        let ok = state.sell_tower(audio, tower_id);
        serde_json::json!({
            "ok": ok,
            "state": state
        })
        .to_string()
    })
}

#[wasm_bindgen]
pub fn engine_set_rally_point(tower_id: &str, x: f32, y: f32) -> String {
    CTX.with(|c| {
        let mut ctx = c.borrow_mut();
        let EngineContext {
            ref mut state,
            ref mut audio,
            ..
        } = *ctx;
        let ok = state.set_rally_point(audio, tower_id, x, y);
        serde_json::json!({
            "ok": ok,
            "state": state
        })
        .to_string()
    })
}

#[wasm_bindgen]
pub fn engine_handle_soldier_death(soldier_id: &str) -> String {
    CTX.with(|c| {
        let mut ctx = c.borrow_mut();
        let EngineContext {
            ref registry,
            ref mut state,
            ref mut audio,
            ref mut rng,
            ..
        } = *ctx;
        state.handle_soldier_death(registry, audio, rng, soldier_id);
        serde_json::to_string(state).unwrap_or_default()
    })
}

// =========================================================================
// Rule Engine & Wave System Stateless Helpers for UI & Tests
// =========================================================================

#[wasm_bindgen]
pub fn rules_can_target(filter_json: &str, enemy_json: &str) -> bool {
    let filter: Result<TargetingFilter, _> = serde_json::from_str(filter_json);
    let enemy: Result<EnemyEntity, _> = serde_json::from_str(enemy_json);
    if let (Ok(f), Ok(e)) = (filter, enemy) {
        TargetingRuleEngine::can_target(&f, &e)
    } else {
        false
    }
}

#[wasm_bindgen]
pub fn rules_calculate_elemental_matchup(attacker_str: &str, profile_json: &str) -> f32 {
    let attacker: Result<ElementType, _> =
        serde_json::from_value(serde_json::Value::String(attacker_str.to_string()));
    let profile: Result<ElementalProfile, _> = serde_json::from_str(profile_json);
    if let (Ok(att), Ok(prof)) = (attacker, profile) {
        CTX.with(|c| {
            let ctx = c.borrow();
            TargetingRuleEngine::calculate_elemental_matchup(&ctx.registry, att, &prof)
        })
    } else {
        1.0
    }
}

#[wasm_bindgen]
pub fn rules_calculate_damage(
    payload_json: &str,
    enemy_json: &str,
    global_damage_mult: f32,
) -> String {
    let payload: Result<DamagePayload, _> = serde_json::from_str(payload_json);
    let enemy: Result<EnemyEntity, _> = serde_json::from_str(enemy_json);
    if let (Ok(p), Ok(e)) = (payload, enemy) {
        CTX.with(|c| {
            let ctx = c.borrow();
            let res =
                TargetingRuleEngine::calculate_damage(&ctx.registry, global_damage_mult, &p, &e);
            serde_json::to_string(&res).unwrap_or_default()
        })
    } else {
        String::new()
    }
}

#[wasm_bindgen]
pub fn rules_apply_damage_to_enemy(
    enemy_json: &str,
    calc_json: &str,
    elem_str: &str,
    sec_elem_str: Option<String>,
) -> String {
    let enemy: Result<EnemyEntity, _> = serde_json::from_str(enemy_json);
    let calc: Result<crate::rules::DamageCalculationResult, _> = serde_json::from_str(calc_json);
    let elem: Result<ElementType, _> =
        serde_json::from_value(serde_json::Value::String(elem_str.to_string()));
    let sec_elem = sec_elem_str
        .and_then(|s| serde_json::from_value::<ElementType>(serde_json::Value::String(s)).ok());

    if let (Ok(mut e), Ok(c), Ok(el)) = (enemy, calc, elem) {
        let (hp_lost, shield_absorbed) =
            TargetingRuleEngine::apply_damage_to_enemy(&mut e, &c, el, sec_elem);
        serde_json::json!({
            "hpLost": hp_lost,
            "shieldAbsorbed": shield_absorbed,
            "enemy": e
        })
        .to_string()
    } else {
        String::new()
    }
}

#[wasm_bindgen]
pub fn rules_apply_elemental_hit_effects(
    enemy_json: &str,
    element_str: &str,
    base_damage: f32,
) -> String {
    let enemy: Result<EnemyEntity, _> = serde_json::from_str(enemy_json);
    let elem: Result<ElementType, _> =
        serde_json::from_value(serde_json::Value::String(element_str.to_string()));
    if let (Ok(mut e), Ok(el)) = (enemy, elem) {
        CTX.with(|c| {
            let mut ctx = c.borrow_mut();
            let EngineContext {
                ref registry,
                ref mut rng,
                ..
            } = *ctx;
            TargetingRuleEngine::apply_elemental_hit_effects(
                registry,
                rng,
                &mut e,
                el,
                base_damage,
            );
            serde_json::to_string(&e).unwrap_or_default()
        })
    } else {
        String::new()
    }
}

#[wasm_bindgen]
pub fn rules_apply_all_payload_effects(enemy_json: &str, payload_json: &str) -> String {
    let enemy: Result<EnemyEntity, _> = serde_json::from_str(enemy_json);
    let payload: Result<DamagePayload, _> = serde_json::from_str(payload_json);
    if let (Ok(mut e), Ok(p)) = (enemy, payload) {
        CTX.with(|c| {
            let mut ctx = c.borrow_mut();
            let EngineContext {
                ref registry,
                ref mut rng,
                ..
            } = *ctx;
            TargetingRuleEngine::apply_all_payload_effects(registry, rng, &mut e, &p);
            serde_json::to_string(&e).unwrap_or_default()
        })
    } else {
        String::new()
    }
}

#[wasm_bindgen]
pub fn rules_apply_status_effect(enemy_json: &str, payload_json: &str) -> String {
    let enemy: Result<EnemyEntity, _> = serde_json::from_str(enemy_json);
    let payload: Result<StatusEffectPayload, _> = serde_json::from_str(payload_json);
    if let (Ok(mut e), Ok(p)) = (enemy, payload) {
        CTX.with(|c| {
            let ctx = c.borrow();
            TargetingRuleEngine::apply_status_effect(&ctx.registry, &mut e, p);
            serde_json::to_string(&e).unwrap_or_default()
        })
    } else {
        String::new()
    }
}

#[wasm_bindgen]
pub fn rules_update_status_effects(enemy_json: &str, dt: f32, global_dmg_mult: f32) -> String {
    if let Ok(mut e) = serde_json::from_str::<EnemyEntity>(enemy_json) {
        CTX.with(|c| {
            let ctx = c.borrow();
            let mut dot_events: Vec<serde_json::Value> = Vec::new();
            TargetingRuleEngine::update_status_effects(
                &ctx.registry,
                global_dmg_mult,
                &mut e,
                dt,
                |dmg, elem| {
                    dot_events.push(serde_json::json!({
                        "damage": dmg,
                        "element": elem
                    }));
                },
            );
            serde_json::json!({
                "enemy": e,
                "dots": dot_events
            })
            .to_string()
        })
    } else {
        String::new()
    }
}

#[wasm_bindgen]
pub fn rules_calculate_enemy_damage_to_soldier(enemy_json: &str, soldier_json: &str) -> String {
    let enemy: Result<EnemyEntity, _> = serde_json::from_str(enemy_json);
    let soldier: Result<SoldierEntity, _> = serde_json::from_str(soldier_json);
    if let (Ok(e), Ok(s)) = (enemy, soldier) {
        CTX.with(|c| {
            let ctx = c.borrow();
            let res = TargetingRuleEngine::calculate_enemy_damage_to_soldier_detailed(
                &ctx.registry,
                &e,
                &s,
            );
            serde_json::to_string(&res).unwrap_or_default()
        })
    } else {
        String::new()
    }
}

#[wasm_bindgen]
pub fn rules_calculate_soldier_defensive_multiplier(
    attacker_str: &str,
    soldier_json: &str,
) -> String {
    let attacker: Result<ElementType, _> =
        serde_json::from_value(serde_json::Value::String(attacker_str.to_string()));
    let soldier: Result<SoldierEntity, _> = serde_json::from_str(soldier_json);
    if let (Ok(att), Ok(s)) = (attacker, soldier) {
        CTX.with(|c| {
            let ctx = c.borrow();
            let (matchup_mult, armor_or_resist, final_intake_ratio) =
                TargetingRuleEngine::calculate_soldier_defensive_multiplier(&ctx.registry, att, &s);
            serde_json::json!({
                "matchupMultiplier": matchup_mult,
                "armorOrResistReduction": armor_or_resist,
                "finalDamageIntakeRatio": final_intake_ratio,
            })
            .to_string()
        })
    } else {
        String::new()
    }
}

#[wasm_bindgen]
pub fn rules_get_crowd_control_modifiers(enemy_json: &str) -> String {
    if let Ok(e) = serde_json::from_str::<EnemyEntity>(enemy_json) {
        CTX.with(|c| {
            let ctx = c.borrow();
            let cc = TargetingRuleEngine::get_crowd_control_modifiers(&ctx.registry, &e);
            serde_json::to_string(&cc).unwrap_or_default()
        })
    } else {
        String::new()
    }
}

#[wasm_bindgen]
pub fn rules_apply_knockback(enemy_json: &str, base_distance: f32) -> String {
    if let Ok(mut e) = serde_json::from_str::<EnemyEntity>(enemy_json) {
        CTX.with(|c| {
            let ctx = c.borrow();
            let dist = TargetingRuleEngine::apply_knockback(&ctx.registry, &mut e, base_distance);
            serde_json::json!({
                "actualDistance": dist,
                "enemy": e
            })
            .to_string()
        })
    } else {
        String::new()
    }
}

#[wasm_bindgen]
pub fn rules_apply_damage_reduction(enemy_json: &str, ratio: f32, duration: f32) -> String {
    if let Ok(mut enemy) = serde_json::from_str::<EnemyEntity>(enemy_json) {
        TargetingRuleEngine::apply_damage_reduction(&mut enemy, ratio, duration);
        serde_json::to_string(&enemy).unwrap_or_default()
    } else {
        String::new()
    }
}

#[wasm_bindgen]
pub fn rules_apply_reaction_bonus_effects(
    enemy_json: &str,
    element_str: &str,
    base_damage: f32,
) -> String {
    let enemy: Result<EnemyEntity, _> = serde_json::from_str(enemy_json);
    let elem: Result<ElementType, _> =
        serde_json::from_value(serde_json::Value::String(element_str.to_string()));
    if let (Ok(mut e), Ok(el)) = (enemy, elem) {
        CTX.with(|c| {
            let ctx = c.borrow();
            TargetingRuleEngine::apply_reaction_bonus_effects(&ctx.registry, &mut e, el, base_damage);
            serde_json::to_string(&e).unwrap_or_default()
        })
    } else {
        String::new()
    }
}

#[wasm_bindgen]
pub fn rules_sync_effective_damage_reduction(enemy_json: &str) -> String {
    if let Ok(mut enemy) = serde_json::from_str::<EnemyEntity>(enemy_json) {
        TargetingRuleEngine::sync_effective_damage_reduction(&mut enemy);
        serde_json::to_string(&enemy).unwrap_or_default()
    } else {
        String::new()
    }
}

#[wasm_bindgen]
pub fn rules_get_effective_damage_reduction_ratio(enemy_json: &str) -> f32 {
    if let Ok(enemy) = serde_json::from_str::<EnemyEntity>(enemy_json) {
        TargetingRuleEngine::get_effective_damage_reduction_ratio(&enemy)
    } else {
        0.0
    }
}

#[wasm_bindgen]
pub fn rules_is_enemy_stunned_or_frozen(enemy_json: &str) -> bool {
    if let Ok(enemy) = serde_json::from_str::<EnemyEntity>(enemy_json) {
        TargetingRuleEngine::is_enemy_stunned_or_frozen(&enemy)
    } else {
        false
    }
}

#[wasm_bindgen]
pub fn rules_get_enemy_attack_speed_multiplier(enemy_json: &str) -> f32 {
    if let Ok(enemy) = serde_json::from_str::<EnemyEntity>(enemy_json) {
        CTX.with(|c| {
            let ctx = c.borrow();
            TargetingRuleEngine::get_enemy_attack_speed_multiplier(&ctx.registry, &enemy)
        })
    } else {
        1.0
    }
}

#[wasm_bindgen]
pub fn rules_get_soldier_elements(soldier_json: &str) -> String {
    if let Ok(soldier) = serde_json::from_str::<SoldierEntity>(soldier_json) {
        let elements = TargetingRuleEngine::get_soldier_elements(&soldier);
        serde_json::to_string(&elements).unwrap_or_default()
    } else {
        String::new()
    }
}

#[wasm_bindgen]
pub fn combat_find_unengaged_enemy_near(
    enemies_json: &str,
    x: f32,
    y: f32,
    radius: f32,
    can_block_air: bool,
) -> String {
    if let Ok(enemies) = serde_json::from_str::<Vec<EnemyEntity>>(enemies_json) {
        let mut grid = SpatialGrid::new(1000.0, 650.0);
        grid.rebuild(&enemies);
        if let Some(idx) = crate::systems::CombatSystem::find_unengaged_enemy_near(
            &enemies,
            &grid,
            crate::types::Vector2D { x, y },
            radius,
            can_block_air,
        ) {
            serde_json::to_string(&enemies[idx]).unwrap_or_default()
        } else {
            String::new()
        }
    } else {
        String::new()
    }
}

#[wasm_bindgen]
pub fn wave_generate_config(map_json: &str, wave_index: usize) -> String {
    if let Ok(map) = serde_json::from_str::<MapConfig>(map_json) {
        CTX.with(|c| {
            let ctx = c.borrow();
            let cfg = ctx
                .wave
                .generate_wave_config(&ctx.registry, &map, wave_index);
            serde_json::to_string(&cfg).unwrap_or_default()
        })
    } else {
        String::new()
    }
}

#[wasm_bindgen]
pub fn wave_create_enemy(
    map_json: &str,
    type_id: &str,
    wave_index: usize,
    forced_lane_index: Option<usize>,
) -> String {
    if let Ok(map) = serde_json::from_str::<MapConfig>(map_json) {
        CTX.with(|c| {
            let mut ctx = c.borrow_mut();
            let prev_wave = ctx.wave.current_wave_index;
            ctx.wave.current_wave_index = wave_index;
            let EngineContext {
                ref registry,
                ref mut wave,
                ..
            } = *ctx;
            let enemy = wave.create_enemy(registry, &map, type_id, forced_lane_index, Some(wave_index));
            wave.current_wave_index = prev_wave;
            if let Some(e) = enemy {
                serde_json::to_string(&e).unwrap_or_default()
            } else {
                String::new()
            }
        })
    } else {
        String::new()
    }
}

// =========================================================================
// Audio Exports (SoundSystem in Rust)
// =========================================================================

#[wasm_bindgen]
pub fn audio_set_enabled(enabled: bool) {
    CTX.with(|c| c.borrow_mut().audio.set_enabled(enabled));
}

#[wasm_bindgen]
pub fn audio_set_volume(volume: f32) {
    CTX.with(|c| c.borrow_mut().audio.set_volume(volume));
}

#[wasm_bindgen]
pub fn audio_get_recorded_events_json() -> String {
    CTX.with(|c| {
        let ctx = c.borrow();
        serde_json::to_string(&ctx.audio.recorded_events).unwrap_or_default()
    })
}

#[wasm_bindgen]
pub fn audio_clear_recorded_events() {
    CTX.with(|c| c.borrow_mut().audio.recorded_events.clear());
}

#[wasm_bindgen]
pub fn audio_play_shoot(shoot_type: &str) {
    CTX.with(|c| c.borrow_mut().audio.play_shoot(shoot_type));
}

#[wasm_bindgen]
pub fn audio_play_hit(is_immune: bool, is_reaction: bool, is_melee: bool) {
    CTX.with(|c| {
        c.borrow_mut()
            .audio
            .play_hit(is_immune, is_reaction, is_melee)
    });
}

#[wasm_bindgen]
pub fn audio_play_explosion(scale: &str) {
    CTX.with(|c| c.borrow_mut().audio.play_explosion(scale));
}

#[wasm_bindgen]
pub fn audio_play_trap_trigger(trap_type: &str) {
    CTX.with(|c| c.borrow_mut().audio.play_trap_trigger(trap_type));
}

#[wasm_bindgen]
pub fn audio_play_enemy_death(tier: &str) {
    CTX.with(|c| c.borrow_mut().audio.play_enemy_death(tier));
}

#[wasm_bindgen]
pub fn audio_play_soldier_death() {
    CTX.with(|c| c.borrow_mut().audio.play_soldier_death());
}

#[wasm_bindgen]
pub fn audio_play_tower_damaged(severity: &str) {
    CTX.with(|c| c.borrow_mut().audio.play_tower_damaged(severity));
}

#[wasm_bindgen]
pub fn audio_play_base_damaged(is_boss: bool) {
    CTX.with(|c| c.borrow_mut().audio.play_base_damaged(is_boss));
}

#[wasm_bindgen]
pub fn audio_play_enemy_skill(skill: &str) {
    CTX.with(|c| c.borrow_mut().audio.play_enemy_skill(skill));
}

#[wasm_bindgen]
pub fn audio_play_build() {
    CTX.with(|c| c.borrow_mut().audio.play_build());
}

#[wasm_bindgen]
pub fn audio_play_upgrade() {
    CTX.with(|c| c.borrow_mut().audio.play_upgrade());
}

#[wasm_bindgen]
pub fn audio_play_imbue() {
    CTX.with(|c| c.borrow_mut().audio.play_imbue());
}

#[wasm_bindgen]
pub fn audio_play_sell() {
    CTX.with(|c| c.borrow_mut().audio.play_sell());
}

#[wasm_bindgen]
pub fn audio_play_rally() {
    CTX.with(|c| c.borrow_mut().audio.play_rally());
}

#[wasm_bindgen]
pub fn audio_play_error() {
    CTX.with(|c| c.borrow_mut().audio.play_error());
}

#[wasm_bindgen]
pub fn audio_play_wave_start() {
    CTX.with(|c| c.borrow_mut().audio.play_wave_start());
}

#[wasm_bindgen]
pub fn audio_play_wave_complete() {
    CTX.with(|c| c.borrow_mut().audio.play_wave_complete());
}

#[wasm_bindgen]
pub fn audio_play_victory() {
    CTX.with(|c| c.borrow_mut().audio.play_victory());
}

#[wasm_bindgen]
pub fn audio_play_game_over() {
    CTX.with(|c| c.borrow_mut().audio.play_game_over());
}

#[wasm_bindgen]
pub fn audio_play_ui_click() {
    CTX.with(|c| c.borrow_mut().audio.play_ui_click());
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::*;

    #[test]
    fn test_spatial_grid_and_path_lane() {
        let mut world = SimulationWorld::new(1000.0, 650.0);
        world.set_path(0, 0, &[0.0, 100.0, 500.0, 100.0, 500.0, 400.0]);
        world.spawn_enemy(1, 100.0, 0.0, 0, 0, 1.0, 0.0, 1.0, 0, 0.0, 0.0, 0.0);
        world.step_simulation(1.0, 1.0);
        assert_eq!(world.enemies.len(), 1);
        assert!((world.enemies[0].x - 100.0).abs() < 1e-3);
        let found = world.find_best_target_in_range(100.0, 100.0, 50.0, 0);
        assert_eq!(found, 1);
    }

    #[test]
    fn test_targeting_rule_engine_can_target_and_damage() {
        let ground_only = TargetingFilter {
            allowed_movement: vec![MovementType::WALK],
            excluded_elements: None,
            excluded_tags: Some(vec!["STEALTH".to_string()]),
            skip_immune_targets: None,
        };
        let mut enemy = EnemyEntity {
            id: "e1".to_string(),
            type_id: "GRUNT".to_string(),
            name: "Grunt".to_string(),
            movement_type: MovementType::WALK,
            navigation_mode: NavigationMode::GroundPath,
            lane_index: Some(0),
            hp: 100.0,
            max_hp: 100.0,
            speed: 50.0,
            base_speed: 50.0,
            size: 12.0,
            damage: 5.0,
            attack_speed: 1.0,
            attack_cooldown: 0.0,
            reward_gold: 10,
            elemental_profile: ElementalProfile {
                primary_element: ElementType::GRASS,
                secondary_element: None,
                immunities: vec![ElementType::POISON],
                damage_multipliers: None,
            },
            tags: vec![],
            abilities: None,
            ability_timers: None,
            x: 100.0,
            y: 100.0,
            prev_x: Some(100.0),
            prev_y: Some(100.0),
            path_distance: 0.0,
            path_total_length: 500.0,
            facing: 0.0,
            altitude: 0.0,
            state: EnemyState::WALKING,
            status_effects: vec![],
            engaged_by_soldier_id: None,
            armor_shield: None,
            max_armor_shield: None,
            magic_shield: None,
            max_magic_shield: None,
            damage_reduction_ratio: None,
            damage_reduction_timer: None,
            damage_reduction_buffs: None,
            cc_resistance: None,
        };

        assert!(TargetingRuleEngine::can_target(&ground_only, &enemy));
        enemy.tags.push("STEALTH".to_string());
        assert!(!TargetingRuleEngine::can_target(&ground_only, &enemy));
        enemy.tags.clear();

        let reg = GameConfigRegistry::default();
        let payload = DamagePayload {
            amount: 40.0,
            element: ElementType::POISON,
            secondary_element: None,
            secondary_amount: None,
            bonus_elements: None,
            source_id: "t1".to_string(),
            is_crit: Some(false),
            status_effect: None,
            secondary_status_effect: None,
        };
        let res = TargetingRuleEngine::calculate_damage(&reg, 1.0, &payload, &enemy);
        assert!(res.is_immune);
        assert_eq!(res.final_damage, 0.0);
    }

    #[test]
    fn test_audio_recording_and_throttling() {
        let mut audio = RustSoundSystem::new();
        audio.set_enabled(true);
        audio.play_shoot("ARCHER");
        audio.play_explosion("LARGE");
        assert_eq!(audio.recorded_events.len(), 3); // SET_ENABLED, SHOOT, EXPLOSION
        assert_eq!(audio.recorded_events[1].sound, "SHOOT");
        assert_eq!(audio.recorded_events[2].sound, "EXPLOSION");
    }

    #[test]
    fn test_webgl_batcher_generates_vertices() {
        let mut ctx = EngineContext::new();
        ctx.renderer
            .build_scene(&ctx.registry, &ctx.state, 0.5, 1.0);
        assert!(!ctx.renderer.color_vertices.is_empty());
    }

    #[test]
    fn test_webgl_redesigned_summon_and_enemy_renders() {
        let mut ctx = EngineContext::new();
        let soldier_keys = [
            "BARRACKS_1|PHYSICAL",
            "BARRACKS_2|EARTH",
            "BARRACKS_3|STEEL",
            "BARRACKS_4_A|LIGHT",
            "BARRACKS_4_B|FIRE",
            "DRAGON_NEST_1|FIRE",
            "DRAGON_NEST_4_A|LIGHT",
            "DRAGON_NEST_4_B|DARK",
            "FAIRY_TREE_1|WIND",
            "FAIRY_TREE_4_A|LIGHT",
            "FAIRY_TREE_4_B|POISON",
            "HEROIC_ALTAR|GHOST",
        ];
        for k in soldier_keys {
            let ok = ctx.renderer.render_codex_soldier_preview(&ctx.registry, k, "MELEE", 1.0, 240.0, 180.0);
            assert!(ok);
            assert!(!ctx.renderer.color_vertices.is_empty());
        }
    }

    #[test]
    fn test_engine_step_and_render_and_sync() {
        let json_out = engine_step_and_render(0.016);
        assert!(!json_out.is_empty());
        assert!(json_out.contains("gold"));
        assert!(json_out.contains("lives"));

        let ok = engine_sync_towers_and_soldiers("[]", "[]", Some(500), Some(20));
        assert!(ok);

        // Test soldier HP refill upon upgrade
        let initial_soldier_json = r#"[{"id":"test-s1","towerId":"t1","name":"Lính 1","x":100.0,"y":100.0,"hp":30.0,"maxHp":100.0,"baseMaxHp":100.0,"damage":15.0,"baseDamage":15.0,"attackSpeed":1.0,"attackCooldown":0.0,"element":"PHYSICAL","state":"IDLE","rallyPoint":{"x":100.0,"y":100.0},"targetPos":{"x":100.0,"y":100.0},"armor":0.1,"baseArmor":0.1,"magicResist":0.1,"respawnTimer":0.0,"respawnDelay":7.0,"tier":1}]"#;
        engine_sync_towers_and_soldiers(r#"[{"id":"t1","type":"BARRACKS","x":100.0,"y":100.0,"tier":1,"damage":15.0,"range":150.0,"fireRate":1.0,"totalInvested":100,"element":"PHYSICAL"}]"#, initial_soldier_json, None, None);

        // Check it was added with 30 HP
        CTX.with(|c| {
            let s = c.borrow().state.soldiers.iter().find(|s| s.id == "test-s1").unwrap().clone();
            assert_eq!(s.hp, 30.0);
            assert_eq!(s.max_hp, 100.0);
        });

        // Upgrade tower to tier 2 with full max_hp (180)
        let upgraded_soldier_json = r#"[{"id":"test-s1","towerId":"t1","name":"Lính 1","x":100.0,"y":100.0,"hp":180.0,"maxHp":180.0,"baseMaxHp":180.0,"damage":25.0,"baseDamage":25.0,"attackSpeed":1.0,"attackCooldown":0.0,"element":"PHYSICAL","state":"IDLE","rallyPoint":{"x":100.0,"y":100.0},"targetPos":{"x":100.0,"y":100.0},"armor":0.15,"baseArmor":0.15,"magicResist":0.1,"respawnTimer":0.0,"respawnDelay":7.0,"tier":2}]"#;
        engine_sync_towers_and_soldiers(r#"[{"id":"t1","type":"BARRACKS","x":100.0,"y":100.0,"tier":2,"damage":25.0,"range":160.0,"fireRate":1.0,"totalInvested":220,"element":"PHYSICAL"}]"#, upgraded_soldier_json, None, None);

        // Verify that existing soldier's HP is refilled to 180 (100% maxHp)
        CTX.with(|c| {
            let s = c.borrow().state.soldiers.iter().find(|s| s.id == "test-s1").unwrap().clone();
            assert_eq!(s.hp, 180.0);
            assert_eq!(s.max_hp, 180.0);
            assert_eq!(s.tier, 2);
        });

        // Setup mock map waves so waves 1-5 have enemy entries
        CTX.with(|c| {
            let mut ctx = c.borrow_mut();
            ctx.state.current_map.waves = (1..=10).map(|w| crate::config::WaveConfig {
                wave_number: w,
                name: format!("Đợt {}", w),
                reward_gold: (50 + w * 10) as u32,
                enemies: vec![crate::config::WaveEnemyEntry {
                    type_id: "STICK_RUNNER".to_string(),
                    count: 5,
                    interval: 1.0,
                    delay: 0.0,
                }],
            }).collect();
        });

        let call_res = engine_call_wave_early();
        assert!(call_res.contains("currentWaveIndex"));

        // Test rapid successive early wave calls (Waves 1 to 5)
        // Ensure spawners are extended and wave 5 (and all previous waves) are NOT swallowed.
        for _ in 0..4 {
            let res = engine_call_wave_early();
            assert!(res.contains("\"ok\":true"));
        }

        CTX.with(|c| {
            let ctx = c.borrow();
            // Wave index should now be at 4 (Wave 5)
            assert_eq!(ctx.wave.current_wave_index, 4);
            assert!(ctx.wave.is_wave_in_progress);
            // Spawners from all 5 waves must be queued simultaneously (not overwritten)
            assert_eq!(ctx.wave.active_spawners.len(), 5);
            // Pending rewards must accumulate all 5 called waves
            assert_eq!(ctx.wave.pending_rewards.len(), 5);
        });
    }
}
