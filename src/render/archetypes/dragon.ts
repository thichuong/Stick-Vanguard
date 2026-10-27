import { EnemyEntity } from '../../types/entities.types.js';

export function renderDragon(
  ctx: CanvasRenderingContext2D,
  enemy: EnemyEntity,
  animTime: number,
  color: string,
  secColor: string,
  faceDir: number,
  isAttacking: boolean
): void {
  const s = enemy.size * 0.85;
  const isBoss = enemy.typeId === 'DARK_DRAGON_BOSS';
  const isAquatic = enemy.typeId === 'RIVER_DRAKE';
  const isGrounded = enemy.typeId === 'DRAKE_WARRIOR';

  const wingFlap = Math.sin(animTime * 12) * (isBoss ? 0.5 : 0.65);
  const tailWag = Math.sin(animTime * 8) * (s * 0.45);
  const attackReach = isAttacking ? faceDir * (s * 0.5) : 0;

  // --- Spine & Tail ---
  ctx.strokeStyle = color;
  ctx.lineWidth = isBoss ? 4.5 : 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Body Center
  const bodyX = 0;
  const bodyY = s * 0.1;

  // Tail (undulating curves)
  const tailBaseX = -faceDir * (s * 0.5);
  const tailBaseY = bodyY + s * 0.15;
  const tailMidX = tailBaseX - faceDir * (s * 0.6) + tailWag * 0.4;
  const tailMidY = tailBaseY - s * 0.2 + tailWag * 0.2;
  const tailTipX = tailMidX - faceDir * (s * 0.6);
  const tailTipY = tailMidY + tailWag;

  ctx.beginPath();
  ctx.moveTo(bodyX, bodyY);
  ctx.quadraticCurveTo(tailBaseX, tailBaseY, tailMidX, tailMidY);
  ctx.quadraticCurveTo(tailMidX, tailMidY, tailTipX, tailTipY);
  ctx.stroke();

  // Tail spade / blade
  ctx.fillStyle = secColor || color;
  ctx.beginPath();
  ctx.moveTo(tailTipX, tailTipY);
  ctx.lineTo(tailTipX - faceDir * 8, tailTipY - 6);
  ctx.lineTo(tailTipX - faceDir * 12, tailTipY);
  ctx.lineTo(tailTipX - faceDir * 8, tailTipY + 6);
  ctx.closePath();
  ctx.fill();

  // Neck & Head
  const neckBaseX = faceDir * (s * 0.35);
  const neckBaseY = bodyY - s * 0.15;
  const headX = neckBaseX + faceDir * (s * 0.65) + attackReach;
  const headY = neckBaseY - s * 0.5 + (isAttacking ? s * 0.2 : Math.sin(animTime * 6) * 3);

  ctx.beginPath();
  ctx.moveTo(bodyX, bodyY);
  ctx.quadraticCurveTo(neckBaseX, neckBaseY, headX, headY);
  ctx.stroke();

  // Dragon Head (Angular horned skull)
  ctx.save();
  ctx.translate(headX, headY);
  ctx.scale(faceDir, 1);

  // Horns
  ctx.strokeStyle = secColor || '#f87171';
  ctx.lineWidth = isBoss ? 3 : 2.2;
  ctx.beginPath();
  ctx.moveTo(-2, -4);
  ctx.quadraticCurveTo(-8, -14, -14, -12); // main horn
  if (isBoss) {
    ctx.moveTo(0, -2);
    ctx.quadraticCurveTo(-6, -10, -10, -8); // secondary horn
  }
  ctx.stroke();

  // Snout / Jaw
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-4, -6);
  ctx.lineTo(s * 0.55, -2); // top snout
  ctx.lineTo(s * 0.45, 4);  // jaw tip
  ctx.lineTo(-2, 3);       // jaw base
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Fiery / glowing eye
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(2, -2, isBoss ? 2.5 : 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Fire breath or spark if attacking
  if (isAttacking) {
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(s * 0.75, 0, s * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // --- Wings (for airborne dragons or Wyvern) ---
  if (!isAquatic) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;

    const wingBaseX = bodyX - faceDir * (s * 0.1);
    const wingBaseY = bodyY - s * 0.3;

    // Near wing
    const wingSpan = isBoss ? s * 1.5 : s * 1.2;
    const wingAngle = wingFlap;

    ctx.beginPath();
    ctx.moveTo(wingBaseX, wingBaseY);
    const elbowX = wingBaseX - faceDir * (wingSpan * 0.4);
    const elbowY = wingBaseY - wingSpan * 0.7 + wingAngle * 25;
    const tipX = wingBaseX + faceDir * (wingSpan * 0.7);
    const tipY = elbowY - wingSpan * 0.4;

    ctx.lineTo(elbowX, elbowY);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();

    // Wing webbing (Stick membrane)
    ctx.fillStyle = `${secColor}40`;
    ctx.beginPath();
    ctx.moveTo(wingBaseX, wingBaseY);
    ctx.lineTo(elbowX, elbowY);
    ctx.lineTo(tipX, tipY);
    ctx.quadraticCurveTo(elbowX + faceDir * 6, elbowY + 12, wingBaseX + faceDir * 8, wingBaseY + 6);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Legs (Claws)
  if (isGrounded || isAquatic) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    // Front claw
    ctx.beginPath();
    ctx.moveTo(bodyX + faceDir * (s * 0.25), bodyY + s * 0.2);
    ctx.lineTo(bodyX + faceDir * (s * 0.4), bodyY + s * 0.75);
    ctx.lineTo(bodyX + faceDir * (s * 0.55), bodyY + s * 0.75);
    // Rear claw
    ctx.moveTo(bodyX - faceDir * (s * 0.25), bodyY + s * 0.2);
    ctx.lineTo(bodyX - faceDir * (s * 0.2), bodyY + s * 0.75);
    ctx.lineTo(bodyX - faceDir * (s * 0.05), bodyY + s * 0.75);
    ctx.stroke();
  }
}

