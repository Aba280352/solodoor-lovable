/**
 * Installation is priced per door: a door covered on both sides, or a door covered on one side only.
 * The price for both sides is the price of the installation add-on in the catalogue.
 */

/** Installing one side of a door. */
export const INSTALL_ONE_SIDE_PRICE = 440;
/** A designed door costs this much more to install when both of its sides are covered. */
export const INSTALL_DESIGNED_BOTH_SIDES_EXTRA = 100;

/** The Shopify SKUs of the installation, see checkout.ts. */
export const INSTALL_SKU = {
  double: "addon__installation",
  designedDouble: "addon__installation-designed",
  single: "addon__installation-one-side",
} as const;

/** How the sides ordered are spread over doors: `doubles` doors on both sides, the rest one side each. */
export function splitSides(sides: number, doubles: number) {
  const most = Math.floor(sides / 2);
  const both = Math.min(Math.max(0, doubles), most);
  return { doubles: both, singles: sides - both * 2, most };
}
