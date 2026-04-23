# Contributing

## Setup

```bash
pnpm install
pnpm test
pnpm build
pnpm build:cdn
pnpm verify:cdn
```

`pnpm install` also installs husky's git hook. The `pre-commit` hook runs `lint-staged`, which formats staged files with Prettier + ESLint before the commit lands.

## Day-to-day workflow

- Branch from `main`.
- Make your change.
- Keep `package.json` on the intended release version.
- Run `pnpm lint`, `pnpm test`, and the relevant build steps before opening a PR.

## Linting and formatting

```bash
pnpm lint     # prettier --check + eslint
pnpm format   # prettier --write + eslint --fix
```

Configs:

- `prettier.config.js` — Prettier rules (single quotes, no trailing commas, `prettier-plugin-astro` for `.astro`).
- `eslint.config.js` — ESLint flat config (`eslint-plugin-astro` + `typescript-eslint`).

## CI and release flow

- `CI` runs on pushes to `main` and pull requests targeting `main`: `pnpm lint`, `pnpm test`, `pnpm build:cdn`, `pnpm verify:cdn`, `pnpm build`.
- `Release` is manual. Run it from GitHub Actions with `workflow_dispatch` when you want to cut a release.
- The release workflow builds from the selected ref, verifies the CDN bundle, then opens a pull request on `freeCodeCamp/cdn` that updates `build/uikit/`.
- Cross-repo push uses the `CDN_PUSH_TOKEN` secret (fine-grained PAT scoped to `freeCodeCamp/cdn`). The default `GITHUB_TOKEN` is never used outside this repo.
- No GitHub release or tag is created on this repo.

## Release checklist

1. Set `package.json` to the exact `x.y.z` version you want to ship.
2. Merge that change to `main`.
3. Run the `Release` workflow from the default branch with `ref: main`.
4. Review the PR it opens on `freeCodeCamp/cdn` (branch `release/uikit-v<version>`) and merge once approved.

## More docs

- Release runbook: [docs/releasing.md](./docs/releasing.md)
- CDN usage guide: [src/pages/guides/cdn.astro](./src/pages/guides/cdn.astro)
