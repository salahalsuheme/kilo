/** Ministry of Interior establishment number prefix (الرقم الوطني الموحد). */
export const ESTABLISHMENT_NUMBER_PREFIX = "700";

/** Digits after the 700 prefix (10 digits total). */
export const ESTABLISHMENT_NUMBER_SUFFIX_LENGTH = 7;

export function stripEstablishmentNumberSuffix(
  establishmentNumber: string | null | undefined,
): string {
  const value = establishmentNumber?.trim() ?? "";
  if (!value) return "";
  if (value.startsWith(ESTABLISHMENT_NUMBER_PREFIX)) {
    return value.slice(ESTABLISHMENT_NUMBER_PREFIX.length);
  }
  return value;
}

export function normalizeEstablishmentNumber(
  suffix: string | null | undefined,
): string | null {
  const digits = (suffix ?? "").replace(/\D/g, "");
  if (!digits) return null;
  return `${ESTABLISHMENT_NUMBER_PREFIX}${digits}`;
}

export function isValidEstablishmentNumber(value: string): boolean {
  return new RegExp(
    `^${ESTABLISHMENT_NUMBER_PREFIX}\\d{${ESTABLISHMENT_NUMBER_SUFFIX_LENGTH}}$`,
  ).test(value.trim());
}
