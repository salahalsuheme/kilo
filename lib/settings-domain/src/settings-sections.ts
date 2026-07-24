import {
  stripEstablishmentNumberSuffix,
} from "@workspace/establishments-domain";
import { resolveOrgTaxNumber, validateOrgTaxNumber } from "./org-tax.js";
import {
  unifiedNumberDraftToPutSuffix,
  validateOrgUnifiedNumberDraft,
} from "./org-unified-number.js";
import {
  NATIONAL_ADDRESS_FIELD_ORDER,
  normalizeNationalAddress,
  validateNationalAddress,
  type NationalAddress,
} from "./national-address.js";

export interface CompanySettingsDraft {
  businessName: string;
  /** Full unified number (700 + 7 digits) or empty when unset. */
  unifiedNumber: string;
}

export interface TaxSettingsDraft {
  taxEnabled: boolean;
  taxRate: number;
  taxNumber: string;
}

export interface NotificationSettingsDraft {
  notificationEmailEnabled: boolean;
  notificationSmsEnabled: boolean;
}

export type CompanySettingsPatch = Pick<CompanySettingsDraft, "businessName"> & {
  /** OpenAPI PutSettingsBody.unifiedNumber — suffix after 700, or null to clear. */
  unifiedNumber: string | null;
};

export type TaxSettingsPatch = {
  taxEnabled: boolean;
  taxRate: number;
  taxNumber: string | null;
};

export type NotificationSettingsPatch = NotificationSettingsDraft;

export type NationalAddressSettingsPatch = {
  nationalAddress: NationalAddress;
};

export function validateCompanySettingsDraft(draft: CompanySettingsDraft): string | null {
  if (!draft.businessName.trim()) {
    return "اسم الشركة مطلوب";
  }
  return validateOrgUnifiedNumberDraft(draft.unifiedNumber);
}

export function buildCompanySettingsPatch(draft: CompanySettingsDraft): CompanySettingsPatch {
  return {
    businessName: draft.businessName.trim(),
    unifiedNumber: unifiedNumberDraftToPutSuffix(draft.unifiedNumber),
  };
}

export function validateTaxSettingsDraft(draft: TaxSettingsDraft): string | null {
  if (!Number.isFinite(draft.taxRate) || draft.taxRate < 0 || draft.taxRate > 100) {
    return "نسبة الضريبة يجب أن تكون بين 0 و 100";
  }
  return validateOrgTaxNumber(draft.taxNumber.trim() || null);
}

export function buildTaxSettingsPatch(draft: TaxSettingsDraft): TaxSettingsPatch {
  return {
    taxEnabled: draft.taxEnabled,
    taxRate: draft.taxRate,
    taxNumber: resolveOrgTaxNumber(draft.taxNumber.trim() || null),
  };
}

export function validateNationalAddressSettingsDraft(
  draft: NationalAddress,
): string | null {
  return validateNationalAddress(normalizeNationalAddress(draft));
}

export function buildNationalAddressSettingsPatch(
  draft: NationalAddress,
): NationalAddressSettingsPatch {
  return { nationalAddress: normalizeNationalAddress(draft) };
}

export function buildNotificationSettingsPatch(
  draft: NotificationSettingsDraft,
): NotificationSettingsPatch {
  return {
    notificationEmailEnabled: draft.notificationEmailEnabled,
    notificationSmsEnabled: draft.notificationSmsEnabled,
  };
}

export interface SavedCompanySettings {
  businessName: string;
  unifiedNumber: string | null;
}

export interface SavedTaxSettings {
  taxEnabled: boolean;
  taxRate: number;
  taxNumber: string | null;
}

export type SavedNotificationSettings = NotificationSettingsDraft;

export function isCompanySettingsDirty(
  draft: CompanySettingsDraft,
  saved: SavedCompanySettings,
): boolean {
  const patch = buildCompanySettingsPatch(draft);
  const savedSuffix = saved.unifiedNumber
    ? stripEstablishmentNumberSuffix(saved.unifiedNumber)
    : null;
  return (
    patch.businessName !== saved.businessName ||
    (patch.unifiedNumber ?? "") !== (savedSuffix ?? "")
  );
}

export function isTaxSettingsDirty(
  draft: TaxSettingsDraft,
  saved: SavedTaxSettings,
): boolean {
  const patch = buildTaxSettingsPatch(draft);
  return (
    patch.taxEnabled !== saved.taxEnabled ||
    patch.taxRate !== saved.taxRate ||
    (patch.taxNumber ?? "") !== (saved.taxNumber ?? "")
  );
}

export function isNationalAddressSettingsDirty(
  draft: NationalAddress,
  saved: NationalAddress,
): boolean {
  const normalizedDraft = normalizeNationalAddress(draft);
  const normalizedSaved = normalizeNationalAddress(saved);
  return NATIONAL_ADDRESS_FIELD_ORDER.some(
    (field) => normalizedDraft[field] !== normalizedSaved[field],
  );
}

export function isNotificationSettingsDirty(
  draft: NotificationSettingsDraft,
  saved: SavedNotificationSettings,
): boolean {
  return (
    draft.notificationEmailEnabled !== saved.notificationEmailEnabled ||
    draft.notificationSmsEnabled !== saved.notificationSmsEnabled
  );
}
