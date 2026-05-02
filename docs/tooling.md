# Tooling

Authoritative inventory of developer tooling, package versions, LTS posture,
and CI surface for the freeCodeCamp UIKit monorepo. Source of truth for
"what is installed and why" lives here; the per-package `package.json`
remains the source of truth for exact versions.

Last refreshed: 2026-05-02.

## Architecture

freeCodeCamp UIKit is a pnpm/Turbo monorepo. It ships a React component
package, source CSS tokens and BEM classes, a vanilla JavaScript runtime,
an icon package, a Tailwind integration, an internal CDN bundle builder,
and the Astro documentation site.

### What ships

| Surface                  | Package or app                 | Main source                   | Output                                                            |
| ------------------------ | ------------------------------ | ----------------------------- | ----------------------------------------------------------------- |
| React components         | `@freecodecamp/uikit`          | `packages/uikit/src`          | ESM, CJS, declarations, and `props.json` in `packages/uikit/dist` |
| Tokens and component CSS | `@freecodecamp/uikit-css`      | `packages/uikit-css/src`      | Source CSS, fonts, and brand assets shipped directly              |
| Vanilla runtime          | `@freecodecamp/uikit-js`       | `packages/uikit-js/src`       | ESM module and IIFE bundle in `packages/uikit-js/dist`            |
| Icons                    | `@freecodecamp/uikit-icons`    | `packages/uikit-icons/src`    | Icon map, React wrapper, declarations, and `sprite.svg` in `dist` |
| Tailwind integration     | `@freecodecamp/uikit-tailwind` | `packages/uikit-tailwind/src` | Preset and plugin ESM/CJS entries in `dist`                       |
| CDN bundle               | `@freecodecamp/uikit-cdn`      | `packages/uikit-cdn/scripts`  | `dist-cdn/uikit` bundle with version aliases and manifest         |
| Public docs site         | `@freecodecamp/uikit-docs`     | `apps/docs/src`               | Static Astro site in `apps/docs/dist`                             |

### Workspace layout

`pnpm-workspace.yaml` includes `apps/*` (private apps; today `apps/docs`)
and `packages/*` (publishable packages + internal package tooling).
Important root files: `package.json` (root scripts + dev tools + pnpm
version + lint-staged), `turbo.json` (task graph), `tsconfig.base.json`
(strict TS defaults), `.oxlintrc.json`, `.oxfmtrc.json`,
`prettier.config.js` (Astro/MD fallback — see ADR-0002),
`.github/workflows/*` (CI + reusable jobs + manual CDN release).

Generated output is intentionally separate from source:

- `packages/*/dist` from `tsup` builds.
- `packages/uikit/dist/props.json` from `scripts/gen-props.mjs`.
- `dist-cdn/uikit` from the CDN build.
- `apps/docs/.astro` and `apps/docs/dist` from Astro.
- `apps/docs/public/uikit/*` from docs predev/prebuild asset copying.
- coverage and Playwright artifacts under package/app `coverage/` and
  `apps/docs/test-results/`.

### Build flow

1. `@freecodecamp/uikit-css` provides token + component CSS source. No
   compile step during its package build.
2. `@freecodecamp/uikit` compiles React source with `tsup` and generates
   `dist/props.json` for docs API tables.
3. `@freecodecamp/uikit-js` compiles the vanilla runtime to ESM and
   `uikit.global.js`.
4. `@freecodecamp/uikit-icons` compiles package entries and builds
   `dist/sprite.svg`.
5. `@freecodecamp/uikit-tailwind` compiles the Tailwind preset + plugin.
6. `@freecodecamp/uikit-cdn` bundles CSS with Lightning CSS, copies
   fonts, brand assets, the vanilla IIFE, and the icon sprite, then
   mirrors them under `latest`, major, minor, and exact-version
   aliases.
7. `apps/docs` imports workspace package source during dev/build through
   Vite aliases, copies dogfood assets into `public/uikit`, and builds
   the Astro site.

`turbo run build` drives this graph. The `build` task depends on upstream
workspace builds, except `@freecodecamp/uikit-css#build`, which is
explicitly source-only and has no upstream dependency.

### Runtime model

UIKit has three usage modes:

- **React** consumers import from `@freecodecamp/uikit` plus CSS from
  `@freecodecamp/uikit-css`.
- **Static HTML** consumers use BEM classes from the CSS package or the
  CDN stylesheet.
- **Vanilla interactive** consumers add `data-uikit-*` attributes and
  load `uikit.global.js`; the runtime scans the DOM at boot and after
  mutations.

