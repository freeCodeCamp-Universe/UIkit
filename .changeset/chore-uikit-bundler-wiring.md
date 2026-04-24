---
'@freecodecamp/uikit': minor
---

Wire tsup + per-layer exports map for `@freecodecamp/uikit`. Build
now emits ESM+CJS+d.ts under `dist/` for the root barrel plus one
entry per layer (`primitives`, `forms`, `overlays`, `navigation`,
`data-display`, `layouts`). Peers (`react`, `react-dom`,
`@ark-ui/react`) stay external. Unblocks the first real npm cut.
