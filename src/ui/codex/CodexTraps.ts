import { TOWER_BLUEPRINTS, TowerBlueprint } from '../../config/towers.config.js';
import { ELEMENT_COLORS, ELEMENT_ICONS, ELEMENT_NAMES } from '../../config/elements.config.js';

export class CodexTraps {
  public getTrapsCategoryHtml(targetSubId?: string): string {
    const traps: TowerBlueprint[] = [
      TOWER_BLUEPRINTS['TRAP_SPIKE'],
      TOWER_BLUEPRINTS['TRAP_FIRE'],
      TOWER_BLUEPRINTS['TRAP_FROST'],
      TOWER_BLUEPRINTS['TRAP_NET']
    ].filter(Boolean);

    const trapEffectsMap: Record<
      string,
      { effectName: string; effectDesc: string; synergyTag: string }
    > = {
      TRAP_SPIKE: {
        effectName: 'Chông Gai & Địa Chấn (Earth/Slow)',
        effectDesc: 'Phát nổ khi quái Đi Bộ dẫm phải. Gây 20 sát thương và tạo chấn động làm chậm 35% tốc độ di chuyển trong 2.5s.',
        synergyTag: '🪨 Địa chấn • Giảm 35% Tốc độ quái đi bộ'
      },
      TRAP_FIRE: {
        effectName: 'Mìn Lửa Hỏa Ngục (Fire/Burn)',
        effectDesc: 'Kích nổ diện rộng thiêu đốt toàn bộ quái vật dẫm phải, gây 25 sát thương Lửa và thiêu đốt DoT trong 3.0s (mỗi 0.5s rút máu 20% Base DMG).',
        synergyTag: '🔥 DoT Thiêu Đốt 3s diện rộng • Bỏ qua giáp'
      },
      TRAP_FROST: {
        effectName: 'Thủy Lôi Băng Giá (Ice/Freeze)',
        effectDesc: 'Khắc tinh số 1 ngầm dưới lòng sông: Phát nổ khi Thủy Quái bơi qua, gây 15 sát thương Hàn Băng, làm chậm 45% và đóng băng quái dưới nước bất động 1.2s!',
        synergyTag: '🌊 Độc quyền Sông Nước • Làm chậm 45% & Đóng băng 1.2s'
      },
      TRAP_NET: {
        effectName: 'Lưới Điện Tê Liệt (Lightning/Shock)',
        effectDesc: 'Phóng xung điện cao thế giữ chân quái vật, gây choáng tê liệt 0.35s và nảy tia sét giật lan 35% sát thương sang quái vật lân cận.',
        synergyTag: '⚡ Choáng 0.35s • Nảy tia sét 35% DMG sang quái bên cạnh'
      }
    };

    const cardsHtml = traps
      .map((trap) => {
        const icon = ELEMENT_ICONS[trap.element] || '⚙️';
        const color = ELEMENT_COLORS[trap.element] || '#ffffff';
        const isWaterOnly = trap.placement === 'WATER_TRAP';
        const isHighlighted = targetSubId && (trap.type === targetSubId || trap.name.includes(targetSubId));
        const effectInfo = trapEffectsMap[trap.type] || {
          effectName: 'Hiệu ứng bẫy',
          effectDesc: 'Gây sát thương lên mục tiêu kích nổ.',
          synergyTag: '⚙️ Bẫy chiến thuật'
        };

        return `
        <div class="trap-detail-card sp-card ${isHighlighted ? 'highlighted-elem' : ''}" style="border-left-color: ${color}">
          <div class="trap-card-header">
            <span class="trap-icon" style="color: ${color}">${icon}</span>
            <div>
              <h4 class="trap-name">${trap.name}</h4>
              <span class="trap-placement-tag ${isWaterOnly ? 'water-tag' : 'path-tag'}">
                ${isWaterOnly ? '🌊 Đặt dưới sông (Water)' : '🪨 Đặt trên đường (Ground)'}
              </span>
            </div>
            <span class="trap-cost">🪙 ${trap.cost}</span>
          </div>
          <p class="trap-desc">${trap.description}</p>
          <div class="trap-stats-row">
            <span>Sát thương nổ: <b>${trap.damage} DMG</b></span>
            <span>Số lần nổ trữ: <b>${trap.maxTrapCharges || 1} lần</b></span>
            <span>Nguyên tố: <b style="color: ${color}">${icon} ${ELEMENT_NAMES[trap.element]}</b></span>
            <span>Hồi phục nạp: <b>Sau mỗi đợt quái</b></span>
          </div>
          <div class="sim-effect-box" style="margin-top: 8px; border-left-color: ${color}; padding: 8px 12px;">
            <div class="sim-effect-title" style="color: ${color}; font-size: 13.5px;">
              ${icon} ${effectInfo.effectName}
            </div>
            <p class="sim-effect-desc" style="font-size: 13px;">${effectInfo.effectDesc}</p>
            <div class="sim-synergy-tag" style="font-size: 12px; margin-top: 2px;">${effectInfo.synergyTag}</div>
          </div>
        </div>
      `;
      })
      .join('');

    return `
      <div class="sp-section sp-card">
        <h4 class="sp-sec-title">📖 CƠ CHẾ HOẠT ĐỘNG CỦA BẪY</h4>
        <p class="sp-desc">
          Bẫy được đặt trực tiếp lên các vị trí ô đặc biệt trên đường đi (PATH_TRAP) hoặc dưới kênh nước (WATER_TRAP).
          Khác với tháp thông thường cần tầm bắn, bẫy nằm ẩn mình và tự động kích hoạt ngay khi quái vật bước chân vào bán kính kích nổ.
        </p>
        <p class="sp-tip-text">
          💡 Bẫy tự động tái kích hoạt tối đa theo số lần trữ (Charges) và sẽ tự nạp đầy lại sau mỗi đợt quái. Bẫy Thủy Lôi là khắc tinh duy nhất dưới lòng sông!
        </p>
      </div>

      <div class="sp-section">
        <h4 class="sp-sec-title">⚙️ DANH SÁCH 4 LOẠI BẪY CHIẾN THUẬT</h4>
        <div class="traps-list-grid">${cardsHtml}</div>
      </div>
    `;
  }
}

