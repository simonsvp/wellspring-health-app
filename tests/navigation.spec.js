import { test, expect } from '@playwright/test';

const pages = [
  ['Focus', 'focus.html', /focus\.html/],
  ['Music', 'music.html', /music\.html/],
  ['Move', 'activities.html', /activities\.html/],
  ['Herbs', 'herbs.html', /herbs\.html/],
  ['Journal', 'journal.html', /journal\.html/]
];

test.describe('Navigation smoke tests', () => {
  for (const [label, href, url] of pages) {
    test(`opens the ${label} page`, async ({ page, isMobile }) => {
      await page.goto('/');
      if (isMobile) {
        await page.getByRole('button', { name: 'Open navigation menu' }).click();
      }
      await page.locator(`nav .nav-link[href="${href}"]`).click();
      await expect(page).toHaveURL(url);
    });
  }

  test('mobile menu opens and identifies the active page', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'This check applies to the mobile project.');
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Open navigation menu' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByText('Explore WellSpring')).toBeVisible();
    await expect(page.locator('nav .nav-link[href="index.html"]')).toHaveClass(/active/);
  });
});
