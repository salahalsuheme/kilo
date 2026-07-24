import { z } from "zod";
import { EstablishmentNumberSuffixPutSchema } from "@workspace/establishments-domain";

/** OpenAPI PutSettingsBody.unifiedNumber (suffix in request; null clears). */
export const PutSettingsUnifiedNumberSchema = EstablishmentNumberSuffixPutSchema;

/** Company fields on PutSettingsBody when saved from the company settings card. */
export const PutCompanySettingsFieldsSchema = z.object({
  businessName: z.string().trim().min(1, "اسم الشركة مطلوب").optional(),
  unifiedNumber: PutSettingsUnifiedNumberSchema.optional(),
});

export type PutCompanySettingsFieldsInput = z.infer<typeof PutCompanySettingsFieldsSchema>;
