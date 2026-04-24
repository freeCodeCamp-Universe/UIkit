---
'@freecodecamp/uikit-docs': minor
---

Visual-regression baseline: Playwright harness covering 16 routes ×
3 viewports (mobile / tablet / desktop) = 48 goldens. Renders against
the built `astro preview` server for production parity. CI job caches
the chromium download and uploads the playwright-report on failure.
`/showcase` stays out of the baseline until 3D.9 (scroll-spy
extraction) breaks the gallery into screenshottable islands.

Run locally with `pnpm --filter @freecodecamp/uikit-docs test:visual`;
refresh goldens with `pnpm --filter @freecodecamp/uikit-docs
test:visual:update` after a deliberate visual change and review the
PNG diff in code review.
