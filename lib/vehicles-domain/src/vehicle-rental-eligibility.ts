import type { VehicleStatus } from "./types.js";

export function isVehicleRentable(status: VehicleStatus): status is "available" {
  return status === "available";
}
