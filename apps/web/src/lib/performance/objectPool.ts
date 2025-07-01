import { performanceMonitor } from './performanceMonitor';

export interface Poolable {
  reset(): void;
  inUse: boolean;
}

export interface PoolConfig {
  initialSize: number;
  maxSize: number;
  growthFactor?: number;
  shrinkThreshold?: number;
  enableMetrics?: boolean;
}

export class ObjectPool<T extends Poolable> {
  private pool: T[] = [];
  private activeObjects: Set<T> = new Set();
  private createFn: () => T;
  private resetFn?: (obj: T) => void;
  private config: Required<PoolConfig>;
  private metrics = {
    acquisitions: 0,
    releases: 0,
    creates: 0,
    destroys: 0,
    peakSize: 0,
    peakActive: 0
  };

  constructor(
    name: string,
    createFn: () => T,
    config: PoolConfig,
    resetFn?: (obj: T) => void
  ) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.config = {
      growthFactor: 1.5,
      shrinkThreshold: 0.25,
      enableMetrics: true,
      ...config
    };

    // Pre-populate pool
    for (let i = 0; i < this.config.initialSize; i++) {
      this.pool.push(this.createFn());
      this.metrics.creates++;
    }

    this.metrics.peakSize = this.config.initialSize;
  }

  acquire(): T {
    let obj: T;

    if (this.pool.length > 0) {
      obj = this.pool.pop()!;
      if (this.config.enableMetrics) {
        performanceMonitor.updateCacheHitRate(
          this.metrics.acquisitions / (this.metrics.acquisitions + 1)
        );
      }
    } else {
      obj = this.createFn();
      this.metrics.creates++;
    }

    obj.inUse = true;
    this.activeObjects.add(obj);
    this.metrics.acquisitions++;

    if (this.activeObjects.size > this.metrics.peakActive) {
      this.metrics.peakActive = this.activeObjects.size;
    }

    this.checkGrowth();
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
    this.metrics.releases++;

    if (this.pool.length < this.config.maxSize) {
      this.pool.push(obj);
      if (this.pool.length > this.metrics.peakSize) {
        this.metrics.peakSize = this.pool.length;
      }
    } else {
      this.metrics.destroys++;
    }

    this.checkShrink();
  }

  releaseAll(): void {
    const toRelease = Array.from(this.activeObjects);
    toRelease.forEach(obj => this.release(obj));
  }

  private checkGrowth(): void {
    const utilization = this.activeObjects.size / (this.pool.length + this.activeObjects.size);
    
    if (utilization > 0.8 && this.pool.length === 0) {
      const growthSize = Math.min(
        Math.floor(this.activeObjects.size * (this.config.growthFactor - 1)),
        this.config.maxSize - this.pool.length - this.activeObjects.size
      );

      for (let i = 0; i < growthSize; i++) {
        this.pool.push(this.createFn());
        this.metrics.creates++;
      }
    }
  }

  private checkShrink(): void {
    const totalSize = this.pool.length + this.activeObjects.size;
    const utilization = this.activeObjects.size / totalSize;

    if (utilization < this.config.shrinkThreshold && this.pool.length > this.config.initialSize) {
      const shrinkSize = Math.floor(this.pool.length * 0.25);
      for (let i = 0; i < shrinkSize; i++) {
        this.pool.pop();
        this.metrics.destroys++;
      }
    }
  }

  get size(): number {
    return this.pool.length;
  }

  get activeCount(): number {
    return this.activeObjects.size;
  }

  get utilization(): number {
    const total = this.pool.length + this.activeObjects.size;
    return total > 0 ? this.activeObjects.size / total : 0;
  }

  getMetrics() {
    return {
      ...this.metrics,
      currentSize: this.pool.length,
      activeCount: this.activeObjects.size,
      utilization: this.utilization,
      hitRate: this.metrics.acquisitions > 0 
        ? (this.metrics.acquisitions - this.metrics.creates) / this.metrics.acquisitions 
        : 0
    };
  }

  clear(): void {
    this.pool = [];
    this.activeObjects.clear();
    this.metrics.destroys += this.pool.length;
  }
}

