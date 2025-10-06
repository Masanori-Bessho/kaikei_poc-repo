// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3001',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on all tests */
    video: 'on',
    
    /* Disable strict mode for locators */
    strictMode: false,
    
    /* Additional locator options */
    locator: {
      strictMode: false,
    },
    
    /* Global test options */
    testOptions: {
      strictMode: false,
    },
    
    /* Visual regression testing settings */
    expect: {
      /* Disable strict mode for locators */
      strictMode: false,
      /* Threshold for pixel differences in visual comparisons */
      threshold: 0.3,
      /* Maximum number of different pixels */
      maxDiffPixels: 1000,
      /* Maximum percentage of different pixels */
      maxDiffPixelRatio: 0.2,
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        strictMode: false,
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: process.platform === 'win32' ? 'node_modules\\.bin\\http-server . -p 3001' : 'npx http-server . -p 3001',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});

