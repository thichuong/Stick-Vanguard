---
name: stick-vanguard-maintenance
description: >-
  Hướng dẫn cập nhật, sửa lỗi và bảo trì game Stick Vanguard (TypeScript + Vite + WebAssembly Rust + WebGL2).
  Dùng khi sửa/thêm tháp, bẫy, quái, nguyên tố, bản đồ, đợt quái, Cẩm nang (Codex),
  panel trái (HUDManager), panel phải (ArsenalBar / InspectorPanel), phím tắt, âm thanh (Rust WebAudio),
  lõi WebAssembly (wasm-sim / WasmBridge), bộ kết xuất WebGL2 (webgl.rs / UnitSpriteCache),
  lưới băm không gian (SpatialIndex / spatial.rs), hoặc khi cần hiểu kiến trúc dự án trước khi chỉnh sửa.
---

# Stick Vanguard – Hướng dẫn Cập nhật & Sửa chữa

Skill này giúp định tuyến nhanh mọi yêu cầu sửa đổi tới đúng file, giữ kiến trúc nhất quán
và kiểm tra trước khi báo hoàn thành.

Tài liệu chi tiết (chỉ đọc khi cần):
- [references/architecture.md](references/architecture.md) – Kiến trúc, layers, game loop, WebAssembly Rust Engine + WebGL2 + Audio, nơi đặt code mới.
- [references/codex-and-config.md](references/codex-and-config.md) – Cẩm nang ↔ Config, recipes thêm nội dung.
- [references/ui-panels.md](references/ui-panels.md) – Bố cục `index.html`, DOM id → class TS chịu trách nhiệm.

---

## 1. Quy trình 5 bước cho mọi yêu cầu

1. **Phân loại** yêu cầu: Cẩm nang? Panel trái? Panel phải? Cân bằng số liệu? Gameplay/logic? Render WebGL2/2D? Map/wave? Lõi WASM / Hiệu năng?
2. **Tra bảng định tuyến** (mục 2) → mở file "Mở trước" đầu tiên.
3. **Đọc config/types trước khi sửa logic/UI**: `src/config/*` là nguồn dữ liệu duy nhất (được tự động đồng bộ sang Rust qua `WasmBridge.syncGameConfigToRust()`), `src/types/*` và `wasm-sim/src/types.rs` định nghĩa kiểu (`TowerType`, `ElementType`, `EnemyEntity`…).
4. **Sửa** theo quy tắc vàng (mục 3). File lớn: `grep -n` tên method trước rồi đọc theo đoạn.
5. **Kiểm tra** (mục 4): Nếu sửa Rust chạy `npm run build:wasm`, sau đó `npx tsc --noEmit` và `npm test` phải xanh.

---

## 2. Bảng định tuyến nhanh

