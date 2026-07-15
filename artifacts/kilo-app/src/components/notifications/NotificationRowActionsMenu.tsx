import type { Notification } from "@/lib/api-client-react-tenant";
import { buildCustomerNotificationMessage } from "@workspace/notifications-domain";
import { isContractNotification } from "@/features/notifications/notification-source";
import { openWhatsAppChat } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "wouter";
import { Car, ExternalLink, MessageCircle, MoreHorizontal } from "lucide-react";

interface NotificationRowActionsMenuProps {
  notification: Notification;
}

export function NotificationRowActionsMenu({
  notification,
}: NotificationRowActionsMenuProps) {
  const isContract = isContractNotification(notification);
  const hasMobile = notification.customerMobile.trim().length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {isContract ? (
          <>
            <DropdownMenuItem
              disabled={!hasMobile}
              onClick={(e) => {
                e.stopPropagation();
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
              <MessageCircle className="h-4 w-4 me-2" />
              إرسال التنبيه إلى العميل
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/contracts"
                className="flex items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4 me-2" />
                عرض العقود
              </Link>
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem asChild>
            <Link
              href="/vehicles"
              className="flex items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Car className="h-4 w-4 me-2" />
              عرض المركبات
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
