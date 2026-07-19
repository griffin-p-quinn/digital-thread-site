import { defineConfig } from '@playwright/test';

const port = Number(process.env.PORTFOLIO_TEST_PORT || 4173);
const host = process.env.PORTFOLIO_TEST_HOST || '127.0.0.1';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 7_500 },
  reporter: [
    ['line'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],
  outputDir: 'test-results',
  use: {
    baseURL: `http://${host}:${port}`,
    channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL || 'chrome',
    viewport: { width: 1366, height: 768 },
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: {
    command: `npm run dev -- --host ${host} --port ${port} --strictPort`,
    url: `http://${host}:${port}/projects.html`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000
  }
});
