import {
  EnemyEntity,
  FloatingText,
  Particle,
  ProjectileEntity,
  SoldierEntity,
  SoldierCombatMode,
  TowerEntity,
  TowerSlot,
  TowerType,
  TowerBranch,
  Vector2D,
  PlacementType,
  BuildCursorTarget
} from '../types/entities.types.js';
import { ElementType, MagicalElementType } from '../types/elements.types.js';
import {
  MAPS_CONFIG,
  MapConfig,
  getDistanceToPolylines,
  getMapBases,
  getResolvedGroundLanes,
  getResolvedWaterLanes,
  getUniqueLaneSpawns
} from '../config/map.config.js';
import { TOWER_BLUEPRINTS, TowerBlueprint } from '../config/towers.config.js';
import {
  ELEMENT_IMBUE_COST,
  MAGE_SECOND_ELEMENT_COST,
  ELEMENT_NAMES
} from '../config/elements.config.js';
import { StorageService } from './StorageService.js';
import { SoundSystem } from '../systems/SoundSystem.js';
import { particlePool, floatingTextPool } from './ObjectPool.js';
import { WasmBridge } from './WasmBridge.js';

export class GameState {
  public gold: number = 320;
  public lives: number = 20;
  public maxLives: number = 20;
  public gameSpeed: number = 1;
  public isPaused: boolean = false;
  public isGameOver: boolean = false;
  public isVictory: boolean = false;

  // Custom Game Settings
  public customTotalWaves: number = 15;
  public goldMultiplier: number = 1.0;   // 0.1 to 10.0
  public damageMultiplier: number = 1.0; // 0.1 to 10.0

  // Sound Settings
  public soundEnabled: boolean = true;
  public soundVolume: number = 0.7; // 0.0 to 1.0

  public currentMapId: string = MAPS_CONFIG[0].id;
  public currentMap: MapConfig = MAPS_CONFIG[0];

  public towerSlots: TowerSlot[] = [];
  public towers: TowerEntity[] = [];
  public soldiers: SoldierEntity[] = [];
  public enemies: EnemyEntity[] = [];
  public projectiles: ProjectileEntity[] = [];
  public floatingTexts: FloatingText[] = [];
  public particles: Particle[] = [];

  public selectedSlotId: string | null = null;
  public selectedTowerId: string | null = null;
  public selectedBuildPoint: BuildCursorTarget | null = null;
  public isSettingRallyPoint: boolean = false;
  public activePlacementType: TowerType | null = null;
  public hoveredSlotId: string | null = null;
  public hoveredTowerId: string | null = null;
  public hoveredBuildTowerType: TowerType | null = null;
  public mousePos: Vector2D = { x: 0, y: 0 };

  private towerIdCounter = 0;
  private soldierIdCounter = 0;

  constructor() {
    this.reset();
  }

  public setMap(mapId: string): void {
    const found = MAPS_CONFIG.find((m) => m.id === mapId);
    if (found) {
      this.currentMapId = found.id;
      this.currentMap = found;
      this.reset();
    }
  }

  public reset(): void {
    this.gold = 320;
    this.lives = 20;
    // Keep user's gameSpeed preference instead of hard resetting to 1
    if (this.gameSpeed !== 1 && this.gameSpeed !== 2) {
      this.gameSpeed = 1;
    }
    this.isPaused = false;
    this.isGameOver = false;
    this.isVictory = false;
    this.selectedSlotId = null;
    this.selectedTowerId = null;
    this.selectedBuildPoint = null;
    this.isSettingRallyPoint = false;
    this.activePlacementType = null;
    this.hoveredSlotId = null;
    this.hoveredTowerId = null;
    this.hoveredBuildTowerType = null;

    // Default fallback roadside slots for backward compatibility in tests
    this.towerSlots = [
      { id: 'slot-r1', x: 150, y: 105, placement: 'ROADSIDE', currentTowerId: null },
      { id: 'slot-r2', x: 230, y: 245, placement: 'ROADSIDE', currentTowerId: null },
      { id: 'slot-r3', x: 235, y: 365, placement: 'ROADSIDE', currentTowerId: null }
    ];
    this.towers = [];
    this.soldiers = [];
    this.enemies = [];
    this.projectiles = [];
    this.floatingTexts = [];
    this.particles = [];
    this.syncToWasm();
  }

  public syncToWasm(): void {
    try {
      const bridge = WasmBridge.getInstance();
      if (bridge.isAvailable()) {
        bridge.syncTowersAndSoldiers(this.towers, this.soldiers, this.gold, this.lives);
      }
    } catch {
      // Ignored if wasm is not available
    }
  }

  public getSelectedSlot(): TowerSlot | null {
    return this.towerSlots.find((s) => s.id === this.selectedSlotId) || null;
  }

  public getSelectedTower(): TowerEntity | null {
    return this.towers.find((t) => t.id === this.selectedTowerId) || null;
  }

  /**
   * Validate free placement condition for a given coordinate (x, y)
   */
  public validatePlacement(
    x: number,
    y: number,
    type: TowerType | 'TOWER_GENERIC' | 'TRAP_GENERIC'
  ): { valid: boolean; placement: PlacementType; reason?: string } {
    const isTrap = type === 'TRAP_GENERIC' || type.startsWith('TRAP_');
    const width = this.currentMap.width || 1000;
    const height = this.currentMap.height || 650;

    // 1. Boundary check
    const margin = 26;
    if (x < margin || x > width - margin || y < margin || y > height - margin) {
      return { valid: false, placement: 'ROADSIDE', reason: 'Vị trí nằm ngoài phạm vi chiến trường!' };
    }

    // 2. Base & Spawn zone clearance
    const allBases = getMapBases(this.currentMap);
    for (const base of allBases) {
      const distToBase = Math.hypot(x - base.x, y - base.y);
      if (distToBase < (base.radius || 42) + 14) {
        return { valid: false, placement: 'ROADSIDE', reason: 'Quá gần căn cứ trung tâm!' };
      }
    }

    const allGroundSpawns = getUniqueLaneSpawns(this.currentMap.groundLanes);
    for (const sp of allGroundSpawns) {
      if (Math.hypot(x - sp.x, y - sp.y) < 30) {
        return { valid: false, placement: 'ROADSIDE', reason: 'Quá gần cổng quái xuất phát!' };
      }
    }

    const allWaterSpawns = getUniqueLaneSpawns(this.currentMap.waterLanes);
    for (const sp of allWaterSpawns) {
      if (Math.hypot(x - sp.x, y - sp.y) < 30) {
        return { valid: false, placement: 'ROADSIDE', reason: 'Quá gần cổng thủy quái!' };
      }
    }

    // 3. Distance to Road & River (Multi-lane aware, dynamically resolved to bases)
    const allGroundLanes = getResolvedGroundLanes(this.currentMap);
    const allWaterLanes = getResolvedWaterLanes(this.currentMap);

    const roadRes = getDistanceToPolylines(x, y, allGroundLanes);
    const riverRes = getDistanceToPolylines(x, y, allWaterLanes);

    const roadHalfWidth = 22; // Road half width
    const riverHalfWidth = 20; // River half width

    const isOnRoad = roadRes.distance <= roadHalfWidth;
    const isOnRiver = riverRes.distance <= riverHalfWidth;

    // 4. Overlap with existing towers or traps
    const minDistanceToOther = isTrap ? 26 : 34;
    for (const existing of this.towers) {
      const d = Math.hypot(x - existing.x, y - existing.y);
      if (d < minDistanceToOther) {
        return { valid: false, placement: isTrap ? 'PATH_TRAP' : 'ROADSIDE', reason: 'Quá gần công trình khác!' };
      }
    }

    // 5. Check type-specific conditions
    if (isTrap) {
      // TRAP CONDITION: Must be ON THE ROAD or ON THE RIVER
      if (!isOnRoad && !isOnRiver) {
        return {
          valid: false,
          placement: 'PATH_TRAP',
          reason: 'Bẫy phải đặt trên đường hoặc trên sông!'
        };
      }
      const placement: PlacementType = isOnRiver ? 'WATER_TRAP' : 'PATH_TRAP';
      return { valid: true, placement };
    } else {
      // TOWER CONDITION: Must NOT be ON THE ROAD (and not in the river)
      if (roadRes.distance < roadHalfWidth + 14) {
        return {
          valid: false,
          placement: 'ROADSIDE',
          reason: 'Tháp không được đặt trên đường!'
        };
      }
      if (riverRes.distance < riverHalfWidth + 14) {
        return {
          valid: false,
          placement: 'ROADSIDE',
          reason: 'Tháp không được đặt dưới dòng sông!'
        };
      }
      return { valid: true, placement: 'ROADSIDE' };
    }
  }

