export const CORRESPONDENCE_BODY_INVALID = "CORRESPONDENCE_BODY_INVALID";
export const CORRESPONDENCE_TEMPLATE_BODY_INVALID = "CORRESPONDENCE_TEMPLATE_BODY_INVALID";

export const CORRESPONDENCE_FIELD_ERRORS = {
  establishmentId: "اختر منشأة العميل",
  subject: "عنوان الرسالة مطلوب",
  body: "نص الرسالة مطلوب",
} as const;

export const CORRESPONDENCE_TEMPLATE_FIELD_ERRORS = {
  name: "اسم القالب مطلوب",
  subject: "عنوان القالب مطلوب",
  body: "محتوى القالب مطلوب",
} as const;
