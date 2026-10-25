import { describe, it, expect } from 'vitest';
import { NavigationSystem } from '../systems/NavigationSystem.js';
import { TargetingRuleEngine } from '../systems/TargetingRuleEngine.js';
import { GameState } from '../core/GameState.js';
import { ENEMY_BLUEPRINTS } from '../config/enemies.config.js';
import { TOWER_BLUEPRINTS } from '../config/towers.config.js';
import { EnemyEntity, SoldierEntity } from '../types/entities.types.js';
import { DamagePayload } from '../types/elements.types.js';
import { SoundSystem } from '../systems/SoundSystem.js';
import { EnemySkillSystem } from '../systems/EnemySkillSystem.js';
import { WaveSystem } from '../systems/WaveSystem.js';

describe('Stick Vanguard - Core Architecture Tests', () => {
  describe('NavigationSystem (Multi-Domain Movement)', () => {
    const nav = new NavigationSystem();

    it('should build valid ground, water, and air paths', () => {
      const ground = nav.getPathInfo('GROUND_PATH');
      const water = nav.getPathInfo('WATER_PATH');
      const air = nav.getPathInfo('AIR_DIRECT');

      expect(ground.totalLength).toBeGreaterThan(500);
      expect(water.totalLength).toBeGreaterThan(400);
      expect(air.totalLength).toBeGreaterThan(300);
    });

    it('should interpolate coordinates along the path correctly', () => {
      const ground = nav.getPathInfo('GROUND_PATH');
      const pStart = nav.getPointAlongPath('GROUND_PATH', 0);
      const pMid = nav.getPointAlongPath('GROUND_PATH', ground.totalLength / 2);
      const pEnd = nav.getPointAlongPath('GROUND_PATH', ground.totalLength + 50);

      expect(pStart.isFinished).toBe(false);
      expect(pMid.isFinished).toBe(false);
      expect(pEnd.isFinished).toBe(true);
    });
  });

  describe('TargetingRuleEngine (Rule & Filter Checks)', () => {
    // Mock flying enemy
    const flyEnemy: EnemyEntity = {
      id: 'e-fly',
      typeId: 'WINGED_GARGOYLE',
      name: 'Gargoyle',
      x: 100,
      y: 100,
      hp: 100,
      maxHp: 100,
      speed: 50,
      baseSpeed: 50,
      damage: 10,
      attackSpeed: 1,
      attackCooldown: 1,
      rewardGold: 10,
      movementType: 'FLY',
      navigationMode: 'AIR_DIRECT',
      pathDistance: 50,
      pathTotalLength: 500,
      elementalProfile: { primaryElement: 'WIND', immunities: [] },
      state: 'FLYING',
      engagedBySoldierId: null,
      statusEffects: [],
      tags: ['FLYING'],
      altitude: 25,
      size: 15,
      facing: 0
    };

    // Mock ground enemy
    const walkEnemy: EnemyEntity = {
      ...flyEnemy,
      id: 'e-walk',
      movementType: 'WALK',
      altitude: 0,
      state: 'WALKING'
    };

    it('Artillery and Spike Trap MUST NOT target Flying enemies', () => {
      const artilleryBp = TOWER_BLUEPRINTS['ARTILLERY_1'];
      const spikeTrapBp = TOWER_BLUEPRINTS['TRAP_SPIKE'];

      expect(TargetingRuleEngine.canTarget(artilleryBp.targetingFilter, flyEnemy)).toBe(false);
      expect(TargetingRuleEngine.canTarget(spikeTrapBp.targetingFilter, flyEnemy)).toBe(false);

      // But they can target ground walking enemies
      expect(TargetingRuleEngine.canTarget(artilleryBp.targetingFilter, walkEnemy)).toBe(true);
      expect(TargetingRuleEngine.canTarget(spikeTrapBp.targetingFilter, walkEnemy)).toBe(true);
    });

    it('Archer and Mage CAN target all movement types (WALK, FLY, SWIM)', () => {
      const archerBp = TOWER_BLUEPRINTS['ARCHER_1'];
      const mageBp = TOWER_BLUEPRINTS['MAGE_1'];

      expect(TargetingRuleEngine.canTarget(archerBp.targetingFilter, flyEnemy)).toBe(true);
      expect(TargetingRuleEngine.canTarget(archerBp.targetingFilter, walkEnemy)).toBe(true);
      expect(TargetingRuleEngine.canTarget(mageBp.targetingFilter, flyEnemy)).toBe(true);
    });
  });

  describe('Elemental Matrix & Immunity Rules', () => {
    it('Fire Imp must be 100% IMMUNE to Fire damage (0 damage)', () => {
      const fireImpBp = ENEMY_BLUEPRINTS['FIRE_IMP'];
      const fireImp: EnemyEntity = {
        id: 'e-fire',
        typeId: fireImpBp.typeId,
        name: fireImpBp.name,
        x: 0,
        y: 0,
        hp: fireImpBp.hp,
        maxHp: fireImpBp.hp,
        speed: 50,
        baseSpeed: 50,
        damage: 10,
        attackSpeed: 1,
        attackCooldown: 1,
        rewardGold: 10,
        movementType: 'WALK',
        navigationMode: 'GROUND_PATH',
        pathDistance: 0,
        pathTotalLength: 500,
        elementalProfile: fireImpBp.elementalProfile,
        state: 'WALKING',
        engagedBySoldierId: null,
        statusEffects: [],
        tags: [],
        altitude: 0,
        size: 15,
        facing: 0
      };

      const result = TargetingRuleEngine.calculateDamage(
        { amount: 50, element: 'FIRE', sourceId: 'test-src' },
        fireImp
      );

      expect(result.isImmune).toBe(true);
      expect(result.finalDamage).toBe(0);
      expect(result.label).toBe('MIỄN NHIỄM!');
    });

    it('Fire Imp must take x2.0 weakness damage from Water element', () => {
      const fireImpBp = ENEMY_BLUEPRINTS['FIRE_IMP'];
      const fireImp: EnemyEntity = {
        id: 'e-fire',
        typeId: fireImpBp.typeId,
        name: fireImpBp.name,
        x: 0,
        y: 0,
        hp: fireImpBp.hp,
        maxHp: fireImpBp.hp,
        speed: 50,
        baseSpeed: 50,
        damage: 10,
        attackSpeed: 1,
        attackCooldown: 1,
        rewardGold: 10,
        movementType: 'WALK',
        navigationMode: 'GROUND_PATH',
        pathDistance: 0,
        pathTotalLength: 500,
        elementalProfile: fireImpBp.elementalProfile,
        state: 'WALKING',
        engagedBySoldierId: null,
        statusEffects: [],
        tags: [],
        altitude: 0,
        size: 15,
        facing: 0
      };

      const result = TargetingRuleEngine.calculateDamage(
        { amount: 40, element: 'WATER', sourceId: 'test-src' },
        fireImp
      );

      expect(result.isImmune).toBe(false);
      expect(result.multiplier).toBe(2.0);
      expect(result.finalDamage).toBe(80);
      expect(result.label).toBe('KHẮC HỆ!');
    });

    it('Rock Golem must be immune to Physical & Lightning, but damaged by Water', () => {
      const golemBp = ENEMY_BLUEPRINTS['ROCK_GOLEM'];
      const golem: EnemyEntity = {
        id: 'e-golem',
        typeId: golemBp.typeId,
        name: golemBp.name,
        x: 0,
        y: 0,
        hp: golemBp.hp,
        maxHp: golemBp.hp,
        speed: 25,
        baseSpeed: 25,
        damage: 25,
        attackSpeed: 1,
        attackCooldown: 1,
        rewardGold: 25,
        movementType: 'WALK',
        navigationMode: 'GROUND_PATH',
        pathDistance: 0,
        pathTotalLength: 500,
        elementalProfile: golemBp.elementalProfile,
        state: 'WALKING',
        engagedBySoldierId: null,
        statusEffects: [],
        tags: [],
        altitude: 0,
        size: 20,
        facing: 0
      };

      const physDmg = TargetingRuleEngine.calculateDamage({ amount: 50, element: 'PHYSICAL', sourceId: 'test' }, golem);
      const lightningDmg = TargetingRuleEngine.calculateDamage({ amount: 50, element: 'LIGHTNING', sourceId: 'test' }, golem);
      const waterDmg = TargetingRuleEngine.calculateDamage({ amount: 50, element: 'WATER', sourceId: 'test' }, golem);

      expect(physDmg.isImmune).toBe(true);
      expect(physDmg.finalDamage).toBe(0);

      expect(lightningDmg.isImmune).toBe(true);
      expect(lightningDmg.finalDamage).toBe(0);

      expect(waterDmg.isImmune).toBe(false);
      expect(waterDmg.finalDamage).toBeGreaterThan(50); // weakness!
    });

    it('Fairy element must deal 2.0x weakness damage to Dragon enemies and Dragon deals 0 damage against Fairy', () => {
      const drakeBp = ENEMY_BLUEPRINTS['DRAKE_WARRIOR'];
      expect(drakeBp).toBeDefined();
      const drake: EnemyEntity = {
        id: 'e-drake',
        typeId: drakeBp.typeId,
        name: drakeBp.name,
        x: 0,
        y: 0,
        hp: drakeBp.hp,
        maxHp: drakeBp.hp,
        speed: 50,
        baseSpeed: 50,
        damage: 10,
        attackSpeed: 1,
        attackCooldown: 1,
        rewardGold: 10,
        movementType: 'WALK',
        navigationMode: 'GROUND_PATH',
        pathDistance: 0,
        pathTotalLength: 500,
        elementalProfile: drakeBp.elementalProfile,
        state: 'WALKING',
        engagedBySoldierId: null,
        statusEffects: [],
        tags: [],
        altitude: 0,
        size: 20,
        facing: 0
      };

      // Wyvern Raider (Dragon + Wind) takes 2.0x weakness damage from Fairy element (2.0 x 1.0 = 2.0x)
      const wyvernBp = ENEMY_BLUEPRINTS['WYVERN_RAIDER'];
      expect(wyvernBp).toBeDefined();
      const wyvern: EnemyEntity = {
        ...drake,
        id: 'e-wyvern',
        typeId: wyvernBp.typeId,
        name: wyvernBp.name,
        elementalProfile: wyvernBp.elementalProfile
      };
      const fairyResWyvern = TargetingRuleEngine.calculateDamage(
        { amount: 50, element: 'FAIRY', sourceId: 'test' },
        wyvern
      );
      expect(fairyResWyvern.isImmune).toBe(false);
      expect(fairyResWyvern.multiplier).toBe(2.0);
      expect(fairyResWyvern.finalDamage).toBe(100);

      // Drake Warrior (Dragon + Fire) takes 1.0x from Fairy because Fire resists Fairy (2.0 x 0.5 = 1.0x)
      const fairyResDrake = TargetingRuleEngine.calculateDamage(
        { amount: 50, element: 'FAIRY', sourceId: 'test' },
        drake
      );
      expect(fairyResDrake.isImmune).toBe(false);
      expect(fairyResDrake.multiplier).toBe(1.0);
      expect(fairyResDrake.finalDamage).toBe(50);

      // Fairy target receiving Dragon attack -> 0 damage (Immune)
      const fairyBp = ENEMY_BLUEPRINTS['FAIRY_SPRITE'];
      expect(fairyBp).toBeDefined();
      const fairy: EnemyEntity = {
        ...drake,
        id: 'e-fairy',
        typeId: fairyBp.typeId,
        name: fairyBp.name,
        elementalProfile: fairyBp.elementalProfile
      };
      const dragonRes = TargetingRuleEngine.calculateDamage(
        { amount: 50, element: 'DRAGON', sourceId: 'test' },
        fairy
      );
      expect(dragonRes.isImmune).toBe(true);
      expect(dragonRes.finalDamage).toBe(0);
    });

    it('Elemental reaction combo: Poison status + Fire element triggers COMBUSTION reaction with multiplier', () => {
      const runnerBp = ENEMY_BLUEPRINTS['STICK_RUNNER'];
      const enemy: EnemyEntity = {
        id: 'e-runner',
        typeId: runnerBp.typeId,
        name: runnerBp.name,
        x: 0,
        y: 0,
        hp: 200,
        maxHp: 200,
        speed: 60,
        baseSpeed: 60,
        damage: 10,
        attackSpeed: 1,
        attackCooldown: 1,
        rewardGold: 10,
        movementType: 'WALK',
        navigationMode: 'GROUND_PATH',
        pathDistance: 0,
        pathTotalLength: 500,
        elementalProfile: { primaryElement: 'WIND', immunities: [] },
        state: 'WALKING',
        engagedBySoldierId: null,
        statusEffects: [
          { type: 'POISON', duration: 4.0, value: 5 }
        ],
        tags: [],
        altitude: 0,
        size: 15,
        facing: 0
      };

      const result = TargetingRuleEngine.calculateDamage(
        { amount: 100, element: 'FIRE', sourceId: 'test-mage' },
        enemy
      );
      expect(result.reactionTriggered).toBe(true);
      expect(result.reactionLabel).toBe('💥 BÙNG CHÁY!');
      expect(result.finalDamage).toBeGreaterThanOrEqual(170); // 1.7x combustion
    });

    it('Dragon synergy: DRAGON_AWE status boosts other elements power', () => {
      const runnerBp = ENEMY_BLUEPRINTS['STICK_RUNNER'];
      const enemy: EnemyEntity = {
        id: 'e-runner-dragon',
        typeId: runnerBp.typeId,
        name: runnerBp.name,
        x: 0,
        y: 0,
        hp: 300,
        maxHp: 300,
        speed: 60,
        baseSpeed: 60,
        damage: 10,
        attackSpeed: 1,
        attackCooldown: 1,
        rewardGold: 10,
        movementType: 'WALK',
        navigationMode: 'GROUND_PATH',
        pathDistance: 0,
        pathTotalLength: 500,
        elementalProfile: { primaryElement: 'WIND', immunities: [] },
        state: 'WALKING',
        engagedBySoldierId: null,
        statusEffects: [
          { type: 'DRAGON_AWE', duration: 3.5, value: 0.25 }
        ],
        tags: [],
        altitude: 0,
        size: 15,
        facing: 0
      };

      // Lightning against enemy with DRAGON_AWE triggers DRAGON_OVERLOAD (1.75x)
      const resLightning = TargetingRuleEngine.calculateDamage(
        { amount: 100, element: 'LIGHTNING', sourceId: 'test' },
        enemy
      );
      expect(resLightning.reactionTriggered).toBe(true);
      expect(resLightning.reactionLabel).toBe('🐉 LONG LÔI!');
      expect(resLightning.finalDamage).toBeGreaterThanOrEqual(175);

      // Fire against enemy with DRAGON_AWE triggers DRAGON_FLAME (1.7x)
      const resFire = TargetingRuleEngine.calculateDamage(
        { amount: 100, element: 'FIRE', sourceId: 'test' },
        enemy
      );
      expect(resFire.reactionTriggered).toBe(true);
      expect(resFire.reactionLabel).toBe('🐉 HỎA LONG!');
      expect(resFire.finalDamage).toBeGreaterThanOrEqual(170);
    });

    it('Fairy blessing: CHARM boosts elemental skills EXCEPT Dark, Ghost, Poison, and Physical', () => {
      const runnerBp = ENEMY_BLUEPRINTS['STICK_RUNNER'];
      const enemy: EnemyEntity = {
        id: 'e-runner-charm',
        typeId: runnerBp.typeId,
        name: runnerBp.name,
        x: 0,
        y: 0,
        hp: 300,
        maxHp: 300,
        speed: 60,
        baseSpeed: 60,
        damage: 10,
        attackSpeed: 1,
        attackCooldown: 1,
        rewardGold: 10,
        movementType: 'WALK',
        navigationMode: 'GROUND_PATH',
        pathDistance: 0,
        pathTotalLength: 500,
        elementalProfile: { primaryElement: 'WIND', immunities: [] },
        state: 'WALKING',
        engagedBySoldierId: null,
        statusEffects: [
          { type: 'CHARM', duration: 3.0, value: 0.35 }
        ],
        tags: [],
        altitude: 0,
        size: 15,
        facing: 0
      };

      // Fire under charm gets boosted (FAIRY_FIRE 1.6x)
      const resFire = TargetingRuleEngine.calculateDamage(
        { amount: 100, element: 'FIRE', sourceId: 'test' },
        enemy
      );
      expect(resFire.reactionTriggered).toBe(true);
      expect(resFire.reactionLabel).toBe('🧚 TIÊN HỎA!');

      // Dark under charm is NOT boosted by Fairy
      const resDark = TargetingRuleEngine.calculateDamage(
        { amount: 100, element: 'DARK', sourceId: 'test' },
        enemy
      );
      expect(resDark.reactionTriggered).toBeFalsy();

      // Ghost under charm is NOT boosted by Fairy
      const resGhost = TargetingRuleEngine.calculateDamage(
        { amount: 100, element: 'GHOST', sourceId: 'test' },
        enemy
      );
      expect(resGhost.reactionTriggered).toBeFalsy();

      // Poison under charm is NOT boosted by Fairy
      const resPoison = TargetingRuleEngine.calculateDamage(
        { amount: 100, element: 'POISON', sourceId: 'test' },
        enemy
      );
      expect(resPoison.reactionTriggered).toBeFalsy();
    });

    it('Dark synergies: Dark + Ghost triggers Abyssal Soul, and Dark + other elements boosts EXCEPT Fairy and Light', () => {
      const runnerBp = ENEMY_BLUEPRINTS['STICK_RUNNER'];
      const enemy: EnemyEntity = {
        id: 'e-runner-curse',
        typeId: runnerBp.typeId,
        name: runnerBp.name,
        x: 0,
        y: 0,
        hp: 400,
        maxHp: 400,
        speed: 60,
        baseSpeed: 60,
        damage: 10,
        attackSpeed: 1,
        attackCooldown: 1,
        rewardGold: 10,
        movementType: 'WALK',
        navigationMode: 'GROUND_PATH',
        pathDistance: 0,
        pathTotalLength: 500,
        elementalProfile: { primaryElement: 'WIND', immunities: [] },
        state: 'WALKING',
        engagedBySoldierId: null,
        statusEffects: [
          { type: 'CURSE', duration: 3.5, value: 0.35 }
        ],
        tags: [],
        altitude: 0,
        size: 15,
        facing: 0
      };

      // Ám + Ma: CURSE + GHOST triggers ABYSSAL_SOUL (1.85x)
      const resGhost = TargetingRuleEngine.calculateDamage(
        { amount: 100, element: 'GHOST', sourceId: 'test' },
        enemy
      );
      expect(resGhost.reactionTriggered).toBe(true);
      expect(resGhost.reactionLabel).toBe('🔮 MINH GIỚI ÁM HỒN!');
      expect(resGhost.finalDamage).toBeGreaterThanOrEqual(185);

      // Ám + Lửa: CURSE + FIRE triggers ABYSSAL_FIRE (1.65x)
      const resFire = TargetingRuleEngine.calculateDamage(
        { amount: 100, element: 'FIRE', sourceId: 'test' },
        enemy
      );
      expect(resFire.reactionTriggered).toBe(true);
      expect(resFire.reactionLabel).toBe('🔥 HỎA NGỤC ÁM!');

      // Ám + Độc: CURSE + POISON triggers ABYSSAL_POISON (1.7x)
      const resPoison = TargetingRuleEngine.calculateDamage(
        { amount: 100, element: 'POISON', sourceId: 'test' },
        enemy
      );
      expect(resPoison.reactionTriggered).toBe(true);
      expect(resPoison.reactionLabel).toBe('☠️ HẮC ĐỘC!');

      // Ám does NOT trigger dark synergy for FAIRY
      const resFairy = TargetingRuleEngine.calculateDamage(
        { amount: 100, element: 'FAIRY', sourceId: 'test' },
        enemy
      );
      expect(resFairy.reactionTriggered).toBeFalsy();
    });

    it('Modular Elements Architecture & Lookup Tables generation', async () => {
      const {
        ALL_15_ELEMENTS,
        ALL_ELEMENT_DEFINITIONS,
        getElementOffensiveTable,
        getElementDefensiveTable,
        getElementSynergyTable,
        searchElementalReactions
      } = await import('../config/elements/index.js');

      // 1. All 15 element modules exist and have valid structure
      expect(ALL_15_ELEMENTS).toHaveLength(15);
      for (const elem of ALL_15_ELEMENTS) {
        const def = ALL_ELEMENT_DEFINITIONS[elem];
        expect(def).toBeDefined();
        expect(def.element).toBe(elem);
        expect(def.buildingEffects.barracks).toBeDefined();
        expect(def.buildingEffects.archer).toBeDefined();
        expect(def.buildingEffects.mage).toBeDefined();
        expect(def.buildingEffects.artillery).toBeDefined();
      }

      // 2. Offensive Lookup Table: Exactly 15 rows for any element
      const fireOffensive = getElementOffensiveTable('FIRE');
      expect(fireOffensive).toHaveLength(15);
      expect(fireOffensive.some((r) => r.targetElement === 'GRASS' && r.multiplier === 2.0)).toBe(true);
      expect(fireOffensive.some((r) => r.targetElement === 'ICE' && r.multiplier === 1.75)).toBe(true);

      // 3. Defensive Lookup Table: Exactly 15 rows for any element
      const fireDefensive = getElementDefensiveTable('FIRE');
      expect(fireDefensive).toHaveLength(15);
      expect(fireDefensive.some((r) => r.attackerElement === 'WATER' && r.multiplier === 2.0)).toBe(true);

      // 4. Synergy Lookup Table: Combos exist for DRAGON, FAIRY, DARK
      const dragonSynergies = getElementSynergyTable('DRAGON');
      expect(dragonSynergies.length).toBeGreaterThan(5);

      const darkSynergies = getElementSynergyTable('DARK');
      expect(darkSynergies.some((s) => s.reaction.id === 'ABYSSAL_SOUL')).toBe(true);

      // 5. Search function works with queries and category filters
      const dragonReactions = searchElementalReactions('', 'ALL', 'DRAGON_BOOST');
      expect(dragonReactions.length).toBeGreaterThanOrEqual(10);

      const fairyReactions = searchElementalReactions('', 'ALL', 'FAIRY_BLESS');
      expect(fairyReactions.length).toBeGreaterThanOrEqual(8);

      const queryResults = searchElementalReactions('Bùng Cháy');
      expect(queryResults.length).toBeGreaterThanOrEqual(1);
      expect(queryResults[0].id).toBe('COMBUSTION');
    });
  });

  describe('GameState (Economy, Barracks & Upgrades)', () => {
    it('should build Barracks, spawn 3 soldiers, and deduct gold', () => {
      const state = new GameState();
      const initialGold = state.gold;
      const slot = state.towerSlots.find((s) => s.placement === 'ROADSIDE')!;

      const success = state.buildTower(slot.id, 'BARRACKS');
      expect(success).toBe(true);
      expect(state.gold).toBe(initialGold - 70);
      expect(state.towers.length).toBe(1);
      expect(state.soldiers.length).toBe(3);
    });

    it('should upgrade tower through tiers and allow branch A/B at Tier 4', () => {
      const state = new GameState();
      state.gold = 2000; // give plenty of gold
      const slot = state.towerSlots.find((s) => s.placement === 'ROADSIDE')!;
      state.buildTower(slot.id, 'BARRACKS');
      const tower = state.towers[0];

      // Lv 1 -> Lv 2
      expect(state.upgradeTower(tower.id)).toBe(true);
      expect(tower.tier).toBe(2);

      // Lv 2 -> Lv 3
      expect(state.upgradeTower(tower.id)).toBe(true);
      expect(tower.tier).toBe(3);

      // Lv 3 -> Lv 4 Branch B (Vanguard Elite)
      expect(state.upgradeTower(tower.id, 'B')).toBe(true);
      expect(tower.tier).toBe(4);
      expect(tower.branch).toBe('B');
      expect(tower.element).toBe('PHYSICAL'); // Elements separated from tiers!

      // Check soldier upgrade
      const soldier = state.soldiers[0];
      expect(soldier.tier).toBe(4);
      expect(soldier.branch).toBe('B');
    });

    it('should allow free imbuing of elements independently from tower level', () => {
      const state = new GameState();
      state.gold = 500;
      const slot = state.towerSlots.find((s) => s.placement === 'ROADSIDE')!;
      state.buildTower(slot.id, 'ARCHER'); // cost 60
      const tower = state.towers[0];

      // Imbue Fire element (cost 40)
      const imbueSuccess = state.setTowerElement(tower.id, 'FIRE');
      expect(imbueSuccess).toBe(true);
      expect(tower.secondaryElement).toBe('FIRE');
      expect(tower.totalInvested).toBe(60 + 40);
      expect(state.gold).toBe(500 - 60 - 40);

      // Upgrade to tier 2: fire element MUST be preserved!
      state.upgradeTower(tower.id);
      expect(tower.tier).toBe(2);
      expect(tower.secondaryElement).toBe('FIRE');
    });

    it('should support dual-elements for Mage tower', () => {
      const state = new GameState();
      state.gold = 600;
      const slot = state.towerSlots.find((s) => s.placement === 'ROADSIDE')!;
      state.buildTower(slot.id, 'MAGE'); // cost 75, default element DARK
      const tower = state.towers[0];

      // Slot 1 change to WATER (cost 40)
      expect(state.setTowerElement(tower.id, 'WATER', 1)).toBe(true);
      expect(tower.element).toBe('WATER');

      // Slot 2 imbue LIGHTNING (cost 50)
      expect(state.setTowerElement(tower.id, 'LIGHTNING', 2)).toBe(true);
      expect(tower.secondaryElement).toBe('LIGHTNING');
      expect(tower.totalInvested).toBe(75 + 40 + 50);
    });

    it('should switch Barracks soldier mode between Melee and Ranged', () => {
      const state = new GameState();
      state.gold = 500;
      const slot = state.towerSlots.find((s) => s.placement === 'ROADSIDE')!;
      state.buildTower(slot.id, 'BARRACKS');
      const tower = state.towers[0];
      const soldier = state.soldiers[0];

      expect(tower.soldierMode).toBe('MELEE');
      expect(soldier.combatMode).toBe('MELEE');
      expect(soldier.canTargetAir).toBeFalsy();
      const meleeHp = soldier.maxHp;
      const meleeDmg = soldier.damage;

      // Switch to RANGED (archer soldiers)
      expect(state.setBarracksSoldierMode(tower.id, 'RANGED')).toBe(true);
      expect(tower.soldierMode).toBe('RANGED');
      expect(soldier.combatMode).toBe('RANGED');
      expect(soldier.canTargetAir).toBe(true);
      expect(soldier.maxHp).toBe(Math.round(meleeHp * 0.65));
      expect(soldier.damage).toBe(Math.round(meleeDmg * 0.7));
      expect(tower.targetingFilter.allowedMovement).toContain('FLY');
      expect(tower.targetingFilter.allowedMovement).toContain('SWIM');

      // Switch back to MELEE
      expect(state.setBarracksSoldierMode(tower.id, 'MELEE')).toBe(true);
      expect(tower.soldierMode).toBe('MELEE');
      expect(soldier.combatMode).toBe('MELEE');
      expect(soldier.maxHp).toBe(meleeHp);
      expect(soldier.damage).toBe(meleeDmg);
      expect(soldier.canTargetAir).toBe(false);
    });

    it('should calculate hybrid damage properly when target is immune to physical or magic', () => {
      const golemBp = ENEMY_BLUEPRINTS['ROCK_GOLEM']; // Immune to Physical
      const golem: EnemyEntity = {
        id: 'e-golem',
        typeId: golemBp.typeId,
        name: golemBp.name,
        x: 0,
        y: 0,
        hp: golemBp.hp,
        maxHp: golemBp.hp,
        speed: 25,
        baseSpeed: 25,
        damage: 25,
        attackSpeed: 1,
        attackCooldown: 1,
        rewardGold: 25,
        movementType: 'WALK',
        navigationMode: 'GROUND_PATH',
        pathDistance: 0,
        pathTotalLength: 500,
        elementalProfile: golemBp.elementalProfile,
        state: 'WALKING',
        engagedBySoldierId: null,
        statusEffects: [],
        tags: [],
        altitude: 0,
        size: 20,
        facing: 0
      };

      // Hybrid payload: 50 Physical + 30 Water
      const hybridRes = TargetingRuleEngine.calculateDamage(
        {
          amount: 50,
          element: 'PHYSICAL',
          secondaryAmount: 30,
          secondaryElement: 'WATER',
          sourceId: 'archer-1'
        },
        golem
      );

      // Golem is immune to physical, but takes 1.5x from water according to matrix!
      expect(hybridRes.isImmune).toBe(false);
      expect(hybridRes.finalDamage).toBeGreaterThan(0);
      expect(hybridRes.finalDamage).toBe(Math.round(30 * 1.5));
    });

    it('should refund 70% invested gold and remove soldiers upon selling', () => {
      const state = new GameState();
      state.gold = 500;
      const slot = state.towerSlots.find((s) => s.placement === 'ROADSIDE')!;
      state.buildTower(slot.id, 'BARRACKS'); // cost 70
      const tower = state.towers[0];

      expect(state.soldiers.length).toBe(3);
      const goldBeforeSell = state.gold;

      state.sellTower(tower.id);
      expect(state.towers.length).toBe(0);
      expect(state.soldiers.length).toBe(0);
      expect(state.gold).toBe(goldBeforeSell + Math.round(70 * 0.7));
      expect(slot.currentTowerId).toBe(null);
    });

    it('should validate multi-map switching and free-form placement rules', () => {
      const state = new GameState();
      state.gold = 1000;

      // 1. Check all maps can be loaded
      expect(state.currentMapId).toBe('valley_origin');
      state.setMap('twin_crossroads');
      expect(state.currentMapId).toBe('twin_crossroads');
      state.setMap('serpent_canyon');
      expect(state.currentMapId).toBe('serpent_canyon');
      state.setMap('delta_fortress');
      expect(state.currentMapId).toBe('delta_fortress');

      // Switch back to valley_origin for placement testing
      state.setMap('valley_origin');

      // 2. Traps MUST be on the road or water
      // Point (160, 160) is directly on groundWaypoints: { x: 40, y: 160 } -> { x: 220, y: 160 }
      const trapOnRoad = state.validatePlacement(160, 160, 'TRAP_SPIKE');
      expect(trapOnRoad.valid).toBe(true);
      expect(trapOnRoad.placement).toBe('PATH_TRAP');

      // Point (380, 150) is on waterWaypoints
      const trapOnWater = state.validatePlacement(380, 150, 'TRAP_FROST');
      expect(trapOnWater.valid).toBe(true);
      expect(trapOnWater.placement).toBe('WATER_TRAP');

      // Point on empty land (150, 100) -> NOT on road or water
      const trapOnLand = state.validatePlacement(150, 100, 'TRAP_SPIKE');
      expect(trapOnLand.valid).toBe(false);
      expect(trapOnLand.reason).toContain('Bẫy phải đặt trên đường hoặc trên sông');

      // 3. Towers MUST NOT be on the road (or in the water)
      // Point (160, 160) is on the road -> INVALID for tower
      const towerOnRoad = state.validatePlacement(160, 160, 'ARCHER');
      expect(towerOnRoad.valid).toBe(false);
      expect(towerOnRoad.reason).toContain('Tháp không được đặt trên đường');

      // Point (380, 150) is in the river -> INVALID for tower
      const towerOnWater = state.validatePlacement(380, 150, 'ARCHER');
      expect(towerOnWater.valid).toBe(false);
      expect(towerOnWater.reason).toContain('Tháp không được đặt dưới dòng sông');

      // Point (150, 95) is safely on land -> VALID for tower
      const towerOnLand = state.validatePlacement(150, 95, 'ARCHER');
      expect(towerOnLand.valid).toBe(true);
      expect(towerOnLand.placement).toBe('ROADSIDE');

      // 4. Test buildTowerAt
      const builtTower = state.buildTowerAt(150, 95, 'ARCHER');
      expect(builtTower).toBe(true);
      expect(state.towers.length).toBe(1);

      // Building another tower too close (< 34px) should fail
      const tooClose = state.buildTowerAt(152, 97, 'MAGE');
      expect(tooClose).toBe(false);

      // Building trap on road
      const builtTrap = state.buildTowerAt(160, 160, 'TRAP_SPIKE');
      expect(builtTrap).toBe(true);
      expect(state.towers.length).toBe(2);
    });
  });

  describe('Custom Game Settings & New Enemy Mechanics', () => {
    it('should scale damage with damageMultiplier', () => {
      TargetingRuleEngine.globalDamageMultiplier = 2.5;

      const runnerBp = ENEMY_BLUEPRINTS['STICK_RUNNER'];
      const enemy: EnemyEntity = {
        id: 'test-runner',
        typeId: runnerBp.typeId,
        name: runnerBp.name,
        x: 0,
        y: 0,
        hp: 100,
        maxHp: 100,
        speed: 50,
        baseSpeed: 50,
        damage: 10,
        attackSpeed: 1,
        attackCooldown: 1,
        rewardGold: 10,
        movementType: 'WALK',
        navigationMode: 'GROUND_PATH',
        pathDistance: 0,
        pathTotalLength: 500,
        elementalProfile: { primaryElement: 'WIND', immunities: [] },
        state: 'WALKING',
        engagedBySoldierId: null,
        statusEffects: [],
        tags: [],
        altitude: 0,
        size: 15,
        facing: 0
      };

      const res = TargetingRuleEngine.calculateDamage(
        { amount: 20, element: 'PHYSICAL', sourceId: 'tower-1' },
        enemy
      );

      // Base 20 * multiplier 2.5 = 50
      expect(res.finalDamage).toBe(50);

      // Reset
      TargetingRuleEngine.globalDamageMultiplier = 1.0;
    });

    it('should support dual-element enemy matchup calculation and death-spawn ability', () => {
      // MAGMA_SLIME is FIRE + EARTH
      const slimeBp = ENEMY_BLUEPRINTS['MAGMA_SLIME'];
      expect(slimeBp.elementalProfile.secondaryElement).toBe('EARTH');
      const deathSpawnAbility = slimeBp.abilities?.find((a) => a.type === 'DEATH_SPAWN');
      expect(deathSpawnAbility).toBeDefined();
      expect(deathSpawnAbility?.spawnTypeId).toBe('EMBER_BLOB');
      expect(deathSpawnAbility?.count).toBe(2);
    });

    it('should support summoner enemy blueprint config as skills', () => {
      // NECRO_WARLOCK summons SKELETON_MINION and spawns on death
      const warlockBp = ENEMY_BLUEPRINTS['NECRO_WARLOCK'];
      const summonAbility = warlockBp.abilities?.find((a) => a.type === 'SUMMON');
      const deathSpawnAbility = warlockBp.abilities?.find((a) => a.type === 'DEATH_SPAWN');
      expect(summonAbility).toBeDefined();
      expect(summonAbility?.spawnTypeId).toBe('SKELETON_MINION');
      expect(deathSpawnAbility?.spawnTypeId).toBe('SKELETON_MINION');
      expect(warlockBp.elementalProfile.secondaryElement).toBe('ICE');
    });

    it('should have default 15 waves configured across GameState and WaveSystem', async () => {
      const { WaveSystem } = await import('../systems/WaveSystem.js');
      const gs = new GameState();
      expect(gs.customTotalWaves).toBe(15);

      const waveSys = new WaveSystem();
      expect(waveSys.getTotalWaves()).toBe(15);
    });

    it('should scale waves procedurally up to any configured wave count based on map description', async () => {
      const { WaveSystem } = await import('../systems/WaveSystem.js');
      const { MAP_VALLEY_ORIGIN } = await import('../config/map.config.js');
      const waveSys = new WaveSystem(MAP_VALLEY_ORIGIN);
      waveSys.setTotalWaves(25);
      expect(waveSys.getTotalWaves()).toBe(25);

      const wave1 = waveSys.generateWaveConfig(0, 25);
      expect(wave1.waveNumber).toBe(1);
      // Map's wave 1 description
      expect(wave1.enemies.some((e) => e.typeId === 'STICK_RUNNER')).toBe(true);

      // Wave 11 (wave > 10, not divisible by 5): same enemies as Wave 9, n = 1
      const wave11 = waveSys.generateWaveConfig(10, 25);
      expect(wave11.waveNumber).toBe(11);
      expect(wave11.enemies.some((e) => e.typeId === 'TREANT_GUARD')).toBe(true);

      // Wave 15 (wave > 10, divisible by 5): Wave 9 + Wave 10, n = 1
      const wave15 = waveSys.generateWaveConfig(14, 25);
      expect(wave15.waveNumber).toBe(15);
      // Boss from wave 10 is present (ANCIENT_TREANT_BOSS on MAP_VALLEY_ORIGIN)
      expect(wave15.enemies.some((e) => e.typeId === 'ANCIENT_TREANT_BOSS')).toBe(true);

      // Wave 20 (wave > 10, divisible by 5): Wave 9 + Wave 10, n = 2
      const wave20 = waveSys.generateWaveConfig(19, 25);
      expect(wave20.waveNumber).toBe(20);
      expect(wave20.enemies.some((e) => e.typeId === 'ANCIENT_TREANT_BOSS')).toBe(true);
      const bossEntry = wave20.enemies.find((e) => e.typeId === 'ANCIENT_TREANT_BOSS')!;
      expect(bossEntry.count).toBe(2); // 1 * n (n = 2)
    });
  });

  describe('Multi-Lane Maps & Map Diversity', () => {
    it('should have at least 8 diverse maps configured', async () => {
      const { MAPS_CONFIG } = await import('../config/map.config.js');
      expect(MAPS_CONFIG.length).toBeGreaterThanOrEqual(8);

      const mapIds = MAPS_CONFIG.map((m) => m.id);
      expect(mapIds).toContain('valley_origin');
      expect(mapIds).toContain('twin_crossroads');
      expect(mapIds).toContain('serpent_canyon');
      expect(mapIds).toContain('delta_fortress');
      expect(mapIds).toContain('infernal_caldera');
      expect(mapIds).toContain('frozen_citadel');
      expect(mapIds).toContain('ancient_necropolis');
      expect(mapIds).toContain('plague_morass');
    });

    it('should support multi-lane configuration in NavigationSystem', async () => {
      const { MAPS_CONFIG } = await import('../config/map.config.js');
      const necropolis = MAPS_CONFIG.find((m) => m.id === 'ancient_necropolis')!;
      expect(necropolis).toBeDefined();
      expect(necropolis.groundLanes?.length).toBe(3);

      const nav = new NavigationSystem(necropolis);
      expect(nav.getLaneCount('GROUND_PATH')).toBe(3);

      const lane0 = nav.getPathInfo('GROUND_PATH', 0);
      const lane1 = nav.getPathInfo('GROUND_PATH', 1);
      const lane2 = nav.getPathInfo('GROUND_PATH', 2);

      expect(lane0.totalLength).toBeGreaterThan(400);
      expect(lane1.totalLength).toBeGreaterThan(400);
      expect(lane2.totalLength).toBeGreaterThan(400);

      // Verify each lane has distinct starting points
      const pt0 = nav.getPointAlongPath('GROUND_PATH', 0, 0, 0);
      const pt1 = nav.getPointAlongPath('GROUND_PATH', 0, 0, 1);
      const pt2 = nav.getPointAlongPath('GROUND_PATH', 0, 0, 2);

      expect(pt0.position.y).not.toBe(pt1.position.y);
      expect(pt1.position.y).not.toBe(pt2.position.y);
    });

    it('should cycle enemy spawns across multiple lanes in WaveSystem', async () => {
      const { MAPS_CONFIG } = await import('../config/map.config.js');
      const { WaveSystem } = await import('../systems/WaveSystem.js');
      const caldera = MAPS_CONFIG.find((m) => m.id === 'infernal_caldera')!;
      expect(caldera).toBeDefined();
      expect(caldera.groundLanes?.length).toBe(2);

      const waveSys = new WaveSystem(caldera, 5);
      waveSys.startWave(1);

      const spawnedEnemies: EnemyEntity[] = [];
      // Simulate spawning 4 enemies
      for (let i = 0; i < 4; i++) {
        waveSys.update(
          2.0,
          (enemy) => spawnedEnemies.push(enemy),
          () => {},
          0
        );
      }

      expect(spawnedEnemies.length).toBeGreaterThanOrEqual(2);
      const groundEnemies = spawnedEnemies.filter((e) => e.navigationMode === 'GROUND_PATH');
      if (groundEnemies.length >= 2) {
        // First enemy on lane 0, second on lane 1
        expect(groundEnemies[0].laneIndex).toBe(0);
        expect(groundEnemies[1].laneIndex).toBe(1);
      }
    });

    it('should validate dynamic base linking: changing playerBases updates all lane endpoints without errors', async () => {
      const { MAPS_CONFIG, getResolvedGroundLanes, getResolvedWaterLanes, getResolvedAirLanes } = await import('../config/map.config.js');
      const crossroads = MAPS_CONFIG.find((m) => m.id === 'twin_crossroads')!;
      expect(crossroads).toBeDefined();

      // Original base 1 is at (500, 70), base 2 is at (500, 580)
      const groundLanesOrig = getResolvedGroundLanes(crossroads);
      expect(groundLanesOrig[0][groundLanesOrig[0].length - 1]).toEqual({ x: 500, y: 70 });
      expect(groundLanesOrig[1][groundLanesOrig[1].length - 1]).toEqual({ x: 500, y: 580 });

      // Create a shallow copy with relocated bases
      const relocatedMap = {
        ...crossroads,
        playerBases: [
          { x: 520, y: 85, radius: 42 },
          { x: 480, y: 595, radius: 42 }
        ]
      };

      const groundLanesNew = getResolvedGroundLanes(relocatedMap);
      const waterLanesNew = getResolvedWaterLanes(relocatedMap);
      const airLanesNew = getResolvedAirLanes(relocatedMap);

      // All ground, water, air lanes must dynamically lead to the new base coordinates
      expect(groundLanesNew[0][groundLanesNew[0].length - 1]).toEqual({ x: 520, y: 85 });
      expect(groundLanesNew[1][groundLanesNew[1].length - 1]).toEqual({ x: 480, y: 595 });
      expect(waterLanesNew[0][waterLanesNew[0].length - 1]).toEqual({ x: 520, y: 85 });
      expect(waterLanesNew[1][waterLanesNew[1].length - 1]).toEqual({ x: 480, y: 595 });
      expect(airLanesNew[0][airLanesNew[0].length - 1]).toEqual({ x: 520, y: 85 });
      expect(airLanesNew[1][airLanesNew[1].length - 1]).toEqual({ x: 480, y: 595 });

      // Verify all 10 maps in MAPS_CONFIG have 1-based base index at the end of every lane
      for (const map of MAPS_CONFIG) {
        const numBases = map.playerBases.length;
        const allLanes = [...map.groundLanes, ...map.waterLanes, ...map.airLanes];
        for (const lane of allLanes) {
          const lastElement = lane[lane.length - 1];
          expect(typeof lastElement).toBe('number');
          expect(lastElement).toBeGreaterThanOrEqual(1);
          expect(lastElement).toBeLessThanOrEqual(numBases);
        }
      }
    });

    it('should validate placement on multi-lane map correctly', async () => {
      const gs = new GameState();
      gs.setMap('infernal_caldera');

      expect(gs.currentMapId).toBe('infernal_caldera');
      // Lane 0 is near (40, 120), Lane 1 is near (40, 530)
      // Placing trap on lane 0 should be valid
      const trapOnLane0 = gs.validatePlacement(260, 120, 'TRAP_SPIKE');
      expect(trapOnLane0.valid).toBe(true);

      // Placing trap on lane 1 should be valid
      const trapOnLane1 = gs.validatePlacement(260, 530, 'TRAP_SPIKE');
      expect(trapOnLane1.valid).toBe(true);

      // Placing tower on lane 0 should be INVALID (towers cannot be built on roads)
      const towerOnRoad = gs.validatePlacement(260, 120, 'ARCHER');
      expect(towerOnRoad.valid).toBe(false);

      // Placing tower in clear roadside area should be VALID
      const towerOnLand = gs.validatePlacement(260, 220, 'ARCHER');
      expect(towerOnLand.valid).toBe(true);
    });
  });

  describe('Modular Map Files & Strict Wave Movement Rules', () => {
    it('should have each map in its own file and correctly imported', async () => {
      const { MAP_VALLEY_ORIGIN } = await import('../config/maps/valley_origin.map.js');
      const { MAP_TWIN_CROSSROADS } = await import('../config/maps/twin_crossroads.map.js');
      const { MAP_SERPENT_CANYON } = await import('../config/maps/serpent_canyon.map.js');
      const { MAP_DELTA_FORTRESS } = await import('../config/maps/delta_fortress.map.js');
      const { MAP_INFERNAL_CALDERA } = await import('../config/maps/infernal_caldera.map.js');
      const { MAP_FROZEN_CITADEL } = await import('../config/maps/frozen_citadel.map.js');
      const { MAP_ANCIENT_NECROPOLIS } = await import('../config/maps/ancient_necropolis.map.js');
      const { MAP_PLAGUE_MORASS } = await import('../config/maps/plague_morass.map.js');

      expect(MAP_VALLEY_ORIGIN.id).toBe('valley_origin');
      expect(MAP_TWIN_CROSSROADS.id).toBe('twin_crossroads');
      expect(MAP_SERPENT_CANYON.id).toBe('serpent_canyon');
      expect(MAP_DELTA_FORTRESS.id).toBe('delta_fortress');
      expect(MAP_INFERNAL_CALDERA.id).toBe('infernal_caldera');
      expect(MAP_FROZEN_CITADEL.id).toBe('frozen_citadel');
      expect(MAP_ANCIENT_NECROPOLIS.id).toBe('ancient_necropolis');
      expect(MAP_PLAGUE_MORASS.id).toBe('plague_morass');
    });

    it('should strictly enforce waves 1-3 WALK, wave 4 FLY, wave 5 SWIM, and wave > 5 mixed in all maps', async () => {
      const { MAPS_CONFIG } = await import('../config/map.config.js');
      const { ENEMY_BLUEPRINTS } = await import('../config/enemies.config.js');

      for (const map of MAPS_CONFIG) {
        expect(map.waves.length).toBeGreaterThanOrEqual(10);

        // Wave 1, 2, 3: ONLY WALK
        for (let w = 1; w <= 3; w++) {
          const wave = map.waves.find((item) => item.waveNumber === w)!;
          expect(wave).toBeDefined();
          for (const enemyEntry of wave.enemies) {
            const bp = ENEMY_BLUEPRINTS[enemyEntry.typeId];
            expect(bp).toBeDefined();
            expect(bp.movementType).toBe('WALK');
          }
        }

        // Wave 4: ONLY FLY
        const wave4 = map.waves.find((item) => item.waveNumber === 4)!;
        expect(wave4).toBeDefined();
        expect(wave4.enemies.length).toBeGreaterThan(0);
        for (const enemyEntry of wave4.enemies) {
          const bp = ENEMY_BLUEPRINTS[enemyEntry.typeId];
          expect(bp.movementType).toBe('FLY');
        }

        // Wave 5: ONLY SWIM
        const wave5 = map.waves.find((item) => item.waveNumber === 5)!;
        expect(wave5).toBeDefined();
        expect(wave5.enemies.length).toBeGreaterThan(0);
        for (const enemyEntry of wave5.enemies) {
          const bp = ENEMY_BLUEPRINTS[enemyEntry.typeId];
          expect(bp.movementType).toBe('SWIM');
        }

        // Wave > 5: More than 1 movementType in waves
        const postWave5 = map.waves.filter((item) => item.waveNumber > 5);
        expect(postWave5.length).toBeGreaterThan(0);

        // Verify that waves after 5 have waves featuring multiple movement types
        const hasMixedWave = postWave5.some((wave) => {
          const types = new Set(wave.enemies.map((e) => ENEMY_BLUEPRINTS[e.typeId].movementType));
          return types.size > 1;
        });
        expect(hasMixedWave).toBe(true);
      }
    });

    it('should strictly enforce wave movement rules in WaveSystem.generateWaveConfig', async () => {
      const { WaveSystem } = await import('../systems/WaveSystem.js');
      const { ENEMY_BLUEPRINTS } = await import('../config/enemies.config.js');
      const waveSys = new WaveSystem(undefined, 20);

      // Waves 1-3: WALK ONLY
      for (let w = 0; w < 3; w++) {
        const wave = waveSys.generateWaveConfig(w, 20);
        expect(wave.waveNumber).toBe(w + 1);
        for (const enemy of wave.enemies) {
          const bp = ENEMY_BLUEPRINTS[enemy.typeId];
          expect(bp.movementType).toBe('WALK');
        }
      }

      // Wave 4: FLY ONLY
      const wave4 = waveSys.generateWaveConfig(3, 20);
      expect(wave4.waveNumber).toBe(4);
      for (const enemy of wave4.enemies) {
        const bp = ENEMY_BLUEPRINTS[enemy.typeId];
        expect(bp.movementType).toBe('FLY');
      }

      // Wave 5: SWIM ONLY
      const wave5 = waveSys.generateWaveConfig(4, 20);
      expect(wave5.waveNumber).toBe(5);
      for (const enemy of wave5.enemies) {
        const bp = ENEMY_BLUEPRINTS[enemy.typeId];
        expect(bp.movementType).toBe('SWIM');
      }

      // Wave 6+: Multi-path (more than 1 movement type)
      const wave6 = waveSys.generateWaveConfig(5, 20);
      expect(wave6.waveNumber).toBe(6);
      const wave6Types = new Set(wave6.enemies.map((e) => ENEMY_BLUEPRINTS[e.typeId].movementType));
      expect(wave6Types.size).toBeGreaterThan(1);

      // Final wave: Multi-path
      const finalWave = waveSys.generateWaveConfig(19, 20);
      const finalWaveTypes = new Set(finalWave.enemies.map((e) => ENEMY_BLUEPRINTS[e.typeId].movementType));
      expect(finalWaveTypes.size).toBeGreaterThan(1);
    });

    it('should have dominant tribe configured with name, icon, elements, and description for all maps', async () => {
      const { MAPS_CONFIG } = await import('../config/map.config.js');
      expect(MAPS_CONFIG.length).toBeGreaterThanOrEqual(10);
      for (const map of MAPS_CONFIG) {
        expect(map.tribe).toBeDefined();
        expect(map.tribe?.name).toBeTruthy();
        expect(map.tribe?.icon).toBeTruthy();
        expect(map.tribe?.elements.length).toBeGreaterThan(0);
        expect(map.tribe?.description).toBeTruthy();
      }
    });
  });

  describe('Game Balance & Rework Tests (Archer, Artillery, Barracks, Mage)', () => {
    it('Archer and Artillery damage must be increased across tiers', () => {
      // Archer damage checks
      expect(TOWER_BLUEPRINTS['ARCHER_1'].damage).toBe(14);
      expect(TOWER_BLUEPRINTS['ARCHER_2'].damage).toBe(26);
      expect(TOWER_BLUEPRINTS['ARCHER_3'].damage).toBe(42);
      expect(TOWER_BLUEPRINTS['ARCHER_4_A'].damage).toBe(56);
      expect(TOWER_BLUEPRINTS['ARCHER_4_B'].damage).toBe(85);

      // Artillery damage checks
      expect(TOWER_BLUEPRINTS['ARTILLERY_1'].damage).toBe(40);
      expect(TOWER_BLUEPRINTS['ARTILLERY_2'].damage).toBe(78);
      expect(TOWER_BLUEPRINTS['ARTILLERY_3'].damage).toBe(130);
      expect(TOWER_BLUEPRINTS['ARTILLERY_4_A'].damage).toBe(220);
      expect(TOWER_BLUEPRINTS['ARTILLERY_4_B'].damage).toBe(170);
    });

    it('Barracks must increase soldiers at tier 2 (4 soldiers) and tier 3/4 (5 soldiers)', () => {
      const state = new GameState();
      state.gold = 2000;
      const slot = state.towerSlots.find((s) => s.placement === 'ROADSIDE')!;
      state.buildTower(slot.id, 'BARRACKS');
      const tower = state.towers[0];

      // Tier 1: 3 soldiers
      expect(tower.maxSoldiers).toBe(3);
      expect(tower.soldierIds?.length).toBe(3);
      expect(state.soldiers.length).toBe(3);

      // Tier 2: 4 soldiers
      state.upgradeTower(tower.id);
      expect(tower.tier).toBe(2);
      expect(tower.maxSoldiers).toBe(4);
      expect(tower.soldierIds?.length).toBe(4);
      expect(state.soldiers.length).toBe(4);

      // Tier 3: 5 soldiers
      state.upgradeTower(tower.id);
      expect(tower.tier).toBe(3);
      expect(tower.maxSoldiers).toBe(5);
      expect(tower.soldierIds?.length).toBe(5);
      expect(state.soldiers.length).toBe(5);

      // Tier 4-A: maintains 5 soldiers
      state.upgradeTower(tower.id, 'A');
      expect(tower.tier).toBe(4);
      expect(tower.maxSoldiers).toBe(5);
      expect(tower.soldierIds?.length).toBe(5);
      expect(state.soldiers.length).toBe(5);
    });

    it('Mage tower must explode AoE damage from Tier 1, and ratio must be 1.0 (100%)', async () => {
      const { MAGE_SECONDARY_DMG_RATIO } = await import('../config/elements.config.js');
      expect(MAGE_SECONDARY_DMG_RATIO).toBe(1.0);

      expect(TOWER_BLUEPRINTS['MAGE_1'].aoeRadius).toBe(45);
      expect(TOWER_BLUEPRINTS['MAGE_2'].aoeRadius).toBe(55);
      expect(TOWER_BLUEPRINTS['MAGE_3'].aoeRadius).toBe(65);
      expect(TOWER_BLUEPRINTS['MAGE_1'].damage).toBe(10);
      expect(TOWER_BLUEPRINTS['MAGE_2'].damage).toBe(18);
      expect(TOWER_BLUEPRINTS['MAGE_3'].damage).toBe(30);
    });

    it('Mage 4_A must deal continuous area damage per second', async () => {
      const { TowerSystem } = await import('../systems/TowerSystem.js');
      const state = new GameState();
      state.gold = 2000;
      const slot = state.towerSlots.find((s) => s.placement === 'ROADSIDE')!;
      state.buildTower(slot.id, 'MAGE');
      const tower = state.towers[0];
      state.upgradeTower(tower.id); // Tier 2
      state.upgradeTower(tower.id); // Tier 3
      state.upgradeTower(tower.id, 'A'); // Tier 4_A

      expect(tower.branch).toBe('A');
      expect(tower.tier).toBe(4);

      const dummyEnemy: EnemyEntity = {
        id: 'test-enemy-aura',
        typeId: 'STICK_RUNNER',
        name: 'Runner',
        x: tower.x + 30,
        y: tower.y,
        hp: 200,
        maxHp: 200,
        speed: 50,
        baseSpeed: 50,
        damage: 10,
        attackSpeed: 1,
        attackCooldown: 1,
        rewardGold: 10,
        movementType: 'WALK',
        navigationMode: 'GROUND_PATH',
        pathDistance: 50,
        pathTotalLength: 500,
        elementalProfile: { primaryElement: 'PHYSICAL', immunities: [] },
        state: 'WALKING',
        engagedBySoldierId: null,
        statusEffects: [],
        tags: [],
        altitude: 0,
        size: 15,
        facing: 0
      };

      let auraHits = 0;
      // Simulate 0.6 seconds (should trigger 1 aura tick)
      TowerSystem.updateTowers(
        state.towers,
        [dummyEnemy],
        0.6,
        () => {},
        () => {
          auraHits++;
        }
      );

      expect(auraHits).toBe(1);
      expect(dummyEnemy.hp).toBeLessThan(200);
    });

    it('Mage 4_B must buff nearby towers with 2 elements, picking nearest when multiple exist', () => {
      const state = new GameState();
      state.gold = 5000;

      // Build Mage 1 at (100, 100), upgrade to 4_B with elements FIRE and WATER
      state.buildTowerAt(100, 100, 'MAGE');
      const mage1 = state.towers.find((t) => t.x === 100 && t.y === 100)!;
      state.upgradeTower(mage1.id);
      state.upgradeTower(mage1.id);
      state.upgradeTower(mage1.id, 'B');
      state.setTowerElement(mage1.id, 'FIRE', 1);
      state.setTowerElement(mage1.id, 'WATER', 2);

      // Build Mage 2 at (250, 100), upgrade to 4_B with elements LIGHTNING and ICE
      state.buildTowerAt(250, 100, 'MAGE');
      const mage2 = state.towers.find((t) => t.x === 250 && t.y === 100)!;
      state.upgradeTower(mage2.id);
      state.upgradeTower(mage2.id);
      state.upgradeTower(mage2.id, 'B');
      state.setTowerElement(mage2.id, 'LIGHTNING', 1);
      state.setTowerElement(mage2.id, 'ICE', 2);

      // Build Archer at (140, 100) -> Closer to Mage 1 (dist 40) than Mage 2 (dist 110)
      const builtArcher1 = state.buildTowerAt(140, 100, 'ARCHER');
      expect(builtArcher1).toBe(true);
      const archer = state.towers.find((t) => t.x === 140 && t.y === 100)!;

      // Must be buffed by Mage 1 (nearest)
      expect(archer.buffSourceId).toBe(mage1.id);
      expect(archer.buffedElements).toEqual(['FIRE', 'WATER']);

      // Build another Archer at (210, 100) -> Closer to Mage 2 (dist 40) than Mage 1 (dist 110)
      const builtArcher2 = state.buildTowerAt(210, 100, 'ARCHER');
      expect(builtArcher2).toBe(true);
      const archer2 = state.towers.find((t) => t.x === 210 && t.y === 100)!;

      // Must be buffed by Mage 2 (nearest)
      expect(archer2.buffSourceId).toBe(mage2.id);
      expect(archer2.buffedElements).toEqual(['LIGHTNING', 'ICE']);

      // Selling Mage 1 must recalculate buffs: archer at (140, 100) should now pick Mage 2! (dist 110 <= 195)
      state.sellTower(mage1.id);
      expect(archer.buffSourceId).toBe(mage2.id);
      expect(archer.buffedElements).toEqual(['LIGHTNING', 'ICE']);
    });

    it('TargetingRuleEngine.calculateDamage must include bonusElements from buff', () => {
      const runnerBp = ENEMY_BLUEPRINTS['STICK_RUNNER'];
      const enemy: EnemyEntity = {
        id: 'test-runner-bonus',
        typeId: runnerBp.typeId,
        name: runnerBp.name,
        x: 0,
        y: 0,
        hp: 300,
        maxHp: 300,
        speed: 50,
        baseSpeed: 50,
        damage: 10,
        attackSpeed: 1,
        attackCooldown: 1,
        rewardGold: 10,
        movementType: 'WALK',
        navigationMode: 'GROUND_PATH',
        pathDistance: 0,
        pathTotalLength: 500,
        elementalProfile: { primaryElement: 'WIND', immunities: [] },
        state: 'WALKING',
        engagedBySoldierId: null,
        statusEffects: [],
        tags: [],
        altitude: 0,
        size: 15,
        facing: 0
      };

      // Payload with base physical 20 + secondary fire 10 + bonus lightning 10 + bonus water 10
      const payload: DamagePayload = {
        amount: 20,
        element: 'PHYSICAL',
        secondaryAmount: 10,
        secondaryElement: 'FIRE',
        bonusElements: [
          { element: 'LIGHTNING', amount: 10 },
          { element: 'WATER', amount: 10 }
        ],
        sourceId: 'test-archer'
      };

      const res = TargetingRuleEngine.calculateDamage(payload, enemy);
      // All 4 components deal damage
      expect(res.finalDamage).toBeGreaterThanOrEqual(40);
    });
  });

  describe('Post Wave 10 Map-Themed Enemy Scaling', () => {
    it('should have all maps configured with 10 detailed tribe-themed waves', async () => {
      const { MAPS_CONFIG, WAVES_CONFIG } = await import('../config/map.config.js');
      expect(WAVES_CONFIG.length).toBeGreaterThanOrEqual(10);

      for (const map of MAPS_CONFIG) {
        expect(map.waves.length).toBe(10);
      }
    });

    it('should scale procedural waves beyond wave 10 based on map extendedWaves and Boss on traversable lanes', async () => {
      const { WaveSystem } = await import('../systems/WaveSystem.js');
      const { MAP_VALLEY_ORIGIN } = await import('../config/map.config.js');
      const waveSys = new WaveSystem(MAP_VALLEY_ORIGIN, 30);

      // Waves 11 to 14: n = 1, based on extendedWaves of map
      const ext1Enemies = MAP_VALLEY_ORIGIN.extendedWaves![0].enemies;
      const wave11 = waveSys.generateWaveConfig(10, 30);
      expect(wave11.enemies.length).toBe(ext1Enemies.length);
      for (const entry of wave11.enemies) {
        const orig = ext1Enemies.find((e) => e.typeId === entry.typeId)!;
        expect(orig).toBeDefined();
        expect(entry.count).toBe(orig.count * 1);
      }

      // Wave 15: n = 1, Boss wave: minion count equals wave lính (ext1Enemies) and Boss on traversable lanes
      const wave15 = waveSys.generateWaveConfig(14, 30);
      expect(wave15.enemies.some((e) => e.typeId === 'ANCIENT_TREANT_BOSS')).toBe(true);
      const wave15Minions = wave15.enemies.filter((e) => e.typeId !== 'ANCIENT_TREANT_BOSS');
      expect(wave15Minions.length).toBe(ext1Enemies.length);

      // Waves 21 (wave 21 -> (21-11)%2 = 0 -> ext1Enemies * 2)
      const wave21 = waveSys.generateWaveConfig(20, 30);
      for (const entry of wave21.enemies) {
        const orig = ext1Enemies.find((e) => e.typeId === entry.typeId)!;
        expect(orig).toBeDefined();
        expect(entry.count).toBe(orig.count * 2);
      }

      // Wave 25: n = 2, Boss count = 1 lane * 2 = 2
      const wave25 = waveSys.generateWaveConfig(24, 30);
      const boss = wave25.enemies.find((e) => e.typeId === 'ANCIENT_TREANT_BOSS')!;
      expect(boss.count).toBe(2);
    });

    it('should scale enemy maxHp by 10% per wave after wave 10', async () => {
      const { WaveSystem } = await import('../systems/WaveSystem.js');
      const { ENEMY_BLUEPRINTS } = await import('../config/enemies.config.js');
      const waveSys = new WaveSystem(undefined, 25);

      // 1. Verify getWaveHpMultiplier values
      // Waves 1 to 10: strictly 1.0 (no HP increase)
      for (let w = 1; w <= 10; w++) {
        expect(waveSys.getWaveHpMultiplier(w - 1)).toBe(1.0);
      }
      // Waves 11+: increases by 10% (0.1) each wave
      expect(waveSys.getWaveHpMultiplier(10)).toBeCloseTo(1.1); // Wave 11
      expect(waveSys.getWaveHpMultiplier(11)).toBeCloseTo(1.2); // Wave 12
      expect(waveSys.getWaveHpMultiplier(12)).toBeCloseTo(1.3); // Wave 13
      expect(waveSys.getWaveHpMultiplier(14)).toBeCloseTo(1.5); // Wave 15
      expect(waveSys.getWaveHpMultiplier(19)).toBeCloseTo(2.0); // Wave 20 (+100% max HP)
      expect(waveSys.getWaveHpMultiplier(24)).toBeCloseTo(2.5); // Wave 25 (+150% max HP)

      // 2. Verify spawned enemies have scaled hp and maxHp
      const runnerBp = ENEMY_BLUEPRINTS['STICK_RUNNER']; // base hp = 45
      const golemBp = ENEMY_BLUEPRINTS['ROCK_GOLEM']; // base hp = 280
      const bossBp = ENEMY_BLUEPRINTS['VOID_HYDRA_BOSS']; // base hp = 3000
      expect(bossBp.hp).toBe(3000);

      // Test Wave 10 spawn (no increase)
      waveSys.startWave(10);
      const spawnedWave10: any[] = [];
      waveSys.update(1.0, (enemy) => spawnedWave10.push(enemy), () => {}, 0);
      if (spawnedWave10.length > 0) {
        const firstEnemy = spawnedWave10[0];
        const baseHp = ENEMY_BLUEPRINTS[firstEnemy.typeId].hp;
        expect(firstEnemy.hp).toBe(baseHp);
        expect(firstEnemy.maxHp).toBe(baseHp);
      }

      // Test Wave 11 spawn (+10% max HP)
      waveSys.startWave(11);
      const spawnedWave11: any[] = [];
      waveSys.update(1.0, (enemy) => spawnedWave11.push(enemy), () => {}, 0);
      if (spawnedWave11.length > 0) {
        const firstEnemy = spawnedWave11[0];
        const baseHp = ENEMY_BLUEPRINTS[firstEnemy.typeId].hp;
        expect(firstEnemy.hp).toBe(Math.round(baseHp * 1.1));
        expect(firstEnemy.maxHp).toBe(Math.round(baseHp * 1.1));
      }

      // Test Wave 12 spawn (+20% max HP)
      waveSys.startWave(12);
      const spawnedWave12: any[] = [];
      waveSys.update(1.0, (enemy) => spawnedWave12.push(enemy), () => {}, 0);
      if (spawnedWave12.length > 0) {
        const firstEnemy = spawnedWave12[0];
        const baseHp = ENEMY_BLUEPRINTS[firstEnemy.typeId].hp;
        expect(firstEnemy.hp).toBe(Math.round(baseHp * 1.2));
        expect(firstEnemy.maxHp).toBe(Math.round(baseHp * 1.2));
      }

      // Test Wave 20 spawn (+100% max HP -> 2.0x)
      waveSys.startWave(20);
      const spawnedWave20: any[] = [];
      waveSys.update(1.0, (enemy) => spawnedWave20.push(enemy), () => {}, 0);
      if (spawnedWave20.length > 0) {
        const firstEnemy = spawnedWave20[0];
        const baseHp = ENEMY_BLUEPRINTS[firstEnemy.typeId].hp;
        expect(firstEnemy.hp).toBe(Math.round(baseHp * 2.0));
        expect(firstEnemy.maxHp).toBe(Math.round(baseHp * 2.0));
      }

      // 3. Verify minion/split spawn (spawnMinionAt) at Wave 11 and Wave 12
      waveSys.startWave(11);
      const minionW11 = waveSys.spawnMinionAt('STICK_RUNNER', 100, 50, 50);
      expect(minionW11).toBeDefined();
      expect(minionW11?.maxHp).toBe(Math.round(runnerBp.hp * 1.1));
      expect(minionW11?.hp).toBe(Math.round(runnerBp.hp * 1.1));

      waveSys.startWave(12);
      const minionW12 = waveSys.spawnMinionAt('ROCK_GOLEM', 100, 50, 50);
      expect(minionW12).toBeDefined();
      expect(minionW12?.maxHp).toBe(Math.round(golemBp.hp * 1.2));
      expect(minionW12?.hp).toBe(Math.round(golemBp.hp * 1.2));
    });
  });

  describe('Codex & Monster Damage Intake Matrix Tests', () => {
    it('should correctly calculate monster damage intake according to targeting rule engine and elemental matchups', async () => {
      const { ENEMY_BLUEPRINTS } = await import('../config/enemies.config.js');
      const { ELEMENTAL_MATCHUPS } = await import('../config/elements.config.js');

      // Test Rock Golem immunities & matrix calculated matchups
      const rockGolem = ENEMY_BLUEPRINTS['ROCK_GOLEM'];
      expect(rockGolem.elementalProfile.immunities).toContain('PHYSICAL');
      expect(rockGolem.elementalProfile.immunities).toContain('LIGHTNING');
      expect(TargetingRuleEngine.calculateElementalMatchup('WATER', rockGolem.elementalProfile)).toBe(1.5);
      expect(TargetingRuleEngine.calculateElementalMatchup('ICE', rockGolem.elementalProfile)).toBe(1.0);
      expect(TargetingRuleEngine.calculateElementalMatchup('LIGHTNING', rockGolem.elementalProfile)).toBe(0);

      // Test Fire Imp immunity to Fire & weakness to Water
      const fireImp = ENEMY_BLUEPRINTS['FIRE_IMP'];
      expect(fireImp.elementalProfile.immunities).toContain('FIRE');
      const waterVsFire = ELEMENTAL_MATCHUPS['WATER']?.['FIRE'];
      expect(waterVsFire).toBe(2.0);

      // Test Winged Gargoyle: FLY movement type
      const gargoyle = ENEMY_BLUEPRINTS['WINGED_GARGOYLE'];
      expect(gargoyle.movementType).toBe('FLY');

      // Test Dark Dragon Boss: BOSS tag
      const dragonBoss = ENEMY_BLUEPRINTS['DARK_DRAGON_BOSS'];
      expect(dragonBoss.tags).toContain('BOSS');
    });
  });

  describe('StorageService & Auto-Save System', () => {
    it('should clamp and sanitize invalid or out-of-bound settings', async () => {
      const { StorageService, DEFAULT_SETTINGS } = await import('../core/StorageService.js');

      // Clamping customTotalWaves
      const lowWaves = StorageService.sanitizeSettings({ customTotalWaves: -5 });
      expect(lowWaves.customTotalWaves).toBe(1);

      const highWaves = StorageService.sanitizeSettings({ customTotalWaves: 999 });
      expect(highWaves.customTotalWaves).toBe(100);

      // Clamping multipliers
      const lowGold = StorageService.sanitizeSettings({ goldMultiplier: 0.01 });
      expect(lowGold.goldMultiplier).toBe(0.1);

      const highGold = StorageService.sanitizeSettings({ goldMultiplier: 99.9 });
      expect(highGold.goldMultiplier).toBe(10.0);

      const invalidDmg = StorageService.sanitizeSettings({ damageMultiplier: -1 });
      expect(invalidDmg.damageMultiplier).toBe(0.1);

      // Invalid map fallback
      const invalidMap = StorageService.sanitizeSettings({ currentMapId: 'non_existent_map' });
      expect(invalidMap.currentMapId).toBe(DEFAULT_SETTINGS.currentMapId);

      // Valid settings preservation
      const valid = StorageService.sanitizeSettings({
        customTotalWaves: 35,
        goldMultiplier: 2.5,
        damageMultiplier: 1.5,
        gameSpeed: 2,
        currentMapId: 'infernal_caldera'
      });
      expect(valid.customTotalWaves).toBe(35);
      expect(valid.goldMultiplier).toBe(2.5);
      expect(valid.damageMultiplier).toBe(1.5);
      expect(valid.gameSpeed).toBe(2);
      expect(valid.currentMapId).toBe('infernal_caldera');
    });

    it('should save and load settings to localStorage safely', async () => {
      const { StorageService } = await import('../core/StorageService.js');

      // Clean start
      StorageService.clear();

      StorageService.saveSettings({
        customTotalWaves: 25,
        goldMultiplier: 3.0,
        damageMultiplier: 2.0,
        gameSpeed: 2,
        currentMapId: 'twin_crossroads'
      });

      const loaded = StorageService.loadSettings();
      expect(loaded.customTotalWaves).toBe(25);
      expect(loaded.goldMultiplier).toBe(3.0);
      expect(loaded.damageMultiplier).toBe(2.0);
      expect(loaded.gameSpeed).toBe(2);
      expect(loaded.currentMapId).toBe('twin_crossroads');

      // Reset
      StorageService.resetSettings();
      const afterReset = StorageService.loadSettings();
      expect(afterReset.customTotalWaves).toBe(15);
      expect(afterReset.goldMultiplier).toBe(1.0);
      expect(afterReset.damageMultiplier).toBe(1.0);
      expect(afterReset.gameSpeed).toBe(1);

      StorageService.clear();
    });

    it('should apply settings to GameState and preserve gameSpeed upon GameState.reset()', async () => {
      const { StorageService } = await import('../core/StorageService.js');
      const state = new GameState();

      // Mock save
      StorageService.saveSettings({
        customTotalWaves: 40,
        goldMultiplier: 2.0,
        damageMultiplier: 3.0,
        gameSpeed: 2,
        currentMapId: 'serpent_canyon'
      });

      state.loadSettingsFromStorage();
      expect(state.customTotalWaves).toBe(40);
      expect(state.goldMultiplier).toBe(2.0);
      expect(state.damageMultiplier).toBe(3.0);
      expect(state.gameSpeed).toBe(2);
      expect(state.currentMapId).toBe('serpent_canyon');

      // Call reset() - gameSpeed and settings should persist!
      state.reset();
      expect(state.gameSpeed).toBe(2);

      // Save from GameState
      state.goldMultiplier = 5.0;
      state.saveSettingsToStorage();
      const updated = StorageService.loadSettings();
      expect(updated.goldMultiplier).toBe(5.0);

      // Cleanup
      StorageService.clear();
    });
  });

  describe('Damage & Elemental System Rework Verification Tests', () => {
    it('LIGHTNING element must apply SHOCK instead of FREEZE', () => {
      const runnerBp = ENEMY_BLUEPRINTS['STICK_RUNNER'];
      const enemy: EnemyEntity = {
        id: 'test-shock-runner',
        typeId: runnerBp.typeId,
        name: runnerBp.name,
        x: 0,
        y: 0,
        hp: 100,
        maxHp: 100,
        speed: 50,
        baseSpeed: 50,
        damage: 10,
        attackSpeed: 1,
        attackCooldown: 1,
        rewardGold: 10,
        movementType: 'WALK',
        navigationMode: 'GROUND_PATH',
        pathDistance: 0,
        pathTotalLength: 500,
        elementalProfile: { primaryElement: 'PHYSICAL', immunities: [] },
        state: 'WALKING',
        engagedBySoldierId: null,
        statusEffects: [],
        tags: [],
        altitude: 0,
        size: 15,
        facing: 0
      };

      TargetingRuleEngine.applyElementalHitEffects(enemy, 'LIGHTNING', 30);
      expect(enemy.statusEffects.some((s) => s.type === 'SHOCK')).toBe(true);
      expect(enemy.statusEffects.some((s) => s.type === 'FREEZE')).toBe(false);

      // Verify updateStatusEffects halts enemy speed
      TargetingRuleEngine.updateStatusEffects(enemy, 0.1, () => {});
      expect(enemy.speed).toBe(0);
    });

    it('Immune enemy must NEVER receive status effects from the immune element', () => {
      const fireImpBp = ENEMY_BLUEPRINTS['FIRE_IMP']; // Immune to FIRE
      const fireImp: EnemyEntity = {
        id: 'test-immune-imp',
        typeId: fireImpBp.typeId,
        name: fireImpBp.name,
        x: 0,
        y: 0,
        hp: fireImpBp.hp,
        maxHp: fireImpBp.hp,
        speed: 50,
        baseSpeed: 50,
        damage: 10,
        attackSpeed: 1,
        attackCooldown: 1,
        rewardGold: 10,
        movementType: 'WALK',
        navigationMode: 'GROUND_PATH',
        pathDistance: 0,
        pathTotalLength: 500,
        elementalProfile: fireImpBp.elementalProfile,
        state: 'WALKING',
        engagedBySoldierId: null,
        statusEffects: [],
        tags: [],
        altitude: 0,
        size: 15,
        facing: 0
      };

      // Hybrid attack: Physical 30 + Fire 20
      const payload: DamagePayload = {
        amount: 30,
        element: 'PHYSICAL',
        secondaryAmount: 20,
        secondaryElement: 'FIRE',
        sourceId: 'archer-1'
      };

      TargetingRuleEngine.applyAllPayloadEffects(fireImp, payload);
      // FireImp is immune to Fire -> BURN must NOT be applied!
      expect(fireImp.statusEffects.some((s) => s.type === 'BURN')).toBe(false);
    });

    it('SUNDER status must neutralize physical resistance on armored enemies', () => {
      const vanguardBp = ENEMY_BLUEPRINTS['STEEL_VANGUARD']; // Steel has 0.5x physical resistance
      const vanguard: EnemyEntity = {
        id: 'test-vanguard-sunder',
        typeId: vanguardBp.typeId,
        name: vanguardBp.name,
        x: 0,
        y: 0,
        hp: vanguardBp.hp,
        maxHp: vanguardBp.hp,
        speed: 35,
        baseSpeed: 35,
        damage: 20,
        attackSpeed: 1,
        attackCooldown: 1,
        rewardGold: 20,
        movementType: 'WALK',
        navigationMode: 'GROUND_PATH',
        pathDistance: 0,
        pathTotalLength: 500,
        elementalProfile: vanguardBp.elementalProfile,
        state: 'WALKING',
        engagedBySoldierId: null,
        statusEffects: [],
        tags: [],
        altitude: 0,
        size: 20,
        facing: 0
      };

      // Without SUNDER: 0.5x physical resistance
      const resNormal = TargetingRuleEngine.calculateDamage(
        { amount: 100, element: 'PHYSICAL', sourceId: 'barracks-1' },
        vanguard
      );
      expect(resNormal.finalDamage).toBe(50); // 100 * 0.5

      // Apply SUNDER
      TargetingRuleEngine.applyStatusEffect(vanguard, {
        type: 'SUNDER',
        duration: 4.0,
        value: 0.3
      });

      // With SUNDER: physical resistance neutralized to 1.0x, then multiplied by 1.3x = 130 damage!
      const resSundered = TargetingRuleEngine.calculateDamage(
        { amount: 100, element: 'PHYSICAL', sourceId: 'barracks-1' },
        vanguard
      );
      expect(resSundered.finalDamage).toBe(130);
    });

    it('Elemental reaction secondary bonus effects must execute properly', () => {
      const runnerBp = ENEMY_BLUEPRINTS['STICK_RUNNER'];
      const enemy: EnemyEntity = {
        id: 'test-reaction-enemy',
        typeId: runnerBp.typeId,
        name: runnerBp.name,
        x: 0,
        y: 0,
        hp: 200,
        maxHp: 200,
        speed: 50,
        baseSpeed: 50,
        damage: 10,
        attackSpeed: 1,
        attackCooldown: 1,
        rewardGold: 10,
        movementType: 'WALK',
        navigationMode: 'GROUND_PATH',
        pathDistance: 100,
        pathTotalLength: 500,
        elementalProfile: { primaryElement: 'PHYSICAL', immunities: [] },
        state: 'WALKING',
        engagedBySoldierId: null,
        statusEffects: [
          { type: 'WET', duration: 4.0, value: 0 }
        ],
        tags: [],
        altitude: 0,
        size: 15,
        facing: 0
      };

      // 1. PERMAFROST: ICE hitting WET must 100% guarantee FREEZE (0.8s)
      TargetingRuleEngine.applyElementalHitEffects(enemy, 'ICE', 40);
      expect(enemy.statusEffects.some((s) => s.type === 'FREEZE' && s.duration === 0.8)).toBe(true);

      // 2. SHATTER: STEEL hitting FREEZE must consume FREEZE and apply SUNDER
      TargetingRuleEngine.applyElementalHitEffects(enemy, 'STEEL', 50);
      expect(enemy.statusEffects.some((s) => s.type === 'FREEZE')).toBe(false); // consumed!
      expect(enemy.statusEffects.some((s) => s.type === 'SUNDER')).toBe(true);

      // 3. CORROSION: POISON hitting SUNDER must stack poison by +2
      TargetingRuleEngine.applyElementalHitEffects(enemy, 'POISON', 40);
      const poisonEff = enemy.statusEffects.find((s) => s.type === 'POISON');
      expect(poisonEff).toBeDefined();
      expect(poisonEff?.value).toBeGreaterThanOrEqual(2);
      expect(poisonEff?.duration).toBe(5.0);
    });

    it('Configurable Elemental Mechanics: Same-element resistance, Wind nerf, and Ice freeze duration', async () => {
      const { ALL_15_ELEMENTS, ALL_ELEMENT_DEFINITIONS, ELEMENTAL_MATCHUPS } = await import('../config/elements.config.js');

      // 1. Same-element resistance must be <= 0.3 for all elements except self-countering (GHOST, DRAGON) and PHYSICAL
      for (const elem of ALL_15_ELEMENTS) {
        if (elem === 'PHYSICAL' || elem === 'GHOST' || elem === 'DRAGON') continue;
        const selfMult = ELEMENTAL_MATCHUPS[elem]?.[elem];
        expect(selfMult).toBeDefined();
        expect(selfMult).toBeLessThanOrEqual(0.3);
      }

      // GHOST and DRAGON counter themselves (1.8x)
      expect(ELEMENTAL_MATCHUPS['GHOST']?.['GHOST']).toBe(1.8);
      expect(ELEMENTAL_MATCHUPS['DRAGON']?.['DRAGON']).toBe(1.8);

      // 2. Wind element nerf verification
      const windStats = ALL_ELEMENT_DEFINITIONS.WIND.combatStats!;
      expect(windStats.vsFlyMultiplier).toBe(1.0); // no extra damage to flying
      expect(windStats.knockbackChanceFly).toBeGreaterThan(windStats.knockbackChanceGround!);

      // Flying enemy taking wind damage has no bonus damage multiplier
      const flyEnemy: EnemyEntity = {
        id: 'test-fly-enemy',
        typeId: 'WINGED_GARGOYLE',
        name: 'Gargoyle',
        x: 0,
        y: 0,
        hp: 100,
        maxHp: 100,
        speed: 50,
        baseSpeed: 50,
        damage: 10,
        attackSpeed: 1,
        attackCooldown: 1,
        rewardGold: 10,
        movementType: 'FLY',
        navigationMode: 'AIR_DIRECT',
        pathDistance: 50,
        pathTotalLength: 500,
        elementalProfile: { primaryElement: 'EARTH', immunities: [] },
        state: 'FLYING',
        engagedBySoldierId: null,
        statusEffects: [],
        tags: ['FLYING'],
        altitude: 25,
        size: 15,
        facing: 0
      };

      const windDmg = TargetingRuleEngine.calculateDamage({ amount: 100, element: 'WIND', sourceId: 'test' }, flyEnemy);
      // Wind vs Earth is 1.5x from matchup table, NO additional 1.5x fly bonus! (Previously 1.5 * 1.5 = 2.25x)
      expect(windDmg.multiplier).toBe(1.5);
      expect(windDmg.finalDamage).toBe(150);

      // 3. Ice freeze duration verification
      const iceStats = ALL_ELEMENT_DEFINITIONS.ICE.combatStats!;
      expect(iceStats.procDuration).toBe(0.6); // Reduced from 1.2s to 0.6s
    });

    it('Crowd-control and debuffs must properly hinder enemy attack capabilities', () => {
      const runnerBp = ENEMY_BLUEPRINTS['STICK_RUNNER'];
      const enemy: EnemyEntity = {
        id: 'test-cc-enemy',
        typeId: runnerBp.typeId,
        name: runnerBp.name,
        x: 0,
        y: 0,
        hp: 100,
        maxHp: 100,
        speed: 50,
        baseSpeed: 50,
        damage: 10,
        attackSpeed: 1,
        attackCooldown: 1,
        rewardGold: 10,
        movementType: 'WALK',
        navigationMode: 'GROUND_PATH',
        pathDistance: 0,
        pathTotalLength: 500,
        elementalProfile: { primaryElement: 'PHYSICAL', immunities: [] },
        state: 'WALKING',
        engagedBySoldierId: null,
        statusEffects: [],
        tags: [],
        altitude: 0,
        size: 15,
        facing: 0
      };

      // Normal state
      expect(TargetingRuleEngine.isEnemyStunnedOrFrozen(enemy)).toBe(false);
      expect(TargetingRuleEngine.getEnemyAttackSpeedMultiplier(enemy)).toBe(1.0);

      // Freeze state
      TargetingRuleEngine.applyStatusEffect(enemy, { type: 'FREEZE', duration: 1.2, value: 0 });
      expect(TargetingRuleEngine.isEnemyStunnedOrFrozen(enemy)).toBe(true);

      // Shock state
      enemy.statusEffects = [];
      TargetingRuleEngine.applyStatusEffect(enemy, { type: 'SHOCK', duration: 0.35, value: 0.35 });
      expect(TargetingRuleEngine.isEnemyStunnedOrFrozen(enemy)).toBe(true);

      // Poison debuff reduces attack speed by 20% (0.8x)
      enemy.statusEffects = [];
      TargetingRuleEngine.applyStatusEffect(enemy, { type: 'POISON', duration: 4.0, value: 1 });
      expect(TargetingRuleEngine.getEnemyAttackSpeedMultiplier(enemy)).toBe(0.8);

      // Charm debuff reduces attack speed by 30% (0.7x)
      TargetingRuleEngine.applyStatusEffect(enemy, { type: 'CHARM', duration: 3.0, value: 0.35 });
      expect(TargetingRuleEngine.getEnemyAttackSpeedMultiplier(enemy)).toBe(0.7);
    });

    it('TargetingRuleEngine.calculateEnemyDamageToSoldier must properly apply DRAGON_AWE debuff and soldier armor', () => {
      const enemy: EnemyEntity = {
        id: 'e-test',
        typeId: 'STICK_RUNNER',
        name: 'Test Enemy',
        x: 0,
        y: 0,
        hp: 100,
        maxHp: 100,
        speed: 50,
        baseSpeed: 50,
        damage: 40,
        attackSpeed: 1,
        attackCooldown: 1,
        rewardGold: 10,
        movementType: 'WALK',
        navigationMode: 'GROUND_PATH',
        pathDistance: 0,
        pathTotalLength: 500,
        elementalProfile: { primaryElement: 'PHYSICAL', immunities: [] },
        state: 'WALKING',
        engagedBySoldierId: null,
        statusEffects: [],
        tags: [],
        altitude: 0,
        size: 20,
        facing: 0
      };

      const soldier: SoldierEntity = {
        id: 's-test',
        towerId: 't-1',
        name: 'Test Soldier',
        x: 0,
        y: 0,
        hp: 100,
        maxHp: 100,
        damage: 15,
        attackSpeed: 1,
        attackCooldown: 0,
        element: 'PHYSICAL',
        combatMode: 'MELEE',
        state: 'IDLE',
        engagedEnemyId: null,
        rallyPoint: { x: 0, y: 0 },
        targetPos: { x: 0, y: 0 },
        armor: 0.25, // 25% armor reduction
        magicResist: 0,
        respawnTimer: 0,
        respawnDelay: 8,
        tier: 1,
        baseMaxHp: 100,
        baseDamage: 15,
        baseArmor: 0.25
      };

      // Base: 40 * (1 - 0.25) = 30
      const dmgNormal = TargetingRuleEngine.calculateEnemyDamageToSoldier(enemy, soldier);
      expect(dmgNormal).toBe(30);

      // Enemy affected by DRAGON_AWE (-25% damage): 40 * 0.75 * (1 - 0.25) = 22.5 -> 23
      TargetingRuleEngine.applyStatusEffect(enemy, { type: 'DRAGON_AWE', duration: 3.5, value: 0.25 });
      const dmgAwed = TargetingRuleEngine.calculateEnemyDamageToSoldier(enemy, soldier);
      expect(dmgAwed).toBe(23);
    });

    it('DARK_DRAGON_BOSS and VOID_HYDRA_BOSS damage calculated strictly via Elemental Matrix and Dual-Element principles', async () => {
      const boss1Bp = ENEMY_BLUEPRINTS['DARK_DRAGON_BOSS'];
      const boss2Bp = ENEMY_BLUEPRINTS['VOID_HYDRA_BOSS'];

      expect(boss1Bp).toBeDefined();
      expect(boss2Bp).toBeDefined();

      // Ensure NO hardcoded damageMultipliers exist in blueprints
      expect(boss1Bp.elementalProfile.damageMultipliers).toBeUndefined();
      expect(boss2Bp.elementalProfile.damageMultipliers).toBeUndefined();

      // In-game calculation check for Boss 1 (Dark Dragon Boss: DRAGON + DARK)
      // Fairy vs Dragon = 2.0x, Fairy vs Dark = 1.75x -> Combined = 2.0 * 1.75 = 3.5 -> Clamped to 3.0x
      const boss1: EnemyEntity = {
        id: 'b1',
        typeId: boss1Bp.typeId,
        name: boss1Bp.name,
        x: 0,
        y: 0,
        hp: boss1Bp.hp,
        maxHp: boss1Bp.hp,
        speed: boss1Bp.speed,
        baseSpeed: boss1Bp.speed,
        damage: boss1Bp.damage,
        attackSpeed: boss1Bp.attackSpeed,
        attackCooldown: 1,
        rewardGold: boss1Bp.rewardGold,
        movementType: boss1Bp.movementType,
        navigationMode: boss1Bp.navigationMode,
        pathDistance: 0,
        pathTotalLength: 500,
        elementalProfile: boss1Bp.elementalProfile,
        state: 'FLYING',
        engagedBySoldierId: null,
        statusEffects: [],
        tags: boss1Bp.tags,
        altitude: boss1Bp.altitude,
        size: boss1Bp.size,
        facing: 0
      };

      const resBoss1 = TargetingRuleEngine.calculateDamage(
        { amount: 100, element: 'FAIRY', sourceId: 'test-fairy' },
        boss1
      );
      expect(resBoss1.isImmune).toBe(false);
      expect(resBoss1.multiplier).toBe(3.0);
      expect(resBoss1.finalDamage).toBe(300); // 300% of 100
      expect(resBoss1.label).toBe('KHẮC HỆ!');

      // In-game calculation check for Boss 2 (Void Hydra Boss: DRAGON + POISON)
      // Fairy vs Dragon = 2.0x, Fairy vs Poison = 0.4x -> Combined = 2.0 * 0.4 = 0.8x
      const boss2: EnemyEntity = {
        ...boss1,
        id: 'b2',
        typeId: boss2Bp.typeId,
        name: boss2Bp.name,
        movementType: boss2Bp.movementType,
        elementalProfile: boss2Bp.elementalProfile,
        state: 'WALKING'
      };

      const resBoss2 = TargetingRuleEngine.calculateDamage(
        { amount: 100, element: 'FAIRY', sourceId: 'test-fairy' },
        boss2
      );
      expect(resBoss2.isImmune).toBe(false);
      expect(resBoss2.multiplier).toBe(0.8);
      expect(resBoss2.finalDamage).toBe(80); // 80% of 100
      expect(resBoss2.label).toBeUndefined(); // 0.8 is slight resistance, no floating battle text banner

      // CodexEnemies verification
      const { CodexEnemies } = await import('../ui/codex/CodexEnemies.js');
      const codex = new CodexEnemies(() => true, () => 'ENEMIES');
      const intakeBoss1 = codex.calculateDamageIntake(boss1Bp, 'FAIRY');
      expect(intakeBoss1.multiplier).toBe(3.0);
      expect(intakeBoss1.percentage).toBe(300);
      expect(intakeBoss1.category).toBe('SUPER_WEAK');

      const intakeBoss2 = codex.calculateDamageIntake(boss2Bp, 'FAIRY');
      expect(intakeBoss2.multiplier).toBe(0.8);
      expect(intakeBoss2.percentage).toBe(80);
      expect(intakeBoss2.category).toBe('RESIST');
    });

    it('should configure next wave button states correctly and not show HP buff on button', async () => {
      const { HUDManager } = await import('../ui/hud/HUDManager.js');
      const { GameState } = await import('../core/GameState.js');

      const mockElements: Record<string, any> = {
        'message-banner': { classList: { add: () => {}, remove: () => {} }, innerHTML: '', addEventListener: () => {} },
        'btn-next-wave': { textContent: '', innerHTML: '', disabled: false, addEventListener: () => {} },
        'hud-gold': { textContent: '' },
        'hud-lives': { textContent: '' },
        'hud-wave': { textContent: '', title: '' },
        'hud-wave-hp-buff': { textContent: '', style: {}, classList: { add: () => {}, remove: () => {} } },
        'hud-map-name': { textContent: '' },
        'hud-map-waves': { textContent: '', innerHTML: '' },
      };

      const originalDocument = (globalThis as any).document;
      (globalThis as any).document = {
        getElementById: (id: string) => mockElements[id] || null,
        addEventListener: () => {},
      };

      try {
        const state = new GameState();
        const hud = new HUDManager(state, {
          onCallWave: () => {},
          onRestart: () => {},
          onOpenMapModal: () => {},
          onSelectMap: () => {},
        });

        const btn = mockElements['btn-next-wave'];

        // Wave 1, not running
        hud.updateHUD(1, 15, false);
        expect(btn.disabled).toBe(false);
        expect(btn.textContent).toBe('⚔️ Bắt đầu Đợt Quái');
        expect(btn.textContent).not.toContain('% Máu');

        // Wave 1, running
        hud.updateHUD(1, 15, true);
        expect(btn.disabled).toBe(false);
        expect(btn.textContent).toBe('⚡ Gọi đợt kế tiếp (+ Vàng)');
        expect(btn.textContent).not.toContain('% Máu');

        // Wave 12 (> 10), running, current < total
        hud.updateHUD(12, 15, true);
        expect(btn.disabled).toBe(false);
        expect(btn.textContent).toBe('⚡ Gọi đợt kế tiếp (+ Vàng)');
        expect(btn.textContent).not.toContain('% Máu');

        // Wave 15 (last wave, full waves), running: button must be disabled!
        hud.updateHUD(15, 15, true);
        expect(btn.disabled).toBe(true);
        expect(btn.textContent).toBe('⚔️ Đang diễn ra đợt cuối');
        expect(btn.textContent).not.toContain('% Máu');
      } finally {
        (globalThis as any).document = originalDocument;
      }
    });

    it('should not allow starting wave beyond totalWaves in WaveSystem', async () => {
      const { WaveSystem } = await import('../systems/WaveSystem.js');
      const waveSys = new WaveSystem(undefined, 15);
      waveSys.currentWaveIndex = 14; // Wave 15
      expect(waveSys.startWave()).toBe(true);

      waveSys.currentWaveIndex = 15; // Beyond wave 15
      expect(waveSys.startWave()).toBe(false);
    });
  });

  describe('Crowd Control & Elite/Boss CC Resistance Architecture', () => {
    it('should tag non-boss summoners and splitters with ELITE tag', () => {
      const eliteIds = [
        'MAGMA_SLIME',
        'FROST_CRYSTAL_GOLEM',
        'NECRO_WARLOCK',
        'STORM_CALLER_SIREN',
        'IRON_COLOSSUS',
        'PLAGUE_LEVIATHAN'
      ];

      for (const id of eliteIds) {
        const bp = ENEMY_BLUEPRINTS[id];
        expect(bp).toBeDefined();
        expect(bp.tags).toContain('ELITE');
        expect(bp.tags).not.toContain('BOSS');
      }

      // Bosses must NOT be tagged with ELITE
      const bossIds = [
        'ANCIENT_TREANT_BOSS',
        'IRON_OVERLORD_BOSS',
        'DARK_DRAGON_BOSS',
        'TEMPEST_LEVIATHAN_BOSS',
        'INFERNO_MONARCH_BOSS',
        'GLACIAL_TITAN_BOSS',
        'SOUL_EMPEROR_BOSS',
        'VOID_HYDRA_BOSS',
        'ARCHANGEL_MONARCH_BOSS',
        'CHRONO_DESTROYER_BOSS'
      ];
      for (const id of bossIds) {
        const bp = ENEMY_BLUEPRINTS[id];
        expect(bp).toBeDefined();
        expect(bp.tags).toContain('BOSS');
        expect(bp.tags).not.toContain('ELITE');
      }
    });

    it('BOSS must be 100% immune to Hard CC (Freeze, Shock, Root, Knockback)', () => {
      const bossBp = ENEMY_BLUEPRINTS['DARK_DRAGON_BOSS'];
      const boss: EnemyEntity = {
        id: 'test-boss-cc',
        typeId: bossBp.typeId,
        name: bossBp.name,
        x: 100,
        y: 100,
        hp: bossBp.hp,
        maxHp: bossBp.hp,
        speed: bossBp.speed,
        baseSpeed: bossBp.speed,
        damage: bossBp.damage,
        attackSpeed: bossBp.attackSpeed,
        attackCooldown: 1,
        rewardGold: bossBp.rewardGold,
        movementType: bossBp.movementType,
        navigationMode: bossBp.navigationMode,
        pathDistance: 100,
        pathTotalLength: 500,
        elementalProfile: bossBp.elementalProfile,
        state: 'FLYING',
        engagedBySoldierId: null,
        statusEffects: [],
        tags: [...bossBp.tags],
        altitude: bossBp.altitude,
        size: bossBp.size,
        facing: 0
      };

      // 1. Attempt FREEZE
      TargetingRuleEngine.applyStatusEffect(boss, { type: 'FREEZE', duration: 1.0, value: 0 });
      expect(boss.statusEffects.some((s) => s.type === 'FREEZE')).toBe(false);

      // 2. Attempt SHOCK
      TargetingRuleEngine.applyStatusEffect(boss, { type: 'SHOCK', duration: 0.5, value: 0.35 });
      expect(boss.statusEffects.some((s) => s.type === 'SHOCK')).toBe(false);

      // 3. Attempt ROOT
      TargetingRuleEngine.applyStatusEffect(boss, { type: 'ROOT', duration: 1.5, value: 0 });
      expect(boss.statusEffects.some((s) => s.type === 'ROOT')).toBe(false);

      // 4. Attempt KNOCKBACK
      const distKnocked = TargetingRuleEngine.applyKnockback(boss, 30);
      expect(distKnocked).toBe(0);
      expect(boss.pathDistance).toBe(100); // unmoved
    });

    it('BOSS must take 0.5 effect and 0.5 duration for Soft CC (Slow, Charm)', () => {
      const bossBp = ENEMY_BLUEPRINTS['VOID_HYDRA_BOSS'];
      const boss: EnemyEntity = {
        id: 'test-boss-soft-cc',
        typeId: bossBp.typeId,
        name: bossBp.name,
        x: 100,
        y: 100,
        hp: bossBp.hp,
        maxHp: bossBp.hp,
        speed: bossBp.speed,
        baseSpeed: bossBp.speed,
        damage: bossBp.damage,
        attackSpeed: bossBp.attackSpeed,
        attackCooldown: 1,
        rewardGold: bossBp.rewardGold,
        movementType: bossBp.movementType,
        navigationMode: bossBp.navigationMode,
        pathDistance: 100,
        pathTotalLength: 500,
        elementalProfile: bossBp.elementalProfile,
        state: 'WALKING',
        engagedBySoldierId: null,
        statusEffects: [],
        tags: [...bossBp.tags],
        altitude: bossBp.altitude,
        size: bossBp.size,
        facing: 0
      };

      // Apply SLOW: 40% slow for 4.0s -> Boss gets 20% slow (0.4 * 0.5 = 0.2) for 2.0s (4.0 * 0.5 = 2.0)
      TargetingRuleEngine.applyStatusEffect(boss, { type: 'SLOW', duration: 4.0, value: 0.4 });
      const slowEff = boss.statusEffects.find((s) => s.type === 'SLOW');
      expect(slowEff).toBeDefined();
      expect(slowEff?.duration).toBe(2.0);
      expect(slowEff?.value).toBe(0.2);

      // Apply CHARM: 30% for 3.0s -> Boss gets 15% for 1.5s
      TargetingRuleEngine.applyStatusEffect(boss, { type: 'CHARM', duration: 3.0, value: 0.3 });
      const charmEff = boss.statusEffects.find((s) => s.type === 'CHARM');
      expect(charmEff).toBeDefined();
      expect(charmEff?.duration).toBe(1.5);
      expect(charmEff?.value).toBe(0.15);
    });

    it('ELITE enemies must take 0.5 effect and 0.5 duration for Hard CC, and 1.0 for Soft CC', () => {
      const eliteBp = ENEMY_BLUEPRINTS['MAGMA_SLIME']; // ELITE
      const elite: EnemyEntity = {
        id: 'test-elite-cc',
        typeId: eliteBp.typeId,
        name: eliteBp.name,
        x: 100,
        y: 100,
        hp: eliteBp.hp,
        maxHp: eliteBp.hp,
        speed: eliteBp.speed,
        baseSpeed: eliteBp.speed,
        damage: eliteBp.damage,
        attackSpeed: eliteBp.attackSpeed,
        attackCooldown: 1,
        rewardGold: eliteBp.rewardGold,
        movementType: eliteBp.movementType,
        navigationMode: eliteBp.navigationMode,
        pathDistance: 100,
        pathTotalLength: 500,
        elementalProfile: eliteBp.elementalProfile,
        state: 'WALKING',
        engagedBySoldierId: null,
        statusEffects: [],
        tags: [...eliteBp.tags],
        altitude: eliteBp.altitude,
        size: eliteBp.size,
        facing: 0
      };

      // 1. FREEZE on Elite: 1.0s duration -> 0.5s duration
      TargetingRuleEngine.applyStatusEffect(elite, { type: 'FREEZE', duration: 1.0, value: 0 });
      const freezeEff = elite.statusEffects.find((s) => s.type === 'FREEZE');
      expect(freezeEff).toBeDefined();
      expect(freezeEff?.duration).toBe(0.5);

      // 2. SHOCK on Elite: 0.4s duration -> 0.2s duration
      TargetingRuleEngine.applyStatusEffect(elite, { type: 'SHOCK', duration: 0.4, value: 0.35 });
      const shockEff = elite.statusEffects.find((s) => s.type === 'SHOCK');
      expect(shockEff).toBeDefined();
      expect(shockEff?.duration).toBe(0.2);

      // 3. KNOCKBACK on Elite: 20px distance -> 10px distance
      const distKnocked = TargetingRuleEngine.applyKnockback(elite, 20);
      expect(distKnocked).toBe(10);
      expect(elite.pathDistance).toBe(90);

      // 4. SLOW on Elite: 1.0 effect, 1.0 duration
      TargetingRuleEngine.applyStatusEffect(elite, { type: 'SLOW', duration: 3.0, value: 0.35 });
      const slowEff = elite.statusEffects.find((s) => s.type === 'SLOW');
      expect(slowEff).toBeDefined();
      expect(slowEff?.duration).toBe(3.0);
      expect(slowEff?.value).toBe(0.35);
    });

    it('Configurable CC: Custom enemy ccResistance overrides tier default', () => {
      const runnerBp = ENEMY_BLUEPRINTS['STICK_RUNNER'];
      const enemy: EnemyEntity = {
        id: 'test-custom-cc',
        typeId: runnerBp.typeId,
        name: runnerBp.name,
        x: 100,
        y: 100,
        hp: 100,
        maxHp: 100,
        speed: 50,
        baseSpeed: 50,
        damage: 10,
        attackSpeed: 1,
        attackCooldown: 1,
        rewardGold: 10,
        movementType: 'WALK',
        navigationMode: 'GROUND_PATH',
        pathDistance: 100,
        pathTotalLength: 500,
        elementalProfile: runnerBp.elementalProfile,
        state: 'WALKING',
        engagedBySoldierId: null,
        statusEffects: [],
        tags: [],
        altitude: 0,
        size: 15,
        facing: 0,
        ccResistance: {
          hardCC: { effectEfficiency: 0.25, durationEfficiency: 0.25 },
          softCC: { effectEfficiency: 0.75, durationEfficiency: 0.75 }
        }
      };

      const mods = TargetingRuleEngine.getCrowdControlModifiers(enemy);
      expect(mods.hardCC.effectEfficiency).toBe(0.25);
      expect(mods.hardCC.durationEfficiency).toBe(0.25);
      expect(mods.softCC.effectEfficiency).toBe(0.75);
      expect(mods.softCC.durationEfficiency).toBe(0.75);

      // Apply FREEZE (duration 2.0 -> 2.0 * 0.25 = 0.5)
      TargetingRuleEngine.applyStatusEffect(enemy, { type: 'FREEZE', duration: 2.0, value: 0 });
      const freezeEff = enemy.statusEffects.find((s) => s.type === 'FREEZE');
      expect(freezeEff?.duration).toBe(0.5);

      // Apply Knockback (40 * 0.25 = 10)
      const knocked = TargetingRuleEngine.applyKnockback(enemy, 40);
      expect(knocked).toBe(10);
      expect(enemy.pathDistance).toBe(90);
    });
  });

  describe('New Maps, 10 New Enemies & Enemy Skill System Tests', () => {
    it('should have 10 maps in MAPS_CONFIG including Celestial Sanctum and Void Singularity', async () => {
      const { MAPS_CONFIG } = await import('../config/map.config.js');
      expect(MAPS_CONFIG.length).toBe(10);
      const celestial = MAPS_CONFIG.find((m) => m.id === 'celestial_sanctum');
      const voidMap = MAPS_CONFIG.find((m) => m.id === 'void_singularity');

      expect(celestial).toBeDefined();
      expect(celestial?.name).toBe('Thánh Điện Thiên Không');
      expect(celestial?.waves.length).toBe(10);
      expect(celestial?.airLanes?.length).toBe(6);
      expect(celestial?.waterLanes?.length).toBe(2);
      expect(celestial?.groundLanes?.length).toBe(2);
      expect(celestial?.playerBases?.length).toBe(2);

      expect(voidMap).toBeDefined();
      expect(voidMap?.name).toBe('Vực Thẳm Hắc Tinh');
      expect(voidMap?.waves.length).toBe(10);
    });

    it('should have all 10 new enemy blueprints properly configured with valid stats and abilities', async () => {
      const { ENEMY_BLUEPRINTS } = await import('../config/enemies.config.js');
      const newIds = [
        'LIGHT_PALADIN',
        'VOID_SABOTEUR',
        'DRUID_SHAMAN',
        'SERAPH_VALKYRIE',
        'EMP_DRONE',
        'TIDAL_PRIESTESS',
        'ABYSSAL_CRAB',
        'HEX_DEGRADER',
        'ARCHANGEL_MONARCH_BOSS',
        'CHRONO_DESTROYER_BOSS'
      ];

      for (const id of newIds) {
        const bp = ENEMY_BLUEPRINTS[id];
        expect(bp).toBeDefined();
        expect(bp.hp).toBeGreaterThan(0);
        expect(bp.speed).toBeGreaterThan(0);
        expect(bp.damage).toBeGreaterThan(0);
        expect(bp.abilities).toBeDefined();
        expect(bp.abilities!.length).toBeGreaterThan(0);
      }
    });

    it('should test DISABLE_TOWER skill disabling towers from shooting', async () => {
      const { EnemySkillSystem } = await import('../systems/EnemySkillSystem.js');
      const { TowerSystem } = await import('../systems/TowerSystem.js');
      const state = new GameState();
      state.gold = 500;
      const slot = state.towerSlots.find((s) => s.placement === 'ROADSIDE')!;
      state.buildTower(slot.id, 'ARCHER');
      const tower = state.towers[0];
      tower.attackCooldown = 0;

      // Mock enemy with DISABLE_TOWER ability
      const enemy: EnemyEntity = {
        id: 'e-saboteur',
        typeId: 'VOID_SABOTEUR',
        name: 'Kẻ Phá Hoại',
        x: tower.x + 50,
        y: tower.y,
        hp: 150,
        maxHp: 150,
        speed: 50,
        baseSpeed: 50,
        damage: 10,
        attackSpeed: 1,
        attackCooldown: 1,
        rewardGold: 20,
        movementType: 'WALK',
        navigationMode: 'GROUND_PATH',
        pathDistance: 50,
        pathTotalLength: 500,
        elementalProfile: { primaryElement: 'DARK', immunities: [] },
        state: 'WALKING',
        engagedBySoldierId: null,
        statusEffects: [],
        tags: [],
        altitude: 0,
        size: 18,
        facing: 0,
        abilities: [
          { type: 'DISABLE_TOWER', interval: 5.0, radius: 150, value: 1, duration: 4.0 }
        ],
        abilityTimers: [0] // ready to fire immediately
      };

      EnemySkillSystem.update([enemy], state.towers, state, 0.1);
      expect(tower.disabledTimer).toBe(4.0);

      // Verify tower cannot shoot while disabled
      let shotCount = 0;
      TowerSystem.updateTowers(state.towers, [enemy], 0.5, () => {
        shotCount++;
      });
      expect(shotCount).toBe(0);
      expect(tower.disabledTimer).toBe(3.5);
    });

    it('should test DOWNGRADE_TOWER dropping tower tier by 1 and destroying Tier 1 towers', async () => {
      const state = new GameState();
      state.gold = 1000;
      const slot = state.towerSlots.find((s) => s.placement === 'ROADSIDE')!;
      state.buildTower(slot.id, 'BARRACKS');
      const tower = state.towers[0];

      // Upgrade to Tier 2 (max soldiers = 4)
      state.upgradeTower(tower.id);
      expect(tower.tier).toBe(2);
      expect(tower.maxSoldiers).toBe(4);
      expect(state.soldiers.length).toBe(4);

      // Downgrade from Tier 2 -> drops to Tier 1, soldiers reduced back to 3
      const resDowngrade = state.downgradeOrDestroyTower(tower.id);
      expect(resDowngrade).toBe('DOWNGRADED');
      expect(tower.tier).toBe(1);
      expect(tower.maxSoldiers).toBe(3);
      expect(state.soldiers.length).toBe(3);

      // Downgrade from Tier 1 -> DESTROYED completely!
      const resDestroy = state.downgradeOrDestroyTower(tower.id);
      expect(resDestroy).toBe('DESTROYED');
      expect(state.towers.length).toBe(0);
      expect(state.soldiers.length).toBe(0);
      expect(slot.currentTowerId).toBe(null);
    });

    it('should test ARMOR_SHIELD, MAGIC_SHIELD, HEAL_AURA and DAMAGE_REDUCTION_AURA', async () => {
      const { EnemySkillSystem } = await import('../systems/EnemySkillSystem.js');
      const state = new GameState();

      const paladin: EnemyEntity = {
        id: 'e-paladin',
        typeId: 'LIGHT_PALADIN',
        name: 'Paladin',
        x: 100,
        y: 100,
        hp: 200,
        maxHp: 300,
        speed: 30,
        baseSpeed: 30,
        damage: 20,
        attackSpeed: 1,
        attackCooldown: 1,
        rewardGold: 30,
        movementType: 'WALK',
        navigationMode: 'GROUND_PATH',
        pathDistance: 50,
        pathTotalLength: 500,
        elementalProfile: { primaryElement: 'LIGHT', secondaryElement: 'STEEL', immunities: [] },
        state: 'WALKING',
        engagedBySoldierId: null,
        statusEffects: [],
        tags: [],
        altitude: 0,
        size: 20,
        facing: 0,
        armorShield: 0,
        magicShield: 0,
        abilities: [
          { type: 'ARMOR_SHIELD_AURA', interval: 5.0, radius: 100, value: 80 },
          { type: 'HEAL_AURA', interval: 5.0, radius: 100, value: 50 },
          { type: 'DAMAGE_REDUCTION_AURA', interval: 5.0, radius: 100, value: 0.3, duration: 4.0 }
        ],
        abilityTimers: [0, 0, 0] // ready
      };

      // Execute abilities
      EnemySkillSystem.update([paladin], state.towers, state, 0.1);

      // 1. Armor Shield was applied
      expect(paladin.armorShield).toBe(80);

      // 2. Heal was applied (200 + 50 = 250)
      expect(paladin.hp).toBe(250);

      // 3. Damage reduction buff was applied (30% reduction)
      expect(paladin.damageReductionRatio).toBe(0.3);
      expect(paladin.damageReductionTimer).toBe(4.0);

      // 4. Physical damage absorption by Armor Shield
      // 50 Physical damage dealt -> Steel resists Physical (0.5x) * 30% reduction (0.7x) = 17.5 -> 18 damage
      // Absorbed completely by 80 shield!
      const physCalc = TargetingRuleEngine.calculateDamage(
        { amount: 50, element: 'PHYSICAL', sourceId: 'test' },
        paladin
      );
      expect(physCalc.finalDamage).toBe(18);

      const result = TargetingRuleEngine.applyDamageToEnemy(paladin, physCalc, 'PHYSICAL');
      expect(result.shieldAbsorbed).toBe(18);
      expect(result.hpLost).toBe(0);
      expect(paladin.armorShield).toBe(62); // 80 - 18 = 62
      expect(paladin.hp).toBe(250); // HP remained full!

      // 5. Magic shield absorption
      paladin.magicShield = 60;
      const fireCalc = TargetingRuleEngine.calculateDamage(
        { amount: 100, element: 'FIRE', sourceId: 'test' },
        paladin
      );
      // Fire against Light+Steel takes damage, and damageReductionRatio reduces it by 30%
      const magicResult = TargetingRuleEngine.applyDamageToEnemy(paladin, fireCalc, 'FIRE');
      expect(magicResult.shieldAbsorbed).toBe(60);
      expect(paladin.magicShield).toBe(0);
      expect(magicResult.hpLost).toBeGreaterThan(0);
      expect(paladin.hp).toBeLessThan(250);
    });

    it('should verify all 10 maps have 1 unique boss each at Wave 10', async () => {
      const { MAPS_CONFIG } = await import('../config/map.config.js');
      const { ENEMY_BLUEPRINTS } = await import('../config/enemies.config.js');
      expect(MAPS_CONFIG.length).toBe(10);

      const wave10BossIds = MAPS_CONFIG.map((m) => {
        const wave10 = m.waves[9];
        expect(wave10).toBeDefined();
        const bossEnemy = wave10.enemies.find((e) => ENEMY_BLUEPRINTS[e.typeId]?.tags.includes('BOSS'));
        expect(bossEnemy).toBeDefined();
        return bossEnemy!.typeId;
      });

      // Verify all 10 bosses are distinct
      const uniqueBosses = new Set(wave10BossIds);
      expect(uniqueBosses.size).toBe(10);

      // Verify each boss blueprint has skills configured (abilities)
      for (const bossId of uniqueBosses) {
        const bp = ENEMY_BLUEPRINTS[bossId];
        expect(bp).toBeDefined();
        expect(bp.tags).toContain('BOSS');
        expect(bp.abilities).toBeDefined();
        expect(bp.abilities!.length).toBeGreaterThan(0);
      }
    });

    it('should verify EnemySkillSystem handles SUMMON and DEATH_SPAWN abilities', async () => {
      const { EnemySkillSystem } = await import('../systems/EnemySkillSystem.js');
      const { WaveSystem } = await import('../systems/WaveSystem.js');
      const { NavigationSystem } = await import('../systems/NavigationSystem.js');
      const { MAP_VALLEY_ORIGIN } = await import('../config/map.config.js');
      const { GameState } = await import('../core/GameState.js');

      const state = new GameState();
      const waveSys = new WaveSystem(MAP_VALLEY_ORIGIN);
      const navSys = new NavigationSystem(MAP_VALLEY_ORIGIN);

      // 1. Test SUMMON ability via EnemySkillSystem.update
      const summonerEnemy = waveSys.spawnMinionAt('NECRO_WARLOCK', 100, 100, 100, 0)!;
      expect(summonerEnemy).toBeDefined();
      expect(summonerEnemy.abilities).toBeDefined();
      state.enemies = [summonerEnemy];

      // Ready the timer
      summonerEnemy.abilityTimers = summonerEnemy.abilities!.map(() => 0);
      EnemySkillSystem.update(state.enemies, state.towers, state, 0.1, navSys, waveSys, 0);

      // SKELETON_MINION should be spawned into state.enemies
      const minions = state.enemies.filter((e) => e.typeId === 'SKELETON_MINION');
      expect(minions.length).toBe(2);

      // 2. Test DEATH_SPAWN ability via EnemySkillSystem.handleDeath
      EnemySkillSystem.handleDeath(summonerEnemy, state, navSys, waveSys, 0);
      const deathSpawnMinions = state.enemies.filter((e) => e.typeId === 'SKELETON_MINION');
      expect(deathSpawnMinions.length).toBe(4); // 2 from summon + 2 from death spawn
    });

    it('should verify diverse base positions, base counts, and 2 unique extended waves on all 10 maps', async () => {
      const { MAPS_CONFIG, getMapBases } = await import('../config/map.config.js');
      expect(MAPS_CONFIG).toHaveLength(10);

      const baseCounts: Record<string, number> = {};
      for (const map of MAPS_CONFIG) {
        const bases = getMapBases(map);
        expect(bases.length).toBeGreaterThanOrEqual(1);
        expect(bases.length).toBeLessThanOrEqual(3);
        baseCounts[map.id] = bases.length;

        // Every map has exactly 2 unique extended waves configured
        expect(map.extendedWaves).toBeDefined();
        expect(map.extendedWaves).toHaveLength(2);

        // Extended waves have enemies configured
        for (const extWave of map.extendedWaves!) {
          expect(extWave.enemies.length).toBeGreaterThan(0);
          expect(extWave.rewardGold).toBeGreaterThan(150);
        }
      }

      // Check maps with 1 base: valley_origin, serpent_canyon, delta_fortress, frozen_citadel
      expect(baseCounts['valley_origin']).toBe(1);
      expect(baseCounts['serpent_canyon']).toBe(1);
      expect(baseCounts['delta_fortress']).toBe(1);
      expect(baseCounts['frozen_citadel']).toBe(1);

      // Check maps with 2 bases: twin_crossroads, infernal_caldera, plague_morass, celestial_sanctum
      expect(baseCounts['twin_crossroads']).toBe(2);
      expect(baseCounts['infernal_caldera']).toBe(2);
      expect(baseCounts['plague_morass']).toBe(2);
      expect(baseCounts['celestial_sanctum']).toBe(2);

      // Check maps with 3 bases: ancient_necropolis, void_singularity
      expect(baseCounts['ancient_necropolis']).toBe(3);
      expect(baseCounts['void_singularity']).toBe(3);
    });

    it('should verify Boss waves spawn Boss on all traversable lanes and equal minion count', async () => {
      const { MAPS_CONFIG } = await import('../config/map.config.js');
      const { WaveSystem } = await import('../systems/WaveSystem.js');
      const { ENEMY_BLUEPRINTS } = await import('../config/enemies.config.js');

      // Test map with 2 ground lanes: infernal_caldera (Boss is INFERNO_MONARCH_BOSS - GROUND_PATH)
      const caldera = MAPS_CONFIG.find((m) => m.id === 'infernal_caldera')!;
      expect(caldera).toBeDefined();
      const waveSysCaldera = new WaveSystem(caldera, 20);

      // Wave 11: Wave lính
      const wave11 = waveSysCaldera.generateWaveConfig(10, 20);
      const wave11Minions = wave11.enemies.filter((e) => !ENEMY_BLUEPRINTS[e.typeId]?.tags.includes('BOSS'));

      // Wave 15: Wave boss
      const wave15 = waveSysCaldera.generateWaveConfig(14, 20);
      const wave15Minions = wave15.enemies.filter((e) => !ENEMY_BLUEPRINTS[e.typeId]?.tags.includes('BOSS'));
      const wave15Bosses = wave15.enemies.filter((e) => ENEMY_BLUEPRINTS[e.typeId]?.tags.includes('BOSS'));

      // 1. Minion count of boss wave is equal to minion wave
      expect(wave15Minions.length).toBe(wave11Minions.length);
      for (let i = 0; i < wave15Minions.length; i++) {
        expect(wave15Minions[i].count).toBe(wave11Minions[i].count);
      }

      // 2. Boss appears on all traversable lanes (2 ground lanes -> 2 bosses for n = 1)
      expect(wave15Bosses.length).toBeGreaterThan(0);
      const totalBossCount = wave15Bosses.reduce((acc, b) => acc + b.count, 0);
      expect(totalBossCount).toBe(2); // 2 ground lanes * n(1)

      // 3. Test spawning verification: bosses spawn on different lanes (0 and 1)
      waveSysCaldera.startWave(15);
      const spawnedEnemies: any[] = [];
      for (let i = 0; i < 20; i++) {
        waveSysCaldera.update(1.0, (enemy) => spawnedEnemies.push(enemy), () => {}, 0);
      }

      const spawnedBosses = spawnedEnemies.filter((e) => ENEMY_BLUEPRINTS[e.typeId]?.tags.includes('BOSS'));
      if (spawnedBosses.length >= 2) {
        const bossLanes = new Set(spawnedBosses.map((b) => b.laneIndex));
        expect(bossLanes.has(0)).toBe(true);
        expect(bossLanes.has(1)).toBe(true);
      }
    });
  });

  describe('SoundSystem & Audio Event Integration Tests', () => {
    it('should manage sound enabled and volume clamping cleanly', () => {
      SoundSystem.setEnabled(false);
      expect(SoundSystem.soundEnabled).toBe(false);

      SoundSystem.setEnabled(true);
      expect(SoundSystem.soundEnabled).toBe(true);

      SoundSystem.setVolume(1.5); // clamped to 1.0
      expect(SoundSystem.soundVolume).toBe(1.0);

      SoundSystem.setVolume(-0.2); // clamped to 0.0
      expect(SoundSystem.soundVolume).toBe(0.0);

      SoundSystem.setVolume(0.7);
      expect(SoundSystem.soundVolume).toBe(0.7);
    });

    it('should record procedural SFX trigger calls across all categories', () => {
      SoundSystem.recordedEvents = [];

      // Combat shooting & attacks
      SoundSystem.playShoot('ARCHER');
      SoundSystem.playShoot('MAGE');
      SoundSystem.playShoot('ARTILLERY');
      SoundSystem.playShoot('JAVELIN');

      // Hits & reactions
      SoundSystem.playHit({ isMelee: true });
      SoundSystem.playHit({ isImmune: true });
      SoundSystem.playHit({ isReactionOrWeakness: true });

      // Traps & Explosions
      SoundSystem.playExplosion('LARGE');
      SoundSystem.playTrapTrigger('TRAP_SPIKE');
      SoundSystem.playTrapTrigger('TRAP_FIRE');
      SoundSystem.playTrapTrigger('TRAP_FROST');
      SoundSystem.playTrapTrigger('TRAP_NET');

      // Casualties & Damage
      SoundSystem.playEnemyDeath('NORMAL');
      SoundSystem.playEnemyDeath('ELITE');
      SoundSystem.playEnemyDeath('BOSS');
      SoundSystem.playSoldierDeath();
      SoundSystem.playBaseDamaged(true);
      SoundSystem.playTowerDamaged('DISABLED');
      SoundSystem.playTowerDamaged('DOWNGRADED');
      SoundSystem.playTowerDamaged('DESTROYED');

      // Skills & Match Progress
      SoundSystem.playEnemySkill('SUMMON');
      SoundSystem.playEnemySkill('SPLIT');
      SoundSystem.playWaveStart();
      SoundSystem.playWaveComplete();
      SoundSystem.playVictory();
      SoundSystem.playGameOver();

      const eventNames = SoundSystem.recordedEvents.map((e) => e.sound);
      expect(eventNames).toContain('SHOOT');
      expect(eventNames).toContain('HIT');
      expect(eventNames).toContain('EXPLOSION');
      expect(eventNames).toContain('TRAP_TRIGGER');
      expect(eventNames).toContain('ENEMY_DEATH');
      expect(eventNames).toContain('SOLDIER_DEATH');
      expect(eventNames).toContain('BASE_DAMAGED');
      expect(eventNames).toContain('TOWER_DAMAGED');
      expect(eventNames).toContain('ENEMY_SKILL');
      expect(eventNames).toContain('WAVE_START');
      expect(eventNames).toContain('WAVE_COMPLETE');
      expect(eventNames).toContain('VICTORY');
      expect(eventNames).toContain('GAME_OVER');
    });

    it('should trigger corresponding audio events from GameState actions', () => {
      const state = new GameState();
      state.gold = 1000;
      SoundSystem.recordedEvents = [];

      // 1. Build tower -> BUILD
      state.buildTowerAt(150, 95, 'ARCHER');
      const tower = state.towers[0];
      expect(SoundSystem.recordedEvents.some((e) => e.sound === 'BUILD')).toBe(true);

      // 2. Upgrade tower -> UPGRADE
      SoundSystem.recordedEvents = [];
      state.upgradeTower(tower.id);
      expect(SoundSystem.recordedEvents.some((e) => e.sound === 'UPGRADE')).toBe(true);

      // 3. Imbue element -> IMBUE
      SoundSystem.recordedEvents = [];
      state.setTowerElement(tower.id, 'FIRE');
      expect(SoundSystem.recordedEvents.some((e) => e.sound === 'IMBUE')).toBe(true);

      // 4. Downgrade tower -> TOWER_DAMAGED (DOWNGRADED)
      SoundSystem.recordedEvents = [];
      state.downgradeOrDestroyTower(tower.id);
      const downgradeEvt = SoundSystem.recordedEvents.find((e) => e.sound === 'TOWER_DAMAGED');
      expect(downgradeEvt?.data?.severity).toBe('DOWNGRADED');

      // 5. Destroy tower -> TOWER_DAMAGED (DESTROYED)
      SoundSystem.recordedEvents = [];
      state.downgradeOrDestroyTower(tower.id);
      const destroyEvt = SoundSystem.recordedEvents.find((e) => e.sound === 'TOWER_DAMAGED');
      expect(destroyEvt?.data?.severity).toBe('DESTROYED');

      // 6. Barracks & Rally
      SoundSystem.recordedEvents = [];
      state.buildTowerAt(150, 95, 'BARRACKS');
      const barracks = state.towers[0];
      state.setBarracksSoldierMode(barracks.id, 'RANGED');
      expect(SoundSystem.recordedEvents.some((e) => e.sound === 'RALLY')).toBe(true);

      // 7. Sell tower -> SELL
      SoundSystem.recordedEvents = [];
      state.sellTower(barracks.id);
      expect(SoundSystem.recordedEvents.some((e) => e.sound === 'SELL')).toBe(true);
    });

    it('should trigger audio events from EnemySkillSystem (Disable, Summon, Split)', () => {
      const state = new GameState();
      state.gold = 500;
      state.buildTowerAt(150, 95, 'ARCHER');
      const tower = state.towers[0];

      SoundSystem.recordedEvents = [];
      const enemy: EnemyEntity = {
        id: 'e-boss',
        typeId: 'ANCIENT_TREANT_BOSS',
        name: 'Treant',
        x: 150,
        y: 110,
        hp: 1000,
        maxHp: 1000,
        speed: 20,
        baseSpeed: 20,
        damage: 30,
        attackSpeed: 1,
        attackCooldown: 1,
        rewardGold: 100,
        movementType: 'WALK',
        navigationMode: 'GROUND_PATH',
        pathDistance: 100,
        pathTotalLength: 1000,
        elementalProfile: { primaryElement: 'GRASS', immunities: [] },
        state: 'WALKING',
        engagedBySoldierId: null,
        statusEffects: [],
        tags: ['BOSS'],
        altitude: 0,
        size: 25,
        facing: 0,
        abilities: [
          { type: 'DISABLE_TOWER', radius: 150, duration: 4.0 },
          { type: 'DEATH_SPAWN', spawnTypeId: 'STICK_RUNNER', count: 2 }
        ]
      };

      // Test DISABLE_TOWER skill
      (EnemySkillSystem as any).executeAbility(enemy, enemy.abilities![0], [enemy], [tower], state);
      expect(tower.disabledTimer).toBeGreaterThan(0);
      const disableEvt = SoundSystem.recordedEvents.find((e) => e.sound === 'TOWER_DAMAGED');
      expect(disableEvt?.data?.severity).toBe('DISABLED');

      // Test DEATH_SPAWN split
      const navSys = new NavigationSystem(state.currentMap);
      const waveSys = new WaveSystem(state.currentMap, 15);
      SoundSystem.recordedEvents = [];
      EnemySkillSystem.handleDeath(enemy, state, navSys, waveSys, 0);
      const splitEvt = SoundSystem.recordedEvents.find((e) => e.sound === 'ENEMY_SKILL');
      expect(splitEvt?.data?.skill).toBe('SPLIT');
    });

    it('should persist and load sound settings through StorageService', async () => {
      const { StorageService } = await import('../core/StorageService.js');
      StorageService.clear();

      // Test sanitization with sound settings
      const sanitized = StorageService.sanitizeSettings({
        soundEnabled: false,
        soundVolume: 0.35
      });
      expect(sanitized.soundEnabled).toBe(false);
      expect(sanitized.soundVolume).toBe(0.35);

      // Test save and load
      StorageService.saveSettings({
        soundEnabled: true,
        soundVolume: 0.8
      });
      const loaded = StorageService.loadSettings();
      expect(loaded.soundEnabled).toBe(true);
      expect(loaded.soundVolume).toBe(0.8);

      StorageService.clear();
    });
  });
});

