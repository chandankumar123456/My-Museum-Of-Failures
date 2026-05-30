import { test, expect } from '@playwright/test';

test.describe('Museum smoke', () => {
  test('home page renders the archive hero', async ({ page }) => {
    await page.goto('/');

    // Hero headline
    await expect(
      page.getByRole('heading', { name: /A museum of what/i }),
    ).toBeVisible();

    // Primary CTA + manifesto link
    await expect(page.getByText(/Enter the archive/i)).toBeVisible();
    await expect(page.getByText(/Read the manifesto/i)).toBeVisible();
  });

  test('exhibits index is reachable', async ({ page }) => {
    await page.goto('/exhibits');
    await expect(
      page.getByRole('heading', { name: /Preserved failures/i }),
    ).toBeVisible();
    await expect(
      page.getByPlaceholder(/A phrase from a confession/i),
    ).toBeVisible();
  });

  test('rooms gallery shows the eight themed rooms', async ({ page }) => {
    await page.goto('/rooms');
    await expect(
      page.getByRole('heading', { name: /Eight rooms, one archive/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Hall of Broken Dreams' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Startup Cemetery' }),
    ).toBeVisible();
  });

  test('about page describes the philosophy', async ({ page }) => {
    await page.goto('/about');
    await expect(
      page.getByRole('heading', { name: /emotional honesty/i }),
    ).toBeVisible();
  });
});
