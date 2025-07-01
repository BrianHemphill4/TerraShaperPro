import { test, expect, Page } from '@playwright/test';

test.describe('Annotation Workflow E2E Tests', () => {
  let page: Page;

  test.beforeEach(async ({ page: p }) => {
    page = p;
    // Navigate to the annotation page
    await page.goto('/projects/test-project/scenes/test-scene/annotate');
    
    // Wait for canvas to be ready
    await page.waitForSelector('canvas', { state: 'visible' });
    await page.waitForTimeout(500); // Allow canvas initialization
  });

  test.describe('Complete Annotation Workflow', () => {
    test('creates area, adds material, and exports', async () => {
      // Select area tool
      await page.click('[data-testid="tool-area"]');
      
      // Draw a triangular area
      const canvas = await page.locator('canvas');
      await canvas.click({ position: { x: 100, y: 100 } });
      await canvas.click({ position: { x: 200, y: 100 } });
      await canvas.click({ position: { x: 150, y: 200 } });
      
      // Close the area
      await page.keyboard.press('Enter');
      
      // Verify area was created
      await expect(page.locator('[data-testid="object-count"]')).toContainText('1');
      
      // Select material
      await page.click('[data-testid="material-picker"]');
      await page.click('[data-testid="material-grass"]');
      
      // Export annotation
      await page.click('[data-testid="export-button"]');
      await page.click('[data-testid="export-json"]');
      
      // Verify export dialog
      await expect(page.locator('[data-testid="export-preview"]')).toBeVisible();
    });

    test('creates multiple annotations and groups them', async () => {
      // Create first area
      await page.click('[data-testid="tool-area"]');
      const canvas = await page.locator('canvas');
      
      await canvas.click({ position: { x: 50, y: 50 } });
      await canvas.click({ position: { x: 150, y: 50 } });
      await canvas.click({ position: { x: 150, y: 150 } });
      await canvas.click({ position: { x: 50, y: 150 } });
      await page.keyboard.press('Enter');
      
      // Create second area
      await canvas.click({ position: { x: 200, y: 50 } });
      await canvas.click({ position: { x: 300, y: 50 } });
      await canvas.click({ position: { x: 300, y: 150 } });
      await canvas.click({ position: { x: 200, y: 150 } });
      await page.keyboard.press('Enter');
      
      // Switch to selection tool
      await page.click('[data-testid="tool-select"]');
      
      // Select all
      await page.keyboard.press('Control+a');
      
      // Group objects
      await page.keyboard.press('Control+g');
      
      // Verify grouping
      await expect(page.locator('[data-testid="object-count"]')).toContainText('1 group');
    });
  });

  test.describe('Tool Interactions', () => {
    test('switches between tools seamlessly', async () => {
      // Area tool
      await page.click('[data-testid="tool-area"]');
      await expect(page.locator('[data-testid="tool-status"]')).toContainText('Area Tool Active');
      
      // Line tool
      await page.click('[data-testid="tool-line"]');
      await expect(page.locator('[data-testid="tool-status"]')).toContainText('Line Tool Active');
      
      // Selection tool
      await page.click('[data-testid="tool-select"]');
      await expect(page.locator('[data-testid="tool-status"]')).toContainText('Selection Tool Active');
    });

    test('uses keyboard shortcuts', async () => {
      // Create an object
      await page.click('[data-testid="tool-area"]');
      const canvas = await page.locator('canvas');
      
      await canvas.click({ position: { x: 100, y: 100 } });
      await canvas.click({ position: { x: 200, y: 100 } });
      await canvas.click({ position: { x: 150, y: 200 } });
      await page.keyboard.press('Enter');
      
      // Select with 'v' shortcut
      await page.keyboard.press('v');
      await expect(page.locator('[data-testid="tool-status"]')).toContainText('Selection Tool Active');
      
      // Delete with Del key
      await canvas.click({ position: { x: 150, y: 150 } }); // Click on object
      await page.keyboard.press('Delete');
      
      // Verify deletion
      await expect(page.locator('[data-testid="object-count"]')).toContainText('0');
    });
  });

  test.describe('Undo/Redo Functionality', () => {
    test('undoes and redoes actions', async () => {
      // Create an area
      await page.click('[data-testid="tool-area"]');
      const canvas = await page.locator('canvas');
      
      await canvas.click({ position: { x: 100, y: 100 } });
      await canvas.click({ position: { x: 200, y: 100 } });
      await canvas.click({ position: { x: 150, y: 200 } });
      await page.keyboard.press('Enter');
      
      // Verify creation
      await expect(page.locator('[data-testid="object-count"]')).toContainText('1');
      
      // Undo
      await page.keyboard.press('Control+z');
      await expect(page.locator('[data-testid="object-count"]')).toContainText('0');
      
      // Redo
      await page.keyboard.press('Control+Shift+z');
      await expect(page.locator('[data-testid="object-count"]')).toContainText('1');
    });

    test('maintains undo history across tool switches', async () => {
      // Create with area tool
      await page.click('[data-testid="tool-area"]');
      const canvas = await page.locator('canvas');
      
      await canvas.click({ position: { x: 100, y: 100 } });
      await canvas.click({ position: { x: 200, y: 100 } });
      await canvas.click({ position: { x: 150, y: 200 } });
      await page.keyboard.press('Enter');
      
      // Switch to line tool and create
      await page.click('[data-testid="tool-line"]');
      await canvas.click({ position: { x: 50, y: 250 } });
      await canvas.click({ position: { x: 250, y: 250 } });
      
      // Verify both objects exist
      await expect(page.locator('[data-testid="object-count"]')).toContainText('2');
      
      // Undo twice
      await page.keyboard.press('Control+z');
      await page.keyboard.press('Control+z');
      
      // Verify both undone
      await expect(page.locator('[data-testid="object-count"]')).toContainText('0');
    });
  });

  test.describe('Copy/Paste Operations', () => {
    test('copies and pastes objects', async () => {
      // Create an area
      await page.click('[data-testid="tool-area"]');
      const canvas = await page.locator('canvas');
      
      await canvas.click({ position: { x: 100, y: 100 } });
      await canvas.click({ position: { x: 200, y: 100 } });
      await canvas.click({ position: { x: 150, y: 200 } });
      await page.keyboard.press('Enter');
      
      // Select and copy
      await page.click('[data-testid="tool-select"]');
      await canvas.click({ position: { x: 150, y: 150 } });
      await page.keyboard.press('Control+c');
      
      // Paste
      await page.keyboard.press('Control+v');
      
      // Verify duplication
      await expect(page.locator('[data-testid="object-count"]')).toContainText('2');
    });

    test('cuts and pastes objects', async () => {
      // Create two areas
      await page.click('[data-testid="tool-area"]');
      const canvas = await page.locator('canvas');
      
      // First area
      await canvas.click({ position: { x: 50, y: 50 } });
      await canvas.click({ position: { x: 100, y: 50 } });
      await canvas.click({ position: { x: 75, y: 100 } });
      await page.keyboard.press('Enter');
      
      // Second area
      await canvas.click({ position: { x: 150, y: 50 } });
      await canvas.click({ position: { x: 200, y: 50 } });
      await canvas.click({ position: { x: 175, y: 100 } });
      await page.keyboard.press('Enter');
      
      // Select first and cut
      await page.click('[data-testid="tool-select"]');
      await canvas.click({ position: { x: 75, y: 75 } });
      await page.keyboard.press('Control+x');
      
      // Verify cut
      await expect(page.locator('[data-testid="object-count"]')).toContainText('1');
      
      // Paste
      await page.keyboard.press('Control+v');
      
      // Verify paste
      await expect(page.locator('[data-testid="object-count"]')).toContainText('2');
    });
  });

  test.describe('Material Management', () => {
    test('applies materials to objects', async () => {
      // Create an area
      await page.click('[data-testid="tool-area"]');
      const canvas = await page.locator('canvas');
      
      await canvas.click({ position: { x: 100, y: 100 } });
      await canvas.click({ position: { x: 200, y: 100 } });
      await canvas.click({ position: { x: 150, y: 200 } });
      await page.keyboard.press('Enter');
      
      // Open material picker
      await page.click('[data-testid="material-picker"]');
      
      // Select different materials
      await page.click('[data-testid="material-stone"]');
      await expect(page.locator('[data-testid="selected-material"]')).toContainText('Stone');
      
      await page.click('[data-testid="material-water"]');
      await expect(page.locator('[data-testid="selected-material"]')).toContainText('Water');
    });

    test('creates custom material', async () => {
      // Open material picker
      await page.click('[data-testid="material-picker"]');
      
      // Create new material
      await page.click('[data-testid="add-material"]');
      await page.fill('[data-testid="material-name"]', 'Custom Path');
      await page.fill('[data-testid="material-color"]', '#8B4513');
      await page.click('[data-testid="save-material"]');
      
      // Verify creation
      await expect(page.locator('[data-testid="material-custom-path"]')).toBeVisible();
    });
  });

  test.describe('Export Functionality', () => {
    test('exports to different formats', async () => {
      // Create some annotations
      await page.click('[data-testid="tool-area"]');
      const canvas = await page.locator('canvas');
      
      await canvas.click({ position: { x: 100, y: 100 } });
      await canvas.click({ position: { x: 200, y: 100 } });
      await canvas.click({ position: { x: 150, y: 200 } });
      await page.keyboard.press('Enter');
      
      // Test JSON export
      await page.click('[data-testid="export-button"]');
      await page.click('[data-testid="export-json"]');
      await expect(page.locator('[data-testid="export-preview"]')).toContainText('"type": "polygon"');
      await page.click('[data-testid="close-export"]');
      
      // Test SVG export
      await page.click('[data-testid="export-button"]');
      await page.click('[data-testid="export-svg"]');
      await expect(page.locator('[data-testid="export-preview"]')).toContainText('<svg');
      await page.click('[data-testid="close-export"]');
      
      // Test PNG export
      await page.click('[data-testid="export-button"]');
      await page.click('[data-testid="export-png"]');
      await expect(page.locator('[data-testid="download-button"]')).toBeVisible();
    });
  });

  test.describe('Measurement Tools', () => {
    test('creates and displays measurements', async () => {
      // Enable measurement mode
      await page.click('[data-testid="measurement-toggle"]');
      
      // Create distance measurement
      await page.click('[data-testid="measure-distance"]');
      const canvas = await page.locator('canvas');
      
      await canvas.click({ position: { x: 100, y: 100 } });
      await canvas.click({ position: { x: 300, y: 100 } });
      
      // Verify measurement display
      await expect(page.locator('[data-testid="measurement-value"]')).toBeVisible();
      await expect(page.locator('[data-testid="measurement-value"]')).toContainText('ft');
      
      // Change units
      await page.click('[data-testid="unit-selector"]');
      await page.click('[data-testid="unit-meters"]');
      await expect(page.locator('[data-testid="measurement-value"]')).toContainText('m');
    });
  });

  test.describe('Mobile Interaction', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test('handles touch interactions', async () => {
      // Verify mobile UI
      await expect(page.locator('[data-testid="mobile-toolbar"]')).toBeVisible();
      
      // Touch to create area
      await page.click('[data-testid="tool-area"]');
      const canvas = await page.locator('canvas');
      
      await canvas.tap({ position: { x: 100, y: 100 } });
      await canvas.tap({ position: { x: 200, y: 100 } });
      await canvas.tap({ position: { x: 150, y: 200 } });
      
      // Complete with mobile button
      await page.click('[data-testid="complete-area"]');
      
      // Verify creation
      await expect(page.locator('[data-testid="object-count"]')).toContainText('1');
    });

    test('uses gesture controls', async () => {
      // Create an object
      await page.click('[data-testid="tool-area"]');
      const canvas = await page.locator('canvas');
      
      await canvas.tap({ position: { x: 100, y: 100 } });
      await canvas.tap({ position: { x: 200, y: 100 } });
      await canvas.tap({ position: { x: 150, y: 200 } });
      await page.click('[data-testid="complete-area"]');
      
      // Test pinch zoom
      await canvas.dispatchEvent('touchstart', {
        touches: [
          { clientX: 100, clientY: 100 },
          { clientX: 200, clientY: 200 }
        ]
      });
      
      await canvas.dispatchEvent('touchmove', {
        touches: [
          { clientX: 50, clientY: 50 },
          { clientX: 250, clientY: 250 }
        ]
      });
      
      await canvas.dispatchEvent('touchend');
      
      // Verify zoom indicator
      await expect(page.locator('[data-testid="zoom-level"]')).not.toContainText('100%');
    });
  });

  test.describe('Collaboration Features', () => {
    test('saves and syncs annotations', async () => {
      // Create annotation
      await page.click('[data-testid="tool-area"]');
      const canvas = await page.locator('canvas');
      
      await canvas.click({ position: { x: 100, y: 100 } });
      await canvas.click({ position: { x: 200, y: 100 } });
      await canvas.click({ position: { x: 150, y: 200 } });
      await page.keyboard.press('Enter');
      
      // Save
      await page.click('[data-testid="save-button"]');
      await expect(page.locator('[data-testid="save-status"]')).toContainText('Saved');
      
      // Reload page
      await page.reload();
      await page.waitForSelector('canvas', { state: 'visible' });
      
      // Verify annotation persists
      await expect(page.locator('[data-testid="object-count"]')).toContainText('1');
    });
  });
});