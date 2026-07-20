import type { Locale } from "../../types.js";
import { FLEET_META, FLEET_SECTION, FLEET_VEHICLES } from "../../content/fleet.js";
import { carRentalJsonLd, webPageJsonLd } from "../../seo/structured-data.js";
import { renderBackground, renderCtaButton, renderHead } from "../head.js";
import { renderFooter, renderHeader } from "../layout.js";
import { escapeHtml } from "../html.js";

export function renderFleetPage(locale: Locale): string {
  const jsonLdBlocks = [
    carRentalJsonLd(locale),
    webPageJsonLd(
      locale,
      FLEET_META.title[locale],
      FLEET_META.description[locale],
      FLEET_META.path[locale],
    ),
  ];

  const cards = FLEET_VEHICLES.map((vehicle) => {
    const highlights = vehicle.highlights
      .map((item) => `                <li>${escapeHtml(item[locale])}</li>`)
      .join("\n");
    return `            <article class="fleet-card" id="${escapeHtml(vehicle.id)}">
              <h2 class="fleet-card__title">${escapeHtml(vehicle.name[locale])}</h2>
              <p class="fleet-card__text">${escapeHtml(vehicle.description[locale])}</p>
              <ul class="fleet-card__list">
${highlights}
              </ul>
            </article>`;
  }).join("\n");

  return `<!doctype html>
<html lang="${locale}" dir="${locale === "ar" ? "rtl" : "ltr"}">
${renderHead({ locale, meta: FLEET_META, jsonLdBlocks })}
${renderBackground()}
      <main class="page-shell">
${renderHeader(locale, "fleet")}
        <section class="content-section content-section--page">
          <div class="content-section__inner">
            <h1 class="page-title">${escapeHtml(FLEET_SECTION.title[locale])}</h1>
            <p class="section-subtitle">${escapeHtml(FLEET_SECTION.subtitle[locale])}</p>
            <div class="fleet-grid">
${cards}
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
