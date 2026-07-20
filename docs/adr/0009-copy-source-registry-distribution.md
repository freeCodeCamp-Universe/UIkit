# ADR-0009: Copy-source registry distribution (no npm)

- Status: accepted
- Date: 2026-07-14
- Supersedes: the npm-publishing half of ADR-0003 (v0.1.0 versioning stays for CDN pathing)
- Superseded by: [ADR-0010](./0010-cdn-bundle-ships-with-docs-deploy.md) (point 5 only - the CDN bundle no longer has its own release workflow or version aliases)

## Context

UIKit was structured as npm packages (`@freecodecamp/uikit`, `-css`, `-icons`,
`-tailwind`, `-js`) plus a CDN bundle. Nothing was ever published to npm.
Meanwhile the primary consumer of a component library has shifted: LLM coding
agents assemble UIs from source they can read, copy and tailor per project.
An npm dependency is opaque to that workflow; a shadcn-style copy-source model
is native to it.

## Decision

1. **Distribution is copy-source.** Components are copied from
   design.freecodecamp.org into the consuming project's source tree and
   tailored there. No `@freecodecamp/uikit*` packages are published to npm.
2. **The docs site is the registry.** Bespoke markdown, not shadcn-CLI
   compatible:
   - `/components/<slug>.md` - install steps, derived dependencies, props,
     full `.tsx` + `.css` source per component.
   - `/registry/<item>.md` - theme, icons, vanilla runtime, tailwind preset,
     shared libs; `/registry/starter.md` bootstraps a project.
   - `/registry/<item>/<file>` - raw source, `text/plain`.
   - `/registry/index.json` - machine-readable manifest.
   - `/llms.txt` + `/llms-full.txt` - agent discovery.
3. **CSS is colocated per component** (`packages/uikit/src/<cat>/<slug>.css`);
   `uikit-css/components.css` is an ordered `@import` aggregator. Tokens stay
   global and non-negotiable: consumers recolour by editing token values,
   never component CSS.
4. **All workspace packages are `private: true`.** tsup is removed everywhere
   except `uikit-js` (the CDN global bundle needs it). `uikit` builds only
   `props.json`; `uikit-icons` builds only the sprite.
5. **The CDN bundle remains** for zero-build HTML consumers
   (cdn.freecodecamp.org/uikit/), released via the existing `release.yml`
   CDN PR flow, which reads `packages/uikit/package.json` version.

## Consequences

- Changesets, publint and all npm release scripts are deleted.
- The registry manifest is derived at docs build time (import scanning,
  props.json, MDX frontmatter) - no hand-maintained dependency lists.
- Registry integrity is CI-enforced: the docs post-build gate checks every
  item's docs page, raw files and llms.txt listing.
- Versioning of copied code happens in the consuming repo (git), not semver;
  `/registry/index.json` exposes the source git sha for provenance.
