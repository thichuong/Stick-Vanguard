import { TOWER_BLUEPRINTS, TowerBlueprint } from '../../config/towers.config.js';
import {
  ELEMENT_COLORS,
  ELEMENT_ICONS,
  ELEMENT_NAMES,
  SELECTABLE_ELEMENTS
} from '../../config/elements.config.js';
import { UI_ICONS } from '../../config/ui/icons/index.js';
import { ElementType } from '../../types/elements.types.js';
import { TowerType } from '../../types/entities.types.js';
import { WasmBridge } from '../../core/WasmBridge.js';
import { UnitSpriteCache } from '../../render/UnitSpriteCache.js';

export type SummonCodexSubTab = 'BARRACKS' | 'DRAGON_NEST' | 'FAIRY_TREE' | 'HEROIC_ALTAR' | 'OVERVIEW';

export class CodexSoldiers {
  public currentSubTab: SummonCodexSubTab = 'BARRACKS';
  public selectedTierKey: string = 'BARRACKS_1';
  public previewElement: ElementType = 'FIRE';
  public barracksStance: 'MELEE' | 'RANGED' = 'MELEE';

  private soldierAnimFrameId: number | null = null;
  private soldierAnimStartTime: number = 0;

  constructor(public onNavigate?: (cat: string, subId?: string) => void) {}

  public getSoldiersCategoryHtml(): string {
    return this.renderUnifiedSummonHtml();
  }

  public renderUnifiedSummonHtml(): string {
    return `
      <div class="summon-codex-container">
        <!-- Sub-navigation selector bar -->
        <div class="summon-subnav-bar">
          <button class="summon-subnav-btn ${this.currentSubTab === 'BARRACKS' ? 'active' : ''}" data-summon-sub="BARRACKS">
            <span class="ssb-icon">${UI_ICONS.SHIELD}</span>
            <div class="ssb-text">
              <span class="ssb-title">Trại Dân Quân</span>
              <span class="ssb-sub">Lính Cận Chiến / Bắn Tên</span>
            </div>
          </button>

          <button class="summon-subnav-btn ${this.currentSubTab === 'DRAGON_NEST' ? 'active' : ''}" data-summon-sub="DRAGON_NEST">
            <span class="ssb-icon">${ELEMENT_ICONS.DRAGON}</span>
            <div class="ssb-text">
              <span class="ssb-title">Tổ Rồng</span>
              <span class="ssb-sub">Hỏa Long • AoE • Chặn Bay</span>
            </div>
          </button>

          <button class="summon-subnav-btn ${this.currentSubTab === 'FAIRY_TREE' ? 'active' : ''}" data-summon-sub="FAIRY_TREE">
            <span class="ssb-icon">${ELEMENT_ICONS.FAIRY}</span>
            <div class="ssb-text">
              <span class="ssb-title">Cây Tiên</span>
              <span class="ssb-sub">Bầy Tiên (2-5) • Tầm Xa</span>
            </div>
          </button>

          <button class="summon-subnav-btn ${this.currentSubTab === 'HEROIC_ALTAR' ? 'active' : ''}" data-summon-sub="HEROIC_ALTAR">
            <span class="ssb-icon">${UI_ICONS.TEMPLE}</span>
            <div class="ssb-text">
              <span class="ssb-title">Tế Đàn Anh Linh</span>
              <span class="ssb-sub">Chiêu Hồn • Hệ Ma Cố Định</span>
            </div>
          </button>

          <button class="summon-subnav-btn ${this.currentSubTab === 'OVERVIEW' ? 'active' : ''}" data-summon-sub="OVERVIEW">
            <span class="ssb-icon">${UI_ICONS.CHART}</span>
            <div class="ssb-text">
              <span class="ssb-title">Tổng Quan & So Sánh</span>
              <span class="ssb-sub">Bảng Đối Chiếu 4 Hệ</span>
            </div>
          </button>
        </div>

        <!-- Main Content Area -->
        <div class="summon-main-view">
          ${this.currentSubTab === 'OVERVIEW' ? this.renderOverviewComparisonHtml() : this.renderSingleSummonSystemHtml(this.currentSubTab)}
        </div>
      </div>
    `;
  }

