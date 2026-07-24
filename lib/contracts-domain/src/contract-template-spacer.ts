/** Embedded in rendered contract text; resolved to vertical space at print/preview time. */
export const CONTRACT_SPACER_LINE = "[[kilo:spacer]]";

/** ارتفاع كل وحدة فراغ (يمكن تكرار {{contract.spacer}} في سطور متتالية). */
export const CONTRACT_SPACER_MIN_HEIGHT_MM = 40;

export function buildContractSpacerTemplateLine(): string {
  return CONTRACT_SPACER_LINE;
}

export function isContractSpacerLine(line: string): boolean {
  return line.trim() === CONTRACT_SPACER_LINE;
}

export function lineContainsContractSpacerMarker(line: string): boolean {
  return line.includes(CONTRACT_SPACER_LINE);
}

export function stripContractSpacerMarkersFromLine(line: string): string {
  return line.split(CONTRACT_SPACER_LINE).join("").trim();
}
