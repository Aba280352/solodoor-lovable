/**
 * Asks the shopify-sync edge function to bring one product in Shopify up to date with the database:
 * name, description, shown or hidden, the price of every variant (by SKU) and the cover photo.
 * The function holds the Shopify token; the browser never sees it.
 */
import { supabase } from "@/integrations/supabase/client";

export interface SyncResult {
  ok: boolean;
  message: string;
  /** What changed in Shopify, for the admin to show. */
  changes?: string[];
}

/** The function answers this when the Shopify token has not been added to the project yet. */
export const SYNC_NOT_CONFIGURED = "not_configured";

export async function syncProduct(handle: string): Promise<SyncResult> {
  const { data, error } = await supabase.functions.invoke("shopify-sync", { body: { handle } });
  if (error) {
    // A non-2xx answer still carries the function's own message when it sent one.
    const body = (error as { context?: Response }).context;
    if (body) {
      try {
        const parsed = (await body.json()) as Partial<SyncResult>;
        if (parsed.message) return { ok: false, message: parsed.message, changes: parsed.changes };
      } catch {
        // Not a JSON answer: fall through to the generic text.
      }
    }
    return { ok: false, message: `הסנכרון ל-Shopify נכשל: ${error.message}` };
  }
  return data as SyncResult;
}

/** Hebrew wording for the state of a sync, for lists and editors. */
export function syncLabel(ok: boolean | null | undefined, syncedAt: string | null | undefined) {
  if (!syncedAt) return "לא סונכרן עדיין";
  const when = new Date(syncedAt).toLocaleString("he-IL", { dateStyle: "short", timeStyle: "short" });
  return ok ? `סונכרן ל-Shopify ${when}` : `הסנכרון האחרון נכשל, ${when}`;
}
