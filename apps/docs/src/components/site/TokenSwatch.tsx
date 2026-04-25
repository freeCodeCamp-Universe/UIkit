// Wave 7 P1 / Wave 8 P3 — token-swatch truth.
//
// Renders a CSS custom-property name alongside its RUNTIME-RESOLVED
// value, not a hand-typed hex. Wave 6 shipped three lying swatches
// (display values had drifted from the declared token values by
// months of CSS edits). This island reads `getComputedStyle(:root)`
// on mount and re-reads when the palette class on `<html>` changes,
// so swatches always reflect what the kit actually paints.
//
// Wave 8 P3 added a `value` prop. When provided, the cell becomes
// CONTROLLED and skips its self-mount observer — the parent (e.g.
// `FoundationsBand`) drives the palette-swap re-read with one
// observer. When `value` is undefined, the cell falls back to the
// Wave-7 self-mount behavior so existing standalone usage on
// `/handbook` keeps working without a parent-component refactor.
import { useEffect, useState, useRef } from 'react';

export interface TokenSwatchProps {
  /** CSS custom-property name including the leading `--`. */
  name: string;
  /** Optional human label override; defaults to `name`. */
  label?: string;
  /** Defaults to `:root`. Override when reading from a scoped element. */
  scope?: string;
  /** Controlled mode — pass the resolved value from a parent that
   *  observes palette swaps once for many cells (Wave 8 P3
   *  FoundationsBand pattern). When provided, the cell skips its
   *  internal MutationObserver. */
  value?: string;
}

const PLACEHOLDER = '—';

function resolve(name: string, scope: string): string {
  if (typeof window === 'undefined') return '';
  const node =
    scope === ':root'
      ? document.documentElement
      : document.querySelector<HTMLElement>(scope);
  if (!node) return '';
  return getComputedStyle(node).getPropertyValue(name).trim();
}

export function TokenSwatch({
  name,
  label,
  scope = ':root',
  value
}: TokenSwatchProps): JSX.Element {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<string>('');
  const observer = useRef<MutationObserver | null>(null);

  useEffect(() => {
    if (isControlled) return;
    setInternal(resolve(name, scope));

    // Re-read whenever the palette class on <html> flips. The light
    // and dark palettes redeclare the same custom-property names with
    // different values; the swatch must follow.
    if (typeof MutationObserver === 'undefined') return;
    observer.current = new MutationObserver(() => {
      setInternal(resolve(name, scope));
    });
    observer.current.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-palette']
    });
    return () => observer.current?.disconnect();
  }, [name, scope, isControlled]);

  const display = isControlled ? value || PLACEHOLDER : internal || PLACEHOLDER;
  // Chip uses the custom-property directly so the hue stays in lock
  // step with the resolved value, even before the effect fires.
  return (
    <div className='swatch'>
      <div
        className='swatch__chip'
        style={{ background: `var(${name})` }}
        aria-hidden='true'
      />
      <div className='swatch__meta'>
        <span className='swatch__name'>{label ?? name}</span>
        <span className='swatch__value' data-token-value>
          {display}
        </span>
      </div>
    </div>
  );
}

export default TokenSwatch;
