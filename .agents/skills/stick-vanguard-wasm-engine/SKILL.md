---
name: stick-vanguard-wasm-engine
description: >-
  Hướng dẫn toàn diện về luồng hoạt động của game Stick Vanguard: kiến trúc WebAssembly Rust Engine (wasm-sim),
  cầu nối WasmBridge, đồng bộ Flat Memory Zero-Copy & Config, pipeline render WebGL2 + GPU Texture Atlas,
  vòng lặp 60Hz, âm thanh WebAudio, và quy trình phát triển/gỡ lỗi an toàn.
---

# Stick Vanguard – Cẩm Nang WebAssembly Core & WebGL2 Render Engine

Tài liệu này cung cấp cho các Agent cái nhìn toàn diện về luồng hoạt động, cấu trúc mã nguồn, quy chuẩn bộ nhớ phẳng (Flat Memory) và pipeline render phần cứng của **Stick Vanguard**.

---

## 1. Tổng Quan Kiến Trúc & Phân Công Tầng

Game Stick Vanguard vận hành theo mô hình **Hybrid WebAssembly + WebGL2**:
- **Lõi tính toán & Render phần cứng**: Thuần WebAssembly Rust (`wasm-sim/`), chịu trách nhiệm 100% mô phỏng 60Hz, AI/Skills, va chạm Spatial Grid, tạo âm thanh WebAudio và vẽ WebGL2.
- **Lớp vỏ Web / UI / Config**: TypeScript (`src/config/`, `src/ui/`, `src/core/`), chịu trách nhiệm lưu trữ cấu hình tĩnh (Single Source of Truth), quản lý DOM UI, audio unlock, và Canvas 2D overlay mỏng.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             STICK VANGUARD                                  │
├──────────────────────────────────────┬──────────────────────────────────────┤
│      TypeScript / Web Frontend       │       Rust WebAssembly Core          │
│               (src/)                 │             (wasm-sim/)              │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ 1. Nguồn Dữ Liệu Gốc (Truth)         │ 1. GameConfigRegistry (config.rs)    │
│    - src/config/*.config.ts          │    - Nhận JSON qua load_game_config  │
│                                      │                                      │
│ 2. GPU Texture Atlas Baking          │ 2. WebGL2 Hardware Engine (webgl/)   │
│    - src/render/archetypes/          │    - Dual-pass shader (#version 300) │
│    - src/render/UnitSpriteCache.ts   │    - Texture Atlas Quads + Fallback  │
│                                      │                                      │
│ 3. HUD Overlay 2D                    │ 3. Vòng Lặp Fixed Tick 60Hz          │
│    - #game-hud-overlay               │    - systems.rs, state.rs            │
│    - Placement feedback & floating txt│   - Sub-stepping & SpatialGrid O(1) │
│                                      │                                      │
│ 4. Cầu Nối Flat Memory               │ 4. Flat Memory Zero-Copy Buffer      │
│    - src/core/WasmBridge.ts          │    - Float32Array đồng bộ vị trí quái│
│    - ID Map: string <-> u32          │    - get_flat_memory_ptr()           │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

---

## 2. Vòng Lặp Hoạt Động (Game Loop Lifecycle)

Mỗi khung hình trình duyệt (`requestAnimationFrame` trong `src/main.ts`):

1. **Tính toán Thời Gian (Delta Time & Fixed Step)**:
   - Bộ đếm tích lũy `accumulator` với bước thời gian chuẩn `FIXED_DELTA_TIME = 1/60s` (~16.67ms).
   - Nếu máy tính bị lag, tối đa 3 sub-steps mỗi frame để chống "xoắn ốc tử thần" (spiral of death).

2. **Mô Phỏng Trong Rust (`WasmBridge.stepSimulation()`)**:
   - Chạy hàm `step_simulation(fixed_dt)` trong `wasm-sim/src/lib.rs`.
   - Vòng lặp cập nhật các hệ thống Rust:
     - `WaveSystem` (sinh quái theo đợt, gắn path lanes, scale chỉ số đợt > 10).
     - `NavigationSystem` (nội suy đường đi đa làn: đường bộ, sông nước, hành lang bay).
     - `SpatialGrid` (cập nhật vị trí quái vật vào lưới $O(1)$ ô 64px).
     - `EnemySkillSystem` (hồi chiêu, kích hoạt kỹ năng đặc thù: tăng tốc, phân thân, tạo đệ).
     - `TowerSystem` (quét mục tiêu theo 15 hệ nguyên tố, bắn đạn/hiệu ứng).
     - `ProjectileSystem` (bay thẳng, parabol, nổ AoE, gây sát thương phản ứng).
     - `TrapSystem` (kích nổ bẫy đường bộ, hiệu ứng khống chế).
     - `CombatSystem` (lính cận chiến, rồng, tiên chạm trán quái, khắc chế hệ, sát thương lai).
     - `RustSoundSystem` (ghi nhận sự kiện âm thanh, điều khiển dao động WebAudio).

3. **Render Chiến Trường WebGL2 (`WasmBridge.renderWebGlFrame()`)**:
   - Gọi `render_webgl_frame()` trong `wasm-sim/src/lib.rs`.
   - `WebGl2Renderer::build_scene()`:
     - Xóa buffer (`glClearColor`).
     - Vẽ nền bản đồ, lưới chiến thuật, đường đi, sông, đường bay, cổng xuất hiện và căn cứ.
     - Vẽ tầm bắn tháp đang chọn, đường cắm cờ (rally line).
     - Vẽ tháp và bẫy theo cấp sao và nguyên tố.
     - Vẽ lính, rồng, tiên (với hiệu ứng hào quang, cánh vỗ, bóng đổ).
     - Vẽ quái vật qua GPU Texture Atlas quads; nếu thiếu frame sẽ tự động vẽ bằng procedural vector fallback.
     - Vẽ đạn bay, hiệu ứng nổ hạt.
     - Vẽ thanh máu, khiên vật lý (bạc), khiên phép (tím) và vương miện Boss.
   - `WebGl2Renderer::flush()`: Đẩy toàn bộ vertex color & vertex texture lên GPU qua 2 lệnh draw arrays.

4. **Đồng Bộ Bộ Nhớ Phẳng (Flat Memory Sync)**:
   - `WasmBridge.syncFlatMemory()` đọc trực tiếp `Float32Array` từ con trỏ WASM (`get_flat_memory_ptr()`) mà không cần chuyển đổi JSON hay sao chép mảng.
   - Cập nhật số lượng và tọa độ nhẹ nhàng cho UI TypeScript (`GameState.enemies`, `GameState.towers`).

5. **Lớp Phủ Canvas 2D (#game-hud-overlay)**:
   - Chỉ vẽ: Vòng tròn preview đặt tháp kéo thả (`MapRenderer.renderPlacementFeedback`) và chữ số sát thương bay (`TowerRenderer.renderFloatingTexts`).
   - Tuyệt đối không vẽ địa hình, quái hay đạn trên Canvas 2D.

---

## 3. GPU Texture Atlas & Cấu Trúc Module Render

### Cơ Chế Hoạt Động của Texture Atlas
1. Quái vật trong Stick Vanguard có 10 hình thái thị giác (archetypes): `DRAGON`, `SERPENT`, `AVIAN_BAT`, `ARACHNID`, `TURTLE_BEAST`, `SLIME_CRYSTAL`, `COLOSSUS`, `WRAITH_REAPER`, `SIREN`, `HUMANOID`.
2. Lúc khởi tạo game (`UnitSpriteCache.bakeAndUploadWebGlAtlas`), một canvas tạm 2D được tạo ra. Với mỗi loài quái trong `ENEMY_BLUEPRINTS`, `EnemyArchetypeRenderer` vẽ 4 khung hình animation bước đi/tấn công.
3. Toàn bộ hình ảnh được nạp thẳng vào WebGL2 texture trong Rust qua hàm `upload_webgl_atlas(canvas, manifest_json)`.
4. Khi chạy, Rust WebGL2 chỉ cần lấy tọa độ UV từ manifest và vẽ 1 quad hình chữ nhật (6 đỉnh textured quad).

### Cấu Trúc Module Không Quá Khổ

#### TypeScript: `src/render/`
- `EnemyArchetypeRenderer.ts`: Facade gọn gàng (~80 dòng), tương thích ngược 100%.
- `archetypes/types.ts`: Định nghĩa kiểu `EnemyVisualArchetype`, `ArchetypeInfo`, và hàm tra cứu `getArchetype()`.
- `archetypes/*.ts`: 10 file riêng biệt cho từng loài (`dragon.ts`, `serpent.ts`, `humanoid.ts`...). Mỗi file < 160 dòng.
- `UnitSpriteCache.ts`: Bộ nướng atlas canvas và tải lên WASM.
- `MapRenderer.ts` & `TowerRenderer.ts`: Render overlay 2D mỏng.

#### Rust WebAssembly: `wasm-sim/src/webgl/`
- `mod.rs`: Struct `WebGl2Renderer`, lifecycle (`new`, `init_context`, `upload_atlas`, `flush`), re-exports.
- `gl_bindings.rs`: Tất cả khai báo FFI WebGL2 `extern "C"`, hằng số GL và mã nguồn shader GLSL `#version 300 es`.
- `primitives.rs`: Xử lý màu hex/element, `push_vertex`, vẽ hình học 2D cơ bản (`rect`, `circle`, `ring`, `quad`).
- `scene.rs`: Pipeline lắp ráp chiến trường `build_scene()`.
- `entities.rs`: Render tháp, bẫy, lính/rồng/tiên/anh linh, và quái vật (atlas + procedural fallback).
- `codex.rs`: Render preview quái vật và preview lính trong Cẩm Nang.

---

## 4. Cầu Nối WasmBridge & Quản Lý ID

- **Cấu hình**: `WasmBridge.syncGameConfigToRust()` chuyển toàn bộ `src/config/` thành JSON payload và gọi `load_game_config()`. Rust deserializes vào `GameConfigRegistry`.
- **Ánh Xạ ID (ID Map)**:
  - Rust vận hành hoàn toàn bằng `u32` để đạt hiệu năng tối đa.
  - `WasmBridge` lưu trữ bảng tra cứu 2 chiều: `str_to_id: Map<string, number>` và `id_to_str: string[]`.
  - Khi thao tác (ví dụ chọn tháp, bán tháp, nâng cấp), TS chuyển `string` sang `u32` trước khi gọi Rust.
- **Flat Memory Format**:
  - Buffer liên tục bắt đầu bằng các số nguyên `u32` đếm số lượng thực thể.
  - Theo sau là khối Float32 gồm các trường thuộc tính `[id, x, y, hp, max_hp, speed, facing, state, ...]`.

---

## 5. Quy Trình Làm Việc & Kiểm Thử Cho Agents

Khi nhận bất kỳ yêu cầu sửa đổi liên quan đến WASM, WebGL2 hoặc Gameplay:

1. **Quy tắc sửa Rust**:
   - Mã nguồn Rust nằm tại `wasm-sim/src/`.
   - Giữ các file con tách biệt theo module, không nhồi nhét code vượt quá 500 dòng/file.
   - Luôn hỗ trợ `#[cfg(target_arch = "wasm32")]` và mock cho `#[cfg(not(target_arch = "wasm32"))]` để chạy unit test máy chủ.

2. **Trình tự lệnh kiểm tra bắt buộc**:
   ```bash
   cargo test --manifest-path wasm-sim/Cargo.toml --offline  # Kiểm tra unit test Rust
   npm run build:wasm                                        # Biên dịch WASM release
   npx tsc --noEmit                                          # Type-check TypeScript
   npm test                                                  # Chạy 151 Vitest tests
   npm run build                                             # Kiểm tra đóng gói Vite
   ```

3. **Nguyên tắc bất biến**:
   - Không được khôi phục lại fallback mô phỏng bằng TypeScript trong vòng lặp game.
   - Số liệu cân bằng chỉ sửa ở `src/config/`.
   - Import TypeScript bắt buộc có đuôi `.js`.

