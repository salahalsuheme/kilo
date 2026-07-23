import { z } from "zod";
import { ESTABLISHMENT_FIELD_ERRORS } from "./establishment-field-errors.js";
import {
  isValidEstablishmentNumber,
  normalizeEstablishmentNumber,
} from "./establishment-number.js";
import { validateEstablishmentTaxInput } from "./establishment-tax.js";

const trimmedRequired = (message: string) => z.string().trim().min(1, message);

/** Base object matching OpenAPI CreateEstablishmentBody field shapes. */
export const EstablishmentBodyObjectSchema = z.object({
  name: trimmedRequired(ESTABLISHMENT_FIELD_ERRORS.name),
  clientType: z.enum(["institution", "company", "government"], {
    message: ESTABLISHMENT_FIELD_ERRORS.clientType,
  }),
  /** Suffix digits after the fixed 700 prefix. */
  establishmentNumber: trimmedRequired(ESTABLISHMENT_FIELD_ERRORS.establishmentNumber),
  hasTaxNumber: z.boolean(),
  taxNumber: z.string().nullable().optional(),
});

export function refineEstablishmentBodyNumber(
  data: { establishmentNumber: string },
  ctx: z.RefinementCtx,
): void {
  const normalized = normalizeEstablishmentNumber(data.establishmentNumber);
  if (!normalized || !isValidEstablishmentNumber(normalized)) {
    ctx.addIssue({
      code: "custom",
      message: ESTABLISHMENT_FIELD_ERRORS.establishmentNumberInvalid,
      path: ["establishmentNumber"],
    });
  }
}

export function refineEstablishmentBodyTax(
  data: { hasTaxNumber: boolean; taxNumber?: string | null },
  ctx: z.RefinementCtx,
): void {
  const taxError = validateEstablishmentTaxInput(data.hasTaxNumber, data.taxNumber);
  if (taxError) {
    ctx.addIssue({
      code: "custom",
      message: taxError,
      path: ["taxNumber"],
    });
  }
}

export const CreateEstablishmentBodySchema = EstablishmentBodyObjectSchema.superRefine(
  refineEstablishmentBodyNumber,
).superRefine(refineEstablishmentBodyTax);

export const UpdateEstablishmentBodySchema = CreateEstablishmentBodySchema;

export type CreateEstablishmentBodyInput = z.infer<typeof CreateEstablishmentBodySchema>;
export type UpdateEstablishmentBodyInput = z.infer<typeof UpdateEstablishmentBodySchema>;

export function resolveEstablishmentNumberFromBody(
  establishmentNumberSuffix: string,
): string | null {
  const normalized = normalizeEstablishmentNumber(establishmentNumberSuffix);
  if (!normalized || !isValidEstablishmentNumber(normalized)) {
    return null;
  }
  return normalized;
}
