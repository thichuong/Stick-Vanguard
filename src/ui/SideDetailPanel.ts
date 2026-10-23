import { TowerType } from '../types/entities.types.js';
import { CodexBuildings } from './codex/CodexBuildings.js';
import { CodexSoldiers } from './codex/CodexSoldiers.js';
import { CodexTraps } from './codex/CodexTraps.js';
import { CodexImbue } from './codex/CodexImbue.js';
import { CodexElements } from './codex/CodexElements.js';
import { CodexEnemies } from './codex/CodexEnemies.js';
import { CodexNavigation } from './codex/CodexNavigation.js';

export class SideDetailPanel {
  private backdropEl: HTMLElement;
  private contentEl: HTMLElement;
  private titleEl: HTMLElement;
  private badgeEl: HTMLElement;
  private iconEl: HTMLElement;

  // Navigation State
  private currentCategory: string = 'BUILDINGS';
  private currentBuildingSubTab: string = 'BARRACKS';

  // Sub-modules
  private buildingsCodex: CodexBuildings;
  private soldiersCodex: CodexSoldiers;
  private trapsCodex: CodexTraps;
  private imbueCodex: CodexImbue;
  private elementsCodex: CodexElements;
  private enemiesCodex: CodexEnemies;
  private navigationCodex: CodexNavigation;

  constructor() {
    this.backdropEl = document.getElementById('codex-modal-backdrop')!;
    this.contentEl = document.getElementById('codex-modal-body')!;
    this.titleEl = document.getElementById('codex-modal-title')!;
    this.badgeEl = document.getElementById('codex-modal-badge')!;
    this.iconEl = document.getElementById('codex-modal-icon')!;

    this.buildingsCodex = new CodexBuildings(() => {
      this.currentBuildingSubTab = 'SOLDIERS';
      this.renderBuildingsCategory();
    });
    this.soldiersCodex = new CodexSoldiers();
    this.trapsCodex = new CodexTraps();
    this.imbueCodex = new CodexImbue();
    this.elementsCodex = new CodexElements();
    this.enemiesCodex = new CodexEnemies(
      () => this.isOpen(),
      () => this.currentCategory
    );
    this.navigationCodex = new CodexNavigation();

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
        this.buildingsCodex.selectedTierKey = targetSubId;
      }
    } else if (category === 'ELEMENTS') {
      this.currentCategory = 'ELEMENTS';
      if (targetSubId) {
        this.elementsCodex.currentElementSubTab = targetSubId;
      }
    } else if (category === 'ENEMIES') {
      this.currentCategory = 'ENEMIES';
      if (targetSubId) {
        this.enemiesCodex.selectedEnemyTypeId = targetSubId;
      }
    } else if (category === 'NAVIGATION') {
      this.currentCategory = 'NAVIGATION';
      if (targetSubId) {
        this.navigationCodex.currentNavSubTab = targetSubId;
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
    this.enemiesCodex.stopEnemyAnimation();
    this.backdropEl.classList.add('hidden');
  }

  public toggle(category: string = 'BUILDINGS'): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open(category);
    }
  }

  private renderContent(): void {
    this.enemiesCodex.stopEnemyAnimation();
    switch (this.currentCategory) {
      case 'BUILDINGS':
        this.renderBuildingsCategory();
        break;
      case 'ELEMENTS':
        this.elementsCodex.renderElementsCategory(
          this.contentEl,
          this.titleEl,
          this.iconEl,
          this.badgeEl
        );
        break;
      case 'NAVIGATION':
        this.navigationCodex.renderNavigationCategory(
          this.contentEl,
          this.titleEl,
          this.iconEl,
          this.badgeEl
        );
        break;
      case 'ENEMIES':
        this.enemiesCodex.renderEnemiesCategory(
          this.contentEl,
          this.titleEl,
          this.iconEl,
          this.badgeEl
        );
        break;
      default:
        this.renderBuildingsCategory();
    }
  }

  // ==========================================
  // UNIFIED BUILDINGS CATEGORY (MASTER-DETAIL)
  // ==========================================
  private renderBuildingsCategory(): void {
    const existingSidebar = this.contentEl.querySelector('.codex-sidebar-nav');
    const prevSidebarScroll = existingSidebar ? existingSidebar.scrollTop : 0;

    this.titleEl.textContent = 'Bách Khoa Công Trình & Bẫy Phòng Thủ';
    this.iconEl.textContent = '🏰';
    this.badgeEl.textContent = '4 Nhánh Tháp • Binh Lính • Bẫy Chiến Thuật • Khảm Ngọc';

    let rightContentHtml = '';
    switch (this.currentBuildingSubTab) {
      case 'BARRACKS':
      case 'ARCHER':
      case 'MAGE':
      case 'ARTILLERY':
        rightContentHtml = this.buildingsCodex.getTowerCategoryHtml(
          this.currentBuildingSubTab as TowerType,
          this.buildingsCodex.selectedTierKey
        );
        break;
      case 'SOLDIERS':
        rightContentHtml = this.soldiersCodex.getSoldiersCategoryHtml();
        break;
      case 'TRAPS':
        rightContentHtml = this.trapsCodex.getTrapsCategoryHtml();
        break;
      case 'IMBUE':
        rightContentHtml = this.imbueCodex.getBuildingImbueCategoryHtml();
        break;
      default:
        rightContentHtml = this.buildingsCodex.getTowerCategoryHtml('BARRACKS', 'BARRACKS_1');
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

    const newSidebar = this.contentEl.querySelector('.codex-sidebar-nav');
    if (newSidebar && prevSidebarScroll > 0) {
      newSidebar.scrollTop = prevSidebarScroll;
    }

    // Bind subnav buttons
    this.contentEl.querySelectorAll('[data-building-sub]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const sub = (e.currentTarget as HTMLElement).getAttribute('data-building-sub');
        if (sub) {
          this.currentBuildingSubTab = sub;
          if (['BARRACKS', 'ARCHER', 'MAGE', 'ARTILLERY'].includes(sub)) {
            this.buildingsCodex.selectedTierKey = `${sub}_1`;
          }
          this.renderBuildingsCategory();
        }
      });
    });

    // Bind inner listeners if on tower
    if (['BARRACKS', 'ARCHER', 'MAGE', 'ARTILLERY'].includes(this.currentBuildingSubTab)) {
      this.buildingsCodex.bindTowerEventListeners(this.currentBuildingSubTab as TowerType);
    }
  }
}
