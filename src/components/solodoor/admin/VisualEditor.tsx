/**
 * The visual editor: the real page in a frame (?edit=1&preview=1), a device switch, and a side panel.
 * Clicking a part of the page selects it and opens its fields; every change shows on the page at once and is
 * saved as a draft / published from the panel, exactly like the "תוכן האתר" screens (same data, same history).
 * The "סידור הדף" tab reorders the page's sections and hides them per device.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

import { Icon } from "../Icon";
import type { EditorMessage, PageMessage } from "../content/edit-bridge";
import { HOME_SECTIONS } from "../content/home";
import { SECTION_LABELS, layoutKey, type LayoutOverride } from "../content/layout";
import { ContentEditor } from "./content-editor";
import { FooterSection, NavSection, PromoSection } from "./content-sections";
import { SectionEditor } from "./section-editor";

const DEVICES = [
  { key: "desktop", label: "מחשב", width: 1440, icon: "Expand" },
  { key: "tablet", label: "טאבלט", width: 820, icon: "LayerGroup" },
  { key: "mobile", label: "טלפון", width: 390, icon: "Phone" },
] as const;

/** The pages the editor can open so far. */
const PAGES = [{ path: "/", label: "דף הבית" }];

type Live = (data: unknown) => void;

/** The fields of one selected part of the page. */
function SelectedPanel({ sectionKey, onLive }: { sectionKey: string; onLive: Live }) {
  const home = HOME_SECTIONS.find((s) => s.def.key === sectionKey);
  if (home) return <SectionEditor key={sectionKey} def={home.def} defaults={home.defaults} onLiveChange={onLive} />;
  if (sectionKey === "promo") return <PromoSection onLiveChange={onLive} />;
  if (sectionKey === "nav") return <NavSection onLiveChange={onLive} />;
  if (sectionKey === "footer") return <FooterSection onLiveChange={onLive} />;
  return (
    <p className="rounded-lg border border-dashed border-border bg-card px-4 py-6 text-center fs-15 text-foreground/70">
      העריכה של "{SECTION_LABELS[sectionKey] ?? sectionKey}" תיפתח בשלב הבא. בינתיים אפשר להזיז או להסתיר אותו בלשונית "סידור הדף".
    </p>
  );
}

/** Order and per-device visibility of the page's sections. */
function LayoutPanel({ path, sections, onLive }: { path: string; sections: string[]; onLive: Live }) {
  const btn = "inline-flex size-8 cursor-pointer items-center justify-center rounded-md border border-border fs-14 text-foreground hover:border-foreground disabled:cursor-default disabled:opacity-30";
  return (
    <ContentEditor<LayoutOverride>
      contentKey={layoutKey(path)}
      title="סידור הדף"
      intro="סדר האזורים בדף, ואילו אזורים מוסתרים בטלפון או במחשב. אזור מוסתר מוצג כאן חלש, כדי שאפשר יהיה להחזיר אותו."
      onLiveChange={onLive}
      prepare={(value) => ({ data: { order: value.order, hide: value.hide } })}
    >
      {(value, set) => {
        const order = [...(value.order ?? []).filter((k) => sections.includes(k)), ...sections.filter((k) => !(value.order ?? []).includes(k))];
        const hide = value.hide ?? {};
        const move = (i: number, d: number) => {
          const next = [...order];
          [next[i], next[i + d]] = [next[i + d], next[i]];
          set({ order: next });
        };
        const toggle = (key: string, device: "mobile" | "desktop", on: boolean) => set({ hide: { ...hide, [key]: { ...hide[key], [device]: on } } });
        return (
          <div className="flex flex-col gap-2">
            {order.map((key, i) => (
              <div key={key} className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
                <span className="flex-1 fs-15 font-medium text-foreground">{SECTION_LABELS[key] ?? key}</span>
                <label className="flex cursor-pointer items-center gap-1 fs-13 text-foreground">
                  <input type="checkbox" checked={hide[key]?.mobile === true} onChange={(e) => toggle(key, "mobile", e.target.checked)} className="size-4 accent-primary" />
                  להסתיר בטלפון
                </label>
                <label className="flex cursor-pointer items-center gap-1 fs-13 text-foreground">
                  <input type="checkbox" checked={hide[key]?.desktop === true} onChange={(e) => toggle(key, "desktop", e.target.checked)} className="size-4 accent-primary" />
                  במחשב
                </label>
                <button type="button" aria-label="למעלה" disabled={i === 0} onClick={() => move(i, -1)} className={btn}>
                  ↑
                </button>
                <button type="button" aria-label="למטה" disabled={i === order.length - 1} onClick={() => move(i, 1)} className={btn}>
                  ↓
                </button>
              </div>
            ))}
          </div>
        );
      }}
    </ContentEditor>
  );
}

