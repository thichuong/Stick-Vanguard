import { TOWER_BLUEPRINTS, TowerBlueprint } from '../config/towers.config.js';
import { ENEMY_BLUEPRINTS, EnemyBlueprint } from '../config/enemies.config.js';
import {
  ELEMENT_COLORS,
  ELEMENT_ICONS,
  ELEMENT_NAMES,
  ELEMENT_CODEX_DETAILS,
  ELEMENTAL_REACTIONS,
  ELEMENTAL_MATCHUPS,
  SELECTABLE_ELEMENTS
} from '../config/elements.config.js';
import { ElementType, StatusEffectType } from '../types/elements.types.js';
import { TowerType } from '../types/entities.types.js';
import { StickmanRenderer } from '../render/StickmanRenderer.js';

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

const ALL_15_ELEMENTS: ElementType[] = [
  'PHYSICAL',
  'FIRE',
  'WATER',
  'EARTH',
  'WIND',
  'LIGHTNING',
  'ICE',
  'GRASS',
  'POISON',
  'STEEL',
  'LIGHT',
  'DARK',
  'GHOST',
  'DRAGON',
  'FAIRY'
];

export class SideDetailPanel {
  private backdropEl: HTMLElement;
  private contentEl: HTMLElement;
  private titleEl: HTMLElement;
  private badgeEl: HTMLElement;
  private iconEl: HTMLElement;

  // Navigation State
  private currentCategory: string = 'BUILDINGS';
  private currentBuildingSubTab: string = 'BARRACKS';
  private selectedTierKey: string = 'BARRACKS_1';
  private previewElement: ElementType = 'FIRE';
  private mageSecondaryElement: ElementType = 'LIGHTNING';
  private currentElementSubTab: string = 'OVERVIEW';
  private currentNavSubTab: string = 'OVERVIEW';

  // Monster state
  private enemySearchQuery: string = '';
  private enemyElementFilter: string = 'ALL';
  private enemyMovementFilter: string = 'ALL';
  private enemyTagFilter: string = 'ALL';
  private selectedEnemyTypeId: string = 'STICK_RUNNER';
  private enemyAnimFrameId: number | null = null;
  private enemyAnimStartTime: number = 0;

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

  public open(category: string = 'BUILDINGS', targetSubId?: string): void {
    const buildingSubKeys = ['BARRACKS', 'ARCHER', 'MAGE', 'ARTILLERY', 'SOLDIERS', 'TRAPS', 'IMBUE'];

    if (buildingSubKeys.includes(category)) {
      this.currentCategory = 'BUILDINGS';
      this.currentBuildingSubTab = category;
      if (targetSubId) {
        this.selectedTierKey = targetSubId;
      }
    } else if (category === 'ELEMENTS') {
      this.currentCategory = 'ELEMENTS';
      if (targetSubId) {
        this.currentElementSubTab = targetSubId;
      }
    } else if (category === 'ENEMIES') {
      this.currentCategory = 'ENEMIES';
      if (targetSubId) {
        this.selectedEnemyTypeId = targetSubId;
      }
    } else if (category === 'NAVIGATION') {
      this.currentCategory = 'NAVIGATION';
      if (targetSubId) {
        this.currentNavSubTab = targetSubId;
      }
    } else {
      this.currentCategory = category || 'BUILDINGS';
    }

    this.backdropEl.classList.remove('hidden');

    // Update active tab visual
    const tabBtns = this.backdropEl.querySelectorAll('.codex-tab');
    tabBtns.forEach((btn) => {
      const cat = btn.getAttribute('data-cat');
      if (cat === this.currentCategory) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.renderContent();
  }

  public close(): void {
    this.stopEnemyAnimation();
    this.backdropEl.classList.add('hidden');
  }

  public toggle(category: string = 'BUILDINGS'): void {
    if (this.isOpen() && this.currentCategory === category) {
      this.close();
    } else {
      this.open(category);
    }
  }

  private renderContent(): void {
    this.stopEnemyAnimation();
    switch (this.currentCategory) {
      case 'BUILDINGS':
        this.renderBuildingsCategory();
        break;
      case 'ELEMENTS':
        this.renderElementsCategory();
        break;
      case 'NAVIGATION':
        this.renderNavigationCategory();
        break;
      case 'ENEMIES':
        this.renderEnemiesCategory();
        break;
      default:
        this.renderBuildingsCategory();
    }
  }

  // ==========================================
  // 1. UNIFIED BUILDINGS CATEGORY (MASTER-DETAIL)
  // ==========================================
  private renderBuildingsCategory(): void {
    this.titleEl.textContent = 'Bách Khoa Công Trình & Bẫy Phòng Thủ';
    this.iconEl.textContent = '🏰';
    this.badgeEl.textContent = '4 Nhánh Tháp • Binh Lính • Bẫy Chiến Thuật • Khảm Ngọc';

    let rightContentHtml = '';
    switch (this.currentBuildingSubTab) {
      case 'BARRACKS':
      case 'ARCHER':
      case 'MAGE':
      case 'ARTILLERY':
        rightContentHtml = this.getTowerCategoryHtml(this.currentBuildingSubTab as TowerType, this.selectedTierKey);
        break;
      case 'SOLDIERS':
        rightContentHtml = this.getSoldiersCategoryHtml();
        break;
      case 'TRAPS':
        rightContentHtml = this.getTrapsCategoryHtml();
        break;
      case 'IMBUE':
        rightContentHtml = this.getBuildingImbueCategoryHtml();
        break;
      default:
        rightContentHtml = this.getTowerCategoryHtml('BARRACKS', 'BARRACKS_1');
    }

    this.contentEl.innerHTML = `
      <div class="codex-master-layout">
        <aside class="codex-sidebar-nav">
          <div class="codex-sidebar-title">
            <span>CÔNG TRÌNH PHÒNG THỦ</span>
            <span style="color: #38bdf8;">4 Tháp</span>
          </div>
          <button class="codex-subnav-btn ${this.currentBuildingSubTab === 'BARRACKS' ? 'active' : ''}" data-building-sub="BARRACKS">
            <span style="font-size: 18px;">🛡️</span>
            <div>
              <div style="font-weight: 700;">Trại Dân Quân (Barracks)</div>
              <div style="font-size: 11px; color: #64748b;">Lính kiếm chặn đường & Lính cung</div>
            </div>
          </button>
          <button class="codex-subnav-btn ${this.currentBuildingSubTab === 'ARCHER' ? 'active' : ''}" data-building-sub="ARCHER">
            <span style="font-size: 18px;">🏹</span>
            <div>
              <div style="font-weight: 700;">Tháp Cung Thủ</div>
              <div style="font-size: 11px; color: #64748b;">Bắn nhanh, linh hoạt 3 địa hình</div>
            </div>
          </button>
          <button class="codex-subnav-btn ${this.currentBuildingSubTab === 'MAGE' ? 'active' : ''}" data-building-sub="MAGE">
            <span style="font-size: 18px;">🔮</span>
            <div>
              <div style="font-weight: 700;">Tháp Phù Thủy (Mage)</div>
              <div style="font-size: 11px; color: #64748b;">AoE, Song nguyên tố & Hào quang buff</div>
            </div>
          </button>
          <button class="codex-subnav-btn ${this.currentBuildingSubTab === 'ARTILLERY' ? 'active' : ''}" data-building-sub="ARTILLERY">
            <span style="font-size: 18px;">💣</span>
            <div>
              <div style="font-weight: 700;">Pháo Cối (Artillery)</div>
              <div style="font-size: 11px; color: #64748b;">Đại bác nổ lan mặt đất & kênh sông</div>
            </div>
          </button>

          <div class="codex-sidebar-title" style="margin-top: 10px;">
            <span>LÍNH & HỖ TRỢ</span>
            <span style="color: #10b981;">3 Mục</span>
          </div>
          <button class="codex-subnav-btn ${this.currentBuildingSubTab === 'SOLDIERS' ? 'active' : ''}" data-building-sub="SOLDIERS">
            <span style="font-size: 18px;">⚔️</span>
            <div>
              <div style="font-weight: 700;">Binh Lính & Cung Thủ</div>
              <div style="font-size: 11px; color: #64748b;">So sánh chi tiết & cơ chế đổi vũ khí</div>
            </div>
          </button>
          <button class="codex-subnav-btn ${this.currentBuildingSubTab === 'TRAPS' ? 'active' : ''}" data-building-sub="TRAPS">
            <span style="font-size: 18px;">⚙️</span>
            <div>
              <div style="font-weight: 700;">Hệ Thống Bẫy Chiến Thuật</div>
              <div style="font-size: 11px; color: #64748b;">Chông gai, mìn lửa & thủy lôi ngầm</div>
            </div>
          </button>
          <button class="codex-subnav-btn ${this.currentBuildingSubTab === 'IMBUE' ? 'active' : ''}" data-building-sub="IMBUE">
            <span style="font-size: 18px;">⚡</span>
            <div>
              <div style="font-weight: 700;">Truyền Nguyên Tố Tháp</div>
              <div style="font-size: 11px; color: #64748b;">Khảm ngọc, tương tác & cộng hưởng</div>
            </div>
          </button>
        </aside>

        <main class="codex-detail-pane" id="codex-building-detail">
          ${rightContentHtml}
        </main>
      </div>
    `;

    // Bind subnav buttons
    this.contentEl.querySelectorAll('[data-building-sub]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const sub = (e.currentTarget as HTMLElement).getAttribute('data-building-sub');
        if (sub) {
          this.currentBuildingSubTab = sub;
          if (['BARRACKS', 'ARCHER', 'MAGE', 'ARTILLERY'].includes(sub)) {
            this.selectedTierKey = `${sub}_1`;
          }
          this.renderBuildingsCategory();
        }
      });
    });

