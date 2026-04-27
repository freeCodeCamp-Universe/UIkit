# Development workflows

This repo uses pnpm workspaces and Turbo. Run commands from the repo root unless
the command explicitly says otherwise.

## Prerequisites

- Node: `>=20`
- CI Node: `22` through `.github/actions/setup-node-pnpm/action.yml`
- pnpm: `10.33.2` from root `package.json`
- package manager install: `pnpm install`

`pnpm install` runs the root `prepare` script, which installs Husky unless the
environment is CI.

pnpm-specific install settings live in `pnpm-workspace.yaml` so npm CLI
commands do not warn on pnpm-only `.npmrc` keys during package dry-runs.

## Root scripts

| Script                   | Command                                                                                        | Use                                                                                      |
| ------------------------ | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `prepare`                | `is-ci \|\| husky`                                                                             | Install git hooks outside CI.                                                            |
| `build`                  | `turbo run build`                                                                              | Build every workspace.                                                                   |
| `build:pkgs`             | `turbo run build --filter=!@freecodecamp/uikit-docs`                                           | Build packages without the docs app.                                                     |
| `build:docs`             | `turbo run build --filter=@freecodecamp/uikit-docs`                                            | Build only the docs app and required deps.                                               |
| `dev`                    | `pnpm dev:docs`                                                                                | Default local dev entry; delegates to docs dev.                                          |
| `dev:docs`               | `pnpm --filter @freecodecamp/uikit-docs dev`                                                   | Run the Astro docs dev server.                                                           |
| `dev:vanilla`            | `pnpm --filter @freecodecamp/uikit-js dev`                                                     | Watch-build the vanilla runtime.                                                         |
| `dev:cdn`                | `pnpm verify:cdn`                                                                              | Verify the current CDN bundle.                                                           |
| `build:cdn`              | `turbo run build --filter=@freecodecamp/uikit-cdn`                                             | Build the CDN workspace and upstream deps.                                               |
| `verify:cdn`             | `turbo run verify --filter=@freecodecamp/uikit-cdn`                                            | Verify `dist-cdn/uikit`.                                                                 |
| `preview`                | `turbo run preview --filter=@freecodecamp/uikit-docs`                                          | Preview the built docs app.                                                              |
| `test`                   | `turbo run test`                                                                               | Run workspace tests.                                                                     |
| `test:unit`              | `turbo run test`                                                                               | Alias for workspace unit tests.                                                          |
| `test:coverage`          | `turbo run test:coverage`                                                                      | Run coverage tasks.                                                                      |
| `test:watch`             | `turbo run test:watch`                                                                         | Run watch-mode tests where available.                                                    |
| `test:playwright`        | `turbo run test:playwright --filter=@freecodecamp/uikit-docs`                                  | Run docs Playwright tests.                                                               |
| `test:playwright:update` | `turbo run test:playwright:update --filter=@freecodecamp/uikit-docs`                           | Update docs Playwright snapshots.                                                        |
| `test:visual`            | `pnpm test:playwright`                                                                         | Visual-test alias kept for existing workflows.                                           |
| `test:visual:update`     | `pnpm test:playwright:update`                                                                  | Visual snapshot update alias.                                                            |
| `lint`                   | `turbo run lint`                                                                               | Run workspace lint tasks.                                                                |
| `typecheck`              | `turbo run typecheck`                                                                          | Run workspace type checks.                                                               |
| `format`                 | `prettier . --write && eslint . --fix`                                                         | Format and autofix the repo.                                                             |
| `format:check`           | `prettier . --check && eslint .`                                                               | Check formatting and linting without writes.                                             |
| `changeset`              | `changeset`                                                                                    | Create package release notes and version intent.                                         |
| `release:check`          | `pnpm build:pkgs && pnpm verify:cdn && pnpm release:lint-packages && pnpm release:npm:dry-run` | Build packages, verify CDN output, lint package shape, and dry-run npm package tarballs. |
| `release:lint-packages`  | `publint run ... --strict`                                                                     | Run package-shape validation for all public packages.                                    |
| `release:npm:dry-run`    | `pnpm -r --filter './packages/*' publish --access public --dry-run`                            | Verify publishable package contents without publishing.                                  |
| `release`                | `pnpm build:pkgs && changeset publish`                                                         | Local npm publish path after building. CDN release uses GitHub Actions.                  |

## Package scripts

