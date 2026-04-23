---
'@freecodecamp/uikit': minor
'@freecodecamp/uikit-css': patch
---

Add `<Divider>` primitive — `<hr role="separator">` with `orientation`
(`horizontal | vertical`), `variant` (`solid | dashed`), and a
`decorative` escape hatch that drops the role and sets `aria-hidden`.
Vertical dividers automatically carry `aria-orientation="vertical"`.
