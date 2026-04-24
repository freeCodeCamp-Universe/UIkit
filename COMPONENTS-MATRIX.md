# Components comparison matrix

Cross-reference of every component shipped in `@freecodecamp/uikit` against
three widely-used React headless / styled libraries, plus a pointer to the
primary accessibility spec (WAI-ARIA APG in most cases). Source of truth
for UIKit rows is `packages/uikit/src/<layer>/index.ts` barrel exports.

## Legend

- ✅ Shipped (dedicated component)
- 🟡 Partial (similar primitive exists, different API surface)
- ⬜ Absent / not offered
- 🅰️ Ark-backed (machine provided by `@zag-js/*` under the hood)

External library versions reflected: **Catalyst** (Tailwind Catalyst v2 as
of 2026-04), **Ark UI** (`@ark-ui/react` 3.x), **Headless UI** (@headlessui/react 2.x).

---

## Primitives

| Component   | UIKit | Catalyst | Ark UI | Headless UI | Primary spec                                                                                        |
| ----------- | :---: | :------: | :----: | :---------: | --------------------------------------------------------------------------------------------------- |
| Avatar      |  ✅   |    ✅    |   ✅   |     ⬜      | [ARIA: img](https://www.w3.org/TR/wai-aria-1.2/#img)                                                |
| Badge       |  ✅   |    ✅    |   ⬜   |     ⬜      | — (decorative)                                                                                      |
| Button      |  ✅   |    ✅    |   ✅   |     ✅      | [APG · Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/)                                    |
| CloseButton |  ✅   |    ⬜    |   ⬜   |     ⬜      | [APG · Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/)                                    |
| Divider     |  ✅   |    ✅    |   ⬜   |     ⬜      | [ARIA: separator](https://www.w3.org/TR/wai-aria-1.2/#separator)                                    |
| Heading     |  ✅   |    ✅    |   ⬜   |     ⬜      | [HTML: heading content](https://html.spec.whatwg.org/multipage/sections.html#headings-and-outlines) |
| Image       |  ✅   |    ⬜    |   ⬜   |     ⬜      | [HTML: img](https://html.spec.whatwg.org/multipage/embedded-content.html#the-img-element)           |
| Link        |  ✅   |    ✅    |   ⬜   |     ⬜      | [APG · Link](https://www.w3.org/WAI/ARIA/apg/patterns/link/)                                        |
| Spacer      |  ✅   |    ⬜    |   ⬜   |     ⬜      | — (layout helper)                                                                                   |
| Text        |  ✅   |    ✅    |   ⬜   |     ⬜      | — (polymorphic typographic wrapper)                                                                 |

Gaps: Catalyst does not ship a dedicated `Spacer`, `Image`, or `CloseButton` —
Tailwind spacing utilities cover it. Ark UI is pure headless primitive-set; it
skips visual-only atoms like `Badge` and `Spacer`.

## Actions

| Component    | UIKit | Catalyst | Ark UI | Headless UI | Primary spec                                                                                  |
| ------------ | :---: | :------: | :----: | :---------: | --------------------------------------------------------------------------------------------- |
| Button       |  ✅   |    ✅    |   ✅   |     ✅      | [APG · Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/)                              |
| ToggleButton |  ✅   |    🟡    |   ✅   |     ⬜      | [APG · Button (toggle)](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction) |
| CloseButton  |  ✅   |    ⬜    |   ⬜   |     ⬜      | [APG · Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/)                              |

Gaps: Catalyst uses a `data-slot="button"` variant for toggle state rather
than a dedicated component. Headless UI funnels these through the generic
`Button` primitive.

## Forms

| Component          | UIKit |     Catalyst     |        Ark UI         |   Headless UI    | Primary spec                                                                                     |
| ------------------ | :---: | :--------------: | :-------------------: | :--------------: | ------------------------------------------------------------------------------------------------ |
| Input              |  ✅   |        ✅        |    🟡 (via Field)     |        ✅        | [APG · Textbox](https://www.w3.org/WAI/ARIA/apg/patterns/textbox/)                               |
| Textarea           |  ✅   |        ✅        |          🟡           |        ✅        | [APG · Textbox (multiline)](https://www.w3.org/WAI/ARIA/apg/patterns/textbox/)                   |
| Select             |  ✅   |        ✅        |          ✅           |        ✅        | [APG · Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)                             |
| Checkbox           |  ✅   |        ✅        |          ✅           |        ✅        | [APG · Checkbox](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/)                             |
| Radio / RadioGroup |  ✅   |        ✅        |          ✅           |        ✅        | [APG · Radio Group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)                             |
| Switch             |  ✅   |        ✅        |          ✅           |        ✅        | [APG · Switch](https://www.w3.org/WAI/ARIA/apg/patterns/switch/)                                 |
| Fieldset           |  ✅   |        ✅        |      🟡 (Field)       |  ✅ (Fieldset)   | [HTML: fieldset](https://html.spec.whatwg.org/multipage/form-elements.html#the-fieldset-element) |
| FormControl        |  ✅   |        🟡        |      🅰️ (Field)       |    ✅ (Field)    | [APG · Form field](https://www.w3.org/WAI/tutorials/forms/)                                      |
| FormGroup          |  ✅   |        ⬜        |          ⬜           |        ⬜        | [ARIA: group](https://www.w3.org/TR/wai-aria-1.2/#group)                                         |
| HelpBlock          |  ✅   | 🟡 (Description) | 🅰️ (Field.HelperText) | 🟡 (Description) | [ARIA: aria-describedby](https://www.w3.org/TR/wai-aria-1.2/#aria-describedby)                   |
| FormStepper        |  ✅   |        ⬜        |      🅰️ (Steps)       |        ⬜        | [APG · Feed (loose fit)](https://www.w3.org/WAI/ARIA/apg/patterns/feed/)                         |

Gaps: Catalyst bundles the "label + control + description + error" quartet
into a single `Field` + `Description` compound rather than exposing
`FormControl`/`HelpBlock` separately. `FormStepper` is uncommon outside
Ark's `Steps`.

## Navigation

| Component  | UIKit | Catalyst | Ark UI | Headless UI | Primary spec                                                                                     |
| ---------- | :---: | :------: | :----: | :---------: | ------------------------------------------------------------------------------------------------ |
| Navbar     |  ✅   |    ✅    |   ⬜   |     ⬜      | [APG · Landmark: banner](https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/banner.html)         |
| Sidebar    |  ✅   |    ✅    |   ⬜   |     ⬜      | [APG · Landmark: navigation](https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/navigation.html) |
| Tabs       |  ✅   |    ⬜    |   ✅   |     ✅      | [APG · Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)                                     |
| Pagination |  ✅   |    ✅    |   ✅   |     ⬜      | [APG · Navigation (Pagination)](https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/)     |
| Listbox    |  ✅   |    ⬜    |   ✅   |     ✅      | [APG · Listbox](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/)                               |
| Combobox   |  ✅   |    ✅    |   ✅   |     ✅      | [APG · Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)                             |

Gaps: Catalyst focuses on chrome (`Navbar`, `Sidebar`) and skips the
`Tabs` + `Listbox` primitives (Headless UI is the Tailwind-native answer
for those).

## Overlays

| Component       | UIKit |  Catalyst   |        Ark UI        | Headless UI | Primary spec                                                                  |
| --------------- | :---: | :---------: | :------------------: | :---------: | ----------------------------------------------------------------------------- |
| Modal           |  ✅   | ✅ (Dialog) |          ✅          | ✅ (Dialog) | [APG · Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)        |
| Dropdown        |  ✅   |     ✅      |      ✅ (Menu)       |  ✅ (Menu)  | [APG · Menu Button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/)    |
| Tooltip         |  ✅   |     ⬜      |          ✅          |     ⬜      | [APG · Tooltip](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/)            |
| Toast / Toaster |  ✅   |     ⬜      |          ✅          |     ⬜      | [APG · Alert (live region)](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)  |
| CommandPalette  |  ✅   |     ⬜      | 🟡 (Combobox+Dialog) |     ⬜      | [APG · Combobox + Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) |

Gaps: Catalyst and Headless UI both defer `Toast` and `CommandPalette` to
third-party adapters (`sonner`, `cmdk`). UIKit ships them as first-class.

## Feedback

| Component  | UIKit | Catalyst | Ark UI | Headless UI | Primary spec                                                     |
| ---------- | :---: | :------: | :----: | :---------: | ---------------------------------------------------------------- |
| Alert      |  ✅   |    ⬜    |   ⬜   |     ⬜      | [APG · Alert](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)   |
| Callout    |  ✅   |    ⬜    |   ⬜   |     ⬜      | — (styled note block)                                            |
| Skeleton   |  ✅   |    ⬜    |   ⬜   |     ⬜      | [ARIA: aria-busy](https://www.w3.org/TR/wai-aria-1.2/#aria-busy) |
| EmptyState |  ✅   |    🟡    |   ⬜   |     ⬜      | — (compositional pattern)                                        |

Gaps: None of the external three ship dedicated feedback primitives — the
Tailwind ecosystem treats these as recipe patterns. UIKit ships them as
structural components so the semantics (role, live-region, busy) travel
with the DOM.

## Data display

| Component       | UIKit | Catalyst | Ark UI | Headless UI | Primary spec                                                                            |
| --------------- | :---: | :------: | :----: | :---------: | --------------------------------------------------------------------------------------- |
| Card            |  ✅   |    ⬜    |   ⬜   |     ⬜      | — (pattern)                                                                             |
| Panel           |  ✅   |    ⬜    |   ⬜   |     ⬜      | [ARIA: region](https://www.w3.org/TR/wai-aria-1.2/#region)                              |
| Table           |  ✅   |    ✅    |   ⬜   |     ⬜      | [ARIA: table](https://www.w3.org/TR/wai-aria-1.2/#table)                                |
| DataTable       |  ✅   |    🟡    |   ✅   |     ⬜      | [APG · Grid](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)                            |
| DescriptionList |  ✅   |    ✅    |   ⬜   |     ⬜      | [HTML: dl](https://html.spec.whatwg.org/multipage/grouping-content.html#the-dl-element) |

Gaps: Catalyst ships `Table` + `DescriptionList` but not a sortable/paging
`DataTable`. Ark provides the `@ark-ui/react/table` primitive; Headless UI
leaves tables to userland.

## Layouts

| Component     | UIKit | Catalyst | Ark UI | Headless UI | Primary spec                                                                   |
| ------------- | :---: | :------: | :----: | :---------: | ------------------------------------------------------------------------------ |
| SidebarLayout |  ✅   |    ✅    |   ⬜   |     ⬜      | [APG · Landmarks](https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/) |
| StackedLayout |  ✅   |    ✅    |   ⬜   |     ⬜      | [APG · Landmarks](https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/) |
| AuthLayout    |  ✅   |    ⬜    |   ⬜   |     ⬜      | — (marketing shell)                                                            |

Gaps: Catalyst ships the two dashboard shells (`StackedLayout`,
`SidebarLayout`) and omits a dedicated centred-auth variant. UIKit
bundles `AuthLayout` for the sign-in / onboarding surface.

---

## Summary

- **UIKit covers 45 discrete components**, weighted heavily on feedback
  (`Alert`/`Callout`/`Skeleton`/`EmptyState`) and overlay primitives that
  neither Catalyst nor Headless UI ship out of the box.
- **Catalyst** is the closest chrome-level peer (dashboard shells, data
  density primitives, paired `Field` + `Description` inputs) but skips
  feedback + overlay extras.
- **Ark UI** is the deepest primitive-provider; UIKit reuses its machines
  under the hood for `Combobox`, `Listbox`, `Pagination`, `Switch`,
  `FormStepper`, `Toast`, `Tooltip`, `Modal`.
- **Headless UI** covers the classic interaction primitives but skips
  structural and feedback components — it composes upward into
  frameworks rather than presenting an opinionated kit.

Update cadence: re-review each minor release of the upstream libraries,
or whenever UIKit adds a layer beyond the eight listed above.
