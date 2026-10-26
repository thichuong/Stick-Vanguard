use std::cell::RefCell;
use wasm_bindgen::prelude::*;

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
    pub state: u32,       // 0=Walking, 1=Flying, 2=Swimming, 3=Engaged, 4=Attacking, 5=Dead
    pub size: f32,
    pub nav_mode: u32,   // 0=Ground, 1=Water, 2=AirDirect, 3=AirWaypoints
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
    pub enemy_id_to_index: Vec<Option<usize>>, // Fast sparse lookup if ids are small

    // Spatial Hash Grid storing Enemy IDs (safe against vector swap-remove)
    pub grid_cells: Vec<Vec<u32>>,

    // Flat Render Buffer exposed directly to JavaScript / WebAssembly.Memory
    pub render_buffer: Vec<f32>,

    // Query result buffers
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
    ) {
        let pod = EnemyPod {
            id,
            x: 0.0,
            y: 0.0,
            prev_x: 0.0,
            prev_y: 0.0,
            speed,
            path_distance,
            facing: 0.0,
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
                // Update swapped element's index
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

        // 1. Update each enemy position
        for i in 0..enemy_count {
            let e = &mut self.enemies[i];
            if !e.is_alive || e.state == 5 {
                continue;
            }

            e.prev_x = e.x;
            e.prev_y = e.y;

            // Only move if not engaged or attacking
            if e.state != 3 && e.state != 4 {
                e.path_distance += e.speed * dt;

                if let Some(path) = Self::resolve_path_lane(ground, water, air, e.nav_mode, e.lane_index) {
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
                        let t = if seg.length > 0.0 { seg_dist / seg.length } else { 0.0 };

                        let mut cur_x = seg.p1_x + (seg.p2_x - seg.p1_x) * t;
                        let mut cur_y = seg.p1_y + (seg.p2_y - seg.p1_y) * t;

                        let dx = seg.p2_x - seg.p1_x;
                        let dy = seg.p2_y - seg.p1_y;
                        let facing = dy.atan2(dx);

                        if e.nav_mode == 2 {
                            // AIR_DIRECT: sinusoidal wobble perpendicular to direction
                            let perp_x = -facing.sin();
                            let perp_y = facing.cos();
                            let wobble = (anim_time * 3.0 + e.path_distance * 0.05 + (e.lane_index as f32)).sin() * 8.0;
                            cur_x += perp_x * wobble;
                            cur_y += perp_y * wobble;
                        } else if e.nav_mode == 1 {
                            // WATER_PATH: wave oscillation
                            cur_y += (anim_time * 4.0 + cur_x * 0.04 + (e.lane_index as f32)).sin() * 3.0;
                        }

                        e.x = cur_x;
                        e.y = cur_y;
                        e.facing = facing;
                    }
                }
            }

            // Populate render buffer
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

        // 2. Rebuild spatial grid with updated positions
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

        let col_min = ((clamped_min_x / CELL_SIZE).floor() as isize).clamp(0, (COLS - 1) as isize) as usize;
        let col_max = ((clamped_max_x / CELL_SIZE).floor() as isize).clamp(0, (COLS - 1) as isize) as usize;
        let row_min = ((clamped_min_y / CELL_SIZE).floor() as isize).clamp(0, (ROWS - 1) as isize) as usize;
        let row_max = ((clamped_max_y / CELL_SIZE).floor() as isize).clamp(0, (ROWS - 1) as isize) as usize;

        if col_min > col_max || row_min > row_max {
            return 0;
        }

        let range_sq = range * range;
        let mut best_id: u32 = 0;
        let mut best_score: f32 = match mode {
            1 => f32::MAX, // CLOSEST: smallest distance
            2 => -1.0,    // STRONGEST: highest hp
            3 => f32::MAX, // WEAKEST: lowest hp
            _ => -1.0,    // FIRST: largest path_distance
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
                                            // CLOSEST
                                            if dist_sq < best_score {
                                                best_score = dist_sq;
                                                best_id = e.id;
                                            }
                                        }
                                        2 => {
                                            // STRONGEST
                                            if e.hp_ratio > best_score {
                                                best_score = e.hp_ratio;
                                                best_id = e.id;
                                            }
                                        }
                                        3 => {
                                            // WEAKEST
                                            if e.hp_ratio < best_score {
                                                best_score = e.hp_ratio;
                                                best_id = e.id;
                                            }
                                        }
                                        _ => {
                                            // FIRST: largest path_distance
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

        let col_min = ((clamped_min_x / CELL_SIZE).floor() as isize).clamp(0, (COLS - 1) as isize) as usize;
        let col_max = ((clamped_max_x / CELL_SIZE).floor() as isize).clamp(0, (COLS - 1) as isize) as usize;
        let row_min = ((clamped_min_y / CELL_SIZE).floor() as isize).clamp(0, (ROWS - 1) as isize) as usize;
        let row_max = ((clamped_max_y / CELL_SIZE).floor() as isize).clamp(0, (ROWS - 1) as isize) as usize;

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

// Global thread-local world instance
thread_local! {
    static WORLD: RefCell<SimulationWorld> = RefCell::new(SimulationWorld::new(1000.0, 650.0));
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
