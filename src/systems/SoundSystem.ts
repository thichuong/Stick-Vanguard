/**
 * Stick Vanguard - Procedural Web Audio API Sound System
 * Synthesizes dynamic sound effects with zero external audio assets.
 * Features polyphony throttling, master volume controls, and headless test-safety.
 */

export type ShootSoundType = 'ARCHER' | 'MAGE' | 'ARTILLERY' | 'JAVELIN';
export type TrapSoundType = 'TRAP_SPIKE' | 'TRAP_FIRE' | 'TRAP_FROST' | 'TRAP_NET';
export type EnemyDeathTier = 'NORMAL' | 'ELITE' | 'BOSS';
export type TowerDamagedSeverity = 'DISABLED' | 'DOWNGRADED' | 'DESTROYED';
export type EnemySkillSound = 'SUMMON' | 'SPLIT' | 'BUFF';

export interface HitSoundOptions {
  isImmune?: boolean;
  isReactionOrWeakness?: boolean;
  element?: string;
  isMelee?: boolean;
}

export class SoundSystem {
  private static audioCtx: AudioContext | null = null;
  private static masterGain: GainNode | null = null;
  private static noiseBuffer: AudioBuffer | null = null;

  public static soundEnabled: boolean = true;
  public static soundVolume: number = 0.7; // 0.0 to 1.0

  // Throttling timestamps to prevent acoustic clipping & polyphony overload
  private static lastPlayTimes: Record<string, number> = {};

  // History buffer for unit testing and debugging
  public static recordedEvents: Array<{ sound: string; time: number; data?: any }> = [];

