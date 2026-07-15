export const CONTRACT_FIELD_ERRORS = {
  customerId: "اسم العميل مطلوب",
  carId: "المركبة مطلوبة",
  templateId: "قالب العقد مطلوب",
  startAt: "تاريخ ووقت بداية العقد مطلوب",
  endAt: "تاريخ ووقت نهاية العقد مطلوب",
  endBeforeStart: "تاريخ النهاية يجب أن يكون بعد تاريخ البداية",
  amountExVat: "قيمة العقد مطلوبة",
  amountPositive: "قيمة العقد يجب أن تكون أكبر من صفر",
} as const;

export const CONTRACT_BODY_INVALID = "بيانات العقد غير صالحة";
export const CONTRACT_TEMPLATE_BODY_INVALID = "بيانات قالب العقد غير صالحة";

export const CONTRACT_TEMPLATE_FIELD_ERRORS = {
  name: "اسم القالب مطلوب",
  body: "محتوى القالب مطلوب",
} as const;
