import { CONTRACT_STATUS_LABELS } from "./contract-labels.js";
import type { ContractStatus } from "./types.js";

export type ContractListStatusFilter = ContractStatus | "expiring_soon";

export const CONTRACT_LIST_STATUS_FILTER_VALUES = [
  "draft",
  "active",
  "expiring_soon",
  "overdue",
  "cancelled",
  "closed",
] as const satisfies readonly ContractListStatusFilter[];

export const CONTRACT_LIST_STATUS_FILTER_LABELS: Record<ContractListStatusFilter, string> = {
  draft: CONTRACT_STATUS_LABELS.draft,
  active: CONTRACT_STATUS_LABELS.active,
  expiring_soon: "ينتهي قريباً",
  overdue: CONTRACT_STATUS_LABELS.overdue,
  cancelled: CONTRACT_STATUS_LABELS.cancelled,
  closed: CONTRACT_STATUS_LABELS.closed,
};

export function isContractListStatusFilter(
  value: string,
): value is ContractListStatusFilter {
  return (CONTRACT_LIST_STATUS_FILTER_VALUES as readonly string[]).includes(value);
}
