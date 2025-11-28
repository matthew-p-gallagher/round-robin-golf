import { defineConfig, devices } from '@playwright/test';

/**
 * E2E Test Configuration for Round Robin Golf
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e/specs',

  // Maximum time one test can run
  timeout: 30 * 1000,

  // Test execution settings
  fullyParallel: false, // Run tests sequentially to avoid Supabase conflicts
  forbidOnly: !!process.env.CI, // Fail on .only() in CI
  retries: process.env.CI ? 2 : 1, // Retry failed tests
  workers: 1, // Single worker to avoid database conflicts

  // Reporter configuration
  reporter: [
    ['html'],
    ['list']
  ],

  // Shared settings for all tests
  use: {
    // Base URL for the app
    baseURL: 'http://localhost:5173',

    // Collect trace on first retry for debugging
    trace: 'on-first-retry',

    // Screenshots on failure (automatically saved)
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Mobile viewport - iPhone size
    viewport: { width: 375, height: 667 },

    // User agent to emulate iPhone
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',

    // Touch support
    hasTouch: true,
    isMobile: true,
  },

  // Test projects - we only need one for mobile
  projects: [
    {
      name: 'Mobile Chrome',
      use: {
        // Force Chromium browser
        browserName: 'chromium',
      },
    },
  ],

  // Run dev server before tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
