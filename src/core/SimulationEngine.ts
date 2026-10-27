import { GameState } from './GameState.js';
import { NavigationSystem } from '../systems/NavigationSystem.js';
import { WaveSystem } from '../systems/WaveSystem.js';
import { TowerSystem } from '../systems/TowerSystem.js';
import { CombatSystem, CombatEvent } from '../systems/CombatSystem.js';
import { TrapSystem } from '../systems/TrapSystem.js';
import { ProjectileSystem } from '../systems/ProjectileSystem.js';
import { TargetingRuleEngine } from '../systems/TargetingRuleEngine.js';
import { EnemySkillSystem } from '../systems/EnemySkillSystem.js';
import { SpatialIndex } from './SpatialIndex.js';
import { SimWorkerBridge } from './SimWorkerBridge.js';
import { WasmBridge } from './WasmBridge.js';
import { swapRemove, particlePool, floatingTextPool } from './ObjectPool.js';
import { ELEMENT_COLORS } from '../config/elements.config.js';
import { ElementType } from '../types/elements.types.js';
import { SoundSystem } from '../systems/SoundSystem.js';

export class SimulationEngine {
  public static readonly FIXED_DT = 1 / 60; // 60Hz fixed simulation step
  private static readonly MAX_SUB_STEPS = 4;