// Enhanced poolable objects for canvas operations
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

  clone(): Point {
    return pointPool.acquire().set(this.x, this.y);
  }

  distanceTo(other: Point): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  lerp(other: Point, t: number): Point {
    return this.set(
      this.x + (other.x - this.x) * t,
      this.y + (other.y - this.y) * t
    );
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

  union(other: Rectangle): Rectangle {
    const x = Math.min(this.x, other.x);
    const y = Math.min(this.y, other.y);
    const right = Math.max(this.x + this.width, other.x + other.width);
    const bottom = Math.max(this.y + this.height, other.y + other.height);
    return this.set(x, y, right - x, bottom - y);
  }

  intersection(other: Rectangle): Rectangle | null {
    const x = Math.max(this.x, other.x);
    const y = Math.max(this.y, other.y);
    const right = Math.min(this.x + this.width, other.x + other.width);
    const bottom = Math.min(this.y + this.height, other.y + other.height);
    
    if (right > x && bottom > y) {
      return rectanglePool.acquire().set(x, y, right - x, bottom - y);
    }
    return null;
  }

  get area(): number {
    return this.width * this.height;
  }

  get center(): { x: number; y: number } {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2
    };
  }
}

export class Path2D implements Poolable {
  private commands: Array<{ type: string; args: number[] }> = [];
  inUse: boolean = false;

  moveTo(x: number, y: number): Path2D {
    this.commands.push({ type: 'moveTo', args: [x, y] });
    return this;
  }

  lineTo(x: number, y: number): Path2D {
    this.commands.push({ type: 'lineTo', args: [x, y] });
    return this;
  }

  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): Path2D {
    this.commands.push({ type: 'quadraticCurveTo', args: [cpx, cpy, x, y] });
    return this;
  }

  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): Path2D {
    this.commands.push({ type: 'bezierCurveTo', args: [cp1x, cp1y, cp2x, cp2y, x, y] });
    return this;
  }

  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise = false): Path2D {
    this.commands.push({ type: 'arc', args: [x, y, radius, startAngle, endAngle, counterclockwise ? 1 : 0] });
    return this;
  }

  closePath(): Path2D {
    this.commands.push({ type: 'closePath', args: [] });
    return this;
  }

  apply(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    this.commands.forEach(cmd => {
      (ctx as any)[cmd.type](...cmd.args);
    });
  }

  reset(): void {
    this.commands = [];
  }
}

export class Matrix2D implements Poolable {
  a: number = 1;
  b: number = 0;
  c: number = 0;
  d: number = 1;
  e: number = 0;
  f: number = 0;
  inUse: boolean = false;

