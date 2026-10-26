# Cẩm nang (Codex) ↔ Config

> Quy tắc: mọi yêu cầu liên quan Cẩm nang → **tra `src/config/` trước** (dữ liệu gốc), rồi tới
> `src/ui/codex/` (hiển thị). Nếu số liệu sai → sửa config. Nếu bố cục/cách trình bày sai → sửa Codex.

## Router: `src/ui/SideDetailPanel.ts`

- Modal `#codex-modal-backdrop`, nội dung render vào `#codex-modal-body`; tiêu đề/icon/badge:
  `#codex-modal-title`, `#codex-modal-icon`, `#codex-modal-badge`.
- 4 tab (nút `.codex-tab[data-cat]` trong `index.html`): `BUILDINGS | ELEMENTS | ENEMIES | NAVIGATION`.
- `open(category, targetSubId?)`:
  - `category` là sub-key công trình (`ARCHER, MAGE, ARTILLERY, BARRACKS, DRAGON_NEST, FAIRY_TREE, HEROIC_ALTAR, SOLDIERS, TRAPS, IMBUE`)
    → tab BUILDINGS, sub-tab tương ứng; `targetSubId` = key tier (vd `ARCHER_4_A`).
  - `ELEMENTS` + `targetSubId` = `ElementType` (vd `FIRE`).
  - `ENEMIES` + `targetSubId` = `typeId` quái (không phân biệt hoa thường).
  - `NAVIGATION` + `targetSubId` = `WALK | FLY | SWIM`.
- Mở từ HTML: `<button data-open-codex="ENEMIES" data-codex-target="EMBER_BLOB">`.
- Mở từ TS: `uiManager`/`sidePanel.open(...)`, hoặc `window.__openCodexCategory(cat, subId)`.
- `close()` dừng animation quái và reset bộ lọc tìm kiếm quái.

## Bảng mapping Codex ↔ dữ liệu

| File Codex | Hiển thị | Đọc dữ liệu từ |
|---|---|---|
| `CodexBuildings.ts` | Tháp phòng ngự + triệu hồi: cây nâng cấp, 3 khu thông tin, mô phỏng nguyên tố | `config/towers.config.ts`, `config/elements.config.ts` |
| `CodexSoldiers.ts` | Hệ triệu hồi (Barracks / Dragon Nest / Fairy Tree / Heroic Altar / Overview) | `config/towers.config.ts` |
| `CodexTraps.ts` | Bẫy `TRAP_*` | `config/towers.config.ts`, `config/elements.config.ts` |
| `CodexImbue.ts` | Khảm nguyên tố | **Text tĩnh** – đối chiếu `ELEMENT_IMBUE_COST`, `MAGE_SECOND_ELEMENT_COST`, `HYBRID_ELEMENT_DMG_RATIO` trong `config/elements/index.ts` |
| `CodexElements.ts` | 15 nguyên tố, bảng tấn công/phòng thủ/cộng hưởng, tìm phản ứng | `config/elements/*.element.ts`, `reactions.config.ts`, helper `getElementOffensiveTable / getElementDefensiveTable / getElementSynergyTable / searchElementalReactions` |
| `CodexEnemies.ts` | Bách khoa quái, bộ lọc, animation, bảng nhận sát thương | `config/enemies/*`, `cc.config.ts`, `TargetingRuleEngine`, `StickmanRenderer`, `EnemyArchetypeRenderer` |
| `CodexNavigation.ts` | Cơ chế WALK / FLY / SWIM | **Text tĩnh** – đối chiếu `NavigationSystem`, `targetingFilter` trong towers config |
| `CodexTypes.ts` | Hằng số chung (`ALL_15_ELEMENTS`, `STATUS_TO_ELEMENT`) | ⚠️ Trùng với `config/elements/index.ts` → sửa cả hai |

## Cấu trúc dữ liệu chính

- **Tháp** – `TowerBlueprint` trong `config/towers.config.ts`. Key: `TYPE_1`, `TYPE_2`, `TYPE_3`,
  `TYPE_4_A`, `TYPE_4_B`; bẫy: `TRAP_SPIKE | TRAP_FIRE | TRAP_FROST | TRAP_NET`.
  Trường chính: `cost, range, damage, fireRate, element, targetingFilter, placement`, triệu hồi:
  `maxSoldiers, soldierHp, soldierArmor, soldierRespawn, archetype, resurrectChance…`, bẫy:
  `maxTrapCharges, triggerRadius, rearmTime`. Nhóm: `DEFENSE_TOWER_TYPES`, `SUMMON_TOWER_TYPES`, `TRAP_TOWER_TYPES`.
