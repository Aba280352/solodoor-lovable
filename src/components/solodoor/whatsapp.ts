/**
 * The WhatsApp number of the business, the same one the old site uses (054 8999 961), and the link every
 * "talk to us on WhatsApp" button opens. The message is filled in, so the first line tells us where they came from.
 */
export const WHATSAPP_NUMBER = "972548999961";
export const WHATSAPP_MESSAGE = "היי הגעתי מהאתר של סולודור";

export const whatsappHref = (message: string = WHATSAPP_MESSAGE) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
