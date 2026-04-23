---
'@freecodecamp/uikit': minor
'@freecodecamp/uikit-css': patch
---

Add `<Radio>` form primitive and `<RadioGroup>` container. Radio
renders a native `<input type="radio">` wrapped in a `<label>` when
a `label` prop is supplied. RadioGroup uses React context to
propagate a shared `name`, the current `value`, and `onChange` to
every descendant Radio — matching the Checkbox ergonomics while
enforcing single-choice semantics.
