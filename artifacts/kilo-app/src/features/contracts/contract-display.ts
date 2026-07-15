import type { ContractStatus } from "@workspace/contracts-domain";
import { EXPIRING_SOON_THRESHOLD_DAYS } from "@workspace/notifications-domain";
import { notificationKindBadgeClass } from "@/features/notifications/notification-display";
import { vehicleStatusBadgeClass } from "@/features/vehicles/vehicle-display";

export const CONTRACT_STATUS_BADGE_BASE_CLASS =
  "inline-flex shrink-0 items-center whitespace-nowrap rounded-md border px-2.5 py-0.5 text-xs font-semibold";

export function contractExpiringSoonBadgeClass(): string {
  return notificationKindBadgeClass("alert");
}

export function contractStatusBadgeClass(status: ContractStatus): string {
  switch (status) {
    case "draft":
      return "bg-slate-500/10 text-slate-700 border-slate-200";
    case "active":
      return vehicleStatusBadgeClass("rented");
    case "overdue":
      return notificationKindBadgeClass("warning");
    case "cancelled":
      return "bg-red-500/10 text-red-700 border-red-200";
    case "closed":
      return notificationKindBadgeClass("notice");
  }
}

export function isContractExpiringSoonRemaining(contract: {
  status: ContractStatus;
  remainingDays: number;
}): boolean {
  return (
    contract.status === "active" &&
    contract.remainingDays > 0 &&
    contract.remainingDays <= EXPIRING_SOON_THRESHOLD_DAYS
  );
}
