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
  public barracksStance: 'MELEE' | 'RANGED' = 'MELEE';

  constructor(private onNavigateToSoldiers: () => void) {}

  public getTowerCategoryHtml(type: TowerType, selectedKey?: string): string {
    const metaMap: Record<
      TowerType,
      { title: string; icon: string; badge: string; role: string; mechanics: string; tip: string }
    > = {
      BARRACKS: {
        title: 'Trại Dân Quân (Barracks)',
        icon: '🛡️',
        badge: 'Cận Chiến Chặn Quái & Bắn Tên Đa Miền',
        role: 'Triệu hồi 3 đến 5 chiến binh người que tinh nhuệ. Trại lính không trực tiếp tấn công, binh lính được điều động ra chốt chặn đường hoặc bắn cung.',
        mechanics:
          'Trại lính không trực tiếp tấn công. Lính Đánh Gần có máu và DPS cao, chốt chặn quái đi bộ 1v1. Lính Bắn Tên đứng tại điểm tập kết bắn cung tầm xa tấn công được cả Đi bộ, Dưới nước và Trên không. Cả 2 đều dùng sát thương hỗn hợp Vật lý + Nguyên tố tự chọn!',
        tip: '💡 Bấm vào tháp trong trận để đổi qua lại giữa Lính Đánh Gần và Lính Bắn Tên bất kỳ lúc nào hoàn toàn MIỄN PHÍ!'
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
      DRAGON_NEST: {
        title: 'Tổ Rồng (Dragon Nest)',
        icon: '🐉',
        badge: 'Rồng Hỏa Long • Sát Thương AoE • Chặn Quái Bay',
        role: 'Triệu hồi 1 con rồng uy mãnh chốt chặn chiến trường. Tổ rồng không trực tiếp tấn công, chỉ có Rồng xuất trận chiến đấu. Nâng cấp tăng mạnh sát thương, máu và tầm nổ lan mà không tăng số lượng rồng.',
        mechanics:
          'Tổ rồng không trực tiếp tấn công. Rồng sở hữu sẵn nguyên tố RỒNG (DRAGON) và được chọn thêm 1 nguyên tố thứ 2 (+60% sát thương). Rồng bay lượn trên không nên có thể chặn đứng và không chiến với cả quái Bay (FLY) lẫn quái Đi bộ.',
        tip: '💡 Rồng gây sát thương nổ lan AoE (70% sát thương) lên mọi quái vật xung quanh mục tiêu bị cắn/khè lửa!'
      },
      FAIRY_TREE: {
        title: 'Cây Tiên (Fairy Tree)',
        icon: '🧚',
        badge: 'Bầy Tiên Tinh Linh • Chặn Quái Bay • Số Lượng Tăng Theo Cấp',
        role: 'Cổ thụ thần thoại triệu hồi các tiên nhỏ bay lượn bảo vệ lãnh địa. Cây tiên không trực tiếp tấn công, chỉ bầy tiên tham chiến. Càng nâng cấp tháp thì số lượng tiên xuất trận càng đông (2 ➔ 3 ➔ 4 ➔ 5 tiên).',
        mechanics:
          'Cây tiên không trực tiếp tấn công. Bầy tiên sở hữu sẵn nguyên tố TIÊN (FAIRY) và được chọn thêm 1 nguyên tố thứ 2 (+60% sát thương). Có khả năng bay trên không để chốt chặn và tấn công quái Bay (FLY) cũng như quái mặt đất.',
        tip: '💡 Tiên tấn công phép thuật tầm xa và phân tán chặn đánh nhiều kẻ địch cùng lúc trên không và mặt đất.'
      },
      HEROIC_ALTAR: {
        title: 'Tế Đàn Anh Linh (Heroic Altar)',
        icon: '🏛️',
        badge: 'Hồi Sinh Linh Hồn • Hệ Ma Cố Định • Quần Thể Bất Tử',
        role: 'Tế đàn cổ đại thu thập linh hồn các đơn vị đồng minh ngã xuống trong phạm vi (Binh lính, Rồng, Tiên) và tái sinh họ dưới dạng Anh Linh bóng ma. Tế đàn không trực tiếp tấn công, các Anh Linh hồi sinh sẽ tham chiến.',
        mechanics:
          'Tế đàn mang hệ MA (GHOST) cố định, không chọn thêm nguyên tố. Khi một đơn vị tử trận trong phạm vi tế đàn, có tỉ lệ được hồi sinh thành Anh Linh nhận thêm hệ MA (GHOST +50% DMG) và tăng mạnh sát thương. Cấp tháp càng cao tỉ lệ hồi sinh càng lớn và giới hạn Anh Linh tối đa càng nhiều.',
        tip: '💡 Đặt Tế Đàn gần điểm tập kết của Trại Lính, Cây Tiên hoặc Tổ Rồng để tối ưu hóa khả năng hồi sinh liên tục!'
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

    if (!selectedKey || !selectedKey.startsWith(type)) {
      this.selectedTierKey = `${type}_1`;
    } else {
      this.selectedTierKey = selectedKey;
    }
    const selectedBp = TOWER_BLUEPRINTS[this.selectedTierKey] || bp1;

    const isSummonTower = type === 'BARRACKS' || type === 'DRAGON_NEST' || type === 'FAIRY_TREE' || type === 'HEROIC_ALTAR';

    return `
      <div class="codex-two-col">
        <!-- CỘT TRÁI: VAI TRÒ, CÂY NÂNG CẤP & HỒ SƠ ĐƠN VỊ -->
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
                  <button id="btn-goto-soldiers-guide" class="codex-tab" style="padding: 4px 12px; font-size: 13px; border-color: #10b981; color: #34d399;">Xem Bảng Lính ➔</button>
                </div>
                <p class="sp-desc" style="margin-bottom: 6px;">
                  Người chơi có thể chuyển đổi linh hoạt giữa <b>Lính Đánh Gần</b> (Máu dày, giáp cao, chốt chặn quái đi bộ 1v1) và <b>Lính Bắn Tên</b> (Tầm bắn xa 147-183px, bắn được <b>CẢ 3 LOẠI: Đi Bộ, Trên Không & Dưới Nước</b>).
                </p>
                <span class="sp-tip-text">💡 Thao tác: Bấm vào Nhà Lính trong trận ➔ Chọn [⚔️ Cận Chiến] hoặc [🏹 Bắn Tên] - Hoàn toàn MIỄN PHÍ!</span>
              </div>
            `
              : ''
          }

          ${
            isSummonTower
              ? `
              <!-- Hồ sơ đơn vị triệu hồi -->
              <div class="sp-section sp-card" style="border-left: 4px solid #a855f7;">
                <h4 class="sp-sec-title" style="color: #c084fc;">🎖️ HỒ SƠ ĐƠN VỊ ĐƯỢC TRIỆU HỒI</h4>
                <div class="unit-traits-list">
                  ${this.renderSummonTraitsHtml(type, selectedBp)}
                </div>
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

            ${
              type === 'BARRACKS'
                ? `
              <div class="stance-toggle-box" style="margin-bottom: 10px;">
                <span style="font-size: 11px; font-weight: 700; color: #94a3b8;">XEM CHỈ SỐ THEO VŨ KHÍ:</span>
                <div class="stance-btns-group">
                  <button class="stance-btn ${this.barracksStance === 'MELEE' ? 'active' : ''}" data-stance="MELEE">⚔️ Cận Chiến (100% HP & Giáp)</button>
                  <button class="stance-btn ${this.barracksStance === 'RANGED' ? 'active' : ''}" data-stance="RANGED">🏹 Bắn Tên (3 Địa Hình)</button>
                </div>
              </div>
            `
                : ''
            }

            <div class="dt-stats-grid">
              <div class="stat-box">
                <span class="s-label">${isSummonTower ? 'Sát thương đơn vị' : 'Sát thương gốc'}</span>
                <span class="s-val">${type === 'BARRACKS' && this.barracksStance === 'RANGED' ? Math.round(selectedBp.damage * 0.7) : selectedBp.damage} ${type === 'MAGE' ? '🔮' : '⚔️'}</span>
              </div>
              <div class="stat-box">
                <span class="s-label">${isSummonTower ? 'Tầm điều động (Rally)' : 'Tầm bắn'}</span>
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
                <span class="s-val">${type === 'BARRACKS' && this.barracksStance === 'MELEE' ? 'Chỉ Đi Bộ (WALK)' : selectedBp.targetingFilter.allowedMovement.join(', ')}</span>
              </div>
              <div class="stat-box">
                <span class="s-label">${isSummonTower ? 'Tổng DPS Toàn Đội' : 'DPS Cơ Bản'}</span>
                <span class="s-val highlight-dps">${Math.round((type === 'BARRACKS' && this.barracksStance === 'RANGED' ? Math.round(selectedBp.damage * 0.7) : selectedBp.damage) * selectedBp.fireRate * (selectedBp.maxSoldiers || 1))} DPS</span>
              </div>
              ${
                selectedBp.maxSoldiers
                  ? `
                  <div class="stat-box">
                    <span class="s-label">Số lượng đơn vị</span>
                    <span class="s-val" style="color: #38bdf8;">${selectedBp.maxSoldiers} Đơn vị</span>
                  </div>
                  <div class="stat-box">
                    <span class="s-label">Máu mỗi đơn vị</span>
                    <span class="s-val">${type === 'BARRACKS' && this.barracksStance === 'RANGED' ? Math.round((selectedBp.soldierHp || 100) * 0.65) : selectedBp.soldierHp} ❤️</span>
                  </div>
                  <div class="stat-box">
                    <span class="s-label">Giáp đơn vị</span>
                    <span class="s-val">${Math.round((type === 'BARRACKS' && this.barracksStance === 'RANGED' ? (selectedBp.soldierArmor || 0) * 0.5 : (selectedBp.soldierArmor || 0)) * 100)}% 🛡️</span>
                  </div>
                `
                  : ''
              }
              ${
                selectedBp.soldierRespawn
                  ? `
                  <div class="stat-box">
                    <span class="s-label">Thời gian hồi sinh</span>
                    <span class="s-val" style="color: #a855f7;">${selectedBp.soldierRespawn}s ⏳</span>
                  </div>
                `
                  : ''
              }
              ${
                selectedBp.resurrectChance
                  ? `
                  <div class="stat-box">
                    <span class="s-label">Tỉ lệ chiêu hồn</span>
                    <span class="s-val" style="color: #a855f7;">${Math.round(selectedBp.resurrectChance * 100)}% 👻</span>
                  </div>
                `
                  : ''
              }
              ${
                selectedBp.aoeRadius
                  ? `
                  <div class="stat-box">
                    <span class="s-label">Bán kính nổ AOE</span>
                    <span class="s-val" style="color: #f97316;">${selectedBp.aoeRadius} px 💥</span>
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
              <span class="sp-hint">${type === 'MAGE' ? 'Khe 2: +100% Sát thương Phép (Tỷ lệ 1:1)' : type === 'DRAGON_NEST' || type === 'FAIRY_TREE' ? 'Gắn Nguyên tố: +60% Sát thương Phép' : type === 'HEROIC_ALTAR' ? '👻 Hệ Ma Cố Định (+50% DMG Ma)' : 'Gắn Nguyên tố: +45% Sát thương Phép'}</span>
            </div>
            <div class="table-responsive">
              <table class="stats-table">
                <thead>
                  <tr>
                    <th>Cấp Độ</th>
                    <th>Tên Tháp</th>
                    <th>Giá</th>
                    ${isSummonTower ? '<th>Số Lượng</th>' : ''}
                    <th>${isSummonTower ? 'DMG Gốc + Phép' : 'DMG Gốc'}</th>
                    ${!isSummonTower ? '<th>DMG + Nguyên Tố</th>' : ''}
                    ${isSummonTower ? '<th>Máu / Lính</th>' : ''}
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

  private renderSummonTraitsHtml(type: TowerType, bp: TowerBlueprint): string {
    if (type === 'BARRACKS') {
      return `
        <div class="trait-item">
          <b>⚔️ Lính Cận Chiến:</b> Máu dày (100 ❤️ - 480 ❤️), giáp vật lý cao (10% - 65%), chốt chặn quái Đi Bộ 1v1. Nhánh 4-A tự hồi phục +15 HP/s; Nhánh 4-B bùng nổ sát thương.
        </div>
        <div class="trait-item">
          <b>🏹 Lính Bắn Tên:</b> Tầm bắn xa (147px - 183px), <b>tấn công được CẢ 3 ĐỊA HÌNH: Đi Bộ, Trên Không & Dưới Nước</b>.
        </div>
      `;
    }
    if (type === 'DRAGON_NEST') {
      return `
        <div class="trait-item">
          <b>🐉 1 Hỏa Long Duy Nhất:</b> Nâng cấp không tăng số lượng mà tăng mạnh Máu (220 ➔ 850 ❤️) và Sát thương (30 ➔ 150 DMG).
        </div>
        <div class="trait-item">
          <b>🦅 Chốt Chặn Quái Bay:</b> Bay lượn trên không chốt chặn cả quái Bay (FLY) và Đi Bộ (WALK).
        </div>
        <div class="trait-item">
          <b>💥 Sát Thương Nổ Lan AoE:</b> Đòn cắn/khè lửa nổ lan 70% sát thương trong bán kính ${bp.aoeRadius || 55}px. Đánh được cả quái Bơi (SWIM)!
        </div>
      `;
    }
    if (type === 'FAIRY_TREE') {
      return `
        <div class="trait-item">
          <b>🧚 Bầy Tiên Tăng Theo Cấp (2 ➔ 5):</b> Cấp 1 (2 tiên), Cấp 2 (3 tiên), Cấp 3 (4 tiên), Cấp 4 (5 tiên).
        </div>
        <div class="trait-item">
          <b>🦅 Chốt Chặn Quái Bay:</b> Bay lượn trên không chốt chặn quái Bay & Đi Bộ, đồng thời bắn phép tầm xa diệt quái Bơi lội (SWIM).
        </div>
      `;
    }
    if (type === 'HEROIC_ALTAR') {
      return `
        <div class="trait-item">
          <b>👻 Hồi Sinh Bất Tử:</b> Khi Lính/Rồng/Tiên tử trận trong tầm ${bp.range}px, có ${Math.round((bp.resurrectChance || 0.3) * 100)}% tỉ lệ hồi sinh thành Anh Linh (tối đa ${bp.maxSoldiers || 2}).
        </div>
        <div class="trait-item">
          <b>🔮 Ban Thêm Hệ Ma:</b> Kế thừa nguyên tố gốc và nhận thêm <b>Hệ Ma (+50% DMG Ma)</b>! Nhánh 4-B nổ Hồn Ma AoE 65px khi xuất hiện.
        </div>
      `;
    }
    return '';
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

    // Stance toggle buttons for Barracks
    detailPane.querySelectorAll('[data-stance]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const stance = (e.currentTarget as HTMLElement).getAttribute('data-stance') as 'MELEE' | 'RANGED';
        if (stance) {
          this.barracksStance = stance;
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
    const isSummon = type === 'BARRACKS' || type === 'DRAGON_NEST' || type === 'FAIRY_TREE' || type === 'HEROIC_ALTAR';

    let elemBonusRatio = 0.45;
    if (isMage) elemBonusRatio = 1.0;
    else if (type === 'DRAGON_NEST' || type === 'FAIRY_TREE') elemBonusRatio = 0.6;
    else if (type === 'HEROIC_ALTAR') elemBonusRatio = 0.5;

    const bonusDmg = Math.round(baseDamage * elemBonusRatio);
    const totalDmg = baseDamage + bonusDmg;
    const maxSoldiers = bp.maxSoldiers || (type === 'HEROIC_ALTAR' ? 2 : 1);
    const totalDps = Math.round(totalDmg * bp.fireRate * (isSummon ? maxSoldiers : 1));

    if (isSummon) {
      const hp = bp.soldierHp || 100;
      return `
        <tr class="${customClass} ${isCurrent ? 'selected-row' : ''}">
          <td><b>${tierLabel}</b></td>
          <td>${bp.name}</td>
          <td style="color: #facc15">🪙 ${bp.cost}</td>
          <td style="color: #38bdf8; font-weight: 700;">${maxSoldiers}</td>
          <td style="color: #38bdf8; font-weight: 700;">
            ${baseDamage} + <span style="color: #a855f7;">${bonusDmg}</span> = ${totalDmg}
          </td>
          <td>${hp} ❤️</td>
          <td>${bp.range} px</td>
          <td>${bp.fireRate}/s</td>
          <td class="table-dps-val">${totalDps} DPS</td>
        </tr>
      `;
    }

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
    if (type === 'HEROIC_ALTAR') {
      return `
        <div class="sp-section sp-card" style="border-left: 4px solid #818cf8; background: linear-gradient(90deg, #1e1b4b 0%, #0f172a 100%);">
          <h4 class="sp-sec-title" style="color: #a5b4fc;">👻 THUỘC TÍNH NGUYÊN TỐ CỦA TẾ ĐÀN ANH LINH</h4>
          <p class="sp-desc" style="color: #cbd5e1; margin-bottom: 6px;">
            Tế Đàn Anh Linh sở hữu thuộc tính <b>👻 Hệ Ma (GHOST) cố định</b> và <b>không chọn thêm nguyên tố</b>.
          </p>
          <span class="sp-tip-text">
            💡 Khi chiến binh ngã xuống, Anh Linh hồi sinh sẽ giữ nguyên các nguyên tố gốc của đơn vị đó và được ban thêm <b>Hệ Ma (+50% sát thương Ma)</b>!
          </span>
        </div>
      `;
    }

    const isMage = type === 'MAGE';
    const elemColor = ELEMENT_COLORS[this.previewElement] || '#ffffff';
    const elemIcon = ELEMENT_ICONS[this.previewElement] || '✨';
    const elemName = ELEMENT_NAMES[this.previewElement] || this.previewElement;

    const baseDmg = bp.damage;
    const bonusRatio = isMage ? 1.0 : (type === 'DRAGON_NEST' || type === 'FAIRY_TREE' ? 0.6 : 0.45);
    const bonusDmg = isMage ? baseDmg * 1.0 : Math.round(baseDmg * bonusRatio);

    const mageSecColor = ELEMENT_COLORS[this.mageSecondaryElement] || '#ffffff';
    const mageSecIcon = ELEMENT_ICONS[this.mageSecondaryElement] || '✨';
    const mageSecName = ELEMENT_NAMES[this.mageSecondaryElement] || this.mageSecondaryElement;
    const mageSecDmg = baseDmg * 1.0;

    const totalDmg = isMage ? baseDmg + mageSecDmg : baseDmg + bonusDmg;
    const maxSoldiers = bp.maxSoldiers || 1;
    const totalDps = Math.round(totalDmg * bp.fireRate * (bp.maxSoldiers ? maxSoldiers : 1));

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
            ${isMage ? '🔮 Khe Nguyên Tố 1 (Tỷ lệ 100% Sát thương Phép):' : type === 'DRAGON_NEST' ? '🔥 Chọn Nguyên Tố Thứ 2 Cho Rồng (+60% Sát thương Phép):' : type === 'FAIRY_TREE' ? '✨ Chọn Nguyên Tố Thứ 2 Cho Tiên (+60% Sát thương Phép):' : '⚡ Chọn 1 Nguyên Tố Để Gắn (+45% Sát Thương Phép):'}
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
              <b style="color: #cbd5e1">${baseDmg} Sát Thương ${isMage ? 'Phép 1' : type === 'DRAGON_NEST' ? 'Hệ Rồng' : type === 'FAIRY_TREE' ? 'Hệ Tiên' : 'Vật Lý'}</b>
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
      case 'DRAGON_NEST':
        return {
          name: `Hơi Thở Rồng Hòa Quyện Hệ ${ELEMENT_NAMES[elem]}`,
          desc: `Rồng gây sát thương AoE nổ lan mang song hệ [RỒNG + ${ELEMENT_NAMES[elem]}]. Tấn công mục tiêu ở cả 3 loại đường (Đi Bộ, Bay, Bơi), nhưng chỉ chặn quái Đi Bộ và Bay.`,
          synergy: `🐉 Bay lượn tấn công cả 3 đường (Bộ, Bay, Bơi) và chặn quái Bay/Đi Bộ!`
        };
      case 'FAIRY_TREE':
        return {
          name: `Phép Thuật Tinh Linh Hệ ${ELEMENT_NAMES[elem]}`,
          desc: `Mỗi tinh linh tiên bắn đạn phép tầm xa mang song hệ [TIÊN + ${ELEMENT_NAMES[elem]}]. Tấn công mục tiêu ở cả 3 loại đường (Đi Bộ, Bay, Bơi), nhưng chỉ chặn quái Đi Bộ và Bay.`,
          synergy: `🧚 Tấn công linh hoạt cả 3 đường (Bộ, Bay, Bơi) và chặn quái Bay/Đi Bộ!`
        };
      case 'HEROIC_ALTAR':
        return {
          name: `Uy Lực Anh Linh Hệ ${ELEMENT_NAMES[elem]}`,
          desc: `Tế đàn hồi sinh các chiến binh đã hy sinh thành Anh Linh nhận thêm hệ MA và khuếch đại sát thương.`,
          synergy: `🏛️ Tái sinh liên tục binh lính, rồng và tiên để tạo bức tường phòng thủ bất tử!`
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
