import { Users, Car, CarFront, CircleOff } from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";
import { PageHeader } from "@/components/page-header";
import { ApiErrorBanner } from "@/components/api-error-banner";
import { GlassStatCard, GlassStatCardSkeleton } from "@/components/dashboard/GlassStatCard";
import { DashboardQuickStartCard } from "@/components/dashboard/DashboardQuickStartCard";
import { DashboardNotificationsPreviewCard } from "@/components/dashboard/DashboardNotificationsPreviewCard";
import { useGetDashboardSummary } from "@/lib/api-client-react-tenant";
import { resolveQueryError } from "@/lib/api-error";

export default function DashboardPage() {
  usePageTitle("لوحة التحكم");

  const { data: summary, isLoading: summaryLoading, isError, error } = useGetDashboardSummary();
  const summaryError = resolveQueryError(isError, error, "تعذر تحميل ملخص لوحة التحكم");

  return (
    <div className="space-y-6">
      <PageHeader title="لوحة التحكم" description="نظرة عامة على نشاط التأجير" />

      <ApiErrorBanner message={summaryError} />

      <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-2 xl:grid-cols-4">
        {summaryLoading ? (
          Array.from({ length: 4 }).map((_, i) => <GlassStatCardSkeleton key={i} />)
        ) : (
          <>
            <GlassStatCard
              icon={Users}
              iconBg="bg-purple-500"
              title="العملاء"
              value={summary?.customersCount ?? 0}
              subtitle="إجمالي العملاء المسجلين"
            />
            <GlassStatCard
              icon={Car}
              iconBg="bg-blue-500"
              title="سيارات مؤجرة"
              value={summary?.rentedCarsCount ?? 0}
              subtitle="قيد التأجير حالياً"
            />
            <GlassStatCard
              icon={CarFront}
              iconBg="bg-emerald-500"
              title="سيارات متاحة"
              value={summary?.availableCarsCount ?? 0}
              subtitle="جاهزة للتأجير"
            />
            <GlassStatCard
              icon={CircleOff}
              iconBg="bg-orange-500"
              title="سيارات متوقفة"
              value={summary?.stoppedCarsCount ?? 0}
              subtitle="خارج الخدمة"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.5fr)] lg:gap-6">
        <DashboardQuickStartCard />
        <DashboardNotificationsPreviewCard />
      </div>
    </div>
  );
}
