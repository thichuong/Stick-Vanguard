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
  public customTotalWaves: number = 10;
  private currentMap: MapConfig;
  private activeSpawners: ActiveSpawner[] = [];
  private enemyCounter = 0;

  constructor(mapConfig: MapConfig = MAP_CONFIG, totalWaves: number = 10) {
    this.currentMap = mapConfig;
    this.customTotalWaves = totalWaves;
  }

  public setMap(mapConfig: MapConfig): void {
    this.currentMap = mapConfig;
    this.currentWaveIndex = 0;
    this.isWaveInProgress = false;
    this.waveTime = 0;
    this.activeSpawners = [];
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
   */
  public generateWaveConfig(waveIdx: number, totalWaves: number): WaveConfig {
    const waveNum = waveIdx + 1;
    const progress = totalWaves > 1 ? waveIdx / (totalWaves - 1) : 1; // 0.0 to 1.0
    const isFinalWave = waveNum === totalWaves;
    const isBossWave = isFinalWave || (totalWaves >= 10 && waveNum % 5 === 0);

    const baseReward = 45 + Math.round(waveNum * 12);
    const enemies: WaveConfig['enemies'] = [];

    if (isFinalWave) {
      // Final Wave: Mega Boss & Elites
      enemies.push({ typeId: 'VOID_HYDRA_BOSS', count: 1, interval: 1.0, delay: 0 });
      enemies.push({ typeId: 'FROST_CRYSTAL_GOLEM', count: Math.min(6, 2 + Math.floor(waveNum / 4)), interval: 2.2, delay: 3 });
      enemies.push({ typeId: 'NECRO_WARLOCK', count: Math.min(5, 2 + Math.floor(waveNum / 5)), interval: 2.5, delay: 6 });
      enemies.push({ typeId: 'STORM_CALLER_SIREN', count: Math.min(6, 2 + Math.floor(waveNum / 4)), interval: 2.0, delay: 7 });
      enemies.push({ typeId: 'DARK_DRAGON_BOSS', count: 1, interval: 1.0, delay: 12 });

      return {
        waveNumber: waveNum,
        name: `Đợt ${waveNum}: Chung Cuộc Đại Thắng - Song Trùm Ma Vương`,
        rewardGold: baseReward * 2,
        enemies
      };
    }

    if (isBossWave) {
      // Milestone Boss Wave (e.g. Wave 5, 10, 15...)
      const bossType = progress > 0.5 ? 'DARK_DRAGON_BOSS' : 'VOID_HYDRA_BOSS';
      enemies.push({ typeId: bossType, count: 1, interval: 1.0, delay: 0 });
      enemies.push({ typeId: 'MAGMA_SLIME', count: 4, interval: 1.6, delay: 3 });
      enemies.push({ typeId: 'NECRO_WARLOCK', count: 3, interval: 2.2, delay: 5 });

      return {
        waveNumber: waveNum,
        name: `Đợt ${waveNum}: Tiền Trạm Trùm Ma Vương`,
        rewardGold: Math.round(baseReward * 1.5),
        enemies
      };
    }

    // Regular Waves based on tier progress
    if (progress < 0.2) {
      // Early: runners & basic warriors
      enemies.push({ typeId: 'STICK_RUNNER', count: 6 + waveNum * 2, interval: 1.2, delay: 0 });
      if (waveNum > 1) {
        enemies.push({ typeId: 'STICK_WARRIOR', count: 3 + waveNum, interval: 2.0, delay: 4 });
      }
    } else if (progress < 0.45) {
      // Early-mid: introduce splitters & elemental flyers/swimmers
      enemies.push({ typeId: 'MAGMA_SLIME', count: 3 + Math.floor(waveNum / 2), interval: 2.0, delay: 0 });
      enemies.push({ typeId: 'WINGED_GARGOYLE', count: 4 + Math.floor(waveNum / 2), interval: 1.8, delay: 3 });
      enemies.push({ typeId: 'AQUA_SERPENT', count: 3 + Math.floor(waveNum / 3), interval: 2.2, delay: 5 });
    } else if (progress < 0.75) {
      // Mid-late: introduce summoners & tank splitters
      enemies.push({ typeId: 'FROST_CRYSTAL_GOLEM', count: 3 + Math.floor(waveNum / 3), interval: 2.5, delay: 0 });
      enemies.push({ typeId: 'NECRO_WARLOCK', count: 2 + Math.floor(waveNum / 4), interval: 2.8, delay: 3 });
      enemies.push({ typeId: 'STORM_CALLER_SIREN', count: 3 + Math.floor(waveNum / 3), interval: 2.0, delay: 5 });
      enemies.push({ typeId: 'FIRE_IMP', count: 6 + Math.floor(waveNum / 2), interval: 1.0, delay: 7 });
    } else {
      // Late: full horde mix
      enemies.push({ typeId: 'FROST_CRYSTAL_GOLEM', count: 4, interval: 2.2, delay: 0 });
      enemies.push({ typeId: 'MAGMA_SLIME', count: 5, interval: 1.8, delay: 3 });
      enemies.push({ typeId: 'NECRO_WARLOCK', count: 3, interval: 2.4, delay: 5 });
      enemies.push({ typeId: 'SHADOW_WRAITH', count: 5, interval: 1.5, delay: 7 });
      enemies.push({ typeId: 'WINGED_GARGOYLE', count: 6, interval: 1.4, delay: 9 });
      enemies.push({ typeId: 'STORM_CALLER_SIREN', count: 4, interval: 1.8, delay: 10 });
    }

    return {
      waveNumber: waveNum,
      name: `Đợt ${waveNum}: Quân Đoàn Xâm Lăng (Cấp ${waveNum})`,
      rewardGold: baseReward,
      enemies
    };
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
        secondaryElement: bp.elementalProfile.secondaryElement,
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
      facing: 0,
      deathSpawn: bp.deathSpawn ? { ...bp.deathSpawn } : undefined,
      summonConfig: bp.summonConfig ? { ...bp.summonConfig } : undefined,
      summonTimer: bp.summonConfig ? bp.summonConfig.interval : undefined
    };
  }

  /**
   * Spawns a minion or split child enemy at a specific coordinate and path progress
   */
  public spawnMinionAt(
    typeId: string,
    pathDistance: number,
    x: number,
    y: number
  ): EnemyEntity | null {
    const bp = ENEMY_BLUEPRINTS[typeId];
    if (!bp) return null;

    this.enemyCounter++;
    return {
      id: `enemy-${this.enemyCounter}`,
      typeId: bp.typeId,
      name: bp.name,
      x,
      y,
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
      pathDistance,
      pathTotalLength: 1000,
      elementalProfile: {
        primaryElement: bp.elementalProfile.primaryElement,
        secondaryElement: bp.elementalProfile.secondaryElement,
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
      facing: 0,
      deathSpawn: bp.deathSpawn ? { ...bp.deathSpawn } : undefined,
      summonConfig: bp.summonConfig ? { ...bp.summonConfig } : undefined,
      summonTimer: bp.summonConfig ? bp.summonConfig.interval : undefined
    };
  }
}
