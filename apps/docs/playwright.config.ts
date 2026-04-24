import { defineConfig, devices } from '@playwright/test';

/**
 * Visual-regression harness for the docs site.
 *
 * Strategy: serve the **built** Astro output via `astro preview` so the
 * test target matches production output (no HMR script injection, no dev
 * overlays). CI builds once, then runs this suite against the preview
 * server; local runs expect a pre-built `dist/` — if you're iterating,
 * run `pnpm build` before `pnpm test:visual`.
 *
 * Goldens live under `tests/visual/__snapshots__/` grouped by spec +
 * viewport. Update via `pnpm test:visual:update` after a deliberate
 * visual change, then diff the PNGs in code review.
 */
export default defineConfig({
  testDir: './tests/visual',
  snapshotPathTemplate:
    '{testDir}/__snapshots__/{testFilePath}/{arg}-{projectName}{ext}',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4321',
    trace: 'on-first-retry',
    // Deterministic rendering: no animations, no reduced-motion surprises
    // when the platform toggles it mid-run.
    reducedMotion: 'reduce'
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
      use: { viewport: { width: 375, height: 667 }, deviceScaleFactor: 2 }
    },
    {
      name: 'tablet',
      use: { viewport: { width: 768, height: 1024 }, deviceScaleFactor: 2 }
    },
    {
      name: 'desktop',
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

// `devices` re-export keeps IDE auto-import happy if a spec wants a real
// device profile for a one-off regression.
export { devices };
