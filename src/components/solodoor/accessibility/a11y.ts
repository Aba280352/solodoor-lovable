/**
 * The visitor's accessibility choices. They are kept in the browser and applied as attributes on <html>
 * (`data-a11y-contrast`, `data-a11y-links`, ...) and one custom property for the text size; the rules
 * that act on them are at the end of styles.css.
 */
import { useSyncExternalStore } from "react";

export interface A11yPrefs {
  /** Index into TEXT_STEPS. */
  text: number;
  contrast: boolean;
  gray: boolean;
  links: boolean;
  headings: boolean;
  font: boolean;
  spacing: boolean;
  motion: boolean;
  cursor: boolean;
  focus: boolean;
}

export type A11yToggle = Exclude<keyof A11yPrefs, "text">;

/** Text sizes offered, as a factor of the designed size. */
export const TEXT_STEPS = [1, 1.1, 1.2, 1.3, 1.4];

export const A11Y_DEFAULTS: A11yPrefs = {
  text: 0,
  contrast: false,
  gray: false,
  links: false,
  headings: false,
  font: false,
  spacing: false,
  motion: false,
  cursor: false,
  focus: false,
};

/** The switches of the menu, in the order they are shown. */
export const A11Y_TOGGLES: { key: A11yToggle; label: string }[] = [
  { key: "contrast", label: "ניגודיות גבוהה" },
  { key: "gray", label: "גווני אפור" },
  { key: "links", label: "הדגשת קישורים" },
  { key: "headings", label: "הדגשת כותרות" },
  { key: "font", label: "גופן קריא" },
  { key: "spacing", label: "ריווח טקסט" },
  { key: "motion", label: "עצירת אנימציות" },
  { key: "cursor", label: "סמן גדול" },
  { key: "focus", label: "הדגשת פוקוס" },
];

const STORAGE_KEY = "solodoor-a11y";

export function loadA11y(): A11yPrefs {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as Partial<A11yPrefs>;
    const prefs = { ...A11Y_DEFAULTS, ...saved };
    prefs.text = Math.min(TEXT_STEPS.length - 1, Math.max(0, Math.round(Number(prefs.text)) || 0));
    return prefs;
  } catch {
    return A11Y_DEFAULTS;
  }
}

export function saveA11y(prefs: A11yPrefs) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Storage can be unavailable (private mode); the choices then hold for this page only.
  }
}

export function applyA11y(prefs: A11yPrefs) {
  const root = document.documentElement;
  for (const { key } of A11Y_TOGGLES) root.toggleAttribute(`data-a11y-${key}`, prefs[key]);
  if (prefs.text > 0) root.style.setProperty("--a11y-text", String(TEXT_STEPS[prefs.text]));
  else root.style.removeProperty("--a11y-text");
}

export const a11yActive = (prefs: A11yPrefs) => prefs.text > 0 || A11Y_TOGGLES.some(({ key }) => prefs[key]);

const MOTION_ATTRIBUTE = "data-a11y-motion";

/**
 * "Stop animations" is on. The style sheet stops what CSS animates; whatever moves by script
 * (slideshows, self-scrolling carousels, counters, the scroll reveal) asks here.
 */
export const motionStopped = () => typeof document !== "undefined" && document.documentElement.hasAttribute(MOTION_ATTRIBUTE);

function subscribeMotion(listener: () => void) {
  const observer = new MutationObserver(listener);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: [MOTION_ATTRIBUTE] });
  return () => observer.disconnect();
}

/** `motionStopped` as state, for components that start timers. */
export function useMotionStopped() {
  return useSyncExternalStore(subscribeMotion, motionStopped, () => false);
}
