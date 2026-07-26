import { z } from "zod";
import { CORRESPONDENCE_FIELD_ERRORS } from "./correspondence-field-errors.js";

export const CorrespondenceMessageFieldsSchema = z.object({
  establishmentId: z.coerce
    .number()
    .int()
    .positive(CORRESPONDENCE_FIELD_ERRORS.establishmentId),
  templateId: z.coerce.number().int().positive().optional().nullable(),
  subject: z.string().trim().min(1, CORRESPONDENCE_FIELD_ERRORS.subject),
  body: z.string().trim().min(1, CORRESPONDENCE_FIELD_ERRORS.body),
});

export type CorrespondenceMessageFieldsInput = z.infer<typeof CorrespondenceMessageFieldsSchema>;

export function parseCorrespondenceMultipartFields(
  raw: Record<string, unknown>,
): { success: true; data: CorrespondenceMessageFieldsInput } | { success: false; message: string } {
  const parsed = CorrespondenceMessageFieldsSchema.safeParse({
    establishmentId: raw.establishmentId,
    templateId: raw.templateId === "" || raw.templateId == null ? undefined : raw.templateId,
    subject: raw.subject,
    body: raw.body,
  });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "بيانات الرسالة غير صالحة" };
  }
  return { success: true, data: parsed.data };
}
