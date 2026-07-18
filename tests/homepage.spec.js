import { test, expect } from '@playwright/test';

test.describe('Homepage smoke tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows the main wellness dashboard', async ({ page }) => {
    await expect(page).toHaveTitle(/WellSpring/);
    await expect(page.getByRole('heading', { name: /Feel clearer/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Good morning' })).toBeVisible();
    await expect(page.getByText('Daily balance')).toBeVisible();
    await expect(page.getByText('72%')).toBeVisible();
  });

  test('opens the focus page from the primary action', async ({ page }) => {
    await page.getByRole('link', { name: 'Start focus' }).click();
    await expect(page).toHaveURL(/focus\.html/);
    await expect(page.getByRole('heading', { name: /Make room for one thing/ })).toBeVisible();
  });

  test('offers all four wellness paths', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Improve focus' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Healthy music' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Move actively' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Herbs & tea' })).toBeVisible();
  });
});
