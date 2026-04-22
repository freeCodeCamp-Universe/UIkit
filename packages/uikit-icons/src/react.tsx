// React <Icon> wrapper. Defaults to aria-hidden so icons inside buttons
// with accompanying text do not duplicate the label; pass `label` to
// promote the icon to role="img" with an accessible name.
import type { SVGAttributes } from 'react';
import { icons, svgAttrs, type IconName } from './icons';

export interface IconProps extends Omit<
  SVGAttributes<SVGSVGElement>,
  'children'
> {
  name: IconName;
  size?: number | string;
  label?: string;
}

export function Icon({ name, size = 16, label, ...rest }: IconProps) {
  const body = icons[name];
  const a11y = label
    ? { role: 'img' as const, 'aria-label': label }
    : { 'aria-hidden': true };

  return (
    <svg
      {...svgAttrs}
      width={size}
      height={size}
      data-icon={name}
      {...a11y}
      {...rest}
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}
