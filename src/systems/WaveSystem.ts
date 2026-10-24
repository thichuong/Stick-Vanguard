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
    return this.generateWaveConfig(this.currentWaveIndex, this.customTotalWaves);
  }

  /**
   * Procedural / Dynamic wave generation scaling with custom wave counts
   * Rule:
   * - Waves 1-10: Đúng theo bản đồ đã mô tả (this.currentMap.waves[0..9])
   * - Waves > 10:
   *   + n = Math.floor(waveNum / 10)
   *   + Nếu waveNum chia hết cho 5: Quái = Wave 9 + Wave 10 của bản đồ, số quái gấp n lần.
   *   + Nếu waveNum không chia hết cho 5: Quái giống Wave 9 của bản đồ, số quái gấp n lần.
   */
  public generateWaveConfig(waveIdx: number, _totalWaves?: number): WaveConfig {
    const waveNum = waveIdx + 1;
    const mapWaves = this.currentMap?.waves || [];

    // --- Waves 1 - 10: Tạo đúng theo bản đồ đã mô tả ---
    if (waveNum <= 10 && mapWaves[waveIdx]) {
      const baseWave = mapWaves[waveIdx];
      return {
        waveNumber: waveNum,
        name: baseWave.name,
        rewardGold: baseWave.rewardGold,
        enemies: baseWave.enemies.map((e) => ({ ...e }))
      };
    }

    // --- Waves > 10: Dựa trên Wave 9 và Wave 10 của bản đồ hiện tại ---
    const n = Math.floor(waveNum / 10);
    const wave9 = mapWaves[8] || mapWaves[mapWaves.length - 1];
    const wave10 = mapWaves[9] || wave9;

    if (waveNum % 5 === 0) {
      // Chia hết cho 5: Quái = Wave 9 + Wave 10 của bản đồ, số quái gấp n lần
      const mergedMap = new Map<string, { typeId: string; count: number; interval: number; delay: number }>();
      for (const entry of [...(wave9?.enemies || []), ...(wave10?.enemies || [])]) {
        const existing = mergedMap.get(entry.typeId);
        if (existing) {
          existing.count += entry.count;
          existing.interval = Math.min(existing.interval, entry.interval);
          existing.delay = Math.min(existing.delay, entry.delay);
        } else {
          mergedMap.set(entry.typeId, { ...entry });
        }
      }

      const enemies = Array.from(mergedMap.values()).map((entry) => ({
        ...entry,
        count: entry.count * n
      }));

      const baseReward = (wave9?.rewardGold || 175) + (wave10?.rewardGold || 300);
      return {
        waveNumber: waveNum,
        name: `Đợt ${waveNum}: Tổng Lực Tinh Nhuệ & Trùm (x${n})`,
        rewardGold: baseReward * n,
        enemies
      };
    }

    // Waves > 10 không chia hết cho 5: Quái giống Wave 9 của bản đồ, số quái gấp n lần
    const enemies = (wave9?.enemies || []).map((entry) => ({
      ...entry,
      count: entry.count * n
    }));

    return {
      waveNumber: waveNum,
      name: `${wave9?.name || `Đợt ${waveNum}`} (x${n})`,
      rewardGold: (wave9?.rewardGold || 175) * n,
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
      summonTimer: bp.summonConfig ? bp.summonConfig.interval : undefined,
      ccResistance: bp.ccResistance
        ? {
            hardCC: bp.ccResistance.hardCC ? { ...bp.ccResistance.hardCC } : undefined,
            softCC: bp.ccResistance.softCC ? { ...bp.ccResistance.softCC } : undefined
          }
        : undefined,
      abilities: bp.abilities ? bp.abilities.map((a) => ({ ...a })) : undefined,
      abilityTimers: bp.abilities ? bp.abilities.map((a) => a.interval) : undefined,
      armorShield: 0,
      maxArmorShield: 0,
      magicShield: 0,
      maxMagicShield: 0,
      damageReductionRatio: 0,
      damageReductionTimer: 0
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
      summonTimer: bp.summonConfig ? bp.summonConfig.interval : undefined,
      ccResistance: bp.ccResistance
        ? {
            hardCC: bp.ccResistance.hardCC ? { ...bp.ccResistance.hardCC } : undefined,
            softCC: bp.ccResistance.softCC ? { ...bp.ccResistance.softCC } : undefined
          }
        : undefined,
      abilities: bp.abilities ? bp.abilities.map((a) => ({ ...a })) : undefined,
      abilityTimers: bp.abilities ? bp.abilities.map((a) => a.interval) : undefined,
      armorShield: 0,
      maxArmorShield: 0,
      magicShield: 0,
      maxMagicShield: 0,
      damageReductionRatio: 0,
      damageReductionTimer: 0
    };
  }
}
