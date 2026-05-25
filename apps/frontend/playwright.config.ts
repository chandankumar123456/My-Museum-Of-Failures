import { defineConfig, devices } from '@playwright/test';

/**
 * Smoke-level E2E for the Museum frontend.
 *
 * Run with: pnpm --filter @museum/frontend e2e
 *
 * Browsers must be installed first: `pnpm exec playwright install --with-deps`.
 * CI installs them in the workflow; locally on first run you'll see a
 * helpful prompt from Playwright if they're missing.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: process.env.CI
    ? undefined
    : {
        command: 'pnpm dev',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 60_000,
      },
});
