import {
  EnemyEntity,
  FloatingText,
  Particle,
  ProjectileEntity,
  SoldierEntity,
  TowerEntity,
  TowerSlot,
  TowerType,
  TowerBranch,
  Vector2D
} from '../types/entities.types.js';
import { MAP_CONFIG } from '../config/map.config.js';
import { TOWER_BLUEPRINTS, TowerBlueprint } from '../config/towers.config.js';

export class GameState {
  public gold: number = 320;
  public lives: number = 20;
  public maxLives: number = 20;
  public gameSpeed: number = 1;
  public isPaused: boolean = false;
  public isGameOver: boolean = false;
  public isVictory: boolean = false;

  public towerSlots: TowerSlot[] = [];
  public towers: TowerEntity[] = [];
  public soldiers: SoldierEntity[] = [];
  public enemies: EnemyEntity[] = [];
  public projectiles: ProjectileEntity[] = [];
  public floatingTexts: FloatingText[] = [];
  public particles: Particle[] = [];

  public selectedSlotId: string | null = null;
  public selectedTowerId: string | null = null;
  public isSettingRallyPoint: boolean = false;
  public activePlacementType: TowerType | null = null;
  public hoveredSlotId: string | null = null;
  public hoveredTowerId: string | null = null;
  public mousePos: Vector2D = { x: 0, y: 0 };

  private towerIdCounter = 0;
  private soldierIdCounter = 0;

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.gold = 320;
    this.lives = 20;
    this.gameSpeed = 1;
    this.isPaused = false;
    this.isGameOver = false;
    this.isVictory = false;
    this.selectedSlotId = null;
    this.selectedTowerId = null;
    this.isSettingRallyPoint = false;
    this.activePlacementType = null;
    this.hoveredSlotId = null;
    this.hoveredTowerId = null;

