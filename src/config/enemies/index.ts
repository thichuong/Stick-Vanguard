import { EnemyBlueprint } from './types.js';
import { BOSS_ENEMIES } from './boss.enemies.js';
import { ELITE_ENEMIES } from './elite.enemies.js';
import { MINION_ENEMIES } from './minion.enemies.js';
import { GROUND_ENEMIES } from './ground.enemies.js';
import { FLYING_ENEMIES } from './flying.enemies.js';
import { AQUATIC_ENEMIES } from './aquatic.enemies.js';

export * from './types.js';
export * from './cc.config.js';
export * from './boss.enemies.js';
export * from './elite.enemies.js';
export * from './minion.enemies.js';
export * from './ground.enemies.js';
export * from './flying.enemies.js';
export * from './aquatic.enemies.js';

/**
 * Danh sách toàn bộ 30 chủng loại quái vật trong Stick Vanguard
 */
export const ENEMY_BLUEPRINTS: Record<string, EnemyBlueprint> = {
  // Ground
  ...GROUND_ENEMIES,

  // Flying
  ...FLYING_ENEMIES,

  // Aquatic
  ...AQUATIC_ENEMIES,

  // Elite (summoners / splitters)
  ...ELITE_ENEMIES,

  // Minions spawned from split/summon
  ...MINION_ENEMIES,

  // Bosses
  ...BOSS_ENEMIES
};

