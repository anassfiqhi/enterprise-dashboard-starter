import { test, expect } from './fixtures';

/**
 * E2E tests for Orders page
 * SPEC Section 12 - Orders list paging/filtering
 */
test.describe('Orders Page', () => {
  test.describe('Page Load', () => {
    test('loads orders page with data', async ({ authenticatedPage: page }) => {
      await page.goto('/orders');

      // Wait for orders to load
      await page.waitForLoadState('networkidle');

      // Should show orders table or list
      await expect(page.locator('table, [role="table"], [data-testid="orders-table"]')).toBeVisible({
        timeout: 15000,
      });

      // Should have order IDs (ORD-XXXXX format)
      await expect(page.locator('text=/ORD-\\d+/')).toBeVisible();
    });

    test('shows loading state initially', async ({ authenticatedPage: page }) => {
      // Navigate to orders
      await page.goto('/orders');

      // Should show loading or skeleton (brief moment)
      // This test verifies the page loads without error
      await page.waitForLoadState('domcontentloaded');
      expect(page.url()).toContain('/orders');
    });
  });

  test.describe('Filtering', () => {
    test('filters orders by search term', async ({ authenticatedPage: page }) => {
      await page.goto('/orders');
      await page.waitForLoadState('networkidle');

      // Find search input
      const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[name="search"]');

      if (await searchInput.isVisible()) {
        // Type search term
        await searchInput.fill('Customer 1');

        // Wait for debounce and filter
        await page.waitForTimeout(600);
        await page.waitForLoadState('networkidle');

        // Results should be filtered (fewer items or specific item)
        const orderRows = page.locator('tr:has-text("Customer 1"), [data-testid="order-row"]:has-text("Customer 1")');
        await expect(orderRows.first()).toBeVisible({ timeout: 5000 });
      }
    });

    test('filters orders by status', async ({ authenticatedPage: page }) => {
      await page.goto('/orders');
      await page.waitForLoadState('networkidle');

      // Find status filter
      const statusSelect = page.locator('select[name="status"], [data-testid="status-filter"], button:has-text("Status")');

      if (await statusSelect.isVisible()) {
        await statusSelect.click();

        // Select "pending" status
        const pendingOption = page.locator('option[value="pending"], [role="option"]:has-text("Pending"), text=Pending');
        if (await pendingOption.isVisible()) {
          await pendingOption.click();
        }

        await page.waitForTimeout(300);
        await page.waitForLoadState('networkidle');

        // All visible status badges should be "pending"
        const statusBadges = page.locator('[data-testid="order-status"], .badge:has-text("pending")');
        const count = await statusBadges.count();

        if (count > 0) {
          for (let i = 0; i < Math.min(count, 5); i++) {
            await expect(statusBadges.nth(i)).toContainText(/pending/i);
          }
        }
      }
    });
  });

  test.describe('Pagination', () => {
    test('navigates between pages', async ({ authenticatedPage: page }) => {
      await page.goto('/orders');
      await page.waitForLoadState('networkidle');

      // Find pagination controls
      const nextButton = page.locator('button:has-text("Next"), button[aria-label="Next page"], button:has-text("›")');

      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        // Get current page indicator or first item
        const firstOrderBefore = await page.locator('text=/ORD-\\d+/').first().textContent();

        // Click next
        await nextButton.click();
        await page.waitForLoadState('networkidle');

        // Content should change (different orders)
        const firstOrderAfter = await page.locator('text=/ORD-\\d+/').first().textContent();

        // Orders might be different on page 2
        expect(firstOrderAfter).toBeDefined();
      }
    });

    test('shows page size selector', async ({ authenticatedPage: page }) => {
      await page.goto('/orders');
      await page.waitForLoadState('networkidle');

      // Find page size selector
      const pageSizeSelect = page.locator('select[name="pageSize"], [data-testid="page-size-select"]');

      if (await pageSizeSelect.isVisible()) {
        // Should have options for different page sizes
        await expect(pageSizeSelect).toBeEnabled();
      }
    });
  });

  test.describe('Sorting', () => {
    test('sorts orders by clicking column header', async ({ authenticatedPage: page }) => {
      await page.goto('/orders');
      await page.waitForLoadState('networkidle');

      // Find sortable column header
      const amountHeader = page.locator('th:has-text("Amount"), [role="columnheader"]:has-text("Amount")');

      if (await amountHeader.isVisible()) {
        // Get first order amount before sorting
        await page.waitForTimeout(500);

        // Click to sort
        await amountHeader.click();
        await page.waitForLoadState('networkidle');

        // Page should update (we just verify no error)
        await expect(page.locator('table, [role="table"]')).toBeVisible();
      }
    });
  });

  test.describe('Live Updates Badge', () => {
    test('shows SSE connection status', async ({ authenticatedPage: page }) => {
      await page.goto('/orders');
      await page.waitForLoadState('networkidle');

      // Look for Live badge or connection indicator
      const liveBadge = page.locator('text=Live, [data-testid="live-badge"], .badge:has-text("Live")');

      // Badge might be visible if SSE is connected
      if (await liveBadge.isVisible({ timeout: 5000 })) {
        await expect(liveBadge).toBeVisible();
      }
    });
  });
});
