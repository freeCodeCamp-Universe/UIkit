# freeCodeCamp UIKit — v1.0.0-rc.0

**Release candidate draft.** First stable surface of the UIKit. Not yet
published to npm; the Wave 5 cut will flip the switch.

## Package versions

| Package                        | Previous | Proposed      | Scope           |
| ------------------------------ | -------- | ------------- | --------------- |
| `@freecodecamp/uikit`          | 0.1.0    | `1.0.0-rc.0`  | React surface   |
| `@freecodecamp/uikit-css`      | 0.1.0    | `1.0.0-rc.0`  | Tokens + BEM    |
| `@freecodecamp/uikit-js`       | 0.1.0    | `1.0.0-rc.0`  | Vanilla IIFE    |
| `@freecodecamp/uikit-icons`    | 0.1.0    | `1.0.0-rc.0`  | Lucide subset   |
| `@freecodecamp/uikit-tailwind` | 0.1.0    | `1.0.0-rc.0`  | Plugin scaffold |
| `@freecodecamp/uikit-cdn`      | internal | internal-only | Build pipeline  |

## What landed

Seventeen new components across five tiers, rounded out with a 60-glyph
icon catalog, a vanilla-JS adapter bundle, a CDN-ready build with W3C
SRI, and a docs site that now eats its own dog food.

### Tier 1–2 — atoms

- **`<Text>`** — polymorphic body-copy wrapper, four size levels
- **`<Heading>`** — decouples semantic level (`h1`–`h6`) from display size
- **`<Divider>`** — `<hr role="separator">` with `orientation`
- **`<Avatar>`** — square badge with image + two-letter fallback
- **`<Fieldset>`** — native fieldset + legend pair, form-group wrapper
- **`<DescriptionList>`** — semantic dl/dt/dd for data display

### Tier 3 — forms

- **`<Radio>` + `<RadioGroup>`** — radio primitive with group container
- **`<Select>`** — `forwardRef` wrapper around the native `<select>`
- **`<Textarea>`** — native textarea with terminal aesthetic

### Tier 4 — dual-layer (React + vanilla adapters)

- **`<Pagination>`** — paginated navigation, `data-uikit-pagination`
- **`<Listbox>`** — keyboard-navigable list, `data-uikit-listbox`
- **`<Combobox>`** — marquee component: text input with filtered menu,
  `data-uikit-combobox`

Vanilla adapters ship in `@freecodecamp/uikit-js` (7.84 KB IIFE) and wire
themselves on `DOMContentLoaded` — drop a `<script src="uikit.global.js"
defer>` and every `data-uikit-*` attribute lights up.

### Tier 5 — chrome + layouts

- **`<Navbar>`** — top-of-page chrome, three slots
- **`<Sidebar>`** — compound navigation, group/link composition
- **`<SidebarLayout>`** — full-page chrome with optional header slot
- **`<StackedLayout>`** — full-page chrome for top-nav pages
- **`<AuthLayout>`** — centered-card shell for login / signup / forgot / magic-link

### Iconography

`@freecodecamp/uikit-icons` expands from the 5-glyph pilot to **60 curated
Lucide icons** (lucide-static@0.469.0, ISC). Nine categories: arrows,
feedback, object, identity, media, math, nav, editing, and utility. Each
icon ships as SVG source + inline body map + sprite symbol; a parity
invariant pins `src/svg/*.svg` keys to the `icons.ts` map at test time.

### Delivery surfaces

- **CDN bundle** (`@freecodecamp/uikit-cdn`, internal) ships three CSS
  files + the `uikit.global.js` IIFE + the 60-symbol `sprite.svg`, mirrored
  across `/latest/`, `/<major>/`, `/<major>.<minor>/`, and `/<version>/`
  subtrees. Manifest now carries **W3C SRI** `sha384-<base64>` alongside
  the existing sha256 content address; consumers paste `integrity="sha384-…"`
  straight onto `<link>` / `<script>` tags.
- **Docs dogfood** — `apps/docs` now consumes its own vanilla bundle via
  `/uikit/uikit.global.js` and serves the icon sprite at
  `/uikit/sprite.svg`, both copied from workspace dists at predev+prebuild.
  Tier 4 demos (`/components/pagination`, `/listbox`, `/combobox`) now
  render as interactive fixtures instead of inert markup.

## Migration notes

None. First stable surface — there is no prior published release to
migrate from. Post-`rc.0` releases may still break; pin to
`1.0.0-rc.0` if you cannot tolerate churn until `1.0.0` lands.

## Known gaps (tracked for post-1.0)

- No `/components/dialog` demo MDX; vanilla adapter ships but has no
  demo page.
- Docs chrome (`AppHeader`, `AppSidebar`) is still hand-rolled Astro —
  `<Navbar>` / `<Sidebar>` + `<SidebarLayout>` adoption slated for Wave 3
  patterns work.
- Tier 4 React layers are hand-rolled; the planned `@zag-js/*` machine
  substitution is deferred (the hand-roll speaks the Zag DOM contract, so
  the swap is non-breaking).
- Playwright visual-regression goldens deferred until component APIs
  freeze. Wave 2 ships without automated pixel-diff.

## Changelog provenance

This release rolls up 25 accumulated changesets:

- 17 component `feat-*` changesets (one per shipped component)
- 5 phase checkpoints (`phase-2a-scaffolding` through `phase-2e-tier5`)
- 1 Wave 1 monorepo scaffolding (`wave-1-monorepo`)
- 1 icon sprite expansion (`feat-icon-sprite-60`)
- 1 CDN SRI refresh (`chore-cdn-js-sri`)

The major-bump marker changeset lives at
`.changeset/major-v1-0-0-rc-0.md` — it forces every shipped package onto
the `1.0.0` line at release time, overriding the minor-bump accumulation.

## How the release actually cuts (Wave 5, not now)

1. `pnpm changeset pre enter rc`
2. `pnpm changeset version` — collapses accumulated + major marker into
   `1.0.0-rc.0`
3. Human smoke test, then `pnpm changeset publish`
4. `pnpm changeset pre exit` after the RC line closes

**Do not run any of these in Wave 2.** The artefact here is drafted
notes; the cut happens at Wave 5.
