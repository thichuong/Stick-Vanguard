import { Vector2D } from '../types/entities.types.js';
import { NavigationMode } from '../types/elements.types.js';
import { MAP_CONFIG } from '../config/map.config.js';

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
  private groundPath: PathInfo;
  private waterPath: PathInfo;
  private airPath: PathInfo;

  constructor() {
    this.groundPath = this.buildPathInfo(MAP_CONFIG.groundWaypoints);
    this.waterPath = this.buildPathInfo(MAP_CONFIG.waterWaypoints);
    this.airPath = this.buildPathInfo(MAP_CONFIG.airWaypoints);
  }

  private buildPathInfo(waypoints: Vector2D[]): PathInfo {
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

  public getPathInfo(mode: NavigationMode): PathInfo {
    switch (mode) {
      case 'WATER_PATH':
        return this.waterPath;
      case 'AIR_DIRECT':
      case 'AIR_WAYPOINTS':
        return this.airPath;
      case 'GROUND_PATH':
      default:
        return this.groundPath;
    }
  }

  /**
   * Returns { position, facingAngle, isFinished } given current path distance
   */
  public getPointAlongPath(
    mode: NavigationMode,
    distance: number,
    animTime: number = 0
  ): { position: Vector2D; facing: number; isFinished: boolean } {
    const path = this.getPathInfo(mode);

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

    // Find segment containing this distance
    let prevCumulative = 0;
    for (const seg of path.segments) {
      if (distance <= seg.cumulativeLength) {
        const segDist = distance - prevCumulative;
        const t = seg.length > 0 ? segDist / seg.length : 0;
        let x = seg.p1.x + (seg.p2.x - seg.p1.x) * t;
        let y = seg.p1.y + (seg.p2.y - seg.p1.y) * t;

        const dx = seg.p2.x - seg.p1.x;
        const dy = seg.p2.y - seg.p1.y;
        let facing = Math.atan2(dy, dx);

        // Add gentle wobble for flying or swimming units
        if (mode === 'AIR_DIRECT') {
          // sinusoidal weave
          const perpX = -Math.sin(facing);
          const perpY = Math.cos(facing);
          const wobble = Math.sin(animTime * 3 + distance * 0.05) * 8;
          x += perpX * wobble;
          y += perpY * wobble;
        } else if (mode === 'WATER_PATH') {
          // gentle water drift
          y += Math.sin(animTime * 4 + x * 0.04) * 3;
        }

        return { position: { x, y }, facing, isFinished: false };
      }
      prevCumulative = seg.cumulativeLength;
    }

    const lastPt = path.segments[path.segments.length - 1].p2;
    return { position: { ...lastPt }, facing: 0, isFinished: true };
  }
}

