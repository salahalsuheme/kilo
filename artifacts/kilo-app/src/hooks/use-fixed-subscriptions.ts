import { useQueryClient } from "@tanstack/react-query";
import {
  getGetFinanceReportQueryKey,
  getListFixedSubscriptionsQueryKey,
  getListSubscriptionInvoicesQueryKey,
  useCreateFixedSubscription,
  useDeleteFixedSubscription,
  useDeleteSubscriptionInvoice,
  useListFixedSubscriptions,
  useListSubscriptionInvoices,
  useUpdateFixedSubscription,
  useUpdateSubscriptionInvoice,
  useUpdateSubscriptionInvoiceStatus,
} from "@/lib/api-client-react-tenant";
import type {
  CreateFixedSubscriptionBody,
  FinanceInvoiceStatus,
  FixedSubscription,
  SubscriptionInvoice,
  UpdateSubscriptionInvoiceBody,
} from "@/lib/api-client-react-tenant";
import { resolveQueryError } from "@/lib/api-error";
import { withOrgKey } from "@/lib/tenant-cache";
import { useOrgId } from "@/hooks/use-invalidate";
import { useMutationErrorSlots } from "@/hooks/use-mutation-error-slots";
import type { FixedSubscriptionFormValues } from "@/features/finance/fixed-subscription-form.schema";
import type { PurchaseFormValues } from "@/features/finance/purchase-form.schema";

export const SUBSCRIPTION_INVOICE_PAGE_SIZE = 10;

interface UseFixedSubscriptionsOptions {
  invoiceSearch: string;
  invoiceStatusFilter: string;
  invoicePage: number;
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
  onDeleteSuccess?: () => void;
  onInvoiceStatusSuccess?: () => void;
  onInvoiceUpdateSuccess?: () => void;
  onInvoiceDeleteSuccess?: () => void;
}

