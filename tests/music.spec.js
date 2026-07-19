import { test, expect } from '@playwright/test';

test.describe('Healthy sound library', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/music.html');
  });

  test('filters sounds by category', async ({ page }) => {
    await page.getByRole('button', { name: 'Nature', exact: true }).click();
    await expect(page.locator('.audio-card')).toHaveCount(2);
    await expect(page.getByRole('heading', { name: 'Forest concentration' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ocean breathing' })).toBeVisible();
  });

  test('opens, pauses, resumes, and closes the player', async ({ page }) => {
    await page.getByRole('button', { name: 'Play Forest concentration' }).click();
    await expect(page.locator('#player')).toBeVisible();
    await expect(page.locator('#player-title')).toHaveText('Forest concentration');
    await page.locator('#player-toggle').click();
    await expect(page.locator('#player-toggle')).toHaveAttribute('aria-label', 'Resume current sound');
    await page.locator('#player-toggle').click();
    await expect(page.locator('#player-toggle')).toHaveAttribute('aria-label', 'Pause current sound');
    await page.locator('#player-close').click();
    await expect(page.locator('#player')).toBeHidden();
  });
});
