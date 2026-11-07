/**
 * Content edited in the admin ("תוכן האתר"). Every editable thing has a key (e.g. "business", "seo:/ציפוי-דלתות");
 * the published value of a key overrides the default that lives in the code. With nothing published, or with the
 * main switch off ("settings".overrides_enabled = false), the site shows exactly the code's content.
 *
 * The root route loads all published keys once (server side, for SEO) and hands them to <SiteContentProvider>.
 */
import { Fragment, createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

import { applyBusiness } from "./business";
import { EditBridge, isEditFrame } from "./edit-bridge";

export type SiteContent = Record<string, unknown>;

/** The site's settings key; `overrides_enabled: false` turns every override off. */
export const SETTINGS_KEY = "settings";
export const BUSINESS_KEY = "business";
export const seoKey = (path: string) => `seo:${path}`;

/** The overrides actually in force: none when the main switch is off. */
export function effectiveContent(content: SiteContent | undefined): SiteContent {
  if (!content) return {};
  const settings = content[SETTINGS_KEY] as { overrides_enabled?: boolean } | undefined;
  return settings?.overrides_enabled === false ? {} : content;
}

/** Every published key. Never throws: on any problem the site simply shows its code defaults. */
export async function fetchSiteContent(): Promise<SiteContent> {
  try {
    const { data, error } = await (supabase as unknown as SupabaseClient).from("site_content").select("key, data");
    if (error || !data) return {};
    return Object.fromEntries((data as { key: string; data: unknown }[]).map((row) => [row.key, row.data]));
  } catch {
    return {};
  }
}

const SiteContentContext = createContext<SiteContent>({});

/** The admin's unsaved-to-site drafts, loaded only with ?preview=1 and only for a signed-in admin (RLS checks it). */
function usePreviewDrafts(): SiteContent | null {
  const [drafts, setDrafts] = useState<SiteContent | null>(null);
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("preview")) return;
    let alive = true;
    (async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;
      const { data } = await (supabase as unknown as SupabaseClient).from("site_content_drafts").select("key, data");
      if (alive && data) setDrafts(Object.fromEntries((data as { key: string; data: unknown }[]).map((row) => [row.key, row.data])));
    })().catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);
  return drafts;
}

const EditModeContext = createContext(false);

/** True inside the visual editor's preview frame. */
export const useEditMode = () => useContext(EditModeContext);

/** Puts the published content in force for everything below it (plus the drafts in preview mode, plus the editor's unsaved values). */
export function SiteContentProvider({ content, children }: { content: SiteContent | undefined; children: ReactNode }) {
  const drafts = usePreviewDrafts();
  const [editing, setEditing] = useState(false);
  const [live, setLive] = useState<SiteContent>({});
  useEffect(() => setEditing(isEditFrame()), []);
  const onLive = useCallback((key: string, data: unknown) => setLive((l) => ({ ...l, [key]: data })), []);
  const effective = effectiveContent({ ...(content ?? {}), ...(drafts ?? {}), ...live });
  // Module-level details (phone, WhatsApp...) are read by many components at render time; set them first.
  applyBusiness(effective[BUSINESS_KEY]);
  return (
    <SiteContentContext.Provider value={effective}>
      <EditModeContext.Provider value={editing}>
      {editing && <EditBridge onLive={onLive} />}
      {drafts && !editing ? (
        // A new key remounts the page, so everything re-reads the draft values.
        <Fragment key="preview">
          {children}
          <div dir="rtl" className="fixed bottom-4 left-4 z-50 flex items-center gap-3 rounded-full bg-foreground px-4 py-2.5 font-sans fs-14 text-background shadow-menu">
            <span>תצוגה מקדימה של טיוטות ({Object.keys(drafts).length})</span>
            <a href={window.location.pathname} className="border-b border-background/60">
              יציאה
            </a>
          </div>
        </Fragment>
      ) : drafts ? (
        <Fragment key="preview">{children}</Fragment>
      ) : (
        children
      )}
      </EditModeContext.Provider>
    </SiteContentContext.Provider>
  );
}

/** The override of one key, or undefined when the code default applies. */
export function useContentValue<T>(key: string): T | undefined {
  return useContext(SiteContentContext)[key] as T | undefined;
}

/* ───────────── SEO of the fixed pages ───────────── */

export interface SeoOverride {
  title?: string;
  description?: string;
  /** A share image URL (og:image). */
  image?: string;
  /** "להסתיר מגוגל". */
  noindex?: boolean;
}

/** The root route's loader data (the published content), as seen from a child route's head(). */
export const rootContent = (matches: readonly { loaderData?: unknown }[] | undefined) =>
  (matches?.[0]?.loaderData ?? undefined) as SiteContent | undefined;

/** The SEO override of a page, cleaned. */
export function seoOverride(content: SiteContent | undefined, path: string): SeoOverride {
  const raw = effectiveContent(content)[seoKey(path)];
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const str = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined);
  const image = str(o.image, 500);
  return {
    title: str(o.title, 120),
    description: str(o.description, 400),
    image: image && /^https:\/\//.test(image) ? image : undefined,
    noindex: o.noindex === true,
  };
}

type Meta = Record<string, string | undefined>;

/** Applies a page's SEO override to the head its route builds (title, description, og tags, robots). */
export function withSeo<H extends { meta?: Meta[] }>(content: SiteContent | undefined, path: string, head: H): H {
  const o = seoOverride(content, path);
  if (!o.title && !o.description && !o.image && !o.noindex) return head;
  let meta = (head.meta ?? []).map((m) => {
    if (o.title && "title" in m) return { title: o.title };
    if (o.title && m.property === "og:title") return { ...m, content: o.title };
    if (o.description && (m.name === "description" || m.property === "og:description")) return { ...m, content: o.description };
    return m;
  });
  if (o.image) meta = [...meta.filter((m) => m.property !== "og:image"), { property: "og:image", content: o.image }];
  if (o.noindex) meta = [...meta.filter((m) => m.name !== "robots"), { name: "robots", content: "noindex, follow" }];
  return { ...head, meta };
}
