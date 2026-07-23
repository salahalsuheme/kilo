import { z } from "zod";

import { isoDateStringSchema } from "./finance-dates.js";

const trimmedRequired = (message: string) => z.string().trim().min(1, message);

export const PURCHASE_BODY_INVALID = "بيانات فاتورة المشتريات غير صالحة";

export const CreatePurchaseBodySchema = z.object({
  invoiceDate: isoDateStringSchema,
  referenceNumber: trimmedRequired("رقم المرجع مطلوب"),
  companyName: trimmedRequired("اسم الشركة مطلوب"),
  items: trimmedRequired("الأصناف مطلوبة"),
  totalInclVat: z.number().positive("المبلغ يجب أن يكون أكبر من صفر"),
  taxExempt: z.boolean().optional().default(false),
});

export const UpdatePurchaseBodySchema = CreatePurchaseBodySchema;
