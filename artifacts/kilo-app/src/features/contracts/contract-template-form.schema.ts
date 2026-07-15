import { z } from "zod";
import { CreateContractTemplateBodySchema } from "@workspace/contracts-domain";

export const contractTemplateFormSchema = CreateContractTemplateBodySchema;
export type ContractTemplateFormValues = z.infer<typeof contractTemplateFormSchema>;
