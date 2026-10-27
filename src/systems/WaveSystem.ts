import { EnemyEntity } from '../types/entities.types.js';
import { WaveConfig, MAP_CONFIG, MapConfig } from '../config/map.config.js';
import { WasmBridge } from '../core/WasmBridge.js';

interface ActiveSpawner {
  typeId: string;
  remainingCount: number;
  interval: number;
  timer: number;
  laneCursor: number;
  waveIndex?: number;
}

export class WaveSystem {
  public currentWaveIndex = 0; // 0-based
  public isWaveInProgress = false;
  public waveTime = 0;
  public customTotalWaves: number = 15;
  private currentMap: MapConfig;
  private activeSpawners: ActiveSpawner[] = [];
  public pendingRewards: number[] = [];

  constructor(mapConfig: MapConfig = MAP_CONFIG, totalWaves: number = 15) {
    this.currentMap = mapConfig;
    this.customTotalWaves = totalWaves;
  }

  public setMap(mapConfig: MapConfig): void {
    this.currentMap = mapConfig;
    this.currentWaveIndex = 0;
    this.isWaveInProgress = false;
    this.waveTime = 0;
    this.activeSpawners = [];
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

  public getCurrentWaveConfig(): WaveConfig {
    return this.generateWaveConfig(this.currentWaveIndex, this.customTotalWaves);
  }

  /**
   * Procedural / Dynamic wave generation scaling with custom wave counts
   * Rule:
   * - Waves 1-10: Đúng theo bản đồ đã mô tả (this.currentMap.waves[0..9])
   * - Waves > 10:
   *   + Phân loại rõ: Waves Lính (không chia hết cho 5) và Waves Boss (chia hết cho 5: 15, 20, 25...)
   *   + n = Math.floor(waveNum / 10)
   *   + Waves Lính: Dựa trên extendedWaves của map (luân phiên 2 waves extend riêng của từng map), số lượng quái nhân n lần.
   *   + Waves Boss:
   *     * Số lính waves boss ngang số lính waves lính (danh sách lính nhân n lần, không cộng thêm lính wave 10).
   *     * Boss xuất hiện trên tất cả lane có thể đi được (số lượng Boss = traversableLanes * n).
   */
  /**
   * Procedural / Dynamic wave generation scaling with custom wave counts
   * 100% delegated to Rust WebAssembly Core (`wasm-sim/src/wave.rs`).
   */
  public generateWaveConfig(waveIdx: number, _totalWaves?: number): WaveConfig {
    const bridge = WasmBridge.ensureSingletonReady();
    const json = bridge.getOps().wave_generate_config(JSON.stringify(this.currentMap), waveIdx);
    return JSON.parse(json) as WaveConfig;
  }

  public startWave(waveNum?: number): boolean {
    if (waveNum !== undefined) {
      this.currentWaveIndex = waveNum - 1;
    } else {
      if (this.currentWaveIndex >= this.getTotalWaves()) {
        return false;
      }
    }

    const config = this.getCurrentWaveConfig();
    if (!config) return false;

    const thisWaveIdx = this.currentWaveIndex;
    this.pendingRewards = [config.rewardGold];
    this.isWaveInProgress = true;
    this.waveTime = 0;
    this.activeSpawners = config.enemies.map((entry) => ({
      typeId: entry.typeId,
      remainingCount: entry.count,
      interval: entry.interval,
      timer: entry.delay,
      laneCursor: 0,
      waveIndex: thisWaveIdx
    }));

    return true;
  }

  public callWaveEarly(): boolean {
    if (!this.isWaveInProgress || this.currentWaveIndex + 1 >= this.getTotalWaves()) {
      return false;
    }

    this.currentWaveIndex++;
    const config = this.getCurrentWaveConfig();
    if (!config) return false;

    const thisWaveIdx = this.currentWaveIndex;
    this.pendingRewards.push(config.rewardGold);

    const newSpawners: ActiveSpawner[] = config.enemies.map((entry) => ({
      typeId: entry.typeId,
      remainingCount: entry.count,
      interval: entry.interval,
      timer: entry.delay,
      laneCursor: 0,
      waveIndex: thisWaveIdx
    }));

    this.activeSpawners.push(...newSpawners);
    return true;
  }

  public update(
    dt: number,
    onSpawnEnemy: (enemy: EnemyEntity) => void,
    onWaveComplete: (rewardGold: number) => void,
    activeEnemiesCount: number
  ): void {
    if (!this.isWaveInProgress) return;

    this.waveTime += dt;
    let allSpawned = true;

    for (const spawner of this.activeSpawners) {
      if (spawner.remainingCount > 0) {
        allSpawned = false;
        spawner.timer -= dt;
        if (spawner.timer <= 0) {
          spawner.timer = spawner.interval;
          spawner.remainingCount--;

          const forcedLane = spawner.laneCursor++;
          const enemy = this.createEnemy(spawner.typeId, forcedLane, spawner.waveIndex);
          if (enemy) {
            onSpawnEnemy(enemy);
          }
        }
      }
    }

    this.activeSpawners = this.activeSpawners.filter((s) => s.remainingCount > 0);

    if (allSpawned && activeEnemiesCount === 0) {
      this.isWaveInProgress = false;
      const totalReward = this.pendingRewards.length > 0
        ? this.pendingRewards.reduce((sum, r) => sum + r, 0)
        : (this.getCurrentWaveConfig()?.rewardGold ?? 50);
      this.pendingRewards = [];

      onWaveComplete(totalReward);

      if (this.currentWaveIndex < this.getTotalWaves() - 1) {
        this.currentWaveIndex++;
      }
    }
  }

  /**
   * Tính toán hệ số máu tối đa của quái vật theo wave:
   * Sau wave 10, mỗi wave quái tăng 10% máu tối đa.
   * - Wave 1 đến 10: 1.0 (100% máu cơ bản)
   * - Wave 11: 1.1 (+10% máu tối đa)
   * - Wave 12: 1.2 (+20% máu tối đa)
   * - Wave n (>10): 1.0 + (n - 10) * 0.1
   */
  public getWaveHpMultiplier(waveIndex: number = this.currentWaveIndex): number {
    const waveNum = waveIndex + 1;
    if (waveNum <= 10) return 1.0;
    const extraWaves = waveNum - 10;
    return 1.0 + extraWaves * 0.1;
  }

  private createEnemy(typeId: string, forcedLaneIndex?: number, waveIndex?: number): EnemyEntity | null {
    const bridge = WasmBridge.ensureSingletonReady();
    const effWaveIdx = waveIndex !== undefined ? waveIndex : this.currentWaveIndex;
    const json = bridge.getOps().wave_create_enemy(
      JSON.stringify(this.currentMap),
      typeId,
      effWaveIdx,
      forcedLaneIndex
    );
    if (!json) return null;
    return JSON.parse(json) as EnemyEntity;
  }

  /**
   * Spawns a minion or split child enemy at a specific coordinate and path progress
   */
  public spawnMinionAt(
    typeId: string,
    pathDistance: number,
    x: number,
    y: number,
    laneIndex: number = 0
  ): EnemyEntity | null {
    const enemy = this.createEnemy(typeId, laneIndex);
    if (!enemy) return null;
    enemy.pathDistance = pathDistance;
    enemy.x = x;
    enemy.y = y;
    return enemy;
  }
}
