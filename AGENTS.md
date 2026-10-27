# Stick Vanguard – Agent Rules

- Trước khi sửa/cập nhật code, kích hoạt skill `stick-vanguard-maintenance` (`.agents/skills/stick-vanguard-maintenance/`).
- Cẩm nang (Codex): tra `src/config/` (dữ liệu) và `src/ui/codex/` (hiển thị) trước.
- Panel trái: `src/ui/hud/HUDManager.ts`. Panel phải: `src/ui/hud/ArsenalBar.ts` (đặt tháp) + `src/ui/inspector/InspectorPanel.ts` (nội dung).
- Số liệu cân bằng chỉ sửa trong `src/config/`; import TS dùng đuôi `.js`.
- Module WebAssembly Rust (`wasm-sim/`): Chứa toàn bộ lõi mô phỏng (`state.rs`, `systems.rs`, `rules.rs`, `wave.rs`, `navigation.rs`, `spatial.rs`), bộ tổng hợp âm thanh WebAudio (`audio.rs`) và bộ kết xuất đồ họa phần cứng **WebGL2 + GPU Texture Atlas** (`webgl.rs`). Nếu sửa mã Rust, chạy `npm run build:wasm` để biên dịch sang `src/wasm/`. Cầu nối `src/core/WasmBridge.ts` tự động đồng bộ `src/config/` sang Rust (`load_game_config`), quản lý bộ nhớ phẳng Flat Memory và bản đồ ID (`u32 <-> string`).
- Hệ thống chạy 100% trên WebAssembly Rust Engine (`wasm-sim/`) và WebGL2. Đã loại bỏ hoàn toàn các class mô phỏng TypeScript cũ (`CombatSystem`, `EnemySkillSystem`, `TowerSystem`, `TrapSystem`, `ProjectileSystem`, `SpatialIndex`, `SimulationEngine`). `src/systems/` chỉ còn các facade mỏng (`SoundSystem`, `TargetingRuleEngine`, `WaveSystem`, `NavigationSystem`). Canvas 2D chỉ phục vụ lớp phủ HUD overlay mỏng (#game-hud-overlay) cho vùng chọn đặt tháp và chữ nổi sát thương.
- Sau khi sửa: `npm run build:wasm` (nếu sửa Rust), `npx tsc --noEmit` và `npm test` phải xanh 100%.
