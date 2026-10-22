import { TOWER_BLUEPRINTS, TowerBlueprint } from '../config/towers.config.js';
import {
  ELEMENT_COLORS,
  ELEMENT_ICONS
} from '../config/elements.config.js';
import { ElementType } from '../types/elements.types.js';
import { TowerType } from '../types/entities.types.js';

export class SideDetailPanel {
  private panelEl: HTMLElement;
  private contentEl: HTMLElement;
  private titleEl: HTMLElement;
  private badgeEl: HTMLElement;
  private iconEl: HTMLElement;
  private currentCategory: string = 'BARRACKS';
  private selectedTierKey: string = 'BARRACKS_1';

  constructor() {
    this.panelEl = document.getElementById('side-detail-panel')!;
    this.contentEl = document.getElementById('side-panel-body')!;
    this.titleEl = document.getElementById('side-panel-title')!;
    this.badgeEl = document.getElementById('side-panel-badge')!;
    this.iconEl = document.getElementById('side-panel-icon')!;

    this.bindEvents();
  }

  private bindEvents(): void {
    // Close button
    const closeBtn = document.getElementById('btn-close-side-panel');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Category Tabs
    const tabBtns = this.panelEl.querySelectorAll('.sp-tab');
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
    return !this.panelEl.classList.contains('hidden');
  }

