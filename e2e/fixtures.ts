import { test as base, expect, Page } from '@playwright/test';

/**
 * Custom test fixtures for E2E tests
 */

// Test user credentials (must match seeded data)
export const TEST_USERS = {
  admin: {
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
  },
};

/**
 * Login helper function
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // Fill login form
  await page.fill('input[type="email"], input[name="email"]', email);
  await page.fill('input[type="password"], input[name="password"]', password);

  // Click sign in button
  await page.click('button[type="submit"]:has-text("Sign"), button:has-text("Sign In")');

  // Wait for redirect to dashboard
  await page.waitForURL('/', { timeout: 10000 });
}

/**
 * Extended test with authenticated page fixture
 */
export const test = base.extend<{
  authenticatedPage: Page;
}>({
  authenticatedPage: async ({ page }, use) => {
    // Login before test
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);

    // Verify we're on the dashboard
    await expect(page).toHaveURL('/');

    await use(page);
  },
});

export { expect };
