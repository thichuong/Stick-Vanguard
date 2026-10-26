import { UI_ICONS } from '../../config/ui/icons/index.js';
import { ELEMENT_ICONS } from '../../config/elements.config.js';

export class CodexNavigation {
  public currentNavSubTab: string = 'OVERVIEW';

  public renderNavigationCategory(
    contentEl: HTMLElement,
    titleEl: HTMLElement,
    iconEl: HTMLElement,
    badgeEl: HTMLElement,
    highlightNav?: string
  ): void {
    if (highlightNav) {
      this.currentNavSubTab = highlightNav;
    }

    titleEl.textContent = 'Quy Tắc Di Chuyển Của Quái Vật';
    iconEl.innerHTML = UI_ICONS.COMPASS;
    badgeEl.textContent = 'Đường Bộ, Đường Bay & Đường Thủy';

    const sidebarNav = contentEl.querySelector('.codex-sidebar-nav') as HTMLElement | null;
    const detailPane = contentEl.querySelector('#codex-nav-detail') as HTMLElement | null;

    const getRightHtml = (sub: string) => {
      switch (sub) {
        case 'WALK':
          return this.getSingleNavDetailHtml('WALK');
        case 'FLY':
          return this.getSingleNavDetailHtml('FLY');
        case 'SWIM':
          return this.getSingleNavDetailHtml('SWIM');
        case 'OVERVIEW':
        default:
          return this.getNavOverviewHtml();
      }
    };

    const updateView = (sub: string) => {
      this.currentNavSubTab = sub;

      const currentSidebar = contentEl.querySelector('.codex-sidebar-nav') as HTMLElement | null;
      const currentDetail = contentEl.querySelector('#codex-nav-detail') as HTMLElement | null;

      if (currentSidebar && currentDetail) {
        currentSidebar.querySelectorAll('[data-sub-nav]').forEach((btn) => {
          btn.classList.toggle('active', btn.getAttribute('data-sub-nav') === sub);
        });
        currentDetail.innerHTML = getRightHtml(sub);
        currentDetail.scrollTop = 0;
        return;
      }

      this.renderNavigationCategory(contentEl, titleEl, iconEl, badgeEl, sub);
    };

    if (sidebarNav && detailPane) {
      updateView(this.currentNavSubTab);
      return;
    }

    const rightNavHtml = getRightHtml(this.currentNavSubTab);

    contentEl.innerHTML = `
      <div class="codex-master-layout">
        <aside class="codex-sidebar-nav">
          <div class="codex-sidebar-title">
            <span>TUYẾN ĐƯỜNG & ĐỊA HÌNH</span>
          </div>
          <button class="codex-subnav-btn ${this.currentNavSubTab === 'OVERVIEW' ? 'active' : ''}" data-sub-nav="OVERVIEW">
            <span style="font-size: 18px; display: inline-flex; align-items: center;">${UI_ICONS.MAP}</span>
            <div>
              <div style="font-weight: 700;">Tổng Quan 3 Hành Lang</div>
              <div style="font-size: 11px; color: #64748b;">Quy tắc chiến lược phân luồng</div>
            </div>
          </button>
          <button class="codex-subnav-btn ${this.currentNavSubTab === 'WALK' ? 'active' : ''}" data-sub-nav="WALK">
            <span style="font-size: 18px; display: inline-flex; align-items: center;">${UI_ICONS.WALK}</span>
            <div>
              <div style="font-weight: 700;">Tuyến Đường Bộ (Ground)</div>
              <div style="font-size: 11px; color: #64748b;">Đường mòn uốn lượn mặt đất</div>
            </div>
          </button>
          <button class="codex-subnav-btn ${this.currentNavSubTab === 'FLY' ? 'active' : ''}" data-sub-nav="FLY">
            <span style="font-size: 18px; display: inline-flex; align-items: center;">${UI_ICONS.FLY}</span>
            <div>
              <div style="font-weight: 700;">Tuyến Đường Bay (Air)</div>
              <div style="font-size: 11px; color: #64748b;">Bay lơ lửng, bỏ qua lính cận chiến</div>
            </div>
          </button>
          <button class="codex-subnav-btn ${this.currentNavSubTab === 'SWIM' ? 'active' : ''}" data-sub-nav="SWIM">
            <span style="font-size: 18px; display: inline-flex; align-items: center;">${UI_ICONS.SWIM}</span>
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
    contentEl.querySelectorAll('[data-sub-nav]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const sub = (e.currentTarget as HTMLElement).getAttribute('data-sub-nav');
        if (sub) {
          updateView(sub);
        }
      });
    });
  }

  public getNavOverviewHtml(): string {
    return `
      <div class="sp-section sp-card">
        <h4 class="sp-sec-title">${UI_ICONS.MAP} BA HÀNH LANG DI CHUYỂN CHIẾN LƯỢC</h4>
        <p class="sp-desc">
          Bản đồ Stick Vanguard được thiết kế với 3 tuyến đường xâm lăng độc lập. Mỗi loại quái vật có cơ chế di chuyển riêng biệt đòi hỏi bạn phải bố trí tháp và bẫy hợp lý:
        </p>
      </div>

      <div class="nav-cards-list-grid">
        <!-- 1. Ground Path -->
        <div class="nav-card">
          <div class="nav-card-header">
            <span class="nav-icon">${UI_ICONS.WALK}</span>
            <div>
              <h4>1. Tuyến Đường Bộ (Ground)</h4>
              <span class="nav-tag">Đường mòn đất uốn lượn</span>
            </div>
          </div>
          <p class="nav-desc">Tuyến đường chính của quái vật bộ binh, kiếm sĩ, dân quân và trùm khổng lồ.</p>
          <ul class="nav-rules-list">
            <li>${UI_ICONS.CHECK} <b>Bị chặn bởi Lính Đánh Gần:</b> Lính bộ binh sẽ nghênh chiến và kìm chân 1v1.</li>
            <li>${UI_ICONS.CHECK} <b>Dẫm bẫy:</b> Dễ dàng dẫm phải Bẫy Chông, Mìn Lửa trên đường.</li>
            <li>${UI_ICONS.CHECK} <b>Mục tiêu của mọi loại tháp:</b> Cung, Phép, Pháo cối và Lính đều đánh được.</li>
          </ul>
        </div>

        <!-- 2. Air Path -->
        <div class="nav-card">
          <div class="nav-card-header">
            <span class="nav-icon">${UI_ICONS.FLY}</span>
            <div>
              <h4>2. Tuyến Đường Bay (Air)</h4>
              <span class="nav-tag air-tag">Đường chéo ngắn nhất về căn cứ</span>
            </div>
          </div>
          <p class="nav-desc">Dơi Quỷ, Rồng Lửa và Khí cầu bay lượn trên không trung với tốc độ cao.</p>
          <ul class="nav-rules-list">
            <li>${UI_ICONS.CROSS} <b>BỎ QUA LÍNH ĐÁNH GẦN:</b> Lính cận chiến không thể với tới!</li>
            <li>${UI_ICONS.CROSS} <b>BỎ QUA BẪY ĐẤT:</b> Bay lơ lửng nên không kích hoạt bẫy dưới đất.</li>
            <li>${UI_ICONS.CROSS} <b>PHÁO CỐI KHÔNG BẮN ĐƯỢC:</b> Không thể nhắm mục tiêu bay.</li>
            <li>${UI_ICONS.TARGET} <b>VŨ KHÍ KHẮC CHẾ:</b> Dùng <b>Tháp Cung</b>, <b>Tháp Phép</b> hoặc chuyển Nhà Lính sang <b>Lính Bắn Tên</b>.</li>
          </ul>
        </div>

        <!-- 3. Water Path -->
        <div class="nav-card">
          <div class="nav-card-header">
            <span class="nav-icon">${UI_ICONS.SWIM}</span>
            <div>
              <h4>3. Tuyến Kênh Sông (Water)</h4>
              <span class="nav-tag water-tag">Dòng sông xanh uốn khúc</span>
            </div>
          </div>
          <p class="nav-desc">Thủy quái, cá dữ và người que biết bơi tiến công men theo lòng sông.</p>
          <ul class="nav-rules-list">
            <li>${UI_ICONS.CROSS} <b>Lính bộ không xuống nước:</b> Không thể cắm cờ tập kết dưới lòng sông.</li>
            <li>${UI_ICONS.CHECK} <b>Bẫy Thủy Lôi:</b> Bẫy Thủy Lôi Băng đặt ở ô bẫy nước phát nổ dưới lòng sông.</li>
            <li>${UI_ICONS.TARGET} <b>VŨ KHÍ KHẮC CHẾ:</b> Dùng <b>Tháp Cung</b>, <b>Tháp Phép</b>, <b>Pháo Cối</b> bao quát sông, hoặc đặt cờ <b>Lính Bắn Tên</b> sát mép sông!</li>
          </ul>
        </div>
      </div>
    `;
  }

  public getSingleNavDetailHtml(mode: 'WALK' | 'FLY' | 'SWIM'): string {
    switch (mode) {
      case 'WALK':
        return `
          <div class="sp-section sp-card highlighted-detail-card" style="border-left: 5px solid #d97706;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
              <span style="font-size: 32px; display: inline-flex; align-items: center;">${UI_ICONS.WALK}</span>
              <div>
                <h3 style="font-size: 20px; color: #f8fafc; margin: 0;">TUYẾN ĐƯỜNG BỘ (GROUND PATH)</h3>
                <span class="sp-hint">Lộ trình dải đất uốn lượn dành cho bộ binh</span>
              </div>
            </div>
            <p class="sp-desc">
              Tuyến đường bộ là trục tiến công đông đảo nhất của quân xâm lăng. Quái vật di chuyển men theo đường mòn đất, tuân thủ các quy tắc chặn đường và bẫy chiến thuật.
            </p>
            <div class="sp-mechanic-box" style="border-left-color: #d97706;">
              <p><b>${UI_ICONS.SHIELD} Khắc chế số 1:</b> <b>Lính Đánh Gần (Melee)</b> - Chốt chặn 1v1 bắt quái vật đứng lại đấu kiếm, tạo vùng bắn lý tưởng cho Pháo Cối và Tháp Cung.</p>
              <p><b>${UI_ICONS.GEAR} Tác dụng bẫy:</b> Kích hoạt 100% các loại <b>Bẫy Chông Gai</b> và <b>Mìn Lửa Hỏa Ngục</b> đặt trên đường.</p>
              <p><b>${ELEMENT_ICONS.EARTH} Điểm yếu hệ:</b> Nhận thêm <b>+20% sát thương từ hệ Đất (EARTH)</b> do rung chấn địa hình mặt đất!</p>
            </div>
          </div>
        `;
      case 'FLY':
        return `
          <div class="sp-section sp-card highlighted-detail-card" style="border-left: 5px solid #10b981;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
              <span style="font-size: 32px; display: inline-flex; align-items: center;">${UI_ICONS.FLY}</span>
              <div>
                <h3 style="font-size: 20px; color: #f8fafc; margin: 0;">TUYẾN ĐƯỜNG BAY (AIRWAYS)</h3>
                <span class="sp-hint">Lộ trình không trung cắt ngang bản đồ ngắn nhất</span>
              </div>
            </div>
            <p class="sp-desc">
              Quái bay sở hữu độ cao (Altitude > 0), bay lơ lửng trên không trung và bỏ qua hoàn toàn các khúc quanh mặt đất để tiến thẳng về nhà chính.
            </p>
            <div class="sp-mechanic-box" style="border-left-color: #10b981;">
              <p><b>${UI_ICONS.CROSS} Miễn dịch mặt đất:</b> Không bị lính cận chiến chặn đường, không dẫm phải bẫy chông hay mìn lửa, và <b>Pháo cối hoàn toàn không bắn được</b>!</p>
              <p><b>${UI_ICONS.TARGET} Vũ khí tiêu diệt:</b> <b>Tháp Cung</b> tốc độ cao, <b>Tháp Phù Thủy</b> sát thương diện rộng và chuyển Nhà Lính sang <b>Lính Bắn Tên</b>.</p>
              <p><b>${ELEMENT_ICONS.WIND} Điểm yếu chí mạng:</b> Rất dễ bị cuồng phong hệ Gió (WIND) đẩy lùi ngược lại lộ trình với tỉ lệ thành công cao (55%)!</p>
            </div>
          </div>
        `;
      case 'SWIM':
        return `
          <div class="sp-section sp-card highlighted-detail-card" style="border-left: 5px solid #06b6d4;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
              <span style="font-size: 32px; display: inline-flex; align-items: center;">${UI_ICONS.SWIM}</span>
              <div>
                <h3 style="font-size: 20px; color: #f8fafc; margin: 0;">TUYẾN KÊNH SÔNG (WATERWAYS)</h3>
                <span class="sp-hint">Dòng kênh nước sâu uốn lượn dành cho thủy quái</span>
              </div>
            </div>
            <p class="sp-desc">
              Tuyến đường thủy dành riêng cho các loài thủy quái bơi lội dưới nước. Thủy quái men theo lòng sông sâu để luồn lách qua các chốt chặn bộ binh thông thường.
            </p>
            <div class="sp-mechanic-box" style="border-left-color: #06b6d4;">
              <p><b>${UI_ICONS.CROSS} Hạn chế lính bộ:</b> Lính bộ binh không thể xuống nước để cắm cờ hay chặn đường 1v1.</p>
              <p><b>${ELEMENT_ICONS.WATER} Vũ khí độc quyền:</b> <b>Bẫy Thủy Lôi Băng</b> đặt trực tiếp dưới nước, nổ đóng băng thủy quái 1.2s!</p>
              <p><b>${UI_ICONS.BOW} Phối hợp viễn chiến:</b> Đặt cờ <b>Lính Bắn Tên</b> ở mép bờ kênh, kết hợp với Tháp Cung và Tháp Phép bao quát mặt nước.</p>
            </div>
          </div>
        `;
    }
  }
}

