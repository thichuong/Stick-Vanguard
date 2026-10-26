/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export const get_enemy_count: () => number;
export const get_query_results_len: () => number;
export const get_query_results_ptr: () => number;
export const get_render_buffer_len: () => number;
export const get_render_buffer_ptr: () => number;
export const get_render_stride: () => number;
export const has_enemy_finished: (a: number) => number;
export const rebuild_spatial_grid: () => void;
export const remove_enemy: (a: number) => number;
export const set_path: (a: number, b: number, c: number, d: number) => void;
export const init_world: (a: number, b: number) => void;
export const query_radius: (a: number, b: number, c: number) => number;
export const clear_enemies: () => void;
export const clear_paths: () => void;
export const step_simulation: (a: number, b: number) => void;
export const find_best_target_in_range: (a: number, b: number, c: number, d: number) => number;
export const update_enemy_status: (a: number, b: number, c: number, d: number) => void;
export const spawn_enemy: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number) => void;
export const __wbindgen_externrefs: WebAssembly.Table;
export const __wbindgen_malloc: (a: number, b: number) => number;
export const __wbindgen_start: () => void;
