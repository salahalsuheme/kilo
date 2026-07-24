import QRCode from "qrcode";
import { absoluteAssetUrl, buildPrintLabeledLine, escapeHtml } from "./html-utils.js";

export interface OrgPrintHeaderInput {
  businessName: string;
  logoUrl?: string | null;
  unifiedNumber?: string | null;
}

/** عقد: شعار على اليمين والنص بجانبه مباشرة. */
export interface OrgPrintHeaderOptions {
  contractBrandInlineRtl?: boolean;
}

export function buildOrgPrintHeaderHtml(
  org: OrgPrintHeaderInput,
  qrDataUrl?: string | null,
  assetOrigin = "",
  options?: OrgPrintHeaderOptions,
): string {
  const logoUrl = absoluteAssetUrl(org.logoUrl, assetOrigin);
  const initial = org.businessName.trim().charAt(0) || "ك";

  const logoBlock = logoUrl
    ? `<img class="print-header__logo" src="${escapeHtml(logoUrl)}" alt="${escapeHtml(org.businessName)}" />`
    : `<div class="print-header__logo-fallback" aria-hidden="true">${escapeHtml(initial)}</div>`;

  const unifiedLine = org.unifiedNumber
    ? buildPrintLabeledLine("الرقم الموحد:", org.unifiedNumber, {
        valueDir: "ltr",
        className: "print-header__meta",
      })
    : "";

  const qrBlock = qrDataUrl
    ? `<div class="print-header__qr"><img src="${qrDataUrl}" alt="رمز الاستجابة السريعة ZATCA" /></div>`
    : "";

  const headerClass = options?.contractBrandInlineRtl
    ? "print-header print-header--contract-brand"
    : "print-header";

  const copyBlock = `
        <div class="print-header__copy">
          <h1 class="print-header__name">${escapeHtml(org.businessName)}</h1>
          ${unifiedLine}
        </div>`;

  const brandInner = `${logoBlock}
        ${copyBlock}`;

  return `
    <header class="${headerClass}">
      <div class="print-header__brand">
        ${brandInner}
      </div>
      ${qrBlock}
    </header>
  `;
}

export async function buildQrDataUrl(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, {
    width: 200,
    margin: 1,
    errorCorrectionLevel: "M",
  });
}
