# 🛡️ Stick Vanguard (Chiến Binh Người Que Thủ Thành)

**Stick Vanguard** là tựa game thủ thành chiến thuật (Tower Defense & Stickman Strategy) được phát triển bằng **TypeScript**, **Canvas 2D**, và lõi tính toán không gian hiệu năng cao **WebAssembly (Rust)**.

Người chơi sẽ xây dựng, nâng cấp tháp phòng thủ, điều động đội quân người que, rồng lửa, tiên nữ và kích hoạt các phản ứng nguyên tố mạnh mẽ để ngăn chặn các làn sóng quái vật đa dạng trên bộ, dưới nước và trên không.

---

## 🌟 Điểm nổi bật & Tính năng chính

### 1. Hệ thống 15 Hệ Nguyên Tố & Phản Ứng Đa Tầng
- **Nguyên tố cơ bản & nâng cao**: Vật lý, Lửa, Băng, Sấm sét, Đất, Gió, Nước, Độc, Ánh sáng, Bóng tối, Dung nham, Bão tuyết, Hư không, Ma quái, Tâm linh...
- **Ma trận khắc chế & Phản ứng nguyên tố**: Kết hợp các trạng thái nguyên tố (ví dụ: Thiêu đốt + Băng giá $\rightarrow$ Bốc hơi nổ sát thương lan; Sốc điện $\rightarrow$ Giật lan; Đóng băng $\rightarrow$ Khống chế cứng).

### 2. Ba Nhóm Công Trình Phòng Thủ Độc Đáo
- **Tháp Tấn Công (Defense Towers)**: Xạ thủ (Bắn tỉa / Mưa tên), Pháp sư (Phép nguyên tố diện rộng), Pháo binh (Bắn phá tầm xa, mảnh vỡ nổ).
- **Tháp Triệu Hồi (Summon Towers)**: 
  - *Doanh Trại Lính (Barracks)*: Triệu hồi lính chặn đường, cắm cờ điểm tập kết (Rally Point).
  - *Tổ Rồng (Dragon Nest)*: Rồng bay lượn tự do, khạc lửa nguyên tố, chặn đường trên không và mặt đất.
  - *Cây Tinh Linh (Fairy Tree)*: Tiên nữ hỗ trợ hồi máu, thanh tẩy hiệu ứng xấu và bắn phép từ xa.
  - *Bàn Thờ Anh Linh (Heroic Altar)*: Triệu hồi linh hồn tử sĩ đã ngã xuống tiếp tục chiến đấu dưới dạng Ghost bất tử.
- **Bẫy Đường & Bẫy Nước (Traps)**: Bẫy chông gai xuyên giáp, bẫy lửa thiêu đốt, bẫy băng làm chậm, lưới trói kéo quái bay rơi xuống đất.

### 3. Lõi Tính Toán WebAssembly Hiệu Năng Cao (`wasm-sim`)
- **Kiến trúc WASM-Centric Core bằng Rust**: Toàn bộ vị trí, vận tốc, máu và góc xoay của quái vật được lưu trữ trong `WebAssembly.Memory` dưới dạng mảng số thực phẳng **Flat Stride (12 `f32` = 48 bytes/quái)**.
- **Zero-Copy Direct Memory View**: Canvas Renderer đọc trực tiếp mảng toạ độ hiển thị qua `Float32Array` mà không tốn chi phí sao chép dữ liệu ($0\text{ms}$).
- **Lưới Băm Không Gian (Spatial Hash Grid) Nội tại**: Tìm mục tiêu xa nhất trên đường đi và tính sát thương lan diện rộng với độ phức tạp $O(1)$.
- **Smart LOD & Atlas Baking**: Tự động chuyển đổi giữa các cấp độ hiển thị (FULL, MEDIUM, HIGH_CROWD) dựa trên mật độ đơn vị, duy trì ổn định 60 FPS ngay cả khi có hàng ngàn quái vật trên màn hình.
- **Pure Rust WebAssembly & WebGL2 Engine**: Vận hành toàn bộ vòng lặp mô phỏng, tính toán nguyên tố, quy tắc chiến đấu và kết xuất GPU Atlas bằng Rust + WebGL2. Canvas 2D chỉ phục vụ lớp phủ HUD overlay mỏng.

### 4. Cẩm Nang Toàn Thư (Codex) & Quản Trị Trận Đấu
- Cẩm nang tích hợp trực tiếp trong game cho phép tra cứu chi tiết chỉ số tháp, lính, quái vật, cơ chế CC và bảng phản ứng nguyên tố.
- Tự động lưu trữ cài đặt (StorageService), tuỳ chỉnh tốc độ trận đấu ($1\times, 2\times, 4\times$), số lượng đợt quái tùy biến và hệ thống âm thanh WebAudio thủ tục không cần tải file âm thanh ngoài.

---

## 🛠️ Công nghệ Sử dụng

