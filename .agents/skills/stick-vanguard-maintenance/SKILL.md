---
name: stick-vanguard-maintenance
description: >-
  Hướng dẫn cập nhật, sửa lỗi và bảo trì game Stick Vanguard (TypeScript + Vite + Canvas 2D + WebAssembly Rust).
  Dùng khi sửa/thêm tháp, bẫy, quái, nguyên tố, bản đồ, đợt quái, Cẩm nang (Codex),
  panel trái (HUDManager), panel phải (ArsenalBar / InspectorPanel), phím tắt, âm thanh,
  lõi WebAssembly (wasm-sim / WasmBridge), lưới băm không gian (SpatialIndex),
  hoặc khi cần hiểu kiến trúc dự án trước khi chỉnh sửa.
---

# Stick Vanguard – Hướng dẫn Cập nhật & Sửa chữa

Skill này giúp định tuyến nhanh mọi yêu cầu sửa đổi tới đúng file, giữ kiến trúc nhất quán
và kiểm tra trước khi báo hoàn thành.

Tài liệu chi tiết (chỉ đọc khi cần):
- [references/architecture.md](references/architecture.md) – Kiến trúc, layers, game loop, WebAssembly Rust core, nơi đặt code mới.
- [references/codex-and-config.md](references/codex-and-config.md) – Cẩm nang ↔ Config, recipes thêm nội dung.
- [references/ui-panels.md](references/ui-panels.md) – Bố cục `index.html`, DOM id → class TS chịu trách nhiệm.

---

## 1. Quy trình 5 bước cho mọi yêu cầu

1. **Phân loại** yêu cầu: Cẩm nang? Panel trái? Panel phải? Cân bằng số liệu? Gameplay/logic? Render? Map/wave? Lõi WASM / Hiệu năng?
2. **Tra bảng định tuyến** (mục 2) → mở file "Mở trước" đầu tiên.
3. **Đọc config/types trước khi sửa logic/UI**: `src/config/*` là nguồn dữ liệu duy nhất,
   `src/types/*` định nghĩa kiểu (`TowerType`, `ElementType`, `EnemyEntity`…).
4. **Sửa** theo quy tắc vàng (mục 3). File lớn: `grep -n` tên method trước rồi đọc theo đoạn.
5. **Kiểm tra** (mục 4): Nếu sửa Rust chạy `npm run build:wasm`, sau đó `npx tsc --noEmit` và `npm test` phải xanh.

---

## 2. Bảng định tuyến nhanh

| Yêu cầu | Mở trước | Sau đó |
|---|---|---|
| **Lõi tính toán WASM / Rust Core** (quản lý quái, phẳng RAM, lưới không gian Rust) | `wasm-sim/src/lib.rs` | `wasm-sim/Cargo.toml`, build bằng `npm run build:wasm` |
| **Cầu nối WASM & Memory View** (Zero-Copy Float32Array, ID Map) | `src/core/WasmBridge.ts` | `src/wasm/wasm_sim.js`, `src/core/SimulationEngine.ts` |
| **Vòng lặp mô phỏng & Fixed Tick** (60Hz loop, sub-stepping, nội suy) | `src/core/SimulationEngine.ts` | `src/core/ObjectPool.ts`, `src/core/SpatialIndex.ts` |
| **Lưới băm không gian (Spatial Grid)** (tìm quái trong tầm, đạn nổ lan $O(1)$) | `src/core/SpatialIndex.ts` | `src/core/WasmBridge.ts`, `src/systems/TowerSystem.ts` |
| **Tối ưu Render & Smart LOD** (LOD FULL/MEDIUM/HIGH_CROWD, Atlas baked sprite) | `src/render/StickmanRenderer.ts` | `src/render/UnitSpriteCache.ts`, `src/render/MapRenderer.ts` |
| **Cẩm nang / Codex** (mô tả, bảng, tab, tra cứu) | `src/config/*` (dữ liệu gốc) | `src/ui/codex/Codex*.ts` (hiển thị), router `src/ui/SideDetailPanel.ts` |
| **Panel trái** (Vàng, Máu, Đợt, nút gọi đợt, nút overlay canvas, banner thắng/thua) | `src/ui/hud/HUDManager.ts` | `index.html` `#left-panel`, `src/style.css` |
| Nút trái "Chọn Bản Đồ" / "Cài Đặt" / "Cẩm Nang" | `src/ui/modals/MapSelectionModal.ts` / `src/ui/modals/SettingsModal.ts` / `src/ui/UIManager.ts` | `index.html` |
| **Panel phải** (chọn tháp, trạng thái đặt tháp, dòng gợi ý) | `src/ui/hud/ArsenalBar.ts` | `src/ui/inspector/InspectorPanel.ts` (render toàn bộ nội dung `#right-panel`) |
| Chi tiết / nâng cấp / bán tháp, lính triệu hồi, thông tin màn chơi (panel phải) | `src/ui/inspector/InspectorPanel.ts` | `src/core/GameState.ts` (build/upgrade/sell) |
| Chỉ số tháp / bẫy | `src/config/towers.config.ts` | `src/core/GameState.ts`, `src/systems/TowerSystem.ts`, `src/systems/TrapSystem.ts`, `CodexBuildings` / `CodexSoldiers` / `CodexTraps` |
| Lính / rồng / tiên (đơn vị triệu hồi) | `src/config/towers.config.ts` | `src/systems/CombatSystem.ts`, `src/core/GameState.ts` |
| Quái vật | `src/config/enemies/*.enemies.ts` | `src/systems/EnemySkillSystem.ts`, `src/render/EnemyArchetypeRenderer.ts`, `CodexEnemies` |
| Nguyên tố / phản ứng / khắc chế | `src/config/elements/*` | `src/systems/TargetingRuleEngine.ts`, `CodexElements` |
| Bản đồ / đợt quái | `src/config/maps/*.map.ts`, `src/config/maps/waves_extended.ts` | `src/config/map.config.ts`, `src/systems/WaveSystem.ts`, `src/systems/NavigationSystem.ts` |
| Hiển thị trên canvas | `src/render/*Renderer.ts` | `src/main.ts#render` |
| Click / thao tác trên canvas | `src/main.ts#bindCanvasEvents` | `src/core/GameState.ts` |
| Phím tắt | `src/ui/UIManager.ts#bindKeyboard` | footer `index.html` (`.left-panel-footer`) |
| Âm thanh | `src/systems/SoundSystem.ts` | các điểm gọi trong `src/main.ts#update` |
| Lưu / tải cài đặt | `src/core/StorageService.ts` | `GameState.loadSettingsFromStorage / saveSettingsToStorage` |

