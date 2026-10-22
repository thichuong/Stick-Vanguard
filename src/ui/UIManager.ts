import { GameState } from '../core/GameState.js';
import { TOWER_BLUEPRINTS } from '../config/towers.config.js';
import { ELEMENT_ICONS } from '../config/elements.config.js';
import { TowerType } from '../types/entities.types.js';

export class UIManager {
  private menuOverlayEl: HTMLElement;
  private messageBannerEl: HTMLElement;
  private placementHintEl: HTMLElement | null;
  private lastRenderKey: string = '';

  constructor(
    private state: GameState,
    private onCallWave: () => void,
    private onRestart: () => void
  ) {
    this.menuOverlayEl = document.getElementById('menu-overlay')!;
    this.messageBannerEl = document.getElementById('message-banner')!;
    this.placementHintEl = document.getElementById('placement-hint');

    this.bindEvents();
    this.bindHotbar();
    this.bindKeyboard();
  }

  private bindEvents(): void {
    // Top HUD buttons
    const nextWaveBtn = document.getElementById('btn-next-wave');
    if (nextWaveBtn) {
      nextWaveBtn.addEventListener('click', () => {
        this.onCallWave();
      });
    }

    const speedBtn = document.getElementById('btn-speed');
    if (speedBtn) {
      speedBtn.addEventListener('click', () => {
        this.state.gameSpeed = this.state.gameSpeed === 1 ? 2 : 1;
        speedBtn.textContent = `Tốc độ: x${this.state.gameSpeed}`;
      });
    }

    const pauseBtn = document.getElementById('btn-pause');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        this.state.isPaused = !this.state.isPaused;
        pauseBtn.textContent = this.state.isPaused ? '▶️ Tiếp tục' : '⏸️ Tạm dừng';
      });
    }

    const restartBtn = document.getElementById('btn-restart');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.onRestart();
      });
    }
  }

  private bindHotbar(): void {
    const hotbarBtns = document.querySelectorAll('.hotbar-btn');
    hotbarBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const type = target.getAttribute('data-type') as TowerType;
        if (!type) return;

        // Toggle selection
        if (this.state.activePlacementType === type) {
          this.state.activePlacementType = null;
        } else {
          this.state.activePlacementType = type;
          this.state.selectedSlotId = null;
          this.state.selectedTowerId = null;
          this.state.isSettingRallyPoint = false;
        }

        this.updateHotbarVisuals();
      });
    });
  }

  private bindKeyboard(): void {
    const keyMap: Record<string, TowerType> = {
      '1': 'BARRACKS',
      '2': 'ARCHER',
      '3': 'MAGE',
      '4': 'ARTILLERY',
      '5': 'TRAP_SPIKE',
      '6': 'TRAP_FIRE',
      '7': 'TRAP_FROST',
      '8': 'TRAP_NET'
    };

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.state.activePlacementType = null;
        this.state.selectedSlotId = null;
        this.state.selectedTowerId = null;
        this.state.isSettingRallyPoint = false;
        this.updateHotbarVisuals();
        return;
      }

      if (keyMap[e.key]) {
        const type = keyMap[e.key];
        if (this.state.activePlacementType === type) {
          this.state.activePlacementType = null;
        } else {
          this.state.activePlacementType = type;
          this.state.selectedSlotId = null;
          this.state.selectedTowerId = null;
          this.state.isSettingRallyPoint = false;
        }
        this.updateHotbarVisuals();
      }
    });
  }

  public updateHotbarVisuals(): void {
    const hotbarBtns = document.querySelectorAll('.hotbar-btn');
    hotbarBtns.forEach((btn) => {
      const type = btn.getAttribute('data-type') as TowerType;
      const bp = TOWER_BLUEPRINTS[type.startsWith('TRAP_') ? type : `${type}_1`];

      // Active selected state
      if (this.state.activePlacementType === type) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }

      // Affordability state
      if (bp && this.state.gold < bp.cost) {
        btn.classList.add('disabled');
      } else {
        btn.classList.remove('disabled');
      }
    });

    if (this.placementHintEl) {
      if (this.state.activePlacementType) {
        const bp = TOWER_BLUEPRINTS[this.state.activePlacementType.startsWith('TRAP_') ? this.state.activePlacementType : `${this.state.activePlacementType}_1`];
        this.placementHintEl.textContent = `📍 ĐANG CHỌN [${bp?.name.toUpperCase()}]. Bấm vào ô đất màu xanh để đặt tháp (hoặc phím ESC để hủy).`;
        this.placementHintEl.classList.add('highlight');
      } else {
        this.placementHintEl.textContent = 'Bấm phím [1]-[8] hoặc chọn tháp bên dưới rồi bấm vào ô đất để xây';
        this.placementHintEl.classList.remove('highlight');
      }
    }
  }

  public updateHUD(currentWave: number, totalWaves: number, isWaveRunning: boolean): void {
    const goldEl = document.getElementById('hud-gold');
    const livesEl = document.getElementById('hud-lives');
    const waveEl = document.getElementById('hud-wave');
    const nextWaveBtn = document.getElementById('btn-next-wave') as HTMLButtonElement;

    if (goldEl) goldEl.textContent = `${this.state.gold}`;
    if (livesEl) livesEl.textContent = `${this.state.lives}/${this.state.maxLives}`;
    if (waveEl) waveEl.textContent = `${currentWave}/${totalWaves}`;

    if (nextWaveBtn) {
      if (isWaveRunning) {
        nextWaveBtn.textContent = '⚡ Gọi đợt kế tiếp (+ Vàng)';
      } else {
        nextWaveBtn.textContent = '⚔️ Bắt đầu Đợt Quái';
      }
    }

    // Game Over / Victory banners
    if (this.state.isGameOver) {
      this.messageBannerEl.classList.remove('hidden');
      this.messageBannerEl.innerHTML = `
        <div class="banner-box game-over">
          <h2>💀 THẤT THỦ!</h2>
          <p>Căn cứ đã bị quái vật tràn vào tiêu diệt.</p>
          <button id="btn-banner-restart" class="action-btn">🔄 Chơi lại</button>
        </div>
      `;
      document.getElementById('btn-banner-restart')?.addEventListener('click', () => this.onRestart());
    } else if (this.state.isVictory) {
      this.messageBannerEl.classList.remove('hidden');
      this.messageBannerEl.innerHTML = `
        <div class="banner-box victory">
          <h2>🏆 CHIẾN THẮNG QUANG VINH!</h2>
          <p>Bạn đã chặn đứng 10 đợt xâm lăng và hạ gục Đại Hắc Long!</p>
          <button id="btn-banner-restart" class="action-btn">🔄 Chơi lại</button>
        </div>
      `;
      document.getElementById('btn-banner-restart')?.addEventListener('click', () => this.onRestart());
    } else {
      this.messageBannerEl.classList.add('hidden');
    }

    this.updateHotbarVisuals();
    this.renderActionMenu();
  }

  private renderActionMenu(): void {
    // Generate render key to prevent trashing DOM every frame
    const currentKey = `${this.state.selectedSlotId}_${this.state.selectedTowerId}_${this.state.isSettingRallyPoint}_${this.state.activePlacementType}_${Math.floor(this.state.gold / 25)}`;
    if (currentKey === this.lastRenderKey) {
      return;
    }
    this.lastRenderKey = currentKey;

    const slot = this.state.getSelectedSlot();
    const tower = this.state.getSelectedTower();

    if (this.state.isSettingRallyPoint) {
      this.menuOverlayEl.innerHTML = `
        <div class="action-panel floating-panel">
          <div class="panel-header">🚩 CHỈ ĐỊNH ĐIỂM TẬP KẾT</div>
          <p class="panel-desc">Nhấp chuột vào một điểm trên đường đi (trong vòng tròn vàng) để lính chạy ra chặn quái.</p>
          <button id="btn-cancel-rally" class="btn-cancel">Hủy bỏ</button>
        </div>
      `;
      document.getElementById('btn-cancel-rally')?.addEventListener('click', () => {
        this.state.isSettingRallyPoint = false;
        this.lastRenderKey = '';
      });
      return;
    }

    // 1. Build Menu when slot selected
    if (slot && !slot.currentTowerId) {
      let optionsHtml = '';

      if (slot.placement === 'ROADSIDE') {
        const roadsideTypes: TowerType[] = ['BARRACKS', 'ARCHER', 'MAGE', 'ARTILLERY'];
        optionsHtml = roadsideTypes
          .map((type) => {
            const bp = TOWER_BLUEPRINTS[`${type}_1`];
            const canAfford = this.state.gold >= bp.cost;
            const icon = ELEMENT_ICONS[bp.element] || '⚔️';
            return `
            <button class="build-option ${canAfford ? '' : 'disabled'}" data-type="${type}">
              <div class="opt-top">
                <span class="opt-name">${bp.name}</span>
                <span class="opt-cost">🪙 ${bp.cost}</span>
              </div>
              <div class="opt-desc">${icon} [${bp.element}] ${bp.description}</div>
            </button>
          `;
          })
          .join('');
      } else {
        // Path & Water Traps
        const trapTypes: TowerType[] =
          slot.placement === 'WATER_TRAP'
            ? ['TRAP_FROST']
            : ['TRAP_SPIKE', 'TRAP_FIRE', 'TRAP_FROST', 'TRAP_NET'];

        optionsHtml = trapTypes
          .map((type) => {
            const bp = TOWER_BLUEPRINTS[type];
            const canAfford = this.state.gold >= bp.cost;
            const icon = ELEMENT_ICONS[bp.element] || '⚙️';
            return `
            <button class="build-option ${canAfford ? '' : 'disabled'}" data-type="${type}">
              <div class="opt-top">
                <span class="opt-name">${bp.name}</span>
                <span class="opt-cost">🪙 ${bp.cost}</span>
              </div>
              <div class="opt-desc">${icon} [${bp.element}] ${bp.description}</div>
            </button>
          `;
          })
          .join('');
      }

      // Position panel near slot coordinates
      const posX = Math.min(Math.max(16, slot.x - 140), 1000 - 310);
      const posY = slot.y > 380 ? slot.y - 250 : slot.y + 25;

      this.menuOverlayEl.innerHTML = `
        <div class="action-panel" style="position: absolute; left: ${posX}px; top: ${posY}px;">
          <div class="panel-header">
            <span>🛠️ XÂY ${slot.placement === 'ROADSIDE' ? 'THÁP' : 'BẪY'}</span>
            <button id="btn-close-panel" class="btn-x">✕</button>
          </div>
          <div class="build-options-list">${optionsHtml}</div>
        </div>
      `;

      document.getElementById('btn-close-panel')?.addEventListener('click', () => {
        this.state.selectedSlotId = null;
        this.lastRenderKey = '';
      });

      this.menuOverlayEl.querySelectorAll('.build-option').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const type = (e.currentTarget as HTMLElement).getAttribute('data-type') as TowerType;
          if (type && slot) {
            this.state.buildTower(slot.id, type);
            this.lastRenderKey = '';
          }
        });
      });
      return;
    }

    // 2. Tower Inspect / Upgrade / Sell Menu
    if (tower) {
      const isBarracks = tower.type === 'BARRACKS';
      const isTrap = tower.placement !== 'ROADSIDE';
      const refund = Math.round(tower.totalInvested * 0.7);

      let upgradeHtml = '';
      if (isTrap) {
        upgradeHtml = `<p class="max-tier-note">Bẫy tự động kích hoạt và tái nạp mỗi đợt.</p>`;
      } else if (tower.tier < 3) {
        const nextBp = TOWER_BLUEPRINTS[`${tower.type}_${tower.tier + 1}`];
        if (nextBp) {
          const canAfford = this.state.gold >= nextBp.cost;
          upgradeHtml = `
            <button id="btn-upgrade" class="action-btn upgrade-btn ${canAfford ? '' : 'disabled'}">
              <div>🔼 Nâng cấp lên Cấp ${tower.tier + 1}: ${nextBp.name}</div>
              <div class="sub-cost">🪙 ${nextBp.cost} Vàng</div>
            </button>
          `;
        }
      } else if (tower.tier === 3) {
        // Tier 4 Branches!
        const bpA = TOWER_BLUEPRINTS[`${tower.type}_4_A`];
        const bpB = TOWER_BLUEPRINTS[`${tower.type}_4_B`];
        const canA = bpA && this.state.gold >= bpA.cost;
        const canB = bpB && this.state.gold >= bpB.cost;

        upgradeHtml = `
          <div class="branch-section">
            <div class="branch-title">🌟 CHỌN NHÁNH RẼ CẤP 4:</div>
            <button id="btn-branch-a" class="branch-btn ${canA ? '' : 'disabled'}">
              <div class="b-name">${bpA.name}</div>
              <div class="b-desc">${ELEMENT_ICONS[bpA.element]} ${bpA.description}</div>
              <div class="b-cost">🪙 ${bpA.cost} Vàng</div>
            </button>
            <button id="btn-branch-b" class="branch-btn ${canB ? '' : 'disabled'}">
              <div class="b-name">${bpB.name}</div>
              <div class="b-desc">${ELEMENT_ICONS[bpB.element]} ${bpB.description}</div>
              <div class="b-cost">🪙 ${bpB.cost} Vàng</div>
            </button>
          </div>
        `;
      } else {
        upgradeHtml = `<p class="max-tier-note">✨ ĐÃ ĐẠT CẤP ĐỘ TỐI ĐA (CẤP 4)</p>`;
      }

      // Position near tower
      const posX = Math.min(Math.max(16, tower.x - 140), 1000 - 310);
      const posY = tower.y > 380 ? tower.y - 230 : tower.y + 25;

      this.menuOverlayEl.innerHTML = `
        <div class="action-panel" style="position: absolute; left: ${posX}px; top: ${posY}px;">
          <div class="panel-header">
            <div>
              <span class="panel-title">${tower.name}</span>
              <span class="tier-pill">Cấp ${tower.tier}</span>
            </div>
            <button id="btn-close-panel" class="btn-x">✕</button>
          </div>
          <div class="stats-row">
            <span>Sát thương: <b>${tower.damage}</b> (${tower.element})</span>
            <span>Tầm bắn: <b>${tower.range}</b></span>
            <span>Tốc độ: <b>${tower.fireRate}/s</b></span>
          </div>
          ${upgradeHtml}
          <div class="button-row">
            ${
              isBarracks
                ? `<button id="btn-rally" class="action-btn rally-btn">🚩 Điểm Tập Kết</button>`
                : ''
            }
            <button id="btn-sell" class="action-btn sell-btn">💰 Bán (+${refund} 🪙)</button>
          </div>
        </div>
      `;

      document.getElementById('btn-close-panel')?.addEventListener('click', () => {
        this.state.selectedTowerId = null;
        this.lastRenderKey = '';
      });

      document.getElementById('btn-upgrade')?.addEventListener('click', () => {
        this.state.upgradeTower(tower.id);
        this.lastRenderKey = '';
      });

      document.getElementById('btn-branch-a')?.addEventListener('click', () => {
        this.state.upgradeTower(tower.id, 'A');
        this.lastRenderKey = '';
      });

      document.getElementById('btn-branch-b')?.addEventListener('click', () => {
        this.state.upgradeTower(tower.id, 'B');
        this.lastRenderKey = '';
      });

      document.getElementById('btn-rally')?.addEventListener('click', () => {
        this.state.isSettingRallyPoint = true;
        this.lastRenderKey = '';
      });

      document.getElementById('btn-sell')?.addEventListener('click', () => {
        this.state.sellTower(tower.id);
        this.lastRenderKey = '';
      });

      return;
    }

    // Nothing selected
    this.menuOverlayEl.innerHTML = '';
  }
}
