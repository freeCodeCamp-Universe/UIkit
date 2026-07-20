# 0001 - Node LTS floor and CI matrix

- Status: Accepted
- Date: 2026-05-01
- Deciders: UIKit core maintainers

## Context

The repo had four conflicting Node version values:

- `engines.node = ">=20"` (root `package.json`)
- `.nvmrc = 22`
- composite GitHub Action default = `22`
- no Node matrix in CI; single Node defaulted by the action

Node 20 reached EOL on 2026-04-30. Node 22 is in Maintenance LTS until
2027-04, Node 24 entered Active LTS in 2025-10. Library publishers should
not promise an EOL'd Node version through `engines.node`.

## Decision

- Engine floor: `engines.node = ">=22"` in root and every public `packages/*/package.json`.
- `.nvmrc`: `24` - Active LTS for local development.
- Composite action default: `22` - exercise the floor.
- CI test matrix (`re-test.yml`): `[22.x, 24.x]` - verify both ends of the supported range.
- Coverage upload only on Node `24.x` to avoid artifact-name collision across matrix.
- `@types/node` major must match the floor. Pinned to `^22.19.17` in every package that imports it.

A meta-gate at `scripts/check-node-versions.mjs` (run via `pnpm check:node-versions`)
enforces every clause in this ADR.

## Consequences

- Positive: consumers reading `engines.node` see a supported Node version. Floor and Active LTS are both exercised in CI.
- Negative: Node 20 users must upgrade. Existing freeCodeCamp infra already runs Node 22+.
- Follow-ups: bump the meta-gate constants when Node 22 hits EOL (planned 2027-04). At that point: floor → `>=24`, `.nvmrc` → next Active LTS.

## Alternatives considered

- **Floor `>=20`** - Node 20 is EOL; rejected.
- **Floor `>=24` (Active LTS only)** - narrower support window forces consumers to track LTS rotation faster than UIKit needs to.
- **Single CI Node version** - misses bugs that hit only one major.