export function useFixedSubscriptions({
  invoiceSearch,
  invoiceStatusFilter,
  invoicePage,
  onCreateSuccess,
  onUpdateSuccess,
  onDeleteSuccess,
  onInvoiceStatusSuccess,
  onInvoiceUpdateSuccess,
  onInvoiceDeleteSuccess,
}: UseFixedSubscriptionsOptions) {
  const orgId = useOrgId();
  const queryClient = useQueryClient();
  const { errors, clearBefore, handlers } = useMutationErrorSlots([
    "create",
    "update",
    "delete",
    "invoiceStatus",
    "invoiceUpdate",
    "invoiceDelete",
  ] as const);

  const subscriptionsQuery = useListFixedSubscriptions({
    query: { queryKey: getListFixedSubscriptionsQueryKey() },
  });

  const invoiceStatus: FinanceInvoiceStatus | undefined =
    invoiceStatusFilter !== "all"
      ? (invoiceStatusFilter as FinanceInvoiceStatus)
      : undefined;

  const invoicesQuery = useListSubscriptionInvoices(
    {
      search: invoiceSearch || undefined,
      status: invoiceStatus,
      page: invoicePage,
      pageSize: SUBSCRIPTION_INVOICE_PAGE_SIZE,
    },
    {
      query: {
        queryKey: getListSubscriptionInvoicesQueryKey({
          search: invoiceSearch || undefined,
          status: invoiceStatus,
          page: invoicePage,
          pageSize: SUBSCRIPTION_INVOICE_PAGE_SIZE,
        }),
        placeholderData: (prev) => prev,
      },
    },
  );

  const invalidate = () => {
    if (orgId == null) return;
    void queryClient.invalidateQueries({
      queryKey: withOrgKey(orgId, getListFixedSubscriptionsQueryKey()),
    });
    void queryClient.invalidateQueries({
      queryKey: withOrgKey(orgId, getListSubscriptionInvoicesQueryKey()),
    });
    void queryClient.invalidateQueries({
      queryKey: withOrgKey(orgId, getGetFinanceReportQueryKey()),
    });
  };

  const createMutation = useCreateFixedSubscription({
    mutation: {
      ...handlers("create", "تعذر إنشاء الاشتراك الثابت", () => {
        invalidate();
        onCreateSuccess?.();
      }),
    },
  });

  const updateMutation = useUpdateFixedSubscription({
    mutation: {
      ...handlers("update", "تعذر تحديث الاشتراك الثابت", () => {
        invalidate();
        onUpdateSuccess?.();
      }),
    },
  });

  const deleteMutation = useDeleteFixedSubscription({
    mutation: {
      ...handlers("delete", "تعذر حذف الاشتراك الثابت", () => {
        invalidate();
        onDeleteSuccess?.();
      }),
    },
  });

  const invoiceStatusMutation = useUpdateSubscriptionInvoiceStatus({
    mutation: {
      ...handlers("invoiceStatus", "تعذر تحديث حالة فاتورة الاشتراك", () => {
        invalidate();
        onInvoiceStatusSuccess?.();
      }),
    },
  });

  const invoiceUpdateMutation = useUpdateSubscriptionInvoice({
    mutation: {
      ...handlers("invoiceUpdate", "تعذر تحديث فاتورة الاشتراك", () => {
        invalidate();
        onInvoiceUpdateSuccess?.();
      }),
    },
  });

  const invoiceDeleteMutation = useDeleteSubscriptionInvoice({
    mutation: {
      ...handlers("invoiceDelete", "تعذر حذف فاتورة الاشتراك", () => {
        invalidate();
        onInvoiceDeleteSuccess?.();
      }),
    },
  });

  const toBody = (values: FixedSubscriptionFormValues): CreateFixedSubscriptionBody => ({
    invoiceDate: values.invoiceDate,
    referenceNumber: values.referenceNumber,
    companyName: values.companyName,
    items: values.items,
    billingCycle: values.billingCycle,
    totalInclVat: values.totalInclVat,
  });

  const submitCreate = (values: FixedSubscriptionFormValues) => {
    clearBefore("create");
    createMutation.mutate({ data: toBody(values) });
  };

  const submitUpdate = (id: number, values: FixedSubscriptionFormValues) => {
    clearBefore("update");
    updateMutation.mutate({ id, data: toBody(values) });
  };

  const submitDelete = (id: number) => {
    clearBefore("delete");
    deleteMutation.mutate({ id });
  };

  const submitInvoiceStatus = (id: number, status: FinanceInvoiceStatus) => {
    clearBefore("invoiceStatus");
    invoiceStatusMutation.mutate({ id, data: { status } });
  };

  const toInvoiceBody = (values: PurchaseFormValues): UpdateSubscriptionInvoiceBody => ({
    invoiceDate: values.invoiceDate,
    referenceNumber: values.referenceNumber,
    companyName: values.companyName,
    items: values.items,
    totalInclVat: values.totalInclVat,
  });

  const submitInvoiceUpdate = (id: number, values: PurchaseFormValues) => {
    clearBefore("invoiceUpdate");
    invoiceUpdateMutation.mutate({ id, data: toInvoiceBody(values) });
  };

  const submitInvoiceDelete = (id: number) => {
    clearBefore("invoiceDelete");
    invoiceDeleteMutation.mutate({ id });
  };

  const buildEditDefaultValues = (
    subscription: FixedSubscription,
  ): FixedSubscriptionFormValues => ({
    invoiceDate: subscription.invoiceDate,
    referenceNumber: subscription.referenceNumber,
    companyName: subscription.companyName,
    items: subscription.items,
    billingCycle: subscription.billingCycle,
    totalInclVat: subscription.totalInclVat,
  });

  const buildInvoiceEditDefaultValues = (
    invoice: SubscriptionInvoice,
  ): PurchaseFormValues => ({
    invoiceDate: invoice.invoiceDate,
    referenceNumber: invoice.referenceNumber,
    companyName: invoice.companyName,
    items: invoice.items,
    totalInclVat: invoice.totalInclVat,
  });

  return {
    subscriptions: subscriptionsQuery.data?.data ?? [],
    subscriptionsLoading: subscriptionsQuery.isLoading,
    subscriptionsError: resolveQueryError(
      subscriptionsQuery.isError,
      subscriptionsQuery.error,
      "تعذر تحميل الاشتراكات الثابتة",
    ),
    subscriptionInvoices: invoicesQuery.data?.data ?? [],
    subscriptionInvoicesTotal: invoicesQuery.data?.total ?? 0,
    subscriptionInvoicesLoading: invoicesQuery.isLoading,
    subscriptionInvoicesError: resolveQueryError(
      invoicesQuery.isError,
      invoicesQuery.error,
      "تعذر تحميل فواتير الاشتراك",
    ),
    SUBSCRIPTION_INVOICE_PAGE_SIZE,
    createIsPending: createMutation.isPending,
    updateIsPending: updateMutation.isPending,
    deleteIsPending: deleteMutation.isPending,
    invoiceStatusIsPending: invoiceStatusMutation.isPending,
    invoiceUpdateIsPending: invoiceUpdateMutation.isPending,
    invoiceDeleteIsPending: invoiceDeleteMutation.isPending,
    createError: errors.create,
    updateError: errors.update,
    deleteError: errors.delete,
    invoiceStatusError: errors.invoiceStatus,
    invoiceUpdateError: errors.invoiceUpdate,
    invoiceDeleteError: errors.invoiceDelete,
    buildEditDefaultValues,
    buildInvoiceEditDefaultValues,
    submitCreate,
    submitUpdate,
    submitDelete,
    submitInvoiceStatus,
    submitInvoiceUpdate,
    submitInvoiceDelete,
  };
}
