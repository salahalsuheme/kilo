export const SITE_URL = "https://www.kilo-sa.com";

export const SITE_NAME = {
  ar: "كيلو",
  en: "Kilo",
} as const;

export const CONTACT = {
  phone: "+966551171309",
  phoneDisplay: {
    ar: "055 117 1309",
    en: "+966 55 117 1309",
  },
  locality: {
    ar: "الرياض",
    en: "Riyadh",
  },
  country: "SA",
} as const;

const WHATSAPP_BASE = "https://api.whatsapp.com/send";

function whatsappUrl(text: string): string {
  return `${WHATSAPP_BASE}?phone=${CONTACT.phone.replace("+", "")}&text=${encodeURIComponent(text)}`;
}

export const WHATSAPP = {
  ar: whatsappUrl("مرحباً، أرغب في طلب تأجير مركبات للشركات من كيلو."),
  en: whatsappUrl("Hello, I would like to request corporate vehicle rental from Kilo."),
} as const;

/** Set via LANDING_GOOGLE_SITE_VERIFICATION at build time when available. */
export const GOOGLE_SITE_VERIFICATION = process.env.LANDING_GOOGLE_SITE_VERIFICATION ?? "";
