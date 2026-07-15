import { Bell, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { ApiErrorBanner } from "@/components/api-error-banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationsPreviewList } from "@/components/notifications/notifications-preview-list";
import {
  DASHBOARD_NOTIFICATIONS_PREVIEW_SIZE,
  NOTIFICATIONS_PATH,
} from "@/features/notifications/notifications.constants";
import { useNotifications } from "@/hooks/use-notifications";

export function DashboardNotificationsPreviewCard() {
  const { notifications, isLoading, listError } = useNotifications({
    page: 1,
    kindFilter: "all",
    pageSize: DASHBOARD_NOTIFICATIONS_PREVIEW_SIZE,
  });

  return (
    <Card className="glass-card border-0">
      <CardHeader className="pb-3">
        <Link
          href={NOTIFICATIONS_PATH}
          className="group flex items-center justify-between gap-2 rounded-lg transition-colors hover:text-primary"
        >
          <CardTitle className="flex items-center gap-2.5 text-xl font-bold">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Bell className="h-5 w-5" />
            </span>
            الإشعارات
          </CardTitle>
          <span className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary">
            عرض الكل
            <ChevronLeft className="h-3.5 w-3.5" />
          </span>
        </Link>
      </CardHeader>
      <CardContent>
        <ApiErrorBanner message={listError} className="mb-3" />
        {isLoading ? (
          <p className="text-sm text-muted-foreground">جاري التحميل...</p>
        ) : (
          <NotificationsPreviewList notifications={notifications} compact />
        )}
      </CardContent>
    </Card>
  );
}
