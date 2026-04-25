// Wave 8 P3 (W8-1) — foundations preamble band on `/`.
//
// One React island that surfaces the gray ramp + accents + semantic
// colors above the components grid. Replaces the per-cell
// `<TokenSwatch client:load>` loop (12 islands → 1 island) by
// observing the `<html>` palette class once and re-reading every
// custom property in a single pass.
//
// Pivoted from the brainstorm pattern (D5): the band IS the island,
// the swatch is its internal cell. Drops `client:load` from
// `TokenSwatch` and puts it on the band wrapper. One MutationObserver
// + one `hydrateRoot` instead of N.
import { useEffect, useState } from 'react';
import { TokenSwatch } from './TokenSwatch.tsx';

interface SwatchSpec {
  name: string;
  label?: string;
}

interface SubgroupSpec {
  heading: string;
  blurb: string;
  swatches: readonly SwatchSpec[];
}

const GROUPS: readonly SubgroupSpec[] = [
  {
    heading: 'Gray ramp',
    blurb: 'Surface stack — primary through quaternary.',
    swatches: [
      { name: '--background-primary' },
      { name: '--background-secondary' },
      { name: '--background-tertiary' },
      { name: '--background-quaternary' },
      { name: '--foreground-primary' },
      { name: '--foreground-secondary' }
    ]
  },
  {
    heading: 'Accents',
    blurb: 'CTA + highlight pairs — gold-on-navy, click magnets.',
    swatches: [
      { name: '--cta-background' },
      { name: '--cta-foreground' },
      { name: '--highlight-color' }
    ]
  },
  {
    heading: 'Semantic',
    blurb: 'Status colors — success / warning / danger / info.',
    swatches: [
      { name: '--success-color' },
      { name: '--warning-color' },
      { name: '--danger-color' },
      { name: '--purple-color' }
    ]
  }
];

const ALL_NAMES: readonly string[] = GROUPS.flatMap(g =>
  g.swatches.map(s => s.name)
);

function resolveAll(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const root = document.documentElement;
  const styles = getComputedStyle(root);
  const out: Record<string, string> = {};
  for (const name of ALL_NAMES) {
    out[name] = styles.getPropertyValue(name).trim();
  }
  return out;
}

export function FoundationsBand(): JSX.Element {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    setValues(resolveAll());
    if (typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver(() => {
      setValues(resolveAll());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-palette']
    });
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className='foundations-band'
      aria-labelledby='foundations-band-title'
    >
      <header className='foundations-band__head'>
        <p className='section__eyebrow'>Foundations</p>
        <h2 id='foundations-band-title' className='section__title'>
          Tokens before components.
        </h2>
        <p className='section__lede'>
          The whole kit reads from a small CSS custom-property layer. Swap a
          palette class on <code>&lt;html&gt;</code> and the entire surface
          changes — no component edits, no JavaScript.
        </p>
      </header>
      <div className='foundations-band__grid'>
        {GROUPS.map(group => (
          <div key={group.heading} className='foundations-band__group'>
            <h3 className='foundations-band__group-heading'>{group.heading}</h3>
            <p className='foundations-band__group-blurb'>{group.blurb}</p>
            <div className='token-grid'>
              {group.swatches.map(swatch => (
                <TokenSwatch
                  key={swatch.name}
                  name={swatch.name}
                  label={swatch.label}
                  value={values[swatch.name] ?? ''}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className='foundations-band__footer'>
        <a href='/handbook#palette'>Read the full handbook →</a>
      </p>
    </section>
  );
}

export default FoundationsBand;
