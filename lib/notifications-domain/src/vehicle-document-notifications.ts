import { remainingCalendarDaysUntil, expiryDateToEndAt } from "@workspace/vehicles-domain";
import type { NotificationKind } from "./types.js";

export const VEHICLE_DOCUMENT_EXPIRY_THRESHOLD_DAYS = 35;

export type VehicleDocumentType = "registration" | "inspection";

export interface VehicleDocumentNotificationInput {
  carId: number;
  brand: string;
  plateNumber: string;
  registrationExpiryDate: string | Date;
  inspectionExpiryDate: string | Date;
}

export interface VehicleDocumentNotification {
  id: string;
  source: "vehicle_document";
  kind: NotificationKind;
  message: string;
  carId: number;
  vehicleDocumentType: VehicleDocumentType;
  vehiclePlateNumber: string;
  customerName: string;
  endAt: Date;
  remainingDays: number;
}

const DOCUMENT_LABELS: Record<VehicleDocumentType, string> = {
  registration: "استمارة السيارة",
  inspection: "الفحص الدوري",
};

function formatRemainingDaysLabel(days: number): string {
  if (days === 1) return "يوم واحد";
  if (days === 2) return "يومين";
  return `${days} يوم`;
}

function isVehicleDocumentExpiringSoon(
  expiryDate: string | Date,
  now: Date = new Date(),
): number | null {
  const remaining = remainingCalendarDaysUntil(expiryDate, now);
  if (remaining <= 0 || remaining > VEHICLE_DOCUMENT_EXPIRY_THRESHOLD_DAYS) return null;
  return remaining;
}

export function buildVehicleDocumentNotifications(
  input: VehicleDocumentNotificationInput,
  now: Date = new Date(),
): VehicleDocumentNotification[] {
  const notifications: VehicleDocumentNotification[] = [];
  const documents: Array<{ type: VehicleDocumentType; expiryDate: string | Date }> = [
    { type: "registration", expiryDate: input.registrationExpiryDate },
    { type: "inspection", expiryDate: input.inspectionExpiryDate },
  ];

  for (const document of documents) {
    const remaining = isVehicleDocumentExpiringSoon(document.expiryDate, now);
    if (remaining == null) continue;

    const documentLabel = DOCUMENT_LABELS[document.type];
    notifications.push({
      id: `vehicle-${document.type}-${input.carId}`,
      source: "vehicle_document",
      kind: "alert",
      message: `ينتهي ${documentLabel} للمركبة ${input.plateNumber} (${input.brand}) خلال ${formatRemainingDaysLabel(remaining)}`,
      carId: input.carId,
      vehicleDocumentType: document.type,
      vehiclePlateNumber: input.plateNumber,
      customerName: input.brand,
      endAt: expiryDateToEndAt(document.expiryDate),
      remainingDays: remaining,
    });
  }

  return notifications;
}
