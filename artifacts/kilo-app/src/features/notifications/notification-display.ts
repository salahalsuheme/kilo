import type { NotificationKind } from "@workspace/notifications-domain";

export function notificationKindBadgeClass(kind: NotificationKind): string {
  switch (kind) {
    case "notice":
      return "bg-green-500/10 text-green-700 border-green-200";
    case "alert":
      return "border-yellow-300 bg-yellow-100 text-yellow-800";
    case "warning":
      return "border-red-600 bg-red-600 text-white";
    case "maintenance":
      return "border-sky-300 bg-sky-50 text-sky-800";
  }
}

export function notificationKindIconClass(kind: NotificationKind): string {
  switch (kind) {
    case "notice":
      return "text-green-700";
    case "alert":
      return "text-yellow-800";
    case "warning":
      return "text-red-600";
    case "maintenance":
      return "text-sky-700";
  }
}
