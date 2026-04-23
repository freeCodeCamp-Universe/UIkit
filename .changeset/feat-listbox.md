---
'@freecodecamp/uikit': minor
'@freecodecamp/uikit-css': patch
'@freecodecamp/uikit-js': minor
---

Add `<Listbox>` navigation component — second Tier 4 entry with both
React and vanilla runtime layers sharing a single DOM contract.

- `@freecodecamp/uikit`: `<Listbox>` controlled component accepting
  `items`, `value`, `selectionMode` ('single' | 'multiple'), and
  `onValueChange`. Renders `<ul role="listbox">` with
  `aria-multiselectable` when multi; each item is a
  `<li role="option">` carrying `aria-selected`, `aria-disabled`,
  and `data-value`.
- `@freecodecamp/uikit-js`: `adapters/listbox.ts` wires
  `[data-uikit-listbox]` roots to arrow-key navigation, Home/End,
  Enter/Space to toggle, and a 600 ms type-ahead prefix jump.
  Fires bubbling `uikit:listbox-change` with `detail.value`.
- `@freecodecamp/uikit-css`: `.listbox` + `.listbox__option` with
  selected / hover / disabled / focus-visible states.
