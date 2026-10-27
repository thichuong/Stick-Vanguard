/* @ts-self-types="./wasm_sim.d.ts" */

export function audio_clear_recorded_events() {
    wasm.audio_clear_recorded_events();
}

/**
 * @returns {string}
 */
export function audio_get_recorded_events_json() {
    let deferred1_0;
    let deferred1_1;
    try {
        const ret = wasm.audio_get_recorded_events_json();
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
}

export function audio_init() {
    wasm.audio_init();
}

/**
 * @param {boolean} is_boss
 */
export function audio_play_base_damaged(is_boss) {
    wasm.audio_play_base_damaged(is_boss);
}

export function audio_play_build() {
    wasm.audio_play_build();
}

/**
 * @param {string} tier
 */
export function audio_play_enemy_death(tier) {
    const ptr0 = passStringToWasm0(tier, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.audio_play_enemy_death(ptr0, len0);
}

/**
 * @param {string} skill
 */
export function audio_play_enemy_skill(skill) {
    const ptr0 = passStringToWasm0(skill, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.audio_play_enemy_skill(ptr0, len0);
}

export function audio_play_error() {
    wasm.audio_play_error();
}

/**
 * @param {string} scale
 */
export function audio_play_explosion(scale) {
    const ptr0 = passStringToWasm0(scale, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.audio_play_explosion(ptr0, len0);
}

export function audio_play_game_over() {
    wasm.audio_play_game_over();
}

/**
 * @param {boolean} is_immune
 * @param {boolean} is_reaction
 * @param {boolean} is_melee
 */
export function audio_play_hit(is_immune, is_reaction, is_melee) {
    wasm.audio_play_hit(is_immune, is_reaction, is_melee);
}

export function audio_play_imbue() {
    wasm.audio_play_imbue();
}

export function audio_play_rally() {
    wasm.audio_play_rally();
}

export function audio_play_sell() {
    wasm.audio_play_sell();
}

/**
 * @param {string} shoot_type
 */
export function audio_play_shoot(shoot_type) {
    const ptr0 = passStringToWasm0(shoot_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.audio_play_shoot(ptr0, len0);
}

export function audio_play_soldier_death() {
    wasm.audio_play_soldier_death();
}

/**
 * @param {string} severity
 */
export function audio_play_tower_damaged(severity) {
    const ptr0 = passStringToWasm0(severity, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.audio_play_tower_damaged(ptr0, len0);
}

/**
 * @param {string} trap_type
 */
export function audio_play_trap_trigger(trap_type) {
    const ptr0 = passStringToWasm0(trap_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.audio_play_trap_trigger(ptr0, len0);
}

export function audio_play_ui_click() {
    wasm.audio_play_ui_click();
}

export function audio_play_upgrade() {
    wasm.audio_play_upgrade();
}

export function audio_play_victory() {
    wasm.audio_play_victory();
}

export function audio_play_wave_complete() {
    wasm.audio_play_wave_complete();
}

export function audio_play_wave_start() {
    wasm.audio_play_wave_start();
}

/**
 * @param {boolean} enabled
 */
export function audio_set_enabled(enabled) {
    wasm.audio_set_enabled(enabled);
}

/**
 * @param {number} volume
 */
export function audio_set_volume(volume) {
    wasm.audio_set_volume(volume);
}

export function clear_enemies() {
    wasm.clear_enemies();
}

export function clear_paths() {
    wasm.clear_paths();
}

/**
 * @param {string} enemies_json
 * @param {number} x
 * @param {number} y
 * @param {number} radius
 * @param {boolean} can_block_air
 * @returns {string}
 */
export function combat_find_unengaged_enemy_near(enemies_json, x, y, radius, can_block_air) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(enemies_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.combat_find_unengaged_enemy_near(ptr0, len0, x, y, radius, can_block_air);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @param {string} slot_id
 * @param {string} tower_type_str
 * @returns {string}
 */
export function engine_build_tower(slot_id, tower_type_str) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(slot_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(tower_type_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.engine_build_tower(ptr0, len0, ptr1, len1);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * @param {number} x
 * @param {number} y
 * @param {string} tower_type_str
 * @returns {string}
 */
export function engine_build_tower_at(x, y, tower_type_str) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(tower_type_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.engine_build_tower_at(x, y, ptr0, len0);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @returns {string}
 */
export function engine_call_wave_early() {
    let deferred1_0;
    let deferred1_1;
    try {
        const ret = wasm.engine_call_wave_early();
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
}

/**
 * @param {string} tower_id
 * @returns {string}
 */
export function engine_downgrade_or_destroy_tower(tower_id) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(tower_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.engine_downgrade_or_destroy_tower(ptr0, len0);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @returns {number}
 */
export function engine_get_interpolation_alpha() {
    const ret = wasm.engine_get_interpolation_alpha();
    return ret;
}

/**
 * @returns {string}
 */
export function engine_get_state_json() {
    let deferred1_0;
    let deferred1_1;
    try {
        const ret = wasm.engine_get_state_json();
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
}

/**
 * @param {string} tower_id
 * @returns {string}
 */
export function engine_get_tower_info(tower_id) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(tower_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.engine_get_tower_info(ptr0, len0);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @returns {string}
 */
export function engine_get_wave_status_json() {
    let deferred1_0;
    let deferred1_1;
    try {
        const ret = wasm.engine_get_wave_status_json();
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
}

/**
 * @param {string} soldier_id
 * @returns {string}
 */
export function engine_handle_soldier_death(soldier_id) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(soldier_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.engine_handle_soldier_death(ptr0, len0);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @returns {string}
 */
export function engine_reset() {
    let deferred1_0;
    let deferred1_1;
    try {
        const ret = wasm.engine_reset();
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
}

/**
 * @param {string} tower_id
 * @returns {string}
 */
export function engine_sell_tower(tower_id) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(tower_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.engine_sell_tower(ptr0, len0);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @param {string} tower_id
 * @param {string} mode_str
 * @returns {string}
 */
export function engine_set_barracks_mode(tower_id, mode_str) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(tower_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(mode_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.engine_set_barracks_mode(ptr0, len0, ptr1, len1);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * @param {number} custom_waves
 * @param {number} gold_mult
 * @param {number} dmg_mult
 * @param {number} speed
 * @param {boolean} paused
 */
export function engine_set_game_settings(custom_waves, gold_mult, dmg_mult, speed, paused) {
    wasm.engine_set_game_settings(custom_waves, gold_mult, dmg_mult, speed, paused);
}

/**
 * @param {string} map_id
 * @returns {string}
 */
export function engine_set_map(map_id) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(map_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.engine_set_map(ptr0, len0);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @param {string} tower_id
 * @param {number} x
 * @param {number} y
 * @returns {string}
 */
export function engine_set_rally_point(tower_id, x, y) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(tower_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.engine_set_rally_point(ptr0, len0, x, y);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @param {string | null | undefined} tower_id
 * @param {boolean} is_setting_rally
 */
export function engine_set_selected_tower(tower_id, is_setting_rally) {
    var ptr0 = isLikeNone(tower_id) ? 0 : passStringToWasm0(tower_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    wasm.engine_set_selected_tower(ptr0, len0, is_setting_rally);
}

/**
 * @param {string} json
 * @returns {boolean}
 */
export function engine_set_state_json(json) {
    const ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.engine_set_state_json(ptr0, len0);
    return ret !== 0;
}

/**
 * @param {string} tower_id
 * @param {string} element_str
 * @param {number} slot_idx
 * @returns {string}
 */
export function engine_set_tower_element(tower_id, element_str, slot_idx) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(tower_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(element_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.engine_set_tower_element(ptr0, len0, ptr1, len1, slot_idx);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * @param {number | null} [wave_num]
 * @returns {string}
 */
export function engine_start_wave(wave_num) {
    let deferred1_0;
    let deferred1_1;
    try {
        const ret = wasm.engine_start_wave(isLikeNone(wave_num) ? Number.MAX_SAFE_INTEGER : (wave_num) >>> 0);
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
}

/**
 * @param {number} raw_dt
 * @returns {string}
 */
export function engine_step_and_render(raw_dt) {
    let deferred1_0;
    let deferred1_1;
    try {
        const ret = wasm.engine_step_and_render(raw_dt);
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
}

/**
 * @param {string} towers_json
 * @param {string} soldiers_json
 * @param {number | null} [gold]
 * @param {number | null} [lives]
 * @returns {boolean}
 */
export function engine_sync_towers_and_soldiers(towers_json, soldiers_json, gold, lives) {
    const ptr0 = passStringToWasm0(towers_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(soldiers_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.engine_sync_towers_and_soldiers(ptr0, len0, ptr1, len1, isLikeNone(gold) ? Number.MAX_SAFE_INTEGER : (gold) >> 0, isLikeNone(lives) ? Number.MAX_SAFE_INTEGER : (lives) >> 0);
    return ret !== 0;
}

/**
 * @param {number} dt
 * @returns {string}
 */
export function engine_tick(dt) {
    let deferred1_0;
    let deferred1_1;
    try {
        const ret = wasm.engine_tick(dt);
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
}

/**
 * @param {number} raw_dt
 * @returns {string}
 */
export function engine_update(raw_dt) {
    let deferred1_0;
    let deferred1_1;
    try {
        const ret = wasm.engine_update(raw_dt);
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
}

/**
 * @param {string} tower_id
 * @param {string | null} [branch_str]
 * @returns {string}
 */
export function engine_upgrade_tower(tower_id, branch_str) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(tower_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(branch_str) ? 0 : passStringToWasm0(branch_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        const ret = wasm.engine_upgrade_tower(ptr0, len0, ptr1, len1);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * @param {number} x
 * @param {number} y
 * @param {string} tower_type_str
 * @returns {string}
 */
export function engine_validate_placement(x, y, tower_type_str) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(tower_type_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.engine_validate_placement(x, y, ptr0, len0);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} range
 * @param {number} mode
 * @returns {number}
 */
export function find_best_target_in_range(x, y, range, mode) {
    const ret = wasm.find_best_target_in_range(x, y, range, mode);
    return ret >>> 0;
}

/**
 * @returns {number}
 */
export function get_enemy_count() {
    const ret = wasm.get_enemy_count();
    return ret >>> 0;
}

/**
 * @returns {number}
 */
export function get_query_results_len() {
    const ret = wasm.get_query_results_len();
    return ret >>> 0;
}

/**
 * @returns {number}
 */
export function get_query_results_ptr() {
    const ret = wasm.get_query_results_ptr();
    return ret >>> 0;
}

/**
 * @returns {number}
 */
export function get_render_buffer_len() {
    const ret = wasm.get_render_buffer_len();
    return ret >>> 0;
}

/**
 * @returns {number}
 */
export function get_render_buffer_ptr() {
    const ret = wasm.get_render_buffer_ptr();
    return ret >>> 0;
}

/**
 * @returns {number}
 */
export function get_render_stride() {
    const ret = wasm.get_render_stride();
    return ret >>> 0;
}

/**
 * @param {number} id
 * @returns {boolean}
 */
export function has_enemy_finished(id) {
    const ret = wasm.has_enemy_finished(id);
    return ret !== 0;
}

/**
 * @param {any} gl_ctx
 * @returns {boolean}
 */
export function init_codex_webgl_renderer(gl_ctx) {
    const ret = wasm.init_codex_webgl_renderer(gl_ctx);
    return ret !== 0;
}

/**
 * @param {any} gl_ctx
 * @returns {boolean}
 */
export function init_webgl_renderer(gl_ctx) {
    const ret = wasm.init_webgl_renderer(gl_ctx);
    return ret !== 0;
}

/**
 * @param {number} width
 * @param {number} height
 */
export function init_world(width, height) {
    wasm.init_world(width, height);
}

/**
 * @param {string} json
 * @returns {boolean}
 */
export function load_game_config(json) {
    const ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.load_game_config(ptr0, len0);
    return ret !== 0;
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} radius
 * @returns {number}
 */
export function query_radius(x, y, radius) {
    const ret = wasm.query_radius(x, y, radius);
    return ret >>> 0;
}

export function rebuild_spatial_grid() {
    wasm.rebuild_spatial_grid();
}

/**
 * @param {number} id
 * @returns {boolean}
 */
export function remove_enemy(id) {
    const ret = wasm.remove_enemy(id);
    return ret !== 0;
}

/**
 * @param {string} enemy_type_id
 * @param {number} anim_time
 * @param {number} width
 * @param {number} height
 * @returns {boolean}
 */
export function render_codex_enemy_webgl(enemy_type_id, anim_time, width, height) {
    const ptr0 = passStringToWasm0(enemy_type_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.render_codex_enemy_webgl(ptr0, len0, anim_time, width, height);
    return ret !== 0;
}

/**
 * @param {string} soldier_type
 * @param {string} stance
 * @param {number} anim_time
 * @param {number} width
 * @param {number} height
 * @returns {boolean}
 */
export function render_codex_soldier_webgl(soldier_type, stance, anim_time, width, height) {
    const ptr0 = passStringToWasm0(soldier_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(stance, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.render_codex_soldier_webgl(ptr0, len0, ptr1, len1, anim_time, width, height);
    return ret !== 0;
}

/**
 * @param {string} state_json
 * @param {number} anim_time
 * @param {number} alpha
 * @returns {number}
 */
export function render_custom_state_webgl(state_json, anim_time, alpha) {
    const ptr0 = passStringToWasm0(state_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.render_custom_state_webgl(ptr0, len0, anim_time, alpha);
    return ret >>> 0;
}

export function render_webgl_frame() {
    wasm.render_webgl_frame();
}

/**
 * @param {string} enemy_json
 * @param {string} payload_json
 * @returns {string}
 */
export function rules_apply_all_payload_effects(enemy_json, payload_json) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(enemy_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(payload_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.rules_apply_all_payload_effects(ptr0, len0, ptr1, len1);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * @param {string} enemy_json
 * @param {number} ratio
 * @param {number} duration
 * @returns {string}
 */
export function rules_apply_damage_reduction(enemy_json, ratio, duration) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(enemy_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.rules_apply_damage_reduction(ptr0, len0, ratio, duration);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @param {string} enemy_json
 * @param {string} calc_json
 * @param {string} elem_str
 * @param {string | null} [sec_elem_str]
 * @returns {string}
 */
export function rules_apply_damage_to_enemy(enemy_json, calc_json, elem_str, sec_elem_str) {
    let deferred5_0;
    let deferred5_1;
    try {
        const ptr0 = passStringToWasm0(enemy_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(calc_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(elem_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        var ptr3 = isLikeNone(sec_elem_str) ? 0 : passStringToWasm0(sec_elem_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len3 = WASM_VECTOR_LEN;
        const ret = wasm.rules_apply_damage_to_enemy(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
        deferred5_0 = ret[0];
        deferred5_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred5_0, deferred5_1, 1);
    }
}

/**
 * @param {string} enemy_json
 * @param {string} element_str
 * @param {number} base_damage
 * @returns {string}
 */
export function rules_apply_elemental_hit_effects(enemy_json, element_str, base_damage) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(enemy_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(element_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.rules_apply_elemental_hit_effects(ptr0, len0, ptr1, len1, base_damage);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * @param {string} enemy_json
 * @param {number} base_distance
 * @returns {string}
 */
export function rules_apply_knockback(enemy_json, base_distance) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(enemy_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.rules_apply_knockback(ptr0, len0, base_distance);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @param {string} enemy_json
 * @param {string} element_str
 * @param {number} base_damage
 * @returns {string}
 */
export function rules_apply_reaction_bonus_effects(enemy_json, element_str, base_damage) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(enemy_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(element_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.rules_apply_reaction_bonus_effects(ptr0, len0, ptr1, len1, base_damage);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * @param {string} enemy_json
 * @param {string} payload_json
 * @returns {string}
 */
export function rules_apply_status_effect(enemy_json, payload_json) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(enemy_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(payload_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.rules_apply_status_effect(ptr0, len0, ptr1, len1);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * @param {string} payload_json
 * @param {string} enemy_json
 * @param {number} global_damage_mult
 * @returns {string}
 */
export function rules_calculate_damage(payload_json, enemy_json, global_damage_mult) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(payload_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(enemy_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.rules_calculate_damage(ptr0, len0, ptr1, len1, global_damage_mult);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * @param {string} attacker_str
 * @param {string} profile_json
 * @returns {number}
 */
export function rules_calculate_elemental_matchup(attacker_str, profile_json) {
    const ptr0 = passStringToWasm0(attacker_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(profile_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.rules_calculate_elemental_matchup(ptr0, len0, ptr1, len1);
    return ret;
}

/**
 * @param {string} enemy_json
 * @param {string} soldier_json
 * @returns {string}
 */
export function rules_calculate_enemy_damage_to_soldier(enemy_json, soldier_json) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(enemy_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(soldier_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.rules_calculate_enemy_damage_to_soldier(ptr0, len0, ptr1, len1);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * @param {string} attacker_str
 * @param {string} soldier_json
 * @returns {string}
 */
export function rules_calculate_soldier_defensive_multiplier(attacker_str, soldier_json) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(attacker_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(soldier_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.rules_calculate_soldier_defensive_multiplier(ptr0, len0, ptr1, len1);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * @param {string} filter_json
 * @param {string} enemy_json
 * @returns {boolean}
 */
export function rules_can_target(filter_json, enemy_json) {
    const ptr0 = passStringToWasm0(filter_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(enemy_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.rules_can_target(ptr0, len0, ptr1, len1);
    return ret !== 0;
}

/**
 * @param {string} enemy_json
 * @returns {string}
 */
export function rules_get_crowd_control_modifiers(enemy_json) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(enemy_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.rules_get_crowd_control_modifiers(ptr0, len0);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @param {string} enemy_json
 * @returns {number}
 */
export function rules_get_effective_damage_reduction_ratio(enemy_json) {
    const ptr0 = passStringToWasm0(enemy_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.rules_get_effective_damage_reduction_ratio(ptr0, len0);
    return ret;
}

/**
 * @param {string} enemy_json
 * @returns {number}
 */
export function rules_get_enemy_attack_speed_multiplier(enemy_json) {
    const ptr0 = passStringToWasm0(enemy_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.rules_get_enemy_attack_speed_multiplier(ptr0, len0);
    return ret;
}

/**
 * @param {string} soldier_json
 * @returns {string}
 */
export function rules_get_soldier_elements(soldier_json) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(soldier_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.rules_get_soldier_elements(ptr0, len0);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @param {string} enemy_json
 * @returns {boolean}
 */
export function rules_is_enemy_stunned_or_frozen(enemy_json) {
    const ptr0 = passStringToWasm0(enemy_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.rules_is_enemy_stunned_or_frozen(ptr0, len0);
    return ret !== 0;
}

/**
 * @param {string} enemy_json
 * @returns {string}
 */
export function rules_sync_effective_damage_reduction(enemy_json) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(enemy_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.rules_sync_effective_damage_reduction(ptr0, len0);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @param {string} enemy_json
 * @param {number} dt
 * @param {number} global_dmg_mult
 * @returns {string}
 */
export function rules_update_status_effects(enemy_json, dt, global_dmg_mult) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(enemy_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.rules_update_status_effects(ptr0, len0, dt, global_dmg_mult);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @param {number} mode
 * @param {number} lane_index
 * @param {Float32Array} waypoints
 */
export function set_path(mode, lane_index, waypoints) {
    const ptr0 = passArrayF32ToWasm0(waypoints, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.set_path(mode, lane_index, ptr0, len0);
}

/**
 * @param {number} id
 * @param {number} speed
 * @param {number} path_distance
 * @param {number} nav_mode
 * @param {number} lane_index
 * @param {number} size
 * @param {number} altitude
 * @param {number} hp_ratio
 * @param {number} state
 * @param {number} init_x
 * @param {number} init_y
 * @param {number} facing
 */
export function spawn_enemy(id, speed, path_distance, nav_mode, lane_index, size, altitude, hp_ratio, state, init_x, init_y, facing) {
    wasm.spawn_enemy(id, speed, path_distance, nav_mode, lane_index, size, altitude, hp_ratio, state, init_x, init_y, facing);
}

/**
 * @param {number} dt
 * @param {number} anim_time
 */
export function step_simulation(dt, anim_time) {
    wasm.step_simulation(dt, anim_time);
}

/**
 * @param {number} id
 * @param {number} speed
 * @param {number} hp_ratio
 * @param {number} state
 */
export function update_enemy_status(id, speed, hp_ratio, state) {
    wasm.update_enemy_status(id, speed, hp_ratio, state);
}

/**
 * @param {any} image
 * @param {string} manifest_json
 * @returns {boolean}
 */
export function upload_codex_webgl_atlas(image, manifest_json) {
    const ptr0 = passStringToWasm0(manifest_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.upload_codex_webgl_atlas(image, ptr0, len0);
    return ret !== 0;
}

/**
 * @param {any} image
 * @param {string} manifest_json
 * @returns {boolean}
 */
export function upload_webgl_atlas(image, manifest_json) {
    const ptr0 = passStringToWasm0(manifest_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.upload_webgl_atlas(image, ptr0, len0);
    return ret !== 0;
}

/**
 * @param {string} map_json
 * @param {string} type_id
 * @param {number} wave_index
 * @param {number | null} [forced_lane_index]
 * @returns {string}
 */
export function wave_create_enemy(map_json, type_id, wave_index, forced_lane_index) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(map_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(type_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wave_create_enemy(ptr0, len0, ptr1, len1, wave_index, isLikeNone(forced_lane_index) ? Number.MAX_SAFE_INTEGER : (forced_lane_index) >>> 0);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * @param {string} map_json
 * @param {number} wave_index
 * @returns {string}
 */
export function wave_generate_config(map_json, wave_index) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(map_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wave_generate_config(ptr0, len0, wave_index);
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg___wbindgen_throw_344f42d3211c4765: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg_activeTexture_b4985d577d82ff4b: function(arg0, arg1) {
            arg0.activeTexture(arg1 >>> 0);
        },
        __wbg_attachShader_4d9334e54ed42d08: function(arg0, arg1, arg2) {
            arg0.attachShader(arg1, arg2);
        },
        __wbg_bindBuffer_2d6a99cc4e47e443: function(arg0, arg1, arg2) {
            arg0.bindBuffer(arg1 >>> 0, arg2);
        },
        __wbg_bindTexture_09df41c94a4617e7: function(arg0, arg1, arg2) {
            arg0.bindTexture(arg1 >>> 0, arg2);
        },
        __wbg_bindVertexArray_2b78443b260ca58b: function(arg0, arg1) {
            arg0.bindVertexArray(arg1);
        },
        __wbg_blendFunc_11dc14f92ba10687: function(arg0, arg1, arg2) {
            arg0.blendFunc(arg1 >>> 0, arg2 >>> 0);
        },
        __wbg_bufferData_c1c13ef795e9c24c: function(arg0, arg1, arg2, arg3, arg4) {
            arg0.bufferData(arg1 >>> 0, getArrayF32FromWasm0(arg2, arg3), arg4 >>> 0);
        },
        __wbg_clearColor_b5eb97f09aff8fbe: function(arg0, arg1, arg2, arg3, arg4) {
            arg0.clearColor(arg1, arg2, arg3, arg4);
        },
        __wbg_clear_25c0ca6535ecb2b2: function(arg0, arg1) {
            arg0.clear(arg1 >>> 0);
        },
        __wbg_compileShader_fe403abb36fab38f: function(arg0, arg1) {
            arg0.compileShader(arg1);
        },
        __wbg_connect_2f64aa24c0541102: function(arg0, arg1) {
            arg0.connect(arg1);
        },
        __wbg_connect_3c03402ae1b57bed: function(arg0, arg1) {
            arg0.connect(arg1);
        },
        __wbg_connect_a05ab7884a065f7c: function(arg0, arg1) {
            arg0.connect(arg1);
        },
        __wbg_connect_cd1731f0b8de001f: function(arg0, arg1) {
            arg0.connect(arg1);
        },
        __wbg_copyToChannel_2efa7f289efb43a0: function(arg0, arg1, arg2, arg3) {
            arg0.copyToChannel(getArrayF32FromWasm0(arg1, arg2), arg3);
        },
        __wbg_createBiquadFilter_98281eaf1c26d65b: function(arg0) {
            const ret = arg0.createBiquadFilter();
            return ret;
        },
        __wbg_createBufferSource_16174653ec096730: function(arg0) {
            const ret = arg0.createBufferSource();
            return ret;
        },
        __wbg_createBuffer_992f40118bca9c04: function(arg0) {
            const ret = arg0.createBuffer();
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_createBuffer_e49e48239464cca6: function(arg0, arg1, arg2, arg3) {
            const ret = arg0.createBuffer(arg1 >>> 0, arg2 >>> 0, arg3);
            return ret;
        },
        __wbg_createGain_64eca1d01092532c: function(arg0) {
            const ret = arg0.createGain();
            return ret;
        },
        __wbg_createOscillator_10063cab4b1509ed: function(arg0) {
            const ret = arg0.createOscillator();
            return ret;
        },
        __wbg_createProgram_cdf58c2e6ec89fcc: function(arg0) {
            const ret = arg0.createProgram();
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_createShader_c9efa4a3dad1a1af: function(arg0, arg1) {
            const ret = arg0.createShader(arg1 >>> 0);
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_createTexture_2f01ae1dd79f7072: function(arg0) {
            const ret = arg0.createTexture();
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_createVertexArray_0c48889a5e31b01c: function(arg0) {
            const ret = arg0.createVertexArray();
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_currentTime_e3bdb1f046f06aad: function(arg0) {
            const ret = arg0.currentTime;
            return ret;
        },
        __wbg_destination_ef65263881f03380: function(arg0) {
            const ret = arg0.destination;
            return ret;
        },
        __wbg_drawArrays_bf7ab4697366347f: function(arg0, arg1, arg2, arg3) {
            arg0.drawArrays(arg1 >>> 0, arg2, arg3);
        },
        __wbg_enableVertexAttribArray_9009c7e37857a8ac: function(arg0, arg1) {
            arg0.enableVertexAttribArray(arg1 >>> 0);
        },
        __wbg_enable_704b7857d8550c6e: function(arg0, arg1) {
            arg0.enable(arg1 >>> 0);
        },
        __wbg_exponentialRampToValueAtTime_4d7d957613305925: function(arg0, arg1, arg2) {
            arg0.exponentialRampToValueAtTime(arg1, arg2);
        },
        __wbg_frequency_338e174bdfebc35a: function(arg0) {
            const ret = arg0.frequency;
            return ret;
        },
        __wbg_frequency_b830bb02a81ebbc3: function(arg0) {
            const ret = arg0.frequency;
            return ret;
        },
        __wbg_gain_487d2c4249831942: function(arg0) {
            const ret = arg0.gain;
            return ret;
        },
        __wbg_getUniformLocation_3b4e967ed1016175: function(arg0, arg1, arg2, arg3) {
            const ret = arg0.getUniformLocation(arg1, getStringFromWasm0(arg2, arg3));
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_linkProgram_1218c66960b6850f: function(arg0, arg1) {
            arg0.linkProgram(arg1);
        },
        __wbg_new_ea74bd60829bac85: function() { return handleError(function () {
            const ret = new AudioContext();
            return ret;
        }, arguments); },
        __wbg_now_86c0d4ba3fa605b8: function() {
            const ret = Date.now();
            return ret;
        },
        __wbg_resume_7d3460f405115fa5: function() { return handleError(function (arg0) {
            const ret = arg0.resume();
            return ret;
        }, arguments); },
        __wbg_sampleRate_f3428d0e3f08a84e: function(arg0) {
            const ret = arg0.sampleRate;
            return ret;
        },
        __wbg_setValueAtTime_99b27e409a80568c: function(arg0, arg1, arg2) {
            arg0.setValueAtTime(arg1, arg2);
        },
        __wbg_set_buffer_5424c2a8a412130d: function(arg0, arg1) {
            arg0.buffer = arg1;
        },
        __wbg_set_type_150f42b8fcad3dc7: function(arg0, arg1, arg2) {
            arg0.type = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_type_99fec0582d96b7b7: function(arg0, arg1, arg2) {
            arg0.type = getStringFromWasm0(arg1, arg2);
        },
        __wbg_shaderSource_662c98933c408e53: function(arg0, arg1, arg2, arg3) {
            arg0.shaderSource(arg1, getStringFromWasm0(arg2, arg3));
        },
        __wbg_start_e11eccfe5bfc2d31: function(arg0, arg1) {
            arg0.start(arg1);
        },
        __wbg_start_e7676e9a97336f97: function(arg0, arg1) {
            arg0.start(arg1);
        },
        __wbg_state_85a20973562bea52: function(arg0, arg1) {
            const ret = arg1.state;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_stop_479a4f0a6f9f6154: function(arg0, arg1) {
            arg0.stop(arg1);
        },
        __wbg_stop_bba62951ba30eb23: function(arg0, arg1) {
            arg0.stop(arg1);
        },
        __wbg_texImage2D_32891eb426322324: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
            arg0.texImage2D(arg1 >>> 0, arg2, arg3, arg4 >>> 0, arg5 >>> 0, arg6);
        }, arguments); },
        __wbg_texParameteri_f12e8af97047541f: function(arg0, arg1, arg2, arg3) {
            arg0.texParameteri(arg1 >>> 0, arg2 >>> 0, arg3);
        },
        __wbg_uniform1i_40a5ab74523d7461: function(arg0, arg1, arg2) {
            arg0.uniform1i(arg1, arg2);
        },
        __wbg_uniform2f_1792bfd97500e58d: function(arg0, arg1, arg2, arg3) {
            arg0.uniform2f(arg1, arg2, arg3);
        },
        __wbg_useProgram_c00165f9b8b1da34: function(arg0, arg1) {
            arg0.useProgram(arg1);
        },
        __wbg_vertexAttribPointer_fff397919bde3322: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
            arg0.vertexAttribPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4 !== 0, arg5, arg6);
        },
        __wbg_viewport_6e545b743de61572: function(arg0, arg1, arg2, arg3, arg4) {
            arg0.viewport(arg1, arg2, arg3, arg4);
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./wasm_sim_bg.js": import0,
    };
}

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

function getArrayF32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

let cachedFloat32ArrayMemory0 = null;
function getFloat32ArrayMemory0() {
    if (cachedFloat32ArrayMemory0 === null || cachedFloat32ArrayMemory0.byteLength === 0) {
        cachedFloat32ArrayMemory0 = new Float32Array(wasm.memory.buffer);
    }
    return cachedFloat32ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function passArrayF32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getFloat32ArrayMemory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasmInstance, wasm;
function __wbg_finalize_init(instance, module) {
    wasmInstance = instance;
    wasm = instance.exports;
    wasmModule = module;
    cachedDataViewMemory0 = null;
    cachedFloat32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('wasm_sim_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
