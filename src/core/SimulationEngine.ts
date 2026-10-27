/**
 * Stick Vanguard - SimulationEngine
 * 100% delegated to Rust WebAssembly Core (`wasm-sim/src/systems.rs`).
 * Fallback TypeScript simulation loop removed.
 */
import { GameState } from './GameState.js';
import { NavigationSystem } from '../systems/NavigationSystem.js';
import { WaveSystem } from '../systems/WaveSystem.js';
import { SpatialIndex } from './SpatialIndex.js';
import { WasmBridge } from './WasmBridge.js';

export class SimulationEngine {
  public static readonly FIXED_DT = 1 / 60; // 60Hz fixed simulation step
  private static readonly MAX_SUB_STEPS = 4;

  public spatialIndex: SpatialIndex;
  public wasmBridge: WasmBridge;

  private accumulator = 0;
  private interpolationAlpha = 1.0;
  private totalAnimTime = 0;

  constructor(
    public state: GameState,
    public navSystem: NavigationSystem,
    public waveSystem: WaveSystem
  ) {
    this.spatialIndex = new SpatialIndex();
    this.wasmBridge = WasmBridge.ensureSingletonReady();
    this.wasmBridge.syncPaths(this.navSystem);
  }

  public onMapChanged(): void {
    this.wasmBridge.syncPaths(this.navSystem);
  }

  public getInterpolationAlpha(): number {
    return this.interpolationAlpha;
  }

  public getTotalAnimTime(): number {
    return this.totalAnimTime;
  }

  public update(rawDt: number): void {
    const effectiveDt = Math.min(rawDt, 0.1) * (this.state.isPaused ? 0 : this.state.gameSpeed);
    this.totalAnimTime += effectiveDt;

    if (this.state.isPaused || this.state.isGameOver || this.state.isVictory) {
      return;
    }

    this.accumulator += effectiveDt;

    let subSteps = 0;
    while (this.accumulator >= SimulationEngine.FIXED_DT && subSteps < SimulationEngine.MAX_SUB_STEPS) {
      this.tick(SimulationEngine.FIXED_DT);
      this.accumulator -= SimulationEngine.FIXED_DT;
      subSteps++;
    }

    // Prevent spiral of death if frame took too long
    if (this.accumulator > SimulationEngine.FIXED_DT * 2) {
      this.accumulator = 0;
    }

    this.interpolationAlpha = Math.max(0, Math.min(1, this.accumulator / SimulationEngine.FIXED_DT));
  }

  /**
   * Run one discrete simulation step of fixedDt in Rust WASM
   */
  public tick(dt: number): void {
    const bridge = WasmBridge.ensureSingletonReady();
    if (bridge.isAvailable()) {
      bridge.getOps().engine_tick(dt);
    }
  }
}
