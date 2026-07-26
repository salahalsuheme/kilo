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
import {
  buildPutNotificationEmailSettingsFields,
  isNotificationEmailSettingsDirty,
  notificationEmailSettingsToDraft,
  validateNotificationEmailSettingsDraftForDelivery,
  type NotificationEmailSettings,
  type NotificationEmailSettingsDraft,
  type PutNotificationEmailSettingsFields,
} from "./notification-email-settings.js";
import type { CorrespondenceEmailDeliveryMode } from "./correspondence-email-delivery.js";

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

export interface NotificationSettingsDraft extends NotificationEmailSettingsDraft {
  notificationEmailEnabled: boolean;
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

export type NotificationSettingsPatch = {
  notificationEmailEnabled: boolean;
  notificationEmail?: PutNotificationEmailSettingsFields;
};

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

export function buildNotificationSettingsDraftFromSaved(
  saved: SavedNotificationSettings,
): NotificationSettingsDraft {
  return {
    notificationEmailEnabled: saved.notificationEmailEnabled,
    ...notificationEmailSettingsToDraft(saved.notificationEmail),
  };
}

export function validateNotificationSettingsDraft(
  draft: NotificationSettingsDraft,
  saved: SavedNotificationSettings,
  deliveryMode: CorrespondenceEmailDeliveryMode = "smtp",
): string | null {
  return validateNotificationEmailSettingsDraftForDelivery(
    draft.notificationEmailEnabled,
    draft,
    saved.notificationEmail,
    deliveryMode,
  );
}

export function buildNotificationSettingsPatch(
  draft: NotificationSettingsDraft,
  saved: SavedNotificationSettings,
): NotificationSettingsPatch {
  const patch: NotificationSettingsPatch = {
    notificationEmailEnabled: draft.notificationEmailEnabled,
  };
  if (draft.notificationEmailEnabled) {
    patch.notificationEmail = buildPutNotificationEmailSettingsFields(
      draft,
      saved.notificationEmail,
    );
  }
  return patch;
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

export interface SavedNotificationSettings {
  notificationEmailEnabled: boolean;
  notificationEmail: NotificationEmailSettings;
}

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
  if (draft.notificationEmailEnabled !== saved.notificationEmailEnabled) {
    return true;
  }
  if (!draft.notificationEmailEnabled) {
    return false;
  }
  return isNotificationEmailSettingsDirty(draft, saved.notificationEmail);
}
