import { EnemyEntity } from '../types/entities.types.js';
import { WaveConfig, MAP_CONFIG, MapConfig } from '../config/map.config.js';
import { ENEMY_BLUEPRINTS } from '../config/enemies.config.js';

interface ActiveSpawner {
  typeId: string;
  remainingCount: number;
  interval: number;
  timer: number;
}

export class WaveSystem {
  public currentWaveIndex = 0; // 0-based
  public isWaveInProgress = false;
  public waveTime = 0;
  private currentMap: MapConfig;
  private activeSpawners: ActiveSpawner[] = [];
  private enemyCounter = 0;

  constructor(mapConfig: MapConfig = MAP_CONFIG) {
    this.currentMap = mapConfig;
  }

  public setMap(mapConfig: MapConfig): void {
    this.currentMap = mapConfig;
    this.currentWaveIndex = 0;
    this.isWaveInProgress = false;
    this.waveTime = 0;
    this.activeSpawners = [];
  }

  public getCurrentWaveConfig(): WaveConfig | undefined {
    return this.currentMap.waves ? this.currentMap.waves[this.currentWaveIndex] : undefined;
  }

  public getTotalWaves(): number {
    return this.currentMap.waves ? this.currentMap.waves.length : 10;
  }

  public startWave(waveNum?: number): boolean {
    if (waveNum !== undefined) {
      this.currentWaveIndex = waveNum - 1;
    }

    const config = this.getCurrentWaveConfig();
    if (!config) return false;

    this.isWaveInProgress = true;
    this.waveTime = 0;
    this.activeSpawners = config.enemies.map((entry) => ({
      typeId: entry.typeId,
      remainingCount: entry.count,
      interval: entry.interval,
      timer: entry.delay
    }));

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

          const enemy = this.createEnemy(spawner.typeId);
          if (enemy) {
            onSpawnEnemy(enemy);
          }
        }
      }
    }

    if (allSpawned && activeEnemiesCount === 0) {
      this.isWaveInProgress = false;
      const config = this.getCurrentWaveConfig();
      const reward = config ? config.rewardGold : 50;

      onWaveComplete(reward);

      if (this.currentWaveIndex < this.getTotalWaves() - 1) {
        this.currentWaveIndex++;
      }
    }
  }

  private createEnemy(typeId: string): EnemyEntity | null {
    const bp = ENEMY_BLUEPRINTS[typeId];
    if (!bp) return null;

    this.enemyCounter++;

    let startX = this.currentMap.groundSpawn.x;
    let startY = this.currentMap.groundSpawn.y;

    if (bp.navigationMode === 'WATER_PATH') {
      startX = this.currentMap.waterSpawn.x;
      startY = this.currentMap.waterSpawn.y;
    } else if (bp.navigationMode === 'AIR_DIRECT' || bp.navigationMode === 'AIR_WAYPOINTS') {
      startX = this.currentMap.airStart.x;
      startY = this.currentMap.airStart.y;
    }

    return {
      id: `enemy-${this.enemyCounter}`,
      typeId: bp.typeId,
      name: bp.name,
      x: startX,
      y: startY,
      hp: bp.hp,
      maxHp: bp.hp,
      speed: bp.speed,
      baseSpeed: bp.speed,
      damage: bp.damage,
      attackSpeed: bp.attackSpeed,
      attackCooldown: 1.0,
      rewardGold: bp.rewardGold,
      movementType: bp.movementType,
      navigationMode: bp.navigationMode,
      pathDistance: 0,
      pathTotalLength: 1000,
      elementalProfile: {
        primaryElement: bp.elementalProfile.primaryElement,
        immunities: [...bp.elementalProfile.immunities],
        damageMultipliers: bp.elementalProfile.damageMultipliers
          ? { ...bp.elementalProfile.damageMultipliers }
          : undefined
      },
      state: bp.movementType === 'FLY' ? 'FLYING' : bp.movementType === 'SWIM' ? 'SWIMMING' : 'WALKING',
      engagedBySoldierId: null,
      statusEffects: [],
      tags: [...bp.tags],
      altitude: bp.altitude,
      size: bp.size,
      facing: 0
    };
  }
}
