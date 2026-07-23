import type { CustomerType } from "@workspace/customers-domain";

export function validateContractEstablishmentLink(
  establishmentId: number | null | undefined,
  customer: {
    clientType: CustomerType;
    establishmentId: number | null;
  },
): string | null {
  if (customer.clientType === "individual") {
    if (establishmentId != null) {
      return "لا يمكن ربط عقد فرد بمنشأة";
    }
    return null;
  }
  if (!establishmentId || establishmentId < 1) {
    return "المنشأة مطلوبة لهذا السائق";
  }
  if (customer.establishmentId !== establishmentId) {
    return "السائق المختار لا ينتمي للمنشأة المحددة";
  }
  return null;
}
