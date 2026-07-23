import {
  buildContractTemplateVariables,
  computeContractAmounts,
  renderContractTemplate,
  rentalDurationDays,
} from "@workspace/contracts-domain";
import { formatEstablishmentFullName, ESTABLISHMENT_TYPE_LABELS } from "@workspace/establishments-domain";
import type { EstablishmentType } from "@workspace/establishments-domain";
import { COOLING_TYPE_LABELS } from "@workspace/vehicles-domain";
import type { Customer, Establishment, OrgSettings, Vehicle } from "@/lib/api-client-react-tenant";

interface BuildPreviewInput {
  templateBody: string;
  settings?: OrgSettings | null;
  customer?: Customer | null;
  establishment?: Establishment | null;
  vehicle?: Vehicle | null;
  contractNumber?: string;
  values: {
    startAt: string;
    endAt: string;
    amountExVat: number;
    authorizationNumber: string;
  };
}

export function buildContractPreviewContent({
  templateBody,
  settings,
  customer,
  establishment,
  vehicle,
  contractNumber,
  values,
}: BuildPreviewInput): string {
  if (!customer || !vehicle || !templateBody.trim()) {
    return "اختر السائق والمركبة والقالب لعرض معاينة العقد.";
  }

  const startAt = new Date(values.startAt);
  const endAt = new Date(values.endAt);
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    return "أدخل تواريخ صالحة لعرض المعاينة.";
  }

  const amounts = computeContractAmounts(
    values.amountExVat,
    settings?.taxEnabled ?? true,
    settings?.taxRate ?? 15,
  );

  const variables = buildContractTemplateVariables({
    org: { businessName: settings?.businessName ?? "—" },
    driver: {
      name: customer.name,
      idNumber: customer.idNumber,
      mobile: customer.mobile,
      nationality: customer.nationality,
      licenseNumber: customer.licenseNumber,
    },
    establishment: establishment
      ? {
          name: establishment.name,
          fullName: formatEstablishmentFullName(
            establishment.clientType as EstablishmentType,
            establishment.name,
          ),
          number: establishment.establishmentNumber,
          clientTypeLabel:
            ESTABLISHMENT_TYPE_LABELS[establishment.clientType as EstablishmentType],
        }
      : null,
    car: {
      brand: vehicle.brand,
      modelYear: vehicle.modelYear,
      plateNumber: vehicle.plateNumber,
      coolingTypeLabel: COOLING_TYPE_LABELS[vehicle.coolingType],
    },
    contract: {
      number: contractNumber,
      authorizationNumber: values.authorizationNumber,
      startAt,
      endAt,
      rentalDays: rentalDurationDays(startAt, endAt),
      amountExVat: amounts.amountExVat,
      taxAmount: amounts.taxAmount,
      totalInclVat: amounts.totalInclVat,
    },
  });

  return renderContractTemplate(templateBody, variables);
}
