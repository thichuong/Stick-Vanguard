import { EnemyEntity } from '../types/entities.types.js';

export type EnemyVisualArchetype =
  | 'HUMANOID'
  | 'DRAGON'
  | 'SERPENT'
  | 'AVIAN_BAT'
  | 'ARACHNID'
  | 'TURTLE_BEAST'
  | 'SLIME_CRYSTAL'
  | 'COLOSSUS'
  | 'WRAITH_REAPER'
  | 'SIREN';

export interface ArchetypeInfo {
  archetype: EnemyVisualArchetype;
  name: string;
  icon: string;
  description: string;
}

export class EnemyArchetypeRenderer {
  /**
   * Deterministically identify visual archetype based on enemy type ID and characteristics
   */
  public static getArchetype(enemy: { typeId?: string; type?: string }): EnemyVisualArchetype {
    const id = enemy.typeId || enemy.type || '';

    // 1. Dragon species
    if (
      id === 'DARK_DRAGON_BOSS' ||
      id === 'WYVERN_RAIDER' ||
      id === 'DRAKE_WARRIOR' ||
      id === 'RIVER_DRAKE'
    ) {
      return 'DRAGON';
    }

    // 2. Serpents & Eels & Hydra
    if (
      id === 'AQUA_SERPENT' ||
      id === 'SPARK_EEL' ||
      id === 'VOID_HYDRA_BOSS'
    ) {
      return 'SERPENT';
    }

    // 3. Avians, Bats & Fairies & Angels
    if (
      id === 'WINGED_GARGOYLE' ||
      id === 'TOXIC_BAT' ||
      id === 'FAIRY_SPRITE' ||
      id === 'SERAPH_VALKYRIE' ||
      id === 'EMP_DRONE' ||
      id === 'ARCHANGEL_MONARCH_BOSS'
    ) {
      return 'AVIAN_BAT';
    }

    // 4. Arachnids (Spiders)
    if (id === 'VENOM_ARACHNID') {
      return 'ARACHNID';
    }

    // 5. Turtles & Water Behemoths & Crabs
    if (id === 'MOSS_TURTLE' || id === 'PLAGUE_LEVIATHAN' || id === 'ABYSSAL_CRAB') {
      return 'TURTLE_BEAST';
    }

    // 6. Slimes, Blobs & Ice Shards
    if (
      id === 'MAGMA_SLIME' ||
      id === 'EMBER_BLOB' ||
      id === 'ICE_SHARDLING'
    ) {
      return 'SLIME_CRYSTAL';
    }

    // 7. Colossus & Golems & Chrono Destroyer
    if (
      id === 'ROCK_GOLEM' ||
      id === 'FROST_CRYSTAL_GOLEM' ||
      id === 'IRON_COLOSSUS' ||
      id === 'CHRONO_DESTROYER_BOSS'
    ) {
      return 'COLOSSUS';
    }

    // 8. Wraiths & Reapers & Degrader
    if (
      id === 'SHADOW_WRAITH' ||
      id === 'PHANTOM_REAPER' ||
      id === 'SPECTRAL_BANSHEE' ||
      id === 'HEX_DEGRADER'
    ) {
      return 'WRAITH_REAPER';
    }

    // 9. Siren (Mermaid) & Priestess
    if (id === 'STORM_CALLER_SIREN' || id === 'TIDAL_PRIESTESS') {
      return 'SIREN';
    }

    // 10. Default humanoid / warriors
    return 'HUMANOID';
  }

