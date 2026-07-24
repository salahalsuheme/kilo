import { computeContractAmountsFromTotalInclVat } from "@workspace/contracts-domain";
import type { CreateContractBody } from "@/lib/api-client-react-tenant";
import type { ContractFormValues } from "./contract-form.schema";

export interface ContractFormTaxContext {
  taxEnabled: boolean;
  taxRate: number;
}

export function contractTaxContextFromSettings(
  settings?: { taxEnabled?: boolean; taxRate?: number } | null,
): ContractFormTaxContext {
  return {
    taxEnabled: settings?.taxEnabled ?? true,
    taxRate: settings?.taxRate ?? 15,
  };
}

export function contractFormValuesToCreateBody(
  values: ContractFormValues,
  tax: ContractFormTaxContext,
): CreateContractBody {
  const totalInclVat = Number(values.totalInclVat);
  const amounts = computeContractAmountsFromTotalInclVat(
    totalInclVat,
    tax.taxEnabled,
    tax.taxRate,
  );

  return {
    customerId: Number(values.customerId),
    establishmentId: values.establishmentId ? Number(values.establishmentId) : null,
    carId: Number(values.carId),
    templateId: Number(values.templateId),
    startAt: new Date(values.startAt).toISOString(),
    endAt: new Date(values.endAt).toISOString(),
    amountExVat: amounts.amountExVat,
    totalInclVat: amounts.totalInclVat,
    authorizationNumber: values.authorizationNumber.trim(),
  };
}

export function contractAmountsFromFormTotal(
  totalInclVatInput: string,
  tax: ContractFormTaxContext,
) {
  const totalInclVat = Number(totalInclVatInput) || 0;
  return computeContractAmountsFromTotalInclVat(
    totalInclVat,
    tax.taxEnabled,
    tax.taxRate,
  );
}
