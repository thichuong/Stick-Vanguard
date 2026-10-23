import {
  ELEMENT_COLORS,
  ELEMENT_ICONS,
  ELEMENT_NAMES,
  ELEMENT_CODEX_DETAILS,
  ELEMENTAL_REACTIONS
} from '../../config/elements.config.js';
import { ElementType } from '../../types/elements.types.js';
import { ALL_15_ELEMENTS, STATUS_TO_ELEMENT } from './CodexTypes.js';

export class CodexElements {
  public currentElementSubTab: string = 'OVERVIEW';

  public renderElementsCategory(
    contentEl: HTMLElement,
    titleEl: HTMLElement,
    iconEl: HTMLElement,
    badgeEl: HTMLElement,
    highlightElem?: string
  ): void {
    if (highlightElem) {
      this.currentElementSubTab = highlightElem;
    }

    titleEl.textContent = 'Hệ Thống Nguyên Tố & Ma Trận Khắc Chế (15 Hệ)';
    iconEl.textContent = '✨';
    badgeEl.textContent = '15 Nguyên Tố • 14 Hiệu Ứng • 11 Phản Ứng Phối Hợp';

    const sidebarNav = contentEl.querySelector('.codex-sidebar-nav') as HTMLElement | null;
    const detailPane = contentEl.querySelector('#codex-element-detail') as HTMLElement | null;

    const getRightHtml = (sub: string) => {
      if (sub === 'OVERVIEW') {
        return this.getElementsOverviewHtml();
      } else if (sub === 'REACTIONS') {
        return this.getElementalReactionsHtml();
      } else {
        return this.getSingleElementDetailHtml(sub as ElementType);
      }
    };

    const updateView = (sub: string) => {
      this.currentElementSubTab = sub;

      const currentSidebar = contentEl.querySelector('.codex-sidebar-nav') as HTMLElement | null;
      const currentDetail = contentEl.querySelector('#codex-element-detail') as HTMLElement | null;

      if (currentSidebar && currentDetail) {
        // Update active class on buttons without touching DOM structure or resetting scroll
        currentSidebar.querySelectorAll('[data-sub-elem]').forEach((btn) => {
          const s = btn.getAttribute('data-sub-elem');
          const isActive = s === sub;
          btn.classList.toggle('active', isActive);

          if (s && s !== 'OVERVIEW' && s !== 'REACTIONS') {
            const color = ELEMENT_COLORS[s as ElementType];
            if (color) {
              (btn as HTMLElement).style.borderColor = isActive ? color : '';
              (btn as HTMLElement).style.boxShadow = isActive ? `inset 3px 0 0 ${color}` : '';
            }
          }
        });

        // Update detail pane
        currentDetail.innerHTML = getRightHtml(sub);
        currentDetail.scrollTop = 0;

        // Rebind overview quick jump cards
        if (sub === 'OVERVIEW') {
          currentDetail.querySelectorAll('.elem-quick-jump').forEach((card) => {
            card.addEventListener('click', (e) => {
              const targetSub = (e.currentTarget as HTMLElement).getAttribute('data-sub-elem');
              if (targetSub) {
                updateView(targetSub);
              }
            });
          });
        }
        return;
      }

      // If sidebar doesn't exist, do full render
      this.renderElementsCategory(contentEl, titleEl, iconEl, badgeEl, sub);
    };

    // If sidebar and detail pane already exist, just update active sub-element
    if (sidebarNav && detailPane) {
      updateView(this.currentElementSubTab);
      return;
    }

    const rightElementHtml = getRightHtml(this.currentElementSubTab);

    contentEl.innerHTML = `
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
    contentEl.querySelectorAll('[data-sub-elem]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const sub = (e.currentTarget as HTMLElement).getAttribute('data-sub-elem');
        if (sub) {
          updateView(sub);
        }
      });
    });

    // Bind quick jump cards if overview is active
    contentEl.querySelectorAll('.elem-quick-jump').forEach((card) => {
      card.addEventListener('click', (e) => {
        const sub = (e.currentTarget as HTMLElement).getAttribute('data-sub-elem');
        if (sub) {
          updateView(sub);
        }
      });
    });
  }

  public getElementsOverviewHtml(): string {
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

  public getElementalReactionsHtml(): string {
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

  public getSingleElementDetailHtml(elem: ElementType): string {
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
}
