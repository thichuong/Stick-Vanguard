import { describe, it, expect } from 'vitest';
import { ENEMY_BLUEPRINTS } from '../config/enemies.config.js';
import { EnemyArchetypeRenderer, EnemyVisualArchetype } from '../render/EnemyArchetypeRenderer.js';
import { StickmanRenderer } from '../render/StickmanRenderer.js';
import { EnemyEntity } from '../types/entities.types.js';

describe('EnemyArchetypeRenderer - Stick Creature Archetypes', () => {
  it('should map every enemy blueprint to a valid stick creature archetype', () => {
    const validArchetypes: EnemyVisualArchetype[] = [
      'HUMANOID',
      'DRAGON',
      'SERPENT',
      'AVIAN_BAT',
      'ARACHNID',
      'TURTLE_BEAST',
      'SLIME_CRYSTAL',
      'COLOSSUS',
      'WRAITH_REAPER',
      'SIREN'
    ];

    const archetypeCounts: Record<EnemyVisualArchetype, number> = {
      HUMANOID: 0,
      DRAGON: 0,
      SERPENT: 0,
      AVIAN_BAT: 0,
      ARACHNID: 0,
      TURTLE_BEAST: 0,
      SLIME_CRYSTAL: 0,
      COLOSSUS: 0,
      WRAITH_REAPER: 0,
      SIREN: 0
    };

    for (const [typeId, bp] of Object.entries(ENEMY_BLUEPRINTS)) {
      const mockEnemy = {
        id: `mock_${typeId}`,
        typeId,
        name: bp.name,
        x: 100,
        y: 100,
        hp: bp.hp,
        maxHp: bp.hp,
        speed: bp.speed,
        baseSpeed: bp.speed,
        damage: bp.damage,
        attackSpeed: bp.attackSpeed,
        attackCooldown: 0,
        rewardGold: bp.rewardGold,
        movementType: bp.movementType,
        navigationMode: bp.navigationMode,
        pathDistance: 0,
        pathTotalLength: 500,
        elementalProfile: bp.elementalProfile,
        state: 'WALKING',
        engagedBySoldierId: null,
        statusEffects: [],
        tags: bp.tags,
        altitude: bp.altitude,
        size: bp.size,
        facing: 0
      } as EnemyEntity;

      const archetype = EnemyArchetypeRenderer.getArchetype(mockEnemy);
      expect(validArchetypes).toContain(archetype);
      archetypeCounts[archetype]++;
    }

    // Verify key monster archetypes are covered
    expect(archetypeCounts.DRAGON).toBeGreaterThanOrEqual(4); // Dark Dragon Boss, Wyvern Raider, Drake Warrior, River Drake
    expect(archetypeCounts.SERPENT).toBeGreaterThanOrEqual(3); // Aqua Serpent, Spark Eel, Void Hydra Boss
    expect(archetypeCounts.AVIAN_BAT).toBeGreaterThanOrEqual(3); // Winged Gargoyle, Toxic Bat, Fairy Sprite
    expect(archetypeCounts.ARACHNID).toBeGreaterThanOrEqual(1); // Venom Arachnid
    expect(archetypeCounts.TURTLE_BEAST).toBeGreaterThanOrEqual(2); // Moss Turtle, Plague Leviathan
    expect(archetypeCounts.SLIME_CRYSTAL).toBeGreaterThanOrEqual(3); // Magma Slime, Ember Blob, Ice Shardling
    expect(archetypeCounts.COLOSSUS).toBeGreaterThanOrEqual(3); // Rock Golem, Frost Golem, Iron Colossus
    expect(archetypeCounts.WRAITH_REAPER).toBeGreaterThanOrEqual(3); // Shadow Wraith, Phantom Reaper, Spectral Banshee
    expect(archetypeCounts.SIREN).toBeGreaterThanOrEqual(1); // Storm Caller Siren
    expect(archetypeCounts.HUMANOID).toBeGreaterThanOrEqual(5); // Runners, Warriors, Warlocks, Imps, Treants, etc.
  });

  it('should render all 30 enemy types without throwing canvas context exceptions', () => {
    // Lightweight mock canvas 2D context
    const mockCtx = {
      save: () => {},
      restore: () => {},
      translate: () => {},
      scale: () => {},
      rotate: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      quadraticCurveTo: () => {},
      bezierCurveTo: () => {},
      arc: () => {},
      ellipse: () => {},
      strokeRect: () => {},
      stroke: () => {},
      fill: () => {},
      strokeStyle: '#ffffff',
      fillStyle: '#ffffff',
      lineWidth: 1,
      lineCap: 'round',
      lineJoin: 'round'
    } as unknown as CanvasRenderingContext2D;

    for (const [typeId, bp] of Object.entries(ENEMY_BLUEPRINTS)) {
      const mockEnemy = {
        id: `mock_${typeId}`,
        typeId,
        name: bp.name,
        x: 100,
        y: 100,
        hp: bp.hp,
        maxHp: bp.hp,
        speed: bp.speed,
        baseSpeed: bp.speed,
        damage: bp.damage,
        attackSpeed: bp.attackSpeed,
        attackCooldown: 0,
        rewardGold: bp.rewardGold,
        movementType: bp.movementType,
        navigationMode: bp.navigationMode,
        pathDistance: 0,
        pathTotalLength: 500,
        elementalProfile: bp.elementalProfile,
        state: 'ATTACKING',
        engagedBySoldierId: null,
        statusEffects: [],
        tags: bp.tags,
        altitude: bp.altitude,
        size: bp.size,
        facing: Math.PI / 4 // 45 deg facing right
      } as EnemyEntity;

      expect(() => {
        EnemyArchetypeRenderer.renderEnemyBody(
          mockCtx,
          mockEnemy,
          1.5,
          '#ef4444',
          '#3b82f6'
        );
      }).not.toThrow();

      // Facing left
      mockEnemy.facing = -Math.PI * 0.75;
      expect(() => {
        EnemyArchetypeRenderer.renderEnemyBody(
          mockCtx,
          mockEnemy,
          2.0,
          '#ef4444',
          '#3b82f6'
        );
      }).not.toThrow();
    }
  });

  it('should provide archetype metadata and icons for all 30 enemies', () => {
    for (const [typeId] of Object.entries(ENEMY_BLUEPRINTS)) {
      const info = EnemyArchetypeRenderer.getArchetypeInfo({ typeId });
      expect(info.name).toBeDefined();
      expect(info.icon).toBeDefined();
      expect(info.description).toBeDefined();
      expect(info.name.length).toBeGreaterThan(0);
      expect(info.icon.length).toBeGreaterThan(0);
    }
  });

  it('should render through StickmanRenderer.renderEnemy matching Codex usage for all 30 enemies', () => {
    const mockCtx = {
      save: () => {},
      restore: () => {},
      translate: () => {},
      scale: () => {},
      rotate: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      quadraticCurveTo: () => {},
      bezierCurveTo: () => {},
      arc: () => {},
      ellipse: () => {},
      strokeRect: () => {},
      fillRect: () => {},
      fillText: () => {},
      stroke: () => {},
      fill: () => {},
      strokeStyle: '#ffffff',
      fillStyle: '#ffffff',
      lineWidth: 1,
      lineCap: 'round',
      lineJoin: 'round',
      globalAlpha: 1,
      font: '12px sans-serif'
    } as unknown as CanvasRenderingContext2D;

    for (const [, bp] of Object.entries(ENEMY_BLUEPRINTS)) {
      const isFlying = bp.movementType === 'FLY';
      const isSwimmer = bp.movementType === 'SWIM';

      // Recreate exact Codex mock object
      const codexMockEnemy = {
        id: 'preview',
        typeId: bp.typeId,
        type: bp.typeId,
        name: bp.name,
        x: 120,
        y: 140,
        size: bp.size,
        altitude: isFlying ? 24 : 0,
        movementType: bp.movementType,
        navigationMode: bp.navigationMode,
        elementalProfile: bp.elementalProfile,
        tags: bp.tags || [],
        hp: bp.hp,
        maxHp: bp.hp,
        speed: bp.speed,
        baseSpeed: bp.speed,
        damage: bp.damage,
        attackSpeed: bp.attackSpeed,
        attackCooldown: 0,
        rewardGold: bp.rewardGold,
        pathDistance: 0,
        pathTotalLength: 100,
        state: isFlying ? 'FLYING' : isSwimmer ? 'SWIMMING' : 'WALKING',
        engagedBySoldierId: null,
        statusEffects: [],
        facing: 0
      } as unknown as EnemyEntity;

      expect(() => {
        StickmanRenderer.renderEnemy(mockCtx, codexMockEnemy, 1.2);
      }).not.toThrow();

      // Test attack cycle
      codexMockEnemy.state = 'ATTACKING';
      expect(() => {
        StickmanRenderer.renderEnemy(mockCtx, codexMockEnemy, 3.5);
      }).not.toThrow();
    }
  });
});

