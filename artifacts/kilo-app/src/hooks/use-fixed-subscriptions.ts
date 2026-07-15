import { useQueryClient } from "@tanstack/react-query";
import {
  getGetFinanceReportQueryKey,
  getListFixedSubscriptionsQueryKey,
  getListSubscriptionInvoicesQueryKey,
  useCreateFixedSubscription,
  useDeleteFixedSubscription,
  useListFixedSubscriptions,
  useListSubscriptionInvoices,
  useUpdateFixedSubscription,
  useUpdateSubscriptionInvoiceStatus,
} from "@/lib/api-client-react-tenant";
import type {
  CreateFixedSubscriptionBody,
  FinanceInvoiceStatus,
  FixedSubscription,
} from "@/lib/api-client-react-tenant";
import { resolveQueryError } from "@/lib/api-error";
import { withOrgKey } from "@/lib/tenant-cache";
import { useOrgId } from "@/hooks/use-invalidate";
import { useMutationErrorSlots } from "@/hooks/use-mutation-error-slots";
import type { FixedSubscriptionFormValues } from "@/features/finance/fixed-subscription-form.schema";

export const SUBSCRIPTION_INVOICE_PAGE_SIZE = 10;

interface UseFixedSubscriptionsOptions {
  invoiceSearch: string;
  invoiceStatusFilter: string;
  invoicePage: number;
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
  onDeleteSuccess?: () => void;
  onInvoiceStatusSuccess?: () => void;
}

export function useFixedSubscriptions({
  invoiceSearch,
  invoiceStatusFilter,
  invoicePage,
  onCreateSuccess,
  onUpdateSuccess,
  onDeleteSuccess,
  onInvoiceStatusSuccess,
}: UseFixedSubscriptionsOptions) {
  const orgId = useOrgId();
  const queryClient = useQueryClient();
  const { errors, clearBefore, handlers } = useMutationErrorSlots([
    "create",
    "update",
    "delete",
    "invoiceStatus",
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
    createError: errors.create,
    updateError: errors.update,
    deleteError: errors.delete,
    invoiceStatusError: errors.invoiceStatus,
    buildEditDefaultValues,
    submitCreate,
    submitUpdate,
    submitDelete,
    submitInvoiceStatus,
  };
}
