import { z } from "zod";
import { CORRESPONDENCE_FIELD_ERRORS } from "@workspace/correspondence-domain";

export const correspondenceFormSchema = z.object({
  establishmentId: z.string().min(1, CORRESPONDENCE_FIELD_ERRORS.establishmentId),
  templateId: z.string().optional(),
  subject: z.string().trim().min(1, CORRESPONDENCE_FIELD_ERRORS.subject),
  body: z.string().trim().min(1, CORRESPONDENCE_FIELD_ERRORS.body),
});

export type CorrespondenceFormValues = z.infer<typeof correspondenceFormSchema>;
