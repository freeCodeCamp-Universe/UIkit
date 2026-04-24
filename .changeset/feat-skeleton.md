---
'@freecodecamp/uikit': minor
'@freecodecamp/uikit-css': patch
---

Add `<Skeleton>` — loading placeholder with shimmer animation. Variants
`rect` (default), `circle` (for avatars), and `text` (stacks `lines` line
bars, last one 65% width to mimic a paragraph). Emits `role="status"` +
`aria-busy="true"` + `aria-live="polite"` so assistive tech announces
the pending region; optional `label` prop surfaces that announcement
via a visually-hidden `.sr-only` span. Shimmer pauses under
`prefers-reduced-motion: reduce`.
