---
'@freecodecamp/uikit': minor
'@freecodecamp/uikit-css': patch
---

Wave 2 Phase 2C — Tier 3 form primitives complete (internal marker
0.5.0; not shipped during the sprint, aggregated into the Wave 5
v1.0.0 release).

Ships three form primitives through the per-component delivery
covenant (source + colocated TDD tests + CSS block + barrel + MDX
doc + changeset):

- **Radio + RadioGroup** — native `<input type="radio">` wrapped in a
  `.radio` `<label>` when `label` is supplied; RadioGroup propagates
  `name`, `value`, and `onChange` via React context so children stay
  declarative.
- **Select** — forwardRef wrapper over the native `<select>` with
  our border/spacing tokens and an inlined Lucide chevron glyph in
  the CSS background. No portal, no popover, no Combobox.
- **Textarea** — native textarea with terminal styling, `variant="mono"`
  for code/command capture, and an `autoResize` mode that grows the
  control with its content (disables the resize handle, swaps
  overflow to hidden, runs scrollHeight fit on input + when value
  changes).

Exit gate: 105/105 uikit unit tests pass, full monorepo build green,
docs site lists every new component under `/components/`.
