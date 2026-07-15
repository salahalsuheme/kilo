import type { VehicleStatus } from "./types.js";

export const VEHICLE_DELETE_ERRORS = {
  cannotDeleteRented: "لا يمكن حذف مركبة مؤجرة",
} as const;

export function canDeleteVehicle(status: VehicleStatus): boolean {
  return status !== "rented";
}

export function validateVehicleDeletion(status: VehicleStatus): string | null {
  if (!canDeleteVehicle(status)) return VEHICLE_DELETE_ERRORS.cannotDeleteRented;
  return null;
}
