import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  snapshotPathTemplate:
    '{testDir}/__snapshots__/{testFilePath}/{arg}-{projectName}-{platform}{ext}',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4321',
    trace: 'on-first-retry',
    ...({ reducedMotion: 'reduce' } as { reducedMotion: 'reduce' })
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
      animations: 'disabled',
      caret: 'hide'
    }
  },
  projects: [
    {
      name: 'mobile',
      testDir: './tests/visual',
      use: { viewport: { width: 375, height: 667 }, deviceScaleFactor: 2 }
    },
    {
      name: 'tablet',
      testDir: './tests/visual',
      use: { viewport: { width: 768, height: 1024 }, deviceScaleFactor: 2 }
    },
    {
      name: 'desktop',
      testDir: './tests/visual',
      use: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }
    },
    {
      name: 'desktop-light',
      testDir: './tests/visual',
      testMatch: [
        '**/routes.spec.ts',
        '**/playground-card.spec.ts',
        '**/handbook.spec.ts'
      ],
      use: {
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1
      }
    },
    {
      name: 'behavioural-desktop',
      testDir: './tests/behavioural',
      use: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }
    }
  ],
  webServer: {
    command: 'pnpm preview --host 127.0.0.1 --port 4321',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});

export { devices };