The docs app dogfoods all three: React previews, HTML examples, CSS
tokens, the vanilla runtime, icons, and CDN-style assets.

## Workspace inventory

| Path                      | Name                           | Public? | Version | Role                                                        |
| ------------------------- | ------------------------------ | ------- | ------- | ----------------------------------------------------------- |
| `packages/uikit`          | `@freecodecamp/uikit`          | npm     | 0.1.0   | React components (Command-line Chic)                        |
| `packages/uikit-css`      | `@freecodecamp/uikit-css`      | npm     | 0.1.0   | Tokens + component CSS + fonts (source-only ship)           |
| `packages/uikit-icons`    | `@freecodecamp/uikit-icons`    | npm     | 0.1.0   | Curated Lucide subset + SVG sprite                          |
| `packages/uikit-js`       | `@freecodecamp/uikit-js`       | npm     | 0.1.0   | Vanilla `data-uikit-*` runtime via Zag machines             |
| `packages/uikit-tailwind` | `@freecodecamp/uikit-tailwind` | npm     | 0.1.0   | Tailwind v4 preset + plugin mirroring tokens                |
| `packages/uikit-cdn`      | `@freecodecamp/uikit-cdn`      | private | 0.1.0   | Builds `dist-cdn/` for the `freeCodeCamp/cdn` deploy        |
| `apps/docs`               | `@freecodecamp/uikit-docs`     | private | 0.1.0   | Astro docs site (live at `https://design.freecodecamp.org`) |

All five public packages share `engines.node = ">=22"`.

## Toolchain

| Tool                                    | Pinned                                                                   | Purpose                                           |
| --------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------- |
| Node.js                                 | engines `>=22` floor; `.nvmrc` 24 (Active LTS); CI matrix `[22.x, 24.x]` | Runtime                                           |
| pnpm                                    | `10.33.2` (`packageManager`)                                             | Package manager                                   |
| Turbo                                   | `^2.9.6`                                                                 | Monorepo task graph                               |
| TypeScript                              | `^6.0.3`                                                                 | Types                                             |
| oxlint (oxc)                            | `^1.62.0`                                                                | Lint (replaces ESLint)                            |
| oxfmt (oxc)                             | `^0.47.0`                                                                | Format (replaces Prettier for js/ts/json)         |
| Prettier                                | `3.8.3`                                                                  | Format fallback for `.astro`/`.md`/`.mdx`/`.yaml` |
| prettier-plugin-astro                   | `0.14.1`                                                                 | Astro file support (Prettier)                     |
| Vitest                                  | `4.1.5`                                                                  | Unit tests                                        |
| `@vitest/coverage-v8`                   | `4.1.5`                                                                  | Coverage                                          |
| jsdom                                   | `29.1.0`                                                                 | DOM environment for `uikit-js` + `uikit` tests    |
| `@testing-library/{dom,jest-dom,react}` | `10.4.1` / `6.9.1` / `16.3.2`                                            | RTL matchers + assertions                         |
| Husky                                   | `9.1.7`                                                                  | Git hooks (`prepare = is-ci \|\| husky`)          |
| lint-staged                             | `16.4.0`                                                                 | Run formatters on staged files                    |
| Changesets                              | `^2.31.0`                                                                | Versioning + changelog automation                 |
| publint                                 | `^0.3.18`                                                                | Strict pkg lint pre-publish                       |
| tsx                                     | `^4.21.0`                                                                | TypeScript script runner                          |
| Renovate                                | `github>freeCodeCamp/renovate-config` + custom rules                     | Dep updates                                       |

## oxc adoption + Prettier fallback

