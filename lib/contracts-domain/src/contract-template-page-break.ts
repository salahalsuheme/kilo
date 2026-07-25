/** Embedded in rendered contract text; forces the following content onto a new printed page. */
export const CONTRACT_PAGE_BREAK_LINE = "[[kilo:page-break]]";

export function buildContractPageBreakTemplateLine(): string {
  return CONTRACT_PAGE_BREAK_LINE;
}

export function isContractPageBreakLine(line: string): boolean {
  return line.trim() === CONTRACT_PAGE_BREAK_LINE;
}

export function lineContainsContractPageBreakMarker(line: string): boolean {
  return line.includes(CONTRACT_PAGE_BREAK_LINE);
}

export function stripContractPageBreakMarkersFromLine(line: string): string {
  return line.split(CONTRACT_PAGE_BREAK_LINE).join("").trim();
}
