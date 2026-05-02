# Architecture Decision Records

Short, dated, immutable records of decisions that shape the UIKit monorepo.
Format follows [MADR](https://adr.github.io/madr/) (lightly trimmed).

## Index

| ID   | Title                                                                     | Status   | Date       |
| ---- | ------------------------------------------------------------------------- | -------- | ---------- |
| 0000 | [Record architecture decisions](./0000-record-architecture-decisions.md)  | Accepted | 2026-05-01 |
| 0001 | [Node LTS floor and CI matrix](./0001-node-lts-floor.md)                  | Accepted | 2026-05-01 |
| 0002 | [Adopt the oxc suite (oxlint + oxfmt)](./0002-oxc-suite-adoption.md)      | Accepted | 2026-05-01 |
| 0003 | [Pre-publish version reset to 0.1.0](./0003-pre-publish-version-reset.md) | Accepted | 2026-05-01 |
| 0004 | [Canonical repository URL casing](./0004-canonical-repository-url.md)     | Accepted | 2026-05-01 |
| 0005 | [Tailwind v4 as the only supported peer](./0005-tailwind-v4-only-peer.md) | Accepted | 2026-05-01 |
| 0006 | [Husky v9 pre-commit layout](./0006-husky-v9-pre-commit.md)               | Accepted | 2026-05-01 |
| 0007 | [Cloudflare Pages docs deploy](./0007-cloudflare-pages-docs-deploy.md)    | Accepted | 2026-05-02 |

## Rules

- One file per decision. Filename = `NNNN-kebab-title.md`.
- Status is `Proposed` / `Accepted` / `Superseded by NNNN` / `Deprecated`.
- Decisions are immutable once accepted; superseding decisions land as new ADRs.
- Cite ADRs from `docs/tooling.md`, code comments, and commit bodies when locked decisions appear.

## Template

```markdown
# NNNN — Title

- Status: Proposed | Accepted | Superseded by 0XXX | Deprecated
- Date: YYYY-MM-DD
- Deciders: <names or roles>

## Context

What is the problem? What constraints / drivers force a choice?

## Decision

The actual decision, in one or two sentences.

## Consequences

- Positive: …
- Negative / trade-offs: …
- Follow-ups: link to issues / backlog items.

## Alternatives considered

- Option A — why not.
- Option B — why not.
```
