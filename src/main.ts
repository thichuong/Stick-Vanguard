import { GameState } from './core/GameState.js';
import { NavigationSystem } from './systems/NavigationSystem.js';
import { WaveSystem } from './systems/WaveSystem.js';
import { TowerSystem } from './systems/TowerSystem.js';
import { CombatSystem, CombatEvent } from './systems/CombatSystem.js';
import { TrapSystem } from './systems/TrapSystem.js';
import { ProjectileSystem } from './systems/ProjectileSystem.js';
import { TargetingRuleEngine } from './systems/TargetingRuleEngine.js';
import { MapRenderer } from './render/MapRenderer.js';
import { StickmanRenderer } from './render/StickmanRenderer.js';
import { TowerRenderer } from './render/TowerRenderer.js';
import { UIManager } from './ui/UIManager.js';
import { MAPS_CONFIG } from './config/map.config.js';
import { ELEMENT_COLORS } from './config/elements.config.js';
import { ElementType } from './types/elements.types.js';

class GameApp {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private state: GameState;
  private navSystem: NavigationSystem;
  private waveSystem: WaveSystem;
  private uiManager: UIManager;
  private lastTime: number = 0;
  private totalAnimTime: number = 0;

  constructor() {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.state = new GameState();
    this.state.loadSettingsFromStorage();
    TargetingRuleEngine.globalDamageMultiplier = this.state.damageMultiplier;

    this.navSystem = new NavigationSystem(this.state.currentMap);
    this.waveSystem = new WaveSystem(this.state.currentMap, this.state.customTotalWaves);

    this.uiManager = new UIManager(
      this.state,
      () => this.handleCallWave(),
      () => this.restartGame(),
      (mapId: string) => this.handleSelectMap(mapId)
    );

    this.setupResize();
    this.bindCanvasEvents();
    requestAnimationFrame((t) => this.loop(t));
  }

  private handleSelectMap(mapId: string): void {
    const found = MAPS_CONFIG.find((m) => m.id === mapId);
    if (!found) return;

    const keepWaves = this.state.customTotalWaves;
    const keepGoldMult = this.state.goldMultiplier;
    const keepDmgMult = this.state.damageMultiplier;
    const keepSpeed = this.state.gameSpeed;

    this.state.setMap(mapId);
    this.state.customTotalWaves = keepWaves;
    this.state.goldMultiplier = keepGoldMult;
    this.state.damageMultiplier = keepDmgMult;
    this.state.gameSpeed = keepSpeed;
    TargetingRuleEngine.globalDamageMultiplier = keepDmgMult;

    this.state.saveSettingsToStorage();

    this.navSystem.setMap(this.state.currentMap);
    this.waveSystem.setMap(this.state.currentMap);
    this.waveSystem.setTotalWaves(keepWaves);
    this.uiManager.updateHotbarVisuals();
    this.state.addFloatingText(`Bản đồ: ${found.name}`, 500, 100, '#38bdf8', 18);
  }

  private setupResize(): void {
    const stage = document.getElementById('canvas-stage');
    const wrapper = document.getElementById('canvas-wrapper');
    if (!stage || !wrapper) return;

    const resize = () => {
      const stageW = stage.clientWidth - 12;
      const stageH = stage.clientHeight - 12;
      if (stageW <= 0 || stageH <= 0) return;

      const targetRatio = 1000 / 650;
      let w = stageW;
      let h = stageW / targetRatio;

      if (h > stageH) {
        h = stageH;
        w = stageH * targetRatio;
      }

      wrapper.style.width = `${Math.floor(w)}px`;
      wrapper.style.height = `${Math.floor(h)}px`;

      this.uiManager?.handleResize();
    };

    window.addEventListener('resize', resize);
    const observer = new ResizeObserver(() => resize());
    observer.observe(stage);
    resize();
  }

