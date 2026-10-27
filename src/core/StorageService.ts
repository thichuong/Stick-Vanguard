import { MAPS_CONFIG } from '../config/map.config.js';
import { GameState } from './GameState.js';

export interface SavedSettings {
  version: number;
  customTotalWaves: number;
  goldMultiplier: number;
  damageMultiplier: number;
  gameSpeed: 1 | 2;
  currentMapId: string;
  soundEnabled: boolean;
  soundVolume: number;
  autoNextWave: boolean;
}

export const STORAGE_KEY_SETTINGS = 'stick_vanguard_settings_v1';

export const DEFAULT_SETTINGS: SavedSettings = {
  version: 1,
  customTotalWaves: 15,
  goldMultiplier: 1.0,
  damageMultiplier: 1.0,
  gameSpeed: 1,
  currentMapId: MAPS_CONFIG[0]?.id || 'valley_origin',
  soundEnabled: true,
  soundVolume: 0.7,
  autoNextWave: false
};

export class StorageService {
  private static memoryFallback: Record<string, string> = {};

  private static getStorage(): { getItem: (key: string) => string | null; setItem: (key: string, val: string) => void; removeItem: (key: string) => void } | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage;
      }
      if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
        return (globalThis as any).localStorage;
      }
    } catch {
      // In restricted iframes or disabled cookies/storage
    }

    return {
      getItem: (key: string) => StorageService.memoryFallback[key] ?? null,
      setItem: (key: string, val: string) => {
        StorageService.memoryFallback[key] = val;
      },
      removeItem: (key: string) => {
        delete StorageService.memoryFallback[key];
      }
    };
  }
  /**
   * Sanitizes and clamps raw settings into a valid SavedSettings object.
   */
  public static sanitizeSettings(raw: Partial<SavedSettings> | null | undefined): SavedSettings {
    if (!raw || typeof raw !== 'object') {
      return { ...DEFAULT_SETTINGS };
    }

    const defaultMapId = DEFAULT_SETTINGS.currentMapId;
    const isValidMap = MAPS_CONFIG.some((m) => m.id === raw.currentMapId);
    const currentMapId = isValidMap && raw.currentMapId ? raw.currentMapId : defaultMapId;

    let customTotalWaves = DEFAULT_SETTINGS.customTotalWaves;
    if (typeof raw.customTotalWaves === 'number' && !isNaN(raw.customTotalWaves)) {
      customTotalWaves = Math.max(1, Math.min(100, Math.round(raw.customTotalWaves)));
    }

    let goldMultiplier = DEFAULT_SETTINGS.goldMultiplier;
    if (typeof raw.goldMultiplier === 'number' && !isNaN(raw.goldMultiplier)) {
      goldMultiplier = Math.max(0.1, Math.min(10.0, Math.round(raw.goldMultiplier * 10) / 10));
    }

    let damageMultiplier = DEFAULT_SETTINGS.damageMultiplier;
    if (typeof raw.damageMultiplier === 'number' && !isNaN(raw.damageMultiplier)) {
      damageMultiplier = Math.max(0.1, Math.min(10.0, Math.round(raw.damageMultiplier * 10) / 10));
    }

    let gameSpeed: 1 | 2 = DEFAULT_SETTINGS.gameSpeed;
    if (raw.gameSpeed === 2 || raw.gameSpeed === 1) {
      gameSpeed = raw.gameSpeed;
    }

    let soundEnabled = DEFAULT_SETTINGS.soundEnabled;
    if (typeof raw.soundEnabled === 'boolean') {
      soundEnabled = raw.soundEnabled;
    }

    let soundVolume = DEFAULT_SETTINGS.soundVolume;
    if (typeof raw.soundVolume === 'number' && !isNaN(raw.soundVolume)) {
      soundVolume = Math.max(0, Math.min(1.0, Math.round(raw.soundVolume * 100) / 100));
    }

    let autoNextWave = DEFAULT_SETTINGS.autoNextWave;
    if (typeof raw.autoNextWave === 'boolean') {
      autoNextWave = raw.autoNextWave;
    }

    return {
      version: 1,
      customTotalWaves,
      goldMultiplier,
      damageMultiplier,
      gameSpeed,
      currentMapId,
      soundEnabled,
      soundVolume,
      autoNextWave
    };
  }

  /**
   * Loads saved settings from localStorage, falling back to default if unavailable or invalid.
   */
  public static loadSettings(): SavedSettings {
    try {
      const storage = this.getStorage();
      if (storage) {
        const item = storage.getItem(STORAGE_KEY_SETTINGS);
        if (item) {
          const parsed = JSON.parse(item);
          return this.sanitizeSettings(parsed);
        }
      }
    } catch (err) {
      console.warn('StorageService: Failed to read settings from storage', err);
    }
    return { ...DEFAULT_SETTINGS };
  }

  /**
   * Saves partial or full settings to localStorage.
   */
  public static saveSettings(partial: Partial<SavedSettings>): SavedSettings {
    const current = this.loadSettings();
    const merged = this.sanitizeSettings({ ...current, ...partial });
    try {
      const storage = this.getStorage();
      if (storage) {
        storage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(merged));
      }
    } catch (err) {
      console.warn('StorageService: Failed to save settings to storage', err);
    }
    return merged;
  }

  /**
   * Saves settings from an active GameState instance to localStorage.
   */
  public static saveFromGameState(state: GameState): SavedSettings {
    const data: Partial<SavedSettings> = {
      customTotalWaves: state.customTotalWaves,
      goldMultiplier: state.goldMultiplier,
      damageMultiplier: state.damageMultiplier,
      gameSpeed: (state.gameSpeed === 2 ? 2 : 1) as 1 | 2,
      currentMapId: state.currentMapId,
      soundEnabled: state.soundEnabled,
      soundVolume: state.soundVolume,
      autoNextWave: state.autoNextWave
    };
    return this.saveSettings(data);
  }

  /**
   * Applies stored settings onto a GameState instance.
   */
  public static applyToGameState(state: GameState): SavedSettings {
    const settings = this.loadSettings();
    if (settings.currentMapId !== state.currentMapId) {
      state.setMap(settings.currentMapId);
    }
    state.customTotalWaves = settings.customTotalWaves;
    state.goldMultiplier = settings.goldMultiplier;
    state.damageMultiplier = settings.damageMultiplier;
    state.gameSpeed = settings.gameSpeed;
    state.soundEnabled = settings.soundEnabled;
    state.soundVolume = settings.soundVolume;
    state.autoNextWave = settings.autoNextWave;
    return settings;
  }

  /**
   * Resets settings back to default values in localStorage.
   */
  public static resetSettings(): SavedSettings {
    const defaults = { ...DEFAULT_SETTINGS };
    try {
      const storage = this.getStorage();
      if (storage) {
        storage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(defaults));
      }
    } catch (err) {
      console.warn('StorageService: Failed to reset settings in storage', err);
    }
    return defaults;
  }

  /**
   * Clears storage key (mainly for test cleanups).
   */
  public static clear(): void {
    try {
      const storage = this.getStorage();
      if (storage) {
        storage.removeItem(STORAGE_KEY_SETTINGS);
      }
    } catch {
      // ignore
    }
    StorageService.memoryFallback = {};
  }
}
