import { Vector2D, TowerType } from '../types/entities.types.js';
import {
  MapConfig,
  getMapBases,
  getResolvedGroundLanes,
  getResolvedWaterLanes,
  getResolvedAirLanes,
  getUniqueLaneSpawns
} from '../config/map.config.js';
import { TOWER_BLUEPRINTS } from '../config/towers.config.js';
import { GameState } from '../core/GameState.js';
import { drawUiSvgOnCanvas } from '../config/ui/icons/index.js';

export class MapRenderer {
  private static cachedMapId: string | null = null;
  private static cachedTerrainCanvas: HTMLCanvasElement | null = null;

  public static clearCache(): void {
    this.cachedMapId = null;
    this.cachedTerrainCanvas = null;
  }

  private static getOrCreateTerrainCache(mapConfig: MapConfig): HTMLCanvasElement | null {
    if (typeof document === 'undefined') return null; // Test or headless environment
    if (this.cachedTerrainCanvas && this.cachedMapId === mapConfig.id) {
      return this.cachedTerrainCanvas;
    }

    const width = mapConfig.width || 1000;
    const height = mapConfig.height || 650;
    const { themeColor, roadColor } = mapConfig;

    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return null;

    // 1. Tactical background
    offCtx.fillStyle = themeColor || '#1e293b';
    offCtx.fillRect(0, 0, width, height);

    // Subtle tactical grid
    offCtx.strokeStyle = '#334155';
    offCtx.lineWidth = 0.5;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      offCtx.beginPath();
      offCtx.moveTo(x, 0);
      offCtx.lineTo(x, height);
      offCtx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      offCtx.beginPath();
      offCtx.moveTo(0, y);
      offCtx.lineTo(width, y);
      offCtx.stroke();
    }

    // 2. Render Ground Roads
    const allGroundLanes = getResolvedGroundLanes(mapConfig);
    for (const lane of allGroundLanes) {
      this.renderGroundRoad(offCtx, lane, mapConfig.roadWidth || 42, roadColor);
    }

