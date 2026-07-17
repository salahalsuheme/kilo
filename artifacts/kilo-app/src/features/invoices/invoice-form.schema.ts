import { z } from "zod";

export const invoiceFormSchema = z.object({
  totalInclVat: z.coerce
    .number<number>({ message: "المبلغ مطلوب" })
    .positive("المبلغ يجب أن يكون أكبر من صفر"),
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export function buildInvoiceFormValues(totalInclVat: number): InvoiceFormValues {
  return { totalInclVat };
}