  /**
   * Free-form placement of a tower or trap at coordinate (x, y)
   */
  public buildTowerAt(x: number, y: number, type: TowerType): boolean {
    const blueprintKey = type.startsWith('TRAP_') ? type : `${type}_1`;
    const bp: TowerBlueprint | undefined = TOWER_BLUEPRINTS[blueprintKey];
    if (!bp) return false;

    // Validate placement rules
    const validation = this.validatePlacement(x, y, type);
    if (!validation.valid) {
      SoundSystem.playError();
      this.addFloatingText(validation.reason || 'Vị trí không hợp lệ!', x, y - 10, '#ef4444');
      return false;
    }

    if (this.gold < bp.cost) {
      SoundSystem.playError();
      this.addFloatingText('Không đủ vàng!', x, y - 10, '#ef4444');
      return false;
    }

    this.gold -= bp.cost;
    this.towerIdCounter++;
    const towerId = `tower-${this.towerIdCounter}`;

    let rallyPoint: Vector2D | undefined;
    let soldierIds: string[] | undefined;

    // For Summon towers (Barracks, Dragon Nest, Fairy Tree, Heroic Altar), find closest point on nearest road lane
    const isSummonTower =
      bp.type === 'BARRACKS' ||
      bp.type === 'DRAGON_NEST' ||
      bp.type === 'FAIRY_TREE' ||
      bp.type === 'HEROIC_ALTAR';

    if (isSummonTower) {
      const allGroundLanes = getResolvedGroundLanes(this.currentMap);
      const roadRes = getDistanceToPolylines(x, y, allGroundLanes);
      const distToClosest = Math.hypot(roadRes.closestPoint.x - x, roadRes.closestPoint.y - y);

      if (distToClosest <= bp.range) {
        rallyPoint = { ...roadRes.closestPoint };
      } else {
        // Clamp towards closest road point within tower range
        const angle = Math.atan2(roadRes.closestPoint.y - y, roadRes.closestPoint.x - x);
        rallyPoint = {
          x: Math.round(x + Math.cos(angle) * (bp.range - 10)),
          y: Math.round(y + Math.sin(angle) * (bp.range - 10))
        };
      }

      if (bp.type === 'BARRACKS') {
        soldierIds = [];
        for (let i = 0; i < (bp.maxSoldiers || 3); i++) {
          this.soldierIdCounter++;
          const soldierId = `soldier-${this.soldierIdCounter}`;
          soldierIds.push(soldierId);

          const offsetAngle = (i / 3) * Math.PI * 2;
          const initialX = rallyPoint.x + Math.cos(offsetAngle) * 12;
          const initialY = rallyPoint.y + Math.sin(offsetAngle) * 12;

          this.soldiers.push({
            id: soldierId,
            towerId,
            name: `Lính ${i + 1}`,
            archetype: 'SOLDIER',
            x: initialX,
            y: initialY,
            hp: bp.soldierHp || 100,
            maxHp: bp.soldierHp || 100,
            baseMaxHp: bp.soldierHp || 100,
            damage: bp.damage,
            baseDamage: bp.damage,
            attackSpeed: bp.fireRate,
            attackCooldown: 0.5,
            element: 'PHYSICAL',
            secondaryElement: null,
            combatMode: 'MELEE',
            state: 'IDLE',
            engagedEnemyId: null,
            rallyPoint: { x: initialX, y: initialY },
            targetPos: { x: initialX, y: initialY },
            armor: bp.soldierArmor || 0.1,
            baseArmor: bp.soldierArmor || 0.1,
            magicResist: 0.1,
            respawnTimer: 0,
            respawnDelay: bp.soldierRespawn || 8,
            soldierRegen: bp.soldierRegen || 0,
            tier: 1,
            rangedRange: 145
          });
        }
      } else if (bp.type === 'DRAGON_NEST') {
        soldierIds = [];
        this.soldierIdCounter++;
        const soldierId = `dragon-${this.soldierIdCounter}`;
        soldierIds.push(soldierId);

        this.soldiers.push({
          id: soldierId,
          towerId,
          name: 'Hỏa Long',
          archetype: 'DRAGON',
          canBlockAir: true,
          canTargetAir: true,
          canTargetSwim: true,
          aoeRadius: bp.aoeRadius || 55,
          x: rallyPoint.x,
          y: rallyPoint.y,
          hp: bp.soldierHp || 220,
          maxHp: bp.soldierHp || 220,
          baseMaxHp: bp.soldierHp || 220,
          damage: bp.damage,
          baseDamage: bp.damage,
          attackSpeed: bp.fireRate,
          attackCooldown: 0.5,
          element: 'DRAGON',
          secondaryElement: 'FIRE',
          combatMode: 'MELEE',
          state: 'IDLE',
          facing: 0,
          engagedEnemyId: null,
          rallyPoint: { x: rallyPoint.x, y: rallyPoint.y },
          targetPos: { x: rallyPoint.x, y: rallyPoint.y },
          armor: bp.soldierArmor || 0.2,
          baseArmor: bp.soldierArmor || 0.2,
          magicResist: 0.2,
          respawnTimer: 0,
          respawnDelay: bp.soldierRespawn || 9,
          soldierRegen: bp.soldierRegen || 0,
          tier: 1
        });
      } else if (bp.type === 'FAIRY_TREE') {
        soldierIds = [];
        const count = bp.maxSoldiers || 2;
        for (let i = 0; i < count; i++) {
          this.soldierIdCounter++;
          const soldierId = `fairy-${this.soldierIdCounter}`;
          soldierIds.push(soldierId);

          const offsetAngle = (i / count) * Math.PI * 2;
          const initialX = rallyPoint.x + Math.cos(offsetAngle) * 14;
          const initialY = rallyPoint.y + Math.sin(offsetAngle) * 14;

          this.soldiers.push({
            id: soldierId,
            towerId,
            name: `Tiên ${i + 1}`,
            archetype: 'FAIRY',
            canBlockAir: true,
            canTargetAir: true,
            canTargetSwim: true,
            x: initialX,
            y: initialY,
            hp: bp.soldierHp || 80,
            maxHp: bp.soldierHp || 80,
            baseMaxHp: bp.soldierHp || 80,
            damage: bp.damage,
            baseDamage: bp.damage,
            attackSpeed: bp.fireRate,
            attackCooldown: 0.5,
            element: 'FAIRY',
            secondaryElement: 'LIGHT',
            combatMode: 'MELEE',
            state: 'IDLE',
            engagedEnemyId: null,
            rallyPoint: { x: initialX, y: initialY },
            targetPos: { x: initialX, y: initialY },
            armor: bp.soldierArmor || 0.1,
            baseArmor: bp.soldierArmor || 0.1,
            magicResist: 0.15,
            respawnTimer: 0,
            respawnDelay: bp.soldierRespawn || 7,
            soldierRegen: bp.soldierRegen || 0,
            tier: 1
          });
        }
      } else if (bp.type === 'HEROIC_ALTAR') {
        soldierIds = [];
      }
    }

    const defaultElement: ElementType =
      bp.type === 'DRAGON_NEST'
        ? 'DRAGON'
        : bp.type === 'FAIRY_TREE'
        ? 'FAIRY'
        : bp.type === 'HEROIC_ALTAR'
        ? 'GHOST'
        : bp.type === 'MAGE'
        ? 'DARK'
        : 'PHYSICAL';

    const defaultSecondary: ElementType | null =
      bp.type === 'DRAGON_NEST'
        ? 'FIRE'
        : bp.type === 'FAIRY_TREE'
        ? 'LIGHT'
        : null;

    const tower: TowerEntity = {
      id: towerId,
      name: bp.name,
      type: bp.type,
      tier: bp.tier,
      branch: bp.branch,
      x,
      y,
      range: bp.range,
      damage: bp.damage,
      fireRate: bp.fireRate,
      attackCooldown: 0.5,
      element: defaultElement,
      secondaryElement: defaultSecondary,
      soldierMode: bp.type === 'BARRACKS' ? 'MELEE' : undefined,
      targetingFilter: { ...bp.targetingFilter },
      placement: validation.placement,
      cost: bp.cost,
      totalInvested: bp.cost,
      rallyPoint,
      soldierIds,
      maxSoldiers: bp.maxSoldiers,
      resurrectChance: bp.resurrectChance,
      spiritStatMultiplier: bp.spiritStatMultiplier,
      spiritGhostRatio: bp.spiritGhostRatio ?? 0.5,
      trapCharges: bp.maxTrapCharges,
      maxTrapCharges: bp.maxTrapCharges,
      triggerRadius: bp.triggerRadius,
      aoeRadius: bp.aoeRadius,
      rearmTimer: bp.rearmTime
    };

    this.towers.push(tower);
    this.selectedTowerId = towerId;
    this.selectedSlotId = null;
    this.selectedBuildPoint = null;

    this.recalculateTowerBuffs();

    SoundSystem.playBuild();
    this.addFloatingText(`-${bp.cost} 🪙`, x, y - 15, '#eab308');
    this.syncToWasm();
    return true;
  }

