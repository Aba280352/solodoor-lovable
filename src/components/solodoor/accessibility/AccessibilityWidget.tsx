import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

import { Icon } from "../Icon";
import { A11Y_DEFAULTS, A11Y_TOGGLES, TEXT_STEPS, a11yActive, applyA11y, loadA11y, saveA11y, type A11yPrefs, type A11yToggle } from "./a11y";

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** Line drawings for the switches; the brand icon set has no accessibility glyphs. */
const GLYPHS: Record<A11yToggle, ReactNode> = {
  contrast: (
    <>
      <circle cx="12" cy="12" r="8.5" {...stroke} />
      <path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" />
    </>
  ),
  gray: <path d="M12 3.5c3.2 3.7 5.5 6.6 5.5 9.6a5.5 5.5 0 0 1-11 0c0-3 2.3-5.9 5.5-9.6z" {...stroke} />,
  links: (
    <>
      <path d="M10.5 13.5a3.8 3.8 0 0 0 5.4 0l2.6-2.6a3.8 3.8 0 0 0-5.4-5.4l-.9.9" {...stroke} />
      <path d="M13.5 10.5a3.8 3.8 0 0 0-5.4 0l-2.6 2.6a3.8 3.8 0 0 0 5.4 5.4l.9-.9" {...stroke} />
    </>
  ),
  headings: <path d="M6 5v14M18 5v14M6 12h12" {...stroke} />,
  font: <path d="M5 19 12 5l7 14M8.2 13.5h7.6" {...stroke} />,
  spacing: <path d="M4 7h16M4 12h16M4 17h16M9 4.5 12 2l3 2.5M9 19.5l3 2.5 3-2.5" {...stroke} strokeWidth={1.5} />,
  motion: (
    <>
      <circle cx="12" cy="12" r="8.5" {...stroke} />
      <path d="M10 8.5v7M14 8.5v7" {...stroke} />
    </>
  ),
  cursor: <path d="M6 3.5v15l4-3.7 2.6 5.7 2.4-1.1-2.6-5.6H18z" {...stroke} />,
  focus: (
    <>
      <rect x="3" y="6.5" width="18" height="11" rx="2" {...stroke} />
      <path d="M7 10.5h.01M11 10.5h.01M15 10.5h.01M8 14h8" {...stroke} />
    </>
  ),
};

/**
 * The accessibility menu: a floating button at the bottom left of every page that opens a panel of
 * display choices (text size, contrast, readable font and so on). The choices are remembered.
 */
