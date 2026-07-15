import type {
  VehicleCoolingType,
  VehiclePeriodicMaintenanceInterval,
  VehicleStatus,
} from "./types.js";

export const COOLING_TYPE_LABELS: Record<VehicleCoolingType, string> = {
  refrigerated: "مبردة",
  non_refrigerated: "غير مبردة",
};

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  rented: "مؤجرة",
  available: "متاحة",
  stopped: "صيانة",
  suspended: "توقيف مؤقت",
};

/** الحالات التي يمكن للمستخدم تعيينها يدوياً (المؤجرة تلقائية عبر العقود). */
export const MANUAL_VEHICLE_STATUSES = ["available", "stopped", "suspended"] as const satisfies readonly VehicleStatus[];

export type ManualVehicleStatus = (typeof MANUAL_VEHICLE_STATUSES)[number];

export const MANUAL_VEHICLE_STATUS_LABELS: Record<ManualVehicleStatus, string> = {
  available: VEHICLE_STATUS_LABELS.available,
  stopped: "ادخال المركبة للصيانة",
  suspended: VEHICLE_STATUS_LABELS.suspended,
};

export const PERIODIC_MAINTENANCE_INTERVAL_LABELS: Record<
  VehiclePeriodicMaintenanceInterval,
  string
> = {
  every_1_month: "كل شهر",
  every_2_months: "كل شهرين",
  every_3_months: "كل 3 شهور",
};
