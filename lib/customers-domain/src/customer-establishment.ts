import type { CustomerType } from "./types.js";

export function isNonIndividualClientType(clientType: CustomerType): boolean {
  return clientType !== "individual";
}

export function formatCustomerDisplayName(
  name: string,
  establishmentName: string | null | undefined,
): string {
  const trimmedEstablishment = establishmentName?.trim() ?? "";
  if (!trimmedEstablishment) return name;
  return `${trimmedEstablishment} - ${name}`;
}

export function validateCustomerEstablishmentLink(
  clientType: CustomerType,
  establishmentId: number | null | undefined,
): string | null {
  if (!isNonIndividualClientType(clientType)) {
    if (establishmentId != null) {
      return "لا يمكن ربط عميل فرد بمنشأة";
    }
    return null;
  }
  if (!establishmentId || establishmentId < 1) {
    return "المنشأة مطلوبة لغير الأفراد";
  }
  return null;
}
