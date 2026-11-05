/**
 * The business details every page shows: phone, WhatsApp, email, service area, hours and the Google review count.
 * The values below are the defaults; the admin ("תוכן האתר" > "פרטי העסק") can override them, and the
 * site content provider copies the published override into `business` before the page renders.
 * Components read `business.<field>` at render time, so one edit updates the whole site.
 */
export interface Business {
  /** As shown, e.g. 054-8999-961. */
  phone: string;
  /** International format without +, e.g. 972548999961. */
  whatsapp: string;
  /** The first line of every WhatsApp message, so we know the visitor came from the site. */
  whatsappMessage: string;
  email: string;
  /** Where the business works, e.g. "מצפון ועד דרום". */
  area: string;
  /** Opening hours, sections separated by " | ". */
  hours: string;
  /** The number of Google reviews quoted around the site. */
  reviewCount: number;
}

export const BUSINESS_DEFAULTS: Business = {
  phone: "054-8999-961",
  whatsapp: "972548999961",
  whatsappMessage: "היי הגעתי מהאתר של סולודור",
  email: "soloodoor@gmail.com",
  area: "מצפון ועד דרום",
  hours: "א' עד ה' 09:00 עד 19:00 | ו' 09:00 עד 13:00",
  reviewCount: 52,
};

/** The details in force for this render (defaults plus the published override). */
export const business: Business = { ...BUSINESS_DEFAULTS };

/** The phone as a tel: link. */
export const phoneHref = () => `tel:${business.phone.replace(/[^\d+]/g, "")}`;

/** Keeps only valid, non-empty fields of an override, so a bad value can never blank the site. */
export function cleanBusiness(input: unknown): Partial<Business> {
  if (!input || typeof input !== "object") return {};
  const o = input as Record<string, unknown>;
  const str = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined);
  const out: Partial<Business> = {};
  const phone = str(o.phone, 30);
  if (phone && phone.replace(/\D/g, "").length >= 9) out.phone = phone;
  const wa = str(o.whatsapp, 20)?.replace(/\D/g, "");
  if (wa && wa.length >= 11 && wa.length <= 15) out.whatsapp = wa;
  const msg = str(o.whatsappMessage, 300);
  if (msg) out.whatsappMessage = msg;
  const email = str(o.email, 200);
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) out.email = email;
  const area = str(o.area, 120);
  if (area) out.area = area;
  const hours = str(o.hours, 200);
  if (hours) out.hours = hours;
  const count = Number(o.reviewCount);
  if (Number.isInteger(count) && count >= 0 && count < 1_000_000 && o.reviewCount !== "" && o.reviewCount != null) out.reviewCount = count;
  return out;
}

/** Puts the published override in force (or the defaults when there is none). */
export function applyBusiness(override: unknown) {
  Object.assign(business, BUSINESS_DEFAULTS, cleanBusiness(override));
}
