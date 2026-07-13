---
'@freecodecamp/uikit': minor
'@freecodecamp/uikit-css': minor
---

feat(games): add Hotspots — clickable regions over a background

New `Hotspots` component in the `games` layer: overlays clickable shapes on a
background image, component, or inline SVG. Quiz mode (`targetId`) reports
`onCorrect` / `onIncorrect` and reveals a hint after repeated misses; omit the
target for free selection via `onSelect`. Ships exported shape primitives
(`CircleHotspot`, `RectHotspot`, `EllipseHotspot`, `PolygonHotspot`) and
`.hotspots` BEM styles in `@freecodecamp/uikit-css`.
