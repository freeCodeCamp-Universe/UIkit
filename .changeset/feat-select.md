---
'@freecodecamp/uikit': minor
'@freecodecamp/uikit-css': patch
---

Add `<Select>` form primitive — a forwardRef wrapper around the native
HTML `<select>` element, restyled with our border, spacing, and
chevron tokens. `invalid` sets `aria-invalid="true"` and shifts the
border to the danger token; every other native select attribute
(name, value, defaultValue, multiple, size, disabled, …) passes
through unchanged. Reach for Combobox when filtering or async loads
are required.
