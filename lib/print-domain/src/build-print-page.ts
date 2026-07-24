import { PDF_RENDER_STYLES, PRINT_BASE_STYLES } from "./print-styles.js";
import { escapeHtml } from "./html-utils.js";

export type PrintSheetHeader = {
  reference: string;
  printedAt: string;
};

export type BuildPrintPageOptions = {
  /** Absolute or root-relative URL to the Arabic print font stylesheet */
  fontStylesheetHref?: string;
  /** Server-side PDF: inlined @font-face CSS (preferred over external link) */
  inlineFontFaceCss?: string;
  /** Browser print: document ref + timestamp (replaces URL in header area). */
  sheetHeader?: PrintSheetHeader;
};

/** Blank document title so the browser does not print "عقد …" in the page header. */
const BROWSER_PRINT_DOCUMENT_TITLE = " ";

const PRINT_BOOT_SCRIPT = `
(function () {
  function doPrint() {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.document.title = " ";
      }
    } catch (_e) {
      /* cross-origin guard */
    }
    window.focus();
    window.print();
  }
  function whenReady() {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        setTimeout(doPrint, 50);
      });
    } else {
      setTimeout(doPrint, 200);
    }
  }
  if (document.readyState === "complete") {
    whenReady();
  } else {
    window.addEventListener("load", whenReady, { once: true });
  }
})();
`.trim();

function buildBrowserSheetHeaderHtml(sheetHeader: PrintSheetHeader | undefined): string {
  if (!sheetHeader?.reference.trim()) return "";
  const ref = escapeHtml(sheetHeader.reference.trim());
  const at = escapeHtml(sheetHeader.printedAt.trim());
  return `<div class="print-browser-sheet-header" aria-hidden="true">
  <span class="print-browser-sheet-header__datetime" dir="ltr">${at}</span>
  <span class="print-browser-sheet-header__sep" aria-hidden="true">|</span>
  <span class="print-browser-sheet-header__ref" dir="ltr">${ref}</span>
</div>`;
}

export function buildPrintPageHtml(
  bodyHtml: string,
  options?: BuildPrintPageOptions,
): string {
  const fontHref = options?.fontStylesheetHref ?? "/fonts/ibm-plex-sans-arabic.css";
  const fontLink = `<link rel="stylesheet" href="${escapeHtml(fontHref)}" />`;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>${BROWSER_PRINT_DOCUMENT_TITLE}</title>
  ${fontLink}
  <style>${PRINT_BASE_STYLES}</style>
</head>
<body>
  ${buildBrowserSheetHeaderHtml(options?.sheetHeader)}
  <div class="print-doc">${bodyHtml}</div>
  <script>${PRINT_BOOT_SCRIPT}<\/script>
</body>
</html>`;
}

export function buildPdfPageHtml(
  title: string,
  bodyHtml: string,
  options?: BuildPrintPageOptions,
): string {
  const fontHref = options?.fontStylesheetHref ?? "/fonts/ibm-plex-sans-arabic.css";
  const fontBlock = options?.inlineFontFaceCss
    ? `<style>${options.inlineFontFaceCss}</style>`
    : `<link rel="stylesheet" href="${escapeHtml(fontHref)}" />`;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  ${fontBlock}
  <style>${PDF_RENDER_STYLES}</style>
</head>
<body>
  <div class="print-doc">${bodyHtml}</div>
</body>
</html>`;
}
