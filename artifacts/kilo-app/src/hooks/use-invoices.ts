import { useQueryClient } from "@tanstack/react-query";
import {
  getListInvoicesQueryKey,
  useListInvoices,
} from "@/lib/api-client-react-tenant";
import type { InvoiceStatus } from "@/lib/api-client-react-tenant";
import { resolveQueryError } from "@/lib/api-error";
import { withOrgKey } from "@/lib/tenant-cache";
import { useOrgId } from "@/hooks/use-invalidate";

export const PAGE_SIZE = 10;

interface UseInvoicesOptions {
  search: string;
  statusFilter: string;
  page: number;
}

export function useInvoices({ search, statusFilter, page }: UseInvoicesOptions) {
  const orgId = useOrgId();
  const queryClient = useQueryClient();

  const status: InvoiceStatus | undefined =
    statusFilter !== "all" ? (statusFilter as InvoiceStatus) : undefined;

  const listQuery = useListInvoices(
    { search: search || undefined, status, page, pageSize: PAGE_SIZE },
    {
      query: {
        queryKey: getListInvoicesQueryKey({
          search: search || undefined,
          status,
          page,
          pageSize: PAGE_SIZE,
        }),
        placeholderData: (prev) => prev,
      },
    },
  );

  const invalidateList = () => {
    if (orgId == null) return;
    void queryClient.invalidateQueries({
      queryKey: withOrgKey(orgId, getListInvoicesQueryKey()),
    });
  };

  return {
    invoices: listQuery.data?.data ?? [],
    total: listQuery.data?.total ?? 0,
    isLoading: listQuery.isLoading,
    listError: resolveQueryError(listQuery.isError, listQuery.error, "تعذر تحميل الفواتير"),
    PAGE_SIZE,
    invalidateList,
  };
}
