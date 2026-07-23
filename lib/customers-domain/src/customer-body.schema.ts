import { z } from "zod";
import { CUSTOMER_FIELD_ERRORS, isValidIsoDateString } from "./customer-field-errors.js";
import { validateCustomerEstablishmentLink, isNonIndividualClientType } from "./customer-establishment.js";
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
  establishmentId: z.number().int().positive().nullable().optional(),
});

export function refineCustomerBodyEstablishment(
  data: {
    clientType: CustomerType;
    establishmentId?: number | null;
  },
  ctx: z.RefinementCtx,
): void {
  const error = validateCustomerEstablishmentLink(data.clientType, data.establishmentId);
  if (error) {
    ctx.addIssue({ code: "custom", message: error, path: ["establishmentId"] });
  }
}

export function refineCustomerBodyTax(
  data: {
    clientType: CustomerType;
    hasTaxNumber: boolean;
    taxNumber?: string | null;
  },
  ctx: z.RefinementCtx,
): void {
  if (!isNonIndividualClientType(data.clientType)) {
    const taxError = validateCustomerTaxInput(data.hasTaxNumber, data.taxNumber);
    if (taxError) {
      ctx.addIssue({
        code: "custom",
        message: taxError,
        path: ["taxNumber"],
      });
    }
    return;
  }
  if (data.hasTaxNumber || data.taxNumber?.trim()) {
    ctx.addIssue({
      code: "custom",
      message: "الرقم الضريبي يُدار من بيانات المنشأة",
      path: ["hasTaxNumber"],
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
