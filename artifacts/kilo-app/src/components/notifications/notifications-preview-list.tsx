import type { Notification } from "@/lib/api-client-react-tenant";
import { NotificationRowActionsMenu } from "@/components/notifications/NotificationRowActionsMenu";
import {
  NotificationKindBadge,
  NotificationKindIcon,
} from "@/components/notifications/notification-kind-badge";
import { buildCustomerNotificationMessage } from "@workspace/notifications-domain";
import { isContractNotification } from "@/features/notifications/notification-source";
import { openWhatsAppChat } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationsPreviewListProps {
  notifications: Notification[];
  compact?: boolean;
  emptyMessage?: string;
}

function RemainingDaysLabel({ notification }: { notification: Notification }) {
  if (notification.remainingDays != null) {
    return (
      <span className="font-medium text-amber-700">
        {notification.remainingDays} يوم
      </span>
    );
  }

  if (notification.overdueDays != null) {
    return (
      <span className="font-medium text-red-600">
        {notification.overdueDays} يوم
      </span>
    );
  }

  return <span className="text-muted-foreground">—</span>;
}

export function NotificationsPreviewList({
  notifications,
  compact = false,
  emptyMessage = "لا توجد إشعارات حالياً",
}: NotificationsPreviewListProps) {
  if (!notifications.length) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <ul className={compact ? "space-y-2" : "space-y-3"}>
      {notifications.map((notification) => {
        const isContract = isContractNotification(notification);
        const hasMobile = isContract && notification.customerMobile.trim().length > 0;

        return (
          <li
            key={notification.id}
            className={cn(
              "flex items-start transition-colors duration-200",
              compact
                ? "gap-2 rounded-lg border border-transparent bg-white/40 px-3 py-2 hover:border-amber-200/50 hover:bg-amber-50/55"
                : "gap-3 rounded-xl border border-border/60 bg-white/50 px-4 py-3 hover:border-amber-200/45 hover:bg-amber-50/50",
            )}
          >
            <div className="mt-0.5 shrink-0">
              <NotificationKindIcon kind={notification.kind} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-1.5">
                <NotificationKindBadge kind={notification.kind} />
                <RemainingDaysLabel notification={notification} />
              </div>
              <p
                className={`font-medium text-foreground ${compact ? "text-xs leading-snug" : "text-sm"}`}
                title={notification.message}
              >
                {notification.message}
              </p>
              <p className={`text-muted-foreground ${compact ? "text-[10px]" : "text-xs"}`}>
                {isContract ? (
                  <>
                    {notification.customerName}
                    {" · "}
                    <bdi>{notification.vehiclePlateNumber}</bdi>
                  </>
                ) : (
                  <bdi>{notification.vehiclePlateNumber}</bdi>
                )}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-0.5">
              {isContract ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={!hasMobile}
                  title={hasMobile ? "إرسال التنبيه إلى العميل" : "لا يوجد رقم جوال"}
                  onClick={() => {
                    if (!hasMobile) return;
                    const message = buildCustomerNotificationMessage({
                      kind: notification.kind,
                      customerName: notification.customerName,
                      contractNumber: notification.contractNumber ?? "",
                      vehiclePlateNumber: notification.vehiclePlateNumber,
                      remainingDays: notification.remainingDays ?? null,
                      overdueDays: notification.overdueDays ?? null,
                    });
                    openWhatsAppChat(notification.customerMobile, message);
                  }}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              ) : null}
              <NotificationRowActionsMenu notification={notification} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
