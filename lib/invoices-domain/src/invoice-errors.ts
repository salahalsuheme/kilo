export const INVOICE_ERRORS = {
  notFound: "الفاتورة غير موجودة",
  editOnlyPenaltyDraft: "يمكن تعديل مسودة فاتورة الغرامة فقط",
  markPaidOnlyPenaltyDraft: "يمكن تسجيل الدفع لفاتورة غرامة مسودة فقط",
  invalidStatusTransition: "لا يمكن تغيير حالة الفاتورة بهذه الطريقة",
} as const;

export const INVOICE_BODY_INVALID = "بيانات الفاتورة غير صالحة";
