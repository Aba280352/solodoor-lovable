import { useEffect, type RefObject } from "react";

const EASE = "cubic-bezier(.16,1,.3,1)";

type RevealEl = HTMLElement & { _delay?: number; _shown?: boolean; _timer?: number };

function hide(el: RevealEl) {
  el.style.opacity = "0";
  el.style.transform = "translate3d(0,36px,0)";
  el.style.willChange = "opacity, transform";
}

function clear(el: RevealEl) {
  el.style.transition = "";
  el.style.transform = "";
  el.style.opacity = "";
  el.style.willChange = "";
}

/**
 * Scroll reveal for every `[data-reveal]` block inside `rootRef`: its direct
 * content children rise 36px and fade in, staggered by 110ms, and reset once
 * they leave the viewport so they replay on the way back.
 */
export function useSectionReveal(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets: RevealEl[] = [];
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as RevealEl;
          if (!entry.isIntersecting) {
            const rect = entry.boundingClientRect;
            if (rect.top >= window.innerHeight || rect.bottom <= 0) {
              window.clearTimeout(el._timer);
              el.style.transition = "none";
              hide(el);
              el._shown = false;
            }
            continue;
          }
          if (el._shown) continue;
          el._shown = true;
          const delay = el._delay ?? 0;
          void el.offsetHeight;
          el.style.transition = `opacity 1000ms ${EASE} ${delay}ms, transform 1100ms ${EASE} ${delay}ms`;
          el.style.opacity = "1";
          el.style.transform = "translate3d(0,0,0)";
          window.clearTimeout(el._timer);
          el._timer = window.setTimeout(() => clear(el), 1300 + delay);
        }
      },
      { threshold: 0.06, rootMargin: "0px 0px -7% 0px" },
    );

    root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((section) => {
      let container: Element = section;
      while (container.children.length === 1) container = container.firstElementChild!;
      Array.from(container.children).forEach((child, i) => {
        const el = child as RevealEl;
        el._delay = Math.min(i, 5) * 110;
        el._shown = false;
        hide(el);
        io.observe(el);
        targets.push(el);
      });
    });

    return () => {
      io.disconnect();
      for (const el of targets) {
        window.clearTimeout(el._timer);
        clear(el);
      }
    };
  }, [rootRef]);
}
