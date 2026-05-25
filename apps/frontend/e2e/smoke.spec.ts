import { test, expect } from '@playwright/test';

test.describe('Museum smoke', () => {
  test('home page renders the museum entrance', async ({ page }) => {
    await page.goto('/');

    // Title appears
    await expect(page.getByRole('heading', { name: /My Museum of/i })).toBeVisible();

    // Entry door link reachable
    await expect(page.getByText(/Enter the museum/i)).toBeVisible();

    // Footer nav links present
    await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Explore Exhibits' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Museum Rooms' })).toBeVisible();
  });

  test('exhibits index is reachable', async ({ page }) => {
    await page.goto('/exhibits');
    await expect(page.getByRole('heading', { name: /The Archive/i })).toBeVisible();
    // Search input exists
    await expect(page.getByPlaceholder(/Search exhibits/i)).toBeVisible();
  });

  test('rooms gallery shows the eight themed rooms', async ({ page }) => {
    await page.goto('/rooms');
    await expect(page.getByRole('heading', { name: 'Museum Rooms' })).toBeVisible();
    // At least one of the well-known room names is visible
    await expect(page.getByText('Hall of Broken Dreams')).toBeVisible();
    await expect(page.getByText('Startup Cemetery')).toBeVisible();
  });

  test('about page describes the philosophy', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByRole('heading', { name: /About the Museum/i })).toBeVisible();
    await expect(page.getByText(/emotional honesty/i)).toBeVisible();
  });
});
