import type { CustomerType } from "./types.js";

/** Ministry of Interior establishment number prefix (الرقم الوطني الموحد). */
export const ESTABLISHMENT_NUMBER_PREFIX = "700";

/** Digits after the 700 prefix (10 digits total). */
export const ESTABLISHMENT_NUMBER_SUFFIX_LENGTH = 7;

export function isNonIndividualClientType(clientType: CustomerType): boolean {
  return clientType !== "individual";
}

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

export function formatCustomerDisplayName(
  name: string,
  establishmentName: string | null | undefined,
): string {
  const trimmedEstablishment = establishmentName?.trim() ?? "";
  if (!trimmedEstablishment) return name;
  return `${trimmedEstablishment} - ${name}`;
}

export function validateEstablishmentInput(
  clientType: CustomerType,
  establishmentName: string | null | undefined,
  establishmentNumberSuffix: string | null | undefined,
): { establishmentName?: string; establishmentNumber?: string } | string {
  if (!isNonIndividualClientType(clientType)) {
    return { establishmentName: undefined, establishmentNumber: undefined };
  }

  const trimmedName = establishmentName?.trim() ?? "";
  if (!trimmedName) {
    return "اسم المنشأة مطلوب";
  }

  const normalizedNumber = normalizeEstablishmentNumber(establishmentNumberSuffix);
  if (!normalizedNumber) {
    return "رقم المنشأة في وزارة الداخلية مطلوب";
  }
  if (!isValidEstablishmentNumber(normalizedNumber)) {
    return `رقم المنشأة غير صالح (${ESTABLISHMENT_NUMBER_PREFIX} متبوعاً بـ ${ESTABLISHMENT_NUMBER_SUFFIX_LENGTH} أرقام)`;
  }

  return {
    establishmentName: trimmedName,
    establishmentNumber: normalizedNumber,
  };
}

export function resolveEstablishmentFields(
  clientType: CustomerType,
  establishmentName: string | null | undefined,
  establishmentNumberSuffix: string | null | undefined,
): { establishmentName: string | null; establishmentNumber: string | null } {
  const result = validateEstablishmentInput(
    clientType,
    establishmentName,
    establishmentNumberSuffix,
  );
  if (typeof result === "string") {
    return { establishmentName: null, establishmentNumber: null };
  }
  return {
    establishmentName: result.establishmentName ?? null,
    establishmentNumber: result.establishmentNumber ?? null,
  };
}