  /**
   * Legacy slot builder for backwards compatibility and tests
   */
  public buildTower(slotId: string, type: TowerType): boolean {
    const slot = this.towerSlots.find((s) => s.id === slotId);
    if (!slot || slot.currentTowerId) {
      // If no slot matching id, attempt coordinate parse or fallback
      return false;
    }

    const built = this.buildTowerAt(slot.x, slot.y, type);
    if (built) {
      slot.currentTowerId = this.selectedTowerId;
      if (this.selectedTowerId) {
        const t = this.towers.find((tow) => tow.id === this.selectedTowerId);
        if (t) t.slotId = slot.id;
      }
    }
    return built;
  }

  /**
   * Upgrade an existing tower to next tier or branch
   */
  public upgradeTower(towerId: string, branch?: TowerBranch): boolean {
    const tower = this.towers.find((t) => t.id === towerId);
    if (!tower || tower.tier >= 4) return false;

    const nextTier = (tower.tier + 1) as 2 | 3 | 4;
    let nextKey = '';
    if (nextTier === 4) {
      if (!branch) return false;
      nextKey = `${tower.type}_4_${branch}`;
    } else {
      nextKey = `${tower.type}_${nextTier}`;
    }

    const nextBp = TOWER_BLUEPRINTS[nextKey];
    if (!nextBp) return false;

    if (this.gold < nextBp.cost) {
      SoundSystem.playError();
      this.addFloatingText('Không đủ vàng nâng cấp!', tower.x, tower.y, '#ef4444');
      return false;
    }

    this.gold -= nextBp.cost;
    tower.tier = nextTier;
    tower.branch = branch;
    tower.name = nextBp.name;
    tower.damage = nextBp.damage;
    tower.range = nextBp.range;
    tower.fireRate = nextBp.fireRate;
    if (tower.type === 'DRAGON_NEST') {
      tower.element = 'DRAGON';
    } else if (tower.type === 'FAIRY_TREE') {
      tower.element = 'FAIRY';
    } else if (tower.type === 'HEROIC_ALTAR') {
      tower.element = 'GHOST';
    } else if (tower.type !== 'MAGE') {
      tower.element = 'PHYSICAL';
    }
    if (tower.type === 'BARRACKS' && tower.soldierMode === 'RANGED') {
      tower.targetingFilter = { allowedMovement: ['WALK', 'SWIM', 'FLY'] };
    } else {
      tower.targetingFilter = { ...nextBp.targetingFilter };
    }

    tower.totalInvested += nextBp.cost;
    if (nextBp.aoeRadius) tower.aoeRadius = nextBp.aoeRadius;

    if (tower.type === 'DRAGON_NEST') {
      tower.element = 'DRAGON';
      tower.maxSoldiers = 1;
      const rPoint = tower.rallyPoint || { x: tower.x, y: tower.y };
      if (tower.soldierIds) {
        for (const sid of tower.soldierIds) {
          const dragon = this.soldiers.find((s) => s.id === sid);
          if (dragon) {
            if (dragon.state !== 'DEAD' && dragon.tier > nextTier) {
              // Retain higher tier stats from before tower downgrade
              dragon.rallyPoint = { ...rPoint };
              continue;
            }
            dragon.tier = nextTier;
            dragon.branch = branch;
            dragon.baseMaxHp = nextBp.soldierHp || dragon.baseMaxHp;
            dragon.baseDamage = nextBp.damage;
            dragon.baseArmor = nextBp.soldierArmor !== undefined ? nextBp.soldierArmor : dragon.baseArmor;
            dragon.maxHp = dragon.baseMaxHp;
            dragon.hp = dragon.maxHp;
            dragon.damage = dragon.baseDamage;
            dragon.armor = dragon.baseArmor;
            dragon.aoeRadius = nextBp.aoeRadius || dragon.aoeRadius;
            dragon.soldierRegen = nextBp.soldierRegen || 0;
            dragon.attackSpeed = nextBp.fireRate;
            dragon.rallyPoint = { ...rPoint };
            if (dragon.state === 'DEAD') {
              dragon.state = 'IDLE';
              dragon.respawnTimer = 0;
              dragon.x = dragon.rallyPoint.x;
              dragon.y = dragon.rallyPoint.y;
              dragon.targetPos = { ...dragon.rallyPoint };
            }
          }
        }
      }
    } else if (tower.type === 'FAIRY_TREE') {
      tower.element = 'FAIRY';
      const targetMaxSoldiers = nextBp.maxSoldiers || 2;
      tower.maxSoldiers = targetMaxSoldiers;
      if (!tower.soldierIds) tower.soldierIds = [];

      const rPoint = tower.rallyPoint || { x: tower.x, y: tower.y };
      while (tower.soldierIds.length < targetMaxSoldiers) {
        this.soldierIdCounter++;
        const newFairyId = `fairy-${this.soldierIdCounter}`;
        tower.soldierIds.push(newFairyId);

        const fairyIndex = tower.soldierIds.length - 1;
        const offsetAngle = (fairyIndex / targetMaxSoldiers) * Math.PI * 2;
        const initialX = rPoint.x + Math.cos(offsetAngle) * 14;
        const initialY = rPoint.y + Math.sin(offsetAngle) * 14;

        this.soldiers.push({
          id: newFairyId,
          towerId,
          name: `Tiên ${fairyIndex + 1}`,
          archetype: 'FAIRY',
          canBlockAir: true,
          canTargetAir: true,
          canTargetSwim: true,
          x: initialX,
          y: initialY,
          hp: nextBp.soldierHp || 80,
          maxHp: nextBp.soldierHp || 80,
          baseMaxHp: nextBp.soldierHp || 80,
          damage: nextBp.damage,
          baseDamage: nextBp.damage,
          attackSpeed: nextBp.fireRate,
          attackCooldown: 0.5,
          element: 'FAIRY',
          secondaryElement: tower.secondaryElement || 'LIGHT',
          buffedElements: tower.buffedElements ? [...tower.buffedElements] : undefined,
          combatMode: 'MELEE',
          state: 'IDLE',
          facing: 0,
          engagedEnemyId: null,
          rallyPoint: { x: initialX, y: initialY },
          targetPos: { x: initialX, y: initialY },
          armor: nextBp.soldierArmor !== undefined ? nextBp.soldierArmor : 0.1,
          baseArmor: nextBp.soldierArmor !== undefined ? nextBp.soldierArmor : 0.1,
          magicResist: 0.15,
          respawnTimer: 0,
          respawnDelay: nextBp.soldierRespawn || 7,
          soldierRegen: nextBp.soldierRegen || 0,
          tier: nextTier,
          branch: branch
        });
      }

      const totalCount = tower.soldierIds.length;
      for (let i = 0; i < totalCount; i++) {
        const sid = tower.soldierIds[i];
        const fairy = this.soldiers.find((s) => s.id === sid);
        if (fairy) {
          if (fairy.state !== 'DEAD' && fairy.tier > nextTier) {
            // Retain higher tier stats from before tower downgrade
          } else {
            fairy.tier = nextTier;
            fairy.branch = branch;
            fairy.baseMaxHp = nextBp.soldierHp || fairy.baseMaxHp;
            fairy.baseDamage = nextBp.damage;
            fairy.baseArmor = nextBp.soldierArmor !== undefined ? nextBp.soldierArmor : fairy.baseArmor;
            fairy.maxHp = fairy.baseMaxHp;
            fairy.hp = fairy.maxHp;
            fairy.damage = fairy.baseDamage;
            fairy.armor = fairy.baseArmor;
            fairy.soldierRegen = nextBp.soldierRegen || 0;
            fairy.attackSpeed = nextBp.fireRate;
            if (fairy.state === 'DEAD') {
              fairy.state = 'IDLE';
              fairy.respawnTimer = 0;
              fairy.x = rPoint.x;
              fairy.y = rPoint.y;
              fairy.targetPos = { x: rPoint.x, y: rPoint.y };
            }
          }
          const offsetAngle = (i / totalCount) * Math.PI * 2;
          fairy.rallyPoint = {
            x: rPoint.x + Math.cos(offsetAngle) * 14,
            y: rPoint.y + Math.sin(offsetAngle) * 14
          };
          if (fairy.state === 'IDLE') {
            fairy.targetPos = { ...fairy.rallyPoint };
          }
        }
      }
    } else if (tower.type === 'HEROIC_ALTAR') {
      tower.element = 'GHOST';
      tower.maxSoldiers = nextBp.maxSoldiers || 2;
      tower.resurrectChance = nextBp.resurrectChance || 0.3;
      tower.spiritStatMultiplier = nextBp.spiritStatMultiplier;
      tower.spiritGhostRatio = nextBp.spiritGhostRatio ?? (nextBp.tier === 4 && nextBp.branch === 'B' ? 1.0 : 0.5);
      tower.aoeRadius = nextBp.aoeRadius;
      if (tower.soldierIds) {
        const mult = tower.spiritStatMultiplier || 1.0;
        for (const sid of tower.soldierIds) {
          const spirit = this.soldiers.find((s) => s.id === sid);
          if (spirit && spirit.state !== 'DEAD') {
            spirit.tier = nextTier;
            spirit.branch = branch;
            if (tower.spiritStatMultiplier) {
              spirit.maxHp = Math.round(spirit.baseMaxHp * mult);
              spirit.damage = Math.round(spirit.baseDamage * mult);
            }
            spirit.hp = spirit.maxHp;
          }
        }
      }
    } else if (tower.type === 'BARRACKS') {
      const targetMaxSoldiers = nextBp.maxSoldiers || 3;
      tower.maxSoldiers = targetMaxSoldiers;
      if (!tower.soldierIds) tower.soldierIds = [];

      // Spawn missing soldiers up to targetMaxSoldiers (e.g. tier 2 -> 4, tier 3/4 -> 5)
      const rPoint = tower.rallyPoint || { x: tower.x, y: tower.y };
      while (tower.soldierIds.length < targetMaxSoldiers) {
        this.soldierIdCounter++;
        const newSoldierId = `soldier-${this.soldierIdCounter}`;
        tower.soldierIds.push(newSoldierId);

        const soldierIndex = tower.soldierIds.length - 1;
        const offsetAngle = (soldierIndex / targetMaxSoldiers) * Math.PI * 2;
        const initialX = rPoint.x + Math.cos(offsetAngle) * 12;
        const initialY = rPoint.y + Math.sin(offsetAngle) * 12;

        this.soldiers.push({
          id: newSoldierId,
          towerId,
          name: `Lính ${soldierIndex + 1}`,
          x: initialX,
          y: initialY,
          hp: nextBp.soldierHp || 100,
          maxHp: nextBp.soldierHp || 100,
          baseMaxHp: nextBp.soldierHp || 100,
          damage: nextBp.damage,
          baseDamage: nextBp.damage,
          attackSpeed: nextBp.fireRate,
          attackCooldown: 0.5,
          element: 'PHYSICAL',
          secondaryElement: tower.secondaryElement || null,
          buffedElements: tower.buffedElements ? [...tower.buffedElements] : undefined,
          combatMode: tower.soldierMode || 'MELEE',
          state: 'IDLE',
          engagedEnemyId: null,
          rallyPoint: { x: initialX, y: initialY },
          targetPos: { x: initialX, y: initialY },
          armor: nextBp.soldierArmor !== undefined ? nextBp.soldierArmor : 0.1,
          baseArmor: nextBp.soldierArmor !== undefined ? nextBp.soldierArmor : 0.1,
          magicResist: 0.1,
          respawnTimer: 0,
          respawnDelay: nextBp.soldierRespawn || 7,
          soldierRegen: nextBp.soldierRegen || 0,
          tier: nextTier,
          branch: branch,
          rangedRange: 135 + nextTier * 12
        });
      }

      // Reposition all soldiers evenly around rally point & update stats
      const totalCount = tower.soldierIds.length;
      for (let i = 0; i < totalCount; i++) {
        const sid = tower.soldierIds[i];
        const soldier = this.soldiers.find((s) => s.id === sid);
        if (soldier) {
          if (soldier.state !== 'DEAD' && soldier.tier > nextTier) {
            // Retain higher tier stats from before tower downgrade
          } else {
            soldier.tier = nextTier;
            soldier.branch = branch;
            soldier.baseMaxHp = nextBp.soldierHp || soldier.baseMaxHp;
            soldier.baseDamage = nextBp.damage;
            soldier.baseArmor = nextBp.soldierArmor !== undefined ? nextBp.soldierArmor : soldier.baseArmor;
            soldier.soldierRegen = nextBp.soldierRegen || 0;
            soldier.secondaryElement = tower.secondaryElement || null;
            soldier.buffedElements = tower.buffedElements ? [...tower.buffedElements] : undefined;

            if (soldier.combatMode === 'RANGED') {
              soldier.maxHp = Math.max(1, Math.round(soldier.baseMaxHp * 0.65));
              soldier.damage = Math.max(1, Math.round(soldier.baseDamage * 0.7));
              soldier.armor = Math.round(soldier.baseArmor * 0.5 * 100) / 100;
              soldier.canTargetAir = true;
              soldier.rangedRange = 135 + nextTier * 12;
            } else {
              soldier.maxHp = soldier.baseMaxHp;
              soldier.damage = soldier.baseDamage;
              soldier.armor = soldier.baseArmor;
              soldier.canTargetAir = false;
            }

            soldier.hp = soldier.maxHp;
            if (soldier.state === 'DEAD') {
              soldier.state = 'IDLE';
              soldier.respawnTimer = 0;
              soldier.x = rPoint.x;
              soldier.y = rPoint.y;
              soldier.targetPos = { x: rPoint.x, y: rPoint.y };
            }
          }

          const offsetAngle = (i / totalCount) * Math.PI * 2;
          soldier.rallyPoint = {
            x: rPoint.x + Math.cos(offsetAngle) * 12,
            y: rPoint.y + Math.sin(offsetAngle) * 12
          };
          if (soldier.state === 'IDLE') {
            soldier.targetPos = { ...soldier.rallyPoint };
          }
        }
      }
    }

    // Mage 4-B auto-assign secondary element if not imbued yet so it has 2 elements to buff allies
    if (tower.type === 'MAGE' && nextTier === 4 && branch === 'B') {
      if (!tower.secondaryElement) {
        tower.secondaryElement = tower.element === 'LIGHTNING' ? 'FIRE' : 'LIGHTNING';
      }
    }

    this.recalculateTowerBuffs();

    SoundSystem.playUpgrade();
    this.addFloatingText(`CẤP ${nextTier}! -${nextBp.cost} 🪙`, tower.x, tower.y - 20, '#38bdf8');
    this.syncToWasm();
    return true;
  }