- **Quái** – `EnemyBlueprint` trong `config/enemies/types.ts`: `typeId, name, description, hp, speed,
  damage, attackSpeed, rewardGold, movementType, navigationMode, elementalProfile, tags, altitude,
  size, color, abilities?, ccResistance?`. Bậc (NORMAL/ELITE/BOSS) quyết định CC qua `ENEMY_CC_CONFIG`.
- **Nguyên tố** – `ElementDefinition` mỗi file `*.element.ts`, gộp trong `ALL_ELEMENT_DEFINITIONS`;
  `ELEMENT_NAMES / ELEMENT_COLORS / ELEMENT_ICONS`; phản ứng `ELEMENTAL_REACTIONS`.
- **Map** – `MapConfig` trong `config/map.config.ts`: `playerBases`, `groundLanes / waterLanes / airLanes`
  (mỗi lane: các `Vector2D` rồi **số base 1-based** ở cuối), `waves`, `extendedWaves`, `tribe`.

## Recipes

### Thêm / sửa quái vật
1. Thêm entry vào file phù hợp `config/enemies/{ground|flying|aquatic|elite|boss|minion}.enemies.ts`
   (key = `typeId`, mô tả tiếng Việt).
2. Kỹ năng mới (loại chưa có) → thêm vào `EnemyAbilityType` (`types/entities.types.ts`) và `case` trong `systems/EnemySkillSystem.ts`.
3. Hình dạng: map `typeId` → archetype trong `render/EnemyArchetypeRenderer.ts` (nếu không sẽ dùng mặc định).
4. Đưa vào đợt quái: `config/maps/<map>.map.ts` hoặc `waves_extended.ts`.
5. Codex tự hiển thị từ `ENEMY_BLUEPRINTS`; chỉ sửa `CodexEnemies.ts` nếu cần bộ lọc/hiển thị mới.
6. Test: `architecture.test.ts`, `enemy_renderer.test.ts`, `lookup_audit.test.ts`.

### Cân bằng / thêm tháp
1. Sửa `config/towers.config.ts` (giữ đủ tier 1–3 + `4_A`, `4_B`).
2. Loại tháp mới: thêm vào `TowerType`, nhóm `*_TOWER_TYPES`, phím tắt `UIManager#bindKeyboard`,
   sub-key trong `SideDetailPanel.open`, render ở `TowerRenderer`, logic ở `TowerSystem`/`CombatSystem`/`GameState`.
3. Codex: `CodexBuildings` (phòng ngự), `CodexSoldiers` (triệu hồi), `CodexTraps` (bẫy) – kiểm tra text tĩnh mô tả cơ chế.
4. Test: `defense_restructure.test.ts`, `architecture.test.ts` (nhóm Game Balance).

### Thêm / sửa nguyên tố hoặc phản ứng
1. Nguyên tố: `config/elements/<x>.element.ts` + đăng ký trong `elements/index.ts` + `ElementType`
   (`types/elements.types.ts`) + icon `elements/icons/<x>.svg` & `icons/index.ts` + cập nhật `ALL_15_ELEMENTS` ở **cả** `CodexTypes.ts`.
2. Phản ứng: `config/elements/reactions.config.ts`; hiệu ứng bổ sung ở `TargetingRuleEngine.applyReactionBonusEffects`.
3. Test: `architecture.test.ts` (Elemental Matrix), `lookup_audit.test.ts`, `elements_svg.test.ts`.

### Thêm bản đồ
1. Tạo `config/maps/<id>.map.ts` export `MAP_<ID>` và `WAVES_<ID>` (theo mẫu map có sẵn).
2. Thêm `EXTENDED_WAVES_<ID>` trong `waves_extended.ts` (đợt sau 10).
3. Đăng ký trong `config/maps/index.ts` (import, export, `MAPS_CONFIG`).
4. Kiểm tra mọi `typeId` trong waves tồn tại trong `ENEMY_BLUEPRINTS`, quái bay chỉ ở airLanes, quái bơi chỉ ở waterLanes.
5. Test: `architecture.test.ts` (Multi-Lane Maps, Modular Map Files & Strict Wave Movement Rules), `ui_redesign.test.ts`.

### Thêm mục / tab Cẩm nang
1. Viết HTML trong module `src/ui/codex/` phù hợp (hoặc module mới `CodexXxx.ts`, class có method trả HTML + `bindEvents`).
2. Khởi tạo trong constructor `SideDetailPanel`, thêm nhánh trong `open()` và `renderContent()`
   (hoặc `renderBuildingsCategory()` nếu là sub-tab công trình).
3. Tab cấp 1 mới: thêm `<button class="codex-tab" data-cat="...">` vào `index.html`.
4. Test: `ui_modular.test.ts`.

