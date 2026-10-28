/**
 * Stick Vanguard - GameState
 * Pure Rust WebAssembly Engine Facade & State View.
 * All mutations (build, upgrade, sell, element, rally, validation) are 100% managed in Rust (`wasm-sim/src/state.rs`).
 * TypeScript acts as a reactive View Model for DOM UI panels and test suites.
 */
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
import { ElementType } from '../types/elements.types.js';
import { MAPS_CONFIG, MapConfig } from '../config/map.config.js';
import { TowerBlueprint } from '../config/towers.config.js';
import { StorageService } from './StorageService.js';
import { SoundSystem } from '../systems/SoundSystem.js';
import { WasmBridge, StepRenderOutput } from './WasmBridge.js';

function cleanFloat(val: any): any {
  if (typeof val === 'number') {
    return Math.round(val * 10000) / 10000;
  }
  return val;
}

export class GameState {
  private _gold: number = 320;
  private _lives: number = 20;

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

  // Wave Automation Settings
  public autoNextWave: boolean = false;

  public currentMapId: string = MAPS_CONFIG[0].id;
  public currentMap: MapConfig = MAPS_CONFIG[0];

  public towerSlots: TowerSlot[] = [];
  public towers: TowerEntity[] = [];
  public soldiers: SoldierEntity[] = [];

  /** @deprecated Enemies are 100% simulated inside Rust Engine (wasm-sim). Kept for backwards type compatibility. */
  public enemies: EnemyEntity[] = [];
  /** @deprecated Projectiles are simulated and rendered inside Rust Engine WebGL2. Kept for backwards type compatibility. */
  public projectiles: ProjectileEntity[] = [];
  public floatingTexts: FloatingText[] = [];
  /** @deprecated GPU particles are batched and rendered directly in Rust WebGL2. Kept for backwards type compatibility. */
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

  constructor() {
    this.reset();
  }

  public get gold(): number {
    return this._gold;
  }

  public set gold(val: number) {
    this._gold = val;
    const bridge = WasmBridge.getInstance();
    if (bridge.isAvailable()) {
      bridge.setGold(val);
    }
  }

  public get lives(): number {
    return this._lives;
  }

  public set lives(val: number) {
    this._lives = val;
    const bridge = WasmBridge.getInstance();
    if (bridge.isAvailable()) {
      bridge.setLives(val);
    }
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
    this._gold = 320;
    this._lives = 20;
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

    const bridge = WasmBridge.ensureSingletonReady();
    if (bridge.isAvailable()) {
      bridge.resetEngine();
      bridge.setMap(this.currentMapId);
      bridge.setGameSettings(
        this.customTotalWaves,
        this.goldMultiplier,
        this.damageMultiplier,
        this.gameSpeed,
        this.isPaused
      );
    }
  }

  public applyRustState(s: any): void {
    if (!s) return;
    if (s.gold !== undefined) this._gold = s.gold;
    if (s.lives !== undefined) this._lives = s.lives;
    if (s.maxLives !== undefined) this.maxLives = s.maxLives;
    if (s.isGameOver !== undefined) this.isGameOver = s.isGameOver;
    if (s.isVictory !== undefined) this.isVictory = s.isVictory;
    if (s.towers) {
      const newIds = new Set(s.towers.map((t: any) => t.id));
      for (let i = this.towers.length - 1; i >= 0; i--) {
        if (!newIds.has(this.towers[i].id)) {
          this.towers.splice(i, 1);
        }
      }
      for (const newT of s.towers) {
        if (newT.resurrectChance !== undefined) newT.resurrectChance = cleanFloat(newT.resurrectChance);
        if (newT.spiritGhostRatio !== undefined) newT.spiritGhostRatio = cleanFloat(newT.spiritGhostRatio);
        if (newT.spiritStatMultiplier !== undefined) newT.spiritStatMultiplier = cleanFloat(newT.spiritStatMultiplier);
        const existing = this.towers.find((t) => t.id === newT.id);
        if (existing) {
          Object.assign(existing, newT);
        } else {
          this.towers.push(newT);
        }
      }
      for (const slot of this.towerSlots) {
        const found = this.towers.find((t) => t.slotId === slot.id);
        slot.currentTowerId = found ? found.id : null;
      }
    }
    if (s.soldiers) {
      const newIds = new Set(s.soldiers.map((sol: any) => sol.id));
      for (let i = this.soldiers.length - 1; i >= 0; i--) {
        if (!newIds.has(this.soldiers[i].id)) {
          this.soldiers.splice(i, 1);
        }
      }
      for (const newS of s.soldiers) {
        if (newS.armor !== undefined) newS.armor = cleanFloat(newS.armor);
        if (newS.baseArmor !== undefined) newS.baseArmor = cleanFloat(newS.baseArmor);
        if (newS.magicResist !== undefined) newS.magicResist = cleanFloat(newS.magicResist);
        const existing = this.soldiers.find((sol) => sol.id === newS.id);
        if (existing) {
          Object.assign(existing, newS);
        } else {
          this.soldiers.push(newS);
        }
      }
    }
    if (s.floatingTexts) {
      this.floatingTexts = s.floatingTexts;
    }
    if (s.selectedTowerId !== undefined) {
      this.selectedTowerId = s.selectedTowerId;
    }
  }

