import { useQueryClient } from "@tanstack/react-query";
import {
  getGetFinanceReportQueryKey,
  getListInvoicesQueryKey,
  useListInvoices,
  useUpdateInvoice,
  useUpdateInvoiceStatus,
} from "@/lib/api-client-react-tenant";
import type { Invoice, InvoiceStatus } from "@/lib/api-client-react-tenant";
import { resolveQueryError } from "@/lib/api-error";
import { withOrgKey } from "@/lib/tenant-cache";
import { useOrgId } from "@/hooks/use-invalidate";
import { useMutationErrorSlots } from "@/hooks/use-mutation-error-slots";
import type { InvoiceFormValues } from "@/features/invoices/invoice-form.schema";
import { buildInvoiceFormValues } from "@/features/invoices/invoice-form.schema";

export const PAGE_SIZE = 10;

interface UseInvoicesOptions {
  search: string;
  statusFilter: string;
  page: number;
  onUpdateSuccess?: () => void;
  onStatusSuccess?: () => void;
}

export function useInvoices({
  search,
  statusFilter,
  page,
  onUpdateSuccess,
  onStatusSuccess,
}: UseInvoicesOptions) {
  const orgId = useOrgId();
  const queryClient = useQueryClient();
  const { errors, clearBefore, handlers } = useMutationErrorSlots(["update", "status"] as const);

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

  const invalidate = () => {
    if (orgId == null) return;
    void queryClient.invalidateQueries({
      queryKey: withOrgKey(orgId, getListInvoicesQueryKey()),
    });
    void queryClient.invalidateQueries({
      queryKey: withOrgKey(orgId, getGetFinanceReportQueryKey()),
    });
  };

  const updateMutation = useUpdateInvoice({
    mutation: {
      ...handlers("update", "تعذر تحديث الفاتورة", () => {
        invalidate();
        onUpdateSuccess?.();
      }),
    },
  });

  const statusMutation = useUpdateInvoiceStatus({
    mutation: {
      ...handlers("status", "تعذر تسجيل الفاتورة كمدفوعة", () => {
        invalidate();
        onStatusSuccess?.();
      }),
    },
  });

  const submitUpdate = (id: number, values: InvoiceFormValues) => {
    clearBefore("update");
    updateMutation.mutate({ id, data: { totalInclVat: values.totalInclVat } });
  };

  const submitMarkPaid = (id: number) => {
    clearBefore("status");
    statusMutation.mutate({ id, data: { status: "paid" } });
  };

  const buildEditDefaultValues = (invoice: Invoice): InvoiceFormValues =>
    buildInvoiceFormValues(invoice.totalInclVat);

  return {
    invoices: listQuery.data?.data ?? [],
    total: listQuery.data?.total ?? 0,
    isLoading: listQuery.isLoading,
    listError: resolveQueryError(listQuery.isError, listQuery.error, "تعذر تحميل الفواتير"),
    PAGE_SIZE,
    updateIsPending: updateMutation.isPending,
    statusIsPending: statusMutation.isPending,
    updateError: errors.update,
    statusError: errors.status,
    buildEditDefaultValues,
    submitUpdate,
    submitMarkPaid,
  };
}
