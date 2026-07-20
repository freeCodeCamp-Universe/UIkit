# Packages

This repo has one private app and five package workspaces - all private.
Workspaces are the source of truth for the copy-source registry served at
design.freecodecamp.org (see ADR-0009); nothing publishes to npm. The root
package exists to run pnpm and Turbo workflows across all workspaces.

## Workspace summary

| Workspace                 | Purpose                                                              |
| ------------------------- | -------------------------------------------------------------------- |
| `apps/docs`               | Astro docs site, component playground, and the copy-source registry. |
| `packages/uikit`          | React component library (source served by the registry).             |
| `packages/uikit-css`      | CSS custom properties, base helpers, fonts, and brand assets.        |
| `packages/uikit-js`       | Vanilla JavaScript runtime for `data-uikit-*` DOM hooks.             |
| `packages/uikit-icons`    | Curated icon body map, React icon wrapper, and SVG sprite.           |
| `packages/uikit-tailwind` | Tailwind preset and plugin that expose UIKit tokens.                 |

## Root package

Root `package.json` owns workspace-level scripts and shared dev tools:

- package manager: `pnpm@10.33.2`
- Node engine: `>=22` (see [`adr/0001-node-lts-floor.md`](./adr/0001-node-lts-floor.md))
- package runner: Turbo
- linting: oxlint (`.oxlintrc.json`)
- formatting: oxfmt for js/ts/json (`.oxfmtrc.json`); Prettier for `.astro`/`.md`/`.mdx`/`.yaml` (see [`adr/0002-oxc-suite-adoption.md`](./adr/0002-oxc-suite-adoption.md))
- testing: Vitest, Testing Library, Playwright through the docs package
- releases: none - docs, registry, and the CDN bundle all deploy automatically via Cloudflare Pages (see [`releasing.md`](./releasing.md))

The root package should not contain product source. It coordinates packages.

## Workspace standards

Every workspace keeps:

