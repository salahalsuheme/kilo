import { z } from "zod";

import { isoDateStringSchema } from "./finance-dates.js";

const trimmedRequired = (message: string) => z.string().trim().min(1, message);

export const SUBSCRIPTION_INVOICE_BODY_INVALID = "بيانات فاتورة الاشتراك غير صالحة";

export const UpdateSubscriptionInvoiceBodySchema = z.object({
  invoiceDate: isoDateStringSchema,
  referenceNumber: trimmedRequired("رقم المرجع مطلوب"),
  companyName: trimmedRequired("اسم الشركة مطلوب"),
  items: trimmedRequired("الصنف مطلوب"),
  totalInclVat: z.number().positive("المبلغ شامل الضريبة يجب أن يكون أكبر من صفر"),
});
