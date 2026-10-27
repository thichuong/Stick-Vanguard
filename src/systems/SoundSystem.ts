/**
 * Stick Vanguard - SoundSystem Shell (Delegated to Rust WASM WebAudio Synthesizer)
 * All procedural synthesis, noise buffers, oscillator ramps, and throttling run in Rust (`wasm-sim/src/audio.rs`).
 */
import { WasmBridge } from '../core/WasmBridge.js';

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
  public static soundEnabled: boolean = true;
  public static soundVolume: number = 0.7;
  public static recordedEvents: Array<{ sound: string; time: number; data?: any }> = [];

  private static record(sound: string, data?: any): void {
    this.recordedEvents.push({ sound, time: Date.now(), data });
    if (this.recordedEvents.length > 50) {
      this.recordedEvents.shift();
    }
  }

  public static init(): void {
    WasmBridge.ensureSingletonReady();
  }

  public static setEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    this.record('SET_ENABLED', { enabled });
    const bridge = WasmBridge.ensureSingletonReady();
    if (bridge.isAvailable()) {
      bridge.getOps().audio_set_enabled(enabled);
    }
  }

  public static setVolume(volume: number): void {
    this.soundVolume = Math.max(0, Math.min(1.0, volume));
    this.record('SET_VOLUME', { volume: this.soundVolume });
    const bridge = WasmBridge.ensureSingletonReady();
    if (bridge.isAvailable()) {
      bridge.getOps().audio_set_volume(this.soundVolume);
    }
  }

  public static playShoot(type: ShootSoundType): void {
    this.record('SHOOT', { type });
    const bridge = WasmBridge.ensureSingletonReady();
    if (bridge.isAvailable()) {
      bridge.getOps().audio_play_shoot(type);
    }
  }

  public static playHit(options: HitSoundOptions = {}): void {
    this.record('HIT', options);
    const bridge = WasmBridge.ensureSingletonReady();
    if (bridge.isAvailable()) {
      bridge.getOps().audio_play_hit(
        Boolean(options.isImmune),
        Boolean(options.isReactionOrWeakness),
        Boolean(options.isMelee)
      );
    }
  }

  public static playExplosion(scale: 'SMALL' | 'LARGE' = 'SMALL'): void {
    this.record('EXPLOSION', { scale });
    const bridge = WasmBridge.ensureSingletonReady();
    if (bridge.isAvailable()) {
      bridge.getOps().audio_play_explosion(scale);
    }
  }

  public static playTrapTrigger(trapType: TrapSoundType): void {
    this.record('TRAP_TRIGGER', { trapType });
    const bridge = WasmBridge.ensureSingletonReady();
    if (bridge.isAvailable()) {
      bridge.getOps().audio_play_trap_trigger(trapType);
    }
  }

  public static playEnemyDeath(tier: EnemyDeathTier = 'NORMAL'): void {
    this.record('ENEMY_DEATH', { tier });
    const bridge = WasmBridge.ensureSingletonReady();
    if (bridge.isAvailable()) {
      bridge.getOps().audio_play_enemy_death(tier);
    }
  }

  public static playSoldierDeath(): void {
    this.record('SOLDIER_DEATH');
    const bridge = WasmBridge.ensureSingletonReady();
    if (bridge.isAvailable()) {
      bridge.getOps().audio_play_soldier_death();
    }
  }

  public static playTowerDamaged(severity: TowerDamagedSeverity): void {
    this.record('TOWER_DAMAGED', { severity });
    const bridge = WasmBridge.ensureSingletonReady();
    if (bridge.isAvailable()) {
      bridge.getOps().audio_play_tower_damaged(severity);
    }
  }

  public static playBaseDamaged(isBoss: boolean = false): void {
    this.record('BASE_DAMAGED', { isBoss });
    const bridge = WasmBridge.ensureSingletonReady();
    if (bridge.isAvailable()) {
      bridge.getOps().audio_play_base_damaged(isBoss);
    }
  }

  public static playEnemySkill(skill: EnemySkillSound): void {
    this.record('ENEMY_SKILL', { skill });
    const bridge = WasmBridge.ensureSingletonReady();
    if (bridge.isAvailable()) {
      bridge.getOps().audio_play_enemy_skill(skill);
    }
  }

  public static playBuild(): void {
    this.record('BUILD');
    const bridge = WasmBridge.ensureSingletonReady();
    if (bridge.isAvailable()) {
      bridge.getOps().audio_play_build();
    }
  }

  public static playUpgrade(): void {
    this.record('UPGRADE');
    const bridge = WasmBridge.ensureSingletonReady();
    if (bridge.isAvailable()) {
      bridge.getOps().audio_play_upgrade();
    }
  }

  public static playImbue(): void {
    this.record('IMBUE');
    const bridge = WasmBridge.ensureSingletonReady();
    if (bridge.isAvailable()) {
      bridge.getOps().audio_play_imbue();
    }
  }

  public static playSell(): void {
    this.record('SELL');
    const bridge = WasmBridge.ensureSingletonReady();
    if (bridge.isAvailable()) {
      bridge.getOps().audio_play_sell();
    }
  }

  public static playRally(): void {
    this.record('RALLY');
    const bridge = WasmBridge.ensureSingletonReady();
    if (bridge.isAvailable()) {
      bridge.getOps().audio_play_rally();
    }
  }

  public static playError(): void {
    this.record('ERROR');
    const bridge = WasmBridge.ensureSingletonReady();
    if (bridge.isAvailable()) {
      bridge.getOps().audio_play_error();
    }
  }

  public static playWaveStart(): void {
    this.record('WAVE_START');
    const bridge = WasmBridge.ensureSingletonReady();
    if (bridge.isAvailable()) {
      bridge.getOps().audio_play_wave_start();
    }
  }

  public static playWaveComplete(): void {
    this.record('WAVE_COMPLETE');
    const bridge = WasmBridge.ensureSingletonReady();
    if (bridge.isAvailable()) {
      bridge.getOps().audio_play_wave_complete();
    }
  }

  public static playVictory(): void {
    this.record('VICTORY');
    const bridge = WasmBridge.ensureSingletonReady();
    if (bridge.isAvailable()) {
      bridge.getOps().audio_play_victory();
    }
  }

  public static playGameOver(): void {
    this.record('GAME_OVER');
    const bridge = WasmBridge.ensureSingletonReady();
    if (bridge.isAvailable()) {
      bridge.getOps().audio_play_game_over();
    }
  }

  public static playUIClick(): void {
    this.record('UI_CLICK');
    const bridge = WasmBridge.ensureSingletonReady();
    if (bridge.isAvailable()) {
      bridge.getOps().audio_play_ui_click();
    }
  }
}
