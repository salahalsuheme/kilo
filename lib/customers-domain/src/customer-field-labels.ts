/** Arabic UI labels for customer fields — single source for forms and list tables. */
export const CUSTOMER_FIELD_LABELS = {
  name: "اسم السائق",
  establishmentName: "اسم المنشأة",
  establishmentNumber: "رقم المنشأة في وزارة الداخلية",
} as const;

/** يُعرض تحت حقل رقم وزارة الداخلية في نموذج العميل. */
export const CUSTOMER_FIELD_HINTS = {
  establishmentNumber:
    "يمكن تكرار الرقم لعدة سائقين تابعين لنفس المنشأة",
} as const;
