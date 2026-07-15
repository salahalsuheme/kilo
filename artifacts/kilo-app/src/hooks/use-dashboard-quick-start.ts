import { useQueryClient } from "@tanstack/react-query";
import {
  getGetDashboardSummaryQueryKey,
  getListActivityEventsQueryKey,
  getListContractsQueryKey,
  getListCustomersQueryKey,
  getListInvoicesQueryKey,
  getListVehiclesQueryKey,
  useCreateContract,
  useCreateCustomer,
  useCreateVehicle,
} from "@/lib/api-client-react-tenant";
import type { CreateContractBody } from "@/lib/api-client-react-tenant";
import { withOrgKey } from "@/lib/tenant-cache";
import { useOrgId } from "@/hooks/use-invalidate";
import { useMutationErrorSlots } from "@/hooks/use-mutation-error-slots";

interface UseDashboardQuickStartOptions {
  onContractCreateSuccess?: () => void;
  onCustomerCreateSuccess?: () => void;
  onVehicleCreateSuccess?: () => void;
}

export function useDashboardQuickStart({
  onContractCreateSuccess,
  onCustomerCreateSuccess,
  onVehicleCreateSuccess,
}: UseDashboardQuickStartOptions) {
  const orgId = useOrgId();
  const queryClient = useQueryClient();
  const { errors, clearBefore, handlers } = useMutationErrorSlots([
    "contract",
    "customer",
    "vehicle",
  ] as const);

  const invalidateDashboard = () => {
    if (orgId == null) return;
    void queryClient.invalidateQueries({
      queryKey: withOrgKey(orgId, getGetDashboardSummaryQueryKey()),
    });
    void queryClient.invalidateQueries({
      queryKey: withOrgKey(orgId, getListActivityEventsQueryKey()),
    });
  };

  const createCustomerMutation = useCreateCustomer({
    mutation: {
      ...handlers("customer", "تعذر إنشاء العميل", () => {
        if (orgId != null) {
          void queryClient.invalidateQueries({
            queryKey: withOrgKey(orgId, getListCustomersQueryKey()),
          });
        }
        invalidateDashboard();
        onCustomerCreateSuccess?.();
      }),
    },
  });

  const createVehicleMutation = useCreateVehicle({
    mutation: {
      ...handlers("vehicle", "تعذر إنشاء المركبة", () => {
        if (orgId != null) {
          void queryClient.invalidateQueries({
            queryKey: withOrgKey(orgId, getListVehiclesQueryKey()),
          });
        }
        invalidateDashboard();
        onVehicleCreateSuccess?.();
      }),
    },
  });

  const createContractMutation = useCreateContract({
    mutation: {
      ...handlers("contract", "تعذر إنشاء العقد", () => {
        if (orgId != null) {
          void queryClient.invalidateQueries({
            queryKey: withOrgKey(orgId, getListContractsQueryKey()),
          });
          void queryClient.invalidateQueries({
            queryKey: withOrgKey(orgId, getListInvoicesQueryKey()),
          });
        }
        invalidateDashboard();
        onContractCreateSuccess?.();
      }),
    },
  });

  return {
    submitCreateCustomer: (variables: Parameters<typeof createCustomerMutation.mutate>[0]) => {
      clearBefore("customer");
      createCustomerMutation.mutate(variables);
    },
    submitCreateVehicle: (variables: Parameters<typeof createVehicleMutation.mutate>[0]) => {
      clearBefore("vehicle");
      createVehicleMutation.mutate(variables);
    },
    submitCreateContract: (body: CreateContractBody) => {
      clearBefore("contract");
      createContractMutation.mutate({ data: body });
    },
    customerCreateIsPending: createCustomerMutation.isPending,
    vehicleCreateIsPending: createVehicleMutation.isPending,
    contractCreateIsPending: createContractMutation.isPending,
    contractCreateError: errors.contract,
    customerCreateError: errors.customer,
    vehicleCreateError: errors.vehicle,
  };
}