- **Ngôn ngữ**: TypeScript 5 (Strict Mode), Rust 2021 (WebAssembly Target `wasm32-unknown-unknown`)
- **Render Engine**: Canvas 2D Context với Offscreen Map Cache & Procedural Atlas Baking
- **WASM Toolchain**: `wasm-bindgen`
- **Build Tool**: Vite 5
- **Testing**: Vitest 1.6 (10 test suites, 145 unit tests)
- **Deployment**: Hỗ trợ Cloudflare Workers / Static Hosting

---

## 🚀 Hướng dẫn Cài đặt & Chạy Dự án

### Yêu cầu môi trường
- **Node.js**: v18.0.0 trở lên
- **Rust & Cargo** (tuỳ chọn, chỉ cần khi muốn sửa và build lại mã nguồn Rust trong `wasm-sim/`):
  ```bash
  rustup target add wasm32-unknown-unknown
  cargo install wasm-bindgen-cli
  ```

### Các bước khởi chạy

1. **Cài đặt dependencies**:
   ```bash
   npm install
   ```

2. **Chạy môi trường phát triển (Dev Server)**:
   ```bash
   npm run dev
   ```
   Mở trình duyệt tại địa chỉ hiển thị trên terminal (mặc định: `http://localhost:5173`).

3. **Biên dịch Rust WebAssembly (khi sửa code trong `wasm-sim/`)**:
   ```bash
   npm run build:wasm
   ```

4. **Chạy bộ kiểm thử (Unit Tests)**:
   ```bash
   npm test
   ```

5. **Đóng gói Production**:
   ```bash
   npm run build
   ```
   Kết quả đóng gói hoàn chỉnh (HTML, CSS, JS bundle và file `.wasm`) sẽ nằm trong thư mục `dist/`.

---

## ⌨️ Phím tắt Điều khiển Nhanh

| Phím tắt | Chức năng |
|---|---|
| `Space` | Tạm dừng / Tiếp tục trận đấu |
| `N` | Bắt đầu đợt quái tiếp theo (hoặc gọi đợt sớm nhận vàng thưởng) |
| `1` | Chọn nhanh Tháp Xạ Thủ |
| `2` | Chọn nhanh Tháp Pháp Sư |
| `3` | Chọn nhanh Doanh Trại Lính |
| `4` | Chọn nhanh Tháp Pháo Binh |
| `5` | Chọn nhanh Tổ Rồng |
| `6` | Chọn nhanh Cây Tinh Linh |
| `7` | Chọn nhanh Bàn Thờ Anh Linh |
| `Esc` | Hủy chọn tháp / Đóng bảng Cẩm nang hoặc Cài đặt |
| `Shift + Click` | Đặt nhiều tháp liên tục |

---

## 📁 Cấu trúc Thư mục Dự án

```
stick-vanguard/
├── index.html                 # Giao diện chính: #left-panel, #canvas-stage, #right-panel, modal
├── package.json               # Cấu hình dự án & scripts (dev, build, build:wasm, test)
├── wasm-sim/                  # MÃ NGUỒN RUST WEB ASSEMBLY
│   ├── Cargo.toml             #   Cấu hình crate cdylib, LTO, opt-level=3
│   └── src/lib.rs             #   Cấu trúc EnemyPod, SpatialGrid Rust, động học đường đi
├── src/
│   ├── main.ts                # Khởi tạo game, bootstrap WASM, vòng lặp animation
│   ├── style.css              # Giao diện CSS
│   ├── wasm/                  # File wasm_sim.js và wasm_sim_bg.wasm được sinh tự động
│   ├── types/                 # Định nghĩa kiểu dữ liệu (elements.types.ts, entities.types.ts)
│   ├── config/                # Dữ liệu cấu hình cân bằng (towers, elements, enemies, maps)
│   ├── core/                  # Quản lý trạng thái và mô phỏng
│   │   ├── GameState.ts       #   Trạng thái toàn cục của trận đấu
│   │   ├── WasmBridge.ts      #   Cầu nối Zero-Copy Float32Array & ánh xạ ID
│   │   ├── SimulationEngine.ts#   Vòng lặp Fixed Timestep 60Hz & sub-stepping
│   │   ├── SpatialIndex.ts    #   Lưới băm không gian O(1)
│   │   └── ObjectPool.ts      #   Tái sử dụng object hạt và chữ nổi không sinh rác GC
│   ├── systems/               # Các hệ thống gameplay tĩnh (Wave, Combat, Tower, Trap, CC...)
│   ├── render/                # Các bộ vẽ Canvas 2D, Smart LOD, Procedural Sprite Atlas
│   ├── ui/                    # Quản lý giao diện HUD trái, Inspector phải, Modal và Codex
│   └── __tests__/             # 10 file kiểm thử tự động với Vitest
└── .agents/skills/            # Skill tài liệu hướng dẫn bảo trì cho AI Agent
```

---

## 📜 Giấy phép & Bản quyền

Dự án phát triển cho mục đích giáo dục, thử nghiệm công nghệ Canvas 2D + WebAssembly và giải trí cá nhân. Mọi tài nguyên âm thanh và đồ họa đều được tạo thủ tục bằng mã nguồn (procedural generation).

