import {
  buildContractPrintHtml,
  buildInvoicePrintHtml,
  buildPdfPageHtml,
  sanitizePdfFilename,
} from "@workspace/print-domain";
import { getContract } from "../contracts/service.js";
import { getInvoice } from "../invoices/service.js";
import { getOrCreateSettings } from "../settings/service.js";
import { getApiPublicUrl } from "../../env.js";
import { renderHtmlToPdf } from "./html-to-pdf.js";

function resolveAssetOrigin(): string {
  return getApiPublicUrl();
}

export async function buildContractPdf(orgId: number, contractId: number) {
  const [contract, settings] = await Promise.all([
    getContract(orgId, contractId),
    getOrCreateSettings(orgId),
  ]);

  if (!contract) return null;

  const assetOrigin = resolveAssetOrigin();
  const bodyHtml = buildContractPrintHtml(contract, settings, assetOrigin);
  const pageHtml = buildPdfPageHtml(`عقد ${contract.contractNumber}`, bodyHtml);
  const pdf = await renderHtmlToPdf(pageHtml);

  return {
    filename: sanitizePdfFilename(`${contract.contractNumber}.pdf`),
    pdf,
  };
}

export async function buildInvoicePdf(orgId: number, invoiceId: number) {
  const invoice = await getInvoice(orgId, invoiceId);
  if (!invoice) return null;

  const assetOrigin = resolveAssetOrigin();
  const bodyHtml = await buildInvoicePrintHtml(invoice, assetOrigin);
  const pageHtml = buildPdfPageHtml(`فاتورة ${invoice.invoiceNumber}`, bodyHtml);
  const pdf = await renderHtmlToPdf(pageHtml);

  return {
    filename: sanitizePdfFilename(`${invoice.invoiceNumber}.pdf`),
    pdf,
  };
}
