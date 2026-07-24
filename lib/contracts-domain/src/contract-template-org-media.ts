import { contractOrgMediaImgStyleAttribute } from "./contract-org-media-display.js";

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

/** Embedded in rendered contract text; resolved to images at print/preview time. */
export const CONTRACT_ORG_STAMP_LINE = "[[kilo:org-stamp]]";
export const CONTRACT_ORG_SIGNATURE_LINE = "[[kilo:org-signature]]";

export const CONTRACT_ORG_STAMP_IMG_CLASS = "contract-org-stamp";
export const CONTRACT_ORG_SIGNATURE_IMG_CLASS = "contract-org-signature";

/**
 * يطابق img الختم/التوقيع بغضّ عن ترتيب السمات (class قبل src أو بعده — شائع مع {{org.stampUrl}}).
 */
export const CONTRACT_ORG_MEDIA_IMG_TAG_RE =
  /<img\b(?=[^>]*\bclass="(contract-org-stamp|contract-org-signature)")[^>]*\/?>/gi;

export function contractOrgMediaKindFromImgTag(tag: string): ContractOrgMediaKind | null {
  if (/\bclass="contract-org-stamp"/i.test(tag)) {
    return "stamp";
  }
  if (/\bclass="contract-org-signature"/i.test(tag)) {
    return "signature";
  }
  return null;
}

/** سطر يحتوي img ختم/توقيع فقط (بدون نص آخر). */
export function contractOrgMediaKindFromImgOnlyLine(line: string): ContractOrgMediaKind | null {
  const trimmed = line.trim();
  CONTRACT_ORG_MEDIA_IMG_TAG_RE.lastIndex = 0;
  const match = CONTRACT_ORG_MEDIA_IMG_TAG_RE.exec(trimmed);
  if (!match || match.index !== 0) {
    return null;
  }
  const remainder = trimmed.slice(match[0].length).trim();
  if (remainder.length > 0) {
    return null;
  }
  return contractOrgMediaKindFromImgTag(match[0]);
}

export type ContractOrgMediaKind = "stamp" | "signature";

export function buildContractOrgStampTemplateLine(
  stampUrl: string | null | undefined,
): string {
  return stampUrl?.trim() ? CONTRACT_ORG_STAMP_LINE : "";
}

export function buildContractOrgSignatureTemplateLine(
  signatureUrl: string | null | undefined,
): string {
  return signatureUrl?.trim() ? CONTRACT_ORG_SIGNATURE_LINE : "";
}

export function isContractOrgStampLine(line: string): boolean {
  return line.trim() === CONTRACT_ORG_STAMP_LINE;
}

export function isContractOrgSignatureLine(line: string): boolean {
  return line.trim() === CONTRACT_ORG_SIGNATURE_LINE;
}

export function lineContainsContractOrgMediaMarkers(line: string): boolean {
  return (
    line.includes(CONTRACT_ORG_STAMP_LINE) || line.includes(CONTRACT_ORG_SIGNATURE_LINE)
  );
}

export function orgMediaFlagsFromLineText(line: string): { stamp: boolean; signature: boolean } {
  return {
    stamp: line.includes(CONTRACT_ORG_STAMP_LINE),
    signature: line.includes(CONTRACT_ORG_SIGNATURE_LINE),
  };
}

export function stripContractOrgMediaMarkersFromLine(line: string): string {
  return line
    .split(CONTRACT_ORG_STAMP_LINE)
    .join("")
    .split(CONTRACT_ORG_SIGNATURE_LINE)
    .join("")
    .trim();
}

export function buildContractOrgMediaImgHtml(
  kind: ContractOrgMediaKind,
  url: string | null | undefined,
): string {
  const trimmed = url?.trim() ?? "";
  if (!trimmed) {
    return "";
  }
  const className =
    kind === "stamp" ? CONTRACT_ORG_STAMP_IMG_CLASS : CONTRACT_ORG_SIGNATURE_IMG_CLASS;
  const alt = kind === "stamp" ? "ختم الشركة" : "توقيع الشركة";
  const style = contractOrgMediaImgStyleAttribute(kind);
  return `<img class="${className}" src="${escapeHtmlAttr(trimmed)}" alt="${escapeHtmlAttr(alt)}"${style} />`;
}

export function isLegacyContractOrgMediaLine(line: string): boolean {
  return contractOrgMediaKindFromImgOnlyLine(line) !== null;
}

export function lineContainsLegacyContractOrgMedia(line: string): boolean {
  CONTRACT_ORG_MEDIA_IMG_TAG_RE.lastIndex = 0;
  return CONTRACT_ORG_MEDIA_IMG_TAG_RE.test(line);
}

export function formatLegacyContractOrgMediaLine(
  line: string,
  options: {
    escapeText: (segment: string) => string;
    resolveSrc: (src: string) => string;
  },
): string {
  const trimmed = line.trim();
  if (isLegacyContractOrgMediaLine(trimmed)) {
    return resolveLegacyOrgMediaTagSrc(trimmed, options.resolveSrc);
  }

  CONTRACT_ORG_MEDIA_IMG_TAG_RE.lastIndex = 0;
  if (!CONTRACT_ORG_MEDIA_IMG_TAG_RE.test(trimmed)) {
    return options.escapeText(trimmed);
  }
  CONTRACT_ORG_MEDIA_IMG_TAG_RE.lastIndex = 0;

  let result = "";
  let lastIndex = 0;
  for (const match of trimmed.matchAll(CONTRACT_ORG_MEDIA_IMG_TAG_RE)) {
    const start = match.index ?? 0;
    if (start > lastIndex) {
      result += options.escapeText(trimmed.slice(lastIndex, start));
    }
    result += resolveLegacyOrgMediaTagSrc(match[0], options.resolveSrc);
    lastIndex = start + match[0].length;
  }
  if (lastIndex < trimmed.length) {
    result += options.escapeText(trimmed.slice(lastIndex));
  }
  return result;
}

function resolveLegacyOrgMediaTagSrc(
  tag: string,
  resolveSrc: (src: string) => string,
): string {
  const withSrc = tag.replace(/src="([^"]*)"/, (_match, src: string) => {
    const resolved = resolveSrc(src);
    return `src="${escapeHtmlAttr(resolved)}"`;
  });
  const kind = contractOrgMediaKindFromImgTag(withSrc);
  if (kind) {
    return injectLegacyOrgMediaStyle(withSrc, kind);
  }
  return withSrc;
}

function injectLegacyOrgMediaStyle(tag: string, kind: "stamp" | "signature"): string {
  const styleAttr = contractOrgMediaImgStyleAttribute(kind);
  if (/\sstyle="/i.test(tag)) {
    return tag.replace(/\sstyle="[^"]*"/i, styleAttr);
  }
  return tag.replace(/\s*\/?>$/, `${styleAttr} />`);
}
