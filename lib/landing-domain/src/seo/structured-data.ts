import type { Locale } from "../types.js";
import { CONTACT, SITE_NAME, SITE_URL, WHATSAPP } from "../site-config.js";
import { FAQ_ITEMS } from "../content/faq.js";
import { absoluteUrl } from "./page-meta.js";

function jsonLd(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

export function carRentalJsonLd(locale: Locale): string {
  const isAr = locale === "ar";
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "CarRental",
    name: SITE_NAME[locale],
    alternateName: isAr ? "Kilo" : "كيلو",
    url: SITE_URL,
    logo: absoluteUrl("/kilo-logo.png"),
    image: absoluteUrl("/og-image.png"),
    description: isAr
      ? "تأجير مركبات للشركات والمؤسسات وتأجير مركبات مبردة"
      : "Vehicle rental for companies and institutions, including refrigerated fleet vehicles.",
    telephone: CONTACT.phone,
    address: {
      "@type": "PostalAddress",
      addressCountry: CONTACT.country,
      addressLocality: CONTACT.locality[locale],
    },
    areaServed: {
      "@type": "Country",
      name: isAr ? "المملكة العربية السعودية" : "Saudi Arabia",
    },
    priceRange: "$$",
    sameAs: [WHATSAPP[locale]],
  });
}

export function faqJsonLd(locale: Locale): string {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question[locale],
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer[locale],
      },
    })),
  });
}

export function webPageJsonLd(locale: Locale, title: string, description: string, path: string): string {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: absoluteUrl(path),
    inLanguage: locale === "ar" ? "ar-SA" : "en-US",
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME[locale],
      url: SITE_URL,
    },
  });
}