export function AccessibilityWidget() {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<A11yPrefs>(A11Y_DEFAULTS);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  // The saved choices are read after hydration, so the server and first client render match.
  useEffect(() => {
    const saved = loadA11y();
    setPrefs(saved);
    applyA11y(saved);
  }, []);

  const update = (next: A11yPrefs) => {
    setPrefs(next);
    applyA11y(next);
    saveA11y(next);
  };

  // The panel does not cover the page, so the choices show as they are made; Escape or a click outside closes it.
  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    };
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!panel.current?.contains(target) && !trigger.current?.contains(target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const sizeButton =
    "flex size-10 flex-none cursor-pointer items-center justify-center text-foreground disabled:cursor-default disabled:opacity-35";

  return (
    <div dir="rtl" className="font-sans text-foreground">
      <button
        ref={trigger}
        type="button"
        aria-label="תפריט נגישות"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-4 left-4 z-40 flex size-12 cursor-pointer items-center justify-center rounded-full bg-sand text-foreground shadow-handle transition-transform duration-240 ease-standard hover:scale-105 lg:bottom-6 lg:left-6 lg:size-14"
      >
        <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="size-6.5 lg:size-7.5" fill="currentColor">
          <circle cx="12" cy="4.4" r="2.1" />
          <path d="M20.2 7.6a1 1 0 0 0-1.2-.7c-2.3.6-4.6.9-7 .9s-4.7-.3-7-.9a1 1 0 0 0-.5 1.9c1.8.5 3.6.8 5.5.9V13l-1.9 6.7a1 1 0 0 0 1.9.6l1.800-5.800h.4l1.800 5.800a1 1 0 0 0 1.9-.6L14 13V9.700c1.9-.1 3.700-.4 5.500-.9a1 1 0 0 0 .7-1.2z" />
        </svg>
        {a11yActive(prefs) && <span className="absolute top-0.5 right-0.5 size-3 rounded-full bg-primary" />}
      </button>

      {open && (
        <div
          ref={panel}
          id={panelId}
          role="dialog"
          aria-label="תפריט נגישות"
          tabIndex={-1}
          className="fixed inset-x-3 bottom-20 z-[45] flex max-h-[calc(100dvh-6.5rem)] flex-col overflow-y-auto overscroll-contain rounded-[1rem] border border-border bg-card p-5 text-right shadow-menu focus:outline-none lg:inset-x-auto lg:bottom-24 lg:left-6 lg:w-96"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="fs-22 leading-[1.2] font-bold text-foreground">נגישות</h2>
              <p className="fs-15 leading-[1.5] text-foreground">התאימו את תצוגת האתר לנוחות שלכם.</p>
            </div>
            <button
              type="button"
              aria-label="סגירת תפריט הנגישות"
              onClick={() => {
                setOpen(false);
                trigger.current?.focus();
              }}
              className="flex size-9 flex-none cursor-pointer items-center justify-center rounded-full bg-sand text-foreground"
            >
              <Icon name="Times" size={18} />
            </button>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3.5 py-2.5">
            <span className="fs-16 font-semibold text-foreground">גודל הטקסט</span>
            <div className="inline-flex items-center rounded-md border border-input bg-card" role="group" aria-label="גודל הטקסט">
              <button type="button" className={sizeButton} aria-label="הקטנת הטקסט" disabled={prefs.text <= 0} onClick={() => update({ ...prefs, text: prefs.text - 1 })}>
                <Icon name="Minus" size={14} />
              </button>
              <span dir="ltr" className="min-w-14 text-center fs-16 font-semibold text-foreground" aria-live="polite">
                {Math.round(TEXT_STEPS[prefs.text] * 100)}%
              </span>
              <button
                type="button"
                className={sizeButton}
                aria-label="הגדלת הטקסט"
                disabled={prefs.text >= TEXT_STEPS.length - 1}
                onClick={() => update({ ...prefs, text: prefs.text + 1 })}
              >
                <Icon name="Plus" size={14} />
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {A11Y_TOGGLES.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                aria-pressed={prefs[key]}
                onClick={() => update({ ...prefs, [key]: !prefs[key] })}
                className={cn(
                  "flex min-h-21 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border px-2 py-3 text-center fs-15 leading-[1.3] font-medium transition-colors duration-160 ease-standard",
                  prefs[key] ? "border-secondary bg-secondary text-secondary-foreground" : "border-border bg-background text-foreground hover:border-foreground",
                )}
              >
                <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="size-6 flex-none">
                  {GLYPHS[key]}
                </svg>
                <span>{label}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => update(A11Y_DEFAULTS)}
              disabled={!a11yActive(prefs)}
              className="flex min-h-21 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-border bg-background px-2 py-3 text-center fs-15 leading-[1.3] font-medium text-foreground transition-colors duration-160 ease-standard hover:border-foreground disabled:cursor-default disabled:opacity-45 disabled:hover:border-border"
            >
              <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="size-6 flex-none">
                <path d="M4.5 12a7.5 7.5 0 1 0 2.3-5.4M4.5 4.5v4h4" {...stroke} />
              </svg>
              <span>איפוס ההגדרות</span>
            </button>
          </div>

          <Link
            to="/accessibility"
            onClick={() => setOpen(false)}
            className="mt-4 self-start border-b border-primary fs-15 leading-[1.5] font-medium text-foreground"
          >
            להצהרת הנגישות של האתר
          </Link>
        </div>
      )}
    </div>
  );
}
