# 0003 - Pre-publish version reset to 0.1.0

- Status: Accepted
- Date: 2026-05-01
- Deciders: UIKit core maintainers

## Context

All five public packages (`@freecodecamp/uikit`, `@freecodecamp/uikit-css`,
`@freecodecamp/uikit-icons`, `@freecodecamp/uikit-js`,
`@freecodecamp/uikit-tailwind`) carried `version: "1.0.0"` in their
`package.json` despite never having been published to npm. Verified via
`npm view <pkg> versions` returning empty / 404 for each.

`1.0.0` implies stability and a public API contract that has not yet been
validated by real consumers. Shipping the first release at that floor would
remove room to make breaking changes during early adoption.

## Decision

Reset every public package version to `0.1.0` before the first npm publish.

- `apps/docs` and `packages/uikit-cdn` (private) keep their existing `0.1.0`.
- The reset is a single commit (`chore(release): reset all public versions to 0.1.0`).
- Direct `package.json` edit is the mechanism - Changesets does not support
  bump-down. This is acceptable because no version exists on npm yet.
- `pnpm release:check` (publint --strict + dry-run publish) must pass before
  the user runs `pnpm release` for the first time.

## Consequences

- Positive: room for breaking changes during the v0.x series; consumers
  understand the API is not yet frozen.
- Negative: the `1.0.0` history in git remains as commits; readers must
  understand it never shipped.
- Follow-ups: Adopt Changesets for every version bump after the first publish.
  No more direct `version` edits.

## Alternatives considered

- **Publish at 1.0.0** - premature stability promise; rejected.
- **Skip 0.x entirely and publish at 1.0.0-beta.x** - npm dist-tag complexity
  with no real benefit before adoption signal exists.
