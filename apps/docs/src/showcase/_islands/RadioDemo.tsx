import type { JSX } from 'react';
import { Radio, RadioGroup } from '@freecodecamp/uikit';

export function RadioDemo(): JSX.Element {
  return (
    <RadioGroup name='theme-demo' defaultValue='dark' aria-label='Theme'>
      <Radio value='dark' label='Dark - default' />
      <Radio value='light' label='Light' />
      <Radio value='system' label='System' />
    </RadioGroup>
  );
}

export default RadioDemo;
