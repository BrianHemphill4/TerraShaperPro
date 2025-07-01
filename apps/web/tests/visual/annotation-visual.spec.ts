import { test, expect } from '@playwright/test';

test.describe('Annotation Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects/test-project/scenes/test-scene/annotate');
    await page.waitForSelector('canvas', { state: 'visible' });
    await page.waitForTimeout(1000); // Ensure canvas is fully rendered
  });

  test('canvas initial state', async ({ page }) => {
    await expect(page).toHaveScreenshot('annotation-canvas-initial.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('area tool active state', async ({ page }) => {
    await page.click('[data-testid="tool-area"]');
    await page.waitForTimeout(200);
    
    await expect(page).toHaveScreenshot('area-tool-active.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('area creation preview', async ({ page }) => {
    await page.click('[data-testid="tool-area"]');
    const canvas = page.locator('canvas');
    
    // Start drawing area
    await canvas.click({ position: { x: 100, y: 100 } });
    await canvas.click({ position: { x: 300, y: 100 } });
    await canvas.hover({ position: { x: 200, y: 250 } });
    
    await expect(page).toHaveScreenshot('area-creation-preview.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('completed area with material', async ({ page }) => {
    // Create area
    await page.click('[data-testid="tool-area"]');
    const canvas = page.locator('canvas');
    
    await canvas.click({ position: { x: 100, y: 100 } });
    await canvas.click({ position: { x: 300, y: 100 } });
    await canvas.click({ position: { x: 300, y: 300 } });
    await canvas.click({ position: { x: 100, y: 300 } });
    await page.keyboard.press('Enter');
    
    // Apply material
    await page.click('[data-testid="material-picker"]');
    await page.click('[data-testid="material-grass"]');
    
    await expect(page).toHaveScreenshot('area-with-grass-material.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('line tool with snap guides', async ({ page }) => {
    // Create reference area first
    await page.click('[data-testid="tool-area"]');
    const canvas = page.locator('canvas');
    
    await canvas.click({ position: { x: 200, y: 200 } });
    await canvas.click({ position: { x: 400, y: 200 } });
    await canvas.click({ position: { x: 400, y: 400 } });
    await canvas.click({ position: { x: 200, y: 400 } });
    await page.keyboard.press('Enter');
    
    // Switch to line tool
    await page.click('[data-testid="tool-line"]');
    
    // Hover near snap point
    await canvas.hover({ position: { x: 195, y: 195 } });
    
    await expect(page).toHaveScreenshot('line-tool-snap-guides.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('selection with multiple objects', async ({ page }) => {
    const canvas = page.locator('canvas');
    
    // Create multiple objects
    await page.click('[data-testid="tool-area"]');
    
    // First area
    await canvas.click({ position: { x: 100, y: 100 } });
    await canvas.click({ position: { x: 200, y: 100 } });
    await canvas.click({ position: { x: 150, y: 200 } });
    await page.keyboard.press('Enter');
    
    // Second area
    await canvas.click({ position: { x: 300, y: 100 } });
    await canvas.click({ position: { x: 400, y: 100 } });
    await canvas.click({ position: { x: 350, y: 200 } });
    await page.keyboard.press('Enter');
    
    // Select all
    await page.click('[data-testid="tool-select"]');
    await page.keyboard.press('Control+a');
    
    await expect(page).toHaveScreenshot('multiple-selection.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('rubber band selection', async ({ page }) => {
    const canvas = page.locator('canvas');
    
    // Create objects
    await page.click('[data-testid="tool-area"]');
    
    for (let i = 0; i < 3; i++) {
      await canvas.click({ position: { x: 100 + i * 150, y: 100 } });
      await canvas.click({ position: { x: 150 + i * 150, y: 100 } });
      await canvas.click({ position: { x: 125 + i * 150, y: 150 } });
      await page.keyboard.press('Enter');
    }
    
    // Rubber band selection
    await page.click('[data-testid="tool-select"]');
    await canvas.dragTo(canvas, {
      sourcePosition: { x: 50, y: 50 },
      targetPosition: { x: 300, y: 200 }
    });
    
    await expect(page).toHaveScreenshot('rubber-band-selection.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('material palette', async ({ page }) => {
    await page.click('[data-testid="material-picker"]');
    await page.waitForTimeout(300); // Wait for animation
    
    await expect(page.locator('[data-testid="material-palette"]')).toHaveScreenshot(
      'material-palette.png',
      { animations: 'disabled' }
    );
  });

  test('export dialog', async ({ page }) => {
    // Create some content
    await page.click('[data-testid="tool-area"]');
    const canvas = page.locator('canvas');
    
    await canvas.click({ position: { x: 100, y: 100 } });
    await canvas.click({ position: { x: 300, y: 100 } });
    await canvas.click({ position: { x: 200, y: 300 } });
    await page.keyboard.press('Enter');
    
    // Open export dialog
    await page.click('[data-testid="export-button"]');
    await page.waitForTimeout(300);
    
    await expect(page.locator('[data-testid="export-dialog"]')).toHaveScreenshot(
      'export-dialog.png',
      { animations: 'disabled' }
    );
  });

  test('measurement display', async ({ page }) => {
    // Enable measurements
    await page.click('[data-testid="measurement-toggle"]');
    
    // Create area with measurements
    await page.click('[data-testid="tool-area"]');
    const canvas = page.locator('canvas');
    
    await canvas.click({ position: { x: 100, y: 100 } });
    await canvas.click({ position: { x: 400, y: 100 } });
    await canvas.click({ position: { x: 400, y: 300 } });
    await canvas.click({ position: { x: 100, y: 300 } });
    await page.keyboard.press('Enter');
    
    await expect(page).toHaveScreenshot('area-with-measurements.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('dark mode', async ({ page }) => {
    // Toggle dark mode
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForTimeout(300); // Wait for theme transition
    
    // Create some content
    await page.click('[data-testid="tool-area"]');
    const canvas = page.locator('canvas');
    
    await canvas.click({ position: { x: 100, y: 100 } });
    await canvas.click({ position: { x: 300, y: 100 } });
    await canvas.click({ position: { x: 200, y: 300 } });
    await page.keyboard.press('Enter');
    
    await expect(page).toHaveScreenshot('annotation-dark-mode.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('annotation-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('annotation-tablet.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('high contrast mode', async ({ page }) => {
    // Enable high contrast
    await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' });
    
    // Create content
    await page.click('[data-testid="tool-area"]');
    const canvas = page.locator('canvas');
    
    await canvas.click({ position: { x: 100, y: 100 } });
    await canvas.click({ position: { x: 300, y: 100 } });
    await canvas.click({ position: { x: 200, y: 300 } });
    await page.keyboard.press('Enter');
    
    await expect(page).toHaveScreenshot('annotation-high-contrast.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('loading states', async ({ page }) => {
    // Mock slow loading
    await page.route('**/api/scenes/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });
    
    await page.goto('/projects/test-project/scenes/test-scene/annotate');
    
    await expect(page).toHaveScreenshot('annotation-loading.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('error states', async ({ page }) => {
    // Mock API error
    await page.route('**/api/scenes/*', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });
    
    await page.goto('/projects/test-project/scenes/test-scene/annotate');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('annotation-error.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('zoom levels', async ({ page }) => {
    // Create content
    await page.click('[data-testid="tool-area"]');
    const canvas = page.locator('canvas');
    
    await canvas.click({ position: { x: 200, y: 200 } });
    await canvas.click({ position: { x: 400, y: 200 } });
    await canvas.click({ position: { x: 300, y: 400 } });
    await page.keyboard.press('Enter');
    
    // Test different zoom levels
    const zoomLevels = [50, 100, 200];
    
    for (const zoom of zoomLevels) {
      await page.click('[data-testid="zoom-control"]');
      await page.fill('[data-testid="zoom-input"]', zoom.toString());
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);
      
      await expect(page).toHaveScreenshot(`annotation-zoom-${zoom}.png`, {
        fullPage: true,
        animations: 'disabled',
      });
    }
  });

  test('grid display', async ({ page }) => {
    // Enable grid
    await page.click('[data-testid="grid-toggle"]');
    await page.waitForTimeout(200);
    
    await expect(page).toHaveScreenshot('annotation-with-grid.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('keyboard focus indicators', async ({ page }) => {
    // Tab through interface
    await page.keyboard.press('Tab');
    await expect(page).toHaveScreenshot('focus-tool-button.png', {
      fullPage: true,
      animations: 'disabled',
    });
    
    await page.keyboard.press('Tab');
    await expect(page).toHaveScreenshot('focus-material-picker.png', {
      fullPage: true,
      animations: 'disabled',
    });
    
    await page.keyboard.press('Tab');
    await expect(page).toHaveScreenshot('focus-export-button.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});