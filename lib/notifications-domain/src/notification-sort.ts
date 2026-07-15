import { EXPIRING_SOON_THRESHOLD_DAYS } from "./contract-notifications.js";
import { VEHICLE_DOCUMENT_EXPIRY_THRESHOLD_DAYS } from "./vehicle-document-notifications.js";
import { PERIODIC_MAINTENANCE_NOTIFICATION_THRESHOLD_DAYS } from "./vehicle-maintenance-notifications.js";
import type { NotificationKind } from "./types.js";

export type NotificationSource = "contract" | "vehicle_document" | "vehicle_maintenance";

export function notificationSortPriority(notification: {
  kind: NotificationKind;
  source?: NotificationSource;
  remainingDays?: number | null;
}): number {
  if (notification.kind === "warning") return 0;
  if (notification.kind === "maintenance") {
    return 10 + (notification.remainingDays ?? PERIODIC_MAINTENANCE_NOTIFICATION_THRESHOLD_DAYS);
  }
  if (notification.kind === "alert") {
    if (notification.source === "vehicle_document") {
      return 20 + (notification.remainingDays ?? VEHICLE_DOCUMENT_EXPIRY_THRESHOLD_DAYS);
    }
    return 1 + (notification.remainingDays ?? EXPIRING_SOON_THRESHOLD_DAYS);
  }
  return 100;
}
