# 0000 - Record architecture decisions

- Status: Accepted
- Date: 2026-05-01
- Deciders: UIKit core maintainers

## Context

UIKit is a multi-package monorepo crossing CSS tokens, React components,
vanilla JS runtime, Tailwind preset, an icon set, and an Astro docs site.
Decisions about Node version floor, formatter / linter choice, peer pin
strategy, and release process surface across many files; without a written
record, contributors and reviewers cannot reconstruct the "why" from the
code alone.

## Decision

Adopt MADR-style architecture decision records under `docs/adr/`.

- Each decision is a single Markdown file: `NNNN-kebab-title.md`.
- IDs are monotonic.
- Status is one of `Proposed`, `Accepted`, `Superseded by NNNN`, `Deprecated`.
- Decisions are immutable after acceptance; corrections land as new ADRs that supersede.
- `docs/adr/README.md` is the index.

## Consequences

- Positive: locked decisions live in version control, citable from code, commit messages, and `docs/tooling.md`.
- Negative: small writing tax per decision.
- Follow-ups: cross-link relevant ADRs from each `docs/*` page that depends on them.

## Alternatives considered

- **Inline comments only** - too easy to lose; fragmented across files.
- **GitHub Discussions** - drifts away from source; no version snapshot for offline / fresh-clone work.
