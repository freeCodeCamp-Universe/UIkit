---
'@freecodecamp/uikit': minor
'@freecodecamp/uikit-css': patch
---

Add `<Avatar>` primitive — square badge with image + two-letter
initials fallback + optional presence dot. Three sizes
(`sm | md | lg`). When `src` is absent, the container carries
`aria-label={name}` and initials are `aria-hidden`; when `src`
is present, `name` becomes the `alt` text.
