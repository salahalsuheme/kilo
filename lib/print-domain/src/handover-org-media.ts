import { buildContractOrgMediaImgHtml, type ContractOrgMediaKind } from "@workspace/contracts-domain";
import { absoluteAssetUrl, escapeHtml } from "./html-utils.js";

function resolveOrgMediaImgHtml(
  kind: ContractOrgMediaKind,
  url: string | null | undefined,
  assetOrigin: string,
): string {
  const img = buildContractOrgMediaImgHtml(kind, url);
  if (!img) {
    return "";
  }
  return img.replace(/src="([^"]*)"/, (_match, src: string) => {
    const absolute = absoluteAssetUrl(src, assetOrigin) ?? src;
    return `src="${escapeHtml(absolute)}"`;
  });
}

export function buildHandoverOrgStampSignatureHtml(
  stampUrl: string | null | undefined,
  signatureUrl: string | null | undefined,
  assetOrigin = "",
): string {
  const stamp = resolveOrgMediaImgHtml("stamp", stampUrl, assetOrigin);
  const signature = resolveOrgMediaImgHtml("signature", signatureUrl, assetOrigin);
  if (!stamp && !signature) {
    return `<div class="vehicle-handover-print-signature-space" aria-hidden="true"></div>`;
  }
  return `<div class="vehicle-handover-print-org-media">${stamp}${signature}</div>`;
}
