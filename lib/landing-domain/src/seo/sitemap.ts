import { ABOUT_META } from "../content/about.js";
import { FLEET_META } from "../content/fleet.js";
import { HOME_META } from "../content/home.js";
import { SITE_URL } from "../site-config.js";
import { absoluteUrl } from "./page-meta.js";

const PAGES = [HOME_META, ABOUT_META, FLEET_META];

export function renderSitemapXml(): string {
  const urls = PAGES.flatMap((page) => [
    { loc: absoluteUrl(page.path.ar), alternates: page },
    { loc: absoluteUrl(page.path.en), alternates: page },
  ]);

  const uniqueUrls = [...new Map(urls.map((entry) => [entry.loc, entry])).values()];

  const body = uniqueUrls
    .map((entry) => {
      const altLinks = [
        `    <xhtml:link rel="alternate" hreflang="ar" href="${absoluteUrl(entry.alternates.path.ar)}" />`,
        `    <xhtml:link rel="alternate" hreflang="en" href="${absoluteUrl(entry.alternates.path.en)}" />`,
      ].join("\n");
      return `  <url>
    <loc>${entry.loc}</loc>
${altLinks}
    <changefreq>monthly</changefreq>
    <priority>${entry.loc === absoluteUrl("/") ? "1.0" : "0.8"}</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`;
}

export function renderRobotsTxt(): string {
  return `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
}
