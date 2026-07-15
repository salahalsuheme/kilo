import { z } from "zod";
import { isRentalPeriodEnded } from "./contract-penalty.js";
import type { ContractStatus } from "./types.js";

const CONTRACT_STATUS_VALUES = [
  "draft",
  "active",
  "overdue",
  "cancelled",
  "closed",
] as const satisfies readonly ContractStatus[];

export const UpdateContractStatusBodySchema = z.object({
  status: z.enum(CONTRACT_STATUS_VALUES, {
    message: "حالة العقد غير صالحة",
  }),
});

export type UpdateContractStatusBodyInput = z.infer<typeof UpdateContractStatusBodySchema>;

export function isValidContractStatusTransition(
  current: ContractStatus,
  next: ContractStatus,
): boolean {
  if (current === next) return true;
  if (current === "draft" && (next === "active" || next === "cancelled")) return true;
  if (current === "active" && (next === "cancelled" || next === "closed")) return true;
  if (current === "overdue" && next === "closed") return true;
  return false;
}

export function canActivateDraftContract(endAt: Date, now: Date = new Date()): boolean {
  return !isRentalPeriodEnded(endAt, now);
}

export function getDraftActivationError(endAt: Date, now: Date = new Date()): string | null {
  return canActivateDraftContract(endAt, now)
    ? null
    : CONTRACT_STATUS_ERRORS.activateDeliveryDatePassed;
}

export const CONTRACT_STATUS_ERRORS = {
  deleteOnlyDraft: "يمكن حذف العقود المسودة فقط",
  editOnlyDraft: "يمكن تعديل العقود المسودة فقط",
  activateDeliveryDatePassed: "لا يمكن تنشيط العقد لأن تاريخ التسليم قد مضى",
  carInMaintenance: "المركبة في وضع الصيانة ولا يمكن تأجيرها",
  carTemporarilySuspended: "المركبة موقوفة مؤقتاً ولا يمكن تأجيرها",
  carNotAvailable: "المركبة غير متاحة للتأجير",
  invalidTransition: "لا يمكن تغيير حالة العقد بهذه الطريقة",
  customerNotFound: "العميل غير موجود",
  carNotFound: "المركبة غير موجودة",
  templateNotFound: "قالب العقد غير موجود",
} as const;
