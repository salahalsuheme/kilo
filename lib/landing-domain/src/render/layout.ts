import type { Locale, PageId } from "../types.js";
import { NAV_ITEMS } from "../content/nav.js";
import { escapeHtml } from "./html.js";

function langSwitchHref(currentLocale: Locale, current: PageId): string {
  const targetLocale = currentLocale === "ar" ? "en" : "ar";
  if (current === "home") {
    return targetLocale === "ar" ? "/" : "/landpage-en.html";
  }
  return targetLocale === "ar" ? `/${current}.html` : `/${current}-en.html`;
}

export function renderHeader(locale: Locale, activePage: PageId): string {
  const homeHref = locale === "ar" ? "/" : "/landpage-en.html";
  const brandLabel = locale === "ar" ? "كيلو" : "Kilo";
  const switchLabel = locale === "ar" ? "EN" : "AR";
  const switchTitle = locale === "ar" ? "Switch to English" : "التبديل إلى العربية";
  const switchLang = locale === "ar" ? "en" : "ar";

  const navLinks = NAV_ITEMS.map((item) => {
    const href = locale === "ar" ? item.path.ar : item.path.en;
    const active = item.id === activePage ? ' aria-current="page"' : "";
    return `<a href="${escapeHtml(href)}" class="site-nav__link${item.id === activePage ? " site-nav__link--active" : ""}"${active}>${escapeHtml(item.label[locale])}</a>`;
  }).join("\n          ");

  return `      <header class="site-header">
        <a href="${escapeHtml(homeHref)}" class="logo-wrap" aria-label="${escapeHtml(brandLabel)}">
          <img src="/logo_kilo_white.webp" alt="${escapeHtml(brandLabel)}" width="120" height="40" fetchpriority="high" />
        </a>
        <div class="site-header__end">
          <nav class="site-nav" aria-label="${locale === "ar" ? "التنقل الرئيسي" : "Main navigation"}">
            ${navLinks}
          </nav>
          <a href="${escapeHtml(langSwitchHref(locale, activePage))}" class="lang-switch" title="${escapeHtml(switchTitle)}" lang="${switchLang}">${switchLabel}</a>
        </div>
      </header>`;
}

export function renderFooter(locale: Locale): string {
  const rights = locale === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved.";
  const year = new Date().getFullYear();
  return `      <footer class="site-footer">
        <p class="site-footer__copy">© ${year} ${locale === "ar" ? "كيلو" : "Kilo"}. ${rights}</p>
      </footer>`;
}
