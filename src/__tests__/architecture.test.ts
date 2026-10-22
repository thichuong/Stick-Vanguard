import { describe, it, expect } from 'vitest';
import { NavigationSystem } from '../systems/NavigationSystem.js';
import { TargetingRuleEngine } from '../systems/TargetingRuleEngine.js';
import { GameState } from '../core/GameState.js';
import { ENEMY_BLUEPRINTS } from '../config/enemies.config.js';
import { TOWER_BLUEPRINTS } from '../config/towers.config.js';
import { EnemyEntity } from '../types/entities.types.js';
import { DamagePayload } from '../types/elements.types.js';

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
        elementalProfile: runnerBp.elementalProfile,
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

    it('should support dual-element enemy matchup calculation', () => {
      // MAGMA_SLIME is FIRE + EARTH
      const slimeBp = ENEMY_BLUEPRINTS['MAGMA_SLIME'];
      expect(slimeBp.elementalProfile.secondaryElement).toBe('EARTH');
      expect(slimeBp.deathSpawn).toBeDefined();
      expect(slimeBp.deathSpawn?.typeId).toBe('EMBER_BLOB');
      expect(slimeBp.deathSpawn?.count).toBe(2);
    });

    it('should support summoner enemy blueprint config', () => {
      // NECRO_WARLOCK summons SKELETON_MINION and spawns on death
      const warlockBp = ENEMY_BLUEPRINTS['NECRO_WARLOCK'];
      expect(warlockBp.summonConfig).toBeDefined();
      expect(warlockBp.summonConfig?.typeId).toBe('SKELETON_MINION');
      expect(warlockBp.deathSpawn?.typeId).toBe('SKELETON_MINION');
      expect(warlockBp.elementalProfile.secondaryElement).toBe('ICE');
    });

    it('should scale waves procedurally up to any configured wave count', async () => {
      const { WaveSystem } = await import('../systems/WaveSystem.js');
      const waveSys = new WaveSystem();
      waveSys.setTotalWaves(25);
      expect(waveSys.getTotalWaves()).toBe(25);

      const wave1 = waveSys.generateWaveConfig(0, 25);
      expect(wave1.waveNumber).toBe(1);

      const wave15 = waveSys.generateWaveConfig(14, 25);
      expect(wave15.waveNumber).toBe(15);
      // Wave 15 is a milestone boss wave
      expect(wave15.enemies.some((e) => e.typeId.includes('BOSS'))).toBe(true);

      const wave25 = waveSys.generateWaveConfig(24, 25);
      expect(wave25.waveNumber).toBe(25);
      // Final wave has final bosses
      expect(wave25.enemies.some((e) => e.typeId === 'VOID_HYDRA_BOSS')).toBe(true);
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
        elementalProfile: runnerBp.elementalProfile,
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
});

