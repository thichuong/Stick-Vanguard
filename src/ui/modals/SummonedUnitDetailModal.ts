import { GameState } from '../../core/GameState.js';
import { SoldierEntity, TowerEntity } from '../../types/entities.types.js';
import { ElementType } from '../../types/elements.types.js';
import {
  ELEMENT_COLORS,
  ELEMENT_ICONS,
  ELEMENT_NAMES,
  ALL_15_ELEMENTS,
  ELEMENTAL_MATCHUPS
} from '../../config/elements.config.js';
import { UI_ICONS } from '../../config/ui/icons/index.js';
import { TargetingRuleEngine } from '../../systems/TargetingRuleEngine.js';

export interface DamageSourceBreakdown {
  label: string;
  sourceDesc: string;
  element: ElementType;
  ratioText: string;
  damage: number;
}

export class SummonedUnitDetailModal {
  private backdropEl: HTMLElement | null;
  private contentEl: HTMLElement | null;
  private titleEl: HTMLElement | null;
  private iconEl: HTMLElement | null;
  private badgeEl: HTMLElement | null;

  public currentSoldierId: string | null = null;
  public currentTowerId: string | null = null;
  public offensiveFilter: 'ALL' | 'EFFECTIVE' | 'RESISTED' = 'ALL';
  public defensiveFilter: 'ALL' | 'DANGER' | 'SAFE' = 'ALL';
  public activeSubTab: 'OVERVIEW' | 'OFFENSIVE' | 'DEFENSIVE' = 'OVERVIEW';

  constructor(private state: GameState) {
    this.backdropEl = typeof document !== 'undefined' ? document.getElementById('unit-detail-modal-backdrop') : null;
    this.contentEl = typeof document !== 'undefined' ? document.getElementById('unit-modal-body') : null;
    this.titleEl = typeof document !== 'undefined' ? document.getElementById('unit-modal-title') : null;
    this.iconEl = typeof document !== 'undefined' ? document.getElementById('unit-modal-icon') : null;
    this.badgeEl = typeof document !== 'undefined' ? document.getElementById('unit-modal-badge') : null;

    this.bindEvents();
  }

