import {
  buildContractOrgMediaImgHtml,
  formatLegacyContractOrgMediaLine,
  isContractOrgSignatureLine,
  isContractOrgStampLine,
  isLegacyContractOrgMediaLine,
  lineContainsContractOrgMediaMarkers,
  lineContainsLegacyContractOrgMedia,
  orgMediaFlagsFromLineText,
  applyContractOrgMediaDisplayStyles,
  normalizeRenderedContractContentForStorage,
  stripContractOrgMediaMarkersFromLine,
  isContractSpacerLine,
  lineContainsContractSpacerMarker,
  stripContractSpacerMarkersFromLine,
  isContractPageBreakLine,
  lineContainsContractPageBreakMarker,
  stripContractPageBreakMarkersFromLine,
} from "@workspace/contracts-domain";
import type { ContractOrgMediaKind } from "@workspace/contracts-domain";
import { absoluteAssetUrl, escapeHtml } from "./html-utils.js";

export interface ContractBodyFormatOptions {
  assetOrigin?: string;
  stampUrl?: string | null;
  signatureUrl?: string | null;
}

function resolveFormatOptions(
  options: ContractBodyFormatOptions | string,
): ContractBodyFormatOptions {
  if (typeof options === "string") {
    return { assetOrigin: options };
  }
  return options;
}

function resolveMediaSrc(src: string, assetOrigin: string): string {
  return absoluteAssetUrl(src, assetOrigin) ?? src;
}

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
    const absolute = resolveMediaSrc(src, assetOrigin);
    return `src="${escapeHtml(absolute)}"`;
  });
}

function collectOrgMediaMarkerBlock(
  lines: string[],
  startIndex: number,
): { stamp: boolean; signature: boolean; nextIndex: number } {
  let index = startIndex;
  let stamp = false;
  let signature = false;

  while (index < lines.length) {
    const trimmed = lines[index]?.trim() ?? "";
    if (!trimmed) {
      index += 1;
      continue;
    }
    if (isContractOrgStampLine(trimmed)) {
      stamp = true;
      index += 1;
      continue;
    }
    if (isContractOrgSignatureLine(trimmed)) {
      signature = true;
      index += 1;
      continue;
    }
    break;
  }

  return { stamp, signature, nextIndex: index };
}

function formatOrgMediaMarkerBlock(
  flags: { stamp: boolean; signature: boolean },
  options: ContractBodyFormatOptions,
): string {
  const assetOrigin = options.assetOrigin ?? "";
  const imgs: string[] = [];

  if (flags.stamp) {
    const stampImg = resolveOrgMediaImgHtml("stamp", options.stampUrl, assetOrigin);
    if (stampImg) {
      imgs.push(stampImg);
    }
  }
  if (flags.signature) {
    const signatureImg = resolveOrgMediaImgHtml("signature", options.signatureUrl, assetOrigin);
    if (signatureImg) {
      imgs.push(signatureImg);
    }
  }

  if (imgs.length === 0) {
    return "";
  }

  const rowClass = imgs.length > 1 ? " print-line--media-row" : "";
  return `<p class="print-line print-line--media${rowClass}">${imgs.join("")}</p>`;
}

function formatContractPageBreakHtml(): string {
  return `<div class="print-page-break" role="presentation"></div>`;
}

function collectPageBreakMarkerBlock(
  lines: string[],
  startIndex: number,
): { nextIndex: number } {
  let index = startIndex;

  while (index < lines.length) {
    const trimmed = lines[index]?.trim() ?? "";
    if (!trimmed) {
      index += 1;
      continue;
    }
    if (isContractPageBreakLine(trimmed)) {
      index += 1;
      continue;
    }
    break;
  }

  return { nextIndex: index };
}

function formatPageBreakMarkerLine(
  line: string,
  lines: string[],
  lineIndex: number,
  options: ContractBodyFormatOptions,
): { html: string; nextIndex: number } {
  const trimmed = line.trim();
  const remainder = stripContractPageBreakMarkersFromLine(line);
  const isPageBreakOnlyLine = isContractPageBreakLine(trimmed) && !remainder;

  if (isPageBreakOnlyLine) {
    const block = collectPageBreakMarkerBlock(lines, lineIndex);
    return {
      html: formatContractPageBreakHtml(),
      nextIndex: block.nextIndex,
    };
  }

  const parts: string[] = [formatContractPageBreakHtml()];
  if (remainder) {
    parts.push(formatBufferedContractLine(remainder, options));
  }
  return { html: parts.join(""), nextIndex: lineIndex + 1 };
}

function formatContractSpacerHtml(count: number): string {
  if (count <= 0) {
    return "";
  }
  const units = Array.from(
    { length: count },
    () => `<div class="print-spacer" role="presentation"></div>`,
  ).join("");
  return `<div class="print-spacer-block">${units}</div>`;
}

function collectSpacerMarkerBlock(
  lines: string[],
  startIndex: number,
): { count: number; nextIndex: number } {
  let index = startIndex;
  let count = 0;

  while (index < lines.length) {
    const trimmed = lines[index]?.trim() ?? "";
    if (!trimmed) {
      index += 1;
      continue;
    }
    if (isContractSpacerLine(trimmed)) {
      count += 1;
      index += 1;
      continue;
    }
    break;
  }

  return { count, nextIndex: index };
}

