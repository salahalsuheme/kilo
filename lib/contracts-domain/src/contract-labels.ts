import type { ContractStatus } from "./types.js";

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  draft: "مسودة",
  active: "ساري",
  overdue: "متأخر - تحت الغرامة",
  cancelled: "ملغي",
  closed: "مكتمل / مقفل",
};
