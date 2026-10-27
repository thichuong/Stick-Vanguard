import { EnemyEntity } from '../../types/entities.types.js';

export function renderSiren(
  ctx: CanvasRenderingContext2D,
  enemy: EnemyEntity,
  animTime: number,
  color: string,
  secColor: string,
  faceDir: number,
  isAttacking: boolean
): void {
  const s = enemy.size * 0.85;
  const tailWave = Math.sin(animTime * 8) * (s * 0.4);

  ctx.strokeStyle = color;
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Humanoid Torso
  const headRadius = s * 0.25;
  const headY = -s * 0.6;

  // Head with tiara
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, headY, headRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Tiara / Crown
  ctx.strokeStyle = secColor || '#38bdf8';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-5, headY - headRadius);
  ctx.lineTo(0, headY - headRadius - 5);
  ctx.lineTo(5, headY - headRadius);
  ctx.stroke();

  // Spine
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(0, headY + headRadius);
  ctx.lineTo(0, 0);
  ctx.stroke();

  // Fish Tail curving backwards
  const tailMidX = -faceDir * (s * 0.4) + tailWave * 0.4;
  const tailMidY = s * 0.35;
  const tailTipX = tailMidX - faceDir * (s * 0.4);
  const tailTipY = s * 0.7 + tailWave;

  ctx.strokeStyle = secColor || '#06b6d4';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(tailMidX, tailMidY, tailTipX, tailTipY);
  ctx.stroke();

  // Fluke / Tail fin
  ctx.fillStyle = secColor || '#06b6d4';
  ctx.beginPath();
  ctx.moveTo(tailTipX, tailTipY);
  ctx.lineTo(tailTipX - faceDir * 8, tailTipY - 6);
  ctx.lineTo(tailTipX - faceDir * 10, tailTipY);
  ctx.lineTo(tailTipX - faceDir * 8, tailTipY + 6);
  ctx.closePath();
  ctx.fill();

  // Trident / Storm Staff in hand
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 2;
  const attackThrust = isAttacking ? faceDir * 8 : 0;
  const staffX = faceDir * (s * 0.5) + attackThrust;
  ctx.beginPath();
  ctx.moveTo(staffX, -s * 0.8);
  ctx.lineTo(staffX, s * 0.3);
  // Trident prongs
  ctx.moveTo(staffX - 4, -s * 0.8 + 6);
  ctx.lineTo(staffX - 4, -s * 0.9);
  ctx.moveTo(staffX + 4, -s * 0.8 + 6);
  ctx.lineTo(staffX + 4, -s * 0.9);
  ctx.stroke();
}

