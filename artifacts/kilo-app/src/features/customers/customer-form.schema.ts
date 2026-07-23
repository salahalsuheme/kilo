import { z } from "zod";
import {
  CustomerBodyObjectSchema,
  refineCustomerBodyEstablishment,
  refineCustomerBodyTax,
} from "@workspace/customers-domain";

/** Form schema: API body fields plus taxNumber as a plain string for controlled inputs. */
export const customerFormSchema = CustomerBodyObjectSchema.extend({
  establishmentId: z.string(),
  taxNumber: z.string(),
})
  .superRefine((data, ctx) =>
    refineCustomerBodyEstablishment(
      {
        clientType: data.clientType,
        establishmentId:
          data.establishmentId && data.establishmentId !== "none"
            ? Number(data.establishmentId)
            : null,
      },
      ctx,
    ),
  )
  .superRefine(refineCustomerBodyTax);

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

export const CLIENT_TYPE_LABELS: Record<CustomerFormValues["clientType"], string> = {
  individual: "فرد",
  institution: "مؤسسة",
  company: "شركة",
  government: "حكومي",
};