  private handleCallWave(): void {
    if (this.state.isGameOver || this.state.isVictory) return;

    if (this.waveSystem.isWaveInProgress) {
      // Đã ở đợt quái cuối cùng (đầy waves) thì không thể gọi thêm đợt nữa
      if (this.waveSystem.currentWaveIndex >= this.waveSystem.getTotalWaves() - 1) {
        return;
      }
      const baseBonus = 25;
      const bonus = Math.max(1, Math.round(baseBonus * this.state.goldMultiplier));
      this.state.gold += bonus;
      this.state.addFloatingText(`+${bonus} 🪙 Gọi đợt sớm!`, 500, 80, '#facc15', 15);
      this.waveSystem.currentWaveIndex++;
      this.waveSystem.startWave();
    } else {
      if (this.waveSystem.currentWaveIndex >= this.waveSystem.getTotalWaves()) {
        return;
      }
      this.waveSystem.startWave();
    }

    const currentWave = this.waveSystem.currentWaveIndex + 1;
    if (currentWave > 10) {
      const bonusPct = (currentWave - 10) * 10;
      this.state.addFloatingText(`⚠️ Đợt ${currentWave}: Quái tăng +${bonusPct}% Máu!`, 480, 50, '#ef4444', 18);
    }
  }

  private restartGame(): void {
    const keepWaves = this.state.customTotalWaves;
    const keepGoldMult = this.state.goldMultiplier;
    const keepDmgMult = this.state.damageMultiplier;
    const keepSpeed = this.state.gameSpeed;

    this.state.reset();
    this.state.customTotalWaves = keepWaves;
    this.state.goldMultiplier = keepGoldMult;
    this.state.damageMultiplier = keepDmgMult;
    this.state.gameSpeed = keepSpeed;
    TargetingRuleEngine.globalDamageMultiplier = keepDmgMult;

    this.navSystem.setMap(this.state.currentMap);
    this.waveSystem.setMap(this.state.currentMap);
    this.waveSystem.setTotalWaves(keepWaves);
  }

