import type { VehiclePeriodicMaintenanceInterval, VehicleStatus } from "./types.js";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const PERIODIC_MAINTENANCE_INTERVAL_DAYS: Record<
  VehiclePeriodicMaintenanceInterval,
  number
> = {
  every_1_month: 30,
  every_2_months: 60,
  every_3_months: 90,
};

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function calendarDaysBetween(from: Date, to: Date): number {
  const start = startOfLocalDay(from);
  const end = startOfLocalDay(to);
  return Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY);
}

export interface MaintenanceCounterState {
  periodicMaintenanceAnchorAt: Date;
  maintenanceCounterPausedRemainingDays: number | null;
  periodicMaintenanceInterval: VehiclePeriodicMaintenanceInterval;
  status: VehicleStatus;
}

export interface MaintenanceCounterFields {
  periodicMaintenanceAnchorAt: Date;
  maintenanceCounterPausedRemainingDays: number | null;
}

function computeActiveRemainingDays(
  anchorAt: Date,
  interval: VehiclePeriodicMaintenanceInterval,
  now: Date,
): number {
  const intervalDays = PERIODIC_MAINTENANCE_INTERVAL_DAYS[interval];
  const elapsed = calendarDaysBetween(anchorAt, now);
  return Math.max(0, intervalDays - elapsed);
}

/** Remaining calendar days until periodic maintenance is due. */
export function computeRemainingPeriodicMaintenanceDays(
  state: MaintenanceCounterState,
  now: Date = new Date(),
): number {
  if (state.status === "stopped" && state.maintenanceCounterPausedRemainingDays != null) {
    return state.maintenanceCounterPausedRemainingDays;
  }
  return computeActiveRemainingDays(
    state.periodicMaintenanceAnchorAt,
    state.periodicMaintenanceInterval,
    now,
  );
}

export function maintenanceDueAtFromRemaining(
  remainingDays: number,
  now: Date = new Date(),
): Date {
  const due = startOfLocalDay(now);
  due.setDate(due.getDate() + remainingDays);
  return new Date(due.getFullYear(), due.getMonth(), due.getDate(), 23, 59, 59, 999);
}

export function formatRemainingPeriodicMaintenanceDays(days: number): string {
  if (days <= 0) return "حان موعد الصيانة الدورية";
  return `متبقي ${days} يوم على الصيانة الدورية`;
}

/** Apply counter pause/resume rules when vehicle status changes. */
export function resolveMaintenanceCounterOnStatusChange(
  previousStatus: VehicleStatus,
  nextStatus: VehicleStatus,
  current: MaintenanceCounterFields & {
    periodicMaintenanceInterval: VehiclePeriodicMaintenanceInterval;
  },
  now: Date = new Date(),
): MaintenanceCounterFields {
  const { periodicMaintenanceAnchorAt, maintenanceCounterPausedRemainingDays, periodicMaintenanceInterval } =
    current;

  if (previousStatus === "stopped" && nextStatus === "available") {
    return { periodicMaintenanceAnchorAt: now, maintenanceCounterPausedRemainingDays: null };
  }

  if (nextStatus === "stopped" && previousStatus !== "stopped") {
    const remaining = computeActiveRemainingDays(
      periodicMaintenanceAnchorAt,
      periodicMaintenanceInterval,
      now,
    );
    return { periodicMaintenanceAnchorAt, maintenanceCounterPausedRemainingDays: remaining };
  }

  return { periodicMaintenanceAnchorAt, maintenanceCounterPausedRemainingDays };
}
