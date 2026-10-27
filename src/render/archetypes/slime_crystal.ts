import { EnemyEntity } from '../../types/entities.types.js';

export function renderSlimeCrystal(
  ctx: CanvasRenderingContext2D,
  enemy: EnemyEntity,
  animTime: number,
  color: string,
  secColor: string,
  faceDir: number,
  isAttacking: boolean
): void {
  const attackPulse = isAttacking ? 1.2 : 1.0;
  const s = enemy.size * 0.9 * attackPulse;
  const isShard = enemy.typeId === 'ICE_SHARDLING';

  if (isShard) {
    // Spinning floating crystal prisms
    ctx.save();
    ctx.rotate(animTime * 4);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.4;
    ctx.fillStyle = `${secColor || color}60`;

    // Diamond shard
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.7);
    ctx.lineTo(s * 0.5, 0);
    ctx.lineTo(0, s * 0.7);
    ctx.lineTo(-s * 0.5, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner refraction facet
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.7);
    ctx.lineTo(0, s * 0.7);
    ctx.stroke();
    ctx.restore();
  } else {
    // Bouncing gelatinous slime (Squash & Stretch)
    const bounceCycle = Math.abs(Math.sin(animTime * 10));
    const squashX = 1 + (1 - bounceCycle) * 0.35;
    const squashY = 1 + bounceCycle * 0.35;

    const baseRadius = s * 0.55;
    const rx = baseRadius * squashX;
    const ry = baseRadius * squashY;

    ctx.save();
    ctx.translate(0, s * 0.2 - (bounceCycle * 10));

    // Slime outer droplet
    ctx.fillStyle = `${color}cc`;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(-rx, 0);
    ctx.quadraticCurveTo(-rx, -ry * 1.2, 0, -ry * 1.4); // peaked head
    ctx.quadraticCurveTo(rx, -ry * 1.2, rx, 0);
    ctx.quadraticCurveTo(rx * 0.7, ry * 0.5, 0, ry * 0.4);
    ctx.quadraticCurveTo(-rx * 0.7, ry * 0.5, -rx, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner glowing core
    ctx.fillStyle = secColor || '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -ry * 0.3, baseRadius * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Angry stick eyes
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(faceDir * (rx * 0.3), -ry * 0.5, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

