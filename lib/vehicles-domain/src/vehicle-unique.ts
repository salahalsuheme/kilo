export const VEHICLE_UNIQUE_INDEXES = {
  chassisNumber: "cars_org_chassis_number_uidx",
  serialNumber: "cars_org_serial_number_uidx",
  plateNumber: "cars_org_plate_number_uidx",
} as const;

export const VEHICLE_DUPLICATE_ERRORS = {
  chassisNumber: "رقم هيكل السيارة مسجل مسبقاً",
  serialNumber: "رقم التسلسل مسجل مسبقاً",
  plateNumber: "رقم لوحة السيارة مسجل مسبقاً",
} as const;

export const VEHICLE_DUPLICATE_FALLBACK = "بيانات المركبة مسجلة مسبقاً";

const CONSTRAINT_TO_MESSAGE: Record<string, string> = {
  [VEHICLE_UNIQUE_INDEXES.chassisNumber]: VEHICLE_DUPLICATE_ERRORS.chassisNumber,
  [VEHICLE_UNIQUE_INDEXES.serialNumber]: VEHICLE_DUPLICATE_ERRORS.serialNumber,
  [VEHICLE_UNIQUE_INDEXES.plateNumber]: VEHICLE_DUPLICATE_ERRORS.plateNumber,
};

export function messageForVehicleUniqueViolation(constraint?: string): string {
  if (!constraint) return VEHICLE_DUPLICATE_FALLBACK;
  return CONSTRAINT_TO_MESSAGE[constraint] ?? VEHICLE_DUPLICATE_FALLBACK;
}
