import type { ComponentProps } from "react";
import { Link } from "@tanstack/react-router";

import { shopSearchFor } from "./links";
import { stylePageForName } from "./styles";

type MenuLinkProps = { name: string } & Omit<ComponentProps<"a">, "href">;

/**
 * A link for a menu item: style names open their style archive, every other name opens the shop filtered.
 * The rest of the props (onClick, ref) go to the link, so a wrapping DialogClose asChild can close the mobile sheet.
 */
export function MenuLink({ name, children, ...rest }: MenuLinkProps) {
  const style = stylePageForName(name);
  if (style) {
    return (
      <Link to="/טפט-לפי-סגנון/$style" params={{ style: style.slug }} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <Link to="/חנות" search={shopSearchFor(name)} {...rest}>
      {children}
    </Link>
  );
}
