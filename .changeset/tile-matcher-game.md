---
'@freecodecamp/uikit': minor
'@freecodecamp/uikit-css': minor
---

feat(games): add TileMatcher — a data-driven memory / matching game

New `games` layer with `TileMatcher`. Builds a deck from `pairs` (one face →
identical match, two faces → related match), toggleable flip animation,
seeded shuffle, and `onMatch` / `onMismatch` / `onComplete` callbacks. Ships
`.tile-matcher` BEM styles in `@freecodecamp/uikit-css`.
