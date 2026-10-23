export class CodexImbue {
  public getBuildingImbueCategoryHtml(): string {
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
              <b>❄️ Băng (Ice) - Chốt Chặn Băng Giá:</b> Đòn đánh làm chậm quái 45% và có <b>25% tỉ lệ Đóng Băng 0.6s</b>, bắt quái vật đứng im chịu trận.
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
              <b>🌪️ Cung Gió (Wind Gale):</b> Đẩy lùi quái ngược lộ trình tiến công với tỉ lệ cao (55% quái bay / 25% quái bộ)!
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
}

