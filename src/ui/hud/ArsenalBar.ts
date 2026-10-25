import { GameState } from '../../core/GameState.js';
import { TOWER_BLUEPRINTS } from '../../config/towers.config.js';
import { TowerType } from '../../types/entities.types.js';

export class ArsenalBar {
  private placementHintEl: HTMLElement | null;

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
        this.placementHintEl.textContent = isTrap
          ? `📍 ĐẶT [${bp?.name.toUpperCase()}]: Nhấp vào ĐƯỜNG ĐI hoặc DÒNG SÔNG để đặt (ESC hủy)`
          : `📍 ĐẶT [${bp?.name.toUpperCase()}]: Nhấp vào ĐẤT TRỐNG (ngoài đường & sông) để xây (ESC hủy)`;
        this.placementHintEl.classList.add('highlight');
      } else if (this.state.selectedBuildPoint) {
        this.placementHintEl.textContent = this.state.selectedBuildPoint.validFor === 'TRAP'
          ? '🎯 ĐÃ CHỌN TỌA ĐỘ TRÊN ĐƯỜNG/SÔNG. Bấm chọn Bẫy [5]-[8] bên dưới để đặt!'
          : '🎯 ĐÃ CHỌN TỌA ĐỘ TRÊN ĐẤT. Bấm chọn Tháp [1]-[4] bên dưới để xây!';
        this.placementHintEl.classList.add('highlight');
      } else {
        this.placementHintEl.textContent = 'Đặt tự do: Tháp đặt ngoài đường/sông | Bẫy đặt trên đường hoặc dưới sông [1]-[8]';
        this.placementHintEl.classList.remove('highlight');
      }
    }
  }

  public updateHotbarVisuals(): void {
    this.updateArsenalVisuals();
  }
}

