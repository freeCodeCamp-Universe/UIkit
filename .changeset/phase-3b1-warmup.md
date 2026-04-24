---
'@freecodecamp/uikit': minor
'@freecodecamp/uikit-css': patch
'@freecodecamp/uikit-js': minor
---

Wave 3 Phase 3B1 — compound pattern warmup complete (internal marker;
aggregated into the Wave 5 v1.0.0 release, no mid-sprint npm cut).

Ships three patterns on top of the Wave 2 atoms:

- **Skeleton** (data-display) — rect / circle / text variants, shimmer
  animation, `prefers-reduced-motion` aware, screen-reader `label`
  surfaced via `.sr-only`.
- **EmptyState** (data-display) — centered zero-state shell with
  optional icon + title + description + action slots. Root stays a
  plain `<div>` so callers can layer `role="status"` as context
  demands.
- **Toast + Toaster + createToaster** (overlay) — Ark UI + Zag toast
  machine for React. `danger` variant upgrades to `role="alert"` so
  errors announce immediately; others stay `role="status"`. Defaults:
  top-end placement, 5 s auto-dismiss, overlap on. Matching vanilla
  adapters (`@freecodecamp/uikit-js`) wire declarative
  `[data-uikit-toaster]` + `[data-uikit-toast-trigger]` hooks to the
  same `.toast / .toast--<variant>` DOM contract.

Foundation work landed alongside the patterns:

- **uikit bundler wiring** — `tsup` + per-layer exports map
  (`primitives`, `forms`, `overlays`, `navigation`, `data-display`,
  `layouts`). First real ESM+CJS+d.ts emit for `@freecodecamp/uikit`.
- **docs chrome dogfood** — `AppHeader.astro` + `AppSidebar.astro`
  now compose `<Navbar>` + `<Sidebar>` + `<SidebarSection>` +
  `<SidebarItem>` via SSR-only React islands. First production-traffic
  surface for the Tier 5 layout components.
- **infra debt cleanup** — tsconfig `allowImportingTsExtensions`,
  `@types/node` + `types:["node"]` per-package, uikit-cdn workspace
  deps for turbo build order, docs sprite-copy CI gate.

Exit gate: 192/192 uikit unit tests, 14/14 docs tests, monorepo build
green under turbo, all new patterns listed at `/components/`.