  /**
   * Get metadata and display label for an enemy archetype
   */
  public static getArchetypeInfo(enemy: { typeId?: string; type?: string }): ArchetypeInfo {
    const archetype = this.getArchetype(enemy);
    switch (archetype) {
      case 'DRAGON':
        return {
          archetype,
          name: 'Tộc Rồng',
          icon: '🐲',
          description: 'Sừng cong, mõm nhọn, đuôi dài có mũi giáo và cánh xương vỗ rộng.'
        };
      case 'SERPENT':
        return {
          archetype,
          name: 'Tộc Mãng Xà & Thủy Xà',
          icon: '🐍',
          description: 'Thân nhiều đốt uốn lượn hình sóng, đầu bẹt lưỡi chẻ đôi (Trùm Hư Không có 3 đầu).'
        };
      case 'AVIAN_BAT':
        return {
          archetype,
          name: 'Tộc Quái Bay & Tiên Linh',
          icon: '🦇',
          description: 'Cánh dơi nhiều khớp gập mở hoặc 4 cánh bướm trong suốt lấp lánh.'
        };
      case 'ARACHNID':
        return {
          archetype,
          name: 'Tộc Nhện Độc',
          icon: '🕷️',
          description: 'Bụng độc tròn, 4 mắt đỏ, kìm nanh chồm tới và 8 chân que gập góc bò so le.'
        };
      case 'TURTLE_BEAST':
        return {
          archetype,
          name: 'Tộc Rùa & Thủy Quái Giáp',
          icon: '🐢',
          description: 'Mai rêu lục giác, đầu thụt thò và 4 chân chèo bơi nước nhịp nhàng.'
        };
      case 'SLIME_CRYSTAL':
        return {
          archetype,
          name: 'Tộc Dung Nham & Băng Tinh',
          icon: '💧',
          description: 'Khối giọt đàn hồi squash & stretch hoặc tinh thể băng xoay đa diện.'
        };
      case 'COLOSSUS':
        return {
          archetype,
          name: 'Tộc Khổng Lồ Golem',
          icon: '🗿',
          description: 'Thân hình thang hộ pháp, vai bọc giáp gai/đinh tán và vung nắm đấm búa tạ.'
        };
      case 'WRAITH_REAPER':
        return {
          archetype,
          name: 'Tộc Hồn Ma & Tử Thần',
          icon: '👻',
          description: 'Tà áo choàng bay lượn lơ lửng, vung Lưỡi Hái Tử Thần chém quét.'
        };
      case 'SIREN':
        return {
          archetype,
          name: 'Tộc Tiên Cá Gọi Bão',
          icon: '🧜‍♀️',
          description: 'Vương miện san hô, đuôi cá quạt sóng, quyền trượng đinh ba sét.'
        };
      case 'HUMANOID':
      default:
        return {
          archetype: 'HUMANOID',
          name: 'Tộc Người Que Chiến Binh',
          icon: '🤺',
          description: 'Bộ khung người que trang bị vũ khí riêng (gươm, đinh ba, trượng đầu lâu, băng trán).'
        };
    }
  }

  /**
   * Render creature body according to its stick-art archetype
   */
  public static renderEnemyBody(
    ctx: CanvasRenderingContext2D,
    enemy: EnemyEntity,
    animTime: number,
    elemColor: string,
    secColor: string
  ): void {
    const archetype = this.getArchetype(enemy);
    const { x, y, altitude, facing } = enemy;
    const drawY = y - altitude;
    const isEngaged = enemy.state === 'ENGAGED' || enemy.state === 'ATTACKING';
    const isAttacking = enemy.state === 'ATTACKING';
    const faceDir = facing > -Math.PI / 2 && facing < Math.PI / 2 ? 1 : -1;

    ctx.save();
    ctx.translate(x, drawY);

    switch (archetype) {
      case 'DRAGON':
        this.renderDragon(ctx, enemy, animTime, elemColor, secColor, faceDir, isAttacking);
        break;
      case 'SERPENT':
        this.renderSerpent(ctx, enemy, animTime, elemColor, secColor, faceDir, isAttacking);
        break;
      case 'AVIAN_BAT':
        this.renderAvianBat(ctx, enemy, animTime, elemColor, secColor, faceDir, isAttacking);
        break;
      case 'ARACHNID':
        this.renderArachnid(ctx, enemy, animTime, elemColor, secColor, faceDir, isAttacking);
        break;
      case 'TURTLE_BEAST':
        this.renderTurtleBeast(ctx, enemy, animTime, elemColor, secColor, faceDir, isAttacking);
        break;
      case 'SLIME_CRYSTAL':
        this.renderSlimeCrystal(ctx, enemy, animTime, elemColor, secColor, faceDir, isAttacking);
        break;
      case 'COLOSSUS':
        this.renderColossus(ctx, enemy, animTime, elemColor, secColor, faceDir, isAttacking, isEngaged);
        break;
      case 'WRAITH_REAPER':
        this.renderWraithReaper(ctx, enemy, animTime, elemColor, secColor, faceDir, isAttacking);
        break;
      case 'SIREN':
        this.renderSiren(ctx, enemy, animTime, elemColor, secColor, faceDir, isAttacking);
        break;
      case 'HUMANOID':
      default:
        this.renderHumanoid(ctx, enemy, animTime, elemColor, secColor, faceDir, isAttacking, isEngaged);
        break;
    }

    ctx.restore();
  }

