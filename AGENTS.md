# Stick Vanguard – Agent Rules

- Trước khi sửa/cập nhật code, kích hoạt skill `stick-vanguard-maintenance` (`.agents/skills/stick-vanguard-maintenance/`).
- Cẩm nang (Codex): tra `src/config/` (dữ liệu) và `src/ui/codex/` (hiển thị) trước.
- Panel trái: `src/ui/hud/HUDManager.ts`. Panel phải: `src/ui/hud/ArsenalBar.ts` (đặt tháp) + `src/ui/inspector/InspectorPanel.ts` (nội dung).
- Số liệu cân bằng chỉ sửa trong `src/config/`; import TS dùng đuôi `.js`.
- Sau khi sửa: `npx tsc --noEmit` và `npm test` phải xanh.

