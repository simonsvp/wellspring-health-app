import { test, expect } from '@playwright/test';

test.describe('Activity catalogue', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/activities.html');
    await page.evaluate(() => localStorage.removeItem('wellspring-activity_logs'));
    await page.reload();
  });

  test('searches and filters activities', async ({ page }) => {
    await page.locator('#activity-search').fill('desk');
    await expect(page.locator('#activity-count')).toHaveText('1');
    await expect(page.getByRole('heading', { name: 'Desk reset' })).toBeVisible();
    await page.locator('#activity-search').fill('');
    await page.getByRole('button', { name: 'Cardio' }).click();
    await expect(page.locator('#activity-count')).toHaveText('2');
    await expect(page.getByRole('heading', { name: 'Brisk outdoor walk' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Cycle adventure' })).toBeVisible();
  });

  test('records an activity once per day', async ({ page }) => {
    const card = page.getByRole('heading', { name: 'Desk reset' }).locator('..');
    await card.getByRole('button', { name: 'Mark complete' }).click();
    await expect(page.locator('#goal-minutes')).toHaveText('5');
    await expect(page.getByRole('heading', { name: 'Desk reset' }).locator('..').getByRole('button')).toBeDisabled();
  });

  test('shows an empty state for unmatched search', async ({ page }) => {
    await page.locator('#activity-search').fill('not-a-real-activity');
    await expect(page.getByRole('heading', { name: 'No activities found' })).toBeVisible();
  });
});
