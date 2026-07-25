import type { VehicleCoolingType } from "@workspace/vehicles-domain";
import { COOLING_TYPE_LABELS } from "@workspace/vehicles-domain";
import type { ContractHandoverVehicleInfo } from "@workspace/contracts-domain";

type CarHandoverRow = {
  brand: string;
  modelYear: number;
  coolingType: string;
  registrationColor: string;
  chassisNumber: string;
  serialNumber: string | null;
  plateNumber: string;
};

export function mapContractHandoverVehicleFromCarRow(
  row: CarHandoverRow,
): ContractHandoverVehicleInfo {
  const coolingType = row.coolingType as VehicleCoolingType;
  return {
    brand: row.brand,
    modelYear: row.modelYear,
    coolingType: row.coolingType,
    coolingTypeLabel: COOLING_TYPE_LABELS[coolingType] ?? row.coolingType,
    registrationColor: row.registrationColor,
    chassisNumber: row.chassisNumber,
    serialNumber: row.serialNumber,
    plateNumber: row.plateNumber,
  };
}
