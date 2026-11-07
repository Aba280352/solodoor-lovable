/**
 * The visual editor, in the spirit of Elementor: the real page in a frame (?edit=1&preview=1), a device switch,
 * and a side panel with three tabs:
 *  - תוכן: what was clicked. A text or a picture on the page opens only that element (a list item opens that item);
 *    the empty part of a section opens the section's fields, folded into groups.
 *  - עיצוב: the section's background and extra spacing per device.
 *  - ניווט: the page's sections in order, to reorder, hide per device, or jump to one.
 * Every change shows on the page at once and is saved as a draft / published from the panel, exactly like the
 * "תוכן האתר" screens (same data, same history). Nothing reaches visitors before "פרסום".
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

import { Icon } from "../Icon";
import type { EditorMessage, PageMessage } from "../content/edit-bridge";
import { BACKGROUNDS, SECTION_LABELS, SPACES, layoutKey, styleKey, type LayoutOverride, type SectionStyle, type Space } from "../content/layout";
import { ContentEditor } from "./content-editor";
import { FooterSection, NavSection, PromoSection } from "./content-sections";
import { EDITOR_PAGES, ownerOf, panelParts } from "./editor-registry";
import { SectionEditor, resolvePath, type ElementFocus, type PagePatch } from "./section-editor";

const DEVICES = [
  { key: "desktop", label: "מחשב", width: 1440, icon: "Expand" },
  { key: "tablet", label: "טאבלט", width: 820, icon: "LayerGroup" },
  { key: "mobile", label: "טלפון", width: 390, icon: "Phone" },
] as const;

const SHARED = ["promo", "nav", "footer"];
const FOOTER_FIELDS: Record<string, string> = {
  bannerImage: "תמונת הבאנר",
  bannerLines: "שלוש השורות על התמונה",
  bannerEnglish: "השורות באנגלית",
  tagline: "השורה מתחת ללוגו",
  formTitle: "כותרת הטופס",
  formSubtitle: "שורה מתחת לכותרת הטופס",
  copyright: "זכויות יוצרים",
};

type Live = (data: unknown) => void;
type Tab = "content" | "style" | "navigator";

/** Safe styling of one section: background and extra space above / below, per device. */
function StylePanel({ sectionKey, onLive }: { sectionKey: string; onLive: Live }) {
  const chip = (on: boolean) => cn("cursor-pointer rounded-full border px-3 py-1 fs-13 font-medium", on ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground hover:border-foreground");
  return (
    <ContentEditor<SectionStyle>
      contentKey={styleKey(sectionKey)}
      title={`עיצוב: ${SECTION_LABELS[sectionKey] ?? sectionKey}`}
      intro="רקע מצבעי האתר ומרווח נוסף מעל ומתחת, בנפרד למחשב ולטלפון. 'ללא' משאיר כמו היום."
      onLiveChange={onLive}
      compact
      prepare={(value) => ({ data: value })}
    >
      {(value, set) => {
        const spaceRow = (side: "spaceTop" | "spaceBottom", device: "desktop" | "mobile", label: string) => (
          <div className="flex flex-col gap-1.5">
            <span className="fs-14 font-semibold text-foreground">{label}</span>
            <div className="flex flex-wrap gap-1.5">
              {SPACES.map((sp) => (
                <button
                  key={sp.label}
                  type="button"
                  onClick={() => set({ [side]: { ...value[side], [device]: sp.value as Space | undefined } } as Partial<SectionStyle>)}
                  className={chip(value[side]?.[device] === sp.value)}
                >
                  {sp.label}
                </button>
              ))}
            </div>
          </div>
        );
        return (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="fs-14 font-semibold text-foreground">רקע</span>
              <div className="flex flex-wrap gap-1.5">
                {BACKGROUNDS.map((b) => (
                  <button key={b.label} type="button" onClick={() => set({ background: b.value })} className={chip(value.background === b.value)}>
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
            {spaceRow("spaceTop", "desktop", "מרווח מעל · מחשב")}
            {spaceRow("spaceTop", "mobile", "מרווח מעל · טלפון")}
            {spaceRow("spaceBottom", "desktop", "מרווח מתחת · מחשב")}
            {spaceRow("spaceBottom", "mobile", "מרווח מתחת · טלפון")}
          </div>
        );
      }}
    </ContentEditor>
  );
}

/** The "תוכן" tab for the selected section: one element, or the whole section. */
function ContentPanel({
  sectionKey,
  element,
  patch,
  live,
  onBack,
}: {
  sectionKey: string;
  element: ElementFocus;
  patch: PagePatch;
  live: (contentKey: string) => Live;
  onBack: () => void;
}) {
  if (sectionKey === "promo") return <PromoSection onLiveChange={live("promo")} />;
  if (sectionKey === "nav") return <NavSection onLiveChange={live("nav")} />;
  if (sectionKey === "footer") return <FooterSection onLiveChange={live("footer")} only={element?.field} onBack={onBack} />;
  const parts = panelParts(sectionKey);
  if (!parts)
    return (
      <p className="rounded-lg border border-dashed border-border bg-card px-4 py-6 text-center fs-15 text-foreground/70">
        באזור "{SECTION_LABELS[sectionKey] ?? sectionKey}" אין עדיין שדות לעריכה. אפשר להזיז או להסתיר אותו בלשונית "ניווט", ולשנות רקע ומרווחים בלשונית "עיצוב".
      </p>
    );
  const owner = element ? ownerOf(parts, element.field) : undefined;
  // Every part stays mounted (only hidden), so what was typed in one is kept while another is shown.
  return (
    <div className="flex flex-col gap-4">
      {parts.map((p) => (
        <div key={p.def.key} hidden={!!owner && owner !== p}>
        <SectionEditor
          def={p.def}
          defaults={p.defaults}
          note={p.note}
          compact
          onLiveChange={live(p.def.key)}
          patch={patch && ownerOf([p], patch.field) ? patch : null}
          element={owner === p ? element : null}
          onBack={onBack}
        />
        </div>
      ))}
    </div>
  );
}

/** Order and per-device visibility of the page's sections; a name jumps to that section. */
function NavigatorPanel({ path, sections, selected, onPick, onLive }: { path: string; sections: string[]; selected: string | null; onPick: (key: string) => void; onLive: Live }) {
  const btn = "inline-flex size-7 cursor-pointer items-center justify-center rounded-md border border-border fs-13 text-foreground hover:border-foreground disabled:cursor-default disabled:opacity-30";
  return (
    <ContentEditor<LayoutOverride>
      contentKey={layoutKey(path)}
      title="ניווט: סדר האזורים"
      intro="לחיצה על שם קופצת לאזור. החיצים משנים סדר, והתיבות מסתירות אזור בטלפון או במחשב (אזור מוסתר מוצג בעורך חלש)."
      onLiveChange={onLive}
      compact
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
          <div className="flex flex-col gap-1.5">
            {order.map((key, i) => (
              <div key={key} className={cn("flex items-center gap-2 rounded-md border bg-background px-2.5 py-2", selected === key ? "border-primary" : "border-border")}>
                <button type="button" onClick={() => onPick(key)} className="min-w-0 flex-1 cursor-pointer truncate text-right fs-15 font-medium text-foreground hover:text-clay">
                  {SECTION_LABELS[key] ?? key}
                </button>
                <label title="להסתיר בטלפון" className="flex cursor-pointer items-center gap-1 fs-12 text-foreground">
                  <input type="checkbox" checked={hide[key]?.mobile === true} onChange={(e) => toggle(key, "mobile", e.target.checked)} className="size-3.5 accent-primary" />
                  <Icon name="Phone" size={13} />
                </label>
                <label title="להסתיר במחשב" className="flex cursor-pointer items-center gap-1 fs-12 text-foreground">
                  <input type="checkbox" checked={hide[key]?.desktop === true} onChange={(e) => toggle(key, "desktop", e.target.checked)} className="size-3.5 accent-primary" />
                  <Icon name="Expand" size={13} />
                </label>
                <button type="button" aria-label="למעלה" disabled={i === 0} onClick={() => move(i, -1)} className={btn}>
                  ↑
                </button>
                <button type="button" aria-label="למטה" disabled={i === order.length - 1} onClick={() => move(i, 1)} className={btn}>
                  ↓
                </button>
              </div>
            ))}
            <p className="mt-1 fs-13 text-foreground/60">ההסתרה: אייקון טלפון = מוסתר בטלפון, אייקון מסך = מוסתר במחשב.</p>
          </div>
        );
      }}
    </ContentEditor>
  );
}

export function VisualEditor() {
  const [path, setPath] = useState(EDITOR_PAGES[0].path);
  const page = EDITOR_PAGES.find((p) => p.path === path) ?? EDITOR_PAGES[0];
  const [device, setDevice] = useState<(typeof DEVICES)[number]["key"]>("desktop");
  const [tab, setTab] = useState<Tab>("content");
  const [selected, setSelected] = useState<string | null>(null);
  const [element, setElement] = useState<ElementFocus>(null);
  const [patch, setPatch] = useState<PagePatch>(null);
  const [sections, setSections] = useState<string[]>([]);
  /** Sections opened so far: their panels stay mounted (hidden), so unsaved changes survive switching around. */
  const [visited, setVisited] = useState<string[]>([]);
  useEffect(() => {
    if (selected && !visited.includes(selected)) setVisited((v) => [...v, selected]);
  }, [selected, visited]);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState({ w: 1000, h: 700 });

  const send = useCallback((msg: EditorMessage) => frameRef.current?.contentWindow?.postMessage(msg, window.location.origin), []);
  /** The unsaved values sent to the page, so a reloaded page (another device, another page) gets them back. */
  const liveRef = useRef<Record<string, unknown>>({});
  const selectedRef = useRef<string | null>(null);
  selectedRef.current = selected;

  // Messages from the page: it is ready (with its sections), a part was clicked, or a text is being typed.
  useEffect(() => {
    const onMessage = (e: MessageEvent<PageMessage>) => {
      if (e.origin !== window.location.origin || e.source !== frameRef.current?.contentWindow || !e.data) return;
      if (e.data.type === "ready") {
        setSections(e.data.sections.filter((k) => !SHARED.includes(k)));
        for (const [key, data] of Object.entries(liveRef.current)) send({ type: "live", key, data });
        if (selectedRef.current) send({ type: "select", key: selectedRef.current });
      }
      if (e.data.type === "select") {
        setSelected(e.data.key);
        setTab("content");
        setPatch(null);
        setElement(e.data.field ? { field: e.data.field, open: e.data.open, nonce: Date.now() } : null);
      }
      if (e.data.type === "inline") {
        // Typing on the page fills the same field in the panel (and from there the draft).
        const { key, field, value } = e.data;
        setSelected(key);
        setTab("content");
        setElement((cur) => (cur?.field === field ? cur : { field, nonce: Date.now() }));
        setPatch({ field, value, nonce: Date.now() });
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [send]);

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

  const live = (key: string) => (data: unknown) => {
    liveRef.current[key] = data;
    send({ type: "live", key, data });
  };
  const pick = (key: string) => {
    setSelected(key);
    setElement(null);
    setPatch(null);
    send({ type: "select", key });
  };
  const changePage = (next: string) => {
    setPath(next);
    setSelected(null);
    setElement(null);
    setPatch(null);
    setSections([]);
  };

  const pageSections = sections.length ? sections : page.order;
  const sectionLabel = selected ? (SECTION_LABELS[selected] ?? selected) : null;
  const elementLabel = (() => {
    if (!selected || !element) return null;
    if (selected === "footer") return FOOTER_FIELDS[element.field] ?? null;
    const parts = panelParts(selected);
    const owner = parts && ownerOf(parts, element.field);
    return owner ? (resolvePath(owner.def, owner.defaults, element.field)?.label ?? null) : null;
  })();
  const styleable = selected && !SHARED.includes(selected);

  return (
    <div dir="rtl" className="fixed inset-0 z-50 flex flex-col bg-muted font-sans text-foreground">
      <header className="flex flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-2.5">
        <Link to="/admin/site" className="inline-flex items-center gap-1.5 fs-15 font-medium text-foreground hover:text-clay">
          <Icon name="AngleRight" size={14} />
          חזרה לניהול
        </Link>
        <span className="h-5 w-px bg-border" />
        <span className="fs-17 font-bold">עורך ויזואלי</span>
        <select value={path} onChange={(e) => changePage(e.target.value)} className="rounded-md border border-border bg-background px-2 py-1.5 fs-15">
          {EDITOR_PAGES.map((p) => (
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
        <span className="fs-13 text-foreground/60">לחיצה בוחרת · לחיצה כפולה על טקסט: כותבים על הדף · לחיצה כפולה על תמונה: מחליפים אותה</span>
      </header>

      <div className="flex min-h-0 flex-1">
        <div ref={stageRef} className="relative min-w-0 flex-1 overflow-hidden">
          {/* Centred by hand (left + negative margin), so the scale is the only transform. */}
          <div className="absolute top-3 origin-top" style={{ width, height: (stage.h - 24) / scale, left: "50%", marginLeft: -width / 2, transform: `scale(${scale})` }}>
            <iframe
              // A new device reloads the page at its width, so every size and layout is computed fresh.
              key={`${path}|${device}`}
              ref={frameRef}
              title="תצוגת הדף לעריכה"
              src={`${path}?edit=1&preview=1`}
              className="size-full rounded-md border border-border bg-background shadow-menu"
            />
          </div>
        </div>

        <aside className="flex w-[420px] max-w-[45vw] flex-none flex-col border-s border-border bg-card">
          {/* Breadcrumb: page › section › element, each step clickable back. */}
          <div className="flex min-h-12 flex-wrap items-center gap-1.5 bg-foreground px-4 py-2.5 fs-14 text-background">
            <button type="button" onClick={() => { setSelected(null); setElement(null); }} className="cursor-pointer font-medium hover:text-primary">
              {page.label}
            </button>
            {sectionLabel && (
              <>
                <Icon name="AngleLeft" size={11} />
                <button type="button" onClick={() => setElement(null)} className={cn("cursor-pointer hover:text-primary", !elementLabel && "font-bold")}>
                  {sectionLabel}
                </button>
              </>
            )}
            {elementLabel && (
              <>
                <Icon name="AngleLeft" size={11} />
                <span className="font-bold">{elementLabel}</span>
              </>
            )}
          </div>

          <div className="flex border-b border-border">
            {(
              [
                ["content", "תוכן"],
                ["style", "עיצוב"],
                ["navigator", "ניווט"],
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

          <div className="min-h-0 flex-1 overflow-y-auto p-3 text-right">
            <div hidden={tab !== "navigator"}>
              <NavigatorPanel path={path} sections={pageSections} selected={selected} onPick={(k) => { pick(k); setTab("content"); }} onLive={live(layoutKey(path))} />
            </div>
            {visited.map((key) => (
              <div key={key} hidden={!(tab === "content" && key === selected)}>
                <ContentPanel sectionKey={key} element={key === selected ? element : null} patch={key === selected ? patch : null} live={live} onBack={() => setElement(null)} />
              </div>
            ))}
            {visited.filter((key) => !SHARED.includes(key)).map((key) => (
              <div key={`style-${key}`} hidden={!(tab === "style" && key === selected)}>
                <StylePanel sectionKey={key} onLive={live(styleKey(key))} />
              </div>
            ))}
            {tab === "navigator" ? null : !selected ? (
              <div className="flex flex-col gap-3 py-6 text-center">
                <span className="fs-18 font-bold">לחצו על טקסט, תמונה או אזור בדף</span>
                <span className="fs-15 text-foreground/70">הלוח יציג רק את מה שנבחר. או בחרו אזור מהרשימה:</span>
                <div className="flex flex-wrap justify-center gap-2">
                  {["promo", "nav", ...pageSections, "footer"].map((key) => (
                    <button key={key} type="button" onClick={() => pick(key)} className="cursor-pointer rounded-full border border-border px-3 py-1.5 fs-14 hover:border-foreground">
                      {SECTION_LABELS[key] ?? key}
                    </button>
                  ))}
                </div>
              </div>
            ) : tab === "style" && !styleable ? (
              <p className="py-6 text-center fs-15 text-foreground/70">ל"{sectionLabel}" אין הגדרות עיצוב. בחרו אזור בדף.</p>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
