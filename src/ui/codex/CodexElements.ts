import {
  ELEMENT_COLORS,
  ELEMENT_ICONS,
  ELEMENT_NAMES,
  ALL_15_ELEMENTS,
  ALL_ELEMENT_DEFINITIONS,
  STATUS_TO_ELEMENT,
  ELEMENTAL_REACTIONS,
  getElementOffensiveTable,
  getElementDefensiveTable,
  getElementSynergyTable,
  searchElementalReactions
} from '../../config/elements/index.js';
import { ElementType } from '../../types/elements.types.js';

export class CodexElements {
  public currentElementSubTab: string = 'FIRE';

  // State for Elemental Reactions search & filters
  public reactionSearchQuery: string = '';
  public reactionElementFilter: string = 'ALL';
  public reactionCategoryFilter: string = 'ALL';

  public renderElementsCategory(
    contentEl: HTMLElement,
    titleEl: HTMLElement,
    iconEl: HTMLElement,
    badgeEl: HTMLElement,
    highlightElem?: string
  ): void {
    if (highlightElem) {
      this.currentElementSubTab = highlightElem;
    } else if (this.currentElementSubTab === 'OVERVIEW') {
      this.currentElementSubTab = 'FIRE';
    }

    titleEl.textContent = 'Hệ Thống Nguyên Tố & Bảng Tra Cứu Tương Khắc';
    iconEl.textContent = '✨';
    badgeEl.textContent = '15 Hệ • Bảng Gây/Nhận Sát Thương • Phối Hợp Combo & Tìm Kiếm';

    const getRightHtml = (sub: string) => {
      if (sub === 'REACTIONS') {
        return this.getElementalReactionsHtml();
      } else {
        const elemKey = (ALL_15_ELEMENTS.includes(sub as ElementType) ? sub : 'FIRE') as ElementType;
        return this.getSingleElementDetailHtml(elemKey);
      }
    };

    const updateView = (sub: string) => {
      this.currentElementSubTab = sub;

      const currentSidebar = contentEl.querySelector('.codex-sidebar-nav') as HTMLElement | null;
      const currentDetail = contentEl.querySelector('#codex-element-detail') as HTMLElement | null;

      if (currentSidebar && currentDetail) {
        currentSidebar.querySelectorAll('[data-sub-elem]').forEach((btn) => {
          const s = btn.getAttribute('data-sub-elem');
          const isActive = s === sub;
          btn.classList.toggle('active', isActive);

          if (s && s !== 'REACTIONS') {
            const color = ELEMENT_COLORS[s as ElementType];
            if (color) {
              (btn as HTMLElement).style.borderColor = isActive ? color : '';
              (btn as HTMLElement).style.boxShadow = isActive ? `inset 3px 0 0 ${color}` : '';
            }
          }
        });

        currentDetail.innerHTML = getRightHtml(sub);
        currentDetail.scrollTop = 0;

        if (sub === 'REACTIONS') {
          this.bindReactionSearchListeners(contentEl);
        }
        return;
      }

      this.renderElementsCategory(contentEl, titleEl, iconEl, badgeEl, sub);
    };

    const sidebarNav = contentEl.querySelector('.codex-sidebar-nav') as HTMLElement | null;
    const detailPane = contentEl.querySelector('#codex-element-detail') as HTMLElement | null;

    if (sidebarNav && detailPane) {
      updateView(this.currentElementSubTab);
      return;
    }

    const rightElementHtml = getRightHtml(this.currentElementSubTab);

    contentEl.innerHTML = `
      <div class="codex-master-layout">
        <aside class="codex-sidebar-nav">
          <div class="codex-sidebar-title">
            <span>PHẢN ỨNG NGUYÊN TỐ</span>
            <span style="color: #f59e0b;">${ELEMENTAL_REACTIONS.length} Combo</span>
          </div>
          <button class="codex-subnav-btn ${this.currentElementSubTab === 'REACTIONS' ? 'active' : ''}" data-sub-elem="REACTIONS">
            <span style="font-size: 18px;">💥</span>
            <div>
              <div style="font-weight: 700; color: #fbbf24;">Phản Ứng Nguyên Tố (Combos)</div>
              <div style="font-size: 11px; color: #94a3b8;">Tìm kiếm & tra cứu toàn bộ phối hợp</div>
            </div>
          </button>

          <div class="codex-sidebar-title" style="margin-top: 10px;">
            <span>15 HỆ NGUYÊN TỐ</span>
            <span style="color: #38bdf8;">Tra Cứu Chi Tiết</span>
          </div>
          ${ALL_15_ELEMENTS.map((elem) => {
            const def = ALL_ELEMENT_DEFINITIONS[elem];
            const color = ELEMENT_COLORS[elem];
            const icon = ELEMENT_ICONS[elem];
            const name = ELEMENT_NAMES[elem];
            const isActive = this.currentElementSubTab === elem;
            return `
              <button class="codex-subnav-btn ${isActive ? 'active' : ''}" data-sub-elem="${elem}" style="${isActive ? `border-color: ${color}; box-shadow: inset 3px 0 0 ${color};` : ''}">
                <span style="font-size: 18px;">${icon}</span>
                <div>
                  <div style="font-weight: 700; color: ${color};">${name}</div>
                  <div style="font-size: 11px; color: #64748b;">${def.statusEffectName.split('(')[0]}</div>
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

    // Bind navigation buttons
    contentEl.querySelectorAll('[data-sub-elem]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const sub = (e.currentTarget as HTMLElement).getAttribute('data-sub-elem');
        if (sub) {
          updateView(sub);
        }
      });
    });

    if (this.currentElementSubTab === 'REACTIONS') {
      this.bindReactionSearchListeners(contentEl);
    }
  }

  /**
   * Binds interactive live search & filters for Elemental Reactions view
   */
  private bindReactionSearchListeners(container: HTMLElement): void {
    const searchInput = container.querySelector('#codex-reaction-search') as HTMLInputElement | null;
    const elemFilter = container.querySelector('#codex-reaction-elem-filter') as HTMLSelectElement | null;
    const catFilter = container.querySelector('#codex-reaction-cat-filter') as HTMLSelectElement | null;
    const listGrid = container.querySelector('#codex-reaction-list-grid') as HTMLElement | null;
    const countBadge = container.querySelector('#codex-reaction-count') as HTMLElement | null;

    const renderFilteredCards = () => {
      const results = searchElementalReactions(
        this.reactionSearchQuery,
        this.reactionElementFilter,
        this.reactionCategoryFilter
      );

      if (countBadge) {
        countBadge.textContent = `${results.length} / ${ELEMENTAL_REACTIONS.length} Phản Ứng`;
      }

      if (listGrid) {
        if (results.length === 0) {
          listGrid.innerHTML = `
            <div style="grid-column: 1 / -1; padding: 30px; text-align: center; color: #94a3b8;">
              <span style="font-size: 32px;">🔍</span>
              <p style="margin-top: 8px; font-size: 14px;">Không tìm thấy phản ứng nào phù hợp với từ khóa hoặc bộ lọc.</p>
            </div>
          `;
          return;
        }

        listGrid.innerHTML = results.map((r) => this.renderReactionCardHtml(r)).join('');
      }
    };

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.reactionSearchQuery = (e.target as HTMLInputElement).value;
        renderFilteredCards();
      });
    }

    if (elemFilter) {
      elemFilter.addEventListener('change', (e) => {
        this.reactionElementFilter = (e.target as HTMLSelectElement).value;
        renderFilteredCards();
      });
    }

    if (catFilter) {
      catFilter.addEventListener('change', (e) => {
        this.reactionCategoryFilter = (e.target as HTMLSelectElement).value;
        renderFilteredCards();
      });
    }
  }

  private renderReactionCardHtml(r: (typeof ELEMENTAL_REACTIONS)[0]): string {
    const triggerIcon = ELEMENT_ICONS[r.triggerElement] || '✨';
    const triggerColor = ELEMENT_COLORS[r.triggerElement] || '#ffffff';
    const reqElem = STATUS_TO_ELEMENT[r.requiredStatus] || 'PHYSICAL';
    const reqColor = ELEMENT_COLORS[reqElem] || '#ffffff';
    const reqIcon = ELEMENT_ICONS[reqElem] || '✨';

    let categoryBadge = '';
    if (r.category === 'DRAGON_BOOST') {
      categoryBadge = '<span class="reaction-cat-badge dragon-cat">🐉 Long Uy Khuếch Đại</span>';
    } else if (r.category === 'FAIRY_BLESS') {
      categoryBadge = '<span class="reaction-cat-badge fairy-cat">🧚 Tiên Linh Tăng Phúc</span>';
    } else if (r.category === 'DARK_SYNERGY') {
      categoryBadge = '<span class="reaction-cat-badge dark-cat">🔮 Hắc Ám Thôn Phệ</span>';
    } else {
      categoryBadge = '<span class="reaction-cat-badge natural-cat">🌿 Phản Ứng Tự Nhiên</span>';
    }

    return `
      <div class="reaction-card sp-card" style="border-left-color: ${triggerColor}">
        <div class="reaction-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="reaction-title" style="color: ${triggerColor}">${r.name}</span>
            ${categoryBadge}
          </div>
          <span class="reaction-mult-badge">x${r.damageMultiplier} DMG</span>
        </div>
        <div class="reaction-formula">
          <span class="formula-elem" style="color: ${reqColor}">
            ${reqIcon} Trạng thái ${r.requiredStatus} (${ELEMENT_NAMES[reqElem].split(' ')[0]})
          </span>
          <span class="formula-plus">+</span>
          <span class="formula-elem" style="color: ${triggerColor}">
            ${triggerIcon} Đòn đánh ${ELEMENT_NAMES[r.triggerElement]}
          </span>
          <span class="formula-arrow">➔</span>
          <span class="formula-result" style="color: ${triggerColor}">${r.label}</span>
        </div>
        <p class="reaction-desc">${r.description}</p>
      </div>
    `;
  }

  /**
   * HTML View for Elemental Reactions (with Live Search and Category/Element Filters)
   */
  public getElementalReactionsHtml(): string {
    const results = searchElementalReactions(
      this.reactionSearchQuery,
      this.reactionElementFilter,
      this.reactionCategoryFilter
    );

    const cardsHtml = results.map((r) => this.renderReactionCardHtml(r)).join('');

    return `
      <div class="sp-section sp-card">
        <h4 class="sp-sec-title">💥 BÁCH KHOA PHẢN ỨNG NGUYÊN TỐ (ELEMENTAL REACTIONS & COMBOS)</h4>
        <p class="sp-desc">
          Khi một kẻ địch đang chịu <b>Hiệu ứng trạng thái</b> và trúng tiếp đòn đánh mang <b>Nguyên tố kích hoạt phù hợp</b>, phản ứng sẽ bùng nổ, nhân bội sát thương và tạo ra các hiệu ứng hủy diệt!
        </p>
        <div class="reaction-rules-box">
          <div class="reaction-rule-pill"><span style="color: #f97316;">🐉 Long Uy:</span> Tăng uy lực và bộc phát sát thương cho mọi nguyên tố phối hợp cùng Rồng.</div>
          <div class="reaction-rule-pill"><span style="color: #f472b6;">🧚 Tiên Linh:</span> Tăng phúc mọi chiêu nguyên tố, <b>ngoại trừ Hắc Ám, Ma, Độc và Vật Lý</b>.</div>
          <div class="reaction-rule-pill"><span style="color: #c084fc;">🔮 Ám + Ma:</span> Bùng nổ Minh Giới Ám Hồn x1.85 DMG và gia tốc trảm sát theo % máu đã mất.</div>
          <div class="reaction-rule-pill"><span style="color: #8b5cf6;">🔮 Hắc Ám:</span> Phối hợp khuếch đại với các nguyên tố khác, <b>ngoại trừ Tiên và Quang</b>.</div>
        </div>
      </div>

      <!-- Search & Filters Bar -->
      <div class="sp-section sp-card reaction-filter-section">
        <div class="reaction-search-row">
          <div class="reaction-input-wrap">
            <span class="reaction-search-icon">🔍</span>
            <input 
              type="text" 
              id="codex-reaction-search" 
              class="reaction-search-input" 
              placeholder="Nhập tên phản ứng, hiệu ứng, đòn đánh, nguyên tố (VD: Bùng Cháy, Rồng, Tiên, Ám + Ma, Sốc Điện...)" 
              value="${this.reactionSearchQuery}" 
            />
          </div>
          <select id="codex-reaction-cat-filter" class="codex-filter-select">
            <option value="ALL" ${this.reactionCategoryFilter === 'ALL' ? 'selected' : ''}>🏷️ Mọi Nhóm Phối Hợp</option>
            <option value="NATURAL" ${this.reactionCategoryFilter === 'NATURAL' ? 'selected' : ''}>🌿 Phản Ứng Tự Nhiên</option>
            <option value="DRAGON_BOOST" ${this.reactionCategoryFilter === 'DRAGON_BOOST' ? 'selected' : ''}>🐉 Rồng: Long Uy Khuếch Đại</option>
            <option value="FAIRY_BLESS" ${this.reactionCategoryFilter === 'FAIRY_BLESS' ? 'selected' : ''}>🧚 Tiên: Tiên Linh Tăng Phúc</option>
            <option value="DARK_SYNERGY" ${this.reactionCategoryFilter === 'DARK_SYNERGY' ? 'selected' : ''}>🔮 Hắc Ám & Ám + Ma</option>
          </select>
          <select id="codex-reaction-elem-filter" class="codex-filter-select">
            <option value="ALL" ${this.reactionElementFilter === 'ALL' ? 'selected' : ''}>✨ Mọi Hệ Nguyên Tố</option>
            ${ALL_15_ELEMENTS.map((el) => `
              <option value="${el}" ${this.reactionElementFilter === el ? 'selected' : ''}>
                ${ELEMENT_NAMES[el]} (${el})
              </option>
            `).join('')}
          </select>
        </div>
        <div class="reaction-filter-footer">
          <span id="codex-reaction-count" class="reaction-count-tag">${results.length} / ${ELEMENTAL_REACTIONS.length} Phản Ứng</span>
          <span class="reaction-tip-tag">💡 Mẹo: Dùng Tháp Phù Thủy (2 Khe Nguyên Tố) hoặc phối hợp Tháp Cung + Tháp Phép để kích hoạt liên tục!</span>
        </div>
      </div>

      <div class="sp-section">
        <div class="reactions-list-grid" id="codex-reaction-list-grid">
          ${cardsHtml}
        </div>
      </div>
    `;
  }

  /**
   * Detailed View for a Single Element including:
   * - Detailed Dossier & Status Mechanics
   * - 4 Building Imbue Breakdown
   * - ⚔️ Offensive Lookup Table (Khi dùng hệ này tấn công 15 hệ khác)
   * - 🛡️ Defensive Lookup Table (Khi hệ này nhận sát thương từ 15 hệ khác)
   * - 💥 Synergy Lookup Table (Toàn bộ phản ứng kết hợp với các hệ khác)
   * - Sample Monsters
   */
  public getSingleElementDetailHtml(elem: ElementType): string {
    const def = ALL_ELEMENT_DEFINITIONS[elem];
    if (!def) return '<p>Không có dữ liệu nguyên tố.</p>';
    const color = ELEMENT_COLORS[elem];
    const icon = ELEMENT_ICONS[elem];

    // 1. Generate 3 Lookup Tables
    const offensiveRows = getElementOffensiveTable(elem);
    const defensiveRows = getElementDefensiveTable(elem);
    const synergyRows = getElementSynergyTable(elem);

    // Render Table 1: Offensive
    const offensiveTableHtml = `
      <div class="table-responsive lookup-table-wrap">
        <table class="stats-table lookup-table">
          <thead>
            <tr>
              <th style="width: 170px;">Hệ Mục Tiêu</th>
              <th style="width: 130px;">Hệ Số / Đánh Giá</th>
              <th style="width: 140px;">Tỉ Lệ Sát Thương</th>
              <th>Ghi Chú Chiến Thuật Khi Tấn Công</th>
            </tr>
          </thead>
          <tbody>
            ${offensiveRows.map((r) => {
              const targetDef = ALL_ELEMENT_DEFINITIONS[r.targetElement];
              const tColor = ELEMENT_COLORS[r.targetElement];
              const tIcon = ELEMENT_ICONS[r.targetElement];

              let badgeClass = 'badge-normal';
              let barColor = '#94a3b8';
              if (r.category === 'SUPER_EFFECTIVE') {
                badgeClass = 'badge-super-weak';
                barColor = '#ef4444';
              } else if (r.category === 'EFFECTIVE') {
                badgeClass = 'badge-weak';
                barColor = '#fbbf24';
              } else if (r.category === 'RESISTED') {
                badgeClass = 'badge-resist';
                barColor = '#38bdf8';
              } else if (r.category === 'IMMUNE') {
                badgeClass = 'badge-immune';
                barColor = '#64748b';
              }

              const barWidth = Math.min(100, Math.round((r.multiplier / 2.0) * 100));

              return `
                <tr class="lookup-row ${badgeClass}">
                  <td>
                    <span class="lookup-elem-cell" style="color: ${tColor};">
                      <span class="le-icon">${tIcon}</span>
                      <b>${targetDef.nameVi}</b>
                    </span>
                  </td>
                  <td>
                    <span class="lookup-badge ${badgeClass}">${r.label}</span>
                  </td>
                  <td>
                    <div class="lookup-bar-cell">
                      <div class="lookup-bar-bg">
                        <div class="lookup-bar-fill" style="width: ${barWidth}%; background: ${barColor};"></div>
                      </div>
                      <span class="lookup-bar-pct" style="color: ${barColor};">${r.percentage}%</span>
                    </div>
                  </td>
                  <td class="lookup-note-cell">${r.note}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Render Table 2: Defensive
    const defensiveTableHtml = `
      <div class="table-responsive lookup-table-wrap">
        <table class="stats-table lookup-table">
          <thead>
            <tr>
              <th style="width: 170px;">Hệ Tấn Công Vào</th>
              <th style="width: 130px;">Sát Thương Nhận</th>
              <th style="width: 140px;">Tỉ Lệ Chịu Đòn</th>
              <th>Đặc Tính Phòng Thủ / Nguy Cơ</th>
            </tr>
          </thead>
          <tbody>
            ${defensiveRows.map((r) => {
              const atkDef = ALL_ELEMENT_DEFINITIONS[r.attackerElement];
              const aColor = ELEMENT_COLORS[r.attackerElement];
              const aIcon = ELEMENT_ICONS[r.attackerElement];

              let badgeClass = 'badge-normal';
              let barColor = '#94a3b8';
              if (r.category === 'SUPER_WEAK') {
                badgeClass = 'badge-super-weak';
                barColor = '#ef4444';
              } else if (r.category === 'WEAK') {
                badgeClass = 'badge-weak';
                barColor = '#f97316';
              } else if (r.category === 'RESIST') {
                badgeClass = 'badge-resist';
                barColor = '#34d399';
              } else if (r.category === 'IMMUNE') {
                badgeClass = 'badge-immune';
                barColor = '#64748b';
              }

              const barWidth = Math.min(100, Math.round((r.multiplier / 2.0) * 100));

              return `
                <tr class="lookup-row ${badgeClass}">
                  <td>
                    <span class="lookup-elem-cell" style="color: ${aColor};">
                      <span class="le-icon">${aIcon}</span>
                      <b>${atkDef.nameVi}</b>
                    </span>
                  </td>
                  <td>
                    <span class="lookup-badge ${badgeClass}">${r.label}</span>
                  </td>
                  <td>
                    <div class="lookup-bar-cell">
                      <div class="lookup-bar-bg">
                        <div class="lookup-bar-fill" style="width: ${barWidth}%; background: ${barColor};"></div>
                      </div>
                      <span class="lookup-bar-pct" style="color: ${barColor};">${r.percentage}%</span>
                    </div>
                  </td>
                  <td class="lookup-note-cell">${r.note}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Render Table 3: Synergies & Reactions
    const synergyTableHtml = synergyRows.length > 0
      ? `
        <div class="table-responsive lookup-table-wrap">
          <table class="stats-table lookup-table">
            <thead>
              <tr>
                <th style="width: 160px;">Hệ Phối Hợp</th>
                <th style="width: 140px;">Vai Trò Kết Hợp</th>
                <th style="width: 200px;">Tên Phản Ứng</th>
                <th style="width: 110px;">Khuếch Đại</th>
                <th>Hiệu Ứng Bộc Phát Chi Tiết</th>
              </tr>
            </thead>
            <tbody>
              ${synergyRows.map((s) => {
                const partnerDef = ALL_ELEMENT_DEFINITIONS[s.partnerElement];
                const pColor = ELEMENT_COLORS[s.partnerElement];
                const pIcon = ELEMENT_ICONS[s.partnerElement];
                const isSetup = s.role === 'SETUP';

                return `
                  <tr class="lookup-row">
                    <td>
                      <span class="lookup-elem-cell" style="color: ${pColor};">
                        <span class="le-icon">${pIcon}</span>
                        <b>${partnerDef?.nameVi || s.partnerElement}</b>
                      </span>
                    </td>
                    <td>
                      <span class="lookup-role-badge ${isSetup ? 'role-setup' : 'role-trigger'}">
                        ${isSetup ? '🔵 Trạng Thái Nền' : '⚡ Đòn Kích Nổ'}
                      </span>
                    </td>
                    <td>
                      <span class="synergy-reaction-name" style="color: ${ELEMENT_COLORS[s.reaction.triggerElement]}; font-weight: 700;">
                        ${s.reaction.label} ${s.reaction.name}
                      </span>
                    </td>
                    <td>
                      <span class="reaction-mult-badge">x${s.reaction.damageMultiplier}</span>
                    </td>
                    <td class="lookup-note-cell">${s.reaction.description}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `
      : '<p style="color: #94a3b8; padding: 14px 0;">Hệ này hiện chủ yếu tạo sát thương nền và liên kết cơ bản với các bùa chú khác.</p>';

    return `
      <!-- 1. Hero Dossier Card -->
      <div class="sp-section sp-card highlighted-detail-card" style="border-left: 6px solid ${color};">
        <div class="elem-detail-header">
          <span class="elem-icon-huge" style="color: ${color}">${icon}</span>
          <div>
            <h2 class="elem-detail-title" style="color: ${color}">Hệ ${def.nameVi} (${elem})</h2>
            <span class="elem-detail-role">${def.badge}</span>
          </div>
        </div>
        <p class="elem-detail-desc">${def.nature}</p>

        <!-- Status Effect & Mechanics Highlights -->
        <div class="elem-effect-box" style="border-left-color: ${color}; margin-top: 14px;">
          <h4 style="color: ${color}">⚡ Hiệu Ứng Trạng Thái Đặc Trưng: ${def.statusEffectName}</h4>
          <p style="margin-bottom: 8px;">${def.statusEffectDesc}</p>
          <ul class="combat-highlight-list">
            ${def.combatHighlights.map((h) => `<li>🔹 <b>${h}</b></li>`).join('')}
          </ul>
        </div>

        <!-- 4 Building Imbue Breakdown -->
        <div class="building-imbue-breakdown-box" style="margin-top: 14px;">
          <h4 class="lookup-sec-title" style="color: #38bdf8;">🏰 Ứng Dụng Khi Khảm Lên 4 Loại Công Trình:</h4>
          <div class="towers-imbue-grid">
            <div class="tower-imbue-col">
              <span class="ti-title">🛡️ Trại Dân Quân (Barracks)</span>
              <p class="ti-desc">${def.buildingEffects.barracks}</p>
            </div>
            <div class="tower-imbue-col">
              <span class="ti-title">🏹 Tháp Cung (Archer)</span>
              <p class="ti-desc">${def.buildingEffects.archer}</p>
            </div>
            <div class="tower-imbue-col">
              <span class="ti-title">🔮 Tháp Phù Thủy (Mage)</span>
              <p class="ti-desc">${def.buildingEffects.mage}</p>
            </div>
            <div class="tower-imbue-col">
              <span class="ti-title">💣 Pháo Cối (Artillery)</span>
              <p class="ti-desc">${def.buildingEffects.artillery}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. BẢNG TRA CỨU GÂY SÁT THƯƠNG -->
      <div class="sp-section sp-card" style="border-left: 4px solid #4ade80;">
        <div class="sp-sec-header">
          <h4 class="sp-sec-title" style="color: #4ade80;">⚔️ BẢNG TRA CỨU GÂY SÁT THƯƠNG (OFFENSIVE TABLE)</h4>
          <span class="sp-hint">Khi dùng Hệ ${def.nameVi} tấn công 15 hệ khác</span>
        </div>
        <p class="sp-desc" style="margin-bottom: 10px;">
          Bảng dưới đây thống kê chính xác hệ số khuếch đại sát thương khi đòn đánh mang Hệ <b>${def.nameVi}</b> đánh trúng quái vật thuộc từng hệ nguyên tố:
        </p>
        ${offensiveTableHtml}
      </div>

      <!-- 3. BẢNG TRA CỨU NHẬN SÁT THƯƠNG -->
      <div class="sp-section sp-card" style="border-left: 4px solid #f87171;">
        <div class="sp-sec-header">
          <h4 class="sp-sec-title" style="color: #f87171;">🛡️ BẢNG TRA CỨU NHẬN SÁT THƯƠNG (DEFENSIVE TABLE)</h4>
          <span class="sp-hint">Khi mục tiêu mang Hệ ${def.nameVi} bị 15 hệ khác tấn công</span>
        </div>
        <p class="sp-desc" style="margin-bottom: 10px;">
          Bảng dưới đây cho biết mức độ nhạy cảm và nguy cơ bị khắc chế của quái vật mang Hệ <b>${def.nameVi}</b> trước các loại sát thương từ tháp và binh lính của bạn:
        </p>
        ${defensiveTableHtml}
      </div>

      <!-- 4. BẢNG PHỐI HỢP HIỆU ỨNG & PHẢN ỨNG NGUYÊN TỐ -->
      <div class="sp-section sp-card" style="border-left: 4px solid #fbbf24;">
        <div class="sp-sec-header">
          <h4 class="sp-sec-title" style="color: #fbbf24;">💥 BẢNG PHỐI HỢP HIỆU ỨNG (SYNERGY & REACTIONS)</h4>
          <span class="sp-hint">${synergyRows.length} Phối hợp liên quan</span>
        </div>
        <p class="sp-desc" style="margin-bottom: 10px;">
          Các phản ứng hóa học ma thuật được kích hoạt khi Hệ <b>${def.nameVi}</b> kết hợp cùng các nguyên tố khác (qua Tháp Phù Thủy song hệ hoặc chuỗi tháp phối hợp):
        </p>
        ${synergyTableHtml}
      </div>

      <!-- Sample Monsters & Advice -->
      <div class="sp-section sp-card" style="background: #0b1322;">
        <div class="sample-monsters-box">
          <b>👾 Quái vật điển hình mang Hệ ${def.nameVi}:</b> 
          <span style="color: #38bdf8;">${def.sampleMonsters.join(', ') || 'Đang cập nhật'}</span>
        </div>
        <p class="sp-tip-text" style="margin-top: 10px;">
          💡 Lời khuyên chiến lược: Khi quái vật chủ đạo trong đợt mang Hệ ${def.nameVi}, hãy tra cứu <b>Bảng Nhận Sát Thương</b> ở trên để chọn đúng các hệ khắc tinh gây x1.5 đến x2.0 sát thương bạo kích, đồng thời tránh dùng các hệ bị kháng!
        </p>
      </div>
    `;
  }
}
