import { z } from "zod";
import { isoDateStringSchema, todayIsoDate } from "@workspace/finance-domain";

export const fixedSubscriptionFormSchema = z.object({
  invoiceDate: isoDateStringSchema,
  referenceNumber: z.string().trim().min(1, "رقم المرجع مطلوب"),
  companyName: z.string().trim().min(1, "اسم الشركة مطلوب"),
  items: z.string().trim().min(1, "الصنف مطلوب"),
  billingCycle: z.enum(["monthly", "yearly"], { message: "دورة الدفع مطلوبة" }),
  totalInclVat: z.coerce
    .number<number>({ message: "المبلغ شامل الضريبة مطلوب" })
    .positive("المبلغ شامل الضريبة يجب أن يكون أكبر من صفر"),
});

export type FixedSubscriptionFormValues = z.infer<typeof fixedSubscriptionFormSchema>;

export const EMPTY_FIXED_SUBSCRIPTION_VALUES: FixedSubscriptionFormValues = {
  invoiceDate: todayIsoDate(),
  referenceNumber: "",
  companyName: "",
  items: "",
  billingCycle: "monthly",
  totalInclVat: 0,
};
