import { z } from "zod";
import { CORRESPONDENCE_TEMPLATE_FIELD_ERRORS } from "./correspondence-field-errors.js";

export const CreateCorrespondenceTemplateBodySchema = z.object({
  name: z.string().trim().min(1, CORRESPONDENCE_TEMPLATE_FIELD_ERRORS.name),
  subject: z.string().trim().min(1, CORRESPONDENCE_TEMPLATE_FIELD_ERRORS.subject),
  body: z.string().trim().min(1, CORRESPONDENCE_TEMPLATE_FIELD_ERRORS.body),
});

export const UpdateCorrespondenceTemplateBodySchema = CreateCorrespondenceTemplateBodySchema;

export type CreateCorrespondenceTemplateBodyInput = z.infer<
  typeof CreateCorrespondenceTemplateBodySchema
>;
export type UpdateCorrespondenceTemplateBodyInput = z.infer<
  typeof UpdateCorrespondenceTemplateBodySchema
>;
