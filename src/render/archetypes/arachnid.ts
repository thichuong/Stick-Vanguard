import { EnemyEntity } from '../../types/entities.types.js';

export function renderArachnid(
  ctx: CanvasRenderingContext2D,
  enemy: EnemyEntity,
  animTime: number,
  color: string,
  secColor: string,
  faceDir: number,
  isAttacking: boolean
): void {
  const s = enemy.size * 0.85;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Abdomen (rear bulb)
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(-faceDir * (s * 0.35), 0, s * 0.45, s * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Skull/poison hourglass marking on abdomen
  ctx.fillStyle = secColor || '#84cc16';
  ctx.beginPath();
  ctx.arc(-faceDir * (s * 0.35), 0, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Cephalothorax (head/front body)
  const biteLunge = isAttacking ? faceDir * 4 : 0;
  const headX = faceDir * (s * 0.25) + biteLunge;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(headX, 0, s * 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Multiple glowing eyes (cluster of 4)
  ctx.fillStyle = '#ef4444';
  [-2, 2].forEach((offsetY) => {
    ctx.beginPath();
    ctx.arc(headX + faceDir * 3, offsetY, 1.4, 0, Math.PI * 2);
    ctx.fill();
  });

  // Chelicerae / Fangs
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(headX + faceDir * (s * 0.2), -3);
  ctx.lineTo(headX + faceDir * (s * 0.45), -1);
  ctx.moveTo(headX + faceDir * (s * 0.2), 3);
  ctx.lineTo(headX + faceDir * (s * 0.45), 1);
  ctx.stroke();

  // 8 Spidery jointed legs (4 per side with alternating crawl cycles)
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;

  const legCount = 4;
  for (let i = 0; i < legCount; i++) {
    const legPhase = animTime * 14 + i * 1.5;
    const legLift = Math.sin(legPhase) * 6;
    const legReach = Math.cos(legPhase) * 5;

    const spread = (i - 1.5) * (s * 0.25);

    // Top legs
    const kx = spread;
    const ky = -s * 0.7 + legLift;
    const fx = spread + faceDir * 5 + legReach;
    const fy = -s * 0.95 + Math.max(0, legLift);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(kx, ky);
    ctx.lineTo(fx, fy);
    ctx.stroke();

    // Bottom legs
    const bky = s * 0.7 - legLift;
    const bfy = s * 0.95 - Math.max(0, legLift);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(kx, bky);
    ctx.lineTo(fx, bfy);
    ctx.stroke();
  }
}

