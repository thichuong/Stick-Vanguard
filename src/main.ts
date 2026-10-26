import { GameState } from './core/GameState.js';
import { NavigationSystem } from './systems/NavigationSystem.js';
import { WaveSystem } from './systems/WaveSystem.js';
import { SimulationEngine } from './core/SimulationEngine.js';
import { TargetingRuleEngine } from './systems/TargetingRuleEngine.js';
import { MapRenderer } from './render/MapRenderer.js';
import { StickmanRenderer } from './render/StickmanRenderer.js';
import { TowerRenderer } from './render/TowerRenderer.js';
import { UIManager } from './ui/UIManager.js';
import { MAPS_CONFIG } from './config/map.config.js';
import { SoundSystem } from './systems/SoundSystem.js';

class GameApp {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private state: GameState;
  private navSystem: NavigationSystem;
  private waveSystem: WaveSystem;
  private simEngine: SimulationEngine;
  private uiManager: UIManager;
  private lastTime: number = 0;

  constructor() {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.state = new GameState();
    this.state.loadSettingsFromStorage();
    TargetingRuleEngine.globalDamageMultiplier = this.state.damageMultiplier;

    this.navSystem = new NavigationSystem(this.state.currentMap);
    this.waveSystem = new WaveSystem(this.state.currentMap, this.state.customTotalWaves);
    this.simEngine = new SimulationEngine(this.state, this.navSystem, this.waveSystem);

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
    this.simEngine.onMapChanged();
    MapRenderer.clearCache();

    this.uiManager.updateHotbarVisuals();
    this.state.addFloatingText(`Bản đồ: ${found.name}`, 500, 100, '#38bdf8', 18);
  }

  private setupResize(): void {
    const stage = document.getElementById('canvas-viewport') || document.getElementById('canvas-stage');
    const wrapper = document.getElementById('canvas-wrapper');
    if (!stage || !wrapper) return;

    const resize = () => {
      const stageW = stage.clientWidth - 16;
      const stageH = stage.clientHeight - 16;
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

    SoundSystem.playWaveStart();

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
    this.simEngine.onMapChanged();
    MapRenderer.clearCache();
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
      this.state.hoveredBuildTowerType = null;
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
          this.uiManager.clearSelectedSoldier();
          clickedTower = true;
          break;
        }
      }

      if (clickedTower) return;

      // 3b. Check if clicked on an active summoned soldier
      let clickedSoldier = false;
      for (const soldier of this.state.soldiers) {
        if (soldier.state === 'DEAD') continue;
        const dist = Math.hypot(clickX - soldier.x, clickY - soldier.y);
        if (dist <= 22) {
          this.state.selectedTowerId = soldier.towerId;
          this.state.selectedSlotId = null;
          this.state.selectedBuildPoint = null;
          this.state.activePlacementType = null;
          this.uiManager.openUnitModal(soldier.id, soldier.towerId);
          clickedSoldier = true;
          break;
        }
      }

      if (clickedSoldier) return;

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
      this.state.hoveredBuildTowerType = null;
      this.state.activePlacementType = null;
      this.uiManager.updateHotbarVisuals();
    });
  }

  private loop(currentTime: number): void {
    if (!this.lastTime) this.lastTime = currentTime;
    const rawDt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    this.simEngine.update(rawDt);

    this.render(this.simEngine.getInterpolationAlpha());

    this.uiManager.updateHUD(
      this.waveSystem.currentWaveIndex + 1,
      this.waveSystem.getTotalWaves(),
      this.waveSystem.isWaveInProgress
    );

    requestAnimationFrame((t) => this.loop(t));
  }

  private render(alpha: number = 1.0): void {
    const { ctx } = this;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const animTime = this.simEngine.getTotalAnimTime();

    // 1. Map & Road & River of current active map (uses cached static terrain)
    MapRenderer.renderBackground(ctx, animTime, this.state.currentMap);

    // 2. Traps and Towers
    TowerRenderer.renderTowers(ctx, this.state.towers, this.state.selectedTowerId, animTime);

    // 3. Update Smart LOD based on total live units on battlefield
    StickmanRenderer.currentLOD = StickmanRenderer.getLODLevel(
      this.state.enemies.length + this.state.soldiers.length
    );

    // 4. Ground/Water Enemies
    for (const enemy of this.state.enemies) {
      if (enemy.movementType !== 'FLY') {
        StickmanRenderer.renderEnemy(ctx, enemy, animTime, alpha);
      }
    }

    // 5. Soldiers
    for (const soldier of this.state.soldiers) {
      StickmanRenderer.renderSoldier(ctx, soldier, animTime);
    }

    // 6. Flying Enemies
    for (const enemy of this.state.enemies) {
      if (enemy.movementType === 'FLY') {
        StickmanRenderer.renderEnemy(ctx, enemy, animTime, alpha);
      }
    }

    // 7. Free Placement Cursor Feedback & Range Preview
    MapRenderer.renderPlacementFeedback(ctx, this.state, animTime);

    // 8. Projectiles
    TowerRenderer.renderProjectiles(ctx, this.state.projectiles);

    // 9. Particles & Explosions
    TowerRenderer.renderParticles(ctx, this.state.particles);

    // 10. Floating Texts
    TowerRenderer.renderFloatingTexts(ctx, this.state.floatingTexts);
  }
}

// Start application
window.addEventListener('DOMContentLoaded', () => {
  new GameApp();
});
