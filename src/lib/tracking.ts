/**
 * Google Tag Manager (container GTM-N5MCM898, the same one the old WordPress site used) and the events the site sends it.
 * The container holds the Google Ads / GA4 tags; the site only says what happened by pushing to window.dataLayer.
 */
export const GTM_ID = "GTM-N5MCM898";

/** The standard GTM loader, run from <head>. */
export const GTM_SNIPPET = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`;

type DataLayerWindow = Window & { dataLayer?: Record<string, unknown>[] };

/** Pushes one event; never throws, so tracking can never break a page. */
export function track(event: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  try {
    const w = window as DataLayerWindow;
    (w.dataLayer = w.dataLayer || []).push(event);
  } catch {
    /* tracking is optional */
  }
}

/** A line the visitor added to the cart, as GA4 describes an item. */
export interface TrackedItem {
  id: string;
  title: string;
  price: number;
  qty: number;
}

/** GA4 add_to_cart (ecommerce). The previous ecommerce object is cleared first, as GTM recommends. */
export function trackAddToCart(items: TrackedItem[]): void {
  if (!items.length) return;
  const value = Math.round(items.reduce((sum, i) => sum + i.price * i.qty, 0) * 100) / 100;
  track({ ecommerce: null });
  track({
    event: "add_to_cart",
    ecommerce: {
      currency: "ILS",
      value,
      items: items.map((i) => ({ item_id: i.id, item_name: i.title, price: i.price, quantity: i.qty })),
    },
  });
}

/**
 * The Google Ads click id of this visitor, if they came from an ad: the Conversion Linker keeps it in the
 * `_gcl_aw` cookie ("GCL.<time>.<gclid>"). The checkout is on Shopify's domain, so it travels there as an order
 * attribute and the Shopify purchase pixel credits the ad with it.
 */
export function adClickId(): string | undefined {
  if (typeof document === "undefined") return undefined;
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("gclid");
    if (fromUrl) return fromUrl;
    const cookie = document.cookie.split("; ").find((c) => c.startsWith("_gcl_aw="));
    const gclid = cookie?.split("=")[1]?.split(".").slice(2).join(".");
    return gclid || undefined;
  } catch {
    return undefined;
  }
}

/** A contact form was sent successfully. "form_submit" is the event the container's Google Ads lead tag already listens to. */
export function trackFormSubmit(source: string): void {
  track({ event: "form_submit", form_source: source });
}
