---
'@freecodecamp/uikit': minor
'@freecodecamp/uikit-css': patch
---

Add `<Heading>` primitive — decouples semantic level (`h1`–`h6`) from
visual size (`display|xl|lg|md|sm`) so the document outline stays
correct even when the type scale compresses a subheading. Invalid
levels clamp to the nearest valid heading tag.