  private bindCanvasEvents(): void {
    // Mouse move tracking
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;
      this.state.mousePos = { x: mouseX, y: mouseY };

      let foundTower: string | null = null;
      for (const tower of this.state.towers) {
        if (Math.hypot(mouseX - tower.x, mouseY - tower.y) <= 22) {
          foundTower = tower.id;
          break;
        }
      }
      this.state.hoveredTowerId = foundTower;
    });

    // Right click cancels selection / placement
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.state.activePlacementType = null;
      this.state.selectedSlotId = null;
      this.state.selectedTowerId = null;
      this.state.selectedBuildPoint = null;
      this.state.isSettingRallyPoint = false;
      this.uiManager.updateHotbarVisuals();
    });

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      // 1. If currently setting rally point for a barracks
      if (this.state.isSettingRallyPoint && this.state.selectedTowerId) {
        this.state.setRallyPoint(this.state.selectedTowerId, clickX, clickY);
        return;
      }

      // 2. If in Quick-Placement Mode from hotbar/keys: build directly at (clickX, clickY)
      if (this.state.activePlacementType) {
        const built = this.state.buildTowerAt(clickX, clickY, this.state.activePlacementType);
        if (built && !e.shiftKey) {
          this.state.activePlacementType = null;
          this.uiManager.updateHotbarVisuals();
        }
        return;
      }

      // 3. Check if clicked on an existing tower
      let clickedTower = false;
      for (const tower of this.state.towers) {
        const dist = Math.hypot(clickX - tower.x, clickY - tower.y);
        if (dist <= 24) {
          this.state.selectedTowerId = tower.id;
          this.state.selectedSlotId = null;
          this.state.selectedBuildPoint = null;
          this.state.activePlacementType = null;
          clickedTower = true;
          break;
        }
      }

      if (clickedTower) return;

      // 4. Clicked on an empty spot on the map: evaluate terrain & set selectedBuildPoint
      const valTrap = this.state.validatePlacement(clickX, clickY, 'TRAP_GENERIC');
      const valTower = this.state.validatePlacement(clickX, clickY, 'TOWER_GENERIC');

      if (valTrap.valid) {
        // Point is on road or water: offer traps
        this.state.selectedBuildPoint = {
          x: Math.round(clickX),
          y: Math.round(clickY),
          terrain: valTrap.placement === 'WATER_TRAP' ? 'WATER' : 'ROAD',
          validFor: 'TRAP',
          placement: valTrap.placement
        };
        this.state.selectedTowerId = null;
        this.state.activePlacementType = null;
        this.uiManager.updateHotbarVisuals();
        return;
      } else if (valTower.valid) {
        // Point is on land: offer towers
        this.state.selectedBuildPoint = {
          x: Math.round(clickX),
          y: Math.round(clickY),
          terrain: 'LAND',
          validFor: 'TOWER',
          placement: 'ROADSIDE'
        };
        this.state.selectedTowerId = null;
        this.state.activePlacementType = null;
        this.uiManager.updateHotbarVisuals();
        return;
      }

      // Clicked outside valid areas (e.g. out of bounds or overlapping)
      this.state.selectedSlotId = null;
      this.state.selectedTowerId = null;
      this.state.selectedBuildPoint = null;
      this.state.activePlacementType = null;
      this.uiManager.updateHotbarVisuals();
    });
  }

  private loop(currentTime: number): void {
    if (!this.lastTime) this.lastTime = currentTime;
    const rawDt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    const dt = Math.min(rawDt, 0.1) * (this.state.isPaused ? 0 : this.state.gameSpeed);
    this.totalAnimTime += dt;

    if (!this.state.isPaused && !this.state.isGameOver && !this.state.isVictory) {
      this.update(dt);
    }

    this.render();

    this.uiManager.updateHUD(
      this.waveSystem.currentWaveIndex + 1,
      this.waveSystem.getTotalWaves(),
      this.waveSystem.isWaveInProgress
    );

    requestAnimationFrame((t) => this.loop(t));
  }

  private update(dt: number): void {
    // Sync settings to engine
    this.waveSystem.setTotalWaves(this.state.customTotalWaves);
    TargetingRuleEngine.globalDamageMultiplier = this.state.damageMultiplier;

    // 1. Update Wave Spawning
    this.waveSystem.update(
      dt,
      (newEnemy) => {
        const pathInfo = this.navSystem.getPathInfo(newEnemy.navigationMode, newEnemy.laneIndex ?? 0);
        newEnemy.pathTotalLength = pathInfo.totalLength;
        this.state.enemies.push(newEnemy);
      },
      (reward) => {
        const scaledReward = Math.max(1, Math.round(reward * this.state.goldMultiplier));
        this.state.gold += scaledReward;
        this.state.addFloatingText(`+${scaledReward} 🪙 Hoàn thành Đợt!`, 500, 100, '#22c55e', 18);
        if (this.waveSystem.currentWaveIndex >= this.waveSystem.getTotalWaves() - 1) {
          this.state.isVictory = true;
        }
      },
      this.state.enemies.length
    );

    // 2. Update Enemies along Path
    const basePos = this.state.currentMap.playerBase;
    for (let i = this.state.enemies.length - 1; i >= 0; i--) {
      const enemy = this.state.enemies[i];

      TargetingRuleEngine.updateStatusEffects(enemy, dt, (dmg, elem) => {
        enemy.hp -= dmg;
        this.state.addFloatingText(`-${dmg}`, enemy.x, enemy.y - 12, ELEMENT_COLORS[elem], 13);
        if (enemy.hp <= 0) enemy.state = 'DEAD';
      });

      // Enemy Death Handling (Gold Multiplier & Death-Spawn / Split)
      if (enemy.hp <= 0 || enemy.state === 'DEAD') {
        const scaledGold = enemy.rewardGold > 0 ? Math.max(1, Math.round(enemy.rewardGold * this.state.goldMultiplier)) : 0;
        this.state.gold += scaledGold;
        if (scaledGold > 0) {
          this.state.addFloatingText(`+${scaledGold} 🪙`, enemy.x, enemy.y - 10, '#facc15', 14);
        }
        this.state.addExplosionParticles(enemy.x, enemy.y, ELEMENT_COLORS[enemy.elementalProfile.primaryElement], 8);

        // Check Death-Spawn / Split Mechanic
        if (enemy.deathSpawn) {
          const cfg = enemy.deathSpawn;
          this.state.addFloatingText('💥 Phân tách!', enemy.x, enemy.y - 24, '#f97316', 15);
          for (let s = 0; s < cfg.count; s++) {
            const offset = (s - (cfg.count - 1) / 2) * 12;
            const childDist = Math.max(0, enemy.pathDistance + offset);
            const childNav = this.navSystem.getPointAlongPath(
              enemy.navigationMode,
              childDist,
              this.totalAnimTime,
              enemy.laneIndex ?? 0
            );
            const childEnemy = this.waveSystem.spawnMinionAt(
              cfg.typeId,
              childDist,
              childNav.position.x,
              childNav.position.y,
              enemy.laneIndex ?? 0
            );
            if (childEnemy) {
              const pathInfo = this.navSystem.getPathInfo(childEnemy.navigationMode, childEnemy.laneIndex ?? 0);
              childEnemy.pathTotalLength = pathInfo.totalLength;
              childEnemy.facing = childNav.facing;
              this.state.enemies.push(childEnemy);
              this.state.addExplosionParticles(childNav.position.x, childNav.position.y, '#f97316', 5);
            }
          }
        }

        this.state.enemies.splice(i, 1);
        continue;
      }

      // Enemy Summoning Mechanic along path
      if (enemy.summonConfig && (enemy.state === 'WALKING' || enemy.state === 'SWIMMING' || enemy.state === 'FLYING' || enemy.state === 'ENGAGED' || enemy.state === 'ATTACKING')) {
        enemy.summonTimer = (enemy.summonTimer ?? enemy.summonConfig.interval) - dt;
        if (enemy.summonTimer <= 0) {
          enemy.summonTimer = enemy.summonConfig.interval;
          const sCfg = enemy.summonConfig;
          this.state.addFloatingText('🔮 Triệu hồi!', enemy.x, enemy.y - 20, '#a855f7', 15);
          this.state.addExplosionParticles(enemy.x, enemy.y, '#a855f7', 10);

          for (let s = 0; s < sCfg.count; s++) {
            const offset = (s + 1) * 14;
            const minionDist = Math.max(0, enemy.pathDistance - offset);
            const mNav = this.navSystem.getPointAlongPath(
              enemy.navigationMode,
              minionDist,
              this.totalAnimTime,
              enemy.laneIndex ?? 0
            );
            const minion = this.waveSystem.spawnMinionAt(
              sCfg.typeId,
              minionDist,
              mNav.position.x,
              mNav.position.y,
              enemy.laneIndex ?? 0
            );
            if (minion) {
              const pathInfo = this.navSystem.getPathInfo(minion.navigationMode, minion.laneIndex ?? 0);
              minion.pathTotalLength = pathInfo.totalLength;
              minion.facing = mNav.facing;
              this.state.enemies.push(minion);
            }
          }
        }
      }

      if (enemy.state === 'ENGAGED' || enemy.state === 'ATTACKING') {
        continue;
      }

      enemy.pathDistance += enemy.speed * dt;
      const nav = this.navSystem.getPointAlongPath(
        enemy.navigationMode,
        enemy.pathDistance,
        this.totalAnimTime,
        enemy.laneIndex ?? 0
      );

      enemy.x = nav.position.x;
      enemy.y = nav.position.y;
      enemy.facing = nav.facing;

      if (nav.isFinished) {
        const damageToBase = enemy.tags.includes('BOSS') ? 5 : 1;
        this.state.lives -= damageToBase;
        this.state.addFloatingText(`-${damageToBase} ❤️`, basePos.x, basePos.y - 20, '#ef4444', 16);
        this.state.addExplosionParticles(basePos.x, basePos.y, '#ef4444', 15);
        this.state.enemies.splice(i, 1);

        if (this.state.lives <= 0) {
          this.state.lives = 0;
          this.state.isGameOver = true;
        }
      }
    }

    // 3. Update Traps on path and water
    const activeTraps = this.state.towers.filter((t) => t.placement !== 'ROADSIDE');
    TrapSystem.updateTraps(activeTraps, this.state.enemies, dt, (res, trap) => {
      this.state.addExplosionParticles(res.triggeredAt.x, res.triggeredAt.y, ELEMENT_COLORS[trap.element], 14);
      for (const hit of res.affectedEnemies) {
        const en = this.state.enemies.find((e) => e.id === hit.enemyId);
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
    });

    // 4. Update Soldiers and Combat
    CombatSystem.updateCombat(this.state.soldiers, this.state.enemies, dt, (evt: CombatEvent) => {
      if (evt.type === 'MELEE_HIT' || evt.type === 'RANGED_JAVELIN') {
        const color = ELEMENT_COLORS[evt.element as ElementType] || '#ffffff';
        if (evt.isImmune) {
          this.state.addFloatingText('MIỄN NHIỄM!', evt.x, evt.y - 12, '#94a3b8', 13);
        } else {
          this.state.addFloatingText(`${evt.label ? evt.label + ' ' : ''}-${evt.damage}`, evt.x, evt.y - 12, color, 13);
        }
        this.state.addExplosionParticles(evt.x, evt.y, color, 4);
      }
    });

    // 5. Update Towers
    TowerSystem.updateTowers(
      this.state.towers,
      this.state.enemies,
      dt,
      (proj) => {
        this.state.projectiles.push(proj);
      },
      (hit) => {
        this.state.addFloatingText(`-${hit.damage}`, hit.enemy.x, hit.enemy.y - 14, hit.color, 13);
        this.state.addExplosionParticles(hit.enemy.x, hit.enemy.y, hit.color, 4);
      }
    );

    // 6. Update Projectiles
    ProjectileSystem.updateProjectiles(
      this.state.projectiles,
      this.state.enemies,
      dt,
      (params) => {
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
        this.state.addExplosionParticles(x, y, color, 16);
      }
    );

    // 7. Update Particles
    for (let i = this.state.particles.length - 1; i >= 0; i--) {
      const p = this.state.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.lifeTime -= dt;
      if (p.lifeTime <= 0) this.state.particles.splice(i, 1);
    }

    // 8. Update Floating Texts
    for (let i = this.state.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.state.floatingTexts[i];
      t.y -= 22 * dt;
      t.lifeTime -= dt;
      if (t.lifeTime <= 0) this.state.floatingTexts.splice(i, 1);
    }
  }

  private render(): void {
    const { ctx } = this;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Map & Road & River of current active map
    MapRenderer.renderBackground(ctx, this.totalAnimTime, this.state.currentMap);

    // 2. Traps and Towers
    TowerRenderer.renderTowers(ctx, this.state.towers, this.state.selectedTowerId, this.totalAnimTime);

    // 3. Ground/Water Enemies
    for (const enemy of this.state.enemies) {
      if (enemy.movementType !== 'FLY') {
        StickmanRenderer.renderEnemy(ctx, enemy, this.totalAnimTime);
      }
    }

    // 4. Soldiers
    for (const soldier of this.state.soldiers) {
      StickmanRenderer.renderSoldier(ctx, soldier, this.totalAnimTime);
    }

    // 5. Flying Enemies
    for (const enemy of this.state.enemies) {
      if (enemy.movementType === 'FLY') {
        StickmanRenderer.renderEnemy(ctx, enemy, this.totalAnimTime);
      }
    }

    // 6. Free Placement Cursor Feedback & Range Preview
    MapRenderer.renderPlacementFeedback(ctx, this.state, this.totalAnimTime);

    // 7. Projectiles
    TowerRenderer.renderProjectiles(ctx, this.state.projectiles);

    // 8. Particles & Explosions
    TowerRenderer.renderParticles(ctx, this.state.particles);

    // 9. Floating Texts
    TowerRenderer.renderFloatingTexts(ctx, this.state.floatingTexts);
  }
}

// Start application
window.addEventListener('DOMContentLoaded', () => {
  new GameApp();
});
