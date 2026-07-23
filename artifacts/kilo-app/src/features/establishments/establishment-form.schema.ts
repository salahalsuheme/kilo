import { z } from "zod";
import {
  EstablishmentBodyObjectSchema,
  refineEstablishmentBodyNumber,
  refineEstablishmentBodyTax,
} from "@workspace/establishments-domain";

export const establishmentFormSchema = EstablishmentBodyObjectSchema.extend({
  taxNumber: z.string(),
  establishmentNumber: z.string(),
})
  .superRefine(refineEstablishmentBodyNumber)
  .superRefine(refineEstablishmentBodyTax);

export type EstablishmentFormValues = z.infer<typeof establishmentFormSchema>;

export const ESTABLISHMENT_TYPE_LABELS = {
  institution: "مؤسسة",
  company: "شركة",
  government: "حكومي",
} as const;
