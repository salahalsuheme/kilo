import QRCode from "qrcode";
import { absoluteAssetUrl, escapeHtml } from "./html-utils.js";

export interface OrgPrintHeaderInput {
  businessName: string;
  logoUrl?: string | null;
  taxNumber?: string | null;
}

export function buildOrgPrintHeaderHtml(
  org: OrgPrintHeaderInput,
  qrDataUrl?: string | null,
  assetOrigin = "",
): string {
  const logoUrl = absoluteAssetUrl(org.logoUrl, assetOrigin);
  const initial = org.businessName.trim().charAt(0) || "ك";

  const logoBlock = logoUrl
    ? `<img class="print-header__logo" src="${escapeHtml(logoUrl)}" alt="${escapeHtml(org.businessName)}" />`
    : `<div class="print-header__logo-fallback" aria-hidden="true">${escapeHtml(initial)}</div>`;

  const taxLine = org.taxNumber
    ? `<p class="print-header__meta">الرقم الضريبي: <span dir="ltr">${escapeHtml(org.taxNumber)}</span></p>`
    : "";

  const qrBlock = qrDataUrl
    ? `<div class="print-header__qr"><img src="${qrDataUrl}" alt="رمز الاستجابة السريعة ZATCA" /></div>`
    : "";

  return `
    <header class="print-header">
      <div class="print-header__brand">
        ${logoBlock}
        <div>
          <h1 class="print-header__name">${escapeHtml(org.businessName)}</h1>
          ${taxLine}
        </div>
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