  /**
   * Downgrade a tower by 1 tier (or destroy if it is tier 1 / trap)
   */
  public downgradeOrDestroyTower(towerId: string): 'DOWNGRADED' | 'DESTROYED' | 'NONE' {
    const tIndex = this.towers.findIndex((t) => t.id === towerId);
    if (tIndex === -1) return 'NONE';
    const tower = this.towers[tIndex];

    // If tier > 1, drop to previous tier
    if (tower.tier > 1) {
      const prevTier = (tower.tier - 1) as 1 | 2 | 3;
      tower.tier = prevTier;
      tower.branch = undefined;

      const prevKey = `${tower.type}_${prevTier}`;
      const prevBp = TOWER_BLUEPRINTS[prevKey];
      if (prevBp) {
        tower.name = prevBp.name;
        tower.damage = prevBp.damage;
        tower.range = prevBp.range;
        tower.fireRate = prevBp.fireRate;
        tower.aoeRadius = prevBp.aoeRadius;

        if (tower.type === 'DRAGON_NEST') {
          tower.element = 'DRAGON';
          tower.maxSoldiers = 1;
        } else if (tower.type === 'FAIRY_TREE') {
          tower.element = 'FAIRY';
          tower.maxSoldiers = prevBp.maxSoldiers || 2;
        } else if (tower.type === 'HEROIC_ALTAR') {
          tower.element = 'GHOST';
          tower.maxSoldiers = prevBp.maxSoldiers || 2;
          tower.resurrectChance = prevBp.resurrectChance || 0.3;
          tower.spiritStatMultiplier = prevBp.spiritStatMultiplier;
          tower.spiritGhostRatio = prevBp.spiritGhostRatio ?? (prevBp.tier === 4 && prevBp.branch === 'B' ? 1.0 : 0.5);
          tower.aoeRadius = prevBp.aoeRadius;
        } else if (tower.type === 'BARRACKS') {
          tower.maxSoldiers = prevBp.maxSoldiers || 3;
          if (tower.soldierMode === 'RANGED') {
            tower.targetingFilter = { allowedMovement: ['WALK', 'SWIM', 'FLY'] };
          } else {
            tower.targetingFilter = { ...prevBp.targetingFilter };
          }
        } else if (tower.type !== 'MAGE') {
          tower.element = 'PHYSICAL';
        }

        if (tower.type !== 'BARRACKS' && tower.type !== 'DRAGON_NEST' && tower.type !== 'FAIRY_TREE' && tower.type !== 'HEROIC_ALTAR') {
          tower.targetingFilter = { ...prevBp.targetingFilter };
        }

        // Handle summoned units when tower is downgraded:
        // Living summoned units are NOT affected: keep current count and stats.
        // If there are already-dead units:
        // 1. If unit count exceeds the new maxSoldiers, remove excess dead units right away so they won't respawn.
        // 2. Remaining dead units waiting to respawn sync their stats to prevBp.
        if (tower.soldierIds && tower.soldierIds.length > 0) {
          const targetMax = tower.maxSoldiers || 1;
          // Clean up excess dead units first if any
          for (let i = tower.soldierIds.length - 1; i >= 0; i--) {
            if (tower.soldierIds.length <= targetMax) break;
            const sid = tower.soldierIds[i];
            const soldier = this.soldiers.find((s) => s.id === sid);
            if (soldier && (soldier.state === 'DEAD' || soldier.hp <= 0)) {
              tower.soldierIds.splice(i, 1);
              const sIndex = this.soldiers.findIndex((s) => s.id === sid);
              if (sIndex !== -1) {
                this.soldiers.splice(sIndex, 1);
              }
            }
          }

          // For any remaining already-dead units (waiting to respawn within targetMax), sync stats to prevBp
          for (const sid of tower.soldierIds) {
            const soldier = this.soldiers.find((s) => s.id === sid);
            if (soldier && (soldier.state === 'DEAD' || soldier.hp <= 0)) {
              this.syncSoldierStatsToTowerBlueprint(soldier, prevBp);
              soldier.hp = 0;
            }
          }
        }
      }

      this.recalculateTowerBuffs();
      SoundSystem.playTowerDamaged('DOWNGRADED');
      this.addFloatingText(`⬇️ RƠI CẤP (CẤP ${prevTier})!`, tower.x, tower.y - 20, '#ef4444', 16);
      this.addExplosionParticles(tower.x, tower.y, '#ef4444', 12);
      this.syncToWasm();
      return 'DOWNGRADED';
    }

    // Tier 1 or Trap: DESTROYED completely!
    const { x, y } = tower;
    if (tower.slotId) {
      const slot = this.towerSlots.find((s) => s.id === tower.slotId);
      if (slot) slot.currentTowerId = null;
    }

    if (tower.soldierIds) {
      this.soldiers = this.soldiers.filter((s) => !tower.soldierIds!.includes(s.id));
    }

    this.towers.splice(tIndex, 1);
    if (this.selectedTowerId === towerId) {
      this.selectedTowerId = null;
      this.isSettingRallyPoint = false;
    }

    this.recalculateTowerBuffs();
    SoundSystem.playTowerDamaged('DESTROYED');
    this.addFloatingText('💥 PHÁ HỦY THÁP!', x, y - 20, '#dc2626', 18);
    this.addExplosionParticles(x, y, '#dc2626', 22);
    this.syncToWasm();
    return 'DESTROYED';
  }

