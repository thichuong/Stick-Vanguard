use crate::types::{EnemyEntity, EnemyState};

pub const CELL_SIZE: f32 = 64.0;
pub const COLS: usize = 16; // ceil(1000 / 64)
pub const ROWS: usize = 11; // ceil(650 / 64)
pub const TOTAL_CELLS: usize = COLS * ROWS;

#[derive(Clone, Debug)]
pub struct SpatialGrid {
    pub width: f32,
    pub height: f32,
    pub cells: Vec<Vec<usize>>,
}

impl Default for SpatialGrid {
    fn default() -> Self {
        Self::new(1000.0, 650.0)
    }
}

impl SpatialGrid {
    pub fn new(width: f32, height: f32) -> Self {
        let mut cells = Vec::with_capacity(TOTAL_CELLS);
        for _ in 0..TOTAL_CELLS {
            cells.push(Vec::with_capacity(16));
        }
        SpatialGrid {
            width,
            height,
            cells,
        }
    }

    pub fn clear(&mut self) {
        for cell in self.cells.iter_mut() {
            cell.clear();
        }
    }

    pub fn rebuild(&mut self, enemies: &[EnemyEntity]) {
        self.clear();

        for (idx, e) in enemies.iter().enumerate() {
            if e.hp <= 0.0 || e.state == EnemyState::DEAD {
                continue;
            }

            let col = ((e.x / CELL_SIZE).floor() as isize).clamp(0, (COLS - 1) as isize) as usize;
            let row = ((e.y / CELL_SIZE).floor() as isize).clamp(0, (ROWS - 1) as isize) as usize;
            let cell_idx = row * COLS + col;
            if let Some(cell) = self.cells.get_mut(cell_idx) {
                cell.push(idx);
            }
        }
    }

    fn get_cell_bounds(&self, x: f32, y: f32, radius: f32) -> Option<(usize, usize, usize, usize)> {
        if radius <= 0.0 {
            return None;
        }

        let min_x = x - radius;
        let max_x = x + radius;
        let min_y = y - radius;
        let max_y = y + radius;

        if max_x < 0.0 || min_x >= self.width || max_y < 0.0 || min_y >= self.height {
            return None;
        }

        let clamped_min_x = min_x.max(0.0);
        let clamped_max_x = max_x.min(self.width - 1.0);
        let clamped_min_y = min_y.max(0.0);
        let clamped_max_y = max_y.min(self.height - 1.0);

        if clamped_min_x > clamped_max_x || clamped_min_y > clamped_max_y {
            return None;
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
            return None;
        }

        Some((col_min, col_max, row_min, row_max))
    }

    pub fn query_radius_indices(
        &self,
        enemies: &[EnemyEntity],
        x: f32,
        y: f32,
        radius: f32,
    ) -> Vec<usize> {
        let Some((col_min, col_max, row_min, row_max)) = self.get_cell_bounds(x, y, radius) else {
            return Vec::new();
        };

        let radius_sq = radius * radius;
        let mut results = Vec::new();

        for r in row_min..=row_max {
            for c in col_min..=col_max {
                let cell_idx = r * COLS + c;
                if let Some(cell) = self.cells.get(cell_idx) {
                    for &idx in cell {
                        if let Some(e) = enemies.get(idx) {
                            if e.hp <= 0.0 || e.state == EnemyState::DEAD {
                                continue;
                            }
                            let dx = e.x - x;
                            let dy = e.y - y;
                            if dx * dx + dy * dy <= radius_sq {
                                results.push(idx);
                            }
                        }
                    }
                }
            }
        }

        results
    }

    pub fn find_best_target_index<F>(
        &self,
        enemies: &[EnemyEntity],
        x: f32,
        y: f32,
        range: f32,
        filter: F,
    ) -> Option<usize>
    where
        F: Fn(&EnemyEntity) -> bool,
    {
        let Some((col_min, col_max, row_min, row_max)) = self.get_cell_bounds(x, y, range) else {
            return None;
        };

        let range_sq = range * range;
        let mut best_idx: Option<usize> = None;
        let mut max_progress: f32 = -1.0;

        for r in row_min..=row_max {
            for c in col_min..=col_max {
                let cell_idx = r * COLS + c;
                if let Some(cell) = self.cells.get(cell_idx) {
                    for &idx in cell {
                        if let Some(e) = enemies.get(idx) {
                            if e.hp <= 0.0 || e.state == EnemyState::DEAD {
                                continue;
                            }
                            let dx = e.x - x;
                            let dy = e.y - y;
                            if dx * dx + dy * dy <= range_sq && filter(e) {
                                if e.path_distance > max_progress {
                                    max_progress = e.path_distance;
                                    best_idx = Some(idx);
                                }
                            }
                        }
                    }
                }
            }
        }

        best_idx
    }

    pub fn find_closest_index<F>(
        &self,
        enemies: &[EnemyEntity],
        x: f32,
        y: f32,
        range: f32,
        filter: F,
    ) -> Option<usize>
    where
        F: Fn(&EnemyEntity) -> bool,
    {
        let Some((col_min, col_max, row_min, row_max)) = self.get_cell_bounds(x, y, range) else {
            return None;
        };

        let mut min_dist_sq = range * range;
        let mut closest_idx: Option<usize> = None;

        for r in row_min..=row_max {
            for c in col_min..=col_max {
                let cell_idx = r * COLS + c;
                if let Some(cell) = self.cells.get(cell_idx) {
                    for &idx in cell {
                        if let Some(e) = enemies.get(idx) {
                            if e.hp <= 0.0 || e.state == EnemyState::DEAD {
                                continue;
                            }
                            let dx = e.x - x;
                            let dy = e.y - y;
                            let d_sq = dx * dx + dy * dy;
                            if d_sq <= min_dist_sq && filter(e) {
                                min_dist_sq = d_sq;
                                closest_idx = Some(idx);
                            }
                        }
                    }
                }
            }
        }

        closest_idx
    }
}

