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
  public customTotalWaves: number = 15;
  private currentMap: MapConfig;
  private activeSpawners: ActiveSpawner[] = [];
  private enemyCounter = 0;
  private groundLaneIndex = 0;
  private waterLaneIndex = 0;
  private airLaneIndex = 0;

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
    this.groundLaneIndex = 0;
    this.waterLaneIndex = 0;
    this.airLaneIndex = 0;
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
    if (
      this.currentMap &&
      this.currentMap.waves &&
      this.currentMap.waves[this.currentWaveIndex] &&
      this.customTotalWaves === this.currentMap.waves.length
    ) {
      return this.currentMap.waves[this.currentWaveIndex];
    }
    return this.generateWaveConfig(this.currentWaveIndex, this.customTotalWaves);
  }

  /**
   * Procedural / Dynamic wave generation scaling with custom wave counts
   * Rule:
   * - Wave 1-3: ONLY walking (WALK)
   * - Wave 4: ONLY flying (FLY)
   * - Wave 5: ONLY swimming/water (SWIM)
   * - Wave > 5: Multiple movement types (mixed routes)
   */
  public generateWaveConfig(waveIdx: number, totalWaves: number): WaveConfig {
    const waveNum = waveIdx + 1;
    const progress = totalWaves > 1 ? waveIdx / (totalWaves - 1) : 1; // 0.0 to 1.0
    const isFinalWave = waveNum === totalWaves && waveNum > 5;
    const isBossWave = (isFinalWave || (totalWaves >= 10 && waveNum % 5 === 0)) && waveNum > 5;

    const baseReward = 45 + Math.round(waveNum * 12);
    const enemies: WaveConfig['enemies'] = [];

    // --- Wave 1, 2, 3: Đảm bảo 3 waves đầu là quái đi bộ (WALK only) ---
    if (waveNum === 1) {
      enemies.push({ typeId: 'STICK_RUNNER', count: 8, interval: 1.4, delay: 0 });
      return {
        waveNumber: 1,
        name: 'Đợt 1: Dân Quân Bất Tuân (Đi Bộ)',
        rewardGold: baseReward,
        enemies
      };
    }

    if (waveNum === 2) {
      enemies.push({ typeId: 'STICK_RUNNER', count: 6, interval: 1.2, delay: 0 });
      enemies.push({ typeId: 'STICK_WARRIOR', count: 4, interval: 2.0, delay: 4 });
      return {
        waveNumber: 2,
        name: 'Đợt 2: Tiền Trạm Kiếm Sĩ (Đi Bộ)',
        rewardGold: baseReward,
        enemies
      };
    }

    if (waveNum === 3) {
      const mapId = this.currentMap?.id || '';
      const walker3 =
        mapId === 'valley_origin'
          ? 'TREANT_GUARD'
          : mapId === 'twin_crossroads'
          ? 'STEEL_VANGUARD'
          : mapId === 'serpent_canyon'
          ? 'DRAKE_WARRIOR'
          : mapId === 'ancient_necropolis'
          ? 'PHANTOM_REAPER'
          : mapId === 'plague_morass'
          ? 'VENOM_ARACHNID'
          : 'FIRE_IMP';

      enemies.push({ typeId: 'STICK_WARRIOR', count: 5, interval: 1.6, delay: 0 });
      enemies.push({ typeId: walker3, count: 4, interval: 1.6, delay: 3 });
      return {
        waveNumber: 3,
        name: `Đợt 3: Tiên Phong ${this.currentMap?.tribe?.name || 'Chiến Binh'} (Đi Bộ)`,
        rewardGold: baseReward,
        enemies
      };
    }

    // --- Wave 4: 1 wave kế CHỈ quái bay (FLY only) ---
    if (waveNum === 4) {
      const mapId = this.currentMap?.id || '';
      const flyer =
        mapId === 'valley_origin' || mapId === 'frozen_citadel'
          ? 'FAIRY_SPRITE'
          : mapId === 'serpent_canyon'
          ? 'WYVERN_RAIDER'
          : mapId === 'ancient_necropolis'
          ? 'SPECTRAL_BANSHEE'
          : mapId === 'plague_morass'
          ? 'TOXIC_BAT'
          : 'WINGED_GARGOYLE';

      enemies.push({
        typeId: flyer,
        count: 6 + Math.min(6, Math.floor(totalWaves / 4)),
        interval: 1.8,
        delay: 0
      });
      return {
        waveNumber: 4,
        name: 'Đợt 4: Không Kích Đột Ngột (Chỉ Quái Bay)',
        rewardGold: baseReward,
        enemies
      };
    }

    // --- Wave 5: 1 wave kế CHỈ quái dưới nước (SWIM only) ---
    if (waveNum === 5) {
      const mapId = this.currentMap?.id || '';
      const swimmer =
        mapId === 'valley_origin'
          ? 'MOSS_TURTLE'
          : mapId === 'twin_crossroads'
          ? 'SPARK_EEL'
          : mapId === 'serpent_canyon'
          ? 'RIVER_DRAKE'
          : mapId === 'plague_morass'
          ? 'PLAGUE_LEVIATHAN'
          : 'AQUA_SERPENT';

      enemies.push({
        typeId: swimmer,
        count: 5 + Math.min(5, Math.floor(totalWaves / 4)),
        interval: 2.0,
        delay: 0
      });
      return {
        waveNumber: 5,
        name: 'Đợt 5: Thủy Quái Cuộn Sóng (Chỉ Quái Bơi)',
        rewardGold: baseReward,
        enemies
      };
    }

    // --- Wave > 5: Mới xuất hiện quái nhiều hơn 1 loại đường (Hỗn Hợp) ---
    // --- Wave > 10: Độ khó tăng cao, xuất quái đầy đủ, số lượng tăng lên theo mỗi wave ---
    if (waveNum > 10) {
      const extraWave = waveNum - 10;
      const post10Reward = 180 + Math.round(waveNum * 15);

      if (isFinalWave) {
        // Final Wave (>10): Song Trùm Ma Vương & Đại Quân Đa Tuyến Tinh Nhuệ Tối Thượng
        enemies.push({ typeId: 'VOID_HYDRA_BOSS', count: 1, interval: 1.0, delay: 0 }); // WALK
        enemies.push({ typeId: 'DARK_DRAGON_BOSS', count: 1, interval: 1.0, delay: 5 }); // FLY
        enemies.push({ typeId: 'FROST_CRYSTAL_GOLEM', count: 6 + Math.floor(extraWave * 0.6), interval: 1.3, delay: 2 }); // WALK
        enemies.push({ typeId: 'ROCK_GOLEM', count: 6 + Math.floor(extraWave * 0.6), interval: 1.3, delay: 3 }); // WALK
        enemies.push({ typeId: 'NECRO_WARLOCK', count: 4 + Math.floor(extraWave * 0.5), interval: 1.6, delay: 4 }); // WALK
        enemies.push({ typeId: 'STORM_CALLER_SIREN', count: 5 + Math.floor(extraWave * 0.5), interval: 1.2, delay: 6 }); // SWIM
        enemies.push({ typeId: 'WINGED_GARGOYLE', count: 14 + Math.floor(extraWave * 1.5), interval: 0.5, delay: 7 }); // FLY
        enemies.push({ typeId: 'AQUA_SERPENT', count: 10 + Math.floor(extraWave * 1.0), interval: 0.7, delay: 9 }); // SWIM
        enemies.push({ typeId: 'SHADOW_WRAITH', count: 8 + Math.floor(extraWave * 1.0), interval: 0.7, delay: 11 }); // WALK
        enemies.push({ typeId: 'MAGMA_SLIME', count: 8 + Math.floor(extraWave * 0.8), interval: 1.0, delay: 13 }); // WALK

        return {
          waveNumber: waveNum,
          name: `Đợt ${waveNum}: Chung Cuộc Tận Diệt - Song Trùm Ma Vương`,
          rewardGold: Math.round(post10Reward * 2),
          enemies
        };
      }

      if (isBossWave) {
        // Milestone Boss Wave (15, 20, 25, 30...) - Đầy đủ các hệ và số lượng lớn
        const bossType = (waveNum % 10 === 0) ? 'VOID_HYDRA_BOSS' : 'DARK_DRAGON_BOSS';
        enemies.push({ typeId: bossType, count: 1, interval: 1.0, delay: 0 });
        enemies.push({ typeId: 'ROCK_GOLEM', count: 5 + Math.floor(extraWave * 0.5), interval: 1.6, delay: 2 }); // WALK
        enemies.push({ typeId: 'FROST_CRYSTAL_GOLEM', count: 4 + Math.floor(extraWave * 0.5), interval: 1.8, delay: 4 }); // WALK
        enemies.push({ typeId: 'STORM_CALLER_SIREN', count: 4 + Math.floor(extraWave * 0.5), interval: 1.5, delay: 6 }); // SWIM
        enemies.push({ typeId: 'WINGED_GARGOYLE', count: 12 + Math.floor(extraWave * 1.2), interval: 0.7, delay: 8 }); // FLY
        enemies.push({ typeId: 'MAGMA_SLIME', count: 6 + Math.floor(extraWave * 0.8), interval: 1.4, delay: 10 }); // WALK
        enemies.push({ typeId: 'AQUA_SERPENT', count: 8 + Math.floor(extraWave * 0.8), interval: 1.1, delay: 12 }); // SWIM
        enemies.push({ typeId: 'NECRO_WARLOCK', count: 3 + Math.floor(extraWave * 0.4), interval: 1.8, delay: 14 }); // WALK

        return {
          waveNumber: waveNum,
          name: `Đợt ${waveNum}: Tiền Trạm Trùm Ma Vương (Cấp ${waveNum})`,
          rewardGold: Math.round(post10Reward * 1.5),
          enemies
        };
      }

      // Regular Wave > 10: Xuất quái đầy đủ 100% chủng loại và số lượng tăng dần theo mỗi wave!
      enemies.push({
        typeId: 'FROST_CRYSTAL_GOLEM',
        count: 3 + Math.floor(extraWave * 0.6),
        interval: Math.max(1.2, 2.2 - extraWave * 0.05),
        delay: 0
      });
      enemies.push({
        typeId: 'MAGMA_SLIME',
        count: 5 + Math.floor(extraWave * 1.0),
        interval: Math.max(0.8, 1.8 - extraWave * 0.06),
        delay: 2
      });
      enemies.push({
        typeId: 'WINGED_GARGOYLE',
        count: 8 + Math.floor(extraWave * 1.5),
        interval: Math.max(0.5, 1.4 - extraWave * 0.05),
        delay: 4
      });
      enemies.push({
        typeId: 'AQUA_SERPENT',
        count: 6 + Math.floor(extraWave * 1.0),
        interval: Math.max(0.7, 1.6 - extraWave * 0.05),
        delay: 5
      });
      enemies.push({
        typeId: 'NECRO_WARLOCK',
        count: 2 + Math.floor(extraWave * 0.5),
        interval: Math.max(1.5, 2.4 - extraWave * 0.05),
        delay: 7
      });
      enemies.push({
        typeId: 'STORM_CALLER_SIREN',
        count: 3 + Math.floor(extraWave * 0.6),
        interval: Math.max(1.1, 1.8 - extraWave * 0.05),
        delay: 9
      });
      enemies.push({
        typeId: 'SHADOW_WRAITH',
        count: 4 + Math.floor(extraWave * 1.1),
        interval: Math.max(0.6, 1.4 - extraWave * 0.05),
        delay: 11
      });
      enemies.push({
        typeId: 'SPARK_EEL',
        count: 4 + Math.floor(extraWave * 0.8),
        interval: Math.max(0.8, 1.4 - extraWave * 0.04),
        delay: 12
      });
      enemies.push({
        typeId: 'ROCK_GOLEM',
        count: 3 + Math.floor(extraWave * 0.6),
        interval: Math.max(1.2, 2.0 - extraWave * 0.04),
        delay: 14
      });

      return {
        waveNumber: waveNum,
        name: `Đợt ${waveNum}: Đại Quân Đa Chiều Cuồng Nộ (Cấp ${waveNum})`,
        rewardGold: post10Reward,
        enemies
      };
    }

    // --- Wave 6 - 10 ---
    if (isFinalWave) {
      // Final Wave (Wave <= 10): Mega Boss & Elites (Mixed multi-path)
      enemies.push({ typeId: 'VOID_HYDRA_BOSS', count: 1, interval: 1.0, delay: 0 }); // WALK
      enemies.push({ typeId: 'FROST_CRYSTAL_GOLEM', count: Math.min(6, 2 + Math.floor(waveNum / 4)), interval: 2.2, delay: 3 }); // WALK
      enemies.push({ typeId: 'NECRO_WARLOCK', count: Math.min(5, 2 + Math.floor(waveNum / 5)), interval: 2.5, delay: 6 }); // WALK
      enemies.push({ typeId: 'STORM_CALLER_SIREN', count: Math.min(6, 2 + Math.floor(waveNum / 4)), interval: 2.0, delay: 7 }); // SWIM
      enemies.push({ typeId: 'DARK_DRAGON_BOSS', count: 1, interval: 1.0, delay: 12 }); // FLY

      return {
        waveNumber: waveNum,
        name: `Đợt ${waveNum}: Chung Cuộc Đại Thắng - Song Trùm Ma Vương`,
        rewardGold: baseReward * 2,
        enemies
      };
    }

    if (isBossWave) {
      // Milestone Boss Wave (Wave 10)
      const bossType = progress > 0.5 ? 'DARK_DRAGON_BOSS' : 'VOID_HYDRA_BOSS';
      enemies.push({ typeId: bossType, count: 1, interval: 1.0, delay: 0 }); // FLY or WALK
      enemies.push({ typeId: 'MAGMA_SLIME', count: 4, interval: 1.6, delay: 3 }); // WALK
      enemies.push({ typeId: 'AQUA_SERPENT', count: 4, interval: 2.0, delay: 5 }); // SWIM

      return {
        waveNumber: waveNum,
        name: `Đợt ${waveNum}: Tiền Trạm Trùm Ma Vương`,
        rewardGold: Math.round(baseReward * 1.5),
        enemies
      };
    }

    // Regular Waves 6-10 based on tier progress (Mixed multi-path)
    if (progress < 0.45) {
      // Early-mid: splitters & elemental flyers/swimmers (WALK + FLY + SWIM)
      enemies.push({ typeId: 'MAGMA_SLIME', count: 3 + Math.floor(waveNum / 2), interval: 2.0, delay: 0 }); // WALK
      enemies.push({ typeId: 'WINGED_GARGOYLE', count: 4 + Math.floor(waveNum / 2), interval: 1.8, delay: 3 }); // FLY
      enemies.push({ typeId: 'AQUA_SERPENT', count: 3 + Math.floor(waveNum / 3), interval: 2.2, delay: 5 }); // SWIM
    } else if (progress < 0.75) {
      // Mid-late: summoners & tank splitters (WALK + FLY + SWIM)
      enemies.push({ typeId: 'FROST_CRYSTAL_GOLEM', count: 3 + Math.floor(waveNum / 3), interval: 2.5, delay: 0 }); // WALK
      enemies.push({ typeId: 'NECRO_WARLOCK', count: 2 + Math.floor(waveNum / 4), interval: 2.8, delay: 3 }); // WALK
      enemies.push({ typeId: 'STORM_CALLER_SIREN', count: 3 + Math.floor(waveNum / 3), interval: 2.0, delay: 5 }); // SWIM
      enemies.push({ typeId: 'WINGED_GARGOYLE', count: 5 + Math.floor(waveNum / 3), interval: 1.5, delay: 7 }); // FLY
    } else {
      // Late: full horde mix
      enemies.push({ typeId: 'FROST_CRYSTAL_GOLEM', count: 4, interval: 2.2, delay: 0 }); // WALK
      enemies.push({ typeId: 'MAGMA_SLIME', count: 5, interval: 1.8, delay: 3 }); // WALK
      enemies.push({ typeId: 'NECRO_WARLOCK', count: 3, interval: 2.4, delay: 5 }); // WALK
      enemies.push({ typeId: 'SHADOW_WRAITH', count: 5, interval: 1.5, delay: 7 }); // WALK
      enemies.push({ typeId: 'WINGED_GARGOYLE', count: 6, interval: 1.4, delay: 9 }); // FLY
      enemies.push({ typeId: 'STORM_CALLER_SIREN', count: 4, interval: 1.8, delay: 10 }); // SWIM
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
    } else {
      if (this.currentWaveIndex >= this.getTotalWaves()) {
        return false;
      }
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

  private createEnemy(typeId: string, forcedLaneIndex?: number): EnemyEntity | null {
    const bp = ENEMY_BLUEPRINTS[typeId];
    if (!bp) return null;

    this.enemyCounter++;

    const hpMultiplier = this.getWaveHpMultiplier();
    const finalHp = Math.max(1, Math.round(bp.hp * hpMultiplier));

    let laneIndex = 0;
    let startX = this.currentMap.groundSpawn.x;
    let startY = this.currentMap.groundSpawn.y;

    if (bp.navigationMode === 'WATER_PATH') {
      const waterLanesCount =
        this.currentMap.waterLanes && this.currentMap.waterLanes.length > 0
          ? this.currentMap.waterLanes.length
          : 1;
      laneIndex = forcedLaneIndex !== undefined ? forcedLaneIndex : this.waterLaneIndex++ % waterLanesCount;
      const spawnPt =
        (this.currentMap.waterSpawns && this.currentMap.waterSpawns[laneIndex]) ||
        (this.currentMap.waterLanes && this.currentMap.waterLanes[laneIndex]?.[0]) ||
        this.currentMap.waterSpawn;
      startX = spawnPt.x;
      startY = spawnPt.y;
    } else if (bp.navigationMode === 'AIR_DIRECT' || bp.navigationMode === 'AIR_WAYPOINTS') {
      const airLanesCount =
        this.currentMap.airLanes && this.currentMap.airLanes.length > 0
          ? this.currentMap.airLanes.length
          : 1;
      laneIndex = forcedLaneIndex !== undefined ? forcedLaneIndex : this.airLaneIndex++ % airLanesCount;
      const spawnPt =
        (this.currentMap.airStarts && this.currentMap.airStarts[laneIndex]) ||
        (this.currentMap.airLanes && this.currentMap.airLanes[laneIndex]?.[0]) ||
        this.currentMap.airStart;
      startX = spawnPt.x;
      startY = spawnPt.y;
    } else {
      const groundLanesCount =
        this.currentMap.groundLanes && this.currentMap.groundLanes.length > 0
          ? this.currentMap.groundLanes.length
          : 1;
      laneIndex = forcedLaneIndex !== undefined ? forcedLaneIndex : this.groundLaneIndex++ % groundLanesCount;
      const spawnPt =
        (this.currentMap.groundSpawns && this.currentMap.groundSpawns[laneIndex]) ||
        (this.currentMap.groundLanes && this.currentMap.groundLanes[laneIndex]?.[0]) ||
        this.currentMap.groundSpawn;
      startX = spawnPt.x;
      startY = spawnPt.y;
    }

    return {
      id: `enemy-${this.enemyCounter}`,
      typeId: bp.typeId,
      name: bp.name,
      x: startX,
      y: startY,
      hp: finalHp,
      maxHp: finalHp,
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
      laneIndex,
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
    y: number,
    laneIndex: number = 0
  ): EnemyEntity | null {
    const bp = ENEMY_BLUEPRINTS[typeId];
    if (!bp) return null;

    this.enemyCounter++;
    const hpMultiplier = this.getWaveHpMultiplier();
    const finalHp = Math.max(1, Math.round(bp.hp * hpMultiplier));

    return {
      id: `enemy-${this.enemyCounter}`,
      typeId: bp.typeId,
      name: bp.name,
      x,
      y,
      hp: finalHp,
      maxHp: finalHp,
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
      laneIndex,
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
