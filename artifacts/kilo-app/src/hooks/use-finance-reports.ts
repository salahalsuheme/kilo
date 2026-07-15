import { useQueryClient } from "@tanstack/react-query";
import {
  getGetFinanceReportQueryKey,
  useGetFinanceReport,
} from "@/lib/api-client-react-tenant";
import { resolveQueryError } from "@/lib/api-error";
import { withOrgKey } from "@/lib/tenant-cache";
import { useOrgId } from "@/hooks/use-invalidate";

interface UseFinanceReportsOptions {
  year: number;
  month: number;
}

export function useFinanceReports({ year, month }: UseFinanceReportsOptions) {
  const orgId = useOrgId();
  const queryClient = useQueryClient();

  const reportQuery = useGetFinanceReport(
    { year, month },
    {
      query: {
        queryKey: getGetFinanceReportQueryKey({ year, month }),
      },
    },
  );

  const invalidateReport = () => {
    if (orgId == null) return;
    void queryClient.invalidateQueries({
      queryKey: withOrgKey(orgId, getGetFinanceReportQueryKey()),
    });
  };

  return {
    report: reportQuery.data,
    isLoading: reportQuery.isLoading,
    reportError: resolveQueryError(
      reportQuery.isError,
      reportQuery.error,
      "تعذر تحميل التقرير المالي",
    ),
    invalidateReport,
  };
}
