import {
  mergeNationalAddress,
  normalizeNationalAddress,
  validateNationalAddress,
  type NationalAddress,
} from "@workspace/settings-domain";

export function mapNationalAddressRow(row: {
  nationalAddressRegion: string | null;
  nationalAddressCity: string | null;
  nationalAddressDistrict: string | null;
  nationalAddressStreet: string | null;
  nationalAddressBuildingNumber: string | null;
  nationalAddressAdditionalNumber: string | null;
  nationalAddressPostalCode: string | null;
  nationalAddressShortAddress: string | null;
}): NationalAddress {
  return normalizeNationalAddress({
    region: row.nationalAddressRegion,
    city: row.nationalAddressCity,
    district: row.nationalAddressDistrict,
    street: row.nationalAddressStreet,
    buildingNumber: row.nationalAddressBuildingNumber,
    additionalNumber: row.nationalAddressAdditionalNumber,
    postalCode: row.nationalAddressPostalCode,
    shortAddress: row.nationalAddressShortAddress,
  });
}

export function validateSettingsNationalAddress(
  address: NationalAddress,
): string | null {
  return validateNationalAddress(address);
}

export function mergeSettingsNationalAddress(
  current: NationalAddress,
  patch: Partial<NationalAddress> | undefined,
): NationalAddress {
  if (!patch) return current;
  return mergeNationalAddress(current, patch);
}
