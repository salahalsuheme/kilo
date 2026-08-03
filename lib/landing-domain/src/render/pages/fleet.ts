import type { Locale, FleetVehicle, LocalizedText, PageId, PageMeta } from "../../types.js";
import {
  DELIVERY_FLEET_CTA,
  DELIVERY_FLEET_META,
  DELIVERY_FLEET_SECTION,
  DELIVERY_FLEET_VEHICLES,
  FLEET_META,
  FLEET_SECTION,
  FLEET_VEHICLES,
} from "../../content/fleet.js";
import { carRentalJsonLd, webPageJsonLd } from "../../seo/structured-data.js";
import { WHATSAPP_DELIVERY } from "../../site-config.js";
import { renderBackground, renderCtaButton, renderHead } from "../head.js";
import { renderFooter, renderHeader, renderPageScripts } from "../layout.js";
import { escapeHtml } from "../html.js";

type FleetPageOptions = {
  pageId: Extract<PageId, "fleet" | "delivery-fleet">;
  meta: PageMeta;
  section: typeof FLEET_SECTION;
  vehicles: FleetVehicle[];
  ctaLabel?: LocalizedText;
  ctaHref?: LocalizedText;
};

function renderFleetPageInternal(locale: Locale, options: FleetPageOptions): string {
  const { pageId, meta, section, vehicles, ctaLabel, ctaHref } = options;
  const jsonLdBlocks = [
    carRentalJsonLd(locale),
    webPageJsonLd(locale, meta.title[locale], meta.description[locale], meta.path[locale]),
  ];

  const cards = vehicles.map((vehicle) => {
    const highlights = vehicle.highlights
      .map((item) => `                <li>${escapeHtml(item[locale])}</li>`)
      .join("\n");
    const imageMarkup = vehicle.image
      ? `              <img class="fleet-card__image" src="${escapeHtml(vehicle.image.src)}" alt="${escapeHtml(vehicle.image.alt[locale])}" width="${vehicle.image.width}" height="${vehicle.image.height}" loading="lazy" decoding="async" />`
      : "";
    const cardClass = vehicle.image ? "fleet-card fleet-card--with-image" : "fleet-card";
    return `            <article class="${cardClass}" id="${escapeHtml(vehicle.id)}">
${imageMarkup}
              <div class="fleet-card__body">
              <h2 class="fleet-card__title">${escapeHtml(vehicle.name[locale])}</h2>
              <p class="fleet-card__text">${escapeHtml(vehicle.description[locale])}</p>
              <ul class="fleet-card__list">
${highlights}
              </ul>
              </div>
            </article>`;
  }).join("\n");

  return `<!doctype html>
<html lang="${locale}" dir="${locale === "ar" ? "rtl" : "ltr"}">
${renderHead({ locale, meta, jsonLdBlocks })}
${renderBackground()}
      <main class="page-shell">
${renderHeader(locale, pageId)}
        <section class="content-section content-section--page">
          <div class="content-section__inner">
            <h1 class="page-title section-title--accent section-title--glow">${escapeHtml(section.title[locale])}</h1>
            <p class="section-subtitle">${escapeHtml(section.subtitle[locale])}</p>
            <div class="fleet-grid">
${cards}
            </div>
            <p class="page-cta">${renderCtaButton(locale, "cta-button", ctaLabel?.[locale], ctaHref?.[locale])}</p>
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

export function renderFleetPage(locale: Locale): string {
  return renderFleetPageInternal(locale, {
    pageId: "fleet",
    meta: FLEET_META,
    section: FLEET_SECTION,
    vehicles: FLEET_VEHICLES,
  });
}

export function renderDeliveryFleetPage(locale: Locale): string {
  return renderFleetPageInternal(locale, {
    pageId: "delivery-fleet",
    meta: DELIVERY_FLEET_META,
    section: DELIVERY_FLEET_SECTION,
    vehicles: DELIVERY_FLEET_VEHICLES,
    ctaLabel: DELIVERY_FLEET_CTA,
    ctaHref: WHATSAPP_DELIVERY,
  });
}
