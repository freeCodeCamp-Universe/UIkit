# 0007 — Cloudflare Pages for the docs site (direct upload)

- Status: Accepted
- Date: 2026-05-02
- Deciders: UIKit core maintainers

## Context

The UIKit docs site (`apps/docs`) had never been deployed. A
`deploy-docs.yml` workflow stub already targeted Cloudflare Pages
(`fcc-design` project) but was `workflow_dispatch`-only and never run;
the README and `docs/tooling.md` simultaneously documented Netlify as
the platform. With the npm packages and the docs site approaching
their first publish + go-live, the platform choice had to be
committed once before customer-facing URLs settled.

freeCodeCamp.org's broader infrastructure (the curriculum, news,
Universe spike) is already converging on Cloudflare for static
hosting and DNS, including a CDN that already lives at
`cdn.freecodecamp.org`. The docs site is a small static (Astro SSG)
deliverable with no SSR, no Functions, no Workers — fits a static
host's free / cheap tier. Two deploy-style options on Cloudflare
Pages: managed Git integration vs. direct upload from CI.

## Decision

- **Cloudflare Pages**, project `fcc-design`, custom domain
  `design.freecodecamp.org`.
- **Direct upload** via `cloudflare/wrangler-action` inside GitHub
  Actions. **Not** Cloudflare's managed Git integration.
- Production deploys land from `push` to `main` via
  `.github/workflows/deploy-docs.yml`; per-PR previews land from
  `pull_request` via `.github/workflows/deploy-docs-preview.yml`,
  with the GitHub Deployment created by the action's `gitHubToken`
  surfacing the preview URL on the PR sidebar.
- Cloudflare-side configuration lives in repo:
  - `apps/docs/wrangler.jsonc` — name, `pages_build_output_dir`,
    `compatibility_date`.
  - `apps/docs/public/_headers` — security globals + cache rules.
    Content-Security-Policy ships in **Report-Only** mode for the
    first deploy window; promotion to enforce-mode is a separate,
    explicitly-marked follow-up commit only after observed violation
    reports = 0 for ≥ 7 days. See `docs/runbooks/deploy-docs.md`.
  - `apps/docs/public/_redirects` — comment-only stub today;
    reserved for future canonical-host or legacy-URL aliases.
  - `apps/docs/public/robots.txt` — allow-all, references
    `/sitemap-index.xml`.
- Required secrets, user-managed in GitHub: `CLOUDFLARE_API_TOKEN`
  (Pages:Edit, account-scoped), `CLOUDFLARE_ACCOUNT_ID`. The deploy
  workflow uses the GH `production` environment so an optional
  reviewer gate can be added without editing the workflow.
- A repo-side post-build gate (`apps/docs/scripts/verify-dist-pages-artefacts.mjs`,
  chained into `apps/docs/package.json#scripts.build`) asserts that
  every required artefact reaches `dist/` before deploy.
- The site stays a pure SSG. No `@astrojs/cloudflare` adapter, no
  Pages Functions, no Workers, no KV / D1 / R2 bindings. Re-evaluate
  if SSR or edge work enters scope.

## Consequences

- Positive: build runs once in GitHub Actions where Node + pnpm are
  pinned alongside the rest of CI; no duplicate build environment
  on Cloudflare; preview URLs cost nothing extra; rollback is a CF
  dashboard click (or `wrangler pages deployment rollback`); secrets
  blast radius is one Pages:Edit token.
- Negative: PR previews require workflow-dispatch-style `pull_request`
  triggers, which GitHub denies access to repo secrets from forks; the
  `deploy-docs-preview.yml` workflow guards against fork PRs with an
  `if:` check rather than failing with a confusing auth error.
- Negative: a maintainer-managed `wrangler.jsonc` plus dashboard
  configuration must stay in agreement; we treat the file as the
  source of truth and document via `docs/runbooks/deploy-docs.md`.
- Follow-ups:
  - Promote CSP from Report-Only to enforce mode after observation
    window (tracked in Phase 2 closeout).
  - Reconsider the choice if SSR, Pages Functions, or Workers KV /
    R2 enter the docs scope.

## Alternatives considered

- **Stay on Netlify.** Rejected: never wired, account / billing
  alignment with the rest of `freeCodeCamp/*` favours CF; Netlify
  retention buys nothing for an SSG site.
- **Cloudflare Pages with Git integration.** Rejected: would require
  Cloudflare to re-install pnpm and run the predev / prebuild
  scripts (sprite copy, asset-kit build, ensure-uikit-built),
  duplicating the GitHub-Actions environment we already pin. PR
  previews work fine via direct upload + `--branch=$REF`.
- **Vercel.** Rejected on the same fCC-platform alignment grounds as
  Netlify.
- **Self-hosted (S3 + Cloudflare in front).** Rejected for an SSG
  docs site that fits Pages' free tier and gets PR previews + DNS
  - global CDN out of the box.

## References

- ADR-0001 (Node LTS floor) — composite action `node-version`
  (`22`) used by the deploy workflow.
- ADR-0006 (Husky v9 pre-commit) — local guardrails before push.
- `docs/runbooks/deploy-docs.md` — operator playbook for first
  deploy, DNS cutover, rollback, secret rotation, CSP enforce-mode
  promotion.
