---
'@freecodecamp/uikit': minor
'@freecodecamp/uikit-css': patch
---

Add `<Toast>`, `<Toaster>`, and `createToaster` — transient notifications
backed by Ark UI + Zag's toast machine. Variants `info`, `success`,
`warning`, `danger` (danger upgrades to `role="alert"` so errors announce
immediately). `createToaster()` returns a module-level store; call
`toaster.create({ type, title, description })` anywhere a handler wants
to flash a notification. Defaults: `top-end` placement, 5s auto-dismiss,
stack overlap on. Presentational `<Toast>` works standalone for custom
integrations.
