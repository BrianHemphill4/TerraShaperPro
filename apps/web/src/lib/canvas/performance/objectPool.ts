/**
 * Object Pool for efficient memory management in canvas operations
 * Reuses objects instead of creating new ones to reduce garbage collection
 */

export interface Poolable {
  reset(): void;
  inUse: boolean;
}

export class ObjectPool<T extends Poolable> {
  private pool: T[] = [];
  private activeObjects: Set<T> = new Set();
  private createFn: () => T;
  private resetFn?: (obj: T) => void;
  private maxSize: number;

  constructor(
    createFn: () => T,
    initialSize: number = 10,
    maxSize: number = 100,
    resetFn?: (obj: T) => void
  ) {
    this.createFn = createFn;
    this.maxSize = maxSize;
    this.resetFn = resetFn;

    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }

  acquire(): T {
    let obj: T;

    if (this.pool.length > 0) {
      obj = this.pool.pop()!;
    } else {
      obj = this.createFn();
    }

    obj.inUse = true;
    this.activeObjects.add(obj);
    return obj;
  }

  release(obj: T): void {
    if (!this.activeObjects.has(obj)) {
      console.warn('Attempting to release object not from this pool');
      return;
    }

    obj.reset();
    if (this.resetFn) {
      this.resetFn(obj);
    }
    obj.inUse = false;

    this.activeObjects.delete(obj);

    if (this.pool.length < this.maxSize) {
      this.pool.push(obj);
    }
  }

  releaseAll(): void {
    this.activeObjects.forEach(obj => {
      obj.reset();
      if (this.resetFn) {
        this.resetFn(obj);
      }
      obj.inUse = false;

      if (this.pool.length < this.maxSize) {
        this.pool.push(obj);
      }
    });
    this.activeObjects.clear();
  }

  get size(): number {
    return this.pool.length;
  }

  get activeCount(): number {
    return this.activeObjects.size;
  }

  clear(): void {
    this.pool = [];
    this.activeObjects.clear();
  }
}

// Specialized pools for common canvas objects
export class Point implements Poolable {
  x: number = 0;
  y: number = 0;
  inUse: boolean = false;

  set(x: number, y: number): Point {
    this.x = x;
    this.y = y;
    return this;
  }

  reset(): void {
    this.x = 0;
    this.y = 0;
  }
}

export class Rectangle implements Poolable {
  x: number = 0;
  y: number = 0;
  width: number = 0;
  height: number = 0;
  inUse: boolean = false;

  set(x: number, y: number, width: number, height: number): Rectangle {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    return this;
  }

  reset(): void {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
  }

  intersects(other: Rectangle): boolean {
    return !(
      this.x + this.width < other.x ||
      other.x + other.width < this.x ||
      this.y + this.height < other.y ||
      other.y + other.height < this.y
    );
  }

  contains(x: number, y: number): boolean {
    return (
      x >= this.x &&
      x <= this.x + this.width &&
      y >= this.y &&
      y <= this.y + this.height
    );
  }
}

export class Transform implements Poolable {
  a: number = 1; // scale x
  b: number = 0; // skew y
  c: number = 0; // skew x
  d: number = 1; // scale y
  e: number = 0; // translate x
  f: number = 0; // translate y
  inUse: boolean = false;

  set(a: number, b: number, c: number, d: number, e: number, f: number): Transform {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.e = e;
    this.f = f;
    return this;
  }

  reset(): void {
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.e = 0;
    this.f = 0;
  }

  multiply(other: Transform): Transform {
    const a = this.a * other.a + this.c * other.b;
    const b = this.b * other.a + this.d * other.b;
    const c = this.a * other.c + this.c * other.d;
    const d = this.b * other.c + this.d * other.d;
    const e = this.a * other.e + this.c * other.f + this.e;
    const f = this.b * other.e + this.d * other.f + this.f;

    return this.set(a, b, c, d, e, f);
  }

  transformPoint(x: number, y: number): { x: number; y: number } {
    return {
      x: this.a * x + this.c * y + this.e,
      y: this.b * x + this.d * y + this.f
    };
  }
}

// Global object pools
export const pointPool = new ObjectPool(() => new Point(), 50, 500);
export const rectanglePool = new ObjectPool(() => new Rectangle(), 20, 200);
export const transformPool = new ObjectPool(() => new Transform(), 10, 100);

// Utility function to manage pooled objects with automatic cleanup
export function withPooledObject<T extends Poolable, R>(
  pool: ObjectPool<T>,
  fn: (obj: T) => R
): R {
  const obj = pool.acquire();
  try {
    return fn(obj);
  } finally {
    pool.release(obj);
  }
}

// Performance monitoring for pools
export class PoolMonitor {
  private stats = new Map<string, { hits: number; misses: number }>();

  recordHit(poolName: string): void {
    const stat = this.stats.get(poolName) || { hits: 0, misses: 0 };
    stat.hits++;
    this.stats.set(poolName, stat);
  }

  recordMiss(poolName: string): void {
    const stat = this.stats.get(poolName) || { hits: 0, misses: 0 };
    stat.misses++;
    this.stats.set(poolName, stat);
  }

  getStats(): Record<string, { hitRate: number; totalRequests: number }> {
    const result: Record<string, { hitRate: number; totalRequests: number }> = {};
    
    this.stats.forEach((stat, name) => {
      const total = stat.hits + stat.misses;
      result[name] = {
        hitRate: total > 0 ? stat.hits / total : 0,
        totalRequests: total
      };
    });

    return result;
  }

  reset(): void {
    this.stats.clear();
  }
}

export const poolMonitor = new PoolMonitor();