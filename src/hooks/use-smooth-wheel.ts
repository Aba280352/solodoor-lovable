import { useEffect } from "react";

/**
 * Eased mouse-wheel scrolling for the page (desktop only): each wheel tick
 * moves a target position and the page glides towards it. Touch, keyboard and
 * scrollbar dragging are left native, as are nested scroll areas and open dialogs.
 */
export function useSmoothWheel() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let target = window.scrollY;
    let current = target;
    let raf: number | null = null;
    const max = () => document.documentElement.scrollHeight - window.innerHeight;

    const loop = () => {
      current += (target - current) * 0.085;
      if (Math.abs(target - current) < 0.4) {
        current = target;
        raf = null;
        window.scrollTo(0, current);
        return;
      }
      window.scrollTo(0, current);
      raf = requestAnimationFrame(loop);
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (document.body.hasAttribute("data-scroll-locked")) return;
      let node = e.target as HTMLElement | null;
      while (node && node !== document.body) {
        const style = getComputedStyle(node);
        if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight) return;
        node = node.parentElement;
      }
      e.preventDefault();
      if (raf === null) {
        current = window.scrollY;
        target = current;
      }
      target = Math.max(0, Math.min(max(), target + e.deltaY * (e.deltaMode === 1 ? 32 : 1)));
      if (raf === null) raf = requestAnimationFrame(loop);
    };

    const onScroll = () => {
      if (raf === null) current = target = window.scrollY;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);
}