  set(a: number, b: number, c: number, d: number, e: number, f: number): Matrix2D {
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

  translate(x: number, y: number): Matrix2D {
    this.e += x;
    this.f += y;
    return this;
  }

  scale(x: number, y: number): Matrix2D {
    this.a *= x;
    this.b *= x;
    this.c *= y;
    this.d *= y;
    return this;
  }

  rotate(angle: number): Matrix2D {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const a = this.a * cos + this.c * sin;
    const b = this.b * cos + this.d * sin;
    const c = this.a * -sin + this.c * cos;
    const d = this.b * -sin + this.d * cos;
    return this.set(a, b, c, d, this.e, this.f);
  }

  multiply(other: Matrix2D): Matrix2D {
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

  apply(ctx: CanvasRenderingContext2D): void {
    ctx.setTransform(this.a, this.b, this.c, this.d, this.e, this.f);
  }
}

export class Color implements Poolable {
  r: number = 0;
  g: number = 0;
  b: number = 0;
  a: number = 1;
  inUse: boolean = false;

  set(r: number, g: number, b: number, a: number = 1): Color {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
    return this;
  }

  reset(): void {
    this.r = 0;
    this.g = 0;
    this.b = 0;
    this.a = 1;
  }

  toString(): string {
    if (this.a === 1) {
      return `rgb(${Math.round(this.r)}, ${Math.round(this.g)}, ${Math.round(this.b)})`;
    }
    return `rgba(${Math.round(this.r)}, ${Math.round(this.g)}, ${Math.round(this.b)}, ${this.a})`;
  }

  toHex(): string {
    const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
    return `#${toHex(this.r)}${toHex(this.g)}${toHex(this.b)}`;
  }
}

// Create global pools
export const pointPool = new ObjectPool('point', () => new Point(), {
  initialSize: 100,
  maxSize: 1000
});

export const rectanglePool = new ObjectPool('rectangle', () => new Rectangle(), {
  initialSize: 50,
  maxSize: 500
});

export const pathPool = new ObjectPool('path', () => new Path2D(), {
  initialSize: 20,
  maxSize: 200
});

export const matrixPool = new ObjectPool('matrix', () => new Matrix2D(), {
  initialSize: 20,
  maxSize: 200
});

export const colorPool = new ObjectPool('color', () => new Color(), {
  initialSize: 50,
  maxSize: 500
});

// Utility functions
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

export function withPooledObjects<R>(
  fn: (pools: {
    point: () => Point;
    rectangle: () => Rectangle;
    path: () => Path2D;
    matrix: () => Matrix2D;
    color: () => Color;
    release: (obj: Poolable) => void;
  }) => R
): R {
  const acquired: Poolable[] = [];
  
  const pools = {
    point: () => {
      const p = pointPool.acquire();
      acquired.push(p);
      return p;
    },
    rectangle: () => {
      const r = rectanglePool.acquire();
      acquired.push(r);
      return r;
    },
    path: () => {
      const p = pathPool.acquire();
      acquired.push(p);
      return p;
    },
    matrix: () => {
      const m = matrixPool.acquire();
      acquired.push(m);
      return m;
    },
    color: () => {
      const c = colorPool.acquire();
      acquired.push(c);
      return c;
    },
    release: (obj: Poolable) => {
      const index = acquired.indexOf(obj);
      if (index >= 0) {
        acquired.splice(index, 1);
        if (obj instanceof Point) pointPool.release(obj);
        else if (obj instanceof Rectangle) rectanglePool.release(obj);
        else if (obj instanceof Path2D) pathPool.release(obj);
        else if (obj instanceof Matrix2D) matrixPool.release(obj);
        else if (obj instanceof Color) colorPool.release(obj);
      }
    }
  };

  try {
    return fn(pools);
  } finally {
    // Release all acquired objects
    acquired.forEach(obj => {
      if (obj instanceof Point) pointPool.release(obj);
      else if (obj instanceof Rectangle) rectanglePool.release(obj);
      else if (obj instanceof Path2D) pathPool.release(obj);
      else if (obj instanceof Matrix2D) matrixPool.release(obj);
      else if (obj instanceof Color) colorPool.release(obj);
    });
  }
}

// Pool manager for monitoring all pools
export class PoolManager {
  private static instance: PoolManager;
  private pools = new Map<string, ObjectPool<any>>();

  static getInstance(): PoolManager {
    if (!this.instance) {
      this.instance = new PoolManager();
    }
    return this.instance;
  }

  registerPool(name: string, pool: ObjectPool<any>): void {
    this.pools.set(name, pool);
  }

  getMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {};
    
    this.pools.forEach((pool, name) => {
      metrics[name] = pool.getMetrics();
    });

    return metrics;
  }

  releaseAll(): void {
    this.pools.forEach(pool => pool.releaseAll());
  }

  clearAll(): void {
    this.pools.forEach(pool => pool.clear());
  }
}

// Register default pools
const poolManager = PoolManager.getInstance();
poolManager.registerPool('point', pointPool);
poolManager.registerPool('rectangle', rectanglePool);
poolManager.registerPool('path', pathPool);
poolManager.registerPool('matrix', matrixPool);
poolManager.registerPool('color', colorPool);

export { poolManager };