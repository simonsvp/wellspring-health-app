import { test, expect } from '@playwright/test';

test.describe('Herbs and tea guide', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/herbs.html');
    await page.evaluate(() => localStorage.removeItem('wellspring-herb-favorites'));
    await page.reload();
  });

  test('searches by flavor and shows the safety details', async ({ page }) => {
    await page.locator('#herb-search').fill('floral');
    await expect(page.locator('#herb-count')).toHaveText('1');
    await expect(page.getByRole('heading', { name: 'Chamomile' })).toBeVisible();
    await page.getByText('Preparation and safety').click();
    await expect(page.getByText(/Avoid if you have an allergy to ragweed/)).toBeVisible();
  });

  test('persists favorites and filters the tea shelf', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Chamomile to favorites' }).click();
    await page.reload();
    await page.locator('#favorites-only').check();
    await expect(page.locator('#herb-count')).toHaveText('1');
    await expect(page.getByRole('heading', { name: 'Chamomile' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Peppermint' })).toBeHidden();
  });

  test('shows the educational safety notice', async ({ page }) => {
    await expect(page.getByText('Safety first - this guide is educational, not medical advice.')).toBeVisible();
  });
});
