export type ContractOrgMediaDisplayKind = "stamp" | "signature";

/** أبعاد العرض فقط — لا تغيّر الملفات أو المبالغ. */
export const CONTRACT_ORG_STAMP_DISPLAY = {
  maxHeightPx: 120,
  maxWidthPx: 250,
} as const;

export const CONTRACT_ORG_SIGNATURE_DISPLAY = {
  /** أصغر من الختم لكن واضح على العقد (~60% من ارتفاع الختم) */
  maxHeightPx: 72,
  maxWidthPx: 200,
} as const;

export function contractOrgMediaDisplayCss(kind: ContractOrgMediaDisplayKind): string {
  const size = kind === "stamp" ? CONTRACT_ORG_STAMP_DISPLAY : CONTRACT_ORG_SIGNATURE_DISPLAY;
  return [
    "display:inline-block",
    `max-height:${size.maxHeightPx}px`,
    `max-width:${size.maxWidthPx}px`,
    "width:auto",
    "height:auto",
    "object-fit:contain",
    "vertical-align:middle",
  ].join(";");
}

export function contractOrgMediaImgStyleAttribute(kind: ContractOrgMediaDisplayKind): string {
  return ` style="${contractOrgMediaDisplayCss(kind)}"`;
}

function upsertOrgMediaDisplayStyle(tag: string, kind: ContractOrgMediaDisplayKind): string {
  const css = contractOrgMediaDisplayCss(kind);
  if (/\sstyle="/i.test(tag)) {
    return tag.replace(/\sstyle="[^"]*"/i, ` style="${css}"`);
  }
  return tag.replace(/\s*\/?>$/, ` style="${css}" />`);
}

export function applyContractOrgMediaDisplayStyles(html: string): string {
  return html.replace(
    /<img\b(?=[^>]*\bclass="contract-org-stamp")[^>]*\/?>/gi,
    (tag) => upsertOrgMediaDisplayStyle(tag, "stamp"),
  ).replace(
    /<img\b(?=[^>]*\bclass="contract-org-signature")[^>]*\/?>/gi,
    (tag) => upsertOrgMediaDisplayStyle(tag, "signature"),
  );
}
