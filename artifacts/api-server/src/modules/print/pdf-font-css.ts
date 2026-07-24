import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

let cachedFontCss: string | null = null;

function resolveFontsCssPath(): string {
  const candidates = [
    path.resolve(process.cwd(), "artifacts/kilo-app/dist/fonts/ibm-plex-sans-arabic.css"),
    path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "../../../kilo-app/dist/fonts/ibm-plex-sans-arabic.css",
    ),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  throw new Error("IBM Plex Sans Arabic font CSS not found for PDF rendering");
}

/** Inlined @font-face rules with woff2 URLs resolved against the local static server. */
export function loadPdfFontFaceCss(fontBaseUrl: string): string {
  if (!cachedFontCss) {
    cachedFontCss = fs.readFileSync(resolveFontsCssPath(), "utf8");
  }

  const base = fontBaseUrl.replace(/\/+$/, "");
  return cachedFontCss.replace(/url\('\/fonts\//g, `url('${base}/fonts/`);
}
