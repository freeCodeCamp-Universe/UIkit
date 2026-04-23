---
'@freecodecamp/uikit': minor
'@freecodecamp/uikit-css': patch
---

Add `<Textarea>` form primitive — native textarea with terminal
styling, an opt-in `variant="mono"` for code and command capture,
and an `autoResize` mode that grows the control with its content
(disables the native resize handle, swaps overflow to hidden, and
runs a scrollHeight-based fit routine on input + when the defaultValue
or value changes). All other native textarea attributes pass through.
