import type { BillingCycle, FinanceInvoiceStatus } from "./types.js";

export const FINANCE_INVOICE_STATUS_LABELS: Record<FinanceInvoiceStatus, string> = {
  draft: "مسودة",
  paid: "مدفوعة",
};

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  monthly: "شهري",
  yearly: "سنوي",
};

export function financeInvoiceStatusBadgeClass(status: FinanceInvoiceStatus): string {
  if (status === "draft") {
    return "bg-amber-500/10 text-amber-700 border-amber-200";
  }
  return "bg-green-500/10 text-green-700 border-green-200";
}

export function formatInvoiceDate(value: string): string {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(`${value}T00:00:00`));
}
