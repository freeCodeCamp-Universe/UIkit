import React from 'react';

/**
 * Primitive hotspot shapes for `<Hotspots />`. Each is a thin wrapper over an
 * SVG shape that carries the `hotspots__shape` class so the parent controls
 * fill/stroke by state. Pass geometry via the native SVG attributes and place
 * inside a `HotspotItem.shape`.
 */

const shapeClass = (className?: string): string =>
  ['hotspots__shape', className].filter(Boolean).join(' ');

export type CircleHotspotProps = React.SVGProps<SVGCircleElement>;
export function CircleHotspot({
  className,
  ...rest
}: CircleHotspotProps): React.ReactElement {
  return <circle className={shapeClass(className)} {...rest} />;
}

export type EllipseHotspotProps = React.SVGProps<SVGEllipseElement>;
export function EllipseHotspot({
  className,
  ...rest
}: EllipseHotspotProps): React.ReactElement {
  return <ellipse className={shapeClass(className)} {...rest} />;
}

export type RectHotspotProps = React.SVGProps<SVGRectElement>;
export function RectHotspot({
  className,
  ...rest
}: RectHotspotProps): React.ReactElement {
  return <rect className={shapeClass(className)} {...rest} />;
}

export type PolygonHotspotProps = React.SVGProps<SVGPolygonElement>;
export function PolygonHotspot({
  className,
  ...rest
}: PolygonHotspotProps): React.ReactElement {
  return <polygon className={shapeClass(className)} {...rest} />;
}
