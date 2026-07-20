# Releasing UIKit

There are no npm releases and no separate CDN release. Everything -
the copy-source registry and the zero-build CDN bundle - ships
automatically with every docs deploy. See
[ADR-0009](./adr/0009-copy-source-registry-distribution.md) and
[ADR-0010](./adr/0010-cdn-bundle-ships-with-docs-deploy.md).

## What ships

- The copy-source registry on `design.freecodecamp.org`
  (`/components/`, `/registry/`, `/llms.txt`, `/llms-full.txt`).
- The CDN bundle at `design.freecodecamp.org/cdn/`, for zero-build HTML
  consumers:
  - `styles.min.css`, `tokens.min.css`, `components.min.css`
  - `uikit.global.js`
  - `sprite.svg`
  - `fonts/`, `brand/` when present
  - `manifest.json` (sha256 + sha384 per file, for SRI)

The CDN bundle is rolling and unversioned - no `latest/`, `<major>/`,
or `<version>/` aliases. Nothing pins a specific version today; if a
real consumer needs that later, see ADR-0010's alternatives.

## Build and verify locally

```bash
pnpm build:docs
```

runs `astro build` then
`apps/docs/scripts/verify-dist-pages-artefacts.mjs`, which asserts:

- required Cloudflare Pages artefacts exist (`_headers`, `_redirects`,
  `robots.txt`, sitemap, favicon)
- the registry (`registry/index.json`, docs pages, raw files,
  `llms.txt`) is internally consistent
- the CDN bundle (`cdn/*`) is present and its `manifest.json` hashes
  match the actual files, and no minified CSS references an absolute
  `/fonts/` URL

`pnpm verify:registry` runs the same thing.

## Deploy

Deploy is Cloudflare Pages, Git integration - push to `main` deploys
production automatically. See
[`docs/runbooks/deploy-docs.md`](./runbooks/deploy-docs.md) for the
full operator playbook (first-time setup, custom domain, rollback).

## CI

`.github/workflows/ci.yml` runs on pushes and PRs to `main`, calling:

- `re-lint.yml` - `pnpm format:check`, `pnpm typecheck`
- `re-test.yml` - `pnpm test:coverage`
- `re-build.yml` - `pnpm build`
- `re-visual.yml` - Playwright visual regression

There is no separate release workflow.
