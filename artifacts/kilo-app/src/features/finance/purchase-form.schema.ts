import { z } from "zod";
import { isoDateStringSchema, todayIsoDate } from "@workspace/finance-domain";

export const purchaseFormSchema = z.object({
  invoiceDate: isoDateStringSchema,
  referenceNumber: z.string().trim().min(1, "رقم المرجع مطلوب"),
  companyName: z.string().trim().min(1, "اسم الشركة مطلوب"),
  items: z.string().trim().min(1, "الأصناف مطلوبة"),
  taxExempt: z.boolean(),
  totalInclVat: z.coerce
    .number<number>({ message: "المبلغ مطلوب" })
    .positive("المبلغ يجب أن يكون أكبر من صفر"),
});

export type PurchaseFormValues = z.infer<typeof purchaseFormSchema>;

export const EMPTY_PURCHASE_VALUES: PurchaseFormValues = {
  invoiceDate: todayIsoDate(),
  referenceNumber: "",
  companyName: "",
  items: "",
  taxExempt: false,
  totalInclVat: 0,
};
