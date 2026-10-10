import { useEffect, useState } from "react";

import { fetchShop, type ShopData } from "./catalog";

/** The shop data is loaded once per visit, by whichever part of the page asks first. */
let shopPromise: Promise<ShopData> | null = null;

export const loadShop = () =>
  (shopPromise ??= fetchShop().catch((e) => {
    shopPromise = null;
    throw e;
  }));

/** The catalogue for sections outside the shop (home page, door and kitchen pages, quiz). Null until it has loaded. */
export function useShop(enabled = true): { shop: ShopData | null; failed: boolean } {
  const [shop, setShop] = useState<ShopData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let live = true;
    loadShop().then(
      (data) => live && setShop(data),
      () => live && setFailed(true),
    );
    return () => {
      live = false;
    };
  }, [enabled]);

  return { shop, failed };
}
