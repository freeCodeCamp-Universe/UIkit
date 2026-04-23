---
'@freecodecamp/uikit': minor
'@freecodecamp/uikit-css': patch
'@freecodecamp/uikit-js': minor
---

Add `<Pagination>` navigation component — first Tier 4 entry shipping
both a React renderer and a vanilla runtime adapter.

- `@freecodecamp/uikit`: `<Pagination>` controlled component with
  `count`, `pageSize`, `page`, `siblingCount`, `onPageChange`,
  `prevLabel`, and `nextLabel` props. Exports a pure `paginationRange`
  helper that mirrors the Zag machine output so the vanilla adapter
  can render identical markup when the Zag-parity review substitutes
  the machine in.
- `@freecodecamp/uikit-js`: `adapters/pagination.ts` wires
  `[data-uikit-pagination]` roots to page switching with arrow /
  Home / End keyboard navigation and dispatches a bubbling
  `uikit:pagination-change` CustomEvent on every navigation.
- `@freecodecamp/uikit-css`: `.pagination` + numeric/prev/next
  button styling + ellipsis filler.
