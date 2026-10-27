use crate::config::MapConfig;
use crate::types::{EnemyEntity, NavigationMode, Vector2D};
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PathSegment {
    pub p1: Vector2D,
    pub p2: Vector2D,
    pub length: f32,
    pub cumulative_length: f32,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PathLane {
    pub total_length: f32,
    pub segments: Vec<PathSegment>,
}

impl PathLane {
    pub fn from_vectors(waypoints: &[Vector2D]) -> Self {
        if waypoints.len() < 2 {
            return PathLane::default();
        }

        let mut segments = Vec::with_capacity(waypoints.len() - 1);
        let mut total_length = 0.0;

        for i in 0..(waypoints.len() - 1) {
            let p1 = waypoints[i];
            let p2 = waypoints[i + 1];
            let dx = p2.x - p1.x;
            let dy = p2.y - p1.y;
            let length = (dx * dx + dy * dy).sqrt();
            total_length += length;

            segments.push(PathSegment {
                p1,
                p2,
                length,
                cumulative_length: total_length,
            });
        }

        PathLane {
            total_length,
            segments,
        }
    }

    pub fn from_flat_coords(waypoints: &[f32]) -> Self {
        let count = waypoints.len() / 2;
        if count < 2 {
            return PathLane::default();
        }

        let mut vecs = Vec::with_capacity(count);
        for i in 0..count {
            vecs.push(Vector2D {
                x: waypoints[i * 2],
                y: waypoints[i * 2 + 1],
            });
        }
        Self::from_vectors(&vecs)
    }

    pub fn find_segment_index(&self, distance: f32) -> usize {
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

#[derive(Clone, Debug, Default)]
pub struct NavigationSystem {
    pub ground_paths: Vec<PathLane>,
    pub water_paths: Vec<PathLane>,
    pub air_paths: Vec<PathLane>,
}

impl NavigationSystem {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn from_map(map: &MapConfig) -> Self {
        let mut nav = Self::new();
        nav.rebuild_from_map(map);
        nav
    }

    pub fn rebuild_from_map(&mut self, map: &MapConfig) {
        self.ground_paths = map
            .get_resolved_ground_lanes()
            .iter()
            .map(|pts| PathLane::from_vectors(pts))
            .collect();

        self.water_paths = map
            .get_resolved_water_lanes()
            .iter()
            .map(|pts| PathLane::from_vectors(pts))
            .collect();

        self.air_paths = map
            .get_resolved_air_lanes()
            .iter()
            .map(|pts| PathLane::from_vectors(pts))
            .collect();
    }

    pub fn clear(&mut self) {
        self.ground_paths.clear();
        self.water_paths.clear();
        self.air_paths.clear();
    }

    pub fn set_flat_path(&mut self, mode_int: u32, lane_index: usize, waypoints: &[f32]) {
        let lane = PathLane::from_flat_coords(waypoints);
        let target = match mode_int {
            1 => &mut self.water_paths,
            2 | 3 => &mut self.air_paths,
            _ => &mut self.ground_paths,
        };
        if lane_index >= target.len() {
            target.resize(lane_index + 1, PathLane::default());
        }
        target[lane_index] = lane;
    }

    pub fn get_lane_count(&self, mode: NavigationMode) -> usize {
        match mode {
            NavigationMode::WaterPath => self.water_paths.len().max(1),
            NavigationMode::AirDirect | NavigationMode::AirWaypoints => self.air_paths.len().max(1),
            NavigationMode::GroundPath => self.ground_paths.len().max(1),
        }
    }

    pub fn get_all_lanes(&self, mode: NavigationMode) -> &[PathLane] {
        match mode {
            NavigationMode::WaterPath => &self.water_paths,
            NavigationMode::AirDirect | NavigationMode::AirWaypoints => &self.air_paths,
            NavigationMode::GroundPath => &self.ground_paths,
        }
    }

    pub fn get_path_info(&self, mode: NavigationMode, lane_index: usize) -> Option<&PathLane> {
        let pool = self.get_all_lanes(mode);
        if pool.is_empty() {
            self.ground_paths.first()
        } else {
            let safe_idx = lane_index % pool.len();
            pool.get(safe_idx).or_else(|| self.ground_paths.first())
        }
    }

    pub fn get_point_along_path(
        &self,
        mode: NavigationMode,
        distance: f32,
        anim_time: f32,
        lane_index: usize,
    ) -> (Vector2D, f32, bool) {
        let Some(path) = self.get_path_info(mode, lane_index) else {
            return (Vector2D { x: 0.0, y: 0.0 }, 0.0, true);
        };

        if path.segments.is_empty() {
            return (Vector2D { x: 0.0, y: 0.0 }, 0.0, true);
        }

        if distance >= path.total_length {
            let last_pt = path.segments[path.segments.len() - 1].p2;
            return (last_pt, 0.0, true);
        }

        if distance <= 0.0 {
            let first_seg = &path.segments[0];
            let dx = first_seg.p2.x - first_seg.p1.x;
            let dy = first_seg.p2.y - first_seg.p1.y;
            return (first_seg.p1, dy.atan2(dx), false);
        }

        let seg_idx = path.find_segment_index(distance);
        let seg = &path.segments[seg_idx];
        let prev_cum = seg.cumulative_length - seg.length;
        let seg_dist = distance - prev_cum;
        let t = if seg.length > 0.0 {
            seg_dist / seg.length
        } else {
            0.0
        };

        let mut x = seg.p1.x + (seg.p2.x - seg.p1.x) * t;
        let mut y = seg.p1.y + (seg.p2.y - seg.p1.y) * t;

        let dx = seg.p2.x - seg.p1.x;
        let dy = seg.p2.y - seg.p1.y;
        let facing = dy.atan2(dx);

        match mode {
            NavigationMode::AirDirect => {
                let perp_x = -facing.sin();
                let perp_y = facing.cos();
                let wobble = (anim_time * 3.0 + distance * 0.05 + (lane_index as f32)).sin() * 8.0;
                x += perp_x * wobble;
                y += perp_y * wobble;
            }
            NavigationMode::WaterPath => {
                y += (anim_time * 4.0 + x * 0.04 + (lane_index as f32)).sin() * 3.0;
            }
            _ => {}
        }

        (Vector2D { x, y }, facing, false)
    }

    pub fn update_enemy_transform(&self, enemy: &mut EnemyEntity, anim_time: f32) -> bool {
        let lane_idx = enemy.lane_index.unwrap_or(0);
        let (pos, facing, finished) = self.get_point_along_path(
            enemy.navigation_mode,
            enemy.path_distance,
            anim_time,
            lane_idx,
        );
        enemy.x = pos.x;
        enemy.y = pos.y;
        enemy.facing = facing;
        finished
    }
}

