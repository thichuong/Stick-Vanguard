import { Particle, FloatingText } from '../types/entities.types.js';

/**
 * Remove an element from an array in O(1) time by swapping with the last element.
 * Note: Does not preserve array ordering (ideal for unordered collections like particles, texts, enemies).
 */
export function swapRemove<T>(arr: T[], index: number): void {
  const lastIndex = arr.length - 1;
  if (index < lastIndex) {
    arr[index] = arr[lastIndex];
  }
  arr.pop();
}

/**
 * Generic high-throughput Object Pool for volatile game entities.
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn?: (item: T) => void;

  constructor(createFn: () => T, resetFn?: (item: T) => void, initialCapacity = 64) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    for (let i = 0; i < initialCapacity; i++) {
      this.pool.push(this.createFn());
    }
  }

  public acquire(): T {
    if (this.pool.length > 0) {
      const item = this.pool.pop()!;
      if (this.resetFn) this.resetFn(item);
      return item;
    }
    return this.createFn();
  }

  public release(item: T): void {
    // Prevent unbound pool growth beyond 1500 items
    if (this.pool.length < 1500) {
      this.pool.push(item);
    }
  }

  public clear(): void {
    this.pool.length = 0;
  }

  public size(): number {
    return this.pool.length;
  }
}

let particleCounter = 0;
export const particlePool = new ObjectPool<Particle>(
  () => ({
    id: `p-${++particleCounter}`,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    color: '#ffffff',
    size: 2,
    lifeTime: 0.5,
    maxLifeTime: 0.5,
    shape: 'CIRCLE'
  }),
  (p) => {
    p.lifeTime = 0.5;
    p.maxLifeTime = 0.5;
  },
  256
);

let textCounter = 0;
export const floatingTextPool = new ObjectPool<FloatingText>(
  () => ({
    id: `txt-${++textCounter}`,
    text: '',
    x: 0,
    y: 0,
    color: '#ffffff',
    lifeTime: 0.8,
    maxLifeTime: 0.8,
    size: 13
  }),
  (t) => {
    t.lifeTime = 0.8;
    t.maxLifeTime = 0.8;
  },
  128
);

