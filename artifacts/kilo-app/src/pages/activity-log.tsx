import { useEffect, useState } from "react";
import { usePageTitle } from "@/hooks/use-page-title";
import { ApiErrorBanner } from "@/components/api-error-banner";
import { PageHeader } from "@/components/page-header";
import { ActivityEventsList } from "@/components/dashboard/ActivityEventsList";
import { TenantPagination } from "@/components/tenant-pagination";
import { useActivityEvents } from "@/hooks/use-activity-events";

export default function ActivityLogPage() {
  usePageTitle("سجل الأحداث");

  const [page, setPage] = useState(1);
  const { events, total, pageSize, isLoading, listError } = useActivityEvents({ page });

  useEffect(() => {
    if (total === 0) return;
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    if (page > maxPage) setPage(maxPage);
  }, [total, page, pageSize]);

  return (
    <div className="space-y-6">
      <PageHeader title="سجل الأحداث" description="تتبع نشاط النظام" />

      <ApiErrorBanner message={listError} />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">جاري التحميل...</p>
      ) : (
        <div className="space-y-4">
          <ActivityEventsList events={events} />
          <TenantPagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
