export class CodexSoldiers {
  public getSoldiersCategoryHtml(): string {
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
                <td style="color: #38bdf8; font-weight: 700;">184.8 DPS</td>
                <td>170 px</td>
                <td><b>Bộ, Bay, Bơi (Đa Miền)</b></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
}

