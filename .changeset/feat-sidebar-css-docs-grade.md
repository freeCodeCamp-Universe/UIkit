---
'@freecodecamp/uikit-css': patch
---

Docs-grade sidebar styling promoted to the public `uikit-css` layer:

- `.sidebar` is now sticky with `--sidebar-top` (defaults to `0`) driving
  both `top` and `max-height`, so any consumer gets a working rail out of
  the box and can offset for a fixed header by setting `--sidebar-top`.
- New public rules: `.sidebar__intro`, `.sidebar__intro-kicker`,
  `.sidebar__intro-title`, and `.sidebar__hint` — covers the "brand kicker
  - title + footer hint" pattern the docs site was carrying in its
    local `showcase.css` duplicate.

Retired the pre-component ad-hoc rules (`.sidebar__link*`, `.sidebar__list`,
`.sidebar__section-title`, and the docs copies of `.sidebar__intro*` /
`.sidebar__hint`) from the docs app. No consumer-visible classes change
names — `.sidebar__item[data-active='true']` keeps the same accent bar
introduced in the collapsible work.
