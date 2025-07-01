import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ObjectPool,
  Point,
  Rectangle,
  Transform,
  pointPool,
  rectanglePool,
  transformPool,
  withPooledObject,
  PoolMonitor,
  type Poolable,
} from '../objectPool';

describe('ObjectPool', () => {
  class TestObject implements Poolable {
    value: number = 0;
    inUse: boolean = false;

    reset(): void {
      this.value = 0;
    }
  }

  describe('Pool Management', () => {
    it('creates pool with initial size', () => {
      const pool = new ObjectPool(() => new TestObject(), 5, 10);
      expect(pool.size).toBe(5);
      expect(pool.activeCount).toBe(0);
    });

    it('acquires objects from pool', () => {
      const pool = new ObjectPool(() => new TestObject(), 3, 10);
      
      const obj1 = pool.acquire();
      expect(obj1).toBeInstanceOf(TestObject);
      expect(obj1.inUse).toBe(true);
      expect(pool.size).toBe(2);
      expect(pool.activeCount).toBe(1);

      const obj2 = pool.acquire();
      expect(pool.size).toBe(1);
      expect(pool.activeCount).toBe(2);
    });

    it('creates new objects when pool is empty', () => {
      const createFn = vi.fn(() => new TestObject());
      const pool = new ObjectPool(createFn, 1, 10);
      
      pool.acquire(); // Takes from pool
      expect(createFn).toHaveBeenCalledTimes(1); // Initial creation

      pool.acquire(); // Pool empty, creates new
      expect(createFn).toHaveBeenCalledTimes(2);
    });

    it('releases objects back to pool', () => {
      const pool = new ObjectPool(() => new TestObject(), 0, 10);
      
      const obj = pool.acquire();
      obj.value = 42;
      
      pool.release(obj);
      expect(obj.inUse).toBe(false);
      expect(obj.value).toBe(0); // Reset called
      expect(pool.size).toBe(1);
      expect(pool.activeCount).toBe(0);
    });

    it('applies custom reset function', () => {
      const customReset = vi.fn((obj: TestObject) => {
        obj.value = -1;
      });
      
      const pool = new ObjectPool(
        () => new TestObject(),
        0,
        10,
        customReset
      );
      
      const obj = pool.acquire();
      obj.value = 42;
      
      pool.release(obj);
      expect(customReset).toHaveBeenCalledWith(obj);
      expect(obj.value).toBe(-1);
    });

    it('respects max pool size', () => {
      const pool = new ObjectPool(() => new TestObject(), 0, 2);
      
      const obj1 = pool.acquire();
      const obj2 = pool.acquire();
      const obj3 = pool.acquire();
      
      pool.release(obj1);
      pool.release(obj2);
      pool.release(obj3); // Should not be added to pool
      
      expect(pool.size).toBe(2); // Max size
    });

    it('warns when releasing object not from pool', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation();
      const pool = new ObjectPool(() => new TestObject(), 0, 10);
      
      const externalObj = new TestObject();
      pool.release(externalObj);
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Attempting to release object not from this pool'
      );
      expect(pool.size).toBe(0);
    });

    it('releases all active objects', () => {
      const pool = new ObjectPool(() => new TestObject(), 0, 10);
      
      const obj1 = pool.acquire();
      const obj2 = pool.acquire();
      const obj3 = pool.acquire();
      
      obj1.value = 1;
      obj2.value = 2;
      obj3.value = 3;
      
      pool.releaseAll();
      
      expect(pool.activeCount).toBe(0);
      expect(pool.size).toBe(3);
      expect(obj1.value).toBe(0);
      expect(obj2.value).toBe(0);
      expect(obj3.value).toBe(0);
      expect(obj1.inUse).toBe(false);
      expect(obj2.inUse).toBe(false);
      expect(obj3.inUse).toBe(false);
    });

    it('clears pool completely', () => {
      const pool = new ObjectPool(() => new TestObject(), 5, 10);
      
      const obj = pool.acquire();
      pool.clear();
      
      expect(pool.size).toBe(0);
      expect(pool.activeCount).toBe(0);
    });
  });

  describe('Point Pool', () => {
    it('manages Point objects', () => {
      const point = new Point();
      
      expect(point.x).toBe(0);
      expect(point.y).toBe(0);
      expect(point.inUse).toBe(false);
      
      point.set(10, 20);
      expect(point.x).toBe(10);
      expect(point.y).toBe(20);
      
      point.reset();
      expect(point.x).toBe(0);
      expect(point.y).toBe(0);
    });

    it('chains set method', () => {
      const point = new Point();
      const result = point.set(5, 10);
      expect(result).toBe(point);
    });

    it('uses global point pool', () => {
      const point = pointPool.acquire();
      expect(point).toBeInstanceOf(Point);
      
      point.set(100, 200);
      pointPool.release(point);
      
      expect(point.x).toBe(0);
      expect(point.y).toBe(0);
    });
  });

  describe('Rectangle Pool', () => {
    it('manages Rectangle objects', () => {
      const rect = new Rectangle();
      
      rect.set(10, 20, 100, 200);
      expect(rect.x).toBe(10);
      expect(rect.y).toBe(20);
      expect(rect.width).toBe(100);
      expect(rect.height).toBe(200);
      
      rect.reset();
      expect(rect.x).toBe(0);
      expect(rect.y).toBe(0);
      expect(rect.width).toBe(0);
      expect(rect.height).toBe(0);
    });

    it('detects rectangle intersection', () => {
      const rect1 = new Rectangle().set(0, 0, 100, 100);
      const rect2 = new Rectangle().set(50, 50, 100, 100);
      const rect3 = new Rectangle().set(200, 200, 100, 100);
      
      expect(rect1.intersects(rect2)).toBe(true);
      expect(rect1.intersects(rect3)).toBe(false);
      expect(rect2.intersects(rect3)).toBe(false);
    });

    it('detects point containment', () => {
      const rect = new Rectangle().set(10, 10, 100, 100);
      
      expect(rect.contains(50, 50)).toBe(true);
      expect(rect.contains(10, 10)).toBe(true);
      expect(rect.contains(110, 110)).toBe(true);
      expect(rect.contains(111, 111)).toBe(false);
      expect(rect.contains(5, 50)).toBe(false);
    });

    it('uses global rectangle pool', () => {
      const rect = rectanglePool.acquire();
      expect(rect).toBeInstanceOf(Rectangle);
      
      rect.set(0, 0, 50, 50);
      rectanglePool.release(rect);
      
      expect(rect.width).toBe(0);
      expect(rect.height).toBe(0);
    });
  });

  describe('Transform Pool', () => {
    it('manages Transform objects', () => {
      const transform = new Transform();
      
      // Identity transform by default
      expect(transform.a).toBe(1);
      expect(transform.b).toBe(0);
      expect(transform.c).toBe(0);
      expect(transform.d).toBe(1);
      expect(transform.e).toBe(0);
      expect(transform.f).toBe(0);
      
      transform.set(2, 0, 0, 2, 10, 20);
      expect(transform.a).toBe(2);
      expect(transform.d).toBe(2);
      expect(transform.e).toBe(10);
      expect(transform.f).toBe(20);
      
      transform.reset();
      expect(transform.a).toBe(1);
      expect(transform.d).toBe(1);
      expect(transform.e).toBe(0);
      expect(transform.f).toBe(0);
    });

    it('transforms points correctly', () => {
      const transform = new Transform().set(2, 0, 0, 2, 10, 20);
      const result = transform.transformPoint(5, 5);
      
      expect(result.x).toBe(20); // 2 * 5 + 10
      expect(result.y).toBe(30); // 2 * 5 + 20
    });

    it('multiplies transforms', () => {
      const t1 = new Transform().set(2, 0, 0, 2, 0, 0); // Scale 2x
      const t2 = new Transform().set(1, 0, 0, 1, 10, 20); // Translate
      
      t1.multiply(t2);
      
      // Result should be scale then translate
      expect(t1.a).toBe(2);
      expect(t1.d).toBe(2);
      expect(t1.e).toBe(20); // Scaled translation
      expect(t1.f).toBe(40);
    });

    it('uses global transform pool', () => {
      const transform = transformPool.acquire();
      expect(transform).toBeInstanceOf(Transform);
      
      transform.set(3, 0, 0, 3, 5, 10);
      transformPool.release(transform);
      
      expect(transform.a).toBe(1);
      expect(transform.d).toBe(1);
    });
  });

  describe('withPooledObject utility', () => {
    it('acquires and releases automatically', () => {
      const pool = new ObjectPool(() => new TestObject(), 1, 10);
      
      const result = withPooledObject(pool, (obj) => {
        obj.value = 42;
        return obj.value * 2;
      });
      
      expect(result).toBe(84);
      expect(pool.size).toBe(1); // Object returned to pool
      expect(pool.activeCount).toBe(0);
    });

    it('releases even on error', () => {
      const pool = new ObjectPool(() => new TestObject(), 1, 10);
      
      expect(() => {
        withPooledObject(pool, (obj) => {
          throw new Error('Test error');
        });
      }).toThrow('Test error');
      
      expect(pool.size).toBe(1); // Object still returned to pool
      expect(pool.activeCount).toBe(0);
    });
  });

  describe('PoolMonitor', () => {
    let monitor: PoolMonitor;

    beforeEach(() => {
      monitor = new PoolMonitor();
    });

    it('tracks pool hits and misses', () => {
      monitor.recordHit('testPool');
      monitor.recordHit('testPool');
      monitor.recordMiss('testPool');
      
      monitor.recordHit('otherPool');
      
      const stats = monitor.getStats();
      
      expect(stats.testPool).toEqual({
        hitRate: 2/3,
        totalRequests: 3
      });
      
      expect(stats.otherPool).toEqual({
        hitRate: 1,
        totalRequests: 1
      });
    });

    it('handles empty stats', () => {
      const stats = monitor.getStats();
      expect(stats).toEqual({});
    });

    it('calculates zero hit rate', () => {
      monitor.recordMiss('testPool');
      monitor.recordMiss('testPool');
      
      const stats = monitor.getStats();
      expect(stats.testPool.hitRate).toBe(0);
      expect(stats.testPool.totalRequests).toBe(2);
    });

    it('resets statistics', () => {
      monitor.recordHit('testPool');
      monitor.recordMiss('testPool');
      
      monitor.reset();
      
      const stats = monitor.getStats();
      expect(stats).toEqual({});
    });
  });
});