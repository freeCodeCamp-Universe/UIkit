#!/usr/bin/env node
/**
 * One-off migration: split packages/uikit-css/src/components.css into
 * per-component files colocated with their React source, plus:
 *   - packages/uikit-css/src/base.css            (.sr-only shared helper)
 *   - packages/uikit-css/src/html/progress.css   (HTML-only pattern, no React component)
 *   - apps/docs/src/styles/site-foundations.css  (docs-site-only CSS, not registry content)
 * Then rewrites components.css as an explicit ordered @import aggregator.
 *
 * Ranges are 1-based inclusive line ranges over the ORIGINAL components.css
 * and must tile the whole file with no gaps or overlaps (verified below).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'packages/uikit-css/src/components.css');
const original = readFileSync(source, 'utf8');
const lines = original.split('\n');
// Trailing newline produces a final empty element; keep count of real lines.
const totalLines =
  lines[lines.length - 1] === '' ? lines.length - 1 : lines.length;

const UIKIT = 'packages/uikit/src';
const CSSPKG = 'packages/uikit-css/src';
const DOCS = 'apps/docs/src/styles';

/** [targetPath, startLine, endLine] - original order, ranges tile the file. */
const ranges = [
  [`${UIKIT}/primitives/button.css`, 1, 124],
  [`${UIKIT}/forms/toggle-button.css`, 125, 160],
  [`${UIKIT}/primitives/close-button.css`, 161, 180],
  [`${UIKIT}/primitives/link.css`, 181, 197],
  [`${UIKIT}/forms/input.css`, 198, 232],
  [`${UIKIT}/forms/form-group.css`, 233, 238],
  [`${UIKIT}/forms/form-control.css`, 239, 246],
  [`${UIKIT}/forms/help-block.css`, 247, 257],
  [`${UIKIT}/forms/checkbox.css`, 258, 278],
  [`${UIKIT}/forms/switch.css`, 279, 322],
  [`${UIKIT}/primitives/badge.css`, 323, 362],
  [`${UIKIT}/data-display/alert.css`, 363, 410],
  [`${UIKIT}/data-display/callout.css`, 411, 452],
  [`${UIKIT}/data-display/card.css`, 453, 513],
  [`${UIKIT}/data-display/panel.css`, 514, 552],
  [`${UIKIT}/navigation/tabs.css`, 553, 582],
  [`${UIKIT}/overlays/dropdown.css`, 583, 632],
  [`${UIKIT}/overlays/tooltip.css`, 633, 655],
  [`${UIKIT}/overlays/modal.css`, 656, 727],
  [`${UIKIT}/data-display/table.css`, 728, 754],
  [`${UIKIT}/primitives/image.css`, 755, 759],
  [`${UIKIT}/primitives/spacer.css`, 760, 763],
  [`${CSSPKG}/html/progress.css`, 764, 783],
  [`${UIKIT}/primitives/text.css`, 784, 810],
  [`${UIKIT}/primitives/heading.css`, 811, 840],
  [`${UIKIT}/primitives/divider.css`, 841, 864],
  [`${UIKIT}/primitives/avatar.css`, 865, 918],
  [`${UIKIT}/forms/fieldset.css`, 919, 940],
  [`${UIKIT}/data-display/description-list.css`, 941, 977],
  [`${UIKIT}/forms/radio.css`, 978, 1003],
  [`${UIKIT}/forms/select.css`, 1004, 1036],
  [`${UIKIT}/forms/textarea.css`, 1037, 1073],
  [`${UIKIT}/navigation/pagination.css`, 1074, 1130],
  [`${UIKIT}/navigation/listbox.css`, 1131, 1169],
  [`${UIKIT}/navigation/combobox.css`, 1170, 1230],
  [`${UIKIT}/navigation/navbar.css`, 1231, 1276],
  [`${UIKIT}/navigation/sidebar.css`, 1277, 1415],
  [`${UIKIT}/layouts/sidebar-layout.css`, 1416, 1449],
  [`${UIKIT}/layouts/stacked-layout.css`, 1450, 1472],
  [`${UIKIT}/layouts/auth-layout.css`, 1473, 1509],
  [`${UIKIT}/data-display/skeleton.css`, 1510, 1556],
  [`${CSSPKG}/base.css`, 1557, 1568],
  [`${UIKIT}/data-display/skeleton.css`, 1569, 1584],
  [`${UIKIT}/data-display/empty-state.css`, 1585, 1626],
  [`${UIKIT}/overlays/toast.css`, 1627, 1738],
  [`${UIKIT}/overlays/command-palette.css`, 1739, 1840],
  [`${UIKIT}/forms/form-stepper.css`, 1841, 1930],
  [`${UIKIT}/data-display/data-table.css`, 1931, 2025],
  [`${DOCS}/site-foundations.css`, 2026, 2657],
  [`${UIKIT}/navigation/breadcrumb.css`, 2658, 2693],
  [`${UIKIT}/games/tile-matcher.css`, 2694, 2839],
  [`${UIKIT}/games/hotspots.css`, 2840, 2939]
];

// --- Verify the ranges tile the file exactly (parity guarantee) ---
let cursor = 1;
for (const [target, start, end] of ranges) {
  if (start !== cursor) {
    throw new Error(
      `Gap/overlap before ${target}: expected start ${cursor}, got ${start}`
    );
  }
  if (end < start) throw new Error(`Bad range for ${target}: ${start}-${end}`);
  cursor = end + 1;
}
if (cursor !== totalLines + 1) {
  throw new Error(
    `Ranges cover 1-${cursor - 1} but file has ${totalLines} lines`
  );
}
const reassembled = ranges
  .map(([, start, end]) => lines.slice(start - 1, end).join('\n'))
  .join('\n');
const originalBody = lines.slice(0, totalLines).join('\n');
if (reassembled !== originalBody) {
  throw new Error(
    'Parity check failed: reassembled segments differ from original'
  );
}
console.log(
  `Parity OK: ${ranges.length} segments tile all ${totalLines} lines.`
);

// --- Group segments by target (skeleton has two parts) and write files ---
const segments = new Map();
for (const [target, start, end] of ranges) {
  const text = lines.slice(start - 1, end).join('\n');
  segments.set(
    target,
    segments.has(target) ? `${segments.get(target)}\n${text}` : text
  );
}
for (const [target, text] of segments) {
  const path = resolve(root, target);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${text.replace(/^\n+/, '').replace(/\n+$/, '')}\n`);
  console.log(`wrote ${target}`);
}

// --- Rewrite components.css as an ordered aggregator ---
const seen = new Set();
const imports = [];
for (const [target] of ranges) {
  if (target.startsWith(DOCS)) continue; // docs-site-only, not component CSS
  if (seen.has(target)) continue; // skeleton parts live in one file
  seen.add(target);
  const rel = target.startsWith(CSSPKG)
    ? `./${target.slice(`${CSSPKG}/`.length)}`
    : `../../uikit/src/${target.slice(`${UIKIT}/`.length)}`;
  imports.push(`@import '${rel}';`);
}
// base.css hoisted to the top; unique selector (.sr-only), cascade-safe.
const baseImport = "@import './base.css';";
const ordered = [baseImport, ...imports.filter(i => i !== baseImport)];
const aggregator = `/*
 * Aggregator only - component styles live next to each component in
 * packages/uikit/src/<category>/<slug>.css. Import order preserves the
 * cascade of the original monolithic stylesheet; do not sort.
 */
${ordered.join('\n')}
`;
writeFileSync(source, aggregator);
console.log(`rewrote components.css as aggregator (${ordered.length} imports)`);
