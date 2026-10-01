import { useEffect } from "react";

/**
 * Publishes the layout width (viewport minus the scrollbar) as `--viewport-width`
 * on <html>. styles.css derives the fluid root font size from it, so the page
 * scales against the space it really has; without it the CSS falls back to 100vw.
 */
export function useViewportScale() {
  useEffect(() => {
    const root = document.documentElement;
    const update = () => root.style.setProperty("--viewport-width", `${root.clientWidth}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(root);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      root.style.removeProperty("--viewport-width");
    };
  }, []);
}
