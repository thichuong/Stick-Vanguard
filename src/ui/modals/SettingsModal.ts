import { GameState } from '../../core/GameState.js';
import { TargetingRuleEngine } from '../../systems/TargetingRuleEngine.js';

export class SettingsModal {
  private backdropEl: HTMLElement | null;

  constructor(private state: GameState) {
    this.backdropEl = document.getElementById('settings-modal-backdrop');
    this.syncUIFromState();
    this.bindEvents();
  }

  /**
   * Synchronizes all sliders, number inputs, badges, and preset buttons with current GameState.
   */
  public syncUIFromState(): void {
    const wavesRange = document.getElementById('input-waves-range') as HTMLInputElement | null;
    const wavesNum = document.getElementById('input-waves-num') as HTMLInputElement | null;
    const wavesLbl = document.getElementById('lbl-custom-waves');
    const quickWavesLbl = document.getElementById('quick-hud-waves');

    const goldRange = document.getElementById('input-gold-range') as HTMLInputElement | null;
    const goldLbl = document.getElementById('lbl-gold-mult');
    const quickGoldLbl = document.getElementById('quick-hud-gold');

    const dmgRange = document.getElementById('input-damage-range') as HTMLInputElement | null;
    const dmgLbl = document.getElementById('lbl-damage-mult');
    const quickDmgLbl = document.getElementById('quick-hud-dmg');

    const wavesVal = this.state.customTotalWaves;
    if (wavesRange) wavesRange.value = `${wavesVal}`;
    if (wavesNum) wavesNum.value = `${wavesVal}`;
    if (wavesLbl) wavesLbl.textContent = `${wavesVal} đợt`;
    if (quickWavesLbl) quickWavesLbl.textContent = `${wavesVal} đợt`;

    document.querySelectorAll('.preset-btn[data-type="waves"]').forEach((btn) => {
      const v = parseInt(btn.getAttribute('data-val') || '0', 10);
      btn.classList.toggle('active', v === wavesVal);
    });

    const goldVal = this.state.goldMultiplier;
    if (goldRange) goldRange.value = `${goldVal}`;
    const goldTxt = `x${goldVal.toFixed(1)}`;
    if (goldLbl) goldLbl.textContent = goldTxt;
    if (quickGoldLbl) quickGoldLbl.textContent = goldTxt;

    document.querySelectorAll('.preset-btn[data-type="gold"]').forEach((btn) => {
      const v = parseFloat(btn.getAttribute('data-val') || '0');
      btn.classList.toggle('active', Math.abs(v - goldVal) < 0.05);
    });

    const dmgVal = this.state.damageMultiplier;
    if (dmgRange) dmgRange.value = `${dmgVal}`;
    const dmgTxt = `x${dmgVal.toFixed(1)}`;
    if (dmgLbl) dmgLbl.textContent = dmgTxt;
    if (quickDmgLbl) quickDmgLbl.textContent = dmgTxt;

    document.querySelectorAll('.preset-btn[data-type="dmg"]').forEach((btn) => {
      const v = parseFloat(btn.getAttribute('data-val') || '0');
      btn.classList.toggle('active', Math.abs(v - dmgVal) < 0.05);
    });
  }

  private triggerAutoSaveNotice(): void {
    const statusEl = document.getElementById('settings-autosave-status');
    if (statusEl) {
      statusEl.textContent = '✓ Đã tự động lưu';
      statusEl.style.color = '#6ee7b7';
      setTimeout(() => {
        if (statusEl) {
          statusEl.textContent = '💾 Tự động lưu trên máy';
          statusEl.style.color = '#34d399';
        }
      }, 1500);
    }
  }

