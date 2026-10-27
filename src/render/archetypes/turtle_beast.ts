import { EnemyEntity } from '../../types/entities.types.js';

export function renderTurtleBeast(
  ctx: CanvasRenderingContext2D,
  enemy: EnemyEntity,
  animTime: number,
  color: string,
  secColor: string,
  faceDir: number,
  isAttacking: boolean
): void {
  const s = enemy.size * 0.85;
  const isLeviathan = enemy.typeId === 'PLAGUE_LEVIATHAN';

  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (isLeviathan) {
    // Giant armored spiked sea beast
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.8, s * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Toxic dorsal spikes
    ctx.fillStyle = secColor || '#a3e635';
    for (let i = -2; i <= 2; i++) {
      const spikeX = i * (s * 0.3);
      ctx.beginPath();
      ctx.moveTo(spikeX - 4, -s * 0.4);
      ctx.lineTo(spikeX, -s * 0.75);
      ctx.lineTo(spikeX + 4, -s * 0.4);
      ctx.closePath();
      ctx.fill();
    }

    // Maw
    const attackSnap = isAttacking ? faceDir * 6 : 0;
    const jawX = faceDir * (s * 0.7) + attackSnap;
    ctx.beginPath();
    ctx.arc(jawX, 0, s * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
  } else {
    // Moss Turtle Shell (Hex dome)
    const shellW = s * 0.75;
    const shellH = s * 0.55;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, -2, shellW, shellH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hexagonal shell plates
    ctx.strokeStyle = secColor || '#15803d';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, -2, shellH * 0.5, 0, Math.PI * 2);
    ctx.moveTo(-shellW * 0.5, -2);
    ctx.lineTo(shellW * 0.5, -2);
    ctx.stroke();

    // Turtle head bobbing forward
    const headReach = faceDir * (shellW + 6 + Math.sin(animTime * 6) * 3);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(faceDir * (shellW * 0.7), 0);
    ctx.lineTo(headReach, 0);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(headReach, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    // Small eye
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(headReach + faceDir * 2, -1, 1.4, 0, Math.PI * 2);
    ctx.fill();

    // 4 Flippers paddling
    const paddle = Math.sin(animTime * 8) * 0.35;
    ctx.lineWidth = 2.6;
    [-1, 1].forEach((side) => {
      // Front flipper
      ctx.beginPath();
      ctx.moveTo(faceDir * (shellW * 0.4), side * (shellH * 0.6));
      ctx.lineTo(faceDir * (shellW * 0.8), side * (shellH * 1.1 + paddle * 6));
      ctx.stroke();

      // Rear flipper
      ctx.beginPath();
      ctx.moveTo(-faceDir * (shellW * 0.4), side * (shellH * 0.6));
      ctx.lineTo(-faceDir * (shellW * 0.7), side * (shellH * 0.9 - paddle * 4));
      ctx.stroke();
    });
  }
}

