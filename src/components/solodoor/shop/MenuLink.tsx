import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

import { shopSearchFor } from "./links";
import { stylePageForName } from "./styles";

/** A link for a menu item: style names open their style archive, every other name opens the shop filtered. */
export function MenuLink({ name, className, children }: { name: string; className?: string; children: ReactNode }) {
  const style = stylePageForName(name);
  if (style) {
    return (
      <Link to="/טפט-לפי-סגנון/$style" params={{ style: style.slug }} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <Link to="/חנות" search={shopSearchFor(name)} className={className}>
      {children}
    </Link>
  );
}