| Workspace                      | Scripts                                                                                                                                                                                       |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@freecodecamp/uikit`          | `test`, `test:watch`, `test:coverage`, `build`, `lint`, `typecheck`                                                                                                                           |
| `@freecodecamp/uikit-css`      | `test`, `build`, `lint`                                                                                                                                                                       |
| `@freecodecamp/uikit-js`       | `test`, `build`, `dev`, `lint`, `typecheck`                                                                                                                                                   |
| `@freecodecamp/uikit-icons`    | `test`, `test:watch`, `test:coverage`, `build`, `lint`, `typecheck`                                                                                                                           |
| `@freecodecamp/uikit-tailwind` | `test`, `test:watch`, `test:coverage`, `build`, `lint`, `typecheck`                                                                                                                           |
| `@freecodecamp/uikit-cdn`      | `test`, `test:watch`, `test:coverage`, `build`, `verify`                                                                                                                                      |
| `@freecodecamp/uikit-docs`     | `test`, `test:watch`, `test:coverage`, `test:playwright`, `test:playwright:update`, `test:visual`, `test:visual:update`, `predev`, `dev`, `prebuild`, `build`, `preview`, `lint`, `typecheck` |

## Common local workflows

### Install and build everything

```bash
pnpm install
pnpm build
```

### Run the docs site

```bash
pnpm dev
```

`pnpm dev` delegates to `pnpm dev:docs`. The docs package `predev` script
copies dogfood assets, builds the brand asset kit, and ensures
`packages/uikit/dist/props.json` exists.

### Work on vanilla runtime

```bash
pnpm dev:vanilla
```

This runs `tsup --watch` for `@freecodecamp/uikit-js`. To see it in the docs
site, rebuild or rerun docs predev so `apps/docs/public/uikit/uikit.global.js`
is refreshed.

### Build and verify CDN output

```bash
pnpm build:cdn
pnpm verify:cdn
```

`build:cdn` builds the CDN package and upstream package outputs. `verify:cdn`
checks the generated `dist-cdn/uikit` tree.

### Run unit tests and coverage

```bash
pnpm test
pnpm test:coverage
```

Turbo builds upstream packages before test tasks that declare `^build`.

### Run Playwright tests

```bash
pnpm test:playwright
```

Playwright runs against built Astro output through `astro preview`. The Turbo
task depends on `build`, so the docs app is built first.

### Update visual snapshots

```bash
pnpm test:playwright:update
```

The legacy alias also works:

```bash
pnpm test:visual:update
```

Commit intentional snapshot changes with the code or docs change that caused
them.

### Validate formatting, lint, and types

```bash
pnpm format:check
pnpm lint
pnpm typecheck
```

Use `pnpm format` only when you intend to rewrite files.

## Turbo tasks

| Task                            | Depends on | Outputs/cache behavior                                             |
| ------------------------------- | ---------- | ------------------------------------------------------------------ |
| `build`                         | `^build`   | `dist/**`, `dist-cdn/**`, `.astro/**`, excluding `.astro/cache/**` |
| `dev`                           | none       | persistent, uncached                                               |
| `preview`                       | `build`    | persistent, uncached                                               |
| `test`                          | `^build`   | no outputs                                                         |
| `test:coverage`                 | `^build`   | `coverage/**`                                                      |
| `test:watch`                    | none       | persistent, uncached                                               |
| `test:visual`                   | `build`    | uncached                                                           |
| `test:visual:update`            | `build`    | uncached                                                           |
| `test:playwright`               | `build`    | uncached                                                           |
| `test:playwright:update`        | `build`    | uncached                                                           |
| `lint`                          | none       | no outputs                                                         |
| `typecheck`                     | `^build`   | no outputs                                                         |
| `verify`                        | `build`    | no outputs                                                         |
| `@freecodecamp/uikit-css#build` | none       | no outputs; CSS ships source                                       |

## CI

`.github/workflows/ci.yml` runs on pushes to `main` and pull requests targeting
`main`. It calls four reusable workflows:

- `re-lint.yml`: `pnpm format:check`, then `pnpm typecheck`
- `re-test.yml`: `pnpm test:coverage`, then uploads coverage artifacts
- `re-build.yml`: `pnpm build`, then
  `pnpm --filter @freecodecamp/uikit-cdn run verify`
- `re-visual.yml`: installs Playwright Chromium, runs `pnpm build`, then
  `pnpm --filter @freecodecamp/uikit-docs test:visual`

The shared setup action installs Node 22, lets `pnpm/action-setup` read the
exact pnpm version from root `packageManager`, and installs workspace
dependencies with `pnpm install --frozen-lockfile`.

## Release workflow

The manual `.github/workflows/release.yml` flow runs lint, test, visual, and
build jobs first. The build job uploads `dist-cdn`. The publish job downloads
that artifact, validates `packages/uikit/package.json` version, checks out
`freeCodeCamp/cdn` using `CDN_PUSH_TOKEN`, syncs `dist-cdn/uikit` to
`cdn/build/uikit`, and opens a PR.

The npm release path uses Changesets. Run `pnpm release:check` from a clean
checkout before `pnpm release`.

See [Releasing](./releasing.md) for the full runbook.
