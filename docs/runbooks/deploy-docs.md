# Runbook - Deploy the docs site to Cloudflare Pages

Operator playbook for `apps/docs` (the `@freecodecamp/uikit-docs`
Astro site) on Cloudflare Pages. Cite this file from any incident,
GitHub-App audit, or first-deploy ticket.

Decision context: [ADR-0008](../adr/0008-cloudflare-pages-git-integration.md)
(supersedes [ADR-0007](../adr/0007-cloudflare-pages-docs-deploy.md)).
Repository wiring: `apps/docs/public/{_headers,_redirects,robots.txt}`,
`apps/docs/scripts/verify-dist-pages-artefacts.mjs`,
`apps/docs/src/_meta/pages-config.test.ts`.

The zero-build CDN bundle (`styles.min.css`, `uikit.global.js`,
`sprite.svg`, fonts, `manifest.json`) ships from the same deploy, at
`/cdn/`. It is built by `apps/docs/scripts/build-cdn-bundle.mjs`
during `prebuild`/`predev` and covered by the same post-build gate.
See [ADR-0010](../adr/0010-cdn-bundle-ships-with-docs-deploy.md) - it
is rolling/unversioned, not a separate release.

## Glossary

- **Project**: Cloudflare Pages project named `fcc-design`. Git
  integration mode (no direct uploads).
- **Production branch**: `main`. CF Pages tags every deployment
  from `main` as production.
- **Custom domain**: `design.freecodecamp.org`. Maps to the
  project via CF Pages → Custom Domains.
- **Git integration**: deploy mode where the Cloudflare GitHub App
  watches the connected repo, builds on CF infra, and uploads the
  result. No `CLOUDFLARE_API_TOKEN` lives in repo secrets.
- **Preview**: deployment to `https://<branch>.fcc-design.pages.dev`
  for any non-production branch. Fork PRs receive previews
  automatically.

## Prerequisites (one-time, user-owned)

1. **Cloudflare account access** with `Pages: Edit` on the
   freeCodeCamp account.
2. **GitHub repo admin** for `freeCodeCamp/UIkit` (to install the
   Cloudflare GitHub App).
3. **DNS access** for `freecodecamp.org` (or whichever zone owns
   `design.freecodecamp.org`).

## First-deploy procedure

Run in order. Stop and triage if any step fails - do **not** skip.

### 1. Provision the Cloudflare Pages project

CF dashboard → Workers & Pages → Create → Pages → **Connect to Git**.

1. **Install the Cloudflare GitHub App** on `freeCodeCamp/UIkit`
   when prompted. Org admin approval may be required.
2. Select the repo. Project name: `fcc-design`. Production branch:
   `main`.
3. Build settings:
   - Framework preset: **None**.
   - Build command: `pnpm install --frozen-lockfile && pnpm build:docs`.
   - Build output directory: `apps/docs/dist`.
   - Root directory: leave default (repo root).
4. Environment variables (Production + Preview):
   - `NODE_VERSION` = `22` (matches `engines.node>=22`).
5. **Save and Deploy**.

The first build may take ~3–5 min (cold pnpm cache, full workspace
build).

### 2. Trigger a deploy

Subsequent deploys land automatically:

- Push to `main` → production deploy.
- Open PR (canonical or fork) → preview deploy at
  `https://<branch>.fcc-design.pages.dev`. CF posts the preview
  URL as a PR comment.

To manually re-run a deploy: CF dashboard → `fcc-design` →
Deployments → "Retry deployment".

Verify in the build log:

- `pnpm install` completes.
- `pnpm build:docs` exits 0 and the post-build gate prints
  `✓ Cloudflare Pages artefacts present in dist/ (6 files)`.

Smoke-test the deployment URL in a browser:

- `/` renders the landing page.
- `/components/`, `/handbook/`, `/brand/`, `/playground/` render.
- `/sitemap-index.xml` returns 200.
- `/robots.txt` shows the absolute `Sitemap:` line.
- DevTools → Network → `/_astro/<hash>.js`:
  `Cache-Control: public, max-age=31536000, immutable`.
- DevTools → Network → `/`: every security global
  (`Strict-Transport-Security`, `X-Content-Type-Options`,
  `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`,
  `Content-Security-Policy-Report-Only`).

### 3. Attach the custom domain

CF dashboard → `fcc-design` → Custom Domains → **Set up a domain**
→ enter `design.freecodecamp.org`.

