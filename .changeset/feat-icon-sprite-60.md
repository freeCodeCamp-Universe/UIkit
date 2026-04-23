---
'@freecodecamp/uikit-icons': minor
---

Expand the icon catalog from 5 pilot glyphs to 60 curated Lucide icons.
Covers arrows (chevron + arrow + sort), feedback (info, circle-alert,
triangle-alert, loader, circle-check, circle-x), object (file, file-text,
folder, code, terminal, book), identity (user, users, lock, unlock, key),
media (image, video, play, pause), math (plus, minus, equal), nav (menu,
grid, home, settings, log-out), editing (pencil, trash, download, upload),
and utility (calendar, clock, mail, globe, filter, bell, eye, eye-off,
heart, star, bookmark, share). Sources land in `src/svg/*.svg` and mirror
into the inline body map in `src/icons.ts`; `parity.test.ts` pins the
lockstep invariant. Upstream: lucide-static@0.469.0 (ISC).
