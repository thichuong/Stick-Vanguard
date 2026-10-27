# Kiến trúc dự án Stick Vanguard

## Stack

- **TypeScript 5** (strict) + **Vite 5** (dev/build) + **Vitest 1** (test): Quản lý vỏ ngoài (`src/config/`, `src/types/`, `src/ui/`, `src/core/StorageService.ts`).
- **WebAssembly Core & Renderer (Rust)**: Crate `wasm-sim/` biên dịch bằng `wasm-bindgen`, đảm nhiệm toàn bộ lõi mô phỏng (`state.rs`, `systems.rs`, `rules.rs`, `wave.rs`, `navigation.rs`, `spatial.rs`), âm thanh thủ tục WebAudio (`audio.rs`), và kết xuất đồ họa chiến trường bằng **WebGL2 + GPU Texture Atlas** (`webgl.rs`).
- Không framework UI: DOM thao tác trực tiếp, HTML khung trong `index.html`, nội dung động render bằng template string.
- Deploy: Cloudflare Workers static assets (`wrangler.json`, `npm run deploy` → build `dist/` rồi `wrangler deploy`).

| Lệnh | Tác dụng |
|---|---|
| `npm run dev` | Chạy Vite dev server |
| `cargo test --manifest-path wasm-sim/Cargo.toml --offline` | Chạy unit test Rust cho crate `wasm-sim` |
| `npm run build:wasm` | Biên dịch Rust crate `wasm-sim` sang `src/wasm/` |
| `npm run build` | `tsc && vite build` (đóng gói production cả JS và WASM) |
| `npm test` | Chạy toàn bộ 10 file Vitest suite |
| `npx tsc --noEmit` | Type-check nhanh toàn bộ TypeScript |

## Cấu trúc thư mục

```
index.html                 # Khung layout: #left-panel | #canvas-stage | #right-panel | 3 modal
wasm-sim/                  # MÃ NGUỒN RUST WEBASSEMBLY (SIMULATION, AUDIO, WEBGL2)
├── Cargo.toml             #   Cấu hình crate cdylib, wasm-bindgen, js-sys, serde, serde_json
└── src/
    ├── lib.rs             #   Cầu nối #[wasm_bindgen], EngineContext, SimulationWorld & Rust unit tests
    ├── types.rs           #   Toàn bộ enum & struct thực thể (EnemyEntity, TowerEntity, SoldierEntity…)
    ├── config.rs          #   GameConfigRegistry nhận dữ liệu từ src/config/ qua JSON
    ├── navigation.rs      #   NavigationSystem, PathLane, nội suy đường đi đa làn
    ├── spatial.rs         #   SpatialGrid O(1) 64px tìm mục tiêu & AoE trong tầm
    ├── rules.rs           #   TargetingRuleEngine (15 hệ, 8 phản ứng, khiên, kháng CC) & SimpleRng
    ├── wave.rs            #   WaveSystem (sinh quái đợt 1-10 & đợt mở rộng/Boss >10)
    ├── state.rs           #   RustGameState (xây/nâng/hạ/bán tháp, gắn nguyên tố, hồi sinh anh linh)
    ├── systems.rs         #   EnemySkill, Trap, Combat, Tower, Projectile & RustSimulationEngine (60Hz)
    ├── audio.rs           #   RustSoundSystem tổng hợp âm thanh WebAudio trực tiếp từ Rust
    └── webgl.rs           #   WebGl2Renderer (#version 300 es) vẽ bản đồ, tháp, đạn, hạt & GPU Atlas
src/
├── main.ts                # GameApp: khởi tạo WebGL2 + WASM, bake GPU Atlas, game loop, input canvas
├── style.css              # Toàn bộ CSS
├── wasm/                  # BINDING WASM ĐƯỢC SINH TỰ ĐỘNG
│   ├── wasm_sim.js        #   ES module bindings cho WebAssembly
│   └── wasm_sim_bg.wasm   #   File binary wasm
├── types/                 # Kiểu dùng chung cho TS config & UI
├── config/                # DỮ LIỆU TĨNH (nguồn sự thật duy nhất, đồng bộ sang Rust lúc khởi động)
├── core/
│   ├── WasmBridge.ts      # Cầu nối khởi tạo WASM (hỗ trợ cả initSync trong Node/Vitest), đồng bộ config, WebGL2 & Flat Memory
│   ├── GameState.ts       # Quản lý trạng thái đồng bộ với UI & thao tác tháp
│   ├── SimulationEngine.ts# Điều phối vòng lặp Fixed 60Hz ủy quyền Rust WASM
│   ├── SpatialIndex.ts    # Truy vấn không gian qua WasmBridge
│   ├── ObjectPool.ts      # Generic ObjectPool
│   └── StorageService.ts  # localStorage (cài đặt trận)
├── systems/               # Các lớp vỏ gọi xuống Rust WASM (SoundSystem, TargetingRuleEngine, WaveSystem…)
├── render/
│   ├── UnitSpriteCache.ts       # Nướng GPU Texture Atlas (quái + icon) nạp vào Rust WebGL2 Renderer
│   ├── EnemyArchetypeRenderer.ts# Hình dạng quái theo archetype (dùng để bake GPU Atlas)
│   ├── MapRenderer.ts           # Vẽ feedback đặt tháp trên overlay 2D (#game-hud-overlay)
│   ├── TowerRenderer.ts         # Vẽ chữ nổi (FloatingTexts) trên overlay 2D (#game-hud-overlay)
│   └── StickmanRenderer.ts      # Vẽ preview quái trong Cẩm nang (#codex-enemy-canvas)
├── ui/                    # Giao diện HTML/DOM (UIManager, HUDManager, ArsenalBar, InspectorPanel, Codex*, Modals)
└── __tests__/             # Vitest (10 files, 146 tests)
```
