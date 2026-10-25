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

export class MapRenderer {
  public static renderBackground(
    ctx: CanvasRenderingContext2D,
    animTime: number,
    mapConfig: MapConfig
  ): void {
    const width = mapConfig.width || 1000;
    const height = mapConfig.height || 650;
    const { themeColor, roadColor, riverColor } = mapConfig;

    // 1. Tactical parchment background with map theme
    ctx.fillStyle = themeColor || '#1e293b';
    ctx.fillRect(0, 0, width, height);

    // Subtle tactical grid
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.5;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 2. Render Rivers (Water Paths - Multi-lane aware)
    const allWaterLanes = getResolvedWaterLanes(mapConfig);
    for (const lane of allWaterLanes) {
      this.renderRiver(ctx, lane, animTime, mapConfig.riverWidth || 38, riverColor);
    }

    // 3. Render Ground Roads (Dirt Paths - Multi-lane aware)
    const allGroundLanes = getResolvedGroundLanes(mapConfig);
    for (const lane of allGroundLanes) {
      this.renderGroundRoad(ctx, lane, mapConfig.roadWidth || 42, roadColor);
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
    ctx.font = '11px sans-serif';
    const tag = laneIdx > 0 ? `✈️ HÀNH LANG BAY #${laneIdx + 1}` : '✈️ HÀNH LANG BAY';
    ctx.fillText(tag, labelX, Math.max(20, labelY));
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

      ctx.fillStyle = '#ffffff';
      ctx.font = groundSpawns.length > 1 ? 'bold 11px sans-serif' : '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = groundSpawns.length > 1 ? `💀${idx + 1}` : '💀';
      ctx.fillText(label, gs.x, gs.y);
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

      ctx.fillStyle = '#ffffff';
      ctx.font = waterSpawns.length > 1 ? 'bold 11px sans-serif' : '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = waterSpawns.length > 1 ? `🌊${idx + 1}` : '🌊';
      ctx.fillText(label, ws.x, ws.y);
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

      ctx.fillStyle = '#ffffff';
      ctx.font = allBases.length > 1 ? 'bold 16px sans-serif' : '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = allBases.length > 1 ? `🏰${idx + 1}` : '🏰';
      ctx.fillText(label, base.x, base.y);
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
      ctx.fillStyle = '#ffffff';
      ctx.font = isTrap ? '14px sans-serif' : '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const icon = isTrap ? '⚙️' : '🏰';
      ctx.fillText(icon, mousePos.x, mousePos.y);

      // Status Tooltip above cursor
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      if (isValid) {
        ctx.fillStyle = '#22c55e';
        ctx.fillText(`✓ BẤM ĐỂ XÂY [${bp.name.toUpperCase()}] (🪙 ${bp.cost})`, mousePos.x, mousePos.y - 28);
      } else {
        ctx.fillStyle = '#ef4444';
        ctx.fillText(validation.reason || '✕ VỊ TRÍ KHÔNG HỢP LỆ', mousePos.x, mousePos.y - 28);
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
      ctx.textAlign = 'center';
      const label = selectedBuildPoint.validFor === 'TRAP' ? '📍 ĐIỂM ĐẶT BẪY' : '📍 ĐIỂM ĐẶT THÁP';
      ctx.fillText(label, selectedBuildPoint.x, selectedBuildPoint.y - 24);
      ctx.restore();
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