    // Bind inner listeners if on tower
    if (['BARRACKS', 'ARCHER', 'MAGE', 'ARTILLERY'].includes(this.currentBuildingSubTab)) {
      this.bindTowerEventListeners(this.currentBuildingSubTab as TowerType);
    }
  }

  private getTowerCategoryHtml(type: TowerType, selectedKey?: string): string {
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
    const bp1 = TOWER_BLUEPRINTS[`${type}_1`];
    const bp2 = TOWER_BLUEPRINTS[`${type}_2`];
    const bp3 = TOWER_BLUEPRINTS[`${type}_3`];
    const bp4A = TOWER_BLUEPRINTS[`${type}_4_A`];
    const bp4B = TOWER_BLUEPRINTS[`${type}_4_B`];

    if (!bp1) return '';

    this.selectedTierKey = selectedKey || `${type}_1`;
    const selectedBp = TOWER_BLUEPRINTS[this.selectedTierKey] || bp1;

    return `
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
  }

  private bindTowerEventListeners(type: TowerType): void {
    const detailPane = document.getElementById('codex-building-detail');
    if (!detailPane) return;

    // Bind click events on tree nodes
    detailPane.querySelectorAll('.tree-node').forEach((node) => {
      node.addEventListener('click', (e) => {
        const key = (e.currentTarget as HTMLElement).getAttribute('data-tier-key');
        if (key) {
          this.selectedTierKey = key;
          const currentScroll = detailPane.scrollTop;
          detailPane.innerHTML = this.getTowerCategoryHtml(type, key);
          detailPane.scrollTop = currentScroll;
          this.bindTowerEventListeners(type);
        }
      });
    });

    // Bind click events on element selector buttons inside tower view
    detailPane.querySelectorAll('.sim-elem-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const elem = (e.currentTarget as HTMLElement).getAttribute('data-elem') as ElementType;
        const mageSlot = (e.currentTarget as HTMLElement).getAttribute('data-mage-slot');
        if (elem) {
          if (mageSlot === '2') {
            this.mageSecondaryElement = elem;
          } else {
            this.previewElement = elem;
          }
          const currentScroll = detailPane.scrollTop;
          detailPane.innerHTML = this.getTowerCategoryHtml(type, this.selectedTierKey);
          detailPane.scrollTop = currentScroll;
          this.bindTowerEventListeners(type);
        }
      });
    });

    // Bind quick button to soldiers guide
    const gotoSoldiersBtn = detailPane.querySelector('#btn-goto-soldiers-guide');
    if (gotoSoldiersBtn) {
      gotoSoldiersBtn.addEventListener('click', () => {
        this.currentBuildingSubTab = 'SOLDIERS';
        this.renderBuildingsCategory();
      });
    }
  }

  private renderStatsTableRow(
    bp: TowerBlueprint,
    tierLabel: string,
    type: TowerType,
    customClass: string = ''
  ): string {
    const isCurrent = bp.type === this.selectedTierKey;
    const baseDamage = bp.damage;
    const isMage = type === 'MAGE';
    const bonusDmg = isMage ? baseDamage * 1.0 : Math.round(baseDamage * 0.45);
    const totalDmg = baseDamage + bonusDmg;
    const totalDps = Math.round(totalDmg * bp.fireRate);

    return `
      <tr class="${customClass} ${isCurrent ? 'selected-row' : ''}">
        <td><b>${tierLabel}</b></td>
        <td>${bp.name}</td>
        <td style="color: #facc15">🪙 ${bp.cost}</td>
        <td>${baseDamage}</td>
        <td style="color: #38bdf8; font-weight: 700;">
          ${baseDamage} + <span style="color: #a855f7;">${bonusDmg}</span> = ${totalDmg}
        </td>
        <td>${bp.range} px</td>
        <td>${bp.fireRate}/s</td>
        <td class="table-dps-val">${totalDps} DPS</td>
      </tr>
    `;
  }

  private renderTowerElementalSim(type: TowerType, bp: TowerBlueprint): string {
    const isMage = type === 'MAGE';
    const elemColor = ELEMENT_COLORS[this.previewElement] || '#ffffff';
    const elemIcon = ELEMENT_ICONS[this.previewElement] || '✨';
    const elemName = ELEMENT_NAMES[this.previewElement] || this.previewElement;

    const baseDmg = bp.damage;
    const bonusDmg = isMage ? baseDmg * 1.0 : Math.round(baseDmg * 0.45);

    const mageSecColor = ELEMENT_COLORS[this.mageSecondaryElement] || '#ffffff';
    const mageSecIcon = ELEMENT_ICONS[this.mageSecondaryElement] || '✨';
    const mageSecName = ELEMENT_NAMES[this.mageSecondaryElement] || this.mageSecondaryElement;
    const mageSecDmg = baseDmg * 1.0;

    const totalDmg = isMage ? baseDmg + mageSecDmg : baseDmg + bonusDmg;
    const totalDps = Math.round(totalDmg * bp.fireRate);

    const effectInfo = this.getTowerSpecificEffectText(type, this.previewElement);
    const mageSecEffectInfo = isMage ? this.getTowerSpecificEffectText(type, this.mageSecondaryElement) : null;

    const elemButtonsHtml = SELECTABLE_ELEMENTS.map((el) => {
      const isSelected = this.previewElement === el;
      const color = ELEMENT_COLORS[el];
      const icon = ELEMENT_ICONS[el];
      return `
        <button class="sim-elem-btn ${isSelected ? 'active' : ''}" 
                data-elem="${el}" 
                data-mage-slot="1"
                style="${isSelected ? `border-color: ${color}; box-shadow: 0 0 10px ${color}80;` : ''}">
          <span>${icon}</span>
          <span style="color: ${color}">${ELEMENT_NAMES[el].split(' ')[0]}</span>
        </button>
      `;
    }).join('');

    const mageSlot2ButtonsHtml = isMage
      ? SELECTABLE_ELEMENTS.map((el) => {
          const isSelected = this.mageSecondaryElement === el;
          const color = ELEMENT_COLORS[el];
          const icon = ELEMENT_ICONS[el];
          return `
            <button class="sim-elem-btn ${isSelected ? 'active' : ''}" 
                    data-elem="${el}" 
                    data-mage-slot="2"
                    style="${isSelected ? `border-color: ${color}; box-shadow: 0 0 10px ${color}80;` : ''}">
              <span>${icon}</span>
              <span style="color: ${color}">${ELEMENT_NAMES[el].split(' ')[0]}</span>
            </button>
          `;
        }).join('')
      : '';

    return `
      <div class="sp-section sp-card simulation-panel">
        <div class="sp-sec-header">
          <h4 class="sp-sec-title">🧪 MÔ PHỎNG HIỆU ỨNG GẮN NGUYÊN TỐ CHO ${bp.name.toUpperCase()}</h4>
          <span class="sp-hint">Bấm chọn nguyên tố để xem sự thay đổi</span>
        </div>

        <div class="sim-controls-group">
          <span class="sim-group-label">
            ${isMage ? '🔮 Khe Nguyên Tố 1 (Tỷ lệ 100% Sát thương Phép):' : '⚡ Chọn 1 Nguyên Tố Để Gắn (+45% Sát Thương Phép):'}
          </span>
          <div class="sim-elem-grid">${elemButtonsHtml}</div>
        </div>

        ${
          isMage
            ? `
            <div class="sim-controls-group" style="margin-top: 12px;">
              <span class="sim-group-label" style="color: #c084fc;">
                🔮 Khe Nguyên Tố 2 Độc Lập (+100% Sát thương Phép - Tỷ lệ 1:1):
              </span>
              <div class="sim-elem-grid">${mageSlot2ButtonsHtml}</div>
            </div>
          `
            : ''
        }

        <div class="sim-result-box" style="border-left-color: ${elemColor}">
          <div class="sim-result-header">
            <span class="sim-res-title">
              KẾT QUẢ ĐÒN ĐÁNH: 
              <b style="color: #cbd5e1">${baseDmg} Sát Thương ${isMage ? 'Phép 1' : 'Vật Lý'}</b>
              + 
              <b style="color: ${elemColor}">${elemIcon} ${bonusDmg} Phép ${elemName}</b>
              ${isMage ? ` + <b style="color: ${mageSecColor}">${mageSecIcon} ${mageSecDmg} Phép ${mageSecName}</b>` : ''}
              = <span class="highlight-total-dmg">${totalDmg} DMG / đòn</span>
            </span>
            <span class="sim-total-dps">${totalDps} DPS</span>
          </div>

          <div class="sim-effect-box" style="border-left-color: ${elemColor}">
            <div class="sim-effect-title" style="color: ${elemColor}">
              ${elemIcon} ${isMage ? 'Hiệu Ứng Khe 1: ' : ''}${effectInfo.name}
            </div>
            <p class="sim-effect-desc">${effectInfo.desc}</p>
            <div class="sim-synergy-tag">${effectInfo.synergy}</div>
          </div>

          ${
            isMage && mageSecEffectInfo
              ? `
              <div class="sim-effect-box" style="border-left-color: ${mageSecColor}; margin-top: 8px;">
                <div class="sim-effect-title" style="color: ${mageSecColor}">
                  ${mageSecIcon} Hiệu Ứng Khe 2: ${mageSecEffectInfo.name}
                </div>
                <p class="sim-effect-desc">${mageSecEffectInfo.desc}</p>
                <div class="sim-synergy-tag">${mageSecEffectInfo.synergy}</div>
              </div>
            `
              : ''
          }
        </div>
      </div>
    `;
  }

  private getTowerSpecificEffectText(
    type: TowerType,
    elem: ElementType
  ): { name: string; desc: string; synergy: string } {
    switch (type) {
      case 'BARRACKS':
        return {
          name: `Đòn Đánh Của Binh Lính Mang Thuộc Tính ${ELEMENT_NAMES[elem]}`,
          desc: `Mỗi nhát chém của Lính Cận Chiến hoặc mũi tên của Lính Cung đều gây thêm +45% sát thương ${ELEMENT_NAMES[elem]} và kích hoạt hiệu ứng trạng thái lên quái vật bị tấn công.`,
          synergy: `🛡️ Lính bộ binh áp sát chém DoT / Lính cung tầm xa kích hoạt hiệu ứng trên cả 3 địa hình!`
        };
      case 'ARCHER':
        return {
          name: `Mũi Tên Bắn Tỉa Tẩm ${ELEMENT_NAMES[elem]}`,
          desc: `Tốc độ bắn cực nhanh giúp kích hoạt và cộng dồn hiệu ứng ${ELEMENT_NAMES[elem]} liên tục lên quái vật.`,
          synergy: `🏹 Bắn được cả quái Đi Bộ, Trên Không và Kênh Sông.`
        };
      case 'MAGE':
        return {
          name: `Cầu Ma Thuật Nổ Lan Hệ ${ELEMENT_NAMES[elem]}`,
          desc: `Đạn phép phát nổ diện rộng gây 100% sát thương Phép ${ELEMENT_NAMES[elem]} lên toàn bộ kẻ địch trong bán kính nổ.`,
          synergy: `🔮 Bỏ qua giáp vật lý, áp dụng hiệu ứng diện rộng lên toàn bộ cụm quái.`
        };
      case 'ARTILLERY':
        return {
          name: `Đạn Đại Bác Bọc ${ELEMENT_NAMES[elem]}`,
          desc: `Đạn pháo phát nổ trên diện rộng gây sát thương Vật lý khủng kèm +45% sát thương ${ELEMENT_NAMES[elem]} lên quái Đi bộ và Bơi lội.`,
          synergy: `💣 Tạo ra vùng nổ chấn động hủy diệt đàn quái đông đảo.`
        };
      default:
        return {
          name: `Hiệu Ứng ${ELEMENT_NAMES[elem]}`,
          desc: `Tăng cường sát thương và kích hoạt trạng thái nguyên tố.`,
          synergy: `✨ Tối ưu hóa sát thương khắc hệ.`
        };
    }
  }

  private renderTreeNode(
    bp: TowerBlueprint,
    tierBadge: string,
    tierKey: string,
    isBranch: boolean = false
  ): string {
    const isSelected = this.selectedTierKey === tierKey;
    const elemColor = ELEMENT_COLORS[bp.element] || '#ffffff';
    const elemIcon = ELEMENT_ICONS[bp.element] || '🏰';

    return `
      <div class="tree-node ${isSelected ? 'active-node' : ''} ${isBranch ? 'branch-node' : ''}" 
           data-tier-key="${tierKey}">
        <div class="tn-badge">${tierBadge}</div>
        <div class="tn-title">
          <span style="color: ${elemColor}">${elemIcon}</span>
          <span>${bp.name}</span>
        </div>
        <div class="tn-stats">
          <span>🪙 <b>${bp.cost}</b></span>
          <span>⚔️ <b>${bp.damage}</b></span>
          <span>🎯 <b>${bp.range}</b></span>
        </div>
        <div class="tn-brief">${bp.description}</div>
      </div>
    `;
  }

  private getSoldiersCategoryHtml(): string {
    return `
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
            <li>🌟 <b>Đột Phá Cấp 4:</b>
              <br>• <i>Nhánh 4-A (Thần Tiễn Tầm Xa):</i> Tầm bắn kéo dài lên 200px, bắn xuyên giáp vật lý.
              <br>• <i>Nhánh 4-B (Mưa Tên Xuyên Phá):</i> Bắn cùng lúc 2 mũi tên mỗi phát bắn (tương đương 6 mũi tên/lượt cả 3 lính).
            </li>
          </ul>

          <div class="soldier-stats-summary">
            <div class="stat-box">
              <span class="s-label">Tầm Tác Chiến</span>
              <span class="s-val">150 - 200 px</span>
            </div>
            <div class="stat-box">
              <span class="s-label">Chống Chịu</span>
              <span class="s-val" style="color: #94a3b8">Trung Bình (❤️)</span>
            </div>
            <div class="stat-box">
              <span class="s-label">Mục Tiêu</span>
              <span class="s-val" style="color: #34d399">Đi Bộ, Bay, Bơi</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bảng So Sánh Chỉ Số Cụ Thể Theo Từng Cấp -->
      <div class="sp-section sp-card">
        <h4 class="sp-sec-title">📊 BẢNG SO SÁNH CHỈ SỐ CỦA 3 CHIẾN BINH THEO CẤP NHÀ LÍNH</h4>
        <div class="table-responsive">
          <table class="stats-table">
            <thead>
              <tr>
                <th>Cấp Nhà Lính</th>
                <th>Vũ Khí Lính</th>
                <th>Máu (HP/Lính)</th>
                <th>Sát Thương</th>
                <th>Tốc Đánh</th>
                <th>DPS / Lính</th>
                <th>Tổng 3 Lính</th>
                <th>Tầm Đánh</th>
                <th>Địa Hình Tác Chiến</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowspan="2"><b>Cấp 1</b> (100g)</td>
                <td><span class="badge-melee">⚔️ Cận Chiến</span></td>
                <td>100 ❤️ (Giáp 10%)</td>
                <td>8 DMG</td>
                <td>1.0/s</td>
                <td>8 DPS</td>
                <td style="color: #38bdf8; font-weight: 700;">24 DPS</td>
                <td>Tiếp xúc</td>
                <td>Chỉ Đi Bộ (WALK)</td>
              </tr>
              <tr>
                <td><span class="badge-ranged">🏹 Bắn Tên</span></td>
                <td>65 ❤️ (Giáp 0%)</td>
                <td>6 DMG</td>
                <td>1.2/s</td>
                <td>7.2 DPS</td>
                <td style="color: #34d399; font-weight: 700;">21.6 DPS</td>
                <td>150 px</td>
                <td><b>Bộ, Bay, Bơi (Đa Miền)</b></td>
              </tr>
              <tr style="background: rgba(255, 255, 255, 0.02)">
                <td rowspan="2"><b>Cấp 2</b> (160g)</td>
                <td><span class="badge-melee">⚔️ Cận Chiến</span></td>
                <td>180 ❤️ (Giáp 20%)</td>
                <td>14 DMG</td>
                <td>1.0/s</td>
                <td>14 DPS</td>
                <td style="color: #38bdf8; font-weight: 700;">42 DPS</td>
                <td>Tiếp xúc</td>
                <td>Chỉ Đi Bộ (WALK)</td>
              </tr>
              <tr style="background: rgba(255, 255, 255, 0.02)">
                <td><span class="badge-ranged">🏹 Bắn Tên</span></td>
                <td>110 ❤️ (Giáp 5%)</td>
                <td>11 DMG</td>
                <td>1.3/s</td>
                <td>14.3 DPS</td>
                <td style="color: #34d399; font-weight: 700;">42.9 DPS</td>
                <td>160 px</td>
                <td><b>Bộ, Bay, Bơi (Đa Miền)</b></td>
              </tr>
              <tr>
                <td rowspan="2"><b>Cấp 3</b> (240g)</td>
                <td><span class="badge-melee">⚔️ Cận Chiến</span></td>
                <td>300 ❤️ (Giáp 30%)</td>
                <td>24 DMG</td>
                <td>1.1/s</td>
                <td>26.4 DPS</td>
                <td style="color: #38bdf8; font-weight: 700;">79.2 DPS</td>
                <td>Tiếp xúc</td>
                <td>Chỉ Đi Bộ (WALK)</td>
              </tr>
              <tr>
                <td><span class="badge-ranged">🏹 Bắn Tên</span></td>
                <td>170 ❤️ (Giáp 10%)</td>
                <td>18 DMG</td>
                <td>1.4/s</td>
                <td>25.2 DPS</td>
                <td style="color: #34d399; font-weight: 700;">75.6 DPS</td>
                <td>175 px</td>
                <td><b>Bộ, Bay, Bơi (Đa Miền)</b></td>
              </tr>
              <tr class="branch-row-a">
                <td rowspan="2"><b>Cấp 4-A</b> (320g)</td>
                <td><span class="badge-melee">⚔️ Thánh Điện Hộ Vệ</span></td>
                <td>480 ❤️ (+12 HP/s)</td>
                <td>35 DMG</td>
                <td>1.2/s</td>
                <td>42 DPS</td>
                <td style="color: #38bdf8; font-weight: 700;">126 DPS</td>
                <td>Tiếp xúc</td>
                <td>Chỉ Đi Bộ (WALK)</td>
              </tr>
              <tr class="branch-row-a">
                <td><span class="badge-ranged">🏹 Thần Tiễn Tầm Xa</span></td>
                <td>240 ❤️ (Giáp 15%)</td>
                <td>28 DMG</td>
                <td>1.5/s</td>
                <td>42 DPS</td>
                <td style="color: #34d399; font-weight: 700;">126 DPS</td>
                <td><b>200 px</b></td>
                <td><b>Bộ, Bay, Bơi (Đa Miền)</b></td>
              </tr>
              <tr class="branch-row-b">
                <td rowspan="2"><b>Cấp 4-B</b> (320g)</td>
                <td><span class="badge-melee">⚔️ Đấu Sĩ Cuồng Nộ</span></td>
                <td>420 ❤️ (Chém AoE)</td>
                <td>48 DMG</td>
                <td>1.3/s</td>
                <td>62.4 DPS</td>
                <td style="color: #38bdf8; font-weight: 700;">187.2 DPS</td>
                <td>Tiếp xúc</td>
                <td>Chỉ Đi Bộ (WALK)</td>
              </tr>
              <tr class="branch-row-b">
                <td><span class="badge-ranged">🏹 Mưa Tên Xuyên Phá</span></td>
                <td>220 ❤️ (Bắn 2 Tên)</td>
                <td>22 x 2 DMG</td>
                <td>1.4/s</td>
                <td>61.6 DPS</td>
                <td style="color: #34d399; font-weight: 700;">184.8 DPS</td>
                <td>170 px</td>
                <td><b>Bộ, Bay, Bơi (Đa Miền)</b></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  private getTrapsCategoryHtml(targetSubId?: string): string {
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

    return `
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

  private getBuildingImbueCategoryHtml(): string {
    return `
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
              <b>🔥 Lửa (Fire) - Hỏa Kiếm Thiêu Đốt:</b> Thiêu đốt quái nhận thêm DoT rút máu liên tục mỗi 0.5s bỏ qua giáp phòng thủ.
            </div>
          </div>
        </div>

        <!-- 2. ARCHER / THÁP CUNG -->
        <div class="imbue-building-card">
          <div class="imbue-building-header">
            <span class="imbue-building-icon">🏹</span>
            <div>
              <h3>2. Tháp Cung Thủ (Archer Tower)</h3>
              <span class="sp-hint">Bắn Tỉa Tốc Độ Cao Kích Hoạt Hiệu Ứng Nhanh</span>
            </div>
            <span class="imbue-ratio-badge">+45% Sát Thương Phép</span>
          </div>
          <p class="sp-desc">
            Với tốc độ bắn 1.8 - 4.5 phát/giây, Tháp Cung là công cụ kích hoạt và duy trì hiệu ứng trạng thái nguyên tố hiệu quả nhất trận:
          </p>

          <div class="imbue-synergy-list">
            <div class="imbue-synergy-item" style="border-left-color: #06b6d4">
              <b>❄️ Cung Băng (Frost Snipe):</b> Giữ hiệu ứng làm chậm và đóng băng liên tục lên các mục tiêu chạy nhanh hoặc thủy quái bơi tốc độ cao.
            </div>
            <div class="imbue-synergy-item" style="border-left-color: #8b5cf6">
              <b>🌑 Cung Hắc Ám (Curse Mark):</b> Gắn dấu ấn Nguyền Rủa lên quái khiến chúng nhận thêm <b>+35% sát thương từ tất cả các tháp đồng minh khác</b>!
            </div>
            <div class="imbue-synergy-item" style="border-left-color: #94a3b8">
              <b>⚔️ Cung Thép (Armor Sunder):</b> Bắn phá nát giáp sắt của Golem và quái bọc thép, tăng thêm <b>+30% sát thương nhận vào</b>.
            </div>
            <div class="imbue-synergy-item" style="border-left-color: #10b981">
              <b>🌪️ Cung Gió (Wind Gale):</b> Gây thêm <b>+50% sát thương lên quái Bay (FLY)</b> và liên tục đẩy lùi quái bay về sau!
            </div>
          </div>
        </div>

        <!-- 3. MAGE / THÁP PHÙ THỦY -->
        <div class="imbue-building-card" style="border-color: #a855f7;">
          <div class="imbue-building-header">
            <span class="imbue-building-icon">🔮</span>
            <div>
              <h3>3. Tháp Phù Thủy (Mage Tower)</h3>
              <span class="sp-hint" style="color: #c084fc;">ĐẶC QUYỀN SONG NGUYÊN TỐ (2 Khe Độc Lập)</span>
            </div>
            <span class="imbue-ratio-badge" style="background: rgba(168, 85, 247, 0.2); color: #c084fc; border-color: #a855f7;">
              100% Khe 1 + 100% Khe 2
            </span>
          </div>
          <p class="sp-desc">
            Tháp Phép gây sát thương diện rộng (AoE) bỏ qua 100% giáp vật lý. Người chơi có thể tự do mở <b>khe nguyên tố thứ 2 (50 Vàng)</b> để bắn cùng lúc 2 hệ nguyên tố ngang nhau (1:1):
          </p>

          <div class="imbue-synergy-list">
            <div class="imbue-synergy-item" style="border-left-color: #a855f7">
              <b>💥 Combo Hỏa Ngục (Lửa + Sét):</b> Vừa thiêu đốt DoT diện rộng vừa giật tia sét choáng hàng loạt quái vật tập trung.
            </div>
            <div class="imbue-synergy-item" style="border-left-color: #3b82f6">
              <b>🌊 Bão Tuyết Vĩnh Cửu (Nước + Băng):</b> Làm ướt quái vật rồi đóng băng ngay lập tức với tỉ lệ cực cao, kìm hãm hoàn toàn đợt tràn quái.
            </div>
            <div class="imbue-synergy-item" style="border-left-color: #f97316">
              <b>🌟 Đột Phá 4-A (Bão Tố Ma Pháp):</b> Vùng bão tố xoáy sát thương liên tục mỗi giây nhận trọn vẹn cả 2 hệ nguyên tố đã gắn.
            </div>
            <div class="imbue-synergy-item" style="border-left-color: #ec4899">
              <b>🌟 Đột Phá 4-B (Hào Quang Khởi Nguyên):</b> Tự động <b>BUFF CẢ 2 NGUYÊN TỐ NÀY</b> cho công trình đồng minh gần nhất!
            </div>
          </div>
        </div>

        <!-- 4. ARTILLERY / PHÁO CỐI -->
        <div class="imbue-building-card">
          <div class="imbue-building-header">
            <span class="imbue-building-icon">💣</span>
            <div>
              <h3>4. Pháo Cối (Artillery)</h3>
              <span class="sp-hint">Công Phá Diện Rộng Mặt Đất & Kênh Sông</span>
            </div>
            <span class="imbue-ratio-badge">+45% Sát Thương Phép</span>
          </div>
          <p class="sp-desc">
            Đạn đại bác phát nổ bao trùm toàn bộ bán kính va chạm, áp dụng sát thương nguyên tố cộng thêm lên tất cả quái vật dẫm phải vùng nổ:
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
  // 2. ELEMENTAL SYSTEM (MASTER-DETAIL)
  // ==========================================
  private renderElementsCategory(highlightElem?: string): void {
    if (highlightElem) {
      this.currentElementSubTab = highlightElem;
    }

    this.titleEl.textContent = 'Hệ Thống Nguyên Tố & Ma Trận Khắc Chế (15 Hệ)';
    this.iconEl.textContent = '✨';
    this.badgeEl.textContent = '15 Nguyên Tố • 14 Hiệu Ứng • 11 Phản Ứng Phối Hợp';

    let rightElementHtml = '';
    if (this.currentElementSubTab === 'OVERVIEW') {
      rightElementHtml = this.getElementsOverviewHtml();
    } else if (this.currentElementSubTab === 'REACTIONS') {
      rightElementHtml = this.getElementalReactionsHtml();
    } else {
      rightElementHtml = this.getSingleElementDetailHtml(this.currentElementSubTab as ElementType);
    }

    this.contentEl.innerHTML = `
      <div class="codex-master-layout">
        <aside class="codex-sidebar-nav">
          <div class="codex-sidebar-title">
            <span>TỔNG QUAN NGUYÊN TỐ</span>
          </div>
          <button class="codex-subnav-btn ${this.currentElementSubTab === 'OVERVIEW' ? 'active' : ''}" data-sub-elem="OVERVIEW">
            <span style="font-size: 18px;">🌟</span>
            <div>
              <div style="font-weight: 700;">Tổng Quan & Ma Trận Khắc Chế</div>
              <div style="font-size: 11px; color: #64748b;">Hệ thống 15 hệ & tương khắc</div>
            </div>
          </button>
          <button class="codex-subnav-btn ${this.currentElementSubTab === 'REACTIONS' ? 'active' : ''}" data-sub-elem="REACTIONS">
            <span style="font-size: 18px;">💥</span>
            <div>
              <div style="font-weight: 700;">Phản Ứng Nguyên Tố (Combos)</div>
              <div style="font-size: 11px; color: #64748b;">11 Phối hợp nổ & nhân sát thương</div>
            </div>
          </button>

          <div class="codex-sidebar-title" style="margin-top: 10px;">
            <span>15 HỆ NGUYÊN TỐ</span>
            <span style="color: #f59e0b;">Chi Tiết</span>
          </div>
          ${ALL_15_ELEMENTS.map((elem) => {
            const color = ELEMENT_COLORS[elem];
            const icon = ELEMENT_ICONS[elem];
            const name = ELEMENT_NAMES[elem];
            const isActive = this.currentElementSubTab === elem;
            return `
              <button class="codex-subnav-btn ${isActive ? 'active' : ''}" data-sub-elem="${elem}" style="${isActive ? `border-color: ${color}; box-shadow: inset 3px 0 0 ${color};` : ''}">
                <span style="font-size: 18px;">${icon}</span>
                <div>
                  <div style="font-weight: 700; color: ${color};">${name}</div>
                  <div style="font-size: 11px; color: #64748b;">Xem hiệu ứng & khắc chế</div>
                </div>
              </button>
            `;
          }).join('')}
        </aside>

        <main class="codex-detail-pane" id="codex-element-detail">
          ${rightElementHtml}
        </main>
      </div>
    `;

    // Bind click events on sub-navigation buttons
    this.contentEl.querySelectorAll('[data-sub-elem]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const sub = (e.currentTarget as HTMLElement).getAttribute('data-sub-elem');
        if (sub) {
          this.currentElementSubTab = sub;
          this.renderElementsCategory();
        }
      });
    });

    // Bind quick jump cards if overview is active
    this.contentEl.querySelectorAll('.elem-quick-jump').forEach((card) => {
      card.addEventListener('click', (e) => {
        const sub = (e.currentTarget as HTMLElement).getAttribute('data-sub-elem');
        if (sub) {
          this.currentElementSubTab = sub;
          this.renderElementsCategory();
        }
      });
    });
  }

  private getElementsOverviewHtml(): string {
    const allElements = ALL_15_ELEMENTS;
    const cardsHtml = allElements
      .map((elem) => {
        const data = ELEMENT_CODEX_DETAILS[elem];
        if (!data) return '';
        const color = ELEMENT_COLORS[elem];
        const icon = ELEMENT_ICONS[elem];
        return `
        <div class="elem-card elem-quick-jump" data-sub-elem="${elem}" style="border-left-color: ${color}; cursor: pointer;">
          <div class="elem-card-header">
            <span class="elem-icon-big" style="color: ${color}">${icon}</span>
            <div>
              <h4 class="elem-name" style="color: ${color}">${data.nameVi}</h4>
              <span class="elem-role-badge">${data.badge}</span>
            </div>
          </div>
          <p class="elem-desc-short">${data.nature}</p>
          <div class="elem-mini-stats">
            <span>Hiệu ứng: <b>${data.statusEffectName}</b></span>
            <span>Khắc chế: <b style="color: #4ade80">${data.strongAgainst.map((s) => s.element).join(', ') || 'Đa năng'}</b></span>
          </div>
        </div>
      `;
      })
      .join('');

    return `
      <div class="sp-section sp-card">
        <h4 class="sp-sec-title">📖 TỔNG QUAN HỆ THỐNG 15 NGUYÊN TỐ CHIẾN THUẬT</h4>
        <p class="sp-desc">
          Mỗi nguyên tố trong Stick Vanguard sở hữu <b>hiệu ứng trạng thái riêng biệt</b> và cơ chế tương khắc trực tiếp với các chủng tộc quái vật.
          Bạn có thể gắn nguyên tố cho <b>Tháp Cung, Pháo Cối, Nhà Lính</b> và đặc biệt là <b>Tháp Phù Thủy với 2 khe nguyên tố độc lập</b>.
        </p>
        <div class="sp-mechanic-box">
          <p><b>✨ Quy Tắc Khắc Chế:</b> Đòn đánh mang nguyên tố khắc chế gây <b>x1.5 đến x2.0 sát thương</b> (hiện chữ <b style="color: #ef4444">KHẮC HỆ!</b>). Đòn đánh bị kháng gây <b>0.3x đến 0.5x sát thương</b> (hiện chữ <b style="color: #64748b">KHÁNG!</b>).</p>
          <p><b>💥 Miễn Nhiễm:</b> Quái vật miễn nhiễm nguyên tố hoàn toàn không nhận sát thương từ hệ đó (Ví dụ: Quỷ Lửa miễn nhiễm Lửa, Người Đá miễn nhiễm Vật Lý & Sét).</p>
        </div>
      </div>

      <div class="sp-section">
        <h4 class="sp-sec-title">✨ DANH SÁCH 15 HỆ NGUYÊN TỐ (BẤM ĐỂ XEM CHI TIẾT)</h4>
        <div class="elem-cards-grid">${cardsHtml}</div>
      </div>
    `;
  }

  private getElementalReactionsHtml(): string {
    const reactions = ELEMENTAL_REACTIONS;
    const cardsHtml = reactions
      .map((r) => {
        const triggerIcon = ELEMENT_ICONS[r.triggerElement] || '✨';
        const triggerColor = ELEMENT_COLORS[r.triggerElement] || '#ffffff';
        const reqElem = STATUS_TO_ELEMENT[r.requiredStatus] || 'PHYSICAL';
        const reqColor = ELEMENT_COLORS[reqElem] || '#ffffff';
        const reqIcon = ELEMENT_ICONS[reqElem] || '✨';

        return `
        <div class="reaction-card sp-card" style="border-left-color: ${triggerColor}">
          <div class="reaction-header">
            <span class="reaction-title" style="color: ${triggerColor}">${r.name}</span>
            <span class="reaction-mult-badge">x${r.damageMultiplier} DMG</span>
          </div>
          <div class="reaction-formula">
            <span class="formula-elem" style="color: ${reqColor}">${reqIcon} Trạng thái ${r.requiredStatus}</span>
            <span class="formula-plus">+</span>
            <span class="formula-elem" style="color: ${triggerColor}">${triggerIcon} Đòn đánh ${r.triggerElement}</span>
            <span class="formula-arrow">➔</span>
            <span class="formula-result" style="color: ${triggerColor}">${r.label}</span>
          </div>
          <p class="reaction-desc">${r.description}</p>
        </div>
      `;
      })
      .join('');

    return `
      <div class="sp-section sp-card">
        <h4 class="sp-sec-title">💥 CƠ CHẾ PHẢN ỨNG NGUYÊN TỐ (ELEMENTAL REACTION)</h4>
        <p class="sp-desc">
          Khi một kẻ địch đang chịu <b>Hiệu ứng trạng thái</b> (ví dụ: Thiêu Đốt, Ẩm Ướt, Băng Giá...) và trúng tiếp một đòn đánh mang <b>Nguyên tố kích hoạt phù hợp</b>, phản ứng hóa học ma thuật sẽ bùng nổ, nhân bội sát thương và tạo ra các hiệu ứng hủy diệt!
        </p>
      </div>
      <div class="sp-section">
        <div class="reactions-list-grid">${cardsHtml}</div>
      </div>
    `;
  }

  private getSingleElementDetailHtml(elem: ElementType): string {
    const data = ELEMENT_CODEX_DETAILS[elem];
    if (!data) return '<p>Không có dữ liệu nguyên tố.</p>';
    const color = ELEMENT_COLORS[elem];
    const icon = ELEMENT_ICONS[elem];

    return `
      <div class="sp-section sp-card highlighted-detail-card" style="border-left: 6px solid ${color}">
        <div class="elem-detail-header">
          <span class="elem-icon-huge" style="color: ${color}">${icon}</span>
          <div>
            <h2 class="elem-detail-title" style="color: ${color}">${data.nameVi} (${elem})</h2>
            <span class="elem-detail-role">${data.badge}</span>
          </div>
        </div>
        <p class="elem-detail-desc">${data.nature}</p>

        <div class="elem-effect-box" style="border-left-color: ${color}">
          <h4 style="color: ${color}">⚡ Hiệu Ứng Trạng Thái: ${data.statusEffectName}</h4>
          <p>${data.statusEffectDesc}</p>
        </div>

        <div class="elem-matchup-grid">
          <div class="matchup-col effective-col">
            <h4 class="col-title" style="color: #4ade80">✅ Khắc Chế (Gây Thêm Sát Thương)</h4>
            <p class="matchup-list">${data.strongAgainst.map((s) => `${ELEMENT_ICONS[s.element]} ${ELEMENT_NAMES[s.element]} (x${s.mult})`).join('<br>') || 'Không khắc chế cứng hệ nào'}</p>
            <span class="matchup-hint">Tối ưu khi đối đầu với các thuộc tính này!</span>
          </div>
          <div class="matchup-col weak-col">
            <h4 class="col-title" style="color: #f87171">⚠️ Bị Giảm Sát Thương (Kháng)</h4>
            <p class="matchup-list">${data.weakAgainstAttack.map((w) => `${ELEMENT_ICONS[w.element]} ${ELEMENT_NAMES[w.element]} (x${w.mult})`).join('<br>') || 'Không bị giảm bởi hệ nào'}</p>
            <span class="matchup-hint">Hạn chế sử dụng khi tấn công quái thuộc tính này!</span>
          </div>
        </div>

        <div class="sample-monsters-box" style="margin-top: 14px;">
          <b>Quái vật sở hữu hệ này:</b> ${data.sampleMonsters.join(', ')}
        </div>
        <p class="sp-tip-text" style="margin-top: 10px;">
          💡 Mẹo: Khi bước vào bản đồ có tộc quái chủ đạo mang Hệ ${data.nameVi}, hãy ưu tiên trang bị tháp mang các hệ khắc chế ở mục bên trái và tránh các hệ bị giảm sát thương!
        </p>
      </div>
    `;
  }

  // ==========================================
  // 3. UPGRADED MONSTER CODEX (MASTER-DETAIL)
  // ==========================================
  private renderEnemiesCategory(): void {
    this.titleEl.textContent = 'Bách Khoa Quái Vật & Ma Trận Sát Thương';
    this.iconEl.textContent = '👾';
    this.badgeEl.textContent = 'Tìm Kiếm Đa Chiều • Canvas Mô Phỏng • Bảng Nhận Sát Thương 15 Hệ';

    const allEnemies = Object.values(ENEMY_BLUEPRINTS);

    // Filter enemies
    const filteredEnemies = allEnemies.filter((bp) => {
      // 1. Search Query
      if (this.enemySearchQuery.trim()) {
        const q = this.enemySearchQuery.trim().toLowerCase();
        const matchName = bp.name.toLowerCase().includes(q);
        const matchType = bp.typeId.toLowerCase().includes(q);
        const matchDesc = bp.description.toLowerCase().includes(q);
        if (!matchName && !matchType && !matchDesc) return false;
      }

      // 2. Element Filter
      if (this.enemyElementFilter !== 'ALL') {
        const pMatch = bp.elementalProfile.primaryElement === this.enemyElementFilter;
        const sMatch = bp.elementalProfile.secondaryElement === this.enemyElementFilter;
        if (!pMatch && !sMatch) return false;
      }

      // 3. Movement Filter
      if (this.enemyMovementFilter !== 'ALL') {
        if (bp.movementType !== this.enemyMovementFilter) return false;
      }

      // 4. Tag Filter
      if (this.enemyTagFilter !== 'ALL') {
        if (this.enemyTagFilter === 'DEATH_SPAWN') {
          if (!bp.deathSpawn) return false;
        } else if (this.enemyTagFilter === 'SUMMONER') {
          if (!bp.summonConfig && !bp.tags.includes('SUMMONER')) return false;
        } else if (this.enemyTagFilter === 'DUAL_ELEMENT') {
          if (!bp.elementalProfile.secondaryElement) return false;
        } else {
          if (!bp.tags.includes(this.enemyTagFilter)) return false;
        }
      }

      return true;
    });

    // Ensure selectedEnemyTypeId is valid
    if (!filteredEnemies.some((e) => e.typeId === this.selectedEnemyTypeId) && filteredEnemies.length > 0) {
      this.selectedEnemyTypeId = filteredEnemies[0].typeId;
    }

    const selectedBp = ENEMY_BLUEPRINTS[this.selectedEnemyTypeId] || filteredEnemies[0] || allEnemies[0];

    // Build sidebar monster list HTML
    const listHtml = filteredEnemies
      .map((bp) => {
        const pElem = bp.elementalProfile.primaryElement;
        const sElem = bp.elementalProfile.secondaryElement;
        const pColor = ELEMENT_COLORS[pElem] || '#94a3b8';
        const pIcon = ELEMENT_ICONS[pElem] || '⚔️';
        const sIcon = sElem ? ELEMENT_ICONS[sElem] : '';
        const moveIcon = bp.movementType === 'FLY' ? '✈️' : bp.movementType === 'SWIM' ? '🏊' : '🚶';
        const isCurrent = bp.typeId === selectedBp.typeId;

        let badges = '';
        if (bp.tags.includes('BOSS')) {
          badges += `<span style="font-size: 10px; background: rgba(239, 68, 68, 0.25); color: #f87171; padding: 1px 4px; border-radius: 3px;">👑</span>`;
        } else if (bp.tags.includes('ELITE')) {
          badges += `<span style="font-size: 10px; background: rgba(245, 158, 11, 0.25); color: #fbbf24; padding: 1px 4px; border-radius: 3px;">⭐</span>`;
        }
        if (bp.deathSpawn) {
          badges += `<span style="font-size: 10px; background: rgba(249, 115, 22, 0.25); color: #f97316; padding: 1px 4px; border-radius: 3px;">💥</span>`;
        }
        if (bp.summonConfig) {
          badges += `<span style="font-size: 10px; background: rgba(168, 85, 247, 0.25); color: #c084fc; padding: 1px 4px; border-radius: 3px;">🔮</span>`;
        }

        return `
          <div class="codex-monster-item ${isCurrent ? 'active' : ''}" data-monster-type="${bp.typeId}" style="border-left-color: ${pColor};">
            <div class="cmi-info">
              <div class="cmi-name">
                <span>${pIcon}${sIcon} ${bp.name}</span>
              </div>
              <div class="cmi-sub">
                <span>${moveIcon} ${bp.speed} px/s</span>
                <span style="color: #ef4444;">${bp.hp} ❤️</span>
                <span style="color: #facc15;">+${bp.rewardGold}🪙</span>
              </div>
            </div>
            <div class="cmi-badges">${badges}</div>
          </div>
        `;
      })
      .join('');

    const rightContentHtml = this.getEnemyDetailHtml(selectedBp);

    this.contentEl.innerHTML = `
      <div class="codex-master-layout">
        <aside class="codex-sidebar-nav">
          <div class="codex-sidebar-title">
            <span>TÌM KIẾM & BỘ LỌC</span>
          </div>

          <div class="codex-search-box">
            <input type="text" id="codex-enemy-search" class="codex-search-input" placeholder="🔍 Nhập tên hoặc đặc tính quái..." value="${this.enemySearchQuery}" />
            <div class="codex-filter-grid">
              <select id="codex-filter-element" class="codex-filter-select">
                <option value="ALL" ${this.enemyElementFilter === 'ALL' ? 'selected' : ''}>✨ Mọi Hệ</option>
                ${ALL_15_ELEMENTS.map((el) => `<option value="${el}" ${this.enemyElementFilter === el ? 'selected' : ''}>${ELEMENT_ICONS[el]} ${ELEMENT_NAMES[el]}</option>`).join('')}
              </select>
              <select id="codex-filter-movement" class="codex-filter-select">
                <option value="ALL" ${this.enemyMovementFilter === 'ALL' ? 'selected' : ''}>🚶 Mọi Di Chuyển</option>
                <option value="WALK" ${this.enemyMovementFilter === 'WALK' ? 'selected' : ''}>🚶 Đường Bộ</option>
                <option value="FLY" ${this.enemyMovementFilter === 'FLY' ? 'selected' : ''}>✈️ Trên Không</option>
                <option value="SWIM" ${this.enemyMovementFilter === 'SWIM' ? 'selected' : ''}>🏊 Kênh Sông</option>
              </select>
            </div>
            <div class="codex-filter-grid">
              <select id="codex-filter-tag" class="codex-filter-select" style="grid-column: span 2;">
                <option value="ALL" ${this.enemyTagFilter === 'ALL' ? 'selected' : ''}>🏷️ Mọi Phân Loại</option>
                <option value="BOSS" ${this.enemyTagFilter === 'BOSS' ? 'selected' : ''}>👑 Trùm (Boss)</option>
                <option value="ELITE" ${this.enemyTagFilter === 'ELITE' ? 'selected' : ''}>⭐ Tinh Anh (Elite)</option>
                <option value="SWARM" ${this.enemyTagFilter === 'SWARM' ? 'selected' : ''}>👥 Bầy Đàn (Swarm)</option>
                <option value="DEATH_SPAWN" ${this.enemyTagFilter === 'DEATH_SPAWN' ? 'selected' : ''}>💥 Phân Tách Khi Chết</option>
                <option value="SUMMONER" ${this.enemyTagFilter === 'SUMMONER' ? 'selected' : ''}>🔮 Kỹ Năng Triệu Hồi</option>
                <option value="DUAL_ELEMENT" ${this.enemyTagFilter === 'DUAL_ELEMENT' ? 'selected' : ''}>✨ Mang 2 Thuộc Tính</option>
              </select>
            </div>
          </div>

          <div class="codex-count-badge">
            <span>DANH SÁCH QUÁI VẬT</span>
            <span style="font-weight: 700; color: #38bdf8;">${filteredEnemies.length} / ${allEnemies.length}</span>
          </div>

          <div class="codex-monster-list" id="codex-monster-list">
            ${listHtml || '<div style="color: #64748b; padding: 20px 8px; text-align: center;">Không tìm thấy quái vật nào phù hợp.</div>'}
          </div>
        </aside>

        <main class="codex-detail-pane" id="codex-enemy-detail">
          ${rightContentHtml}
        </main>
      </div>
    `;

    // Start stickman animation loop
    this.startEnemyAnimation(selectedBp);

    // Bind Search Input
    const searchInput = document.getElementById('codex-enemy-search') as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.enemySearchQuery = (e.target as HTMLInputElement).value;
        this.renderEnemiesCategory();
      });
    }

    // Bind Element Filter
    const elemSelect = document.getElementById('codex-filter-element') as HTMLSelectElement;
    if (elemSelect) {
      elemSelect.addEventListener('change', (e) => {
        this.enemyElementFilter = (e.target as HTMLSelectElement).value;
        this.renderEnemiesCategory();
      });
    }

    // Bind Movement Filter
    const moveSelect = document.getElementById('codex-filter-movement') as HTMLSelectElement;
    if (moveSelect) {
      moveSelect.addEventListener('change', (e) => {
        this.enemyMovementFilter = (e.target as HTMLSelectElement).value;
        this.renderEnemiesCategory();
      });
    }

    // Bind Tag Filter
    const tagSelect = document.getElementById('codex-filter-tag') as HTMLSelectElement;
    if (tagSelect) {
      tagSelect.addEventListener('change', (e) => {
        this.enemyTagFilter = (e.target as HTMLSelectElement).value;
        this.renderEnemiesCategory();
      });
    }

    // Bind Monster List items click
    this.contentEl.querySelectorAll('[data-monster-type]').forEach((item) => {
      item.addEventListener('click', (e) => {
        const typeId = (e.currentTarget as HTMLElement).getAttribute('data-monster-type');
        if (typeId && typeId !== this.selectedEnemyTypeId) {
          this.selectedEnemyTypeId = typeId;
          const targetBp = ENEMY_BLUEPRINTS[typeId];
          if (targetBp) {
            // Update active state in list
            this.contentEl.querySelectorAll('.codex-monster-item').forEach((el) => el.classList.remove('active'));
            (e.currentTarget as HTMLElement).classList.add('active');

            // Update detail pane
            const detailPane = document.getElementById('codex-enemy-detail');
            if (detailPane) {
              detailPane.innerHTML = this.getEnemyDetailHtml(targetBp);
            }

            // Restart animation
            this.startEnemyAnimation(targetBp);
          }
        }
      });
    });
  }

  private getEnemyDetailHtml(bp: EnemyBlueprint): string {
    const pElem = bp.elementalProfile.primaryElement;
    const sElem = bp.elementalProfile.secondaryElement;
    const pColor = ELEMENT_COLORS[pElem] || '#94a3b8';
    const pIcon = ELEMENT_ICONS[pElem] || '⚔️';
    const sIcon = sElem ? ELEMENT_ICONS[sElem] : '';
    const sName = sElem ? ` + ${ELEMENT_NAMES[sElem]}` : '';

    const moveText = bp.movementType === 'FLY' ? '✈️ Đường Bay (Air)' : bp.movementType === 'SWIM' ? '🏊 Kênh Sông (Water)' : '🚶 Đường Bộ (Ground)';

    // Badges
    let abilityBadges = '';
    if (bp.tags.includes('BOSS')) {
      abilityBadges += `<span style="background: rgba(239, 68, 68, 0.25); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.5); border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 800;">👑 TRÙM CUỐI (BOSS)</span>`;
    } else if (bp.tags.includes('ELITE')) {
      abilityBadges += `<span style="background: rgba(245, 158, 11, 0.25); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.5); border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 800;">⭐ TINH ANH (ELITE)</span>`;
    }
    if (bp.deathSpawn) {
      abilityBadges += `<span style="background: rgba(249, 115, 22, 0.2); color: #f97316; border: 1px solid rgba(249, 115, 22, 0.4); border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 700;">💥 Phân tách x${bp.deathSpawn.count}</span>`;
    }
    if (bp.summonConfig) {
      abilityBadges += `<span style="background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 700;">🔮 Triệu hồi mỗi ${bp.summonConfig.interval}s</span>`;
    }
    if (sElem) {
      abilityBadges += `<span style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 700;">✨ Song Thuộc Tính</span>`;
    }

    // Matchup summary calculation
    const summary = this.getEnemyMatchupSummary(bp);

    const weaknessesBadges = summary.weaknesses.length > 0
      ? summary.weaknesses.map((w) => {
          const ic = ELEMENT_ICONS[w.element];
          const nm = ELEMENT_NAMES[w.element].split(' ')[0];
          const isSuper = w.multiplier >= 1.6;
          return `<span class="cm-tag ${isSuper ? 'super-weak' : 'weak'}">${ic} ${nm} (${w.percentage}%)</span>`;
        }).join('')
      : '<span style="color: #64748b; font-size: 12px;">Không có điểm yếu rõ rệt</span>';

    const resistancesBadges = summary.resistances.length > 0
      ? summary.resistances.map((r) => {
          const ic = ELEMENT_ICONS[r.element];
          const nm = ELEMENT_NAMES[r.element].split(' ')[0];
          return `<span class="cm-tag resist">${ic} ${nm} (${r.percentage}%)</span>`;
        }).join('')
      : '<span style="color: #64748b; font-size: 12px;">Không kháng hệ nào</span>';

    const immunitiesBadges = summary.immunities.length > 0
      ? summary.immunities.map((im) => {
          const ic = ELEMENT_ICONS[im];
          const nm = ELEMENT_NAMES[im].split(' ')[0];
          return `<span class="cm-tag immune">${ic} ${nm} (0%)</span>`;
        }).join('')
      : '<span style="color: #64748b; font-size: 12px;">Không có miễn nhiễm</span>';

    // Full 15-Element Intake Grid HTML
    const intakeGridCards = ALL_15_ELEMENTS.map((elem) => {
      const intake = this.calculateDamageIntake(bp, elem);
      const icon = ELEMENT_ICONS[elem];
      const color = ELEMENT_COLORS[elem];
      const name = ELEMENT_NAMES[elem];

      const barWidth = Math.min(100, Math.round((intake.multiplier / 2.0) * 100));
      let barColor = '#94a3b8';
      if (intake.category === 'IMMUNE') barColor = '#64748b';
      else if (intake.category === 'RESIST') barColor = '#38bdf8';
      else if (intake.category === 'WEAK') barColor = '#fbbf24';
      else if (intake.category === 'SUPER_WEAK') barColor = '#ef4444';

      return `
        <div class="damage-intake-card" style="border-left: 3px solid ${color};">
          <div class="dic-top">
            <span class="dic-elem" style="color: ${color};">
              <span>${icon}</span>
              <span>${name}</span>
            </span>
            <span class="dic-pct" style="color: ${barColor};">${intake.percentage}%</span>
          </div>
          <div class="dic-bar-bg">
            <div class="dic-bar-fill" style="width: ${barWidth}%; background: ${barColor};"></div>
          </div>
          <span class="dic-badge ${intake.badgeClass}">${intake.label}</span>
        </div>
      `;
    }).join('');

    return `
      <!-- 1. Hero Card: Canvas + Base Info -->
      <div class="codex-monster-hero">
        <div class="codex-monster-canvas-box">
          <canvas id="codex-enemy-canvas" width="240" height="200"></canvas>
          <span class="codex-monster-canvas-hint">Mô phỏng hình ảnh thực tế</span>
        </div>

        <div style="display: flex; flex-direction: column; justify-content: space-between; gap: 8px;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
              <div>
                <h2 style="font-size: 22px; font-weight: 800; color: #f8fafc; margin: 0 0 4px 0;">
                  ${pIcon}${sIcon} ${bp.name}
                </h2>
                <span style="font-size: 11px; font-family: monospace; color: #64748b;">TYPE_ID: ${bp.typeId}</span>
              </div>
              <span style="color: #facc15; font-size: 17px; font-weight: 800; background: rgba(250, 204, 21, 0.15); padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(250, 204, 21, 0.3);">
                🪙 +${bp.rewardGold} Vàng
              </span>
            </div>

            <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px;">
              <span style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 4px; padding: 2px 8px; font-size: 11.5px; font-weight: 700; color: ${pColor};">
                ${pIcon} Hệ ${ELEMENT_NAMES[pElem]}${sName}
              </span>
              <span style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 4px; padding: 2px 8px; font-size: 11.5px; font-weight: 700; color: #cbd5e1;">
                ${moveText}
              </span>
              ${abilityBadges}
            </div>

            <p style="font-size: 13.5px; color: #cbd5e1; line-height: 1.5; margin: 0;">${bp.description}</p>
          </div>

          <!-- Combat Stats Grid -->
          <div class="codex-stats-grid">
            <div class="codex-stat-item">
              <span class="csi-lbl">Máu Tối Đa</span>
              <span class="csi-val" style="color: #ef4444;">${bp.hp} ❤️</span>
            </div>
            <div class="codex-stat-item">
              <span class="csi-lbl">Sát Thương</span>
              <span class="csi-val" style="color: #f97316;">${bp.damage} ⚔️</span>
            </div>
            <div class="codex-stat-item">
              <span class="csi-lbl">Tốc Độ Chạy</span>
              <span class="csi-val" style="color: #38bdf8;">${bp.speed} px/s</span>
            </div>
            <div class="codex-stat-item">
              <span class="csi-lbl">Tốc Độ Đánh</span>
              <span class="csi-val">${bp.attackSpeed}/s</span>
            </div>
            <div class="codex-stat-item">
              <span class="csi-lbl">Độ Cao / Vị Trí</span>
              <span class="csi-val">${bp.altitude > 0 ? `${bp.altitude}px (Bay)` : 'Mặt đất'}</span>
            </div>
            <div class="codex-stat-item">
              <span class="csi-lbl">Tìm Đường</span>
              <span class="csi-val" style="font-size: 12px; color: #a855f7;">${bp.navigationMode}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Special Traits Breakdown (if any) -->
      ${
        bp.deathSpawn || bp.summonConfig || sElem
          ? `
          <div class="sp-section sp-card" style="border-left: 4px solid #a855f7; background: #0c1424;">
            <h4 class="sp-sec-title" style="color: #c084fc; margin-bottom: 8px;">🔮 ĐẶC TÍNH CHIẾN ĐẤU & KỸ NĂNG ĐẶC BIỆT</h4>
            <div style="display: flex; flex-direction: column; gap: 8px; font-size: 13.5px; color: #cbd5e1;">
              ${
                bp.deathSpawn
                  ? `<div>💥 <b>Kỹ Năng Phân Tách:</b> Khi bị hạ gục, lập tức phân tách thành <b>x${bp.deathSpawn.count} ${ENEMY_BLUEPRINTS[bp.deathSpawn.typeId]?.name || bp.deathSpawn.typeId}</b> tiếp tục hành trình xâm lăng!</div>`
                  : ''
              }
              ${
                bp.summonConfig
                  ? `<div>🔮 <b>Kỹ Năng Triệu Hồi:</b> Cứ mỗi <b>${bp.summonConfig.interval} giây</b> trên đường đi, tự động triệu tập <b>x${bp.summonConfig.count} ${ENEMY_BLUEPRINTS[bp.summonConfig.typeId]?.name || bp.summonConfig.typeId}</b> bảo vệ xung quanh!</div>`
                  : ''
              }
              ${
                sElem
                  ? `<div>✨ <b>Song Thuộc Tính:</b> Mang kết hợp 2 hệ <b>${ELEMENT_NAMES[pElem]}</b> và <b>${ELEMENT_NAMES[sElem]}</b>, ma trận sát thương nhận vào sẽ tính trung bình cộng giữa 2 hệ!</div>`
                  : ''
              }
            </div>
          </div>
        `
          : ''
      }

      <!-- 3. Elemental Matchup Quick Summary -->
      <div class="sp-section sp-card">
        <h4 class="sp-sec-title" style="color: #38bdf8;">⚖️ TỔNG QUAN TƯƠNG QUAN NGUYÊN TỐ</h4>
        <div class="codex-matchup-summary">
          <div class="codex-matchup-col">
            <span class="cmc-title" style="color: #f87171;">💥 Khắc Hệ (Điểm Yếu >100%)</span>
            <div class="cmc-tags">${weaknessesBadges}</div>
          </div>
          <div class="codex-matchup-col">
            <span class="cmc-title" style="color: #38bdf8;">🛡️ Yếu Thế (Kháng Cự &lt;100%)</span>
            <div class="cmc-tags">${resistancesBadges}</div>
          </div>
          <div class="codex-matchup-col">
            <span class="cmc-title" style="color: #cbd5e1;">🚫 Miễn Nhiễm (0% Sát Thương)</span>
            <div class="cmc-tags">${immunitiesBadges}</div>
          </div>
        </div>
      </div>

      <!-- 4. Full 15-Element Damage Intake Grid -->
      <div class="sp-section sp-card">
        <div class="sp-sec-header">
          <h4 class="sp-sec-title" style="color: #facc15;">📊 BẢNG TỈ LỆ SÁT THƯƠNG NHẬN VÀO TỪ MỖI HỆ NGUYÊN TỐ (15 HỆ)</h4>
          <span class="sp-hint">Tính theo công thức thực chiến của TargetingRuleEngine</span>
        </div>
        <p class="sp-desc" style="font-size: 13px; margin-bottom: 6px;">
          Bảng bên dưới thể hiện chính xác <b>tỉ lệ phần trăm sát thương (%)</b> mà quái <b>${bp.name}</b> sẽ phải nhận khi bị tấn công bởi từng hệ nguyên tố tương ứng:
        </p>
        <div class="damage-intake-grid">${intakeGridCards}</div>
      </div>
    `;
  }

  private calculateDamageIntake(
    bp: EnemyBlueprint,
    attackerElement: ElementType
  ): {
    multiplier: number;
    percentage: number;
    category: 'IMMUNE' | 'RESIST' | 'NORMAL' | 'WEAK' | 'SUPER_WEAK';
    label: string;
    badgeClass: string;
  } {
    const profile = bp.elementalProfile;

    // 1. Complete immunity
    if (profile.immunities.includes(attackerElement)) {
      return {
        multiplier: 0,
        percentage: 0,
        category: 'IMMUNE',
        label: 'MIỄN NHIỄM (0%)',
        badgeClass: 'badge-immune'
      };
    }

    let multiplier = 1.0;

    // 2. Custom override
    if (profile.damageMultipliers && profile.damageMultipliers[attackerElement] !== undefined) {
      multiplier = profile.damageMultipliers[attackerElement]!;
    } else {
      // 3. Matchup against primary and secondary
      const pMatch = ELEMENTAL_MATCHUPS[attackerElement]?.[profile.primaryElement] ?? 1.0;
      if (profile.secondaryElement && profile.secondaryElement !== 'PHYSICAL') {
        const sMatch = ELEMENTAL_MATCHUPS[attackerElement]?.[profile.secondaryElement] ?? 1.0;
        multiplier = (pMatch + sMatch) / 2;
      } else {
        multiplier = pMatch;
      }
    }

    // 4. Movement and Tag bonuses
    if (attackerElement === 'WIND' && bp.movementType === 'FLY') {
      multiplier *= 1.5;
    }
    if (attackerElement === 'EARTH' && bp.movementType === 'WALK') {
      multiplier *= 1.2;
    }
    if (attackerElement === 'DRAGON' && (bp.tags.includes('BOSS') || bp.tags.includes('ELITE'))) {
      multiplier *= 1.35;
    }

    multiplier = Math.round(multiplier * 100) / 100;
    const percentage = Math.round(multiplier * 100);

    if (multiplier <= 0.01) {
      return {
        multiplier: 0,
        percentage: 0,
        category: 'IMMUNE',
        label: 'MIỄN NHIỄM (0%)',
        badgeClass: 'badge-immune'
      };
    } else if (multiplier <= 0.8) {
      return {
        multiplier,
        percentage,
        category: 'RESIST',
        label: `KHÁNG (${percentage}%)`,
        badgeClass: 'badge-resist'
      };
    } else if (multiplier < 1.2) {
      return {
        multiplier,
        percentage,
        category: 'NORMAL',
        label: `CHUẨN (100%)`,
        badgeClass: 'badge-normal'
      };
    } else if (multiplier < 1.6) {
      return {
        multiplier,
        percentage,
        category: 'WEAK',
        label: `KHẮC HỆ (${percentage}%)`,
        badgeClass: 'badge-weak'
      };
    } else {
      return {
        multiplier,
        percentage,
        category: 'SUPER_WEAK',
        label: `CHÍ MẠNG (${percentage}%)`,
        badgeClass: 'badge-super-weak'
      };
    }
  }

  private getEnemyMatchupSummary(bp: EnemyBlueprint): {
    weaknesses: { element: ElementType; percentage: number; multiplier: number }[];
    resistances: { element: ElementType; percentage: number; multiplier: number }[];
    immunities: ElementType[];
  } {
    const weaknesses: { element: ElementType; percentage: number; multiplier: number }[] = [];
    const resistances: { element: ElementType; percentage: number; multiplier: number }[] = [];
    const immunities: ElementType[] = [];

    for (const elem of ALL_15_ELEMENTS) {
      const intake = this.calculateDamageIntake(bp, elem);
      if (intake.category === 'IMMUNE') {
        immunities.push(elem);
      } else if (intake.category === 'WEAK' || intake.category === 'SUPER_WEAK') {
        weaknesses.push({ element: elem, percentage: intake.percentage, multiplier: intake.multiplier });
      } else if (intake.category === 'RESIST') {
        resistances.push({ element: elem, percentage: intake.percentage, multiplier: intake.multiplier });
      }
    }

    weaknesses.sort((a, b) => b.multiplier - a.multiplier);
    resistances.sort((a, b) => a.multiplier - b.multiplier);

    return { weaknesses, resistances, immunities };
  }

  private startEnemyAnimation(bp: EnemyBlueprint): void {
    this.stopEnemyAnimation();

    const canvas = document.getElementById('codex-enemy-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.enemyAnimStartTime = performance.now();

    const loop = (timestamp: number) => {
      if (!this.isOpen() || this.currentCategory !== 'ENEMIES') {
        this.stopEnemyAnimation();
        return;
      }

      const animTime = (timestamp - this.enemyAnimStartTime) / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height * 0.72;
      const elemColor = ELEMENT_COLORS[bp.elementalProfile.primaryElement] || '#60a5fa';

      // Subtle ambient glow
      const glowGrad = ctx.createRadialGradient(cx, cy - 20, 10, cx, cy - 20, 90);
      glowGrad.addColorStop(0, `${elemColor}30`);
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Floor reference line
      ctx.strokeStyle = bp.movementType === 'SWIM' ? 'rgba(56, 189, 248, 0.4)' : 'rgba(71, 85, 105, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - 70, cy + 8);
      ctx.lineTo(cx + 70, cy + 8);
      ctx.stroke();

      const mockEnemy: any = {
        id: 'preview',
        type: bp.typeId,
        name: bp.name,
        x: cx,
        y: cy,
        size: Math.min(Math.max(bp.size * 1.35, 18), 34),
        altitude: bp.movementType === 'FLY' ? 30 : 0,
        movementType: bp.movementType,
        navigationMode: bp.navigationMode,
        elementalProfile: bp.elementalProfile,
        tags: bp.tags || [],
        hp: bp.hp,
        maxHp: bp.hp,
        speed: bp.speed,
        damage: bp.damage,
        color: bp.color,
        state: 'MOVING',
        statusEffects: []
      };

      StickmanRenderer.renderEnemy(ctx, mockEnemy, animTime);

      this.enemyAnimFrameId = requestAnimationFrame(loop);
    };

    this.enemyAnimFrameId = requestAnimationFrame(loop);
  }

  private stopEnemyAnimation(): void {
    if (this.enemyAnimFrameId !== null) {
      cancelAnimationFrame(this.enemyAnimFrameId);
      this.enemyAnimFrameId = null;
    }
  }

  // ==========================================
  // 4. NAVIGATION CATEGORY (MASTER-DETAIL)
  // ==========================================
  private renderNavigationCategory(highlightNav?: string): void {
    if (highlightNav) {
      this.currentNavSubTab = highlightNav;
    }

    this.titleEl.textContent = 'Quy Tắc Di Chuyển Của Quái Vật';
    this.iconEl.textContent = '🧭';
    this.badgeEl.textContent = 'Đường Bộ, Đường Bay & Đường Thủy';

    let rightNavHtml = '';
    switch (this.currentNavSubTab) {
      case 'WALK':
        rightNavHtml = this.getSingleNavDetailHtml('WALK');
        break;
      case 'FLY':
        rightNavHtml = this.getSingleNavDetailHtml('FLY');
        break;
      case 'SWIM':
        rightNavHtml = this.getSingleNavDetailHtml('SWIM');
        break;
      case 'OVERVIEW':
      default:
        rightNavHtml = this.getNavOverviewHtml();
    }

    this.contentEl.innerHTML = `
      <div class="codex-master-layout">
        <aside class="codex-sidebar-nav">
          <div class="codex-sidebar-title">
            <span>TUYẾN ĐƯỜNG & ĐỊA HÌNH</span>
          </div>
          <button class="codex-subnav-btn ${this.currentNavSubTab === 'OVERVIEW' ? 'active' : ''}" data-sub-nav="OVERVIEW">
            <span style="font-size: 18px;">🗺️</span>
            <div>
              <div style="font-weight: 700;">Tổng Quan 3 Hành Lang</div>
              <div style="font-size: 11px; color: #64748b;">Quy tắc chiến lược phân luồng</div>
            </div>
          </button>
          <button class="codex-subnav-btn ${this.currentNavSubTab === 'WALK' ? 'active' : ''}" data-sub-nav="WALK">
            <span style="font-size: 18px;">🚶</span>
            <div>
              <div style="font-weight: 700;">Tuyến Đường Bộ (Ground)</div>
              <div style="font-size: 11px; color: #64748b;">Đường mòn uốn lượn mặt đất</div>
            </div>
          </button>
          <button class="codex-subnav-btn ${this.currentNavSubTab === 'FLY' ? 'active' : ''}" data-sub-nav="FLY">
            <span style="font-size: 18px;">✈️</span>
            <div>
              <div style="font-weight: 700;">Tuyến Đường Bay (Air)</div>
              <div style="font-size: 11px; color: #64748b;">Bay lơ lửng, bỏ qua lính cận chiến</div>
            </div>
          </button>
          <button class="codex-subnav-btn ${this.currentNavSubTab === 'SWIM' ? 'active' : ''}" data-sub-nav="SWIM">
            <span style="font-size: 18px;">🏊</span>
            <div>
              <div style="font-weight: 700;">Tuyến Kênh Sông (Water)</div>
              <div style="font-size: 11px; color: #64748b;">Dòng sông xanh, thủy quái bơi lội</div>
            </div>
          </button>
        </aside>

        <main class="codex-detail-pane" id="codex-nav-detail">
          ${rightNavHtml}
        </main>
      </div>
    `;

    // Bind subnav events
    this.contentEl.querySelectorAll('[data-sub-nav]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const sub = (e.currentTarget as HTMLElement).getAttribute('data-sub-nav');
        if (sub) {
          this.currentNavSubTab = sub;
          this.renderNavigationCategory();
        }
      });
    });
  }

  private getNavOverviewHtml(): string {
    return `
      <div class="sp-section sp-card">
        <h4 class="sp-sec-title">🗺️ BA HÀNH LANG DI CHUYỂN CHIẾN LƯỢC</h4>
        <p class="sp-desc">
          Bản đồ Stick Vanguard được thiết kế với 3 tuyến đường xâm lăng độc lập. Mỗi loại quái vật có cơ chế di chuyển riêng biệt đòi hỏi bạn phải bố trí tháp và bẫy hợp lý:
        </p>
      </div>

      <div class="nav-cards-list-grid">
        <!-- 1. Ground Path -->
        <div class="nav-card">
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
        <div class="nav-card">
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
        <div class="nav-card">
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

  private getSingleNavDetailHtml(mode: 'WALK' | 'FLY' | 'SWIM'): string {
    switch (mode) {
      case 'WALK':
        return `
          <div class="sp-section sp-card highlighted-detail-card" style="border-left: 5px solid #d97706;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
              <span style="font-size: 32px;">🚶</span>
              <div>
                <h3 style="font-size: 20px; color: #f8fafc; margin: 0;">TUYẾN ĐƯỜNG BỘ (GROUND PATH)</h3>
                <span class="sp-hint">Lộ trình dải đất uốn lượn dành cho bộ binh</span>
              </div>
            </div>
            <p class="sp-desc">
              Tuyến đường bộ là trục tiến công đông đảo nhất của quân xâm lăng. Quái vật di chuyển men theo đường mòn đất, tuân thủ các quy tắc chặn đường và bẫy chiến thuật.
            </p>
            <div class="sp-mechanic-box" style="border-left-color: #d97706;">
              <p><b>🛡️ Khắc chế số 1:</b> <b>Lính Đánh Gần (Melee)</b> - Chốt chặn 1v1 bắt quái vật đứng lại đấu kiếm, tạo vùng bắn lý tưởng cho Pháo Cối và Tháp Cung.</p>
              <p><b>⚙️ Tác dụng bẫy:</b> Kích hoạt 100% các loại <b>Bẫy Chông Gai</b> và <b>Mìn Lửa Hỏa Ngục</b> đặt trên đường.</p>
              <p><b>⛰️ Điểm yếu hệ:</b> Nhận thêm <b>+20% sát thương từ hệ Đất (EARTH)</b> do rung chấn địa hình mặt đất!</p>
            </div>
          </div>
        `;
      case 'FLY':
        return `
          <div class="sp-section sp-card highlighted-detail-card" style="border-left: 5px solid #10b981;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
              <span style="font-size: 32px;">✈️</span>
              <div>
                <h3 style="font-size: 20px; color: #f8fafc; margin: 0;">TUYẾN ĐƯỜNG BAY (AIRWAYS)</h3>
                <span class="sp-hint">Lộ trình không trung cắt ngang bản đồ ngắn nhất</span>
              </div>
            </div>
            <p class="sp-desc">
              Quái bay sở hữu độ cao (Altitude > 0), bay lơ lửng trên không trung và bỏ qua hoàn toàn các khúc quanh mặt đất để tiến thẳng về nhà chính.
            </p>
            <div class="sp-mechanic-box" style="border-left-color: #10b981;">
              <p><b>🚫 Miễn dịch mặt đất:</b> Không bị lính cận chiến chặn đường, không dẫm phải bẫy chông hay mìn lửa, và <b>Pháo cối hoàn toàn không bắn được</b>!</p>
              <p><b>🎯 Vũ khí tiêu diệt:</b> <b>Tháp Cung</b> tốc độ cao, <b>Tháp Phù Thủy</b> sát thương diện rộng và chuyển Nhà Lính sang <b>Lính Bắn Tên</b>.</p>
              <p><b>🌪️ Điểm yếu chí mạng:</b> Nhận thêm <b>+50% sát thương từ hệ Gió (WIND)</b> và bị cuồng phong đẩy lùi xa 25px!</p>
            </div>
          </div>
        `;
      case 'SWIM':
        return `
          <div class="sp-section sp-card highlighted-detail-card" style="border-left: 5px solid #06b6d4;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
              <span style="font-size: 32px;">🏊</span>
              <div>
                <h3 style="font-size: 20px; color: #f8fafc; margin: 0;">TUYẾN KÊNH SÔNG (WATERWAYS)</h3>
                <span class="sp-hint">Dòng kênh nước sâu uốn lượn dành cho thủy quái</span>
              </div>
            </div>
            <p class="sp-desc">
              Tuyến đường thủy dành riêng cho các loài thủy quái bơi lội dưới nước. Thủy quái men theo lòng sông sâu để luồn lách qua các chốt chặn bộ binh thông thường.
            </p>
            <div class="sp-mechanic-box" style="border-left-color: #06b6d4;">
              <p><b>🚫 Hạn chế lính bộ:</b> Lính bộ binh không thể xuống nước để cắm cờ hay chặn đường 1v1.</p>
              <p><b>🌊 Vũ khí độc quyền:</b> <b>Bẫy Thủy Lôi Băng</b> đặt trực tiếp dưới nước, nổ đóng băng thủy quái 1.2s!</p>
              <p><b>🏹 Phối hợp viễn chiến:</b> Đặt cờ <b>Lính Bắn Tên</b> ở mép bờ kênh, kết hợp với Tháp Cung và Tháp Phép bao quát mặt nước.</p>
            </div>
          </div>
        `;
    }
  }
}
