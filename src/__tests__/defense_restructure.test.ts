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
import { SummonedUnitDetailModal } from '../ui/modals/SummonedUnitDetailModal.js';
import { SoundSystem } from '../systems/SoundSystem.js';
import { StorageService } from '../core/StorageService.js';
import { WasmBridge } from '../core/WasmBridge.js';

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
    expect(t1.resurrectChance).toBe(0.30);
    expect(t1.maxSoldiers).toBe(2);
    expect(t1.spiritGhostRatio).toBe(0.50);

    expect(t2.resurrectChance).toBe(0.45);
    expect(t2.maxSoldiers).toBe(3);
    expect(t2.spiritGhostRatio).toBe(0.50);

    expect(t3.resurrectChance).toBe(0.60);
    expect(t3.maxSoldiers).toBe(4);
    expect(t3.spiritGhostRatio).toBe(0.50);

    // Tier 4-A: Max 6 spirits, 80% chance, 50% ghost ratio
    expect(t4A.maxSoldiers).toBe(6);
    expect(t4A.resurrectChance).toBe(0.80);
    expect(t4A.spiritGhostRatio).toBe(0.50);

    // Tier 4-B: Max 5 spirits, 70% chance, 100% ghost ratio
    expect(t4B.maxSoldiers).toBe(5);
    expect(t4B.resurrectChance).toBe(0.70);
    expect(t4B.spiritGhostRatio).toBe(1.00);
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

    // Damage dragon to verify HP is refilled on upgrade
    dragon!.hp = 20;
    expect(dragon!.hp).toBe(20);

    // Upgrade Dragon Nest
    state.upgradeTower(dragonTower.id);
    expect(dragonTower.tier).toBe(2);
    expect(dragonTower.soldierIds!.length).toBe(1); // Still 1 dragon
    expect(dragon!.hp).toBe(dragon!.maxHp); // Dragon HP auto-refilled to full maxHp on upgrade!
    expect(dragon!.hp).toBeGreaterThan(20);

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

    // Damage fairy 0 and kill fairy 1 before upgrade
    fairies[0].hp = 15;
    fairies[1].state = 'DEAD';
    fairies[1].hp = 0;

    // Upgrade Fairy Tree to Tier 2 -> 3 fairies
    state.upgradeTower(fairyTower.id);
    expect(fairyTower.tier).toBe(2);
    expect(fairyTower.soldierIds!.length).toBe(3);

    // All fairies should have full HP and dead fairy revived
    const fairiesT2 = state.soldiers.filter((s) => fairyTower.soldierIds!.includes(s.id));
    for (const f of fairiesT2) {
      expect(f.hp).toBe(f.maxHp);
      expect(f.state).not.toBe('DEAD');
    }

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
    expect(spirit!.spiritGhostRatio).toBe(0.5);
    expect(spirit!.hp).toBe(deadSoldier.baseMaxHp);
    expect(spirit!.damage).toBe(deadSoldier.baseDamage);
    expect(spirit!.armor).toBe(deadSoldier.baseArmor);
    expect(spirit!.element).toBe(deadSoldier.element);
    expect(spirit!.towerId).toBe(altar.id);
  });

  it('verifies Heroic Altar Tier 4 Branch A (max 6, 80%, +50% ghost dmg) and Branch B (max 5, 70%, +100% ghost dmg)', () => {
    const stateA = new GameState();
    stateA.gold = 5000;
    stateA.validatePlacement = () => ({ valid: true, placement: 'ROADSIDE' });
    stateA.buildTowerAt(300, 300, 'HEROIC_ALTAR');
    const altarA = stateA.towers.find((t) => t.type === 'HEROIC_ALTAR')!;
    
    // Upgrade altar to Tier 4 Branch A
    stateA.upgradeTower(altarA.id); // Tier 2
    stateA.upgradeTower(altarA.id); // Tier 3
    stateA.upgradeTower(altarA.id, 'A'); // Tier 4 Branch A
    expect(altarA.tier).toBe(4);
    expect(altarA.branch).toBe('A');
    expect(altarA.maxSoldiers).toBe(6);
    expect(altarA.resurrectChance).toBe(0.80);
    expect(altarA.spiritGhostRatio).toBe(0.50);

    // Mock a dead soldier for Altar 4-A
    const deadSoldierA: SoldierEntity = {
      id: 'soldier_a',
      towerId: 'barracks_a',
      name: 'Chiến Binh',
      x: 310,
      y: 310,
      hp: 0,
      maxHp: 200,
      baseMaxHp: 200,
      damage: 40,
      baseDamage: 40,
      attackSpeed: 1.2,
      attackCooldown: 0.5,
      armor: 0.3,
      baseArmor: 0.3,
      magicResist: 0.2,
      rallyPoint: { x: 310, y: 310 },
      targetPos: { x: 310, y: 310 },
      tier: 3,
      state: 'DEAD',
      engagedEnemyId: null,
      respawnTimer: 10,
      respawnDelay: 8,
      combatMode: 'MELEE',
      archetype: 'SOLDIER',
      element: 'PHYSICAL',
      isSpirit: false
    };

    altarA.resurrectChance = 1.0; // Override chance for unit test deterministic check
    const resA = stateA.trySpawnHeroicSpirit(deadSoldierA);
    expect(resA).toBe(true);
    const spiritA = stateA.soldiers.find((s) => s.id === altarA.soldierIds![0])!;
    expect(spiritA.hp).toBe(200); // Exact base HP without extra multiplier
    expect(spiritA.damage).toBe(40); // Exact base DMG
    expect(spiritA.armor).toBe(0.3); // Exact base Armor
    expect(spiritA.spiritGhostRatio).toBe(0.50); // 50% Ghost damage

    // Now test Tier 4 Branch B
    const stateB = new GameState();
    stateB.gold = 5000;
    stateB.validatePlacement = () => ({ valid: true, placement: 'ROADSIDE' });
    stateB.buildTowerAt(300, 300, 'HEROIC_ALTAR');
    const altarB = stateB.towers.find((t) => t.type === 'HEROIC_ALTAR')!;

    stateB.upgradeTower(altarB.id); // Tier 2
    stateB.upgradeTower(altarB.id); // Tier 3
    stateB.upgradeTower(altarB.id, 'B'); // Tier 4 Branch B
    expect(altarB.tier).toBe(4);
    expect(altarB.branch).toBe('B');
    expect(altarB.maxSoldiers).toBe(5);
    expect(altarB.resurrectChance).toBe(0.70);
    expect(altarB.spiritGhostRatio).toBe(1.00);

    const deadDragon: SoldierEntity = {
      id: 'dragon_dead',
      towerId: 'dragon_nest_1',
      name: 'Hỏa Long',
      x: 320,
      y: 320,
      hp: 0,
      maxHp: 850,
      baseMaxHp: 850,
      damage: 150,
      baseDamage: 150,
      attackSpeed: 0.9,
      attackCooldown: 0.5,
      armor: 0.65,
      baseArmor: 0.65,
      magicResist: 0.35,
      rallyPoint: { x: 320, y: 320 },
      targetPos: { x: 320, y: 320 },
      tier: 4,
      state: 'DEAD',
      engagedEnemyId: null,
      respawnTimer: 12,
      respawnDelay: 12,
      combatMode: 'MELEE',
      archetype: 'DRAGON',
      element: 'DRAGON',
      secondaryElement: 'FIRE',
      canBlockAir: true,
      canTargetAir: true,
      canTargetSwim: true,
      aoeRadius: 85,
      isSpirit: false
    };

    altarB.resurrectChance = 1.0;
    const resB = stateB.trySpawnHeroicSpirit(deadDragon);
    expect(resB).toBe(true);
    const spiritB = stateB.soldiers.find((s) => s.id === altarB.soldierIds![0])!;
    expect(spiritB.hp).toBe(850);
    expect(spiritB.damage).toBe(150);
    expect(spiritB.armor).toBe(0.65);
    expect(spiritB.element).toBe('DRAGON');
    expect(spiritB.secondaryElement).toBe('FIRE');
    expect(spiritB.canBlockAir).toBe(true);
    expect(spiritB.spiritGhostRatio).toBe(1.00); // 100% Ghost damage!
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

  it('verifies configurable soldierRegen in towers.config for summon healing branches and displays in Codex', async () => {
    // 1. Configurable in towers.config.ts
    const bpBarracks4A = TOWER_BLUEPRINTS['BARRACKS_4_A'];
    const bpDragon4A = TOWER_BLUEPRINTS['DRAGON_NEST_4_A'];
    const bpFairy4A = TOWER_BLUEPRINTS['FAIRY_TREE_4_A'];

    expect(bpBarracks4A.soldierRegen).toBeDefined();
    expect(bpBarracks4A.soldierRegen).toBe(15);

    expect(bpDragon4A.soldierRegen).toBeDefined();
    expect(bpDragon4A.soldierRegen).toBe(15);

    expect(bpFairy4A.soldierRegen).toBeDefined();
    expect(bpFairy4A.soldierRegen).toBe(15);

    // 2. CombatSystem uses soldierRegen dynamically
    const injuredSoldier: SoldierEntity = {
      id: 'inj_soldier',
      towerId: 'tow_1',
      name: 'Lính Hộ Vệ',
      archetype: 'SOLDIER',
      x: 100,
      y: 100,
      hp: 100,
      maxHp: 480,
      baseMaxHp: 480,
      damage: 42,
      baseDamage: 42,
      attackSpeed: 1.3,
      attackCooldown: 0.5,
      element: 'PHYSICAL',
      combatMode: 'MELEE',
      state: 'IDLE',
      engagedEnemyId: null,
      rallyPoint: { x: 100, y: 100 },
      targetPos: { x: 100, y: 100 },
      armor: 0.65,
      baseArmor: 0.65,
      magicResist: 0.1,
      respawnTimer: 0,
      respawnDelay: 6,
      tier: 4,
      branch: 'A',
      soldierRegen: 20 // test custom configured regen rate
    };

    CombatSystem.updateCombat([injuredSoldier], [], 1.0, () => {});
    // HP was 100, regenerated +20 in 1 second -> 120
    expect(injuredSoldier.hp).toBeCloseTo(120, 1);

    // 3. CodexSoldiers and CodexBuildings display the exact regen rate
    const { CodexSoldiers } = await import('../ui/codex/CodexSoldiers.js');
    const { CodexBuildings } = await import('../ui/codex/CodexBuildings.js');

    const codexSoldiers = new CodexSoldiers();
    codexSoldiers.selectedTierKey = 'BARRACKS_4_A';
    const soldiersHtml = codexSoldiers.getSoldiersCategoryHtml();
    expect(soldiersHtml).toContain(`+${bpBarracks4A.soldierRegen} HP/s`);
    expect(soldiersHtml).toContain('Hồi máu mỗi giây');

    codexSoldiers.currentSubTab = 'DRAGON_NEST';
    codexSoldiers.selectedTierKey = 'DRAGON_NEST_4_A';
    const dragonHtml = codexSoldiers.getSoldiersCategoryHtml();
    expect(dragonHtml).toContain(`+${bpDragon4A.soldierRegen} HP/s`);

    codexSoldiers.currentSubTab = 'FAIRY_TREE';
    codexSoldiers.selectedTierKey = 'FAIRY_TREE_4_A';
    const fairyHtml = codexSoldiers.getSoldiersCategoryHtml();
    expect(fairyHtml).toContain(`+${bpFairy4A.soldierRegen} HP/s`);

    const codexBuildings = new CodexBuildings(() => {});
    const buildingHtml = codexBuildings.getTowerCategoryHtml('BARRACKS', 'BARRACKS_4_A');
    expect(buildingHtml).toContain(`+${bpBarracks4A.soldierRegen} HP/s`);

    // 4. Heroic Spirit inherits soldierRegen from fallen unit
    const state = new GameState();
    state.validatePlacement = () => ({ valid: true, placement: 'ROADSIDE' });
    state.buildTowerAt(100, 100, 'HEROIC_ALTAR');
    const altar = state.towers[0];
    altar.resurrectChance = 1.0;

    const fallenUnit: SoldierEntity = {
      ...injuredSoldier,
      state: 'DEAD',
      hp: 0,
      isSpirit: false
    };

    const spawned = state.trySpawnHeroicSpirit(fallenUnit);
    expect(spawned).toBe(true);
    const spirit = state.soldiers.find((s) => s.isSpirit)!;
    expect(spirit.soldierRegen).toBe(20);
    expect(spirit.branch).toBe('A');
  });

  it('verifies summoned unit detail view, damage breakdown, and multi-source elemental matchups', () => {
    const state = new GameState();
    state.gold = 5000;
    state.validatePlacement = () => ({ valid: true, placement: 'ROADSIDE' });

    // 1. Build Dragon Nest and imbue Ice as secondary
    state.buildTowerAt(100, 100, 'DRAGON_NEST');
    const dragonTower = state.towers.find((t) => t.type === 'DRAGON_NEST')!;
    state.setTowerElement(dragonTower.id, 'ICE');

    const dragon = state.soldiers.find((s) => s.towerId === dragonTower.id)!;
    expect(dragon).toBeDefined();
    expect(dragon.element).toBe('DRAGON');
    expect(dragon.secondaryElement).toBe('ICE');

    // 2. Mock Mage 4_B buffing Dragon Nest with Fire and Lightning
    dragonTower.buffSourceId = 'mage-4b-mock';
    dragonTower.buffedElements = ['FIRE', 'LIGHTNING'];
    dragon.buffedElements = ['FIRE', 'LIGHTNING'];

    const mockSidePanel = { open: () => {}, toggle: () => {} };
    const mockEl = {
      addEventListener: () => {},
      querySelectorAll: () => [],
      classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
      innerHTML: '',
      scrollTop: 0
    } as any;
    const origDoc = (globalThis as any).document;
    (globalThis as any).document = {
      getElementById: () => mockEl,
      querySelectorAll: () => []
    };

    try {
      const inspector = new InspectorPanel(state, mockSidePanel as any, () => {});

      // Verify getSoldierDamageSources decomposes all 4 components
      const sources = inspector.getSoldierDamageSources(dragon, dragonTower);
      expect(sources.length).toBe(4);
      expect(sources[0].label).toContain('Bản Thể');
      expect(sources[0].element).toBe('DRAGON');
      expect(sources[0].damage).toBe(dragon.damage);

      expect(sources[1].label).toContain('Khảm Thuộc Tính');
      expect(sources[1].element).toBe('ICE');
      expect(sources[1].damage).toBe(Math.round(dragon.damage * 0.6));

      expect(sources[2].label).toContain('Hào Quang Phù Thủy (Khe 1)');
      expect(sources[2].element).toBe('FIRE');
      expect(sources[2].damage).toBe(Math.round(dragon.damage * 0.45));

      expect(sources[3].label).toContain('Hào Quang Phù Thủy (Khe 2)');
      expect(sources[3].element).toBe('LIGHTNING');
      expect(sources[3].damage).toBe(Math.round(dragon.damage * 0.45));

      // Test selecting soldier
      inspector.selectSoldier(dragon.id);
      expect((inspector as any).selectedSoldierId).toBe(dragon.id);

      // Test clearing soldier
      const cleared = inspector.clearSelectedSoldier();
      expect(cleared).toBe(true);
      expect((inspector as any).selectedSoldierId).toBeNull();

      // Second clear should return false since already null
      expect(inspector.clearSelectedSoldier()).toBe(false);
    } finally {
      (globalThis as any).document = origDoc;
    }
  });

  it('verifies SummonedUnitDetailModal renders multi-source damage, offensive table, and defensive intake table', () => {
    const state = new GameState();
    state.gold = 5000;
    state.validatePlacement = () => ({ valid: true, placement: 'ROADSIDE' });

    // Build Barracks and set up soldier
    state.buildTowerAt(100, 100, 'BARRACKS');
    const barracks = state.towers.find((t) => t.type === 'BARRACKS')!;
    const soldier = state.soldiers.find((s) => s.towerId === barracks.id)!;
    expect(soldier).toBeDefined();

    soldier.armor = 0.35; // 35% physical armor
    soldier.magicResist = 0.20; // 20% magic resist
    soldier.secondaryElement = 'ICE';

    const mockBackdrop = {
      classList: {
        classes: new Set(['hidden']),
        add(c: string) { this.classes.add(c); },
        remove(c: string) { this.classes.delete(c); },
        contains(c: string) { return this.classes.has(c); },
        toggle(c: string) { if (this.contains(c)) this.remove(c); else this.add(c); }
      },
      addEventListener: () => {}
    };

    const mockContent = {
      innerHTML: '',
      querySelectorAll: () => []
    };

    const mockDoc = {
      getElementById: (id: string) => {
        if (id === 'unit-detail-modal-backdrop') return mockBackdrop;
        if (id === 'unit-modal-body') return mockContent;
        if (id === 'unit-modal-title' || id === 'unit-modal-icon' || id === 'unit-modal-badge') {
          return { textContent: '', innerHTML: '' };
        }
        return {
          addEventListener: () => {},
          classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} }
        };
      },
      querySelectorAll: () => []
    };

    const origDoc = (globalThis as any).document;
    (globalThis as any).document = mockDoc;

    try {
      const modal = new SummonedUnitDetailModal(state);
      expect(modal.isOpen()).toBe(false);

      modal.open(soldier.id, barracks.id);
      expect(modal.isOpen()).toBe(true);
      expect(modal.currentSoldierId).toBe(soldier.id);

      // Verify HTML contains the 3 tables requested:
      // 1. Multi-source damage breakdown
      expect(mockContent.innerHTML).toContain('BẢNG PHÂN RÃ SÁT THƯƠNG GÂY RA ĐA NGUỒN');
      // 2. 15-element offensive table
      expect(mockContent.innerHTML).toContain('SÁT THƯƠNG GÂY RA (15 HỆ MỤC TIÊU)');
      // 3. 15-element defensive intake table
      expect(mockContent.innerHTML).toContain('BẢNG TÍNH SÁT THƯƠNG NHẬN VÀO (15 HỆ)');
      expect(mockContent.innerHTML).toContain('Hệ Quái Tấn Công');
      expect(mockContent.innerHTML).toContain('Tương Khắc');
      expect(mockContent.innerHTML).toContain('Giảm Trừ');
      expect(mockContent.innerHTML).toContain('Thực Nhận');
      expect(mockContent.innerHTML).toContain('Đánh Giá & Chú Ý');

      // Test close
      modal.close();
      expect(modal.isOpen()).toBe(false);
      expect(modal.currentSoldierId).toBeNull();
    } finally {
      (globalThis as any).document = origDoc;
    }
  });

  it('verifies SoundSystem syncToWasm and persistent storage synchronization', () => {
    // Save disabled sound to storage
    StorageService.saveSettings({ soundEnabled: false, soundVolume: 0.3 });
    const loaded = StorageService.loadSettings();
    expect(loaded.soundEnabled).toBe(false);
    expect(loaded.soundVolume).toBe(0.3);

    // Apply to GameState and SoundSystem
    const state = new GameState();
    state.loadSettingsFromStorage();
    expect(state.soundEnabled).toBe(false);
    expect(state.soundVolume).toBe(0.3);
    expect(SoundSystem.soundEnabled).toBe(false);
    expect(SoundSystem.soundVolume).toBe(0.3);

    // Verify bridge sync
    SoundSystem.syncToWasm();
    const bridge = WasmBridge.ensureSingletonReady();
    if (bridge.isAvailable()) {
      const ops = bridge.getOps();
      expect(typeof ops.audio_set_enabled).toBe('function');
      expect(typeof ops.audio_set_volume).toBe('function');
    }
  });

  it('verifies Heroic Altar summoned spirit units render stats and cards on InspectorPanel', () => {
    const state = new GameState();
    state.validatePlacement = () => ({ valid: true, placement: 'ROADSIDE' });
    const built = state.buildTowerAt(300, 200, 'HEROIC_ALTAR');
    expect(built).toBe(true);
    const altar = state.towers.find((t) => t.type === 'HEROIC_ALTAR')!;
    expect(altar).toBeDefined();
    expect(altar.type).toBe('HEROIC_ALTAR');
    expect(altar.range).toBe(220);

    const mockContent: any = { innerHTML: '', querySelector: () => null, querySelectorAll: () => [], addEventListener: () => {} };
    const mockInspectorEl: any = {
      innerHTML: '',
      querySelector: () => mockContent,
      querySelectorAll: () => [],
      addEventListener: () => {}
    };

    const origDoc = (globalThis as any).document;
    (globalThis as any).document = {
      getElementById: (id: string) => {
        if (id === 'right-panel') return mockInspectorEl;
        if (id === 'inspector-content') return mockContent;
        return {
          innerHTML: '',
          textContent: '',
          classList: { add: () => {}, remove: () => {}, toggle: () => {} },
          addEventListener: () => {},
          setAttribute: () => {},
          getAttribute: () => null,
          querySelector: () => null,
          querySelectorAll: () => []
        };
      },
      querySelectorAll: () => []
    };

    try {
      const mockSidePanel: any = { open: () => {}, close: () => {} };
      const inspector = new InspectorPanel(
        state,
        mockSidePanel,
        () => {},
        () => {}
      );

      state.selectedTowerId = altar.id;
      inspector.render();

      // Before spirits spawn: shows altar stats with Tầm chiêu hồn and Tỉ lệ chiêu hồn
      expect(mockContent.innerHTML).toContain('Tầm chiêu hồn');
      expect(mockContent.innerHTML).toContain('Tỉ lệ chiêu hồn');
      expect(mockContent.innerHTML).toContain('Chưa có Anh Linh nào xuất hiện');

      // Simulate a fallen ally resurrected into spirit
      const spiritId = 'spirit-test-1';
      const spiritUnit: SoldierEntity = {
        id: spiritId,
        towerId: altar.id,
        name: 'Anh Linh Chiến Binh 1',
        archetype: 'SOLDIER',
        isSpirit: true,
        spiritSourceArchetype: 'SOLDIER',
        spiritGhostRatio: 0.5,
        x: 310,
        y: 210,
        hp: 120,
        maxHp: 120,
        baseMaxHp: 120,
        damage: 25,
        baseDamage: 25,
        attackSpeed: 1.0,
        attackCooldown: 0.5,
        element: 'PHYSICAL',
        combatMode: 'MELEE',
        state: 'IDLE',
        engagedEnemyId: null,
        rallyPoint: { x: 310, y: 210 },
        targetPos: { x: 310, y: 210 },
        armor: 0.2,
        baseArmor: 0.2,
        magicResist: 0.25,
        respawnTimer: 0,
        respawnDelay: 999999,
        tier: 1
      };
      state.soldiers.push(spiritUnit);
      altar.soldierIds = [spiritId];

      (inspector as any).lastRenderKey = '';
      inspector.render();

      // After spirit spawn: summoned units card is rendered with stats!
      expect(mockContent.innerHTML).toContain('ĐƠN VỊ ĐANG TRIỆU HỒI');
      expect(mockContent.innerHTML).toContain('Anh Linh Chiến Binh 1');
      expect(mockContent.innerHTML).toContain('120/120');
      expect(mockContent.innerHTML).toContain('25 DMG');
      expect(mockContent.innerHTML).toContain('20%'); // armor

      // Also verify direct HTML helper
      const summonedHtml = inspector.renderSummonedUnitsSectionHtml(altar);
      expect(summonedHtml).toContain('Anh Linh Chiến Binh 1');
      expect(summonedHtml).toContain('1/2 Sẵn sàng');
    } finally {
      (globalThis as any).document = origDoc;
    }
  });
});
