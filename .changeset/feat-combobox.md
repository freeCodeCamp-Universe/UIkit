---
'@freecodecamp/uikit': minor
'@freecodecamp/uikit-css': patch
'@freecodecamp/uikit-js': minor
---

Add `<Combobox>` — the marquee Tier 4 component. Text input paired
with a filterable option list, shipped with both a React controlled
layer and a vanilla runtime adapter that share a single DOM contract.

- `@freecodecamp/uikit`: `<Combobox>` with `items`, `value`,
  `inputValue`, `onValueChange`, `onInputValueChange`, `renderItem`,
  `placeholder`. Exports `filterItemsByLabel` — the same
  case-insensitive substring predicate the vanilla adapter uses. Sync
  filter only; async filtering is deferred to Wave 4 polish.
- `@freecodecamp/uikit-js`: `adapters/combobox.ts` wires
  `[data-uikit-combobox]` roots to input filtering, arrow-key / Enter
  / Escape navigation, option click selection, and dispatches
  `uikit:combobox-change` + `uikit:combobox-input` CustomEvents.
- `@freecodecamp/uikit-css`: `.combobox` wrapper with `__input`,
  `__list`, and `__item` parts carrying selected / hover / disabled /
  focus-visible states and `[hidden]` support for filtered items.
