/* tslint:disable */
/* eslint-disable */

export function clear_enemies(): void;

export function clear_paths(): void;

export function find_best_target_in_range(x: number, y: number, range: number, mode: number): number;

export function get_enemy_count(): number;

export function get_query_results_len(): number;

export function get_query_results_ptr(): number;

export function get_render_buffer_len(): number;

export function get_render_buffer_ptr(): number;

export function get_render_stride(): number;

export function has_enemy_finished(id: number): boolean;

export function init_world(width: number, height: number): void;

export function query_radius(x: number, y: number, radius: number): number;

export function rebuild_spatial_grid(): void;

export function remove_enemy(id: number): boolean;

export function set_path(mode: number, lane_index: number, waypoints: Float32Array): void;

export function spawn_enemy(id: number, speed: number, path_distance: number, nav_mode: number, lane_index: number, size: number, altitude: number, hp_ratio: number, state: number): void;

export function step_simulation(dt: number, anim_time: number): void;

export function update_enemy_status(id: number, speed: number, hp_ratio: number, state: number): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly get_enemy_count: () => number;
    readonly get_query_results_len: () => number;
    readonly get_query_results_ptr: () => number;
    readonly get_render_buffer_len: () => number;
    readonly get_render_buffer_ptr: () => number;
    readonly get_render_stride: () => number;
    readonly has_enemy_finished: (a: number) => number;
    readonly rebuild_spatial_grid: () => void;
    readonly remove_enemy: (a: number) => number;
    readonly set_path: (a: number, b: number, c: number, d: number) => void;
    readonly init_world: (a: number, b: number) => void;
    readonly spawn_enemy: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => void;
    readonly query_radius: (a: number, b: number, c: number) => number;
    readonly clear_enemies: () => void;
    readonly clear_paths: () => void;
    readonly step_simulation: (a: number, b: number) => void;
    readonly find_best_target_in_range: (a: number, b: number, c: number, d: number) => number;
    readonly update_enemy_status: (a: number, b: number, c: number, d: number) => void;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
