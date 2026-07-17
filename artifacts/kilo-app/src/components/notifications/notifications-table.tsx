import type { Notification } from "@/lib/api-client-react-tenant";
import { NotificationRowActionsMenu } from "@/components/notifications/NotificationRowActionsMenu";
import {
  NotificationKindBadge,
  NotificationKindIcon,
} from "@/components/notifications/notification-kind-badge";
import { formatContractDateTime } from "@workspace/contracts-domain";
import { isContractNotification } from "@/features/notifications/notification-source";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface NotificationsTableProps {
  notifications: Notification[];
  isLoading: boolean;
  kindFilter: string;
}

export function NotificationsTable({
  notifications,
  isLoading,
  kindFilter,
}: NotificationsTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table className="table-fixed w-full">
          <colgroup>
            <col style={{ width: "12%" }} />
            <col style={{ width: "31%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "5.5rem" }} />
            <col style={{ width: "4.5rem" }} />
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[12%]">النوع</TableHead>
              <TableHead className="w-[31%]">الرسالة</TableHead>
              <TableHead className="w-[14%]">العميل</TableHead>
              <TableHead className="w-[11%]">المركبة</TableHead>
              <TableHead className="w-[14%]">تاريخ الانتهاء</TableHead>
              <TableHead className="w-[5.5rem] text-start">المتبقي</TableHead>
              <TableHead className="w-[4.5rem] text-center text-black">إجراء</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : notifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  {kindFilter !== "all" ? "لا توجد نتائج" : "لا توجد إشعارات"}
                </TableCell>
              </TableRow>
            ) : (
              notifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell className="min-w-0 align-top">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <NotificationKindIcon kind={notification.kind} />
                      <NotificationKindBadge kind={notification.kind} />
                    </div>
                  </TableCell>
                  <TableCell className="min-w-0 align-top text-sm leading-snug">
                    <p className="line-clamp-2 break-words" title={notification.message}>
                      {notification.message}
                    </p>
                  </TableCell>
                  <TableCell className="min-w-0 truncate align-top">
                    {isContractNotification(notification) ? notification.customerName : "—"}
                  </TableCell>
                  <TableCell className="min-w-0 whitespace-nowrap align-top">
                    <bdi>{notification.vehiclePlateNumber}</bdi>
                  </TableCell>
                  <TableCell className="whitespace-nowrap align-top text-xs leading-tight sm:text-sm">
                    {formatContractDateTime(notification.endAt)}
                  </TableCell>
                  <TableCell className="min-w-0 whitespace-nowrap align-top px-2 text-start text-sm">
                    {notification.remainingDays != null ? (
                      <span className="font-medium text-amber-700">
                        {notification.remainingDays} يوم
                      </span>
                    ) : notification.overdueDays != null ? (
                      <span className="font-medium text-red-600">
                        {notification.overdueDays} يوم
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-1.5 py-2 text-center align-top">
                    <NotificationRowActionsMenu notification={notification} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
