/**
 * Sends a contact form to the server route /api/public/submit-lead (src/lib/leads.server.ts), which stores
 * it (table leads, shown at /admin/leads) and emails the business. Every form on the site goes through here.
 */
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
  let result: { ok?: boolean; message?: string } | undefined;
  try {
    const res = await fetch("/api/public/submit-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...input, details, page_url: window.location.href }),
    });
    result = await res.json().catch(() => undefined);
  } catch {
    throw new Error(LEAD_ERROR);
  }
  if (result?.ok) return;
  // A refusal carries a message meant for the visitor (bad phone, too many forms).
  throw new Error(result?.message || LEAD_ERROR);
}

/** The values of a form element by field name, trimmed. */
export function formValues(form: HTMLFormElement): Record<string, string> {
  const out: Record<string, string> = {};
  new FormData(form).forEach((value, key) => {
    if (typeof value === "string") out[key] = value.trim();
  });
  return out;
}
