/**
 * "יצירת קשר" jumps to the lead form in the footer, which every page has, so the link works
 * the same on every page. ("אודות" goes to the about section of the home page instead.)
 */
export const FOOTER_ANCHORS: Record<string, "contact"> = {
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

/**
 * "אודות" is a real link to /#about, so it works from every page. On the home page itself the router
 * ignores a link to the address it is already at (every click after the first would do nothing), so the
 * click scrolls there directly. Returns true when it did, so the caller can cancel the navigation.
 */
export function scrollToAboutOnHome(): boolean {
  if (window.location.pathname !== "/") return false;
  const el = document.getElementById("about");
  if (!el) return false;
  el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", "/#about");
  return true;
}
