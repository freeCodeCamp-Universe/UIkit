---
'@freecodecamp/uikit': minor
'@freecodecamp/uikit-css': patch
---

Add `<Breadcrumb>` navigation component (Wave 8 P4 / W8-5).

Compound API:

```tsx
import { Breadcrumb } from '@freecodecamp/uikit';

<Breadcrumb>
  <Breadcrumb.Item href='/'>Docs</Breadcrumb.Item>
  <Breadcrumb.Item href='/#navigation'>Navigation</Breadcrumb.Item>
  <Breadcrumb.Item active>Breadcrumb</Breadcrumb.Item>
</Breadcrumb>;
```

- Renders `<nav aria-label="Breadcrumb"><ol><li>…</li></ol></nav>`.
- The active item drops the link and emits `<span aria-current="page">`.
- The visible separator is a CSS `::after` pseudo-element on every
  non-last item — invisible to assistive tech.
- `href` is scheme-allowlisted (`https?:`, `/`, `#`, `mailto:`,
  `tel:`); anything else falls through to a non-link span and emits
  a `console.warn`. Mitigates an XSS surface where untrusted user
  input could otherwise reach an `<a href>`.

`uikit-css` adds the `.breadcrumb`, `.breadcrumb__list`,
`.breadcrumb__item`, `.breadcrumb__link`, and `.breadcrumb__current`
classes. The separator glyph is themable via the
`--breadcrumb-separator-content` custom property (defaults to `'/'`).