The Phase 1 modernization wave swapped ESLint and Prettier (for js/ts/json) for
the [oxc suite](https://oxc.rs/):

| File matrix                    | Tool                                   |
| ------------------------------ | -------------------------------------- |
| `**/*.{js,jsx,mjs,cjs,ts,tsx}` | `oxlint` (lint), `oxfmt` (format)      |
| `**/*.{json,jsonc}`            | `oxfmt` (format)                       |
| `**/*.{astro,md,mdx,yaml,yml}` | `prettier --write` (Prettier retained) |
| `.astro` typecheck             | `astro check`                          |

**Why Prettier is still here**: oxfmt 0.47.0 does not yet handle `.astro` files
(skipped via ignore rules) and emits a `printWidth` config error on `.md`. We
keep `prettier` + `prettier-plugin-astro` for those globs only. Track upstream
oxfmt astro/markdown support in `docs/v1.1-backlog.md`.

**Lint rule parity**: `.oxlintrc.json` mirrors the previous `eslint.config.js`
overrides (`no-unused-vars` with `^_` prefix, `typescript/no-empty-object-type`
with `allowInterfaces: with-single-extends`). oxlint's `unicorn` plugin is
deliberately disabled to preserve current rule semantics; revisit in v1.1.

## LTS policy

| Tool         | Today (2026-05-01)                                | Policy                                                                                             |
| ------------ | ------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Node.js      | 22 Maintenance LTS, **24 Active LTS**, 26 Current | Floor = lowest active or maintenance LTS. Currently `>=22`. Bump floor when previous LTS hits EOL. |
| TypeScript   | 6.x                                               | Stay on current major; pin via `^`.                                                                |
| pnpm         | 10.x                                              | Track current major; pin via `packageManager`.                                                     |
| Tailwind CSS | 4.x peer pin (`^4.0.0`)                           | v3 deliberately dropped — Config types diverge between majors.                                     |
| React        | 19 stable; peer `>=18 <20`                        | Hold peer at last-known-stable; widen after eval per release.                                      |
| Astro        | 6.x (`^6.1.9` in `apps/docs`)                     | Hold majors for human review (Renovate `automerge: false`).                                        |

The Node version invariant is enforced by `scripts/check-node-versions.mjs`
(invokable as `pnpm check:node-versions`). It asserts:

- root `engines.node` floor matches `FLOOR` constant (currently `22`)
- every public `packages/*/package.json#engines.node` matches root
- `.nvmrc` value matches `ACTIVE_LTS` constant (currently `24`)
- composite GitHub Action default matches `FLOOR`
- `.github/workflows/re-test.yml` matrix contains both `${FLOOR}.x` and `${ACTIVE_LTS}.x`
- every `@types/node` major across the workspace matches `FLOOR`

When you bump the policy, update the two constants in the script in the same
commit as the `package.json`/`.nvmrc`/CI changes.

## Build + test surface (per package)

| Package          | Builder                     | Test                    | Notable runtime deps                                           |
| ---------------- | --------------------------- | ----------------------- | -------------------------------------------------------------- |
| `uikit`          | `tsup` + `gen-props.mjs`    | `vitest` (jsdom)        | peer `@ark-ui/react ^5.0.0`, `react >=18 <20`                  |
| `uikit-css`      | none — ships source         | `vitest` (node)         | —                                                              |
| `uikit-icons`    | `tsup` + `build-sprite.mjs` | `vitest`                | peer `react >=18 <20`                                          |
| `uikit-js`       | `tsup`                      | `vitest` (jsdom)        | `@zag-js/{combobox,dialog,listbox,pagination,tabs} ^1.40.0`    |
| `uikit-tailwind` | `tsup`                      | `vitest`                | peer `tailwindcss ^4.0.0`                                      |
| `uikit-cdn`      | `node scripts/build.mjs`    | `vitest` + `verify`     | `lightningcss ^1.32.0`                                         |
| `apps/docs`      | `astro build`               | `vitest` + `playwright` | `astro ^6.1.9`, `@astrojs/{mdx,react} ^5.0.4`, `react ^19.2.5` |

## Workspace tasks

`turbo.json` declares the task graph; per-package scripts are wired
through it.

### Root scripts

| Script                     | Effect                                                                                    |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| `build`                    | `turbo run build` — every workspace.                                                      |
| `build:pkgs`               | Build packages, skip docs.                                                                |
| `build:docs`               | Build docs app + required deps only.                                                      |
| `dev` / `dev:docs`         | Astro docs dev server (default local entry).                                              |
| `dev:vanilla`              | `tsup --watch` for `@freecodecamp/uikit-js`.                                              |
| `build:cdn` / `verify:cdn` | CDN bundle build + integrity check on `dist-cdn/uikit`.                                   |
| `preview`                  | Preview the built docs app.                                                               |
| `test`                     | All workspace unit tests.                                                                 |
| `test:coverage`            | Coverage tasks (v8 reporter).                                                             |
| `test:playwright[:update]` | Docs Playwright run / snapshot refresh.                                                   |
| `lint` / `lint:fix`        | `oxlint` (per-package via Turbo) / `oxlint --fix`.                                        |
| `typecheck`                | `tsc` + `astro check` per package.                                                        |
| `format` / `format:check`  | oxfmt for js/ts/json + prettier for `.astro`/`.md`/`.mdx`/`.yaml`.                        |
| `check:node-versions`      | Assert Node + `@types/node` floor consistency across the repo.                            |
| `changeset`                | Create release intent.                                                                    |
| `release:check`            | `build:pkgs` → `verify:cdn` → `publint --strict` → `pnpm publish --dry-run` (5 packages). |
| `release`                  | Local npm publish path. CDN release uses GitHub Actions.                                  |

### Turbo task graph

| Task                            | Depends on | Outputs / cache behavior                                            |
| ------------------------------- | ---------- | ------------------------------------------------------------------- |
| `build`                         | `^build`   | `dist/**`, `dist-cdn/**`, `.astro/**` (excluding `.astro/cache/**`) |
| `dev`                           | none       | persistent, uncached                                                |
| `preview`                       | `build`    | persistent, uncached                                                |
| `test`                          | `^build`   | no outputs                                                          |
| `test:coverage`                 | `^build`   | `coverage/**`                                                       |
| `test:watch`                    | none       | persistent, uncached                                                |
| `test:playwright[:update]`      | `build`    | uncached                                                            |
| `test:visual[:update]`          | `build`    | uncached                                                            |
| `lint`                          | none       | no outputs                                                          |
| `typecheck`                     | `^build`   | no outputs                                                          |
| `verify`                        | `build`    | no outputs                                                          |
| `@freecodecamp/uikit-css#build` | none       | no outputs; CSS ships source                                        |

For narrative day-to-day workflow (Setup, common command sequences,
when to refresh visual snapshots), see [`CONTRIBUTING.md`](../CONTRIBUTING.md).

## CI / CD

GitHub Actions live in `.github/workflows/`:

- `ci.yml` — push + pull request to `main`. Calls reusable workflows in dependency order.
- `re-lint.yml` — `pnpm format:check` (oxfmt + prettier-astro/md) and `pnpm typecheck` (`tsc` + `astro check`).
- `re-test.yml` — Node matrix `[22.x, 24.x]`, `pnpm test:coverage`. Uploads coverage on Node 24.x only.
- `re-build.yml` — `pnpm build` and `pnpm --filter @freecodecamp/uikit-cdn run verify`.
- `re-visual.yml` — Playwright Chromium visual regression for `apps/docs`.
- `release.yml` — npm publish + opens PR on `freeCodeCamp/cdn` for the CDN bundle. Republish guard checks if version already lives there.
- `deploy-docs.yml` — Cloudflare Pages production deploy for the docs site (`fcc-design` project, `design.freecodecamp.org`).
- `deploy-docs-preview.yml` — Cloudflare Pages per-PR preview deploy. See [`docs/adr/0007-cloudflare-pages-docs-deploy.md`](./adr/0007-cloudflare-pages-docs-deploy.md) and [`docs/runbooks/deploy-docs.md`](./runbooks/deploy-docs.md).

Composite action `.github/actions/setup-node-pnpm/action.yml` installs pnpm
and Node, with `node-version` defaulting to `22` (the floor).

## Husky + lint-staged

Pre-commit hook (`.husky/pre-commit`) runs `pnpm lint-staged`. Routing
(in `package.json#lint-staged`):

```json
{
  "**/*.{js,jsx,mjs,cjs,ts,tsx}": ["oxlint --fix", "oxfmt --write"],
  "**/*.{json,jsonc}": ["oxfmt --write"],
  "**/*.{astro,md,mdx,yaml,yml}": ["prettier --write"]
}
```

If `git config core.hooksPath` drifts away from `.husky/_`, restore with
`git config core.hooksPath .husky/_`.

## Renovate

`renovate.json` extends `github>freeCodeCamp/renovate-config` and adds three
local rules:

1. Auto-merge minor + patch updates for an explicit allowlist of dev tooling
   (oxlint, oxfmt, prettier, vitest, testing-library, etc.).
2. Hold every major update for human review.
3. Hold framework + peer-dep minor/patch updates as well: react, react-dom,
   astro, `@astrojs/**`, `@ark-ui/**`, `@zag-js/**`, lightningcss.
4. Disable Renovate for `@freecodecamp/**` (those move via Changesets).

## See also

- [`docs/packages.md`](./packages.md) — per-package entrypoints + exports.
- [`docs/releasing.md`](./releasing.md) — release process.
- [`docs/runbooks/deploy-docs.md`](./runbooks/deploy-docs.md) — Cloudflare Pages operator playbook.
- [`docs/components-matrix.md`](./components-matrix.md) — peer comparison.
- [`docs/v1.1-backlog.md`](./v1.1-backlog.md) — deferred items.
- [`docs/adr/`](./adr/) — architecture decision log (locked decisions).
- [`apps/docs/README.md`](../apps/docs/README.md) — Astro app internals.
- [`CONTRIBUTING.md`](../CONTRIBUTING.md) — contributor narrative workflow.
