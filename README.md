# fCC UIKit

A copy-paste component library for teams shipping learning tools.
Built in freeCodeCamp's Command-line Chic language — dark-first, flat
surfaces, square corners, no shadow. Twenty-one production components
with matched React and vanilla flavors.

## Quick start

Add one line to your app's entry CSS:

```css
@import url("https://cdn.freecodecamp.org/uikit/styles.min.css");
```

Fonts, tokens, and every component class come with it. Use the BEM
class names in any framework:

```tsx
<button className="btn btn--cta">Start curriculum</button>
<span className="badge badge--success">Passed</span>
```

Full walkthrough with a Windmill raw-app example lives in the
[**CDN guide**](./src/pages/guides/cdn.astro) (visible at `/guides/cdn`
once you run the storybook).

## Fallbacks — pick how deep you want to fork

When the CDN isn't an option, the kit still works. Each tier ships the
same visual result with a different level of ownership. Full details in
the [**Copy & vendor guide**](./src/pages/guides/copy-paste.astro) (at
`/guides/copy-paste`).

- **Vendor the compiled bundle.** Run `pnpm build:cdn` and commit the
  resulting `dist-cdn/uikit/` into your app. No network dependency.
- **Paste the source CSS.** Copy `src/styles/tokens.css` and
  `src/styles/components.css` into your own stylesheet folder.
- **Paste individual snippets.** Grep `components.css` for the rule
  block you need. Each component's rules are independent.
- **Copy the React component file.** Each `.tsx` under
  `src/components/react/` is a thin className wrapper — drop one in
  and pair it with matching CSS.

## Run locally

```bash
pnpm install
pnpm dev          # storybook + guides at http://localhost:4321
pnpm build        # Astro static build → dist/
pnpm build:cdn    # produce CDN bundle → dist-cdn/uikit/
pnpm verify:cdn   # sanity-check the CDN bundle
pnpm test         # unit tests (node:test + tsx)
```

## Architecture

- `src/styles/tokens.css` — palette, type scale, spacing, `@font-face`
- `src/styles/components.css` — vanilla CSS for every component
- `src/styles/showcase.css` — site chrome for the storybook
- `src/components/react/*.tsx` — typed React wrappers around the CSS classes
- `src/data/nav.ts` — single source of truth for the sidebar
- `src/pages/index.astro` — component storybook (the SPA)
- `src/pages/guides/*.astro` — usage guides (separate pages)
- `scripts/build-cdn.mjs` — lightningcss-driven CDN pipeline
- `scripts/verify-cdn.mjs` — integrity + URL-rewrite checker

## License

BSD-3-Clause. See [LICENSE](LICENSE).
