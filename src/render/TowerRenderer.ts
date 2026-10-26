import {
  TowerEntity,
  ProjectileEntity,
  FloatingText,
  Particle,
  Vector2D
} from '../types/entities.types.js';
import { ELEMENT_COLORS } from '../config/elements.config.js';
import { drawUiSvgOnCanvas } from '../config/ui/icons/index.js';
import { drawElementSvgOnCanvas } from '../config/elements/icons/index.js';

export class TowerRenderer {
  public static renderTowers(
    ctx: CanvasRenderingContext2D,
    towers: TowerEntity[],
    selectedTowerId: string | null,
    animTime: number
  ): void {
    for (const tower of towers) {
      const isSelected = tower.id === selectedTowerId;

      ctx.save();

      // Ambient Storm Zone for Mage 4_A (Arcane Tempest)
      if (tower.type === 'MAGE' && tower.tier === 4 && tower.branch === 'A') {
        this.renderMageStormZone(ctx, tower, animTime);
      }

      // Range indicator if selected
      if (isSelected) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // If Summon tower (Barracks, Dragon Nest, Fairy Tree, Heroic Altar), draw line to Rally Point
        const isSummon =
          tower.type === 'BARRACKS' ||
          tower.type === 'DRAGON_NEST' ||
          tower.type === 'FAIRY_TREE' ||
          tower.type === 'HEROIC_ALTAR';
        if (isSummon && tower.rallyPoint) {
          ctx.save();
          ctx.strokeStyle = 'rgba(234, 179, 8, 0.7)';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(tower.x, tower.y);
          ctx.lineTo(tower.rallyPoint.x, tower.rallyPoint.y);
          ctx.stroke();

          // Rally flag at destination
          this.renderRallyFlag(ctx, tower.rallyPoint, animTime);
          ctx.restore();
        }

        // If Mage 4_B, draw resonance conduit lines to all buffed towers
        if (tower.type === 'MAGE' && tower.tier === 4 && tower.branch === 'B') {
          ctx.save();
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.65)';
          ctx.lineWidth = 1.8;
          ctx.setLineDash([5, 5]);
          for (const other of towers) {
            if (other.buffSourceId === tower.id) {
              ctx.beginPath();
              ctx.moveTo(tower.x, tower.y);
              ctx.lineTo(other.x, other.y);
              ctx.stroke();
            }
          }
          ctx.restore();
        }

        // If this tower is receiving a buff from a Mage 4_B, draw connection beam
        if (tower.buffSourceId) {
          const sourceMage = towers.find((t) => t.id === tower.buffSourceId);
          if (sourceMage) {
            ctx.save();
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
            ctx.lineWidth = 1.8;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(sourceMage.x, sourceMage.y);
            ctx.lineTo(tower.x, tower.y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // Render specific tower or trap
      if (tower.placement === 'ROADSIDE') {
        this.renderRoadsideTower(ctx, tower, isSelected, animTime);
      } else {
        this.renderTrap(ctx, tower, isSelected, animTime);
      }

      ctx.restore();
    }
  }

  private static renderRoadsideTower(
    ctx: CanvasRenderingContext2D,
    tower: TowerEntity,
    isSelected: boolean,
    animTime: number
  ): void {
    const { x, y, type, tier, branch } = tower;

      // Base stone circle
    ctx.fillStyle = isSelected ? '#1e40af' : '#334155';
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isSelected ? '#60a5fa' : '#64748b';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Imbued elemental ring on base
    if (tower.secondaryElement && tower.type !== 'MAGE') {
      const elemColor = ELEMENT_COLORS[tower.secondaryElement];
      ctx.save();
      ctx.strokeStyle = elemColor;
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Buffed elemental aura from nearby Mage 4_B
    if (tower.buffedElements && tower.buffedElements.length > 0) {
      ctx.save();
      const bColor1 = ELEMENT_COLORS[tower.buffedElements[0]] || '#38bdf8';
      const bColor2 = ELEMENT_COLORS[tower.buffedElements[1] || tower.buffedElements[0]] || '#f59e0b';
      ctx.strokeStyle = bColor1;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(x, y, 22 + Math.sin(animTime * 4) * 2, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = bColor2;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    switch (type) {
      case 'BARRACKS': {
        // Barracks Garrison
        ctx.fillStyle = tier === 4 && branch === 'A' ? '#fef08a' : '#64748b';
        ctx.fillRect(x - 12, y - 10, 24, 18);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x - 4, y - 1, 8, 9); // Gate door
        // Little flag on roof
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(x + 6, y - 10);
        ctx.lineTo(x + 6, y - 22);
        ctx.lineTo(x + 16, y - 17);
        ctx.lineTo(x + 6, y - 13);
        ctx.stroke();
        break;
      }
      case 'ARCHER': {
        // Wooden watchtower with archer atop
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x - 9, y + 10);
        ctx.lineTo(x - 6, y - 14);
        ctx.moveTo(x + 9, y + 10);
        ctx.lineTo(x + 6, y - 14);
        ctx.stroke();

        // Platform
        ctx.fillStyle = '#92400e';
        ctx.fillRect(x - 11, y - 16, 22, 5);

        // Archer stickman
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(x, y - 22, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y - 18);
        ctx.lineTo(x, y - 13);
        ctx.stroke();
        break;
      }
      case 'MAGE': {
        // Arcane spire with floating pulsing crystals
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.moveTo(x - 8, y + 8);
        ctx.lineTo(x, y - 14);
        ctx.lineTo(x + 8, y + 8);
        ctx.fill();

        // Primary crystal
        const floatY = y - 24 + Math.sin(animTime * 3) * 3;
        const color1 = ELEMENT_COLORS[tower.element] || '#a855f7';

        if (tower.secondaryElement) {
          // Dual floating orbiting crystals
          const color2 = ELEMENT_COLORS[tower.secondaryElement] || '#38bdf8';
          const orbitAngle = animTime * 3;
          const cx1 = x + Math.cos(orbitAngle) * 8;
          const cy1 = floatY + Math.sin(orbitAngle) * 3;
          const cx2 = x + Math.cos(orbitAngle + Math.PI) * 8;
          const cy2 = floatY + Math.sin(orbitAngle + Math.PI) * 3;

          // Crystal 1
          ctx.fillStyle = color1;
          ctx.beginPath();
          ctx.arc(cx1, cy1, 5, 0, Math.PI * 2);
          ctx.fill();

          // Crystal 2
          ctx.fillStyle = color2;
          ctx.beginPath();
          ctx.arc(cx2, cy2, 5, 0, Math.PI * 2);
          ctx.fill();

          // Pulsing glow ring
          ctx.strokeStyle = color1;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(x, floatY, 13 + Math.sin(animTime * 4) * 2, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          // Single crystal
          ctx.fillStyle = color1;
          ctx.beginPath();
          ctx.moveTo(x, floatY - 8);
          ctx.lineTo(x + 6, floatY);
          ctx.lineTo(x, floatY + 8);
          ctx.lineTo(x - 6, floatY);
          ctx.closePath();
          ctx.fill();

          // Pulsing glow ring
          ctx.strokeStyle = color1;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(x, floatY, 10 + Math.sin(animTime * 4) * 2, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
      }
      case 'ARTILLERY': {
        // Heavy iron bombard
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x - 12, y - 6, 24, 14);

        // Cannon barrel
        ctx.save();
        ctx.translate(x, y - 6);
        ctx.rotate(-Math.PI / 4);
        ctx.fillStyle = '#475569';
        ctx.fillRect(-4, -14, 8, 16);
        ctx.strokeStyle = '#94a3b8';
        ctx.strokeRect(-4, -14, 8, 16);
        ctx.restore();
        break;
      }
      case 'DRAGON_NEST': {
        // Volcanic dragon crag lair
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.moveTo(x - 13, y + 8);
        ctx.lineTo(x - 9, y - 8);
        ctx.lineTo(x, y - 16);
        ctx.lineTo(x + 9, y - 8);
        ctx.lineTo(x + 13, y + 8);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Glowing draconic egg / crest in the nest
        const pulse = Math.sin(animTime * 4) * 1.5;
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.ellipse(x, y - 4, 5 + pulse * 0.5, 7 + pulse * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        break;
      }
      case 'FAIRY_TREE': {
        // Mystical enchanted tree
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x - 3, y - 2, 6, 12);

        // Radiant foliage
        const fPulse = Math.sin(animTime * 3) * 1.5;
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.arc(x, y - 10, 11 + fPulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath();
        ctx.arc(x - 2, y - 12, 6, 0, Math.PI * 2);
        ctx.fill();

        // Floating fairy starlight
        const sAngle = animTime * 4;
        const sx = x + Math.cos(sAngle) * 12;
        const sy = y - 10 + Math.sin(sAngle) * 6;
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'HEROIC_ALTAR': {
        // Spectral soul altar with rune plinth
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(x - 12, y - 4, 24, 14);
        ctx.strokeStyle = '#4338ca';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x - 12, y - 4, 24, 14);

        // Floating soul flame
        const flameY = y - 14 + Math.sin(animTime * 3) * 2;
        ctx.fillStyle = '#818cf8';
        ctx.beginPath();
        ctx.arc(x, flameY, 5 + Math.sin(animTime * 6) * 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Active spirits count badge
        const activeCount = tower.soldierIds ? tower.soldierIds.length : 0;
        ctx.fillStyle = '#e0e7ff';
        ctx.font = 'bold 8.5px sans-serif';
        ctx.textAlign = 'left';
        drawUiSvgOnCanvas(ctx, 'ARCH_WRAITH', x - 18, y - 2, 10, 10);
        ctx.fillText(`${activeCount}/${tower.maxSoldiers || 2}`, x - 6, y + 6);
        break;
      }
    }

    // Tier badge (stars)
    if (tier > 0) {
      const starSize = 10;
      const spacing = 2;
      const totalWidth = tier * starSize + (tier - 1) * spacing;
      const startX = x - totalWidth / 2;
      for (let i = 0; i < tier; i++) {
        drawUiSvgOnCanvas(ctx, 'STAR', startX + i * (starSize + spacing), y + 17, starSize, starSize);
      }
    }

    // Disabled / Stunned visual ring & timer
    if (tower.disabledTimer && tower.disabledTimer > 0) {
      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.0;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.arc(x, y, 24 + Math.sin(animTime * 8) * 2, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      drawUiSvgOnCanvas(ctx, 'BOLT', x - 22, y - 38, 12, 12);
      ctx.fillText(`${tower.disabledTimer.toFixed(1)}s`, x - 8, y - 28);
      ctx.restore();
    }
  }

  private static renderTrap(
    ctx: CanvasRenderingContext2D,
    trap: TowerEntity,
    _isSelected: boolean,
    animTime: number
  ): void {
    const { x, y, type } = trap;
    const isReady = trap.attackCooldown <= 0;

    ctx.save();
    if (type === 'TRAP_SPIKE') {
      // Earth spikes
      ctx.fillStyle = isReady ? '#78716c' : '#44403c';
      ctx.fillRect(x - 10, y - 10, 20, 20);
      if (isReady) {
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.5;
        for (let i = -6; i <= 6; i += 4) {
          ctx.beginPath();
          ctx.moveTo(x + i, y + 6);
          ctx.lineTo(x + i, y - 6);
          ctx.stroke();
        }
      }
    } else if (type === 'TRAP_FIRE') {
      // Fire rune
      ctx.strokeStyle = isReady ? '#ef4444' : '#7f1d1d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 12 + (isReady ? Math.sin(animTime * 6) * 2 : 0), 0, Math.PI * 2);
      ctx.stroke();
      drawElementSvgOnCanvas(ctx, 'FIRE', x - 7, y - 7, 14);
    } else if (type === 'TRAP_FROST') {
      // Frost rune
      ctx.strokeStyle = isReady ? '#06b6d4' : '#164e63';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.stroke();
      drawElementSvgOnCanvas(ctx, 'ICE', x - 7, y - 7, 14);
    } else if (type === 'TRAP_NET') {
      // Sky Net pylon
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fill();
      if (isReady) {
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, 16 + Math.sin(animTime * 8) * 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Cooldown indicator if rearming
    if (!isReady && trap.rearmTimer) {
      const progress = 1 - trap.attackCooldown / trap.rearmTimer;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 14, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
      ctx.stroke();
    }

    ctx.restore();
  }

  private static renderRallyFlag(
    ctx: CanvasRenderingContext2D,
    pt: Vector2D,
    animTime: number
  ): void {
    const wave = Math.sin(animTime * 6) * 3;
    ctx.save();
    // Flag pole
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y + 4);
    ctx.lineTo(pt.x, pt.y - 18);
    ctx.stroke();

    // Flag pennant
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y - 18);
    ctx.lineTo(pt.x + 12 + wave, pt.y - 13);
    ctx.lineTo(pt.x, pt.y - 8);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Renders a clean rotating storm circle around Mage 4_A to indicate its active area.
   */
  private static renderMageStormZone(
    ctx: CanvasRenderingContext2D,
    tower: TowerEntity,
    animTime: number
  ): void {
    const { x, y, range, element } = tower;
    const color = ELEMENT_COLORS[element] || '#a855f7';

    ctx.save();

    // Clean rotating dashed circle around the tower
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6;
    ctx.setLineDash([8, 8]);
    ctx.lineDashOffset = -animTime * 24;
    ctx.beginPath();
    ctx.arc(x, y, range, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  public static renderProjectiles(
    ctx: CanvasRenderingContext2D,
    projectiles: ProjectileEntity[]
  ): void {
    for (const p of projectiles) {
      ctx.save();
      const color = ELEMENT_COLORS[p.damagePayload.element] || '#ffffff';

      if (p.isParabolic) {
        // Cannonball with shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(p.x, p.y + 20, 5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fill();

        const strokeColor = p.damagePayload.secondaryElement
          ? ELEMENT_COLORS[p.damagePayload.secondaryElement]
          : color;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2.0;
        ctx.stroke();
      } else if (p.damagePayload.element === 'PHYSICAL') {
        // Arrow
        const angle = Math.atan2(p.targetY - p.y, p.targetX - p.x);
        ctx.translate(p.x, p.y);
        ctx.rotate(angle);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(6, 0);
        ctx.stroke();

        const tipColor = p.damagePayload.secondaryElement
          ? ELEMENT_COLORS[p.damagePayload.secondaryElement]
          : '#94a3b8';
        ctx.fillStyle = tipColor;
        ctx.beginPath();
        ctx.moveTo(6, -2);
        ctx.lineTo(10, 0);
        ctx.lineTo(6, 2);
        ctx.fill();
      } else {
        // Magic orb / glowing projectile
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();

        if (p.damagePayload.secondaryElement) {
          ctx.strokeStyle = ELEMENT_COLORS[p.damagePayload.secondaryElement];
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      ctx.restore();
    }
  }

  public static renderFloatingTexts(
    ctx: CanvasRenderingContext2D,
    texts: FloatingText[]
  ): void {
    if (texts.length === 0) return;
    ctx.save();
    ctx.textAlign = 'center';
    let lastColor = '';
    let lastAlpha = -1;

    for (let i = 0; i < texts.length; i++) {
      const t = texts[i];
      const alpha = Math.max(0, t.lifeTime / t.maxLifeTime);
      if (alpha !== lastAlpha) {
        ctx.globalAlpha = alpha;
        lastAlpha = alpha;
      }
      if (t.color !== lastColor) {
        ctx.fillStyle = t.color;
        lastColor = t.color;
      }
      ctx.font = `bold ${t.size}px sans-serif`;
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.restore();
  }

  public static renderParticles(
    ctx: CanvasRenderingContext2D,
    particles: Particle[]
  ): void {
    if (particles.length === 0) return;
    ctx.save();
    let lastColor = '';
    let lastAlpha = -1;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const alpha = Math.max(0, p.lifeTime / p.maxLifeTime);
      if (alpha !== lastAlpha) {
        ctx.globalAlpha = alpha;
        lastAlpha = alpha;
      }
      if (p.color !== lastColor) {
        ctx.fillStyle = p.color;
        lastColor = p.color;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
