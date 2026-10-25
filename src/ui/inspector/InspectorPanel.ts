import { GameState } from '../../core/GameState.js';
import { TOWER_BLUEPRINTS } from '../../config/towers.config.js';
import {
  ELEMENT_ICONS,
  ELEMENT_NAMES,
  SELECTABLE_ELEMENTS,
  ELEMENT_IMBUE_COST,
  MAGE_SECOND_ELEMENT_COST
} from '../../config/elements.config.js';
import { TowerType } from '../../types/entities.types.js';
import { MagicalElementType } from '../../types/elements.types.js';
import { SideDetailPanel } from '../SideDetailPanel.js';
import { MapSelectionModal } from '../modals/MapSelectionModal.js';
import { WaveSystem } from '../../systems/WaveSystem.js';
import { ENEMY_BLUEPRINTS } from '../../config/enemies.config.js';

export class InspectorPanel {
  private inspectorContentEl: HTMLElement;
  private inspectorTitleEl: HTMLElement | null;
  private menuOverlayEl: HTMLElement;
  private lastRenderKey: string = '';
  private confirmingSellTowerId: string | null = null;
  private currentWave: number = 1;
  private totalWaves: number = 15;
  private isWaveRunning: boolean = false;
  private onOpenMapModal?: () => void;

  constructor(
    private state: GameState,
    private sidePanel: SideDetailPanel,
    private onArsenalVisualsUpdate: () => void,
    onOpenMapModal?: () => void
  ) {
    this.inspectorContentEl = document.getElementById('inspector-content')!;
    this.inspectorTitleEl = document.getElementById('inspector-main-title');
    this.menuOverlayEl = document.getElementById('menu-overlay')!;
    this.onOpenMapModal = onOpenMapModal;
  }

  public handleResize(): void {
    this.lastRenderKey = '';
    this.render();
  }

  public openStageInfo(): void {
    this.state.selectedTowerId = null;
    this.state.selectedBuildPoint = null;
    this.state.activePlacementType = null;
    this.confirmingSellTowerId = null;
    this.lastRenderKey = '';
    this.render();
  }

  public render(currentWave?: number, totalWaves?: number, isWaveRunning?: boolean): void {
    if (currentWave !== undefined) this.currentWave = currentWave;
    if (totalWaves !== undefined) this.totalWaves = totalWaves;
    if (isWaveRunning !== undefined) this.isWaveRunning = isWaveRunning;

    const inspectorSection = document.getElementById('inspector-section');
    const prevScrollTop = inspectorSection ? inspectorSection.scrollTop : (this.inspectorContentEl.scrollTop || 0);

    const tower = this.state.getSelectedTower();
    const buildPt = this.state.selectedBuildPoint;

    const stageInfoBtn = document.getElementById('btn-stage-info');
    const isItemSelected = !!(tower || buildPt || this.state.activePlacementType);
    if (stageInfoBtn) {
      if (isItemSelected) {
        stageInfoBtn.classList.remove('active');
      } else {
        stageInfoBtn.classList.add('active');
      }
    }

    if (this.confirmingSellTowerId && (!tower || tower.id !== this.confirmingSellTowerId)) {
      this.confirmingSellTowerId = null;
    }

    let goldAffordKey = '';
    if (tower) {
      if (this.confirmingSellTowerId === tower.id) {
        // While confirming sell, gold changes should never trigger a re-render
        goldAffordKey = 'confirming_sell';
      } else if (tower.tier < 3) {
        const nextBp = TOWER_BLUEPRINTS[`${tower.type}_${tower.tier + 1}`];
        goldAffordKey = `${nextBp ? this.state.gold >= nextBp.cost : false}`;
      } else if (tower.tier === 3) {
        const bpA = TOWER_BLUEPRINTS[`${tower.type}_4_A`];
        const bpB = TOWER_BLUEPRINTS[`${tower.type}_4_B`];
        goldAffordKey = `${bpA ? this.state.gold >= bpA.cost : false}_${bpB ? this.state.gold >= bpB.cost : false}`;
      }
    } else if (buildPt) {
      const isTrapArea = buildPt.validFor === 'TRAP';
      const availableTypes: TowerType[] = isTrapArea
        ? ['TRAP_SPIKE', 'TRAP_FIRE', 'TRAP_FROST', 'TRAP_NET']
        : ['BARRACKS', 'ARCHER', 'MAGE', 'ARTILLERY'];
      goldAffordKey = availableTypes
        .map((t) => {
          const bpKey = t.startsWith('TRAP_') ? t : `${t}_1`;
          return (TOWER_BLUEPRINTS[bpKey]?.cost ?? 0) <= this.state.gold ? '1' : '0';
        })
        .join('');
    }

    const currentKey = `${this.state.currentMapId}_${this.currentWave}_${this.totalWaves}_${this.isWaveRunning}_${this.state.selectedTowerId}_${tower?.tier}_${tower?.element}_${tower?.secondaryElement}_${tower?.buffedElements?.join('-')}_${tower?.soldierMode}_${Math.ceil(tower?.disabledTimer || 0)}_${this.state.isSettingRallyPoint}_${this.state.activePlacementType}_${buildPt?.x}_${buildPt?.y}_${goldAffordKey}_${this.confirmingSellTowerId}`;
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
        this.render();
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
        const isAura = tower.tier === 4 && tower.branch === 'A';
        damageDisplay = `<b>${tower.damage}</b>${isAura ? '/s' : ''} (${ELEMENT_ICONS[tower.element]} ${ELEMENT_NAMES[tower.element]})`;
        if (tower.secondaryElement) {
          const secDmg = tower.damage; // 100%
          damageDisplay += ` + <b>${secDmg}</b>${isAura ? '/s' : ''} (${ELEMENT_ICONS[tower.secondaryElement]} ${ELEMENT_NAMES[tower.secondaryElement]})`;
        }
      } else {
        damageDisplay = `<b>${tower.damage}</b> (⚔️ Vật lý)`;
        if (tower.secondaryElement) {
          const secDmg = Math.max(1, Math.round(tower.damage * 0.45));
          damageDisplay += ` + <b>${secDmg}</b> (${ELEMENT_ICONS[tower.secondaryElement]} ${ELEMENT_NAMES[tower.secondaryElement]})`;
        }
      }