  /**
   * Set or change elemental attribute for a tower
   */
  public setTowerElement(
    towerId: string,
    element: MagicalElementType,
    slotIndex: 1 | 2 = 1
  ): boolean {
    const tower = this.towers.find((t) => t.id === towerId);
    if (!tower || tower.type === 'HEROIC_ALTAR') return false;

    const cost = tower.type === 'MAGE' && slotIndex === 2 ? MAGE_SECOND_ELEMENT_COST : ELEMENT_IMBUE_COST;

    if (this.gold < cost) {
      SoundSystem.playError();
      this.addFloatingText('Không đủ vàng gắn nguyên tố!', tower.x, tower.y, '#ef4444');
      return false;
    }

    this.gold -= cost;
    tower.totalInvested += cost;

    if (tower.type === 'MAGE') {
      if (slotIndex === 1) {
        tower.element = element;
      } else {
        tower.secondaryElement = element;
      }
    } else {
      tower.secondaryElement = element;
      if (tower.soldierIds) {
        for (const sid of tower.soldierIds) {
          const soldier = this.soldiers.find((s) => s.id === sid);
          if (soldier) {
            soldier.secondaryElement = element;
          }
        }
      }
    }

    const name = ELEMENT_NAMES[element];
    this.recalculateTowerBuffs();
    SoundSystem.playImbue();
    this.addFloatingText(`✨ Thuộc tính ${name}! -${cost} 🪙`, tower.x, tower.y - 20, '#facc15');
    this.syncToWasm();
    return true;
  }

