# Releasing UIKit

This runbook covers the CDN release path. There are no npm releases; the
copy-source registry ships automatically with every docs deploy.

## What ships

The CDN bundle is built into `dist-cdn/uikit/` and then synced into
`freeCodeCamp/cdn/build/uikit/`.

The top-level bundle contains:

- `styles.min.css`
- `tokens.min.css`
- `components.min.css`
- `uikit.global.js`
- `sprite.svg`
- `fonts/`
- `brand/` when present
- `manifest.json`
- `latest/`
- `<major>/`
- `<major>.<minor>/`
- `<major>.<minor>.<patch>/`

Do not rearrange this tree when syncing to the CDN repo.

## No npm packages

Every workspace is `private: true`. Distribution surfaces are:

- the copy-source registry on design.freecodecamp.org (deployed with docs)
- the CDN bundle in `freeCodeCamp/cdn` (this runbook)

`packages/uikit/package.json` keeps a semver `version` field because the
CDN build and release workflow read it for version aliases.

## Version aliases

The CDN build reads `packages/uikit/package.json` for the version.

For package version `1.2.3`, the build emits:

```text
uikit/styles.min.css
uikit/latest/styles.min.css
uikit/1/styles.min.css
uikit/1.2/styles.min.css
uikit/1.2.3/styles.min.css
```

Alias rules:

- root tracks the current release
- `latest/` tracks the current release
- `<major>/` tracks the latest release in that major line
- `<major>.<minor>/` tracks the latest release in that minor line
- `<major>.<minor>.<patch>/` is fully pinned

The GitHub release job requires a full `x.y.z` semver version before it opens
the CDN PR.

## Build and verify locally

Build only package outputs without the docs app:

```bash
pnpm build:pkgs
```

Build only the CDN package path and its upstream dependency graph:

```bash
pnpm build:cdn
```

Verify the generated CDN tree:

```bash
pnpm verify:cdn
```

The package-level equivalents are:

```bash
pnpm --filter @freecodecamp/uikit-cdn build
pnpm --filter @freecodecamp/uikit-cdn verify
```

## CDN build internals

`packages/uikit-cdn/scripts/build.mjs`:

- bundles CSS with Lightning CSS
- creates:
  - `styles.min.css`
  - `tokens.min.css`
  - `components.min.css`
- rewrites font URLs from `/fonts/...` to `./fonts/...`
- copies fonts from `packages/uikit-css/src/fonts`
- copies brand assets from `packages/uikit-css/src/brand` when present
- copies `packages/uikit-js/dist/uikit.global.js`
- copies `packages/uikit-icons/dist/sprite.svg`
- writes `manifest.json`
- mirrors the bundle into `latest`, major, minor, and exact-version aliases

The manifest stores:

- `bytes`
- `sha256` as hex
- `sha384` as W3C-shaped integrity text, for example `sha384-<base64>`

## CDN verification internals

`packages/uikit-cdn/scripts/verify.mjs` checks:

- required files exist
- no minified CSS file contains absolute `/fonts/` URLs
- every `./fonts/...` CSS reference resolves to a real file
- every manifest sha256 and sha384 matches recomputed file hashes
- alias directories contain the same files as the top-level bundle
- alias files match top-level bundle hashes

Verification exits non-zero on the first failed run summary.

## CI

`.github/workflows/ci.yml` runs on:

- pushes to `main`
- pull requests targeting `main`

It calls four reusable workflows:

- `re-lint.yml`
  - `pnpm format:check`
  - `pnpm typecheck`
- `re-test.yml`
  - `pnpm test:coverage`
  - uploads coverage artifacts from `packages/*/coverage` and
    `apps/*/coverage`
- `re-build.yml`
  - `pnpm build`
  - `pnpm --filter @freecodecamp/uikit-cdn run verify`
  - optionally uploads the `dist-cdn` artifact
- `re-visual.yml`
  - installs Playwright Chromium
  - `pnpm build`
  - `pnpm --filter @freecodecamp/uikit-docs test:visual`
  - uploads Playwright failure artifacts

The shared setup action installs Node 22, lets `pnpm/action-setup` read the
exact pnpm version from root `packageManager`, and installs dependencies with
`pnpm install --frozen-lockfile`.

## GitHub Actions release

`.github/workflows/release.yml` is manual and uses `workflow_dispatch`.

There are no inputs: the branch or tag selected in the dispatch UI is the ref
being released. Every job (lint, test, build, version read) runs against that
same commit, so the published bundle and its version alias always agree.

Release job order:

1. `lint` runs the reusable lint workflow.
2. `test` runs the reusable test workflow.
3. `visual` runs after lint and test.
4. `build` runs after lint, test, and visual, then uploads `dist-cdn`.
5. `publish-cdn` runs after build and opens the CDN PR.

`publish-cdn` performs these steps:

1. Checks out this repo at the dispatched ref into `uikit/`.
2. Downloads the `dist-cdn` artifact into `uikit/dist-cdn/`.
3. Reads `packages/uikit/package.json` version.
4. Fails unless the version is full `x.y.z` semver.
5. Checks out `freeCodeCamp/cdn` into `cdn/` with `CDN_PUSH_TOKEN`.
6. Warns if `cdn/build/uikit/<version>/` already exists.
7. Runs `rsync -a --delete uikit/dist-cdn/uikit/ cdn/build/uikit/`.
8. Opens a PR on `freeCodeCamp/cdn`.
9. Writes a GitHub Actions summary with the ref, version, branch, and
   republish warning when relevant.

The PR branch is:

```text
release/uikit-v<version>
```

The PR title and commit message are:

```text
chore(uikit): publish v<version>
```

## Required secret

The release workflow needs `CDN_PUSH_TOKEN`.

That token must be able to:

- check out `freeCodeCamp/cdn`
- push the release branch
- open the publish PR

The default `GITHUB_TOKEN` is not used for cross-repo writes.

## Quick CDN checklist

1. Confirm `packages/uikit/package.json` has the intended `x.y.z` version.
2. Run `pnpm build`.
3. Run `pnpm verify:cdn`.
4. Push or merge the release ref.
5. Dispatch `Release` from that branch or tag in the Actions UI.
6. Review the Actions summary.
7. Review and merge the generated PR in `freeCodeCamp/cdn`.
8. Confirm `freeCodeCamp/cdn/build/uikit/` contains root, `latest`, major,
   minor, and exact-version aliases.
