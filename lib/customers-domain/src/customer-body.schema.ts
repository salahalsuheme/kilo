import { z } from "zod";
import { CUSTOMER_FIELD_ERRORS, isValidIsoDateString } from "./customer-field-errors.js";
import { validateEstablishmentInput } from "./customer-establishment.js";
import { validateCustomerTaxInput } from "./customer-tax.js";
import type { CustomerType } from "./types.js";

const trimmedRequired = (message: string) => z.string().trim().min(1, message);

const birthDateSchema = trimmedRequired(CUSTOMER_FIELD_ERRORS.birthDate).refine(
  isValidIsoDateString,
  { message: CUSTOMER_FIELD_ERRORS.birthDateInvalid },
);

/** Base object matching OpenAPI CreateCustomerBody field shapes. */
export const CustomerBodyObjectSchema = z.object({
  name: trimmedRequired(CUSTOMER_FIELD_ERRORS.name),
  clientType: z.enum(["individual", "institution", "company", "government"], {
    message: CUSTOMER_FIELD_ERRORS.clientType,
  }),
  idNumber: trimmedRequired(CUSTOMER_FIELD_ERRORS.idNumber),
  birthDate: birthDateSchema,
  mobile: trimmedRequired(CUSTOMER_FIELD_ERRORS.mobile),
  licenseNumber: trimmedRequired(CUSTOMER_FIELD_ERRORS.licenseNumber),
  nationality: trimmedRequired(CUSTOMER_FIELD_ERRORS.nationality),
  hasTaxNumber: z.boolean(),
  taxNumber: z.string().nullable().optional(),
  establishmentName: z.string().nullable().optional(),
  /** Suffix digits after the fixed 700 prefix (non-individual clients). */
  establishmentNumber: z.string().nullable().optional(),
});

export function refineCustomerBodyEstablishment(
  data: {
    clientType: CustomerType;
    establishmentName?: string | null;
    establishmentNumber?: string | null;
  },
  ctx: z.RefinementCtx,
): void {
  const error = validateEstablishmentInput(
    data.clientType,
    data.establishmentName,
    data.establishmentNumber,
  );
  if (typeof error === "string") {
    const path =
      error.includes("اسم المنشأة") ? "establishmentName" : "establishmentNumber";
    ctx.addIssue({ code: "custom", message: error, path: [path] });
  }
}

export function refineCustomerBodyTax(
  data: { hasTaxNumber: boolean; taxNumber?: string | null },
  ctx: z.RefinementCtx,
): void {
  const taxError = validateCustomerTaxInput(data.hasTaxNumber, data.taxNumber);
  if (taxError) {
    ctx.addIssue({
      code: "custom",
      message: taxError,
      path: ["taxNumber"],
    });
  }
}

/** Mirrors OpenAPI CreateCustomerBody with Arabic validation messages. */
export const CreateCustomerBodySchema = CustomerBodyObjectSchema.superRefine(
  refineCustomerBodyEstablishment,
).superRefine(refineCustomerBodyTax);

export const UpdateCustomerBodySchema = CreateCustomerBodySchema;

export type CreateCustomerBodyInput = z.infer<typeof CreateCustomerBodySchema>;
export type UpdateCustomerBodyInput = z.infer<typeof UpdateCustomerBodySchema>;
