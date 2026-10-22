import { GameState } from '../core/GameState.js';
import { TOWER_BLUEPRINTS } from '../config/towers.config.js';
import { MAPS_CONFIG, MapConfig } from '../config/map.config.js';
import {
  ELEMENT_ICONS,
  ELEMENT_NAMES,
  SELECTABLE_ELEMENTS,
  ELEMENT_IMBUE_COST,
  MAGE_SECOND_ELEMENT_COST
} from '../config/elements.config.js';
import { TowerType } from '../types/entities.types.js';
import { MagicalElementType } from '../types/elements.types.js';
import { SideDetailPanel } from './SideDetailPanel.js';

export class UIManager {
  private menuOverlayEl: HTMLElement;
  private messageBannerEl: HTMLElement;
  private placementHintEl: HTMLElement | null;
  private inspectorContentEl: HTMLElement;
  private inspectorTitleEl: HTMLElement | null;
  private mapModalBackdropEl: HTMLElement | null;
  private mapCardsGridEl: HTMLElement | null;
  private settingsModalBackdropEl: HTMLElement | null;
  private hudMapNameEl: HTMLElement | null;
  private hudMapWavesEl: HTMLElement | null;
  private sidePanel: SideDetailPanel;
  private lastRenderKey: string = '';
  private bannerState: 'NONE' | 'GAME_OVER' | 'VICTORY' = 'NONE';
  private confirmingSellTowerId: string | null = null;

  constructor(
    private state: GameState,
    private onCallWave: () => void,
    private onRestart: () => void,
    private onSelectMap: (mapId: string) => void
  ) {
    this.menuOverlayEl = document.getElementById('menu-overlay')!;
    this.messageBannerEl = document.getElementById('message-banner')!;
    this.placementHintEl = document.getElementById('placement-hint');
    this.inspectorContentEl = document.getElementById('inspector-content')!;
    this.inspectorTitleEl = document.getElementById('inspector-main-title');
    this.mapModalBackdropEl = document.getElementById('map-modal-backdrop');
    this.mapCardsGridEl = document.getElementById('map-cards-grid');
    this.settingsModalBackdropEl = document.getElementById('settings-modal-backdrop');
    this.hudMapNameEl = document.getElementById('hud-map-name');
    this.hudMapWavesEl = document.getElementById('hud-map-waves');
    this.sidePanel = new SideDetailPanel();

    this.bindEvents();
    this.bindArsenal();
    this.bindKeyboard();
    this.bindCodexTriggers();
    this.bindMapModal();
    this.bindSettingsModal();
  }

  public handleResize(): void {
    this.lastRenderKey = '';
    this.renderInspector();
  }

