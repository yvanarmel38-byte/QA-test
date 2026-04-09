import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from the project root
dotenv.config({ path: path.resolve(__dirname, '.env') });

const BASE_URL = process.env.BASE_URL ?? 'https://qa-assessment.pages.dev';

export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if test.only is left in source */
  forbidOnly: !!process.env.CI,
  /* Retry once on CI; no retries locally */
  retries: process.env.CI ? 1 : 0,
  /* Limit workers on CI to avoid flakiness */
  workers: process.env.CI ? 2 : undefined,

  /* Reporters: always HTML; Allure when running in CI or when ALLURE=1 */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright', { outputFolder: 'allure-results', suiteTitle: false }],
    ['list'],
    ['json', { outputFile: 'test-results/pw-results.json' }],
  ],

  use: {
    baseURL: BASE_URL,
    /* Capture screenshot on failure */
    screenshot: 'only-on-failure',
    /* Capture video on first retry */
    video: 'on-first-retry',
    /* Capture trace on first retry for debugging */
    trace: 'on-first-retry',
    /* Global timeout for each action */
    actionTimeout: 10_000,
    /* Navigation timeout */
    navigationTimeout: 30_000,
  },

  /* Timeout per test */
  timeout: 60_000,
  /* Timeout for expect assertions */
  expect: { timeout: 10_000 },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /* Output folder for test artifacts */
  outputDir: 'test-results/',
});
