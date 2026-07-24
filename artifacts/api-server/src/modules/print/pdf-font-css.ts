import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

let cachedFontFaceCss: string | null = null;

export function resolveKiloAppDistDir(): string {
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(process.cwd(), "artifacts/kilo-app/dist"),
    path.resolve(moduleDir, "../../../../kilo-app/dist"),
    path.resolve(moduleDir, "../../../../../kilo-app/dist"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "fonts", "ibm-plex-sans-arabic.css"))) {
      return candidate;
    }
  }

  throw new Error("kilo-app dist (fonts) not found for PDF rendering");
}

function mimeForFontFile(relPath: string): string {
  const ext = path.extname(relPath).toLowerCase();
  if (ext === ".woff2") return "font/woff2";
  if (ext === ".woff") return "font/woff";
  return "application/octet-stream";
}

/** Inlined @font-face with base64 fonts — no HTTP fetch during PDF render. */
export function loadPdfFontFaceCss(): string {
  if (cachedFontFaceCss) return cachedFontFaceCss;

  const distDir = resolveKiloAppDistDir();
  const cssPath = path.join(distDir, "fonts", "ibm-plex-sans-arabic.css");
  const rawCss = fs.readFileSync(cssPath, "utf8");

  cachedFontFaceCss = rawCss.replace(/url\('\/fonts\/([^']+)'\)/g, (_match, rel: string) => {
    const fontPath = path.join(distDir, "fonts", rel);
    if (!fs.existsSync(fontPath)) {
      throw new Error(`PDF font file missing: ${rel}`);
    }
    const data = fs.readFileSync(fontPath).toString("base64");
    return `url('data:${mimeForFontFile(rel)};base64,${data}')`;
  });

  return cachedFontFaceCss;
}