  // ==========================================
  // 1. DRAGON ARCHETYPE
  // ==========================================
  private static renderDragon(
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

  // ==========================================
  // 2. SERPENT ARCHETYPE (Snake / Hydra / Eel)
  // ==========================================
  private static renderSerpent(
    ctx: CanvasRenderingContext2D,
    enemy: EnemyEntity,
    animTime: number,
    color: string,
    secColor: string,
    faceDir: number,
    isAttacking: boolean
  ): void {
    const s = enemy.size * 0.8;
    const isHydra = enemy.typeId === 'VOID_HYDRA_BOSS';
    const isEel = enemy.typeId === 'SPARK_EEL';

    ctx.strokeStyle = color;
    ctx.lineWidth = isHydra ? 4.5 : isEel ? 2.2 : 3.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Sinusoidal spine wave along movement direction
    const segmentCount = isHydra ? 8 : 6;
    const segmentLength = (s * 1.8) / segmentCount;
    const waveFreq = isEel ? 14 : 9;
    const waveAmp = s * 0.28;

    const points: { x: number; y: number }[] = [];
    for (let i = 0; i <= segmentCount; i++) {
      const segRatio = i / segmentCount;
      const px = -faceDir * (i * segmentLength) + (faceDir * s * 0.4);
      const py = Math.sin(animTime * waveFreq - i * 0.9) * waveAmp * (1 - segRatio * 0.3) + (s * 0.2);
      points.push({ x: px, y: py });
    }

    // Draw snake body
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // Eel dorsal lightning fin
    if (isEel) {
      ctx.save();
      ctx.strokeStyle = secColor || '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < points.length; i += 2) {
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[i].x, points[i].y - 8);
        if (i + 1 < points.length) {
          ctx.lineTo(points[i + 1].x, points[i + 1].y);
        }
      }
      ctx.stroke();
      ctx.restore();
    }

    // Heads: Void Hydra has 3 heads, standard serpent has 1
    const headOffsets = isHydra ? [-s * 0.4, 0, s * 0.4] : [0];

