---
'@freecodecamp/uikit': minor
'@freecodecamp/uikit-css': patch
'@freecodecamp/uikit-js': minor
---

Wave 2 Phase 2D — Tier 4 interactives complete (internal markers
0.6.0 / 0.7.0 / 0.8.0 aggregated here; no mid-sprint npm release per
the revised strategy — everything lands with the Wave 5 v1.0.0 cut).

Ships three dual-layer interactive navigation components, each with a
React controlled layer and a vanilla runtime adapter sharing a single
DOM contract:

- **Pagination** — controlled `count` + `pageSize` + `page` with an
  exported `paginationRange` helper that produces the compact
  ellipsis list. Vanilla adapter adds Arrow / Home / End keyboard
  nav and a `uikit:pagination-change` CustomEvent.
- **Listbox** — single and multi-select via `selectionMode`;
  `aria-multiselectable` for multi. Vanilla adapter ships arrow-key
  navigation, Enter/Space toggle, and 600 ms type-ahead prefix jumps.
- **Combobox** — marquee Wave 2 component. Text input paired with a
  filterable option list, `renderItem` override for rich rows, and
  an exported `filterItemsByLabel` helper. Vanilla adapter handles
  substring filtering, arrow keys, Enter to select, Escape to close,
  and dispatches `uikit:combobox-change` + `uikit:combobox-input`
  CustomEvents. Async filtering deferred to Wave 4 polish.

Exit gate: 134/134 uikit unit tests pass, `@freecodecamp/uikit-js`
IIFE at 7.84 KB (was 978 B after Phase 2A), docs site renders
`/components/pagination`, `/components/listbox`, `/components/combobox`.