  private renderSingleSummonSystemHtml(type: 'BARRACKS' | 'DRAGON_NEST' | 'FAIRY_TREE' | 'HEROIC_ALTAR'): string {
    const metaMap = {
      BARRACKS: {
        title: 'Trại Dân Quân & Đội Quân Người Que',
        badge: 'Cận Chiến Đánh Chặn & Xạ Thủ Bắn Tỉa Đa Miền',
        desc: 'Triệu tập đội hình 3 đến 5 chiến binh người que. Trại lính không trực tiếp tấn công, chỉ có binh lính xuất trận tại Điểm Tập Kết (Rally Point) để chốt chặn quái hoặc bắn tỉa.',
        unitName: 'Chiến Binh Người Que',
        unitArchetype: 'SOLDIER',
        unitDesc: `Người chơi có quyền đổi qua lại giữa <b>${UI_ICONS.SWORDS} Lính Cận Chiến</b> và <b>${UI_ICONS.BOW} Lính Bắn Tên</b> bất kỳ lúc nào hoàn toàn MIỄN PHÍ. Lính cận chiến chốt chặn 1v1 trên đường; Lính cung đứng an toàn bắn tỉa cả 3 đường (Bộ, Bay, Bơi).`
      },
      DRAGON_NEST: {
        title: 'Tổ Rồng & Thần Long Cổ Đại',
        badge: 'Hỏa Long Bay Lượn • Sát Thương AoE Nổ Lan • Chốt Chặn Quái Bay',
        desc: 'Triệu hồi 1 con rồng uy mãnh chốt chặn chiến trường. Tổ rồng không trực tiếp tấn công, rồng bay lượn trên không chốt chặn cả quái Bay và quái Đi Bộ.',
        unitName: 'Hỏa Long (Dragon)',
        unitArchetype: 'DRAGON',
        unitDesc: `Rồng sở hữu sẵn nguyên tố <b>${ELEMENT_ICONS.DRAGON} RỒNG</b> và được chọn thêm 1 nguyên tố thứ 2 (+60% sát thương). Đòn cắn và khè lửa gây <b>sát thương AoE nổ lan 70%</b> trong bán kính 55-85px lên mọi quái xung quanh!`
      },
      FAIRY_TREE: {
        title: 'Cây Tiên & Bầy Tinh Linh Rừng Xanh',
        badge: 'Bầy Tiên Tăng Theo Cấp (2 ➔ 5) • Phép Tầm Xa • Chốt Chặn Quái Bay',
        desc: 'Cổ thụ thần thoại triệu hồi các tiên nhỏ bay lượn bảo vệ lãnh địa. Càng nâng cấp tháp thì số lượng tiên xuất trận càng đông đảo (2 ➔ 3 ➔ 4 ➔ 5 nàng tiên).',
        unitName: 'Tinh Linh Tiên (Fairy)',
        unitArchetype: 'FAIRY',
        unitDesc: `Bầy tiên mang sẵn nguyên tố <b>${ELEMENT_ICONS.FAIRY} TIÊN</b> và được chọn thêm 1 nguyên tố thứ 2 (+60% sát thương). Bay lượn trên không chốt chặn quái Bay & Đi Bộ, đồng thời bắn phép tầm xa áp chế mục tiêu cả 3 địa hình!`
      },
      HEROIC_ALTAR: {
        title: 'Tế Đàn Anh Linh & Đội Quân Bóng Ma',
        badge: 'Hồi Sinh Bất Tử • Hệ Ma Cố Định • Kế Thừa Chiến Binh Đã Khuất',
        desc: 'Tế đàn cổ đại không trực tiếp tấn công, chỉ có 1 năng lực duy nhất là thu thập linh hồn các đơn vị đồng minh ngã xuống trong phạm vi (Binh lính, Rồng, Tiên) và tái sinh họ dưới dạng Anh Linh bóng ma.',
        unitName: 'Anh Linh Bóng Ma (Heroic Spirit)',
        unitArchetype: 'SPIRIT',
        unitDesc: `Anh Linh giữ nguyên 100% toàn bộ chỉ số gốc của đơn vị lính đã hy sinh (HP, Giáp, Tốc độ đánh, Tầm đánh/bắn, Khả năng chặn & tấn công đa địa hình). Đồng thời nhận thêm đòn đánh phụ hệ <b>${ELEMENT_ICONS.GHOST} MA (GHOST)</b> bằng <b>50% công kích cơ bản</b> (riêng nhánh 4-B nhận thêm <b>100% công kích cơ bản</b>).`
      }
    };

    const meta = metaMap[type];
    const bp1 = TOWER_BLUEPRINTS[`${type}_1`];
    const bp2 = TOWER_BLUEPRINTS[`${type}_2`];
    const bp3 = TOWER_BLUEPRINTS[`${type}_3`];
    const bp4A = TOWER_BLUEPRINTS[`${type}_4_A`];
    const bp4B = TOWER_BLUEPRINTS[`${type}_4_B`];

    if (!bp1) return '';

    if (!this.selectedTierKey.startsWith(type)) {
      this.selectedTierKey = `${type}_1`;
    }
    const selectedBp = TOWER_BLUEPRINTS[this.selectedTierKey] || bp1;

    // Unit calculations for selected BP
    const maxSoldiers = selectedBp.maxSoldiers || (type === 'HEROIC_ALTAR' ? 2 : 1);
    const unitHp = selectedBp.soldierHp || 100;
    const unitArmor = selectedBp.soldierArmor || 0.1;
    const unitRespawn = selectedBp.soldierRespawn || 8;
    const baseDmg = selectedBp.damage;

    return `
      <div class="summon-system-layout">
        <!-- HEADER HERO -->
        <div class="sp-section sp-card summon-hero-card">
          <div class="sh-title-row">
            <div class="sh-left">
              <span class="sh-icon">${type === 'BARRACKS' ? UI_ICONS.SHIELD : type === 'DRAGON_NEST' ? ELEMENT_ICONS.DRAGON : type === 'FAIRY_TREE' ? ELEMENT_ICONS.FAIRY : UI_ICONS.TEMPLE}</span>
              <div>
                <h3 class="sh-title">${meta.title}</h3>
                <span class="sh-badge">${meta.badge}</span>
              </div>
            </div>
            <div class="sh-right">
              <span class="sh-cost-pill">${UI_ICONS.GOLD} Cấp 1: ${bp1.cost} Vàng</span>
            </div>
          </div>
          <p class="sh-desc">${meta.desc}</p>
        </div>

        <!-- 2 COLUMNS: LEFT (UPGRADE TREE & ROLE) / RIGHT (UNIT PROFILE, ELEMENT SIM & STATS TABLE) -->
        <div class="codex-two-col">
          <!-- CỘT TRÁI: CÂY NÂNG CẤP & CƠ CHẾ -->
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <!-- Upgrade Tree Diagram -->
            <div class="sp-section sp-card">
              <div class="sp-sec-header">
                <h4 class="sp-sec-title">${UI_ICONS.TREE} CÂY NÂNG CẤP THÁP (CẤP 1 ➔ 4A/4B)</h4>
                <span class="sp-hint">Bấm vào từng cấp để xem thay đổi chỉ số</span>
              </div>
              <div class="upgrade-tree-container">
                ${this.renderTreeNode(bp1, 'CẤP 1', `${type}_1`)}
                <div class="tree-arrow">▼</div>
                ${this.renderTreeNode(bp2, 'CẤP 2', `${type}_2`)}
                <div class="tree-arrow">▼</div>
                ${this.renderTreeNode(bp3, 'CẤP 3', `${type}_3`)}
                <div class="tree-split-arrow">
                  <span>┌───────┴───────┐</span>
                  <span>▼&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼</span>
                </div>
                <div class="tree-branch-split">
                  ${this.renderTreeNode(bp4A, '4-A', `${type}_4_A`, true)}
                  ${this.renderTreeNode(bp4B, '4-B', `${type}_4_B`, true)}
                </div>
              </div>
            </div>

            <!-- Cơ Chế Đơn Vị Triệu Hồi -->
            <div class="sp-section sp-card" style="border-left: 4px solid #a855f7;">
              <h4 class="sp-sec-title" style="color: #c084fc;">${UI_ICONS.MEDAL} HỒ SƠ ĐƠN VỊ: ${meta.unitName.toUpperCase()}</h4>
              <p class="sp-desc">${meta.unitDesc}</p>
              
              <div class="unit-traits-list">
                ${this.renderUnitTraitsHtml(type, selectedBp)}
              </div>
            </div>
          </div>

          <!-- CỘT PHẢI: BẢNG CHỈ SỐ CỦA CẤP ĐANG CHỌN, MÔ PHỎNG NGUYÊN TỐ & BẢNG SO SÁNH 4 CẤP -->
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <!-- Card Chi Tiết Cấp Độ Đang Chọn (Tháp + Đơn Vị) -->
            <div class="sp-section sp-card highlighted-detail-card">
              <div class="dt-header">
                <span class="dt-tier-badge">CHI TIẾT CẤP ĐỘ: ${selectedBp.name.toUpperCase()}</span>
                <span class="dt-cost">${UI_ICONS.GOLD} ${selectedBp.cost} Vàng</span>
              </div>
              <p class="dt-desc">${selectedBp.description}</p>

              <!-- Soldier Canvas Preview (Rust WASM WebGL2) -->
              <div class="codex-monster-canvas-box" style="margin: 8px 0 12px 0;">
                <canvas id="codex-soldier-canvas" width="240" height="180"></canvas>
                <span class="codex-monster-canvas-hint">Mô phỏng đồ họa chiến binh Rust WebGL2</span>
              </div>

              ${
                type === 'BARRACKS'
                  ? `
                <div class="stance-toggle-box">
                  <span style="font-size: 11.5px; font-weight: 700; color: #94a3b8;">XEM CHỈ SỐ CHẾ ĐỘ:</span>
                  <div class="stance-btns-group">
                    <button class="stance-btn ${this.barracksStance === 'MELEE' ? 'active' : ''}" data-stance="MELEE">${UI_ICONS.SWORD} Lính Cận Chiến (100% HP & Giáp)</button>
                    <button class="stance-btn ${this.barracksStance === 'RANGED' ? 'active' : ''}" data-stance="RANGED">${UI_ICONS.BOW} Lính Bắn Tên (Đa Miền 3 Đường)</button>
                  </div>
                </div>
              `
                  : ''
              }

              <!-- Stats Grid -->
              ${
                type === 'HEROIC_ALTAR'
                  ? `
              <div class="dt-stats-grid">
                <div class="stat-box">
                  <span class="s-label">Năng lực cốt lõi</span>
                  <span class="s-val" style="color: #a5b4fc;">Chiêu Hồn Đồng Minh ${ELEMENT_ICONS.GHOST}</span>
                </div>
                <div class="stat-box">
                  <span class="s-label">Tầm chiêu hồn</span>
                  <span class="s-val">${selectedBp.range} px ${UI_ICONS.GLOBE}</span>
                </div>
                <div class="stat-box">
                  <span class="s-label">Tối đa Anh Linh</span>
                  <span class="s-val" style="color: #38bdf8; font-weight: 700;">${maxSoldiers} Đơn vị ${UI_ICONS.UNITS}</span>
                </div>
                <div class="stat-box">
                  <span class="s-label">Tỉ lệ hồi sinh</span>
                  <span class="s-val" style="color: #a855f7; font-weight: 700;">${Math.round((selectedBp.resurrectChance || 0.3) * 100)}% ${UI_ICONS.ORB}</span>
                </div>
                <div class="stat-box">
                  <span class="s-label">Hệ Ma nhận thêm</span>
                  <span class="s-val" style="color: #c084fc; font-weight: 700;">+${Math.round((selectedBp.spiritGhostRatio ?? (selectedBp.branch === 'B' ? 1.0 : 0.5)) * 100)}% Base DMG ${UI_ICONS.BOLT}</span>
                </div>
                <div class="stat-box">
                  <span class="s-label">Máu & Giáp</span>
                  <span class="s-val" style="color: #34d399;">100% Chỉ số lính gốc ${UI_ICONS.HEART}</span>
                </div>
                <div class="stat-box">
                  <span class="s-label">Tốc đánh & Tầm đánh</span>
                  <span class="s-val" style="color: #34d399;">100% Chỉ số lính gốc ${UI_ICONS.SWORDS}</span>
                </div>
                <div class="stat-box">
                  <span class="s-label">Địa hình chiến đấu</span>
                  <span class="s-val" style="color: #fbbf24;">Kế thừa lính gốc (Bộ, Bay, Bơi)</span>
                </div>
                <div class="stat-box">
                  <span class="s-label">Địa hình chốt chặn</span>
                  <span class="s-val" style="color: #fbbf24;">Theo hình thái đơn vị gốc</span>
                </div>
                <div class="stat-box">
                  <span class="s-label">Tấn công tháp</span>
                  <span class="s-val" style="color: #94a3b8;">Không tấn công trực tiếp</span>
                </div>
              </div>
              `
                  : `
              <div class="dt-stats-grid">
                <div class="stat-box">
                  <span class="s-label">Tầm cắm cờ (Rally)</span>
                  <span class="s-val">${selectedBp.range} px ${UI_ICONS.FLAG}</span>
                </div>
                <div class="stat-box">
                  <span class="s-label">Số lượng đơn vị</span>
                  <span class="s-val" style="color: #38bdf8;">${maxSoldiers} Đơn vị ${UI_ICONS.UNITS}</span>
                </div>
                <div class="stat-box">
                  <span class="s-label">Máu mỗi đơn vị</span>
                  <span class="s-val">${type === 'BARRACKS' && this.barracksStance === 'RANGED' ? Math.round(unitHp * 0.65) : unitHp} ${UI_ICONS.HEART}</span>
                </div>
                <div class="stat-box">
                  <span class="s-label">Tổng máu toàn đội</span>
                  <span class="s-val highlight-dps">${(type === 'BARRACKS' && this.barracksStance === 'RANGED' ? Math.round(unitHp * 0.65) : unitHp) * maxSoldiers} ${UI_ICONS.HEART}</span>
                </div>
                <div class="stat-box">
                  <span class="s-label">Sát thương / đòn</span>
                  <span class="s-val">${type === 'BARRACKS' && this.barracksStance === 'RANGED' ? Math.round(baseDmg * 0.7) : baseDmg} ${UI_ICONS.SWORDS}</span>
                </div>
                <div class="stat-box">
                  <span class="s-label">Tốc độ đánh</span>
                  <span class="s-val">${selectedBp.fireRate}/s ${UI_ICONS.BOLT}</span>
                </div>
                <div class="stat-box">
                  <span class="s-label">Giáp vật lý</span>
                  <span class="s-val">${Math.round((type === 'BARRACKS' && this.barracksStance === 'RANGED' ? unitArmor * 0.5 : unitArmor) * 100)}% ${UI_ICONS.SHIELD}</span>
                </div>
                <div class="stat-box">
                  <span class="s-label">Địa hình tấn công</span>
                  <span class="s-val" style="color: #34d399;">${type === 'BARRACKS' && this.barracksStance === 'MELEE' ? 'Chỉ Đi Bộ (WALK)' : 'Bộ, Bay, Bơi (Đa Miền)'}</span>
                </div>
                <div class="stat-box">
                  <span class="s-label">Địa hình chốt chặn</span>
                  <span class="s-val" style="color: #fbbf24;">${type === 'BARRACKS' ? 'Chặn Đi Bộ (1v1)' : `Chặn Đi Bộ & Bay ${UI_ICONS.FLY}`}</span>
                </div>
                <div class="stat-box">
                  <span class="s-label">Hồi sinh / Chiêu hồn</span>
                  <span class="s-val" style="color: #a855f7;">${unitRespawn}s ${UI_ICONS.TIMER}</span>
                </div>
                ${
                  selectedBp.soldierRegen
                    ? `
                  <div class="stat-box">
                    <span class="s-label">Hồi máu mỗi giây</span>
                    <span class="s-val" style="color: #4ade80; font-weight: 700;">+${selectedBp.soldierRegen} HP/s ${UI_ICONS.HEART}</span>
                  </div>
                  <div class="stat-box">
                    <span class="s-label">Tổng hồi máu toàn đội</span>
                    <span class="s-val" style="color: #4ade80; font-weight: 700;">+${selectedBp.soldierRegen * maxSoldiers} HP/s ${UI_ICONS.HEART}</span>
                  </div>
                `
                    : ''
                }
                ${
                  selectedBp.aoeRadius
                    ? `
                  <div class="stat-box">
                    <span class="s-label">Bán kính nổ lan AoE</span>
                    <span class="s-val" style="color: #f97316;">${selectedBp.aoeRadius} px ${UI_ICONS.EXPLOSION}</span>
                  </div>
                `
                    : ''
                }
                <div class="stat-box">
                  <span class="s-label">Tổng DPS toàn đội</span>
                  <span class="s-val highlight-dps">${Math.round((type === 'BARRACKS' && this.barracksStance === 'RANGED' ? Math.round(baseDmg * 0.7) : baseDmg) * selectedBp.fireRate * maxSoldiers)} DPS</span>
                </div>
              </div>
              `
              }
            </div>

            <!-- Mô phỏng hiệu ứng nguyên tố cho đơn vị triệu hồi -->
            ${this.renderSummonElementalSimulator(type, selectedBp)}

            <!-- Bảng chỉ số đầy đủ cả 4 cấp -->
            <div class="sp-section sp-card">
              <div class="sp-sec-header">
                <h4 class="sp-sec-title">${UI_ICONS.CHART} BẢNG SO SÁNH CHỈ SỐ CẢ 4 CẤP (THÁP & ĐƠN VỊ TRIỆU HỒI)</h4>
                <span class="sp-hint">${type === 'HEROIC_ALTAR' ? `${ELEMENT_ICONS.GHOST} Hệ Ma cố định (+50% DMG Ma)` : type === 'DRAGON_NEST' || type === 'FAIRY_TREE' ? 'Gắn nguyên tố thứ 2: +60% Sát thương Phép' : 'Gắn nguyên tố: +45% Sát thương Phép'}</span>
              </div>
              <div class="table-responsive">
                <table class="stats-table">
                  <thead>
                    <tr>
                      ${
                        type === 'HEROIC_ALTAR'
                          ? `
                        <th>Cấp</th>
                        <th>Tên Tháp</th>
                        <th>Giá</th>
                        <th>Tối Đa Anh Linh</th>
                        <th>Tỉ Lệ Hồi Sinh</th>
                        <th>Hệ Ma Nhận Thêm</th>
                        <th>Tầm Chiêu Hồn</th>
                        <th>Chỉ Số Lính</th>
                        <th>Đặc Tính Cấp Độ</th>
                      `
                          : `
                        <th>Cấp</th>
                        <th>Tên Tháp</th>
                        <th>Giá</th>
                        <th>Số Lượng</th>
                        <th>Máu / Lính (Tổng)</th>
                        <th>Giáp</th>
                        <th>DMG Gốc + Phép</th>
                        <th>Tốc</th>
                        <th>Tổng DPS</th>
                        <th>Đặc Tính Chiến Đấu</th>
                      `
                      }
                    </tr>
                  </thead>
                  <tbody>
                    ${this.renderSummonStatsRow(bp1, 'Cấp 1', type)}
                    ${this.renderSummonStatsRow(bp2, 'Cấp 2', type)}
                    ${this.renderSummonStatsRow(bp3, 'Cấp 3', type)}
                    ${this.renderSummonStatsRow(bp4A, `4-A ${UI_ICONS.STAR}`, type, 'branch-row-a')}
                    ${this.renderSummonStatsRow(bp4B, `4-B ${UI_ICONS.STAR}`, type, 'branch-row-b')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderUnitTraitsHtml(type: TowerType, bp: TowerBlueprint): string {
    if (type === 'BARRACKS') {
      const barracksRegen = TOWER_BLUEPRINTS['BARRACKS_4_A']?.soldierRegen || 15;
      return `
        <div class="trait-item">
          <b>${UI_ICONS.SWORDS} Lính Cận Chiến:</b> Máu dày (100 ${UI_ICONS.HEART} - 480 ${UI_ICONS.HEART}), giáp vật lý cao (10% - 65%), chốt chặn quái Đi Bộ 1v1. Nhánh 4-A tự hồi máu liên tục mỗi giây (+${barracksRegen} HP/s); Nhánh 4-B tăng mạnh sát thương và tần suất xuất chiêu.
        </div>
        <div class="trait-item">
          <b>${UI_ICONS.BOW} Lính Bắn Tên:</b> Tầm bắn xa (147px - 183px), <b>bắn được CẢ 3 ĐỊA HÌNH: Đi Bộ, Trên Không và Dưới Nước</b>. Đứng an toàn tại cờ xả mưa tên liên thanh hỗ trợ đồng đội.
        </div>
        <div class="trait-item">
          <b>${UI_ICONS.RESTART} Chuyển Đổi Miễn Phí:</b> Bấm vào Nhà Lính trong trận ➔ Chọn [Cận Chiến] hoặc [Bắn Tên] tức thì mà không tốn vàng hay thời gian chờ!
        </div>
      `;
    }
    if (type === 'DRAGON_NEST') {
      const dragonRegen = TOWER_BLUEPRINTS['DRAGON_NEST_4_A']?.soldierRegen || 15;
      return `
        <div class="trait-item">
          <b>${ELEMENT_ICONS.DRAGON} Cá Thể Chiến Binh Đơn Độc (1 Rồng):</b> Nâng cấp không tăng số lượng mà tăng vọt Máu (220 ➔ 850 ${UI_ICONS.HEART}), Giáp (20% ➔ 65%) và Sát thương (30 ➔ 150 DMG). Nhánh 4-A (Long Tổ Cổ Đại) tự động hồi máu bền bỉ (+${dragonRegen} HP/s).
        </div>
        <div class="trait-item">
          <b>${UI_ICONS.FLY} Chốt Chặn Quái Bay:</b> Rồng bay lượn trên không nên có thể chặn đứng và đấu tay đôi với cả quái Bay (FLY) lẫn quái Đi Bộ (WALK).
        </div>
        <div class="trait-item">
          <b>${UI_ICONS.EXPLOSION} Sát Thương Nổ Lan AoE:</b> Đòn cắn và khè lửa gây nổ lan 70% sát thương trong bán kính ${bp.aoeRadius || 55}px lên toàn bộ quái xung quanh. Tấn công được quái Bơi (SWIM) mà không bị kẹt!
        </div>
      `;
    }
    if (type === 'FAIRY_TREE') {
      const fairyRegen = TOWER_BLUEPRINTS['FAIRY_TREE_4_A']?.soldierRegen || 15;
      return `
        <div class="trait-item">
          <b>${ELEMENT_ICONS.FAIRY} Bầy Tiên Tinh Linh (2 ➔ 5 Tiên):</b> Càng nâng cấp thì số lượng tiên càng đông đảo (Cấp 1: 2 tiên, Cấp 2: 3 tiên, Cấp 3: 4 tiên, Cấp 4: 5 tiên).
        </div>
        <div class="trait-item">
          <b>${UI_ICONS.FLY} Chặn Quái Bay & Đa Miền:</b> Tiên bay lượn trên không, chặn được quái Bay & quái Đi Bộ, đồng thời phóng đạn phép tầm xa diệt quái Bơi lội (SWIM).
        </div>
        <div class="trait-item">
          <b>${UI_ICONS.STAR} Đột Phá Cấp 4:</b> Nhánh 4-A (Đại Thụ Tinh Linh) tự hồi máu (+${fairyRegen} HP/s mỗi tiên) và ban phước hồi máu cho đồng minh khi tấn công; Nhánh 4-B (Thần Mộc Huyền Quang) tốc đánh thần tốc và làm suy yếu quái vật.
        </div>
      `;
    }
    if (type === 'HEROIC_ALTAR') {
      const ghostPct = Math.round((bp.spiritGhostRatio ?? (bp.branch === 'B' ? 1.0 : 0.5)) * 100);
      return `
        <div class="trait-item">
          <b>${ELEMENT_ICONS.GHOST} Hồi Sinh Linh Hồn (Resurrection):</b> Khi Lính, Rồng hoặc Tiên tử trận trong phạm vi ${bp.range}px, có ${Math.round((bp.resurrectChance || 0.3) * 100)}% tỉ lệ hồi sinh thành Anh Linh (tối đa ${bp.maxSoldiers || 2} Anh Linh cùng lúc).
        </div>
        <div class="trait-item">
          <b>${UI_ICONS.ORB} Nhận Thêm Hệ Ma (GHOST):</b> Anh Linh giữ nguyên 100% toàn bộ chỉ số gốc của lính (HP, Giáp, Tốc đánh, Tầm đánh/bắn) và nhận thêm đòn đánh <b>Hệ Ma (+${ghostPct}% công kích cơ bản)</b>!
        </div>
        <div class="trait-item">
          <b>${UI_ICONS.STAR} Đột Phá Cấp 4:</b> Nhánh 4-A (Đền Anh Linh Bất Diệt) tối đa <b>6 Anh Linh</b> với tỉ lệ hồi sinh <b>80%</b> (+50% DMG Ma); Nhánh 4-B (Minh Giới Chiêu Hồn Đàn) tối đa <b>5 Anh Linh</b> với tỉ lệ hồi sinh <b>70%</b> và nhận thêm hệ Ma tới <b>100% công kích cơ bản</b>!
        </div>
      `;
    }
    return '';
  }

  private renderSummonStatsRow(
    bp: TowerBlueprint,
    tierLabel: string,
    type: TowerType,
    customClass: string = ''
  ): string {
    const isCurrent = bp.type === this.selectedTierKey;

    if (type === 'HEROIC_ALTAR') {
      const maxSpirits = bp.maxSoldiers || 2;
      const chance = Math.round((bp.resurrectChance || 0.3) * 100);
      const ghostPct = Math.round((bp.spiritGhostRatio ?? (bp.branch === 'B' ? 1.0 : 0.5)) * 100);
      let specialTrait = `Tối đa ${maxSpirits} Anh Linh • ${chance}% Tỉ lệ`;
      if (bp.branch === 'A') specialTrait = `${UI_ICONS.STAR} Nhánh 4-A: Quân số tối đa lớn nhất (6 Anh Linh)`;
      if (bp.branch === 'B') specialTrait = `${UI_ICONS.STAR} Nhánh 4-B: Sát thương Ma cực đại (+100% Base DMG)`;
      return `
        <tr class="${customClass} ${isCurrent ? 'selected-row' : ''}">
          <td><b>${tierLabel}</b></td>
          <td>${bp.name}</td>
          <td style="color: #facc15">${UI_ICONS.GOLD} ${bp.cost}</td>
          <td style="color: #38bdf8; font-weight: 700;">${maxSpirits} Anh Linh</td>
          <td style="color: #a855f7; font-weight: 700;">${chance}%</td>
          <td style="color: #c084fc; font-weight: 700;">+${ghostPct}% Base DMG</td>
          <td>${bp.range} px</td>
          <td style="color: #34d399; font-size: 11px;">100% Chỉ số lính gốc</td>
          <td style="font-size: 11px; color: #cbd5e1;">${specialTrait}</td>
        </tr>
      `;
    }

    const maxSoldiers = bp.maxSoldiers || 1;
    const hp = bp.soldierHp || 100;
    const armor = Math.round((bp.soldierArmor || 0) * 100);
    const baseDamage = bp.damage;

    // Elemental bonus calculation
    let elemBonusRatio = 0.45;
    if (type === 'DRAGON_NEST' || type === 'FAIRY_TREE') elemBonusRatio = 0.6;

    const bonusDmg = Math.round(baseDamage * elemBonusRatio);
    const totalDmg = baseDamage + bonusDmg;
    const totalDps = Math.round(totalDmg * bp.fireRate * maxSoldiers);

    let specialTrait = '';
    const regenText = bp.soldierRegen ? ` • Tự hồi +${bp.soldierRegen} HP/s` : '';
    if (type === 'BARRACKS') {
      specialTrait = `Hồi sinh ${bp.soldierRespawn}s${regenText} • ${UI_ICONS.SWORDS} Cận Chiến & ${UI_ICONS.BOW} Bắn Tên`;
    } else if (type === 'DRAGON_NEST') {
      specialTrait = `AoE ${bp.aoeRadius}px • Chặn Bay ${UI_ICONS.FLY}${regenText} • Hồi sinh ${bp.soldierRespawn}s`;
    } else if (type === 'FAIRY_TREE') {
      specialTrait = `Bắn phép tầm xa • Chặn Bay ${UI_ICONS.FLY}${regenText} • Hồi sinh ${bp.soldierRespawn}s`;
    }

    return `
      <tr class="${customClass} ${isCurrent ? 'selected-row' : ''}">
        <td><b>${tierLabel}</b></td>
        <td>${bp.name}</td>
        <td style="color: #facc15">${UI_ICONS.GOLD} ${bp.cost}</td>
        <td style="color: #38bdf8; font-weight: 700;">${maxSoldiers}</td>
        <td>${hp} ${UI_ICONS.HEART} <span style="font-size: 11px; color: #94a3b8;">(${hp * maxSoldiers})</span>${bp.soldierRegen ? `<br><span style="font-size: 11px; color: #4ade80; font-weight: 700;">+${bp.soldierRegen} HP/s</span>` : ''}</td>
        <td>${armor}% ${UI_ICONS.SHIELD}</td>
        <td style="color: #38bdf8;">
          ${baseDamage} + <span style="color: #c084fc;">${bonusDmg}</span> = <b>${totalDmg}</b>
        </td>
        <td>${bp.fireRate}/s</td>
        <td class="table-dps-val">${totalDps} DPS</td>
        <td style="font-size: 11px; color: #cbd5e1;">${specialTrait}</td>
      </tr>
    `;
  }

  private renderSummonElementalSimulator(type: TowerType, bp: TowerBlueprint): string {
    if (type === 'HEROIC_ALTAR') {
      const ghostPct = Math.round((bp.spiritGhostRatio ?? (bp.branch === 'B' ? 1.0 : 0.5)) * 100);
      return `
        <div class="sp-section sp-card" style="border-left: 4px solid #818cf8; background: linear-gradient(90deg, #1e1b4b 0%, #0f172a 100%);">
          <div class="sp-sec-header">
            <h4 class="sp-sec-title" style="color: #a5b4fc;">${ELEMENT_ICONS.GHOST} THUỘC TÍNH NGUYÊN TỐ CỦA ANH LINH BÓNG MA</h4>
            <span class="sp-hint">Thuộc tính Ma (GHOST) cố định</span>
          </div>
          <p class="sp-desc" style="color: #cbd5e1; margin-bottom: 6px;">
            Tế Đàn Anh Linh không gắn thêm nguyên tố từ bên ngoài. Toàn bộ Anh Linh được triệu hồi sẽ tự động kế thừa nguyên tố của đơn vị đã tử trận và được nhận thêm <b>${ELEMENT_ICONS.GHOST} Hệ Ma (+${ghostPct}% Công Kích Cơ Bản)</b>!
          </p>
          <div class="sim-effect-box" style="border-left-color: #818cf8;">
            <div class="sim-effect-title" style="color: #818cf8;">${ELEMENT_ICONS.GHOST} Uy Lực Anh Linh Cổ Đại</div>
            <p class="sim-effect-desc">Đòn tấn công của Anh Linh gây thêm sát thương Ma, xuyên giáp vật lý và có khả năng công kích cả 3 loại địa hình.</p>
          </div>
        </div>
      `;
    }

    const elemColor = ELEMENT_COLORS[this.previewElement] || '#ffffff';
    const elemIcon = ELEMENT_ICONS[this.previewElement] || UI_ICONS.SPARKLES;
    const elemName = ELEMENT_NAMES[this.previewElement] || this.previewElement;

    const baseDmg = bp.damage;
    const bonusRatio = type === 'DRAGON_NEST' || type === 'FAIRY_TREE' ? 0.6 : 0.45;
    const bonusDmg = Math.round(baseDmg * bonusRatio);
    const totalDmg = baseDmg + bonusDmg;
    const maxSoldiers = bp.maxSoldiers || 1;
    const totalDps = Math.round(totalDmg * bp.fireRate * maxSoldiers);

    const effectInfo = this.getSummonSpecificEffectText(type, this.previewElement);

    const elemButtonsHtml = SELECTABLE_ELEMENTS.map((el) => {
      const isSelected = this.previewElement === el;
      const color = ELEMENT_COLORS[el];
      const icon = ELEMENT_ICONS[el];
      return `
        <button class="sim-elem-btn ${isSelected ? 'active' : ''}" 
                data-elem="${el}" 
                style="${isSelected ? `border-color: ${color}; box-shadow: 0 0 10px ${color}80;` : ''}">
          <span>${icon}</span>
          <span style="color: ${color}">${ELEMENT_NAMES[el].split(' ')[0]}</span>
        </button>
      `;
    }).join('');

    return `
      <div class="sp-section sp-card simulation-panel">
        <div class="sp-sec-header">
          <h4 class="sp-sec-title">${UI_ICONS.FLASK} MÔ PHỎNG NGUYÊN TỐ CHO ĐƠN VỊ CỦA ${bp.name.toUpperCase()}</h4>
          <span class="sp-hint">Bấm chọn nguyên tố để xem biến đổi chỉ số & hiệu ứng</span>
        </div>

        <div class="sim-controls-group">
          <span class="sim-group-label">
            ${type === 'DRAGON_NEST' ? `${ELEMENT_ICONS.FIRE} Chọn Nguyên Tố Thứ 2 Cho Rồng (+60% Sát Thương Phép):` : type === 'FAIRY_TREE' ? `${UI_ICONS.SPARKLES} Chọn Nguyên Tố Thứ 2 Cho Tiên (+60% Sát Thương Phép):` : `${UI_ICONS.BOLT} Chọn 1 Nguyên Tố Trang Bị Cho Binh Lính (+45% Sát Thương Phép):`}
          </span>
          <div class="sim-elem-grid">${elemButtonsHtml}</div>
        </div>

        <div class="sim-result-box" style="border-left-color: ${elemColor}">
          <div class="sim-result-header">
            <span class="sim-res-title">
              ĐÒN ĐÁNH CỦA ĐƠN VỊ: 
              <b style="color: #cbd5e1">${baseDmg} Gốc (${type === 'DRAGON_NEST' ? `${ELEMENT_ICONS.DRAGON} Rồng` : type === 'FAIRY_TREE' ? `${ELEMENT_ICONS.FAIRY} Tiên` : `${UI_ICONS.SWORDS} Vật Lý`})</b>
              + 
              <b style="color: ${elemColor}">${elemIcon} ${bonusDmg} Phép ${elemName}</b>
              = <span class="highlight-total-dmg">${totalDmg} DMG / đòn</span>
            </span>
            <span class="sim-total-dps">Toàn đội (${maxSoldiers} đơn vị): ${totalDps} DPS</span>
          </div>

          <div class="sim-effect-box" style="border-left-color: ${elemColor}">
            <div class="sim-effect-title" style="color: ${elemColor}">
              ${elemIcon} ${effectInfo.name}
            </div>
            <p class="sim-effect-desc">${effectInfo.desc}</p>
            <div class="sim-synergy-tag">${effectInfo.synergy}</div>
          </div>
        </div>
      </div>
    `;
  }

  private getSummonSpecificEffectText(
    _type: TowerType,
    elem: ElementType
  ): { name: string; desc: string; synergy: string } {
    const elemName = ELEMENT_NAMES[elem];
    switch (elem) {
      case 'LIGHT':
        return {
          name: `Ban Phước Ánh Sáng Thần Thánh (${elemName})`,
          desc: `Mỗi đòn đánh của đơn vị triệu hồi tự động hồi phục ngay +5 HP cho bản thân! Giúp đơn vị trụ vững bền bỉ trước các đàn quái hung tợn.`,
          synergy: `${UI_ICONS.SPARKLES} Tự hồi phục máu liên tục trên từng đòn đánh • Cực kỳ trâu bò!`
        };
      case 'GRASS':
        return {
          name: `Dây Leo Trói Buộc & Hút Hồn (${elemName})`,
          desc: `Đòn đánh trói chân quái vật (Root) khiến quái dừng bước, đồng thời hút +3 HP hồi lại cho đơn vị triệu hồi.`,
          synergy: `${ELEMENT_ICONS.GRASS} Khống chế tại chỗ + hồi phục máu!`
        };
      case 'ICE':
        return {
          name: `Băng Hàn Đóng Băng & Giảm Tốc (${elemName})`,
          desc: `Làm chậm 45% tốc độ di chuyển và tốc đánh của quái, kèm 25% tỉ lệ Đóng Băng hoàn toàn trong 0.6s.`,
          synergy: `${ELEMENT_ICONS.ICE} Chốt chặn bất động quái chạy nhanh và boss hung hãn!`
        };
      case 'FIRE':
        return {
          name: `Hỏa Ngục Thiêu Đốt Rút Máu (${elemName})`,
          desc: `Gây hiệu ứng Bỏng thiêu đốt DoT rút máu liên tục mỗi 0.5s bỏ qua giáp phòng ngự của quái vật.`,
          synergy: `${ELEMENT_ICONS.FIRE} Thiêu rụi quái có lượng máu dày và quái bọc thép!`
        };
      case 'LIGHTNING':
        return {
          name: `Sốc Điện Tê Liệt & Giật Nảy Chuỗi (${elemName})`,
          desc: `Gây choáng 0.35s ngắt đòn đánh của quái vật, đồng thời phóng tia sét nảy sang 1 kẻ địch gần nhất gây 35% sát thương.`,
          synergy: `${UI_ICONS.BOLT} Ngắt chiêu của quái vật và dọn dẹp cụm quái đông!`
        };
      case 'STEEL':
        return {
          name: `Kình Lực Phá Giáp (${elemName})`,
          desc: `Phá tan lớp giáp bảo hộ của kẻ địch, khiến quái nhận thêm +30% sát thương từ mọi đòn tấn công của tháp và đồng minh.`,
          synergy: `${UI_ICONS.SWORDS} Khắc chế cứng quái bọc giáp sắt, Golem và Boss!`
        };
      case 'DARK':
        return {
          name: `Dấu Ấn Nguyền Rủa Hắc Ám (${elemName})`,
          desc: `Gắn lời nguyền hắc ám lên quái vật khiến chúng nhận thêm +35% sát thương từ tất cả công trình xung quanh.`,
          synergy: `${ELEMENT_ICONS.DARK} Khuếch đại sát thương cho toàn bộ hệ thống phòng thủ!`
        };
      default:
        return {
          name: `Cường Hóa Thuộc Tính ${elemName}`,
          desc: `Gia tăng mạnh sát thương nguyên tố và kích hoạt trạng thái khắc chế nguyên tố tương ứng lên kẻ thù.`,
          synergy: `${UI_ICONS.SPARKLES} Tối ưu hóa sát thương khắc hệ theo từng đợt quái!`
        };
    }
  }

  private renderOverviewComparisonHtml(): string {
    return `
      <div class="sp-section sp-card">
        <div class="sp-sec-header">
          <h4 class="sp-sec-title">${UI_ICONS.CHART} BẢNG TỔNG QUAN SO SÁNH 4 HỆ THỐNG THÁP & ĐƠN VỊ TRIỆU HỒI</h4>
          <span class="sp-hint">Stick Vanguard Summoning System Comparison</span>
        </div>
        <div class="table-responsive">
          <table class="stats-table">
            <thead>
              <tr>
                <th>Hệ Triệu Hồi</th>
                <th>Thực Thể</th>
                <th>Số Lượng</th>
                <th>Cơ Chế Chốt Chặn</th>
                <th>Địa Hình Tấn Công</th>
                <th>Đặc Quyền Cốt Lõi</th>
                <th>Khả Năng Gắn Nguyên Tố</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>${UI_ICONS.SHIELD} Trại Dân Quân (Barracks)</b></td>
                <td>Chiến Binh Người Que</td>
                <td>3 ➔ 4 ➔ 5</td>
                <td>Chốt chặn Đi Bộ (1v1)</td>
                <td>Bộ (Cận chiến) / <b>Bộ, Bay, Bơi (Cung)</b></td>
                <td>Chuyển đổi tức thì <b>Cận Chiến vs Bắn Tên</b> miễn phí • Nhánh 4-A tự hồi phục (+${TOWER_BLUEPRINTS['BARRACKS_4_A']?.soldierRegen || 15} HP/s)</td>
                <td>Tự do gắn 1 trong 12 nguyên tố (+45% Phép)</td>
              </tr>
              <tr>
                <td><b>${ELEMENT_ICONS.DRAGON} Tổ Rồng (Dragon Nest)</b></td>
                <td>Hỏa Long</td>
                <td>1 Cá thể duy nhất</td>
                <td><b>Chặn Đi Bộ & Bay ${UI_ICONS.FLY}</b></td>
                <td><b>Bộ, Bay, Bơi (Đa Miền)</b></td>
                <td><b>Sát thương AoE nổ lan 70%</b> • Máu dày, Nhánh 4-A tự hồi phục (+${TOWER_BLUEPRINTS['DRAGON_NEST_4_A']?.soldierRegen || 15} HP/s)</td>
                <td>Gốc hệ Rồng + Chọn thêm 1 hệ (+60% Phép)</td>
              </tr>
              <tr>
                <td><b>${ELEMENT_ICONS.FAIRY} Cây Tiên (Fairy Tree)</b></td>
                <td>Tinh Linh Tiên</td>
                <td>2 ➔ 3 ➔ 4 ➔ 5</td>
                <td><b>Chặn Đi Bộ & Bay ${UI_ICONS.FLY}</b></td>
                <td><b>Bộ, Bay, Bơi (Đa Miền)</b></td>
                <td>Bắn đạn phép tầm xa liên thanh • Nhánh 4-A tự hồi phục (+${TOWER_BLUEPRINTS['FAIRY_TREE_4_A']?.soldierRegen || 15} HP/s)</td>
                <td>Gốc hệ Tiên + Chọn thêm 1 hệ (+60% Phép)</td>
              </tr>
              <tr>
                <td><b>${UI_ICONS.TEMPLE} Tế Đàn Anh Linh (Heroic Altar)</b></td>
                <td>Anh Linh Bóng Ma</td>
                <td>2 ➔ 3 ➔ 4 ➔ 6 (4A) / 5 (4B)</td>
                <td>Theo hình thái gốc</td>
                <td><b>Bộ, Bay, Bơi (Đa Miền)</b></td>
                <td><b>Hồi sinh đồng minh tử trận</b> • Nhận thêm Hệ Ma (+50% DMG, 4B: +100% DMG)</td>
                <td><b>Hệ Ma cố định</b> • Kế thừa toàn bộ hệ & chỉ số gốc</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  private renderTreeNode(
    bp: TowerBlueprint,
    tierBadge: string,
    tierKey: string,
    isBranch: boolean = false
  ): string {
    const isSelected = this.selectedTierKey === tierKey;
    const elemColor = ELEMENT_COLORS[bp.element] || '#ffffff';
    const elemIcon = ELEMENT_ICONS[bp.element] || UI_ICONS.CASTLE;

    return `
      <div class="tree-node ${isSelected ? 'active-node' : ''} ${isBranch ? 'branch-node' : ''}" 
           data-tier-key="${tierKey}">
        <div class="tn-badge">${tierBadge}</div>
        <div class="tn-title">
          <span style="color: ${elemColor}">${elemIcon}</span>
          <span>${bp.name}</span>
        </div>
        <div class="tn-stats">
          <span>${UI_ICONS.GOLD} <b>${bp.cost}</b></span>
          <span>${UI_ICONS.UNITS} <b>${bp.maxSoldiers || 1}</b></span>
          <span>${UI_ICONS.HEART} <b>${bp.soldierHp || 100}</b></span>
          ${bp.soldierRegen ? `<span style="color: #4ade80;"><b>+${bp.soldierRegen} HP/s</b></span>` : ''}
        </div>
        <div class="tn-brief">${bp.description}</div>
      </div>
    `;
  }

  public bindEvents(container: HTMLElement): void {
    // 1. Sub-nav button clicks
    container.querySelectorAll('[data-summon-sub]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const sub = (e.currentTarget as HTMLElement).getAttribute('data-summon-sub') as SummonCodexSubTab;
        if (sub) {
          this.currentSubTab = sub;
          if (sub !== 'OVERVIEW') {
            this.selectedTierKey = `${sub}_1`;
          }
          container.innerHTML = this.renderUnifiedSummonHtml();
          this.bindEvents(container);
        }
      });
    });

    // 2. Tree node clicks
    container.querySelectorAll('.tree-node').forEach((node) => {
      node.addEventListener('click', (e) => {
        const key = (e.currentTarget as HTMLElement).getAttribute('data-tier-key');
        if (key) {
          this.selectedTierKey = key;
          const scroll = container.scrollTop;
          container.innerHTML = this.renderUnifiedSummonHtml();
          container.scrollTop = scroll;
          this.bindEvents(container);
        }
      });
    });

    // 3. Stance toggle buttons for Barracks
    container.querySelectorAll('[data-stance]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const stance = (e.currentTarget as HTMLElement).getAttribute('data-stance') as 'MELEE' | 'RANGED';
        if (stance) {
          this.barracksStance = stance;
          const scroll = container.scrollTop;
          container.innerHTML = this.renderUnifiedSummonHtml();
          container.scrollTop = scroll;
          this.bindEvents(container);
        }
      });
    });

    // 4. Element selector buttons in simulation panel
    container.querySelectorAll('.sim-elem-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const elem = (e.currentTarget as HTMLElement).getAttribute('data-elem') as ElementType;
        if (elem) {
          this.previewElement = elem;
          const scroll = container.scrollTop;
          container.innerHTML = this.renderUnifiedSummonHtml();
          container.scrollTop = scroll;
          this.bindEvents(container);
        }
      });
    });

    if (this.currentSubTab !== 'OVERVIEW') {
      this.startSoldierAnimation(this.currentSubTab, this.barracksStance);
    }
  }

  public startSoldierAnimation(type: SummonCodexSubTab, stance: 'MELEE' | 'RANGED'): void {
    this.stopSoldierAnimation();

    const canvas = document.getElementById('codex-soldier-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const bridge = WasmBridge.ensureSingletonReady();
    const gl = canvas.getContext ? canvas.getContext('webgl2', { alpha: true, antialias: true, premultipliedAlpha: false }) : null;

    if (gl && bridge.isAvailable()) {
      bridge.initCodexWebGlRenderer(gl);
      UnitSpriteCache.uploadCodexAtlas(bridge);
    }

    this.soldierAnimStartTime = performance.now();
    const raf = typeof requestAnimationFrame !== 'undefined'
      ? requestAnimationFrame
      : (cb: FrameRequestCallback) => setTimeout(cb, 16) as unknown as number;

    const loop = (timestamp: number) => {
      const animTime = (timestamp - this.soldierAnimStartTime) / 1000;

      if (gl && bridge.isAvailable()) {
        bridge.renderCodexSoldier(type, stance, animTime, canvas.width, canvas.height);
        this.soldierAnimFrameId = raf(loop);
        return;
      }

      this.soldierAnimFrameId = raf(loop);
    };

    this.soldierAnimFrameId = raf(loop);
  }

  public stopSoldierAnimation(): void {
    if (this.soldierAnimFrameId !== null) {
      const caf = typeof cancelAnimationFrame !== 'undefined'
        ? cancelAnimationFrame
        : (id: number) => clearTimeout(id as any);
      caf(this.soldierAnimFrameId);
      this.soldierAnimFrameId = null;
    }
  }
}