  /**
   * Toggle between Melee and Ranged for Barracks
   */
  public setBarracksSoldierMode(towerId: string, mode: SoldierCombatMode): boolean {
    const tower = this.towers.find((t) => t.id === towerId);
    if (!tower || tower.type !== 'BARRACKS') return false;

    tower.soldierMode = mode;
    tower.targetingFilter =
      mode === 'MELEE'
        ? { allowedMovement: ['WALK'] }
        : { allowedMovement: ['WALK', 'SWIM', 'FLY'] };

    if (tower.soldierIds) {
      for (const sid of tower.soldierIds) {
        const soldier = this.soldiers.find((s) => s.id === sid);
        if (soldier) {
          const hpRatio = soldier.maxHp > 0 ? soldier.hp / soldier.maxHp : 1;
          soldier.combatMode = mode;

          if (mode === 'MELEE') {
            soldier.maxHp = soldier.baseMaxHp;
            soldier.damage = soldier.baseDamage;
            soldier.armor = soldier.baseArmor;
            soldier.canTargetAir = false;
          } else {
            soldier.maxHp = Math.max(1, Math.round(soldier.baseMaxHp * 0.65));
            soldier.damage = Math.max(1, Math.round(soldier.baseDamage * 0.7));
            soldier.armor = Math.round(soldier.baseArmor * 0.5 * 100) / 100;
            soldier.canTargetAir = true;
            soldier.rangedRange = 135 + soldier.tier * 12;
          }

          soldier.hp = Math.max(1, Math.round(soldier.maxHp * hpRatio));
          soldier.engagedEnemyId = null;
          soldier.facing = Math.atan2(soldier.rallyPoint.y - soldier.y, soldier.rallyPoint.x - soldier.x);
          soldier.state = 'MOVING_TO_RALLY';
        }
      }
    }

    this.addFloatingText(
      `Chuyển sang: ${mode === 'MELEE' ? '⚔️ Lính Cận Chiến' : '🏹 Lính Bắn Tên'}!`,
      tower.x,
      tower.y - 15,
      '#38bdf8'
    );
    SoundSystem.playRally();
    this.syncToWasm();
    return true;
  }

  /**
   * Sell a tower for 70% refund of total invested gold
   */
  public sellTower(towerId: string): boolean {
    const tIndex = this.towers.findIndex((t) => t.id === towerId);
    if (tIndex === -1) return false;
    const tower = this.towers[tIndex];

    const refund = Math.round(tower.totalInvested * 0.7);
    this.gold += refund;

    // Free slot if any
    if (tower.slotId) {
      const slot = this.towerSlots.find((s) => s.id === tower.slotId);
      if (slot) slot.currentTowerId = null;
    }

    // Remove soldiers if barracks
    if (tower.soldierIds) {
      this.soldiers = this.soldiers.filter((s) => !tower.soldierIds!.includes(s.id));
    }

    this.towers.splice(tIndex, 1);
    this.selectedTowerId = null;
    this.isSettingRallyPoint = false;

    this.recalculateTowerBuffs();

    SoundSystem.playSell();
    this.addFloatingText(`+${refund} 🪙 Bán tháp`, tower.x, tower.y, '#22c55e');
    this.syncToWasm();
    return true;
  }

