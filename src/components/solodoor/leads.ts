/**
 * Sends a contact form to the edge function submit-lead, which stores it (table leads, shown at
 * /admin/leads) and emails the business. Every form on the site goes through here.
 */
import { supabase } from "@/integrations/supabase/client";

export type LeadSource = "door_quote" | "quiz" | "article" | "footer";

export interface LeadInput {
  source: LeadSource;
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  message?: string;
  /** Extra answers by key (door_type, area, style, width, height, quantity, image_note, article). */
  details?: Record<string, string | undefined>;
  /** The hidden anti-spam field; people leave it empty. */
  website?: string;
}

/** The message shown when sending fails, with WhatsApp as the way out. */
export const LEAD_ERROR = "השליחה לא הצליחה. אפשר לנסות שוב או לכתוב לנו בוואטסאפ.";

/** Sends one form. Throws an Error with a Hebrew message the form can show as is. */
export async function submitLead(input: LeadInput): Promise<void> {
  const details = Object.fromEntries(Object.entries(input.details ?? {}).filter(([, v]) => v && v.trim()));
  const { data, error } = await supabase.functions.invoke("submit-lead", {
    body: { ...input, details, page_url: typeof window === "undefined" ? undefined : window.location.href },
  });
  if (data?.ok) return;
  // A 4xx from the function carries a message meant for the visitor.
  let message: string | undefined = data?.message;
  const context = (error as { context?: Response } | null)?.context;
  if (!message && context && typeof context.json === "function") {
    message = await context.json().then((b: { message?: string }) => b?.message, () => undefined);
  }
  throw new Error(message || LEAD_ERROR);
}

/** The values of a form element by field name, trimmed. */
export function formValues(form: HTMLFormElement): Record<string, string> {
  const out: Record<string, string> = {};
  new FormData(form).forEach((value, key) => {
    if (typeof value === "string") out[key] = value.trim();
  });
  return out;
}
