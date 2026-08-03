import type { FaqItem, Locale } from "../../types.js";
import {
  HOME_HERO,
  HOME_META,
  WHY_KILO_ITEMS,
  WHY_KILO_SECTION,
} from "../../content/home.js";
import { FAQ_ITEMS, FAQ_SECTION } from "../../content/faq.js";
import { WHATSAPP_HOME } from "../../site-config.js";
import { carRentalJsonLd, faqJsonLd, webPageJsonLd } from "../../seo/structured-data.js";
import { renderFeatureIcon } from "../feature-icons.js";
import { renderBackground, renderCtaButton, renderHead } from "../head.js";
import { renderFooter, renderHeader, renderPageScripts, renderScrollHint } from "../layout.js";
import { escapeHtml } from "../html.js";

function renderFaqAnswer(item: FaqItem, locale: Locale): string {
  if (!item.whatsappLinkAnswer) {
    return escapeHtml(item.answer[locale]);
  }

  const { linkText, suffix } = item.whatsappLinkAnswer;
  return `<a class="faq-item__link" href="${escapeHtml(WHATSAPP_HOME[locale])}" target="_blank" rel="noopener noreferrer">${escapeHtml(linkText[locale])}</a>${escapeHtml(suffix[locale])}`;
}

export function renderHomePage(locale: Locale): string {
  const jsonLdBlocks = [
    carRentalJsonLd(locale),
    faqJsonLd(locale),
    webPageJsonLd(
      locale,
      HOME_META.title[locale],
      HOME_META.description[locale],
      HOME_META.path[locale],
    ),
  ];

  const whyCards = WHY_KILO_ITEMS.map(
    (item) => `            <article class="feature-card">
              <div class="feature-card__head">
${renderFeatureIcon(item.icon)}
                <h3 class="feature-card__title">${escapeHtml(item.title[locale])}</h3>
              </div>
              <p class="feature-card__text">${escapeHtml(item.description[locale])}</p>
            </article>`,
  ).join("\n");

  const faqItems = FAQ_ITEMS.map(
    (item) => `            <details class="faq-item">
              <summary class="faq-item__question">${escapeHtml(item.question[locale])}</summary>
              <p class="faq-item__answer">${renderFaqAnswer(item, locale)}</p>
            </details>`,
  ).join("\n");

  return `<!doctype html>
<html lang="${locale}" dir="${locale === "ar" ? "rtl" : "ltr"}">
${renderHead({ locale, meta: HOME_META, jsonLdBlocks })}
${renderBackground()}
      <main class="page-shell">
${renderHeader(locale, "home")}
        <section class="hero hero--home">
          <div class="hero-inner">
            <div class="hero-content">
              <h1 class="headline">
                <span class="headline-line-block headline-word headline-word--1">${escapeHtml(HOME_HERO.line1[locale])}</span>
                <span class="headline-line-block headline-word headline-word--2">${escapeHtml(HOME_HERO.line2[locale])}</span>
              </h1>
              <p class="cta-wrap">${renderCtaButton(locale, "cta-button", HOME_HERO.cta[locale], WHATSAPP_HOME[locale])}</p>
            </div>
          </div>
${renderScrollHint(locale)}
        </section>

        <section class="content-section" id="why-kilo">
          <div class="content-section__inner">
            <h2 class="section-title section-title--accent section-title--glow">${escapeHtml(WHY_KILO_SECTION.title[locale])}</h2>
            <p class="section-subtitle">${escapeHtml(WHY_KILO_SECTION.subtitle[locale])}</p>
            <div class="feature-grid">
${whyCards}
            </div>
          </div>
        </section>

        <section class="content-section" id="faq">
          <div class="content-section__inner">
            <h2 class="section-title section-title--accent section-title--glow">${escapeHtml(FAQ_SECTION.title[locale])}</h2>
            <div class="faq-list">
${faqItems}
            </div>
          </div>
        </section>
${renderFooter(locale)}
      </main>
    </div>
${renderPageScripts()}
  </body>
</html>
`;
}
