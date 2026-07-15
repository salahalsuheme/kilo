import { useEffect, useState } from "react";
import { usePageTitle } from "@/hooks/use-page-title";
import { ApiErrorBanner } from "@/components/api-error-banner";
import { PageHeader } from "@/components/page-header";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationsToolbar } from "@/components/notifications/notifications-toolbar";
import { NotificationsTable } from "@/components/notifications/notifications-table";
import { TenantPagination } from "@/components/tenant-pagination";
import { mobileListPanelClass } from "@/components/mobile";

export default function NotificationsPage() {
  usePageTitle("الإشعارات");

  const [kindFilter, setKindFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { notifications, total, isLoading, listError, PAGE_SIZE } = useNotifications({
    page,
    kindFilter,
  });

  useEffect(() => {
    setPage(1);
  }, [kindFilter]);

  useEffect(() => {
    if (total === 0) return;
    const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (page > maxPage) setPage(maxPage);
  }, [total, page, PAGE_SIZE]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="الإشعارات"
        description="تنبيهات العقود وانتهاء استمارة المركبة والفحص الدوري (35 يوماً) والصيانة الدورية (3 أيام)"
      />

      <ApiErrorBanner message={listError} />

      <div className="flex flex-col">
        <div className={mobileListPanelClass} style={{ backgroundColor: "#f3f4f6" }}>
          <NotificationsToolbar
            kindFilter={kindFilter}
            onKindFilterChange={setKindFilter}
            rowCount={notifications.length}
            total={total}
            isLoading={isLoading}
          />

          <div className="mt-4 space-y-4">
            <NotificationsTable
              notifications={notifications}
              isLoading={isLoading}
              kindFilter={kindFilter}
            />
            <TenantPagination
              page={page}
              pageSize={PAGE_SIZE}
              total={total}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
