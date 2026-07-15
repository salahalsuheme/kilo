import type { CustomerType } from "./types.js";

export type InvoiceType = "simplified" | "standard";

export const INVOICE_TYPE_LABELS: Record<InvoiceType, string> = {
  simplified: "فاتورة مبسطة",
  standard: "فاتورة قياسية",
};

/**
 * ZATCA-aligned invoice classification for customer master data.
 *
 * - Individual, or any client without a tax number → simplified (B2C / no VAT ID).
 * - Institution, company, or government with a valid tax number → standard (B2B).
 * - Individual with a tax number remains simplified per Saudi practice.
 */
export function deriveInvoiceType(
  clientType: CustomerType,
  hasTaxNumber: boolean,
  taxNumber: string | null | undefined,
): InvoiceType {
  const normalizedTaxNumber = normalizeTaxNumber(taxNumber);
  if (!hasTaxNumber || !normalizedTaxNumber) {
    return "simplified";
  }
  if (clientType === "individual") {
    return "simplified";
  }
  return "standard";
}

export function normalizeTaxNumber(taxNumber: string | null | undefined): string | null {
  const value = taxNumber?.trim() ?? "";
  return value.length > 0 ? value : null;
}

/** ZATCA VAT registration: 15 digits, starts and ends with 3. */
export function isValidZatcaVatNumber(taxNumber: string): boolean {
  return /^3\d{13}3$/.test(taxNumber.trim());
}

export function validateCustomerTaxInput(
  hasTaxNumber: boolean,
  taxNumber: string | null | undefined,
): string | null {
  if (!hasTaxNumber) {
    return null;
  }
  const normalized = normalizeTaxNumber(taxNumber);
  if (!normalized) {
    return "الرقم الضريبي مطلوب عند تفعيل الخيار";
  }
  if (!isValidZatcaVatNumber(normalized)) {
    return "الرقم الضريبي غير صالح (15 رقماً يبدأ وينتهي بـ 3)";
  }
  return null;
}
