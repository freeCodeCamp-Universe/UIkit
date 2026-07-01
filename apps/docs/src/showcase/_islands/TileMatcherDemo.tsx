import type { JSX } from 'react';
import { TileMatcher } from '@freecodecamp/uikit';
import type { TileMatcherPair } from '@freecodecamp/uikit';

// shuffle disabled → deterministic order for visual snapshots.
const CONCEPTS: TileMatcherPair[] = [
  { id: 'html', faces: ['HTML', 'Structure'] },
  { id: 'css', faces: ['CSS', 'Style'] },
  { id: 'js', faces: ['JS', 'Behavior'] },
  { id: 'a11y', faces: ['ARIA', 'Access'] }
];

export function TileMatcherDemo(): JSX.Element {
  return (
    <div style={{ width: '100%', maxWidth: 420, margin: '0 auto' }}>
      <TileMatcher
        pairs={CONCEPTS}
        columns={4}
        shuffle={false}
        aria-label='Match each concept to its role'
        onMatch={pairId => console.log('matched', pairId)}
        onComplete={stats => console.log('complete', stats)}
      />
    </div>
  );
}

export default TileMatcherDemo;