  /**
   * Change Rally Point for Summon towers (Barracks, Dragon Nest, Fairy Tree, Heroic Altar)
   */
  public setRallyPoint(towerId: string, targetX: number, targetY: number): boolean {
    this.isSettingRallyPoint = false;
    const tower = this.towers.find((t) => t.id === towerId);
    const validSummon =
      tower &&
      (tower.type === 'BARRACKS' ||
        tower.type === 'DRAGON_NEST' ||
        tower.type === 'FAIRY_TREE' ||
        tower.type === 'HEROIC_ALTAR');
    if (!validSummon) return false;

    const dist = Math.hypot(targetX - tower.x, targetY - tower.y);
    if (dist > tower.range) {
      SoundSystem.playError();
      this.addFloatingText('Ngoài phạm vi điều động!', targetX, targetY, '#ef4444');
      this.syncToWasm();
      return false;
    }

    tower.rallyPoint = { x: targetX, y: targetY };

    if (tower.soldierIds) {
      for (let i = 0; i < tower.soldierIds.length; i++) {
        const sid = tower.soldierIds[i];
        const soldier = this.soldiers.find((s) => s.id === sid);
        if (soldier && soldier.state !== 'DEAD') {
          const offsetAngle = (i / tower.soldierIds.length) * Math.PI * 2;
          soldier.rallyPoint = {
            x: targetX + Math.cos(offsetAngle) * 12,
            y: targetY + Math.sin(offsetAngle) * 12
          };
          soldier.engagedEnemyId = null;
          soldier.facing = Math.atan2(soldier.rallyPoint.y - soldier.y, soldier.rallyPoint.x - soldier.x);
          soldier.state = 'MOVING_TO_RALLY';
        }
      }
    }

    this.isSettingRallyPoint = false;
    SoundSystem.playRally();
    this.addFloatingText('🚩 Đã đổi điểm tập kết!', targetX, targetY - 10, '#eab308');
    this.syncToWasm();
    return true;
  }

  /**
   * Helper to sync a soldier's stats to a tower blueprint (used when respawning or upgrading).
   */
  public syncSoldierStatsToTowerBlueprint(soldier: SoldierEntity, bp: TowerBlueprint): void {
    soldier.tier = bp.tier;
    soldier.branch = bp.branch;
    soldier.baseMaxHp = bp.soldierHp || soldier.baseMaxHp;
    soldier.baseDamage = bp.damage;
    soldier.baseArmor = bp.soldierArmor !== undefined ? bp.soldierArmor : soldier.baseArmor;
    soldier.soldierRegen = bp.soldierRegen || 0;
    soldier.attackSpeed = bp.fireRate;
    if (bp.aoeRadius) {
      soldier.aoeRadius = bp.aoeRadius;
    }
    if (bp.soldierRespawn) {
      soldier.respawnDelay = bp.soldierRespawn;
    }

    if (soldier.combatMode === 'RANGED') {
      soldier.maxHp = Math.max(1, Math.round(soldier.baseMaxHp * 0.65));
      soldier.damage = Math.max(1, Math.round(soldier.baseDamage * 0.7));
      soldier.armor = Math.round(soldier.baseArmor * 0.5 * 100) / 100;
      soldier.canTargetAir = true;
      soldier.rangedRange = 135 + soldier.tier * 12;
    } else {
      soldier.maxHp = soldier.baseMaxHp;
      soldier.damage = soldier.baseDamage;
      soldier.armor = soldier.baseArmor;
      if (soldier.archetype !== 'DRAGON' && soldier.archetype !== 'FAIRY') {
        soldier.canTargetAir = false;
      }
    }
  }

  /**
   * Called when a summoned unit (Soldier, Dragon, Fairy, Spirit) dies.
   * Handles:
   * 1. Heroic Altar resurrection attempt (using the unit's pre-death stats).
   * 2. If the parent tower was downgraded and currently has excess units beyond its current maxSoldiers,
   *    the dying unit is permanently removed rather than respawning.
   * 3. If within the tower's maxSoldiers limit, the unit enters DEAD respawn queue and syncs stats
   *    to the tower's current tier so it respawns with the new tier's stats.
   */
  public handleSoldierDeath(soldierId: string): void {
    const sIndex = this.soldiers.findIndex((s) => s.id === soldierId);
    if (sIndex === -1) return;
    const deadSoldier = this.soldiers[sIndex];

    // 1. Try spawn Heroic Spirit while unit retains its pre-death stats
    if (!deadSoldier.isSpirit) {
      this.trySpawnHeroicSpirit(deadSoldier);
    }

    // 2. Spirits (Heroic Altar) do not respawn; remove permanently
    if (deadSoldier.isSpirit) {
      this.soldiers.splice(sIndex, 1);
      const altar = this.towers.find((t) => t.id === deadSoldier.towerId);
      if (altar && altar.soldierIds) {
        const idIdx = altar.soldierIds.indexOf(deadSoldier.id);
        if (idIdx !== -1) {
          altar.soldierIds.splice(idIdx, 1);
        }
      }
      return;
    }

    // 3. Regular summoned unit (Barracks, Dragon Nest, Fairy Tree)
    const tower = this.towers.find((t) => t.id === deadSoldier.towerId);
    if (!tower) {
      this.soldiers.splice(sIndex, 1);
      return;
    }

    const currentCap = tower.maxSoldiers || (tower.type === 'HEROIC_ALTAR' ? 2 : 1);
    const totalAssigned = tower.soldierIds?.length || 0;

    // If unit count exceeds tower's current max capacity (tower was downgraded)
    if (totalAssigned > currentCap) {
      // Permanently remove the excess fallen soldier
      this.soldiers.splice(sIndex, 1);
      if (tower.soldierIds) {
        const idIdx = tower.soldierIds.indexOf(deadSoldier.id);
        if (idIdx !== -1) {
          tower.soldierIds.splice(idIdx, 1);
        }
      }
      return;
    }

    // Otherwise, unit remains in soldiers array in DEAD state waiting to respawn.
    // Sync its stats to the tower's current tier blueprint so it respawns with the tower's current tier stats!
    const bpKey = `${tower.type}_${tower.tier}${tower.branch ? '_' + tower.branch : ''}`;
    const currentBp = TOWER_BLUEPRINTS[bpKey];
    if (currentBp) {
      this.syncSoldierStatsToTowerBlueprint(deadSoldier, currentBp);
      deadSoldier.hp = 0;
      deadSoldier.state = 'DEAD';
      deadSoldier.respawnTimer = deadSoldier.respawnDelay;
    }
  }