  private bindSettingsModal(): void {
    const openBtn = document.getElementById('btn-open-settings-modal');
    const closeBtn = document.getElementById('btn-close-settings-modal');
    const confirmBtn = document.getElementById('btn-confirm-settings');
    const resetBtn = document.getElementById('btn-reset-settings');

    const wavesRange = document.getElementById('input-waves-range') as HTMLInputElement | null;
    const wavesNum = document.getElementById('input-waves-num') as HTMLInputElement | null;
    const wavesLbl = document.getElementById('lbl-custom-waves');
    const quickWavesLbl = document.getElementById('quick-hud-waves');

    const goldRange = document.getElementById('input-gold-range') as HTMLInputElement | null;
    const goldLbl = document.getElementById('lbl-gold-mult');
    const quickGoldLbl = document.getElementById('quick-hud-gold');

    const dmgRange = document.getElementById('input-damage-range') as HTMLInputElement | null;
    const dmgLbl = document.getElementById('lbl-damage-mult');
    const quickDmgLbl = document.getElementById('quick-hud-dmg');

    const updateWaves = (val: number) => {
      const clamped = Math.max(1, Math.min(100, Math.round(val)));
      this.state.customTotalWaves = clamped;
      if (wavesRange) wavesRange.value = `${clamped}`;
      if (wavesNum) wavesNum.value = `${clamped}`;
      if (wavesLbl) wavesLbl.textContent = `${clamped} đợt`;
      if (quickWavesLbl) quickWavesLbl.textContent = `${clamped} đợt`;

      // Update preset buttons active state
      document.querySelectorAll('.preset-btn[data-type="waves"]').forEach((btn) => {
        const v = parseInt(btn.getAttribute('data-val') || '0', 10);
        btn.classList.toggle('active', v === clamped);
      });
    };

    const updateGold = (val: number) => {
      const clamped = Math.max(0.1, Math.min(10, Math.round(val * 10) / 10));
      this.state.goldMultiplier = clamped;
      if (goldRange) goldRange.value = `${clamped}`;
      const txt = `x${clamped.toFixed(1)}`;
      if (goldLbl) goldLbl.textContent = txt;
      if (quickGoldLbl) quickGoldLbl.textContent = txt;

      document.querySelectorAll('.preset-btn[data-type="gold"]').forEach((btn) => {
        const v = parseFloat(btn.getAttribute('data-val') || '0');
        btn.classList.toggle('active', Math.abs(v - clamped) < 0.05);
      });
    };

    const updateDmg = (val: number) => {
      const clamped = Math.max(0.1, Math.min(10, Math.round(val * 10) / 10));
      this.state.damageMultiplier = clamped;
      if (dmgRange) dmgRange.value = `${clamped}`;
      const txt = `x${clamped.toFixed(1)}`;
      if (dmgLbl) dmgLbl.textContent = txt;
      if (quickDmgLbl) quickDmgLbl.textContent = txt;

      document.querySelectorAll('.preset-btn[data-type="dmg"]').forEach((btn) => {
        const v = parseFloat(btn.getAttribute('data-val') || '0');
        btn.classList.toggle('active', Math.abs(v - clamped) < 0.05);
      });
    };

    if (wavesRange) {
      wavesRange.addEventListener('input', () => updateWaves(parseInt(wavesRange.value, 10)));
    }
    if (wavesNum) {
      wavesNum.addEventListener('change', () => updateWaves(parseInt(wavesNum.value, 10) || 10));
    }
    if (goldRange) {
      goldRange.addEventListener('input', () => updateGold(parseFloat(goldRange.value)));
    }
    if (dmgRange) {
      dmgRange.addEventListener('input', () => updateDmg(parseFloat(dmgRange.value)));
    }

    // Preset buttons inside settings modal
    document.querySelectorAll('.preset-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const type = target.getAttribute('data-type');
        const val = parseFloat(target.getAttribute('data-val') || '0');
        if (type === 'waves') updateWaves(val);
        else if (type === 'gold') updateGold(val);
        else if (type === 'dmg') updateDmg(val);
      });
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        updateWaves(10);
        updateGold(1.0);
        updateDmg(1.0);
      });
    }

    if (openBtn) {
      openBtn.addEventListener('click', () => this.openSettingsModal());
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeSettingsModal());
    }
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => this.closeSettingsModal());
    }

    if (this.settingsModalBackdropEl) {
      this.settingsModalBackdropEl.addEventListener('click', (e) => {
        if (e.target === this.settingsModalBackdropEl) {
          this.closeSettingsModal();
        }
      });
    }
  }

  public openSettingsModal(): void {
    if (this.settingsModalBackdropEl) {
      this.settingsModalBackdropEl.classList.remove('hidden');
    }
  }

  public closeSettingsModal(): void {
    if (this.settingsModalBackdropEl) {
      this.settingsModalBackdropEl.classList.add('hidden');
    }
  }

  private bindEvents(): void {
    // Left panel Wave button
    const nextWaveBtn = document.getElementById('btn-next-wave');
    if (nextWaveBtn) {
      nextWaveBtn.addEventListener('click', () => {
        this.onCallWave();
      });
    }

    // Speed button
    const speedBtn = document.getElementById('btn-speed');
    if (speedBtn) {
      speedBtn.addEventListener('click', () => {
        this.state.gameSpeed = this.state.gameSpeed === 1 ? 2 : 1;
        speedBtn.textContent = `Tốc độ: x${this.state.gameSpeed}`;
      });
    }

    // Pause button
    const pauseBtn = document.getElementById('btn-pause');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        this.state.isPaused = !this.state.isPaused;
        pauseBtn.textContent = this.state.isPaused ? '▶️ Tiếp tục' : '⏸️ Tạm dừng';
      });
    }

    // Restart button
    const restartBtn = document.getElementById('btn-restart');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.clearBanner();
        this.onRestart();
      });
    }

    // Fullscreen button
    const fullscreenBtn = document.getElementById('btn-fullscreen');
    if (fullscreenBtn) {
      const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      };

      fullscreenBtn.addEventListener('click', toggleFullscreen);

      const updateFullscreenLabel = () => {
        if (document.fullscreenElement) {
          fullscreenBtn.innerHTML = '🗗 Thu nhỏ';
          fullscreenBtn.title = 'Thoát toàn màn hình (F)';
        } else {
          fullscreenBtn.innerHTML = '⛶ Toàn màn hình';
          fullscreenBtn.title = 'Toàn màn hình (F)';
        }
      };

      document.addEventListener('fullscreenchange', updateFullscreenLabel);
    }
  }

  private bindMapModal(): void {
    const selectMapBtn = document.getElementById('btn-select-map');
    const closeMapModalBtn = document.getElementById('btn-close-map-modal');

    if (selectMapBtn) {
      selectMapBtn.addEventListener('click', () => {
        this.openMapModal();
      });
    }

    if (closeMapModalBtn) {
      closeMapModalBtn.addEventListener('click', () => {
        this.closeMapModal();
      });
    }

    if (this.mapModalBackdropEl) {
      this.mapModalBackdropEl.addEventListener('click', (e) => {
        if (e.target === this.mapModalBackdropEl) {
          this.closeMapModal();
        }
      });
    }
  }

  public openMapModal(): void {
    if (!this.mapModalBackdropEl || !this.mapCardsGridEl) return;
    this.renderMapCards();
    this.mapModalBackdropEl.classList.remove('hidden');
  }

  public closeMapModal(): void {
    if (this.mapModalBackdropEl) {
      this.mapModalBackdropEl.classList.add('hidden');
    }
  }

  private renderMapCards(): void {
    if (!this.mapCardsGridEl) return;

    this.mapCardsGridEl.innerHTML = MAPS_CONFIG.map((m) => {
      const isSelected = m.id === this.state.currentMapId;
      const totalWaves = this.state.customTotalWaves;

      return `
        <div class="map-card ${isSelected ? 'active-map' : ''}" data-map-id="${m.id}">
          <div class="map-card-header">
            <div class="map-card-title-group">
              <span class="map-card-name">${m.name}</span>
              <span class="map-card-sub">${m.subtitle}</span>
            </div>
            <span class="current-map-waves-badge">⚔️ ${totalWaves} Đợt (Cài đặt)</span>
          </div>

          <div class="map-preview-box">
            ${this.generateMiniMapSvg(m)}
          </div>

          <p class="map-card-desc">${m.description}</p>

          <button class="action-btn select-map-action-btn ${isSelected ? 'current-btn' : ''}">
            ${isSelected ? '✓ Đang Chơi' : '⚔️ Chọn Bản Đồ Này'}
          </button>
        </div>
      `;
    }).join('');

    this.mapCardsGridEl.querySelectorAll('.map-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const mapId = target.getAttribute('data-map-id');
        if (mapId) {
          this.clearBanner();
          this.onSelectMap(mapId);
          this.closeMapModal();
        }
      });
    });
  }

  private generateMiniMapSvg(map: MapConfig): string {
    const scale = 0.24;
    const w = Math.round(map.width * scale);
    const h = Math.round(map.height * scale);

    const toSvgPath = (pts: { x: number; y: number }[]) => {
      if (!pts || pts.length === 0) return '';
      return pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${Math.round(p.x * scale)} ${Math.round(p.y * scale)}`).join(' ');
    };

    const groundPathD = toSvgPath(map.groundWaypoints);
    const waterPathD = toSvgPath(map.waterWaypoints);
    const airPathD = toSvgPath(map.airWaypoints);

    return `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" class="mini-map-svg">
        <rect width="${w}" height="${h}" fill="${map.themeColor || '#1e293b'}" rx="6" />
        <!-- River -->
        <path d="${waterPathD}" fill="none" stroke="${map.riverColor || '#0284c7'}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
        <!-- Road -->
        <path d="${groundPathD}" fill="none" stroke="${map.roadColor || '#b45309'}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" />
        <path d="${groundPathD}" fill="none" stroke="#d97706" stroke-width="1.5" stroke-dasharray="3,3" />
        <!-- Air line -->
        <path d="${airPathD}" fill="none" stroke="rgba(52, 211, 153, 0.4)" stroke-width="1.5" stroke-dasharray="2,3" />
        <!-- Spawners & Base -->
        <circle cx="${Math.round(map.groundSpawn.x * scale)}" cy="${Math.round(map.groundSpawn.y * scale)}" r="4.5" fill="#ef4444" />
        <circle cx="${Math.round(map.waterSpawn.x * scale)}" cy="${Math.round(map.waterSpawn.y * scale)}" r="4" fill="#0ea5e9" />
        <circle cx="${Math.round(map.playerBase.x * scale)}" cy="${Math.round(map.playerBase.y * scale)}" r="7" fill="#1e3a8a" stroke="#60a5fa" stroke-width="1.5" />
      </svg>
    `;
  }

  private bindArsenal(): void {
    const hotbarBtns = document.querySelectorAll('#right-panel .hotbar-btn');
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
          this.state.selectedBuildPoint = null;
          this.state.isSettingRallyPoint = false;
        }

        this.updateArsenalVisuals();
        this.lastRenderKey = '';
        this.renderInspector();
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
        if (this.settingsModalBackdropEl && !this.settingsModalBackdropEl.classList.contains('hidden')) {
          this.closeSettingsModal();
          return;
        }
        if (this.mapModalBackdropEl && !this.mapModalBackdropEl.classList.contains('hidden')) {
          this.closeMapModal();
          return;
        }
        if (this.sidePanel.isOpen()) {
          this.sidePanel.close();
          return;
        }
        this.state.activePlacementType = null;
        this.state.selectedSlotId = null;
        this.state.selectedTowerId = null;
        this.state.selectedBuildPoint = null;
        this.state.isSettingRallyPoint = false;
        this.updateArsenalVisuals();
        this.lastRenderKey = '';
        this.renderInspector();
        return;
      }

      if (e.key === 'b' || e.key === 'B') {
        const target = e.target as HTMLElement;
        if (target && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          this.sidePanel.toggle();
          return;
        }
      }

      if (e.key === 'm' || e.key === 'M') {
        const target = e.target as HTMLElement;
        if (target && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          if (this.mapModalBackdropEl?.classList.contains('hidden')) {
            this.openMapModal();
          } else {
            this.closeMapModal();
          }
          return;
        }
      }

      if (e.key === 'f' || e.key === 'F') {
        const target = e.target as HTMLElement;
        if (target && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
        }
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
          this.state.selectedBuildPoint = null;
          this.state.isSettingRallyPoint = false;
        }
        this.updateArsenalVisuals();
        this.lastRenderKey = '';
        this.renderInspector();
      }
    });
  }

  private bindCodexTriggers(): void {
    const codexBtn = document.getElementById('btn-codex');
    if (codexBtn) {
      codexBtn.addEventListener('click', () => {
        this.sidePanel.toggle();
      });
    }

    const lookupBtns = document.querySelectorAll('#left-panel .lookup-pill, #left-panel .elem-mini-pill');
    lookupBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const cat = target.getAttribute('data-cat') || 'ELEMENTS';
        const subTarget = target.getAttribute('data-target') || undefined;
        this.sidePanel.open(cat, subTarget);
      });
    });
  }

  public updateArsenalVisuals(): void {
    const hotbarBtns = document.querySelectorAll('#right-panel .hotbar-btn');
    hotbarBtns.forEach((btn) => {
      const type = btn.getAttribute('data-type') as TowerType;
      const bp = TOWER_BLUEPRINTS[type.startsWith('TRAP_') ? type : `${type}_1`];

      if (this.state.activePlacementType === type) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }

      if (bp && this.state.gold < bp.cost) {
        btn.classList.add('disabled');
      } else {
        btn.classList.remove('disabled');
      }
    });

    if (this.placementHintEl) {
      if (this.state.activePlacementType) {
        const isTrap = this.state.activePlacementType.startsWith('TRAP_');
        const bp = TOWER_BLUEPRINTS[isTrap ? this.state.activePlacementType : `${this.state.activePlacementType}_1`];
        this.placementHintEl.textContent = isTrap
          ? `📍 ĐẶT [${bp?.name.toUpperCase()}]: Nhấp vào ĐƯỜNG ĐI hoặc DÒNG SÔNG để đặt (ESC hủy)`
          : `📍 ĐẶT [${bp?.name.toUpperCase()}]: Nhấp vào ĐẤT TRỐNG (ngoài đường & sông) để xây (ESC hủy)`;
        this.placementHintEl.classList.add('highlight');
      } else if (this.state.selectedBuildPoint) {
        this.placementHintEl.textContent = this.state.selectedBuildPoint.validFor === 'TRAP'
          ? '🎯 ĐÃ CHỌN TỌA ĐỘ TRÊN ĐƯỜNG/SÔNG. Bấm chọn Bẫy [5]-[8] bên phải để đặt!'
          : '🎯 ĐÃ CHỌN TỌA ĐỘ TRÊN ĐẤT. Bấm chọn Tháp [1]-[4] bên phải để xây!';
        this.placementHintEl.classList.add('highlight');
      } else {
        this.placementHintEl.textContent = 'Đặt tự do: Tháp đặt ngoài đường/sông | Bẫy đặt trên đường hoặc dưới sông [1]-[8]';
        this.placementHintEl.classList.remove('highlight');
      }
    }
  }

  public updateHotbarVisuals(): void {
    this.updateArsenalVisuals();
  }

  public updateHUD(currentWave: number, totalWaves: number, isWaveRunning: boolean): void {
    const goldEl = document.getElementById('hud-gold');
    const livesEl = document.getElementById('hud-lives');
    const waveEl = document.getElementById('hud-wave');
    const nextWaveBtn = document.getElementById('btn-next-wave') as HTMLButtonElement;

    if (goldEl) goldEl.textContent = `${this.state.gold}`;
    if (livesEl) livesEl.textContent = `${this.state.lives}/${this.state.maxLives}`;
    if (waveEl) waveEl.textContent = `${currentWave}/${totalWaves}`;

    if (this.hudMapNameEl) {
      this.hudMapNameEl.textContent = this.state.currentMap.name;
    }
    if (this.hudMapWavesEl) {
      this.hudMapWavesEl.textContent = `Mục tiêu: ${totalWaves} đợt`;
    }

    if (nextWaveBtn) {
      if (isWaveRunning) {
        nextWaveBtn.textContent = '⚡ Gọi đợt kế tiếp (+ Vàng)';
      } else {
        nextWaveBtn.textContent = '⚔️ Bắt đầu Đợt Quái';
      }
    }

    this.updateMessageBanner(totalWaves);

    this.updateArsenalVisuals();
    this.renderInspector();
  }

  private clearBanner(): void {
    this.bannerState = 'NONE';
    this.messageBannerEl.classList.add('hidden');
    this.messageBannerEl.innerHTML = '';
  }

  private updateMessageBanner(totalWaves: number): void {
    if (this.state.isGameOver) {
      if (this.bannerState !== 'GAME_OVER') {
        this.bannerState = 'GAME_OVER';
        this.messageBannerEl.classList.remove('hidden');
        this.messageBannerEl.innerHTML = `
          <div class="banner-box game-over">
            <h2>💀 THẤT THỦ!</h2>
            <p>Căn cứ đã bị quái vật tràn vào tiêu diệt.</p>
            <div style="display: flex; gap: 8px; justify-content: center; margin-top: 10px;">
              <button id="btn-banner-restart" class="action-btn" style="flex: 1;">🔄 Chơi lại</button>
              <button id="btn-banner-change-map" class="action-btn" style="background: #3b82f6; color: #fff; flex: 1;">🗺️ Đổi bản đồ</button>
            </div>
          </div>
        `;
        document.getElementById('btn-banner-restart')?.addEventListener('click', () => {
          this.clearBanner();
          this.onRestart();
        });
        document.getElementById('btn-banner-change-map')?.addEventListener('click', () => {
          this.openMapModal();
        });
      }
    } else if (this.state.isVictory) {
      if (this.bannerState !== 'VICTORY') {
        this.bannerState = 'VICTORY';
        const currentIdx = MAPS_CONFIG.findIndex((m) => m.id === this.state.currentMapId);
        const nextMap = currentIdx >= 0 && currentIdx < MAPS_CONFIG.length - 1 ? MAPS_CONFIG[currentIdx + 1] : null;

        this.messageBannerEl.classList.remove('hidden');
        this.messageBannerEl.innerHTML = `
          <div class="banner-box victory">
            <h2>🏆 CHIẾN THẮNG QUANG VINH!</h2>
            <p>Bạn đã chặn đứng toàn bộ ${totalWaves} đợt xâm lăng và bảo vệ thành công căn cứ!</p>
            <div style="display: flex; gap: 8px; justify-content: center; margin-top: 10px; flex-wrap: wrap;">
              <button id="btn-banner-restart" class="action-btn" style="flex: 1; min-width: 95px;">🔄 Chơi lại</button>
              ${nextMap ? `<button id="btn-banner-next-map" class="action-btn" style="background: #10b981; color: #fff; flex: 1; min-width: 120px;">⏩ Bản đồ kế tiếp</button>` : ''}
              <button id="btn-banner-change-map" class="action-btn" style="background: #3b82f6; color: #fff; flex: 1; min-width: 95px;">🗺️ ${nextMap ? 'Chọn bản đồ' : 'Đổi bản đồ'}</button>
            </div>
          </div>
        `;

        document.getElementById('btn-banner-restart')?.addEventListener('click', () => {
          this.clearBanner();
          this.onRestart();
        });

        if (nextMap) {
          document.getElementById('btn-banner-next-map')?.addEventListener('click', () => {
            this.clearBanner();
            this.onSelectMap(nextMap.id);
          });
        }

        document.getElementById('btn-banner-change-map')?.addEventListener('click', () => {
          this.openMapModal();
        });
      }
    } else {
      if (this.bannerState !== 'NONE') {
        this.clearBanner();
      }
    }
  }

  private renderInspector(): void {
    const tower = this.state.getSelectedTower();
    const buildPt = this.state.selectedBuildPoint;

    if (this.confirmingSellTowerId && (!tower || tower.id !== this.confirmingSellTowerId)) {
      this.confirmingSellTowerId = null;
    }

    const currentKey = `${this.state.selectedTowerId}_${tower?.tier}_${tower?.element}_${tower?.secondaryElement}_${tower?.soldierMode}_${this.state.isSettingRallyPoint}_${this.state.activePlacementType}_${buildPt?.x}_${buildPt?.y}_${Math.floor(this.state.gold / 25)}_${this.confirmingSellTowerId}`;
    if (currentKey === this.lastRenderKey) {
      return;
    }
    this.lastRenderKey = currentKey;

    if (this.state.isSettingRallyPoint) {
      this.menuOverlayEl.innerHTML = `
        <div class="floating-panel" style="position: absolute; left: 50%; top: 20px; transform: translateX(-50%); text-align: center;">
          <div style="font-weight: 700; color: #facc15; margin-bottom: 4px;">🚩 CHỈ ĐỊNH ĐIỂM TẬP KẾT</div>
          <p style="font-size: 11px; color: #cbd5e1; margin-bottom: 8px;">Nhấp chuột vào một điểm trên đường đi để lính chạy ra chặn quái.</p>
          <button id="btn-cancel-rally" class="action-btn" style="background: #334155; color: #fff; width: auto; padding: 4px 12px;">Hủy bỏ</button>
        </div>
      `;
      document.getElementById('btn-cancel-rally')?.addEventListener('click', () => {
        this.state.isSettingRallyPoint = false;
        this.lastRenderKey = '';
        this.renderInspector();
      });
    } else {
      this.menuOverlayEl.innerHTML = '';
    }

    // CASE 1: Built tower or trap selected
    if (tower) {
      if (this.inspectorTitleEl) {
        this.inspectorTitleEl.textContent = '🏰 CHI TIẾT CÔNG TRÌNH & NÂNG CẤP';
      }

      const isBarracks = tower.type === 'BARRACKS';
      const isTrap = tower.placement !== 'ROADSIDE';
      const refund = Math.round(tower.totalInvested * 0.7);

      let upgradeHtml = '';
      if (isTrap) {
        upgradeHtml = `<p class="max-tier-note">Bẫy tự động kích nổ và tái nạp mỗi đợt quái mới.</p>`;
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

      let damageDisplay = '';
      if (tower.type === 'MAGE') {
        damageDisplay = `<b>${tower.damage}</b> (${ELEMENT_ICONS[tower.element]} ${ELEMENT_NAMES[tower.element]})`;
        if (tower.secondaryElement) {
          const secDmg = Math.max(1, Math.round(tower.damage * 0.6));
          damageDisplay += ` + <b>${secDmg}</b> (${ELEMENT_ICONS[tower.secondaryElement]} ${ELEMENT_NAMES[tower.secondaryElement]})`;
        }
      } else {
        damageDisplay = `<b>${tower.damage}</b> (⚔️ Vật lý)`;
        if (tower.secondaryElement) {
          const secDmg = Math.max(1, Math.round(tower.damage * 0.45));
          damageDisplay += ` + <b>${secDmg}</b> (${ELEMENT_ICONS[tower.secondaryElement]} ${ELEMENT_NAMES[tower.secondaryElement]})`;
        }
      }

      let soldierModeHtml = '';
      if (isBarracks) {
        const isMelee = tower.soldierMode !== 'RANGED';
        soldierModeHtml = `
          <div class="soldier-mode-section">
            <div class="section-subtitle">🛡️ CHỌN LOẠI BINH CHỦNG:</div>
            <div class="soldier-mode-toggle">
              <button id="btn-mode-melee" class="mode-btn ${isMelee ? 'active' : ''}">
                🗡️ Đánh Gần (HP & DPS lớn)
              </button>
              <button id="btn-mode-ranged" class="mode-btn ${!isMelee ? 'active' : ''}">
                🏹 Bắn Tên (Bộ, Nước & Bay)
              </button>
            </div>
          </div>
        `;
      }

      let elementPickerHtml = '';
      if (!isTrap) {
        if (tower.type === 'MAGE') {
          elementPickerHtml = `
            <div class="elem-picker-section">
              <div class="picker-header">
                <span>🔮 NGUYÊN TỐ CHÍNH (KHE 1):</span>
                <span class="cost-pill">🪙 ${ELEMENT_IMBUE_COST}</span>
              </div>
              <div class="current-elem-text">Đang dùng: <b>${ELEMENT_ICONS[tower.element]} ${ELEMENT_NAMES[tower.element]}</b></div>
              <div class="elem-buttons-grid">
                ${SELECTABLE_ELEMENTS.map(
                  (elem) => `
                  <button class="elem-btn ${tower.element === elem ? 'selected' : ''}" data-slot="1" data-elem="${elem}" title="${ELEMENT_NAMES[elem]}">
                    <span>${ELEMENT_ICONS[elem]}</span>
                    <span class="eb-lbl">${ELEMENT_NAMES[elem].split(' ')[0]}</span>
                  </button>
                `
                ).join('')}
              </div>

              <div class="picker-header" style="margin-top: 8px;">
                <span>✨ NGUYÊN TỐ PHỤ (KHE 2):</span>
                <span class="cost-pill">🪙 ${MAGE_SECOND_ELEMENT_COST}</span>
              </div>
              <div class="current-elem-text">Đang dùng: <b>${tower.secondaryElement ? `${ELEMENT_ICONS[tower.secondaryElement]} ${ELEMENT_NAMES[tower.secondaryElement]}` : 'Chưa gắn'}</b></div>
              <div class="elem-buttons-grid">
                ${SELECTABLE_ELEMENTS.map(
                  (elem) => `
                  <button class="elem-btn ${tower.secondaryElement === elem ? 'selected' : ''}" data-slot="2" data-elem="${elem}" title="${ELEMENT_NAMES[elem]}">
                    <span>${ELEMENT_ICONS[elem]}</span>
                    <span class="eb-lbl">${ELEMENT_NAMES[elem].split(' ')[0]}</span>
                  </button>
                `
                ).join('')}
              </div>
            </div>
          `;
        } else {
          elementPickerHtml = `
            <div class="elem-picker-section">
              <div class="picker-header">
                <span>✨ GẮN THUỘC TÍNH NGUYÊN TỐ:</span>
                <span class="cost-pill">🪙 ${ELEMENT_IMBUE_COST}</span>
              </div>
              <div class="current-elem-text">Thuộc tính: <b>${tower.secondaryElement ? `${ELEMENT_ICONS[tower.secondaryElement]} ${ELEMENT_NAMES[tower.secondaryElement]}` : 'Chưa gắn (Thuần Vật Lý)'}</b></div>
              <div class="elem-buttons-grid">
                ${SELECTABLE_ELEMENTS.map(
                  (elem) => `
                  <button class="elem-btn ${tower.secondaryElement === elem ? 'selected' : ''}" data-slot="1" data-elem="${elem}" title="${ELEMENT_NAMES[elem]}">
                    <span>${ELEMENT_ICONS[elem]}</span>
                    <span class="eb-lbl">${ELEMENT_NAMES[elem].split(' ')[0]}</span>
                  </button>
                `
                ).join('')}
              </div>
            </div>
          `;
        }
      }

      this.inspectorContentEl.innerHTML = `
        <div class="insp-card">
          <div class="insp-header">
            <div class="insp-title-box">
              <span class="insp-title">${tower.name}</span>
              <span class="insp-tier-badge">Cấp ${tower.tier}</span>
            </div>
            <button id="btn-open-tree" class="btn-detail-link" title="Xem giải thích, thông số & cây nâng cấp">
              📖 Xem chi tiết
            </button>
          </div>
          <div class="insp-stats-grid">
            <div class="insp-stat-item">
              <span class="isi-lbl">Tầm bắn</span>
              <span class="isi-val">${tower.range} px</span>
            </div>
            <div class="insp-stat-item">
              <span class="isi-lbl">Tốc độ</span>
              <span class="isi-val">${tower.fireRate}/s</span>
            </div>
            <div class="insp-stat-item">
              <span class="isi-lbl">Đã đầu tư</span>
              <span class="isi-val">🪙 ${tower.totalInvested}</span>
            </div>
          </div>
          <div style="margin-top: 8px; font-size: 11px; color: #94a3b8;">
            Sát thương: ${damageDisplay}
          </div>
        </div>

        ${soldierModeHtml}
        ${elementPickerHtml}
        ${upgradeHtml}

        ${
          this.confirmingSellTowerId === tower.id
            ? `
              ${
                isBarracks
                  ? `<div class="button-row"><button id="btn-rally" class="action-btn rally-btn">🚩 Điểm Tập Kết</button></div>`
                  : ''
              }
              <div class="confirm-sell-box">
                <div class="confirm-sell-msg">⚠️ Bạn có chắc muốn bán công trình này?</div>
                <div class="confirm-sell-refund">Nhận lại: <b class="gold-text">🪙 +${refund} Vàng</b> (70% đã đầu tư)</div>
                <div class="confirm-sell-actions">
                  <button id="btn-confirm-sell" class="action-btn confirm-sell-btn">✔️ Xác Nhận Bán</button>
                  <button id="btn-cancel-sell" class="action-btn cancel-sell-btn">✖️ Hủy</button>
                </div>
              </div>
            `
            : `
              <div class="button-row">
                ${
                  isBarracks
                    ? `<button id="btn-rally" class="action-btn rally-btn">🚩 Điểm Tập Kết</button>`
                    : ''
                }
                <button id="btn-sell" class="action-btn sell-btn">💰 Bán (+${refund} 🪙)</button>
              </div>
            `
        }
      `;

      document.getElementById('btn-open-tree')?.addEventListener('click', () => {
        const tierKey = `${tower.type}_${tower.tier}${tower.branch ? '_' + tower.branch : ''}`;
        this.sidePanel.open(tower.type, tierKey);
      });

      document.getElementById('btn-upgrade')?.addEventListener('click', () => {
        this.confirmingSellTowerId = null;
        this.state.upgradeTower(tower.id);
        this.lastRenderKey = '';
        this.renderInspector();
      });

      document.getElementById('btn-branch-a')?.addEventListener('click', () => {
        this.confirmingSellTowerId = null;
        this.state.upgradeTower(tower.id, 'A');
        this.lastRenderKey = '';
        this.renderInspector();
      });

      document.getElementById('btn-branch-b')?.addEventListener('click', () => {
        this.confirmingSellTowerId = null;
        this.state.upgradeTower(tower.id, 'B');
        this.lastRenderKey = '';
        this.renderInspector();
      });

      document.getElementById('btn-mode-melee')?.addEventListener('click', () => {
        this.confirmingSellTowerId = null;
        this.state.setBarracksSoldierMode(tower.id, 'MELEE');
        this.lastRenderKey = '';
        this.renderInspector();
      });

      document.getElementById('btn-mode-ranged')?.addEventListener('click', () => {
        this.confirmingSellTowerId = null;
        this.state.setBarracksSoldierMode(tower.id, 'RANGED');
        this.lastRenderKey = '';
        this.renderInspector();
      });

      this.inspectorContentEl.querySelectorAll('.elem-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          this.confirmingSellTowerId = null;
          const target = e.currentTarget as HTMLElement;
          const elem = target.getAttribute('data-elem') as MagicalElementType;
          const slotIndex = (parseInt(target.getAttribute('data-slot') || '1', 10) as 1 | 2);
          if (elem && tower) {
            this.state.setTowerElement(tower.id, elem, slotIndex);
            this.lastRenderKey = '';
            this.renderInspector();
          }
        });
      });

      document.getElementById('btn-rally')?.addEventListener('click', () => {
        this.confirmingSellTowerId = null;
        this.state.isSettingRallyPoint = true;
        this.lastRenderKey = '';
        this.renderInspector();
      });

      document.getElementById('btn-sell')?.addEventListener('click', () => {
        this.confirmingSellTowerId = tower.id;
        this.lastRenderKey = '';
        this.renderInspector();
      });

      document.getElementById('btn-confirm-sell')?.addEventListener('click', () => {
        const targetId = tower.id;
        this.confirmingSellTowerId = null;
        this.state.sellTower(targetId);
        this.lastRenderKey = '';
        this.renderInspector();
      });

      document.getElementById('btn-cancel-sell')?.addEventListener('click', () => {
        this.confirmingSellTowerId = null;
        this.lastRenderKey = '';
        this.renderInspector();
      });

      return;
    }

    // CASE 2: Free-form position clicked on map (selectedBuildPoint)
    if (buildPt) {
      const isTrapArea = buildPt.validFor === 'TRAP';
      if (this.inspectorTitleEl) {
        this.inspectorTitleEl.textContent = isTrapArea
          ? `⚙️ ĐẶT BẪY TẠI (${buildPt.x}, ${buildPt.y})`
          : `🏰 XÂY THÁP TẠI (${buildPt.x}, ${buildPt.y})`;
      }

      const availableTypes: TowerType[] = isTrapArea
        ? ['TRAP_SPIKE', 'TRAP_FIRE', 'TRAP_FROST', 'TRAP_NET']
        : ['BARRACKS', 'ARCHER', 'MAGE', 'ARTILLERY'];

      const optionsHtml = availableTypes
        .map((type) => {
          const bpKey = type.startsWith('TRAP_') ? type : `${type}_1`;
          const bp = TOWER_BLUEPRINTS[bpKey];
          const canAfford = this.state.gold >= bp.cost;
          const icon = ELEMENT_ICONS[bp.element] || (isTrapArea ? '⚙️' : '⚔️');
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

      this.inspectorContentEl.innerHTML = `
        <div class="insp-card">
          <div class="insp-header">
            <span class="insp-title">${isTrapArea ? 'Vị Trí Đường/Sông (Cho Phép Bẫy)' : 'Vị Trí Đất Trống (Cho Phép Tháp)'}</span>
            <button id="btn-slot-tree" class="btn-detail-link" title="Xem giải thích cẩm nang">
              📖 Cẩm nang
            </button>
          </div>
          <p style="font-size: 11px; color: #94a3b8; margin-top: 4px;">
            Nhấp chuột vào một công trình bên dưới để xây dựng trực tiếp tại tọa độ đã đánh dấu.
          </p>
        </div>
        <div class="build-options-list">${optionsHtml}</div>
        <button id="btn-cancel-point" class="action-btn" style="background: #334155; margin-top: 10px;">
          Hủy chọn điểm này (ESC)
        </button>
      `;

      document.getElementById('btn-slot-tree')?.addEventListener('click', () => {
        this.sidePanel.open(isTrapArea ? 'TRAPS' : 'BARRACKS');
      });

      document.getElementById('btn-cancel-point')?.addEventListener('click', () => {
        this.state.selectedBuildPoint = null;
        this.lastRenderKey = '';
        this.renderInspector();
      });

      this.inspectorContentEl.querySelectorAll('.build-option').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const type = (e.currentTarget as HTMLElement).getAttribute('data-type') as TowerType;
          if (type && this.state.selectedBuildPoint) {
            this.state.buildTowerAt(this.state.selectedBuildPoint.x, this.state.selectedBuildPoint.y, type);
            this.lastRenderKey = '';
            this.renderInspector();
          }
        });
      });

      return;
    }

    // CASE 3: Active placement type chosen from hotbar or keys
    if (this.state.activePlacementType) {
      if (this.inspectorTitleEl) {
        this.inspectorTitleEl.textContent = '📍 ĐANG CHỌN ĐẶT THÁP / BẪY';
      }

      const type = this.state.activePlacementType;
      const bp = TOWER_BLUEPRINTS[type.startsWith('TRAP_') ? type : `${type}_1`];
      const isTrap = type.startsWith('TRAP_');

      if (bp) {
        this.inspectorContentEl.innerHTML = `
          <div class="insp-card">
            <div class="insp-header">
              <span class="insp-title">${bp.name}</span>
              <button id="btn-placement-tree" class="btn-detail-link" title="Xem giải thích cẩm nang">
                📖 Xem chi tiết
              </button>
            </div>
            <p style="font-size: 12px; color: #cbd5e1; margin: 4px 0 8px 0;">${bp.description}</p>
            <div class="insp-stats-grid">
              <div class="insp-stat-item">
                <span class="isi-lbl">Chi phí</span>
                <span class="isi-val" style="color: #facc15;">🪙 ${bp.cost}</span>
              </div>
              <div class="insp-stat-item">
                <span class="isi-lbl">Sát thương</span>
                <span class="isi-val">${bp.damage}</span>
              </div>
              <div class="insp-stat-item">
                <span class="isi-lbl">Tầm bắn</span>
                <span class="isi-val">${bp.range} px</span>
              </div>
            </div>
          </div>

          <div style="background: rgba(59, 130, 246, 0.1); border: 1px dashed #3b82f6; border-radius: 6px; padding: 10px; text-align: center;">
            <p style="font-size: 11px; color: #93c5fd; line-height: 1.5;">
              ${
                isTrap
                  ? '👉 <b>BẪY:</b> Rà chuột và nhấp vào <b>TRÊN ĐƯỜNG BỘ</b> hoặc <b>DÒNG SÔNG</b> màu xanh lá để đặt!'
                  : '👉 <b>THÁP:</b> Rà chuột và nhấp vào <b>VÙNG ĐẤT TRỐNG NGOÀI ĐƯỜNG/SÔNG</b> màu xanh lá để xây dựng!'
              }
            </p>
            <button id="btn-cancel-placement" class="action-btn" style="margin-top: 8px; background: #334155; color: #fff;">
              Hủy chọn (ESC)
            </button>
          </div>
        `;

        document.getElementById('btn-placement-tree')?.addEventListener('click', () => {
          this.sidePanel.open(isTrap ? 'TRAPS' : type);
        });

        document.getElementById('btn-cancel-placement')?.addEventListener('click', () => {
          this.state.activePlacementType = null;
          this.updateArsenalVisuals();
          this.lastRenderKey = '';
          this.renderInspector();
        });
        return;
      }
    }

    // CASE 4: Default / Nothing selected
    if (this.inspectorTitleEl) {
      this.inspectorTitleEl.textContent = '🔍 BẢNG ĐIỀU KHIỂN & NÂNG CẤP';
    }

    this.inspectorContentEl.innerHTML = `
      <div class="inspector-empty">
        <span class="inspector-empty-icon">🏰</span>
        <p>
          Chưa chọn công trình nào.<br /><br />
          <b>Cách Đặt Tự Do:</b><br />
          • Chọn tháp/bẫy ở trên [1]-[8] rồi nhấp vị trí hợp lệ trên bản đồ.<br />
          • Hoặc nhấp chuột vào bất kỳ vị trí trống nào trên bản đồ để mở menu xây dựng.
        </p>
      </div>
    `;
  }
}
