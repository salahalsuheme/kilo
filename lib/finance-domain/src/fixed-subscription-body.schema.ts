import { z } from "zod";

import { isoDateStringSchema } from "./finance-dates.js";

const trimmedRequired = (message: string) => z.string().trim().min(1, message);

export const FIXED_SUBSCRIPTION_BODY_INVALID = "بيانات الاشتراك الثابت غير صالحة";

export const CreateFixedSubscriptionBodySchema = z.object({
  invoiceDate: isoDateStringSchema,
  referenceNumber: trimmedRequired("رقم المرجع مطلوب"),
  companyName: trimmedRequired("اسم الشركة مطلوب"),
  items: trimmedRequired("الصنف مطلوب"),
  billingCycle: z.enum(["monthly", "yearly"], {
    message: "دورة الدفع مطلوبة",
  }),
  totalInclVat: z.number().positive("المبلغ شامل الضريبة يجب أن يكون أكبر من صفر"),
});

export const UpdateFixedSubscriptionBodySchema = CreateFixedSubscriptionBodySchema;
