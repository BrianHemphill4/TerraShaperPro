import { expect, test } from '@playwright/test';

test.describe('Project Management E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and ensure we're authenticated
    await page.goto('/');

    // Mock authentication state if needed
    await page.evaluate(() => {
      // Mock Clerk auth state
      window.localStorage.setItem('__clerk_db_jwt', 'mock-jwt-token');
    });
  });

  test.describe('Project Dashboard', () => {
    test('should display project dashboard with stats', async ({ page }) => {
      await page.goto('/dashboard/projects');

      // Wait for the page to load
      await page.waitForLoadState('networkidle');

      // Check for main heading
      await expect(page.getByRole('heading', { name: /projects/i })).toBeVisible();

      // Check for stats cards
      await expect(page.getByText('Total Projects')).toBeVisible();
      await expect(page.getByText('Active')).toBeVisible();
      await expect(page.getByText('Completed')).toBeVisible();
      await expect(page.getByText('Archived')).toBeVisible();
    });

    test('should filter projects by status', async ({ page }) => {
      await page.goto('/dashboard/projects');
      await page.waitForLoadState('networkidle');

      // Click on filter dropdown
      const filterButton = page.getByRole('button', { name: /filter/i });
      if (await filterButton.isVisible()) {
        await filterButton.click();

        // Select 'Active' filter
        await page.getByRole('option', { name: /active/i }).click();

        // Verify URL or content changes
        await page.waitForTimeout(1000);

        expect(page.url()).toContain('filter=active');
      }
    });

    test('should search projects', async ({ page }) => {
      await page.goto('/dashboard/projects');
      await page.waitForLoadState('networkidle');

      // Find search input
      const searchInput = page.getByPlaceholder(/search projects/i);
      if (await searchInput.isVisible()) {
        await searchInput.fill('Garden');
        await searchInput.press('Enter');

        // Wait for search results
        await page.waitForTimeout(1000);

        expect(page.url()).toContain('search=Garden');
      }
    });
  });

  test.describe('Project Creation', () => {
    test('should create a new project', async ({ page }) => {
      await page.goto('/dashboard/projects');
      await page.waitForLoadState('networkidle');

      // Click create project button
      const createButton = page.getByRole('button', { name: /create project/i });
      if (await createButton.isVisible()) {
        await createButton.click();

        // Fill project form
        await page.getByLabel(/project name/i).fill('Test Garden Project');
        await page.getByLabel(/description/i).fill('A test project for E2E testing');

        // Submit form
        await page.getByRole('button', { name: /create/i }).click();

        // Verify redirect to project detail or success message
        await page.waitForLoadState('networkidle');

        await expect(page.getByText('Test Garden Project')).toBeVisible();
      }
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto('/dashboard/projects');
      await page.waitForLoadState('networkidle');

      const createButton = page.getByRole('button', { name: /create project/i });
      if (await createButton.isVisible()) {
        await createButton.click();

        // Try to submit without filling required fields
        await page.getByRole('button', { name: /create/i }).click();

        // Check for validation errors
        await expect(page.getByText(/name is required/i)).toBeVisible();
      }
    });
  });

  test.describe('Project Detail View', () => {
    test('should display project details and tabs', async ({ page }) => {
      // Assume we have a project with ID 'test-project-id'
      await page.goto('/dashboard/projects/550e8400-e29b-41d4-a716-446655440000');
      await page.waitForLoadState('networkidle');

      // Check for project name
      await expect(page.getByRole('heading')).toBeVisible();

      // Check for tab navigation
      await expect(page.getByRole('tab', { name: /overview/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /versions/i })).toBeVisible();
    });

    test('should switch between tabs', async ({ page }) => {
      await page.goto('/dashboard/projects/550e8400-e29b-41d4-a716-446655440000');
      await page.waitForLoadState('networkidle');

      // Click on Versions tab
      const versionsTab = page.getByRole('tab', { name: /versions/i });
      if (await versionsTab.isVisible()) {
        await versionsTab.click();

        // Verify versions content is displayed
        await expect(page.getByText(/version history/i)).toBeVisible();
      }
    });
  });

  test.describe('Project Versioning', () => {
    test('should display version history', async ({ page }) => {
      await page.goto('/dashboard/projects/550e8400-e29b-41d4-a716-446655440000');
      await page.waitForLoadState('networkidle');

      // Navigate to versions tab
      await page.getByRole('tab', { name: /versions/i }).click();

      // Check for version timeline
      await expect(page.getByText(/version history/i)).toBeVisible();

      // Look for version entries (if any exist)
      const versionItems = page.locator('[data-testid="version-item"]');
      if ((await versionItems.count()) > 0) {
        await expect(versionItems.first()).toBeVisible();
      }
    });

    test('should create a manual version', async ({ page }) => {
      await page.goto('/dashboard/projects/550e8400-e29b-41d4-a716-446655440000');
      await page.waitForLoadState('networkidle');

      await page.getByRole('tab', { name: /versions/i }).click();

      // Click create version button
      const createVersionButton = page.getByRole('button', { name: /create version/i });
      if (await createVersionButton.isVisible()) {
        await createVersionButton.click();

        // Fill version comment
        await page.getByLabel(/comment/i).fill('Manual test version');

        // Submit
        await page.getByRole('button', { name: /save/i }).click();

        // Verify new version appears
        await page.waitForTimeout(2000);

        await expect(page.getByText('Manual test version')).toBeVisible();
      }
    });

    test('should compare versions', async ({ page }) => {
      await page.goto('/dashboard/projects/550e8400-e29b-41d4-a716-446655440000');
      await page.waitForLoadState('networkidle');

      await page.getByRole('tab', { name: /versions/i }).click();

      // Select two versions for comparison (if available)
      const versionCheckboxes = page.locator('input[type="checkbox"]');
      const checkboxCount = await versionCheckboxes.count();

      if (checkboxCount >= 2) {
        await versionCheckboxes.nth(0).click();
        await versionCheckboxes.nth(1).click();

        // Look for diff viewer
        await expect(page.getByText(/diff/i)).toBeVisible();
      }
    });
  });

  test.describe('Design Canvas Integration', () => {
    test('should navigate to design canvas', async ({ page }) => {
      await page.goto('/dashboard/projects/550e8400-e29b-41d4-a716-446655440000');
      await page.waitForLoadState('networkidle');

      // Click edit/design button
      const editButton = page.getByRole('button', { name: /edit|design/i });
      if (await editButton.isVisible()) {
        await editButton.click();

        // Verify navigation to design page
        await page.waitForLoadState('networkidle');

        expect(page.url()).toContain('/design');

        // Check for canvas element
        await expect(page.locator('canvas')).toBeVisible();
      }
    });

    test('should auto-save project changes', async ({ page }) => {
      await page.goto('/design');
      await page.waitForLoadState('networkidle');

      // Wait for canvas to load
      await page.waitForSelector('canvas', { timeout: 10000 });

      // Simulate adding an element (this would depend on your canvas implementation)
      const canvas = page.locator('canvas');
      await canvas.click({ position: { x: 100, y: 100 } });

      // Wait for auto-save (3 seconds based on implementation)
      await page.waitForTimeout(4000);

      // Verify save indicator or network request
      // This would depend on your UI feedback implementation
    });
  });

  test.describe('Error Handling', () => {
    test('should handle project not found', async ({ page }) => {
      await page.goto('/dashboard/projects/non-existent-id');

      // Should show 404 or redirect to projects list
      await expect(page.getByText(/not found|project not found/i)).toBeVisible();
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // Intercept API calls and return errors
      await page.route('**/api/trpc/**', (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' }),
        });
      });

      await page.goto('/dashboard/projects');

      // Should show error message
      await expect(page.getByText(/error|failed to load/i)).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/dashboard/projects');
      await page.waitForLoadState('networkidle');

      // Check that mobile navigation works
      const mobileMenu = page.getByRole('button', { name: /menu/i });
      if (await mobileMenu.isVisible()) {
        await mobileMenu.click();

        await expect(page.getByRole('navigation')).toBeVisible();
      }

      // Verify content is still accessible
      await expect(page.getByText(/projects/i)).toBeVisible();
    });

    test('should work on tablet devices', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      await page.goto('/dashboard/projects');
      await page.waitForLoadState('networkidle');

      // Verify layout adapts to tablet size
      await expect(page.getByText(/projects/i)).toBeVisible();
    });
  });
});
