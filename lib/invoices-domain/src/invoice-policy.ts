import type { InvoiceStatus } from "./types.js";
import { PENALTY_INVOICE_SEQ } from "./invoice-constants.js";

export function isPenaltyInvoice(invoiceSeq: number): boolean {
  return invoiceSeq === PENALTY_INVOICE_SEQ;
}

export function canEditPenaltyInvoice(invoiceSeq: number, status: InvoiceStatus): boolean {
  return isPenaltyInvoice(invoiceSeq) && status === "draft";
}

export function canMarkPenaltyInvoicePaid(invoiceSeq: number, status: InvoiceStatus): boolean {
  return isPenaltyInvoice(invoiceSeq) && status === "draft";
}
