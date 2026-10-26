import { GameState } from '../../core/GameState.js';
import { MAPS_CONFIG } from '../../config/map.config.js';
import { SoundSystem } from '../../systems/SoundSystem.js';
import { UI_ICONS } from '../../config/ui/icons/index.js';

export interface HUDCallbacks {
  onCallWave: () => void;
  onRestart: () => void;
  onOpenMapModal: () => void;
  onSelectMap: (mapId: string) => void;
}

export class HUDManager {
  private messageBannerEl: HTMLElement;
  private hudMapNameEl: HTMLElement | null;
  private hudMapWavesEl: HTMLElement | null;
  private bannerState: 'NONE' | 'GAME_OVER' | 'VICTORY' = 'NONE';

  constructor(
    private state: GameState,
    private callbacks: HUDCallbacks
  ) {
    this.messageBannerEl = document.getElementById('message-banner')!;
    this.hudMapNameEl = document.getElementById('hud-map-name');
    this.hudMapWavesEl = document.getElementById('hud-map-waves');

    this.bindEvents();
  }

  private bindEvents(): void {
    // Sound toggle button
    const soundBtn = document.getElementById('btn-sound-toggle');
    if (soundBtn) {
      soundBtn.innerHTML = this.state.soundEnabled ? UI_ICONS.SOUND_ON : UI_ICONS.SOUND_OFF;
      soundBtn.addEventListener('click', () => {
        this.toggleSound();
      });
    }

    // Left panel Wave button
    const nextWaveBtn = document.getElementById('btn-next-wave');
    if (nextWaveBtn) {
      nextWaveBtn.addEventListener('click', () => {
        this.callbacks.onCallWave();
      });
    }

    // Speed button
    const speedBtn = document.getElementById('btn-speed');
    if (speedBtn) {
      speedBtn.innerHTML = `${UI_ICONS.BOLT} x${this.state.gameSpeed}`;
      speedBtn.addEventListener('click', () => {
        this.state.gameSpeed = this.state.gameSpeed === 1 ? 2 : 1;
        speedBtn.innerHTML = `${UI_ICONS.BOLT} x${this.state.gameSpeed}`;
        this.state.saveSettingsToStorage();
      });
    }

    // Pause button
    const pauseBtn = document.getElementById('btn-pause');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        this.state.isPaused = !this.state.isPaused;
        pauseBtn.innerHTML = this.state.isPaused ? `${UI_ICONS.PLAY} Tiếp tục` : `${UI_ICONS.PAUSE} Tạm dừng`;
      });
    }

    // Restart button
    const restartBtn = document.getElementById('btn-restart');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.clearBanner();
        this.callbacks.onRestart();
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
          fullscreenBtn.innerHTML = UI_ICONS.FULLSCREEN_EXIT;
          fullscreenBtn.title = 'Thoát toàn màn hình (F)';
        } else {
          fullscreenBtn.innerHTML = UI_ICONS.FULLSCREEN;
          fullscreenBtn.title = 'Toàn màn hình (F)';
        }
      };

      document.addEventListener('fullscreenchange', updateFullscreenLabel);
    }
  }

  public toggleSound(): void {
    this.state.soundEnabled = !this.state.soundEnabled;
    SoundSystem.setEnabled(this.state.soundEnabled);
    const soundBtn = document.getElementById('btn-sound-toggle');
    if (soundBtn) {
      soundBtn.innerHTML = this.state.soundEnabled ? UI_ICONS.SOUND_ON : UI_ICONS.SOUND_OFF;
    }
    this.state.saveSettingsToStorage();
    if (this.state.soundEnabled) {
      SoundSystem.playUIClick();
    }
  }

  public updateHUD(currentWave: number, totalWaves: number, isWaveRunning: boolean): void {
    const goldEl = document.getElementById('hud-gold');
    const livesEl = document.getElementById('hud-lives');
    const waveEl = document.getElementById('hud-wave');
    const waveHpBuffEl = document.getElementById('hud-wave-hp-buff');
    const nextWaveBtn = document.getElementById('btn-next-wave') as HTMLButtonElement;

    if (goldEl) goldEl.textContent = `${this.state.gold}`;
    if (livesEl) livesEl.textContent = `${this.state.lives}/${this.state.maxLives}`;
    if (waveEl) {
      waveEl.textContent = `${currentWave}/${totalWaves}`;
      if (currentWave > 10) {
        const bonusPct = (currentWave - 10) * 10;
        waveEl.title = `Đợt ${currentWave}: Quái tăng +${bonusPct}% máu tối đa!`;
      } else {
        waveEl.title = '';
      }
    }

    // Hiển thị trực tiếp trên HUD nhãn tăng máu của quái sau Wave 10
    if (waveHpBuffEl) {
      if (currentWave > 10) {
        const bonusPct = (currentWave - 10) * 10;
        waveHpBuffEl.innerHTML = `${UI_ICONS.HEART} +${bonusPct}% Máu`;
        waveHpBuffEl.title = `Sau Wave 10, mỗi wave quái tăng 10% máu tối đa (Đợt ${currentWave}: +${bonusPct}%)`;
        waveHpBuffEl.style.display = 'inline-flex';
        waveHpBuffEl.classList.remove('hidden');
      } else {
        waveHpBuffEl.innerHTML = '';
        waveHpBuffEl.style.display = 'none';
        waveHpBuffEl.classList.add('hidden');
      }
    }

    if (this.hudMapNameEl) {
      this.hudMapNameEl.textContent = this.state.currentMap.name;
    }
    if (this.hudMapWavesEl) {
      if (currentWave > 10) {
        const bonusPct = (currentWave - 10) * 10;
        this.hudMapWavesEl.innerHTML = `Mục tiêu: ${totalWaves} đợt <span class="map-hp-sub-note">(Quái +${bonusPct}% Máu)</span>`;
      } else {
        this.hudMapWavesEl.textContent = `Mục tiêu: ${totalWaves} đợt`;
      }
    }

    if (nextWaveBtn) {
      if (this.state.isGameOver || this.state.isVictory) {
        nextWaveBtn.disabled = true;
        nextWaveBtn.innerHTML = this.state.isVictory ? `${UI_ICONS.TROPHY} Đã hoàn thành` : `${UI_ICONS.SKULL} Trận đấu kết thúc`;
      } else if (isWaveRunning) {
        if (currentWave >= totalWaves) {
          nextWaveBtn.disabled = true;
          nextWaveBtn.innerHTML = `${UI_ICONS.SWORDS} Đang diễn ra đợt cuối`;
        } else {
          nextWaveBtn.disabled = false;
          nextWaveBtn.innerHTML = `${UI_ICONS.BOLT} Gọi đợt kế tiếp (+ Vàng)`;
        }
      } else {
        if (currentWave > totalWaves) {
          nextWaveBtn.disabled = true;
          nextWaveBtn.innerHTML = `${UI_ICONS.TROPHY} Đã hết đợt quái`;
        } else {
          nextWaveBtn.disabled = false;
          nextWaveBtn.innerHTML = currentWave === 1 ? `${UI_ICONS.SWORDS} Bắt đầu Đợt Quái` : `${UI_ICONS.SWORDS} Bắt đầu Đợt ${currentWave}`;
        }
      }
    }

    this.updateMessageBanner(totalWaves);
  }

  public clearBanner(): void {
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
            <h2>${UI_ICONS.SKULL} THẤT THỦ!</h2>
            <p>Căn cứ đã bị quái vật tràn vào tiêu diệt.</p>
            <div style="display: flex; gap: 8px; justify-content: center; margin-top: 10px;">
              <button id="btn-banner-restart" class="action-btn" style="flex: 1;">${UI_ICONS.RESTART} Chơi lại</button>
              <button id="btn-banner-change-map" class="action-btn" style="background: #3b82f6; color: #fff; flex: 1;">${UI_ICONS.MAP} Đổi bản đồ</button>
            </div>
          </div>
        `;
        document.getElementById('btn-banner-restart')?.addEventListener('click', () => {
          this.clearBanner();
          this.callbacks.onRestart();
        });
        document.getElementById('btn-banner-change-map')?.addEventListener('click', () => {
          this.callbacks.onOpenMapModal();
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
            <h2>${UI_ICONS.TROPHY} CHIẾN THẮNG QUANG VINH!</h2>
            <p>Bạn đã chặn đứng toàn bộ ${totalWaves} đợt xâm lăng và bảo vệ thành công căn cứ!</p>
            <div style="display: flex; gap: 8px; justify-content: center; margin-top: 10px; flex-wrap: wrap;">
              <button id="btn-banner-restart" class="action-btn" style="flex: 1; min-width: 95px;">${UI_ICONS.RESTART} Chơi lại</button>
              ${nextMap ? `<button id="btn-banner-next-map" class="action-btn" style="background: #10b981; color: #fff; flex: 1; min-width: 120px;">${UI_ICONS.FAST_FORWARD} Bản đồ kế tiếp</button>` : ''}
              <button id="btn-banner-change-map" class="action-btn" style="background: #3b82f6; color: #fff; flex: 1; min-width: 95px;">${UI_ICONS.MAP} ${nextMap ? 'Chọn bản đồ' : 'Đổi bản đồ'}</button>
            </div>
          </div>
        `;

        document.getElementById('btn-banner-restart')?.addEventListener('click', () => {
          this.clearBanner();
          this.callbacks.onRestart();
        });

        if (nextMap) {
          document.getElementById('btn-banner-next-map')?.addEventListener('click', () => {
            this.clearBanner();
            this.callbacks.onSelectMap(nextMap.id);
          });
        }

        document.getElementById('btn-banner-change-map')?.addEventListener('click', () => {
          this.callbacks.onOpenMapModal();
        });
      }
    } else {
      if (this.bannerState !== 'NONE') {
        this.clearBanner();
      }
    }
  }
}

