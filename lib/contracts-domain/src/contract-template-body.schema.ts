import { z } from "zod";
import { CONTRACT_TEMPLATE_FIELD_ERRORS } from "./contract-field-errors.js";

export const CreateContractTemplateBodySchema = z.object({
  name: z.string().trim().min(1, CONTRACT_TEMPLATE_FIELD_ERRORS.name),
  body: z.string().trim().min(1, CONTRACT_TEMPLATE_FIELD_ERRORS.body),
});

export const UpdateContractTemplateBodySchema = CreateContractTemplateBodySchema;

export type CreateContractTemplateBodyInput = z.infer<typeof CreateContractTemplateBodySchema>;
export type UpdateContractTemplateBodyInput = z.infer<typeof UpdateContractTemplateBodySchema>;
