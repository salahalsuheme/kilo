import {
  buildContractPrintHtml,
  buildInvoicePrintHtml,
  buildPdfPageHtml,
  sanitizePdfFilename,
} from "@workspace/print-domain";
import { getContract } from "../contracts/service.js";
import { getInvoice } from "../invoices/service.js";
import { getOrCreateSettings } from "../settings/service.js";
import { getListenPort } from "../../env.js";
import { renderHtmlToPdf } from "./html-to-pdf.js";
import { loadPdfFontFaceCss } from "./pdf-font-css.js";
import { inlineUploadImagesInPrintHtml } from "./pdf-inline-upload-images.js";

/** Playwright runs in the same process as Express; load /fonts and /uploads via loopback. */
function resolvePdfRenderBaseUrl(): string {
  return `http://127.0.0.1:${getListenPort()}`;
}

export async function buildContractPdf(orgId: number, contractId: number) {
  const [contract, settings] = await Promise.all([
    getContract(orgId, contractId),
    getOrCreateSettings(orgId),
  ]);

  if (!contract) return null;

  const pdfBaseUrl = resolvePdfRenderBaseUrl();
  const bodyHtml = buildContractPrintHtml(contract, settings, pdfBaseUrl);
  const pageHtml = await inlineUploadImagesInPrintHtml(
    buildPdfPageHtml(`عقد ${contract.contractNumber}`, bodyHtml, {
      inlineFontFaceCss: loadPdfFontFaceCss(pdfBaseUrl),
    }),
  );
  const pdf = await renderHtmlToPdf(pageHtml, pdfBaseUrl);

  return {
    filename: sanitizePdfFilename(`${contract.contractNumber}.pdf`),
    pdf,
  };
}

export async function buildInvoicePdf(orgId: number, invoiceId: number) {
  const invoice = await getInvoice(orgId, invoiceId);
  if (!invoice) return null;

  const pdfBaseUrl = resolvePdfRenderBaseUrl();
  const bodyHtml = await buildInvoicePrintHtml(invoice, pdfBaseUrl);
  const pageHtml = await inlineUploadImagesInPrintHtml(
    buildPdfPageHtml(`فاتورة ${invoice.invoiceNumber}`, bodyHtml, {
      inlineFontFaceCss: loadPdfFontFaceCss(pdfBaseUrl),
    }),
  );
  const pdf = await renderHtmlToPdf(pageHtml, pdfBaseUrl);

  return {
    filename: sanitizePdfFilename(`${invoice.invoiceNumber}.pdf`),
    pdf,
  };
}
