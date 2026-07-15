import { z } from "zod";
import {
  CustomerBodyObjectSchema,
  refineCustomerBodyEstablishment,
  refineCustomerBodyTax,
} from "@workspace/customers-domain";

/** Form schema: API body fields plus taxNumber as a plain string for controlled inputs. */
export const customerFormSchema = CustomerBodyObjectSchema.extend({
  taxNumber: z.string(),
  establishmentName: z.string(),
  establishmentNumber: z.string(),
})
  .superRefine(refineCustomerBodyEstablishment)
  .superRefine(refineCustomerBodyTax);

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

export const CLIENT_TYPE_LABELS: Record<CustomerFormValues["clientType"], string> = {
  individual: "فرد",
  institution: "مؤسسة",
  company: "شركة",
  government: "حكومي",
};
