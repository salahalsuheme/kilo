import {
  computeRemainingPeriodicMaintenanceDays,
  maintenanceDueAtFromRemaining,
  type MaintenanceCounterState,
} from "@workspace/vehicles-domain";

export const PERIODIC_MAINTENANCE_NOTIFICATION_THRESHOLD_DAYS = 3;

export interface VehicleMaintenanceNotificationInput {
  carId: number;
  brand: string;
  plateNumber: string;
  periodicMaintenanceAnchorAt: Date;
  maintenanceCounterPausedRemainingDays: number | null;
  periodicMaintenanceInterval: MaintenanceCounterState["periodicMaintenanceInterval"];
  status: MaintenanceCounterState["status"];
}

export interface VehicleMaintenanceNotification {
  id: string;
  source: "vehicle_maintenance";
  kind: "maintenance";
  message: string;
  carId: number;
  vehiclePlateNumber: string;
  customerName: string;
  endAt: Date;
  remainingDays: number;
}

function formatRemainingDaysLabel(days: number): string {
  if (days === 0) return "اليوم";
  if (days === 1) return "يوم واحد";
  if (days === 2) return "يومين";
  return `${days} يوم`;
}

function isPeriodicMaintenanceDueSoon(remainingDays: number): boolean {
  return remainingDays >= 0 && remainingDays <= PERIODIC_MAINTENANCE_NOTIFICATION_THRESHOLD_DAYS;
}

export function buildVehicleMaintenanceNotification(
  input: VehicleMaintenanceNotificationInput,
  now: Date = new Date(),
): VehicleMaintenanceNotification | null {
  const remaining = computeRemainingPeriodicMaintenanceDays(
    {
      periodicMaintenanceAnchorAt: input.periodicMaintenanceAnchorAt,
      maintenanceCounterPausedRemainingDays: input.maintenanceCounterPausedRemainingDays,
      periodicMaintenanceInterval: input.periodicMaintenanceInterval,
      status: input.status,
    },
    now,
  );

  if (!isPeriodicMaintenanceDueSoon(remaining)) return null;

  const timingLabel = formatRemainingDaysLabel(remaining);

  return {
    id: `vehicle-maintenance-${input.carId}`,
    source: "vehicle_maintenance",
    kind: "maintenance",
    message: `حلول موعد الصيانة الدورية لمركبة ${input.brand} برقم لوحة ${input.plateNumber} خلال ${timingLabel}`,
    carId: input.carId,
    vehiclePlateNumber: input.plateNumber,
    customerName: input.brand,
    endAt: maintenanceDueAtFromRemaining(remaining, now),
    remainingDays: remaining,
  };
}
