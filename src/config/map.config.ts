import { Vector2D, TowerSlot } from '../types/entities.types.js';
import { ElementType } from '../types/elements.types.js';
import {
  MAPS_CONFIG,
  MAP_VALLEY_ORIGIN,
  WAVES_VALLEY_ORIGIN,
  MAP_TWIN_CROSSROADS,
  WAVES_TWIN_CROSSROADS,
  MAP_SERPENT_CANYON,
  WAVES_SERPENT_CANYON,
  MAP_DELTA_FORTRESS,
  WAVES_DELTA_FORTRESS,
  MAP_INFERNAL_CALDERA,
  WAVES_INFERNAL_CALDERA,
  MAP_FROZEN_CITADEL,
  WAVES_FROZEN_CITADEL,
  MAP_ANCIENT_NECROPOLIS,
  WAVES_ANCIENT_NECROPOLIS,
  MAP_PLAGUE_MORASS,
  WAVES_PLAGUE_MORASS,
  WAVES_EXTENDED_POST_10
} from './maps/index.js';

export interface WaveEnemyEntry {
  typeId: string;
  count: number;
  interval: number; // seconds between spawns
  delay: number;    // seconds before starting this group
}

export interface WaveConfig {
  waveNumber: number;
  name: string;
  rewardGold: number;
  enemies: WaveEnemyEntry[];
}

export interface MapTribeConfig {
  name: string;
  icon: string;
  elements: ElementType[];
  description: string;
}

export interface MapConfig {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  themeColor: string;
  roadColor: string;
  riverColor: string;
  width: number;
  height: number;
  groundWaypoints: Vector2D[];
  waterWaypoints: Vector2D[];
  airStart: Vector2D;
  airWaypoints: Vector2D[];
  playerBase: { x: number; y: number; radius: number };
  groundSpawn: Vector2D;
  waterSpawn: Vector2D;
  roadWidth: number;
  riverWidth: number;
  towerSlots: TowerSlot[];
  waves: WaveConfig[];
  // Multi-Lane Architecture
  groundLanes?: Vector2D[][];
  waterLanes?: Vector2D[][];
  airLanes?: Vector2D[][];
  groundSpawns?: Vector2D[];
  waterSpawns?: Vector2D[];
  airStarts?: Vector2D[];
  laneBadges?: string[];
  tribe?: MapTribeConfig;
}

// Distance helper from point (px, py) to segment (x1, y1)-(x2, y2)
export function getDistanceToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): { distance: number; closestPoint: Vector2D } {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    return {
      distance: Math.hypot(px - x1, py - y1),
      closestPoint: { x: x1, y: y1 }
    };
  }

  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;

  return {
    distance: Math.hypot(px - projX, py - projY),
    closestPoint: { x: projX, y: projY }
  };
}

// Distance from point (px, py) to continuous polyline
export function getDistanceToPolyline(
  px: number,
  py: number,
  waypoints: Vector2D[]
): { distance: number; closestPoint: Vector2D } {
  if (!waypoints || waypoints.length === 0) {
    return { distance: Infinity, closestPoint: { x: px, y: py } };
  }
  if (waypoints.length === 1) {
    return {
      distance: Math.hypot(px - waypoints[0].x, py - waypoints[0].y),
      closestPoint: { ...waypoints[0] }
    };
  }

  let minDistance = Infinity;
  let closestPoint = { ...waypoints[0] };

  for (let i = 0; i < waypoints.length - 1; i++) {
    const p1 = waypoints[i];
    const p2 = waypoints[i + 1];
    const res = getDistanceToSegment(px, py, p1.x, p1.y, p2.x, p2.y);
    if (res.distance < minDistance) {
      minDistance = res.distance;
      closestPoint = res.closestPoint;
    }
  }

  return { distance: minDistance, closestPoint };
}

// Distance from point (px, py) to multiple polylines (multi-lane check)
export function getDistanceToPolylines(
  px: number,
  py: number,
  polylines: Vector2D[][]
): { distance: number; closestPoint: Vector2D; laneIndex: number } {
  if (!polylines || polylines.length === 0) {
    return { distance: Infinity, closestPoint: { x: px, y: py }, laneIndex: -1 };
  }

  let minDistance = Infinity;
  let closestPoint: Vector2D = { x: px, y: py };
  let bestLaneIndex = 0;

  for (let i = 0; i < polylines.length; i++) {
    const lane = polylines[i];
    if (!lane || lane.length === 0) continue;
    const res = getDistanceToPolyline(px, py, lane);
    if (res.distance < minDistance) {
      minDistance = res.distance;
      closestPoint = res.closestPoint;
      bestLaneIndex = i;
    }
  }

  return { distance: minDistance, closestPoint, laneIndex: bestLaneIndex };
}

// Re-export all individual maps and configurations
export {
  MAPS_CONFIG,
  MAP_VALLEY_ORIGIN,
  WAVES_VALLEY_ORIGIN,
  MAP_TWIN_CROSSROADS,
  WAVES_TWIN_CROSSROADS,
  MAP_SERPENT_CANYON,
  WAVES_SERPENT_CANYON,
  MAP_DELTA_FORTRESS,
  WAVES_DELTA_FORTRESS,
  MAP_INFERNAL_CALDERA,
  WAVES_INFERNAL_CALDERA,
  MAP_FROZEN_CITADEL,
  WAVES_FROZEN_CITADEL,
  MAP_ANCIENT_NECROPOLIS,
  WAVES_ANCIENT_NECROPOLIS,
  MAP_PLAGUE_MORASS,
  WAVES_PLAGUE_MORASS,
  WAVES_EXTENDED_POST_10
};

export const MAP_CONFIG = MAPS_CONFIG[0];
export const WAVES_CONFIG = MAP_CONFIG.waves;
