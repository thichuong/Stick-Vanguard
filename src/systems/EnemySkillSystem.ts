import { EnemyEntity, TowerEntity } from '../types/entities.types.js';
import { GameState } from '../core/GameState.js';
import { TargetingRuleEngine } from './TargetingRuleEngine.js';
import { NavigationSystem } from './NavigationSystem.js';
import { WaveSystem } from './WaveSystem.js';

export class EnemySkillSystem {
  public static update(
    enemies: EnemyEntity[],
    towers: TowerEntity[],
    state: GameState,
    dt: number,
    navSystem?: NavigationSystem,
    waveSystem?: WaveSystem,
    totalAnimTime?: number
  ): void {
    for (const enemy of enemies) {
      if (enemy.hp <= 0 || enemy.state === 'DEAD') continue;
      if (TargetingRuleEngine.isEnemyStunnedOrFrozen(enemy)) continue;

      if (!enemy.abilities || !enemy.abilityTimers) continue;

      for (let i = 0; i < enemy.abilities.length; i++) {
        const ability = enemy.abilities[i];
        // DEATH_SPAWN is triggered strictly on death, not during time update
        if (ability.type === 'DEATH_SPAWN') continue;

        const interval = ability.interval ?? 6.0;
        enemy.abilityTimers[i] -= dt;

        if (enemy.abilityTimers[i] <= 0) {
          enemy.abilityTimers[i] = interval;
          this.executeAbility(enemy, ability, enemies, towers, state, navSystem, waveSystem, totalAnimTime);
        }
      }
    }
  }

  public static handleDeath(
    enemy: EnemyEntity,
    state: GameState,
    navSystem?: NavigationSystem,
    waveSystem?: WaveSystem,
    totalAnimTime: number = 0
  ): void {
    if (!enemy.abilities || !navSystem || !waveSystem) return;

    for (const ability of enemy.abilities) {
      if (ability.type === 'DEATH_SPAWN' && ability.spawnTypeId) {
        const count = ability.count || 1;
        state.addFloatingText('💥 Phân tách!', enemy.x, enemy.y - 24, '#f97316', 15);

        for (let s = 0; s < count; s++) {
          const offset = (s - (count - 1) / 2) * 12;
          const childDist = Math.max(0, enemy.pathDistance + offset);
          const childNav = navSystem.getPointAlongPath(
            enemy.navigationMode,
            childDist,
            totalAnimTime,
            enemy.laneIndex ?? 0
          );
          const childEnemy = waveSystem.spawnMinionAt(
            ability.spawnTypeId,
            childDist,
            childNav.position.x,
            childNav.position.y,
            enemy.laneIndex ?? 0
          );
          if (childEnemy) {
            const pathInfo = navSystem.getPathInfo(childEnemy.navigationMode, childEnemy.laneIndex ?? 0);
            childEnemy.pathTotalLength = pathInfo.totalLength;
            childEnemy.facing = childNav.facing;
            state.enemies.push(childEnemy);
            state.addExplosionParticles(childNav.position.x, childNav.position.y, '#f97316', 5);
          }
        }
      }
    }
  }