  public applyStepSnapshot(step: StepRenderOutput): void {
    if (!step) return;
    this._gold = step.gold;
    this._lives = step.lives;
    this.maxLives = step.maxLives;
    this.isGameOver = step.isGameOver;
    this.isVictory = step.isVictory;
    if (step.soldiers) {
      const newIds = new Set(step.soldiers.map((sol) => sol.id));
      for (let i = this.soldiers.length - 1; i >= 0; i--) {
        if (!newIds.has(this.soldiers[i].id)) {
          this.soldiers.splice(i, 1);
        }
      }
      for (const newS of step.soldiers) {
        const existing = this.soldiers.find((sol) => sol.id === newS.id);
        if (existing) {
          Object.assign(existing, newS);
        } else {
          this.soldiers.push(newS);
        }
      }
    }
    if (step.towers) {
      const newIds = new Set(step.towers.map((t) => t.id));
      for (let i = this.towers.length - 1; i >= 0; i--) {
        if (!newIds.has(this.towers[i].id)) {
          this.towers.splice(i, 1);
        }
      }
      for (const newT of step.towers) {
        const existing = this.towers.find((t) => t.id === newT.id);
        if (existing) {
          Object.assign(existing, newT);
        } else {
          this.towers.push(newT);
        }
      }
    }
    if (step.floatingTexts) this.floatingTexts = step.floatingTexts as any;
  }

