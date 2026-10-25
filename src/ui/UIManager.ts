import { GameState } from '../core/GameState.js';
import { TowerType } from '../types/entities.types.js';
import { SideDetailPanel } from './SideDetailPanel.js';
import { SettingsModal } from './modals/SettingsModal.js';
import { MapSelectionModal } from './modals/MapSelectionModal.js';
import { HUDManager } from './hud/HUDManager.js';
import { ArsenalBar } from './hud/ArsenalBar.js';
import { InspectorPanel } from './inspector/InspectorPanel.js';

export class UIManager {
  private sidePanel: SideDetailPanel;
  private settingsModal: SettingsModal;
  private mapModal: MapSelectionModal;
  private hudManager: HUDManager;
  private arsenalBar: ArsenalBar;
  private inspector: InspectorPanel;

  constructor(
    private state: GameState,
    private onCallWave: () => void,
    private onRestart: () => void,
    private onSelectMap: (mapId: string) => void
  ) {
    this.sidePanel = new SideDetailPanel();
    this.settingsModal = new SettingsModal(this.state);
    this.mapModal = new MapSelectionModal(
      this.state,
      (mapId) => this.onSelectMap(mapId),
      () => this.hudManager.clearBanner()
    );
    this.hudManager = new HUDManager(this.state, {
      onCallWave: () => this.onCallWave(),
      onRestart: () => this.onRestart(),
      onOpenMapModal: () => this.openMapModal(),
      onSelectMap: (mapId) => this.onSelectMap(mapId)
    });
    this.arsenalBar = new ArsenalBar(this.state, () => {
      this.inspector.handleResize();
    });
    this.inspector = new InspectorPanel(
      this.state,
      this.sidePanel,
      () => {
        this.arsenalBar.updateArsenalVisuals();
      },
      () => this.openMapModal()
    );

    this.bindKeyboard();
    this.bindCodexTriggers();
    this.bindStageInfoTrigger();
  }

  public handleResize(): void {
    this.inspector.handleResize();
  }

  public openSettingsModal(): void {
    this.settingsModal.open();
  }

  public closeSettingsModal(): void {
    this.settingsModal.close();
  }

  public openMapModal(): void {
    this.mapModal.open();
  }

  public closeMapModal(): void {
    this.mapModal.close();
  }

  public updateArsenalVisuals(): void {
    this.arsenalBar.updateArsenalVisuals();
  }

  public updateHotbarVisuals(): void {
    this.arsenalBar.updateHotbarVisuals();
  }

  public updateHUD(currentWave: number, totalWaves: number, isWaveRunning: boolean): void {
    this.hudManager.updateHUD(currentWave, totalWaves, isWaveRunning);
    this.arsenalBar.updateArsenalVisuals();
    this.inspector.render(currentWave, totalWaves, isWaveRunning);
  }

  private bindStageInfoTrigger(): void {
    const stageInfoBtn = document.getElementById('btn-stage-info');
    if (stageInfoBtn) {
      stageInfoBtn.addEventListener('click', () => {
        this.inspector.openStageInfo();
        this.arsenalBar.updateArsenalVisuals();
      });
    }
  }

  private bindCodexTriggers(): void {
    const codexBtn = document.getElementById('btn-codex');
    if (codexBtn) {
      codexBtn.addEventListener('click', () => {
        this.sidePanel.toggle();
      });
    }

    // Delegate clicks for quick codex buttons throughout the UI
    document.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('[data-open-codex]');
      if (target) {
        const cat = target.getAttribute('data-open-codex') || 'BUILDINGS';
        const subTarget = target.getAttribute('data-codex-target') || undefined;
        this.sidePanel.open(cat, subTarget);
      }
    });
  }

  private bindKeyboard(): void {
    window.addEventListener('keydown', (e) => {
      // Ignore if user typing in input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      const key = e.key.toUpperCase();

      // Escape key to deselect, cancel placement, cancel rally point or close side panel/modals
      if (key === 'ESCAPE') {
        if (this.sidePanel.isOpen()) {
          this.sidePanel.close();
          return;
        }
        const mapModalBackdrop = document.getElementById('map-modal-backdrop');
        if (mapModalBackdrop && !mapModalBackdrop.classList.contains('hidden')) {
          this.closeMapModal();
          return;
        }
        const settingsModalBackdrop = document.getElementById('settings-modal-backdrop');
        if (settingsModalBackdrop && !settingsModalBackdrop.classList.contains('hidden')) {
          this.closeSettingsModal();
          return;
        }
        this.state.hoveredBuildTowerType = null;
        if (this.state.isSettingRallyPoint) {
          this.state.isSettingRallyPoint = false;
        }
        if (this.state.activePlacementType) {
          this.state.activePlacementType = null;
          this.arsenalBar.updateArsenalVisuals();
        }
        if (this.state.selectedBuildPoint) {
          this.state.selectedBuildPoint = null;
        }
        if (this.state.selectedTowerId) {
          this.state.selectedTowerId = null;
        }
        this.inspector.handleResize();
        return;
      }

      // Space to start/call wave
      if (key === ' ' || e.code === 'Space') {
        e.preventDefault();
        this.onCallWave();
        return;
      }

      // Hotkey 'B' or 'C' for Codex
      if (key === 'B' || key === 'C') {
        this.sidePanel.toggle();
        return;
      }

      // Hotkey 'M' for Mute/Unmute sound
      if (key === 'M') {
        this.hudManager.toggleSound();
        return;
      }

      // Hotkeys [1] to [7] and [8]-[0],[-] for building selection
      const keyMap: Record<string, TowerType> = {
        '1': 'ARCHER',
        '2': 'MAGE',
        '3': 'ARTILLERY',
        '4': 'BARRACKS',
        '5': 'DRAGON_NEST',
        '6': 'FAIRY_TREE',
        '7': 'HEROIC_ALTAR',
        '8': 'TRAP_SPIKE',
        '9': 'TRAP_FIRE',
        '0': 'TRAP_FROST',
        '-': 'TRAP_NET'
      };

      if (keyMap[key]) {
        const type = keyMap[key];
        if (this.state.activePlacementType === type) {
          this.state.activePlacementType = null;
        } else {
          this.state.activePlacementType = type;
          this.state.selectedSlotId = null;
          this.state.selectedTowerId = null;
          this.state.selectedBuildPoint = null;
          this.state.isSettingRallyPoint = false;
        }
        this.arsenalBar.updateArsenalVisuals();
        this.inspector.handleResize();
      }
    });
  }
}
