/**
 * Reading and writing the site content keys (tables site_content, site_content_drafts, site_content_history).
 * Drafts, publishing, reset and restore go through database functions that check the admin and the revision.
 */
import { db } from "./db";

export interface ContentEntry<T> {
  published: T | null;
  draft: { data: T; revision: number; updated_at: string; updated_by: string | null } | null;
}

export interface ContentVersion {
  id: number;
  data: unknown;
  published_at: string;
  published_by: string | null;
}

const fail = (error: { message: string } | null) => {
  if (error) throw new Error(error.message);
};

export async function loadEntry<T>(key: string): Promise<ContentEntry<T>> {
  const [pub, draft] = await Promise.all([
    db.from("site_content").select("data").eq("key", key).maybeSingle(),
    db.from("site_content_drafts").select("data, revision, updated_at, updated_by").eq("key", key).maybeSingle(),
  ]);
  fail(pub.error);
  fail(draft.error);
  return {
    published: (pub.data?.data as T | undefined) ?? null,
    draft: draft.data ? (draft.data as ContentEntry<T>["draft"]) : null,
  };
}

/** Saves the draft and returns its new revision. `revision` is the one loaded (0 when there was no draft). */
export async function saveDraft(key: string, data: unknown, revision: number): Promise<number> {
  const { data: next, error } = await db.rpc("save_site_content_draft", { p_key: key, p_data: data, p_revision: revision });
  fail(error);
  return Number(next);
}

export async function publishEntry(key: string, revision: number): Promise<void> {
  const { error } = await db.rpc("publish_site_content", { p_key: key, p_revision: revision });
  fail(error);
}

export async function discardDraft(key: string): Promise<void> {
  const { error } = await db.from("site_content_drafts").delete().eq("key", key);
  fail(error);
}

export async function resetEntry(key: string): Promise<void> {
  const { error } = await db.rpc("reset_site_content", { p_key: key });
  fail(error);
}

export async function loadHistory(key: string): Promise<ContentVersion[]> {
  const { data, error } = await db
    .from("site_content_history")
    .select("id, data, published_at, published_by")
    .eq("key", key)
    .order("published_at", { ascending: false })
    .limit(15);
  fail(error);
  return (data ?? []) as ContentVersion[];
}

export async function restoreVersion(id: number): Promise<void> {
  const { error } = await db.rpc("restore_site_content", { p_history_id: id });
  fail(error);
}

/** Which keys with a prefix have a published value or a draft (for status chips in lists). */
export async function loadStatus(prefix: string): Promise<{ published: Set<string>; drafts: Set<string> }> {
  const [pub, drafts] = await Promise.all([
    db.from("site_content").select("key").like("key", `${prefix}%`),
    db.from("site_content_drafts").select("key").like("key", `${prefix}%`),
  ]);
  fail(pub.error);
  fail(drafts.error);
  return {
    published: new Set(((pub.data ?? []) as { key: string }[]).map((r) => r.key)),
    drafts: new Set(((drafts.data ?? []) as { key: string }[]).map((r) => r.key)),
  };
}
