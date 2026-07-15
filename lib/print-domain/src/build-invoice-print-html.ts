import type { InvoiceType } from "@workspace/customers-domain";
import { INVOICE_TYPE_LABELS } from "@workspace/customers-domain";
import {
  buildZatcaQrPayload,
  formatSarCurrency,
  formatSarNumber,
  formatZatcaAmount,
  formatZatcaTimestamp,
  ZATCA_INVOICE_TITLES,
  ZATCA_INVOICE_TITLES_EN,
} from "@workspace/invoices-domain";
import { formatContractDateTime } from "@workspace/contracts-domain";
import { escapeHtml } from "./html-utils.js";
import { buildOrgPrintHeaderHtml, buildQrDataUrl } from "./org-print-header.js";

export interface InvoicePrintInput {
  invoiceNumber: string;
  invoiceType: InvoiceType;
  paidAt?: string | null;
  createdAt: string;
  amountExVat: number;
  taxRate: number;
  taxAmount: number;
  totalInclVat: number;
  customerName: string;
  customerIdNumber: string;
  customerMobile: string;
  customerTaxNumber?: string | null;
  customerEstablishmentName?: string | null;
  vehicleBrand: string;
  vehiclePlateNumber: string;
  contractNumber: string;
  contractStartAt: string;
  contractEndAt: string;
  sellerBusinessName: string;
  sellerLogoUrl?: string | null;
  sellerTaxNumber?: string | null;
}

function formatInvoiceDate(invoice: InvoicePrintInput): string {
  const raw = invoice.paidAt ?? invoice.createdAt;
  return formatContractDateTime(raw);
}

function formatZatcaQrDate(invoice: InvoicePrintInput): string {
  return formatZatcaTimestamp(invoice.paidAt ?? invoice.createdAt);
}

export async function buildInvoicePrintHtml(
  invoice: InvoicePrintInput,
  assetOrigin = "",
): Promise<string> {
  const invoiceDate = formatInvoiceDate(invoice);
  const sellerVat = invoice.sellerTaxNumber?.trim() || "000000000000003";

  const qrPayload = buildZatcaQrPayload({
    sellerName: invoice.sellerBusinessName,
    vatNumber: sellerVat,
    timestamp: formatZatcaQrDate(invoice),
    totalInclVat: formatZatcaAmount(invoice.totalInclVat),
    vatAmount: formatZatcaAmount(invoice.taxAmount),
  });

  const qrDataUrl = await buildQrDataUrl(qrPayload);

  const header = buildOrgPrintHeaderHtml(
    {
      businessName: invoice.sellerBusinessName,
      logoUrl: invoice.sellerLogoUrl,
      taxNumber: invoice.sellerTaxNumber,
    },
    qrDataUrl,
    assetOrigin,
  );

  const buyerTax = invoice.customerTaxNumber
    ? `<p><strong>الرقم الضريبي:</strong> <span dir="ltr">${escapeHtml(invoice.customerTaxNumber)}</span></p>`
    : "";

  const establishment = invoice.customerEstablishmentName
    ? `<p><strong>المنشأة:</strong> ${escapeHtml(invoice.customerEstablishmentName)}</p>`
    : "";

  const lineDescription = `تأجير مركبة ${invoice.vehicleBrand} — لوحة ${invoice.vehiclePlateNumber} — عقد ${invoice.contractNumber}`;

  return `
    ${header}
    <h2 class="print-title">${escapeHtml(ZATCA_INVOICE_TITLES[invoice.invoiceType])}</h2>
    <p class="print-subtitle">${escapeHtml(ZATCA_INVOICE_TITLES_EN[invoice.invoiceType])}</p>

    <div class="print-meta-grid">
      <div class="print-box">
        <p class="print-box__title">بيانات الفاتورة</p>
        <p><strong>رقم الفاتورة:</strong> <span dir="ltr">${escapeHtml(invoice.invoiceNumber)}</span></p>
        <p><strong>تاريخ الإصدار:</strong> ${escapeHtml(invoiceDate)}</p>
        <p><strong>نوع الفاتورة:</strong> ${escapeHtml(INVOICE_TYPE_LABELS[invoice.invoiceType])}</p>
      </div>
      <div class="print-box">
        <p class="print-box__title">بيانات العقد</p>
        <p><strong>رقم العقد:</strong> <span dir="ltr">${escapeHtml(invoice.contractNumber)}</span></p>
        <p><strong>من:</strong> ${escapeHtml(formatContractDateTime(invoice.contractStartAt))}</p>
        <p><strong>إلى:</strong> ${escapeHtml(formatContractDateTime(invoice.contractEndAt))}</p>
      </div>
    </div>

    <div class="print-meta-grid">
      <div class="print-box">
        <p class="print-box__title">البائع</p>
        <p><strong>${escapeHtml(invoice.sellerBusinessName)}</strong></p>
        ${
          invoice.sellerTaxNumber
            ? `<p>الرقم الضريبي: <span dir="ltr">${escapeHtml(invoice.sellerTaxNumber)}</span></p>`
            : ""
        }
      </div>
      <div class="print-box">
        <p class="print-box__title">المشتري</p>
        <p><strong>${escapeHtml(invoice.customerName)}</strong></p>
        <p>رقم الهوية: <span dir="ltr">${escapeHtml(invoice.customerIdNumber)}</span></p>
        <p>الجوال: <span dir="ltr">${escapeHtml(invoice.customerMobile)}</span></p>
        ${establishment}
        ${buyerTax}
      </div>
    </div>

    <table class="print-table">
      <thead>
        <tr>
          <th>الوصف</th>
          <th>الكمية</th>
          <th>السعر بدون ضريبة</th>
          <th>مبلغ الضريبة</th>
          <th>الإجمالي شامل الضريبة</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${escapeHtml(lineDescription)}</td>
          <td class="num">1</td>
          <td class="num">${escapeHtml(formatSarNumber(invoice.amountExVat))}</td>
          <td class="num">${escapeHtml(formatSarNumber(invoice.taxAmount))}</td>
          <td class="num">${escapeHtml(formatSarNumber(invoice.totalInclVat))}</td>
        </tr>
      </tbody>
    </table>

    <div class="print-totals">
      <div class="print-totals__row">
        <span>المجموع بدون ضريبة</span>
        <span class="num">${escapeHtml(formatSarCurrency(invoice.amountExVat))}</span>
      </div>
      <div class="print-totals__row">
        <span>ضريبة القيمة المضافة (${escapeHtml(String(invoice.taxRate))}%)</span>
        <span class="num">${escapeHtml(formatSarCurrency(invoice.taxAmount))}</span>
      </div>
      <div class="print-totals__row">
        <span>الإجمالي شامل الضريبة</span>
        <span class="num">${escapeHtml(formatSarCurrency(invoice.totalInclVat))}</span>
      </div>
    </div>

    <footer class="print-footer">
      فاتورة إلكترونية متوافقة مع متطلبات هيئة الزكاة والضريبة والجمارك (ZATCA) — رمز QR للتحقق
    </footer>
  `;
}
