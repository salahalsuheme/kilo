import { z } from "zod";
import {
  EstablishmentBodyObjectSchema,
  refineEstablishmentBodyEmail,
  refineEstablishmentBodyTax,
} from "@workspace/establishments-domain";

export const establishmentFormSchema = EstablishmentBodyObjectSchema.extend({
  taxNumber: z.string(),
  establishmentNumber: z.string(),
  email: z.string(),
}).superRefine((data, ctx) => {
  refineEstablishmentBodyTax(data, ctx);
  refineEstablishmentBodyEmail(data, ctx);
});

export type EstablishmentFormValues = z.infer<typeof establishmentFormSchema>;

export const ESTABLISHMENT_TYPE_LABELS = {
  institution: "مؤسسة",
  company: "شركة",
  government: "حكومي",
} as const;
