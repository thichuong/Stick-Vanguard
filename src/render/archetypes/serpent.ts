import { EnemyEntity } from '../../types/entities.types.js';

export function renderSerpent(
  ctx: CanvasRenderingContext2D,
  enemy: EnemyEntity,
  animTime: number,
  color: string,
  secColor: string,
  faceDir: number,
  isAttacking: boolean
): void {
  const s = enemy.size * 0.8;
  const isHydra = enemy.typeId === 'VOID_HYDRA_BOSS';
  const isEel = enemy.typeId === 'SPARK_EEL';

  ctx.strokeStyle = color;
  ctx.lineWidth = isHydra ? 4.5 : isEel ? 2.2 : 3.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Sinusoidal spine wave along movement direction
  const segmentCount = isHydra ? 8 : 6;
  const segmentLength = (s * 1.8) / segmentCount;
  const waveFreq = isEel ? 14 : 9;
  const waveAmp = s * 0.28;

  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= segmentCount; i++) {
    const segRatio = i / segmentCount;
    const px = -faceDir * (i * segmentLength) + (faceDir * s * 0.4);
    const py = Math.sin(animTime * waveFreq - i * 0.9) * waveAmp * (1 - segRatio * 0.3) + (s * 0.2);
    points.push({ x: px, y: py });
  }

  // Draw snake body
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();

  // Eel dorsal lightning fin
  if (isEel) {
    ctx.save();
    ctx.strokeStyle = secColor || '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < points.length; i += 2) {
      ctx.moveTo(points[i].x, points[i].y);
      ctx.lineTo(points[i].x, points[i].y - 8);
      if (i + 1 < points.length) {
        ctx.lineTo(points[i + 1].x, points[i + 1].y);
      }
    }
    ctx.stroke();
    ctx.restore();
  }

  // Heads: Void Hydra has 3 heads, standard serpent has 1
  const headOffsets = isHydra ? [-s * 0.4, 0, s * 0.4] : [0];

  headOffsets.forEach((yOff, idx) => {
    const headBase = points[0];
    const headAnim = Math.sin(animTime * 7 + idx * 2) * (s * 0.2);
    const hx = headBase.x + faceDir * (s * 0.6) + (isAttacking ? faceDir * (s * 0.4) : 0);
    const hy = headBase.y + yOff * 0.7 + headAnim - (s * 0.2);

    // Neck to head
    ctx.beginPath();
    ctx.moveTo(headBase.x, headBase.y);
    ctx.quadraticCurveTo(headBase.x + faceDir * (s * 0.2), headBase.y + yOff * 0.4, hx, hy);
    ctx.stroke();

    // Serpent Head (wedge / diamond)
    ctx.save();
    ctx.translate(hx, hy);
    ctx.scale(faceDir, 1);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-4, -6);
    ctx.lineTo(s * 0.45, 0); // nose tip
    ctx.lineTo(-4, 6);
    ctx.lineTo(-8, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Slit eye
    ctx.fillStyle = isHydra ? '#f43f5e' : '#fef08a';
    ctx.beginPath();
    ctx.arc(0, -2, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Forked red tongue flicking
    const tongueFlick = Math.sin(animTime * 18 + idx) > 0.3;
    if (tongueFlick || isAttacking) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(s * 0.45, 0);
      ctx.lineTo(s * 0.45 + 7, 0);
      ctx.lineTo(s * 0.45 + 11, -3);
      ctx.moveTo(s * 0.45 + 7, 0);
      ctx.lineTo(s * 0.45 + 11, 3);
      ctx.stroke();
    }

    ctx.restore();
  });
}

