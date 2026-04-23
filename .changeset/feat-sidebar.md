---
'@freecodecamp/uikit': minor
'@freecodecamp/uikit-css': patch
---

Add `<Sidebar>` compound navigation component — `Sidebar` wraps an
`<aside role="navigation">`, `SidebarSection` groups items with an
optional mono terminal eyebrow label, and `SidebarItem` renders as
`<a>` when `href` is provided (otherwise `<button type="button">`).
Active items carry `aria-current="page"` and `data-active="true"` for
styling. Icon slot renders into `.sidebar__icon` before the label.
