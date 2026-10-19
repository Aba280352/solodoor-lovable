import { useEffect } from "react";

/** Fields where the visitor types and copies as usual. */
const EDITABLE = "input, textarea, select, [contenteditable=''], [contenteditable='true']";

const isEditable = (target: EventTarget | null) => target instanceof Element && !!target.closest(EDITABLE);

/**
 * Makes copying the site's pictures and text awkward: no save/copy menu on long-press or right-click,
 * no dragging a picture out, no copying of the page text, and no save / view-source shortcuts. It is a
 * deterrent for casual copying; the CSS side (`html[data-protect]`) is at the end of styles.css.
 */
export function useContentProtection() {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-protect", "");

    const block = (event: Event) => {
      if (!isEditable(event.target)) event.preventDefault();
    };
    const onKey = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const mod = event.ctrlKey || event.metaKey;
      const devTools = event.key === "F12" || (mod && event.shiftKey && ["i", "j", "c"].includes(key)) || (event.metaKey && event.altKey && ["i", "j", "c", "u"].includes(key));
      if (devTools || (mod && ["s", "u"].includes(key))) event.preventDefault();
    };

    document.addEventListener("contextmenu", block);
    document.addEventListener("dragstart", block);
    document.addEventListener("copy", block);
    document.addEventListener("cut", block);
    document.addEventListener("keydown", onKey);
    return () => {
      root.removeAttribute("data-protect");
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("dragstart", block);
      document.removeEventListener("copy", block);
      document.removeEventListener("cut", block);
      document.removeEventListener("keydown", onKey);
    };
  }, []);
}
