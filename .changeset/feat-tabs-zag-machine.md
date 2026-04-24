---
'@freecodecamp/uikit': minor
---

`<Tabs>` now composes `@ark-ui/react/tabs` internally, inheriting the
underlying `@zag-js/tabs` state machine. The public API (`<Tabs><Tab
eventKey title>` with optional controlled `activeKey`) is unchanged —
existing consumers don't have to rewire. Gains:

- Full keyboard navigation out of the box: Arrow keys cycle triggers,
  Home / End jump to the ends, Enter / Space activates.
- `data-state="open|closed"` on panels and `data-selected=""` on active
  triggers — CSS can target these in addition to the existing
  `aria-selected` selector.
- Proper focus management (`tabindex=0` on the selected trigger,
  `tabindex=-1` on the rest).
- Orientation awareness — set `dir` or orientation and keyboard
  handling adjusts automatically.

`<Tabs>` no longer extends `React.HTMLAttributes<HTMLDivElement>`'s
`defaultValue` (collided with ark's narrower `string | null` prop).
Pass `defaultActiveKey` instead, as documented.
