import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  // Next.js standard title or specific app title
  await expect(page).toHaveTitle(/Back Stage/);
});

test('login link works', async ({ page }) => {
  await page.goto('/');
  // Find a link that says 'Login'
  const loginLink = page.getByRole('link', { name: /login/i }).first();
  if (await loginLink.isVisible()) {
    await loginLink.click();
    await expect(page).toHaveURL(/.*login/);
  }
});
