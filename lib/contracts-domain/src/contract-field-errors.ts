export const CONTRACT_FIELD_ERRORS = {
  customerId: "اسم السائق مطلوب",
  establishmentId: "المنشأة مطلوبة",
  carId: "المركبة مطلوبة",
  templateId: "قالب العقد مطلوب",
  startAt: "تاريخ ووقت بداية العقد مطلوب",
  endAt: "تاريخ ووقت نهاية العقد مطلوب",
  endBeforeStart: "تاريخ النهاية يجب أن يكون بعد تاريخ البداية",
  amountExVat: "قيمة العقد مطلوبة",
  totalInclVat: "قيمة العقد مطلوبة",
  amountPositive: "قيمة العقد يجب أن تكون أكبر من صفر",
  authorizationNumber: "رقم التفويض مطلوب",
} as const;

export const SIGNED_CONTRACT_ATTACHMENT_ERRORS = {
  missing: "لا يوجد عقد موقع مرفوع",
  unsupportedType: "نوع الملف غير مدعوم. يُقبل PDF أو صور",
  tooLarge: "حجم الملف كبير جداً (الحد الأقصى 10 ميجابايت)",
} as const;

export const VEHICLE_DAMAGE_FORM_ERRORS = {
  notFound: "لا يوجد محضر استلام مركبة",
  emptyMarkers: "أضف نقطة واحدة على الأقل لحفظ المحضر",
  receiptLocked: "محضر الاستلام مقفل بعد تنشيط العقد",
} as const;

export const VEHICLE_DELIVERY_DAMAGE_FORM_ERRORS = {
  notFound: "لا يوجد محضر تسليم مركبة",
  emptyMarkers: "أضف نقطة واحدة على الأقل لحفظ المحضر",
  notAllowed: "محضر التسليم يتاح بعد حفظ محضر الاستلام وتنشيط العقد",
} as const;

export const CONTRACT_BODY_INVALID = "بيانات العقد غير صالحة";
export const CONTRACT_TEMPLATE_BODY_INVALID = "بيانات قالب العقد غير صالحة";

export const CONTRACT_TEMPLATE_FIELD_ERRORS = {
  name: "اسم القالب مطلوب",
  body: "محتوى القالب مطلوب",
} as const;
