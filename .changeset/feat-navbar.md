---
'@freecodecamp/uikit': minor
'@freecodecamp/uikit-css': patch
---

Add `<Navbar>` navigation component — top-of-page chrome with three
ReactNode slots (`start`, `center`, `end`) rendered inside a
`<header role="banner">`. Slot divs only render when the matching
prop is provided, so an empty Navbar collapses to an empty header.
At widths ≤ 768 px the center slot wraps to its own row so the start
and end rails stay on one line.
