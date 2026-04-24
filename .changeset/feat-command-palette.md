---
'@freecodecamp/uikit': minor
'@freecodecamp/uikit-css': patch
---

Add `<CommandPalette>` — keyboard-driven launcher with grouped
filterable items, shortcut badges, and an optional `emptyState` slot.
Arrow Up/Down navigates, Enter fires `onSelect`, Escape fires
`onClose`, backdrop click closes. Client-side filter matches item
`label` + optional `keywords` with case-insensitive substring. Supports
controlled (`value` + `onValueChange`) or uncontrolled search. Root is
`role="dialog" aria-modal="true"`; items carry `role="option"` with
`aria-selected` tracking the keyboard cursor.
