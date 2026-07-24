import { buildPrintPageHtml } from "@workspace/print-domain";

export type PrintMode = "print" | "pdf";

interface OpenPrintDocumentOptions {
  bodyHtml: string;
  /** Hidden iframe label for accessibility (not shown on the printed page). */
  iframeTitle?: string;
}

function resolveFontStylesheetHref(): string {
  return new URL(
    "fonts/ibm-plex-sans-arabic.css",
    `${window.location.origin}${import.meta.env.BASE_URL}`,
  ).href;
}

export function openPrintDocument(options: OpenPrintDocumentOptions): boolean {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", options.iframeTitle ?? "طباعة");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;pointer-events:none";

  document.body.appendChild(iframe);

  const win = iframe.contentWindow;
  const doc = win?.document;
  if (!win || !doc) {
    iframe.remove();
    return false;
  }

  doc.open();
  doc.write(
    buildPrintPageHtml(options.bodyHtml, {
      fontStylesheetHref: resolveFontStylesheetHref(),
    }),
  );
  doc.close();

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    iframe.remove();
  };

  win.addEventListener("afterprint", cleanup, { once: true });
  window.setTimeout(cleanup, 120_000);

  return true;
}

export { sanitizePdfFilename } from "@workspace/print-domain";
