/**
 * "אודות" and "יצירת קשר" jump to blocks of the footer, which every page has,
 * so the links work the same on every page. Labels from the header and the footer map to an anchor id.
 */
export const FOOTER_ANCHORS: Record<string, "about" | "contact"> = {
  אודות: "about",
  "יצירת קשר": "contact",
  "צור קשר": "contact",
};

/** Smooth-scrolls to a footer block, then moves focus there for keyboard and screen-reader users. */
export function scrollToFooterAnchor(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
}
