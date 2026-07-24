import {
  buildContractTemplateVariables,
  computeContractAmountsFromTotalInclVat,
  renderContractTemplate,
  rentalDurationDays,
} from "@workspace/contracts-domain";
import { formatEstablishmentFullName, ESTABLISHMENT_TYPE_LABELS } from "@workspace/establishments-domain";
import type { EstablishmentType } from "@workspace/establishments-domain";
import { COOLING_TYPE_LABELS } from "@workspace/vehicles-domain";
import { resolveOrgBusinessNameDisplay } from "@workspace/settings-domain";
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
    totalInclVat: number;
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

  const taxEnabled = settings?.taxEnabled ?? true;
  const taxRate = settings?.taxRate ?? 15;
  const amounts = computeContractAmountsFromTotalInclVat(
    values.totalInclVat,
    taxEnabled,
    taxRate,
  );

  const variables = buildContractTemplateVariables({
    org: {
      businessName: resolveOrgBusinessNameDisplay(settings?.businessName),
      stampUrl: settings?.stampUrl ?? null,
      signatureUrl: settings?.signatureUrl ?? null,
    },
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