export function VisualEditor() {
  const [path, setPath] = useState(PAGES[0].path);
  const [device, setDevice] = useState<(typeof DEVICES)[number]["key"]>("desktop");
  const [tab, setTab] = useState<"section" | "layout">("section");
  const [selected, setSelected] = useState<string | null>(null);
  const [sections, setSections] = useState<string[]>([]);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState({ w: 1000, h: 700 });

  const send = useCallback((msg: EditorMessage) => frameRef.current?.contentWindow?.postMessage(msg, window.location.origin), []);

  // Messages from the page: it is ready (with its sections), or a part was clicked.
  useEffect(() => {
    const onMessage = (e: MessageEvent<PageMessage>) => {
      if (e.origin !== window.location.origin || e.source !== frameRef.current?.contentWindow || !e.data) return;
      if (e.data.type === "ready") setSections(e.data.sections.filter((k) => k.startsWith("home.") || !["promo", "nav", "footer"].includes(k)));
      if (e.data.type === "select") {
        setSelected(e.data.key);
        setTab("section");
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // The frame is drawn at the device's real width and scaled down to fit the stage.
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setStage({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const width = DEVICES.find((d) => d.key === device)!.width;
  const scale = Math.min(1, (stage.w - 24) / width);

  const liveFor = (key: string) => (data: unknown) => send({ type: "live", key, data });

  return (
    <div dir="rtl" className="fixed inset-0 z-50 flex flex-col bg-muted font-sans text-foreground">
      <header className="flex flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-2.5">
        <Link to="/admin/site" className="inline-flex items-center gap-1.5 fs-15 font-medium text-foreground hover:text-clay">
          <Icon name="AngleRight" size={14} />
          חזרה לניהול
        </Link>
        <span className="h-5 w-px bg-border" />
        <span className="fs-17 font-bold">עורך ויזואלי</span>
        <select value={path} onChange={(e) => setPath(e.target.value)} className="rounded-md border border-border bg-background px-2 py-1.5 fs-15">
          {PAGES.map((p) => (
            <option key={p.path} value={p.path}>
              {p.label}
            </option>
          ))}
        </select>
        <div className="mx-auto flex overflow-hidden rounded-md border border-border">
          {DEVICES.map((d) => (
            <button
              key={d.key}
              type="button"
              aria-pressed={device === d.key}
              onClick={() => setDevice(d.key)}
              className={cn("inline-flex cursor-pointer items-center gap-1.5 px-3 py-1.5 fs-14 font-medium", device === d.key ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-muted")}
            >
              <Icon name={d.icon} size={14} />
              {d.label}
            </button>
          ))}
        </div>
        <span className="fs-13 text-foreground/60">לחיצה על אזור בדף בוחרת אותו. שום דבר לא משתנה באתר לפני "פרסום".</span>
      </header>

      <div className="flex min-h-0 flex-1">
        <div ref={stageRef} className="relative min-w-0 flex-1 overflow-hidden">
          {/* Centred by hand (left + negative margin), so the scale is the only transform. */}
          <div className="absolute top-3 origin-top" style={{ width, height: (stage.h - 24) / scale, left: "50%", marginLeft: -width / 2, transform: `scale(${scale})` }}>
            <iframe
              key={path}
              ref={frameRef}
              title="תצוגת הדף לעריכה"
              src={`${path}?edit=1&preview=1`}
              className="size-full rounded-md border border-border bg-background shadow-menu"
            />
          </div>
        </div>

        <aside className="flex w-[440px] max-w-[45vw] flex-none flex-col border-s border-border bg-card">
          <div className="flex border-b border-border">
            {(
              [
                ["section", selected ? `עריכה: ${SECTION_LABELS[selected] ?? selected}` : "עריכת אזור"],
                ["layout", "סידור הדף"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn("flex-1 cursor-pointer px-3 py-3 fs-15 font-semibold", tab === key ? "border-b-2 border-primary text-foreground" : "text-foreground/60 hover:text-foreground")}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4 text-right">
            {tab === "layout" ? (
              <LayoutPanel path={path} sections={sections.length ? sections : HOME_SECTIONS.map((s) => s.def.key)} onLive={liveFor(layoutKey(path))} />
            ) : selected ? (
              <SelectedPanel sectionKey={selected} onLive={liveFor(selected)} />
            ) : (
              <div className="flex flex-col gap-3 py-6 text-center">
                <span className="fs-18 font-bold">לחצו על אזור בדף כדי לערוך אותו</span>
                <span className="fs-15 text-foreground/70">או בחרו מהרשימה:</span>
                <div className="flex flex-wrap justify-center gap-2">
                  {["promo", "nav", ...(sections.length ? sections : HOME_SECTIONS.map((s) => s.def.key)), "footer"].map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setSelected(key);
                        send({ type: "select", key });
                      }}
                      className="cursor-pointer rounded-full border border-border px-3 py-1.5 fs-14 hover:border-foreground"
                    >
                      {SECTION_LABELS[key] ?? key}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
