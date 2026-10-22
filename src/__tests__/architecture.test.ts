import { describe, it, expect } from 'vitest';
import { NavigationSystem } from '../systems/NavigationSystem.js';
import { TargetingRuleEngine } from '../systems/TargetingRuleEngine.js';
import { GameState } from '../core/GameState.js';
import { ENEMY_BLUEPRINTS } from '../config/enemies.config.js';
import { TOWER_BLUEPRINTS } from '../config/towers.config.js';
import { EnemyEntity } from '../types/entities.types.js';

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

      // Golem is immune to physical, but takes 1.75x from water!
      expect(hybridRes.isImmune).toBe(false);
      expect(hybridRes.finalDamage).toBeGreaterThan(0);
      expect(hybridRes.finalDamage).toBe(Math.round(30 * 1.75));
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
  });
});

