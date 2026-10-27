import { EnemyEntity } from '../../types/entities.types.js';

export function renderWraithReaper(
  ctx: CanvasRenderingContext2D,
  enemy: EnemyEntity,
  animTime: number,
  color: string,
  secColor: string,
  faceDir: number,
  isAttacking: boolean
): void {
  const s = enemy.size * 0.9;
  const isReaper = enemy.typeId === 'PHANTOM_REAPER';
  const isBanshee = enemy.typeId === 'SPECTRAL_BANSHEE';

  const hoverY = Math.sin(animTime * 6) * 4;
  const cloakWave = Math.sin(animTime * 9) * 6;

  ctx.save();
  ctx.translate(0, hoverY);

  // Flowing ethereal cloak (no legs)
  ctx.fillStyle = `${color}40`;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(0, -s * 0.4);
  ctx.quadraticCurveTo(faceDir * (s * 0.4), s * 0.1, faceDir * (s * 0.2) + cloakWave, s * 0.75);
  ctx.quadraticCurveTo(0, s * 0.5, -faceDir * (s * 0.3) - cloakWave, s * 0.7);
  ctx.quadraticCurveTo(-faceDir * (s * 0.4), 0, 0, -s * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Hood / Head
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, -s * 0.55, s * 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Ghostly eyes
  ctx.fillStyle = isReaper ? '#38bdf8' : '#e879f9';
  ctx.beginPath();
  ctx.arc(faceDir * 3, -s * 0.55, 2, 0, Math.PI * 2);
  ctx.fill();

  // Weapon: Death's Scythe for Phantom Reaper
  if (isReaper) {
    const swing = isAttacking ? Math.sin(animTime * 14) * 20 : 0;
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2.2;

    // Scythe Staff
    const staffTopX = faceDir * 14 + swing;
    const staffTopY = -s * 0.9;
    const staffBotX = faceDir * 4;
    const staffBotY = s * 0.5;

    ctx.beginPath();
    ctx.moveTo(staffTopX, staffTopY);
    ctx.lineTo(staffBotX, staffBotY);
    ctx.stroke();

    // Crescent Blade
    ctx.strokeStyle = secColor || '#c084fc';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(staffTopX, staffTopY);
    ctx.quadraticCurveTo(staffTopX + faceDir * 18, staffTopY - 4, staffTopX + faceDir * 12, staffTopY + 16);
    ctx.stroke();
  } else if (isBanshee) {
    // Sonic scream shockwave if attacking
    if (isAttacking) {
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(faceDir * (s * 0.6), -s * 0.55, s * 0.4, -0.6, 0.6);
      ctx.stroke();
    }
  }

  ctx.restore();
}

