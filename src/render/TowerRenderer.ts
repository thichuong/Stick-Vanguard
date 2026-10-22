import {
  TowerEntity,
  ProjectileEntity,
  FloatingText,
  Particle,
  Vector2D
} from '../types/entities.types.js';
import { ELEMENT_COLORS } from '../config/elements.config.js';

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

        // If Barracks, draw line to Rally Point
        if (tower.type === 'BARRACKS' && tower.rallyPoint) {
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
    }

    // Tier badge (stars)
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★'.repeat(tier), x, y + 26);
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
      ctx.fillStyle = '#ef4444';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔥', x, y);
    } else if (type === 'TRAP_FROST') {
      // Frost rune
      ctx.strokeStyle = isReady ? '#06b6d4' : '#164e63';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#06b6d4';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('❄️', x, y);
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
    for (const t of texts) {
      ctx.save();
      const alpha = Math.max(0, t.lifeTime / t.maxLifeTime);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = t.color;
      ctx.font = `bold ${t.size}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    }
  }

  public static renderParticles(
    ctx: CanvasRenderingContext2D,
    particles: Particle[]
  ): void {
    for (const p of particles) {
      ctx.save();
      const alpha = Math.max(0, p.lifeTime / p.maxLifeTime);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