function formatSpacerMarkerLine(
  line: string,
  lines: string[],
  lineIndex: number,
  options: ContractBodyFormatOptions,
): { html: string; nextIndex: number } {
  const trimmed = line.trim();
  const remainder = stripContractSpacerMarkersFromLine(line);
  const isSpacerOnlyLine = isContractSpacerLine(trimmed) && !remainder;

  if (isSpacerOnlyLine) {
    const block = collectSpacerMarkerBlock(lines, lineIndex);
    return {
      html: formatContractSpacerHtml(block.count),
      nextIndex: block.nextIndex,
    };
  }

  const markerCount = (line.match(/\[\[kilo:spacer\]\]/g) ?? []).length;
  const parts: string[] = [];
  if (remainder) {
    parts.push(formatBufferedContractLine(remainder, options));
  }
  if (markerCount > 0) {
    parts.push(formatContractSpacerHtml(markerCount));
  }
  return { html: parts.join(""), nextIndex: lineIndex + 1 };
}

function formatOrgMediaMarkerLine(
  line: string,
  lines: string[],
  lineIndex: number,
  options: ContractBodyFormatOptions,
): { html: string; nextIndex: number } {
  const trimmed = line.trim();
  const remainder = stripContractOrgMediaMarkersFromLine(line);

  const isSingleMarkerOnlyLine =
    (isContractOrgStampLine(trimmed) || isContractOrgSignatureLine(trimmed)) && !remainder;

  if (isSingleMarkerOnlyLine) {
    const block = collectOrgMediaMarkerBlock(lines, lineIndex);
    return {
      html: formatOrgMediaMarkerBlock(block, options),
      nextIndex: block.nextIndex,
    };
  }

  const flags = orgMediaFlagsFromLineText(line);
  const parts: string[] = [];
  if (remainder) {
    parts.push(formatBufferedContractLine(remainder, options));
  }
  const mediaHtml = formatOrgMediaMarkerBlock(flags, options);
  if (mediaHtml) {
    parts.push(mediaHtml);
  }
  return { html: parts.join(""), nextIndex: lineIndex + 1 };
}

function formatBufferedContractLine(line: string, options: ContractBodyFormatOptions): string {
  if (lineContainsContractPageBreakMarker(line)) {
    const { html } = formatPageBreakMarkerLine(line, [line], 0, options);
    return html;
  }

  if (lineContainsContractSpacerMarker(line)) {
    const { html } = formatSpacerMarkerLine(line, [line], 0, options);
    return html;
  }

  if (lineContainsContractOrgMediaMarkers(line)) {
    const { html } = formatOrgMediaMarkerLine(line, [line], 0, options);
    return html;
  }

  return formatContractBodyLine(line, options);
}

function formatContractBodyLine(line: string, options: ContractBodyFormatOptions): string {
  const trimmed = line.trim();
  const assetOrigin = options.assetOrigin ?? "";

  const hasLegacyMedia =
    isLegacyContractOrgMediaLine(trimmed) || lineContainsLegacyContractOrgMedia(trimmed);
  const inner = formatLegacyContractOrgMediaLine(line, {
    escapeText: escapeHtml,
    resolveSrc: (src) => resolveMediaSrc(src, assetOrigin),
  });
  const lineClass = hasLegacyMedia ? "print-line print-line--media" : "print-line";
  return `<p class="${lineClass}">${inner}</p>`;
}

/** عنوان قسم في الطباعة: السطر بالكامل بين نجمتين *عنوان* */
export function parseContractSectionTitle(line: string): string | null {
  const trimmed = line.trim();
  const asteriskMatch = trimmed.match(/^\*(.+)\*$/);
  if (!asteriskMatch) return null;
  const title = asteriskMatch[1].trim();
  return title.length > 0 ? title : null;
}

export function formatContractBodyHtml(
  content: string,
  options: ContractBodyFormatOptions | string = "",
): string {
  const formatOptions = resolveFormatOptions(options);
  const normalized = normalizeRenderedContractContentForStorage(content.trim());
  const lines = normalized.split(/\r?\n/);
  const sections: string[] = [];
  let buffer: string[] = [];

  const flush = () => {
    if (buffer.length === 0) return;
    sections.push(
      `<div class="print-section">${buffer
        .map((bufferLine) => formatBufferedContractLine(bufferLine, formatOptions))
        .join("")}</div>`,
    );
    buffer = [];
  };

  let index = 0;
  while (index < lines.length) {
    const raw = lines[index];
    const line = raw.trim();
    index += 1;

    if (!line) {
      flush();
      continue;
    }
    if (line === "عقد تأجير مركبة") continue;

    const sectionTitle = parseContractSectionTitle(line);
    if (sectionTitle) {
      flush();
      sections.push(`<h3 class="print-section-title">${escapeHtml(sectionTitle)}</h3>`);
      continue;
    }

    if (isLegacyContractOrgMediaLine(line) || lineContainsLegacyContractOrgMedia(line)) {
      flush();
      sections.push(formatContractBodyLine(line, formatOptions));
      continue;
    }

    if (lineContainsContractPageBreakMarker(line)) {
      flush();
      const { html, nextIndex } = formatPageBreakMarkerLine(
        line,
        lines,
        index - 1,
        formatOptions,
      );
      if (html) {
        sections.push(html);
      }
      index = nextIndex;
      continue;
    }

    if (lineContainsContractSpacerMarker(line)) {
      flush();
      const { html, nextIndex } = formatSpacerMarkerLine(
        line,
        lines,
        index - 1,
        formatOptions,
      );
      if (html) {
        sections.push(html);
      }
      index = nextIndex;
      continue;
    }

    if (lineContainsContractOrgMediaMarkers(line)) {
      flush();
      const { html, nextIndex } = formatOrgMediaMarkerLine(line, lines, index - 1, formatOptions);
      if (html) {
        sections.push(html);
      }
      index = nextIndex;
      continue;
    }

    buffer.push(line);
  }
  flush();

  return applyContractOrgMediaDisplayStyles(
    `<div class="print-contract-body">${sections.join("")}</div>`,
  );
}