  /**
   * Initializes the AudioContext lazily on user gesture.
   */
  public static init(): void {
    if (typeof window === 'undefined') return;

    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        try {
          this.audioCtx = new AudioCtxClass();
          this.masterGain = this.audioCtx.createGain();
          this.masterGain.gain.setValueAtTime(this.soundVolume, this.audioCtx.currentTime);
          this.masterGain.connect(this.audioCtx.destination);
          this.initNoiseBuffer();
        } catch (e) {
          console.warn('SoundSystem: AudioContext creation failed', e);
        }
      }
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  public static setEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    this.record('SET_ENABLED', { enabled });
  }

  public static setVolume(volume: number): void {
    this.soundVolume = Math.max(0, Math.min(1.0, volume));
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.soundVolume, this.audioCtx.currentTime);
    }
    this.record('SET_VOLUME', { volume: this.soundVolume });
  }

  private static record(sound: string, data?: any): void {
    this.recordedEvents.push({ sound, time: Date.now(), data });
    if (this.recordedEvents.length > 50) {
      this.recordedEvents.shift();
    }
  }

  private static shouldThrottle(category: string, minIntervalMs: number): boolean {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const last = this.lastPlayTimes[category] || 0;
    if (now - last < minIntervalMs) {
      return true;
    }
    this.lastPlayTimes[category] = now;
    return false;
  }

  private static initNoiseBuffer(): void {
    if (!this.audioCtx) return;
    const bufferSize = this.audioCtx.sampleRate * 1.5; // 1.5 seconds of white noise
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
  }

  // ==========================================
  // COMBAT & DAMAGE EFFECTS
  // ==========================================

  /**
   * Sound when a tower or soldier fires a projectile / performs attack
   */
  public static playShoot(type: ShootSoundType): void {
    this.record('SHOOT', { type });
    if (!this.soundEnabled || this.soundVolume <= 0) return;
    if (this.shouldThrottle(`shoot_${type}`, 50)) return;

    this.init();
    if (!this.audioCtx || !this.masterGain) return;
    const now = this.audioCtx.currentTime;

    switch (type) {
      case 'ARCHER': {
        // High-frequency twang and swoosh
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);

        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.13);
        break;
      }

      case 'MAGE': {
        // Magical harmonic pulse with slight frequency wobble
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.23);
        break;
      }

      case 'ARTILLERY': {
        // Low rumble mortar launch
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(130, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.28);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.31);
        break;
      }

      case 'JAVELIN': {
        // Fast snap
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(360, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.1);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.11);
        break;
      }
    }
  }

  /**
   * Sound when damage is applied to an enemy or soldier.
   * Differentiates between Immune, Elemental Weakness/Reaction, and standard hit.
   */
  public static playHit(options: HitSoundOptions = {}): void {
    this.record('HIT', options);
    if (!this.soundEnabled || this.soundVolume <= 0) return;

    if (options.isImmune) {
      if (this.shouldThrottle('hit_immune', 70)) return;
      this.init();
      if (!this.audioCtx || !this.masterGain) return;
      const now = this.audioCtx.currentTime;

      // Metallic clink / deflection sound
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(980, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.08);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.09);
      return;
    }

    if (options.isReactionOrWeakness) {
      if (this.shouldThrottle('hit_reaction', 60)) return;
      this.init();
      if (!this.audioCtx || !this.masterGain) return;
      const now = this.audioCtx.currentTime;

      // Resonant chime / critical impact
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(1300, now + 0.14);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.19);
      return;
    }

    // Standard hit (throttled at 45ms to avoid buzzing in heavy waves)
    if (this.shouldThrottle('hit_normal', 45)) return;
    this.init();
    if (!this.audioCtx || !this.masterGain) return;
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = options.isMelee ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(options.isMelee ? 220 : 320, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.07);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  /**
   * Sound for AoE explosions (Artillery, Fire Trap, Boss impact)
   */
  public static playExplosion(scale: 'SMALL' | 'LARGE' = 'SMALL'): void {
    this.record('EXPLOSION', { scale });
    if (!this.soundEnabled || this.soundVolume <= 0) return;
    if (this.shouldThrottle('explosion', 70)) return;

    this.init();
    if (!this.audioCtx || !this.masterGain || !this.noiseBuffer) return;
    const now = this.audioCtx.currentTime;
    const dur = scale === 'LARGE' ? 0.45 : 0.28;

    // Filtered noise buffer for visceral explosion
    const noiseSource = this.audioCtx.createBufferSource();
    noiseSource.buffer = this.noiseBuffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(scale === 'LARGE' ? 380 : 500, now);
    filter.frequency.exponentialRampToValueAtTime(70, now + dur);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(scale === 'LARGE' ? 0.42 : 0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noiseSource.start(now);
    noiseSource.stop(now + dur + 0.02);

    // Sub-bass thud
    const osc = this.audioCtx.createOscillator();
    const oscGain = this.audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + dur);

    oscGain.gain.setValueAtTime(0.3, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  /**
   * Trigger sound for 4 tactical traps
   */
  public static playTrapTrigger(trapType: TrapSoundType): void {
    this.record('TRAP_TRIGGER', { trapType });
    if (!this.soundEnabled || this.soundVolume <= 0) return;
    if (this.shouldThrottle(`trap_${trapType}`, 80)) return;

    this.init();
    if (!this.audioCtx || !this.masterGain) return;
    const now = this.audioCtx.currentTime;

    switch (trapType) {
      case 'TRAP_SPIKE': {
        // Earth spikes snapping up
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(420, now + 0.07);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.16);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.19);
        break;
      }

      case 'TRAP_FIRE': {
        this.playExplosion('LARGE');
        break;
      }

      case 'TRAP_FROST': {
        // Crystalline ice freeze / water splash
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.1);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.25);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.27);
        break;
      }

      case 'TRAP_NET': {
        // Electric arc zap
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.linearRampToValueAtTime(240, now + 0.08);
        osc.frequency.linearRampToValueAtTime(580, now + 0.15);

        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.19);
        break;
      }
    }
  }

  // ==========================================
  // DEATH & CASUALTY EFFECTS
  // ==========================================

  /**
   * Sound when an enemy is defeated
   */
  public static playEnemyDeath(tier: EnemyDeathTier = 'NORMAL'): void {
    this.record('ENEMY_DEATH', { tier });
    if (!this.soundEnabled || this.soundVolume <= 0) return;

    if (tier === 'NORMAL' && this.shouldThrottle('enemy_death_normal', 55)) return;
    if (tier === 'ELITE' && this.shouldThrottle('enemy_death_elite', 100)) return;

    this.init();
    if (!this.audioCtx || !this.masterGain) return;
    const now = this.audioCtx.currentTime;

    if (tier === 'BOSS') {
      // Grand boss defeat rumble & coin shower
      this.playExplosion('LARGE');
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.6);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.62);
      return;
    }

    // Normal or Elite: downward thud + coin chime
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = tier === 'ELITE' ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(tier === 'ELITE' ? 320 : 260, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.16);

    gain.gain.setValueAtTime(tier === 'ELITE' ? 0.32 : 0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.17);
  }

  /**
   * Sound when an allied stickman soldier dies
   */
  public static playSoldierDeath(): void {
    this.record('SOLDIER_DEATH');
    if (!this.soundEnabled || this.soundVolume <= 0) return;
    if (this.shouldThrottle('soldier_death', 120)) return;

    this.init();
    if (!this.audioCtx || !this.masterGain) return;
    const now = this.audioCtx.currentTime;

    // Solemn downward cadence (armor falling & soldier groan)
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.26);

    gain.gain.setValueAtTime(0.26, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.28);
  }

  /**
   * Sound when a tower takes damage / is disabled / downgraded / destroyed
   */
  public static playTowerDamaged(severity: TowerDamagedSeverity): void {
    this.record('TOWER_DAMAGED', { severity });
    if (!this.soundEnabled || this.soundVolume <= 0) return;
    if (this.shouldThrottle(`tower_${severity}`, 100)) return;

    this.init();
    if (!this.audioCtx || !this.masterGain) return;
    const now = this.audioCtx.currentTime;

    switch (severity) {
      case 'DISABLED': {
        // Electronic glitch / stun power drain
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.25);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.27);
        break;
      }

      case 'DOWNGRADED': {
        // Structural crack & slide down
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.32);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.33);
        break;
      }

      case 'DESTROYED': {
        // Full building demolition
        this.playExplosion('LARGE');
        break;
      }
    }
  }

  /**
   * Sound when the player base loses lives
   */
  public static playBaseDamaged(isBoss: boolean = false): void {
    this.record('BASE_DAMAGED', { isBoss });
    if (!this.soundEnabled || this.soundVolume <= 0) return;
    if (this.shouldThrottle('base_damaged', 150)) return;

    this.init();
    if (!this.audioCtx || !this.masterGain) return;
    const now = this.audioCtx.currentTime;

    // Alarm buzzer
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(isBoss ? 160 : 220, now);
    osc.frequency.setValueAtTime(isBoss ? 110 : 180, now + 0.12);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  /**
   * Sound when enemies trigger skill (Summon, Split, Aura Buff)
   */
  public static playEnemySkill(skill: EnemySkillSound): void {
    this.record('ENEMY_SKILL', { skill });
    if (!this.soundEnabled || this.soundVolume <= 0) return;
    if (this.shouldThrottle(`skill_${skill}`, 100)) return;

    this.init();
    if (!this.audioCtx || !this.masterGain) return;
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'sawtooth';

    if (skill === 'SUMMON') {
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.22);
    } else if (skill === 'SPLIT') {
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.18);
    } else {
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.15);
    }

    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  // ==========================================
  // BUILDING & ECONOMY EFFECTS
  // ==========================================

  public static playBuild(): void {
    this.record('BUILD');
    if (!this.soundEnabled || this.soundVolume <= 0) return;
    this.init();
    if (!this.audioCtx || !this.masterGain) return;
    const now = this.audioCtx.currentTime;

    // Wooden / stone hammer tap
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(480, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  public static playUpgrade(): void {
    this.record('UPGRADE');
    if (!this.soundEnabled || this.soundVolume <= 0) return;
    this.init();
    if (!this.audioCtx || !this.masterGain) return;
    const now = this.audioCtx.currentTime;

    // Ascending arpeggio chime (3 notes)
    const notes = [440, 554, 659];
    notes.forEach((freq, idx) => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();
      const startT = now + idx * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startT);

      gain.gain.setValueAtTime(0.22, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.16);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(startT);
      osc.stop(startT + 0.17);
    });
  }

  public static playImbue(): void {
    this.record('IMBUE');
    if (!this.soundEnabled || this.soundVolume <= 0) return;
    this.init();
    if (!this.audioCtx || !this.masterGain) return;
    const now = this.audioCtx.currentTime;

    // Shimmering elemental hum
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(920, now + 0.18);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.23);
  }

  public static playSell(): void {
    this.record('SELL');
    if (!this.soundEnabled || this.soundVolume <= 0) return;
    this.init();
    if (!this.audioCtx || !this.masterGain) return;
    const now = this.audioCtx.currentTime;

    // Coins jingle
    const freqs = [880, 1175];
    freqs.forEach((freq, idx) => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();
      const startT = now + idx * 0.07;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startT);

      gain.gain.setValueAtTime(0.24, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(startT);
      osc.stop(startT + 0.13);
    });
  }

  public static playRally(): void {
    this.record('RALLY');
    if (!this.soundEnabled || this.soundVolume <= 0) return;
    this.init();
    if (!this.audioCtx || !this.masterGain) return;
    const now = this.audioCtx.currentTime;

    // Soldier horn / order whistle
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(330, now);
    osc.frequency.setValueAtTime(440, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.21);
  }

  public static playError(): void {
    this.record('ERROR');
    if (!this.soundEnabled || this.soundVolume <= 0) return;
    if (this.shouldThrottle('ui_error', 120)) return;
    this.init();
    if (!this.audioCtx || !this.masterGain) return;
    const now = this.audioCtx.currentTime;

    // Low error thud
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.setValueAtTime(110, now + 0.08);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.17);
  }

  // ==========================================
  // MATCH PROGRESS & WAVE EVENTS
  // ==========================================

  public static playWaveStart(): void {
    this.record('WAVE_START');
    if (!this.soundEnabled || this.soundVolume <= 0) return;
    this.init();
    if (!this.audioCtx || !this.masterGain) return;
    const now = this.audioCtx.currentTime;

    // Battle horn
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(330, now + 0.18);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.35);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.42);
  }

  public static playWaveComplete(): void {
    this.record('WAVE_COMPLETE');
    if (!this.soundEnabled || this.soundVolume <= 0) return;
    this.init();
    if (!this.audioCtx || !this.masterGain) return;
    const now = this.audioCtx.currentTime;

    // Cheerful reward chime (3 notes)
    const chord = [523.25, 659.25, 783.99]; // C5, E5, G5
    chord.forEach((freq, idx) => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();
      const startT = now + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startT);

      gain.gain.setValueAtTime(0.24, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.25);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(startT);
      osc.stop(startT + 0.26);
    });
  }

  public static playVictory(): void {
    this.record('VICTORY');
    if (!this.soundEnabled || this.soundVolume <= 0) return;
    this.init();
    if (!this.audioCtx || !this.masterGain) return;
    const now = this.audioCtx.currentTime;

    // Victory fanfare (C5, G5, C6)
    const notes = [
      { f: 523.25, t: 0.0, d: 0.16 },
      { f: 659.25, t: 0.16, d: 0.16 },
      { f: 783.99, t: 0.32, d: 0.2 },
      { f: 1046.5, t: 0.52, d: 0.5 }
    ];

    notes.forEach((n) => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();
      const startT = now + n.t;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, startT);

      gain.gain.setValueAtTime(0.32, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + n.d);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(startT);
      osc.stop(startT + n.d + 0.02);
    });
  }

  public static playGameOver(): void {
    this.record('GAME_OVER');
    if (!this.soundEnabled || this.soundVolume <= 0) return;
    this.init();
    if (!this.audioCtx || !this.masterGain) return;
    const now = this.audioCtx.currentTime;

    // Somber defeat cadence
    const notes = [
      { f: 330, t: 0.0, d: 0.22 },
      { f: 293, t: 0.22, d: 0.22 },
      { f: 261, t: 0.44, d: 0.24 },
      { f: 196, t: 0.68, d: 0.6 }
    ];

    notes.forEach((n) => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();
      const startT = now + n.t;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(n.f, startT);

      gain.gain.setValueAtTime(0.3, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + n.d);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(startT);
      osc.stop(startT + n.d + 0.02);
    });
  }

  public static playUIClick(): void {
    this.record('UI_CLICK');
    if (!this.soundEnabled || this.soundVolume <= 0) return;
    if (this.shouldThrottle('ui_click', 50)) return;
    this.init();
    if (!this.audioCtx || !this.masterGain) return;
    const now = this.audioCtx.currentTime;

    // Crisp soft click
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.05);
  }
}

