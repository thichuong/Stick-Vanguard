import { GameState } from '../../core/GameState.js';
import { TOWER_BLUEPRINTS } from '../../config/towers.config.js';
import {
  ELEMENT_ICONS,
  ELEMENT_NAMES,
  SELECTABLE_ELEMENTS,
  ELEMENT_IMBUE_COST,
  MAGE_SECOND_ELEMENT_COST
} from '../../config/elements.config.js';
import { TowerEntity, TowerType } from '../../types/entities.types.js';
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
  private currentTab: 'CHOOSE_TOWER' | 'STAGE_INFO' = 'CHOOSE_TOWER';
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

    const btnChooseTower = document.getElementById('btn-choose-tower');
    if (btnChooseTower) {
      btnChooseTower.addEventListener('click', () => {
        this.openChooseTower();
      });
    }

    const btnStageInfo = document.getElementById('btn-stage-info');
    if (btnStageInfo) {
      btnStageInfo.addEventListener('click', () => {
        this.openStageInfo();
      });
    }
  }

  public handleResize(): void {
    this.lastRenderKey = '';
    this.render();
  }

  public openChooseTower(): void {
    this.currentTab = 'CHOOSE_TOWER';
    this.state.selectedTowerId = null;
    this.state.selectedBuildPoint = null;
    this.state.hoveredBuildTowerType = null;
    this.confirmingSellTowerId = null;
    this.lastRenderKey = '';
    this.render();
  }

  public openStageInfo(): void {
    this.currentTab = 'STAGE_INFO';
    this.state.selectedTowerId = null;
    this.state.selectedBuildPoint = null;
    this.state.activePlacementType = null;
    this.state.hoveredBuildTowerType = null;
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

    const btnChooseTower = document.getElementById('btn-choose-tower');
    const btnStageInfo = document.getElementById('btn-stage-info');
    if (tower) {
      btnChooseTower?.classList.remove('active');
      btnStageInfo?.classList.remove('active');
    } else if (buildPt) {
      btnChooseTower?.classList.add('active');
      btnStageInfo?.classList.remove('active');
    } else if (this.state.activePlacementType) {
      btnChooseTower?.classList.add('active');
      btnStageInfo?.classList.remove('active');
    } else {
      btnChooseTower?.classList.toggle('active', this.currentTab === 'CHOOSE_TOWER');
      btnStageInfo?.classList.toggle('active', this.currentTab === 'STAGE_INFO');
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
        : ['ARCHER', 'MAGE', 'ARTILLERY', 'BARRACKS', 'DRAGON_NEST', 'FAIRY_TREE', 'HEROIC_ALTAR'];
      goldAffordKey = availableTypes
        .map((t) => {
          const bpKey = t.startsWith('TRAP_') ? t : `${t}_1`;
          return (TOWER_BLUEPRINTS[bpKey]?.cost ?? 0) <= this.state.gold ? '1' : '0';
        })
        .join('');
    } else {
      const allTypes: TowerType[] = [
        'ARCHER', 'MAGE', 'ARTILLERY',
        'BARRACKS', 'DRAGON_NEST', 'FAIRY_TREE', 'HEROIC_ALTAR',
        'TRAP_SPIKE', 'TRAP_FIRE', 'TRAP_FROST', 'TRAP_NET'
      ];
      goldAffordKey = allTypes
        .map((t) => {
          const bpKey = t.startsWith('TRAP_') ? t : `${t}_1`;
          return (TOWER_BLUEPRINTS[bpKey]?.cost ?? 0) <= this.state.gold ? '1' : '0';
        })
        .join('');
    }

    const currentKey = `${this.currentTab}_${this.state.currentMapId}_${this.currentWave}_${this.totalWaves}_${this.isWaveRunning}_${this.state.selectedTowerId}_${tower?.tier}_${tower?.element}_${tower?.secondaryElement}_${tower?.buffedElements?.join('-')}_${tower?.soldierMode}_${Math.ceil(tower?.disabledTimer || 0)}_${this.state.isSettingRallyPoint}_${this.state.activePlacementType}_${buildPt?.x}_${buildPt?.y}_${goldAffordKey}_${this.confirmingSellTowerId}`;
    if (currentKey === this.lastRenderKey) {
      if (tower && (tower.type === 'BARRACKS' || tower.type === 'DRAGON_NEST' || tower.type === 'FAIRY_TREE' || tower.type === 'HEROIC_ALTAR')) {
        this.updateLiveSummonedUnits(tower);
      }
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
      const isSummon =
        tower.type === 'BARRACKS' ||
        tower.type === 'DRAGON_NEST' ||
        tower.type === 'FAIRY_TREE' ||
        tower.type === 'HEROIC_ALTAR';
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
      } else if (tower.type === 'DRAGON_NEST') {
        damageDisplay = `<b>${tower.damage}</b> (🐉 Hệ Rồng - 💥 Nổ Lan ${tower.aoeRadius || 55}px - 🦅 Chặn Quái Bay)`;
        if (tower.secondaryElement) {
          const secDmg = Math.max(1, Math.round(tower.damage * 0.6));
          damageDisplay += ` + <b>${secDmg}</b> (${ELEMENT_ICONS[tower.secondaryElement]} ${ELEMENT_NAMES[tower.secondaryElement]})`;
        }
      } else if (tower.type === 'FAIRY_TREE') {
        damageDisplay = `<b>${tower.damage}</b> (🧚 Hệ Tiên - 🦅 Chặn Quái Bay)`;
        if (tower.secondaryElement) {
          const secDmg = Math.max(1, Math.round(tower.damage * 0.6));
          damageDisplay += ` + <b>${secDmg}</b> (${ELEMENT_ICONS[tower.secondaryElement]} ${ELEMENT_NAMES[tower.secondaryElement]})`;
        }
      } else if (tower.type === 'HEROIC_ALTAR') {
        const ghostPct = Math.round((tower.spiritGhostRatio ?? (tower.branch === 'B' ? 1.0 : 0.5)) * 100);
        damageDisplay = `<span style="color: #a5b4fc;">👻 Hồi sinh đồng minh tử trận (+${ghostPct}% DMG Ma)</span><br><span style="color: #818cf8;">Tỉ lệ chiêu hồn: <b>${Math.round((tower.resurrectChance || 0.3) * 100)}%</b> • Anh Linh: <b>${tower.soldierIds?.length || 0}/${tower.maxSoldiers || 2}</b></span>`;
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
        } else if (tower.type === 'DRAGON_NEST') {
          elementPickerHtml = `
            <div class="elem-picker-section">
              <div class="picker-header">
                <span>🔥 NGUYÊN TỐ THỨ 2 CỦA RỒNG (GỐC: 🐉 HỆ RỒNG):</span>
                <span class="cost-pill">🪙 ${ELEMENT_IMBUE_COST}</span>
              </div>
              <div class="current-elem-text">Đang dùng: <b>${tower.secondaryElement ? `${ELEMENT_ICONS[tower.secondaryElement]} ${ELEMENT_NAMES[tower.secondaryElement]}` : '🔥 Hỏa (Mặc định)'}</b></div>
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
        } else if (tower.type === 'FAIRY_TREE') {
          elementPickerHtml = `
            <div class="elem-picker-section">
              <div class="picker-header">
                <span>✨ NGUYÊN TỐ THỨ 2 CỦA TIÊN (GỐC: 🧚 HỆ TIÊN):</span>
                <span class="cost-pill">🪙 ${ELEMENT_IMBUE_COST}</span>
              </div>
              <div class="current-elem-text">Đang dùng: <b>${tower.secondaryElement ? `${ELEMENT_ICONS[tower.secondaryElement]} ${ELEMENT_NAMES[tower.secondaryElement]}` : '✨ Quang (Mặc định)'}</b></div>
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
        } else if (tower.type === 'HEROIC_ALTAR') {
          elementPickerHtml = `
            <div class="elem-picker-section" style="border-left: 3px solid #818cf8; background: rgba(99, 102, 241, 0.08); padding: 8px 10px; border-radius: 6px;">
              <div class="picker-header">
                <span>👻 THUỘC TÍNH BẢN THỂ:</span>
              </div>
              <div class="current-elem-text">Đang dùng: <b>👻 Hệ Ma (Cố định)</b></div>
              <p style="font-size: 11px; color: #94a3b8; margin: 4px 0 0 0; line-height: 1.4;">
                Tế Đàn Anh Linh không gắn thêm nguyên tố. Khi lính, rồng hoặc tiên tử trận, Anh Linh được triệu hồi sẽ tự động mang thêm Hệ Ma (+50% Sát thương Ma).
              </p>
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
              <span class="isi-lbl">${isSummon ? 'Tầm điều động' : 'Tầm bắn'}</span>
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
            ${isSummon ? 'Sát thương đơn vị triệu hồi:' : 'Sát thương:'} ${damageDisplay}
          </div>
          ${
            isSummon
              ? `<div style="margin-top: 4px; font-size: 10.5px; color: #38bdf8;">🚩 Tháp triệu hồi không trực tiếp tấn công; đơn vị triệu hồi sẽ ra chốt chặn và chiến đấu.</div>`
              : ''
          }
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
                isSummon
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
                  isSummon
                    ? `<button id="btn-rally" class="action-btn rally-btn">🚩 Điểm Tập Kết</button>`
                    : ''
                }
                <button id="btn-sell" class="action-btn sell-btn">💰 Bán (+${refund} 🪙)</button>
              </div>
            `
        }

        ${isSummon ? this.renderSummonedUnitsSectionHtml(tower) : ''}
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

      const renderOption = (type: TowerType) => {
        const bpKey = type.startsWith('TRAP_') ? type : `${type}_1`;
        const bp = TOWER_BLUEPRINTS[bpKey];
        if (!bp) return '';
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
      };

      let optionsSectionHtml = '';
      if (isTrapArea) {
        const trapTypes: TowerType[] = ['TRAP_SPIKE', 'TRAP_FIRE', 'TRAP_FROST', 'TRAP_NET'];
        optionsSectionHtml = `
          <div style="font-size: 11px; font-weight: 700; color: #f59e0b; margin: 8px 0 4px 2px;">⚙️ 3. BẪY CHIẾN THUẬT</div>
          <div class="build-options-list">${trapTypes.map(renderOption).join('')}</div>
        `;
      } else {
        const defenseTypes: TowerType[] = ['ARCHER', 'MAGE', 'ARTILLERY'];
        const summonTypes: TowerType[] = ['BARRACKS', 'DRAGON_NEST', 'FAIRY_TREE', 'HEROIC_ALTAR'];
        optionsSectionHtml = `
          <div style="font-size: 11px; font-weight: 700; color: #60a5fa; margin: 8px 0 4px 2px;">🏰 1. THÁP PHÒNG NGỰ</div>
          <div class="build-options-list" style="margin-bottom: 10px;">${defenseTypes.map(renderOption).join('')}</div>

          <div style="font-size: 11px; font-weight: 700; color: #a78bfa; margin: 8px 0 4px 2px;">🐉 2. THÁP TRIỆU HỒI</div>
          <div class="build-options-list">${summonTypes.map(renderOption).join('')}</div>
        `;
      }

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
        ${optionsSectionHtml}
        <button id="btn-cancel-point" class="action-btn" style="background: #334155; margin-top: 10px;">
          Hủy chọn điểm này (ESC)
        </button>
      `;

      document.getElementById('btn-slot-tree')?.addEventListener('click', () => {
        this.sidePanel.open(isTrapArea ? 'TRAPS' : 'BARRACKS');
      });

      document.getElementById('btn-cancel-point')?.addEventListener('click', () => {
        this.state.selectedBuildPoint = null;
        this.state.hoveredBuildTowerType = null;
        this.lastRenderKey = '';
        this.render();
      });

      this.inspectorContentEl.querySelectorAll('.build-option').forEach((btn) => {
        const type = btn.getAttribute('data-type') as TowerType;
        btn.addEventListener('mouseenter', () => {
          this.state.hoveredBuildTowerType = type;
        });
        btn.addEventListener('mouseleave', () => {
          if (this.state.hoveredBuildTowerType === type) {
            this.state.hoveredBuildTowerType = null;
          }
        });
        btn.addEventListener('click', (e) => {
          this.state.hoveredBuildTowerType = null;
          const clickedType = (e.currentTarget as HTMLElement).getAttribute('data-type') as TowerType;
          if (clickedType && this.state.selectedBuildPoint) {
            this.state.buildTowerAt(this.state.selectedBuildPoint.x, this.state.selectedBuildPoint.y, clickedType);
            this.lastRenderKey = '';
            this.render();
          }
        });
      });

      return;
    }

    // CASE 3: Tower Catalog Mode (or active placement type selected)
    if (this.currentTab === 'CHOOSE_TOWER' || this.state.activePlacementType !== null) {
      if (this.inspectorTitleEl) {
        this.inspectorTitleEl.textContent = '🏗️ DANH SÁCH THÁP & BẪY';
      }

      const activeType = this.state.activePlacementType;
      const activeBp = activeType
        ? TOWER_BLUEPRINTS[activeType.startsWith('TRAP_') ? activeType : `${activeType}_1`]
        : null;
      const isTrap = activeType?.startsWith('TRAP_');

      let bannerHtml = '';
      if (activeBp) {
        bannerHtml = `
          <div class="insp-card" style="border: 1px solid #3b82f6; background: rgba(59, 130, 246, 0.12); margin-bottom: 8px;">
            <div style="font-weight: 700; color: #60a5fa; font-size: 12.5px; margin-bottom: 4px;">
              📍 ĐANG CHỌN: ${activeBp.name.toUpperCase()} (🪙 ${activeBp.cost})
            </div>
            <p style="font-size: 11px; color: #cbd5e1; margin-bottom: 8px; line-height: 1.4;">
              ${
                isTrap
                  ? '👉 Nhấp chuột vào <b>ĐƯỜNG BỘ</b> hoặc <b>DÒNG SÔNG</b> màu xanh để đặt bẫy!'
                  : '👉 Nhấp chuột vào <b>ĐẤT TRỐNG</b> (ngoài đường & sông) màu xanh để xây tháp!'
              }
            </p>
            <div style="display: flex; gap: 8px;">
              <button id="btn-cancel-placement-cat" class="action-btn" style="background: #334155; padding: 4px 10px; font-size: 11px; width: auto;">
                ✖ Hủy chọn (ESC)
              </button>
              <button id="btn-view-codex-cat" class="action-btn" style="background: #1e3a8a; padding: 4px 10px; font-size: 11px; width: auto;">
                📖 Cẩm nang
              </button>
            </div>
          </div>
        `;
      } else {
        bannerHtml = `
          <div class="insp-card" style="margin-bottom: 8px;">
            <div style="font-weight: 700; color: #facc15; font-size: 12px; margin-bottom: 2px;">
              💡 CHỌN THÁP ĐỂ XÂY DỰNG
            </div>
            <p style="font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.4;">
              Bấm chọn một tháp bên dưới (hoặc phím [1]-[0]), sau đó nhấp vào bản đồ để đặt. Bạn cũng có thể nhấp vào ô đất trống trên bản đồ trước!
            </p>
          </div>
        `;
      }

      const keyNumberMap: Record<TowerType, string> = {
        ARCHER: '1',
        MAGE: '2',
        ARTILLERY: '3',
        BARRACKS: '4',
        DRAGON_NEST: '5',
        FAIRY_TREE: '6',
        HEROIC_ALTAR: '7',
        TRAP_SPIKE: '8',
        TRAP_FIRE: '9',
        TRAP_FROST: '0',
        TRAP_NET: '-'
      };

      const renderCatalogOption = (type: TowerType) => {
        const bpKey = type.startsWith('TRAP_') ? type : `${type}_1`;
        const bp = TOWER_BLUEPRINTS[bpKey];
        if (!bp) return '';
        const canAfford = this.state.gold >= bp.cost;
        const isSelected = this.state.activePlacementType === type;
        const icon = ELEMENT_ICONS[bp.element] || (type.startsWith('TRAP_') ? '⚙️' : '⚔️');
        const hotkey = keyNumberMap[type] || '';
        const rangeText = type.startsWith('TRAP_')
          ? `${bp.triggerRadius || bp.range || 40}px`
          : `${bp.range}px`;
        return `
          <button class="build-option ${isSelected ? 'active' : ''} ${canAfford ? '' : 'disabled'}" data-type="${type}">
            <div class="opt-top">
              <span>
                <span class="opt-key">[${hotkey}]</span>
                <span class="opt-name">${bp.name}</span>
              </span>
              <span class="opt-cost">🪙 ${bp.cost}</span>
            </div>
            <div class="opt-desc">${icon} [${bp.element}] • ⚔️ ${bp.damage} • 🎯 ${rangeText} • ${bp.description}</div>
          </button>
        `;
      };

      const defenseTypes: TowerType[] = ['ARCHER', 'MAGE', 'ARTILLERY'];
      const summonTypes: TowerType[] = ['BARRACKS', 'DRAGON_NEST', 'FAIRY_TREE', 'HEROIC_ALTAR'];
      const trapTypes: TowerType[] = ['TRAP_SPIKE', 'TRAP_FIRE', 'TRAP_FROST', 'TRAP_NET'];

      this.inspectorContentEl.innerHTML = `
        ${bannerHtml}
        <div style="font-size: 11px; font-weight: 700; color: #60a5fa; margin: 8px 0 4px 2px;">🏰 1. THÁP PHÒNG NGỰ</div>
        <div class="build-options-list" style="margin-bottom: 10px;">${defenseTypes.map(renderCatalogOption).join('')}</div>

        <div style="font-size: 11px; font-weight: 700; color: #a78bfa; margin: 8px 0 4px 2px;">🐉 2. THÁP TRIỆU HỒI</div>
        <div class="build-options-list" style="margin-bottom: 10px;">${summonTypes.map(renderCatalogOption).join('')}</div>

        <div style="font-size: 11px; font-weight: 700; color: #f59e0b; margin: 8px 0 4px 2px;">⚙️ 3. BẪY CHIẾN THUẬT (ĐƯỜNG & SÔNG)</div>
        <div class="build-options-list">${trapTypes.map(renderCatalogOption).join('')}</div>
      `;

      document.getElementById('btn-cancel-placement-cat')?.addEventListener('click', () => {
        this.state.activePlacementType = null;
        this.state.hoveredBuildTowerType = null;
        this.onArsenalVisualsUpdate();
        this.lastRenderKey = '';
        this.render();
      });

      document.getElementById('btn-view-codex-cat')?.addEventListener('click', () => {
        if (activeType) {
          this.sidePanel.open(isTrap ? 'TRAPS' : activeType);
        }
      });

      this.inspectorContentEl.querySelectorAll('.build-option').forEach((btn) => {
        const type = btn.getAttribute('data-type') as TowerType;
        btn.addEventListener('mouseenter', () => {
          this.state.hoveredBuildTowerType = type;
        });
        btn.addEventListener('mouseleave', () => {
          if (this.state.hoveredBuildTowerType === type) {
            this.state.hoveredBuildTowerType = null;
          }
        });
        btn.addEventListener('click', (e) => {
          const clickedType = (e.currentTarget as HTMLElement).getAttribute('data-type') as TowerType;
          if (!clickedType) return;
          if (this.state.activePlacementType === clickedType) {
            this.state.activePlacementType = null;
          } else {
            this.state.activePlacementType = clickedType;
            this.state.selectedTowerId = null;
            this.state.selectedBuildPoint = null;
          }
          this.onArsenalVisualsUpdate();
          this.lastRenderKey = '';
          this.render();
        });
      });

      return;
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

  /**
   * Render real-time list of summoned units for selected summon tower
   */
  public renderSummonedUnitsSectionHtml(tower: TowerEntity): string {
    const units = this.state.soldiers.filter((s) => s.towerId === tower.id);
    const aliveCount = units.filter((s) => s.state !== 'DEAD' && s.hp > 0).length;
    const maxCapacity = tower.maxSoldiers || (tower.type === 'HEROIC_ALTAR' ? 2 : 1);

    let unitsListHtml = '';
    if (units.length === 0) {
      if (tower.type === 'HEROIC_ALTAR') {
        unitsListHtml = `
          <div class="summoned-unit-empty">
            <span>👻 Chưa có Anh Linh nào xuất hiện.</span>
            <span style="font-size: 10.5px; color: #94a3b8; margin-top: 2px;">
              Khi chiến binh đồng minh (Lính/Rồng/Tiên) ngã xuống trong phạm vi ${tower.range}px, có ${Math.round((tower.resurrectChance || 0.3) * 100)}% tỉ lệ triệu hồi lại thành Anh Linh!
            </span>
          </div>
        `;
      } else {
        unitsListHtml = `
          <div class="summoned-unit-empty">
            <span>Đang chuẩn bị điều động binh sĩ...</span>
          </div>
        `;
      }
    } else {
      unitsListHtml = units.map((u, idx) => {
        const isDead = u.state === 'DEAD' || u.hp <= 0;
        const curHp = Math.max(0, Math.ceil(u.hp));
        const maxHp = u.maxHp || 100;
        const pct = isDead ? 0 : Math.min(100, Math.max(0, Math.round((curHp / maxHp) * 100)));
        const hpBarClass = pct > 50 ? 'hp-high' : pct > 25 ? 'hp-med' : 'hp-low';

        // Unit icon & title
        let icon = '🗡️';
        if (u.archetype === 'DRAGON') icon = '🐉';
        else if (u.archetype === 'FAIRY') icon = '🧚';
        else if (u.isSpirit) icon = '👻';
        else if (u.combatMode === 'RANGED') icon = '🏹';

        let nameDisplay = u.name;
        if (u.combatMode === 'RANGED' && !u.archetype) {
          nameDisplay = `Xạ Thủ ${idx + 1}`;
        }

        let stateLabel = '';
        let stateClass = '';
        if (isDead) {
          stateLabel = `⏳ Hồi sinh: ${u.respawnTimer.toFixed(1)}s`;
          stateClass = 'state-dead';
        } else if (u.state === 'ATTACKING') {
          stateLabel = '⚔️ Đang giao chiến';
          stateClass = 'state-fighting';
        } else if (u.state === 'MOVING_TO_ENGAGE' || u.state === 'MOVING_TO_RALLY') {
          stateLabel = '🏃 Đang di chuyển';
          stateClass = 'state-moving';
        } else {
          stateLabel = '🛡️ Chốt chặn';
          stateClass = 'state-guarding';
        }

        const armorPct = Math.round((u.armor || 0) * 100);
        const elemIcon = ELEMENT_ICONS[u.element] || '';
        const secIcon = u.secondaryElement ? ELEMENT_ICONS[u.secondaryElement] : '';

        return `
          <div class="summoned-unit-card ${isDead ? 'unit-is-dead' : ''}">
            <div class="suc-top">
              <div class="suc-name-box">
                <span class="suc-icon">${icon}</span>
                <span class="suc-name">${nameDisplay}</span>
                <span class="suc-elems">${elemIcon}${secIcon}</span>
              </div>
              <div class="suc-hp-text">
                <span class="suc-hp-val">${curHp}/${maxHp}</span>
                <span class="suc-hp-heart">❤️</span>
              </div>
            </div>

            <!-- Health Bar -->
            <div class="suc-hp-track">
              <div class="suc-hp-fill ${hpBarClass}" style="width: ${pct}%;"></div>
            </div>

            <div class="suc-bottom">
              <span class="suc-stat">⚔️ ${u.damage} DMG • 🛡️ ${armorPct}%</span>
              <span class="suc-state-tag ${stateClass}">${stateLabel}</span>
            </div>
          </div>
        `;
      }).join('');
    }

    return `
      <div class="summoned-units-section">
        <div class="sus-header">
          <div class="sus-title-group">
            <span class="sus-icon">🛡️</span>
            <span class="sus-title">ĐƠN VỊ ĐANG TRIỆU HỒI</span>
          </div>
          <span class="sus-counter ${aliveCount === 0 ? 'all-dead' : ''}">${aliveCount}/${maxCapacity} Sẵn sàng</span>
        </div>
        <div id="inspector-summoned-units-container" class="summoned-units-list">
          ${unitsListHtml}
        </div>
      </div>
    `;
  }

  /**
   * Smoothly update live summoned units list without re-rendering the whole inspector panel
   */
  public updateLiveSummonedUnits(tower: TowerEntity): void {
    const container = document.getElementById('inspector-summoned-units-container');
    if (!container) return;

    const units = this.state.soldiers.filter((s) => s.towerId === tower.id);
    const aliveCount = units.filter((s) => s.state !== 'DEAD' && s.hp > 0).length;
    const maxCapacity = tower.maxSoldiers || (tower.type === 'HEROIC_ALTAR' ? 2 : 1);

    const counterEl = this.inspectorContentEl.querySelector('.sus-counter');
    if (counterEl) {
      counterEl.textContent = `${aliveCount}/${maxCapacity} Sẵn sàng`;
      counterEl.classList.toggle('all-dead', aliveCount === 0);
    }

    if (units.length === 0) {
      if (tower.type === 'HEROIC_ALTAR') {
        container.innerHTML = `
          <div class="summoned-unit-empty">
            <span>👻 Chưa có Anh Linh nào xuất hiện.</span>
            <span style="font-size: 10.5px; color: #94a3b8; margin-top: 2px;">
              Khi chiến binh đồng minh (Lính/Rồng/Tiên) ngã xuống trong phạm vi ${tower.range}px, có ${Math.round((tower.resurrectChance || 0.3) * 100)}% tỉ lệ triệu hồi lại thành Anh Linh!
            </span>
          </div>
        `;
      }
      return;
    }

    container.innerHTML = units.map((u, idx) => {
      const isDead = u.state === 'DEAD' || u.hp <= 0;
      const curHp = Math.max(0, Math.ceil(u.hp));
      const maxHp = u.maxHp || 100;
      const pct = isDead ? 0 : Math.min(100, Math.max(0, Math.round((curHp / maxHp) * 100)));
      const hpBarClass = pct > 50 ? 'hp-high' : pct > 25 ? 'hp-med' : 'hp-low';

      let icon = '🗡️';
      if (u.archetype === 'DRAGON') icon = '🐉';
      else if (u.archetype === 'FAIRY') icon = '🧚';
      else if (u.isSpirit) icon = '👻';
      else if (u.combatMode === 'RANGED') icon = '🏹';

      let nameDisplay = u.name;
      if (u.combatMode === 'RANGED' && !u.archetype) {
        nameDisplay = `Xạ Thủ ${idx + 1}`;
      }

      let stateLabel = '';
      let stateClass = '';
      if (isDead) {
        stateLabel = `⏳ Hồi sinh: ${u.respawnTimer.toFixed(1)}s`;
        stateClass = 'state-dead';
      } else if (u.state === 'ATTACKING') {
        stateLabel = '⚔️ Đang giao chiến';
        stateClass = 'state-fighting';
      } else if (u.state === 'MOVING_TO_ENGAGE' || u.state === 'MOVING_TO_RALLY') {
        stateLabel = '🏃 Đang di chuyển';
        stateClass = 'state-moving';
      } else {
        stateLabel = '🛡️ Chốt chặn';
        stateClass = 'state-guarding';
      }

      const armorPct = Math.round((u.armor || 0) * 100);
      const elemIcon = ELEMENT_ICONS[u.element] || '';
      const secIcon = u.secondaryElement ? ELEMENT_ICONS[u.secondaryElement] : '';

      return `
        <div class="summoned-unit-card ${isDead ? 'unit-is-dead' : ''}">
          <div class="suc-top">
            <div class="suc-name-box">
              <span class="suc-icon">${icon}</span>
              <span class="suc-name">${nameDisplay}</span>
              <span class="suc-elems">${elemIcon}${secIcon}</span>
            </div>
            <div class="suc-hp-text">
              <span class="suc-hp-val">${curHp}/${maxHp}</span>
              <span class="suc-hp-heart">❤️</span>
            </div>
          </div>

          <div class="suc-hp-track">
            <div class="suc-hp-fill ${hpBarClass}" style="width: ${pct}%;"></div>
          </div>

          <div class="suc-bottom">
            <span class="suc-stat">⚔️ ${u.damage} DMG • 🛡️ ${armorPct}%</span>
            <span class="suc-state-tag ${stateClass}">${stateLabel}</span>
          </div>
        </div>
      `;
    }).join('');
  }
}

