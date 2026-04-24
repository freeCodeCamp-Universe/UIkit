---
'@freecodecamp/uikit': minor
'@freecodecamp/uikit-css': patch
---

Upgrade `<Sidebar>` API with collapsible sections and a route-matching
helper.

- `SidebarSection` now accepts `collapsible` and `defaultOpen` props.
  When `collapsible` is true the section renders as
  `<details class="sidebar__section sidebar__section--collapsible">`
  with a `<summary>` containing the eyebrow label and a rotating caret.
  Without `collapsible` the output is byte-identical to the previous
  `<section>` markup — no regression for existing consumers.
- Export `isActiveHref(path, href, { exact? })` — normalises trailing
  slashes and supports exact or descendant matching so consumers can
  drive `SidebarItem`'s `active` prop from `location.pathname` without
  hand-rolling string comparisons.
- `uikit-css` gains caret-rotation, hover, and left-accent active styles
  so external consumers inherit the upgraded look automatically.
