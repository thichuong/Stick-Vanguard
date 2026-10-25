import { Vector2D } from '../types/entities.types.js';
import { ElementType, NavigationMode } from '../types/elements.types.js';
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
  MAP_CELESTIAL_SANCTUM,
  WAVES_CELESTIAL_SANCTUM,
  MAP_VOID_SINGULARITY,
  WAVES_VOID_SINGULARITY
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

export interface PlayerBaseConfig {
  x: number;
  y: number;
  radius?: number;
}

// Each lane is a sequence of waypoints starting with at least 1 Vector2D, intermediate Vector2Ds, and ending with a base number (1-based: 1, 2, 3...)
export type MapLane = [Vector2D, ...Vector2D[], number];

export interface MapConfig {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  themeColor: string;
  roadColor: string;
  riverColor: string;
  width?: number;
  height?: number;
  roadWidth?: number;
  riverWidth?: number;
  playerBases: PlayerBaseConfig[];
  groundLanes: MapLane[];
  waterLanes: MapLane[];
  airLanes: MapLane[];
  waves: WaveConfig[];
  extendedWaves?: WaveConfig[];
  laneBadges?: string[];
  tribe?: MapTribeConfig;
}

export function getMapBases(mapConfig: MapConfig): { x: number; y: number; radius: number }[] {
  if (mapConfig.playerBases && mapConfig.playerBases.length > 0) {
    return mapConfig.playerBases.map((b) => ({
      x: b.x,
      y: b.y,
      radius: b.radius !== undefined ? b.radius : 42
    }));
  }
  return [{ x: 500, y: 325, radius: 42 }];
}

/**
 * Resolves a MapLane to a list of Vector2D waypoints where the final waypoint
 * connects dynamically to the corresponding player base (1-based index: 1 -> playerBases[0]).
 */
export function resolveLaneWaypoints(lane: MapLane, playerBases: PlayerBaseConfig[]): Vector2D[] {
  if (!lane || lane.length === 0) return [];
  const waypoints = lane.slice(0, -1) as Vector2D[];
  const lastItem = lane[lane.length - 1];
  const baseNum = typeof lastItem === 'number' ? lastItem : 1;
  const baseIndex = Math.max(0, Math.min(playerBases.length - 1, baseNum - 1));
  const targetBase = playerBases[baseIndex] || playerBases[0];
  if (targetBase) {
    return [...waypoints, { x: targetBase.x, y: targetBase.y }];
  }
  return waypoints;
}

export function getResolvedGroundLanes(mapConfig: MapConfig): Vector2D[][] {
  return (mapConfig.groundLanes || []).map((lane) => resolveLaneWaypoints(lane, mapConfig.playerBases));
}

export function getResolvedWaterLanes(mapConfig: MapConfig): Vector2D[][] {
  return (mapConfig.waterLanes || []).map((lane) => resolveLaneWaypoints(lane, mapConfig.playerBases));
}

export function getResolvedAirLanes(mapConfig: MapConfig): Vector2D[][] {
  return (mapConfig.airLanes || []).map((lane) => resolveLaneWaypoints(lane, mapConfig.playerBases));
}

export function getUniqueLaneSpawns(lanes: MapLane[]): Vector2D[] {
  if (!lanes || lanes.length === 0) return [];
  const seen = new Set<string>();
  const spawns: Vector2D[] = [];
  for (const lane of lanes) {
    if (!lane || lane.length === 0) continue;
    const first = lane[0];
    if (typeof first === 'object' && first !== null && 'x' in first && 'y' in first) {
      const key = `${first.x},${first.y}`;
      if (!seen.has(key)) {
        seen.add(key);
        spawns.push({ x: first.x, y: first.y });
      }
    }
  }
  return spawns;
}

export function getTraversableLaneCount(mapConfig: MapConfig, navMode: NavigationMode): number {
  switch (navMode) {
    case 'WATER_PATH': {
      return mapConfig.waterLanes && mapConfig.waterLanes.length > 0 ? mapConfig.waterLanes.length : 1;
    }
    case 'AIR_DIRECT':
    case 'AIR_WAYPOINTS': {
      return mapConfig.airLanes && mapConfig.airLanes.length > 0 ? mapConfig.airLanes.length : 1;
    }
    case 'GROUND_PATH':
    default: {
      return mapConfig.groundLanes && mapConfig.groundLanes.length > 0 ? mapConfig.groundLanes.length : 1;
    }
  }
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
  MAP_CELESTIAL_SANCTUM,
  WAVES_CELESTIAL_SANCTUM,
  MAP_VOID_SINGULARITY,
  WAVES_VOID_SINGULARITY
};

export const MAP_CONFIG = MAPS_CONFIG[0];
export const WAVES_CONFIG = MAP_CONFIG.waves;
