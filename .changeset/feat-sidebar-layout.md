---
'@freecodecamp/uikit': minor
'@freecodecamp/uikit-css': patch
---

Add `<SidebarLayout>` — full-page chrome with optional `header` slot
on top of a two-column `sidebar` + `<main>` grid. Sidebar column is
220 px wide by default and hides at widths ≤ 768 px so mobile stays
single-column. First entry under `packages/uikit/src/layouts/` — also
wires the `layouts` barrel into the public entry point.
