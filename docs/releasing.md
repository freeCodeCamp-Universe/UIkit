# Releasing UIKit

This runbook covers npm package releases, the CDN release path, and the future
OIDC migration path for UIKit.

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

## Public npm packages

These packages publish to npm:

- `@freecodecamp/uikit`
- `@freecodecamp/uikit-css`
- `@freecodecamp/uikit-js`
- `@freecodecamp/uikit-icons`
- `@freecodecamp/uikit-tailwind`

These workspaces are private and must not publish to npm:

- `@freecodecamp/uikit-docs`
- `@freecodecamp/uikit-cdn`

The public packages all set `publishConfig.access` to `public`. This matters
because scoped packages default to private visibility unless publish access is
explicitly public.

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

Run the full package release gate:

```bash
pnpm release:check
```

That script builds publishable package outputs, verifies the CDN tree, runs
`publint` package-shape checks, and runs a recursive npm publish dry-run for
all packages under `packages/*`.

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

Dry-run npm package tarballs only:

```bash
pnpm release:npm:dry-run
```

Run that command from a clean checkout before publishing. For local inspection
while you still have uncommitted edits, append `--no-git-checks` manually
instead of changing the script.

Lint package export maps and packed metadata only:

```bash
pnpm release:lint-packages
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

Input:

- `ref`: the UIkit git ref to release

Release job order:

1. `lint` runs the reusable lint workflow.
2. `test` runs the reusable test workflow.
3. `visual` runs after lint and test.
4. `build` runs after lint, test, and visual, then uploads `dist-cdn`.
5. `publish-cdn` runs after build and opens the CDN PR.

`publish-cdn` performs these steps:

1. Checks out this repo at the selected `ref` into `uikit/`.
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

## npm publishing

The CDN release flow does not publish npm packages. npm package releases use
Changesets.

Release control files:

- `.changeset/config.json` sets Changesets to public access, `main` as the
  base branch, patch updates for internal dependency ranges, and no automatic
  Changesets commits.
- Public package `package.json` files set `publishConfig.access` to `public`.
- Private workspaces stay private through their package metadata and the
  Changesets private-package config.

For normal package releases:

1. Add a changeset for every package-visible change:

   ```bash
   pnpm changeset
   ```

2. When ready, consume changesets on `main`:

   ```bash
   pnpm changeset version
   ```

3. Review package versions and generated changelogs.
4. Commit the version bump as one release commit.
5. Run the release gate:

   ```bash
   pnpm release:check
   ```

6. Publish with an org-scoped npm token:

   ```bash
   pnpm release
   ```

The root `pnpm release` script runs `pnpm build:pkgs && changeset publish`.
Changesets checks npm first and publishes local package versions that are not
already on the registry.

### First manual npm release

The first release is still manual and token-based.

1. Confirm the public package versions are intended. At this point they are
   `1.0.0`.
2. Confirm the package names do not already exist publicly:

   ```bash
   npm view @freecodecamp/uikit version
   npm view @freecodecamp/uikit-css version
   npm view @freecodecamp/uikit-js version
   npm view @freecodecamp/uikit-icons version
   npm view @freecodecamp/uikit-tailwind version
   ```

   `E404` is expected before the first publish.

3. Authenticate as an npm user with publish rights for the `@freecodecamp`
   scope. npm requires 2FA for publishing or a granular token that can bypass
   2FA.
4. From a clean checkout on the release commit, run:

   ```bash
   pnpm release:check
   pnpm release
   ```

5. Confirm each package page exists on npm and shows public visibility.

If one package publishes and a later package fails, fix the failure, keep the
already-published versions unchanged, and rerun `pnpm release`. Changesets will
skip versions already present on npm.

## OIDC migration

After the first manual release, move npm publishing to trusted publishing.
Do not disable token publishing until the OIDC workflow has successfully
published at least one release.

npm's trusted publisher requirements to carry into the workflow:

- GitHub-hosted runners.
- Node `22.14.0` or newer.
- npm CLI `11.5.1` or newer.
- `permissions.id-token: write`.
- `actions/setup-node` configured with
  `registry-url: https://registry.npmjs.org`.
- Each npm package configured on npmjs.com with the GitHub organization,
  repository, workflow filename, and optional environment name.

Important caveat: this repo currently publishes through `changeset publish`,
and the installed Changesets CLI detects pnpm and delegates package publishing
to `pnpm publish`. Validate current pnpm/Changesets trusted-publishing support
before switching the release job to OIDC. If pnpm is not accepted by npm trusted
publishing at that point, publish through an npm-CLI path in the OIDC workflow
instead of assuming the tokenless path works.

Once OIDC has published successfully:

1. Restrict npm publishing access to require 2FA and disallow traditional
   publish tokens.
2. Revoke any no-longer-needed npm automation tokens.
3. Keep a protected GitHub environment for npm publishing if release approval is
   required.

## Quick CDN checklist

1. Confirm `packages/uikit/package.json` has the intended `x.y.z` version.
2. Run `pnpm build`.
3. Run `pnpm verify:cdn`.
4. Push or merge the release ref.
5. Dispatch `Release` with `ref` set to that ref.
6. Review the Actions summary.
7. Review and merge the generated PR in `freeCodeCamp/cdn`.
8. Confirm `freeCodeCamp/cdn/build/uikit/` contains root, `latest`, major,
   minor, and exact-version aliases.