---

## 3. Quy tắc vàng

- **Số liệu chỉ nằm trong `src/config/`.** Codex và Inspector đọc từ config — không hardcode
  chỉ số trong UI. Sửa chỉ số ở config là Codex tự cập nhật.
- **WebAssembly Rust Core (`wasm-sim/`)**:
  - Khi sửa code Rust trong `wasm-sim/src/`, bắt buộc chạy `npm run build:wasm` để biên dịch sang `src/wasm/`.
  - Bộ nhớ quái quản lý theo **Flat Stride (12 `f32` = 48 bytes/quái)**.
  - Lưới băm không gian trong Rust lưu `enemy_id: u32` (không lưu trực tiếp `usize` index vào vector để tránh panic bounds check khi quái bị `swap_remove`).
  - Luôn đảm bảo cơ chế **Graceful Fallback**: `SimulationEngine.ts` và `SpatialIndex.ts` vẫn hoạt động trơn tru nếu không có binary WASM.
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
- **Systems là static class** nhận state qua tham số; hiệu ứng phụ (âm thanh, hạt, text nổi)
  được gọi qua callback trong `src/main.ts`.
- **Mở Cẩm nang từ bất kỳ đâu**: thêm thuộc tính `data-open-codex="CATEGORY"` và
  `data-codex-target="ID"` vào phần tử HTML (UIManager bắt sự kiện delegate).
- **Text UI bằng tiếng Việt**, giữ phong cách emoji + chữ in hoa hiện có.
- **Giữ nguyên comment/docstring** không liên quan đến thay đổi.
- **Không tạo file UI mới** khi có thể mở rộng module sẵn có; nếu tạo, đặt đúng thư mục
  (`ui/hud`, `ui/inspector`, `ui/modals`, `ui/codex`) và khởi tạo trong `UIManager`.

---

## 4. Kiểm tra trước khi báo hoàn thành

```bash
npm run build:wasm    # (nếu có sửa Rust) biên dịch wasm-sim release
npx tsc --noEmit      # type-check toàn bộ src/
npm test              # vitest run (10 file test trong src/__tests__/)
npm run build         # kiểm tra đóng gói Vite production
npm run dev           # (tuỳ chọn) chạy Vite để kiểm tra UI thủ công
```

Test liên quan theo khu vực:

| Khu vực sửa | File test |
|---|---|
| Lõi WASM, Cầu nối bộ nhớ, ID mapping, Fallback | `src/__tests__/wasm_bridge.test.ts` |
| Hiệu năng mô phỏng 1.500 đơn vị, SpatialGrid, ObjectPool | `src/__tests__/performance_optimization.test.ts` |
| GameState, systems, maps, waves, nguyên tố, CC, âm thanh, storage | `src/__tests__/architecture.test.ts` |
| Tháp phòng ngự / triệu hồi / bẫy, ArsenalBar, InspectorPanel | `src/__tests__/defense_restructure.test.ts` |
| Các module Codex, SideDetailPanel, MapSelectionModal | `src/__tests__/ui_modular.test.ts` |
| Bảng tra cứu Codex (khắc chế, phản ứng) | `src/__tests__/lookup_audit.test.ts` |
| Renderer quái | `src/__tests__/enemy_renderer.test.ts` |
| Icon SVG nguyên tố | `src/__tests__/elements_svg.test.ts` |
| Icon SVG giao diện UI | `src/__tests__/ui_svg.test.ts` |
| Map selection / wave UI | `src/__tests__/ui_redesign.test.ts` |

Chạy riêng một file: `npx vitest run src/__tests__/wasm_bridge.test.ts`.

Nếu thay đổi làm test cũ thất bại do **cố ý** đổi hành vi → cập nhật test tương ứng và nêu rõ
trong báo cáo; nếu không cố ý → sửa code.
