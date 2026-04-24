---
'@freecodecamp/uikit': minor
'@freecodecamp/uikit-css': patch
---

Add `<EmptyState>` — centered placeholder for empty lists, zero-result
searches, and dashboard zero-states. Optional `icon`, `title`,
`description`, and `action` slots; the icon wrapper is `aria-hidden`
so it never duplicates the title text. Root is a plain `<div>` so
callers can layer `role="status"` or other semantics as the context
warrants.
