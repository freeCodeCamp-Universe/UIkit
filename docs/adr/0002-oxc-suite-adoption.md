# 0002 - Adopt the oxc suite (oxlint + oxfmt)

- Status: Accepted
- Date: 2026-05-01
- Deciders: UIKit core maintainers

## Context

The Phase 1 modernization wave evaluated replacing the legacy ESLint + Prettier
toolchain with the [oxc](https://oxc.rs) suite. Wall-clock probe on the
existing repo:

- `pnpm lint` (turbo + eslint per package) - ~11 s
- `pnpm exec oxlint .` (one process, 326 files) - 12 ms
- `pnpm exec oxfmt --check .` (376 files) - ~550 ms

oxlint accepts `.astro` files (no parse errors), but `oxfmt 0.47.0` does not
yet handle `.astro`, and emits a `printWidth` config error on `.md`.

## Decision

Replace ESLint with oxlint and Prettier (for js/ts/json) with oxfmt. Retain
Prettier + `prettier-plugin-astro` only for the file globs oxfmt cannot
yet format.

| File matrix                    | Tool                            |
| ------------------------------ | ------------------------------- |
| `**/*.{js,jsx,mjs,cjs,ts,tsx}` | `oxlint --fix`, `oxfmt --write` |
| `**/*.{json,jsonc}`            | `oxfmt --write`                 |
| `**/*.{astro,md,mdx,yaml,yml}` | `prettier --write`              |

- `.oxlintrc.json` mirrors current lint semantics: `no-unused-vars` with
  `^_` prefix exception, `typescript/no-empty-object-type` allowing
  single-extends interfaces.
- The `unicorn` plugin is disabled to preserve previous rule semantics
  (revisit in v1.1).
- `prettier-plugin-astro` 0.14.1 is verified compatible with Astro 6.

Removed devDependencies: `eslint`, `@eslint/js`, `eslint-config-prettier`,
`eslint-plugin-astro`, `eslint-plugin-prettier`, `typescript-eslint`,
`globals`. Added: `oxlint`, `oxfmt`.

`renovate.json` allowlist updated: `eslint*`/`@eslint/**`/`typescript-eslint`
removed, `oxlint`/`oxfmt`/`@oxc-project/**` added.

## Consequences

- Positive: ~1000× lint speedup, ~20× format speedup; lower CI minutes.
- Negative: oxlint rule set is younger; some niche rules (e.g. `unicorn/no-useless-fallback-in-spread`) flag findings the old config did not.
- Negative: split formatter requires a glob carve-out in `lint-staged` and an
  awareness of which tool owns each file type.
- Follow-ups: remove `prettier` and `prettier-plugin-astro` once oxfmt ships
  astro + markdown support. Track in `docs/v1.1-backlog.md`.

## Alternatives considered

- **Stay on ESLint + Prettier** - no parity speed, more maintenance per upstream churn.
- **Biome** - single-binary alternative; lacks astro support too, higher migration cost from existing ESLint flat config.
- **oxc only, drop astro lint+format entirely** - would lose `.astro` formatting; rejected.