      if (tower.buffedElements && tower.buffedElements.length > 0) {
        for (const bElem of tower.buffedElements) {
          const bDmg =
            tower.type === 'MAGE'
              ? tower.damage
              : Math.max(1, Math.round(tower.damage * 0.45));
          damageDisplay += ` + <b style="color: #38bdf8;">${bDmg}</b> (${ELEMENT_ICONS[bElem]} ${ELEMENT_NAMES[bElem].split(' ')[0]} 🌟)`;
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
          ${
            tower.disabledTimer && tower.disabledTimer > 0
              ? `<div style="margin-top: 8px; background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; border-radius: 6px; padding: 6px 10px; color: #f87171; font-size: 11.5px; font-weight: 700; text-align: center;">⚡ THÁP ĐANG BỊ VÔ HIỆU HÓA (${tower.disabledTimer.toFixed(1)}s)</div>`
              : ''
          }
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
        this.render();
      });

      document.getElementById('btn-branch-a')?.addEventListener('click', () => {
        this.confirmingSellTowerId = null;
        this.state.upgradeTower(tower.id, 'A');
        this.lastRenderKey = '';
        this.render();
      });

      document.getElementById('btn-branch-b')?.addEventListener('click', () => {
        this.confirmingSellTowerId = null;
        this.state.upgradeTower(tower.id, 'B');
        this.lastRenderKey = '';
        this.render();
      });

      document.getElementById('btn-mode-melee')?.addEventListener('click', () => {
        this.confirmingSellTowerId = null;
        this.state.setBarracksSoldierMode(tower.id, 'MELEE');
        this.lastRenderKey = '';
        this.render();
      });

      document.getElementById('btn-mode-ranged')?.addEventListener('click', () => {
        this.confirmingSellTowerId = null;
        this.state.setBarracksSoldierMode(tower.id, 'RANGED');
        this.lastRenderKey = '';
        this.render();
      });

