import type { InvoiceType } from "@workspace/customers-domain";

/** ZATCA-aligned invoice titles for print layout. */
export const ZATCA_INVOICE_TITLES: Record<InvoiceType, string> = {
  simplified: "فاتورة ضريبية مبسطة",
  standard: "فاتورة ضريبية",
};

export const ZATCA_INVOICE_TITLES_EN: Record<InvoiceType, string> = {
  simplified: "Simplified Tax Invoice",
  standard: "Tax Invoice",
};
