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

- `.oxlintrc.json` - oxlint rule overrides (no-unused-vars `^_` exception, typescript no-empty-object-type allowing single-extends).
- `.oxfmtrc.json` - oxfmt config (single quotes, semi, no trailing commas, 2-space tab).
- `prettier.config.js` + `prettier-plugin-astro` - Prettier fallback for `.astro`/`.md`/`.mdx`/`.yaml`.

Why two formatters: oxfmt 0.47 does not yet handle `.astro` or `.md`. Track upstream support; remove Prettier when both land. Decision recorded in [`docs/adr/0002-oxc-suite-adoption.md`](./docs/adr/0002-oxc-suite-adoption.md).

## Tests

```bash
pnpm test                # vitest unit + node:test where present (turbo)
pnpm test:coverage       # vitest with v8 coverage; thresholds 85/80/85/85
pnpm test:visual         # Playwright goldens (mobile / tablet / desktop / desktop-light)
pnpm test:visual:update  # refresh goldens after intentional UI change
```

## CI and release flow

- `CI` runs on pushes to `main` and pull requests targeting `main`: `pnpm format:check`, `pnpm test`, `pnpm build`.
- There is no separate release workflow. The CDN bundle (rolling,
  unversioned) and the copy-source registry both ship with every docs
  build - see [ADR-0010](./docs/adr/0010-cdn-bundle-ships-with-docs-deploy.md).
- There is no npm publishing - UIKit is a copy-source registry (see
  [ADR-0009](./docs/adr/0009-copy-source-registry-distribution.md));
  registry pages ship with every docs deploy.
- Docs site (and CDN bundle) deploy to Cloudflare Pages (project
  `fcc-design`, `design.freecodecamp.org`) via the Cloudflare GitHub
  App + Git integration. Pushes to `main` deploy production; every PR
  (including forks) gets a preview at
  `https://<branch>.fcc-design.pages.dev`. No repo-side deploy
  workflow and no `CLOUDFLARE_*`/`CDN_PUSH_TOKEN` secrets are
  required. See the operator runbook in
  [`docs/runbooks/deploy-docs.md`](./docs/runbooks/deploy-docs.md)
  and the decisions in
  [ADR-0008](./docs/adr/0008-cloudflare-pages-git-integration.md)
  (supersedes ADR-0007) and
  [ADR-0010](./docs/adr/0010-cdn-bundle-ships-with-docs-deploy.md).

## More docs

- Release notes: [docs/releasing.md](./docs/releasing.md)
- Docs-deploy runbook: [docs/runbooks/deploy-docs.md](./docs/runbooks/deploy-docs.md)
- CDN usage guide: [apps/docs/src/pages/guides/cdn.astro](./apps/docs/src/pages/guides/cdn.astro)
- Components matrix: [docs/components-matrix.md](./docs/components-matrix.md)
