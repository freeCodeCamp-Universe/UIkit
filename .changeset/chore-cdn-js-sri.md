---
'@freecodecamp/uikit-cdn': patch
---

Rebuild CDN bundle with the vanilla JS IIFE and icon sprite alongside the
existing CSS tree, and ship a W3C SRI hash (`sha384-<base64>`) in
manifest.json next to the existing sha256 content address. Consumers can
now paste `integrity="sha384-…"` straight onto `<link>` / `<script>` tags.
Layout additions per alias subtree: `uikit.global.js` (from uikit-js 4
adapters — dialog, pagination, listbox, combobox) and `sprite.svg` (from
the curated 60-glyph uikit-icons set). No API break: every previously
published URL still resolves identically.
