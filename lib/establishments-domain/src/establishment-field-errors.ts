export const ESTABLISHMENT_BODY_INVALID = "بيانات المنشأة غير صالحة";

export const ESTABLISHMENT_FIELD_ERRORS = {
  name: "اسم المنشأة مطلوب",
  clientType: "نوع المنشأة مطلوب",
  establishmentNumber: "رقم المنشأة في وزارة الداخلية مطلوب",
  establishmentNumberInvalid: "رقم المنشأة غير صالح (700 متبوعاً بـ 7 أرقام)",
} as const;

export const ESTABLISHMENT_DUPLICATE_ERRORS = {
  establishmentNumber: "رقم المنشأة مسجّل مسبقاً في هذه المنشأة",
} as const;

export const ESTABLISHMENT_DUPLICATE_FALLBACK = "قيمة مكررة";

export const ESTABLISHMENT_UNIQUE_INDEXES = {
  establishments_org_establishment_number_uidx: "establishmentNumber",
} as const;

export function messageForEstablishmentUniqueViolation(
  constraint: string | undefined,
): string {
  const field =
    constraint && constraint in ESTABLISHMENT_UNIQUE_INDEXES
      ? ESTABLISHMENT_UNIQUE_INDEXES[
          constraint as keyof typeof ESTABLISHMENT_UNIQUE_INDEXES
        ]
      : null;
  if (field === "establishmentNumber") {
    return ESTABLISHMENT_DUPLICATE_ERRORS.establishmentNumber;
  }
  return ESTABLISHMENT_DUPLICATE_FALLBACK;
}
