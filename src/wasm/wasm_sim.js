/* @ts-self-types="./wasm_sim.d.ts" */

export function clear_enemies() {
    wasm.clear_enemies();
}

export function clear_paths() {
    wasm.clear_paths();
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
 * @param {number} width
 * @param {number} height
 */
export function init_world(width, height) {
    wasm.init_world(width, height);
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
 */
export function spawn_enemy(id, speed, path_distance, nav_mode, lane_index, size, altitude, hp_ratio, state) {
    wasm.spawn_enemy(id, speed, path_distance, nav_mode, lane_index, size, altitude, hp_ratio, state);
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
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
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

let cachedFloat32ArrayMemory0 = null;
function getFloat32ArrayMemory0() {
    if (cachedFloat32ArrayMemory0 === null || cachedFloat32ArrayMemory0.byteLength === 0) {
        cachedFloat32ArrayMemory0 = new Float32Array(wasm.memory.buffer);
    }
    return cachedFloat32ArrayMemory0;
}

function passArrayF32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getFloat32ArrayMemory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasmInstance, wasm;
function __wbg_finalize_init(instance, module) {
    wasmInstance = instance;
    wasm = instance.exports;
    wasmModule = module;
    cachedFloat32ArrayMemory0 = null;
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
