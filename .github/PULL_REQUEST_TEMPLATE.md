## Summary

What changes? Why?

## Linked issue

Closes #<id> (or `n/a`).

## Type of change

- [ ] feat — new behavior
- [ ] fix — bug fix
- [ ] refactor — no behavior change
- [ ] docs — documentation only
- [ ] chore / ci / build — tooling, infra
- [ ] test — tests only

## Pre-flight checklist

- [ ] `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm format:check` clean locally
- [ ] Visual goldens refreshed if UI changed (`pnpm test:visual:update` on macOS;
      Linux goldens regenerated via the Playwright Docker image — see
      [docs/runbooks/deploy-docs.md](../docs/runbooks/deploy-docs.md))
- [ ] `apps/docs/public/{_headers,_redirects,robots.txt}` unchanged or
      rebaselined deliberately
- [ ] ADR added or updated if a locked decision changes (see
      [docs/adr/README.md](../docs/adr/README.md))

## Screenshots / GIF

(Optional — drag images here for UI changes.)
