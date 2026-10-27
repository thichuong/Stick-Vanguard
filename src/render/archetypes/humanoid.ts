import { EnemyEntity } from '../../types/entities.types.js';

export function renderHumanoid(
  ctx: CanvasRenderingContext2D,
  enemy: EnemyEntity,
  animTime: number,
  color: string,
  secColor: string,
  faceDir: number,
  isAttacking: boolean,
  isEngaged: boolean
): void {
  const s = enemy.size * 0.9;
  const id = enemy.typeId;

  const isRunner = id === 'STICK_RUNNER';
  const isWarlock = id === 'NECRO_WARLOCK';
  const isSkeleton = id === 'SKELETON_MINION';
  const isImp = id === 'FIRE_IMP';
  const isTreant = id === 'TREANT_GUARD';
  const isVanguard = id === 'STEEL_VANGUARD';

  const walkSpeed = isRunner ? 14 : 9;
  const walk = isEngaged ? 0 : Math.sin(animTime * walkSpeed);
  const swing = isAttacking ? Math.sin(animTime * 14) * 14 : 0;
  const leanX = isRunner ? faceDir * 6 : 0;

  ctx.strokeStyle = color;
  ctx.lineWidth = enemy.size > 22 ? 3.5 : 2.6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const headRadius = s * 0.28;
  const headY = -s * 0.65;

  // Head
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(leanX, headY, headRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Eye
  ctx.fillStyle = isImp ? '#fef08a' : '#0f172a';
  ctx.beginPath();
  ctx.arc(leanX + faceDir * (headRadius * 0.4), headY - 1, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Headgear / Horns
  if (isImp) {
    // Imp Horns
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.moveTo(leanX - 4, headY - headRadius);
    ctx.lineTo(leanX - 6, headY - headRadius - 6);
    ctx.lineTo(leanX - 1, headY - headRadius);
    ctx.moveTo(leanX + 1, headY - headRadius);
    ctx.lineTo(leanX + 6, headY - headRadius - 6);
    ctx.lineTo(leanX + 4, headY - headRadius);
    ctx.fill();
  } else if (isRunner) {
    // Runner Bandana tail flying back
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(leanX - faceDir * headRadius, headY);
    ctx.lineTo(leanX - faceDir * (headRadius + 8), headY + walk * 4);
    ctx.stroke();
  } else if (isTreant) {
    // Tree branches on head
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(leanX, headY - headRadius);
    ctx.lineTo(leanX, headY - headRadius - 7);
    ctx.lineTo(leanX + 5, headY - headRadius - 10);
    ctx.stroke();
  } else if (isVanguard) {
    // T-Visor helmet crest
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(leanX - 4, headY - 2);
    ctx.lineTo(leanX + 4, headY - 2);
    ctx.moveTo(leanX, headY - 2);
    ctx.lineTo(leanX, headY + 3);
    ctx.stroke();
  }

  // Spine
  const neckY = headY + headRadius;
  const pelvisY = s * 0.2;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(leanX, neckY);
  ctx.lineTo(0, pelvisY);
  ctx.stroke();

  // Ribs for skeleton
  if (isSkeleton) {
    ctx.lineWidth = 1.6;
    for (let r = 0; r < 3; r++) {
      const ry = neckY + 4 + r * 4;
      ctx.beginPath();
      ctx.moveTo(-4, ry);
      ctx.lineTo(4, ry);
      ctx.stroke();
    }
    ctx.lineWidth = 2.6;
  }

  // Arms & Weapons
  const shoulderY = neckY + 4;
  const rightHandX = faceDir * (s * 0.5) + swing;
  const rightHandY = shoulderY - walk * 4;

  ctx.beginPath();
  ctx.moveTo(-faceDir * 8, shoulderY + walk * 4);
  ctx.lineTo(0, shoulderY);
  ctx.lineTo(rightHandX, rightHandY);
  ctx.stroke();

  // Weapon rendering
  ctx.save();
  if (isWarlock) {
    // Necro Staff with skull orb
    ctx.strokeStyle = secColor || '#a855f7';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(rightHandX, rightHandY - 16);
    ctx.lineTo(rightHandX, rightHandY + 12);
    ctx.stroke();

    ctx.fillStyle = secColor || '#a855f7';
    ctx.beginPath();
    ctx.arc(rightHandX, rightHandY - 16, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (isImp) {
    // Fire Trident
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rightHandX, rightHandY - 10);
    ctx.lineTo(rightHandX + faceDir * 8, rightHandY - 10);
    ctx.stroke();
  } else if (isVanguard || id === 'STICK_WARRIOR') {
    // Sword
    ctx.strokeStyle = secColor || '#cbd5e1';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(rightHandX, rightHandY);
    ctx.lineTo(rightHandX + faceDir * 10, rightHandY - 12);
    ctx.stroke();
  }
  ctx.restore();

  // Legs
  if (enemy.movementType !== 'SWIM') {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    // Left leg
    ctx.moveTo(0, pelvisY);
    ctx.lineTo(-faceDir * 4 - walk * 6, s * 0.85);
    // Right leg
    ctx.moveTo(0, pelvisY);
    ctx.lineTo(faceDir * 6 + walk * 6, s * 0.85);
    ctx.stroke();
  }
}

