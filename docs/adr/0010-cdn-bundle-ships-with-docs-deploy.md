# 0010 - CDN bundle ships as a rolling asset in the docs deploy

- Status: Accepted
- Date: 2026-07-17
- Deciders: UIKit core maintainers
- Supersedes: point 5 of [0009](./0009-copy-source-registry-distribution.md)
  only (the CDN bundle stays; its release path changes)

## Context

[ADR-0009](./0009-copy-source-registry-distribution.md) kept a CDN
bundle (`styles.min.css`, `uikit.global.js`, `sprite.svg`, fonts,
`manifest.json`) for zero-build HTML consumers, alongside the
copy-source registry. That bundle was built by `packages/uikit-cdn`,
versioned into `latest/`, `<major>/`, `<major>.<minor>/`,
`<version>/` alias directories keyed off
`packages/uikit/package.json`, and published by manually dispatching
`.github/workflows/release.yml`. That workflow opened a PR against
the separate `freeCodeCamp/cdn` repo (`CDN_PUSH_TOKEN`, human merge
required) to land the bundle at `cdn.freecodecamp.org/build/uikit/`.

The docs site itself already deploys with none of that ceremony:
[ADR-0008](./0008-cloudflare-pages-git-integration.md) put it on
Cloudflare Pages with Git integration - push to `main`, automatic
production deploy, no repo secret, no cross-repo PR.

UIKit is greenfield and unreleased. Nothing anywhere embeds a
version-pinned CDN URL (`cdn.freecodecamp.org/build/uikit/1.2.3/...`
or otherwise). The permanent version-alias history and the
cross-repo PR gate exist to protect consumers that don't exist yet -
that cost is not currently buying anything.

## Decision

1. **The CDN bundle is built inside `apps/docs`**, not a separate
   `packages/uikit-cdn` workspace. A new
   `apps/docs/scripts/build-cdn-bundle.mjs` (adapted from the deleted
   `packages/uikit-cdn/scripts/build.mjs`) runs in `predev`/`prebuild`
   alongside the existing sprite/asset-kit/uikit-build steps, writing
   to `apps/docs/public/cdn/`.
2. **The bundle is rolling and unversioned.** One flat directory -
   `styles.min.css`, `tokens.min.css`, `components.min.css`,
   `uikit.global.js`, `sprite.svg`, `fonts/`, `brand/`,
   `manifest.json`. No `latest/`/`<major>/`/`<version>/` aliases, no
   read of `packages/uikit/package.json` version.
3. **It deploys with the docs site**, as `design.freecodecamp.org/cdn/`,
   via the existing Cloudflare Pages Git-integration pipeline
   (ADR-0008). No separate release workflow, no second repo, no
   `CDN_PUSH_TOKEN`.
4. **`.github/workflows/release.yml` and `packages/uikit-cdn` are
   deleted.** The post-build gate
   (`apps/docs/scripts/verify-dist-pages-artefacts.mjs`) absorbs the
   integrity checks the deleted `uikit-cdn/scripts/verify.mjs` used to
   run (manifest hash verification, no absolute `/fonts/` URLs).

If a real external consumer later needs a version-pinned CDN URL that
can't be updated in place, reintroduce versioning then - as
key-addressed object storage (e.g. Cloudflare R2), not git-repo
directory aliasing - scoped to that actual need.

## Consequences

- Positive: one deploy pipeline for the whole site (docs + CDN
  bundle), matching ADR-0008's push-to-deploy model. No
  `CDN_PUSH_TOKEN`, no `freeCodeCamp/cdn` PR review step, no
  `packages/uikit-cdn` workspace to keep in sync with `uikit-js`/
  `uikit-icons`/`uikit-css` builds.
- Positive: `turbo.json`'s `@freecodecamp/uikit-cdn#build` task and
  `dist-cdn/**` output, and the root `build:cdn`/`verify:cdn`/`dev:cdn`
  scripts, are deleted along with the workspace.
- Negative: the CDN bundle URL changes shape - from
  `cdn.freecodecamp.org/build/uikit/<version>/...` (never actually
  shipped) to `design.freecodecamp.org/cdn/...` (unversioned). Since
  nothing consumed the old shape, this costs nothing today.
- Negative: no permanent version history. Accepted - see Decision
  point 4's escape hatch for if/when it's needed.
- Follow-up: revoke/delete the `CDN_PUSH_TOKEN` repo secret (never
  exercised for a real publish).

## Alternatives considered

- **Keep `packages/uikit-cdn` + `release.yml`, drop the PR (push
  directly to `freeCodeCamp/cdn`).** Rejected: still a second repo
  and a second pipeline to maintain for zero benefit while unreleased.
- **Cloudflare R2 / object storage now.** Rejected for now: correct
  once real version-pinned consumers exist (additive, key-based
  writes, no snapshot-reconstruction problem), but premature
  complexity for a bundle nothing depends on yet.
- **Drop the CDN bundle entirely.** Rejected: `uikit-js`'s global
  build exists specifically to serve zero-build HTML consumers per
  ADR-0009; removing it is a separate, larger decision than a deploy
  refactor.

## References

- [ADR-0008](./0008-cloudflare-pages-git-integration.md) - the
  push-to-deploy model this change extends to the CDN bundle.
- [ADR-0009](./0009-copy-source-registry-distribution.md) - point 5
  superseded here; everything else in that ADR is unaffected.
- `docs/runbooks/deploy-docs.md` - operator playbook, updated to note
  the CDN bundle now ships as part of the same deploy.
