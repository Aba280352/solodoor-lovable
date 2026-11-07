/**
 * The page side of the visual editor. When the site runs inside the editor's frame with ?edit=1:
 * a click only selects (links, buttons, forms and pop-ups do nothing): the section, and the field under the pointer
 * when it is marked; a double click on a marked text edits it in place on the page, a double click on a marked image
 * opens its replacement; hovering outlines what is under the pointer; the editor's unsaved values arrive by
 * postMessage and show at once. Same origin only.
 */
import { useEffect } from "react";

export type EditorMessage =
  | { type: "live"; key: string; data: unknown }
  | { type: "select"; key: string | null }
  | { type: "reload" };

export type PageMessage =
  | { type: "ready"; sections: string[] }
  | { type: "select"; key: string; field?: string; open?: boolean }
  | { type: "inline"; key: string; field: string; value: string };

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
[data-edit-field]:hover{outline:1px solid #7D958B;outline-offset:2px;border-radius:2px}
[data-edit-field][data-edit-inline]:hover{cursor:text}
[data-edit-image]:hover{outline:3px solid #7D958B!important;outline-offset:-3px;cursor:pointer}
[data-edit-field][contenteditable]{outline:2px solid #7D958B!important;outline-offset:3px;background:rgba(125,149,139,.12);cursor:text}
img{pointer-events:auto!important}
`;

/** Wires the page to the editor: selection, in-place text editing, blocked interactions, live values. */
export function EditBridge({ onLive, onRemount }: { onLive: (key: string, data: unknown) => void; onRemount: () => void }) {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = STYLE;
    document.head.appendChild(style);

    // While a text is being edited on the page, the editor's echo of that section waits, so React does not
    // replace the text under the caret; it is applied when the editing ends.
    let editing: { el: HTMLElement; key: string; field: string; original: string } | null = null;
    const held = new Map<string, unknown>();

    const select = (key: string | null, scroll: boolean) => {
      document.querySelectorAll("[data-edit-selected]").forEach((el) => el.removeAttribute("data-edit-selected"));
      if (!key) return;
      const el = document.querySelector(`[data-edit-section="${CSS.escape(key)}"]`);
      if (!el) return;
      el.setAttribute("data-edit-selected", "");
      if (scroll) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    // The marked element under the pointer: the clicked element's own mark, or else the first marked element at that
    // point (a picture under a gradient, a slider handle or a link overlay still counts as the picture).
    const target = (e: MouseEvent) => {
      const t = e.target as Element | null;
      const section = t?.closest?.("[data-edit-section]");
      let field = t?.closest?.("[data-edit-field]") ?? null;
      if (!field && section) {
        for (const el of document.elementsFromPoint(e.clientX, e.clientY)) {
          const f = el.closest("[data-edit-field]");
          if (f && section.contains(f)) {
            field = f;
            break;
          }
        }
      }
      return {
        key: section?.getAttribute("data-edit-section") ?? null,
        field: field && section?.contains(field) ? field.getAttribute("data-edit-field") ?? undefined : undefined,
        fieldEl: field as HTMLElement | null,
      };
    };

    const endEditing = (keep: boolean) => {
      if (!editing) return;
      const { el, key, field, original } = editing;
      if (!keep) {
        el.textContent = original;
        post({ type: "inline", key, field, value: original });
      }
      el.removeAttribute("contenteditable");
      editing = null;
      for (const [k, data] of held) onLive(k, data);
      held.clear();
      // The browser edited the text nodes React rendered; drawing the page afresh puts React back in charge.
      onRemount();
    };

    // A click selects; nothing else on the page reacts. Inside the text being edited, the caret moves as usual.
    const onClick = (e: MouseEvent) => {
      if (editing && editing.el.contains(e.target as Node)) {
        // Inside the text being edited (it may sit in a link or button): move the caret, nothing else.
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      if (editing) endEditing(true);
      const { key, field } = target(e);
      if (key) {
        select(key, false);
        post({ type: "select", key, field });
      }
    };

    // A double click on a marked text turns it into an editable text, right on the page.
    const onDblClick = (e: MouseEvent) => {
      const { key, field, fieldEl } = target(e);
      if (key && field && fieldEl?.hasAttribute("data-edit-image")) {
        // A picture: the panel opens its replacement (the double click lets it open the file picker).
        e.preventDefault();
        e.stopPropagation();
        if (editing) endEditing(true);
        post({ type: "select", key, field, open: true });
        return;
      }
      if (!key || !field || !fieldEl?.hasAttribute("data-edit-inline")) return;
      e.preventDefault();
      e.stopPropagation();
      if (editing) endEditing(true);
      editing = { el: fieldEl, key, field, original: fieldEl.textContent ?? "" };
      try {
        fieldEl.setAttribute("contenteditable", "plaintext-only");
      } catch {
        fieldEl.setAttribute("contenteditable", "true");
      }
      fieldEl.focus();
      const range = document.createRange();
      range.selectNodeContents(fieldEl);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    };

    const onInput = (e: Event) => {
      if (!editing || e.target !== editing.el) return;
      post({ type: "inline", key: editing.key, field: editing.field, value: (editing.el.textContent ?? "").replace(/\s+/g, " ") });
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (!editing) return;
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const el = editing.el;
        endEditing(true);
        el.blur();
      } else if (e.key === "Escape") {
        e.preventDefault();
        endEditing(false);
      }
    };
    const onFocusOut = (e: FocusEvent) => {
      if (editing && e.target === editing.el) endEditing(true);
    };

    const block = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    // Menus and pop-ups that open on pointer-down (not on click) stay closed too.
    const onPointerDown = (e: PointerEvent) => {
      if (editing && editing.el.contains(e.target as Node)) return;
      // Carousels and sliders inside a section would grab the pointer, so a click there could not select anything.
      if ((e.target as Element | null)?.closest?.("a,button,[role=button],input,textarea,select,summary,[data-edit-section]")) e.stopPropagation();
    };
    window.addEventListener("click", onClick, true);
    window.addEventListener("dblclick", onDblClick, true);
    window.addEventListener("auxclick", block, true);
    window.addEventListener("submit", block, true);
    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("input", onInput, true);
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("focusout", onFocusOut, true);

    const onMessage = (e: MessageEvent<EditorMessage>) => {
      if (e.origin !== window.location.origin || !e.data || typeof e.data !== "object") return;
      if (e.data.type === "live") {
        // Nothing on the page is redrawn under the caret (a shared list may arrive under another key).
        if (editing) held.set(e.data.key, e.data.data);
        else onLive(e.data.key, e.data.data);
      }
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
      window.removeEventListener("dblclick", onDblClick, true);
      window.removeEventListener("auxclick", block, true);
      window.removeEventListener("submit", block, true);
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("input", onInput, true);
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("focusout", onFocusOut, true);
      window.removeEventListener("message", onMessage);
    };
  }, [onLive, onRemount]);
  return null;
}
