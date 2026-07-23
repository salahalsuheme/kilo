import { z } from "zod";
import { CONTRACT_FIELD_ERRORS } from "./contract-field-errors.js";

export const ContractBodyObjectSchema = z.object({
  customerId: z.number().int().positive(CONTRACT_FIELD_ERRORS.customerId),
  establishmentId: z.number().int().positive().nullable().optional(),
  carId: z.number().int().positive(CONTRACT_FIELD_ERRORS.carId),
  templateId: z.number().int().positive(CONTRACT_FIELD_ERRORS.templateId),
  startAt: z.coerce.date({ message: CONTRACT_FIELD_ERRORS.startAt }),
  endAt: z.coerce.date({ message: CONTRACT_FIELD_ERRORS.endAt }),
  amountExVat: z.coerce
    .number({ message: CONTRACT_FIELD_ERRORS.amountExVat })
    .positive(CONTRACT_FIELD_ERRORS.amountPositive),
  authorizationNumber: z
    .string()
    .trim()
    .min(1, CONTRACT_FIELD_ERRORS.authorizationNumber),
});

export const CreateContractBodySchema = ContractBodyObjectSchema.superRefine((data, ctx) => {
  if (data.endAt.getTime() <= data.startAt.getTime()) {
    ctx.addIssue({
      code: "custom",
      message: CONTRACT_FIELD_ERRORS.endBeforeStart,
      path: ["endAt"],
    });
  }
});

export const UpdateContractBodySchema = CreateContractBodySchema;

export type CreateContractBodyInput = z.infer<typeof CreateContractBodySchema>;
export type UpdateContractBodyInput = z.infer<typeof UpdateContractBodySchema>;
