import { buildPrintPageHtml } from "@workspace/print-domain";

export type PrintMode = "print" | "pdf";

interface OpenPrintDocumentOptions {
  title: string;
  bodyHtml: string;
}

export function openPrintDocument(options: OpenPrintDocumentOptions): boolean {
  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=920,height=720");
  if (!printWindow) return false;

  printWindow.document.open();
  printWindow.document.write(buildPrintPageHtml(options.title, options.bodyHtml));
  printWindow.document.close();
  return true;
}

export { sanitizePdfFilename } from "@workspace/print-domain";