    this.cachedMapId = mapConfig.id;
    this.cachedTerrainCanvas = offscreen;
    return offscreen;
  }

  public static renderBackground(
    ctx: CanvasRenderingContext2D,
    animTime: number,
    mapConfig: MapConfig
  ): void {
    const width = mapConfig.width || 1000;
    const height = mapConfig.height || 650;
    const { themeColor, roadColor, riverColor } = mapConfig;

    const terrainCache = this.getOrCreateTerrainCache(mapConfig);
    if (terrainCache) {
      ctx.drawImage(terrainCache, 0, 0);
    } else {
      // Fallback for headless testing
      ctx.fillStyle = themeColor || '#1e293b';
      ctx.fillRect(0, 0, width, height);

      const allGroundLanes = getResolvedGroundLanes(mapConfig);
      for (const lane of allGroundLanes) {
        this.renderGroundRoad(ctx, lane, mapConfig.roadWidth || 42, roadColor);
      }
    }

    // 2. Render Rivers (Water Paths - Multi-lane aware with animated dash)
    const allWaterLanes = getResolvedWaterLanes(mapConfig);
    for (const lane of allWaterLanes) {
      this.renderRiver(ctx, lane, animTime, mapConfig.riverWidth || 38, riverColor);
    }

    // 4. Render Air Corridors (Dotted warning lines - Multi-lane aware)
    const allAirLanes = getResolvedAirLanes(mapConfig);
    allAirLanes.forEach((lane, idx) => {
      this.renderAirCorridor(ctx, lane, animTime, idx);
    });

    // 5. Render Spawners & Base
    this.renderPortalsAndBase(ctx, animTime, mapConfig);
  }

  private static renderGroundRoad(
    ctx: CanvasRenderingContext2D,
    waypoints: Vector2D[],
    roadWidth: number,
    surfaceColor: string = '#b45309'
  ): void {
    if (waypoints.length < 2) return;

    // Road dark earthen border
    ctx.beginPath();
    ctx.moveTo(waypoints[0].x, waypoints[0].y);
    for (let i = 1; i < waypoints.length; i++) {
      ctx.lineTo(waypoints[i].x, waypoints[i].y);
    }
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = roadWidth + 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Road surface
    ctx.strokeStyle = surfaceColor;
    ctx.lineWidth = roadWidth;
    ctx.stroke();

    // Center dash line for sketch feel
    ctx.save();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 12]);
    ctx.stroke();
    ctx.restore();
  }

  private static renderRiver(
    ctx: CanvasRenderingContext2D,
    waypoints: Vector2D[],
    animTime: number,
    riverWidth: number,
    surfaceColor: string = '#0284c7'
  ): void {
    if (waypoints.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(waypoints[0].x, waypoints[0].y);
    for (let i = 1; i < waypoints.length; i++) {
      ctx.lineTo(waypoints[i].x, waypoints[i].y);
    }

    ctx.strokeStyle = '#0369a1';
    ctx.lineWidth = riverWidth + 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    ctx.strokeStyle = surfaceColor;
    ctx.lineWidth = riverWidth;
    ctx.stroke();

    // Water flow animation
    ctx.save();
    ctx.strokeStyle = '#7dd3fc';
    ctx.lineWidth = 2;
    ctx.lineDashOffset = -animTime * 40;
    ctx.setLineDash([14, 20]);
    ctx.stroke();
    ctx.restore();
  }

  private static renderAirCorridor(
    ctx: CanvasRenderingContext2D,
    waypoints: Vector2D[],
    animTime: number,
    laneIdx: number = 0
  ): void {
    if (!waypoints || waypoints.length < 2) return;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(waypoints[0].x, waypoints[0].y);
    for (let i = 1; i < waypoints.length; i++) {
      ctx.lineTo(waypoints[i].x, waypoints[i].y);
    }
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.28)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 10]);
    ctx.lineDashOffset = -animTime * 25 - laneIdx * 5;
    ctx.stroke();

    // Air warning icon
    const labelX = (waypoints[0].x + waypoints[1].x) / 2;
    const labelY = (waypoints[0].y + waypoints[1].y) / 2 - 12;
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const tag = laneIdx > 0 ? `HÀNH LANG BAY #${laneIdx + 1}` : 'HÀNH LANG BAY';
    const drawY = Math.max(16, labelY);
    drawUiSvgOnCanvas(ctx, 'FLY', labelX - 58, drawY - 7, 14, 14);
    ctx.fillText(tag, labelX - 40, drawY);
    ctx.restore();
  }

  private static renderPortalsAndBase(
    ctx: CanvasRenderingContext2D,
    animTime: number,
    mapConfig: MapConfig
  ): void {
    // 1. Ground spawns (Multi-spawn aware)
    const groundSpawns = getUniqueLaneSpawns(mapConfig.groundLanes);

    groundSpawns.forEach((gs, idx) => {
      ctx.save();
      const pulse = Math.sin(animTime * 4 + idx) * 2;
      // Glow ring
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(gs.x, gs.y, 22 + pulse, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(gs.x, gs.y, 18, 0, Math.PI * 2);
      ctx.fill();

      if (groundSpawns.length > 1) {
        drawUiSvgOnCanvas(ctx, 'SKULL', gs.x - 13, gs.y - 7, 14, 14);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${idx + 1}`, gs.x + 3, gs.y);
      } else {
        drawUiSvgOnCanvas(ctx, 'SKULL', gs.x - 9, gs.y - 9, 18, 18);
      }
      ctx.restore();
    });

    // 2. Water spawns (Multi-spawn aware)
    const waterSpawns = getUniqueLaneSpawns(mapConfig.waterLanes);

    waterSpawns.forEach((ws, idx) => {
      ctx.save();
      const pulse = Math.sin(animTime * 4 + idx + 1) * 2;
      // Glow ring
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ws.x, ws.y, 20 + pulse, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#0ea5e9';
      ctx.beginPath();
      ctx.arc(ws.x, ws.y, 17, 0, Math.PI * 2);
      ctx.fill();

      if (waterSpawns.length > 1) {
        drawUiSvgOnCanvas(ctx, 'WAVE', ws.x - 13, ws.y - 7, 14, 14);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${idx + 1}`, ws.x + 3, ws.y);
      } else {
        drawUiSvgOnCanvas(ctx, 'WAVE', ws.x - 8, ws.y - 8, 16, 16);
      }
      ctx.restore();
    });

    // 3. Player Base(s) (Multi-base aware)
    const allBases = getMapBases(mapConfig);
    const pulse = Math.sin(animTime * 3) * 3;

    allBases.forEach((base, idx) => {
      ctx.save();
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(base.x, base.y, base.radius + pulse, 0, Math.PI * 2);
      ctx.stroke();

      // Bastion core
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.arc(base.x, base.y, Math.min(28, base.radius - 8), 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 3;
      ctx.stroke();

      if (allBases.length > 1) {
        drawUiSvgOnCanvas(ctx, 'CASTLE', base.x - 14, base.y - 9, 18, 18);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${idx + 1}`, base.x + 6, base.y);
      } else {
        drawUiSvgOnCanvas(ctx, 'CASTLE', base.x - 11, base.y - 11, 22, 22);
      }
      ctx.restore();
    });
  }

  /**
   * Render real-time cursor feedback for Free Placement
   */
  public static renderPlacementFeedback(
    ctx: CanvasRenderingContext2D,
    state: GameState,
    animTime: number
  ): void {
    const { mousePos, activePlacementType, selectedBuildPoint } = state;

    // 1. Ghost preview when active placement type is selected
    if (activePlacementType) {
      const bpKey = activePlacementType.startsWith('TRAP_') ? activePlacementType : `${activePlacementType}_1`;
      const bp = TOWER_BLUEPRINTS[bpKey];
      if (!bp) return;

      const isTrap = activePlacementType.startsWith('TRAP_');
      const validation = state.validatePlacement(mousePos.x, mousePos.y, activePlacementType);
      const isValid = validation.valid;

      ctx.save();

      // Range indicator
      const rangeRadius = isTrap ? (bp.triggerRadius || bp.range || 40) : bp.range;
      ctx.beginPath();
      ctx.arc(mousePos.x, mousePos.y, rangeRadius, 0, Math.PI * 2);
      ctx.fillStyle = isValid ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)';
      ctx.fill();
      ctx.strokeStyle = isValid ? '#22c55e' : '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.stroke();
      ctx.restore();

      // Base footprint ring
      const baseRadius = isTrap ? 14 : 18;
      const pulse = Math.sin(animTime * 8) * 2;

      ctx.save();
      ctx.beginPath();
      ctx.arc(mousePos.x, mousePos.y, baseRadius + pulse, 0, Math.PI * 2);
      ctx.fillStyle = isValid ? 'rgba(34, 197, 94, 0.35)' : 'rgba(239, 68, 68, 0.35)';
      ctx.fill();
      ctx.strokeStyle = isValid ? '#22c55e' : '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Icon in center
      drawUiSvgOnCanvas(ctx, isTrap ? 'GEAR' : 'CASTLE', mousePos.x - 9, mousePos.y - 9, 18, 18);

      // Status Tooltip above cursor
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      if (isValid) {
        ctx.fillStyle = '#22c55e';
        ctx.fillText(`BẤM ĐỂ XÂY [${bp.name.toUpperCase()}] (${bp.cost} VÀNG)`, mousePos.x, mousePos.y - 28);
      } else {
        ctx.fillStyle = '#ef4444';
        ctx.fillText(validation.reason || 'VỊ TRÍ KHÔNG HỢP LỆ', mousePos.x, mousePos.y - 28);
      }
      ctx.restore();
    }

    // 2. Selected build marker on canvas (when player clicked empty spot)
    if (selectedBuildPoint && !activePlacementType) {
      ctx.save();
      const pulse = Math.sin(animTime * 6) * 3;
      ctx.beginPath();
      ctx.arc(selectedBuildPoint.x, selectedBuildPoint.y, 18 + pulse, 0, Math.PI * 2);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const label = selectedBuildPoint.validFor === 'TRAP' ? 'ĐIỂM ĐẶT BẪY' : 'ĐIỂM ĐẶT THÁP';
      drawUiSvgOnCanvas(ctx, 'PIN', selectedBuildPoint.x - 56, selectedBuildPoint.y - 29, 14, 14);
      ctx.fillText(label, selectedBuildPoint.x - 38, selectedBuildPoint.y - 21);
      ctx.restore();

      // If hovering over a tower option in the right panel list, preview its range!
      if (state.hoveredBuildTowerType) {
        const bpKey = state.hoveredBuildTowerType.startsWith('TRAP_')
          ? state.hoveredBuildTowerType
          : `${state.hoveredBuildTowerType}_1`;
        const bp = TOWER_BLUEPRINTS[bpKey];
        if (bp) {
          const isTrap = state.hoveredBuildTowerType.startsWith('TRAP_');
          const range = isTrap ? (bp.triggerRadius || bp.range || 40) : bp.range;

          ctx.save();
          // Animated rotating dashed range circle
          ctx.beginPath();
          ctx.arc(selectedBuildPoint.x, selectedBuildPoint.y, range, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
          ctx.fill();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.0;
          ctx.setLineDash([8, 6]);
          ctx.lineDashOffset = -animTime * 20;
          ctx.stroke();

          // Range badge with icon and name
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          drawUiSvgOnCanvas(ctx, 'TARGET', selectedBuildPoint.x - 70, selectedBuildPoint.y - range - 14, 14, 14);
          ctx.fillText(
            `Tầm bắn: ${range}px • ${bp.name}`,
            selectedBuildPoint.x - 52,
            selectedBuildPoint.y - range - 6
          );
          ctx.restore();
        }
      }
    }

    // 3. Hovering tower in list without pre-selected point: preview range at mouse cursor
    if (!selectedBuildPoint && !activePlacementType && state.hoveredBuildTowerType && mousePos.x > 0 && mousePos.y > 0) {
      const bpKey = state.hoveredBuildTowerType.startsWith('TRAP_')
        ? state.hoveredBuildTowerType
        : `${state.hoveredBuildTowerType}_1`;
      const bp = TOWER_BLUEPRINTS[bpKey];
      if (bp) {
        const isTrap = state.hoveredBuildTowerType.startsWith('TRAP_');
        const range = isTrap ? (bp.triggerRadius || bp.range || 40) : bp.range;
        ctx.save();
        ctx.beginPath();
        ctx.arc(mousePos.x, mousePos.y, range, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        drawUiSvgOnCanvas(ctx, 'TARGET', mousePos.x - 60, mousePos.y - range - 12, 13, 13);
        ctx.fillText(`Tầm: ${range}px • ${bp.name}`, mousePos.x - 44, mousePos.y - range - 5);
        ctx.restore();
      }
    }

    // 4. Selected tower range and rally point indicator
    if (state.selectedTowerId && !activePlacementType && !selectedBuildPoint) {
      const selectedTower = state.getSelectedTower();
      if (selectedTower) {
        ctx.save();

        const isTrap = selectedTower.placement !== 'ROADSIDE';
        const range = isTrap
          ? (selectedTower.triggerRadius || selectedTower.range || 40)
          : selectedTower.range;

        // Animated dashed range circle
        ctx.beginPath();
        ctx.arc(selectedTower.x, selectedTower.y, range, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([8, 6]);
        ctx.lineDashOffset = -animTime * 16;
        ctx.stroke();

        // Pulsing base ring around selected tower
        const pulse = Math.sin(animTime * 6) * 2;
        ctx.beginPath();
        ctx.arc(selectedTower.x, selectedTower.y, 22 + pulse, 0, Math.PI * 2);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.0;
        ctx.setLineDash([4, 4]);
        ctx.stroke();

        // Range badge above the circle
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`TẦM ĐÁNH: ${range}px`, selectedTower.x, selectedTower.y - range - 8);

        // If Summon tower (Barracks, Dragon Nest, Fairy Tree, Heroic Altar), draw line to established Rally Point
        const isSummon =
          selectedTower.type === 'BARRACKS' ||
          selectedTower.type === 'DRAGON_NEST' ||
          selectedTower.type === 'FAIRY_TREE' ||
          selectedTower.type === 'HEROIC_ALTAR';

        if (isSummon && selectedTower.rallyPoint && !state.isSettingRallyPoint) {
          if (selectedTower.rallyPoint.x > 0 && selectedTower.rallyPoint.y > 0) {
            ctx.beginPath();
            ctx.moveTo(selectedTower.x, selectedTower.y);
            ctx.lineTo(selectedTower.rallyPoint.x, selectedTower.rallyPoint.y);
            ctx.strokeStyle = 'rgba(234, 179, 8, 0.75)';
            ctx.lineWidth = 2.0;
            ctx.setLineDash([5, 5]);
            ctx.stroke();

            // Rally flag / marker
            ctx.beginPath();
            ctx.arc(selectedTower.rallyPoint.x, selectedTower.rallyPoint.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(234, 179, 8, 0.35)';
            ctx.fill();
            ctx.strokeStyle = '#eab308';
            ctx.lineWidth = 2.0;
            ctx.stroke();
            drawUiSvgOnCanvas(ctx, 'FLAG', selectedTower.rallyPoint.x - 7, selectedTower.rallyPoint.y - 18, 14, 14);
          }
        }

        // Setting Rally Point: line from tower to mouse cursor only
        if (state.isSettingRallyPoint && mousePos.x > 0 && mousePos.y > 0) {
          const dist = Math.hypot(mousePos.x - selectedTower.x, mousePos.y - selectedTower.y);
          const inRange = dist <= selectedTower.range;
          ctx.beginPath();
          ctx.moveTo(selectedTower.x, selectedTower.y);
          ctx.lineTo(mousePos.x, mousePos.y);
          ctx.strokeStyle = inRange ? 'rgba(34, 197, 94, 0.85)' : 'rgba(239, 68, 68, 0.85)';
          ctx.lineWidth = 2.0;
          ctx.setLineDash([4, 4]);
          ctx.stroke();

          // Target reticle at cursor
          ctx.beginPath();
          ctx.arc(mousePos.x, mousePos.y, 8, 0, Math.PI * 2);
          ctx.fillStyle = inRange ? 'rgba(34, 197, 94, 0.35)' : 'rgba(239, 68, 68, 0.35)';
          ctx.fill();
          ctx.strokeStyle = inRange ? '#22c55e' : '#ef4444';
          ctx.lineWidth = 2.0;
          ctx.stroke();

          ctx.font = 'bold 12px sans-serif';
          ctx.fillStyle = inRange ? '#22c55e' : '#ef4444';
          ctx.fillText(
            inRange ? 'BẤM ĐỂ ĐẶT ĐIỂM TẬP KẾT' : 'NGOÀI PHẠM VI ĐIỀU ĐỘNG',
            mousePos.x,
            mousePos.y - 18
          );
        }

        ctx.restore();
      }
    }
  }

  /**
   * Backwards compatible slot rendering if map has legacy slots
   */
  public static renderSlots(
    _ctx: CanvasRenderingContext2D,
    _slots: any[],
    _selectedSlotId: string | null,
    _activePlacementType: TowerType | null = null,
    _hoveredSlotId: string | null = null,
    _animTime: number = 0
  ): void {
    // Empty as free placement replaces static slots
  }
}
