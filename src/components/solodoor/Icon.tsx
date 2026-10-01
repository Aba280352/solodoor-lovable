import type { CSSProperties, SVGProps } from "react";

import { ICON_DATA, type IconName, type IconPath } from "./icon-data";

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  /** Size in design pixels; rendered in rem so it follows the fluid scale. */
  size?: number;
}

/**
 * SOLODOOR brand icon (magicoon Regular). Inherits the text colour.
 * The brand set is used instead of lucide-react so the glyphs match the design.
 */
export function Icon({ name, size = 20, style, ...rest }: IconProps) {
  const paths: readonly IconPath[] = ICON_DATA[name];
  const dimension = `${size / 16}rem`;
  const merged: CSSProperties = { width: dimension, height: dimension, ...style };
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      className="inline-block flex-none"
      style={merged}
      {...rest}
    >
      {paths.map((p, i) => (
        <path key={i} d={p.d} transform={p.transform} fillRule={p.fillRule} fill="currentColor" />
      ))}
    </svg>
  );
}
