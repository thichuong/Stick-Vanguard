import { describe, it, expect } from 'vitest';
import {
  TOWER_BLUEPRINTS,
  DEFENSE_TOWER_TYPES,
  SUMMON_TOWER_TYPES,
  TRAP_TOWER_TYPES,
  getTowerCategory
} from '../config/towers.config.js';
import { GameState } from '../core/GameState.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { TowerSystem } from '../systems/TowerSystem.js';
import { SoldierEntity, EnemyEntity, TowerEntity } from '../types/entities.types.js';
import { ArsenalBar } from '../ui/hud/ArsenalBar.js';
import { InspectorPanel } from '../ui/inspector/InspectorPanel.js';

describe('Defense System Restructure & New Summon Towers', () => {
  it('correctly classifies towers into 3 categories', () => {
    // 1. Tháp phòng ngự
    expect(DEFENSE_TOWER_TYPES).toEqual(['ARCHER', 'ARTILLERY', 'MAGE']);
    expect(getTowerCategory('ARCHER')).toBe('DEFENSE');
    expect(getTowerCategory('MAGE')).toBe('DEFENSE');
    expect(getTowerCategory('ARTILLERY')).toBe('DEFENSE');

    // 2. Tháp triệu hồi
    expect(SUMMON_TOWER_TYPES).toEqual(['BARRACKS', 'DRAGON_NEST', 'FAIRY_TREE', 'HEROIC_ALTAR']);
    expect(getTowerCategory('BARRACKS')).toBe('SUMMON');
    expect(getTowerCategory('DRAGON_NEST')).toBe('SUMMON');
    expect(getTowerCategory('FAIRY_TREE')).toBe('SUMMON');
    expect(getTowerCategory('HEROIC_ALTAR')).toBe('SUMMON');

    // 3. Bẫy
    expect(TRAP_TOWER_TYPES).toEqual(['TRAP_SPIKE', 'TRAP_FIRE', 'TRAP_FROST', 'TRAP_NET']);
    expect(getTowerCategory('TRAP_SPIKE')).toBe('TRAP');
    expect(getTowerCategory('TRAP_FIRE')).toBe('TRAP');
    expect(getTowerCategory('TRAP_FROST')).toBe('TRAP');
    expect(getTowerCategory('TRAP_NET')).toBe('TRAP');
  });

  it('verifies Dragon Nest blueprints across all tiers', () => {
    const t1 = TOWER_BLUEPRINTS['DRAGON_NEST_1'];
    const t2 = TOWER_BLUEPRINTS['DRAGON_NEST_2'];
    const t3 = TOWER_BLUEPRINTS['DRAGON_NEST_3'];
    const t4A = TOWER_BLUEPRINTS['DRAGON_NEST_4_A'];
    const t4B = TOWER_BLUEPRINTS['DRAGON_NEST_4_B'];

    expect(t1).toBeDefined();
    expect(t1.element).toBe('DRAGON');
    expect(t1.maxSoldiers).toBe(1);
    expect(t1.aoeRadius).toBeGreaterThan(0);

    // Upgrades do not increase the number of dragons
    expect(t2.maxSoldiers).toBe(1);
    expect(t3.maxSoldiers).toBe(1);
    expect(t4A.maxSoldiers).toBe(1);
    expect(t4B.maxSoldiers).toBe(1);

    // Stats scale up
    expect(t2.damage).toBeGreaterThan(t1.damage);
    expect(t3.damage).toBeGreaterThan(t2.damage);
    expect(t4A.damage).toBeGreaterThan(t3.damage);
    expect(t4B.damage).toBeGreaterThan(t3.damage);
  });

  it('verifies Fairy Tree blueprints across all tiers', () => {
    const t1 = TOWER_BLUEPRINTS['FAIRY_TREE_1'];
    const t2 = TOWER_BLUEPRINTS['FAIRY_TREE_2'];
    const t3 = TOWER_BLUEPRINTS['FAIRY_TREE_3'];
    const t4A = TOWER_BLUEPRINTS['FAIRY_TREE_4_A'];
    const t4B = TOWER_BLUEPRINTS['FAIRY_TREE_4_B'];

    expect(t1).toBeDefined();
    expect(t1.element).toBe('FAIRY');
    // Fairy count increases with tiers
    expect(t1.maxSoldiers).toBe(2);
    expect(t2.maxSoldiers).toBe(3);
    expect(t3.maxSoldiers).toBe(4);
    expect(t4A.maxSoldiers).toBe(5);
    expect(t4B.maxSoldiers).toBe(5);
  });

  it('verifies Heroic Altar blueprints across all tiers', () => {
    const t1 = TOWER_BLUEPRINTS['HEROIC_ALTAR_1'];
    const t2 = TOWER_BLUEPRINTS['HEROIC_ALTAR_2'];
    const t3 = TOWER_BLUEPRINTS['HEROIC_ALTAR_3'];
    const t4A = TOWER_BLUEPRINTS['HEROIC_ALTAR_4_A'];
    const t4B = TOWER_BLUEPRINTS['HEROIC_ALTAR_4_B'];

    expect(t1).toBeDefined();
    expect(t1.element).toBe('GHOST');
    expect(t1.resurrectChance).toBeDefined();
    expect(t2.resurrectChance!).toBeGreaterThan(t1.resurrectChance!);
    expect(t3.resurrectChance!).toBeGreaterThan(t2.resurrectChance!);
    expect(t4A.maxSoldiers!).toBeGreaterThan(t3.maxSoldiers!);
    expect(t4B.maxSoldiers!).toBeGreaterThan(t3.maxSoldiers!);
  });

  it('verifies GameState building and unit initialization for Dragon Nest, Fairy Tree, Heroic Altar', () => {
    const state = new GameState();
    state.gold = 5000;
    // Stub placement validation to always allow in unit test
    state.validatePlacement = () => ({ valid: true, placement: 'ROADSIDE' });

    // 1. Build Dragon Nest
    const buildSuccess1 = state.buildTowerAt(100, 100, 'DRAGON_NEST');
    expect(buildSuccess1).toBe(true);
    const dragonTower = state.towers.find((t) => t.type === 'DRAGON_NEST')!;
    expect(dragonTower).toBeDefined();
    expect(dragonTower.element).toBe('DRAGON');
    expect(dragonTower.secondaryElement).toBe('FIRE');
    expect(dragonTower.soldierIds!.length).toBe(1);

    const dragon = state.soldiers.find((s) => s.id === dragonTower.soldierIds![0]);
    expect(dragon).toBeDefined();
    expect(dragon!.archetype).toBe('DRAGON');
    expect(dragon!.canBlockAir).toBe(true);
    expect(dragon!.aoeRadius).toBeGreaterThan(0);
    expect(dragon!.element).toBe('DRAGON');

    // Upgrade Dragon Nest
    state.upgradeTower(dragonTower.id);
    expect(dragonTower.tier).toBe(2);
    expect(dragonTower.soldierIds!.length).toBe(1); // Still 1 dragon

    // 2. Build Fairy Tree
    const buildSuccess2 = state.buildTowerAt(200, 200, 'FAIRY_TREE');
    expect(buildSuccess2).toBe(true);
    const fairyTower = state.towers.find((t) => t.type === 'FAIRY_TREE')!;
    expect(fairyTower).toBeDefined();
    expect(fairyTower.element).toBe('FAIRY');
    expect(fairyTower.secondaryElement).toBe('LIGHT');
    expect(fairyTower.soldierIds!.length).toBe(2);

    const fairies = state.soldiers.filter((s) => fairyTower.soldierIds!.includes(s.id));
    expect(fairies.length).toBe(2);
    expect(fairies[0].archetype).toBe('FAIRY');
    expect(fairies[0].canBlockAir).toBe(true);

    // Upgrade Fairy Tree to Tier 2 -> 3 fairies
    state.upgradeTower(fairyTower.id);
    expect(fairyTower.tier).toBe(2);
    expect(fairyTower.soldierIds!.length).toBe(3);

    // 3. Build Heroic Altar
    const buildSuccess3 = state.buildTowerAt(300, 300, 'HEROIC_ALTAR');
    expect(buildSuccess3).toBe(true);
    const altar = state.towers.find((t) => t.type === 'HEROIC_ALTAR')!;
    expect(altar).toBeDefined();
    expect(altar.element).toBe('GHOST');
    expect(altar.soldierIds!.length).toBe(0); // Starts with 0 until units die
  });

  it('verifies Heroic Altar resurrects fallen units as Ghost spirits', () => {
    const state = new GameState();
    state.gold = 5000;
    state.validatePlacement = () => ({ valid: true, placement: 'ROADSIDE' });

    state.buildTowerAt(300, 300, 'HEROIC_ALTAR');
    const altar = state.towers.find((t) => t.type === 'HEROIC_ALTAR')!;
    // Altar at (300, 300) with 100% chance override for testing
    altar.resurrectChance = 1.0;

    // Mock a dead soldier near altar (dist < range)
    const deadSoldier: SoldierEntity = {
      id: 'soldier_test_1',
      towerId: 'barracks_1',
      name: 'Chiến Binh',
      x: 320,
      y: 310,
      hp: 0,
      maxHp: 100,
      baseMaxHp: 100,
      damage: 15,
      baseDamage: 15,
      attackSpeed: 1,
      attackCooldown: 0.5,
      armor: 0.1,
      baseArmor: 0.1,
      magicResist: 0.1,
      rallyPoint: { x: 320, y: 310 },
      targetPos: { x: 320, y: 310 },
      tier: 1,
      state: 'DEAD',
      engagedEnemyId: null,
      respawnTimer: 10,
      respawnDelay: 8,
      combatMode: 'MELEE',
      archetype: 'SOLDIER',
      element: 'PHYSICAL',
      isSpirit: false
    };

    const resurrected = state.trySpawnHeroicSpirit(deadSoldier);
    expect(resurrected).toBe(true);
    expect(altar.soldierIds!.length).toBe(1);

    const spirit = state.soldiers.find((s) => s.id === altar.soldierIds![0]);
    expect(spirit).toBeDefined();
    expect(spirit!.isSpirit).toBe(true);
    expect(spirit!.element).toBe('GHOST');
    expect(spirit!.towerId).toBe(altar.id);
  });

  it('verifies dragon and fairy can attack all 3 path types (WALK, FLY, SWIM) but can only block WALK and FLY', () => {
    const walkingEnemy: Partial<EnemyEntity> = {
      id: 'walk_goblin',
      typeId: 'GOBLIN',
      x: 100,
      y: 100,
      hp: 100,
      maxHp: 100,
      damage: 5,
      speed: 1,
      baseSpeed: 1,
      movementType: 'WALK',
      state: 'WALKING',
      engagedBySoldierId: null,
      pathDistance: 20,
      tags: [],
      statusEffects: [],
      elementalProfile: { primaryElement: 'PHYSICAL', immunities: [] }
    };

    const flyingEnemy: Partial<EnemyEntity> = {
      id: 'flying_bat',
      typeId: 'BAT',
      x: 100,
      y: 100,
      hp: 100,
      maxHp: 100,
      damage: 5,
      speed: 1,
      baseSpeed: 1,
      movementType: 'FLY',
      state: 'FLYING',
      engagedBySoldierId: null,
      pathDistance: 20,
      tags: [],
      statusEffects: [],
      elementalProfile: { primaryElement: 'PHYSICAL', immunities: [] }
    };

    const swimmingEnemy: Partial<EnemyEntity> = {
      id: 'swimming_serpent',
      typeId: 'WATER_ELEMENTAL',
      x: 100,
      y: 100,
      hp: 100,
      maxHp: 100,
      damage: 5,
      speed: 1,
      baseSpeed: 1,
      movementType: 'SWIM',
      state: 'SWIMMING',
      engagedBySoldierId: null,
      pathDistance: 20,
      tags: [],
      statusEffects: [],
      elementalProfile: { primaryElement: 'WATER', immunities: [] }
    };

    // 1. BLOCKING LOGIC (findUnengagedEnemyNear):
    // WALK: Can be blocked by Dragon & Fairy
    const walkBlocked = (CombatSystem as any).findUnengagedEnemyNear(
      { x: 105, y: 105 },
      50,
      [walkingEnemy as EnemyEntity],
      true
    );
    expect(walkBlocked).not.toBeNull();
    expect(walkBlocked.id).toBe('walk_goblin');

    // FLY: Can be blocked by Dragon & Fairy (canBlockAir = true)
    const flyBlocked = (CombatSystem as any).findUnengagedEnemyNear(
      { x: 105, y: 105 },
      50,
      [flyingEnemy as EnemyEntity],
      true
    );
    expect(flyBlocked).not.toBeNull();
    expect(flyBlocked.id).toBe('flying_bat');

    // SWIM: CANNOT be blocked by Dragon or Fairy!
    const swimBlocked = (CombatSystem as any).findUnengagedEnemyNear(
      { x: 105, y: 105 },
      50,
      [swimmingEnemy as EnemyEntity],
      true
    );
    expect(swimBlocked).toBeNull(); // Strictly null: swimming enemies can never be blocked!

    // 2. ATTACKING LOGIC (CombatSystem.updateCombat):
    // Dragon can attack the SWIM enemy without blocking it!
    const dragon: SoldierEntity = {
      id: 'dragon_combat_test',
      towerId: 'dragon_nest_1',
      name: 'Hỏa Long',
      archetype: 'DRAGON',
      canBlockAir: true,
      canTargetAir: true,
      canTargetSwim: true,
      aoeRadius: 55,
      x: 100,
      y: 120, // 20px from swimming enemy
      hp: 220,
      maxHp: 220,
      baseMaxHp: 220,
      damage: 30,
      baseDamage: 30,
      attackSpeed: 1,
      attackCooldown: 0,
      element: 'DRAGON',
      secondaryElement: 'FIRE',
      combatMode: 'MELEE',
      state: 'IDLE',
      engagedEnemyId: null,
      rallyPoint: { x: 100, y: 120 },
      targetPos: { x: 100, y: 120 },
      armor: 0.2,
      baseArmor: 0.2,
      magicResist: 0.2,
      respawnTimer: 0,
      respawnDelay: 9,
      tier: 1
    };

    const combatEvents: any[] = [];
    CombatSystem.updateCombat(
      [dragon],
      [swimmingEnemy as EnemyEntity],
      0.1,
      (evt) => combatEvents.push(evt)
    );

    // Swimming enemy must have taken damage
    expect(swimmingEnemy.hp).toBeLessThan(100);
    expect(combatEvents.length).toBeGreaterThan(0);
    expect(combatEvents[0].type).toBe('MELEE_HIT');

    // Swimming enemy MUST NOT be blocked (state remains SWIMMING, engagedBySoldierId is null)
    expect(swimmingEnemy.state).toBe('SWIMMING');
    expect(swimmingEnemy.engagedBySoldierId).toBeNull();
    expect(dragon.engagedEnemyId).toBeNull();

    // Dragon faced the swimming enemy
    expect(dragon.facing).toBeCloseTo(-Math.PI / 2, 2); // Target at (100, 100), dragon at (100, 120): angle = -PI/2
  });

  it('tracks hoveredBuildTowerType and renders range preview for selected build point', () => {
    const state = new GameState();
    expect(state.hoveredBuildTowerType).toBeNull();

    // Select build point on map
    state.selectedBuildPoint = {
      x: 250,
      y: 200,
      terrain: 'LAND',
      validFor: 'TOWER',
      placement: 'ROADSIDE'
    };

    // User hovers over Dragon Nest in the list
    state.hoveredBuildTowerType = 'DRAGON_NEST';
    expect(state.hoveredBuildTowerType).toBe('DRAGON_NEST');

    const bp = TOWER_BLUEPRINTS['DRAGON_NEST_1'];
    expect(bp.range).toBe(130);

    // Reset hover on mouse leave
    state.hoveredBuildTowerType = null;
    expect(state.hoveredBuildTowerType).toBeNull();
  });

  it('verifies dragon rotates and updates facing angle towards movement and attack target', () => {
    const dragon: SoldierEntity = {
      id: 'dragon_test',
      towerId: 'dragon_nest_1',
      name: 'Hỏa Long',
      archetype: 'DRAGON',
      canBlockAir: true,
      canTargetAir: true,
      x: 100,
      y: 100,
      hp: 200,
      maxHp: 200,
      baseMaxHp: 200,
      damage: 30,
      baseDamage: 30,
      attackSpeed: 1,
      attackCooldown: 0.5,
      armor: 0.2,
      baseArmor: 0.2,
      magicResist: 0.2,
      element: 'DRAGON',
      combatMode: 'MELEE',
      state: 'IDLE',
      engagedEnemyId: null,
      rallyPoint: { x: 50, y: 100 },
      targetPos: { x: 50, y: 100 },
      tier: 1,
      respawnTimer: 0,
      respawnDelay: 9,
      facing: 0
    };

    const targetEnemy: Partial<EnemyEntity> = {
      id: 'enemy_1',
      typeId: 'GOBLIN',
      x: 150, // To the right of dragon
      y: 150, // Below dragon (angle approx +PI/4 = 45 degrees)
      hp: 100,
      maxHp: 100,
      damage: 5,
      speed: 1,
      baseSpeed: 1,
      movementType: 'WALK',
      state: 'WALKING',
      engagedBySoldierId: null,
      tags: []
    };

    // 1. When engaged with an enemy, dragon updates facing towards target
    dragon.engagedEnemyId = targetEnemy.id!;
    targetEnemy.engagedBySoldierId = dragon.id;

    CombatSystem.updateCombat([dragon], [targetEnemy as EnemyEntity], 0.05, () => {});

    // Expected angle: Math.atan2(150 - 100, 150 - 100) = Math.PI / 4 = ~0.785
    expect(dragon.facing).toBeCloseTo(Math.PI / 4, 2);

    // 2. When disengaged and returning to rally point at (50, 100)
    dragon.engagedEnemyId = null;
    CombatSystem.updateCombat([dragon], [], 0.05, () => {});

    // Expected angle towards rally point (50 - 100, 100 - 100): pointing left (cos ≈ -1)
    expect(Math.cos(dragon.facing!)).toBeCloseTo(-1, 2);
  });

  it('verifies summon towers never attack or spawn projectiles in TowerSystem', () => {
    const spawnedProjectiles: any[] = [];
    const onSpawnProjectile = (proj: any) => spawnedProjectiles.push(proj);

    const enemy: Partial<EnemyEntity> = {
      id: 'enemy_in_range',
      typeId: 'GOBLIN',
      x: 100,
      y: 105,
      hp: 100,
      maxHp: 100,
      damage: 5,
      speed: 1,
      baseSpeed: 1,
      movementType: 'WALK',
      state: 'WALKING',
      engagedBySoldierId: null,
      tags: [],
      pathDistance: 10,
      elementalProfile: {
        primaryElement: 'PHYSICAL',
        immunities: []
      }
    };

    const summonTowerTypes: ('BARRACKS' | 'DRAGON_NEST' | 'FAIRY_TREE' | 'HEROIC_ALTAR')[] = [
      'BARRACKS',
      'DRAGON_NEST',
      'FAIRY_TREE',
      'HEROIC_ALTAR'
    ];

    for (const type of summonTowerTypes) {
      const summonTower: Partial<TowerEntity> = {
        id: `tower_${type}`,
        type,
        tier: 1,
        placement: 'ROADSIDE',
        x: 100,
        y: 100,
        range: 200,
        damage: 50,
        fireRate: 1,
        attackCooldown: 0,
        element: 'PHYSICAL'
      };

      TowerSystem.updateTowers(
        [summonTower as TowerEntity],
        [enemy as EnemyEntity],
        0.1,
        onSpawnProjectile
      );
    }

    // No projectiles should have been spawned by any summon towers
    expect(spawnedProjectiles.length).toBe(0);

    // Defense tower (e.g. ARCHER) should attack and spawn a projectile
    const archerTower: Partial<TowerEntity> = {
      id: 'archer_tower_1',
      type: 'ARCHER',
      tier: 1,
      placement: 'ROADSIDE',
      x: 100,
      y: 100,
      range: 200,
      damage: 20,
      fireRate: 1,
      attackCooldown: 0,
      element: 'PHYSICAL',
      targetingFilter: {
        allowedMovement: ['WALK', 'FLY']
      }
    };

    TowerSystem.updateTowers(
      [archerTower as TowerEntity],
      [enemy as EnemyEntity],
      0.1,
      onSpawnProjectile
    );

    expect(spawnedProjectiles.length).toBe(1);
    expect(spawnedProjectiles[0].sourceTowerId).toBe('archer_tower_1');
  });

  it('verifies Heroic Altar has fixed GHOST element and cannot change or select elements', () => {
    const state = new GameState();
    state.gold = 5000;
    state.validatePlacement = () => ({ valid: true, placement: 'ROADSIDE' });

    // Build Heroic Altar
    state.buildTowerAt(100, 100, 'HEROIC_ALTAR');
    const altar = state.towers.find((t) => t.type === 'HEROIC_ALTAR');
    expect(altar).toBeDefined();
    expect(altar!.element).toBe('GHOST');
    expect(altar!.secondaryElement).toBeNull();

    // Attempting to change or imbue element on Heroic Altar must be rejected
    const imbueResult = state.setTowerElement(altar!.id, 'FIRE');
    expect(imbueResult).toBe(false);
    expect(altar!.element).toBe('GHOST');
    expect(altar!.secondaryElement).toBeNull();
  });

  it('verifies InspectorPanel and ArsenalBar render live summoned units with HP and status', () => {
    const state = new GameState();
    state.gold = 5000;
    state.validatePlacement = () => ({ valid: true, placement: 'ROADSIDE' });

    // Build Barracks
    state.buildTowerAt(100, 100, 'BARRACKS');
    const barracks = state.towers.find((t) => t.type === 'BARRACKS')!;
    expect(barracks).toBeDefined();

    // Verify ArsenalBar helper returns summoned units
    const mockEl = { addEventListener: () => {}, querySelectorAll: () => [] } as any;
    const origDoc = (globalThis as any).document;
    (globalThis as any).document = {
      getElementById: () => mockEl,
      querySelectorAll: () => []
    };

    try {
      const arsenalBar = new ArsenalBar(state, () => {});
      const liveUnits = arsenalBar.getLiveSummonedUnits(barracks.id);
      expect(liveUnits.length).toBe(3);
      expect(liveUnits[0].hp).toBe(100);
      expect(liveUnits[0].maxHp).toBe(100);

      // Verify InspectorPanel summon unit rendering
      const mockSidePanel = { open: () => {}, toggle: () => {} };
      const inspector = new InspectorPanel(state, mockSidePanel as any, () => {});
      const html = inspector.renderSummonedUnitsSectionHtml(barracks);

      expect(html).toContain('ĐƠN VỊ ĐANG TRIỆU HỒI');
      expect(html).toContain('Lính 1');
      expect(html).toContain('100/100');
      expect(html).toContain('suc-hp-fill');
      expect(html).toContain('Chốt chặn');
    } finally {
      (globalThis as any).document = origDoc;
    }
  });
});
