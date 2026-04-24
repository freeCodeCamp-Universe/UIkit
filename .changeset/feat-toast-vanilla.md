---
'@freecodecamp/uikit-js': minor
---

Add vanilla `toaster` + `toastTrigger` adapters. Declarative wiring
via `[data-uikit-toaster]` container + `[data-uikit-toast-trigger]`
buttons carrying `data-toast-type` / `-title` / `-description` /
`-duration` / `-dismissible` attributes. Auto-dismisses after 5s
(override with `data-toast-duration`), pauses on hover, honours
`prefers-reduced-motion`. Emits the same `.toast / .toast--<variant>`
DOM contract the React layer's `<Toast>` renders so both layers share
`@freecodecamp/uikit-css` byte-for-byte.
