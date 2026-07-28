/** Vehicle snapshot on handover forms (OpenAPI ContractHandoverVehicleInfo). */
export type ContractHandoverVehicleInfo = {
  brand: string;
  modelYear: number;
  coolingType: string;
  coolingTypeLabel: string;
  registrationColor: string;
  chassisNumber: string;
  serialNumber?: string | null;
  plateNumber: string;
};

export const VEHICLE_HANDOVER_PRINT_HEADER_LABELS = {
  contractNumber: "رقم العقد",
  vehicleSection: "بيانات المركبة",
} as const;

export const VEHICLE_HANDOVER_PRINT_VEHICLE_LABELS = {
  brand: "ماركة المركبة",
  modelYear: "موديل المركبة",
  coolingType: "خيارات المركبة",
  registrationColor: "اللون حسب الاستمارة",
  chassisNumber: "رقم الهيكل",
  serialNumber: "رقم التسلسل",
  plateNumber: "رقم اللوحة",
  odometer: "عداد السيارة",
} as const;

export type VehicleHandoverPrintLine = {
  label: string;
  value: string;
  valueDir?: "ltr";
};

export function buildContractHandoverVehiclePrintLines(
  vehicle: ContractHandoverVehicleInfo,
  options?: { receiptOdometer?: number },
): VehicleHandoverPrintLine[] {
  const L = VEHICLE_HANDOVER_PRINT_VEHICLE_LABELS;
  const serial = vehicle.serialNumber?.trim() || "—";
  const lines: VehicleHandoverPrintLine[] = [
    { label: L.brand, value: vehicle.brand.trim() || "—" },
    { label: L.modelYear, value: String(vehicle.modelYear) },
    { label: L.coolingType, value: vehicle.coolingTypeLabel.trim() || "—" },
    { label: L.registrationColor, value: vehicle.registrationColor.trim() || "—" },
    { label: L.chassisNumber, value: vehicle.chassisNumber.trim() || "—", valueDir: "ltr" },
    { label: L.serialNumber, value: serial, valueDir: serial !== "—" ? "ltr" : undefined },
    { label: L.plateNumber, value: vehicle.plateNumber.trim() || "—", valueDir: "ltr" },
  ];
  if (options?.receiptOdometer != null) {
    lines.push({
      label: L.odometer,
      value: `${options.receiptOdometer.toLocaleString("ar-SA")} كيلو`,
      valueDir: "ltr",
    });
  }
  return lines;
}
