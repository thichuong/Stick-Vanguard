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
import { SideDetailPanel } from '../ui/SideDetailPanel.js';

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
    it('should render unified summon codex with all 4 summon systems and overview comparison', () => {
      const soldiers = new CodexSoldiers();
      const html = soldiers.getSoldiersCategoryHtml();
      // Verifies unified sub-navigation buttons
      expect(html).toContain('Trại Dân Quân');
      expect(html).toContain('Tổ Rồng');
      expect(html).toContain('Cây Tiên');
      expect(html).toContain('Tế Đàn Anh Linh');
      expect(html).toContain('Tổng Quan & So Sánh');

      // Verifies soldier stances and comprehensive stat tables
      expect(html).toContain('Lính Cận Chiến');
      expect(html).toContain('Lính Bắn Tên');
      expect(html).toContain('BẢNG SO SÁNH CHỈ SỐ CẢ 4 CẤP (THÁP & ĐƠN VỊ TRIỆU HỒI)');
      expect(html).toContain('MÔ PHỎNG NGUYÊN TỐ CHO ĐƠN VỊ');
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

    it('should reset search query and filters via resetFilters', () => {
      enemies.enemySearchQuery = 'dragon';
      enemies.enemyElementFilter = 'FIRE';
      enemies.enemyMovementFilter = 'FLY';
      enemies.enemyTagFilter = 'BOSS';

      enemies.resetFilters();

      expect(enemies.enemySearchQuery).toBe('');
      expect(enemies.enemyElementFilter).toBe('ALL');
      expect(enemies.enemyMovementFilter).toBe('ALL');
      expect(enemies.enemyTagFilter).toBe('ALL');
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

  describe('SideDetailPanel Enemy Reset and External Target Tests', () => {
    it('should reset filters on close and when opening enemy from outside target', () => {
      const createMockEl = (classes: string[] = []) => {
        const classSet = new Set(classes);
        return {
          classList: {
            add: (c: string) => classSet.add(c),
            remove: (c: string) => classSet.delete(c),
            contains: (c: string) => classSet.has(c),
          },
          addEventListener: () => {},
          querySelectorAll: () => [],
          querySelector: () => null,
          getContext: () => null,
          textContent: '',
          innerHTML: '',
        };
      };

      const mockElements: Record<string, any> = {
        'codex-modal-backdrop': createMockEl(['hidden']),
        'codex-modal-body': createMockEl(),
        'codex-modal-title': createMockEl(),
        'codex-modal-badge': createMockEl(),
        'codex-modal-icon': createMockEl(),
        'btn-close-codex-modal': createMockEl(),
      };

      const originalDocument = (globalThis as any).document;
      const originalWindow = (globalThis as any).window;

      (globalThis as any).document = {
        getElementById: (id: string) => mockElements[id] || createMockEl(),
        addEventListener: () => {},
      };
      (globalThis as any).window = globalThis;

      try {
        const panel = new SideDetailPanel();
        const codexEnemies = (panel as any).enemiesCodex as CodexEnemies;

        // Simulate user searching / filtering
        codexEnemies.enemySearchQuery = 'dragon';
        codexEnemies.enemyElementFilter = 'FIRE';
        codexEnemies.enemyMovementFilter = 'FLY';
        codexEnemies.enemyTagFilter = 'BOSS';

        // 1. When opening an enemy target from outside (e.g. clicking enemy in stage wave view)
        panel.open('ENEMIES', 'STICK_RUNNER');

        // Filters must be cleared so STICK_RUNNER (non-fire, walk) is successfully found and selected
        expect(codexEnemies.enemySearchQuery).toBe('');
        expect(codexEnemies.enemyElementFilter).toBe('ALL');
        expect(codexEnemies.enemyMovementFilter).toBe('ALL');
        expect(codexEnemies.enemyTagFilter).toBe('ALL');
        expect(codexEnemies.selectedEnemyTypeId).toBe('STICK_RUNNER');

        // Simulate applying filters again
        codexEnemies.enemySearchQuery = 'demon';
        codexEnemies.enemyElementFilter = 'DARK';

        // 2. When closing the modal ("khi tắt cẩm nang")
        panel.close();

        // Filters must be reset upon closing
        expect(codexEnemies.enemySearchQuery).toBe('');
        expect(codexEnemies.enemyElementFilter).toBe('ALL');
        expect(panel.isOpen()).toBe(false);
      } finally {
        (globalThis as any).document = originalDocument;
        (globalThis as any).window = originalWindow;
      }
    });
  });
});