| Yêu cầu | Mở trước | Sau đó |
|---|---|---|
| **Lõi tính toán WASM / Rust Engine** (State, Systems, Rules, Waves, Audio, WebGL2) | `wasm-sim/src/lib.rs`, `wasm-sim/src/systems.rs`, `wasm-sim/src/state.rs` | `wasm-sim/Cargo.toml`, build bằng `npm run build:wasm` |
| **Render Chiến trường WebGL2 Thuần Rust** | `wasm-sim/src/webgl/` (`entities.rs`, `scene.rs`, `primitives.rs`) | `src/main.ts#loop`, overlay 2D `#game-hud-overlay` |
| **Âm thanh WebAudio trong Rust** | `wasm-sim/src/audio.rs` | `src/systems/SoundSystem.ts` (vỏ gọi `WasmBridge`) |
| **Cầu nối WASM & Config Sync** (Zero-Copy Float32Array, ID Map, `load_game_config`) | `src/core/WasmBridge.ts` | `src/wasm/wasm_sim.js`, `src/core/SimulationEngine.ts` |
| **Vòng lặp mô phỏng & Fixed Tick** (60Hz loop, sub-stepping, nội suy) | `wasm-sim/src/systems.rs`, `src/core/SimulationEngine.ts` | `src/core/ObjectPool.ts`, `src/core/SpatialIndex.ts` |
| **Lưới băm không gian (Spatial Grid)** (tìm quái trong tầm, đạn nổ lan $O(1)$) | `wasm-sim/src/spatial.rs`, `src/core/SpatialIndex.ts` | `src/core/WasmBridge.ts` |
| **Cẩm nang / Codex** (mô tả, bảng, tab, tra cứu) | `src/config/*` (dữ liệu gốc) | `src/ui/codex/Codex*.ts` (hiển thị), router `src/ui/SideDetailPanel.ts` |
| **Panel trái** (Vàng, Máu, Đợt, nút gọi đợt, nút overlay canvas, banner thắng/thua) | `src/ui/hud/HUDManager.ts` | `index.html` `#left-panel`, `src/style.css` |
| Nút trái "Chọn Bản Đồ" / "Cài Đặt" / "Cẩm Nang" | `src/ui/modals/MapSelectionModal.ts` / `src/ui/modals/SettingsModal.ts` / `src/ui/UIManager.ts` | `index.html` |
| **Panel phải** (chọn tháp, trạng thái đặt tháp, dòng gợi ý) | `src/ui/hud/ArsenalBar.ts` | `src/ui/inspector/InspectorPanel.ts` (render toàn bộ nội dung `#right-panel`) |
| Chi tiết / nâng cấp / bán tháp, lính triệu hồi, thông tin màn chơi (panel phải) | `src/ui/inspector/InspectorPanel.ts` | `wasm-sim/src/state.rs`, `src/core/GameState.ts` |
| Chỉ số tháp / bẫy | `src/config/towers.config.ts` | `wasm-sim/src/state.rs`, `src/core/GameState.ts`, `CodexBuildings` / `CodexSoldiers` / `CodexTraps` |
| Lính / rồng / tiên (đơn vị triệu hồi) | `src/config/towers.config.ts` | `wasm-sim/src/systems.rs`, `src/systems/CombatSystem.ts` |
| Quái vật | `src/config/enemies/*.enemies.ts` | `wasm-sim/src/systems.rs`, `src/render/EnemyArchetypeRenderer.ts`, `CodexEnemies` |
| Nguyên tố / phản ứng / khắc chế | `src/config/elements/*` | `wasm-sim/src/rules.rs`, `src/systems/TargetingRuleEngine.ts`, `CodexElements` |
| Bản đồ / đợt quái | `src/config/maps/*.map.ts`, `src/config/maps/waves_extended.ts` | `wasm-sim/src/wave.rs`, `src/systems/WaveSystem.ts` |
| Click / thao tác trên canvas | `src/main.ts#bindCanvasEvents` | `src/core/GameState.ts` |
| Phím tắt | `src/ui/UIManager.ts#bindKeyboard` | footer `index.html` (`.left-panel-footer`) |
| Lưu / tải cài đặt | `src/core/StorageService.ts` | `GameState.loadSettingsFromStorage / saveSettingsToStorage` |

---

## 3. Quy tắc vàng