- `private: true` - distribution is copy-source + CDN, never npm
- `description`, `license`, `author`, `repository`, `bugs`, and `homepage`
- a package-local `README.md`
- an `exports` map pointing at TypeScript/CSS source (plus the few built
  artefacts other workspaces consume: `uikit/props.json`,
  `uikit-icons/sprite.svg`, `uikit-js` dist for the docs app's CDN bundle)

## `@freecodecamp/uikit`

React component library for the Command-line Chic design system.

Key files:

- source root: `packages/uikit/src`
- public barrel: `packages/uikit/src/index.ts`
- layer barrels:
  - `src/primitives/index.ts`
  - `src/forms/index.ts`
  - `src/navigation/index.ts`
  - `src/overlays/index.ts`
  - `src/data-display/index.ts`
  - `src/layouts/index.ts`
- props generator: `packages/uikit/scripts/gen-props.mjs`

Exports:

- `@freecodecamp/uikit`
- `@freecodecamp/uikit/primitives`
- `@freecodecamp/uikit/forms`
- `@freecodecamp/uikit/overlays`
- `@freecodecamp/uikit/navigation`
- `@freecodecamp/uikit/data-display`
- `@freecodecamp/uikit/layouts`
- `@freecodecamp/uikit/props.json`
- `@freecodecamp/uikit/package.json`

Build output:

- ESM and CJS bundles per layer
- TypeScript declaration files
- source maps
- generated `dist/props.json`

Peer dependencies:

- `react >=18 <20`
- `react-dom >=18 <20`
- `@ark-ui/react ^5.0.0`

Scripts:

- `pnpm --filter @freecodecamp/uikit build` generates `dist/props.json`
  via `scripts/gen-props.mjs` (react-docgen-typescript).

Tests live beside components. DOM interaction tests use `.dom.test.tsx`.
Meta tests under `src/_meta` enforce coverage and API invariants.

## `@freecodecamp/uikit-css`

Source CSS package for tokens, components, fonts, and brand files.

Key files:

- `packages/uikit-css/src/tokens.css`
- `packages/uikit-css/src/components.css`
- `packages/uikit-css/src/index.css`
- `packages/uikit-css/src/fonts/*`
- `packages/uikit-css/src/brand/*`

Exports:

- `@freecodecamp/uikit-css`
- `@freecodecamp/uikit-css/index.css`
- `@freecodecamp/uikit-css/tokens.css`
- `@freecodecamp/uikit-css/components.css`
- `@freecodecamp/uikit-css/fonts/*`
- `@freecodecamp/uikit-css/brand/*`
- `@freecodecamp/uikit-css/package.json`

Build behavior:

- The package ships source files directly.
- `build` intentionally prints that no build is needed.
- `sideEffects` includes CSS so bundlers do not drop stylesheet imports.

Scripts:

- `test`, `test:watch`, and `test:coverage` run Vitest against tokens, components, fonts, and brand assets.
- `build` is a source-only no-op.
- `lint` runs `oxfmt --check src`.

## `@freecodecamp/uikit-js`

Vanilla runtime for static HTML and CDN consumers.

Key files:

- `packages/uikit-js/src/core.ts`
- `packages/uikit-js/src/adapters/combobox.ts`
- `packages/uikit-js/src/adapters/dialog.ts`
- `packages/uikit-js/src/adapters/listbox.ts`
- `packages/uikit-js/src/adapters/pagination.ts`
- `packages/uikit-js/src/adapters/toast.ts`
- `packages/uikit-js/tsup.config.ts`

Exports:

- `@freecodecamp/uikit-js`
- `@freecodecamp/uikit-js/iife`
- `@freecodecamp/uikit-js/package.json`

Runtime behavior:

- boots on `DOMContentLoaded`, or immediately if the document has already
  loaded
- scans for registered `data-uikit-*` attributes
- observes later DOM additions with one `MutationObserver`
- stores adapter instances in `WeakMap`/`WeakSet` guards to avoid duplicate
  binding

Registered attributes:

- `data-uikit-combobox`
- `data-uikit-dialog`
- `data-uikit-listbox`
- `data-uikit-pagination`
- `data-uikit-toaster`
- `data-uikit-toast-trigger`

Build output:

- ESM `dist/uikit.js`
- IIFE `dist/uikit.global.js`
- declaration file `dist/uikit.d.ts`
- source maps

Scripts:

- `build` runs `tsup`.
- `dev` runs `tsup --watch`.
- `test`, `test:watch`, and `test:coverage` run Vitest (jsdom) covering exports + adapter contracts.
- `lint` runs oxlint.
- `typecheck` runs `tsc --noEmit`.

## `@freecodecamp/uikit-icons`

Curated Lucide subset for React, vanilla, and sprite consumers.

Key files:

- icon source files: `packages/uikit-icons/src/svg/*.svg`
- body map: `packages/uikit-icons/src/icons.ts`
- non-React entry: `packages/uikit-icons/src/index.ts`
- React entry: `packages/uikit-icons/src/react.tsx`
- sprite builder: `packages/uikit-icons/scripts/build-sprite.mjs`

Exports:

- `@freecodecamp/uikit-icons`
- `@freecodecamp/uikit-icons/react`
- `@freecodecamp/uikit-icons/sprite.svg`
- `@freecodecamp/uikit-icons/package.json`

Build output:

- ESM and CJS package entries
- React wrapper entry
- TypeScript declarations
- generated `dist/sprite.svg`

The parity test keeps `src/svg/*.svg` and `icons.ts` synchronized. The React
`Icon` wrapper is aria-hidden by default and uses `label` to expose an
accessible image name.

Scripts:

- `build` runs `build-sprite.mjs` (sprite only - the React wrapper and icon map ship as source).
- `test`, `test:watch`, and `test:coverage` run Vitest.
- `lint` runs oxlint.
- `typecheck` runs `tsc --noEmit`.

## `@freecodecamp/uikit-tailwind`

Tailwind integration that maps utilities to UIKit CSS custom properties.

Key files:

- public entry: `packages/uikit-tailwind/src/index.ts`
- preset: `packages/uikit-tailwind/src/preset.ts`
- plugin: `packages/uikit-tailwind/src/plugin.ts`

Exports:

- `@freecodecamp/uikit-tailwind`
- `@freecodecamp/uikit-tailwind/preset`
- `@freecodecamp/uikit-tailwind/plugin`
- `@freecodecamp/uikit-tailwind/package.json`

Behavior:

- the preset extends colors, font families, font sizes, spacing, border widths,
  radii, transition tokens, and z-indexes using CSS custom properties
- the plugin adds `.focus-ring`
- the plugin adds `fcc-dark` and `fcc-light` variants scoped to
  `.dark-palette` and `.light-palette`

Dependency notes:

- peer dependency: `tailwindcss >=3 <5`
- current dev dependency: `tailwindcss ^4.2.4`
- `tailwindcss` and `tailwindcss/plugin` stay external in the build

Scripts:

- no build - ships source; the registry page serves preset.ts + plugin.ts.
- `test`, `test:watch`, and `test:coverage` run Vitest.
- `lint` runs oxlint.
- `typecheck` runs `tsc --noEmit`.

## `@freecodecamp/uikit-docs`

Private Astro app for the docs site and playground.

Key files:

- Astro config: `apps/docs/astro.config.mjs`
- content schema: `apps/docs/src/content.config.ts`
- home/playground: `apps/docs/src/pages/index.astro`
- handbook: `apps/docs/src/pages/handbook.astro`
- component docs: `apps/docs/src/content/components/*.mdx`
- component showcases: `apps/docs/src/showcase/*.astro`
- runtime islands: `apps/docs/src/showcase/_islands/*.tsx`
- search integration: `apps/docs/integrations/search-index.ts`
- CDN bundle builder: `apps/docs/scripts/build-cdn-bundle.mjs` (rolling,
  unversioned; see [ADR-0010](./adr/0010-cdn-bundle-ships-with-docs-deploy.md))
- Playwright config: `apps/docs/playwright.config.ts`
- Vitest config: `apps/docs/vitest.config.ts`

Workspace package aliases in `astro.config.mjs` resolve
`@freecodecamp/uikit*` imports to raw workspace source during docs dev/build.
This keeps the docs app close to package source while `ensure-uikit-built.mjs`
still guarantees `props.json` exists when needed.

Scripts:

- `predev` and `prebuild` copy dogfood assets, build the brand asset kit,
  ensure `@freecodecamp/uikit` has built `props.json`, and build the CDN
  bundle into `public/cdn/`.
- `dev` runs `astro dev`.
- `build` runs `astro build`.
- `preview` runs `astro preview`.
- `test`, `test:watch`, and `test:coverage` run Vitest.
- `test:playwright` and `test:visual` run Playwright.
- `test:playwright:update` and `test:visual:update` refresh snapshots.
- `lint` runs `astro check && oxlint`.
- `typecheck` runs `astro check`.
