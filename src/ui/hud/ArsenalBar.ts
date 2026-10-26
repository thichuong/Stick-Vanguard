import { GameState } from '../../core/GameState.js';
import { TOWER_BLUEPRINTS } from '../../config/towers.config.js';
import { TowerType } from '../../types/entities.types.js';
import { UI_ICONS } from '../../config/ui/icons/index.js';

export class ArsenalBar {
  private placementHintEl: HTMLElement | null;
  private lastArsenalKey: string = '';

  constructor(
    private state: GameState,
    private onPlacementChanged: () => void
  ) {
    this.placementHintEl = document.getElementById('placement-hint');
    this.bindEvents();
  }

  private bindEvents(): void {
    const hotbarBtns = document.querySelectorAll('.hotbar-btn');
    hotbarBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const type = target.getAttribute('data-type') as TowerType;
        if (!type) return;

        // Toggle selection
        if (this.state.activePlacementType === type) {
          this.state.activePlacementType = null;
        } else {
          this.state.activePlacementType = type;
          this.state.selectedSlotId = null;
          this.state.selectedTowerId = null;
          this.state.selectedBuildPoint = null;
          this.state.isSettingRallyPoint = false;
        }

        this.updateArsenalVisuals();
        this.onPlacementChanged();
      });
    });
  }

  public updateArsenalVisuals(): void {
    const key = `${this.state.gold}_${this.state.activePlacementType}_${this.state.selectedBuildPoint?.validFor}_${this.state.selectedBuildPoint?.x}_${this.state.selectedBuildPoint?.y}`;
    if (key === this.lastArsenalKey) {
      return;
    }
    this.lastArsenalKey = key;

    const hotbarBtns = document.querySelectorAll('.hotbar-btn');
    hotbarBtns.forEach((btn) => {
      const type = btn.getAttribute('data-type') as TowerType;
      const bp = TOWER_BLUEPRINTS[type.startsWith('TRAP_') ? type : `${type}_1`];

      if (this.state.activePlacementType === type) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }

      if (bp && this.state.gold < bp.cost) {
        btn.classList.add('disabled');
      } else {
        btn.classList.remove('disabled');
      }
    });

    if (this.placementHintEl) {
      if (this.state.activePlacementType) {
        const isTrap = this.state.activePlacementType.startsWith('TRAP_');
        const bp = TOWER_BLUEPRINTS[isTrap ? this.state.activePlacementType : `${this.state.activePlacementType}_1`];
        this.placementHintEl.innerHTML = isTrap
          ? `${UI_ICONS.PIN} ĐẶT [${bp?.name.toUpperCase()}]: Nhấp vào ĐƯỜNG ĐI hoặc DÒNG SÔNG để đặt (ESC hủy)`
          : `${UI_ICONS.PIN} ĐẶT [${bp?.name.toUpperCase()}]: Nhấp vào ĐẤT TRỐNG (ngoài đường & sông) để xây (ESC hủy)`;
        this.placementHintEl.classList.add('highlight');
      } else if (this.state.selectedBuildPoint) {
        this.placementHintEl.innerHTML = this.state.selectedBuildPoint.validFor === 'TRAP'
          ? `${UI_ICONS.TARGET} ĐÃ CHỌN TỌA ĐỘ TRÊN ĐƯỜNG/SÔNG. Bấm chọn Bẫy [8]-[0],[-] ở bảng bên phải để đặt!`
          : `${UI_ICONS.TARGET} ĐÃ CHỌN TỌA ĐỘ TRÊN ĐẤT. Chọn Tháp Phòng Ngự [1]-[3] hoặc Tháp Triệu Hồi [4]-[7] ở bảng bên phải!`;
        this.placementHintEl.classList.add('highlight');
      } else {
        this.placementHintEl.textContent = 'Chọn tháp từ bảng bên phải [1]-[7] hoặc bẫy [8]-[0],[-] rồi nhấp vào bản đồ để xây';
        this.placementHintEl.classList.remove('highlight');
      }
    }
  }

  public updateHotbarVisuals(): void {
    this.updateArsenalVisuals();
  }

  /**
   * Helper to retrieve live summoned units information for any summon tower.
   * Enables UI components to access real-time health, armor, state and count.
   */
  public getLiveSummonedUnits(towerId: string) {
    return this.state.soldiers.filter((s) => s.towerId === towerId);
  }
}

