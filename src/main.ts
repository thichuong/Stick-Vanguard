import { GameState } from './core/GameState.js';
import { WasmBridge } from './core/WasmBridge.js';
import { TargetingRuleEngine } from './systems/TargetingRuleEngine.js';
import { MapRenderer } from './render/MapRenderer.js';
import { TowerRenderer } from './render/TowerRenderer.js';
import { UnitSpriteCache } from './render/UnitSpriteCache.js';
import { UIManager } from './ui/UIManager.js';
import { MAPS_CONFIG } from './config/map.config.js';
import { SoundSystem } from './systems/SoundSystem.js';

class GameApp {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext | null = null;
  private overlayCanvas: HTMLCanvasElement | null = null;
  private overlayCtx: CanvasRenderingContext2D | null = null;
  private webglReady: boolean = false;

  private state!: GameState;
  private uiManager!: UIManager;
  private lastTime: number = 0;
  private autoWaveDelayTimer: number = 0;
  private wasWaveInProgress: boolean = false;

  constructor() {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;

    // WebGL2 context is required for the Rust WASM GPU renderer
    try {
      this.gl = this.canvas.getContext('webgl2', { alpha: false, antialias: true }) as WebGL2RenderingContext | null;
    } catch {
      this.gl = null;
    }

    if (!this.gl) {
      console.error('[Stick Vanguard] WebGL2 is not supported on this browser/environment.');
      const wrapper = document.getElementById('canvas-wrapper');
      if (wrapper) {
        wrapper.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;background:#090d16;color:#f87171;font-family:sans-serif;text-align:center;padding:24px;">
            <div style="font-size:36px;margin-bottom:12px;">⚠️</div>
            <h2 style="font-size:20px;margin-bottom:8px;color:#f1f5f9;">Trình duyệt không hỗ trợ WebGL2</h2>
            <p style="font-size:14px;color:#94a3b8;max-width:450px;line-height:1.5;">Stick Vanguard yêu cầu phần cứng đồ họa WebGL2 và WebAssembly để chạy toàn bộ lõi mô phỏng chiến trường Rust. Vui lòng kích hoạt tăng tốc phần cứng trong cài đặt trình duyệt.</p>
          </div>
        `;
      }
      return;
    }

    const wrapper = document.getElementById('canvas-wrapper');
    if (wrapper) {
      const overlay = document.createElement('canvas');
      overlay.id = 'game-hud-overlay';
      overlay.width = this.canvas.width;
      overlay.height = this.canvas.height;
      overlay.style.position = 'absolute';
      overlay.style.inset = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.pointerEvents = 'none';
      wrapper.insertBefore(overlay, this.canvas.nextSibling);
      this.overlayCanvas = overlay;
      this.overlayCtx = overlay.getContext('2d');
    }

    this.state = new GameState();
    this.state.loadSettingsFromStorage();
    TargetingRuleEngine.globalDamageMultiplier = this.state.damageMultiplier;

    this.uiManager = new UIManager(
      this.state,
      () => this.handleCallWave(),
      () => this.restartGame(),
      (mapId: string) => this.handleSelectMap(mapId)
    );

    this.setupResize();
    this.bindCanvasEvents();

    const bridge = WasmBridge.getInstance();
    bridge.init().then((active) => {
      if (active) {
        SoundSystem.setEnabled(this.state.soundEnabled);
        SoundSystem.setVolume(this.state.soundVolume);
        bridge.setMap(this.state.currentMapId);
        bridge.setGameSettings(
          this.state.customTotalWaves,
          this.state.goldMultiplier,
          this.state.damageMultiplier,
          this.state.gameSpeed,
          this.state.isPaused
        );
        bridge.syncTowersAndSoldiers(this.state.towers, this.state.soldiers, this.state.gold, this.state.lives);
        if (this.gl) {
          this.webglReady = bridge.initWebGlRenderer(this.gl);
          if (this.webglReady) {
            UnitSpriteCache.bakeAndUploadWebGlAtlas(bridge);
          }
        }
      }
    });

    requestAnimationFrame((t) => this.loop(t));
  }

  private handleSelectMap(mapId: string): void {
    const found = MAPS_CONFIG.find((m) => m.id === mapId);
    if (!found) return;

    this.autoWaveDelayTimer = 0;
    this.wasWaveInProgress = false;

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

    const bridge = WasmBridge.getInstance();
    bridge.clearAll();
    if (bridge.isAvailable()) {
      bridge.resetEngine();
      bridge.setMap(this.state.currentMapId);
      bridge.setGameSettings(keepWaves, keepGoldMult, keepDmgMult, keepSpeed, this.state.isPaused);
      bridge.syncTowersAndSoldiers(this.state.towers, this.state.soldiers, this.state.gold, this.state.lives);
    }
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

    this.autoWaveDelayTimer = 0;
    SoundSystem.playWaveStart();

    const bridge = WasmBridge.getInstance();
    if (bridge.isAvailable()) {
      const res = bridge.callWaveEarly();
      if (res && res.bonusGold) {
        this.state.gold += res.bonusGold;
      }
    }
  }

  private restartGame(): void {
    this.autoWaveDelayTimer = 0;
    this.wasWaveInProgress = false;

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

    const bridge = WasmBridge.getInstance();
    bridge.clearAll();
    if (bridge.isAvailable()) {
      bridge.resetEngine();
      bridge.setMap(this.state.currentMapId);
      bridge.setGameSettings(keepWaves, keepGoldMult, keepDmgMult, keepSpeed, this.state.isPaused);
      bridge.syncTowersAndSoldiers(this.state.towers, this.state.soldiers, this.state.gold, this.state.lives);
    }
    MapRenderer.clearCache();
  }

  private bindCanvasEvents(): void {
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

      if (this.state.isSettingRallyPoint && this.state.selectedTowerId) {
        this.state.setRallyPoint(this.state.selectedTowerId, clickX, clickY);
        this.state.isSettingRallyPoint = false;
        WasmBridge.getInstance().setSelectedTower(this.state.selectedTowerId, false);
        this.uiManager.updateHotbarVisuals();
        return;
      }

      if (this.state.activePlacementType) {
        const built = this.state.buildTowerAt(clickX, clickY, this.state.activePlacementType);
        if (built && !e.shiftKey) {
          this.state.activePlacementType = null;
          this.uiManager.updateHotbarVisuals();
        }
        return;
      }

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

      if (clickedTower) {
        WasmBridge.getInstance().setSelectedTower(this.state.selectedTowerId, this.state.isSettingRallyPoint);
        this.uiManager.updateHotbarVisuals();
        return;
      }

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

      if (clickedSoldier) {
        WasmBridge.getInstance().setSelectedTower(this.state.selectedTowerId, this.state.isSettingRallyPoint);
        this.uiManager.updateHotbarVisuals();
        return;
      }

      const valTrap = this.state.validatePlacement(clickX, clickY, 'TRAP_GENERIC');
      const valTower = this.state.validatePlacement(clickX, clickY, 'TOWER_GENERIC');

      if (valTrap.valid) {
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

    const bridge = WasmBridge.getInstance();

    // Pure Rust WebAssembly Engine & WebGL2 Hardware Render
    if (this.gl && this.webglReady && bridge.isAvailable()) {
      bridge.setGameSettings(
        this.state.customTotalWaves,
        this.state.goldMultiplier,
        this.state.damageMultiplier,
        this.state.gameSpeed,
        this.state.isPaused
      );
      bridge.setSelectedTower(this.state.selectedTowerId, this.state.isSettingRallyPoint);

      const step = bridge.stepAndRender(rawDt);
      if (step) {
        this.state.gold = step.gold;
        this.state.lives = step.lives;
        this.state.isGameOver = step.isGameOver;
        this.state.isVictory = step.isVictory;

        if (step.soldiers) {
          const rustSoldierIds = new Set(step.soldiers.map((s) => s.id));
          // Remove dead spirits that have been removed from Rust simulation
          this.state.soldiers = this.state.soldiers.filter(
            (s) => !s.isSpirit || rustSoldierIds.has(s.id)
          );

          for (const sUpdate of step.soldiers) {
            const soldier = this.state.soldiers.find((s) => s.id === sUpdate.id);
            if (soldier) {
              soldier.hp = sUpdate.hp;
              soldier.maxHp = sUpdate.maxHp;
              soldier.state = sUpdate.state;
              soldier.respawnTimer = sUpdate.respawnTimer;
              soldier.x = sUpdate.x;
              soldier.y = sUpdate.y;
              if (sUpdate.damage !== undefined) soldier.damage = sUpdate.damage;
              if (sUpdate.armor !== undefined) soldier.armor = sUpdate.armor;
              if (sUpdate.magicResist !== undefined) soldier.magicResist = sUpdate.magicResist;
              if (sUpdate.attackCooldown !== undefined) soldier.attackCooldown = sUpdate.attackCooldown;
              if (sUpdate.buffedElements) soldier.buffedElements = sUpdate.buffedElements;
            } else {
              this.state.soldiers.push(sUpdate);
            }
          }

          // Ensure tower.soldierIds remains in sync for HEROIC_ALTAR
          for (const tower of this.state.towers) {
            if (tower.type === 'HEROIC_ALTAR') {
              tower.soldierIds = this.state.soldiers
                .filter((s) => s.towerId === tower.id)
                .map((s) => s.id);
            }
          }
        }

        // Overlay canvas: UI HUD feedback (range rings) & floating combat texts
        if (this.overlayCtx && this.overlayCanvas) {
          this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
          MapRenderer.renderPlacementFeedback(this.overlayCtx, this.state, step.animTime);
          TowerRenderer.renderFloatingTexts(this.overlayCtx, step.floatingTexts as any);
        }

        this.uiManager.updateHUD(
          step.currentWaveIndex + 1,
          step.totalWaves,
          step.isWaveInProgress
        );

        // Auto Next Wave Automation
        if (this.state.autoNextWave && !this.state.isGameOver && !this.state.isVictory) {
          if (!step.isWaveInProgress && (step.currentWaveIndex + 1) <= step.totalWaves) {
            // Khi vừa hoàn thành một đợt quái, bắt đầu đếm trễ ngắn (~0.8s) trước khi sang đợt mới
            if (this.wasWaveInProgress) {
              this.autoWaveDelayTimer = 0.8;
            }

            if (this.autoWaveDelayTimer > 0) {
              this.autoWaveDelayTimer -= rawDt;
              if (this.autoWaveDelayTimer <= 0) {
                this.autoWaveDelayTimer = 0;
                this.handleCallWave();
              }
            }
          } else {
            this.autoWaveDelayTimer = 0;
          }
        } else {
          this.autoWaveDelayTimer = 0;
        }

        this.wasWaveInProgress = step.isWaveInProgress;
      }
    }

    requestAnimationFrame((t) => this.loop(t));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new GameApp();
});
