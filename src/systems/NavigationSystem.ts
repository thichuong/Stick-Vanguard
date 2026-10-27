import { Vector2D } from '../types/entities.types.js';
import { NavigationMode } from '../types/elements.types.js';
import {
  MAP_CONFIG,
  MapConfig,
  getResolvedGroundLanes,
  getResolvedWaterLanes,
  getResolvedAirLanes
} from '../config/map.config.js';

export interface PathInfo {
  totalLength: number;
  segments: {
    p1: Vector2D;
    p2: Vector2D;
    length: number;
    cumulativeLength: number;
  }[];
}

export class NavigationSystem {
  private currentMap: MapConfig;
  private groundPaths: PathInfo[] = [];
  private waterPaths: PathInfo[] = [];
  private airPaths: PathInfo[] = [];

  constructor(mapConfig: MapConfig = MAP_CONFIG) {
    this.currentMap = mapConfig;
    this.rebuildPaths();
  }

  public setMap(mapConfig: MapConfig): void {
    this.currentMap = mapConfig;
    this.rebuildPaths();
  }

  private rebuildPaths(): void {
    // 1. Build Ground Paths (dynamically resolved to playerBases)
    const groundLanes = getResolvedGroundLanes(this.currentMap);
    this.groundPaths = groundLanes.map((lane) => this.buildPathInfo(lane));

    // 2. Build Water Paths (dynamically resolved to playerBases)
    const waterLanes = getResolvedWaterLanes(this.currentMap);
    this.waterPaths = waterLanes.map((lane) => this.buildPathInfo(lane));

    // 3. Build Air Paths (dynamically resolved to playerBases)
    const airLanes = getResolvedAirLanes(this.currentMap);
    this.airPaths = airLanes.map((lane) => this.buildPathInfo(lane));
  }

  private buildPathInfo(waypoints: Vector2D[]): PathInfo {
    if (!waypoints || waypoints.length < 2) {
      return { totalLength: 0, segments: [] };
    }

    const segments = [];
    let totalLength = 0;

    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const length = Math.hypot(dx, dy);
      totalLength += length;
      segments.push({
        p1,
        p2,
        length,
        cumulativeLength: totalLength
      });
    }

    return { totalLength, segments };
  }

  public getLaneCount(mode: NavigationMode): number {
    switch (mode) {
      case 'WATER_PATH':
        return Math.max(1, this.waterPaths.length);
      case 'AIR_DIRECT':
      case 'AIR_WAYPOINTS':
        return Math.max(1, this.airPaths.length);
      case 'GROUND_PATH':
      default:
        return Math.max(1, this.groundPaths.length);
    }
  }

  public getAllLanes(mode: NavigationMode): PathInfo[] {
    switch (mode) {
      case 'WATER_PATH':
        return this.waterPaths;
      case 'AIR_DIRECT':
      case 'AIR_WAYPOINTS':
        return this.airPaths;
      case 'GROUND_PATH':
      default:
        return this.groundPaths;
    }
  }

  public getPathInfo(mode: NavigationMode, laneIndex: number = 0): PathInfo {
    let pool: PathInfo[];
    switch (mode) {
      case 'WATER_PATH':
        pool = this.waterPaths;
        break;
      case 'AIR_DIRECT':
      case 'AIR_WAYPOINTS':
        pool = this.airPaths;
        break;
      case 'GROUND_PATH':
      default:
        pool = this.groundPaths;
        break;
    }

    if (!pool || pool.length === 0) {
      // Fallback to primary ground path
      return this.groundPaths[0] || { totalLength: 0, segments: [] };
    }

    const safeIndex = Math.abs(laneIndex) % pool.length;
    return pool[safeIndex];
  }

  /**
   * Helper to quickly find segment index via binary search
   */
  private findSegmentIndex(segments: PathInfo['segments'], distance: number): number {
    let low = 0;
    let high = segments.length - 1;

    while (low <= high) {
      const mid = (low + high) >> 1;
      const seg = segments[mid];
      const prevCum = seg.cumulativeLength - seg.length;

      if (distance < prevCum) {
        high = mid - 1;
      } else if (distance > seg.cumulativeLength) {
        low = mid + 1;
      } else {
        return mid;
      }
    }
    return Math.max(0, Math.min(segments.length - 1, low));
  }

  /**
   * Returns { position, facingAngle, isFinished } given current path distance and lane
   */
  public getPointAlongPath(
    mode: NavigationMode,
    distance: number,
    animTime: number = 0,
    laneIndex: number = 0
  ): { position: Vector2D; facing: number; isFinished: boolean } {
    const path = this.getPathInfo(mode, laneIndex);

    if (!path || path.segments.length === 0) {
      return { position: { x: 0, y: 0 }, facing: 0, isFinished: true };
    }

    if (distance >= path.totalLength) {
      const lastPt = path.segments[path.segments.length - 1].p2;
      return { position: { ...lastPt }, facing: 0, isFinished: true };
    }

    if (distance <= 0) {
      const firstPt = path.segments[0].p1;
      const dx = path.segments[0].p2.x - firstPt.x;
      const dy = path.segments[0].p2.y - firstPt.y;
      return { position: { ...firstPt }, facing: Math.atan2(dy, dx), isFinished: false };
    }

    const segIdx = this.findSegmentIndex(path.segments, distance);
    const seg = path.segments[segIdx];
    const prevCum = seg.cumulativeLength - seg.length;
    const segDist = distance - prevCum;
    const t = seg.length > 0 ? segDist / seg.length : 0;
    let x = seg.p1.x + (seg.p2.x - seg.p1.x) * t;
    let y = seg.p1.y + (seg.p2.y - seg.p1.y) * t;

    const dx = seg.p2.x - seg.p1.x;
    const dy = seg.p2.y - seg.p1.y;
    let facing = Math.atan2(dy, dx);

    // Add gentle wobble for flying or swimming units
    if (mode === 'AIR_DIRECT') {
      const perpX = -Math.sin(facing);
      const perpY = Math.cos(facing);
      const wobble = Math.sin(animTime * 3 + distance * 0.05 + laneIndex) * 8;
      x += perpX * wobble;
      y += perpY * wobble;
    } else if (mode === 'WATER_PATH') {
      y += Math.sin(animTime * 4 + x * 0.04 + laneIndex) * 3;
    }

    return { position: { x, y }, facing, isFinished: false };
  }
}
