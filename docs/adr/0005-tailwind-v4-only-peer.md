# 0005 - Tailwind v4 as the only supported peer

- Status: Accepted
- Date: 2026-05-01
- Deciders: UIKit core maintainers

## Context

`@freecodecamp/uikit-tailwind` originally declared `peerDependencies.tailwindcss = ">=3 <5"`
to advertise dual v3 + v4 support. The dev pin was `tailwindcss ^4.2.4`, so
v3 was never exercised by tests. A probe via `tailwindcss-v3` aliased
devDep + a `satisfies Partial<Config>` type assertion against both
`tailwindcss` (v4) and `tailwindcss-v3` revealed structural divergence:

```
src/preset-compat.test.ts: Type 'UserConfig' is not assignable to type 'Partial<Config>'.
  Types of property 'darkMode' are incompatible.
    Type 'DarkModeStrategy | undefined' is not assignable to
    type 'Partial<DarkModeConfig> | undefined'.
```

Tailwind v3 and v4 share the `Config` symbol but the underlying type shapes
diverge enough that a single preset cannot pass strict type checks against
both majors.

## Decision

Narrow `peerDependencies.tailwindcss` to `^4.0.0`. Keep the dev pin at
`^4.2.4`. Drop the `tailwindcss-v3` alias devDep and the `preset-compat.test.ts`
probe (probe-only, not part of the test suite).

## Consequences

- Positive: peer pin matches reality. Consumers on Tailwind v3 will not
  silently install a preset that compiles for v4.
- Negative: Tailwind v3 consumers must upgrade to v4 to use this preset.
  Acceptable for a v0.x release; v3 hit EOL signals from upstream.
- Follow-ups: if a v3 consumer surfaces, ship a separate `preset-v3.ts` entry
  point and re-widen the peer; track in `docs/v1.1-backlog.md`.

## Alternatives considered

- **Keep `>=3 <5` peer + ignore type drift** - type contract lies to consumers;
  silent failures at compile.
- **Hand-roll a base type (`Pick<Config, 'theme'>`) shared between v3 + v4** -
  rejected for v0.1 because it requires custom type plumbing for one preset
  field shared across both.
- **Ship two distinct presets (`preset-v3` + `preset-v4`)** - viable but
  premature for v0.1; defer until v3 demand surfaces.
