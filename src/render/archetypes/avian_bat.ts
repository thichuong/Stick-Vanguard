import { EnemyEntity } from '../../types/entities.types.js';

export function renderAvianBat(
  ctx: CanvasRenderingContext2D,
  enemy: EnemyEntity,
  animTime: number,
  color: string,
  secColor: string,
  faceDir: number,
  isAttacking: boolean
): void {
  const s = enemy.size * 0.85;
  const isCelestialFairy = enemy.typeId === 'CELESTIAL_FAIRY';
  const isFairy = enemy.typeId === 'FAIRY_SPRITE' || isCelestialFairy;

  const flap = Math.sin(animTime * 16) * 0.6;
  const bodyY = Math.sin(animTime * 8) * 3 + (isAttacking ? 3 : 0);

  ctx.save();
  ctx.translate(0, bodyY);

  if (isFairy) {
    // Petite stick fairy with dragonfly/butterfly wings
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    // Head
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, -s * 0.5, isCelestialFairy ? 5 : 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Halo for Celestial Fairy
    if (isCelestialFairy) {
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.5 - 7, 6, 2.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Body & Legs
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.5 + (isCelestialFairy ? 5 : 4));
    ctx.lineTo(0, s * 0.2);
    ctx.lineTo(-faceDir * 4, s * 0.6);
    ctx.stroke();

    // 4 Translucent shimmering wings
    ctx.fillStyle = `${secColor || '#f472b6'}60`;
    ctx.strokeStyle = secColor || '#f472b6';
    ctx.lineWidth = 1.4;

    [-1, 1].forEach((side) => {
      // Upper wing
      ctx.beginPath();
      ctx.ellipse(side * (s * 0.7), -s * 0.4 + flap * 6, s * 0.75, s * 0.35, side * 0.4 + flap * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Lower wing
      ctx.beginPath();
      ctx.ellipse(side * (s * 0.5), -s * 0.1 - flap * 4, s * 0.5, s * 0.25, -side * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // Fairy wand or holy scepter
    ctx.strokeStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.2);
    ctx.lineTo(faceDir * (s * 0.6), -s * 0.2);
    ctx.stroke();

    if (isCelestialFairy) {
      // Glowing holy star gem on scepter tip
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(faceDir * (s * 0.6), -s * 0.2, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Bat / Gargoyle: hunched stick torso with clawed wings
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';

    // Bat head with pointed ears
    ctx.save();
    ctx.translate(faceDir * 4, -s * 0.3);
    ctx.scale(faceDir, 1);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pointed ears
    ctx.beginPath();
    ctx.moveTo(-2, -s * 0.2);
    ctx.lineTo(-5, -s * 0.55);
    ctx.lineTo(2, -s * 0.25);
    ctx.fill();
    ctx.stroke();

    // Red eyes
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(3, -1, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Small hanging body & talons
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.1);
    ctx.lineTo(-faceDir * 3, s * 0.35);
    // Talons
    ctx.lineTo(-faceDir * 7, s * 0.55);
    ctx.moveTo(-faceDir * 3, s * 0.35);
    ctx.lineTo(-faceDir * 1, s * 0.55);
    ctx.stroke();

    // Large multi-jointed bat wings
    [-1, 1].forEach((dir) => {
      const wingSpan = s * 1.3;
      const wingFlapY = flap * 18 * dir;

      ctx.strokeStyle = color;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      const rootX = 0;
      const rootY = -s * 0.15;
      const jointX = dir * (wingSpan * 0.5);
      const jointY = rootY - wingSpan * 0.5 + wingFlapY;
      const tipX = dir * wingSpan;
      const tipY = jointY + wingSpan * 0.3;

      ctx.moveTo(rootX, rootY);
      ctx.lineTo(jointX, jointY);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();

      // Membrane ribs
      ctx.strokeStyle = `${secColor || color}90`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(jointX, jointY);
      ctx.lineTo(dir * (wingSpan * 0.7), rootY + s * 0.2);
      ctx.moveTo(jointX, jointY);
      ctx.lineTo(dir * (wingSpan * 0.4), rootY + s * 0.25);
      ctx.stroke();
    });
  }

  ctx.restore();
}

