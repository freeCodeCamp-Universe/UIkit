---
'@freecodecamp/uikit': minor
'@freecodecamp/uikit-css': patch
---

Add `<DataTable>` — medium-scope tabular display. Controlled sort
(`sortBy` + `onSortChange`, three-click cycle asc → desc → null) and
controlled selection (`selection: ReadonlySet<string>` +
`onSelectionChange`, with indeterminate select-all). Columns take
string-key or function accessors, optional `sortable`, `align`, and
`width`. `loading` emits `skeletonRows` shimmer rows; an empty `rows`
array renders the `emptyState` slot in a full-width cell. Native
`<table>` under the hood so screen readers and keyboard navigation
work out of the box. Out of scope (Wave 4): column pin/resize, row
virtualisation, multi-column sort.
