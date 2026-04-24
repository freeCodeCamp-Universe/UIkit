---
'@freecodecamp/uikit-docs': minor
---

Mobile navigation drawer: the sidebar becomes an off-canvas drawer at
≤900 px, opened via a new hamburger button in the header. Backdrop
click, Escape, and selecting a nav link all dismiss the drawer; focus
returns to the hamburger on Escape.

Wiring is vanilla JS in the existing `AppHeader.astro` inline script —
no React hydration, no additional bundle. The sidebar keeps its SSR
markup, so viewers without JavaScript still see it if the stylesheet
exposes it (e.g. via the browser's built-in print stylesheet or
prefers-reduced-motion fallback). Desktop layout is unchanged.

Header micro-tweaks that travel with the drawer: on ≤900 px the
primary header nav and the search-button label collapse to save room
for the hamburger + search-key affordance; the drawer itself contains
the full nav tree.

A Playwright spec (`drawer.spec.ts`) locks in the open-drawer golden
for the mobile viewport only; desktop + tablet skip.
