import { EnemyEntity } from '../types/entities.types.js';
import { WaveConfig, MAP_CONFIG, MapConfig, getTraversableLaneCount } from '../config/map.config.js';
import { ENEMY_BLUEPRINTS } from '../config/enemies.config.js';

interface ActiveSpawner {
  typeId: string;
  remainingCount: number;
  interval: number;
  timer: number;
  laneCursor: number;
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
   *   + Phân loại rõ: Waves Lính (không chia hết cho 5) và Waves Boss (chia hết cho 5: 15, 20, 25...)
   *   + n = Math.floor(waveNum / 10)
   *   + Waves Lính: Dựa trên extendedWaves của map (luân phiên 2 waves extend riêng của từng map), số lượng quái nhân n lần.
   *   + Waves Boss:
   *     * Số lính waves boss ngang số lính waves lính (danh sách lính nhân n lần, không cộng thêm lính wave 10).
   *     * Boss xuất hiện trên tất cả lane có thể đi được (số lượng Boss = traversableLanes * n).
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

    // --- Waves > 10: Dựa trên extendedWaves riêng của bản đồ (hoặc fallback wave 9) ---
    const n = Math.floor(waveNum / 10);
    const extendedList = this.currentMap?.extendedWaves && this.currentMap.extendedWaves.length > 0
      ? this.currentMap.extendedWaves
      : [mapWaves[8] || mapWaves[mapWaves.length - 1]];

    // Luân phiên 2 waves extend riêng
    const extWaveTemplate = extendedList[(waveNum - 11) % extendedList.length] || extendedList[0];
    const wave10 = mapWaves[9] || mapWaves[mapWaves.length - 1];

    // Tìm boss blueprints từ Wave 10 của map (hoặc boss mặc định)
    const bossEntriesInWave10 = (wave10?.enemies || []).filter((e) => {
      const bp = ENEMY_BLUEPRINTS[e.typeId];
      return bp && bp.tags.includes('BOSS');
    });

    if (waveNum % 5 === 0) {
      // WAVES BOSS:
      // 1. Số lính waves boss ngang số lính waves lính (lấy từ template wave lính mở rộng, lọc bỏ boss)
      const minionEnemies = (extWaveTemplate?.enemies || [])
        .filter((e) => {
          const bp = ENEMY_BLUEPRINTS[e.typeId];
          return !bp || !bp.tags.includes('BOSS');
        })
        .map((entry) => ({
          ...entry,
          count: entry.count * n
        }));

      // 2. Boss xuất hiện trên tất cả lane có thể đi được
      const bossEnemies: { typeId: string; count: number; interval: number; delay: number }[] = [];
      const bossesToSpawn = bossEntriesInWave10.length > 0 ? bossEntriesInWave10 : [{ typeId: 'ANCIENT_TREANT_BOSS', count: 1, interval: 1.0, delay: 0 }];

      for (const bEntry of bossesToSpawn) {
        const bp = ENEMY_BLUEPRINTS[bEntry.typeId];
        const navMode = bp ? bp.navigationMode : 'GROUND_PATH';
        const traversableLanes = getTraversableLaneCount(this.currentMap, navMode);
        // Boss xuất hiện trên tất cả lane: mỗi lane 1 boss x n bậc
        bossEnemies.push({
          typeId: bEntry.typeId,
          count: Math.max(1, traversableLanes * n),
          interval: bEntry.interval || 1.0,
          delay: Math.max(0, (bEntry.delay ?? 6))
        });
      }

      const baseReward = (extWaveTemplate?.rewardGold || 220) + (wave10?.rewardGold || 300);
      return {
        waveNumber: waveNum,
        name: `Đợt ${waveNum}: Đại Trận Chiến Trùm Toàn Tuyến (x${n})`,
        rewardGold: baseReward * n,
        enemies: [...minionEnemies, ...bossEnemies]
      };
    }

    // WAVES LÍNH: Số quái lấy từ extendedWave riêng của map, nhân n lần
    const enemies = (extWaveTemplate?.enemies || []).map((entry) => ({
      ...entry,
      count: entry.count * n
    }));

    return {
      waveNumber: waveNum,
      name: `${extWaveTemplate?.name || `Đợt ${waveNum}`} (x${n})`,
      rewardGold: (extWaveTemplate?.rewardGold || 200) * n,
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
      timer: entry.delay,
      laneCursor: 0
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

          const forcedLane = spawner.laneCursor++;
          const enemy = this.createEnemy(spawner.typeId, forcedLane);
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
    let startX = 40;
    let startY = 160;

    if (bp.navigationMode === 'WATER_PATH') {
      const waterLanesCount =
        this.currentMap.waterLanes && this.currentMap.waterLanes.length > 0
          ? this.currentMap.waterLanes.length
          : 1;
      laneIndex = forcedLaneIndex !== undefined ? forcedLaneIndex : this.waterLaneIndex++ % waterLanesCount;
      const targetLane = this.currentMap.waterLanes?.[laneIndex];
      const spawnPt = targetLane?.[0];
      if (spawnPt && typeof spawnPt === 'object') {
        startX = spawnPt.x;
        startY = spawnPt.y;
      }
    } else if (bp.navigationMode === 'AIR_DIRECT' || bp.navigationMode === 'AIR_WAYPOINTS') {
      const airLanesCount =
        this.currentMap.airLanes && this.currentMap.airLanes.length > 0
          ? this.currentMap.airLanes.length
          : 1;
      laneIndex = forcedLaneIndex !== undefined ? forcedLaneIndex : this.airLaneIndex++ % airLanesCount;
      const targetLane = this.currentMap.airLanes?.[laneIndex];
      const spawnPt = targetLane?.[0];
      if (spawnPt && typeof spawnPt === 'object') {
        startX = spawnPt.x;
        startY = spawnPt.y;
      }
    } else {
      const groundLanesCount =
        this.currentMap.groundLanes && this.currentMap.groundLanes.length > 0
          ? this.currentMap.groundLanes.length
          : 1;
      laneIndex = forcedLaneIndex !== undefined ? forcedLaneIndex : this.groundLaneIndex++ % groundLanesCount;
      const targetLane = this.currentMap.groundLanes?.[laneIndex];
      const spawnPt = targetLane?.[0];
      if (spawnPt && typeof spawnPt === 'object') {
        startX = spawnPt.x;
        startY = spawnPt.y;
      }
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
      ccResistance: bp.ccResistance
        ? {
            hardCC: bp.ccResistance.hardCC ? { ...bp.ccResistance.hardCC } : undefined,
            softCC: bp.ccResistance.softCC ? { ...bp.ccResistance.softCC } : undefined
          }
        : undefined,
      abilities: bp.abilities ? bp.abilities.map((a) => ({ ...a })) : undefined,
      abilityTimers: bp.abilities ? bp.abilities.map((a) => a.interval ?? 0) : undefined,
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
      ccResistance: bp.ccResistance
        ? {
            hardCC: bp.ccResistance.hardCC ? { ...bp.ccResistance.hardCC } : undefined,
            softCC: bp.ccResistance.softCC ? { ...bp.ccResistance.softCC } : undefined
          }
        : undefined,
      abilities: bp.abilities ? bp.abilities.map((a) => ({ ...a })) : undefined,
      abilityTimers: bp.abilities ? bp.abilities.map((a) => a.interval ?? 0) : undefined,
      armorShield: 0,
      maxArmorShield: 0,
      magicShield: 0,
      maxMagicShield: 0,
      damageReductionRatio: 0,
      damageReductionTimer: 0
    };
  }
}