    headOffsets.forEach((yOff, idx) => {
      const headBase = points[0];
      const headAnim = Math.sin(animTime * 7 + idx * 2) * (s * 0.2);
      const hx = headBase.x + faceDir * (s * 0.6) + (isAttacking ? faceDir * (s * 0.4) : 0);
      const hy = headBase.y + yOff * 0.7 + headAnim - (s * 0.2);

      // Neck to head
      ctx.beginPath();
      ctx.moveTo(headBase.x, headBase.y);
      ctx.quadraticCurveTo(headBase.x + faceDir * (s * 0.2), headBase.y + yOff * 0.4, hx, hy);
      ctx.stroke();

      // Serpent Head (wedge / diamond)
      ctx.save();
      ctx.translate(hx, hy);
      ctx.scale(faceDir, 1);

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(-4, -6);
      ctx.lineTo(s * 0.45, 0); // nose tip
      ctx.lineTo(-4, 6);
      ctx.lineTo(-8, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Slit eye
      ctx.fillStyle = isHydra ? '#f43f5e' : '#fef08a';
      ctx.beginPath();
      ctx.arc(0, -2, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Forked red tongue flicking
      const tongueFlick = Math.sin(animTime * 18 + idx) > 0.3;
      if (tongueFlick || isAttacking) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(s * 0.45, 0);
        ctx.lineTo(s * 0.45 + 7, 0);
        ctx.lineTo(s * 0.45 + 11, -3);
        ctx.moveTo(s * 0.45 + 7, 0);
        ctx.lineTo(s * 0.45 + 11, 3);
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  // ==========================================
  // 3. AVIAN & BAT ARCHETYPE (Bird / Bat / Fairy)
  // ==========================================
  private static renderAvianBat(
    ctx: CanvasRenderingContext2D,
    enemy: EnemyEntity,
    animTime: number,
    color: string,
    secColor: string,
    faceDir: number,
    isAttacking: boolean
  ): void {
    const s = enemy.size * 0.85;
    const isFairy = enemy.typeId === 'FAIRY_SPRITE';

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
      ctx.arc(0, -s * 0.5, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Body & Legs
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.5 + 4);
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

      // Fairy wand or sparkle
      ctx.strokeStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.2);
      ctx.lineTo(faceDir * (s * 0.6), -s * 0.2);
      ctx.stroke();
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

  // ==========================================
  // 4. ARACHNID ARCHETYPE (8-Legged Spider)
  // ==========================================
  private static renderArachnid(
    ctx: CanvasRenderingContext2D,
    enemy: EnemyEntity,
    animTime: number,
    color: string,
    secColor: string,
    faceDir: number,
    isAttacking: boolean
  ): void {
    const s = enemy.size * 0.85;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Abdomen (rear bulb)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(-faceDir * (s * 0.35), 0, s * 0.45, s * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Skull/poison hourglass marking on abdomen
    ctx.fillStyle = secColor || '#84cc16';
    ctx.beginPath();
    ctx.arc(-faceDir * (s * 0.35), 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Cephalothorax (head/front body)
    const biteLunge = isAttacking ? faceDir * 4 : 0;
    const headX = faceDir * (s * 0.25) + biteLunge;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(headX, 0, s * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Multiple glowing eyes (cluster of 4)
    ctx.fillStyle = '#ef4444';
    [-2, 2].forEach((offsetY) => {
      ctx.beginPath();
      ctx.arc(headX + faceDir * 3, offsetY, 1.4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Chelicerae / Fangs
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(headX + faceDir * (s * 0.2), -3);
    ctx.lineTo(headX + faceDir * (s * 0.45), -1);
    ctx.moveTo(headX + faceDir * (s * 0.2), 3);
    ctx.lineTo(headX + faceDir * (s * 0.45), 1);
    ctx.stroke();

    // 8 Spidery jointed legs (4 per side with alternating crawl cycles)
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.2;

    const legCount = 4;
    for (let i = 0; i < legCount; i++) {
      const legPhase = animTime * 14 + i * 1.5;
      const legLift = Math.sin(legPhase) * 6;
      const legReach = Math.cos(legPhase) * 5;

      const spread = (i - 1.5) * (s * 0.25);

      // Top legs
      const kx = spread;
      const ky = -s * 0.7 + legLift;
      const fx = spread + faceDir * 5 + legReach;
      const fy = -s * 0.95 + Math.max(0, legLift);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(kx, ky);
      ctx.lineTo(fx, fy);
      ctx.stroke();

      // Bottom legs
      const bky = s * 0.7 - legLift;
      const bfy = s * 0.95 - Math.max(0, legLift);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(kx, bky);
      ctx.lineTo(fx, bfy);
      ctx.stroke();
    }
  }

  // ==========================================
  // 5. TURTLE & BEAST ARCHETYPE (Moss Turtle / Leviathan)
  // ==========================================
  private static renderTurtleBeast(
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

  // ==========================================
  // 6. SLIME & CRYSTAL ARCHETYPE (Slime / Shard)
  // ==========================================
  private static renderSlimeCrystal(
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

  // ==========================================
  // 7. COLOSSUS ARCHETYPE (Golems)
  // ==========================================
  private static renderColossus(
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

  // ==========================================
  // 8. WRAITH & REAPER ARCHETYPE (Ghost / Scythe)
  // ==========================================
  private static renderWraithReaper(
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

  // ==========================================
  // 9. SIREN ARCHETYPE (Mermaid)
  // ==========================================
  private static renderSiren(
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

  // ==========================================
  // 10. HUMANOID WARRIOR & MAGE ARCHETYPE
  // ==========================================
  private static renderHumanoid(
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
}
