/**
 * Content edited in the admin ("תוכן האתר"). Every editable thing has a key (e.g. "business", "seo:/ציפוי-דלתות");
 * the published value of a key overrides the default that lives in the code. With nothing published, or with the
 * main switch off ("settings".overrides_enabled = false), the site shows exactly the code's content.
 *
 * The root route loads all published keys once (server side, for SEO) and hands them to <SiteContentProvider>.
 */
import { createContext, useContext, type ReactNode } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

import { applyBusiness } from "./business";

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

/** Puts the published content in force for everything below it. */
export function SiteContentProvider({ content, children }: { content: SiteContent | undefined; children: ReactNode }) {
  const effective = effectiveContent(content);
  // Module-level details (phone, WhatsApp...) are read by many components at render time; set them first.
  applyBusiness(effective[BUSINESS_KEY]);
  return <SiteContentContext.Provider value={effective}>{children}</SiteContentContext.Provider>;
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
