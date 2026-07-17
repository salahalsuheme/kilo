import { formatContractDateTime } from "@workspace/contracts-domain";
import { formatSarCurrency } from "@workspace/invoices-domain";
import { escapeHtml } from "./html-utils.js";
import { buildOrgPrintHeaderHtml } from "./org-print-header.js";
import { formatContractBodyHtml } from "./format-contract-body-html.js";

export interface ContractPrintInput {
  contractNumber: string;
  customerName: string;
  vehicleBrand: string;
  vehiclePlateNumber: string;
  startAt: string;
  endAt: string;
  rentalDurationDays: number;
  totalInclVat: number;
  renderedContent?: string | null;
}

export interface OrgPrintSettings {
  businessName: string;
  logoUrl?: string | null;
  taxNumber?: string | null;
}

export function buildContractPrintHtml(
  contract: ContractPrintInput,
  settings: OrgPrintSettings,
  assetOrigin = "",
): string {
  const header = buildOrgPrintHeaderHtml(
    {
      businessName: settings.businessName,
      logoUrl: settings.logoUrl,
      taxNumber: settings.taxNumber,
    },
    null,
    assetOrigin,
  );

  const bodyContent =
    contract.renderedContent?.trim() ||
    "لا يوجد محتوى للعقد. يرجى حفظ العقد أولاً لإنشاء النص المعروض.";

  return `
    ${header}
    <h2 class="print-title">عقد تأجير مركبة</h2>
    <p class="print-subtitle">رقم العقد: <span dir="ltr">${escapeHtml(contract.contractNumber)}</span></p>
    <div class="print-meta-grid">
      <div class="print-box">
        <p class="print-box__title">بيانات العقد</p>
        <p><strong>العميل:</strong> ${escapeHtml(contract.customerName)}</p>
        <p><strong>المركبة:</strong> ${escapeHtml(contract.vehicleBrand)}</p>
        <p><strong>اللوحة:</strong> <span dir="ltr">${escapeHtml(contract.vehiclePlateNumber)}</span></p>
      </div>
      <div class="print-box">
        <p class="print-box__title">المدة والمبالغ</p>
        <p><strong>من:</strong> ${escapeHtml(formatContractDateTime(contract.startAt))}</p>
        <p><strong>إلى:</strong> ${escapeHtml(formatContractDateTime(contract.endAt))}</p>
        <p><strong>المدة:</strong> ${contract.rentalDurationDays} يوم</p>
        <p><strong>الإجمالي:</strong> ${escapeHtml(formatSarCurrency(contract.totalInclVat))}</p>
      </div>
    </div>
    ${formatContractBodyHtml(bodyContent)}
    <footer class="print-footer">
      تم إنشاء هذا العقد إلكترونياً عبر نظام كيلو<br />
      <span dir="ltr">
        <a href="https://www.kilo-sa.com">www.kilo-sa.com</a>
        -
        <a href="mailto:info@kilo-sa.com">info@kilo-sa.com</a>
      </span>
    </footer>
  `;
}
