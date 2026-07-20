import type { Locale } from "../../types.js";
import { ABOUT_CONTENT, ABOUT_META } from "../../content/about.js";
import { carRentalJsonLd, webPageJsonLd } from "../../seo/structured-data.js";
import { renderBackground, renderCtaButton, renderHead } from "../head.js";
import { renderFooter, renderHeader } from "../layout.js";
import { escapeHtml } from "../html.js";

export function renderAboutPage(locale: Locale): string {
  const jsonLdBlocks = [
    carRentalJsonLd(locale),
    webPageJsonLd(
      locale,
      ABOUT_META.title[locale],
      ABOUT_META.description[locale],
      ABOUT_META.path[locale],
    ),
  ];

  const paragraphs = ABOUT_CONTENT.paragraphs[locale]
    .map((paragraph) => `            <p class="prose__paragraph">${escapeHtml(paragraph)}</p>`)
    .join("\n");

  return `<!doctype html>
<html lang="${locale}" dir="${locale === "ar" ? "rtl" : "ltr"}">
${renderHead({ locale, meta: ABOUT_META, jsonLdBlocks })}
${renderBackground()}
      <main class="page-shell">
${renderHeader(locale, "about")}
        <section class="content-section content-section--page">
          <div class="content-section__inner content-section__inner--narrow">
            <h1 class="page-title">${escapeHtml(ABOUT_CONTENT.title[locale])}</h1>
            <div class="prose">
${paragraphs}
            </div>
            <p class="page-cta">${renderCtaButton(locale)}</p>
          </div>
        </section>
${renderFooter(locale)}
      </main>
    </div>
  </body>
</html>
`;
}
