---
'@freecodecamp/uikit': minor
'@freecodecamp/uikit-css': patch
---

Add `<FormStepper>` — numbered multi-step wizard with progress header
and render-prop body. Steps are controlled by the caller (`steps`,
`current`, `onStepChange`); status per step (`complete` / `current` /
`upcoming`) derives from array index. Complete and current are
navigable by default; upcoming are disabled. Override with
`isStepAccessible` to gate forward progress on form validity.
Progress list is a semantic `<ol aria-label>`; active step sets
`aria-current="step"`.
