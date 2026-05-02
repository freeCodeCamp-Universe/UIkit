import { defineConfig, devices } from '@playwright/test';

/**
 * Tests run against built Astro output via `astro preview` so output matches production.
 * Run `pnpm build` before `pnpm test:visual`.
 *
 * - `./tests/visual/`      — pixel goldens; four projects (mobile, tablet, desktop, desktop-light).
 * - `./tests/behavioural/` — interaction contracts for stateful primitives; desktop-only project.
 *
 * Goldens: `tests/visual/__snapshots__/` per spec + viewport. Refresh via `pnpm test:visual:update`.
 */
export default defineConfig({
  testDir: './tests',
  // Goldens diverge pixel-for-pixel between macOS Chromium and Linux
  // Chromium even at the same version. Encode `{platform}` so both
  // sets coexist; CI Ubuntu compares against `*-linux.png`, local
  // macOS dev against `*-darwin.png`.
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
    // Top-level use option preferred for stability with focus + animation
    // tests; the @playwright/test 1.59 type re-export omits `reducedMotion`,
    // hence the explicit pass-through cast.
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
    // Light-palette parity: re-runs routes/playground-card/handbook specs with
    // `light-palette` class on `<html>` injected before user code.
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
    // Behavioural tier — desktop viewport only; touch-specific specs are out of scope for v1.0 GA.
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
