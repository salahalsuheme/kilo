export interface NationalAddress {
  region: string | null;
  city: string | null;
  district: string | null;
  street: string | null;
  buildingNumber: string | null;
  additionalNumber: string | null;
  postalCode: string | null;
  shortAddress: string | null;
}

export const EMPTY_NATIONAL_ADDRESS: NationalAddress = {
  region: null,
  city: null,
  district: null,
  street: null,
  buildingNumber: null,
  additionalNumber: null,
  postalCode: null,
  shortAddress: null,
};

export const NATIONAL_ADDRESS_FIELD_LABELS = {
  region: "المنطقة",
  city: "المدينة",
  district: "الحي",
  street: "الشارع",
  buildingNumber: "رقم المبنى",
  additionalNumber: "الرقم الإضافي",
  postalCode: "الرمز البريدي",
  shortAddress: "العنوان المختصر",
} as const satisfies Record<keyof NationalAddress, string>;

export const NATIONAL_ADDRESS_FIELD_ORDER = [
  "region",
  "city",
  "district",
  "street",
  "buildingNumber",
  "additionalNumber",
  "postalCode",
  "shortAddress",
] as const satisfies readonly (keyof NationalAddress)[];

function trimToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeNationalAddress(
  input: Partial<Record<keyof NationalAddress, string | null | undefined>>,
): NationalAddress {
  return {
    region: trimToNull(input.region),
    city: trimToNull(input.city),
    district: trimToNull(input.district),
    street: trimToNull(input.street),
    buildingNumber: trimToNull(input.buildingNumber),
    additionalNumber: trimToNull(input.additionalNumber),
    postalCode: trimToNull(input.postalCode),
    shortAddress: trimToNull(input.shortAddress)?.toUpperCase() ?? null,
  };
}

export function mergeNationalAddress(
  current: NationalAddress,
  patch: Partial<Record<keyof NationalAddress, string | null | undefined>>,
): NationalAddress {
  return normalizeNationalAddress({ ...current, ...patch });
}

export function validateNationalAddress(address: NationalAddress): string | null {
  if (address.buildingNumber && !/^\d{4}$/.test(address.buildingNumber)) {
    return "رقم المبنى يجب أن يكون 4 أرقام";
  }
  if (address.additionalNumber && !/^\d{4}$/.test(address.additionalNumber)) {
    return "الرقم الإضافي يجب أن يكون 4 أرقام";
  }
  if (address.postalCode && !/^\d{5}$/.test(address.postalCode)) {
    return "الرمز البريدي يجب أن يكون 5 أرقام";
  }
  if (address.shortAddress && !/^[A-Z]{4}\d{4}$/.test(address.shortAddress)) {
    return "العنوان المختصر يجب أن يكون 4 حروف إنجليزية ثم 4 أرقام";
  }
  return null;
}

export function hasNationalAddress(address: NationalAddress): boolean {
  return NATIONAL_ADDRESS_FIELD_ORDER.some((key) => address[key] != null);
}

export function formatNationalAddressLines(address: NationalAddress): string[] {
  if (!hasNationalAddress(address)) return [];

  const lines: string[] = [];
  const locality = [address.region, address.city, address.district].filter(Boolean).join("، ");
  const streetLine = [address.street, address.buildingNumber ? `مبنى ${address.buildingNumber}` : null]
    .filter(Boolean)
    .join(" — ");

  if (locality) lines.push(locality);
  if (streetLine) lines.push(streetLine);

  const codes = [
    address.postalCode ? `الرمز البريدي: ${address.postalCode}` : null,
    address.additionalNumber ? `الرقم الإضافي: ${address.additionalNumber}` : null,
    address.shortAddress ? `العنوان المختصر: ${address.shortAddress}` : null,
  ].filter(Boolean);

  if (codes.length > 0) {
    lines.push(codes.join(" — "));
  }

  return lines;
}
