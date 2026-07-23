import { useQueryClient } from "@tanstack/react-query";
import {
  getGetFinanceReportQueryKey,
  getListPurchasesQueryKey,
  useCreatePurchase,
  useDeletePurchase,
  useListPurchases,
  useUpdatePurchase,
  useUpdatePurchaseStatus,
} from "@/lib/api-client-react-tenant";
import type {
  CreatePurchaseBody,
  FinanceInvoiceStatus,
  Purchase,
} from "@/lib/api-client-react-tenant";
import { isPurchaseTaxExempt } from "@workspace/finance-domain";
import { resolveQueryError } from "@/lib/api-error";
import { withOrgKey } from "@/lib/tenant-cache";
import { useOrgId } from "@/hooks/use-invalidate";
import { useMutationErrorSlots } from "@/hooks/use-mutation-error-slots";
import type { PurchaseFormValues } from "@/features/finance/purchase-form.schema";

export const PAGE_SIZE = 10;

interface UsePurchasesOptions {
  search: string;
  statusFilter: string;
  page: number;
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
  onDeleteSuccess?: () => void;
  onStatusSuccess?: () => void;
}

export function usePurchases({
  search,
  statusFilter,
  page,
  onCreateSuccess,
  onUpdateSuccess,
  onDeleteSuccess,
  onStatusSuccess,
}: UsePurchasesOptions) {
  const orgId = useOrgId();
  const queryClient = useQueryClient();
  const { errors, clearBefore, handlers } = useMutationErrorSlots([
    "create",
    "update",
    "delete",
    "status",
  ] as const);

  const status: FinanceInvoiceStatus | undefined =
    statusFilter !== "all" ? (statusFilter as FinanceInvoiceStatus) : undefined;

  const listQuery = useListPurchases(
    { search: search || undefined, status, page, pageSize: PAGE_SIZE },
    {
      query: {
        queryKey: getListPurchasesQueryKey({
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
      queryKey: withOrgKey(orgId, getListPurchasesQueryKey()),
    });
    void queryClient.invalidateQueries({
      queryKey: withOrgKey(orgId, getGetFinanceReportQueryKey()),
    });
  };

  const createMutation = useCreatePurchase({
    mutation: {
      ...handlers("create", "تعذر إنشاء فاتورة المشتريات", () => {
        invalidate();
        onCreateSuccess?.();
      }),
    },
  });

  const updateMutation = useUpdatePurchase({
    mutation: {
      ...handlers("update", "تعذر تحديث فاتورة المشتريات", () => {
        invalidate();
        onUpdateSuccess?.();
      }),
    },
  });

  const deleteMutation = useDeletePurchase({
    mutation: {
      ...handlers("delete", "تعذر حذف فاتورة المشتريات", () => {
        invalidate();
        onDeleteSuccess?.();
      }),
    },
  });

  const statusMutation = useUpdatePurchaseStatus({
    mutation: {
      ...handlers("status", "تعذر تحديث حالة فاتورة المشتريات", () => {
        invalidate();
        onStatusSuccess?.();
      }),
    },
  });

  const toBody = (values: PurchaseFormValues): CreatePurchaseBody => ({
    invoiceDate: values.invoiceDate,
    referenceNumber: values.referenceNumber,
    companyName: values.companyName,
    items: values.items,
    totalInclVat: values.totalInclVat,
    taxExempt: values.taxExempt,
  });

  const submitCreate = (values: PurchaseFormValues) => {
    clearBefore("create");
    createMutation.mutate({ data: toBody(values) });
  };

  const submitUpdate = (id: number, values: PurchaseFormValues) => {
    clearBefore("update");
    updateMutation.mutate({ id, data: toBody(values) });
  };

  const submitDelete = (id: number) => {
    clearBefore("delete");
    deleteMutation.mutate({ id });
  };

  const submitStatus = (id: number, nextStatus: FinanceInvoiceStatus) => {
    clearBefore("status");
    statusMutation.mutate({ id, data: { status: nextStatus } });
  };

  const buildEditDefaultValues = (purchase: Purchase): PurchaseFormValues => ({
    invoiceDate: purchase.invoiceDate,
    referenceNumber: purchase.referenceNumber,
    companyName: purchase.companyName,
    items: purchase.items,
    taxExempt: isPurchaseTaxExempt(purchase.taxAmount, purchase.taxRate),
    totalInclVat: purchase.totalInclVat,
  });

  return {
    purchases: listQuery.data?.data ?? [],
    total: listQuery.data?.total ?? 0,
    isLoading: listQuery.isLoading,
    listError: resolveQueryError(listQuery.isError, listQuery.error, "تعذر تحميل المشتريات"),
    PAGE_SIZE,
    createIsPending: createMutation.isPending,
    updateIsPending: updateMutation.isPending,
    deleteIsPending: deleteMutation.isPending,
    statusIsPending: statusMutation.isPending,
    createError: errors.create,
    updateError: errors.update,
    deleteError: errors.delete,
    statusError: errors.status,
    buildEditDefaultValues,
    submitCreate,
    submitUpdate,
    submitDelete,
    submitStatus,
  };
}
