import { ENEMY_BLUEPRINTS, EnemyBlueprint } from '../../config/enemies.config.js';
import {
  ELEMENT_COLORS,
  ELEMENT_ICONS,
  ELEMENT_NAMES,
  ALL_ELEMENT_DEFINITIONS
} from '../../config/elements.config.js';
import { ElementType } from '../../types/elements.types.js';
import { StickmanRenderer } from '../../render/StickmanRenderer.js';
import { EnemyArchetypeRenderer } from '../../render/EnemyArchetypeRenderer.js';
import { TargetingRuleEngine } from '../../systems/TargetingRuleEngine.js';
import { ALL_15_ELEMENTS } from './CodexTypes.js';

export class CodexEnemies {
  public enemySearchQuery: string = '';
  public enemyElementFilter: string = 'ALL';
  public enemyMovementFilter: string = 'ALL';
  public enemyTagFilter: string = 'ALL';
  public selectedEnemyTypeId: string = 'STICK_RUNNER';

  private enemyAnimFrameId: number | null = null;
  private enemyAnimStartTime: number = 0;

  constructor(private isPanelOpen: () => boolean, private getCurrentCategory: () => string) {}

  public renderEnemiesCategory(
    contentEl: HTMLElement,
    titleEl: HTMLElement,
    iconEl: HTMLElement,
    badgeEl: HTMLElement
  ): void {
    titleEl.textContent = 'Bách Khoa Quái Vật & Ma Trận Sát Thương';
    iconEl.textContent = '👾';
    badgeEl.textContent = 'Tìm Kiếm Đa Chiều • Canvas Mô Phỏng • Bảng Nhận Sát Thương 15 Hệ';

    const allEnemies = Object.values(ENEMY_BLUEPRINTS);

    // Filter enemies
    const filteredEnemies = allEnemies.filter((bp) => {
      // 1. Search Query
      if (this.enemySearchQuery.trim()) {
        const q = this.enemySearchQuery.trim().toLowerCase();
        const matchName = bp.name.toLowerCase().includes(q);
        const matchType = bp.typeId.toLowerCase().includes(q);
        const matchDesc = bp.description.toLowerCase().includes(q);
        if (!matchName && !matchType && !matchDesc) return false;
      }

      // 2. Element Filter
      if (this.enemyElementFilter !== 'ALL') {
        const pMatch = bp.elementalProfile.primaryElement === this.enemyElementFilter;
        const sMatch = bp.elementalProfile.secondaryElement === this.enemyElementFilter;
        if (!pMatch && !sMatch) return false;
      }

      // 3. Movement Filter
      if (this.enemyMovementFilter !== 'ALL') {
        if (bp.movementType !== this.enemyMovementFilter) return false;
      }

      // 4. Tag Filter
      if (this.enemyTagFilter !== 'ALL') {
        if (this.enemyTagFilter === 'DEATH_SPAWN') {
          if (!bp.abilities?.some((a) => a.type === 'DEATH_SPAWN')) return false;
        } else if (this.enemyTagFilter === 'SUMMONER') {
          if (!bp.abilities?.some((a) => a.type === 'SUMMON') && !bp.tags.includes('SUMMONER')) return false;
        } else if (this.enemyTagFilter === 'DUAL_ELEMENT') {
          if (!bp.elementalProfile.secondaryElement) return false;
        } else if (this.enemyTagFilter === 'DISABLE_TOWER') {
          if (!bp.abilities?.some((a) => a.type === 'DISABLE_TOWER')) return false;
        } else if (this.enemyTagFilter === 'DOWNGRADE_TOWER') {
          if (!bp.abilities?.some((a) => a.type === 'DOWNGRADE_TOWER')) return false;
        } else if (this.enemyTagFilter === 'SHIELD') {
          if (!bp.abilities?.some((a) => a.type.includes('SHIELD'))) return false;
        } else if (this.enemyTagFilter === 'HEAL') {
          if (!bp.abilities?.some((a) => a.type === 'HEAL_AURA')) return false;
        } else {
          if (!bp.tags.includes(this.enemyTagFilter)) return false;
        }
      }

      return true;
    });

    // Ensure selectedEnemyTypeId is valid
    if (!filteredEnemies.some((e) => e.typeId === this.selectedEnemyTypeId) && filteredEnemies.length > 0) {
      this.selectedEnemyTypeId = filteredEnemies[0].typeId;
    }

    const selectedBp = ENEMY_BLUEPRINTS[this.selectedEnemyTypeId] || filteredEnemies[0] || allEnemies[0];

    // Build sidebar monster list HTML
    const listHtml = filteredEnemies
      .map((bp) => {
        const pElem = bp.elementalProfile.primaryElement;
        const sElem = bp.elementalProfile.secondaryElement;
        const pColor = ELEMENT_COLORS[pElem] || '#94a3b8';
        const pIcon = ELEMENT_ICONS[pElem] || '⚔️';
        const sIcon = sElem ? ELEMENT_ICONS[sElem] : '';
        const moveIcon = bp.movementType === 'FLY' ? '✈️' : bp.movementType === 'SWIM' ? '🏊' : '🚶';
        const archInfo = EnemyArchetypeRenderer.getArchetypeInfo({ typeId: bp.typeId });
        const isCurrent = bp.typeId === selectedBp.typeId;

        let badges = '';
        if (bp.tags.includes('BOSS')) {
          badges += `<span style="font-size: 10px; background: rgba(239, 68, 68, 0.25); color: #f87171; padding: 1px 4px; border-radius: 3px;">👑</span>`;
        } else if (bp.tags.includes('ELITE')) {
          badges += `<span style="font-size: 10px; background: rgba(245, 158, 11, 0.25); color: #fbbf24; padding: 1px 4px; border-radius: 3px;">⭐</span>`;
        }
        if (bp.abilities?.some((a) => a.type === 'DEATH_SPAWN')) {
          badges += `<span style="font-size: 10px; background: rgba(249, 115, 22, 0.25); color: #f97316; padding: 1px 4px; border-radius: 3px;">💥</span>`;
        }
        if (bp.abilities?.some((a) => a.type === 'SUMMON')) {
          badges += `<span style="font-size: 10px; background: rgba(168, 85, 247, 0.25); color: #c084fc; padding: 1px 4px; border-radius: 3px;">🔮</span>`;
        }
        if (bp.abilities?.some((a) => a.type === 'DOWNGRADE_TOWER')) {
          badges += `<span style="font-size: 10px; background: rgba(220, 38, 38, 0.25); color: #f87171; padding: 1px 4px; border-radius: 3px;">⬇️</span>`;
        }
        if (bp.abilities?.some((a) => a.type === 'DISABLE_TOWER')) {
          badges += `<span style="font-size: 10px; background: rgba(234, 179, 8, 0.25); color: #facc15; padding: 1px 4px; border-radius: 3px;">⚡</span>`;
        }
        if (bp.abilities?.some((a) => a.type.includes('SHIELD'))) {
          badges += `<span style="font-size: 10px; background: rgba(203, 213, 225, 0.25); color: #cbd5e1; padding: 1px 4px; border-radius: 3px;">🛡️</span>`;
        }
        if (bp.abilities?.some((a) => a.type === 'HEAL_AURA')) {
          badges += `<span style="font-size: 10px; background: rgba(34, 197, 94, 0.25); color: #4ade80; padding: 1px 4px; border-radius: 3px;">💚</span>`;
        }

        return `
          <div class="codex-monster-item ${isCurrent ? 'active' : ''}" data-monster-type="${bp.typeId}" style="border-left-color: ${pColor};">
            <div class="cmi-info">
              <div class="cmi-name">
                <span>${pIcon}${sIcon} ${bp.name}</span>
              </div>
              <div class="cmi-sub">
                <span>${archInfo.icon} ${moveIcon} ${bp.speed} px/s</span>
                <span style="color: #ef4444;">${bp.hp} ❤️</span>
                <span style="color: #facc15;">+${bp.rewardGold}🪙</span>
              </div>
            </div>
            <div class="cmi-badges">${badges}</div>
          </div>
        `;
      })
      .join('');

    const rightContentHtml = this.getEnemyDetailHtml(selectedBp);

    contentEl.innerHTML = `
      <div class="codex-master-layout">
        <aside class="codex-sidebar-nav">
          <div class="codex-sidebar-title">
            <span>TÌM KIẾM & BỘ LỌC</span>
          </div>

          <div class="codex-search-box">
            <input type="text" id="codex-enemy-search" class="codex-search-input" placeholder="🔍 Nhập tên hoặc đặc tính quái..." value="${this.enemySearchQuery}" />
            <div class="codex-filter-grid">
              <select id="codex-filter-element" class="codex-filter-select">
                <option value="ALL" ${this.enemyElementFilter === 'ALL' ? 'selected' : ''}>✨ Mọi Hệ</option>
                ${ALL_15_ELEMENTS.map((el) => `<option value="${el}" ${this.enemyElementFilter === el ? 'selected' : ''}>${ELEMENT_ICONS[el]} ${ELEMENT_NAMES[el]}</option>`).join('')}
              </select>
              <select id="codex-filter-movement" class="codex-filter-select">
                <option value="ALL" ${this.enemyMovementFilter === 'ALL' ? 'selected' : ''}>🚶 Mọi Di Chuyển</option>
                <option value="WALK" ${this.enemyMovementFilter === 'WALK' ? 'selected' : ''}>🚶 Đường Bộ</option>
                <option value="FLY" ${this.enemyMovementFilter === 'FLY' ? 'selected' : ''}>✈️ Trên Không</option>
                <option value="SWIM" ${this.enemyMovementFilter === 'SWIM' ? 'selected' : ''}>🏊 Kênh Sông</option>
              </select>
            </div>
            <div class="codex-filter-grid">
              <select id="codex-filter-tag" class="codex-filter-select" style="grid-column: span 2;">
                <option value="ALL" ${this.enemyTagFilter === 'ALL' ? 'selected' : ''}>🏷️ Mọi Phân Loại</option>
                <option value="BOSS" ${this.enemyTagFilter === 'BOSS' ? 'selected' : ''}>👑 Trùm (Boss)</option>
                <option value="ELITE" ${this.enemyTagFilter === 'ELITE' ? 'selected' : ''}>⭐ Tinh Anh (Elite)</option>
                <option value="SWARM" ${this.enemyTagFilter === 'SWARM' ? 'selected' : ''}>👥 Bầy Đàn (Swarm)</option>
                <option value="DEATH_SPAWN" ${this.enemyTagFilter === 'DEATH_SPAWN' ? 'selected' : ''}>💥 Phân Tách Khi Chết</option>
                <option value="SUMMONER" ${this.enemyTagFilter === 'SUMMONER' ? 'selected' : ''}>🔮 Kỹ Năng Triệu Hồi</option>
                <option value="DISABLE_TOWER" ${this.enemyTagFilter === 'DISABLE_TOWER' ? 'selected' : ''}>⚡ Vô Hiệu Hóa Tháp</option>
                <option value="DOWNGRADE_TOWER" ${this.enemyTagFilter === 'DOWNGRADE_TOWER' ? 'selected' : ''}>⬇️ Làm Tháp Rơi Cấp</option>
                <option value="SHIELD" ${this.enemyTagFilter === 'SHIELD' ? 'selected' : ''}>🛡️ Giáp Ảo / Khiên Phép</option>
                <option value="HEAL" ${this.enemyTagFilter === 'HEAL' ? 'selected' : ''}>💚 Hồi Máu Đồng Minh</option>
                <option value="DUAL_ELEMENT" ${this.enemyTagFilter === 'DUAL_ELEMENT' ? 'selected' : ''}>✨ Mang 2 Thuộc Tính</option>
              </select>
            </div>
          </div>

          <div class="codex-count-badge">
            <span>DANH SÁCH QUÁI VẬT</span>
            <span style="font-weight: 700; color: #38bdf8;">${filteredEnemies.length} / ${allEnemies.length}</span>
          </div>

          <div class="codex-monster-list" id="codex-monster-list">
            ${listHtml || '<div style="color: #64748b; padding: 20px 8px; text-align: center;">Không tìm thấy quái vật nào phù hợp.</div>'}
          </div>
        </aside>

        <main class="codex-detail-pane" id="codex-enemy-detail">
          ${rightContentHtml}
        </main>
      </div>
    `;

    // Start stickman animation loop
    this.startEnemyAnimation(selectedBp);

    // Bind Search Input
    const searchInput = document.getElementById('codex-enemy-search') as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.enemySearchQuery = (e.target as HTMLInputElement).value;
        this.renderEnemiesCategory(contentEl, titleEl, iconEl, badgeEl);
      });
    }

    // Bind Element Filter
    const elemSelect = document.getElementById('codex-filter-element') as HTMLSelectElement;
    if (elemSelect) {
      elemSelect.addEventListener('change', (e) => {
        this.enemyElementFilter = (e.target as HTMLSelectElement).value;
        this.renderEnemiesCategory(contentEl, titleEl, iconEl, badgeEl);
      });
    }

    // Bind Movement Filter
    const moveSelect = document.getElementById('codex-filter-movement') as HTMLSelectElement;
    if (moveSelect) {
      moveSelect.addEventListener('change', (e) => {
        this.enemyMovementFilter = (e.target as HTMLSelectElement).value;
        this.renderEnemiesCategory(contentEl, titleEl, iconEl, badgeEl);
      });
    }

    // Bind Tag Filter
    const tagSelect = document.getElementById('codex-filter-tag') as HTMLSelectElement;
    if (tagSelect) {
      tagSelect.addEventListener('change', (e) => {
        this.enemyTagFilter = (e.target as HTMLSelectElement).value;
        this.renderEnemiesCategory(contentEl, titleEl, iconEl, badgeEl);
      });
    }

    // Bind Monster List items click
    contentEl.querySelectorAll('[data-monster-type]').forEach((item) => {
      item.addEventListener('click', (e) => {
        const typeId = (e.currentTarget as HTMLElement).getAttribute('data-monster-type');
        if (typeId && typeId !== this.selectedEnemyTypeId) {
          this.selectedEnemyTypeId = typeId;
          const targetBp = ENEMY_BLUEPRINTS[typeId];
          if (targetBp) {
            // Update active state in list
            contentEl.querySelectorAll('.codex-monster-item').forEach((el) => el.classList.remove('active'));
            (e.currentTarget as HTMLElement).classList.add('active');

            // Update detail pane
            const detailPane = document.getElementById('codex-enemy-detail');
            if (detailPane) {
              detailPane.innerHTML = this.getEnemyDetailHtml(targetBp);
            }

            // Restart animation
            this.startEnemyAnimation(targetBp);
          }
        }
      });
    });
  }

  public getEnemyDetailHtml(bp: EnemyBlueprint): string {
    const pElem = bp.elementalProfile.primaryElement;
    const sElem = bp.elementalProfile.secondaryElement;
    const pColor = ELEMENT_COLORS[pElem] || '#94a3b8';
    const pIcon = ELEMENT_ICONS[pElem] || '⚔️';
    const sIcon = sElem ? ELEMENT_ICONS[sElem] : '';
    const sName = sElem ? ` + ${ELEMENT_NAMES[sElem]}` : '';

    const moveText = bp.movementType === 'FLY' ? '✈️ Đường Bay (Air)' : bp.movementType === 'SWIM' ? '🏊 Kênh Sông (Water)' : '🚶 Đường Bộ (Ground)';
    const archInfo = EnemyArchetypeRenderer.getArchetypeInfo({ typeId: bp.typeId });

    // Badges
    let abilityBadges = '';
    abilityBadges += `<span style="background: rgba(147, 51, 234, 0.2); color: #d8b4fe; border: 1px solid rgba(147, 51, 234, 0.4); border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 700;" title="${archInfo.description}">${archInfo.icon} ${archInfo.name}</span>`;
    if (bp.tags.includes('BOSS')) {
      abilityBadges += `<span style="background: rgba(239, 68, 68, 0.25); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.5); border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 800;">👑 TRÙM CUỐI (BOSS)</span>`;
    } else if (bp.tags.includes('ELITE')) {
      abilityBadges += `<span style="background: rgba(245, 158, 11, 0.25); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.5); border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 800;">⭐ TINH ANH (ELITE)</span>`;
    }
    if (sElem) {
      abilityBadges += `<span style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 700;">✨ Song Thuộc Tính</span>`;
    }

    if (bp.abilities) {
      for (const ab of bp.abilities) {
        if (ab.type === 'DEATH_SPAWN') {
          abilityBadges += `<span style="background: rgba(249, 115, 22, 0.2); color: #f97316; border: 1px solid rgba(249, 115, 22, 0.4); border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 700;">💥 Phân tách x${ab.count || 1}</span>`;
        } else if (ab.type === 'SUMMON') {
          abilityBadges += `<span style="background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 700;">🔮 Triệu hồi mỗi ${ab.interval || 6}s</span>`;
        } else if (ab.type === 'DOWNGRADE_TOWER') {
          abilityBadges += `<span style="background: rgba(220, 38, 38, 0.2); color: #f87171; border: 1px solid rgba(220, 38, 38, 0.4); border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 700;">⬇️ Hạ Cấp Tháp</span>`;
        } else if (ab.type === 'DISABLE_TOWER') {
          abilityBadges += `<span style="background: rgba(234, 179, 8, 0.2); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.4); border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 700;">⚡ Vô Hiệu Tháp</span>`;
        } else if (ab.type === 'ARMOR_SHIELD_AURA') {
          abilityBadges += `<span style="background: rgba(203, 213, 225, 0.2); color: #cbd5e1; border: 1px solid rgba(203, 213, 225, 0.4); border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 700;">🛡️ Giáp Ảo +${ab.value}</span>`;
        } else if (ab.type === 'MAGIC_SHIELD_AURA') {
          abilityBadges += `<span style="background: rgba(192, 132, 252, 0.2); color: #c084fc; border: 1px solid rgba(192, 132, 252, 0.4); border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 700;">🔮 Khiên Phép +${ab.value}</span>`;
        } else if (ab.type === 'HEAL_AURA') {
          abilityBadges += `<span style="background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 700;">💚 Hồi Máu +${ab.value}</span>`;
        } else if (ab.type === 'DAMAGE_REDUCTION_AURA') {
          abilityBadges += `<span style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 700;">🔰 Giảm -${Math.round((ab.value || 0) * 100)}% Dmg</span>`;
        }
      }
    }

    // Matchup summary calculation
    const summary = this.getEnemyMatchupSummary(bp);

    const weaknessesBadges = summary.weaknesses.length > 0
      ? summary.weaknesses.map((w) => {
          const ic = ELEMENT_ICONS[w.element];
          const nm = ELEMENT_NAMES[w.element].split(' ')[0];
          const isSuper = w.multiplier >= 1.6;
          return `<span class="cm-tag ${isSuper ? 'super-weak' : 'weak'}">${ic} ${nm} (${w.percentage}%)</span>`;
        }).join('')
      : '<span style="color: #64748b; font-size: 12px;">Không có điểm yếu rõ rệt</span>';

    const resistancesBadges = summary.resistances.length > 0
      ? summary.resistances.map((r) => {
          const ic = ELEMENT_ICONS[r.element];
          const nm = ELEMENT_NAMES[r.element].split(' ')[0];
          return `<span class="cm-tag resist">${ic} ${nm} (${r.percentage}%)</span>`;
        }).join('')
      : '<span style="color: #64748b; font-size: 12px;">Không kháng hệ nào</span>';

    const immunitiesBadges = summary.immunities.length > 0
      ? summary.immunities.map((im) => {
          const ic = ELEMENT_ICONS[im];
          const nm = ELEMENT_NAMES[im].split(' ')[0];
          return `<span class="cm-tag immune">${ic} ${nm} (0%)</span>`;
        }).join('')
      : '<span style="color: #64748b; font-size: 12px;">Không có miễn nhiễm</span>';

    // Full 15-Element Intake Grid HTML
    const intakeGridCards = ALL_15_ELEMENTS.map((elem) => {
      const intake = this.calculateDamageIntake(bp, elem);
      const icon = ELEMENT_ICONS[elem];
      const color = ELEMENT_COLORS[elem];
      const name = ELEMENT_NAMES[elem];

      const barWidth = Math.min(100, Math.round((intake.multiplier / 2.0) * 100));
      let barColor = '#94a3b8';
      if (intake.category === 'IMMUNE') barColor = '#64748b';
      else if (intake.category === 'RESIST') barColor = '#38bdf8';
      else if (intake.category === 'WEAK') barColor = '#fbbf24';
      else if (intake.category === 'SUPER_WEAK') barColor = '#ef4444';

      return `
        <div class="damage-intake-card" style="border-left: 3px solid ${color};">
          <div class="dic-top">
            <span class="dic-elem" style="color: ${color};">
              <span>${icon}</span>
              <span>${name}</span>
            </span>
            <span class="dic-pct" style="color: ${barColor};">${intake.percentage}%</span>
          </div>
          <div class="dic-bar-bg">
            <div class="dic-bar-fill" style="width: ${barWidth}%; background: ${barColor};"></div>
          </div>
          <span class="dic-badge ${intake.badgeClass}">${intake.label}</span>
        </div>
      `;
    }).join('');

    return `
      <!-- 1. Hero Card: Canvas + Base Info -->
      <div class="codex-monster-hero">
        <div class="codex-monster-canvas-box">
          <canvas id="codex-enemy-canvas" width="240" height="200"></canvas>
          <span class="codex-monster-canvas-hint">Mô phỏng đồ họa chiến đấu thực tế</span>
          <div style="margin-top: 4px; display: inline-flex; align-items: center; gap: 5px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 4px; padding: 2px 8px; font-size: 11px; color: #7dd3fc; font-weight: 700;" title="${archInfo.description}">
            ${archInfo.icon} ${archInfo.name}
          </div>
        </div>

        <div style="display: flex; flex-direction: column; justify-content: space-between; gap: 8px;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
              <div>
                <h2 style="font-size: 22px; font-weight: 800; color: #f8fafc; margin: 0 0 4px 0;">
                  ${pIcon}${sIcon} ${bp.name}
                </h2>
                <span style="font-size: 11px; font-family: monospace; color: #64748b;">TYPE_ID: ${bp.typeId}</span>
              </div>
              <span style="color: #facc15; font-size: 17px; font-weight: 800; background: rgba(250, 204, 21, 0.15); padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(250, 204, 21, 0.3);">
                🪙 +${bp.rewardGold} Vàng
              </span>
            </div>

            <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px;">
              <span style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 4px; padding: 2px 8px; font-size: 11.5px; font-weight: 700; color: ${pColor};">
                ${pIcon} Hệ ${ELEMENT_NAMES[pElem]}${sName}
              </span>
              <span style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 4px; padding: 2px 8px; font-size: 11.5px; font-weight: 700; color: #cbd5e1;">
                ${moveText}
              </span>
              ${abilityBadges}
            </div>

            <p style="font-size: 13.5px; color: #cbd5e1; line-height: 1.5; margin: 0;">${bp.description}</p>
          </div>

          <!-- Combat Stats Grid -->
          <div class="codex-stats-grid">
            <div class="codex-stat-item">
              <span class="csi-lbl">Máu Tối Đa</span>
              <span class="csi-val" style="color: #ef4444;">${bp.hp} ❤️</span>
            </div>
            <div class="codex-stat-item">
              <span class="csi-lbl">Sát Thương</span>
              <span class="csi-val" style="color: #f97316;">${bp.damage} ⚔️</span>
            </div>
            <div class="codex-stat-item">
              <span class="csi-lbl">Tốc Độ Chạy</span>
              <span class="csi-val" style="color: #38bdf8;">${bp.speed} px/s</span>
            </div>
            <div class="codex-stat-item">
              <span class="csi-lbl">Tốc Độ Đánh</span>
              <span class="csi-val">${bp.attackSpeed}/s</span>
            </div>
            <div class="codex-stat-item">
              <span class="csi-lbl">Độ Cao / Vị Trí</span>
              <span class="csi-val">${bp.altitude > 0 ? `${bp.altitude}px (Bay)` : 'Mặt đất'}</span>
            </div>
            <div class="codex-stat-item">
              <span class="csi-lbl">Tìm Đường</span>
              <span class="csi-val" style="font-size: 12px; color: #a855f7;">${bp.navigationMode}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Special Traits Breakdown (if any) -->
      ${
        sElem || bp.tags.includes('BOSS') || bp.tags.includes('ELITE') || (bp.abilities && bp.abilities.length > 0)
          ? `
          <div class="sp-section sp-card" style="border-left: 4px solid #a855f7; background: #0c1424;">
            <h4 class="sp-sec-title" style="color: #c084fc; margin-bottom: 8px;">🔮 ĐẶC TÍNH CHIẾN ĐẤU & KỸ NĂNG ĐẶC BIỆT</h4>
            <div style="display: flex; flex-direction: column; gap: 8px; font-size: 13.5px; color: #cbd5e1;">
              ${
                bp.tags.includes('BOSS')
                  ? `<div>👑 <b>Kháng Khống Chế Trùm (Boss):</b> Miễn nhiễm 100% Khống chế cứng (Đóng băng, Choáng, Đẩy lùi). Khống chế mềm (Làm chậm) chỉ nhận 50% hiệu quả & 50% thời gian!</div>`
                  : bp.tags.includes('ELITE')
                  ? `<div>⭐ <b>Kháng Khống Chế Tinh Anh (Elite):</b> Khống chế cứng (Đóng băng, Choáng, Trói, Đẩy lùi) chỉ nhận 50% hiệu quả & 50% thời gian duy trì!</div>`
                  : ''
              }
              ${
                bp.abilities
                  ? bp.abilities
                      .map((ab) => {
                        if (ab.type === 'DEATH_SPAWN') {
                          return `<div>💥 <b>Kỹ Năng Phân Tách:</b> Khi bị hạ gục, lập tức phân tách thành <b>x${ab.count || 1} ${ENEMY_BLUEPRINTS[ab.spawnTypeId || '']?.name || ab.spawnTypeId}</b> tiếp tục hành trình xâm lăng!</div>`;
                        } else if (ab.type === 'SUMMON') {
                          return `<div>🔮 <b>Kỹ Năng Triệu Hồi:</b> Cứ mỗi <b>${ab.interval || 6} giây</b> trên đường đi, tự động triệu tập <b>x${ab.count || 1} ${ENEMY_BLUEPRINTS[ab.spawnTypeId || '']?.name || ab.spawnTypeId}</b> bảo vệ xung quanh!</div>`;
                        } else if (ab.type === 'DISABLE_TOWER') {
                          return `<div>⚡ <b>Vô Hiệu Hóa Tháp:</b> Mỗi <b>${ab.interval}s</b>, phóng xung điện từ làm tê liệt <b>${ab.maxTargets || 1} tháp</b> trong bán kính <b>${ab.radius}px</b> suốt <b>${ab.duration}s</b>!</div>`;
                        } else if (ab.type === 'DOWNGRADE_TOWER') {
                          return `<div>⬇️ <b>Hạ Cấp / Phá Hủy Tháp:</b> Mỗi <b>${ab.interval}s</b>, bắn tia tà thuật vào tháp trong bán kính <b>${ab.radius}px</b> làm <b>tháp tụt 1 cấp độ</b> (nếu tháp ở Cấp 1 sẽ <b>bị phá hủy hoàn toàn</b>)!</div>`;
                        } else if (ab.type === 'ARMOR_SHIELD_AURA') {
                          return `<div>🛡️ <b>Giáp Ảo Toàn Quân:</b> Mỗi <b>${ab.interval}s</b>, buff thêm <b>${ab.value} Giáp Ảo</b> (chặn sát thương Vật Lý) cho bản thân và toàn bộ quái trong bán kính <b>${ab.radius}px</b>!</div>`;
                        } else if (ab.type === 'MAGIC_SHIELD_AURA') {
                          return `<div>🔮 <b>Khiên Phép Thanh Tẩy:</b> Mỗi <b>${ab.interval}s</b>, ban <b>${ab.value} Khiên Phép</b> (chặn sát thương Nguyên Tố Phép) cho bản thân và đồng minh trong bán kính <b>${ab.radius}px</b>!</div>`;
                        } else if (ab.type === 'HEAL_AURA') {
                          return `<div>💚 <b>Trận Địa Trị Liệu:</b> Mỗi <b>${ab.interval}s</b>, hồi phục <b>+${ab.value} Máu</b> cho bản thân và tất cả quái xung quanh trong bán kính <b>${ab.radius}px</b>!</div>`;
                        } else if (ab.type === 'DAMAGE_REDUCTION_AURA') {
                          return `<div>🔰 <b>Hào Quang Kiên Cố:</b> Mỗi <b>${ab.interval}s</b>, ban hiệu ứng giảm <b>${Math.round((ab.value || 0) * 100)}% sát thương nhận vào</b> suốt <b>${ab.duration}s</b> cho quái xung quanh trong bán kính <b>${ab.radius}px</b>!</div>`;
                        }
                        return '';
                      })
                      .join('')
                  : ''
              }
              ${
                sElem
                  ? `<div>✨ <b>Song Thuộc Tính:</b> Mang kết hợp 2 hệ <b>${ELEMENT_NAMES[pElem]}</b> và <b>${ELEMENT_NAMES[sElem]}</b>, ma trận sát thương nhận vào sẽ tính trung bình cộng giữa 2 hệ!</div>`
                  : ''
              }
            </div>
          </div>
        `
          : ''
      }

      <!-- 3. Elemental Matchup Quick Summary -->
      <div class="sp-section sp-card">
        <h4 class="sp-sec-title" style="color: #38bdf8;">⚖️ TỔNG QUAN TƯƠNG QUAN NGUYÊN TỐ</h4>
        <div class="codex-matchup-summary">
          <div class="codex-matchup-col">
            <span class="cmc-title" style="color: #f87171;">💥 Khắc Hệ (Điểm Yếu >100%)</span>
            <div class="cmc-tags">${weaknessesBadges}</div>
          </div>
          <div class="codex-matchup-col">
            <span class="cmc-title" style="color: #38bdf8;">🛡️ Yếu Thế (Kháng Cự &lt;100%)</span>
            <div class="cmc-tags">${resistancesBadges}</div>
          </div>
          <div class="codex-matchup-col">
            <span class="cmc-title" style="color: #cbd5e1;">🚫 Miễn Nhiễm (0% Sát Thương)</span>
            <div class="cmc-tags">${immunitiesBadges}</div>
          </div>
        </div>
      </div>

      <!-- 4. Full 15-Element Damage Intake Grid -->
      <div class="sp-section sp-card">
        <div class="sp-sec-header">
          <h4 class="sp-sec-title" style="color: #facc15;">📊 BẢNG TỈ LỆ SÁT THƯƠNG NHẬN VÀO TỪ MỖI HỆ NGUYÊN TỐ (15 HỆ)</h4>
          <span class="sp-hint">Tính theo công thức thực chiến của TargetingRuleEngine</span>
        </div>
        <p class="sp-desc" style="font-size: 13px; margin-bottom: 6px;">
          Bảng bên dưới thể hiện chính xác <b>tỉ lệ phần trăm sát thương (%)</b> mà quái <b>${bp.name}</b> sẽ phải nhận khi bị tấn công bởi từng hệ nguyên tố tương ứng:
        </p>
        <div class="damage-intake-grid">${intakeGridCards}</div>
      </div>
    `;
  }

  public calculateDamageIntake(
    bp: EnemyBlueprint,
    attackerElement: ElementType
  ): {
    multiplier: number;
    percentage: number;
    category: 'IMMUNE' | 'RESIST' | 'NORMAL' | 'WEAK' | 'SUPER_WEAK';
    label: string;
    badgeClass: string;
  } {
    const profile = bp.elementalProfile;

    // 1. Calculate elemental matchup automatically from matrix (Primary x Secondary)
    let multiplier = TargetingRuleEngine.calculateElementalMatchup(attackerElement, profile);

    // If completely immune
    if (multiplier === 0) {
      return {
        multiplier: 0,
        percentage: 0,
        category: 'IMMUNE',
        label: 'MIỄN NHIỄM (0%)',
        badgeClass: 'badge-immune'
      };
    }

    // 2. Movement and Tag bonuses from Element combatStats
    const elemStats = ALL_ELEMENT_DEFINITIONS[attackerElement]?.combatStats;
    if (attackerElement === 'WIND' && bp.movementType === 'FLY') {
      multiplier *= elemStats?.vsFlyMultiplier ?? 1.0;
    }
    if (attackerElement === 'EARTH' && bp.movementType === 'WALK') {
      multiplier *= elemStats?.vsWalkMultiplier ?? 1.2;
    }
    if (attackerElement === 'DRAGON' && (bp.tags.includes('BOSS') || bp.tags.includes('ELITE'))) {
      multiplier *= elemStats?.vsBossEliteMultiplier ?? 1.35;
    }

    multiplier = Math.round(multiplier * 100) / 100;
    const percentage = Math.round(multiplier * 100);

    if (multiplier <= 0.01) {
      return {
        multiplier: 0,
        percentage: 0,
        category: 'IMMUNE',
        label: 'MIỄN NHIỄM (0%)',
        badgeClass: 'badge-immune'
      };
    } else if (multiplier <= 0.8) {
      return {
        multiplier,
        percentage,
        category: 'RESIST',
        label: `KHÁNG (${percentage}%)`,
        badgeClass: 'badge-resist'
      };
    } else if (multiplier < 1.2) {
      return {
        multiplier,
        percentage,
        category: 'NORMAL',
        label: `CHUẨN (100%)`,
        badgeClass: 'badge-normal'
      };
    } else if (multiplier < 1.6) {
      return {
        multiplier,
        percentage,
        category: 'WEAK',
        label: `KHẮC HỆ (${percentage}%)`,
        badgeClass: 'badge-weak'
      };
    } else {
      return {
        multiplier,
        percentage,
        category: 'SUPER_WEAK',
        label: `CHÍ MẠNG (${percentage}%)`,
        badgeClass: 'badge-super-weak'
      };
    }
  }

  public getEnemyMatchupSummary(bp: EnemyBlueprint): {
    weaknesses: { element: ElementType; percentage: number; multiplier: number }[];
    resistances: { element: ElementType; percentage: number; multiplier: number }[];
    immunities: ElementType[];
  } {
    const weaknesses: { element: ElementType; percentage: number; multiplier: number }[] = [];
    const resistances: { element: ElementType; percentage: number; multiplier: number }[] = [];
    const immunities: ElementType[] = [];

    for (const elem of ALL_15_ELEMENTS) {
      const intake = this.calculateDamageIntake(bp, elem);
      if (intake.category === 'IMMUNE') {
        immunities.push(elem);
      } else if (intake.category === 'WEAK' || intake.category === 'SUPER_WEAK') {
        weaknesses.push({ element: elem, percentage: intake.percentage, multiplier: intake.multiplier });
      } else if (intake.category === 'RESIST') {
        resistances.push({ element: elem, percentage: intake.percentage, multiplier: intake.multiplier });
      }
    }

    weaknesses.sort((a, b) => b.multiplier - a.multiplier);
    resistances.sort((a, b) => a.multiplier - b.multiplier);

    return { weaknesses, resistances, immunities };
  }

  public startEnemyAnimation(bp: EnemyBlueprint): void {
    this.stopEnemyAnimation();

    const canvas = document.getElementById('codex-enemy-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.enemyAnimStartTime = performance.now();

    const loop = (timestamp: number) => {
      if (!this.isPanelOpen() || this.getCurrentCategory() !== 'ENEMIES') {
        this.stopEnemyAnimation();
        return;
      }

      const animTime = (timestamp - this.enemyAnimStartTime) / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const isBoss = bp.tags.includes('BOSS');
      const isFlying = bp.movementType === 'FLY';
      const isSwimmer = bp.movementType === 'SWIM';

      // For bosses or large creatures, adjust center so health bar & wings don't get cut off at top
      const cy = isBoss ? canvas.height * 0.76 : canvas.height * 0.72;
      const elemColor = ELEMENT_COLORS[bp.elementalProfile.primaryElement] || '#60a5fa';

      // Subtle ambient glow
      const glowGrad = ctx.createRadialGradient(cx, cy - 20, 10, cx, cy - 20, 90);
      glowGrad.addColorStop(0, `${elemColor}30`);
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Floor reference line
      ctx.strokeStyle = isSwimmer ? 'rgba(56, 189, 248, 0.4)' : 'rgba(71, 85, 105, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - 75, cy + 8);
      ctx.lineTo(cx + 75, cy + 8);
      ctx.stroke();

      const alt = isFlying ? (isBoss ? 26 : 24) : 0;

      // Cycle animation between moving and periodic attack showcase
      const cycle = animTime % 4.0;
      const isPreviewAttacking = cycle > 2.8;

      const mockEnemy: any = {
        id: 'preview',
        typeId: bp.typeId,
        type: bp.typeId,
        name: bp.name,
        x: cx,
        y: cy,
        size: bp.size,
        altitude: alt,
        movementType: bp.movementType,
        navigationMode: bp.navigationMode,
        elementalProfile: bp.elementalProfile,
        tags: bp.tags || [],
        hp: bp.hp,
        maxHp: bp.hp,
        speed: bp.speed,
        baseSpeed: bp.speed,
        damage: bp.damage,
        attackSpeed: bp.attackSpeed,
        attackCooldown: 0,
        rewardGold: bp.rewardGold,
        pathDistance: 0,
        pathTotalLength: 100,
        state: isPreviewAttacking ? 'ATTACKING' : (isFlying ? 'FLYING' : isSwimmer ? 'SWIMMING' : 'WALKING'),
        engagedBySoldierId: null,
        statusEffects: [],
        facing: 0 // Face forward/right
      };

      StickmanRenderer.renderEnemy(ctx, mockEnemy, animTime);

      this.enemyAnimFrameId = requestAnimationFrame(loop);
    };

    this.enemyAnimFrameId = requestAnimationFrame(loop);
  }

  public stopEnemyAnimation(): void {
    if (this.enemyAnimFrameId !== null) {
      cancelAnimationFrame(this.enemyAnimFrameId);
      this.enemyAnimFrameId = null;
    }
  }
}

