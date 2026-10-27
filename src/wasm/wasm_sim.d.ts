/* tslint:disable */
/* eslint-disable */

export function audio_clear_recorded_events(): void;

export function audio_get_recorded_events_json(): string;

export function audio_play_base_damaged(is_boss: boolean): void;

export function audio_play_build(): void;

export function audio_play_enemy_death(tier: string): void;

export function audio_play_enemy_skill(skill: string): void;

export function audio_play_error(): void;

export function audio_play_explosion(scale: string): void;

export function audio_play_game_over(): void;

export function audio_play_hit(is_immune: boolean, is_reaction: boolean, is_melee: boolean): void;

export function audio_play_imbue(): void;

export function audio_play_rally(): void;

export function audio_play_sell(): void;

export function audio_play_shoot(shoot_type: string): void;

export function audio_play_soldier_death(): void;

export function audio_play_tower_damaged(severity: string): void;

export function audio_play_trap_trigger(trap_type: string): void;

export function audio_play_ui_click(): void;

export function audio_play_upgrade(): void;

export function audio_play_victory(): void;

export function audio_play_wave_complete(): void;

export function audio_play_wave_start(): void;

export function audio_set_enabled(enabled: boolean): void;

export function audio_set_volume(volume: number): void;

export function clear_enemies(): void;

export function clear_paths(): void;

export function engine_build_tower(slot_id: string, tower_type_str: string): string;

export function engine_build_tower_at(x: number, y: number, tower_type_str: string): string;

export function engine_downgrade_or_destroy_tower(tower_id: string): string;

export function engine_get_interpolation_alpha(): number;

export function engine_get_state_json(): string;

export function engine_get_wave_status_json(): string;

export function engine_handle_soldier_death(soldier_id: string): string;

export function engine_reset(): string;

export function engine_sell_tower(tower_id: string): string;

export function engine_set_barracks_mode(tower_id: string, mode_str: string): string;

export function engine_set_map(map_id: string): string;

export function engine_set_rally_point(tower_id: string, x: number, y: number): string;

export function engine_set_state_json(json: string): boolean;

export function engine_set_tower_element(tower_id: string, element_str: string, slot_idx: number): string;

export function engine_start_wave(wave_num?: number | null): string;

export function engine_tick(dt: number): string;

export function engine_update(raw_dt: number): string;

export function engine_upgrade_tower(tower_id: string, branch_str?: string | null): string;

export function engine_validate_placement(x: number, y: number, tower_type_str: string): string;

export function find_best_target_in_range(x: number, y: number, range: number, mode: number): number;

export function get_enemy_count(): number;

export function get_query_results_len(): number;

export function get_query_results_ptr(): number;

export function get_render_buffer_len(): number;

export function get_render_buffer_ptr(): number;

export function get_render_stride(): number;

export function has_enemy_finished(id: number): boolean;

export function init_codex_webgl_renderer(gl_ctx: any): boolean;

export function init_webgl_renderer(gl_ctx: any): boolean;

export function init_world(width: number, height: number): void;

export function load_game_config(json: string): boolean;

export function query_radius(x: number, y: number, radius: number): number;

export function rebuild_spatial_grid(): void;

export function remove_enemy(id: number): boolean;

export function render_codex_enemy_webgl(enemy_type_id: string, anim_time: number, width: number, height: number): boolean;

export function render_codex_soldier_webgl(soldier_type: string, stance: string, anim_time: number, width: number, height: number): boolean;

export function render_custom_state_webgl(state_json: string, anim_time: number, alpha: number): number;

export function render_webgl_frame(): void;

export function rules_apply_all_payload_effects(enemy_json: string, payload_json: string): string;

export function rules_apply_damage_to_enemy(enemy_json: string, calc_json: string, elem_str: string, sec_elem_str?: string | null): string;

export function rules_apply_elemental_hit_effects(enemy_json: string, element_str: string, base_damage: number): string;

export function rules_apply_knockback(enemy_json: string, base_distance: number): string;

export function rules_apply_status_effect(enemy_json: string, payload_json: string): string;

export function rules_calculate_damage(payload_json: string, enemy_json: string, global_damage_mult: number): string;

export function rules_calculate_elemental_matchup(attacker_str: string, profile_json: string): number;

export function rules_calculate_enemy_damage_to_soldier(enemy_json: string, soldier_json: string): string;

export function rules_calculate_soldier_defensive_multiplier(attacker_str: string, soldier_json: string): string;

export function rules_can_target(filter_json: string, enemy_json: string): boolean;

export function rules_get_crowd_control_modifiers(enemy_json: string): string;

export function rules_update_status_effects(enemy_json: string, dt: number, global_dmg_mult: number): string;

export function set_path(mode: number, lane_index: number, waypoints: Float32Array): void;

export function spawn_enemy(id: number, speed: number, path_distance: number, nav_mode: number, lane_index: number, size: number, altitude: number, hp_ratio: number, state: number, init_x: number, init_y: number, facing: number): void;

export function step_simulation(dt: number, anim_time: number): void;

export function update_enemy_status(id: number, speed: number, hp_ratio: number, state: number): void;

export function upload_codex_webgl_atlas(image: any, manifest_json: string): boolean;

export function upload_webgl_atlas(image: any, manifest_json: string): boolean;

export function wave_create_enemy(map_json: string, type_id: string, wave_index: number, forced_lane_index?: number | null): string;

