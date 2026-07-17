import { remainingRentalDays } from "./contract-duration.js";
import type { ContractStatus } from "./types.js";

export const EXPIRING_SOON_THRESHOLD_DAYS = 2;

export function isContractExpiringSoon(
  endAt: Date,
  status: ContractStatus,
  now: Date = new Date(),
): boolean {
  if (status !== "active") return false;
  const remaining = remainingRentalDays(endAt, status, now);
  return remaining > 0 && remaining <= EXPIRING_SOON_THRESHOLD_DAYS;
}
