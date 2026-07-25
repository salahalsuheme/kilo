import type { ContractStatus } from "./types.js";

export const VEHICLE_HANDOVER_MENU_LABEL = "استلام / تسليم" as const;
export const VEHICLE_HANDOVER_RECEIPT_LABEL = "استلام" as const;
export const VEHICLE_HANDOVER_PRINT_RECEIPT_LABEL = "طباعة محضر الاستلام" as const;
export const VEHICLE_HANDOVER_DELIVERY_LABEL = "تسليم" as const;

export type VehicleHandoverContractFlags = {
  status: ContractStatus;
  hasVehicleDamageForm: boolean;
  hasVehicleDeliveryDamageForm?: boolean;
};

/** محضر الاستلام يُعدّل فقط في المسودة؛ يُقفل بعد التنشيط. */
export function isVehicleReceiptHandoverLocked(contract: VehicleHandoverContractFlags): boolean {
  return contract.status !== "draft";
}

/** بعد التنشيط: طباعة محضر الاستلام من المتصفح (قراءة GET فقط). */
export function canPrintVehicleReceiptHandover(contract: VehicleHandoverContractFlags): boolean {
  return isVehicleReceiptHandoverLocked(contract) && contract.hasVehicleDamageForm;
}

/** محضر التسليم يتاح بعد وجود محضر استلام وتنشيط العقد (أي حالة غير مسودة). */
export function isVehicleDeliveryHandoverDisabled(contract: VehicleHandoverContractFlags): boolean {
  if (!contract.hasVehicleDamageForm) return true;
  return contract.status === "draft";
}
