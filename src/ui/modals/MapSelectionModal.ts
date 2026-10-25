import { GameState } from '../../core/GameState.js';
import {
  MAPS_CONFIG,
  MapConfig,
  getMapBases,
  getResolvedGroundLanes,
  getResolvedWaterLanes,
  getResolvedAirLanes,
  getUniqueLaneSpawns
} from '../../config/map.config.js';
import { ELEMENT_ICONS, ELEMENT_NAMES } from '../../config/elements.config.js';

export class MapSelectionModal {
  private backdropEl: HTMLElement | null;
  private cardsGridEl: HTMLElement | null;

  constructor(
    private state: GameState,
    private onSelectMap: (mapId: string) => void,
    private onBeforeSelectMap?: () => void
  ) {
    this.backdropEl = typeof document !== 'undefined' ? document.getElementById('map-modal-backdrop') : null;
    this.cardsGridEl = typeof document !== 'undefined' ? document.getElementById('map-cards-grid') : null;
    this.bindEvents();
  }

  private bindEvents(): void {
    if (typeof document === 'undefined') return;
    const selectMapBtn = document.getElementById('btn-select-map');
    const closeMapModalBtn = document.getElementById('btn-close-map-modal');

    if (selectMapBtn) {
      selectMapBtn.addEventListener('click', () => {
        this.open();
      });
    }

    if (closeMapModalBtn) {
      closeMapModalBtn.addEventListener('click', () => {
        this.close();
      });
    }

    if (this.backdropEl) {
      this.backdropEl.addEventListener('click', (e) => {
        if (e.target === this.backdropEl) {
          this.close();
        }
      });
    }
  }

  public open(): void {
    if (!this.backdropEl || !this.cardsGridEl) return;
    this.renderMapCards();
    this.backdropEl.classList.remove('hidden');
  }

  public close(): void {
    if (this.backdropEl) {
      this.backdropEl.classList.add('hidden');
    }
  }

  public renderMapCards(): void {
    if (!this.cardsGridEl) return;

    this.cardsGridEl.innerHTML = MAPS_CONFIG.map((m) => {
      const isSelected = m.id === this.state.currentMapId;
      const totalWaves = this.state.customTotalWaves;
      const badges = m.laneBadges || ['1 Đường Bộ', '1 Đường Thủy'];
      const tribe = m.tribe;

      return `
        <div class="map-card ${isSelected ? 'active-map' : ''}" data-map-id="${m.id}">
          <div class="map-card-header">
            <div class="map-card-title-group">
              <span class="map-card-name">${m.name}</span>
              <span class="map-card-sub">${m.subtitle}</span>
            </div>
            <span class="current-map-waves-badge">⚔️ ${totalWaves} Đợt (Cài đặt)</span>
          </div>

          <div class="map-preview-box">
            ${this.generateMiniMapSvg(m)}
          </div>

          ${
            tribe
              ? `
              <div class="map-tribe-box" style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(250, 204, 21, 0.35); border-radius: 6px; padding: 6px 8px; margin: 6px 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                  <span style="font-size: 12px; font-weight: 700; color: #facc15;">${tribe.icon} ${tribe.name}</span>
                  <div style="display: flex; gap: 4px;">
                    ${tribe.elements.map((el) => `<span title="${ELEMENT_NAMES[el]}" style="font-size: 13px;">${ELEMENT_ICONS[el]}</span>`).join('')}
                  </div>
                </div>
                <p style="font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.3;">${tribe.description}</p>
              </div>
            `
              : ''
          }

          <div class="map-lane-badges-container">
            ${badges.map((b) => `<span class="map-lane-pill">🛡️ ${b}</span>`).join('')}
          </div>

          <p class="map-card-desc">${m.description}</p>

          <button class="action-btn select-map-action-btn ${isSelected ? 'current-btn' : ''}">
            ${isSelected ? '✓ Đang Chơi' : '⚔️ Chọn Bản Đồ Này'}
          </button>
        </div>
      `;
    }).join('');

    this.cardsGridEl.querySelectorAll('.map-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const mapId = target.getAttribute('data-map-id');
        if (mapId) {
          if (this.onBeforeSelectMap) {
            this.onBeforeSelectMap();
          }
          this.onSelectMap(mapId);
          this.close();
        }
      });
    });
  }

  public generateMiniMapSvg(map: MapConfig): string {
    return MapSelectionModal.generateMiniMapSvg(map);
  }

  public static generateMiniMapSvg(map: MapConfig): string {
    const scale = 0.24;
    const width = map.width || 1000;
    const height = map.height || 650;
    const w = Math.round(width * scale);
    const h = Math.round(height * scale);

    const toSvgPath = (pts: { x: number; y: number }[]) => {
      if (!pts || pts.length === 0) return '';
      return pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${Math.round(p.x * scale)} ${Math.round(p.y * scale)}`).join(' ');
    };

    const allGround = getResolvedGroundLanes(map);
    const allWater = getResolvedWaterLanes(map);
    const allAir = getResolvedAirLanes(map);

    const groundPathsSvg = allGround
      .map(
        (lane) => `
        <path d="${toSvgPath(lane)}" fill="none" stroke="${map.roadColor || '#b45309'}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
        <path d="${toSvgPath(lane)}" fill="none" stroke="#d97706" stroke-width="1.2" stroke-dasharray="3,3" />
      `
      )
      .join('');

    const waterPathsSvg = allWater
      .map(
        (lane) => `
        <path d="${toSvgPath(lane)}" fill="none" stroke="${map.riverColor || '#0284c7'}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
      `
      )
      .join('');

    const airPathsSvg = allAir
      .map(
        (lane) => `
        <path d="${toSvgPath(lane)}" fill="none" stroke="rgba(52, 211, 153, 0.45)" stroke-width="1.5" stroke-dasharray="2,3" />
      `
      )
      .join('');

    const groundSpawns = getUniqueLaneSpawns(map.groundLanes);

    const groundSpawnsSvg = groundSpawns
      .map(
        (sp) => `
        <circle cx="${Math.round(sp.x * scale)}" cy="${Math.round(sp.y * scale)}" r="4" fill="#ef4444" />
      `
      )
      .join('');

    const waterSpawns = getUniqueLaneSpawns(map.waterLanes);

    const waterSpawnsSvg = waterSpawns
      .map(
        (sp) => `
        <circle cx="${Math.round(sp.x * scale)}" cy="${Math.round(sp.y * scale)}" r="3.5" fill="#0ea5e9" />
      `
      )
      .join('');

    const allBases = getMapBases(map);
    const basesSvg = allBases
      .map(
        (b) => `
        <circle cx="${Math.round(b.x * scale)}" cy="${Math.round(b.y * scale)}" r="6" fill="#1e3a8a" stroke="#60a5fa" stroke-width="1.5" />
      `
      )
      .join('');

    return `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" class="mini-map-svg">
        <rect width="${w}" height="${h}" fill="${map.themeColor || '#1e293b'}" rx="6" />
        <!-- Rivers -->
        ${waterPathsSvg}
        <!-- Roads -->
        ${groundPathsSvg}
        <!-- Air lines -->
        ${airPathsSvg}
        <!-- Spawners & Base -->
        ${groundSpawnsSvg}
        ${waterSpawnsSvg}
        ${basesSvg}
      </svg>
    `;
  }
}
