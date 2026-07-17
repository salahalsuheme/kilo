import { z } from "zod";

export const UpdateInvoiceBodySchema = z.object({
  totalInclVat: z
    .number({ message: "المبلغ مطلوب" })
    .positive("المبلغ يجب أن يكون أكبر من صفر"),
});

export type UpdateInvoiceBodyInput = z.infer<typeof UpdateInvoiceBodySchema>;

export const UpdateInvoiceStatusBodySchema = z.object({
  status: z.literal("paid", { message: "حالة الفاتورة غير صالحة" }),
});

export type UpdateInvoiceStatusBodyInput = z.infer<typeof UpdateInvoiceStatusBodySchema>;
