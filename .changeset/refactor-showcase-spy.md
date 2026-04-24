---
'@freecodecamp/uikit-docs': patch
---

Extracted the `/showcase` scroll-spy IIFE into its own module at
`src/scripts/showcase-spy.client.ts`. Behaviour is unchanged (same
rootMargin, same `data-active` contract, same `window.__NO_SPY__`
opt-out), but we gain: a typed module the rest of the site can import,
a deep-link path for `#section-id` that primes the active state
on first paint, and a cleaner `showcase.astro` with no inline
JavaScript.
