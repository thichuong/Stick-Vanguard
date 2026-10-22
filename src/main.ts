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
import { MAP_CONFIG } from './config/map.config.js';
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
    this.navSystem = new NavigationSystem();
    this.waveSystem = new WaveSystem();

    this.uiManager = new UIManager(
      this.state,
      () => this.handleCallWave(),
      () => this.restartGame()
    );

    this.bindCanvasEvents();
    requestAnimationFrame((t) => this.loop(t));
  }

  private handleCallWave(): void {
    if (this.state.isGameOver || this.state.isVictory) return;

    if (this.waveSystem.isWaveInProgress) {
      // Early call bonus gold
      const bonus = 25;
      this.state.gold += bonus;
      this.state.addFloatingText(`+${bonus} 🪙 Gọi đợt sớm!`, 500, 80, '#facc15', 15);
      this.waveSystem.currentWaveIndex++;
      this.waveSystem.startWave();
    } else {
      this.waveSystem.startWave();
    }
  }

  private restartGame(): void {
    this.state.reset();
    this.waveSystem = new WaveSystem();
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

      let foundSlot: string | null = null;
      for (const slot of this.state.towerSlots) {
        if (slot.currentTowerId) continue;
        if (Math.hypot(mouseX - slot.x, mouseY - slot.y) <= 24) {
          foundSlot = slot.id;
          break;
        }
      }
      this.state.hoveredSlotId = foundSlot;
    });

    // Right click cancels selection / placement
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.state.activePlacementType = null;
      this.state.selectedSlotId = null;
      this.state.selectedTowerId = null;
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

      // 2. If in Quick-Placement Mode from hotbar/keys
      if (this.state.activePlacementType) {
        for (const slot of this.state.towerSlots) {
          if (slot.currentTowerId) continue;
          const dist = Math.hypot(clickX - slot.x, clickY - slot.y);
          if (dist <= 26) {
            const built = this.state.buildTower(slot.id, this.state.activePlacementType);
            if (built && !e.shiftKey) {
              this.state.activePlacementType = null;
              this.uiManager.updateHotbarVisuals();
            }
            return;
          }
        }
      }

      // 3. Check if clicked on an existing tower
      let clickedTower = false;
      for (const tower of this.state.towers) {
        const dist = Math.hypot(clickX - tower.x, clickY - tower.y);
        if (dist <= 26) {
          this.state.selectedTowerId = tower.id;
          this.state.selectedSlotId = null;
          this.state.activePlacementType = null;
          clickedTower = true;
          break;
        }
      }

      if (clickedTower) return;

      // 4. Check if clicked on an empty slot to open in-place context menu
      let clickedSlot = false;
      for (const slot of this.state.towerSlots) {
        if (slot.currentTowerId) continue;
        const dist = Math.hypot(clickX - slot.x, clickY - slot.y);
        if (dist <= 26) {
          this.state.selectedSlotId = slot.id;
          this.state.selectedTowerId = null;
          this.state.activePlacementType = null;
          clickedSlot = true;
          break;
        }
      }

      if (clickedSlot) return;

      // Clicked outside on empty ground: deselect all
      this.state.selectedSlotId = null;
      this.state.selectedTowerId = null;
      this.state.activePlacementType = null;
      this.uiManager.updateHotbarVisuals();
    });
  }

  private loop(currentTime: number): void {
    if (!this.lastTime) this.lastTime = currentTime;
    const rawDt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Cap dt and apply game speed
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
    // 1. Update Wave Spawning
    this.waveSystem.update(
      dt,
      (newEnemy) => {
        const pathInfo = this.navSystem.getPathInfo(newEnemy.navigationMode);
        newEnemy.pathTotalLength = pathInfo.totalLength;
        this.state.enemies.push(newEnemy);
      },
      (reward) => {
        this.state.gold += reward;
        this.state.addFloatingText(`+${reward} 🪙 Hoàn thành Đợt!`, 500, 100, '#22c55e', 18);
        if (this.waveSystem.currentWaveIndex >= this.waveSystem.getTotalWaves() - 1) {
          this.state.isVictory = true;
        }
      },
      this.state.enemies.length
    );

    // 2. Update Enemies along Path
    for (let i = this.state.enemies.length - 1; i >= 0; i--) {
      const enemy = this.state.enemies[i];

      // Update status effects (DoT damage, slow)
      TargetingRuleEngine.updateStatusEffects(enemy, dt, (dmg, elem) => {
        enemy.hp -= dmg;
        this.state.addFloatingText(`-${dmg}`, enemy.x, enemy.y - 12, ELEMENT_COLORS[elem], 11);
        if (enemy.hp <= 0) enemy.state = 'DEAD';
      });

      if (enemy.hp <= 0 || enemy.state === 'DEAD') {
        // Enemy defeated!
        this.state.gold += enemy.rewardGold;
        this.state.addFloatingText(`+${enemy.rewardGold} 🪙`, enemy.x, enemy.y - 10, '#facc15', 12);
        this.state.addExplosionParticles(enemy.x, enemy.y, ELEMENT_COLORS[enemy.elementalProfile.primaryElement], 8);
        this.state.enemies.splice(i, 1);
        continue;
      }

      // If engaged in melee combat with a soldier, enemy stops progressing along the path
      if (enemy.state === 'ENGAGED' || enemy.state === 'ATTACKING') {
        continue;
      }

      // Move along designated path
      enemy.pathDistance += enemy.speed * dt;
      const nav = this.navSystem.getPointAlongPath(enemy.navigationMode, enemy.pathDistance, this.totalAnimTime);

      enemy.x = nav.position.x;
      enemy.y = nav.position.y;
      enemy.facing = nav.facing;

      // Check if enemy reached the player base
      if (nav.isFinished) {
        const damageToBase = enemy.tags.includes('BOSS') ? 5 : 1;
        this.state.lives -= damageToBase;
        this.state.addFloatingText(`-${damageToBase} ❤️`, MAP_CONFIG.playerBase.x, MAP_CONFIG.playerBase.y - 20, '#ef4444', 16);
        this.state.addExplosionParticles(MAP_CONFIG.playerBase.x, MAP_CONFIG.playerBase.y, '#ef4444', 15);
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
            this.state.addFloatingText('MIỄN NHIỄM!', en.x, en.y - 14, '#94a3b8', 12);
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

    // 4. Update Soldiers and 1v1 Melee Combat
    CombatSystem.updateCombat(this.state.soldiers, this.state.enemies, dt, (evt: CombatEvent) => {
      if (evt.type === 'MELEE_HIT' || evt.type === 'RANGED_JAVELIN') {
        const color = ELEMENT_COLORS[evt.element as ElementType] || '#ffffff';
        if (evt.isImmune) {
          this.state.addFloatingText('MIỄN NHIỄM!', evt.x, evt.y - 12, '#94a3b8', 12);
        } else {
          this.state.addFloatingText(`${evt.label ? evt.label + ' ' : ''}-${evt.damage}`, evt.x, evt.y - 12, color, 12);
        }
        this.state.addExplosionParticles(evt.x, evt.y, color, 4);
      }
    });

    // 5. Update Roadside Towers
    TowerSystem.updateTowers(this.state.towers, this.state.enemies, dt, (proj) => {
      this.state.projectiles.push(proj);
    });

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

    // 1. Map & Road & River
    MapRenderer.renderBackground(ctx, this.totalAnimTime);

    // 2. Slots
    MapRenderer.renderSlots(
      ctx,
      this.state.towerSlots,
      this.state.selectedSlotId,
      this.state.activePlacementType,
      this.state.hoveredSlotId,
      this.totalAnimTime
    );

    // 3. Traps and Towers
    TowerRenderer.renderTowers(ctx, this.state.towers, this.state.selectedTowerId, this.totalAnimTime);

    // 4. Ground/Water Enemies
    for (const enemy of this.state.enemies) {
      if (enemy.movementType !== 'FLY') {
        StickmanRenderer.renderEnemy(ctx, enemy, this.totalAnimTime);
      }
    }

    // 5. Soldiers
    for (const soldier of this.state.soldiers) {
      StickmanRenderer.renderSoldier(ctx, soldier, this.totalAnimTime);
    }

    // 6. Flying Enemies (drawn above ground units)
    for (const enemy of this.state.enemies) {
      if (enemy.movementType === 'FLY') {
        StickmanRenderer.renderEnemy(ctx, enemy, this.totalAnimTime);
      }
    }

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