  /**
   * Called when an allied summoned unit dies (Soldier, Dragon, Fairy).
   * Heroic Altars have a chance to resurrect the fallen warrior as a Heroic Spirit (+Ghost element).
   */
  public trySpawnHeroicSpirit(deadSoldier: SoldierEntity): boolean {
    if (deadSoldier.isSpirit) return false;

    // Find active Heroic Altars with available capacity
    const altars = this.towers.filter(
      (t) =>
        t.type === 'HEROIC_ALTAR' &&
        (!t.disabledTimer || t.disabledTimer <= 0) &&
        (t.soldierIds?.length || 0) < (t.maxSoldiers || 2)
    );

    if (altars.length === 0) return false;

    // Prioritize altars closest to death point
    altars.sort((a, b) => {
      const distA = Math.hypot(deadSoldier.x - a.x, deadSoldier.y - a.y);
      const distB = Math.hypot(deadSoldier.x - b.x, deadSoldier.y - b.y);
      return distA - distB;
    });

    const chosenAltar = altars[0];
    const chance = chosenAltar.resurrectChance ?? 0.3;
    if (Math.random() >= chance) return false;

    this.soldierIdCounter++;
    const spiritId = `spirit-${this.soldierIdCounter}`;
    chosenAltar.soldierIds = chosenAltar.soldierIds || [];
    chosenAltar.soldierIds.push(spiritId);

    const spiritGhostRatio = chosenAltar.spiritGhostRatio ?? (chosenAltar.tier === 4 && chosenAltar.branch === 'B' ? 1.0 : 0.5);
    const mult = chosenAltar.spiritStatMultiplier || 1.0;
    const spiritHp = Math.round(deadSoldier.baseMaxHp * mult);
    const spiritDmg = Math.round(deadSoldier.baseDamage * mult);
    const arch = deadSoldier.archetype || 'SOLDIER';

    const spiritUnit: SoldierEntity = {
      id: spiritId,
      towerId: chosenAltar.id,
      name: `Anh Linh ${deadSoldier.name}`,
      archetype: arch,
      isSpirit: true,
      spiritSourceArchetype: arch,
      spiritGhostRatio,
      x: deadSoldier.x,
      y: deadSoldier.y,
      hp: spiritHp,
      maxHp: spiritHp,
      baseMaxHp: spiritHp,
      damage: spiritDmg,
      baseDamage: spiritDmg,
      attackSpeed: deadSoldier.attackSpeed,
      attackCooldown: 0.5,
      element: deadSoldier.element || 'PHYSICAL',
      secondaryElement: deadSoldier.secondaryElement,
      combatMode: deadSoldier.combatMode,
      state: 'IDLE',
      engagedEnemyId: null,
      rallyPoint: { ...deadSoldier.rallyPoint },
      targetPos: { ...deadSoldier.rallyPoint },
      armor: deadSoldier.baseArmor,
      baseArmor: deadSoldier.baseArmor,
      magicResist: deadSoldier.magicResist ?? 0.25,
      respawnTimer: 0,
      respawnDelay: 999999, // Spirits do not respawn on timer
      tier: chosenAltar.tier,
      branch: deadSoldier.branch,
      soldierRegen: deadSoldier.soldierRegen,
      canBlockAir: deadSoldier.canBlockAir,
      canTargetAir: deadSoldier.canTargetAir,
      canTargetSwim: deadSoldier.canTargetSwim,
      aoeRadius: deadSoldier.aoeRadius,
      rangedDamage: deadSoldier.rangedDamage,
      rangedRange: deadSoldier.rangedRange
    };

    this.soldiers.push(spiritUnit);

    // Ensure new spirit receives buffs if altar is currently buffed by Mage 4_B
    this.recalculateTowerBuffs();

    this.addFloatingText('👻 ANH LINH HỒI SINH!', deadSoldier.x, deadSoldier.y - 20, '#818cf8', 16);
    this.addExplosionParticles(deadSoldier.x, deadSoldier.y, '#818cf8', 15);
    SoundSystem.playEnemySkill('SUMMON');
    return true;
  }

  /**
   * Recalculates buffs provided by Mage 4_B towers to nearby towers and soldiers.
   * Only called on discrete tower state changes (build, upgrade, element imbue, sell).
   * If a tower is in range of multiple Mage 4_B towers, the closest one is chosen.
   */
  public recalculateTowerBuffs(): void {
    const mage4BTowers = this.towers.filter(
      (t) => t.type === 'MAGE' && t.tier === 4 && t.branch === 'B'
    );

    // Clear current buffs on all towers & soldiers
    for (const t of this.towers) {
      t.buffedElements = undefined;
      t.buffSourceId = null;
    }
    for (const s of this.soldiers) {
      s.buffedElements = undefined;
    }

    if (mage4BTowers.length === 0) return;

    for (const tower of this.towers) {
      if (tower.placement !== 'ROADSIDE') continue;

      // Find the NEAREST Mage 4_B tower within its range
      let nearestMage: TowerEntity | null = null;
      let minDist = Infinity;

      for (const mage of mage4BTowers) {
        if (mage.id === tower.id) continue; // Cannot buff itself
        const dist = Math.hypot(tower.x - mage.x, tower.y - mage.y);
        if (dist <= mage.range && dist < minDist) {
          minDist = dist;
          nearestMage = mage;
        }
      }

      if (nearestMage) {
        const elem1 = nearestMage.element;
        const elem2 = nearestMage.secondaryElement || nearestMage.element;
        tower.buffSourceId = nearestMage.id;
        tower.buffedElements = [elem1, elem2];

        // Propagate to soldiers/summoned units if any
        if (tower.soldierIds) {
          for (const sid of tower.soldierIds) {
            const soldier = this.soldiers.find((s) => s.id === sid);
            if (soldier) {
              soldier.buffedElements = [elem1, elem2];
            }
          }
        }
      }
    }
  }

  /**
   * Load saved settings from StorageService into this GameState instance.
   */
  public loadSettingsFromStorage(): void {
    StorageService.applyToGameState(this);
    SoundSystem.setEnabled(this.soundEnabled);
    SoundSystem.setVolume(this.soundVolume);
  }

  /**
   * Save current custom settings from this GameState instance to StorageService.
   */
  public saveSettingsToStorage(): void {
    StorageService.saveFromGameState(this);
  }

  public addFloatingText(
    text: string,
    x: number,
    y: number,
    color: string = '#ffffff',
    size: number = 13
  ): void {
    // Throttle floating texts when crowded
    if (this.floatingTexts.length >= 150) {
      return;
    }
    const item = floatingTextPool.acquire();
    item.text = text;
    item.x = x;
    item.y = y;
    item.color = color;
    item.lifeTime = 1.0;
    item.maxLifeTime = 1.0;
    item.size = size;
    this.floatingTexts.push(item);
  }

  public addExplosionParticles(x: number, y: number, color: string, count: number = 12): void {
    // Smart throttling based on current particle density
    let actualCount = count;
    if (this.particles.length > 500) {
      actualCount = Math.max(1, Math.floor(count * 0.25));
    } else if (this.particles.length > 250) {
      actualCount = Math.max(2, Math.floor(count * 0.5));
    }

    for (let i = 0; i < actualCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 80;
      const p = particlePool.acquire();
      p.x = x;
      p.y = y;
      p.prevX = x;
      p.prevY = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.color = color;
      p.size = 2.5 + Math.random() * 2.5;
      p.lifeTime = 0.6 + Math.random() * 0.3;
      p.maxLifeTime = p.lifeTime;
      p.shape = 'CIRCLE';
      this.particles.push(p);
    }
  }
}
