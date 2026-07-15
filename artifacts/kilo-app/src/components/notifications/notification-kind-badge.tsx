import type { Notification } from "@/lib/api-client-react-tenant";
import { NOTIFICATION_KIND_LABELS } from "@workspace/notifications-domain";
import {
  notificationKindBadgeClass,
  notificationKindIconClass,
} from "@/features/notifications/notification-display";
import { cn } from "@/lib/utils";
import { BellRing, CheckCircle2, Wrench } from "lucide-react";

export function NotificationKindIcon({ kind }: { kind: Notification["kind"] }) {
  const iconClass = cn("h-4 w-4 shrink-0", notificationKindIconClass(kind));
  if (kind === "notice") {
    return <CheckCircle2 className={iconClass} />;
  }
  if (kind === "maintenance") {
    return <Wrench className={iconClass} />;
  }
  return <BellRing className={iconClass} />;
}

export function NotificationKindBadge({ kind }: { kind: Notification["kind"] }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center whitespace-nowrap rounded-md border px-2.5 py-0.5 text-xs font-semibold",
        notificationKindBadgeClass(kind),
      )}
    >
      {NOTIFICATION_KIND_LABELS[kind]}
    </span>
  );
}
