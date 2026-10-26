// Web Worker for offloading heavy batch simulation math & transform interpolation

interface LaneSegment {
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  length: number;
  cumulativeLength: number;
}

interface PathData {
  totalLength: number;
  segments: LaneSegment[];
}

let groundPaths: PathData[] = [];
let waterPaths: PathData[] = [];
let airPaths: PathData[] = [];

function findSegmentIndex(segments: LaneSegment[], distance: number): number {
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

self.onmessage = (e: MessageEvent) => {
  const { type, data } = e.data;

  if (type === 'INIT_PATHS') {
    groundPaths = data.groundPaths || [];
    waterPaths = data.waterPaths || [];
    airPaths = data.airPaths || [];
    self.postMessage({ type: 'PATHS_INITIALIZED' });
    return;
  }

  if (type === 'BATCH_MOVE_ENEMIES') {
    // data.buffer is a Float32Array:
    // Stride = 7 floats per enemy:
    // [0] pathDistance, [1] speed, [2] dt, [3] modeCode (0=GROUND, 1=WATER, 2=AIR), [4] laneIndex, [5] animTime, [6] resultIsFinished
    // Output directly overwrites into buffer:
    // [0] newDistance, [1] newX, [2] newY, [3] facing, [4] isFinished, [5] reserved, [6] reserved
    const buffer = new Float32Array(data.buffer);
    const count = data.count;
    const STRIDE = 7;

    for (let i = 0; i < count; i++) {
      const offset = i * STRIDE;
      let dist = buffer[offset];
      const speed = buffer[offset + 1];
      const dt = buffer[offset + 2];
      const modeCode = Math.round(buffer[offset + 3]);
      const laneIndex = Math.round(buffer[offset + 4]);
      const animTime = buffer[offset + 5];

      dist += speed * dt;
      buffer[offset] = dist;

      let pool: PathData[] = groundPaths;
      if (modeCode === 1) pool = waterPaths;
      else if (modeCode === 2) pool = airPaths;

      const path = pool && pool.length > 0 ? pool[laneIndex % pool.length] : undefined;

      if (!path || path.segments.length === 0) {
        buffer[offset + 1] = 0;
        buffer[offset + 2] = 0;
        buffer[offset + 3] = 0;
        buffer[offset + 4] = 1; // isFinished
        continue;
      }

      if (dist >= path.totalLength) {
        const lastPt = path.segments[path.segments.length - 1].p2;
        buffer[offset + 1] = lastPt.x;
        buffer[offset + 2] = lastPt.y;
        buffer[offset + 3] = 0;
        buffer[offset + 4] = 1; // isFinished
        continue;
      }

      if (dist <= 0) {
        const firstPt = path.segments[0].p1;
        const dx = path.segments[0].p2.x - firstPt.x;
        const dy = path.segments[0].p2.y - firstPt.y;
        buffer[offset + 1] = firstPt.x;
        buffer[offset + 2] = firstPt.y;
        buffer[offset + 3] = Math.atan2(dy, dx);
        buffer[offset + 4] = 0; // isFinished
        continue;
      }

      const segIdx = findSegmentIndex(path.segments, dist);
      const seg = path.segments[segIdx];
      const prevCum = seg.cumulativeLength - seg.length;
      const segDist = dist - prevCum;
      const t = seg.length > 0 ? segDist / seg.length : 0;

      let x = seg.p1.x + (seg.p2.x - seg.p1.x) * t;
      let y = seg.p1.y + (seg.p2.y - seg.p1.y) * t;

      const dx = seg.p2.x - seg.p1.x;
      const dy = seg.p2.y - seg.p1.y;
      const facing = Math.atan2(dy, dx);

      if (modeCode === 2) {
        // Air wobble
        const perpX = -Math.sin(facing);
        const perpY = Math.cos(facing);
        const wobble = Math.sin(animTime * 3 + dist * 0.05 + laneIndex) * 8;
        x += perpX * wobble;
        y += perpY * wobble;
      } else if (modeCode === 1) {
        // Water wobble
        y += Math.sin(animTime * 4 + x * 0.04 + laneIndex) * 3;
      }

      buffer[offset + 1] = x;
      buffer[offset + 2] = y;
      buffer[offset + 3] = facing;
      buffer[offset + 4] = 0; // isFinished = false
    }

    // Transfer buffer back to main thread
    (self as any).postMessage(
      {
        type: 'BATCH_MOVE_COMPLETE',
        buffer: buffer.buffer,
        count
      },
      [buffer.buffer]
    );
  }
};
