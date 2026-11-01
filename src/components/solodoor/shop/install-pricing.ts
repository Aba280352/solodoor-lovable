/**
 * Installation is priced per door: a door covered on both sides, or a door covered on one side only.
 * The prices live on the installation add-on and are set in the admin (מחירים), which also updates the
 * three Shopify variants below.
 */
export interface InstallPrices {
  /** A door covered on both sides. */
  double: number;
  /** A door covered on one side, of any kind. */
  single: number;
  /** A designed door covered on both sides. */
  designedDouble: number;
}

/** What the text shows until the prices have loaded. */
export const DEFAULT_INSTALL_PRICES: InstallPrices = { double: 490, single: 440, designedDouble: 590 };

/** The prices stored on the installation add-on. */
export function installPrices(addon?: { price: number; price_one_side?: number | null; price_designed_double?: number | null }): InstallPrices {
  return {
    double: Number(addon?.price ?? DEFAULT_INSTALL_PRICES.double),
    single: Number(addon?.price_one_side ?? DEFAULT_INSTALL_PRICES.single),
    designedDouble: Number(addon?.price_designed_double ?? DEFAULT_INSTALL_PRICES.designedDouble),
  };
}

/** Puts the current prices into a text of the terms, where it says {install.double} and so on. */
export const fillInstallPrices = (text: string, prices: InstallPrices) =>
  text
    .replace("{install.double}", String(prices.double))
    .replace("{install.single}", String(prices.single))
    .replace("{install.designedDouble}", String(prices.designedDouble));

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