  private bindEvents(): void {
    const openBtn = document.getElementById('btn-open-settings-modal');
    const closeBtn = document.getElementById('btn-close-settings-modal');
    const confirmBtn = document.getElementById('btn-confirm-settings');
    const resetBtn = document.getElementById('btn-reset-settings');

    const wavesRange = document.getElementById('input-waves-range') as HTMLInputElement | null;
    const wavesNum = document.getElementById('input-waves-num') as HTMLInputElement | null;
    const wavesLbl = document.getElementById('lbl-custom-waves');
    const quickWavesLbl = document.getElementById('quick-hud-waves');

    const goldRange = document.getElementById('input-gold-range') as HTMLInputElement | null;
    const goldLbl = document.getElementById('lbl-gold-mult');
    const quickGoldLbl = document.getElementById('quick-hud-gold');

    const dmgRange = document.getElementById('input-damage-range') as HTMLInputElement | null;
    const dmgLbl = document.getElementById('lbl-damage-mult');
    const quickDmgLbl = document.getElementById('quick-hud-dmg');

    const updateWaves = (val: number) => {
      const clamped = Math.max(1, Math.min(100, Math.round(val)));
      this.state.customTotalWaves = clamped;
      if (wavesRange) wavesRange.value = `${clamped}`;
      if (wavesNum) wavesNum.value = `${clamped}`;
      if (wavesLbl) wavesLbl.textContent = `${clamped} đợt`;
      if (quickWavesLbl) quickWavesLbl.textContent = `${clamped} đợt`;

      // Update preset buttons active state
      document.querySelectorAll('.preset-btn[data-type="waves"]').forEach((btn) => {
        const v = parseInt(btn.getAttribute('data-val') || '0', 10);
        btn.classList.toggle('active', v === clamped);
      });

      // Auto-save immediately to local storage
      this.state.saveSettingsToStorage();
      this.triggerAutoSaveNotice();
    };

    const updateGold = (val: number) => {
      const clamped = Math.max(0.1, Math.min(10, Math.round(val * 10) / 10));
      this.state.goldMultiplier = clamped;
      if (goldRange) goldRange.value = `${clamped}`;
      const txt = `x${clamped.toFixed(1)}`;
      if (goldLbl) goldLbl.textContent = txt;
      if (quickGoldLbl) quickGoldLbl.textContent = txt;

      document.querySelectorAll('.preset-btn[data-type="gold"]').forEach((btn) => {
        const v = parseFloat(btn.getAttribute('data-val') || '0');
        btn.classList.toggle('active', Math.abs(v - clamped) < 0.05);
      });

      // Auto-save immediately to local storage
      this.state.saveSettingsToStorage();
      this.triggerAutoSaveNotice();
    };

    const updateDmg = (val: number) => {
      const clamped = Math.max(0.1, Math.min(10, Math.round(val * 10) / 10));
      this.state.damageMultiplier = clamped;
      TargetingRuleEngine.globalDamageMultiplier = clamped;
      if (dmgRange) dmgRange.value = `${clamped}`;
      const txt = `x${clamped.toFixed(1)}`;
      if (dmgLbl) dmgLbl.textContent = txt;
      if (quickDmgLbl) quickDmgLbl.textContent = txt;

      document.querySelectorAll('.preset-btn[data-type="dmg"]').forEach((btn) => {
        const v = parseFloat(btn.getAttribute('data-val') || '0');
        btn.classList.toggle('active', Math.abs(v - clamped) < 0.05);
      });

      // Auto-save immediately to local storage
      this.state.saveSettingsToStorage();
      this.triggerAutoSaveNotice();
    };

    if (wavesRange) {
      wavesRange.addEventListener('input', () => updateWaves(parseInt(wavesRange.value, 10)));
    }
    if (wavesNum) {
      wavesNum.addEventListener('change', () => updateWaves(parseInt(wavesNum.value, 10) || 15));
    }
    if (goldRange) {
      goldRange.addEventListener('input', () => updateGold(parseFloat(goldRange.value)));
    }
    if (dmgRange) {
      dmgRange.addEventListener('input', () => updateDmg(parseFloat(dmgRange.value)));
    }

    // Preset buttons inside settings modal
    document.querySelectorAll('.preset-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const type = target.getAttribute('data-type');
        const val = parseFloat(target.getAttribute('data-val') || '0');
        if (type === 'waves') updateWaves(val);
        else if (type === 'gold') updateGold(val);
        else if (type === 'dmg') updateDmg(val);
      });
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        updateWaves(15);
        updateGold(1.0);
        updateDmg(1.0);
        this.triggerAutoSaveNotice();
      });
    }

    if (openBtn) {
      openBtn.addEventListener('click', () => this.open());
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => this.close());
    }

    if (this.backdropEl) {
      this.backdropEl.addEventListener('click', (e) => {
        if (e.target === this.backdropEl) {
          this.close();
        }
      });
    }
  }

  public open(): void {
    this.syncUIFromState();
    if (this.backdropEl) {
      this.backdropEl.classList.remove('hidden');
    }
  }

  public close(): void {
    if (this.backdropEl) {
      this.backdropEl.classList.add('hidden');
    }
  }
}


