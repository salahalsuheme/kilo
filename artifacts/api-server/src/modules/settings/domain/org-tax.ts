import { resolveOrgTaxNumber, validateOrgTaxNumber } from "@workspace/settings-domain";

export function validateSettingsTaxNumber(taxNumber: string | null | undefined): string | null {
  return validateOrgTaxNumber(taxNumber);
}

export function resolveSettingsTaxNumber(taxNumber: string | null | undefined): string | null {
  return resolveOrgTaxNumber(taxNumber);
}