If `freecodecamp.org` is a CF zone, CF auto-creates the CNAME. If
not, CF prints the CNAME content; add it at the DNS provider
manually.

Wait for the certificate provisioning indicator to turn green
(usually < 10 min). Verify:

```bash
dig +short design.freecodecamp.org
curl -I https://design.freecodecamp.org
```

`curl` should show a `cf-ray:` header and a `200` status.

Re-run the smoke checks against the apex URL.

## Rollback

In order of preference:

### Option A - CF dashboard rollback (fastest)

CF dashboard → `fcc-design` → Deployments → find the last
known-good deployment → "Manage deployment" → "Rollback to this
deployment".

Instant, no rebuild.

### Option B - Git revert

`git revert <commit>` on `main`, push. CF Git integration
redeploys automatically. Use this when the bad change is in source
rather than `_headers` / config.

### Option C - `wrangler` CLI (advanced)

For operators with local CF credentials:

```bash
pnpm dlx wrangler pages deployment list --project-name=fcc-design
pnpm dlx wrangler pages deployment rollback <deployment-id> \
  --project-name=fcc-design
```

### Option D - DNS detach (last resort)

CF dashboard → Custom Domains → `design.freecodecamp.org` →
Remove. The site returns DNS-NXDOMAIN until reattached. Use only
when the entire project is compromised.

## Cache-poisoning awareness

`_headers` declares `max-age=31536000, immutable` for
`/_astro/*` and `/assets/*`. A bad CSP / HSTS sticks for up to a
year on browsers that already cached an asset. Mitigations:

- CSP ships in `Content-Security-Policy-Report-Only` for the first
  deploy window. Promotion to enforce-mode is a separate, explicit
  follow-up commit only after observed violation reports = 0 for
  ≥ 7 days.
- HSTS uses `max-age=63072000; includeSubDomains; preload` on day
  one. Removing HSTS once shipped is hard; verify the policy is
  correct _before_ the first cutover.

## Promote CSP from Report-Only to enforce mode

After the observation window:

1. Set up a CSP report endpoint (CF logs / GlitchTip / self-hosted)
   and add the URI to the policy via `report-to`.
2. Wait ≥ 7 days. Read the report stream end-to-end.
3. If violations = 0, open a PR that swaps
   `Content-Security-Policy-Report-Only:` for
   `Content-Security-Policy:` in `apps/docs/public/_headers`.
   Update `apps/docs/src/_meta/pages-config.test.ts` accordingly.
4. Land it on `main`; watch the first prod deploy.
5. If violations appear post-flip, revert immediately (Option B)
   and re-tune the policy in Report-Only first.

## GitHub App audit

The CF GitHub App is the only credential CF holds for the repo.

To audit the App's scope:

GitHub → Settings → Integrations → Applications → Cloudflare Pages
→ **Configure**.

To revoke (e.g., after suspected compromise): same page →
**Suspend** or **Uninstall**. Re-installing follows the original
Step 1 procedure.

To rotate to a different account / org:

1. Uninstall the App on the old org.
2. Re-install on the target org.
3. CF detects the move; reconnect the project under Settings →
   Builds & deployments → Source.

## Diagnostics

| Symptom                                              | First check                                                     |
| ---------------------------------------------------- | --------------------------------------------------------------- |
| Build fails at `pnpm install`                        | `NODE_VERSION` env var set on project; pnpm version inferred    |
| Build fails at `pnpm build:docs`                     | Same as local: read the log; turbo task graph + Astro build     |
| Post-build gate prints "missing artefact"            | Public folder lost a file; check `apps/docs/public/`            |
| 404 on `/_astro/<hash>.js`                           | Build output dir mismatch; verify `apps/docs/dist` setting      |
| 500 / blank page after deploy                        | CSP enforce blocked a runtime asset; revert with Option B       |
| `cf-ray` header missing on `design.freecodecamp.org` | DNS not yet pointed at CF Pages; confirm CNAME                  |
| PR has no preview comment                            | CF GitHub App not installed on repo; or App suspended           |
| Fork PR shows no preview                             | Expected on first push from the fork; CF deploys on second push |

## Hand-off contract

This file is the operator's source of truth for everything outside
the repo (CF dashboard state, GitHub App, DNS). Repo state is the
source of truth for everything inside the repo. Disagreements
between the two are bugs; reconcile by reading
[ADR-0008](../adr/0008-cloudflare-pages-git-integration.md) and
following the procedures here.
