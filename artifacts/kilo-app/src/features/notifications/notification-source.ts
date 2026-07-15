import type { Notification } from "@/lib/api-client-react-tenant";

export function isContractNotification(notification: Notification): boolean {
  return notification.source === "contract";
}

export function isVehicleFleetNotification(notification: Notification): boolean {
  return notification.source === "vehicle_document" || notification.source === "vehicle_maintenance";
}
