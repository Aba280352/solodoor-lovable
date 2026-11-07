/**
 * The page side of the visual editor. When the site runs inside the editor's frame with ?edit=1:
 * a click only selects (links, buttons, forms and pop-ups do nothing), hovering outlines the section under the
 * pointer, and the editor's unsaved values arrive by postMessage and show at once. Same origin only.
 */
import { useEffect } from "react";

export type EditorMessage =
  | { type: "live"; key: string; data: unknown }
  | { type: "select"; key: string | null }
  | { type: "reload" };

export type PageMessage = { type: "ready"; sections: string[] } | { type: "select"; key: string };

/** True when this page is the editor's preview (?edit=1 inside a frame of the same site). */
export function isEditFrame(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.parent !== window && window.parent.location.origin === window.location.origin && new URLSearchParams(window.location.search).has("edit");
  } catch {
    return false;
  }
}

const post = (msg: PageMessage) => window.parent.postMessage(msg, window.location.origin);

const STYLE = `
[data-edit-section]:not(header){position:relative;scroll-margin-top:84px}
[data-edit-section]:hover{outline:2px dashed #C96F61;outline-offset:-2px;cursor:pointer}
[data-edit-section][data-edit-selected]{outline:3px solid #C96F61;outline-offset:-3px}
[data-edit-section][data-edit-selected]::before,[data-edit-section]:hover::before{content:attr(data-edit-label);position:absolute;top:0;right:0;z-index:60;background:#C96F61;color:#fff;font:600 13px/1 system-ui,sans-serif;padding:5px 9px;border-radius:0 0 0 6px;pointer-events:none}
img{pointer-events:auto!important}
`;

/** Wires the page to the editor: selection, blocked interactions, live values. */
export function EditBridge({ onLive }: { onLive: (key: string, data: unknown) => void }) {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = STYLE;
    document.head.appendChild(style);

    const select = (key: string | null, scroll: boolean) => {
      document.querySelectorAll("[data-edit-selected]").forEach((el) => el.removeAttribute("data-edit-selected"));
      if (!key) return;
      const el = document.querySelector(`[data-edit-section="${CSS.escape(key)}"]`);
      if (!el) return;
      el.setAttribute("data-edit-selected", "");
      if (scroll) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    // A click selects the section under it; nothing else on the page reacts.
    const onClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const el = (e.target as Element | null)?.closest?.("[data-edit-section]");
      const key = el?.getAttribute("data-edit-section");
      if (key) {
        select(key, false);
        post({ type: "select", key });
      }
    };
    const block = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener("click", onClick, true);
    window.addEventListener("auxclick", block, true);
    window.addEventListener("submit", block, true);
    // Menus and pop-ups that open on pointer-down (not on click) stay closed too.
    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest?.("a,button,[role=button],input,textarea,select,summary")) e.stopPropagation();
    };
    window.addEventListener("pointerdown", onPointerDown, true);

    const onMessage = (e: MessageEvent<EditorMessage>) => {
      if (e.origin !== window.location.origin || !e.data || typeof e.data !== "object") return;
      if (e.data.type === "live") onLive(e.data.key, e.data.data);
      if (e.data.type === "select") select(e.data.key, true);
      if (e.data.type === "reload") window.location.reload();
    };
    window.addEventListener("message", onMessage);

    // Close any pop-up that opened before the bridge started.
    document.querySelectorAll("dialog[open]").forEach((d) => (d as HTMLDialogElement).close());
    const announce = () => post({ type: "ready", sections: [...document.querySelectorAll("[data-edit-section]")].map((el) => el.getAttribute("data-edit-section")!) });
    const t = window.setTimeout(announce, 300);

    return () => {
      window.clearTimeout(t);
      style.remove();
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("auxclick", block, true);
      window.removeEventListener("submit", block, true);
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("message", onMessage);
    };
  }, [onLive]);
  return null;
}
