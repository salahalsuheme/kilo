import { formatContractDateTime, formatContractSarDisplay } from "@workspace/contracts-domain";
import { escapeHtml } from "./html-utils.js";
import { buildOrgPrintHeaderHtml } from "./org-print-header.js";
import { formatContractBodyHtml } from "./format-contract-body-html.js";
import { resolveOrgPrintBusinessName } from "./resolve-org-print-business-name.js";

export interface ContractPrintInput {
  contractNumber: string;
  driverName: string;
  establishmentFullName?: string | null;
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
  unifiedNumber?: string | null;
  stampUrl?: string | null;
  signatureUrl?: string | null;
}

export function buildContractPrintHtml(
  contract: ContractPrintInput,
  settings: OrgPrintSettings,
  assetOrigin = "",
): string {
  const orgDisplayName = resolveOrgPrintBusinessName(settings);

  const header = buildOrgPrintHeaderHtml(
    {
      businessName: orgDisplayName,
      logoUrl: settings.logoUrl,
      unifiedNumber: settings.unifiedNumber,
    },
    null,
    assetOrigin,
    { contractBrandInlineRtl: true },
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
        <p class="print-box__title">بيانات المستأجر</p>
        <p><strong>المنشأة:</strong> ${escapeHtml(contract.establishmentFullName?.trim() || "—")}</p>
        <p><strong>السائق:</strong> ${escapeHtml(contract.driverName)}</p>
        <p><strong>المركبة:</strong> ${escapeHtml(contract.vehicleBrand)}</p>
        <p><strong>اللوحة:</strong> <span dir="ltr">${escapeHtml(contract.vehiclePlateNumber)}</span></p>
      </div>
      <div class="print-box">
        <p class="print-box__title">المدة والمبالغ</p>
        <p><strong>من:</strong> ${escapeHtml(formatContractDateTime(contract.startAt))}</p>
        <p><strong>إلى:</strong> ${escapeHtml(formatContractDateTime(contract.endAt))}</p>
        <p><strong>المدة:</strong> ${contract.rentalDurationDays} يوم</p>
        <p><strong>الإجمالي:</strong> ${escapeHtml(formatContractSarDisplay(contract.totalInclVat))}</p>
      </div>
    </div>
    ${formatContractBodyHtml(bodyContent, {
      assetOrigin,
      stampUrl: settings.stampUrl,
      signatureUrl: settings.signatureUrl,
    })}
    <footer class="print-footer">
      تم إنشاء هذا العقد إلكترونيًا عبر نظام ${escapeHtml(orgDisplayName)}<br />
      <span dir="ltr">
        <a href="https://www.kilo-sa.com">www.kilo-sa.com</a>
        -
        <a href="mailto:info@kilo-sa.com">info@kilo-sa.com</a>
      </span>
    </footer>
  `;
}
