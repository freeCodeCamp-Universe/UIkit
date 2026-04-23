---
'@freecodecamp/uikit': minor
'@freecodecamp/uikit-css': patch
---

Wave 2 Phase 2B — Tier 1 + Tier 2 complete (internal marker 0.4.0; not
published during the sprint, aggregated into the Wave 5 v1.0.0 release).

Ships six components through the per-component delivery covenant
(source + colocated TDD tests + CSS block + barrel + MDX doc +
changeset):

- **Text** — polymorphic body-copy primitive (`as` prop, four sizes,
  two weights, three tones).
- **Heading** — `level` (1-6) decoupled from visual `size`
  (`display | xl | lg | md | sm`).
- **Divider** — horizontal + vertical with a dashed terminal variant.
- **Avatar** — square badge with two-letter initials fallback + optional
  presence dot; three sizes.
- **Fieldset** — native fieldset + legend pair carrying our border and
  spacing tokens; `tone="subtle"` drops to the tertiary border for
  nested groupings; `disabled` cascades through native semantics.
- **DescriptionList** — semantic dl/dt/dd rendered from an `items`
  array of `{ term, detail }` pairs; `vertical` (default) is a
  two-column grid, `inline` flows term/detail pairs for compact
  status strips.

Exit gate: 83/83 uikit unit tests pass, full monorepo build green,
docs site lists every new component under `/components/`.
