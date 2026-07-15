function formatDocumentSegment(prefix: string, seq: number): string {
  return `${prefix}${String(seq).padStart(2, "0")}`;
}

/** CT01 */
export function formatContractNumber(contractSeq: number): string {
  return formatDocumentSegment("CT", contractSeq);
}

/** CT01-2026 */
export function formatContractNumberWithYear(contractSeq: number, year: number): string {
  return `${formatContractNumber(contractSeq)}-${year}`;
}
