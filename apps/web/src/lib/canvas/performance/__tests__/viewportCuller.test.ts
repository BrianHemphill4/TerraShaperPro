import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ViewportCuller,
  createViewportCuller,
  CullingMetrics,
  type Cullable,
  type Viewport,
} from '../viewportCuller';
import { rectanglePool } from '../objectPool';

describe('ViewportCuller', () => {
  class TestObject implements Cullable {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    isVisible: boolean = false;

    constructor(id: string, x: number, y: number, width: number, height: number) {
      this.id = id;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }

    getBounds() {
      return {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
      };
    }
  }

  let culler: ViewportCuller;
  let viewport: Viewport;

  beforeEach(() => {
    viewport = {
      x: 0,
      y: 0,
      width: 800,
      height: 600,
      scale: 1,
    };
    culler = new ViewportCuller(viewport);
  });

  afterEach(() => {
    // Clean up pooled objects
    rectanglePool.releaseAll();
  });

  describe('Object Management', () => {
    it('adds objects to the culler', () => {
      const obj = new TestObject('obj1', 100, 100, 50, 50);
      culler.addObject(obj);

      expect(obj.isVisible).toBe(true); // Within viewport
      expect(culler.getVisibleObjects()).toContain(obj);
    });

    it('removes objects from the culler', () => {
      const obj = new TestObject('obj1', 100, 100, 50, 50);
      culler.addObject(obj);
      culler.removeObject(obj.id);

      expect(obj.isVisible).toBe(false);
      expect(culler.getVisibleObjects()).not.toContain(obj);
    });

    it('updates object position', () => {
      const obj = new TestObject('obj1', 100, 100, 50, 50);
      culler.addObject(obj);
      expect(obj.isVisible).toBe(true);

      // Move object out of viewport
      obj.x = 2000;
      obj.y = 2000;
      culler.updateObject(obj);

      expect(obj.isVisible).toBe(false);
      expect(culler.getVisibleObjects()).not.toContain(obj);
    });

    it('handles non-existent object removal gracefully', () => {
      expect(() => culler.removeObject('non-existent')).not.toThrow();
    });
  });

  describe('Viewport Culling', () => {
    it('culls objects outside viewport', () => {
      const visibleObj = new TestObject('visible', 400, 300, 50, 50);
      const culledObj = new TestObject('culled', 1000, 1000, 50, 50);

      culler.addObject(visibleObj);
      culler.addObject(culledObj);

      expect(visibleObj.isVisible).toBe(true);
      expect(culledObj.isVisible).toBe(false);
      expect(culler.getVisibleObjects()).toHaveLength(1);
      expect(culler.getVisibleObjects()[0]).toBe(visibleObj);
    });

    it('includes objects partially in viewport', () => {
      const partialObj = new TestObject('partial', 780, 580, 50, 50);
      culler.addObject(partialObj);

      expect(partialObj.isVisible).toBe(true);
    });

    it('respects cull padding', () => {
      const paddedCuller = new ViewportCuller(viewport, 100);
      const nearObj = new TestObject('near', 850, 650, 50, 50);
      
      paddedCuller.addObject(nearObj);
      expect(nearObj.isVisible).toBe(true); // Within padding area
    });

    it('updates visibility when viewport moves', () => {
      const obj1 = new TestObject('obj1', 100, 100, 50, 50);
      const obj2 = new TestObject('obj2', 900, 100, 50, 50);

      culler.addObject(obj1);
      culler.addObject(obj2);

      expect(obj1.isVisible).toBe(true);
      expect(obj2.isVisible).toBe(false);

      // Move viewport to the right
      culler.updateViewport({ x: 800 });

      expect(obj1.isVisible).toBe(false);
      expect(obj2.isVisible).toBe(true);
    });

    it('handles viewport scaling', () => {
      const obj = new TestObject('obj', 600, 450, 50, 50);
      culler.addObject(obj);
      expect(obj.isVisible).toBe(true);

      // Zoom in (scale up) - viewport shows less area
      culler.updateViewport({ scale: 2 });
      expect(obj.isVisible).toBe(false); // Now outside scaled viewport
    });

    it('performs bulk culling correctly', () => {
      const objects = [];
      for (let i = 0; i < 100; i++) {
        const obj = new TestObject(
          `obj${i}`,
          (i % 10) * 100,
          Math.floor(i / 10) * 100,
          50,
          50
        );
        objects.push(obj);
        culler.addObject(obj);
      }

      culler.performCulling();

      const visible = objects.filter(obj => obj.isVisible);
      const expectedVisible = objects.filter(obj => 
        obj.x < 800 && obj.y < 600
      );

      expect(visible.length).toBe(expectedVisible.length);
    });
  });

  describe('Statistics', () => {
    it('provides visibility statistics', () => {
      for (let i = 0; i < 10; i++) {
        const obj = new TestObject(
          `obj${i}`,
          i * 100,
          i * 100,
          50,
          50
        );
        culler.addObject(obj);
      }

      const stats = culler.getVisibilityStats();
      expect(stats.total).toBe(10);
      expect(stats.visible).toBeGreaterThan(0);
      expect(stats.culled).toBe(stats.total - stats.visible);
    });

    it('clears all objects and stats', () => {
      const obj1 = new TestObject('obj1', 100, 100, 50, 50);
      const obj2 = new TestObject('obj2', 200, 200, 50, 50);

      culler.addObject(obj1);
      culler.addObject(obj2);
      culler.clear();

      const stats = culler.getVisibilityStats();
      expect(stats.total).toBe(0);
      expect(stats.visible).toBe(0);
      expect(culler.getVisibleObjects()).toHaveLength(0);
    });
  });

  describe('Spatial Index', () => {
    it('efficiently queries objects in large scenes', () => {
      // Add many objects in a grid pattern
      for (let x = 0; x < 50; x++) {
        for (let y = 0; y < 50; y++) {
          const obj = new TestObject(
            `obj_${x}_${y}`,
            x * 100,
            y * 100,
            50,
            50
          );
          culler.addObject(obj);
        }
      }

      // Move viewport to a specific area
      culler.updateViewport({ x: 2000, y: 2000 });

      const visible = culler.getVisibleObjects();
      // Should only see objects in the 20-28 x 20-28 range approximately
      expect(visible.length).toBeLessThan(100);
      expect(visible.length).toBeGreaterThan(0);
    });

    it('handles objects spanning multiple grid cells', () => {
      const largeObj = new TestObject('large', 50, 50, 200, 200);
      culler.addObject(largeObj);

      expect(largeObj.isVisible).toBe(true);

      // Move it partially out of view
      largeObj.x = 700;
      culler.updateObject(largeObj);

      expect(largeObj.isVisible).toBe(true); // Still partially visible
    });
  });

  describe('createViewportCuller factory', () => {
    it('creates culler with default options', () => {
      const culler = createViewportCuller(viewport);
      expect(culler).toBeInstanceOf(ViewportCuller);
    });

    it('creates culler with custom padding', () => {
      const culler = createViewportCuller(viewport, { cullPadding: 200 });
      
      const farObj = new TestObject('far', 900, 700, 50, 50);
      culler.addObject(farObj);
      
      expect(farObj.isVisible).toBe(true); // Within extended padding
    });
  });

  describe('CullingMetrics', () => {
    let metrics: CullingMetrics;

    beforeEach(() => {
      metrics = new CullingMetrics();
    });

    it('records culling times', () => {
      metrics.recordCullTime(5);
      metrics.recordCullTime(10);
      metrics.recordCullTime(7);

      const stats = metrics.getMetrics();
      expect(stats.avgCullTime).toBeCloseTo(7.33, 1);
      expect(stats.maxCullTime).toBe(10);
    });

    it('calculates culling FPS', async () => {
      // Record some culling operations
      for (let i = 0; i < 10; i++) {
        metrics.recordCullTime(5);
      }

      // Wait a bit to have meaningful elapsed time
      await new Promise(resolve => setTimeout(resolve, 100));

      const stats = metrics.getMetrics();
      expect(stats.cullingFPS).toBeGreaterThan(0);
      expect(stats.cullingFPS).toBeLessThan(200); // Should be reasonable
    });

    it('handles empty metrics', () => {
      const stats = metrics.getMetrics();
      expect(stats.avgCullTime).toBe(0);
      expect(stats.maxCullTime).toBe(0);
      expect(stats.cullingFPS).toBe(0);
    });

    it('resets metrics', () => {
      metrics.recordCullTime(10);
      metrics.recordCullTime(20);
      
      metrics.reset();
      
      const stats = metrics.getMetrics();
      expect(stats.avgCullTime).toBe(0);
      expect(stats.maxCullTime).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles zero-sized viewport', () => {
      const zeroViewport: Viewport = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        scale: 1,
      };
      
      const culler = new ViewportCuller(zeroViewport);
      const obj = new TestObject('obj', 0, 0, 50, 50);
      culler.addObject(obj);
      
      // Object might still be visible due to padding
      expect(() => culler.performCulling()).not.toThrow();
    });

    it('handles very large scale values', () => {
      culler.updateViewport({ scale: 1000 });
      
      const obj = new TestObject('obj', 1, 1, 10, 10);
      culler.addObject(obj);
      
      // With huge scale, viewport shows very small area
      expect(obj.isVisible).toBe(true);
    });

    it('handles negative viewport positions', () => {
      culler.updateViewport({ x: -500, y: -500 });
      
      const obj = new TestObject('obj', -400, -400, 50, 50);
      culler.addObject(obj);
      
      expect(obj.isVisible).toBe(true);
    });
  });
});