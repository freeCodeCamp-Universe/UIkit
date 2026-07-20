# `@freecodecamp/uikit-docs`

Private Astro app that publishes the freeCodeCamp UIKit docs site at
[`https://design.freecodecamp.org`](https://design.freecodecamp.org).
Also a dogfood app for `@freecodecamp/uikit`,
`@freecodecamp/uikit-css`, `@freecodecamp/uikit-js`, and
`@freecodecamp/uikit-icons`.

For deploy, custom domain, GitHub App, rollback: see
[`docs/runbooks/deploy-docs.md`](../../docs/runbooks/deploy-docs.md)
and [ADR-0008](../../docs/adr/0008-cloudflare-pages-git-integration.md)
(which supersedes ADR-0007). For the toolchain matrix and Turbo
task graph: see [`docs/tooling.md`](../../docs/tooling.md).

## App shape

Key route → source mapping:

| Route                          | Source                                                                 |
| ------------------------------ | ---------------------------------------------------------------------- |
| `/`                            | `src/pages/index.astro` - landing + foundations + component playground |
| `/handbook`                    | `src/pages/handbook.astro` - one-page foundations + brand reference    |
| `/guides`, `/guides/[...slug]` | `src/pages/guides/`                                                    |
| `/llms.txt`, `/llms-full.txt`  | `src/pages/llms*.txt.ts` - LLM-readable digest endpoints               |
| `/api`                         | redirected to `/`                                                      |

Site shell uses `BaseLayout.astro`. Prose pages use `ProseLayout.astro`.

## Workspace package resolution

`astro.config.mjs` aliases workspace package imports to source rather
than dist. Vite SSR marks them `noExternal` and `optimizeDeps`
excludes them so HMR uses source.

| Alias                           | Resolves to                            |
| ------------------------------- | -------------------------------------- |
| `@freecodecamp/uikit[/*]`       | `packages/uikit/src[/*]`               |
| `@freecodecamp/uikit-icons[/*]` | `packages/uikit-icons/src[/*]`         |
| `@freecodecamp/uikit-js`        | `packages/uikit-js/src/index.ts`       |
| `@freecodecamp/uikit-tailwind`  | `packages/uikit-tailwind/src/index.ts` |

## Content collections

Defined in `src/content.config.ts`:

| Collection    | Source                    | Required frontmatter                                | Purpose                                   |
| ------------- | ------------------------- | --------------------------------------------------- | ----------------------------------------- |
| `foundations` | `src/content/foundations` | `title`, `eyebrow`, `summary`, `order`              | Handbook foundations sections.            |
| `components`  | `src/content/components`  | `title`, `eyebrow`, `status`, `category`, `summary` | Component docs + API reference.           |
| `guides`      | `src/content/guides`      | `title`, `eyebrow`, `summary`, `order`              | Install + CDN + Tailwind + recipe guides. |

`category` is one of `primitive`, `form`, `overlay`, `navigation`,
`data-display`, `layout`.

## Predev and prebuild scripts

Both `dev` and `build` chain through:

```bash
node scripts/copy-sprite.mjs \
  && node scripts/build-asset-kit.mjs \
  && node scripts/ensure-uikit-built.mjs
```

| Script                   | Effect                                                                                                                                                          |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `copy-sprite.mjs`        | Copies `packages/uikit-icons/dist/sprite.svg` and `packages/uikit-js/dist/uikit.global.js` into `public/uikit/`. Tolerant in dev if upstream dists are missing. |
| `build-asset-kit.mjs`    | Zips brand marks into `public/brand/asset-kit.zip`. Generated because zip metadata churns.                                                                      |
| `ensure-uikit-built.mjs` | If `packages/uikit/dist/props.json` is missing, runs `pnpm -F @freecodecamp/uikit build`.                                                                       |

After `astro build`, `scripts/verify-dist-pages-artefacts.mjs` asserts
every required Cloudflare Pages artefact (`_headers`, `_redirects`,
`robots.txt`, `favicon.svg`, `sitemap-index.xml`, `sitemap-0.xml`)
made it to `dist/`.

## Dogfood assets

Workspace-built runtime files served from the docs origin:

- `/uikit/sprite.svg` - copied from `packages/uikit-icons/dist/`.
- `/uikit/uikit.global.js` - copied from `packages/uikit-js/dist/`.
- `/brand/asset-kit.zip` - generated from brand marks.

**Do not hand-edit files under `public/uikit/`** - they are overwritten
by the predev / prebuild chain above.
