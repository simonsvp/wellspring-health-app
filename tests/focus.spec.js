import { test, expect } from '@playwright/test';

test.describe('Focus timer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/focus.html');
  });

  test('changes presets and resets the timer', async ({ page }) => {
    await page.getByRole('button', { name: '5 min reset' }).click();
    await expect(page.locator('#timer')).toHaveText('05:00');
    await page.locator('#start').click();
    await expect(page.locator('#start')).toContainText('Pause');
    await expect(page.locator('#status-pill')).toContainText('In progress');
    await page.locator('#reset').click();
    await expect(page.locator('#timer')).toHaveText('05:00');
    await expect(page.locator('#status-pill')).toContainText('Ready');
  });

  test('saves and restores the focus intention', async ({ page }) => {
    const intention = 'Review the Day 2 feature tests';
    await page.locator('#focus-note').fill(intention);
    await expect(page.locator('#current-intent')).toHaveText(intention);
    await expect(page.locator('#intent-count')).toHaveText(String(intention.length));
    await page.reload();
    await expect(page.locator('#focus-note')).toHaveValue(intention);
  });

  test('spacebar starts and pauses when the intention field is not active', async ({ page }) => {
    await page.locator('body').press('Space');
    await expect(page.locator('#start')).toContainText('Pause');
    await page.locator('body').press('Space');
    await expect(page.locator('#start')).toContainText('Resume');
  });
});
