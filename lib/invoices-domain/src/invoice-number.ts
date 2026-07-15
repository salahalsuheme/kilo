import { formatContractNumber } from "@workspace/contracts-domain";

function formatDocumentSegment(prefix: string, seq: number): string {
  return `${prefix}${String(seq).padStart(2, "0")}`;
}

export { formatContractNumber };

/** CT01-IN01-2026 */
export function formatInvoiceNumber(
  contractSeq: number,
  invoiceSeq: number,
  year: number,
): string {
  return `${formatContractNumber(contractSeq)}-${formatDocumentSegment("IN", invoiceSeq)}-${year}`;
}
