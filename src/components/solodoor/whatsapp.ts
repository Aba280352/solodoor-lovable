/**
 * The WhatsApp link every "talk to us on WhatsApp" button opens. The number and the opening message come from the
 * business details (editable in the admin; defaults 054 8999 961 and the line below), read when the link is built.
 */
import { BUSINESS_DEFAULTS, business } from "./content/business";

export const WHATSAPP_NUMBER = BUSINESS_DEFAULTS.whatsapp;
export const WHATSAPP_MESSAGE = BUSINESS_DEFAULTS.whatsappMessage;

export const whatsappHref = (message: string = business.whatsappMessage) =>
  `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(message)}`;
