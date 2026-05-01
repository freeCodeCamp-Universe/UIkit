[![freeCodeCamp Social Banner](https://cdn.freecodecamp.org/platform/universal/fcc_banner_new.png)](https://www.freecodecamp.org/)

# freeCodeCamp UIKit

[![Discord](https://img.shields.io/discord/692816967895220344?logo=discord&label=Discord&color=5865F2)](https://discord.gg/PRyKn3Vbay)
[![License: BSD-3-Clause](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](./LICENSE.md)
[![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](./.nvmrc)
[![pnpm](https://img.shields.io/badge/pnpm-10-orange)](./package.json)

Design system, React component library, vanilla-JS adapter, and CDN bundle that power the freeCodeCamp.org platform. Built CSS-first with design tokens, accessibility-tested against the WAI-ARIA Authoring Practices, and ships in three flavours: import as a React package, drop in via a `<script>` tag, or extend with the Tailwind preset.

## Packages

| Package                                                     | Description                                                           |
| ----------------------------------------------------------- | --------------------------------------------------------------------- |
| [`@freecodecamp/uikit`](./packages/uikit)                   | React component library — 47 components across 8 tiers                |
| [`@freecodecamp/uikit-css`](./packages/uikit-css)           | Design tokens, component CSS, fonts, brand assets                     |
| [`@freecodecamp/uikit-js`](./packages/uikit-js)             | Vanilla JS runtime — wires `data-uikit-*` attrs to Zag state machines |
| [`@freecodecamp/uikit-icons`](./packages/uikit-icons)       | Curated Lucide icon subset, React + sprite                            |
| [`@freecodecamp/uikit-tailwind`](./packages/uikit-tailwind) | Tailwind preset + plugin mirroring UIKit tokens                       |
| `@freecodecamp/uikit-cdn` _(internal)_                      | Builds the CDN bundle for `freeCodeCamp/cdn`                          |

## Quick start

### CDN — drop one line into any HTML

```html
<link
  rel="stylesheet"
  href="https://cdn.freecodecamp.org/uikit/styles.min.css"
/>
<script src="https://cdn.freecodecamp.org/uikit/uikit.global.js" defer></script>
```

Use BEM class names anywhere:

```html
<button class="btn btn--cta">Start curriculum</button>
<span class="badge badge--success">Passed</span>
```

Full walkthrough: [Handbook → CDN](https://design.freecodecamp.org/handbook#cdn).

### React — npm install

Install the package and the matching CSS:

```bash
pnpm add @freecodecamp/uikit @freecodecamp/uikit-css
```

The first npm release lands at `0.1.0` across every public package. See [docs/adr/0003-pre-publish-version-reset.md](./docs/adr/0003-pre-publish-version-reset.md) for the rationale.

```tsx
import '@freecodecamp/uikit-css';
import { Button, Badge } from '@freecodecamp/uikit';

export default function Example() {
  return (
    <>
      <Button variant='cta'>Start curriculum</Button>
      <Badge tone='success'>Passed</Badge>
    </>
  );
}
```

## Documentation

The docs site (`apps/docs`) is the canonical reference: live component showcases, real React previews, the design handbook, and brand guide.

```bash
pnpm install
pnpm dev:docs
```

Then open <http://localhost:4321>.

The site ships at <https://design.freecodecamp.org> via Cloudflare Pages.

For the full component-by-component reference and how UIKit compares to Catalyst / Ark UI / Headless UI, see [docs/components-matrix.md](./docs/components-matrix.md).

## Deployment

- **Docs site** → Netlify (`design.freecodecamp.org`). Pushes to `main` trigger `.github/workflows/deploy-docs.yml`. Build output: `apps/docs/dist/`.
- **CDN bundle** → opened as a PR against `freeCodeCamp/cdn` by `.github/workflows/release.yml` (manual `workflow_dispatch`). Live at <https://cdn.freecodecamp.org/uikit/>.
- **npm packages** → published via `pnpm release` (Changesets + `changeset publish`). First release: all public packages at `0.1.0`.

## Reporting bugs

Open an issue at <https://github.com/freeCodeCamp/UIkit/issues>. Include reproduction steps, expected behaviour, and observed behaviour. For visual regressions, attach the Playwright diff PNG from `apps/docs/test-results/`.

## Reporting security issues

Do **not** open a public issue — follow the disclosure process in [SECURITY.md](./SECURITY.md).

## Contributing

The freeCodeCamp.org community is possible thanks to thousands of kind volunteers. Read the contributor guide at <https://contribute.freecodecamp.org/>, then [CONTRIBUTING.md](./CONTRIBUTING.md) for the UIKit-specific workflow.

All contributors are expected to follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

## License

Copyright © 2026 freeCodeCamp.org

The content of this repository is bound by the following licenses:

- The computer software is licensed under the [BSD-3-Clause](./LICENSE.md) license.
- The documentation is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).
