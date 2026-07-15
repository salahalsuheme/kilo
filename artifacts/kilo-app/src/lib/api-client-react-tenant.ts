import * as gen from "@workspace/api-client-react";
import type { UseQueryOptions } from "@tanstack/react-query";
import { withOrgKey } from "@/lib/tenant-cache";
import { useOrgId } from "@/hooks/use-invalidate";

export * from "@workspace/api-client-react";
export type {
  AuthUser,
  Customer,
  CreateCustomerBody,
  CustomerList,
  Vehicle,
  CreateVehicleBody,
  VehicleList,
  Contract,
  CreateContractBody,
  ContractList,
  ContractStatus,
  ContractTemplate,
  CreateContractTemplateBody,
  Invoice,
  InvoiceDetail,
  InvoiceList,
  InvoiceStatus,
  FinanceReport,
  Purchase,
  PurchaseList,
  FinanceInvoiceStatus,
  FixedSubscription,
  FixedSubscriptionList,
  SubscriptionInvoice,
  SubscriptionInvoiceList,
  BillingCycle,
  DashboardSummary,
  Notification,
  NotificationKind,
  OrgSettings,
  OrgUser,
  CreateOrgUserBody,
  OrgUserList,
  UserRole,
} from "@workspace/api-client-react";

type AnyQueryHook = (...args: unknown[]) => unknown;
type AnyKeyGetter = (...args: unknown[]) => readonly unknown[];

function wrapTenantQueryHook<H extends AnyQueryHook>(
  hook: H,
  getKey: AnyKeyGetter,
): H {
  const useWrapped = (...args: unknown[]) => {
    const orgId = useOrgId();
    const last = args.length > 0 ? args[args.length - 1] : undefined;
    const lastIsOptions =
      last != null &&
      typeof last === "object" &&
      !Array.isArray(last) &&
      ("query" in (last as object) || "request" in (last as object));
    const params = lastIsOptions ? args.slice(0, -1) : args;
    const opts = (lastIsOptions ? (last as Record<string, unknown>) : {}) as {
      query?: Partial<UseQueryOptions>;
      request?: unknown;
    };
    const userQuery = opts.query ?? {};
    const orgScopedKey = withOrgKey(
      orgId,
      getKey(...(params as Parameters<typeof getKey>)),
    );
    const userEnabled = (userQuery as { enabled?: boolean }).enabled ?? true;

    return hook(...params, {
      ...opts,
      query: {
        ...userQuery,
        queryKey: orgScopedKey as unknown as readonly unknown[],
        enabled: orgId != null && userEnabled,
      },
    });
  };

  return useWrapped as unknown as H;
}

export const useGetDashboardSummary = /*#__PURE__*/ wrapTenantQueryHook(
  gen.useGetDashboardSummary as unknown as AnyQueryHook,
  gen.getGetDashboardSummaryQueryKey as unknown as AnyKeyGetter,
) as typeof gen.useGetDashboardSummary;

export const useListActivityEvents = /*#__PURE__*/ wrapTenantQueryHook(
  gen.useListActivityEvents as unknown as AnyQueryHook,
  gen.getListActivityEventsQueryKey as unknown as AnyKeyGetter,
) as typeof gen.useListActivityEvents;

export const useListCustomers = /*#__PURE__*/ wrapTenantQueryHook(
  gen.useListCustomers as unknown as AnyQueryHook,
  gen.getListCustomersQueryKey as unknown as AnyKeyGetter,
) as typeof gen.useListCustomers;

export const useGetCustomer = /*#__PURE__*/ wrapTenantQueryHook(
  gen.useGetCustomer as unknown as AnyQueryHook,
  gen.getGetCustomerQueryKey as unknown as AnyKeyGetter,
) as typeof gen.useGetCustomer;

export const useListUsers = /*#__PURE__*/ wrapTenantQueryHook(
  gen.useListUsers as unknown as AnyQueryHook,
  gen.getListUsersQueryKey as unknown as AnyKeyGetter,
) as typeof gen.useListUsers;

export const useGetUser = /*#__PURE__*/ wrapTenantQueryHook(
  gen.useGetUser as unknown as AnyQueryHook,
  gen.getGetUserQueryKey as unknown as AnyKeyGetter,
) as typeof gen.useGetUser;

