export {
  SETTINGS_SAVE_LABEL,
  SETTINGS_SAVING_LABEL,
  SETTINGS_UNSAVED_LABEL,
} from "./settings-labels.js";
export {
  buildCompanySettingsPatch,
  buildNationalAddressSettingsPatch,
  buildNotificationSettingsPatch,
  buildNotificationSettingsDraftFromSaved,
  buildTaxSettingsPatch,
  isCompanySettingsDirty,
  isNationalAddressSettingsDirty,
  isNotificationSettingsDirty,
  isTaxSettingsDirty,
  validateCompanySettingsDraft,
  validateNationalAddressSettingsDraft,
  validateNotificationSettingsDraft,
  validateTaxSettingsDraft,
  type CompanySettingsDraft,
  type CompanySettingsPatch,
  type NationalAddressSettingsPatch,
  type NotificationSettingsDraft,
  type NotificationSettingsPatch,
  type SavedCompanySettings,
  type SavedNotificationSettings,
  type SavedTaxSettings,
  type TaxSettingsDraft,
  type TaxSettingsPatch,
} from "./settings-sections.js";
export {
  resolveOrgBusinessNameDisplay,
} from "./org-business-name.js";
export {
  resolveOrgTaxNumber,
  validateOrgTaxNumber,
} from "./org-tax.js";
export {
  PutCompanySettingsFieldsSchema,
  PutSettingsUnifiedNumberSchema,
  type PutCompanySettingsFieldsInput,
} from "./company-settings.schema.js";
export {
  draftToEstablishmentNumberSuffix,
  resolveOrgUnifiedNumberFromPutSuffix,
  resolveOrgUnifiedNumberFromStorage,
  unifiedNumberDraftToPutSuffix,
  validateOrgUnifiedNumberDraft,
} from "./org-unified-number.js";
export {
  EMPTY_NATIONAL_ADDRESS,
  NATIONAL_ADDRESS_FIELD_LABELS,
  NATIONAL_ADDRESS_FIELD_ORDER,
  formatNationalAddressLines,
  hasNationalAddress,
  mergeNationalAddress,
  normalizeNationalAddress,
  validateNationalAddress,
  type NationalAddress,
} from "./national-address.js";
export {
  EMPTY_NOTIFICATION_EMAIL_SETTINGS,
  NOTIFICATION_EMAIL_FIELD_LABELS,
  mergeNotificationEmailSettings,
  normalizeNotificationEmailSettings,
  resolveNotificationSmtpPassword,
  resolveNotificationSmtpTransport,
  validateSettingsNotificationEmail,
  type NotificationEmailRow,
  type NotificationEmailSettings,
  type NotificationEmailSettingsDraft,
} from "./notification-email-settings.js";
export {
  buildNotificationMailHeaders,
  describeNotificationEmailDeliverability,
  resolveNotificationMailIdentity,
} from "./notification-email-deliverability.js";
