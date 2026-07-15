export const CUSTOMER_UNIQUE_INDEXES = {
  idNumber: "customers_org_id_number_uidx",
  licenseNumber: "customers_org_license_number_uidx",
} as const;

export const CUSTOMER_DUPLICATE_ERRORS = {
  idNumber: "رقم الهوية مسجل مسبقاً",
  licenseNumber: "رقم الرخصة مسجل مسبقاً",
} as const;

export const CUSTOMER_DUPLICATE_FALLBACK = "بيانات العميل مسجلة مسبقاً";

const CONSTRAINT_TO_MESSAGE: Record<string, string> = {
  [CUSTOMER_UNIQUE_INDEXES.idNumber]: CUSTOMER_DUPLICATE_ERRORS.idNumber,
  [CUSTOMER_UNIQUE_INDEXES.licenseNumber]: CUSTOMER_DUPLICATE_ERRORS.licenseNumber,
};

export function messageForCustomerUniqueViolation(constraint?: string): string {
  if (!constraint) return CUSTOMER_DUPLICATE_FALLBACK;
  return CONSTRAINT_TO_MESSAGE[constraint] ?? CUSTOMER_DUPLICATE_FALLBACK;
}