export const useListVehicles = /*#__PURE__*/ wrapTenantQueryHook(
  gen.useListVehicles as unknown as AnyQueryHook,
  gen.getListVehiclesQueryKey as unknown as AnyKeyGetter,
) as typeof gen.useListVehicles;

export const useGetVehicle = /*#__PURE__*/ wrapTenantQueryHook(
  gen.useGetVehicle as unknown as AnyQueryHook,
  gen.getGetVehicleQueryKey as unknown as AnyKeyGetter,
) as typeof gen.useGetVehicle;

export const useGetSettings = /*#__PURE__*/ wrapTenantQueryHook(
  gen.useGetSettings as unknown as AnyQueryHook,
  gen.getGetSettingsQueryKey as unknown as AnyKeyGetter,
) as typeof gen.useGetSettings;

export const useListContracts = /*#__PURE__*/ wrapTenantQueryHook(
  gen.useListContracts as unknown as AnyQueryHook,
  gen.getListContractsQueryKey as unknown as AnyKeyGetter,
) as typeof gen.useListContracts;

export const useGetContract = /*#__PURE__*/ wrapTenantQueryHook(
  gen.useGetContract as unknown as AnyQueryHook,
  gen.getGetContractQueryKey as unknown as AnyKeyGetter,
) as typeof gen.useGetContract;

export const useListContractTemplates = /*#__PURE__*/ wrapTenantQueryHook(
  gen.useListContractTemplates as unknown as AnyQueryHook,
  gen.getListContractTemplatesQueryKey as unknown as AnyKeyGetter,
) as typeof gen.useListContractTemplates;

export const useGetContractTemplate = /*#__PURE__*/ wrapTenantQueryHook(
  gen.useGetContractTemplate as unknown as AnyQueryHook,
  gen.getGetContractTemplateQueryKey as unknown as AnyKeyGetter,
) as typeof gen.useGetContractTemplate;

export const useListInvoices = /*#__PURE__*/ wrapTenantQueryHook(
  gen.useListInvoices as unknown as AnyQueryHook,
  gen.getListInvoicesQueryKey as unknown as AnyKeyGetter,
) as typeof gen.useListInvoices;

export const useGetInvoice = /*#__PURE__*/ wrapTenantQueryHook(
  gen.useGetInvoice as unknown as AnyQueryHook,
  gen.getGetInvoiceQueryKey as unknown as AnyKeyGetter,
) as typeof gen.useGetInvoice;

export const useGetFinanceReport = /*#__PURE__*/ wrapTenantQueryHook(
  gen.useGetFinanceReport as unknown as AnyQueryHook,
  gen.getGetFinanceReportQueryKey as unknown as AnyKeyGetter,
) as typeof gen.useGetFinanceReport;

export const useListPurchases = /*#__PURE__*/ wrapTenantQueryHook(
  gen.useListPurchases as unknown as AnyQueryHook,
  gen.getListPurchasesQueryKey as unknown as AnyKeyGetter,
) as typeof gen.useListPurchases;

export const useGetPurchase = /*#__PURE__*/ wrapTenantQueryHook(
  gen.useGetPurchase as unknown as AnyQueryHook,
  gen.getGetPurchaseQueryKey as unknown as AnyKeyGetter,
) as typeof gen.useGetPurchase;

export const useListFixedSubscriptions = /*#__PURE__*/ wrapTenantQueryHook(
  gen.useListFixedSubscriptions as unknown as AnyQueryHook,
  gen.getListFixedSubscriptionsQueryKey as unknown as AnyKeyGetter,
) as typeof gen.useListFixedSubscriptions;

export const useGetFixedSubscription = /*#__PURE__*/ wrapTenantQueryHook(
  gen.useGetFixedSubscription as unknown as AnyQueryHook,
  gen.getGetFixedSubscriptionQueryKey as unknown as AnyKeyGetter,
) as typeof gen.useGetFixedSubscription;

export const useListSubscriptionInvoices = /*#__PURE__*/ wrapTenantQueryHook(
  gen.useListSubscriptionInvoices as unknown as AnyQueryHook,
  gen.getListSubscriptionInvoicesQueryKey as unknown as AnyKeyGetter,
) as typeof gen.useListSubscriptionInvoices;

export const useListNotifications = /*#__PURE__*/ wrapTenantQueryHook(
  gen.useListNotifications as unknown as AnyQueryHook,
  gen.getListNotificationsQueryKey as unknown as AnyKeyGetter,
) as typeof gen.useListNotifications;
