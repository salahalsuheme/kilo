import type { Locale, PageMeta } from "../types.js";
import { SITE_URL } from "../site-config.js";

export function absoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageAlternates(meta: PageMeta): Array<{ locale: Locale; href: string }> {
  return [
    { locale: "ar", href: absoluteUrl(meta.path.ar) },
    { locale: "en", href: absoluteUrl(meta.path.en) },
  ];
}

export const ALL_PAGES: PageMeta[] = [];
