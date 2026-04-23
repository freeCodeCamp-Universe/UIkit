---
'@freecodecamp/uikit': major
'@freecodecamp/uikit-css': major
'@freecodecamp/uikit-js': major
'@freecodecamp/uikit-icons': major
'@freecodecamp/uikit-tailwind': major
---

v1.0.0-rc.0 — first stable surface of the freeCodeCamp UIKit. This
marker forces every shipped package onto the `1.0.0` line when the
Wave 5 release cuts; it overrides the accumulated minor/patch bumps
from the Wave 2 component-by-component changesets. See
`RELEASE-NOTES-v1.0.0-rc.0.md` at the repo root for the hand-drafted
rollup. Release strategy: `changeset pre enter rc` → `changeset
version` → review → `changeset publish` → `changeset pre exit`. Do
not run any of this in Wave 2.
