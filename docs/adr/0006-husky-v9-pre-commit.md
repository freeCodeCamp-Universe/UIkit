# 0006 - Husky v9 pre-commit layout

- Status: Accepted
- Date: 2026-05-01
- Deciders: UIKit core maintainers

## Context

`.husky/_/husky.sh` contains a banner reading "husky - DEPRECATED. Please
remove the following two lines …". The string surfaced as a P3 finding in
the modernization audit. Probe revealed the file is husky v9's
backward-compat shim for projects that still source `_/husky.sh` from their
hook scripts (the v8 idiom). Our `.husky/pre-commit` is the modern v9
form (`pnpm lint-staged` only - no `_/husky.sh` source line) and never
invokes the shim. Eleven Phase 1 commits ran the hook with no DEPRECATED
output emitted.

`git config core.hooksPath` must remain `.husky/_` for husky v9 to take
effect. During Phase 1 a stray rtk wrapper invocation set the value to
`--version/_`, causing pre-commit to fail with `sh: --version/_/pre-commit:
invalid option`. Recovery: `git config core.hooksPath .husky/_`.

## Decision

- Stay on Husky v9. No regen needed.
- `.husky/pre-commit` body is exactly `pnpm lint-staged`.
- `.husky/_/` directory and the deprecation shim it contains are part of the
  install footprint; do not delete.
- Bootstrap is the `prepare` script: `is-ci || husky` in root `package.json`.
  CI skips via `is-ci`; local installs run husky.
- If `git config core.hooksPath` drifts, restore manually as documented in
  `docs/tooling.md`.

## Consequences

- Positive: zero hook regen needed. Deprecation banner does not fire for our
  layout.
- Negative: the `_/husky.sh` file looks alarming to readers who don't know
  it is dormant.
- Follow-ups: drop the file entirely once Husky v10 ships and
  `freeCodeCamp/UIkit` upgrades.

## Alternatives considered

- **Hand-write `pre-commit`, drop husky** - loses the cross-platform install
  story and the standard `prepare` flow.
- **Switch to `lefthook` or `simple-git-hooks`** - no tangible win for our
  current hook surface (one pre-commit command).
