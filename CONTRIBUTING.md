# Contributing

Thanks for helping improve the freeCodeCamp UIKit. This repo follows the freeCodeCamp.org contribution standards. Start with the freeCodeCamp contributor guide:

> <https://contribute.freecodecamp.org/>

When you're ready to work on UIKit specifically, the sections below cover the project-local workflow.

## Code of Conduct

All contributors are expected to follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

## Reporting bugs

Open an issue at <https://github.com/freeCodeCamp/UIkit/issues> with steps to reproduce, expected behaviour, and observed behaviour. Include a screenshot when the bug is visual. For Playwright golden mismatches, attach the diff PNG from `apps/docs/test-results/`.

## Reporting security issues

Do **not** open a public issue. Follow the disclosure process in [SECURITY.md](./SECURITY.md).

## Setup

```bash
pnpm install
pnpm build
pnpm test
```

`pnpm install` also installs Husky's git hooks. The `pre-commit` hook runs `lint-staged`, which routes staged files through `oxlint --fix` + `oxfmt --write` for js/ts/json, and `prettier --write` for `.astro`/`.md`/`.mdx`/`.yaml` files.

Requires Node `>=22` (CI matrix runs `[22.x, 24.x]`) and pnpm 10. The `.nvmrc`
holds the recommended local version (Active LTS), `engines.node` declares the
floor, and `packageManager` pins pnpm. The `pnpm check:node-versions` script
verifies these stay in sync.

See [`docs/tooling.md`](./docs/tooling.md) for the full toolchain inventory.

## Day-to-day workflow

- Branch from `main`.
- Make your change.
- Add a changeset for any change that affects a published package: `pnpm changeset` (interactive).
- Run `pnpm lint`, `pnpm test`, and `pnpm build` before opening a PR.
- Refresh Playwright goldens in the same commit when a visual change lands: `pnpm test:visual:update`.

## Linting and formatting

```bash
pnpm format        # oxfmt --write . && prettier --write "**/*.{astro,md,mdx,yaml,yml}"
pnpm format:check  # oxfmt --check . && prettier --check "**/*.{astro,md,mdx,yaml,yml}"
pnpm lint          # turbo run lint  (oxlint per package + astro check in apps/docs)
pnpm lint:fix      # oxlint --fix
pnpm typecheck     # turbo run typecheck
```

Configs:

- `.oxlintrc.json` — oxlint rule overrides (no-unused-vars `^_` exception, typescript no-empty-object-type allowing single-extends).
- `.oxfmtrc.json` — oxfmt config (single quotes, semi, no trailing commas, 2-space tab).
- `prettier.config.js` + `prettier-plugin-astro` — Prettier fallback for `.astro`/`.md`/`.mdx`/`.yaml`.

Why two formatters: oxfmt 0.47 does not yet handle `.astro` or `.md`. Track upstream support; remove Prettier when both land. Decision recorded in [`docs/adr/0002-oxc-suite-adoption.md`](./docs/adr/0002-oxc-suite-adoption.md).

## Tests

```bash
pnpm test                # vitest unit + node:test where present (turbo)
pnpm test:coverage       # vitest with v8 coverage; thresholds 85/80/85/85
pnpm test:visual         # Playwright goldens (mobile / tablet / desktop / desktop-light)
pnpm test:visual:update  # refresh goldens after intentional UI change
```

## CI and release flow

- `CI` runs on pushes to `main` and pull requests targeting `main`: `pnpm format:check`, `pnpm test`, `pnpm build`, `pnpm --filter @freecodecamp/uikit-cdn run verify`.
- `Release` is manual. Trigger from GitHub Actions with `workflow_dispatch` and pick the ref to release.
- The release workflow builds the CDN bundle, then opens a PR on `freeCodeCamp/cdn` that updates `build/uikit/`.
- Cross-repo push uses the `CDN_PUSH_TOKEN` secret (fine-grained PAT scoped to `freeCodeCamp/cdn`). The default `GITHUB_TOKEN` is never used outside this repo.
- npm publish is not currently automated. Run `pnpm release:check`, then
  `pnpm release` locally with an org-scoped npm token.

## Release checklist

1. Run `pnpm changeset` for each PR that ships user-visible change.
2. When ready to release, run `pnpm changeset version` on `main` to consume queued changesets, bump versions, and update per-package `CHANGELOG.md`.
3. Commit the version bump as a single commit.
4. Run `pnpm release:check` from a clean checkout.
5. Run `pnpm release` to publish npm packages.
6. Run the `Release` workflow with `ref: main` to publish the CDN bundle.
7. Review and merge the PR it opens on `freeCodeCamp/cdn`.

## More docs

- Release runbook: [docs/releasing.md](./docs/releasing.md)
- CDN usage guide: [apps/docs/src/pages/guides/cdn.astro](./apps/docs/src/pages/guides/cdn.astro)
- Components matrix: [docs/components-matrix.md](./docs/components-matrix.md)
