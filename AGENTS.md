# Stick Vanguard – Agent Rules

- Trước khi sửa/cập nhật code, kích hoạt skill `stick-vanguard-maintenance` (`.agents/skills/stick-vanguard-maintenance/`).
- Cẩm nang (Codex): tra `src/config/` (dữ liệu) và `src/ui/codex/` (hiển thị) trước.
- Panel trái: `src/ui/hud/HUDManager.ts`. Panel phải: `src/ui/hud/ArsenalBar.ts` (đặt tháp) + `src/ui/inspector/InspectorPanel.ts` (nội dung).
- Số liệu cân bằng chỉ sửa trong `src/config/`; import TS dùng đuôi `.js`.
- Module WebAssembly Rust (`wasm-sim/`): Nếu sửa mã Rust, chạy `npm run build:wasm` để biên dịch sang `src/wasm/`. Cầu nối `src/core/WasmBridge.ts` quản lý bộ nhớ phẳng Flat Memory và bản đồ ID (`u32 <-> string`).
- Luôn giữ cơ chế Graceful Fallback: nếu WASM chưa tải hoặc trong test không nạp wasm, `SimulationEngine.ts` và `SpatialIndex.ts` tự động chạy bằng thuật toán TypeScript.
- Sau khi sửa: `npm run build:wasm` (nếu sửa Rust), `npx tsc --noEmit` và `npm test` phải xanh 100%.
