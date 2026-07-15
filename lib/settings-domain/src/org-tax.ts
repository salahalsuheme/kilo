import {
  isValidZatcaVatNumber,
  normalizeTaxNumber,
} from "@workspace/customers-domain";

/** Optional org VAT number; when set must be a valid ZATCA registration. */
export function validateOrgTaxNumber(taxNumber: string | null | undefined): string | null {
  const normalized = normalizeTaxNumber(taxNumber);
  if (!normalized) {
    return null;
  }
  if (!isValidZatcaVatNumber(normalized)) {
    return "الرقم الضريبي غير صالح (15 رقماً يبدأ وينتهي بـ 3)";
  }
  return null;
}

export function resolveOrgTaxNumber(taxNumber: string | null | undefined): string | null {
  return normalizeTaxNumber(taxNumber);
}
