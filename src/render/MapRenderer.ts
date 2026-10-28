/**
 * Stick Vanguard - MapRenderer Facade
 * 100% of battlefield map, roads, rivers, air corridors, spawners, bases,
 * and placement preview feedback are rendered in WebGL2 by Rust Engine (`wasm-sim/src/webgl/`).
 */
import { MapConfig } from '../config/map.config.js';
import { GameState } from '../core/GameState.js';

export class MapRenderer {
  public static clearCache(): void {
    // WebGL2 renderer in Rust manages GPU buffers directly
  }

  public static renderBackground(
    _ctx: CanvasRenderingContext2D,
    _mapConfig: MapConfig,
    _animTime: number = 0
  ): void {
    // WebGL2 Rust WebGl2Renderer handles background rendering
  }

  public static renderPlacementFeedback(
    _ctx: CanvasRenderingContext2D,
    _state: GameState,
    _animTime: number = 0
  ): void {
    // WebGL2 Rust WebGl2Renderer renders range preview and footprint rings directly on GPU
  }

  public static renderSlots(
    _ctx: CanvasRenderingContext2D,
    _state: GameState
  ): void {
    // WebGL2 Rust WebGl2Renderer handles slots
  }
}
