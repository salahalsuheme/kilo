import type { ContractStatus } from "./types.js";
import { computePenaltyTotal, overdueRentalDays } from "./contract-penalty.js";

export interface ContractPenaltySnapshot {
  overdueDays: number;
  penaltyTotal: number;
}

export function resolveContractPenaltySnapshot(input: {
  endAt: Date;
  status: ContractStatus;
  storedOverdueDays: number;
  storedPenaltyTotal: number;
  now?: Date;
}): ContractPenaltySnapshot {
  const now = input.now ?? new Date();

  if (input.status === "overdue") {
    const overdueDays = overdueRentalDays(input.endAt, now);
    return { overdueDays, penaltyTotal: computePenaltyTotal(overdueDays) };
  }

  if (input.status === "closed") {
    return {
      overdueDays: input.storedOverdueDays,
      penaltyTotal: input.storedPenaltyTotal,
    };
  }

  return { overdueDays: 0, penaltyTotal: 0 };
}

export function snapshotPenaltyAtClose(
  endAt: Date,
  now: Date = new Date(),
): ContractPenaltySnapshot {
  const overdueDays = overdueRentalDays(endAt, now);
  return { overdueDays, penaltyTotal: computePenaltyTotal(overdueDays) };
}
