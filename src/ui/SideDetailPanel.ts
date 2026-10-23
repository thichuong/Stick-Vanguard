import { TOWER_BLUEPRINTS, TowerBlueprint } from '../config/towers.config.js';
import { ENEMY_BLUEPRINTS } from '../config/enemies.config.js';
import {
  ELEMENT_COLORS,
  ELEMENT_ICONS,
  ELEMENT_NAMES,
  ELEMENT_CODEX_DETAILS,
  ELEMENTAL_REACTIONS,
  SELECTABLE_ELEMENTS
} from '../config/elements.config.js';
import { ElementType, StatusEffectType } from '../types/elements.types.js';
import { TowerType } from '../types/entities.types.js';

const STATUS_TO_ELEMENT: Record<StatusEffectType, ElementType> = {
  BURN: 'FIRE',
  WET: 'WATER',
  SLOW: 'EARTH',
  KNOCKBACK: 'WIND',
  SHOCK: 'LIGHTNING',
  FREEZE: 'ICE',
  ROOT: 'GRASS',
  POISON: 'POISON',
  SUNDER: 'STEEL',
  SOUL_DRAIN: 'GHOST',
  DRAGON_AWE: 'DRAGON',
  CHARM: 'FAIRY',
  CURSE: 'DARK'
};

export class SideDetailPanel {
  private backdropEl: HTMLElement;
  private contentEl: HTMLElement;
  private titleEl: HTMLElement;
  private badgeEl: HTMLElement;
  private iconEl: HTMLElement;
  private currentCategory: string = 'BARRACKS';
  private selectedTierKey: string = 'BARRACKS_1';
  private previewElement: ElementType = 'FIRE';
  private mageSecondaryElement: ElementType = 'LIGHTNING';
  private currentElementSubTab: string = 'OVERVIEW';

  constructor() {
    this.backdropEl = document.getElementById('codex-modal-backdrop')!;
    this.contentEl = document.getElementById('codex-modal-body')!;
    this.titleEl = document.getElementById('codex-modal-title')!;
    this.badgeEl = document.getElementById('codex-modal-badge')!;
    this.iconEl = document.getElementById('codex-modal-icon')!;

    // Expose quick category switch to window
    (window as any).__openCodexCategory = (cat: string, subId?: string) => this.open(cat, subId);

    this.bindEvents();
  }

