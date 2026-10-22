import {
  TowerEntity,
  EnemyEntity,
  ProjectileEntity
} from '../types/entities.types.js';
import { TargetingRuleEngine } from './TargetingRuleEngine.js';

export class TowerSystem {
  private static projectileCounter = 0;

  public static updateTowers(
    towers: TowerEntity[],
    enemies: EnemyEntity[],
    dt: number,
    onSpawnProjectile: (proj: ProjectileEntity) => void
  ): void {
    for (const tower of towers) {
      if (tower.attackCooldown > 0) {
        tower.attackCooldown -= dt;
      }

      // Barracks and traps do not shoot normal projectiles from this loop
      if (tower.type === 'BARRACKS' || tower.placement !== 'ROADSIDE') {
        continue;
      }

      if (tower.attackCooldown > 0) {
        continue;
      }

      // Find best target in range
      const target = this.findTarget(tower, enemies);
      if (!target) {
        continue;
      }

      // Fire projectile
      tower.attackCooldown = 1 / tower.fireRate;
      this.projectileCounter++;

      const isParabolic = tower.type === 'ARTILLERY';
      const aoeRadius = tower.aoeRadius || (isParabolic ? 75 : 0);
      const projSpeed = isParabolic ? 220 : tower.type === 'ARCHER' ? 440 : 340;

      const proj: ProjectileEntity = {
        id: `proj-${this.projectileCounter}`,
        sourceTowerId: tower.id,
        x: tower.x,
        y: tower.y - 14, // firing from tower top
        startX: tower.x,
        startY: tower.y - 14,
        targetX: target.x,
        targetY: target.y,
        targetEnemyId: isParabolic ? undefined : target.id, // Artillery shoots at ground position
        speed: projSpeed,
        damagePayload: {
          amount: tower.damage,
          element: tower.element,
          sourceId: tower.id
        },
        aoeRadius,
        isParabolic,
        arcHeight: isParabolic ? 70 : 0,
        progress: 0,
        chainCount: tower.branch === 'B' && tower.tier === 4 && tower.type === 'MAGE' ? 3 : 0
      };

      onSpawnProjectile(proj);
    }
  }

  private static findTarget(
    tower: TowerEntity,
    enemies: EnemyEntity[]
  ): EnemyEntity | null {
    let bestTarget: EnemyEntity | null = null;
    let maxProgress = -1;

    for (const enemy of enemies) {
      if (enemy.hp <= 0 || enemy.state === 'DEAD') continue;

      // Distance check
      const dist = Math.hypot(enemy.x - tower.x, enemy.y - tower.y);
      if (dist > tower.range) continue;

      // Rule check (movement type, excluded elements/tags)
      if (!TargetingRuleEngine.canTarget(tower.targetingFilter, enemy)) {
        continue;
      }

      // Priority: Enemy furthest along path (closest to goal)
      if (enemy.pathDistance > maxProgress) {
        maxProgress = enemy.pathDistance;
        bestTarget = enemy;
      }
    }

    return bestTarget;
  }
}

