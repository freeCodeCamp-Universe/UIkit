---
'@freecodecamp/uikit': minor
'@freecodecamp/uikit-css': patch
---

Wave 2 Phase 2E — Tier 5 composite chrome + layouts complete
(internal marker 0.9.0; aggregated into the Wave 5 v1.0.0 release, no
mid-sprint npm release).

Ships the five-component layout system (brainstorm §14 bundles these
as one roadmap entry):

- **Navbar** — `<header role="banner">` with `start`, `center`, `end`
  ReactNode slots. Center wraps to its own row at widths ≤ 768 px.
- **Sidebar** — compound API: `<Sidebar>` wraps `<aside role="navigation">`,
  `<SidebarSection label>` groups items under a mono terminal
  eyebrow, `<SidebarItem href? active? icon?>` renders as `<a>` when
  `href` is set and as `<button type="button">` otherwise. Active
  items carry `aria-current="page"` + `data-active="true"`.
- **SidebarLayout** — full-page shell: optional header row + grid with
  aside column + `<main>`. Aside hides at ≤ 768 px.
- **StackedLayout** — full-page shell: optional header + flex-grow
  `<main>` + optional footer. For marketing pages and content views.
- **AuthLayout** — centered `<main>` card for auth flows with optional
  `brand` slot above, optional `footer` slot below, and opt-in
  `pattern` modifier for a CSS-only grid background.

Also wires the `layouts` barrel into the public `@freecodecamp/uikit`
entry point (first non-empty entry under `packages/uikit/src/layouts/`).

Exit gate: 171/171 uikit unit tests pass, monorepo build green, docs
site lists every new component under `/components/`.