      this.inspectorContentEl.querySelectorAll('.elem-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          this.confirmingSellTowerId = null;
          const target = e.currentTarget as HTMLElement;
          const elem = target.getAttribute('data-elem') as MagicalElementType;
          const slotIndex = (parseInt(target.getAttribute('data-slot') || '1', 10) as 1 | 2);
          if (elem && tower) {
            const currentScroll = inspectorSection ? inspectorSection.scrollTop : 0;
            this.state.setTowerElement(tower.id, elem, slotIndex);
            this.lastRenderKey = '';
            this.render();
            if (inspectorSection && currentScroll > 0) {
              inspectorSection.scrollTop = currentScroll;
            }
          }
        });
      });

      document.getElementById('btn-rally')?.addEventListener('click', () => {
        this.confirmingSellTowerId = null;
        this.state.isSettingRallyPoint = true;
        this.lastRenderKey = '';
        this.render();
      });

      document.getElementById('btn-sell')?.addEventListener('click', () => {
        this.confirmingSellTowerId = tower.id;
        this.lastRenderKey = '';
        this.render();
      });

      document.getElementById('btn-confirm-sell')?.addEventListener('click', () => {
        const targetId = tower.id;
        this.confirmingSellTowerId = null;
        this.state.sellTower(targetId);
        this.lastRenderKey = '';
        this.render();
      });

      document.getElementById('btn-cancel-sell')?.addEventListener('click', () => {
        this.confirmingSellTowerId = null;
        this.lastRenderKey = '';
        this.render();
      });

      if (inspectorSection && prevScrollTop > 0) {
        inspectorSection.scrollTop = prevScrollTop;
      }

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
        this.render();
      });

      this.inspectorContentEl.querySelectorAll('.build-option').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const type = (e.currentTarget as HTMLElement).getAttribute('data-type') as TowerType;
          if (type && this.state.selectedBuildPoint) {
            this.state.buildTowerAt(this.state.selectedBuildPoint.x, this.state.selectedBuildPoint.y, type);
            this.lastRenderKey = '';
            this.render();
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
          this.onArsenalVisualsUpdate();
          this.lastRenderKey = '';
          this.render();
        });
        return;
      }
    }

    // CASE 4: Stage Info & Waves breakdown
    if (this.inspectorTitleEl) {
      this.inspectorTitleEl.textContent = '🗺️ THÔNG TIN MÀN CHƠI & ĐỢT QUÁI';
    }

    const currentMap = this.state.currentMap;
    const tribe = currentMap.tribe;
    const badges = currentMap.laneBadges || ['1 Đường Bộ', '1 Đường Thủy'];
    const totalWavesCount = this.totalWaves || this.state.customTotalWaves || 15;
    const waveSystem = new WaveSystem(currentMap, totalWavesCount);
    const displayWavesLimit = Math.min(10, totalWavesCount);

    let wavesListHtml = '';
    for (let w = 0; w < displayWavesLimit; w++) {
      const waveConfig = waveSystem.generateWaveConfig(w, totalWavesCount);
      const waveNum = w + 1;
      const isPast = waveNum < this.currentWave;
      const isCurrent = waveNum === this.currentWave;

      let statusTag = '';
      let cardClass = 'stage-wave-card';
      if (isCurrent) {
        cardClass += ' current-wave';
        statusTag = this.isWaveRunning
          ? `<span class="sw-status-tag current">⚔️ Đang diễn ra</span>`
          : `<span class="sw-status-tag current">⏳ Sắp tới</span>`;
      } else if (isPast) {
        cardClass += ' past-wave';
        statusTag = `<span class="sw-status-tag past">✓ Đã vượt qua</span>`;
      } else {
        cardClass += ' future-wave';
        statusTag = `<span class="sw-status-tag future">Đợt ${waveNum}</span>`;
      }

      const hpBonusPct = waveNum > 10 ? (waveNum - 10) * 10 : 0;
      const hpBonusTag = hpBonusPct > 0 ? `<span class="sw-hp-bonus">❤️ +${hpBonusPct}% Máu</span>` : '';

      const enemyPills = waveConfig.enemies.map((entry) => {
        const bp = ENEMY_BLUEPRINTS[entry.typeId];
        if (!bp) return '';
        const elemIcon = ELEMENT_ICONS[bp.elementalProfile.primaryElement] || '';
        const moveIcon = bp.movementType === 'FLY' ? '🦅' : bp.movementType === 'SWIM' ? '🌊' : '🚶';
        const isBoss = bp.tags.includes('BOSS');
        const isElite = bp.tags.includes('ELITE');
        const badgeTag = isBoss
          ? '<span class="enemy-badge boss">👑 TRÙM</span>'
          : isElite
          ? '<span class="enemy-badge elite">🌟 TINH NHUỆ</span>'
          : '';

        return `
          <div class="stage-enemy-item ${isBoss ? 'boss-item' : ''}" data-open-codex="ENEMIES" data-codex-target="${bp.typeId}" title="Nhấp để xem chi tiết quái trong Cẩm Nang">
            <div class="sei-header">
              <span class="sei-name">${elemIcon} ${bp.name}</span>
              <span class="sei-count">x${entry.count}</span>
            </div>
            <div class="sei-sub">
              <span class="sei-move">${moveIcon} ${bp.movementType === 'FLY' ? 'Đường Bay' : bp.movementType === 'SWIM' ? 'Đường Thủy' : 'Đường Bộ'}</span>
              ${badgeTag}
            </div>
          </div>
        `;
      }).join('');

      wavesListHtml += `
        <div class="${cardClass}">
          <div class="sw-card-header">
            <div class="sw-card-title-group">
              <span class="sw-wave-name">${waveConfig.name}</span>
              ${statusTag}
            </div>
            <div class="sw-card-meta">
              <span class="sw-reward">🪙 +${waveConfig.rewardGold}</span>
              ${hpBonusTag}
            </div>
          </div>
          <div class="sw-enemies-grid">
            ${enemyPills}
          </div>
        </div>
      `;
    }

    if (totalWavesCount > 10) {
      wavesListHtml += `
        <div class="stage-wave-card post-10-notice-card" style="text-align: center; background: rgba(30, 41, 59, 0.4); border: 1px dashed #334155; padding: 10px;">
          <div style="font-size: 11.5px; font-weight: 700; color: #94a3b8;">
            🌊 Các đợt tiếp theo (Đợt 11 đến ${totalWavesCount})
          </div>
          <div style="font-size: 10.5px; color: #64748b; margin-top: 2px;">
            Số lượng quái và độ khó tự động khuếch đại theo tiến trình chiến dịch.
          </div>
        </div>
      `;
    }

    this.inspectorContentEl.innerHTML = `
      <div class="insp-stage-info-container">
        <!-- Map Info Header Card -->
        <div class="insp-card stage-overview-card">
          <div class="insp-header">
            <div class="insp-title-box">
              <span class="insp-title">${currentMap.name}</span>
              <span class="insp-tier-badge" style="background: #3b82f6;">${totalWavesCount} Đợt</span>
            </div>
            <button id="btn-inspector-change-map" class="btn-detail-link" title="Đổi bản đồ chiến lược">
              🗺️ Đổi Bản Đồ
            </button>
          </div>
          <p class="stage-map-subtitle">${currentMap.subtitle}</p>

          <div class="stage-mini-map-wrap">
            ${MapSelectionModal.generateMiniMapSvg(currentMap)}
          </div>

          ${
            tribe
              ? `
            <div class="stage-tribe-card">
              <div class="st-header">
                <span class="st-title">${tribe.icon} ${tribe.name}</span>
                <div class="st-elems">
                  ${tribe.elements.map((el) => `<span title="${ELEMENT_NAMES[el]}">${ELEMENT_ICONS[el]}</span>`).join('')}
                </div>
              </div>
              <p class="st-desc">${tribe.description}</p>
            </div>
          `
              : ''
          }

          <div class="stage-lanes-row">
            ${badges.map((b) => `<span class="map-lane-pill">🛡️ ${b}</span>`).join('')}
          </div>

          <p class="stage-map-desc">${currentMap.description}</p>
        </div>

        <!-- Wave List Header -->
        <div class="stage-waves-header">
          <div class="sw-header-title">
            <span>🌊 DANH SÁCH ĐỢT QUÁI (ĐỢT 1 - ${displayWavesLimit})</span>
            <span class="sw-progress-badge">Đang ở Đợt ${this.currentWave}/${totalWavesCount}</span>
          </div>
          <span class="sw-header-hint">Hiển thị thông tin 10 đợt đầu • Nhấp vào quái vật để mở cẩm nang</span>
        </div>

        <div class="stage-waves-scroll-list">
          ${wavesListHtml}
        </div>
      </div>
    `;

    document.getElementById('btn-inspector-change-map')?.addEventListener('click', () => {
      if (this.onOpenMapModal) {
        this.onOpenMapModal();
      }
    });

    if (inspectorSection && prevScrollTop > 0) {
      inspectorSection.scrollTop = prevScrollTop;
    }
  }
}