export function wave_generate_config(map_json: string, wave_index: number): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly audio_clear_recorded_events: () => void;
    readonly audio_get_recorded_events_json: () => [number, number];
    readonly audio_play_base_damaged: (a: number) => void;
    readonly audio_play_build: () => void;
    readonly audio_play_enemy_death: (a: number, b: number) => void;
    readonly audio_play_enemy_skill: (a: number, b: number) => void;
    readonly audio_play_error: () => void;
    readonly audio_play_explosion: (a: number, b: number) => void;
    readonly audio_play_hit: (a: number, b: number, c: number) => void;
    readonly audio_play_imbue: () => void;
    readonly audio_play_rally: () => void;
    readonly audio_play_sell: () => void;
    readonly audio_play_shoot: (a: number, b: number) => void;
    readonly audio_play_soldier_death: () => void;
    readonly audio_play_tower_damaged: (a: number, b: number) => void;
    readonly audio_play_trap_trigger: (a: number, b: number) => void;
    readonly audio_play_ui_click: () => void;
    readonly audio_play_wave_start: () => void;
    readonly audio_set_enabled: (a: number) => void;
    readonly engine_build_tower: (a: number, b: number, c: number, d: number) => [number, number];
    readonly engine_build_tower_at: (a: number, b: number, c: number, d: number) => [number, number];
    readonly engine_downgrade_or_destroy_tower: (a: number, b: number) => [number, number];
    readonly engine_get_state_json: () => [number, number];
    readonly engine_get_wave_status_json: () => [number, number];
    readonly engine_handle_soldier_death: (a: number, b: number) => [number, number];
    readonly engine_reset: () => [number, number];
    readonly engine_sell_tower: (a: number, b: number) => [number, number];
    readonly engine_set_barracks_mode: (a: number, b: number, c: number, d: number) => [number, number];
    readonly engine_set_map: (a: number, b: number) => [number, number];
    readonly engine_set_rally_point: (a: number, b: number, c: number, d: number) => [number, number];
    readonly engine_set_state_json: (a: number, b: number) => number;
    readonly engine_set_tower_element: (a: number, b: number, c: number, d: number, e: number) => [number, number];
    readonly engine_start_wave: (a: number) => [number, number];
    readonly engine_tick: (a: number) => [number, number];
    readonly engine_update: (a: number) => [number, number];
    readonly engine_upgrade_tower: (a: number, b: number, c: number, d: number) => [number, number];
    readonly engine_validate_placement: (a: number, b: number, c: number, d: number) => [number, number];
    readonly get_enemy_count: () => number;
    readonly get_query_results_len: () => number;
    readonly get_query_results_ptr: () => number;
    readonly get_render_buffer_len: () => number;
    readonly get_render_buffer_ptr: () => number;
    readonly get_render_stride: () => number;
    readonly has_enemy_finished: (a: number) => number;
    readonly init_codex_webgl_renderer: (a: any) => number;
    readonly init_webgl_renderer: (a: any) => number;
    readonly load_game_config: (a: number, b: number) => number;
    readonly rebuild_spatial_grid: () => void;
    readonly remove_enemy: (a: number) => number;
    readonly render_codex_enemy_webgl: (a: number, b: number, c: number, d: number, e: number) => number;
    readonly render_codex_soldier_webgl: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => number;
    readonly render_custom_state_webgl: (a: number, b: number, c: number, d: number) => number;
    readonly rules_apply_all_payload_effects: (a: number, b: number, c: number, d: number) => [number, number];
    readonly rules_apply_damage_to_enemy: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number];
    readonly rules_apply_elemental_hit_effects: (a: number, b: number, c: number, d: number, e: number) => [number, number];
    readonly rules_apply_knockback: (a: number, b: number, c: number) => [number, number];
    readonly rules_apply_status_effect: (a: number, b: number, c: number, d: number) => [number, number];
    readonly rules_calculate_damage: (a: number, b: number, c: number, d: number, e: number) => [number, number];
    readonly rules_calculate_elemental_matchup: (a: number, b: number, c: number, d: number) => number;
    readonly rules_calculate_enemy_damage_to_soldier: (a: number, b: number, c: number, d: number) => [number, number];
    readonly rules_calculate_soldier_defensive_multiplier: (a: number, b: number, c: number, d: number) => [number, number];
    readonly rules_can_target: (a: number, b: number, c: number, d: number) => number;
    readonly rules_get_crowd_control_modifiers: (a: number, b: number) => [number, number];
    readonly rules_update_status_effects: (a: number, b: number, c: number, d: number) => [number, number];
    readonly set_path: (a: number, b: number, c: number, d: number) => void;
    readonly upload_codex_webgl_atlas: (a: any, b: number, c: number) => number;
    readonly upload_webgl_atlas: (a: any, b: number, c: number) => number;
    readonly wave_create_enemy: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number];
    readonly wave_generate_config: (a: number, b: number, c: number) => [number, number];
    readonly init_world: (a: number, b: number) => void;
    readonly engine_get_interpolation_alpha: () => number;
    readonly audio_set_volume: (a: number) => void;
    readonly query_radius: (a: number, b: number, c: number) => number;
    readonly clear_enemies: () => void;
    readonly audio_play_game_over: () => void;
    readonly audio_play_upgrade: () => void;
    readonly audio_play_victory: () => void;
    readonly audio_play_wave_complete: () => void;
    readonly clear_paths: () => void;
    readonly step_simulation: (a: number, b: number) => void;
    readonly find_best_target_in_range: (a: number, b: number, c: number, d: number) => number;
    readonly update_enemy_status: (a: number, b: number, c: number, d: number) => void;
    readonly render_webgl_frame: () => void;
    readonly spawn_enemy: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
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