- **Số liệu chỉ nằm trong `src/config/`.** Codex, Inspector và Rust Engine (`GameConfigRegistry`) đều đọc từ `src/config/` — không hardcode chỉ số trong UI hay Rust.
- **WebAssembly Rust Core (`wasm-sim/`)**:
  - Khi sửa code Rust trong `wasm-sim/src/`, bắt buộc chạy `npm run build:wasm` để biên dịch sang `src/wasm/` và chạy `cargo test --manifest-path wasm-sim/Cargo.toml --offline`.
  - Các module chính trong `wasm-sim/src/`:
    - `types.rs`: Toàn bộ struct và enum dùng chung (`#[serde(default, rename_all = "camelCase")]`).
    - `config.rs`: `GameConfigRegistry` nhận dữ liệu JSON từ `src/config/` qua `load_game_config`.
    - `navigation.rs` & `spatial.rs`: Toán học nội suy đường đi đa làn và lưới băm không gian `SpatialGrid` $O(1)$.
    - `rules.rs`: `TargetingRuleEngine` (15 hệ nguyên tố, 8 phản ứng, khiên vật lý/phép, kháng CC Normal/Elite/Boss).
    - `wave.rs`: `WaveSystem` (sinh quái đợt 1–10 và đợt mở rộng/Boss >10).
    - `state.rs` & `systems.rs`: `RustGameState`, `EnemySkillSystem`, `TrapSystem`, `CombatSystem`, `TowerSystem`, `ProjectileSystem`, `RustSimulationEngine` (Fixed 60Hz).
    - `audio.rs`: `RustSoundSystem` điều khiển trực tiếp WebAudio (`AudioContext`, `OscillatorNode`, `GainNode`, `BiquadFilterNode`, `AudioBuffer`) qua `wasm-bindgen`.
    - `webgl/`: `WebGl2Renderer` kết xuất chiến trường bằng shader `#version 300 es` kết hợp `UnitSpriteCache` GPU Texture Atlas (module hóa thành `mod.rs`, `gl_bindings.rs`, `primitives.rs`, `scene.rs`, `entities.rs`, `codex.rs`).
  - **Cẩm nang WASM & Render Chuyên Sâu**: Tra cứu skill `stick-vanguard-wasm-engine` (`.agents/skills/stick-vanguard-wasm-engine/`) để hiểu sâu về Flat Memory, Zero-Copy, pipeline render WebGL2 và Fixed 60Hz loop.
  - **Kiến trúc thuần Rust WASM + WebGL2**: Game vận hành 100% bằng WebAssembly Rust Engine (`wasm-sim/`) và WebGL2, không dùng cơ chế fallback 2D Canvas hay mô phỏng TS cũ. Canvas 2D overlay (`#game-hud-overlay`) chỉ dùng để vẽ vùng đặt tháp và số sát thương bay.
- **Cẩm nang**: luôn tra `src/config/` + `src/ui/codex/` trước. Một số Codex là text tĩnh
  (`CodexImbue`, `CodexNavigation`) → phải đối chiếu thủ công với config/systems khi logic đổi.
- **Hằng số trùng lặp**: `ALL_15_ELEMENTS`, `STATUS_TO_ELEMENT` có ở cả
  `src/ui/codex/CodexTypes.ts` và `src/config/elements/index.ts` → sửa cả hai.
- **Barrel files**: `elements.config.ts` → `elements/index.ts`; `enemies.config.ts` → `enemies/index.ts`
  (gộp vào `ENEMY_BLUEPRINTS`); map mới phải đăng ký trong `maps/index.ts` (`MAPS_CONFIG`).
- **Import luôn có đuôi `.js`** (`moduleResolution: bundler`). tsconfig `strict`,
  `noUnusedLocals`, `noUnusedParameters` → xoá import/biến thừa.
- **Quy ước key**: tháp `TYPE_1..3`, nhánh cấp 4 `TYPE_4_A` / `TYPE_4_B`; bẫy `TRAP_*` (không có tier).
  Kiểu `TowerType` ở `src/types/entities.types.ts`.
- **Text UI bằng tiếng Việt**, giữ phong cách emoji + chữ in hoa hiện có.
- **Giữ nguyên comment/docstring** không liên quan đến thay đổi.

---

## 4. Kiểm tra trước khi báo hoàn thành

```bash
cargo test --manifest-path wasm-sim/Cargo.toml --offline  # chạy unit test Rust
npm run build:wasm    # biên dịch wasm-sim release sang src/wasm/
npx tsc --noEmit      # type-check toàn bộ src/
npm test              # vitest run (10 file test trong src/__tests__/)
npm run build         # kiểm tra đóng gói Vite production
```
