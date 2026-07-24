import { buildPrintPageHtml } from "@workspace/print-domain";

export type PrintMode = "print" | "pdf";

interface OpenPrintDocumentOptions {
  bodyHtml: string;
  /** Hidden iframe label for accessibility (not shown on the printed page). */
  iframeTitle?: string;
  /** Shown on each printed sheet next to the print time (e.g. contract or invoice number). */
  sheetHeaderReference?: string;
}

function resolveFontStylesheetHref(): string {
  return new URL(
    "fonts/ibm-plex-sans-arabic.css",
    `${window.location.origin}${import.meta.env.BASE_URL}`,
  ).href;
}

function formatBrowserPrintHeaderDateTime(): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());
}

export function openPrintDocument(options: OpenPrintDocumentOptions): boolean {
  const savedParentTitle = document.title;
  document.title = " ";

  const restoreParentTitle = () => {
    document.title = savedParentTitle;
  };

  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", options.iframeTitle ?? "طباعة");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;pointer-events:none";

  document.body.appendChild(iframe);

  const win = iframe.contentWindow;
  const doc = win?.document;
  if (!win || !doc) {
    restoreParentTitle();
    iframe.remove();
    return false;
  }

  const sheetHeader =
    options.sheetHeaderReference?.trim() ?
      {
        reference: options.sheetHeaderReference.trim(),
        printedAt: formatBrowserPrintHeaderDateTime(),
      }
    : undefined;

  doc.open();
  doc.write(
    buildPrintPageHtml(options.bodyHtml, {
      fontStylesheetHref: resolveFontStylesheetHref(),
      sheetHeader,
    }),
  );
  doc.close();

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    restoreParentTitle();
    iframe.remove();
  };

  win.addEventListener("afterprint", cleanup, { once: true });
  window.setTimeout(cleanup, 120_000);

  return true;
}

export { sanitizePdfFilename } from "@workspace/print-domain";
