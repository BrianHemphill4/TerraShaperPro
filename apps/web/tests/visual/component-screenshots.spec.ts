import { expect,test } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport for screenshots
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Mock auth state
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.setItem('__clerk_db_jwt', 'mock-jwt-token');
    });
  });

  test.describe('Dashboard Components', () => {
    test('project dashboard layout', async ({ page }) => {
      await page.goto('/dashboard/projects');
      await page.waitForLoadState('domcontentloaded');
      
      // Hide dynamic content (dates, counts) for consistent screenshots
      await page.addStyleTag({
        content: `
          [data-testid="dynamic-date"],
          [data-testid="project-count"],
          .relative-time {
            visibility: hidden !important;
          }
        `
      });
      
      await expect(page).toHaveScreenshot('project-dashboard.png');
    });

    test('project stats cards', async ({ page }) => {
      await page.goto('/dashboard/projects');
      await page.waitForLoadState('domcontentloaded');
      
      const statsSection = page.locator('[data-testid="project-stats"]');
      if (await statsSection.isVisible()) {
        await expect(statsSection).toHaveScreenshot('project-stats-cards.png');
      }
    });

    test('project list empty state', async ({ page }) => {
      // Mock empty projects response
      await page.route('**/api/trpc/project.list*', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            result: {
              data: {
                projects: [],
                total: 0,
                hasMore: false
              }
            }
          })
        });
      });
      
      await page.goto('/dashboard/projects');
      await page.waitForLoadState('domcontentloaded');
      
      const emptyState = page.locator('[data-testid="empty-projects"]');
      if (await emptyState.isVisible()) {
        await expect(emptyState).toHaveScreenshot('projects-empty-state.png');
      }
    });
  });

  test.describe('Design Canvas Components', () => {
    test('design canvas initial state', async ({ page }) => {
      await page.goto('/design');
      await page.waitForLoadState('domcontentloaded');
      
      // Wait for canvas to initialize
      await page.waitForSelector('canvas', { timeout: 5000 });
      
      const canvasContainer = page.locator('[data-testid="canvas-container"]');
      if (await canvasContainer.isVisible()) {
        await expect(canvasContainer).toHaveScreenshot('design-canvas-initial.png');
      }
    });

    test('tool palette', async ({ page }) => {
      await page.goto('/design');
      await page.waitForLoadState('domcontentloaded');
      
      const toolPalette = page.locator('[data-testid="tool-palette"]');
      if (await toolPalette.isVisible()) {
        await expect(toolPalette).toHaveScreenshot('tool-palette.png');
      }
    });

    test('property panel', async ({ page }) => {
      await page.goto('/design');
      await page.waitForLoadState('domcontentloaded');
      
      const propertyPanel = page.locator('[data-testid="property-panel"]');
      if (await propertyPanel.isVisible()) {
        await expect(propertyPanel).toHaveScreenshot('property-panel.png');
      }
    });

    test('layer panel', async ({ page }) => {
      await page.goto('/design');
      await page.waitForLoadState('domcontentloaded');
      
      const layerPanel = page.locator('[data-testid="layer-panel"]');
      if (await layerPanel.isVisible()) {
        await expect(layerPanel).toHaveScreenshot('layer-panel.png');
      }
    });
  });

  test.describe('Plant Library Components', () => {
    test('plant grid layout', async ({ page }) => {
      await page.goto('/plants');
      await page.waitForLoadState('domcontentloaded');
      
      const plantGrid = page.locator('[data-testid="plant-grid"]');
      if (await plantGrid.isVisible()) {
        await expect(plantGrid).toHaveScreenshot('plant-grid.png');
      }
    });

    test('plant filters', async ({ page }) => {
      await page.goto('/plants');
      await page.waitForLoadState('domcontentloaded');
      
      const plantFilters = page.locator('[data-testid="plant-filters"]');
      if (await plantFilters.isVisible()) {
        await expect(plantFilters).toHaveScreenshot('plant-filters.png');
      }
    });

    test('plant card hover state', async ({ page }) => {
      await page.goto('/plants');
      await page.waitForLoadState('domcontentloaded');
      
      const firstPlantCard = page.locator('[data-testid="plant-card"]').first();
      if (await firstPlantCard.isVisible()) {
        await firstPlantCard.hover();

        await expect(firstPlantCard).toHaveScreenshot('plant-card-hover.png');
      }
    });
  });

  test.describe('Billing Components', () => {
    test('billing overview dashboard', async ({ page }) => {
      await page.goto('/billing');
      await page.waitForLoadState('domcontentloaded');
      
      // Hide dynamic values for consistent screenshots
      await page.addStyleTag({
        content: `
          [data-testid="usage-value"],
          [data-testid="billing-amount"],
          [data-testid="next-billing-date"] {
            visibility: hidden !important;
          }
        `
      });
      
      await expect(page).toHaveScreenshot('billing-overview.png');
    });

    test('usage analytics chart', async ({ page }) => {
      await page.goto('/billing');
      await page.waitForLoadState('domcontentloaded');
      
      // Navigate to usage tab
      await page.getByRole('tab', { name: /usage/i }).click();
      
      const usageChart = page.locator('[data-testid="usage-chart"]');
      if (await usageChart.isVisible()) {
        await expect(usageChart).toHaveScreenshot('usage-analytics-chart.png');
      }
    });

    test('subscription management', async ({ page }) => {
      await page.goto('/billing');
      await page.waitForLoadState('domcontentloaded');
      
      await page.getByRole('tab', { name: /subscription/i }).click();
      
      const subscriptionPanel = page.locator('[data-testid="subscription-panel"]');
      if (await subscriptionPanel.isVisible()) {
        await expect(subscriptionPanel).toHaveScreenshot('subscription-management.png');
      }
    });
  });

  test.describe('Project Versioning Components', () => {
    test('version timeline', async ({ page }) => {
      await page.goto('/dashboard/projects/550e8400-e29b-41d4-a716-446655440000');
      await page.waitForLoadState('domcontentloaded');
      
      await page.getByRole('tab', { name: /versions/i }).click();
      
      const versionTimeline = page.locator('[data-testid="version-timeline"]');
      if (await versionTimeline.isVisible()) {
        await expect(versionTimeline).toHaveScreenshot('version-timeline.png');
      }
    });

    test('version diff viewer', async ({ page }) => {
      await page.goto('/dashboard/projects/550e8400-e29b-41d4-a716-446655440000');
      await page.waitForLoadState('domcontentloaded');
      
      await page.getByRole('tab', { name: /versions/i }).click();
      
      // Select two versions if available
      const versionCheckboxes = page.locator('input[type="checkbox"]');
      const checkboxCount = await versionCheckboxes.count();
      
      if (checkboxCount >= 2) {
        await versionCheckboxes.nth(0).click();
        await versionCheckboxes.nth(1).click();
        
        const diffViewer = page.locator('[data-testid="diff-viewer"]');
        if (await diffViewer.isVisible()) {
          await expect(diffViewer).toHaveScreenshot('version-diff-viewer.png');
        }
      }
    });
  });

  test.describe('Responsive Layouts', () => {
    test('mobile project dashboard', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/dashboard/projects');
      await page.waitForLoadState('domcontentloaded');
      
      await expect(page).toHaveScreenshot('mobile-project-dashboard.png');
    });

    test('tablet design canvas', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await page.goto('/design');
      await page.waitForLoadState('domcontentloaded');
      
      await page.waitForSelector('canvas', { timeout: 5000 });
      
      await expect(page).toHaveScreenshot('tablet-design-canvas.png');
    });

    test('mobile plant library', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/plants');
      await page.waitForLoadState('domcontentloaded');
      
      await expect(page).toHaveScreenshot('mobile-plant-library.png');
    });
  });

  test.describe('Dark Mode', () => {
    test.beforeEach(async ({ page }) => {
      // Enable dark mode
      await page.emulateMedia({ colorScheme: 'dark' });
    });

    test('dark mode project dashboard', async ({ page }) => {
      await page.goto('/dashboard/projects');
      await page.waitForLoadState('domcontentloaded');
      
      await expect(page).toHaveScreenshot('dark-project-dashboard.png');
    });

    test('dark mode design canvas', async ({ page }) => {
      await page.goto('/design');
      await page.waitForLoadState('domcontentloaded');
      
      await page.waitForSelector('canvas', { timeout: 5000 });
      
      await expect(page).toHaveScreenshot('dark-design-canvas.png');
    });

    test('dark mode billing dashboard', async ({ page }) => {
      await page.goto('/billing');
      await page.waitForLoadState('domcontentloaded');
      
      await expect(page).toHaveScreenshot('dark-billing-dashboard.png');
    });
  });

  test.describe('Loading States', () => {
    test('project dashboard loading', async ({ page }) => {
      // Intercept API and delay response
      await page.route('**/api/trpc/project.list*', route => {
        setTimeout(() => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              result: { data: { projects: [], total: 0, hasMore: false } }
            })
          });
        }, 2000);
      });
      
      await page.goto('/dashboard/projects');
      
      // Capture loading state
      const loadingState = page.locator('[data-testid="loading-skeleton"]');
      if (await loadingState.isVisible()) {
        await expect(loadingState).toHaveScreenshot('project-dashboard-loading.png');
      }
    });

    test('canvas loading state', async ({ page }) => {
      await page.goto('/design');
      
      // Capture initial loading state before canvas initializes
      const canvasLoading = page.locator('[data-testid="canvas-loading"]');
      if (await canvasLoading.isVisible()) {
        await expect(canvasLoading).toHaveScreenshot('canvas-loading.png');
      }
    });
  });
}); 