  private bindEvents(): void {
    if (typeof document === 'undefined') return;

    const closeBtn = document.getElementById('btn-close-unit-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.close();
      });
    }

    if (this.backdropEl) {
      this.backdropEl.addEventListener('click', (e) => {
        if (e.target === this.backdropEl) {
          this.close();
        }
      });
    }
  }

  public isOpen(): boolean {
    return !!this.backdropEl && !this.backdropEl.classList.contains('hidden');
  }

  public open(soldierId: string, towerId?: string): void {
    const soldier = this.state.soldiers.find((s) => s.id === soldierId);
    if (!soldier) return;

    this.currentSoldierId = soldierId;
    this.currentTowerId = towerId || soldier.towerId;

    if (this.backdropEl) {
      this.backdropEl.classList.remove('hidden');
    }

    this.render();
  }

  public close(): void {
    if (this.backdropEl) {
      this.backdropEl.classList.add('hidden');
    }
    this.currentSoldierId = null;
  }

  /**
   * Calculates the outgoing elemental damage sources for a summoned unit
   */
  public getSoldierDamageSources(soldier: SoldierEntity, tower: TowerEntity): DamageSourceBreakdown[] {
    const sources: DamageSourceBreakdown[] = [];
    const globalMult = TargetingRuleEngine.globalDamageMultiplier ?? 1.0;

    // 1. Primary Base Element
    const primaryElem = soldier.element || 'PHYSICAL';
    const primaryDmg = Math.max(1, Math.round(soldier.damage * globalMult));
    let primaryDesc = 'Công kích cơ bản';
    if (soldier.archetype === 'DRAGON') primaryDesc = 'Bản thể Hỏa Long';
    else if (soldier.archetype === 'FAIRY') primaryDesc = 'Bản thể Tinh Linh Tiên';
    else if (soldier.combatMode === 'RANGED') primaryDesc = 'Mưa tên Xạ Thủ';
    else primaryDesc = 'Đòn đánh Chiến Binh';

    sources.push({
      label: 'Bản Thể (Gốc)',
      sourceDesc: primaryDesc,
      element: primaryElem,
      ratioText: '100% Base',
      damage: primaryDmg
    });

    // 2. Secondary Element (Imbued at tower or inherited)
    if (soldier.secondaryElement) {
      const isDragonOrFairy = soldier.archetype === 'DRAGON' || soldier.archetype === 'FAIRY';
      const secRatio = isDragonOrFairy ? 0.6 : 0.45;
      const secDmg = Math.max(1, Math.round(soldier.damage * secRatio * globalMult));
      sources.push({
        label: 'Khảm Thuộc Tính',
        sourceDesc: `Gắn tại ${tower.name}`,
        element: soldier.secondaryElement,
        ratioText: `+${Math.round(secRatio * 100)}% Base`,
        damage: secDmg
      });
    }

    // 3. Aura Buffs from Mage 4_B Towers
    if (soldier.buffedElements && soldier.buffedElements.length > 0) {
      const buffSourceTower = tower.buffSourceId ? this.state.towers.find((t) => t.id === tower.buffSourceId) : null;
      const buffSourceName = buffSourceTower ? buffSourceTower.name : 'Tháp Phù Thủy 4-B';
      for (let i = 0; i < soldier.buffedElements.length; i++) {
        const bElem = soldier.buffedElements[i];
        const bDmg = Math.max(1, Math.round(soldier.damage * 0.45 * globalMult));
        sources.push({
          label: `Hào Quang Phù Thủy (Khe ${i + 1})`,
          sourceDesc: `Nhận từ ${buffSourceName}`,
          element: bElem,
          ratioText: '+45% Base',
          damage: bDmg
        });
      }
    }

    // 4. Heroic Spirit (Ghost Element)
    if (soldier.isSpirit) {
      const ghostRatio = soldier.spiritGhostRatio ?? 0.5;
      const ghostDmg = Math.max(1, Math.round(soldier.damage * ghostRatio * globalMult));
      sources.push({
        label: 'Chiêu Hồn Anh Linh',
        sourceDesc: 'Huyết thống Tế Đàn Anh Linh',
        element: 'GHOST',
        ratioText: `+${Math.round(ghostRatio * 100)}% Base`,
        damage: ghostDmg
      });
    }

    return sources;
  }

  public render(): void {
    if (!this.contentEl || !this.currentSoldierId) return;

    const soldier = this.state.soldiers.find((s) => s.id === this.currentSoldierId);
    if (!soldier) {
      this.close();
      return;
    }

    const tower: TowerEntity = this.state.towers.find((t) => t.id === (this.currentTowerId || soldier.towerId)) || {
      id: soldier.towerId,
      name: 'Tháp Triệu Hồi',
      type: 'BARRACKS' as const,
      tier: soldier.tier || 1,
      x: 0,
      y: 0,
      range: 150,
      damage: soldier.damage,
      fireRate: soldier.attackSpeed,
      attackCooldown: 0.5,
      element: soldier.element,
      placement: 'ROADSIDE' as const,
      cost: 100,
      totalInvested: 100,
      targetingFilter: { allowedMovement: ['WALK'] as const }
    };

    const isDead = soldier.state === 'DEAD' || soldier.hp <= 0;
    const curHp = Math.max(0, Math.ceil(soldier.hp));
    const maxHp = soldier.maxHp || 100;
    const pct = isDead ? 0 : Math.min(100, Math.max(0, Math.round((curHp / maxHp) * 100)));
    const hpBarClass = pct > 50 ? 'hp-high' : pct > 25 ? 'hp-med' : 'hp-low';

    // Unit icon & title
    let icon = UI_ICONS.SWORD;
    if (soldier.archetype === 'DRAGON') icon = ELEMENT_ICONS.DRAGON;
    else if (soldier.archetype === 'FAIRY') icon = ELEMENT_ICONS.FAIRY;
    else if (soldier.isSpirit) icon = ELEMENT_ICONS.GHOST;
    else if (soldier.combatMode === 'RANGED') icon = UI_ICONS.BOW;

    if (this.titleEl) {
      this.titleEl.textContent = `${soldier.name} - Chi Tiết Đơn Vị Triệu Hồi`;
    }
    if (this.iconEl) {
      this.iconEl.innerHTML = icon;
    }
    if (this.badgeEl) {
      this.badgeEl.textContent = `${tower.name} (Cấp ${tower.tier || 1}) • Toàn Diện Chỉ Số & Bảng Khắc Hệ`;
    }

    // State text & class
    let stateLabel = '';
    let stateClass = '';
    if (isDead) {
      stateLabel = `⏳ Đang hồi sinh (${soldier.respawnTimer.toFixed(1)}s)`;
      stateClass = 'state-dead';
    } else if (soldier.state === 'ATTACKING') {
      stateLabel = `${UI_ICONS.SWORDS} Đang giao chiến`;
      stateClass = 'state-fighting';
    } else if (soldier.state === 'MOVING_TO_ENGAGE' || soldier.state === 'MOVING_TO_RALLY') {
      stateLabel = `${UI_ICONS.WALK} Đang di chuyển`;
      stateClass = 'state-moving';
    } else {
      stateLabel = `${UI_ICONS.SHIELD} Chốt chặn canh gác`;
      stateClass = 'state-guarding';
    }

    // Quick Switcher for units belonging to the same tower
    const siblingUnits = this.state.soldiers.filter((s) => s.towerId === tower.id);
    const unitTabsHtml = siblingUnits.map((u, idx) => {
      const isSelected = u.id === soldier.id;
      let uIcon = UI_ICONS.SWORD;
      if (u.archetype === 'DRAGON') uIcon = ELEMENT_ICONS.DRAGON;
      else if (u.archetype === 'FAIRY') uIcon = ELEMENT_ICONS.FAIRY;
      else if (u.isSpirit) uIcon = ELEMENT_ICONS.GHOST;
      else if (u.combatMode === 'RANGED') uIcon = UI_ICONS.BOW;

      let label = u.name;
      if (u.combatMode === 'RANGED' && !u.archetype) {
        label = `Xạ Thủ ${idx + 1}`;
      } else if (u.archetype === 'SOLDIER') {
        label = `Lính ${idx + 1}`;
      }

      const uDead = u.state === 'DEAD' || u.hp <= 0;
      return `
        <button class="unit-modal-tab-btn ${isSelected ? 'active' : ''} ${uDead ? 'unit-tab-dead' : ''}" data-modal-soldier="${u.id}">
          <span>${uIcon}</span>
          <span>${label}</span>
          <span style="font-size: 10px; opacity: 0.8;">(${Math.max(0, Math.ceil(u.hp))}/${u.maxHp})</span>
        </button>
      `;
    }).join('');

    // Outgoing damage sources breakdown
    const sources = this.getSoldierDamageSources(soldier, tower);
    const totalRawDmgPerHit = sources.reduce((acc, s) => acc + s.damage, 0);
    const totalDps = Math.round(totalRawDmgPerHit * soldier.attackSpeed);

    const sourcesRowsHtml = sources.map((s) => {
      const eIcon = ELEMENT_ICONS[s.element] || UI_ICONS.SPARKLES;
      const eName = ELEMENT_NAMES[s.element] || s.element;
      const eColor = ELEMENT_COLORS[s.element] || '#ffffff';
      const dps = Math.round(s.damage * soldier.attackSpeed);
      return `
        <tr>
          <td>
            <div style="font-weight: 700; color: #f1f5f9;">${s.label}</div>
            <div style="font-size: 11px; color: #64748b;">${s.sourceDesc}</div>
          </td>
          <td>
            <span style="display: inline-flex; align-items: center; gap: 5px; font-weight: 700; color: ${eColor};">
              ${eIcon} ${eName}
            </span>
          </td>
          <td style="color: #94a3b8; font-size: 11px;">${s.ratioText}</td>
          <td style="color: #38bdf8; font-weight: 800; font-size: 13px;">${s.damage}</td>
          <td style="color: #cbd5e1; font-size: 11.5px;">${dps}/s</td>
        </tr>
      `;
    }).join('');

    // Healing perks (Light / Grass)
    let healPerkHtml = '';
    const allUnitElements = [soldier.element, soldier.secondaryElement, ...(soldier.buffedElements || [])].filter(Boolean) as ElementType[];
    if (allUnitElements.includes('LIGHT')) {
      healPerkHtml += `<div class="unit-perk-pill light-perk">${ELEMENT_ICONS.LIGHT} Ban Phước Quang: Tự động hồi phục ngay +5 HP cho bản thân mỗi đòn đánh!</div>`;
    }
    if (allUnitElements.includes('GRASS')) {
      healPerkHtml += `<div class="unit-perk-pill grass-perk">${ELEMENT_ICONS.GRASS} Hút Hồn Mộc: Hút +3 HP hồi máu và có 30% tỉ lệ Trói chân (Root) kẻ địch!</div>`;
    }

    // 1. OUTGOING MATCHUPS (Khi đơn vị tấn công vào 15 hệ quái vật)
    const offensiveMatchupRows: Array<{
      target: ElementType;
      totalDmg: number;
      effectiveRatio: number;
      formulaText: string;
      category: 'SUPER' | 'EFFECTIVE' | 'NORMAL' | 'RESISTED' | 'IMMUNE';
    }> = [];

    for (const targetElem of ALL_15_ELEMENTS) {
      let totalActualDmg = 0;
      const parts: string[] = [];

      for (const src of sources) {
        const mult = ELEMENTAL_MATCHUPS[src.element]?.[targetElem] ?? 1.0;
        const actualPart = mult === 0 ? 0 : Math.max(1, Math.round(src.damage * mult));
        totalActualDmg += actualPart;

        const iconOnly = ELEMENT_ICONS[src.element] || '';
        const multText = mult === 0 ? '0%' : `x${mult}`;
        parts.push(`${iconOnly}${actualPart}(${multText})`);
      }

      const ratio = totalRawDmgPerHit > 0 ? totalActualDmg / totalRawDmgPerHit : 1.0;
      let category: 'SUPER' | 'EFFECTIVE' | 'NORMAL' | 'RESISTED' | 'IMMUNE' = 'NORMAL';
      if (totalActualDmg === 0) category = 'IMMUNE';
      else if (ratio >= 1.45) category = 'SUPER';
      else if (ratio > 1.05) category = 'EFFECTIVE';
      else if (ratio < 0.95) category = 'RESISTED';

      offensiveMatchupRows.push({
        target: targetElem,
        totalDmg: totalActualDmg,
        effectiveRatio: ratio,
        formulaText: parts.join(' + '),
        category
      });
    }

    const filteredOffensive = offensiveMatchupRows.filter((r) => {
      if (this.offensiveFilter === 'EFFECTIVE') return r.effectiveRatio > 1.05;
      if (this.offensiveFilter === 'RESISTED') return r.effectiveRatio < 0.95;
      return true;
    });

    const offensiveRowsHtml = filteredOffensive.map((m) => {
      const tIcon = ELEMENT_ICONS[m.target] || UI_ICONS.SPARKLES;
      const tName = ELEMENT_NAMES[m.target] || m.target;
      const tColor = ELEMENT_COLORS[m.target] || '#ffffff';
      const pctVal = Math.round(m.effectiveRatio * 100);
      const dps = Math.round(m.totalDmg * soldier.attackSpeed);

      let badgeHtml = '';
      if (m.category === 'SUPER' || m.category === 'EFFECTIVE') {
        badgeHtml = `<span class="match-eff-badge eff-high">+${pctVal - 100}% (${pctVal}%)</span>`;
      } else if (m.category === 'RESISTED') {
        badgeHtml = `<span class="match-eff-badge eff-low">${pctVal}%</span>`;
      } else if (m.category === 'IMMUNE') {
        badgeHtml = `<span class="match-eff-badge eff-immune">0% Miễn nhiễm</span>`;
      } else {
        badgeHtml = `<span class="match-eff-badge eff-normal">100%</span>`;
      }

      return `
        <tr>
          <td>
            <span style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700; color: ${tColor};">
              ${tIcon} ${tName}
            </span>
          </td>
          <td>${badgeHtml}</td>
          <td style="font-size: 11px; color: #94a3b8; font-family: monospace;">${m.formulaText}</td>
          <td style="font-weight: 800; color: #facc15; font-size: 13px;">${m.totalDmg}</td>
          <td style="font-size: 11.5px; color: #cbd5e1;">${dps}/s</td>
        </tr>
      `;
    }).join('');

    // 2. DEFENSIVE DAMAGE INTAKE (Khi đơn vị nhận sát thương từ 15 hệ tấn công của quái)
    // Sát thương Vật lý bị giảm trực tiếp bởi Giáp (armor).
    // Sát thương Phép bị tác động bởi Ma trận tương khắc (ELEMENTAL_MATCHUPS) và Kháng phép (magicResist).
    const defensiveRows: Array<{
      attackerElem: ElementType;
      matchupMult: number;
      armorOrResistReduction: number;
      actualIntakeRatio: number;
      category: 'SUPER_WEAK' | 'WEAK' | 'NORMAL' | 'RESIST' | 'IMMUNE';
      verdictLabel: string;
      tacticalNote: string;
    }> = [];

    const armorReduct = Math.min(0.9, Math.max(0, soldier.armor || 0));
    const magicResistReduct = Math.min(0.9, Math.max(0, soldier.magicResist || 0.1));

    for (const atkElem of ALL_15_ELEMENTS) {
      if (atkElem === 'PHYSICAL') {
        // Physical attacks from enemies: mitigated only by soldier.armor
        const intake = 1 - armorReduct;
        const intakePct = Math.round(intake * 100);
        let category: 'SUPER_WEAK' | 'WEAK' | 'NORMAL' | 'RESIST' | 'IMMUNE' = 'NORMAL';
        let verdictLabel = 'Chuẩn';
        if (intakePct <= 40) {
          category = 'RESIST';
          verdictLabel = 'Giáp Dày (Kháng Tốt)';
        } else if (intakePct <= 75) {
          category = 'RESIST';
          verdictLabel = 'Giảm Đáng Kể';
        }

        defensiveRows.push({
          attackerElem: 'PHYSICAL',
          matchupMult: 1.0,
          armorOrResistReduction: armorReduct,
          actualIntakeRatio: intake,
          category,
          verdictLabel,
          tacticalNote: `Giáp vật lý ${Math.round(armorReduct * 100)}% trực tiếp triệt tiêu ${Math.round(armorReduct * 100)}% sát thương vật lý của quái.`
        });
        continue;
      }

      // Magical attacks: calculate elemental matchup from matrix against soldier defense profile
      const defProfile = {
        primaryElement: soldier.element || 'PHYSICAL',
        secondaryElement: soldier.secondaryElement || undefined,
        immunities: []
      };

      const matchMult = TargetingRuleEngine.calculateElementalMatchup(atkElem, defProfile);
      const afterResist = matchMult * (1 - magicResistReduct);
      const pct = Math.round(afterResist * 100);

      let category: 'SUPER_WEAK' | 'WEAK' | 'NORMAL' | 'RESIST' | 'IMMUNE' = 'NORMAL';
      let verdictLabel = 'Chuẩn (100%)';
      let tacticalNote = `Nhận sát thương chuẩn từ chiêu thức ${ELEMENT_NAMES[atkElem]}.`;

      if (matchMult === 0) {
        category = 'IMMUNE';
        verdictLabel = 'Miễn Nhiễm (0%)';
        tacticalNote = 'Đơn vị hoàn toàn không chịu sát thương từ hệ này!';
      } else if (afterResist >= 1.4) {
        category = 'SUPER_WEAK';
        verdictLabel = `Khắc Tinh (x${matchMult})`;
        tacticalNote = `Nguy hiểm! Hệ ${ELEMENT_NAMES[atkElem]} là khắc tinh của đơn vị (nhận ${pct}% sát thương).`;
      } else if (afterResist > 1.05) {
        category = 'WEAK';
        verdictLabel = `Điểm Yếu (x${matchMult})`;
        tacticalNote = `Chú ý: Quái vật hệ ${ELEMENT_NAMES[atkElem]} gây thêm sát thương lên hệ của đơn vị.`;
      } else if (afterResist < 0.75) {
        category = 'RESIST';
        verdictLabel = `Kháng Cự (x${matchMult})`;
        tacticalNote = `Ưu thế phòng ngự: Giảm mạnh lượng sát thương phép nhận vào còn ${pct}%.`;
      }

      defensiveRows.push({
        attackerElem: atkElem,
        matchupMult: matchMult,
        armorOrResistReduction: magicResistReduct,
        actualIntakeRatio: afterResist,
        category,
        verdictLabel,
        tacticalNote
      });
    }

    const filteredDefensive = defensiveRows.filter((r) => {
      if (this.defensiveFilter === 'DANGER') return r.actualIntakeRatio > 1.05;
      if (this.defensiveFilter === 'SAFE') return r.actualIntakeRatio <= 0.85;
      return true;
    });

    const defensiveRowsHtml = filteredDefensive.map((d) => {
      const eIcon = ELEMENT_ICONS[d.attackerElem] || UI_ICONS.SPARKLES;
      const eName = ELEMENT_NAMES[d.attackerElem] || d.attackerElem;
      const eColor = ELEMENT_COLORS[d.attackerElem] || '#ffffff';
      const intakePct = Math.round(d.actualIntakeRatio * 100);

      let badgeHtml = '';
      if (d.category === 'SUPER_WEAK' || d.category === 'WEAK') {
        badgeHtml = `<span class="match-eff-badge eff-low">${intakePct}% (Nguy Hiểm)</span>`;
      } else if (d.category === 'RESIST') {
        badgeHtml = `<span class="match-eff-badge eff-high">${intakePct}% (An Toàn)</span>`;
      } else if (d.category === 'IMMUNE') {
        badgeHtml = `<span class="match-eff-badge eff-immune">0% Miễn nhiễm</span>`;
      } else {
        badgeHtml = `<span class="match-eff-badge eff-normal">${intakePct}%</span>`;
      }

      const reductText = d.attackerElem === 'PHYSICAL'
        ? `Giáp -${Math.round(d.armorOrResistReduction * 100)}%`
        : `Kháng Phép -${Math.round(d.armorOrResistReduction * 100)}%`;

      return `
        <tr>
          <td>
            <span style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700; color: ${eColor};">
              ${eIcon} ${eName}
            </span>
          </td>
          <td><b>${d.verdictLabel}</b></td>
          <td style="font-size: 11px; color: #94a3b8;">${reductText}</td>
          <td>${badgeHtml}</td>
          <td style="font-size: 11px; color: #cbd5e1;">${d.tacticalNote}</td>
        </tr>
      `;
    }).join('');

    const armorPct = Math.round((soldier.armor || 0) * 100);
    const magicResistPct = Math.round((soldier.magicResist || 0) * 100);
    const rangeText = soldier.combatMode === 'RANGED' ? `${soldier.rangedRange || 145}px (Tầm xa)` : '24px (Cận chiến)';
    const blockText = soldier.canBlockAir ? 'Chặn Đi Bộ & Quái Bay' : 'Chặn Đi Bộ (1v1)';
    const targetText = soldier.archetype === 'DRAGON' || soldier.archetype === 'FAIRY' || soldier.combatMode === 'RANGED'
      ? 'Bộ, Bay & Bơi (Đa Miền)'
      : 'Chỉ Đơn Vị Đi Bộ';

    this.contentEl.innerHTML = `
      <!-- Sibling Unit Quick Switcher -->
      <div class="unit-modal-switcher-row">
        <span class="unit-switcher-lbl">${UI_ICONS.UNITS} Đơn vị thuộc ${tower.name} (${siblingUnits.length}):</span>
        <div class="unit-modal-tabs-group">
          ${unitTabsHtml}
        </div>
      </div>

      <!-- Top Unit Profile Banner -->
      <div class="unit-modal-hero-card sp-card">
        <div class="umh-left">
          <div class="umh-icon-box">
            <span class="umh-icon">${icon}</span>
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h3 class="umh-title">${soldier.name}</h3>
              <span class="umh-badge">${soldier.isSpirit ? 'Anh Linh Bóng Ma' : soldier.combatMode === 'RANGED' ? 'Xạ Thủ Bắn Tên' : 'Chiến Binh Cận Chiến'}</span>
              <span class="umh-tier">Cấp ${soldier.tier || 1}</span>
            </div>
            <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">
              Công trình chủ quản: <b style="color: #f1f5f9;">${tower.name}</b> • Cắm cờ tại (${soldier.rallyPoint.x}, ${soldier.rallyPoint.y})
            </div>
          </div>
        </div>

        <div class="umh-right">
          <div class="umh-hp-box">
            <div class="umh-hp-header">
              <span style="font-size: 11px; color: #94a3b8; font-weight: 700;">SINH LỰC THỜI GIAN THỰC</span>
              <span id="modal-live-hp-val" style="font-weight: 800; font-size: 14px; color: #38bdf8;">${curHp}/${maxHp} ${UI_ICONS.HEART}</span>
            </div>
            <div class="suc-hp-track" style="height: 8px; width: 220px; background: #0f172a;">
              <div id="modal-live-hp-fill" class="suc-hp-fill ${hpBarClass}" style="width: ${pct}%;"></div>
            </div>
          </div>
          <span id="modal-live-state-tag" class="suc-state-tag ${stateClass}" style="font-size: 11px; padding: 4px 10px;">${stateLabel}</span>
        </div>
      </div>

      <!-- Stats Grid Cards -->
      <div class="unit-modal-stats-grid">
        <div class="stat-box">
          <span class="s-label">Máu Tối Đa</span>
          <span class="s-val" style="color: #38bdf8;">${maxHp} HP</span>
        </div>
        <div class="stat-box">
          <span class="s-label">Tự Hồi Máu</span>
          <span class="s-val" style="color: ${soldier.soldierRegen ? '#4ade80' : '#94a3b8'};">${soldier.soldierRegen ? `+${soldier.soldierRegen} HP/s` : '0/s'}</span>
        </div>
        <div class="stat-box">
          <span class="s-label">Giáp Vật Lý</span>
          <span class="s-val" style="color: #fbbf24;">${armorPct}% ${UI_ICONS.SHIELD}</span>
        </div>
        <div class="stat-box">
          <span class="s-label">Kháng Phép</span>
          <span class="s-val" style="color: #c084fc;">${magicResistPct}% ${UI_ICONS.ORB}</span>
        </div>
        <div class="stat-box">
          <span class="s-label">Tốc Độ Đánh</span>
          <span class="s-val">${soldier.attackSpeed}/s (${(1 / soldier.attackSpeed).toFixed(2)}s)</span>
        </div>
        <div class="stat-box">
          <span class="s-label">Tầm Đánh / Bắn</span>
          <span class="s-val">${rangeText}</span>
        </div>
        <div class="stat-box">
          <span class="s-label">Địa Hình Chặn</span>
          <span class="s-val" style="color: #fbbf24;">${blockText}</span>
        </div>
        <div class="stat-box">
          <span class="s-label">Địa Hình Tấn Công</span>
          <span class="s-val" style="color: #34d399;">${targetText}</span>
        </div>
        <div class="stat-box">
          <span class="s-label">Tái Sinh Khi Tử Trận</span>
          <span class="s-val" style="color: #a855f7;">${soldier.isSpirit ? 'Vĩnh viễn (Không tái nạp)' : `${soldier.respawnDelay}s ${UI_ICONS.TIMER}`}</span>
        </div>
        ${soldier.aoeRadius ? `
        <div class="stat-box">
          <span class="s-label">Bán Kính Nổ Lan AoE</span>
          <span class="s-val" style="color: #f97316;">${soldier.aoeRadius}px (70% DMG)</span>
        </div>` : ''}
      </div>

      ${healPerkHtml}

      <!-- Outgoing Multi-Source Damage Table -->
      <div class="sp-section sp-card" style="margin-top: 14px;">
        <div class="sp-sec-header">
          <h4 class="sp-sec-title">${UI_ICONS.SWORDS} 1. BẢNG PHÂN RÃ SÁT THƯƠNG GÂY RA ĐA NGUỒN</h4>
          <span class="sp-hint" style="color: #facc15; font-weight: 700;">
            Tổng: ${totalRawDmgPerHit} DMG / Đòn • ${totalDps} DPS Chuẩn
          </span>
        </div>
        <p class="sp-desc" style="margin-bottom: 8px;">
          Mỗi đòn đánh của đơn vị tung ra đồng thời tất cả các luồng sát thương sau:
        </p>
        <div class="table-responsive">
          <table class="stats-table">
            <thead>
              <tr>
                <th>Nguồn Buff</th>
                <th>Thuộc Tính</th>
                <th>Tỉ Lệ Sát Thương</th>
                <th>Sát Thương / Đòn</th>
                <th>DPS Chuẩn</th>
              </tr>
            </thead>
            <tbody>
              ${sourcesRowsHtml}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Two Large Tables: Offensive Matchup and Defensive Intake -->
      <div class="unit-modal-tables-grid" style="margin-top: 14px;">
        <!-- Table 2: Offensive Calculator (15 Elements) -->
        <div class="sp-section sp-card">
          <div class="sp-sec-header">
            <h4 class="sp-sec-title">${UI_ICONS.CHART} 2. SÁT THƯƠNG GÂY RA (15 HỆ MỤC TIÊU)</h4>
          </div>
          <p class="sp-desc" style="margin-bottom: 8px;">
            Tổng sát thương thực tế khi đánh vào quái vật thuộc từng hệ nguyên tố:
          </p>

          <div class="matchup-filter-row" style="margin-bottom: 8px;">
            <button class="match-filter-btn ${this.offensiveFilter === 'ALL' ? 'active' : ''}" data-off-filter="ALL">Tất Cả (15)</button>
            <button class="match-filter-btn ${this.offensiveFilter === 'EFFECTIVE' ? 'active' : ''}" data-off-filter="EFFECTIVE">Ưu Thế (>100%)</button>
            <button class="match-filter-btn ${this.offensiveFilter === 'RESISTED' ? 'active' : ''}" data-off-filter="RESISTED">Bị Kháng (<100%)</button>
          </div>

          <div class="table-responsive">
            <table class="stats-table">
              <thead>
                <tr>
                  <th>Hệ Quái</th>
                  <th>Hiệu Quả</th>
                  <th>Chi Tiết Từng Nguồn</th>
                  <th>Thực Nhận</th>
                  <th>DPS</th>
                </tr>
              </thead>
              <tbody>
                ${offensiveRowsHtml}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Table 3: Defensive Intake Calculator (15 Elements) -->
        <div class="sp-section sp-card">
          <div class="sp-sec-header">
            <h4 class="sp-sec-title">${UI_ICONS.SHIELD} 3. BẢNG TÍNH SÁT THƯƠNG NHẬN VÀO (15 HỆ)</h4>
          </div>
          <p class="sp-desc" style="margin-bottom: 8px;">
            Sát thương đơn vị phải gánh chịu khi bị quái vật mang từng hệ tấn công:
          </p>

          <div class="matchup-filter-row" style="margin-bottom: 8px;">
            <button class="match-filter-btn ${this.defensiveFilter === 'ALL' ? 'active' : ''}" data-def-filter="ALL">Tất Cả (15)</button>
            <button class="match-filter-btn ${this.defensiveFilter === 'DANGER' ? 'active' : ''}" data-def-filter="DANGER">Khắc Tinh (Nguy Hiểm)</button>
            <button class="match-filter-btn ${this.defensiveFilter === 'SAFE' ? 'active' : ''}" data-def-filter="SAFE">Kháng Cự (An Toàn)</button>
          </div>

          <div class="table-responsive">
            <table class="stats-table">
              <thead>
                <tr>
                  <th>Hệ Quái Tấn Công</th>
                  <th>Tương Khắc</th>
                  <th>Giảm Trừ</th>
                  <th>Thực Nhận</th>
                  <th>Đánh Giá & Chú Ý</th>
                </tr>
              </thead>
              <tbody>
                ${defensiveRowsHtml}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Event listeners inside modal body
    this.contentEl.querySelectorAll('[data-modal-soldier]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const sid = (e.currentTarget as HTMLElement).getAttribute('data-modal-soldier');
        if (sid) {
          this.open(sid, tower.id);
        }
      });
    });

    this.contentEl.querySelectorAll('[data-off-filter]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const f = (e.currentTarget as HTMLElement).getAttribute('data-off-filter') as 'ALL' | 'EFFECTIVE' | 'RESISTED';
        if (f) {
          this.offensiveFilter = f;
          this.render();
        }
      });
    });

    this.contentEl.querySelectorAll('[data-def-filter]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const f = (e.currentTarget as HTMLElement).getAttribute('data-def-filter') as 'ALL' | 'DANGER' | 'SAFE';
        if (f) {
          this.defensiveFilter = f;
          this.render();
        }
      });
    });
  }

  /**
   * Smoothly updates live HP, bar, and status if modal is currently open
   */
  public updateLive(): void {
    if (!this.isOpen() || !this.currentSoldierId) return;

    const soldier = this.state.soldiers.find((s) => s.id === this.currentSoldierId);
    if (!soldier) {
      this.close();
      return;
    }

    const isDead = soldier.state === 'DEAD' || soldier.hp <= 0;
    const curHp = Math.max(0, Math.ceil(soldier.hp));
    const maxHp = soldier.maxHp || 100;
    const pct = isDead ? 0 : Math.min(100, Math.max(0, Math.round((curHp / maxHp) * 100)));
    const hpBarClass = pct > 50 ? 'hp-high' : pct > 25 ? 'hp-med' : 'hp-low';

    const hpValEl = document.getElementById('modal-live-hp-val');
    if (hpValEl) {
      hpValEl.innerHTML = `${curHp}/${maxHp} ${UI_ICONS.HEART}`;
    }

    const hpFillEl = document.getElementById('modal-live-hp-fill');
    if (hpFillEl) {
      hpFillEl.style.width = `${pct}%`;
      hpFillEl.className = `suc-hp-fill ${hpBarClass}`;
    }

    const stateEl = document.getElementById('modal-live-state-tag');
    if (stateEl) {
      let stateLabel = '';
      let stateClass = '';
      if (isDead) {
        stateLabel = `⏳ Đang hồi sinh (${soldier.respawnTimer.toFixed(1)}s)`;
        stateClass = 'state-dead';
      } else if (soldier.state === 'ATTACKING') {
        stateLabel = `${UI_ICONS.SWORDS} Đang giao chiến`;
        stateClass = 'state-fighting';
      } else if (soldier.state === 'MOVING_TO_ENGAGE' || soldier.state === 'MOVING_TO_RALLY') {
        stateLabel = `${UI_ICONS.WALK} Đang di chuyển`;
        stateClass = 'state-moving';
      } else {
        stateLabel = `${UI_ICONS.SHIELD} Chốt chặn canh gác`;
        stateClass = 'state-guarding';
      }

      if (stateEl.innerHTML !== stateLabel) {
        stateEl.innerHTML = stateLabel;
      }
      stateEl.className = `suc-state-tag ${stateClass}`;
    }
  }
}
