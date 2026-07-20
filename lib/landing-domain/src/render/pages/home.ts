import type { Locale } from "../../types.js";
import {
  HOME_HERO,
  HOME_META,
  HOW_IT_WORKS_SECTION,
  HOW_IT_WORKS_STEPS,
  WHY_KILO_ITEMS,
  WHY_KILO_SECTION,
} from "../../content/home.js";
import { FAQ_ITEMS, FAQ_SECTION } from "../../content/faq.js";
import { carRentalJsonLd, faqJsonLd, webPageJsonLd } from "../../seo/structured-data.js";
import { renderBackground, renderCtaButton, renderHead } from "../head.js";
import { renderFooter, renderHeader } from "../layout.js";
import { escapeHtml } from "../html.js";

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
              <h3 class="feature-card__title">${escapeHtml(item.title[locale])}</h3>
              <p class="feature-card__text">${escapeHtml(item.description[locale])}</p>
            </article>`,
  ).join("\n");

  const steps = HOW_IT_WORKS_STEPS.map(
    (step, index) => `            <li class="step-card">
              <span class="step-card__number">${index + 1}</span>
              <h3 class="step-card__title">${escapeHtml(step.title[locale])}</h3>
              <p class="step-card__text">${escapeHtml(step.description[locale])}</p>
            </li>`,
  ).join("\n");

  const faqItems = FAQ_ITEMS.map(
    (item) => `            <details class="faq-item">
              <summary class="faq-item__question">${escapeHtml(item.question[locale])}</summary>
              <p class="faq-item__answer">${escapeHtml(item.answer[locale])}</p>
            </details>`,
  ).join("\n");

  return `<!doctype html>
<html lang="${locale}" dir="${locale === "ar" ? "rtl" : "ltr"}">
${renderHead({ locale, meta: HOME_META, jsonLdBlocks })}
${renderBackground()}
      <main class="page-shell">
${renderHeader(locale, "home")}
        <section class="hero hero--home">
          <div class="hero-content">
            <h1 class="headline">
              <span class="headline-line-block headline-word headline-word--1">${escapeHtml(HOME_HERO.line1[locale])}</span>
              <span class="headline-line-block headline-word headline-word--2">${escapeHtml(HOME_HERO.line2[locale])}</span>
            </h1>
            <p class="cta-wrap">${renderCtaButton(locale)}</p>
          </div>
        </section>

        <section class="content-section" id="why-kilo">
          <div class="content-section__inner">
            <h2 class="section-title">${escapeHtml(WHY_KILO_SECTION.title[locale])}</h2>
            <p class="section-subtitle">${escapeHtml(WHY_KILO_SECTION.subtitle[locale])}</p>
            <div class="feature-grid">
${whyCards}
            </div>
          </div>
        </section>

        <section class="content-section content-section--alt" id="how-it-works">
          <div class="content-section__inner">
            <h2 class="section-title">${escapeHtml(HOW_IT_WORKS_SECTION.title[locale])}</h2>
            <ol class="steps-list">
${steps}
            </ol>
          </div>
        </section>

        <section class="content-section" id="faq">
          <div class="content-section__inner">
            <h2 class="section-title">${escapeHtml(FAQ_SECTION.title[locale])}</h2>
            <div class="faq-list">
${faqItems}
            </div>
          </div>
        </section>
${renderFooter(locale)}
      </main>
    </div>
  </body>
</html>
`;
}
