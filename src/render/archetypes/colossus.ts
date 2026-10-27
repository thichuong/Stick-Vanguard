import { EnemyEntity } from '../../types/entities.types.js';

export function renderColossus(
  ctx: CanvasRenderingContext2D,
  enemy: EnemyEntity,
  animTime: number,
  color: string,
  secColor: string,
  faceDir: number,
  isAttacking: boolean,
  isEngaged: boolean
): void {
  const s = enemy.size;
  const isSteel = enemy.typeId === 'IRON_COLOSSUS';
  const isIce = enemy.typeId === 'FROST_CRYSTAL_GOLEM';

  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const heavyStep = isEngaged ? 0 : Math.sin(animTime * 5) * 5;
  const punch = isAttacking ? faceDir * (s * 0.6) : 0;

  // Colossus massive torso (trapezoid)
  ctx.fillStyle = color;
  const shoulderW = s * 0.65;
  const waistW = s * 0.35;
  const torsoTop = -s * 0.4;
  const torsoBottom = s * 0.2;

  ctx.beginPath();
  ctx.moveTo(-shoulderW, torsoTop);
  ctx.lineTo(shoulderW, torsoTop);
  ctx.lineTo(waistW, torsoBottom);
  ctx.lineTo(-waistW, torsoBottom);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Core rune / plate
  ctx.strokeStyle = secColor || '#f59e0b';
  ctx.lineWidth = 2.2;
  ctx.strokeRect(-6, -s * 0.2, 12, 12);

  // Head (compact stone block or helm)
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, -s * 0.6, s * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Glowing eyes visor
  ctx.strokeStyle = secColor || '#f59e0b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(faceDir * 2, -s * 0.62);
  ctx.lineTo(faceDir * (s * 0.2), -s * 0.62);
  ctx.stroke();

  // Heavy tree-trunk legs
  ctx.strokeStyle = color;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  // Left leg
  ctx.moveTo(-waistW * 0.6, torsoBottom);
  ctx.lineTo(-waistW * 0.8 - heavyStep, s * 0.85);
  // Right leg
  ctx.moveTo(waistW * 0.6, torsoBottom);
  ctx.lineTo(waistW * 0.8 + heavyStep, s * 0.85);
  ctx.stroke();

  // Massive hammer arms
  ctx.lineWidth = 4;
  ctx.beginPath();
  // Back arm
  ctx.moveTo(-shoulderW, torsoTop + 4);
  ctx.lineTo(-shoulderW - 8, torsoBottom);
  // Front attack arm
  ctx.moveTo(shoulderW, torsoTop + 4);
  ctx.lineTo(shoulderW + 10 + punch, torsoBottom - (isAttacking ? 10 : 0));
  ctx.stroke();

  // Spikes for Ice Golem or Armor bolts for Steel Colossus
  if (isIce) {
    ctx.fillStyle = '#bae6fd';
    for (const sp of [-shoulderW, shoulderW]) {
      ctx.beginPath();
      ctx.moveTo(sp - 4, torsoTop);
      ctx.lineTo(sp, torsoTop - 10);
      ctx.lineTo(sp + 4, torsoTop);
      ctx.fill();
    }
  } else if (isSteel) {
    ctx.fillStyle = '#94a3b8';
    for (const sp of [-shoulderW * 0.5, shoulderW * 0.5]) {
      ctx.beginPath();
      ctx.arc(sp, torsoTop + 6, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

