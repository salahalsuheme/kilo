import type { NotificationKind } from "./types.js";

export const NOTIFICATION_KIND_LABELS: Record<NotificationKind, string> = {
  alert: "تنبيه",
  warning: "متأخر - تحت الغرامة",
  notice: "مكتمل",
  maintenance: "صيانة دورية",
};
