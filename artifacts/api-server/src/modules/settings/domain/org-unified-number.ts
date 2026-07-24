import {
  resolveEstablishmentNumberFromBody,
  validateEstablishmentNumberSuffixPut,
} from "@workspace/establishments-domain";

export function validateSettingsUnifiedNumber(
  unifiedNumber: string | null | undefined,
): string | null {
  return validateEstablishmentNumberSuffixPut(unifiedNumber);
}

export function resolveSettingsUnifiedNumber(
  unifiedNumberSuffix: string | null | undefined,
): string | null {
  if (unifiedNumberSuffix === null || !unifiedNumberSuffix?.trim()) {
    return null;
  }
  return resolveEstablishmentNumberFromBody(unifiedNumberSuffix.trim());
}
