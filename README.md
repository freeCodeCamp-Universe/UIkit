[![freeCodeCamp Social Banner](https://cdn.freecodecamp.org/platform/universal/fcc_banner_new.png)](https://www.freecodecamp.org/)

# freeCodeCamp UIKit

[![Discord](https://img.shields.io/discord/692816967895220344?logo=discord&label=Discord&color=5865F2)](https://discord.gg/PRyKn3Vbay)
[![License: BSD-3-Clause](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](./LICENSE.md)
[![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](./.nvmrc)
[![pnpm](https://img.shields.io/badge/pnpm-10-orange)](./package.json)

Design system, React component library, vanilla-JS adapter, and CDN bundle that power the freeCodeCamp.org platform. Built CSS-first with design tokens and accessibility-tested against the WAI-ARIA Authoring Practices.

UIKit is distributed as a **copy-source registry** (shadcn-style): components are copied from [design.freecodecamp.org](https://design.freecodecamp.org) into your project's source and tailored there - nothing installs from npm. It is built to be equally usable by humans and LLM coding agents: point an agent at [design.freecodecamp.org/llms.txt](https://design.freecodecamp.org/llms.txt) and it can discover, copy, and adapt any component.

## Packages

All workspaces are private - they are the source of truth the registry serves, not npm packages.

| Workspace                                              | Description                                                           |
| ------------------------------------------------------ | --------------------------------------------------------------------- |
| [`packages/uikit`](./packages/uikit)                   | React component library - 47 components across 8 tiers                |
| [`packages/uikit-css`](./packages/uikit-css)           | Design tokens, base helpers, fonts, brand assets                      |
| [`packages/uikit-js`](./packages/uikit-js)             | Vanilla JS runtime - wires `data-uikit-*` attrs to Zag state machines |
| [`packages/uikit-icons`](./packages/uikit-icons)       | Curated Lucide icon subset, React + sprite                            |
| [`packages/uikit-tailwind`](./packages/uikit-tailwind) | Tailwind preset + plugin mirroring UIKit tokens                       |

## Quick start

### CDN - drop one line into any HTML

```html
<link
  rel="stylesheet"
  href="https://design.freecodecamp.org/cdn/styles.min.css"
/>
<script
  src="https://design.freecodecamp.org/cdn/uikit.global.js"
  defer
></script>
```

Use BEM class names anywhere:

```html
<button class="btn btn--cta">Start curriculum</button>
<span class="badge badge--success">Passed</span>
```

Full walkthrough: [Handbook → CDN](https://design.freecodecamp.org/handbook#cdn).

### React - copy the source

1. Install the theme once: copy `tokens.css` + `base.css` from [/registry/theme.md](https://design.freecodecamp.org/registry/theme.md) and import them globally (fonts: see the [starter guide](https://design.freecodecamp.org/registry/starter.md)).
2. Copy a component from its page - e.g. [/components/button.md](https://design.freecodecamp.org/components/button.md) - into `src/ui/<slug>/`, and import its CSS once.
3. It is your code now: tailor it freely, recolour by editing token values.

For agents: [/llms.txt](https://design.freecodecamp.org/llms.txt) (index) · [/registry/index.json](https://design.freecodecamp.org/registry/index.json) (machine-readable manifest) · [/registry/starter.md](https://design.freecodecamp.org/registry/starter.md) (bootstrap + AGENTS.md snippet). See [docs/adr/0009-copy-source-registry-distribution.md](./docs/adr/0009-copy-source-registry-distribution.md) for the rationale.

```tsx
import './ui/theme/tokens.css';
import { Button } from './ui/button/Button';
import { Badge } from './ui/badge/Badge';

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

- **Docs site** → Cloudflare Pages with Git integration (`design.freecodecamp.org`, project `fcc-design`). Pushes to `main` deploy production; every PR (including forks) gets a preview at `https://<branch>.fcc-design.pages.dev`. Build output: `apps/docs/dist/`. See [docs/adr/0008-cloudflare-pages-git-integration.md](./docs/adr/0008-cloudflare-pages-git-integration.md) and [docs/runbooks/deploy-docs.md](./docs/runbooks/deploy-docs.md).
- **CDN bundle** → ships with the same docs deploy, at `design.freecodecamp.org/cdn/`. Rolling/unversioned - no separate release step. See [docs/adr/0010-cdn-bundle-ships-with-docs-deploy.md](./docs/adr/0010-cdn-bundle-ships-with-docs-deploy.md).
- **Registry** → the docs site is the registry: component markdown pages, raw source endpoints and `registry/index.json` are generated at docs build time and ship with every docs deploy.

## Reporting bugs

Open an issue at <https://github.com/freeCodeCamp/UIkit/issues>. Include reproduction steps, expected behaviour, and observed behaviour. For visual regressions, attach the Playwright diff PNG from `apps/docs/test-results/`.

## Reporting security issues

Do **not** open a public issue - follow the disclosure process in [SECURITY.md](./SECURITY.md).

## Contributing

The freeCodeCamp.org community is possible thanks to thousands of kind volunteers. Read the contributor guide at <https://contribute.freecodecamp.org/>, then [CONTRIBUTING.md](./CONTRIBUTING.md) for the UIKit-specific workflow.

All contributors are expected to follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

## License

Copyright © 2026 freeCodeCamp.org

The content of this repository is bound by the following licenses:

- The computer software is licensed under the [BSD-3-Clause](./LICENSE.md) license.
- The documentation is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).
