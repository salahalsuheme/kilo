import type { ContractStatus } from "./types.js";
import { isRentalPeriodEnded, overdueRentalDays } from "./contract-penalty.js";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function rentalDurationDays(startAt: Date, endAt: Date): number {
  const diff = endAt.getTime() - startAt.getTime();
  if (diff <= 0) return 0;
  return Math.max(1, Math.ceil(diff / MS_PER_DAY));
}

export function remainingRentalDays(
  endAt: Date,
  status: ContractStatus,
  now: Date = new Date(),
): number {
  if (status !== "active") return 0;
  if (isRentalPeriodEnded(endAt, now)) return 0;
  const diff = endAt.getTime() - now.getTime();
  return Math.ceil(diff / MS_PER_DAY);
}

export function contractOverdueDays(
  endAt: Date,
  status: ContractStatus,
  now: Date = new Date(),
): number {
  if (status !== "overdue") return 0;
  return overdueRentalDays(endAt, now);
}
