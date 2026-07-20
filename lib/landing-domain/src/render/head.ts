import type { Locale, PageMeta } from "../types.js";
import { GOOGLE_SITE_VERIFICATION, SITE_URL, WHATSAPP } from "../site-config.js";
import { absoluteUrl, pageAlternates } from "../seo/page-meta.js";
import { escapeHtml } from "./html.js";

type HeadOptions = {
  locale: Locale;
  meta: PageMeta;
  jsonLdBlocks?: string[];
};

export function renderHead({ locale, meta, jsonLdBlocks = [] }: HeadOptions): string {
  const dir = locale === "ar" ? "rtl" : "ltr";
  const title = meta.title[locale];
  const description = meta.description[locale];
  const canonical = absoluteUrl(meta.path[locale]);
  const ogLocale = locale === "ar" ? "ar_SA" : "en_US";
  const ogLocaleAlt = locale === "ar" ? "en_US" : "ar_SA";
  const fontCss = locale === "ar" ? "/fonts/ibm-plex-sans-arabic.css" : "/fonts/inter.css";
  const alternates = pageAlternates(meta);

  const hreflangTags = alternates
    .map(
      (alt) =>
        `    <link rel="alternate" hreflang="${alt.locale}" href="${escapeHtml(alt.href)}" />`,
    )
    .join("\n");

  const jsonLdTags = jsonLdBlocks
    .map((block) => `    <script type="application/ld+json">\n${block}\n    </script>`)
    .join("\n");

  const googleVerification = GOOGLE_SITE_VERIFICATION
    ? `    <meta name="google-site-verification" content="${escapeHtml(GOOGLE_SITE_VERIFICATION)}" />\n`
    : "";

  return `  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
${hreflangTags}
    <link rel="alternate" hreflang="x-default" href="${escapeHtml(absoluteUrl("/"))}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:site_name" content="${escapeHtml(meta.title[locale])}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(absoluteUrl("/og-image.png"))}" />
    <meta property="og:locale" content="${ogLocale}" />
    <meta property="og:locale:alternate" content="${ogLocaleAlt}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(absoluteUrl("/og-image.png"))}" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <meta name="theme-color" content="#0d0d1a" />
${googleVerification}    <link rel="preload" as="image" href="/landpage-bg.webp" type="image/webp" />
    <link rel="stylesheet" href="${fontCss}" />
    <link rel="stylesheet" href="/landpage.css?v=seo" />
${jsonLdTags}
  </head>
  <body>
    <div class="landing-root landing-root--page" dir="${dir}">`;
}

export function renderBackground(): string {
  return `      <div class="bg-photo" aria-hidden="true"></div>
      <div class="bg-overlays" aria-hidden="true">
        <div class="bg-overlays__dim"></div>
        <div class="bg-overlays__pink"></div>
        <div class="bg-overlays__teal"></div>
        <div class="bg-overlays__fade"></div>
      </div>`;
}

export function renderCtaButton(locale: Locale, className = "cta-button"): string {
  const label = locale === "ar" ? "اطلب التأجير الآن" : "Request rental now";
  const variant = locale === "ar" ? "cta-button--ar" : "cta-button--en";
  const icon = `<span class="cta-button__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 17 7 7M17 7H7v10" />
                </svg>
              </span>`;
  const labelHtml = `<span class="cta-button__label">${escapeHtml(label)}</span>`;
  const content = locale === "ar" ? `${labelHtml}\n              ${icon}` : `${icon}\n              ${labelHtml}`;

  return `<a class="${className} ${variant}" href="${escapeHtml(WHATSAPP[locale])}" target="_blank" rel="noopener noreferrer">
              ${content}
            </a>`;
}
