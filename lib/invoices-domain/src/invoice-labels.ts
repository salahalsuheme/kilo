import type { InvoiceStatus } from "./types.js";

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "مسودة",
  paid: "مدفوعة",
};

export function invoiceStatusBadgeClass(status: InvoiceStatus): string {
  if (status === "draft") {
    return "bg-amber-500/10 text-amber-700 border-amber-200";
  }
  return "bg-green-500/10 text-green-700 border-green-200";
}
