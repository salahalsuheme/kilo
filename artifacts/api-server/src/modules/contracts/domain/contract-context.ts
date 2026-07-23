import { and, eq, isNull } from "drizzle-orm";
import {
  buildContractTemplateVariables,
  computeContractAmounts,
  renderContractTemplate,
  rentalDurationDays,
  type CreateContractBodyInput,
} from "@workspace/contracts-domain";
import {
  ESTABLISHMENT_TYPE_LABELS,
  formatEstablishmentFullName,
} from "@workspace/establishments-domain";
import type { EstablishmentType } from "@workspace/establishments-domain";
import { COOLING_TYPE_LABELS } from "@workspace/vehicles-domain";
import { db } from "../../../db/index.js";
import {
  cars,
  contractTemplates,
  customers,
  establishments,
  orgSettings,
} from "../../../db/schema.js";
import type { VehicleCoolingType } from "@workspace/vehicles-domain";

export async function getOrgTaxSettings(orgId: number) {
  const [settings] = await db
    .select()
    .from(orgSettings)
    .where(eq(orgSettings.orgId, orgId))
    .limit(1);
  return {
    businessName: settings?.businessName ?? "",
    taxEnabled: settings?.taxEnabled ?? true,
    taxRate: Number(settings?.taxRate ?? 15),
  };
}

export async function getContractTemplate(orgId: number, templateId: number) {
  const [row] = await db
    .select()
    .from(contractTemplates)
    .where(
      and(
        eq(contractTemplates.orgId, orgId),
        eq(contractTemplates.id, templateId),
        isNull(contractTemplates.deletedAt),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function getContractCustomer(orgId: number, customerId: number) {
  const [row] = await db
    .select()
    .from(customers)
    .where(
      and(
        eq(customers.orgId, orgId),
        eq(customers.id, customerId),
        isNull(customers.deletedAt),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function getContractEstablishment(orgId: number, establishmentId: number) {
  const [row] = await db
    .select()
    .from(establishments)
    .where(
      and(
        eq(establishments.orgId, orgId),
        eq(establishments.id, establishmentId),
        isNull(establishments.deletedAt),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function getContractCar(orgId: number, carId: number) {
  const [row] = await db
    .select()
    .from(cars)
    .where(and(eq(cars.orgId, orgId), eq(cars.id, carId), isNull(cars.deletedAt)))
    .limit(1);
  return row ?? null;
}

export function resolveContractAmounts(
  body: CreateContractBodyInput,
  taxEnabled: boolean,
  taxRate: number,
) {
  return computeContractAmounts(body.amountExVat, taxEnabled, taxRate);
}

export async function buildRenderedContractContent(
  orgId: number,
  body: CreateContractBodyInput,
  amounts: ReturnType<typeof computeContractAmounts>,
  contractNumber?: string,
) {
  const [orgTax, customer, car, template] = await Promise.all([
    getOrgTaxSettings(orgId),
    getContractCustomer(orgId, body.customerId),
    getContractCar(orgId, body.carId),
    getContractTemplate(orgId, body.templateId),
  ]);

  if (!customer || !car || !template) {
    return null;
  }

  const establishment =
    body.establishmentId != null
      ? await getContractEstablishment(orgId, body.establishmentId)
      : null;

  const rentalDays = rentalDurationDays(body.startAt, body.endAt);
  const variables = buildContractTemplateVariables({
    org: { businessName: orgTax.businessName },
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
      brand: car.brand,
      modelYear: car.modelYear,
      plateNumber: car.plateNumber,
      coolingTypeLabel: COOLING_TYPE_LABELS[car.coolingType as VehicleCoolingType],
    },
    contract: {
      number: contractNumber,
      authorizationNumber: body.authorizationNumber,
      startAt: body.startAt,
      endAt: body.endAt,
      rentalDays,
      amountExVat: amounts.amountExVat,
      taxAmount: amounts.taxAmount,
      totalInclVat: amounts.totalInclVat,
    },
  });

  return renderContractTemplate(template.body, variables);
}
