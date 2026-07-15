import {
  contractOverdueDays,
  computePenaltyTotal,
  remainingRentalDays,
  type ContractStatus,
} from "@workspace/contracts-domain";
import type { NotificationKind } from "./types.js";

export const EXPIRING_SOON_THRESHOLD_DAYS = 2;

export interface ContractNotificationInput {
  contractId: number;
  customerName: string;
  vehiclePlateNumber: string;
  endAt: Date;
  status: ContractStatus;
}

export interface ContractNotification {
  id: string;
  source: "contract";
  kind: NotificationKind;
  message: string;
  contractId: number;
  customerName: string;
  vehiclePlateNumber: string;
  endAt: Date;
  remainingDays: number | null;
  overdueDays: number | null;
  penaltyTotal: number | null;
}

export function isContractExpiringSoon(
  endAt: Date,
  status: ContractStatus,
  now: Date = new Date(),
): boolean {
  if (status !== "active") return false;
  const remaining = remainingRentalDays(endAt, status, now);
  return remaining > 0 && remaining <= EXPIRING_SOON_THRESHOLD_DAYS;
}

export function isContractOverdueNotification(status: ContractStatus): boolean {
  return status === "overdue";
}

export function isContractClosedNotification(status: ContractStatus): boolean {
  return status === "closed";
}

function formatRemainingDaysLabel(days: number): string {
  if (days === 1) return "يوم واحد";
  if (days === 2) return "يومين";
  return `${days} أيام`;
}

export function buildContractNotification(
  input: ContractNotificationInput,
  now: Date = new Date(),
): ContractNotification | null {
  const { contractId, customerName, vehiclePlateNumber, endAt, status } = input;

  if (isContractOverdueNotification(status)) {
    const overdueDays = contractOverdueDays(endAt, status, now);
    const penaltyTotal = computePenaltyTotal(overdueDays);
    return {
      id: `warning-${contractId}`,
      source: "contract",
      kind: "warning",
      message: `عقد العميل ${customerName} (${vehiclePlateNumber}) متأخر - تحت الغرامة`,
      contractId,
      customerName,
      vehiclePlateNumber,
      endAt,
      remainingDays: null,
      overdueDays,
      penaltyTotal,
    };
  }

  if (isContractClosedNotification(status)) {
    return {
      id: `notice-${contractId}`,
      source: "contract",
      kind: "notice",
      message: `تم إقفال عقد العميل ${customerName} (${vehiclePlateNumber})`,
      contractId,
      customerName,
      vehiclePlateNumber,
      endAt,
      remainingDays: null,
      overdueDays: null,
      penaltyTotal: null,
    };
  }

  if (isContractExpiringSoon(endAt, status, now)) {
    const remaining = remainingRentalDays(endAt, status, now);
    return {
      id: `alert-${contractId}`,
      source: "contract",
      kind: "alert",
      message: `عقد العميل ${customerName} (${vehiclePlateNumber}) ينتهي خلال ${formatRemainingDaysLabel(remaining)}`,
      contractId,
      customerName,
      vehiclePlateNumber,
      endAt,
      remainingDays: remaining,
      overdueDays: null,
      penaltyTotal: null,
    };
  }

  return null;
}

export interface CustomerNotificationMessageInput {
  kind: NotificationKind;
  customerName: string;
  contractNumber: string;
  vehiclePlateNumber: string;
  remainingDays: number | null;
  overdueDays: number | null;
}

export function buildCustomerNotificationMessage(
  input: CustomerNotificationMessageInput,
): string {
  const customerName = input.customerName.trim();
  const contractNumber = input.contractNumber.trim();
  const plate = input.vehiclePlateNumber;

  if (input.kind === "notice") {
    return [
      "🔔 تنبيــه آلي :",
      `مرحبا "${customerName}"`,
      `تم اقفال العقد "${contractNumber}" وإستلام السيارة "${plate}" وانتهاء مدة التأجير.`,
      "لاتتردد في طلب الخدمة مرة أخرى",
      "سعداء جدا بخدمتكم",
      " *كيلو للـتأجير*",
    ].join("\n");
  }

  if (input.kind === "warning") {
    const days = input.overdueDays ?? 1;
    return [
      "🔔 تنبيــه آلي :",
      `مرحبا "${customerName}"`,
      `🚚 عقد إيجار المركبة ${plate} متأخر ${formatRemainingDaysLabel(days)}.`,
      "يرجى الإلتزام بتسليم السيارة في أقرب وقت",
      "لتجنب غرامات التأخير .",
      "سعداء جدا بخدمتكم",
      " *كيلو للـتأجير*",
    ].join("\n");
  }

  const days = input.remainingDays ?? 1;
  return [
    "🔔 تنبيــه آلي :",
    `مرحبا "${customerName}"`,
    `🚚 عقد إيجار المركبة ${plate} ينتهي خلال ${formatRemainingDaysLabel(days)}.`,
    "يرجى الإلتزام بتسليم السيارة في اليوم المحدد حسب العقد",
    "لتجنب غرامات التأخير .",
    "يمكنك التواصل معنا للتجديد",
    "سعداء جدا بخدمتكم",
    " *كيلو للـتأجير*",
  ].join("\n");
}