  public spatialIndex: SpatialIndex;
  public workerBridge: SimWorkerBridge;
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
    this.workerBridge = new SimWorkerBridge();
    this.workerBridge.syncPaths(this.navSystem);
    this.wasmBridge = WasmBridge.getInstance();
    this.wasmBridge.syncPaths(this.navSystem);
  }

  public onMapChanged(): void {
    this.workerBridge.syncPaths(this.navSystem);
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
   * Run one discrete simulation step of fixedDt
   */
  public tick(dt: number): void {
    // Sync settings to engine
    this.waveSystem.setTotalWaves(this.state.customTotalWaves);
    TargetingRuleEngine.globalDamageMultiplier = this.state.damageMultiplier;

    // 0. Record previous positions for smooth render interpolation
    this.recordPreviousPositions();

    // 1. Rebuild spatial hash grid for all alive enemies
    this.spatialIndex.rebuild(this.state.enemies);

    // 2. Wave System Spawning
    this.waveSystem.update(
      dt,
      (newEnemy) => {
        const pathInfo = this.navSystem.getPathInfo(newEnemy.navigationMode, newEnemy.laneIndex ?? 0);
        newEnemy.pathTotalLength = pathInfo.totalLength;
        this.navSystem.updateEnemyTransform(newEnemy, this.totalAnimTime);
        newEnemy.prevX = newEnemy.x;
        newEnemy.prevY = newEnemy.y;
        this.state.enemies.push(newEnemy);
        if (this.wasmBridge.isAvailable()) {
          this.wasmBridge.spawnEnemy(newEnemy);
        }
      },
      (reward) => {
        const scaledReward = Math.max(1, Math.round(reward * this.state.goldMultiplier));
        this.state.gold += scaledReward;
        this.state.addFloatingText(`+${scaledReward} 🪙 Hoàn thành Đợt!`, 500, 100, '#22c55e', 18);
        SoundSystem.playWaveComplete();
        if (this.waveSystem.currentWaveIndex >= this.waveSystem.getTotalWaves() - 1) {
          this.state.isVictory = true;
          SoundSystem.playVictory();
        }
      },
      this.state.enemies.length
    );

    // 3. Enemy Abilities & Aura Updates
    EnemySkillSystem.update(
      this.state.enemies,
      this.state.towers,
      this.state,
      dt,
      this.navSystem,
      this.waveSystem,
      this.totalAnimTime,
      this.spatialIndex
    );

    // 4. Update Enemies Along Path & Handle Deaths / Base Damage
    this.updateEnemies(dt);

    // Rebuild spatial grid after deaths/movements for accurate combat targeting
    this.spatialIndex.rebuild(this.state.enemies);
    if (this.wasmBridge.isAvailable()) {
      this.wasmBridge.rebuildSpatialGrid();
    }

    // 5. Update Traps on path and water
    const activeTraps = this.state.towers.filter((t) => t.placement !== 'ROADSIDE');
    TrapSystem.updateTraps(activeTraps, this.state.enemies, dt, (res, trap) => {
      SoundSystem.playTrapTrigger(trap.type as any);
      this.state.addExplosionParticles(res.triggeredAt.x, res.triggeredAt.y, ELEMENT_COLORS[trap.element], 14);
      for (const hit of res.affectedEnemies) {
        const en = this.spatialIndex.getEnemyById(hit.enemyId);
        if (en) {
          if (hit.isImmune) {
            this.state.addFloatingText('MIỄN NHIỄM!', en.x, en.y - 14, '#94a3b8', 13);
          } else {
            this.state.addFloatingText(
              `${hit.label ? hit.label + ' ' : ''}-${hit.damage}`,
              en.x,
              en.y - 14,
              ELEMENT_COLORS[trap.element],
              13
            );
          }
        }
      }
    }, this.spatialIndex);

    // 6. Update Soldiers and Combat
    CombatSystem.updateCombat(this.state.soldiers, this.state.enemies, dt, (evt: CombatEvent) => {
      if (evt.type === 'MELEE_HIT' || evt.type === 'RANGED_JAVELIN') {
        const color = ELEMENT_COLORS[evt.element as ElementType] || '#ffffff';
        if (evt.type === 'RANGED_JAVELIN') {
          SoundSystem.playShoot('JAVELIN');
        }
        SoundSystem.playHit({
          isImmune: evt.isImmune,
          isReactionOrWeakness: !!evt.label && !evt.isImmune,
          element: evt.element,
          isMelee: evt.type === 'MELEE_HIT'
        });

        if (evt.isImmune) {
          this.state.addFloatingText('MIỄN NHIỄM!', evt.x, evt.y - 12, '#94a3b8', 13);
        } else {
          this.state.addFloatingText(`${evt.label ? evt.label + ' ' : ''}-${evt.damage}`, evt.x, evt.y - 12, color, 13);
        }
        this.state.addExplosionParticles(evt.x, evt.y, color, 4);
      } else if (evt.type === 'SOLDIER_DEATH') {
        SoundSystem.playSoldierDeath();
        this.state.handleSoldierDeath(evt.targetId);
      }
    }, this.spatialIndex);

    // 7. Update Towers (Targeting & Projectile firing)
    TowerSystem.updateTowers(
      this.state.towers,
      this.state.enemies,
      dt,
      (proj) => {
        const sourceTower = this.state.towers.find((t) => t.id === proj.sourceTowerId);
        const shootType = sourceTower?.type === 'ARTILLERY'
          ? 'ARTILLERY'
          : sourceTower?.type === 'MAGE'
          ? 'MAGE'
          : 'ARCHER';
        SoundSystem.playShoot(shootType);
        proj.prevX = proj.x;
        proj.prevY = proj.y;
        this.state.projectiles.push(proj);
      },
      (hit) => {
        SoundSystem.playHit({ element: 'MAGE' });
        this.state.addFloatingText(`-${hit.damage}`, hit.enemy.x, hit.enemy.y - 14, hit.color, 13);
        this.state.addExplosionParticles(hit.enemy.x, hit.enemy.y, hit.color, 4);
      },
      this.spatialIndex
    );

    // 8. Update Projectiles
    ProjectileSystem.updateProjectiles(
      this.state.projectiles,
      this.state.enemies,
      dt,
      (params) => {
        SoundSystem.playHit({
          isImmune: params.isImmune,
          isReactionOrWeakness: !!params.label && !params.isImmune
        });
        if (params.isImmune) {
          this.state.addFloatingText('MIỄN NHIỄM!', params.x, params.y - 14, '#94a3b8', 13);
        } else {
          this.state.addFloatingText(
            `${params.label ? params.label + ' ' : ''}-${params.damage}`,
            params.x,
            params.y - 14,
            params.color,
            13
          );
        }
        this.state.addExplosionParticles(params.x, params.y, params.color, 6);
      },
      (x, y, color) => {
        SoundSystem.playExplosion('SMALL');
        this.state.addExplosionParticles(x, y, color, 16);
      },
      this.spatialIndex
    );

    // 9. Update Particles using O(1) swapRemove & pool recycling
    for (let i = this.state.particles.length - 1; i >= 0; i--) {
      const p = this.state.particles[i];
      p.prevX = p.x;
      p.prevY = p.y;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.lifeTime -= dt;
      if (p.lifeTime <= 0) {
        particlePool.release(p);
        swapRemove(this.state.particles, i);
      }
    }

    // 10. Update Floating Texts using O(1) swapRemove & pool recycling
    for (let i = this.state.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.state.floatingTexts[i];
      t.y -= 22 * dt;
      t.lifeTime -= dt;
      if (t.lifeTime <= 0) {
        floatingTextPool.release(t);
        swapRemove(this.state.floatingTexts, i);
      }
    }
  }

  private recordPreviousPositions(): void {
    for (let i = 0; i < this.state.enemies.length; i++) {
      const e = this.state.enemies[i];
      e.prevX = e.x;
      e.prevY = e.y;
    }
    for (let i = 0; i < this.state.soldiers.length; i++) {
      const s = this.state.soldiers[i];
      s.prevX = s.x;
      s.prevY = s.y;
    }
    for (let i = 0; i < this.state.projectiles.length; i++) {
      const p = this.state.projectiles[i];
      p.prevX = p.x;
      p.prevY = p.y;
    }
  }

  private updateEnemies(dt: number): void {
    const basePos = this.state.currentMap.playerBases[0] || { x: 500, y: 325 };
    const useWasm = this.wasmBridge.isAvailable();

    if (useWasm) {
      this.wasmBridge.stepSimulation(dt, this.totalAnimTime);
    }

    for (let i = this.state.enemies.length - 1; i >= 0; i--) {
      const enemy = this.state.enemies[i];

      TargetingRuleEngine.updateStatusEffects(enemy, dt, (dmg, elem) => {
        TargetingRuleEngine.applyDamageToEnemy(enemy, dmg, elem);
        this.state.addFloatingText(`-${dmg}`, enemy.x, enemy.y - 12, ELEMENT_COLORS[elem], 13);
        if (enemy.hp <= 0) enemy.state = 'DEAD';
      });

      // Enemy Death Handling
      if (enemy.hp <= 0 || enemy.state === 'DEAD') {
        const tier = enemy.tags.includes('BOSS') ? 'BOSS' : enemy.tags.includes('ELITE') ? 'ELITE' : 'NORMAL';
        SoundSystem.playEnemyDeath(tier);

        const scaledGold = enemy.rewardGold > 0 ? Math.max(1, Math.round(enemy.rewardGold * this.state.goldMultiplier)) : 0;
        this.state.gold += scaledGold;
        if (scaledGold > 0) {
          this.state.addFloatingText(`+${scaledGold} 🪙`, enemy.x, enemy.y - 10, '#facc15', 14);
        }
        this.state.addExplosionParticles(enemy.x, enemy.y, ELEMENT_COLORS[enemy.elementalProfile.primaryElement], 8);

        EnemySkillSystem.handleDeath(enemy, this.state, this.navSystem, this.waveSystem, this.totalAnimTime);

        if (useWasm) {
          this.wasmBridge.removeId(enemy.id);
        }
        swapRemove(this.state.enemies, i);
        continue;
      }

      if (enemy.state === 'ENGAGED' || enemy.state === 'ATTACKING') {
        if (useWasm) {
          this.wasmBridge.updateEnemyStatus(enemy);
        }
        continue;
      }

      // Move along path in-place
      enemy.pathDistance += enemy.speed * dt;
      let isFinished = this.navSystem.updateEnemyTransform(enemy, this.totalAnimTime);

      if (useWasm) {
        this.wasmBridge.updateEnemyStatus(enemy);
        if (this.wasmBridge.hasEnemyFinished(enemy.id)) {
          isFinished = true;
        }
      }

      if (isFinished) {
        const isBoss = enemy.tags.includes('BOSS');
        const damageToBase = isBoss ? 5 : 1;
        this.state.lives -= damageToBase;
        SoundSystem.playBaseDamaged(isBoss);
        const hitX = enemy.x || basePos.x;
        const hitY = enemy.y || basePos.y;
        this.state.addFloatingText(`-${damageToBase} ❤️`, hitX, hitY - 20, '#ef4444', 16);
        this.state.addExplosionParticles(hitX, hitY, '#ef4444', 15);

        if (useWasm) {
          this.wasmBridge.removeId(enemy.id);
        }
        swapRemove(this.state.enemies, i);

        if (this.state.lives <= 0) {
          this.state.lives = 0;
          this.state.isGameOver = true;
          SoundSystem.playGameOver();
        }
      }
    }
  }
}