  public open(category: string = 'BARRACKS', targetSubId?: string): void {
    this.currentCategory = category;
    this.panelEl.classList.remove('hidden');

    // Update active tab visual
    const tabBtns = this.panelEl.querySelectorAll('.sp-tab');
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
    this.panelEl.classList.add('hidden');
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
      case 'TRAPS':
        this.renderTrapsCategory(targetSubId);
        break;
      case 'ELEMENTS':
        this.renderElementsCategory(targetSubId);
        break;
      case 'NAVIGATION':
        this.renderNavigationCategory(targetSubId);
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
        badge: 'Thuần Ma Pháp & Song Nguyên Tố',
        role: 'Tháp ma thuật huyền bí gây 100% sát thương nguyên tố, sở hữu 2 khe nguyên tố độc lập.',
        mechanics:
          'Bỏ qua giáp vật lý của mục tiêu. Người chơi có thể tự do phối hợp 2 hệ nguyên tố bất kỳ (ví dụ: Nước + Sét, Lửa + Bóng Tối) để tạo chuỗi phản ứng nguyên tố hủy diệt.',
        tip: '💡 Khi trang bị 2 nguyên tố, đòn đánh gây cả 2 loại sát thương và áp dụng đồng thời cả 2 hiệu ứng trạng thái lên mục tiêu!'
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
      <!-- Role and Mechanics Explanation -->
      <div class="sp-section sp-card">
        <h4 class="sp-sec-title">📖 VAI TRÒ & CƠ CHẾ HOẠT ĐỘNG</h4>
        <p class="sp-desc">${meta.role}</p>
        <div class="sp-mechanic-box">
          <p><b>⚙️ Cơ chế:</b> ${meta.mechanics}</p>
          <p class="sp-tip-text">${meta.tip}</p>
        </div>
      </div>

      <!-- Interactive Upgrade Tree Diagram -->
      <div class="sp-section">
        <div class="sp-sec-header">
          <h4 class="sp-sec-title">🌳 CÂY NÂNG CẤP CHI TIẾT (UPGRADE TREE)</h4>
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
            ${this.renderTreeNode(bp4A, 'CẤP 4 - NHÁNH A', `${type}_4_A`, true)}
            ${this.renderTreeNode(bp4B, 'CẤP 4 - NHÁNH B', `${type}_4_B`, true)}
          </div>
        </div>
      </div>

      <!-- Selected Tier Detail Card -->
      <div class="sp-section sp-card highlighted-detail-card">
        <div class="dt-header">
          <span class="dt-tier-badge">CHI TIẾT: ${selectedBp.name}</span>
          <span class="dt-cost">🪙 ${selectedBp.cost} Vàng</span>
        </div>
        <p class="dt-desc">${selectedBp.description}</p>

        <div class="dt-stats-grid">
          <div class="stat-box">
            <span class="s-label">Sát thương</span>
            <span class="s-val">${selectedBp.damage}</span>
          </div>
          <div class="stat-box">
            <span class="s-label">Tầm bắn</span>
            <span class="s-val">${selectedBp.range} px</span>
          </div>
          <div class="stat-box">
            <span class="s-label">Tốc độ</span>
            <span class="s-val">${selectedBp.fireRate}/s</span>
          </div>
          <div class="stat-box">
            <span class="s-label">Nguyên tố</span>
            <span class="s-val" style="color: ${ELEMENT_COLORS[selectedBp.element]}">
              ${ELEMENT_ICONS[selectedBp.element]} ${selectedBp.element}
            </span>
          </div>
          <div class="stat-box">
            <span class="s-label">Mục tiêu</span>
            <span class="s-val">${selectedBp.targetingFilter.allowedMovement.join(', ')}</span>
          </div>
          <div class="stat-box">
            <span class="s-label">Sát thương/giây (DPS)</span>
            <span class="s-val highlight-dps">${Math.round(selectedBp.damage * selectedBp.fireRate)}</span>
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

      <!-- Full Comparison Table -->
      <div class="sp-section">
        <h4 class="sp-sec-title">📊 BẢNG SO SÁNH CHỈ SỐ CẢ 4 CẤP</h4>
        <div class="table-responsive">
          <table class="stats-table">
            <thead>
              <tr>
                <th>Cấp Độ</th>
                <th>Tên Tháp</th>
                <th>Giá</th>
                <th>DMG</th>
                <th>Tầm</th>
                <th>Tốc</th>
                <th>Hệ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Cấp 1</td>
                <td><b>${bp1.name}</b></td>
                <td class="gold-col">🪙 ${bp1.cost}</td>
                <td>${bp1.damage}</td>
                <td>${bp1.range}</td>
                <td>${bp1.fireRate}</td>
                <td>${ELEMENT_ICONS[bp1.element]}</td>
              </tr>
              <tr>
                <td>Cấp 2</td>
                <td><b>${bp2.name}</b></td>
                <td class="gold-col">🪙 ${bp2.cost}</td>
                <td>${bp2.damage}</td>
                <td>${bp2.range}</td>
                <td>${bp2.fireRate}</td>
                <td>${ELEMENT_ICONS[bp2.element]}</td>
              </tr>
              <tr>
                <td>Cấp 3</td>
                <td><b>${bp3.name}</b></td>
                <td class="gold-col">🪙 ${bp3.cost}</td>
                <td>${bp3.damage}</td>
                <td>${bp3.range}</td>
                <td>${bp3.fireRate}</td>
                <td>${ELEMENT_ICONS[bp3.element]}</td>
              </tr>
              <tr class="branch-row-a">
                <td>4-A 🌟</td>
                <td><b>${bp4A.name}</b></td>
                <td class="gold-col">🪙 ${bp4A.cost}</td>
                <td class="highlight-val">${bp4A.damage}</td>
                <td>${bp4A.range}</td>
                <td>${bp4A.fireRate}</td>
                <td>${ELEMENT_ICONS[bp4A.element]}</td>
              </tr>
              <tr class="branch-row-b">
                <td>4-B 🌟</td>
                <td><b>${bp4B.name}</b></td>
                <td class="gold-col">🪙 ${bp4B.cost}</td>
                <td class="highlight-val">${bp4B.damage}</td>
                <td>${bp4B.range}</td>
                <td>${bp4B.fireRate}</td>
                <td>${ELEMENT_ICONS[bp4B.element]}</td>
              </tr>
            </tbody>
          </table>
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
  // 2. TRAPS CATEGORY
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

    const cardsHtml = traps
      .map((trap) => {
        const icon = ELEMENT_ICONS[trap.element] || '⚙️';
        const color = ELEMENT_COLORS[trap.element] || '#ffffff';
        const isWaterOnly = trap.placement === 'WATER_TRAP';
        const isHighlighted = targetSubId && (trap.type === targetSubId || trap.name.includes(targetSubId));

        return `
        <div class="trap-detail-card sp-card ${isHighlighted ? 'highlighted-elem' : ''}">
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
            <span>Sát thương: <b>${trap.damage}</b></span>
            <span>Số lần nổ: <b>${trap.maxTrapCharges || 1} lần</b></span>
            <span>Nguyên tố: <b style="color: ${color}">${trap.element}</b></span>
            <span>Hồi phục: <b>Mỗi đợt quái</b></span>
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
        <h4 class="sp-sec-title">⚙️ DANH SÁCH 4 LOẠI BẪY</h4>
        <div class="traps-list">${cardsHtml}</div>
      </div>
    `;
  }

  // ==========================================
  // 3. ELEMENTAL MATRIX CATEGORY
  // ==========================================
  private renderElementsCategory(highlightElem?: string): void {
    this.titleEl.textContent = 'Hệ Thống Nguyên Tố & Tương Khắc';
    this.iconEl.textContent = '✨';
    this.badgeEl.textContent = 'Ma Trận Tương Khắc 9 Hệ';

    const elementsList: ElementType[] = [
      'PHYSICAL',
      'FIRE',
      'WATER',
      'EARTH',
      'WIND',
      'LIGHTNING',
      'ICE',
      'LIGHT',
      'DARK'
    ];

    const elementExplanations: Record<
      ElementType,
      { nameVi: string; strongAgainst: string; weakAgainst: string; desc: string; sample: string }
    > = {
      PHYSICAL: {
        nameVi: 'Vật Lý',
        strongAgainst: 'Gây sát thương ổn định lên đa số quái vật.',
        weakAgainst: 'Bị giảm 30% sát thương lên quái Đất (EARTH); hoàn toàn bất lực trước Khổng Lồ Đá.',
        desc: 'Sát thương cơ bản từ kiếm, khiên, cung nỏ và đá cối thô sơ.',
        sample: 'Chiến Binh, Chòi Cung, Pháo Cối'
      },
      FIRE: {
        nameVi: 'Lửa (Hỏa)',
        strongAgainst: 'Khắc chế Băng (ICE) x1.75 và Gió (WIND) x1.3; gây sát thương thiêu đốt theo thời gian (DoT).',
        weakAgainst: 'Bị Nước (WATER) giảm còn 0.5x, Lửa 0.3x; Quỷ Lửa (Fire Imp) miễn nhiễm 100%!',
        desc: 'Sức nóng thiêu rụi mục tiêu, gây nổ bùng phát và duy trì ngọn lửa thiêu đốt.',
        sample: 'Pháp Sư Hỏa Ngục, Đại Bác Dung Nham, Mìn Lửa'
      },
      WATER: {
        nameVi: 'Nước (Thủy)',
        strongAgainst: 'Khắc chế cực mạnh Lửa (FIRE) x2.0 và Đất (EARTH) x1.5.',
        weakAgainst: 'Bị Sét (LIGHTNING) dẫn điện gây phản tác dụng (0.5x), Nước 0.3x.',
        desc: 'Áp lực nước cuốn trôi bùn đất, dập tắt ngọn lửa thiêu rụi.',
        sample: 'Thủy Lôi Sông, Kênh Nước Phòng Ngự'
      },
      EARTH: {
        nameVi: 'Đất (Thổ)',
        strongAgainst: 'Khắc chế Sét (LIGHTNING) x1.5 và Gió (WIND) x1.25.',
        weakAgainst: 'Bị Đất 0.5x, dễ bị Nước làm mềm hóa.',
        desc: 'Trọng lượng địa chấn nghiền nát vật thể, chống chịu vật lý cao.',
        sample: 'Pháo Cối Đá, Bẫy Chông Đất'
      },
      WIND: {
        nameVi: 'Gió (Phong)',
        strongAgainst: 'Khắc chế Đất (EARTH) x1.5 và Vật Lý x1.2; đẩy lùi quái bay.',
        weakAgainst: 'Bị Lửa thiêu đốt lan tỏa.',
        desc: 'Tốc độ xé gió, xuyên thấu không trung, chuyên trị quái bay.',
        sample: 'Cung Bão Tố, Xạ Thủ Thần Phong'
      },
      LIGHTNING: {
        nameVi: 'Sét (Lôi)',
        strongAgainst: 'Khắc chế hủy diệt Nước (WATER) x2.0 và Gió (WIND) x1.5; gây tê liệt/choáng.',
        weakAgainst: 'Bị Đất (EARTH) hấp thụ (0.3x), quái Đất miễn nhiễm sét.',
        desc: 'Tốc độ truyền điện tức thì, nảy tia điện qua các mục tiêu lân cận.',
        sample: 'Chiến Binh Phong Lôi, Cọc Lưới Sét, Pháo Từ Trường'
      },
      ICE: {
        nameVi: 'Băng (Hàn)',
        strongAgainst: 'Khắc chế Nước (WATER) x1.5; làm chậm tốc độ chạy 50% và đóng băng quái.',
        weakAgainst: 'Bị Lửa làm tan chảy (0.5x), Băng 0.2x.',
        desc: 'Làm chậm bước tiến của quái vật, tạo thời gian cho các tháp khác tiêu diệt.',
        sample: 'Nỏ Hàn Băng, Thủy Lôi Băng Giá'
      },
      LIGHT: {
        nameVi: 'Ánh Sáng (Quang)',
        strongAgainst: 'Khắc chế tuyệt đối Hắc Ám (DARK) x2.0; phá hủy quỷ dữ và Hắc Long!',
        weakAgainst: 'Bị Ánh Sáng 0.3x.',
        desc: 'Hào quang thần thánh thanh tẩy bóng tối, hồi phục sinh lực đồng minh.',
        sample: 'Thánh Kỵ Sĩ Paladin, Quang Điện Tinh Cầu'
      },
      DARK: {
        nameVi: 'Hắc Ám (Ám)',
        strongAgainst: 'Khắc chế Ánh Sáng (LIGHT) x1.8; xuyên thủng mọi lớp giáp vật lý.',
        weakAgainst: 'Bị Hắc Ám 0.3x, sợ ánh sáng thần thánh.',
        desc: 'Năng lượng bóng đêm ăn mòn mục tiêu từ bên trong, bỏ qua phòng thủ.',
        sample: 'Tháp Pháp Sư, Quả Cầu Hắc Ám'
      }
    };

    const cardsHtml = elementsList
      .map((elem) => {
        const info = elementExplanations[elem];
        const color = ELEMENT_COLORS[elem];
        const icon = ELEMENT_ICONS[elem];
        const isHighlighted = highlightElem === elem;

        return `
        <div class="elem-card ${isHighlighted ? 'highlighted-elem' : ''}" style="border-left-color: ${color}">
          <div class="elem-card-top">
            <span class="elem-badge" style="background-color: ${color}20; color: ${color}; border-color: ${color}40">
              ${icon} ${info.nameVi} (${elem})
            </span>
          </div>
          <div class="elem-matchups">
            <div class="match-strong">
              <span class="m-title">⚔️ Khắc chế (Mạnh):</span>
              <span class="m-text">${info.strongAgainst}</span>
            </div>
            <div class="match-weak">
              <span class="m-title">🛡️ Bị kháng (Yếu):</span>
              <span class="m-text">${info.weakAgainst}</span>
            </div>
          </div>
          <div class="elem-sample"><b>Đại diện:</b> ${info.sample}</div>
        </div>
      `;
      })
      .join('');

    this.contentEl.innerHTML = `
      <div class="sp-section sp-card">
        <h4 class="sp-sec-title">⚖️ QUY TẮC MA TRẬN NGUYÊN TỐ CỐT LÕI</h4>
        <div class="rule-box weakness-rule">
          <span class="r-icon">💥</span>
          <div>
            <b>Ưu thế Tương Khắc (x1.5 -> x2.0 Sát thương):</b>
            <p>Khi dùng nguyên tố khắc chế đánh vào quái mang hệ yếu điểm (như Nước đánh Lửa, Lửa đánh Băng, Ánh Sáng đánh Bóng Tối), sát thương tăng vọt x2.0!</p>
          </div>
        </div>
        <div class="rule-box resist-rule">
          <span class="r-icon">🛡️</span>
          <div>
            <b>Bị Kháng Cự (x0.3 -> x0.5 Sát thương):</b>
            <p>Đánh cùng hệ hoặc hệ bị kháng khiến sát thương bị giảm tới 70%.</p>
          </div>
        </div>
        <div class="rule-box immune-rule">
          <span class="r-icon">🚫</span>
          <div>
            <b>Miễn Nhiễm Tuyệt Đối (0 Sát thương):</b>
            <p>Quái vật mang bản thể nguyên tố thuần khiết (Ví dụ: Yêu tinh Lửa miễn nhiễm Lửa; Khổng lồ đá miễn nhiễm Vật lý & Sét). Cần đổi tháp hoặc bẫy khắc chế!</p>
          </div>
        </div>
      </div>

      <div class="sp-section">
        <h4 class="sp-sec-title">✨ CHI TIẾT 9 HỆ NGUYÊN TỐ</h4>
        <div class="elements-grid">${cardsHtml}</div>
      </div>
    `;
  }

  // ==========================================
  // 4. NAVIGATION MODES CATEGORY
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

      <div class="nav-cards-list">
        <!-- 1. Ground Path -->
        <div class="nav-card ${highlightNav === 'WALK' ? 'highlighted-elem' : ''}">
          <div class="nav-card-header">
            <span class="nav-icon">🚶</span>
            <div>
              <h4>1. Đường Bộ (Ground Path)</h4>
              <span class="nav-tag">Đường mòn đất uốn lượn</span>
            </div>
          </div>
          <p class="nav-desc">Tuyến đường chính của quái vật bộ binh, kiếm sĩ, dân quân và trùm khổng lồ.</p>
          <ul class="nav-rules-list">
            <li>✅ <b>Bị chặn bởi lính Nhà Lính:</b> Lính bộ binh sẽ đứng nghênh chiến và kìm chân quái bộ lại.</li>
            <li>✅ <b>Dẫm bẫy:</b> Dễ dàng dẫm phải Bẫy Chông, Mìn Lửa trên đường.</li>
            <li>✅ <b>Mục tiêu của mọi loại tháp:</b> Cung, Phép, Pháo cối và Lính đều đánh được.</li>
          </ul>
        </div>

        <!-- 2. Air Path -->
        <div class="nav-card ${highlightNav === 'FLY' ? 'highlighted-elem' : ''}">
          <div class="nav-card-header">
            <span class="nav-icon">✈️</span>
            <div>
              <h4>2. Đường Bay Trên Không (Air Path)</h4>
              <span class="nav-tag air-tag">Đường chéo ngắn nhất thẳng về căn cứ</span>
            </div>
          </div>
          <p class="nav-desc">Dơi Quỷ, Rồng Lửa và Khí cầu bay lượn trên không trung với tốc độ cao.</p>
          <ul class="nav-rules-list">
            <li>🚫 <b>BỎ QUA HOÀN TOÀN LÍNH CHẶN:</b> Lính Nhà Lính thông thường không với tới quái bay!</li>
            <li>🚫 <b>BỎ QUA BẪY ĐẤT:</b> Bay lơ lửng nên không bao giờ kích hoạt bẫy chông/mìn dưới đất.</li>
            <li>🚫 <b>PHÁO CỐI KHÔNG BẮN ĐƯỢC:</b> Pháo cối mặt đất không thể nhắm mục tiêu bay.</li>
            <li>🎯 <b>VŨ KHÍ ĐỐI PHÓ:</b> Bắt buộc phải xây <b>Tháp Cung</b>, <b>Tháp Phép</b> hoặc nâng cấp Nhà Lính lên <b>Cấp 4B (Chiến Binh Phong Lôi)</b> để phóng lao sét!</li>
          </ul>
        </div>

        <!-- 3. Water Path -->
        <div class="nav-card ${highlightNav === 'SWIM' ? 'highlighted-elem' : ''}">
          <div class="nav-card-header">
            <span class="nav-icon">🏊</span>
            <div>
              <h4>3. Tuyến Thủy / Kênh Sông (Water Path)</h4>
              <span class="nav-tag water-tag">Dòng sông xanh uốn khúc</span>
            </div>
          </div>
          <p class="nav-desc">Thủy quái, cá dữ và người que biết bơi tiến công men theo lòng sông.</p>
          <ul class="nav-rules-list">
            <li>🚫 <b>Lính bộ không xuống nước:</b> Không thể đặt điểm tập kết dưới lòng sông sâu.</li>
            <li>✅ <b>Bẫy Thủy Lôi:</b> Chỉ có ô bẫy nước (WATER_TRAP) đặt Thủy Lôi Băng mới phát nổ dưới lòng sông.</li>
            <li>🎯 <b>VŨ KHÍ ĐỐI PHÓ:</b> Dùng <b>Tháp Cung</b>, <b>Tháp Phép</b> hoặc <b>Pháo Cối</b> có bán kính phủ qua dòng sông.</li>
          </ul>
        </div>
      </div>
    `;
  }
}
