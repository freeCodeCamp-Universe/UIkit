---
'@freecodecamp/uikit': minor
'@freecodecamp/uikit-css': patch
'@freecodecamp/uikit-js': minor
'@freecodecamp/uikit-tailwind': patch
'@freecodecamp/uikit-icons': patch
---

Wave 2 Phase 2A — scaffolding checkpoint (internal marker 0.3.0-beta.0; not
published during the sprint, aggregated into the Wave 5 v1.0.0 release).

- Rebrand: every "fCC UIKit" surface (docs chrome, package descriptions,
  token file banner, Modal source comment, landing hero) now reads
  "freeCodeCamp UIKit". Monorepo version rolls back to `0.1.0` so all
  packages advance together under Changesets rather than ad-hoc bumps.
- `@freecodecamp/uikit` source is reorganised into layered subfolders —
  `primitives/`, `forms/`, `overlays/`, `navigation/`, `data-display/`,
  `layouts/` — with a new public barrel at `src/index.ts` plus per-folder
  barrels for deep imports.
- `@freecodecamp/uikit-js` ships a real build for the first time: a tsup
  ESM + IIFE bundle (978 B gz for core + dialog adapter), a tiny registry
  - MutationObserver boot loop, and a hand-rolled dialog adapter that
    already emits the Ark-compatible DOM contract
    (`data-state="open|closed"`, `aria-hidden`, Escape / backdrop close).
    @zag-js/{dialog,tabs,pagination,listbox,combobox} are pre-installed so
    Tier 4 Zag-backed adapters can drop in without new lockfile churn.
- `@freecodecamp/uikit` bumps its `@ark-ui/react` peerDependency from
  `^4.0.0` to `^5.0.0` — the devDependency already consumed 5.36.2, so
  this fixes an outright bad peer declaration.
- Docs site adopts Astro 6 Content Collections v2: `src/content.config.ts`
  with a `foundations` collection (migrated from `pages/foundations/*`)
  and an empty-but-ready `components` collection. New `[...slug].astro`
  routes keep URLs stable while the collection schema becomes the source
  of truth.
- New per-component documentation template: `/components` grid with
  empty-state, `/components/[slug]` hero + body wrapper, and five site
  helpers (`AnatomySvg`, `PropTable`, `TokenChips`, `DoDont`,
  `RelatedComponents`). `content/components/button.mdx` is the first
  entry — canonical reference for every Wave 2 Tier 1+ component that
  follows.