  public syncToWasm(): void {
    try {
      const bridge = WasmBridge.getInstance();
      if (bridge.isAvailable()) {
        bridge.syncTowersAndSoldiers(this.towers, this.soldiers, this._gold, this._lives);
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

  public validatePlacement(
    x: number,
    y: number,
    type: TowerType | string
  ): { valid: boolean; placement: PlacementType; reason?: string } {
    const bridge = WasmBridge.ensureSingletonReady();
    return bridge.validatePlacement(x, y, type as string);
  }

  public buildTowerAt(x: number, y: number, type: TowerType): boolean {
    const val = this.validatePlacement(x, y, type);
    if (!val.valid) {
      SoundSystem.playError();
      return false;
    }
    const bridge = WasmBridge.ensureSingletonReady();
    bridge.setGold(this._gold);
    const res = bridge.buildTowerAt(x, y, type, true);
    if (res.ok && res.state) {
      this.applyRustState(res.state);
      this.selectedTowerId = res.state.selectedTowerId || null;
      this.selectedSlotId = null;
      this.selectedBuildPoint = null;
      SoundSystem.playBuild();
      return true;
    }
    SoundSystem.playError();
    return false;
  }

  public buildTower(slotId: string, type: TowerType): boolean {
    const slot = this.towerSlots.find((s) => s.id === slotId);
    if (!slot) return false;
    const bridge = WasmBridge.ensureSingletonReady();
    bridge.setGold(this._gold);
    const res = bridge.buildTower(slotId, type);
    if (res.ok && res.state) {
      this.applyRustState(res.state);
      slot.currentTowerId = res.state.selectedTowerId;
      this.selectedTowerId = res.state.selectedTowerId;
      SoundSystem.playBuild();
      return true;
    }
    SoundSystem.playError();
    return false;
  }

  public upgradeTower(towerId: string, branch?: TowerBranch): boolean {
    const bridge = WasmBridge.ensureSingletonReady();
    bridge.setGold(this._gold);
    const res = bridge.upgradeTower(towerId, branch);
    if (res.ok && res.state) {
      this.applyRustState(res.state);
      SoundSystem.playUpgrade();
      return true;
    }
    SoundSystem.playError();
    return false;
  }

  public downgradeOrDestroyTower(towerId: string): 'DOWNGRADED' | 'DESTROYED' | 'NONE' {
    const bridge = WasmBridge.ensureSingletonReady();
    const res = bridge.downgradeOrDestroyTower(towerId);
    if (res.state) {
      this.applyRustState(res.state);
    }
    if (res.result === 'DOWNGRADED' || res.result === 'DESTROYED') {
      SoundSystem.playTowerDamaged(res.result);
    }
    return res.result;
  }

  public setTowerElement(
    towerId: string,
    element: ElementType,
    slotIndex: 1 | 2 = 1
  ): boolean {
    const bridge = WasmBridge.ensureSingletonReady();
    bridge.setGold(this._gold);
    const res = bridge.setTowerElement(towerId, element, slotIndex);
    if (res.ok && res.state) {
      this.applyRustState(res.state);
      SoundSystem.playImbue();
      return true;
    }
    SoundSystem.playError();
    return false;
  }

  public setBarracksSoldierMode(towerId: string, mode: SoldierCombatMode): boolean {
    const bridge = WasmBridge.ensureSingletonReady();
    const res = bridge.setBarracksMode(towerId, mode);
    if (res.ok && res.state) {
      this.applyRustState(res.state);
      SoundSystem.playRally();
      return true;
    }
    return false;
  }

  public sellTower(towerId: string): boolean {
    const bridge = WasmBridge.ensureSingletonReady();
    const res = bridge.sellTower(towerId);
    if (res.ok && res.state) {
      this.applyRustState(res.state);
      if (this.selectedTowerId === towerId) {
        this.selectedTowerId = null;
      }
      SoundSystem.playSell();
      return true;
    }
    return false;
  }

  public setRallyPoint(towerId: string, targetX: number, targetY: number): boolean {
    const bridge = WasmBridge.ensureSingletonReady();
    const res = bridge.setRallyPoint(towerId, targetX, targetY);
    if (res.ok && res.state) {
      this.applyRustState(res.state);
      SoundSystem.playRally();
      return true;
    }
    return false;
  }

  public syncSoldierStatsToTowerBlueprint(_soldier: SoldierEntity, _bp: TowerBlueprint): void {
    // Managed in Rust
  }

  public handleSoldierDeath(soldierId: string): void {
    const bridge = WasmBridge.ensureSingletonReady();
    const res = bridge.handleSoldierDeath(soldierId);
    if (res.ok && res.state) {
      this.applyRustState(res.state);
    }
  }

  public trySpawnHeroicSpirit(deadSoldier: SoldierEntity): boolean {
    const bridge = WasmBridge.ensureSingletonReady();
    const altars = this.towers.filter(
      (t) => t.type === 'HEROIC_ALTAR' && (!t.disabledTimer || t.disabledTimer <= 0)
    );
    let overrideChance: number | undefined;
    if (altars.length > 0) {
      altars.sort((a, b) => {
        const da = Math.hypot(deadSoldier.x - a.x, deadSoldier.y - a.y);
        const db = Math.hypot(deadSoldier.x - b.x, deadSoldier.y - b.y);
        return da - db;
      });
      overrideChance = altars[0].resurrectChance;
    }
    const res = bridge.trySpawnHeroicSpirit(deadSoldier, overrideChance);
    if (res.ok && res.state) {
      this.applyRustState(res.state);
      return true;
    }
    return false;
  }

  public recalculateTowerBuffs(): void {
    // Managed automatically in Rust
  }

  public loadSettingsFromStorage(): void {
    StorageService.applyToGameState(this);
    SoundSystem.setEnabled(this.soundEnabled);
    SoundSystem.setVolume(this.soundVolume);
  }

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
    try {
      const bridge = WasmBridge.getInstance();
      if (bridge.isAvailable()) {
        bridge.addFloatingText(text, x, y, color, size);
      }
    } catch {
      // Ignored in headless mode
    }

    if (this.floatingTexts.length >= 150) {
      return;
    }
    this.floatingTexts.push({
      id: `txt-${Date.now()}-${Math.random()}`,
      text,
      x,
      y,
      color,
      size,
      lifeTime: 0.8,
      maxLifeTime: 0.8
    });
  }

  public addExplosionParticles(_x: number, _y: number, _color: string, _count: number = 12): void {
    // Managed in Rust WebGL2
  }
}