  private bindEvents(): void {
    // Close button
    const closeBtn = document.getElementById('btn-close-codex-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Click outside modal (backdrop click) to close
    this.backdropEl.addEventListener('click', (e) => {
      if (e.target === this.backdropEl) {
        this.close();
      }
    });

    // Category Tabs
    const tabBtns = this.backdropEl.querySelectorAll('.codex-tab');
    tabBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const cat = (e.currentTarget as HTMLElement).getAttribute('data-cat');
        if (cat) {
          this.open(cat);
        }
      });
    });
  }

  public isOpen(): boolean {
    return !this.backdropEl.classList.contains('hidden');
  }

  public open(category: string = 'BARRACKS', targetSubId?: string): void {
    this.currentCategory = category;
    this.backdropEl.classList.remove('hidden');

    // Update active tab visual
    const tabBtns = this.backdropEl.querySelectorAll('.codex-tab');
    tabBtns.forEach((btn) => {
      const cat = btn.getAttribute('data-cat');
      if (cat === category) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.renderContent(category, targetSubId);
  }

  public close(): void {
    this.backdropEl.classList.add('hidden');
  }

  public toggle(category: string = 'BARRACKS'): void {
    if (this.isOpen() && this.currentCategory === category) {
      this.close();
    } else {
      this.open(category);
    }
  }

  private renderContent(category: string, targetSubId?: string): void {
    switch (category) {
      case 'BARRACKS':
      case 'ARCHER':
      case 'MAGE':
      case 'ARTILLERY':
        this.renderTowerCategory(category as TowerType, targetSubId);
        break;
      case 'SOLDIERS':
        this.renderSoldiersCategory(targetSubId);
        break;
      case 'IMBUE':
        this.renderBuildingImbueCategory(targetSubId);
        break;
      case 'TRAPS':
        this.renderTrapsCategory(targetSubId);
        break;
      case 'ELEMENTS':
        this.renderElementsCategory(targetSubId);
        break;
      case 'NAVIGATION':
        this.renderNavigationCategory(targetSubId);
        break;
      case 'ENEMIES':
        this.renderEnemiesCategory(targetSubId);
        break;
      default:
        this.renderTowerCategory('BARRACKS');
    }
  }

  // ==========================================
  // 1. TOWER CATEGORY & UPGRADE TREE
  // ==========================================
  private renderTowerCategory(type: TowerType, selectedKey?: string): void {
    const metaMap: Record<
      TowerType,
      { title: string; icon: string; badge: string; role: string; mechanics: string; tip: string }
    > = {
      BARRACKS: {
        title: 'Trại Dân Quân (Barracks)',
        icon: '🛡️',
        badge: 'Cận Chiến & Bắn Cung Linh Hoạt',
        role: 'Triệu hồi 3 chiến binh người que tinh nhuệ. Người chơi có thể tự do chọn Lính Đánh Gần hoặc Lính Bắn Tên.',
        mechanics:
          'Lính Đánh Gần có máu và DPS cao, chốt chặn quái đi bộ 1v1. Lính Bắn Tên đứng tại điểm tập kết bắn cung tầm xa tấn công được cả Đi bộ, Dưới nước và Trên không. Cả 2 đều dùng sát thương hỗn hợp Vật lý + Nguyên tố tự chọn!',
        tip: '💡 Bấm vào tháp để đổi qua lại giữa Lính Đánh Gần và Lính Bắn Tên bất kỳ lúc nào; gắn nguyên tố để đòn đánh có thêm sát thương phép và hiệu ứng riêng.'
      },
      ARCHER: {
        title: 'Tháp Cung (Archer Tower)',
        icon: '🏹',
        badge: 'Sát Thương Hỗn Hợp Bắn Nhanh',
        role: 'Tháp bắn tỉa với tốc độ ra đạn cao. Bắn được cả quái Đi bộ, Trên không và Dưới nước.',
        mechanics:
          'Gây sát thương Vật lý cơ bản + sát thương Nguyên tố cộng thêm kèm hiệu ứng trạng thái khi được gắn nguyên tố. Nhánh 4A bắn siêu tốc liên châu; Nhánh 4B bắn tỉa tầm xa cực đại.',
        tip: '💡 Tự do gắn nguyên tố (Lửa thiêu đốt, Băng làm chậm/đóng băng, Sét giật lan...) độc lập với cấp độ nâng cấp của tháp.'
      },
      MAGE: {
        title: 'Tháp Phù Thủy (Mage Tower)',
        icon: '🔮',
        badge: 'Ma Pháp Nổ Lan & Song Nguyên Tố',
        role: 'Tháp ma thuật huyền bí gây sát thương nổ lan AoE bỏ qua giáp, sở hữu 2 khe nguyên tố độc lập (sát thương 1:1).',
        mechanics:
          'Đạn phép phát nổ diện rộng ngay từ Cấp 1. Người chơi có thể tự do trang bị 2 hệ nguyên tố gây sát thương ngang nhau. Cấp 4-A tạo bão tố sát thương liên tục mỗi giây; Cấp 4-B phát hào quang buff 2 nguyên tố cho các công trình xung quanh!',
        tip: '💡 Tháp Phép 4-B buff thêm 2 nguyên tố mới cho mọi công trình đồng minh (Cung, Pháo, Lính, Tháp Phép khác) trong tầm gần nhất!'
      },
      ARTILLERY: {
        title: 'Pháo Cối (Artillery)',
        icon: '💣',
        badge: 'Công Phá Diện Rộng Hỗn Hợp',
        role: 'Vũ khí hạng nặng bắn đạn cầu vồng nổ lan diện rộng lên quái Đi bộ và Bơi lội.',
        mechanics:
          'Đạn pháo phát nổ khi chạm đất gây sát thương nổ lan Vật lý + Nguyên tố phép cộng thêm trên toàn bộ bán kính nổ. Nhánh 4A siêu nổ đại địa chấn; Nhánh 4B pháo liên thanh nạp cực nhanh.',
        tip: '⚠️ Pháo cối không bắn được quái Bay (FLY). Gắn thêm nguyên tố để tạo vùng nổ thiêu đốt (Lửa), bão từ (Sét) hoặc chấn động làm chậm (Đất)!'
      },
      TRAP_SPIKE: { title: 'Bẫy', icon: '⚙️', badge: 'Bẫy', role: '', mechanics: '', tip: '' },
      TRAP_FIRE: { title: 'Bẫy', icon: '⚙️', badge: 'Bẫy', role: '', mechanics: '', tip: '' },
      TRAP_FROST: { title: 'Bẫy', icon: '⚙️', badge: 'Bẫy', role: '', mechanics: '', tip: '' },
      TRAP_NET: { title: 'Bẫy', icon: '⚙️', badge: 'Bẫy', role: '', mechanics: '', tip: '' }
    };

    const meta = metaMap[type];
    this.titleEl.textContent = meta.title;
    this.iconEl.textContent = meta.icon;
    this.badgeEl.textContent = meta.badge;

    const bp1 = TOWER_BLUEPRINTS[`${type}_1`];
    const bp2 = TOWER_BLUEPRINTS[`${type}_2`];
    const bp3 = TOWER_BLUEPRINTS[`${type}_3`];
    const bp4A = TOWER_BLUEPRINTS[`${type}_4_A`];
    const bp4B = TOWER_BLUEPRINTS[`${type}_4_B`];

    if (!bp1) return;

    this.selectedTierKey = selectedKey || `${type}_1`;
    const selectedBp = TOWER_BLUEPRINTS[this.selectedTierKey] || bp1;

    this.contentEl.innerHTML = `
      <div class="codex-two-col">
        <!-- CỘT TRÁI: VAI TRÒ & CÂY NÂNG CẤP -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Role and Mechanics Explanation -->
          <div class="sp-section sp-card">
            <h4 class="sp-sec-title">📖 VAI TRÒ & CƠ CHẾ HOẠT ĐỘNG</h4>
            <p class="sp-desc">${meta.role}</p>
            <div class="sp-mechanic-box">
              <p><b>⚙️ Cơ chế:</b> ${meta.mechanics}</p>
              <p class="sp-tip-text">${meta.tip}</p>
            </div>
          </div>

          ${
            type === 'BARRACKS'
              ? `
              <div class="sp-section sp-card" style="border-left: 5px solid #10b981; background: linear-gradient(90deg, #0f241d 0%, #121b2d 100%);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <h4 class="sp-sec-title" style="margin-bottom: 0; color: #34d399;">⚔️ LÍNH CẬN CHIẾN vs 🏹 LÍNH BẮN TÊN</h4>
                  <button id="btn-goto-soldiers-guide" class="codex-tab" style="padding: 4px 12px; font-size: 13px; border-color: #10b981; color: #34d399;">Xem So Sánh Chi Tiết ➔</button>
                </div>
                <p class="sp-desc" style="margin-bottom: 6px;">
                  Người chơi có thể chuyển đổi linh hoạt giữa <b>Lính Đánh Gần</b> (Máu dày, giáp cao, chốt chặn quái đi bộ 1v1) và <b>Lính Bắn Tên</b> (Tầm bắn xa 150px, bắn được <b>CẢ 3 LOẠI: Đi Bộ, Trên Không & Dưới Nước</b>).
                </p>
                <span class="sp-tip-text">💡 Thao tác: Bấm vào Nhà Lính trong trận ➔ Chọn [⚔️ Cận Chiến] hoặc [🏹 Bắn Tên] - Hoàn toàn MIỄN PHÍ!</span>
              </div>
            `
              : ''
          }

          <!-- Interactive Upgrade Tree Diagram -->
          <div class="sp-section sp-card">
            <div class="sp-sec-header">
              <h4 class="sp-sec-title">🌳 CÂY NÂNG CẤP (UPGRADE TREE)</h4>
              <span class="sp-hint">Bấm vào từng cấp để xem thông số</span>
            </div>

            <div class="upgrade-tree-container">
              <!-- Tier 1 -->
              ${this.renderTreeNode(bp1, 'CẤP 1', `${type}_1`)}

              <div class="tree-arrow">▼</div>

              <!-- Tier 2 -->
              ${this.renderTreeNode(bp2, 'CẤP 2', `${type}_2`)}

              <div class="tree-arrow">▼</div>

              <!-- Tier 3 -->
              ${this.renderTreeNode(bp3, 'CẤP 3', `${type}_3`)}

              <div class="tree-split-arrow">
                <span>┌───────┴───────┐</span>
                <span>▼&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼</span>
              </div>

              <!-- Tier 4 Branch Split -->
              <div class="tree-branch-split">
                ${this.renderTreeNode(bp4A, '4-A', `${type}_4_A`, true)}
                ${this.renderTreeNode(bp4B, '4-B', `${type}_4_B`, true)}
              </div>
            </div>
          </div>
        </div>

        <!-- CỘT PHẢI: CHI TIẾT CẤP ĐỘ ĐANG CHỌN, MÔ PHỎNG NGUYÊN TỐ & BẢNG SO SÁNH -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Selected Tier Detail Card -->
          <div class="sp-section sp-card highlighted-detail-card">
            <div class="dt-header">
              <span class="dt-tier-badge">CHI TIẾT: ${selectedBp.name}</span>
              <span class="dt-cost">🪙 ${selectedBp.cost} Vàng</span>
            </div>
            <p class="dt-desc">${selectedBp.description}</p>

            <div class="dt-stats-grid">
              <div class="stat-box">
                <span class="s-label">Sát thương gốc</span>
                <span class="s-val">${selectedBp.damage} ${type === 'MAGE' ? '🔮' : '⚔️'}</span>
              </div>
              <div class="stat-box">
                <span class="s-label">Tầm bắn</span>
                <span class="s-val">${selectedBp.range} px</span>
              </div>
              <div class="stat-box">
                <span class="s-label">Tốc độ ra đòn</span>
                <span class="s-val">${selectedBp.fireRate}/s</span>
              </div>
              <div class="stat-box">
                <span class="s-label">Hệ mặc định</span>
                <span class="s-val" style="color: ${ELEMENT_COLORS[selectedBp.element]}">
                  ${ELEMENT_ICONS[selectedBp.element]} ${selectedBp.element}
                </span>
              </div>
              <div class="stat-box">
                <span class="s-label">Mục tiêu</span>
                <span class="s-val">${selectedBp.targetingFilter.allowedMovement.join(', ')}</span>
              </div>
              <div class="stat-box">
                <span class="s-label">DPS Cơ Bản</span>
                <span class="s-val highlight-dps">${Math.round(selectedBp.damage * selectedBp.fireRate)} DPS</span>
              </div>
              ${
                selectedBp.maxSoldiers
                  ? `
                  <div class="stat-box">
                    <span class="s-label">Số lính</span>
                    <span class="s-val">${selectedBp.maxSoldiers} Lính</span>
                  </div>
                  <div class="stat-box">
                    <span class="s-label">Máu lính (HP)</span>
                    <span class="s-val">${selectedBp.soldierHp} ❤️</span>
                  </div>
                  <div class="stat-box">
                    <span class="s-label">Giáp lính</span>
                    <span class="s-val">${Math.round((selectedBp.soldierArmor || 0) * 100)}% 🛡️</span>
                  </div>
                `
                  : ''
              }
              ${
                selectedBp.aoeRadius
                  ? `
                  <div class="stat-box">
                    <span class="s-label">Bán kính nổ AOE</span>
                    <span class="s-val">${selectedBp.aoeRadius} px 💥</span>
                  </div>
                `
                  : ''
              }
            </div>
          </div>

          <!-- Interactive Elemental Imbue & Effect Simulator -->
          ${this.renderTowerElementalSim(type, selectedBp)}

          <!-- Full Comparison Table -->
          <div class="sp-section sp-card">
            <div class="sp-sec-header">
              <h4 class="sp-sec-title">📊 BẢNG SO SÁNH CHỈ SỐ CẢ 4 CẤP (CẢ SÁT THƯƠNG NGUYÊN TỐ)</h4>
              <span class="sp-hint">${type === 'MAGE' ? 'Khe 2: +100% Sát thương Phép (Tỷ lệ 1:1)' : 'Gắn Nguyên tố: +45% Sát thương Phép'}</span>
            </div>
            <div class="table-responsive">
              <table class="stats-table">
                <thead>
                  <tr>
                    <th>Cấp Độ</th>
                    <th>Tên Tháp</th>
                    <th>Giá</th>
                    <th>DMG Gốc</th>
                    <th>DMG + Nguyên Tố</th>
                    <th>Tầm</th>
                    <th>Tốc</th>
                    <th>DPS Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.renderStatsTableRow(bp1, 'Cấp 1', type)}
                  ${this.renderStatsTableRow(bp2, 'Cấp 2', type)}
                  ${this.renderStatsTableRow(bp3, 'Cấp 3', type)}
                  ${this.renderStatsTableRow(bp4A, '4-A 🌟', type, 'branch-row-a')}
                  ${this.renderStatsTableRow(bp4B, '4-B 🌟', type, 'branch-row-b')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind click events on tree nodes
    this.contentEl.querySelectorAll('.tree-node').forEach((node) => {
      node.addEventListener('click', (e) => {
        const key = (e.currentTarget as HTMLElement).getAttribute('data-tier-key');
        if (key) {
          this.renderTowerCategory(type, key);
        }
      });
    });

    // Bind click events on element selector buttons inside tower view
    this.contentEl.querySelectorAll('.sim-elem-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const elem = (e.currentTarget as HTMLElement).getAttribute('data-elem') as ElementType;
        const mageSlot = (e.currentTarget as HTMLElement).getAttribute('data-mage-slot');
        if (elem) {
          if (mageSlot === '2') {
            this.mageSecondaryElement = elem;
          } else {
            this.previewElement = elem;
          }
          const currentScroll = this.contentEl.scrollTop;
          this.renderTowerCategory(type, this.selectedTierKey);
          this.contentEl.scrollTop = currentScroll;
        }
      });
    });

    // Bind quick button to soldiers guide
    const gotoSoldiersBtn = this.contentEl.querySelector('#btn-goto-soldiers-guide');
    if (gotoSoldiersBtn) {
      gotoSoldiersBtn.addEventListener('click', () => {
        this.open('SOLDIERS');
      });
    }
  }

  private renderStatsTableRow(
    bp: TowerBlueprint,
    tierName: string,
    type: TowerType,
    rowClass: string = ''
  ): string {
    const isMage = type === 'MAGE';
    const bonusDmg = Math.max(1, Math.round(bp.damage * (isMage ? 1.0 : 0.45)));
    const totalDmg = bp.damage + bonusDmg;
    const totalDps = Math.round(totalDmg * bp.fireRate);

    return `
      <tr class="${rowClass}">
        <td><b>${tierName}</b></td>
        <td><b>${bp.name}</b></td>
        <td class="gold-col">🪙 ${bp.cost}</td>
        <td>${bp.damage} ${isMage ? '🔮' : '⚔️'}</td>
        <td class="highlight-val">+${bonusDmg} (<b>${totalDmg}</b>)</td>
        <td>${bp.range} px</td>
        <td>${bp.fireRate}/s</td>
        <td class="highlight-dps">${totalDps} DPS</td>
      </tr>
    `;
  }

  private renderTowerElementalSim(type: TowerType, bp: TowerBlueprint): string {
    const isMage = type === 'MAGE';
    const selectableElements: ElementType[] = SELECTABLE_ELEMENTS;

    if (isMage) {
      // Mage Tower dual element simulator
      const primaryElem = this.previewElement;
      const secondaryElem = this.mageSecondaryElement;
      const primaryDmg = bp.damage;
      const secondaryDmg = Math.max(1, Math.round(bp.damage * 1.0));
      const totalDmg = primaryDmg + secondaryDmg;
      const totalDps = Math.round(totalDmg * bp.fireRate);

      // Synergy check from reactions
      const reaction = ELEMENTAL_REACTIONS.find(
        (r) =>
          (STATUS_TO_ELEMENT[r.requiredStatus] === primaryElem && r.triggerElement === secondaryElem) ||
          (STATUS_TO_ELEMENT[r.requiredStatus] === secondaryElem && r.triggerElement === primaryElem)
      );

      let synergyText = '';
      if (reaction) {
        synergyText = `${reaction.label} ${reaction.name.toUpperCase()} (x${reaction.damageMultiplier} Sát thương): ${reaction.description}`;
      } else if (primaryElem === secondaryElem) {
        synergyText = `🔥 CỘNG HƯỞNG THUẦN HỆ: Tối đa hóa hiệu lực và sát thương đơn hệ [${ELEMENT_NAMES[primaryElem]}] lên mục tiêu!`;
      } else {
        synergyText = `🌟 SONG HỆ PHỐI HỢP: Đòn đánh gây đồng thời cả 2 loại sát thương ma pháp [${ELEMENT_NAMES[primaryElem]}] + [${ELEMENT_NAMES[secondaryElem]}] và kích hoạt cả 2 hiệu ứng trạng thái lên mục tiêu!`;
      }

      return `
        <div class="sp-section sp-card tower-elemental-sim-card">
          <div class="sim-sec-header">
            <h4 class="sp-sec-title" style="margin-bottom: 0; color: #c084fc;">🔮 MÔ PHỎNG SÁT THƯƠNG & SONG NGUYÊN TỐ PHÙ THỦY</h4>
            <span class="sim-badge" style="background: rgba(168, 85, 247, 0.2); color: #c084fc; border-color: rgba(168, 85, 247, 0.4);">
              Thuần Phép Bỏ Qua Giáp • 2 Khe Độc Lập
            </span>
          </div>

          <div class="mage-slot-selector-group">
            <div class="mage-slot-row">
              <span class="mage-slot-label">Khe 1 (Nguyên Tố Chính 100%):</span>
              <div class="sim-elem-selector">
                ${selectableElements
                  .map(
                    (elem) => `
                  <button class="sim-elem-btn ${elem === primaryElem ? 'active' : ''}" data-mage-slot="1" data-elem="${elem}" style="${elem === primaryElem ? `background: ${ELEMENT_COLORS[elem]}25; border-color: ${ELEMENT_COLORS[elem]}; color: ${ELEMENT_COLORS[elem]}` : ''}">
                    ${ELEMENT_ICONS[elem]} ${ELEMENT_NAMES[elem].split(' ')[0]}
                  </button>
                `
                  )
                  .join('')}
              </div>
            </div>

            <div class="mage-slot-row">
              <span class="mage-slot-label">Khe 2 (Nguyên Tố Phụ +100%):</span>
              <div class="sim-elem-selector">
                ${selectableElements
                  .map(
                    (elem) => `
                  <button class="sim-elem-btn ${elem === secondaryElem ? 'active' : ''}" data-mage-slot="2" data-elem="${elem}" style="${elem === secondaryElem ? `background: ${ELEMENT_COLORS[elem]}25; border-color: ${ELEMENT_COLORS[elem]}; color: ${ELEMENT_COLORS[elem]}` : ''}">
                    ${ELEMENT_ICONS[elem]} ${ELEMENT_NAMES[elem].split(' ')[0]}
                  </button>
                `
                  )
                  .join('')}
              </div>
            </div>
          </div>

          <!-- Damage breakdown -->
          <div class="sim-dmg-breakdown">
            <div class="stat-box">
              <span class="s-label">Sát thương Khe 1 (100%)</span>
              <span class="s-val" style="color: ${ELEMENT_COLORS[primaryElem]}">${primaryDmg} ${ELEMENT_ICONS[primaryElem]}</span>
            </div>
            <div class="stat-box">
              <span class="s-label">Sát thương Khe 2 (+100%)</span>
              <span class="s-val" style="color: ${ELEMENT_COLORS[secondaryElem]}">+${secondaryDmg} ${ELEMENT_ICONS[secondaryElem]}</span>
            </div>
            <div class="stat-box">
              <span class="s-label">Tổng DMG Mỗi Đòn</span>
              <span class="s-val highlight-val">${totalDmg} Phép</span>
            </div>
            <div class="stat-box">
              <span class="s-label">Tổng DPS Song Hệ</span>
              <span class="s-val highlight-dps">${totalDps} DPS</span>
            </div>
          </div>

          <!-- Effect Description Box -->
          <div class="sim-effect-box" style="border-left-color: ${ELEMENT_COLORS[secondaryElem]}">
            <div class="sim-effect-title" style="color: ${ELEMENT_COLORS[secondaryElem]}">
              ${ELEMENT_ICONS[primaryElem]} + ${ELEMENT_ICONS[secondaryElem]} Hiệu Ứng Ma Thuật Kép
            </div>
            <p class="sim-effect-desc">${synergyText}</p>
          </div>
        </div>
      `;
    }

    // Physical towers: Barracks, Archer, Artillery
    const activeElem = this.previewElement;
    const baseDmg = bp.damage;
    const bonusDmg = Math.max(1, Math.round(baseDmg * 0.45));
    const totalDmg = baseDmg + bonusDmg;
    const totalDps = Math.round(totalDmg * bp.fireRate);
    const elemColor = ELEMENT_COLORS[activeElem];
    const elemIcon = ELEMENT_ICONS[activeElem];

    const effectInfo = this.getTowerSpecificEffectText(type, activeElem, bp);

    return `
      <div class="sp-section sp-card tower-elemental-sim-card">
        <div class="sim-sec-header">
          <h4 class="sp-sec-title" style="margin-bottom: 0; color: #facc15;">✨ MÔ PHỎNG SÁT THƯƠNG NGUYÊN TỐ & HIỆU ỨNG KÈM THEO</h4>
          <span class="sim-badge">Sát Thương Hỗn Hợp: 100% Vật Lý + 45% Phép</span>
        </div>
        <p class="sp-desc" style="margin-bottom: 4px; font-size: 13.5px;">
          Bấm chọn một nguyên tố bên dưới để xem sự thay đổi về sát thương và hiệu ứng chiến đấu thực tế của công trình này:
        </p>

        <!-- Element Selector Buttons -->
        <div class="sim-elem-selector">
          ${selectableElements
            .map(
              (elem) => `
            <button class="sim-elem-btn ${elem === activeElem ? 'active' : ''}" data-elem="${elem}" style="${elem === activeElem ? `background: ${ELEMENT_COLORS[elem]}25; border-color: ${ELEMENT_COLORS[elem]}; color: ${ELEMENT_COLORS[elem]}` : ''}">
              ${ELEMENT_ICONS[elem]} ${ELEMENT_NAMES[elem]}
            </button>
          `
            )
            .join('')}
        </div>

        <!-- Damage Breakdown Boxes -->
        <div class="sim-dmg-breakdown">
          <div class="stat-box">
            <span class="s-label">Sát thương Vật lý gốc</span>
            <span class="s-val">${baseDmg} ⚔️</span>
          </div>
          <div class="stat-box">
            <span class="s-label">Nguyên tố kèm (+45%)</span>
            <span class="s-val" style="color: ${elemColor}">+${bonusDmg} ${elemIcon}</span>
          </div>
          <div class="stat-box">
            <span class="s-label">Tổng Sát thương Hỗn hợp</span>
            <span class="s-val highlight-val">${totalDmg} (${baseDmg}+${bonusDmg})</span>
          </div>
          <div class="stat-box">
            <span class="s-label">Tổng DPS Hỗn hợp</span>
            <span class="s-val highlight-dps">${totalDps} DPS</span>
          </div>
        </div>

        <!-- Effect Description Box -->
        <div class="sim-effect-box" style="border-left-color: ${elemColor}">
          <div class="sim-effect-title" style="color: ${elemColor}">
            ${elemIcon} Hiệu Ứng Kèm Theo: ${effectInfo.title}
          </div>
          <p class="sim-effect-desc">${effectInfo.desc}</p>
          <div class="sim-synergy-tag">${effectInfo.tag}</div>
        </div>
      </div>
    `;
  }

  private getTowerSpecificEffectText(
    type: TowerType,
    elem: ElementType,
    bp: TowerBlueprint
  ): { title: string; desc: string; tag: string } {
    switch (type) {
      case 'BARRACKS':
        switch (elem) {
          case 'FIRE':
            return {
              title: 'Lưỡi Kiếm & Mũi Tên Rực Lửa (Burn)',
              desc: 'Cả 3 chiến binh chém hoặc bắn cung đều đốt cháy mục tiêu trong 3.0s (mỗi 0.5s rút máu 20% Base DMG, tổng 120% DMG). Cực kỳ hữu hiệu để thiêu rụi quái trâu máu khi đang bị lính chặn lại.',
              tag: '🔥 DoT Thiêu Đốt 3s • 6 lần tick sát thương • Bỏ qua giáp'
            };
          case 'WATER':
            return {
              title: 'Thủy Lực Ẩm Ướt & Trì Hoãn (Wet)',
              desc: 'Đòn đánh của lính làm chậm 20% tốc độ chạy quái và phủ trạng thái Ẩm Ướt trong 4.0s. Quái vật bị lính chém ướt sẽ chịu thêm +75% Sát thương từ Sét và +50% Sát thương từ Băng từ các tháp phía sau!',
              tag: '💧 Làm chậm 20% • Kích hoạt combo Sét x1.75 & Băng x1.5'
            };
          case 'EARTH':
            return {
              title: 'Chấn Động Địa Chấn (Earthquake Slow)',
              desc: 'Mỗi nhát chém gây thêm +20% sát thương trực tiếp lên quái Đi Bộ và tạo chấn động làm chậm 35% tốc độ di chuyển trong 2.5s. Giúp lính dễ dàng khống chế và giữ chặt quái vật trên đường.',
              tag: '🪨 +20% Sát thương lên Quái Đi Bộ • Giảm 35% Tốc độ'
            };
          case 'WIND':
            return {
              title: 'Cuồng Phong Đẩy Lùi (Knockback)',
              desc: 'Đòn đánh đẩy lùi quái vật ngược lại trên lộ trình hành quân (15px với quái bộ). Đặc biệt nếu chuyển sang Lính Bắn Tên, đòn bắn sẽ tăng vọt +50% sát thương lên quái Bay (FLY) và đẩy lùi Dơi Quỷ 25px!',
              tag: '🌪️ Đẩy lùi 15-25px • Lính Bắn Tên tăng +50% Sát thương Quái Bay'
            };
          case 'LIGHTNING':
            return {
              title: 'Sốc Điện Tê Liệt & Giật Lan (Shock)',
              desc: 'Đòn chém và mũi tên gây choáng 0.35s ngắt nhịp tung đòn của quái vật, đồng thời phóng tia sét giật lan sang 1 kẻ địch kế bên gây 35% sát thương. Giúp 3 lính dọn dẹp bầy quái đông đảo siêu tốc.',
              tag: '⚡ Choáng tê liệt 0.35s • Nảy tia sét 35% DMG sang quái bên cạnh'
            };
          case 'ICE':
            return {
              title: 'Hàn Băng Chốt Chặn & Đóng Băng (Freeze)',
              desc: 'Đòn đánh làm chậm 45% tốc độ trong 3s và có 25% tỉ lệ Đóng Băng Hoàn Toàn 1.2s. Khi bị đóng băng, quái vật đứng yên bất động 100% tại chỗ, hoàn toàn không thể tấn công trả lại lính!',
              tag: '❄️ Giảm 45% Tốc độ • 25% Đóng Băng Bất Động 1.2s'
            };
          case 'LIGHT':
            return {
              title: 'Thánh Quang Hồi Máu Đồng Minh (Holy)',
              desc: 'Bí thuật tối thượng của hiệp sĩ: Mỗi đòn đánh của lính TỰ ĐỘNG HỒI PHỤC +5 HP cho bản thân! Biến cả 3 chiến binh thành những pháo đài sống gần như bất tử trước quái thường. Đánh quái Hắc Ám nhận thêm x2.0 DMG.',
              tag: '✨ Lính tự hồi phục +5 HP mỗi đòn đánh • x2.0 Sát thương Quái Tối'
            };
          case 'DARK':
            return {
              title: 'Nguyền Rủa Ăn Mòn Phòng Ngự (Curse)',
              desc: 'Khắc dấu ấn Nguyền Rủa 3.5s lên quái vật bị lính tấn công. Kẻ địch bị nguyền rủa sẽ nhận thêm +35% sát thương từ MỌI NGUỒN (Tháp Cung, Pháo Cối, Bẫy và chính lính).',
              tag: '🔮 Quái nhận thêm +35% Sát Thương từ Mọi Nguồn trong 3.5s'
            };
          case 'GRASS':
            return {
              title: 'Rễ Cây Trói Chân & Hồi Máu (Root & Bloom)',
              desc: 'Lính chém khiến quái bị rễ trói giảm 30% tốc độ chạy và nhận DoT trong 3.0s. Mỗi đòn chém hồi +3 HP cho chiến binh!',
              tag: '🌿 Trói rễ giảm 30% Tốc độ • Lính hồi phục +3 HP mỗi đòn'
            };
          case 'POISON':
            return {
              title: 'Lưỡi Gươm Kịch Độc Ăn Mòn (Poison DoT)',
              desc: 'Đòn đánh tiêm nọc độc cực mạnh rút máu DoT liên tục trong 4.0s (mỗi 0.5s rút 15% Base DMG). Sát thương độc hoàn toàn bỏ qua giáp.',
              tag: '☠️ DoT Kịch Độc 4s • 8 lần tick • Bỏ qua 100% giáp'
            };
          case 'STEEL':
            return {
              title: 'Nhát Chém Bổ Giáp Xé Vỡ (Sunder Armor)',
              desc: 'Gây hiệu ứng Xé Giáp (Sunder) trong 4.0s, làm giảm giáp của mục tiêu đi 40%, giúp toàn bộ tháp và lính vật lý đánh cực đau.',
              tag: '⚙️ Xé giáp giảm 40% Phòng ngự kẻ địch trong 4s'
            };
          case 'GHOST':
            return {
              title: 'U Hồn Hút Phách Giảm Công (Soul Drain)',
              desc: 'Áp đặt U Linh khiến quái vật bị rút hồn, giảm 20% sát thương tấn công của quái và làm chậm 25% bước di chuyển trong 3.5s.',
              tag: '👻 Hút hồn: Giảm 20% sát thương quái & chậm 25%'
            };
          case 'DRAGON':
            return {
              title: 'Long Uy Áp Chế Toàn Diện (Dragon Awe)',
              desc: 'Phát tỏa uy áp loài rồng khiến quái vật kinh hãi: Giảm 25% sát thương và giảm 25% tốc chạy trong 3.0s, nhận x1.5 DMG từ Rồng.',
              tag: '🐉 Uy áp loài rồng • Giảm 25% sát thương & 25% tốc chạy quái'
            };
          case 'FAIRY':
            return {
              title: 'Mê Hoặc Yêu Tinh & Tê Liệt (Charm)',
              desc: 'Bụi tiên mê hoặc làm kẻ địch mất phương hướng, giảm mạnh 40% tốc chạy quái và gây x2.0 sát thương hủy diệt lên loài rồng!',
              tag: '🧚 Mê hoặc làm chậm 40% • x2.0 Sát thương Quái Rồng'
            };
        }
        break;

      case 'ARCHER':
        switch (elem) {
          case 'FIRE':
            return {
              title: 'Mưa Tên Rực Lửa Liên Châu (Burn)',
              desc: `Với tốc độ bắn siêu nhanh (${bp.fireRate} phát/s), tháp cung liên tục làm mới thời gian thiêu đốt DoT 3.0s, duy trì ngọn lửa rút máu liên tục không ngừng nghỉ lên quái vật.`,
              tag: '🔥 Duy trì DoT Lửa 100% thời gian • Bào mòn Boss và quái trâu'
            };
          case 'WATER':
            return {
              title: 'Mũi Tên Áp Lực Nước (Wet)',
              desc: 'Bắn liên tục làm chậm 20% và phủ trạng thái Ẩm Ướt 4s lên từng quái vật đi đầu, làm mồi nhử hoàn hảo cho Tháp Sét hoặc Tháp Băng dồn combo kết liễu.',
              tag: '💧 Phủ Ẩm Ướt liên tục • Kích hoạt phản ứng x1.75 Sét'
            };
          case 'EARTH':
            return {
              title: 'Mũi Tên Trọng Lực Địa Chấn (Slow)',
              desc: 'Tăng thêm +20% sát thương lên quái Đi Bộ và làm chậm 35% tốc độ di chuyển trong 2.5s. Kìm hãm quái vật chạy nhanh như Goblin hay Sói rừng.',
              tag: '🪨 +20% Sát thương vs Quái Đi Bộ • Giảm 35% Tốc độ'
            };
          case 'WIND':
            return {
              title: 'Cơn Ác Mộng Của Quái Bay (Knockback)',
              desc: 'TĂNG THÊM +50% SÁT THƯƠNG LÊN QUÁI BAY (FLY) VÀ LIÊN TỤC ĐẨY LÙI 25px! Nhờ tốc độ bắn cao, Dơi Quỷ hay Rồng Lửa hoàn toàn bị đẩy lùi về sau, không thể bay tới căn cứ!',
              tag: '🌪️ +50% Sát thương Quái Bay • Liên tục đẩy lùi 25px'
            };
          case 'LIGHTNING':
            return {
              title: 'Mũi Tên Sét Liên Hoàn (Shock)',
              desc: 'Mỗi mũi tên giật tia sét 35% DMG sang kẻ địch kế bên và gây choáng 0.35s. Khắc chế cực mạnh Thủy quái bơi sông với x2.0 sát thương.',
              tag: '⚡ Giật lan 35% DMG liên tục • x2.0 Sát thương Quái Bơi Sông'
            };
          case 'ICE':
            return {
              title: 'Khóa Chân Hàn Băng Vĩnh Cửu (Freeze)',
              desc: 'Tốc độ bắn cực nhanh liên tục áp dụng làm chậm 45% không kịp hồi phục, kết hợp 25% cơ hội đóng băng 1.2s khiến quái vật gần như bị hóa đá tại chỗ!',
              tag: '❄️ Làm chậm 45% vĩnh viễn • Đóng băng bất động liên tục'
            };
          case 'LIGHT':
            return {
              title: 'Mũi Tên Thánh Quang Thanh Tẩy (Holy)',
              desc: 'Khắc chế hủy diệt quái Hắc Ám (DARK) với x2.0 (200%) sát thương, kích hoạt Holy Burn thiêu đốt thần thánh 2.5s.',
              tag: '✨ x2.0 Sát thương Quái Hắc Ám • Bắn tỉa quỷ dữ từ xa'
            };
          case 'DARK':
            return {
              title: 'Mũi Tên Điểm Huyệt Nguyền Rủa (Curse)',
              desc: 'Bắn vào quái đầu đàn để gắn dấu ấn Nguyền Rủa (+35% sát thương nhận vào), tạo điều kiện cho Pháo cối và Lính dồn sát thương kết liễu cực nhanh.',
              tag: '🔮 Tăng +35% Sát thương nhận vào từ Mọi Nguồn'
            };
          case 'GRASS':
            return {
              title: 'Mưa Tên Gai Dây Leo (Root)',
              desc: 'Tốc độ bắn cao liên tục trói chân mục tiêu, làm chậm 30% vĩnh viễn và rút máu DoT cỏ dại.',
              tag: '🌿 Trói rễ làm chậm 30% liên tục • Rút máu tự nhiên'
            };
          case 'POISON':
            return {
              title: 'Mũi Tên Tẩm Kịch Độc (Poison)',
              desc: 'Bắn liên tục duy trì độc tính DoT 4s không thể giải trừ, ăn mòn máu quái vật trâu bò và Boss từ xa.',
              tag: '☠️ Duy trì độc tố DoT 4s liên tục • Rút cạn máu quái'
            };
          case 'STEEL':
            return {
              title: 'Tên Thép Xuyên Phá Xé Giáp (Sunder)',
              desc: 'Bắn phá làm vỡ vụn giáp trụ quái vật (-40% giáp), mở đường cho lính và pháo dồn sát thương kết liễu.',
              tag: '⚙️ Xé 40% giáp từ xa • Duy trì debuff liên tục'
            };
          case 'GHOST':
            return {
              title: 'Tên Âm Hồn Đoạt Phách (Soul Drain)',
              desc: 'Bắn xuyên linh hồn làm suy nhược quái vật (-20% công, -25% tốc), làm mất đà tiến của quái tinh anh.',
              tag: '👻 Giảm 20% công & 25% tốc • Bắn tỉa làm suy yếu quái'
            };
          case 'DRAGON':
            return {
              title: 'Tên Long Lực Tàn Phá (Dragon Awe)',
              desc: 'Mũi tên mang long hồn phát nổ uy áp, giảm 25% công và tốc của quái vật, khắc chế mạnh mẽ quái Rồng.',
              tag: '🐉 Long Uy áp chế từ xa • Giảm 25% công & tốc chạy'
            };
          case 'FAIRY':
            return {
              title: 'Mũi Tên Bụi Tiên Mê Hoặc (Charm)',
              desc: 'Bắn tỉa làm chậm sâu 40% mục tiêu, khắc chế tuyệt đối quái Rồng (x2.0 DMG) và quái Ám.',
              tag: '🧚 x2.0 Sát thương Quái Rồng • Làm chậm mê hoặc 40%'
            };
        }
        break;

      case 'ARTILLERY':
        switch (elem) {
          case 'FIRE':
            return {
              title: 'Biển Lửa Napalm Diện Rộng (AoE Burn)',
              desc: `Đạn pháo phát nổ trên bán kính ${bp.aoeRadius || 75}px thiêu đốt TOÀN BỘ đàn quái vật trong vùng nổ, rút máu DoT tập thể cực kỳ khủng khiếp.`,
              tag: `💥 Nổ diện rộng ${bp.aoeRadius || 75}px • Thiêu đốt DoT cả bầy quái`
            };
          case 'WATER':
            return {
              title: 'Thủy Lôi Sóng Triều (AoE Wet)',
              desc: `Vụ nổ áp lực nước phủ trạng thái Ẩm Ướt 4s và làm chậm 20% toàn bộ quái vật trong bán kính ${bp.aoeRadius || 75}px.`,
              tag: '💧 Phủ Ẩm Ướt diện rộng • Kích hoạt combo diện rộng cho tháp Sét'
            };
          case 'EARTH':
            return {
              title: 'Đại Địa Chấn Cataclysm (AoE Slow)',
              desc: `Cú dập chấn động rung chuyển mặt đất: TĂNG THÊM +20% SÁT THƯƠNG LÊN TOÀN BỘ QUÁI ĐI BỘ và làm chậm 35% diện rộng trong ${bp.aoeRadius || 75}px!`,
              tag: '🪨 +20% Sát thương Quái Bộ AoE • Làm chậm 35% cả đoàn quân'
            };
          case 'WIND':
            return {
              title: 'Sóng Xung Kích Cuồng Phong (AoE Knockback)',
              desc: `Vụ nổ lốc xoáy thổi bay và đẩy lùi toàn bộ quái vật trong bán kính nổ ngược lại 15px trên lộ trình tiến công.`,
              tag: '🌪️ Đẩy lùi diện rộng 15px • Bẻ gãy bước tiến của kẻ địch'
            };
          case 'LIGHTNING':
            return {
              title: 'Xung Điện Từ EMP Hàng Loạt (AoE Shock)',
              desc: `Phát nổ xung điện EMP làm choáng hàng loạt quái vật cùng lúc và kích hoạt các tia sét phụ nảy chéo liên hoàn giữa các mục tiêu.`,
              tag: '⚡ Choáng hàng loạt quái vật • Tia sét phụ nảy liên hoàn'
            };
          case 'ICE':
            return {
              title: 'Bão Tuyết Đóng Băng Tuyệt Đối (AoE Freeze)',
              desc: `Vụ nổ hàn băng làm chậm 45% toàn bộ binh đoàn địch trong ${bp.aoeRadius || 75}px và có 25% cơ hội đóng băng bất động cùng lúc nhiều quái vật!`,
              tag: '❄️ Làm chậm 45% diện rộng • Đóng băng bất động cả nhóm quái'
            };
          case 'LIGHT':
            return {
              title: 'Đại Quang Thanh Tẩy Diện Rộng (AoE Holy)',
              desc: 'Vụ nổ ánh sáng thần thánh gây x2.0 sát thương lên toàn bộ quái Hắc Ám trong bán kính nổ và thiêu rụi bóng tối.',
              tag: '✨ x2.0 Sát thương Quái Tối AoE • Thanh tẩy quái đông'
            };
          case 'DARK':
            return {
              title: 'Vụ Nổ Hắc Ám Nguyền Rủa (AoE Curse)',
              desc: 'Phát nổ hắc ám khắc dấu ấn Nguyền Rủa (+35% sát thương từ mọi nguồn) lên toàn bộ quái vật nằm trong vùng nổ!',
              tag: '🔮 Nguyền rủa diện rộng • Toàn bộ quái nhận +35% DMG'
            };
          case 'GRASS':
            return {
              title: 'Đại Pháo Gai Rễ Diện Rộng (AoE Root)',
              desc: `Đạn pháo phát nổ trùm rễ cây lên bán kính ${bp.aoeRadius || 75}px làm chậm 30% và rút máu DoT cả bầy quái.`,
              tag: `🌿 Trói chân diện rộng ${bp.aoeRadius || 75}px • DoT tự nhiên cả bầy`
            };
          case 'POISON':
            return {
              title: 'Hơi Cay Độc Tố Ô Nhiễm (AoE Poison)',
              desc: `Tạo vùng khí độc lưu lại trên diện rộng, khiến mọi quái vật bước qua đều trúng độc rút máu liên tục.`,
              tag: '☠️ Độc tố diện rộng • Rút máu bỏ qua giáp cả đàn quái'
            };
          case 'STEEL':
            return {
              title: 'Mảnh Văng Kim Loại Xé Giáp (AoE Sunder)',
              desc: `Vụ nổ mảnh thép xé toạc giáp (-40% giáp) của TOÀN BỘ quái vật trong vùng nổ, cực kỳ hữu hiệu trước quái bọc thép.`,
              tag: '⚙️ Xé 40% giáp toàn bộ quái trong vùng nổ'
            };
          case 'GHOST':
            return {
              title: 'Oán Hồn Bùng Phát Đoạt Mệnh (AoE Soul Drain)',
              desc: `Sóng âm hồn làm suy nhược toàn bộ đám đông quái vật, làm giảm 20% sát thương tấn công và làm chậm 25%.`,
              tag: '👻 Hút hồn diện rộng • Suy yếu sức tấn công cả đoàn quái'
            };
          case 'DRAGON':
            return {
              title: 'Long Hống Địa Chấn Hủy Diệt (AoE Dragon Awe)',
              desc: `Tiếng gầm của loài rồng gây chấn động diện rộng, áp đặt hiệu ứng Long Uy giảm 25% công và 25% tốc cả bầy.`,
              tag: '🐉 Uy áp gầm thét diện rộng • Giảm 25% công và tốc'
            };
          case 'FAIRY':
            return {
              title: 'Bão Tinh Thể Mê Hoặc (AoE Charm)',
              desc: `Phát tán bụi tiên diện rộng làm mê hoặc và chậm 40% cả đàn quái, gây x2.0 sát thương hủy diệt lên loài rồng!`,
              tag: '🧚 Bụi tiên diện rộng • x2.0 Sát thương Quái Rồng AoE'
            };
        }
        break;

      default:
        return {
          title: 'Hiệu Ứng Nguyên Tố Cơ Bản',
          desc: 'Tăng cường sát thương phép và áp dụng hiệu ứng trạng thái lên mục tiêu trúng đòn.',
          tag: '✨ Sát thương hỗn hợp'
        };
    }

    return {
      title: 'Hiệu Ứng Nguyên Tố',
      desc: 'Áp dụng hiệu ứng nguyên tố lên mục tiêu.',
      tag: '✨ Hiệu ứng'
    };
  }

  private renderTreeNode(
    bp: TowerBlueprint,
    tierLabel: string,
    key: string,
    isBranch: boolean = false
  ): string {
    const isSelected = this.selectedTierKey === key;
    const elemIcon = ELEMENT_ICONS[bp.element] || '⚔️';
    const elemColor = ELEMENT_COLORS[bp.element] || '#ffffff';

    return `
      <div class="tree-node ${isSelected ? 'selected' : ''} ${isBranch ? 'branch-node' : ''}" data-tier-key="${key}">
        <div class="tn-top">
          <span class="tn-badge">${tierLabel}</span>
          <span class="tn-cost">🪙 ${bp.cost}</span>
        </div>
        <div class="tn-name">${bp.name}</div>
        <div class="tn-stats">
          <span style="color: ${elemColor}">${elemIcon} [${bp.element}]</span>
          <span>💥 DMG: <b>${bp.damage}</b></span>
          <span>🎯 Tầm: <b>${bp.range}</b></span>
        </div>
        <div class="tn-brief">${bp.description}</div>
      </div>
    `;
  }

  // ==========================================
  // 2. SOLDIERS CATEGORY (MELEE VS ARCHER)
  // ==========================================
  private renderSoldiersCategory(_targetSubId?: string): void {
    this.titleEl.textContent = 'Chiến Binh: Lính Cận Chiến & Lính Bắn Tên';
    this.iconEl.textContent = '⚔️';
    this.badgeEl.textContent = 'So Sánh Chi Tiết & Tối Ưu Chiến Thuật';

    this.contentEl.innerHTML = `
      <!-- Banner Hướng Dẫn Chuyển Đổi Trong Trận -->
      <div class="sp-section sp-card" style="border-left: 5px solid #10b981; background: linear-gradient(90deg, #0f241d 0%, #121b2d 100%);">
        <div class="sp-sec-header">
          <h4 class="sp-sec-title" style="color: #34d399; margin-bottom: 0;">🔄 CƠ CHẾ CHUYỂN ĐỔI LINH HOẠT TRONG TRẬN ĐẤU</h4>
          <span class="sp-hint">Chuyển đổi tức thì • Hoàn toàn Miễn Phí (0 Vàng)</span>
        </div>
        <p class="sp-desc" style="margin-bottom: 8px;">
          Mỗi Trại Dân Quân (Barracks) triệu tập <b>3 chiến binh người que</b>. Người chơi có quyền tự do lựa chọn cho đội quân này cầm <b>Kiếm & Khiên (Lính Đánh Gần)</b> hoặc <b>Cung & Lao (Lính Bắn Tên)</b> để ứng biến theo từng đợt quái:
        </p>
        <div class="sp-mechanic-box" style="border-left-color: #10b981;">
          <p><b>🕹️ Cách thao tác:</b> Bấm vào Nhà Lính trên bản đồ ➔ Nhấn nút <b>[⚔️ Lính Cận Chiến]</b> hoặc <b>[🏹 Lính Bắn Tên]</b> trên bảng điều khiển bên phải. 3 chiến binh sẽ tự động đổi vũ khí ngay tại điểm tập kết mà không làm gián đoạn trận đánh!</p>
          <p class="sp-tip-text">🚩 Bạn có thể cắm lại cờ (Rally Point) bất kỳ lúc nào để dàn quân tại khúc cua hiểm trở hoặc kéo xạ thủ ra sát bờ sông để bắn tỉa thủy quái!</p>
        </div>
      </div>

      <!-- Hai Cột So Sánh Trực Quan Giữa 2 Loại Lính -->
      <div class="soldiers-comparison-grid">
        <!-- 1. LÍNH ĐÁNH GẦN -->
        <div class="soldier-class-card melee-theme">
          <div class="soldier-class-header">
            <span class="soldier-icon-big">🛡️⚔️</span>
            <div class="soldier-title-box">
              <h3>Lính Đánh Gần (Melee Swordsman)</h3>
              <span class="soldier-sub-tag melee-tag">Bức Tường Thép • Chốt Chặn 1v1</span>
            </div>
          </div>
          <p class="sp-desc">
            Trang bị giáp sắt, khiên chắn và kiếm cận chiến. Trọng trách hàng đầu là nghênh chiến trực diện, giữ chân quái vật không cho lọt qua phòng tuyến.
          </p>

          <ul class="soldier-feature-list">
            <li>🛡️ <b>Chống Chịu Cực Cao:</b> Lượng máu dồi dào (100 ❤️ ở Cấp 1, lên đến 480 - 600 ❤️ ở Cấp 4) cùng giáp vật lý giảm tới 40% - 50% sát thương nhận vào.</li>
            <li>⚔️ <b>Khóa Chân Quái Vật (1v1 Block):</b> Khi quái chạm vào lính, cả hai sẽ dừng lại đấu kiếm. 3 lính chặn đứng tối đa 3 quái cùng lúc, tạo "vùng chết chóc" cho Pháo cối và Tháp Cung xả đạn.</li>
            <li>🎯 <b>Mục Tiêu Tác Chiến:</b> Chuyên trị quái <b>Đi Bộ (WALK)</b>, quái chạy nhanh, quái tàng hình và Boss mặt đất.</li>
            <li>⚠️ <b>Hạn Chế:</b> Không thể tấn công quái Bay (FLY) hay quái bơi Kênh Nước (SWIM).</li>
            <li>🌟 <b>Đột Phá Cấp 4:</b>
              <br>• <i>Nhánh 4-A (Thánh Điện Hộ Vệ):</i> Tự hồi máu liên tục mỗi giây (+12 HP/s), cực kỳ trâu bò.
              <br>• <i>Nhánh 4-B (Đấu Sĩ Cuồng Nộ):</i> Sát thương tăng vọt (55 DPS), chém sát thương diện rộng xung quanh.
            </li>
          </ul>

          <div class="soldier-stats-summary">
            <div class="stat-box">
              <span class="s-label">Tầm Tác Chiến</span>
              <span class="s-val">Tiếp xúc (Melee)</span>
            </div>
            <div class="stat-box">
              <span class="s-label">Chống Chịu</span>
              <span class="s-val" style="color: #60a5fa">Rất Cao (❤️❤️❤️)</span>
            </div>
            <div class="stat-box">
              <span class="s-label">Mục Tiêu</span>
              <span class="s-val" style="color: #cbd5e1">Chỉ Đi Bộ</span>
            </div>
          </div>
        </div>

        <!-- 2. LÍNH BẮN TÊN -->
        <div class="soldier-class-card ranged-theme">
          <div class="soldier-class-header">
            <span class="soldier-icon-big">🏹🎯</span>
            <div class="soldier-title-box">
              <h3>Lính Bắn Tên (Ranged Archer)</h3>
              <span class="soldier-sub-tag ranged-tag">Bắn Tỉa Viễn Chiến • Đa Miền Địa Hình</span>
            </div>
          </div>
          <p class="sp-desc">
            Trang bị cung tên dài và lao phóng. Đứng an toàn tại điểm cắm cờ (Rally Point) xả mưa tên hỗ trợ tầm xa lên mọi hướng tấn công của kẻ địch.
          </p>

          <ul class="soldier-feature-list">
            <li>🌟 <b>ĐẶC QUYỀN ĐA MIỀN:</b> Tấn công được <b>CẢ 3 LOẠI QUÁI: Đi Bộ (WALK), Bay Trên Trời (FLY) và Bơi Dưới Sông (SWIM)</b>!</li>
            <li>🎯 <b>Tầm Bắn Xa 150 px:</b> Tự do đặt cờ ở vị trí an toàn lề đường hoặc sát bờ kênh để bắn tỉa quái mà không sợ bị quái cận chiến áp sát.</li>
            <li>⚡ <b>Tốc Độ Ra Đạn Nhanh:</b> Bắn đều đặn 1.2 - 1.5 mũi tên/giây mỗi lính. 3 lính tạo ra mật độ 3.6 - 4.5 phát bắn/giây!</li>
            <li>🛡️ <b>Cơ Chế Tự Vệ:</b> Nếu quái đi bộ bước đè lên đúng vị trí lính đứng, lính vẫn tự động rút dao găm tự vệ và chống trả cận chiến.</li>
            <li>💡 <b>Chiến Thuật Bắt Bài:</b> Khi bản đồ xuất hiện Dơi Quỷ hay Rồng Lửa mà bạn chưa đủ vàng xây Tháp Cung mới, chỉ cần chuyển Nhà Lính sang Lính Bắn Tên để phòng không ngay lập tức!</li>
            <li>🌟 <b>Đột Phá Cấp 4:</b>
              <br>• <i>Nhánh 4-A:</i> Tăng tầm bắn lên 170px, bắn hỗ trợ xuyên giáp.
              <br>• <i>Nhánh 4-B:</i> Bắn liên thanh cực nhanh, hủy diệt quái bay đơn mục tiêu.
            </li>
          </ul>

          <div class="soldier-stats-summary">
            <div class="stat-box">
              <span class="s-label">Tầm Tác Chiến</span>
              <span class="s-val" style="color: #34d399">150 px (Tầm xa)</span>
            </div>
            <div class="stat-box">
              <span class="s-label">Tốc Độ Bắn</span>
              <span class="s-val" style="color: #facc15">1.2 - 1.5 /s</span>
            </div>
            <div class="stat-box">
              <span class="s-label">Mục Tiêu</span>
              <span class="s-val" style="color: #38bdf8">Đi bộ, Bay, Bơi sông</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bảng So Sánh Đối Đầu Trực Diện -->
      <div class="sp-section sp-card">
        <h4 class="sp-sec-title">📊 BẢNG SO SÁNH TRỰC DIỆN: LÍNH CẬN CHIẾN VS LÍNH BẮN TÊN</h4>
        <div class="table-responsive">
          <table class="stats-table">
            <thead>
              <tr>
                <th>Tiêu Chí Đánh Giá</th>
                <th style="color: #60a5fa">⚔️ Lính Đánh Gần (Melee)</th>
                <th style="color: #34d399">🏹 Lính Bắn Tên (Ranged)</th>
                <th>Lời Khuyên Chiến Thuật</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>Vũ khí & Phong cách</b></td>
                <td>Kiếm sắt & Khiên bản to</td>
                <td>Cung dài viễn chiến & Dao găm</td>
                <td>Melee đỡ đòn, Archer rỉa máu</td>
              </tr>
              <tr>
                <td><b>Tầm tác chiến</b></td>
                <td>Tiếp xúc cự ly gần (Melee)</td>
                <td>Tầm bắn xa <b>150 px</b></td>
                <td>Archer bao quát vùng rộng hơn nhiều</td>
              </tr>
              <tr>
                <td><b>Mục tiêu tấn công</b></td>
                <td>Chỉ quái <b>Đi Bộ (WALK)</b></td>
                <td><b>CẢ 3 LOẠI: Đi Bộ, Bay (FLY) & Bơi (SWIM)</b></td>
                <td>Chống dơi bay & thủy quái thì <b>BẮT BUỘC</b> dùng Lính Bắn Tên</td>
              </tr>
              <tr>
                <td><b>Khả năng chặn đường</b></td>
                <td><b>Chặn 1v1:</b> Quái phải đứng lại giao đấu</td>
                <td><b>Không chặn:</b> Quái tự do bước qua cờ</td>
                <td>Muốn giữ chân quái để pháo cối nổ thì dùng Melee</td>
              </tr>
              <tr>
                <td><b>Lượng Máu (HP)</b></td>
                <td>Cực cao (100 ❤️ ➔ 600 ❤️)</td>
                <td>Vừa phải (100 ❤️ ➔ 350 ❤️)</td>
                <td>Melee chịu đòn trâu bò hơn gấp 2 lần</td>
              </tr>
              <tr>
                <td><b>Giáp Vật Lý</b></td>
                <td>Giảm 10% ➔ 50% sát thương</td>
                <td>Giảm 10% ➔ 25% sát thương</td>
                <td>Melee kháng đòn cận chiến của quái rất tốt</td>
              </tr>
              <tr>
                <td><b>Khi gắn Nguyên Tố</b></td>
                <td>Đòn chém mang +45% Phép + Hiệu ứng</td>
                <td>Mũi tên mang +45% Phép + Hiệu ứng</td>
                <td>Cả 2 đều dùng được sát thương hỗn hợp Vật lý + Phép!</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Bảng Chỉ Số Phát Triển Qua 4 Cấp Độ -->
      <div class="sp-section sp-card">
        <h4 class="sp-sec-title">📈 CHỈ SỐ LÍNH CHI TIẾT THEO CẤP ĐỘ NÂNG CẤP</h4>
        <div class="table-responsive">
          <table class="stats-table">
            <thead>
              <tr>
                <th>Cấp Độ</th>
                <th>Tên Công Trình</th>
                <th>Số Lính</th>
                <th>Máu (HP)</th>
                <th>Giáp Giảm DMG</th>
                <th>Hồi Sinh</th>
                <th>Sát Thương Cơ Bản</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>Cấp 1</b></td>
                <td>Trại Dân Quân</td>
                <td>3 Lính</td>
                <td>100 ❤️</td>
                <td>10% 🛡️</td>
                <td>8s</td>
                <td>8 DMG (DPS ~8)</td>
              </tr>
              <tr>
                <td><b>Cấp 2</b></td>
                <td>Doanh Trại Bộ Binh</td>
                <td>4 Lính</td>
                <td>180 ❤️</td>
                <td>25% 🛡️</td>
                <td>8s</td>
                <td>15 DMG (DPS ~16)</td>
              </tr>
              <tr>
                <td><b>Cấp 3</b></td>
                <td>Thành Trì Hiệp Sĩ</td>
                <td>5 Lính</td>
                <td>280 ❤️</td>
                <td>40% 🛡️</td>
                <td>7s</td>
                <td>26 DMG (DPS ~31)</td>
              </tr>
              <tr class="branch-row-a">
                <td><b>4-A 🌟</b></td>
                <td>Thánh Điện Hộ Vệ</td>
                <td>5 Lính</td>
                <td class="highlight-val">480 ❤️ (+12 HP/s hồi phục)</td>
                <td class="highlight-val">50% 🛡️</td>
                <td>6s</td>
                <td>42 DMG (DPS ~46)</td>
              </tr>
              <tr class="branch-row-b">
                <td><b>4-B 🌟</b></td>
                <td>Chiến Đội Xung Kích</td>
                <td>5 Lính</td>
                <td>380 ❤️</td>
                <td>40% 🛡️</td>
                <td>6s</td>
                <td class="highlight-val">54 DMG (DPS ~86)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // ==========================================
  // 3. BUILDING ELEMENTAL IMBUE CATEGORY
  // ==========================================
  private renderBuildingImbueCategory(_targetSubId?: string): void {
    this.titleEl.textContent = 'Hiệu Ứng Nguyên Tố Trang Bị Cho Công Trình';
    this.iconEl.textContent = '⚡';
    this.badgeEl.textContent = 'Tối Ưu Sát Thương Hỗn Hợp & Song Nguyên Tố';

    this.contentEl.innerHTML = `
      <!-- Banner Giới Thiệu Cơ Chế Gắn Nguyên Tố -->
      <div class="sp-section sp-card" style="border-left: 5px solid #f59e0b; background: linear-gradient(90deg, #241808 0%, #121b2d 100%);">
        <div class="sp-sec-header">
          <h4 class="sp-sec-title" style="color: #facc15; margin-bottom: 0;">🔮 CƠ CHẾ TRANG BỊ NGUYÊN TỐ (ELEMENTAL IMBUE)</h4>
          <span class="sp-hint">Chi phí: 40 Vàng / khe (Khe 2 Phù Thủy: 50 Vàng)</span>
        </div>
        <p class="sp-desc" style="margin-bottom: 8px;">
          Trong Stick Vanguard, hệ thống trang bị nguyên tố hoạt động <b>hoàn toàn độc lập với cấp độ nâng cấp của tháp</b>. Bạn có thể yểm phép nguyên tố ngay từ Cấp 1, và khi nâng cấp tháp lên Cấp 2, 3, 4, nguyên tố đã gắn <b>vẫn được bảo toàn nguyên vẹn</b>!
        </p>
        <div class="sp-mechanic-box" style="border-left-color: #f59e0b;">
          <p><b>✨ Sát Thương Hỗn Hợp (Hybrid Damage):</b> Tháp Cung, Pháo Cối và Nhà Lính gây 100% Sát thương Vật lý cơ bản + <b>45% Sát thương Phép Nguyên Tố cộng thêm</b>. Nếu quái miễn nhiễm Vật lý (như Khổng Lồ Đá), phần sát thương Phép vẫn gây đủ sát thương!</p>
          <p class="sp-tip-text">💡 Bạn có thể đổi sang nguyên tố khác bất cứ lúc nào trong trận để khắc chế chính xác hệ của đợt quái sắp tràn vào!</p>
        </div>
      </div>

      <!-- Lưới 4 Loại Công Trình & Hiệu Ứng Nguyên Tố Chi Tiết -->
      <div class="imbue-cards-grid">
        <!-- 1. BARRACKS / NHÀ LÍNH -->
        <div class="imbue-building-card">
          <div class="imbue-building-header">
            <span class="imbue-building-icon">🛡️</span>
            <div>
              <h3>1. Trại Dân Quân (Barracks)</h3>
              <span class="sp-hint">Ban Phước Nguyên Tố Lên Cả 3 Chiến Binh</span>
            </div>
            <span class="imbue-ratio-badge">+45% Sát Thương Phép</span>
          </div>
          <p class="sp-desc">
            Khi gắn nguyên tố cho Nhà Lính, <b>cả 3 chiến binh người que (dù cầm Kiếm hay Cung)</b> đều được bọc hào quang nguyên tố. Mọi nhát chém và mũi tên đều gây sát thương hỗn hợp và kích hoạt hiệu ứng tương ứng:
          </p>

          <div class="imbue-synergy-list">
            <div class="imbue-synergy-item" style="border-left-color: #fef08a">
              <b>✨ Ánh Sáng (Light) - Bí Thuật Bất Tử:</b> Mỗi đòn đánh của lính <b>tự động hồi phục +5 HP</b> cho bản thân. Lính đánh gần trở thành bức tường thành không thể xuyên thủng!
            </div>
            <div class="imbue-synergy-item" style="border-left-color: #06b6d4">
              <b>❄️ Băng (Ice) - Chốt Chặn Băng Giá:</b> Đòn đánh làm chậm quái 45% và có <b>25% tỉ lệ Đóng Băng 1.2s</b>, bắt quái vật đứng im chịu trận.
            </div>
            <div class="imbue-synergy-item" style="border-left-color: #f59e0b">
              <b>⚡ Sét (Lightning) - Sốc Điện Liên Hoàn:</b> Đòn đánh gây choáng 0.35s ngắt đòn quái và phóng tia sét nảy sang kẻ địch bên cạnh gây 35% DMG.
            </div>
            <div class="imbue-synergy-item" style="border-left-color: #ef4444">
              <b>🔥 Lửa (Fire) - Kiếm Lửa Thiêu Đốt:</b> Đốt cháy quái vật trong 3 giây (rút máu DoT 20% mỗi 0.5s = 120% tổng sát thương).
            </div>
            <div class="imbue-synergy-item" style="border-left-color: #8b5cf6">
              <b>🔮 Hắc Ám (Dark) - Lời Nguyền Suy Yếu:</b> Gắn dấu ấn Nguyền Rủa 3.5s khiến quái nhận thêm <b>+35% sát thương từ MỌI NGUỒN</b>.
            </div>
          </div>
        </div>

        <!-- 2. ARCHER / THÁP CUNG -->
        <div class="imbue-building-card">
          <div class="imbue-building-header">
            <span class="imbue-building-icon">🏹</span>
            <div>
              <h3>2. Tháp Cung (Archer Tower)</h3>
              <span class="sp-hint">Bắn Tỉa Tốc Độ Cao Áp Đặt Hiệu Ứng Liên Tục</span>
            </div>
            <span class="imbue-ratio-badge">+45% Sát Thương Phép</span>
          </div>
          <p class="sp-desc">
            Nhờ tốc độ bắn cực nhanh (1.5 - 2.5 phát/giây), Tháp Cung có khả năng <b>duy trì hiệu ứng trạng thái 100% thời gian</b> lên mục tiêu bị nhắm bắn:
          </p>

          <div class="imbue-synergy-list">
            <div class="imbue-synergy-item" style="border-left-color: #06b6d4">
              <b>❄️ Băng (Ice) - Khóa Chân Vĩnh Cửu:</b> Với tốc độ bắn nhanh, mũi tên băng liên tục làm mới thời gian làm chậm 45% và liên tục đóng băng quái, quái vật gần như bị tê liệt hoàn toàn.
            </div>
            <div class="imbue-synergy-item" style="border-left-color: #10b981">
              <b>🌪️ Gió (Wind) - Khắc Tinh Quái Bay:</b> Tăng thêm <b>+50% sát thương lên quái Bay (FLY)</b> và liên tục đẩy lùi Dơi Quỷ lùi lại 25px, quái bay hoàn toàn không thể bay tới căn cứ!
            </div>
            <div class="imbue-synergy-item" style="border-left-color: #ef4444">
              <b>🔥 Lửa (Fire) - Mưa Tên Rực Lửa:</b> Duy trì thiêu đốt DoT không dứt, cực kỳ hữu hiệu khi bào máu Boss hoặc quái trâu máu.
            </div>
            <div class="imbue-synergy-item" style="border-left-color: #8b5cf6">
              <b>🔮 Hắc Ám (Dark) - Điểm Huyệt Nguyền Rủa:</b> Bắn vào quái đầu đàn để ghim ấn Nguyền Rủa (+35% sát thương nhận vào), tạo điều kiện cho Pháo cối dứt điểm.
            </div>
          </div>
        </div>

        <!-- 3. MAGE / THÁP PHÙ THỦY -->
        <div class="imbue-building-card" style="border-color: #8b5cf6;">
          <div class="imbue-building-header">
            <span class="imbue-building-icon">🔮</span>
            <div>
              <h3>3. Tháp Phù Thủy (Mage Tower)</h3>
              <span class="sp-hint">Thuần Phép Bỏ Qua Giáp • Độc Quyền Song Nguyên Tố</span>
            </div>
            <span class="imbue-ratio-badge" style="background: rgba(139, 92, 246, 0.2); color: #c084fc; border-color: #a855f7;">100% Phép + 100% Khe 2</span>
          </div>
          <p class="sp-desc">
            Tháp Pháp Sư là công trình ma thuật tối thượng <b>bỏ qua 100% giáp vật lý</b>. Sở hữu <b>2 KHE NGUYÊN TỐ ĐỘC LẬP</b> cho phép người chơi phối hợp tạo chuỗi phản ứng nguyên tố hủy diệt:
          </p>

          <div class="imbue-synergy-list">
            <div class="imbue-synergy-item" style="border-left-color: #3b82f6">
              <b>💧 + ⚡ COMBO SỐC ĐIỆN HỦY DIỆT (Nước + Sét):</b> Đòn Nước làm ướt (Wet), lập tức kích hoạt phản ứng Sốc Điện khiến đòn Sét nhận thêm <b>+75% SÁT THƯƠNG BỘC PHÁT</b> và giật nổ tia sét diện rộng!
            </div>
            <div class="imbue-synergy-item" style="border-left-color: #06b6d4">
              <b>💧 + ❄️ COMBO BĂNG HÀ ĐÓNG BĂNG (Nước + Băng):</b> Trạng thái Ẩm Ướt giúp đòn Băng nhận thêm <b>+50% SÁT THƯƠNG</b> và tăng mạnh xác suất Đóng Băng bất động 1.2s!
            </div>
            <div class="imbue-synergy-item" style="border-left-color: #ef4444">
              <b>🔮 + 🔥 COMBO HỎA NGỤC HẮC ÁM (Hắc Ám + Lửa):</b> Nguyền Rủa khuếch đại <b>+35% sát thương nhận vào</b>, làm cho DoT thiêu đốt của Lửa thiêu rụi mục tiêu nhanh gấp bội!
            </div>
            <div class="imbue-synergy-item" style="border-left-color: #fef08a">
              <b>✨ + 🔮 COMBO LƯỠNG CỰC QUANG ÁM (Ánh Sáng + Hắc Ám):</b> Sự va chạm giữa 2 thái cực ma thuật tối cao, xuyên thủng mọi loại khiên kháng phép của Trùm cuối.
            </div>
          </div>
        </div>

        <!-- 4. ARTILLERY / PHÁO CỐI -->
        <div class="imbue-building-card">
          <div class="imbue-building-header">
            <span class="imbue-building-icon">💣</span>
            <div>
              <h3>4. Pháo Cối (Artillery Tower)</h3>
              <span class="sp-hint">Sát Thương Phá Hủy Diện Rộng (AoE)</span>
            </div>
            <span class="imbue-ratio-badge">+45% Sát Thương Phép AoE</span>
          </div>
          <p class="sp-desc">
            Đạn pháo phát nổ khi chạm đất gây 100% Sát thương Vật lý nổ + <b>45% Sát thương Phép Nguyên Tố TRÊN TOÀN BỘ BÁN KÍNH NỔ (75px - 100px)</b>! Hiệu ứng nguyên tố tác động đồng thời lên TẤT CẢ quái vật trong vùng nổ:
          </p>

          <div class="imbue-synergy-list">
            <div class="imbue-synergy-item" style="border-left-color: #ef4444">
              <b>🔥 Pháo Lửa (Napalm Barrage):</b> Tạo biển lửa bùng nổ, thiêu đốt DoT cùng lúc cả đàn quái đi bộ tụ tập, quét sạch đội hình địch đông đúc.
            </div>
            <div class="imbue-synergy-item" style="border-left-color: #06b6d4">
              <b>❄️ Pháo Băng (Blizzard Impact):</b> Làm chậm 45% toàn bộ binh đoàn địch trong bán kính nổ, bẻ gãy đợt tràn quái quy mô lớn.
            </div>
            <div class="imbue-synergy-item" style="border-left-color: #d97706">
              <b>🪨 Pháo Đất (Địa Chấn Cataclysm):</b> Tăng thêm <b>+20% sát thương trực tiếp lên quái Đi Bộ</b> và gây chấn động làm chậm 35% diện rộng.
            </div>
            <div class="imbue-synergy-item" style="border-left-color: #f59e0b">
              <b>⚡ Pháo Sét (EMP Cluster):</b> Gây choáng hàng loạt quái vật cùng lúc và kích hoạt các tia sét phụ nảy chéo giữa các mục tiêu.
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // 4. TRAPS CATEGORY
  // ==========================================
  private renderTrapsCategory(targetSubId?: string): void {
    this.titleEl.textContent = 'Hệ Thống Bẫy Chiến Thuật';
    this.iconEl.textContent = '⚙️';
    this.badgeEl.textContent = 'Bẫy Đường & Thủy Lôi';

    const traps: TowerBlueprint[] = [
      TOWER_BLUEPRINTS['TRAP_SPIKE'],
      TOWER_BLUEPRINTS['TRAP_FIRE'],
      TOWER_BLUEPRINTS['TRAP_FROST'],
      TOWER_BLUEPRINTS['TRAP_NET']
    ].filter(Boolean);

    const trapEffectsMap: Record<
      string,
      { effectName: string; effectDesc: string; synergyTag: string }
    > = {
      TRAP_SPIKE: {
        effectName: 'Chông Gai & Địa Chấn (Earth/Slow)',
        effectDesc: 'Phát nổ khi quái Đi Bộ dẫm phải. Gây 20 sát thương và tạo chấn động làm chậm 35% tốc độ di chuyển trong 2.5s.',
        synergyTag: '🪨 Địa chấn • Giảm 35% Tốc độ quái đi bộ'
      },
      TRAP_FIRE: {
        effectName: 'Mìn Lửa Hỏa Ngục (Fire/Burn)',
        effectDesc: 'Kích nổ diện rộng thiêu đốt toàn bộ quái vật dẫm phải, gây 25 sát thương Lửa và thiêu đốt DoT trong 3.0s (mỗi 0.5s rút máu 20% Base DMG).',
        synergyTag: '🔥 DoT Thiêu Đốt 3s diện rộng • Bỏ qua giáp'
      },
      TRAP_FROST: {
        effectName: 'Thủy Lôi Băng Giá (Ice/Freeze)',
        effectDesc: 'Khắc tinh số 1 ngầm dưới lòng sông: Phát nổ khi Thủy Quái bơi qua, gây 15 sát thương Hàn Băng, làm chậm 45% và đóng băng quái dưới nước bất động 1.2s!',
        synergyTag: '🌊 Độc quyền Sông Nước • Làm chậm 45% & Đóng băng 1.2s'
      },
      TRAP_NET: {
        effectName: 'Lưới Điện Tê Liệt (Lightning/Shock)',
        effectDesc: 'Phóng xung điện cao thế giữ chân quái vật, gây choáng tê liệt 0.35s và nảy tia sét giật lan 35% sát thương sang quái vật lân cận.',
        synergyTag: '⚡ Choáng 0.35s • Nảy tia sét 35% DMG sang quái bên cạnh'
      }
    };

    const cardsHtml = traps
      .map((trap) => {
        const icon = ELEMENT_ICONS[trap.element] || '⚙️';
        const color = ELEMENT_COLORS[trap.element] || '#ffffff';
        const isWaterOnly = trap.placement === 'WATER_TRAP';
        const isHighlighted = targetSubId && (trap.type === targetSubId || trap.name.includes(targetSubId));
        const effectInfo = trapEffectsMap[trap.type] || {
          effectName: 'Hiệu ứng bẫy',
          effectDesc: 'Gây sát thương lên mục tiêu kích nổ.',
          synergyTag: '⚙️ Bẫy chiến thuật'
        };

        return `
        <div class="trap-detail-card sp-card ${isHighlighted ? 'highlighted-elem' : ''}" style="border-left-color: ${color}">
          <div class="trap-card-header">
            <span class="trap-icon" style="color: ${color}">${icon}</span>
            <div>
              <h4 class="trap-name">${trap.name}</h4>
              <span class="trap-placement-tag ${isWaterOnly ? 'water-tag' : 'path-tag'}">
                ${isWaterOnly ? '🌊 Đặt dưới sông (Water)' : '🪨 Đặt trên đường (Ground)'}
              </span>
            </div>
            <span class="trap-cost">🪙 ${trap.cost}</span>
          </div>
          <p class="trap-desc">${trap.description}</p>
          <div class="trap-stats-row">
            <span>Sát thương nổ: <b>${trap.damage} DMG</b></span>
            <span>Số lần nổ trữ: <b>${trap.maxTrapCharges || 1} lần</b></span>
            <span>Nguyên tố: <b style="color: ${color}">${icon} ${ELEMENT_NAMES[trap.element]}</b></span>
            <span>Hồi phục nạp: <b>Sau mỗi đợt quái</b></span>
          </div>
          <div class="sim-effect-box" style="margin-top: 8px; border-left-color: ${color}; padding: 8px 12px;">
            <div class="sim-effect-title" style="color: ${color}; font-size: 13.5px;">
              ${icon} ${effectInfo.effectName}
            </div>
            <p class="sim-effect-desc" style="font-size: 13px;">${effectInfo.effectDesc}</p>
            <div class="sim-synergy-tag" style="font-size: 12px; margin-top: 2px;">${effectInfo.synergyTag}</div>
          </div>
        </div>
      `;
      })
      .join('');

    this.contentEl.innerHTML = `
      <div class="sp-section sp-card">
        <h4 class="sp-sec-title">📖 CƠ CHẾ HOẠT ĐỘNG CỦA BẪY</h4>
        <p class="sp-desc">
          Bẫy được đặt trực tiếp lên các vị trí ô đặc biệt trên đường đi (PATH_TRAP) hoặc dưới kênh nước (WATER_TRAP).
          Khác với tháp thông thường cần tầm bắn, bẫy nằm ẩn mình và tự động kích hoạt ngay khi quái vật bước chân vào bán kính kích nổ.
        </p>
        <p class="sp-tip-text">
          💡 Bẫy tự động tái kích hoạt tối đa theo số lần trữ (Charges) và sẽ tự nạp đầy lại sau mỗi đợt quái. Bẫy Thủy Lôi là khắc tinh duy nhất dưới lòng sông!
        </p>
      </div>

      <div class="sp-section">
        <h4 class="sp-sec-title">⚙️ DANH SÁCH 4 LOẠI BẪY CHIẾN THUẬT</h4>
        <div class="traps-list-grid">${cardsHtml}</div>
      </div>
    `;
  }

  // ==========================================
  // 5. ELEMENTAL MATRIX & STATUS EFFECTS (15 ELEMENTS CODEX)
  // ==========================================
  private renderElementsCategory(highlightElem?: string): void {
    if (highlightElem) {
      this.currentElementSubTab = highlightElem;
    } else if (!this.currentElementSubTab) {
      this.currentElementSubTab = 'OVERVIEW';
    }

    const allElements: ElementType[] = [
      'PHYSICAL',
      'FIRE',
      'WATER',
      'EARTH',
      'WIND',
      'LIGHTNING',
      'ICE',
      'LIGHT',
      'DARK',
      'GRASS',
      'POISON',
      'STEEL',
      'GHOST',
      'DRAGON',
      'FAIRY'
    ];

    this.titleEl.textContent = 'Hệ Thống Nguyên Tố & Ma Trận Khắc Chế (15 Hệ)';
    this.iconEl.textContent = '✨';
    this.badgeEl.textContent = '15 Nguyên Tố • 14 Hiệu Ứng • 11 Phản Ứng Phối Hợp';

    // Sub-navigation bar
    const subNavHtml = `
      <div class="elem-sub-nav">
        <button class="elem-sub-btn ${this.currentElementSubTab === 'OVERVIEW' ? 'active' : ''}" data-sub-elem="OVERVIEW">
          🌟 Tổng Quan
        </button>
        ${allElements
          .map((elem) => {
            const isActive = this.currentElementSubTab === elem;
            const color = ELEMENT_COLORS[elem];
            const icon = ELEMENT_ICONS[elem];
            const shortName = ELEMENT_NAMES[elem].split(' ')[0];
            return `
              <button class="elem-sub-btn ${isActive ? 'active' : ''}" data-sub-elem="${elem}"
                style="${isActive ? `border-color: ${color}; color: ${color}; background: ${color}22; box-shadow: 0 0 10px ${color}40;` : ''}">
                <span>${icon}</span>
                <span>${shortName}</span>
              </button>
            `;
          })
          .join('')}
      </div>
    `;

    if (this.currentElementSubTab === 'OVERVIEW') {
      // 1. OVERVIEW VIEW
      const reactionCardsHtml = ELEMENTAL_REACTIONS.map((rx) => {
        const e1 = STATUS_TO_ELEMENT[rx.requiredStatus] || 'PHYSICAL';
        const e2 = rx.triggerElement;
        const e1Color = ELEMENT_COLORS[e1];
        const e2Color = ELEMENT_COLORS[e2];
        return `
          <div class="reaction-card sp-card">
            <div class="reaction-card-header">
              <span class="rx-icon">${rx.label.split(' ')[0]}</span>
              <div class="rx-title-group">
                <h4 class="rx-name">${rx.name}</h4>
                <div class="rx-elements-row">
                  <span class="rx-pill" style="border-color: ${e1Color}; color: ${e1Color}">${ELEMENT_ICONS[e1]} ${ELEMENT_NAMES[e1]}</span>
                  <span class="rx-plus">+</span>
                  <span class="rx-pill" style="border-color: ${e2Color}; color: ${e2Color}">${ELEMENT_ICONS[e2]} ${ELEMENT_NAMES[e2]}</span>
                </div>
              </div>
              <span class="rx-mult-badge">x${rx.damageMultiplier} DMG</span>
            </div>
            <p class="rx-desc">${rx.description}</p>
          </div>
        `;
      }).join('');

      const quickElemCardsHtml = allElements
        .map((elem) => {
          const data = ELEMENT_CODEX_DETAILS[elem];
          const color = ELEMENT_COLORS[elem];
          const icon = ELEMENT_ICONS[elem];
          const strongText = data.strongAgainst.map((s) => `${ELEMENT_ICONS[s.element]} ${ELEMENT_NAMES[s.element]} (x${s.mult})`).join(', ');
          const weakText = data.weakAgainstAttack.map((w) => `${ELEMENT_ICONS[w.element]} ${ELEMENT_NAMES[w.element]} (x${w.mult})`).join(', ');

          return `
            <div class="elem-overview-card sp-card elem-quick-jump" data-sub-elem="${elem}" style="border-left-color: ${color}">
              <div class="elem-overview-header">
                <span class="elem-overview-icon" style="background: ${color}20; color: ${color}; border: 1px solid ${color}40">${icon}</span>
                <div>
                  <h4 class="elem-overview-name" style="color: ${color}">${data.nameVi}</h4>
                  <span class="elem-overview-badge">${data.badge}</span>
                </div>
                <button class="btn-elem-inspect">Xem Hồ Sơ ➔</button>
              </div>
              <div class="elem-overview-matchup-row">
                <div class="match-strong">
                  <span class="m-label">⚔️ Khắc chế:</span>
                  <span class="m-val">${strongText || 'Ổn định'}</span>
                </div>
                <div class="match-weak">
                  <span class="m-label">🛡️ Bị kháng:</span>
                  <span class="m-val">${weakText || 'Không'}</span>
                </div>
              </div>
            </div>
          `;
        })
        .join('');

      this.contentEl.innerHTML = `
        ${subNavHtml}

        <!-- SUMMARY RULES BANNER -->
        <div class="sp-section sp-card" style="border-left: 5px solid #38bdf8;">
          <h4 class="sp-sec-title">⚖️ NGUYÊN TẮC MA TRẬN 15 HỆ & TƯƠNG TÁC CHIẾN ĐẤU</h4>
          <p class="sp-desc">
            Stick Vanguard mở rộng toàn diện hệ thống nguyên tố lên <b>15 hệ độc lập</b>. Mỗi quái vật, công trình và đòn tấn công đều tương tác lẫn nhau thông qua sát thương khắc chế và các hiệu ứng trạng thái đặc thù:
          </p>
          <div class="matrix-rules-grid">
            <div class="rule-box weakness-rule">
              <span class="r-icon">💥</span>
              <div>
                <b>Ưu thế Tấn Công (x1.5 -> x2.0 Sát thương):</b>
                <p>Đánh đúng khắc tinh (Nước dập Lửa, Tiên diệt Rồng, Sét chập Nước, Quang thanh tẩy Ám) gây sát thương cực lớn.</p>
              </div>
            </div>
            <div class="rule-box resist-rule">
              <span class="r-icon">🛡️</span>
              <div>
                <b>Bị Kháng Cự (x0.3 -> x0.7 Sát thương):</b>
                <p>Đánh vào hệ kháng hoặc cùng nguyên tố bị tiêu hao sát thương nặng nề.</p>
              </div>
            </div>
            <div class="rule-box immune-rule">
              <span class="r-icon">🚫</span>
              <div>
                <b>Miễn Nhiễm & Phối Hợp Combo (x1.3 -> x1.8 DMG):</b>
                <p>Khai thác 11 Phản Ứng Nguyên Tố bằng Tháp Phù Thủy (Song Hệ) hoặc phối hợp nhiều loại tháp trên trận địa!</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 11 COMBOS & REACTIONS -->
        <div class="sp-section">
          <h4 class="sp-sec-title">💥 11 PHẢN ỨNG NGUYÊN TỐ PHỐI HỢP CHIẾN THUẬT (REACTIONS)</h4>
          <p class="sp-desc" style="margin-bottom: 12px;">
            Khi mục tiêu trúng liên tiếp 2 nguyên tố tương thích, một phản ứng bộc phát sẽ được kích hoạt tức thì kèm sát thương khuếch đại:
          </p>
          <div class="reactions-grid">${reactionCardsHtml}</div>
        </div>

        <!-- QUICK ELEMENT CARDS GRID -->
        <div class="sp-section">
          <h4 class="sp-sec-title">🧭 DANH SÁCH 15 HỆ NGUYÊN TỐ (BẤM ĐỂ XEM CHI TIẾT MỤC CON)</h4>
          <div class="elem-overview-grid">${quickElemCardsHtml}</div>
        </div>
      `;
    } else {
      // 2. DEDICATED ELEMENT SUB-TAB VIEW (MỖI NGUYÊN TỐ LÀ 1 MỤC CON)
      const currentElem = this.currentElementSubTab as ElementType;
      const data = ELEMENT_CODEX_DETAILS[currentElem] || ELEMENT_CODEX_DETAILS['PHYSICAL'];
      const color = ELEMENT_COLORS[currentElem];
      const icon = ELEMENT_ICONS[currentElem];

      // Strong against list
      const strongHtml = data.strongAgainst
        .map((s) => {
          const sColor = ELEMENT_COLORS[s.element];
          const sIcon = ELEMENT_ICONS[s.element];
          return `
            <div class="matchup-detail-row strong-row">
              <span class="m-elem-badge" style="border-color: ${sColor}; color: ${sColor}">
                ${sIcon} Hệ ${ELEMENT_NAMES[s.element]}
              </span>
              <span class="m-mult-tag mult-strong">x${s.mult} Sát thương</span>
              <span class="m-note">${s.note}</span>
            </div>
          `;
        })
        .join('');

      // Weak against attack (Offensive resistance)
      const weakAttackHtml = data.weakAgainstAttack
        .map((w) => {
          const wColor = ELEMENT_COLORS[w.element];
          const wIcon = ELEMENT_ICONS[w.element];
          return `
            <div class="matchup-detail-row weak-row">
              <span class="m-elem-badge" style="border-color: ${wColor}; color: ${wColor}">
                ${wIcon} Hệ ${ELEMENT_NAMES[w.element]}
              </span>
              <span class="m-mult-tag mult-weak">x${w.mult} Sát thương</span>
              <span class="m-note">${w.note}</span>
            </div>
          `;
        })
        .join('');

      // Weak against defense (Defensive vulnerability)
      const weakDefenseHtml = data.weakAgainstDefense
        .map((w) => {
          const wColor = ELEMENT_COLORS[w.element];
          const wIcon = ELEMENT_ICONS[w.element];
          return `
            <div class="matchup-detail-row weak-def-row">
              <span class="m-elem-badge" style="border-color: ${wColor}; color: ${wColor}">
                ${wIcon} Hệ ${ELEMENT_NAMES[w.element]}
              </span>
              <span class="m-mult-tag mult-def-danger">Nhận x${w.mult} DMG</span>
              <span class="m-note">${w.note}</span>
            </div>
          `;
        })
        .join('');

      // Combos list
      const combosHtml = data.combos
        .map((c) => {
          const pColor = ELEMENT_COLORS[c.partner];
          const pIcon = ELEMENT_ICONS[c.partner];
          return `
            <div class="elem-combo-box sp-card">
              <div class="elem-combo-header">
                <span class="combo-partner" style="border-color: ${pColor}; color: ${pColor}">
                  ${icon} + ${pIcon} Hệ ${ELEMENT_NAMES[c.partner]}
                </span>
                <span class="combo-title" style="color: #facc15">⚡ ${c.reaction}</span>
              </div>
              <p class="combo-desc">${c.desc}</p>
            </div>
          `;
        })
        .join('');

      this.contentEl.innerHTML = `
        ${subNavHtml}

        <!-- ELEMENT SUB-ITEM DOSSIER -->
        <div class="elem-dossier-hero sp-card" style="border-left: 6px solid ${color};">
          <div class="elem-dossier-top">
            <span class="elem-dossier-icon" style="background: ${color}25; color: ${color}; border: 2px solid ${color}60;">${icon}</span>
            <div class="elem-dossier-titles">
              <div class="elem-title-row">
                <h3 class="elem-dossier-name" style="color: ${color}">Hệ ${data.nameVi} (${currentElem})</h3>
                <span class="elem-badge" style="background: ${color}20; color: ${color}; border-color: ${color}40">${data.badge}</span>
              </div>
              <p class="elem-nature-text">${data.nature}</p>
            </div>
          </div>
        </div>

        <!-- 1. HIỆU ỨNG CHIẾN ĐẤU & CÔNG TRÌNH -->
        <div class="sp-section sp-card">
          <h4 class="sp-sec-title" style="color: #38bdf8;">🔮 1. HIỆU ỨNG TRẠNG THÁI & ỨNG DỤNG LÊN 4 CÔNG TRÌNH</h4>
          <div class="status-effect-dossier-box" style="border-left-color: ${color}">
            <div class="status-eff-header">
              <span class="status-eff-title" style="color: ${color}">${icon} Trạng Thái Đặc Trưng: <b>${data.statusEffectName}</b></span>
            </div>
            <p class="status-eff-desc">${data.statusEffectDesc}</p>
          </div>

          <div class="towers-element-effect-grid">
            <div class="tower-effect-col">
              <div class="t-eff-header">🛡️ Trại Dân Quân (Barracks)</div>
              <p class="t-eff-p">${data.buildingEffects.barracks}</p>
            </div>
            <div class="tower-effect-col">
              <div class="t-eff-header">🏹 Tháp Cung (Archer)</div>
              <p class="t-eff-p">${data.buildingEffects.archer}</p>
            </div>
            <div class="tower-effect-col">
              <div class="t-eff-header">🔮 Tháp Phù Thủy (Mage)</div>
              <p class="t-eff-p">${data.buildingEffects.mage}</p>
            </div>
            <div class="tower-effect-col">
              <div class="t-eff-header">💣 Pháo Cối (Artillery)</div>
              <p class="t-eff-p">${data.buildingEffects.artillery}</p>
            </div>
          </div>
        </div>

        <!-- 2. KHẮC CHẾ (ƯU THẾ TẤN CÔNG) -->
        <div class="sp-section sp-card" style="border-left: 5px solid #22c55e;">
          <h4 class="sp-sec-title" style="color: #4ade80;">⚔️ 2. KHẮC CHẾ - ƯU THẾ TẤN CÔNG (STRONG AGAINST)</h4>
          <p class="sp-desc">Khi sử dụng Hệ ${data.nameVi} tấn công các quái vật thuộc các hệ dưới đây, đòn đánh sẽ gây sát thương bộc phát:</p>
          <div class="matchup-list">${strongHtml || '<p class="sp-desc">Gây sát thương cân bằng lên mọi hệ.</p>'}</div>
        </div>

        <!-- 3. YẾU THẾ (BỊ KHÁNG & ĐIỂM YẾU PHÒNG THỦ) -->
        <div class="sp-section sp-card" style="border-left: 5px solid #ef4444;">
          <h4 class="sp-sec-title" style="color: #f87171;">🛡️ 3. YẾU THẾ - BỊ KHÁNG & ĐIỂM YẾU PHÒNG THỦ (WEAK AGAINST)</h4>
          <div class="weakness-split-grid">
            <div class="weakness-subcol">
              <h5 class="subcol-title">⚔️ Khi Tấn Công (Bị Kháng Sát Thương):</h5>
              <div class="matchup-list">${weakAttackHtml || '<p class="sp-desc">Không bị suy giảm sát thương.</p>'}</div>
            </div>
            <div class="weakness-subcol">
              <h5 class="subcol-title">🛡️ Khi Phòng Thủ (Quái Hệ Này Sợ Nhất):</h5>
              <div class="matchup-list">${weakDefenseHtml || '<p class="sp-desc">Không có điểm yếu phòng thủ đặc thù.</p>'}</div>
            </div>
          </div>
        </div>

        <!-- 4. PHỐI HỢP & PHẢN ỨNG NGUYÊN TỐ -->
        <div class="sp-section sp-card" style="border-left: 5px solid #eab308;">
          <h4 class="sp-sec-title" style="color: #facc15;">🔗 4. PHỐI HỢP & PHẢN ỨNG NGUYÊN TỐ (COMBOS & SYNERGIES)</h4>
          <p class="sp-desc">Ghép cặp Hệ ${data.nameVi} với các hệ sau để tạo ra các hiệu ứng bộc phá sát thương và khống chế:</p>
          <div class="combos-grid">${combosHtml || '<p class="sp-desc">Không có phản ứng ma pháp trực tiếp.</p>'}</div>
        </div>

        <!-- 5. QUÁI VẬT ĐẠI DIỆN & KHUYÊN DÙNG -->
        <div class="sp-section sp-card">
          <h4 class="sp-sec-title">👾 5. QUÁI VẬT ĐẠI DIỆN & LỜI KHUYÊN CHIẾN THUẬT</h4>
          <div class="sample-monsters-box">
            <b>Quái vật sở hữu hệ này:</b> ${data.sampleMonsters.join(', ')}
          </div>
          <p class="sp-tip-text" style="margin-top: 10px;">
            💡 Mẹo: Khi bước vào bản đồ có tộc quái chủ đạo mang Hệ ${data.nameVi}, hãy ưu tiên trang bị tháp mang các hệ khắc chế ở mục 2 và tránh các hệ bị giảm sát thương ở mục 3!
          </p>
        </div>
      `;
    }

    // Bind click events on sub-navigation buttons
    this.contentEl.querySelectorAll('.elem-sub-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const sub = (e.currentTarget as HTMLElement).getAttribute('data-sub-elem');
        if (sub) {
          this.currentElementSubTab = sub;
          this.renderElementsCategory();
          this.contentEl.scrollTop = 0;
        }
      });
    });

    // Bind click events on quick jump cards in overview
    this.contentEl.querySelectorAll('.elem-quick-jump').forEach((card) => {
      card.addEventListener('click', (e) => {
        const sub = (e.currentTarget as HTMLElement).getAttribute('data-sub-elem');
        if (sub) {
          this.currentElementSubTab = sub;
          this.renderElementsCategory();
          this.contentEl.scrollTop = 0;
        }
      });
    });
  }

  // ==========================================
  // 6. NAVIGATION MODES CATEGORY
  // ==========================================
  private renderNavigationCategory(highlightNav?: string): void {
    this.titleEl.textContent = 'Quy Tắc Di Chuyển Của Quái Vật';
    this.iconEl.textContent = '🚶';
    this.badgeEl.textContent = 'Đường Bộ, Đường Bay & Đường Thủy';

    this.contentEl.innerHTML = `
      <div class="sp-section sp-card">
        <h4 class="sp-sec-title">🗺️ BA HÀNH LANG DI CHUYỂN CHIẾN LƯỢC</h4>
        <p class="sp-desc">
          Bản đồ Stick Vanguard được thiết kế với 3 tuyến đường xâm lăng độc lập. Mỗi loại quái vật có cơ chế di chuyển riêng biệt đòi hỏi bạn phải bố trí tháp và bẫy hợp lý:
        </p>
      </div>

      <div class="nav-cards-list-grid">
        <!-- 1. Ground Path -->
        <div class="nav-card ${highlightNav === 'WALK' ? 'highlighted-elem' : ''}">
          <div class="nav-card-header">
            <span class="nav-icon">🚶</span>
            <div>
              <h4>1. Tuyến Đường Bộ (Ground)</h4>
              <span class="nav-tag">Đường mòn đất uốn lượn</span>
            </div>
          </div>
          <p class="nav-desc">Tuyến đường chính của quái vật bộ binh, kiếm sĩ, dân quân và trùm khổng lồ.</p>
          <ul class="nav-rules-list">
            <li>✅ <b>Bị chặn bởi Lính Đánh Gần:</b> Lính bộ binh sẽ nghênh chiến và kìm chân 1v1.</li>
            <li>✅ <b>Dẫm bẫy:</b> Dễ dàng dẫm phải Bẫy Chông, Mìn Lửa trên đường.</li>
            <li>✅ <b>Mục tiêu của mọi loại tháp:</b> Cung, Phép, Pháo cối và Lính đều đánh được.</li>
          </ul>
        </div>

        <!-- 2. Air Path -->
        <div class="nav-card ${highlightNav === 'FLY' ? 'highlighted-elem' : ''}">
          <div class="nav-card-header">
            <span class="nav-icon">✈️</span>
            <div>
              <h4>2. Tuyến Đường Bay (Air)</h4>
              <span class="nav-tag air-tag">Đường chéo ngắn nhất về căn cứ</span>
            </div>
          </div>
          <p class="nav-desc">Dơi Quỷ, Rồng Lửa và Khí cầu bay lượn trên không trung với tốc độ cao.</p>
          <ul class="nav-rules-list">
            <li>🚫 <b>BỎ QUA LÍNH ĐÁNH GẦN:</b> Lính cận chiến không thể với tới!</li>
            <li>🚫 <b>BỎ QUA BẪY ĐẤT:</b> Bay lơ lửng nên không kích hoạt bẫy dưới đất.</li>
            <li>🚫 <b>PHÁO CỐI KHÔNG BẮN ĐƯỢC:</b> Không thể nhắm mục tiêu bay.</li>
            <li>🎯 <b>VŨ KHÍ KHẮC CHẾ:</b> Dùng <b>Tháp Cung</b>, <b>Tháp Phép</b> hoặc chuyển Nhà Lính sang <b>Lính Bắn Tên</b>.</li>
          </ul>
        </div>

        <!-- 3. Water Path -->
        <div class="nav-card ${highlightNav === 'SWIM' ? 'highlighted-elem' : ''}">
          <div class="nav-card-header">
            <span class="nav-icon">🏊</span>
            <div>
              <h4>3. Tuyến Kênh Sông (Water)</h4>
              <span class="nav-tag water-tag">Dòng sông xanh uốn khúc</span>
            </div>
          </div>
          <p class="nav-desc">Thủy quái, cá dữ và người que biết bơi tiến công men theo lòng sông.</p>
          <ul class="nav-rules-list">
            <li>🚫 <b>Lính bộ không xuống nước:</b> Không thể cắm cờ tập kết dưới lòng sông.</li>
            <li>✅ <b>Bẫy Thủy Lôi:</b> Bẫy Thủy Lôi Băng đặt ở ô bẫy nước phát nổ dưới lòng sông.</li>
            <li>🎯 <b>VŨ KHÍ KHẮC CHẾ:</b> Dùng <b>Tháp Cung</b>, <b>Tháp Phép</b>, <b>Pháo Cối</b> bao quát sông, hoặc đặt cờ <b>Lính Bắn Tên</b> sát mép sông!</li>
          </ul>
        </div>
      </div>
    `;
  }

  // ==========================================
  // 7. ENEMIES CATEGORY
  // ==========================================
  private renderEnemiesCategory(targetSubId?: string): void {
    this.titleEl.textContent = 'Bách Khoa Quái Vật & Chủng Loại Mới';
    this.iconEl.textContent = '👾';
    this.badgeEl.textContent = 'Thuộc Tính Đơn/Kép, Phân Tách & Triệu Hồi';

    const enemiesList = Object.values(ENEMY_BLUEPRINTS);

    const cardsHtml = enemiesList
      .map((bp) => {
        const pElem = bp.elementalProfile.primaryElement;
        const sElem = bp.elementalProfile.secondaryElement;
        const pColor = ELEMENT_COLORS[pElem] || '#94a3b8';
        const pIcon = ELEMENT_ICONS[pElem] || '⚔️';
        const sIcon = sElem ? ELEMENT_ICONS[sElem] : '';
        const sName = sElem ? ` + ${ELEMENT_NAMES[sElem]}` : '';

        const isHighlighted = targetSubId && (bp.typeId === targetSubId || bp.name.includes(targetSubId));

        let abilityBadge = '';
        if (bp.deathSpawn) {
          abilityBadge += `<span style="background: rgba(249, 115, 22, 0.2); color: #f97316; border: 1px solid rgba(249, 115, 22, 0.4); border-radius: 4px; padding: 2px 6px; font-size: 11px; font-weight: 700; margin-left: 6px;">💥 Phân tách x${bp.deathSpawn.count}</span>`;
        }
        if (bp.summonConfig) {
          abilityBadge += `<span style="background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 4px; padding: 2px 6px; font-size: 11px; font-weight: 700; margin-left: 6px;">🔮 Triệu hồi mỗi ${bp.summonConfig.interval}s</span>`;
        }
        if (sElem) {
          abilityBadge += `<span style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 4px; padding: 2px 6px; font-size: 11px; font-weight: 700; margin-left: 6px;">✨ 2 Thuộc Tính</span>`;
        }

        const moveText = bp.movementType === 'FLY' ? '✈️ Trên không' : bp.movementType === 'SWIM' ? '🏊 Kênh sông' : '🚶 Đường bộ';

        return `
          <div class="sp-card ${isHighlighted ? 'highlighted-elem' : ''}" style="border-left: 4px solid ${pColor}; padding: 12px; margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 18px;">${pIcon}${sIcon}</span>
                <span style="font-weight: 800; font-size: 14px; color: #f8fafc;">${bp.name}</span>
                ${abilityBadge}
              </div>
              <span style="color: #facc15; font-weight: 700;">🪙 +${bp.rewardGold}</span>
            </div>
            <p style="font-size: 12px; color: #cbd5e1; margin-bottom: 8px;">${bp.description}</p>
            <div style="display: flex; gap: 14px; font-size: 11.5px; color: #94a3b8; flex-wrap: wrap;">
              <span>Máu: <b style="color: #ef4444">${bp.hp} ❤️</b></span>
              <span>Tốc độ: <b>${bp.speed} px/s</b></span>
              <span>Sát thương: <b>${bp.damage} ⚔️</b></span>
              <span>Di chuyển: <b>${moveText}</b></span>
              <span>Hệ: <b style="color: ${pColor}">${pIcon} ${ELEMENT_NAMES[pElem]}${sName}</b></span>
            </div>
          </div>
        `;
      })
      .join('');

    this.contentEl.innerHTML = `
      <div class="sp-section sp-card">
        <h4 class="sp-sec-title">👾 TỔNG HỢP CÁC CHỦNG LOẠI QUÁI VẬT</h4>
        <p class="sp-desc">
          Các đợt xâm lăng bao gồm quái đơn thuộc tính và <b>quái mang 2 thuộc tính</b> kết hợp, cùng các đặc tính chiến thuật như <b>Phân tách khi chết</b> và <b>Triệu hồi quái trên đường đi</b>.
        </p>
      </div>
      <div class="sp-section">
        ${cardsHtml}
      </div>
    `;
  }
}
