# 0004 - Canonical repository URL casing

- Status: Accepted
- Date: 2026-05-01
- Deciders: UIKit core maintainers

## Context

Earlier inventory work flagged a suspected drift between
`freeCodeCamp/UIkit.git` and `freeCodeCamp/ui.git` across `package.json`
`repository.url` fields. Empirical sweep
(`grep -rn "freeCodeCamp/ui" --include='*.json'`) returned zero matches -
all manifests already pointed at `freeCodeCamp/UIkit.git`. The drift was a
false positive from a stale documentation index.

## Decision

Canonical repository URL is `git+https://github.com/freeCodeCamp/UIkit.git`,
matching the GitHub organization's repo casing exactly. This applies to:

- `repository.url` in every `package.json`
- `bugs.url` in every `package.json`
- workflow file references
- documentation links

The convention is enforced by reviewing diffs; no automated meta-gate yet.

## Consequences

- Positive: npm pages, GitHub redirects, and `package.json` agree exactly.
  Consumers cloning via the URL get the canonical URL back.
- Negative: case-sensitive grep needed when adding new manifests.
- Follow-ups: consider adding a `publint` extension or custom meta-gate to
  enforce repository casing across the workspace.

## Alternatives considered

- **`freeCodeCamp/ui.git`** - does not match the GitHub repo; rejected.
- **All-lowercase `freecodecamp/uikit.git`** - works via GitHub redirect, but
  diverges from organization branding; rejected.
