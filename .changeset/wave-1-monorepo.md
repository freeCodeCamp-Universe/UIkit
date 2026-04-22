---
'@freecodecamp/uikit': minor
'@freecodecamp/uikit-css': minor
'@freecodecamp/uikit-js': minor
'@freecodecamp/uikit-tailwind': minor
'@freecodecamp/uikit-icons': minor
---

Wave 1 — pre-release milestone.

- Monorepo layout: `packages/uikit`, `packages/uikit-css`, `packages/uikit-js`, `packages/uikit-tailwind`, `packages/uikit-icons`, plus the private `packages/uikit-cdn` builder and `apps/docs` living documentation site.
- Motion tokens — `--ease-snap`, `--ease-out`, `--dur-fast | --dur-base | --dur-slow` — land in `@freecodecamp/uikit-css/tokens.css` and drive every enter/exit transition across the kit.
- `@freecodecamp/uikit-tailwind` ships a preset (colors, spacing, type scale, motion, z-index, border scale) and a plugin (`.focus-ring` utility + `fcc-dark` / `fcc-light` palette variants).
- `@freecodecamp/uikit-icons` ships a 5-icon Lucide pilot (`copy`, `check`, `x`, `search`, `external-link`) with a typed `<Icon>` React component, an inline body map for SSR/vanilla use, and a generated CSS `sprite.svg`.
- Modal is rebuilt on `@ark-ui/react`'s Dialog primitive. Public API is unchanged (`open`, `onClose`, `title`, `closeOnBackdrop`) and the data-state attribute now drives backdrop fade + panel scale under the new motion tokens. Reduced-motion is honoured.
- Docs site (`@freecodecamp/uikit-docs`): 3-tab Showcase (React · HTML · Tailwind) with copy-as dropdown and GitHub source links, six Foundations pages (colors, typography, spacing, iconography, motion, voice) with live token-backed previews, and a Pagefind-backed search modal.
