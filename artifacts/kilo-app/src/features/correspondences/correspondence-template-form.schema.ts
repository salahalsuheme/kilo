import { z } from "zod";
import { CORRESPONDENCE_TEMPLATE_FIELD_ERRORS } from "@workspace/correspondence-domain";

export const correspondenceTemplateFormSchema = z.object({
  name: z.string().trim().min(1, CORRESPONDENCE_TEMPLATE_FIELD_ERRORS.name),
  subject: z.string().trim().min(1, CORRESPONDENCE_TEMPLATE_FIELD_ERRORS.subject),
  body: z.string().trim().min(1, CORRESPONDENCE_TEMPLATE_FIELD_ERRORS.body),
});

export type CorrespondenceTemplateFormValues = z.infer<typeof correspondenceTemplateFormSchema>;
