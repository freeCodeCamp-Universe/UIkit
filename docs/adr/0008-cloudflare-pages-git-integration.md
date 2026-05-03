# 0008 — Switch docs deploy from direct upload to Cloudflare Pages Git integration

- Status: Accepted
- Date: 2026-05-03
- Deciders: UIKit core maintainers
- Supersedes: [0007](./0007-cloudflare-pages-docs-deploy.md)

## Context

[ADR-0007](./0007-cloudflare-pages-docs-deploy.md) chose **direct
upload** via `cloudflare/wrangler-action` inside GitHub Actions,
backed by a `CLOUDFLARE_API_TOKEN` repo secret, two reusable
workflows (`deploy-docs.yml` + `deploy-docs-preview.yml`), and a
checked-in `apps/docs/wrangler.jsonc`. The Phase 4 visual / behavioural
test rebuild proved the local CI surface is green and the deploy
plumbing technically works.

A pre-push review surfaced gaps in ADR-0007's reasoning that
disproportionately affect a public OSS docs site:

- **Fork-PR previews are silently rejected.** GitHub denies repo
  secrets to PRs originating from forks. The
  `deploy-docs-preview.yml` `if:` guard avoids a confusing auth
  error, but it means external contributors never see their
  changes deployed — exactly the audience freeCodeCamp/UIkit
  targets.
- **`CLOUDFLARE_API_TOKEN` rotation overhead.** The runbook
  mandated annual rotation plus immediate rotation on suspected
  leak / maintainer departure. The CF GitHub App removes the
  long-lived secret entirely.
- **Build infrastructure duplication.** GH Actions installs Node +
  pnpm, runs `pnpm install`, runs predev/prebuild scripts, runs
  `astro build`, then re-uploads the artefact. CF Pages can do
  the same install + build itself.
- **PR comment UX.** `gitHubToken` on `wrangler-action` produces a
  GitHub Deployment that lives in the PR sidebar. CF Git
  integration adds a top-of-thread PR comment with the preview
  URL.
- **Rollback granularity.** Direct upload retains the last N
  artefact uploads. Git integration tracks every commit on every
  branch; rolling back to any prior commit is one click in the CF
  dashboard.

ADR-0007's "stay close to the GH Actions environment" rationale
remains valid for a closed-source / tightly-controlled deploy.
For the OSS docs site the trade-offs lean toward the managed path.

## Decision

- **Cloudflare Pages with Git integration**, replacing the direct
  upload path. The CF GitHub App owns repo access; CF Pages owns
  the build environment.
- Project name: `fcc-design` (unchanged from ADR-0007).
- Custom domain: `design.freecodecamp.org` (unchanged).
- Production branch: `main`. Preview deploys: every other branch
  on the canonical repo + every PR (including fork PRs).
- Build settings (set on the CF Pages project, not in repo):
  - Framework preset: None.
  - Build command: `pnpm install --frozen-lockfile && pnpm build:docs`.
  - Build output directory: `apps/docs/dist`.
  - Root directory: repo root.
  - Environment variables: `NODE_VERSION=22`. pnpm version is
    inferred from root `package.json#packageManager`.
- Repo-side artefacts that survive (deploy-mode-agnostic):
  `apps/docs/public/_headers`, `apps/docs/public/_redirects`,
  `apps/docs/public/robots.txt`,
  `apps/docs/scripts/verify-dist-pages-artefacts.mjs`,
  `apps/docs/src/_meta/pages-config.test.ts` (with the
  `wrangler.jsonc` describe block removed).
- Repo-side artefacts deleted by this ADR:
  `.github/workflows/deploy-docs.yml`,
  `.github/workflows/deploy-docs-preview.yml`,
  `apps/docs/wrangler.jsonc`.
- GitHub repo secrets `CLOUDFLARE_API_TOKEN` +
  `CLOUDFLARE_ACCOUNT_ID` become **redundant** post-migration. The
  hand-back step in `docs/runbooks/deploy-docs.md` includes their
  removal.
- The site stays a pure Astro SSG. No `@astrojs/cloudflare`
  adapter, no Pages Functions, no Workers. Re-evaluate if SSR /
  edge work enters scope.

## Consequences

- Positive: fork PRs get previews automatically; no API token in
  repo secrets; one place (CF dashboard) for build logs +
  rollback; preview URL appears in a PR comment without extra
  workflow code.
- Positive: ~150 lines of repo-side YAML / config deleted (two
  workflows + `wrangler.jsonc` + meta-gate sub-block + runbook
  shrink).
- Negative: build env becomes one more thing to keep in sync with
  the Node + pnpm pins. Mitigation: `NODE_VERSION` env var on the
  CF project; `packageManager` field in root `package.json`
  already encodes the pnpm version.
- Negative: vendor stickiness with CF (the GitHub App is
  CF-owned). Mitigation: the actual deploy plumbing is gone from
  the repo, so switching providers later means re-installing a
  different App, not deleting workflows. Net effort comparable.
- Follow-ups:
  - Hand-back checklist replaces the secrets section with the
    GitHub App install + CF Pages project-create-with-Git steps.
  - The Phase 2 CSP enforce-mode promotion procedure stays as-is
    (deploy mode does not affect `_headers` semantics).

## Alternatives considered

- **Stay on direct upload (ADR-0007).** Rejected: see Context
  gaps. The "stay close to GH Actions" win does not outweigh the
  fork-PR + token-rotation costs for a public OSS docs site.
- **Cloudflare Pages with a webhook-triggered GH Actions workflow.**
  Not offered as a first-class CF Pages feature; would re-introduce
  the secret-rotation surface we are trying to delete.
- **Vercel / Netlify Git-integrated deploy.** Rejected on
  fCC-platform alignment grounds (per ADR-0007's still-applicable
  alternatives section).
- **Self-hosted (S3 + CF in front).** Rejected for the same SSG
  free-tier sufficiency reasons in ADR-0007.

## References

- [ADR-0001](./0001-node-lts-floor.md) — Node LTS floor; feeds
  `NODE_VERSION` env var on the CF project.
- [ADR-0007](./0007-cloudflare-pages-docs-deploy.md) — superseded
  by this ADR; retained for historical context.
- `docs/runbooks/deploy-docs.md` — operator playbook (rewritten
  for Git integration in the same wave that landed this ADR).
