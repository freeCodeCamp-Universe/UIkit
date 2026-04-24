---
'@freecodecamp/uikit': minor
'@freecodecamp/uikit-css': patch
---

Wave 3 Phase 3B2 — compound pattern library complete (internal marker;
aggregated into the Wave 5 v1.0.0 release, no mid-sprint npm cut).

Ships three heavier patterns composed on top of the Wave 2 atoms and
the 3B1 warmup trio:

- **CommandPalette** (overlay) — keyboard-driven launcher with grouped
  filterable items, shortcut badges, and a configurable `emptyState`
  slot. Arrow Up/Down navigates, Enter fires `onSelect`, Escape fires
  `onClose`, backdrop click closes. Controlled or uncontrolled search.
- **FormStepper** (form) — numbered multi-step wizard. Status derives
  from `steps[]` array index (`complete` / `current` / `upcoming`);
  `isStepAccessible` gates forward progress for validation-driven
  flows. Progress list is a semantic `<ol aria-label>`; active step
  sets `aria-current="step"`.
- **DataTable** (data-display) — medium-scope tabular display with
  controlled sort (three-click cycle asc → desc → null), controlled
  selection (indeterminate select-all), native `<table>` semantics,
  and explicit `loading` + `emptyState` slots that plug into the
  Skeleton + EmptyState components shipped in 3B1.

Exit gate: 213/213 uikit unit tests, monorepo build green under turbo,
all three patterns listed at `/components/`.
