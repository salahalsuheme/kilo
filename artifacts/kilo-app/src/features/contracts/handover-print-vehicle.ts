import type { ContractHandoverVehicleInfo } from "@workspace/contracts-domain";
import type { Vehicle } from "@/lib/api-client-react-tenant";
import { COOLING_TYPE_LABELS } from "@workspace/vehicles-domain";
import type { VehicleCoolingType } from "@workspace/vehicles-domain";

export function mapVehicleToHandoverPrintInfo(vehicle: Vehicle): ContractHandoverVehicleInfo {
  const coolingType = vehicle.coolingType as VehicleCoolingType;
  return {
    brand: vehicle.brand,
    modelYear: vehicle.modelYear,
    coolingType: vehicle.coolingType,
    coolingTypeLabel: COOLING_TYPE_LABELS[coolingType] ?? vehicle.coolingType,
    registrationColor: vehicle.registrationColor,
    chassisNumber: vehicle.chassisNumber,
    serialNumber: vehicle.serialNumber,
    plateNumber: vehicle.plateNumber,
  };
}