    this.towerSlots = MAP_CONFIG.towerSlots.map((s) => ({
      ...s,
      currentTowerId: null
    }));
    this.towers = [];
    this.soldiers = [];
    this.enemies = [];
    this.projectiles = [];
    this.floatingTexts = [];
    this.particles = [];
  }

  public getSelectedSlot(): TowerSlot | null {
    return this.towerSlots.find((s) => s.id === this.selectedSlotId) || null;
  }

  public getSelectedTower(): TowerEntity | null {
    return this.towers.find((t) => t.id === this.selectedTowerId) || null;
  }

  /**
   * Build a new tower or trap on a slot
   */
  public buildTower(slotId: string, type: TowerType): boolean {
    const slot = this.towerSlots.find((s) => s.id === slotId);
    if (!slot || slot.currentTowerId) return false;

    const blueprintKey = type.startsWith('TRAP_') ? type : `${type}_1`;
    const bp: TowerBlueprint | undefined = TOWER_BLUEPRINTS[blueprintKey];
    if (!bp) return false;

    if (this.gold < bp.cost) {
      this.addFloatingText('Không đủ vàng!', slot.x, slot.y, '#ef4444');
      return false;
    }

    // Deduct gold
    this.gold -= bp.cost;
    this.towerIdCounter++;
    const towerId = `tower-${this.towerIdCounter}`;

    let rallyPoint: Vector2D | undefined;
    let soldierIds: string[] | undefined;

    // For Barracks, find road point near slot for initial rally point
    if (bp.type === 'BARRACKS') {
      const nearRoad = this.findNearestRoadPoint(slot.x, slot.y);
      rallyPoint = nearRoad;
      soldierIds = [];

      // Create 3 soldiers
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
          x: initialX,
          y: initialY,
          hp: bp.soldierHp || 100,
          maxHp: bp.soldierHp || 100,
          damage: bp.damage,
          attackSpeed: bp.fireRate,
          attackCooldown: 0.5,
          element: bp.element,
          state: 'IDLE',
          engagedEnemyId: null,
          rallyPoint: { x: initialX, y: initialY },
          targetPos: { x: initialX, y: initialY },
          armor: bp.soldierArmor || 0.1,
          magicResist: 0.1,
          respawnTimer: 0,
          respawnDelay: bp.soldierRespawn || 8,
          tier: 1
        });
      }
    }

    const tower: TowerEntity = {
      id: towerId,
      slotId: slot.id,
      name: bp.name,
      type: bp.type,
      tier: bp.tier,
      branch: bp.branch,
      x: slot.x,
      y: slot.y,
      range: bp.range,
      damage: bp.damage,
      fireRate: bp.fireRate,
      attackCooldown: 0.5,
      element: bp.element,
      targetingFilter: { ...bp.targetingFilter },
      placement: slot.placement,
      cost: bp.cost,
      totalInvested: bp.cost,
      rallyPoint,
      soldierIds,
      maxSoldiers: bp.maxSoldiers,
      trapCharges: bp.maxTrapCharges,
      maxTrapCharges: bp.maxTrapCharges,
      triggerRadius: bp.triggerRadius,
      aoeRadius: bp.aoeRadius,
      rearmTimer: bp.rearmTime
    };

    slot.currentTowerId = towerId;
    this.towers.push(tower);
    this.selectedTowerId = towerId;
    this.selectedSlotId = null;

    this.addFloatingText(`-${bp.cost} 🪙`, slot.x, slot.y - 15, '#eab308');
    return true;
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
    tower.element = nextBp.element;
    tower.targetingFilter = { ...nextBp.targetingFilter };
    tower.totalInvested += nextBp.cost;
    if (nextBp.aoeRadius) tower.aoeRadius = nextBp.aoeRadius;

    // If Barracks, upgrade soldiers stats
    if (tower.type === 'BARRACKS' && tower.soldierIds) {
      for (const sid of tower.soldierIds) {
        const soldier = this.soldiers.find((s) => s.id === sid);
        if (soldier) {
          soldier.tier = nextTier;
          soldier.branch = branch;
          soldier.maxHp = nextBp.soldierHp || soldier.maxHp;
          soldier.hp = soldier.maxHp; // full heal on upgrade!
          soldier.damage = nextBp.damage;
          soldier.armor = nextBp.soldierArmor || soldier.armor;
          soldier.element = nextBp.element;
          soldier.canTargetAir = nextBp.canTargetAir;
        }
      }
    }

    this.addFloatingText(`CẤP ${nextTier}! -${nextBp.cost} 🪙`, tower.x, tower.y - 20, '#38bdf8');
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

    // Free slot
    const slot = this.towerSlots.find((s) => s.id === tower.slotId);
    if (slot) slot.currentTowerId = null;

    // Remove soldiers if barracks
    if (tower.soldierIds) {
      this.soldiers = this.soldiers.filter((s) => !tower.soldierIds!.includes(s.id));
    }

    this.towers.splice(tIndex, 1);
    this.selectedTowerId = null;
    this.isSettingRallyPoint = false;

    this.addFloatingText(`+${refund} 🪙 Bán tháp`, tower.x, tower.y, '#22c55e');
    return true;
  }

  /**
   * Change Rally Point for Barracks
   */
  public setRallyPoint(towerId: string, targetX: number, targetY: number): boolean {
    const tower = this.towers.find((t) => t.id === towerId);
    if (!tower || tower.type !== 'BARRACKS') return false;

    // Check distance within tower range
    const dist = Math.hypot(targetX - tower.x, targetY - tower.y);
    if (dist > tower.range) {
      this.addFloatingText('Ngoài phạm vi điều động!', targetX, targetY, '#ef4444');
      return false;
    }

    tower.rallyPoint = { x: targetX, y: targetY };

    // Move all soldiers to new rally positions
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
          soldier.state = 'MOVING_TO_RALLY';
        }
      }
    }

    this.isSettingRallyPoint = false;
    this.addFloatingText('🚩 Đã đổi điểm tập kết!', targetX, targetY - 10, '#eab308');
    return true;
  }

  public addFloatingText(
    text: string,
    x: number,
    y: number,
    color: string = '#ffffff',
    size: number = 13
  ): void {
    this.floatingTexts.push({
      id: `text-${Date.now()}-${Math.random()}`,
      text,
      x,
      y,
      color,
      lifeTime: 1.2,
      maxLifeTime: 1.2,
      size
    });
  }

  public addExplosionParticles(x: number, y: number, color: string, count: number = 12): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 80;
      this.particles.push({
        id: `p-${Math.random()}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 2.5 + Math.random() * 2.5,
        lifeTime: 0.6 + Math.random() * 0.4,
        maxLifeTime: 0.8,
        shape: 'CIRCLE'
      });
    }
  }

  private findNearestRoadPoint(x: number, y: number): Vector2D {
    let closest = { ...MAP_CONFIG.groundWaypoints[0] };
    let minDist = Infinity;
    for (const pt of MAP_CONFIG.groundWaypoints) {
      const d = Math.hypot(pt.x - x, pt.y - y);
      if (d < minDist) {
        minDist = d;
        closest = { ...pt };
      }
    }
    return closest;
  }
}

