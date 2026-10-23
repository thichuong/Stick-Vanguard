import { TOWER_BLUEPRINTS, TowerBlueprint } from '../../config/towers.config.js';
import {
  ELEMENT_COLORS,
  ELEMENT_ICONS,
  ELEMENT_NAMES,
  SELECTABLE_ELEMENTS
} from '../../config/elements.config.js';
import { ElementType } from '../../types/elements.types.js';
import { TowerType } from '../../types/entities.types.js';

export class CodexBuildings {
  public selectedTierKey: string = 'BARRACKS_1';
  public previewElement: ElementType = 'FIRE';
  public mageSecondaryElement: ElementType = 'LIGHTNING';

  constructor(private onNavigateToSoldiers: () => void) {}

  public getTowerCategoryHtml(type: TowerType, selectedKey?: string): string {
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

  public bindTowerEventListeners(type: TowerType): void {
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
        this.onNavigateToSoldiers();
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
}

