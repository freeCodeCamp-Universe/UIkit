import type { JSX } from 'react';
import { Hotspots, RectHotspot, EllipseHotspot } from '@freecodecamp/uikit';
import type { HotspotItem } from '@freecodecamp/uikit';

const Diagram = (): JSX.Element => (
  <img src='/favicon.svg' alt='freecodecamp logo' />
);

const HOTSPOTS: HotspotItem[] = [
  {
    id: 'bracket-left',
    label: 'Opening Paren',
    shape: <RectHotspot x={33} y={25} width={29} height={92} />
  },
  {
    id: 'fire',
    label: 'Fire',
    shape: <EllipseHotspot cx={100} cy={75} rx={30} ry={45} />
  },
  {
    id: 'bracket-right',
    label: 'Closing Paren',
    shape: <RectHotspot x={138} y={25} width={29} height={92} />
  }
];

export function HotspotsDemo(): JSX.Element {
  return (
    <div style={{ width: '100%', maxWidth: 360, margin: '0 auto' }}>
      <Hotspots
        background={<Diagram />}
        width={200}
        height={140}
        hotspots={HOTSPOTS}
        targetId='fire'
        prompt='Click the fire'
        onCorrect={id => console.log('correct', id)}
      />
    </div>
  );
}

export default HotspotsDemo;
