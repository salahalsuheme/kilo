import { z } from "zod";
import {
  EstablishmentBodyObjectSchema,
  refineEstablishmentBodyTax,
} from "@workspace/establishments-domain";

export const establishmentFormSchema = EstablishmentBodyObjectSchema.extend({
  taxNumber: z.string(),
  establishmentNumber: z.string(),
}).superRefine(refineEstablishmentBodyTax);

export type EstablishmentFormValues = z.infer<typeof establishmentFormSchema>;

export const ESTABLISHMENT_TYPE_LABELS = {
  institution: "مؤسسة",
  company: "شركة",
  government: "حكومي",
} as const;
