import { describe, it, expect } from 'vitest';
import { CodexBuildings } from '../ui/codex/CodexBuildings.js';
import { CodexSoldiers } from '../ui/codex/CodexSoldiers.js';
import { CodexTraps } from '../ui/codex/CodexTraps.js';
import { CodexImbue } from '../ui/codex/CodexImbue.js';
import { CodexElements } from '../ui/codex/CodexElements.js';
import { CodexEnemies } from '../ui/codex/CodexEnemies.js';
import { CodexNavigation } from '../ui/codex/CodexNavigation.js';
import { ALL_15_ELEMENTS, STATUS_TO_ELEMENT } from '../ui/codex/CodexTypes.js';
import { ENEMY_BLUEPRINTS } from '../config/enemies.config.js';
import { MAPS_CONFIG } from '../config/map.config.js';
import { MapSelectionModal } from '../ui/modals/MapSelectionModal.js';

describe('Modular UI Architecture Tests', () => {
  describe('CodexTypes', () => {
    it('should have all 15 elements defined', () => {
      expect(ALL_15_ELEMENTS).toHaveLength(15);
      expect(ALL_15_ELEMENTS).toContain('PHYSICAL');
      expect(ALL_15_ELEMENTS).toContain('FIRE');
      expect(ALL_15_ELEMENTS).toContain('WATER');
      expect(ALL_15_ELEMENTS).toContain('FAIRY');
      expect(ALL_15_ELEMENTS).toContain('DRAGON');
    });

    it('should map status effects to valid elements', () => {
      expect(STATUS_TO_ELEMENT.BURN).toBe('FIRE');
      expect(STATUS_TO_ELEMENT.FREEZE).toBe('ICE');
      expect(STATUS_TO_ELEMENT.POISON).toBe('POISON');
      expect(STATUS_TO_ELEMENT.SUNDER).toBe('STEEL');
    });
  });

  describe('CodexBuildings', () => {
    it('should render HTML for all tower types with upgrade tree and stats', () => {
      const buildings = new CodexBuildings(() => {});
      const towerTypes = ['BARRACKS', 'ARCHER', 'MAGE', 'ARTILLERY'] as const;

      for (const type of towerTypes) {
        const html = buildings.getTowerCategoryHtml(type);
        expect(html).toContain('CÂY NÂNG CẤP');
        expect(html).toContain('BẢNG SO SÁNH');
        expect(html).toContain('MÔ PHỎNG HIỆU ỨNG GẮN NGUYÊN TỐ');
      }
    });

    it('should include dual-slot simulation for Mage tower', () => {
      const buildings = new CodexBuildings(() => {});
      const html = buildings.getTowerCategoryHtml('MAGE');
      expect(html).toContain('Khe Nguyên Tố 2 Độc Lập');
      expect(html).toContain('data-mage-slot="2"');
    });
  });

  describe('CodexSoldiers', () => {
    it('should render soldier comparison between Melee and Ranged stances', () => {
      const soldiers = new CodexSoldiers();
      const html = soldiers.getSoldiersCategoryHtml();
      expect(html).toContain('Lính Đánh Gần (Melee Swordsman)');
      expect(html).toContain('Lính Bắn Tên (Ranged Archer)');
      expect(html).toContain('BẢNG SO SÁNH CHỈ SỐ CỦA 3 CHIẾN BINH');
    });
  });

  describe('CodexTraps & CodexImbue', () => {
    it('should render trap details for all 4 traps', () => {
      const traps = new CodexTraps();
      const html = traps.getTrapsCategoryHtml();
      expect(html).toContain('Chông Gai');
      expect(html).toContain('Hỏa Ngục');
      expect(html).toContain('Thủy Lôi');
      expect(html).toContain('Lưới Điện');
    });

    it('should render imbue mechanics for all building types', () => {
      const imbue = new CodexImbue();
      const html = imbue.getBuildingImbueCategoryHtml();
      expect(html).toContain('CƠ CHẾ TRANG BỊ NGUYÊN TỐ');
      expect(html).toContain('Trại Dân Quân (Barracks)');
      expect(html).toContain('Tháp Cung Thủ (Archer Tower)');
      expect(html).toContain('Tháp Phù Thủy (Mage Tower)');
      expect(html).toContain('Pháo Cối (Artillery)');
    });
  });

  describe('CodexElements', () => {
    it('should render sidebar with 15 elements and reactions without redundant overview table', () => {
      const elements = new CodexElements();
      const mockContent = { innerHTML: '', querySelector: () => null, querySelectorAll: () => [] } as any;
      const mockTitle = { textContent: '' } as any;
      const mockIcon = { textContent: '' } as any;
      const mockBadge = { textContent: '' } as any;

      elements.renderElementsCategory(mockContent, mockTitle, mockIcon, mockBadge);

      // Verify all 15 elements are present in the sidebar
      for (const elem of ALL_15_ELEMENTS) {
        expect(mockContent.innerHTML).toContain(`data-sub-elem="${elem}"`);
      }
      expect(mockContent.innerHTML).toContain('data-sub-elem="REACTIONS"');
      // Ensure redundant OVERVIEW is removed
      expect(mockContent.innerHTML).not.toContain('data-sub-elem="OVERVIEW"');
    });

    it('should render elemental reactions with search bar and filter controls', () => {
      const elements = new CodexElements();
      const html = elements.getElementalReactionsHtml();
      expect(html).toContain('PHẢN ỨNG NGUYÊN TỐ');
      expect(html).toContain('codex-reaction-search');
      expect(html).toContain('codex-reaction-cat-filter');
      expect(html).toContain('codex-reaction-elem-filter');
      expect(html).toContain('Long Uy Khuếch Đại');
      expect(html).toContain('Tiên Linh Tăng Phúc');
      expect(html).toContain('Hắc Ám Thôn Phệ');
    });

    it('should render single element detail with 3 lookup tables and 4-building breakdown', () => {
      const elements = new CodexElements();
      const html = elements.getSingleElementDetailHtml('FIRE');
      expect(html).toContain('Lửa (Hỏa)');
      expect(html).toContain('BẢNG TRA CỨU GÂY SÁT THƯƠNG');
      expect(html).toContain('BẢNG TRA CỨU NHẬN SÁT THƯƠNG');
      expect(html).toContain('BẢNG PHỐI HỢP HIỆU ỨNG');
      expect(html).toContain('Trại Dân Quân');
      expect(html).toContain('Tháp Cung');
      expect(html).toContain('Tháp Phù Thủy');
      expect(html).toContain('Pháo Cối');
    });
  });

  describe('CodexEnemies', () => {
    const enemies = new CodexEnemies(
      () => true,
      () => 'ENEMIES'
    );

    it('should correctly calculate damage intake and categories', () => {
      const runner = ENEMY_BLUEPRINTS['STICK_RUNNER'];
      const intakeNormal = enemies.calculateDamageIntake(runner, 'PHYSICAL');
      expect(intakeNormal.multiplier).toBeGreaterThanOrEqual(0);

      const fireImp = ENEMY_BLUEPRINTS['FIRE_IMP'];
      const intakeImmune = enemies.calculateDamageIntake(fireImp, 'FIRE');
      expect(intakeImmune.category).toBe('IMMUNE');
      expect(intakeImmune.percentage).toBe(0);

      const intakeWeak = enemies.calculateDamageIntake(fireImp, 'WATER');
      expect(intakeWeak.category).toBe('SUPER_WEAK');
      expect(intakeWeak.multiplier).toBe(2.0);
    });

    it('should generate matchup summary with weaknesses and resistances', () => {
      const fireImp = ENEMY_BLUEPRINTS['FIRE_IMP'];
      const summary = enemies.getEnemyMatchupSummary(fireImp);
      expect(summary.immunities).toContain('FIRE');
      expect(summary.weaknesses.some((w) => w.element === 'WATER')).toBe(true);
    });

    it('should render detailed HTML card for enemy', () => {
      const boss = ENEMY_BLUEPRINTS['SHADOW_WRAITH'];
      const html = enemies.getEnemyDetailHtml(boss);
      expect(html).toContain('SHADOW_WRAITH');
      expect(html).toContain('codex-enemy-canvas');
      expect(html).toContain('BẢNG TỈ LỆ SÁT THƯƠNG NHẬN VÀO TỪ MỖI HỆ NGUYÊN TỐ');
    });
  });

  describe('CodexNavigation', () => {
    it('should render navigation overview and all 3 domains', () => {
      const nav = new CodexNavigation();
      const overview = nav.getNavOverviewHtml();
      expect(overview).toContain('Tuyến Đường Bộ (Ground)');
      expect(overview).toContain('Tuyến Đường Bay (Air)');
      expect(overview).toContain('Tuyến Kênh Sông (Water)');

      expect(nav.getSingleNavDetailHtml('WALK')).toContain('GROUND PATH');
      expect(nav.getSingleNavDetailHtml('FLY')).toContain('AIRWAYS');
      expect(nav.getSingleNavDetailHtml('SWIM')).toContain('WATERWAYS');
    });
  });

  describe('MapSelectionModal', () => {
    it('should generate valid mini-map SVG for all 8 maps', () => {
      // Create lightweight mock modal for testing SVG generation
      const modal = new MapSelectionModal({} as any, () => {});
      for (const map of MAPS_CONFIG) {
        const svg = modal.generateMiniMapSvg(map);
        expect(svg).toContain('<svg');
        expect(svg).toContain('class="mini-map-svg"');
        expect(svg).toContain('</svg>');
      }
    });
  });
});
