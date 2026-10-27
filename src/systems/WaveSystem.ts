/**
 * Stick Vanguard - WaveSystem Facade
 * 100% simulation, timer, and spawning logic delegated to Rust WebAssembly Core (`wasm-sim/src/wave.rs`).
 * This facade provides wave configuration generation for UI panels (InspectorPanel, Codex)
 * and enemy creation delegates for test and UI fixtures.
 */
import { WaveConfig, MAP_CONFIG, MapConfig } from '../config/map.config.js';
import { EnemyEntity } from '../types/entities.types.js';
import { WasmBridge } from '../core/WasmBridge.js';

export class WaveSystem {
  public currentWaveIndex = 0; // 0-based
  public customTotalWaves: number = 15;
  public isWaveInProgress = false;
  public pendingRewards: number[] = [];
  private currentMap: MapConfig;

  constructor(mapConfig: MapConfig = MAP_CONFIG, totalWaves: number = 15) {
    this.currentMap = mapConfig;
    this.customTotalWaves = totalWaves;
  }

  public setMap(mapConfig: MapConfig): void {
    this.currentMap = mapConfig;
    this.currentWaveIndex = 0;
    this.isWaveInProgress = false;
    this.pendingRewards = [];
  }

  public setTotalWaves(waves: number): void {
    this.customTotalWaves = Math.max(1, Math.min(100, Math.round(waves)));
    if (this.currentWaveIndex >= this.customTotalWaves) {
      this.currentWaveIndex = Math.max(0, this.customTotalWaves - 1);
    }
  }

  public getTotalWaves(): number {
    return this.customTotalWaves;
  }

  public getWaveHpMultiplier(waveIndex: number): number {
    if (waveIndex < 10) return 1.0;
    return 1.0 + (waveIndex - 9) * 0.1;
  }

  public getCurrentWaveConfig(): WaveConfig {
    return this.generateWaveConfig(this.currentWaveIndex, this.customTotalWaves);
  }

  public startWave(waveNum?: number): boolean {
    if (waveNum !== undefined) {
      this.currentWaveIndex = waveNum - 1;
    }
    if (this.currentWaveIndex >= this.getTotalWaves()) return false;
    this.isWaveInProgress = true;
    const cfg = this.getCurrentWaveConfig();
    this.pendingRewards = [cfg ? cfg.rewardGold : 0];
    return true;
  }

  public callWaveEarly(): boolean {
    if (!this.isWaveInProgress || this.currentWaveIndex + 1 >= this.getTotalWaves()) return false;
    this.currentWaveIndex++;
    const cfg = this.getCurrentWaveConfig();
    this.pendingRewards.push(cfg ? cfg.rewardGold : 0);
    return true;
  }

  /**
   * Procedural / Dynamic wave generation scaling with custom wave counts
   * 100% delegated to Rust WebAssembly Core (`wasm-sim/src/wave.rs`).
   */
  public generateWaveConfig(waveIdx: number, _totalWaves?: number): WaveConfig {
    const bridge = WasmBridge.ensureSingletonReady();
    const json = bridge.getOps().wave_generate_config(JSON.stringify(this.currentMap), waveIdx);
    return JSON.parse(json) as WaveConfig;
  }

  /**
   * Creates an enemy entity with stats scaled to the specified wave.
   * 100% delegated to Rust WebAssembly Core (`wasm-sim/src/wave.rs`).
   */
  public createEnemy(typeId: string, waveIndex: number = this.currentWaveIndex, laneIndex: number = 0): EnemyEntity | null {
    const bridge = WasmBridge.ensureSingletonReady();
    const json = bridge.getOps().wave_create_enemy(JSON.stringify(this.currentMap), typeId, waveIndex, laneIndex);
    if (!json) return null;
    return JSON.parse(json) as EnemyEntity;
  }

  public spawnMinionAt(
    typeId: string,
    x: number,
    y: number,
    pathDistance: number,
    laneIndex: number = 0
  ): EnemyEntity | null {
    const enemy = this.createEnemy(typeId, this.currentWaveIndex, laneIndex);
    if (enemy) {
      enemy.x = x;
      enemy.y = y;
      enemy.pathDistance = pathDistance;
    }
    return enemy;
  }
}
