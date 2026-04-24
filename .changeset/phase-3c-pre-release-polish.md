---
'@freecodecamp/uikit': minor
'@freecodecamp/uikit-css': patch
---

Wave 4 Phase 3C — pre-release site polish complete (internal marker;
aggregated into the Wave 5 v1.0.0 release, no mid-sprint npm cut).

Sprint land:

- **Sidebar API** gains `collapsible` + `defaultOpen` on
  `SidebarSection` and exports an `isActiveHref(path, href, {exact?})`
  route-matcher. Non-collapsible markup is byte-identical for existing
  consumers. Docs-grade sidebar styling (sticky rail, active-accent bar,
  caret rotation, hover states, intro/hint blocks) now lives in
  `uikit-css` so external consumers inherit the visual upgrade.
- **Docs navigation** — `nav.ts` rewritten to group all 45 shipped
  components by layer (`primitives`, `actions`, `forms`, `navigation`,
  `overlays`, `feedback`, `data-display`, `layouts`), with hrefs routed
  to `/components/<slug>`. AppSidebar consumes the upgraded API, derives
  active state from `Astro.url.pathname`, and retires the client-side
  scroll-spy script in favour of route-aware rendering (scroll-spy
  moved to `/showcase`).
- **Docs pages** — full MDX pages for 11 stable atoms (Button, Alert,
  Callout, Badge, Card, Panel, Input, Checkbox, Switch, Modal, Tooltip)
  and beta stubs for 9 less-touched components (Toggle button, Close
  button, Link, Spacer, Form group, Form control, Help block, Dropdown,
  Tabs). Every sidebar entry now resolves to a page; the long-parked
  Modal dialog demo gap closes.
- **Site structure** — storybook moved to `/showcase`; new landing at
  `/` is assembled from `<Heading>`, `<Text>`, `<Card>`, `<Panel>`,
  `<Callout>`, `<Alert>`, and `<DescriptionList>` — the docs site
  dogfoods the kit end-to-end. `/components` becomes a card grid
  grouped by category via a new `ComponentCard.astro`.
- **AppHeader hrefs** cleaned up (`#top` → `/`, anchor-only nav →
  real routes). Foundations layout accepts an optional `wide: true`
  frontmatter flag and widens the Colors page grid.
- **COMPONENTS-MATRIX.md** at repo root cross-references every UIKit
  component against Catalyst, Ark UI, and Headless UI with spec links.

Exit gate: 219/219 uikit unit tests, 22/22 docs unit tests, monorepo
turbo build green, 55 HTML pages under `apps/docs/dist`, 45 layered
components surfaced at `/components`, 43/45 components have dedicated
MDX (Table and Image are storybook-only by design).
