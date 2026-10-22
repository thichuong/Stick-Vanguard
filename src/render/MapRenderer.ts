import { TowerSlot, Vector2D, TowerType } from '../types/entities.types.js';
import { MAP_CONFIG } from '../config/map.config.js';
import { TOWER_BLUEPRINTS } from '../config/towers.config.js';

export class MapRenderer {
  public static renderBackground(
    ctx: CanvasRenderingContext2D,
    animTime: number
  ): void {
    const { width, height } = MAP_CONFIG;

    // 1. Paper / tactical parchment background
    ctx.fillStyle = '#1e293b'; // Slate dark battlefield
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

    // 2. Render River (Water Path)
    this.renderRiver(ctx, MAP_CONFIG.waterWaypoints, animTime);

    // 3. Render Ground Road (Dirt Path)
    this.renderGroundRoad(ctx, MAP_CONFIG.groundWaypoints);

    // 4. Render Air Corridor (Dotted warning line)
    this.renderAirCorridor(ctx, MAP_CONFIG.airWaypoints, animTime);

    // 5. Render Spawners & Base
    this.renderPortalsAndBase(ctx, animTime);
  }

  private static renderGroundRoad(
    ctx: CanvasRenderingContext2D,
    waypoints: Vector2D[]
  ): void {
    if (waypoints.length < 2) return;

    // Road base
    ctx.beginPath();
    ctx.moveTo(waypoints[0].x, waypoints[0].y);
    for (let i = 1; i < waypoints.length; i++) {
      ctx.lineTo(waypoints[i].x, waypoints[i].y);
    }
    ctx.strokeStyle = '#78350f'; // Dark earthen border
    ctx.lineWidth = 42;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    ctx.strokeStyle = '#b45309'; // Earthen road surface
    ctx.lineWidth = 36;
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
    animTime: number
  ): void {
    if (waypoints.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(waypoints[0].x, waypoints[0].y);
    for (let i = 1; i < waypoints.length; i++) {
      ctx.lineTo(waypoints[i].x, waypoints[i].y);
    }

    ctx.strokeStyle = '#0369a1';
    ctx.lineWidth = 38;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 30;
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
    animTime: number
  ): void {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(waypoints[0].x, waypoints[0].y);
    for (let i = 1; i < waypoints.length; i++) {
      ctx.lineTo(waypoints[i].x, waypoints[i].y);
    }
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.28)'; // Translucent green air vector
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 10]);
    ctx.lineDashOffset = -animTime * 25;
    ctx.stroke();

    // Air warning icon
    ctx.fillStyle = '#34d399';
    ctx.font = '13px sans-serif';
    ctx.fillText('✈️ HÀNH LANG BAY', 120, 85);
    ctx.restore();
  }

  private static renderPortalsAndBase(
    ctx: CanvasRenderingContext2D,
    animTime: number
  ): void {
    // Ground spawn
    const gs = MAP_CONFIG.groundSpawn;
    ctx.save();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(gs.x, gs.y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💀', gs.x, gs.y);
    ctx.restore();

    // Water spawn
    const ws = MAP_CONFIG.waterSpawn;
    ctx.save();
    ctx.fillStyle = '#0ea5e9';
    ctx.beginPath();
    ctx.arc(ws.x, ws.y + 16, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🌊', ws.x, ws.y + 16);
    ctx.restore();

    // Player Base (Gate)
    const base = MAP_CONFIG.playerBase;
    const pulse = Math.sin(animTime * 3) * 3;

    ctx.save();
    // Glowing perimeter
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(base.x, base.y, base.radius + pulse, 0, Math.PI * 2);
    ctx.stroke();

    // Bastion core
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.arc(base.x, base.y, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏰', base.x, base.y);
    ctx.restore();
  }

  public static renderSlots(
    ctx: CanvasRenderingContext2D,
    slots: TowerSlot[],
    selectedSlotId: string | null,
    activePlacementType: TowerType | null = null,
    hoveredSlotId: string | null = null,
    animTime: number = 0
  ): void {
    for (const slot of slots) {
      if (slot.currentTowerId) continue; // Tower already placed

      const isSelected = slot.id === selectedSlotId;
      const isHovered = slot.id === hoveredSlotId;

      // Check if slot matches active placement type
      let isValidForPlacement = false;
      if (activePlacementType) {
        const bp = TOWER_BLUEPRINTS[activePlacementType.startsWith('TRAP_') ? activePlacementType : `${activePlacementType}_1`];
        if (bp) {
          if (bp.placement === slot.placement) {
            isValidForPlacement = true;
          } else if (bp.type === 'TRAP_FROST' && (slot.placement === 'PATH_TRAP' || slot.placement === 'WATER_TRAP')) {
            isValidForPlacement = true;
          }
        }
      }

      ctx.save();

      // Highlight glowing ring for valid slots during placement
      if (isValidForPlacement) {
        const pulse = Math.sin(animTime * 6) * 4;
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(slot.x, slot.y, 22 + pulse, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Preview range on hover when placing
      if (isHovered && activePlacementType) {
        const bp = TOWER_BLUEPRINTS[activePlacementType.startsWith('TRAP_') ? activePlacementType : `${activePlacementType}_1`];
        if (bp && isValidForPlacement) {
          ctx.save();
          ctx.strokeStyle = 'rgba(34, 197, 94, 0.7)';
          ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.arc(slot.x, slot.y, bp.range, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Tooltip
          ctx.fillStyle = '#22c55e';
          ctx.font = 'bold 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`BẤM ĐỂ XÂY ${bp.name.toUpperCase()}`, slot.x, slot.y - 28);
          ctx.restore();
        }
      }

      if (slot.placement === 'ROADSIDE') {
        // Roadside stone pad
        ctx.fillStyle = isSelected ? '#3b82f6' : isHovered ? '#475569' : '#334155';
        ctx.beginPath();
        ctx.arc(slot.x, slot.y, isHovered ? 19 : 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#93c5fd' : isHovered ? '#60a5fa' : '#64748b';
        ctx.lineWidth = isHovered ? 3 : 2;
        ctx.stroke();

        ctx.fillStyle = isSelected ? '#ffffff' : '#94a3b8';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('+', slot.x, slot.y);
      } else if (slot.placement === 'PATH_TRAP') {
        // Road Trap Diamond
        ctx.save();
        ctx.translate(slot.x, slot.y);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = isSelected ? '#f59e0b' : isHovered ? '#92400e' : '#78350f';
        const dSize = isHovered ? 26 : 22;
        ctx.fillRect(-dSize / 2, -dSize / 2, dSize, dSize);
        ctx.strokeStyle = isSelected ? '#fde047' : isHovered ? '#fbbf24' : '#d97706';
        ctx.lineWidth = isHovered ? 3 : 2;
        ctx.strokeRect(-dSize / 2, -dSize / 2, dSize, dSize);
        ctx.restore();

        ctx.fillStyle = '#ffffff';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚙️', slot.x, slot.y);
      } else if (slot.placement === 'WATER_TRAP') {
        // Water Buoy
        ctx.fillStyle = isSelected ? '#38bdf8' : isHovered ? '#0284c7' : '#0369a1';
        ctx.beginPath();
        ctx.arc(slot.x, slot.y, isHovered ? 17 : 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = isHovered ? '#bae6fd' : '#7dd3fc';
        ctx.lineWidth = isHovered ? 3 : 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚓', slot.x, slot.y);
      }

      ctx.restore();
    }
  }
}

