import { test, expect, devices } from '@playwright/test';

// Test on multiple mobile devices
const mobileDevices = [
  { name: 'iPhone 12', device: devices['iPhone 12'] },
  { name: 'iPad Pro', device: devices['iPad Pro'] },
  { name: 'Pixel 5', device: devices['Pixel 5'] },
];

mobileDevices.forEach(({ name, device }) => {
  test.describe(`Mobile Interactions - ${name}`, () => {
    test.use(device);

    test.beforeEach(async ({ page }) => {
      await page.goto('/projects/test-project/scenes/test-scene/annotate');
      await page.waitForSelector('canvas', { state: 'visible' });
      await page.waitForTimeout(500);
    });

    test.describe('Touch Gestures', () => {
      test('handles single tap for tool activation', async ({ page }) => {
        // Tap area tool
        await page.tap('[data-testid="mobile-tool-area"]');
        await expect(page.locator('[data-testid="active-tool-indicator"]')).toHaveAttribute('data-tool', 'area');
        
        // Tap line tool
        await page.tap('[data-testid="mobile-tool-line"]');
        await expect(page.locator('[data-testid="active-tool-indicator"]')).toHaveAttribute('data-tool', 'line');
      });

      test('creates area with touch points', async ({ page }) => {
        await page.tap('[data-testid="mobile-tool-area"]');
        const canvas = page.locator('canvas');
        
        // Create triangle with taps
        await canvas.tap({ position: { x: 100, y: 200 } });
        await page.waitForTimeout(100);
        
        await canvas.tap({ position: { x: 200, y: 200 } });
        await page.waitForTimeout(100);
        
        await canvas.tap({ position: { x: 150, y: 300 } });
        await page.waitForTimeout(100);
        
        // Complete area
        await page.tap('[data-testid="mobile-complete-area"]');
        
        await expect(page.locator('[data-testid="object-count"]')).toContainText('1');
      });

      test('handles long press for context menu', async ({ page }) => {
        // Create an object first
        await page.tap('[data-testid="mobile-tool-area"]');
        const canvas = page.locator('canvas');
        
        await canvas.tap({ position: { x: 100, y: 200 } });
        await canvas.tap({ position: { x: 200, y: 200 } });
        await canvas.tap({ position: { x: 150, y: 300 } });
        await page.tap('[data-testid="mobile-complete-area"]');
        
        // Long press on object
        await canvas.dispatchEvent('touchstart', {
          touches: [{ clientX: 150, clientY: 250 }]
        });
        await page.waitForTimeout(800); // Long press duration
        await canvas.dispatchEvent('touchend');
        
        // Verify context menu
        await expect(page.locator('[data-testid="mobile-context-menu"]')).toBeVisible();
        await expect(page.locator('[data-testid="context-delete"]')).toBeVisible();
        await expect(page.locator('[data-testid="context-duplicate"]')).toBeVisible();
      });
    });

    test.describe('Multi-touch Gestures', () => {
      test('pinch to zoom', async ({ page }) => {
        const canvas = page.locator('canvas');
        const initialZoom = await page.locator('[data-testid="zoom-level"]').textContent();
        
        // Simulate pinch out (zoom in)
        await canvas.dispatchEvent('touchstart', {
          touches: [
            { identifier: 1, clientX: 150, clientY: 200 },
            { identifier: 2, clientX: 250, clientY: 300 }
          ]
        });
        
        await canvas.dispatchEvent('touchmove', {
          touches: [
            { identifier: 1, clientX: 100, clientY: 150 },
            { identifier: 2, clientX: 300, clientY: 350 }
          ]
        });
        
        await canvas.dispatchEvent('touchend', {
          touches: []
        });
        
        const newZoom = await page.locator('[data-testid="zoom-level"]').textContent();
        expect(parseFloat(newZoom || '100')).toBeGreaterThan(parseFloat(initialZoom || '100'));
      });

      test('two-finger pan', async ({ page }) => {
        const canvas = page.locator('canvas');
        
        // Get initial viewport position
        const initialViewport = await page.evaluate(() => {
          const viewport = document.querySelector('[data-testid="viewport-info"]');
          return viewport?.getAttribute('data-position');
        });
        
        // Simulate two-finger pan
        await canvas.dispatchEvent('touchstart', {
          touches: [
            { identifier: 1, clientX: 200, clientY: 200 },
            { identifier: 2, clientX: 300, clientY: 200 }
          ]
        });
        
        await canvas.dispatchEvent('touchmove', {
          touches: [
            { identifier: 1, clientX: 100, clientY: 200 },
            { identifier: 2, clientX: 200, clientY: 200 }
          ]
        });
        
        await canvas.dispatchEvent('touchend', {
          touches: []
        });
        
        const newViewport = await page.evaluate(() => {
          const viewport = document.querySelector('[data-testid="viewport-info"]');
          return viewport?.getAttribute('data-position');
        });
        
        expect(newViewport).not.toBe(initialViewport);
      });

      test('rotation gesture', async ({ page }) => {
        // Create an object
        await page.tap('[data-testid="mobile-tool-area"]');
        const canvas = page.locator('canvas');
        
        await canvas.tap({ position: { x: 150, y: 200 } });
        await canvas.tap({ position: { x: 250, y: 200 } });
        await canvas.tap({ position: { x: 200, y: 300 } });
        await page.tap('[data-testid="mobile-complete-area"]');
        
        // Select object
        await page.tap('[data-testid="mobile-tool-select"]');
        await canvas.tap({ position: { x: 200, y: 250 } });
        
        // Simulate rotation
        await canvas.dispatchEvent('touchstart', {
          touches: [
            { identifier: 1, clientX: 150, clientY: 200 },
            { identifier: 2, clientX: 250, clientY: 200 }
          ]
        });
        
        await canvas.dispatchEvent('touchmove', {
          touches: [
            { identifier: 1, clientX: 200, clientY: 150 },
            { identifier: 2, clientX: 200, clientY: 250 }
          ]
        });
        
        await canvas.dispatchEvent('touchend', {
          touches: []
        });
        
        // Verify rotation indicator
        await expect(page.locator('[data-testid="rotation-angle"]')).toBeVisible();
      });
    });

    test.describe('Mobile UI Adaptations', () => {
      test('shows mobile-optimized toolbar', async ({ page }) => {
        await expect(page.locator('[data-testid="mobile-toolbar"]')).toBeVisible();
        await expect(page.locator('[data-testid="desktop-toolbar"]')).not.toBeVisible();
        
        // Verify tool buttons are touch-friendly
        const toolButton = page.locator('[data-testid="mobile-tool-area"]');
        const box = await toolButton.boundingBox();
        expect(box?.width).toBeGreaterThanOrEqual(44); // Minimum touch target
        expect(box?.height).toBeGreaterThanOrEqual(44);
      });

      test('provides mobile-specific controls', async ({ page }) => {
        // Verify mobile-specific buttons
        await expect(page.locator('[data-testid="mobile-undo"]')).toBeVisible();
        await expect(page.locator('[data-testid="mobile-redo"]')).toBeVisible();
        await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
        
        // Open mobile menu
        await page.tap('[data-testid="mobile-menu"]');
        await expect(page.locator('[data-testid="mobile-menu-panel"]')).toBeVisible();
        
        // Verify menu options
        await expect(page.locator('[data-testid="mobile-save"]')).toBeVisible();
        await expect(page.locator('[data-testid="mobile-export"]')).toBeVisible();
        await expect(page.locator('[data-testid="mobile-settings"]')).toBeVisible();
      });

      test('adapts to orientation changes', async ({ page, context }) => {
        // Portrait orientation
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(300);
        
        await expect(page.locator('[data-testid="orientation-indicator"]')).toHaveAttribute('data-orientation', 'portrait');
        
        // Landscape orientation
        await page.setViewportSize({ width: 1024, height: 768 });
        await page.waitForTimeout(300);
        
        await expect(page.locator('[data-testid="orientation-indicator"]')).toHaveAttribute('data-orientation', 'landscape');
        
        // Verify UI adjustments
        await expect(page.locator('[data-testid="mobile-toolbar"]')).toHaveClass(/landscape-toolbar/);
      });
    });

    test.describe('Touch-specific Features', () => {
      test('shows touch indicators', async ({ page }) => {
        const canvas = page.locator('canvas');
        
        // Touch down
        await canvas.dispatchEvent('touchstart', {
          touches: [{ clientX: 200, clientY: 200 }]
        });
        
        // Verify touch indicator
        await expect(page.locator('[data-testid="touch-indicator"]')).toBeVisible();
        await expect(page.locator('[data-testid="touch-indicator"]')).toHaveCSS('left', '200px');
        await expect(page.locator('[data-testid="touch-indicator"]')).toHaveCSS('top', '200px');
        
        // Touch up
        await canvas.dispatchEvent('touchend', {
          touches: []
        });
        
        await expect(page.locator('[data-testid="touch-indicator"]')).not.toBeVisible();
      });

      test('provides haptic feedback', async ({ page }) => {
        // Mock vibration API
        await page.evaluate(() => {
          window.navigator.vibrate = vi.fn();
        });
        
        // Perform action that triggers haptic feedback
        await page.tap('[data-testid="mobile-tool-area"]');
        const canvas = page.locator('canvas');
        
        await canvas.tap({ position: { x: 100, y: 200 } });
        
        // Verify vibration was called
        const vibrateCallCount = await page.evaluate(() => {
          return (window.navigator.vibrate as any).mock?.calls?.length || 0;
        });
        
        expect(vibrateCallCount).toBeGreaterThan(0);
      });

      test('handles edge swipe gestures', async ({ page }) => {
        const canvas = page.locator('canvas');
        
        // Swipe from left edge (tools panel)
        await canvas.dispatchEvent('touchstart', {
          touches: [{ clientX: 0, clientY: 200 }]
        });
        
        await canvas.dispatchEvent('touchmove', {
          touches: [{ clientX: 100, clientY: 200 }]
        });
        
        await canvas.dispatchEvent('touchend', {
          touches: []
        });
        
        await expect(page.locator('[data-testid="mobile-tools-panel"]')).toBeVisible();
        
        // Swipe from right edge (properties panel)
        await canvas.dispatchEvent('touchstart', {
          touches: [{ clientX: device.viewport.width, clientY: 200 }]
        });
        
        await canvas.dispatchEvent('touchmove', {
          touches: [{ clientX: device.viewport.width - 100, clientY: 200 }]
        });
        
        await canvas.dispatchEvent('touchend', {
          touches: []
        });
        
        await expect(page.locator('[data-testid="mobile-properties-panel"]')).toBeVisible();
      });
    });

    test.describe('Mobile Performance', () => {
      test('optimizes for touch performance', async ({ page }) => {
        // Create multiple objects
        await page.tap('[data-testid="mobile-tool-area"]');
        const canvas = page.locator('canvas');
        
        for (let i = 0; i < 5; i++) {
          await canvas.tap({ position: { x: 100 + i * 50, y: 100 } });
          await canvas.tap({ position: { x: 150 + i * 50, y: 100 } });
          await canvas.tap({ position: { x: 125 + i * 50, y: 150 } });
          await page.tap('[data-testid="mobile-complete-area"]');
        }
        
        // Measure touch response time
        const startTime = Date.now();
        await canvas.tap({ position: { x: 200, y: 200 } });
        const responseTime = Date.now() - startTime;
        
        // Should respond within 100ms
        expect(responseTime).toBeLessThan(100);
      });

      test('uses simplified rendering on mobile', async ({ page }) => {
        // Check if mobile optimizations are active
        const renderMode = await page.evaluate(() => {
          return document.querySelector('canvas')?.getAttribute('data-render-mode');
        });
        
        expect(renderMode).toBe('mobile-optimized');
        
        // Verify reduced quality settings
        const quality = await page.evaluate(() => {
          const canvas = document.querySelector('canvas') as HTMLCanvasElement;
          return canvas?.getContext('2d')?.imageSmoothingQuality;
        });
        
        expect(quality).toBe('low');
      });
    });

    test.describe('Offline Support', () => {
      test('works offline with service worker', async ({ page, context }) => {
        // Create annotation while online
        await page.tap('[data-testid="mobile-tool-area"]');
        const canvas = page.locator('canvas');
        
        await canvas.tap({ position: { x: 100, y: 200 } });
        await canvas.tap({ position: { x: 200, y: 200 } });
        await canvas.tap({ position: { x: 150, y: 300 } });
        await page.tap('[data-testid="mobile-complete-area"]');
        
        // Go offline
        await context.setOffline(true);
        
        // Should still be able to create annotations
        await canvas.tap({ position: { x: 250, y: 200 } });
        await canvas.tap({ position: { x: 350, y: 200 } });
        await canvas.tap({ position: { x: 300, y: 300 } });
        await page.tap('[data-testid="mobile-complete-area"]');
        
        await expect(page.locator('[data-testid="object-count"]')).toContainText('2');
        
        // Verify offline indicator
        await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
        
        // Go back online
        await context.setOffline(false);
        
        // Verify sync indicator
        await expect(page.locator('[data-testid="sync-indicator"]')).toBeVisible();
      });
    });
  });
});