  private static executeAbility(
    sourceEnemy: EnemyEntity,
    ability: NonNullable<EnemyEntity['abilities']>[0],
    allEnemies: EnemyEntity[],
    allTowers: TowerEntity[],
    state: GameState,
    navSystem?: NavigationSystem,
    waveSystem?: WaveSystem,
    totalAnimTime: number = 0
  ): void {
    switch (ability.type) {
      case 'SUMMON': {
        if (!ability.spawnTypeId || !navSystem || !waveSystem) break;
        const count = ability.count || 1;
        state.addFloatingText('🔮 Triệu hồi!', sourceEnemy.x, sourceEnemy.y - 20, '#a855f7', 15);
        state.addExplosionParticles(sourceEnemy.x, sourceEnemy.y, '#a855f7', 10);

        for (let s = 0; s < count; s++) {
          const offset = (s + 1) * 14;
          const minionDist = Math.max(0, sourceEnemy.pathDistance - offset);
          const mNav = navSystem.getPointAlongPath(
            sourceEnemy.navigationMode,
            minionDist,
            totalAnimTime,
            sourceEnemy.laneIndex ?? 0
          );
          const minion = waveSystem.spawnMinionAt(
            ability.spawnTypeId,
            minionDist,
            mNav.position.x,
            mNav.position.y,
            sourceEnemy.laneIndex ?? 0
          );
          if (minion) {
            const pathInfo = navSystem.getPathInfo(minion.navigationMode, minion.laneIndex ?? 0);
            minion.pathTotalLength = pathInfo.totalLength;
            minion.facing = mNav.facing;
            allEnemies.push(minion);
          }
        }
        break;
      }

      case 'DISABLE_TOWER': {
        const maxTargets = ability.maxTargets || 1;
        const radius = ability.radius || 150;
        const duration = ability.duration || 3.5;

        // Find closest towers within radius
        const validTowers = allTowers
          .filter((t) => t.placement === 'ROADSIDE')
          .map((t) => ({ tower: t, dist: Math.hypot(t.x - sourceEnemy.x, t.y - sourceEnemy.y) }))
          .filter((item) => item.dist <= radius)
          .sort((a, b) => a.dist - b.dist)
          .slice(0, maxTargets);

        for (const item of validTowers) {
          const t = item.tower;
          t.disabledTimer = Math.max(t.disabledTimer || 0, duration);
          state.addFloatingText('⚡ VÔ HIỆU THÁP!', t.x, t.y - 22, '#facc15', 14);
          state.addExplosionParticles(t.x, t.y, '#facc15', 10);
          state.addExplosionParticles(sourceEnemy.x, sourceEnemy.y, '#a855f7', 6);
        }
        break;
      }

      case 'DOWNGRADE_TOWER': {
        const radius = ability.radius || 160;
        // Find closest roadside tower (or any tower/trap)
        let closestTower: TowerEntity | null = null;
        let minDist = radius;

        for (const t of allTowers) {
          const dist = Math.hypot(t.x - sourceEnemy.x, t.y - sourceEnemy.y);
          if (dist <= minDist) {
            minDist = dist;
            closestTower = t;
          }
        }

        if (closestTower) {
          state.addExplosionParticles(sourceEnemy.x, sourceEnemy.y, '#7c3aed', 12);
          state.downgradeOrDestroyTower(closestTower.id);
        }
        break;
      }

      case 'ARMOR_SHIELD_AURA': {
        const radius = ability.radius || 110;
        const shieldVal = ability.value || 80;

        for (const e of allEnemies) {
          if (e.hp <= 0 || e.state === 'DEAD') continue;
          const dist = Math.hypot(e.x - sourceEnemy.x, e.y - sourceEnemy.y);
          if (dist <= radius) {
            e.armorShield = Math.min((e.armorShield || 0) + shieldVal, shieldVal * 2.5);
            e.maxArmorShield = Math.max(e.maxArmorShield || 0, e.armorShield);
            state.addFloatingText('🛡️ +Giáp Ảo!', e.x, e.y - 18, '#e2e8f0', 12);
            state.addExplosionParticles(e.x, e.y, '#e2e8f0', 5);
          }
        }
        break;
      }

      case 'MAGIC_SHIELD_AURA': {
        const radius = ability.radius || 120;
        const shieldVal = ability.value || 90;

        for (const e of allEnemies) {
          if (e.hp <= 0 || e.state === 'DEAD') continue;
          const dist = Math.hypot(e.x - sourceEnemy.x, e.y - sourceEnemy.y);
          if (dist <= radius) {
            e.magicShield = Math.min((e.magicShield || 0) + shieldVal, shieldVal * 2.5);
            e.maxMagicShield = Math.max(e.maxMagicShield || 0, e.magicShield);
            state.addFloatingText('🔮 +Khiên Phép!', e.x, e.y - 18, '#c084fc', 12);
            state.addExplosionParticles(e.x, e.y, '#c084fc', 5);
          }
        }
        break;
      }

      case 'HEAL_AURA': {
        const radius = ability.radius || 120;
        const healAmt = ability.value || 80;

        for (const e of allEnemies) {
          if (e.hp <= 0 || e.state === 'DEAD') continue;
          const dist = Math.hypot(e.x - sourceEnemy.x, e.y - sourceEnemy.y);
          if (dist <= radius && e.hp < e.maxHp) {
            const actualHeal = Math.min(healAmt, e.maxHp - e.hp);
            e.hp += actualHeal;
            state.addFloatingText(`+${actualHeal} ❤️`, e.x, e.y - 16, '#22c55e', 13);
            state.addExplosionParticles(e.x, e.y, '#22c55e', 5);
          }
        }
        break;
      }

      case 'DAMAGE_REDUCTION_AURA': {
        const radius = ability.radius || 110;
        const ratio = Math.min(0.6, ability.value || 0.25);
        const duration = ability.duration || 4.0;

        for (const e of allEnemies) {
          if (e.hp <= 0 || e.state === 'DEAD') continue;
          const dist = Math.hypot(e.x - sourceEnemy.x, e.y - sourceEnemy.y);
          if (dist <= radius) {
            e.damageReductionRatio = Math.max(e.damageReductionRatio || 0, ratio);
            e.damageReductionTimer = Math.max(e.damageReductionTimer || 0, duration);
            state.addFloatingText('🛡️ GIẢM SÁT THƯƠNG!', e.x, e.y - 20, '#38bdf8', 12);
          }
        }
        break;
      }
    }
  }
}
