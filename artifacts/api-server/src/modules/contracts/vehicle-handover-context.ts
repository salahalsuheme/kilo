import { and, eq, isNull } from "drizzle-orm";
import {
  formatEstablishmentFullName,
  type EstablishmentType,
} from "@workspace/establishments-domain";
import { resolveOrgUnifiedNumberFromStorage } from "@workspace/settings-domain";
import { db } from "../../db/index.js";
import { cars, contracts, customers, establishments, orgSettings } from "../../db/schema.js";
import type { ContractStatus } from "@workspace/contracts-domain";
import type { ContractHandoverVehicleInfo } from "@workspace/contracts-domain";
import type { VehicleDamageMarker } from "@workspace/contracts-domain";
import { parseVehicleDamageMarkers } from "@workspace/contracts-domain";
import { mapContractHandoverVehicleFromCarRow } from "./domain/map-handover-vehicle.js";

export type VehicleHandoverFormResponse = {
  contractId: number;
  contractNumber: string;
  contractStatus: ContractStatus;
  driverName: string;
  driverIdNumber: string;
  establishmentName: string | null;
  establishmentFullName: string | null;
  orgBusinessName: string;
  orgUnifiedNumber: string | null;
  orgStampUrl: string | null;
  orgSignatureUrl: string | null;
  vehicle: ContractHandoverVehicleInfo;
  markers: VehicleDamageMarker[];
  updatedAt: string;
};

export type VehicleDeliveryHandoverFormResponse = VehicleHandoverFormResponse & {
  /** نقاط محضر الاستلام (أضرار سابقة) للعرض في محضر التسليم */
  priorMarkers: VehicleDamageMarker[];
};

export async function getContractHandoverRow(orgId: number, contractId: number) {
  const [row] = await db
    .select({
      id: contracts.id,
      contractNumber: contracts.contractNumber,
      status: contracts.status,
      vehicleDamageMarkers: contracts.vehicleDamageMarkers,
      vehicleDeliveryDamageMarkers: contracts.vehicleDeliveryDamageMarkers,
      updatedAt: contracts.updatedAt,
      driverName: customers.name,
      driverIdNumber: customers.idNumber,
      establishmentName: establishments.name,
      establishmentClientType: establishments.clientType,
      orgBusinessName: orgSettings.businessName,
      orgUnifiedNumber: orgSettings.unifiedNumber,
      orgStampUrl: orgSettings.stampUrl,
      orgSignatureUrl: orgSettings.signatureUrl,
      carBrand: cars.brand,
      carModelYear: cars.modelYear,
      carCoolingType: cars.coolingType,
      carRegistrationColor: cars.registrationColor,
      carChassisNumber: cars.chassisNumber,
      carSerialNumber: cars.serialNumber,
      carPlateNumber: cars.plateNumber,
    })
    .from(contracts)
    .innerJoin(customers, eq(contracts.customerId, customers.id))
    .innerJoin(cars, eq(contracts.carId, cars.id))
    .leftJoin(establishments, eq(contracts.establishmentId, establishments.id))
    .leftJoin(orgSettings, eq(contracts.orgId, orgSettings.orgId))
    .where(
      and(
        eq(contracts.orgId, orgId),
        eq(contracts.id, contractId),
        isNull(contracts.deletedAt),
      ),
    )
    .limit(1);

  return row ?? null;
}

export function mapHandoverFormRow(
  row: NonNullable<Awaited<ReturnType<typeof getContractHandoverRow>>>,
  markers: VehicleDamageMarker[],
  updatedAt: Date,
): VehicleHandoverFormResponse {
  const establishmentFullName =
    row.establishmentName && row.establishmentClientType
      ? formatEstablishmentFullName(
          row.establishmentClientType as EstablishmentType,
          row.establishmentName,
        )
      : null;
  const orgUnifiedNumber = resolveOrgUnifiedNumberFromStorage(row.orgUnifiedNumber);
  const vehicle = mapContractHandoverVehicleFromCarRow({
    brand: row.carBrand,
    modelYear: row.carModelYear,
    coolingType: row.carCoolingType,
    registrationColor: row.carRegistrationColor,
    chassisNumber: row.carChassisNumber,
    serialNumber: row.carSerialNumber,
    plateNumber: row.carPlateNumber,
  });

  return {
    contractId: row.id,
    contractNumber: row.contractNumber,
    contractStatus: row.status as ContractStatus,
    driverName: row.driverName,
    driverIdNumber: row.driverIdNumber,
    establishmentName: row.establishmentName,
    establishmentFullName,
    orgBusinessName: row.orgBusinessName ?? "",
    orgUnifiedNumber,
    orgStampUrl: row.orgStampUrl ?? null,
    orgSignatureUrl: row.orgSignatureUrl ?? null,
    vehicle,
    markers,
    updatedAt: updatedAt.toISOString(),
  };
}

export function mapDeliveryHandoverFormRow(
  row: NonNullable<Awaited<ReturnType<typeof getContractHandoverRow>>>,
  markers: VehicleDamageMarker[],
  priorMarkers: VehicleDamageMarker[],
  updatedAt: Date,
): VehicleDeliveryHandoverFormResponse {
  return {
    ...mapHandoverFormRow(row, markers, updatedAt),
    priorMarkers,
  };
}

export function receiptMarkersFromRow(
  row: NonNullable<Awaited<ReturnType<typeof getContractHandoverRow>>>,
): VehicleDamageMarker[] | null {
  return parseVehicleDamageMarkers(row.vehicleDamageMarkers);
}

export function deliveryMarkersFromRow(
  row: NonNullable<Awaited<ReturnType<typeof getContractHandoverRow>>>,
): VehicleDamageMarker[] | null {
  return parseVehicleDamageMarkers(row.vehicleDeliveryDamageMarkers);
}
