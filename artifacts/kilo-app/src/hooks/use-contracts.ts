import { useQueryClient } from "@tanstack/react-query";
import {
  getListContractsQueryKey,
  getListInvoicesQueryKey,
  useCreateContract,
  useDeleteContract,
  useListContracts,
  useUpdateContract,
  useUpdateContractStatus,
} from "@/lib/api-client-react-tenant";
import type {
  Contract,
  ContractStatus,
  CreateContractBody,
} from "@/lib/api-client-react-tenant";
import { resolveQueryError } from "@/lib/api-error";
import { withOrgKey } from "@/lib/tenant-cache";
import { useOrgId } from "@/hooks/use-invalidate";
import { useMutationErrorSlots } from "@/hooks/use-mutation-error-slots";
import {
  defaultContractEndAt,
  defaultContractStartAt,
  type ContractFormValues,
} from "@/features/contracts/contract-form.schema";

export const PAGE_SIZE = 10;

interface UseContractsOptions {
  search: string;
  statusFilter: string;
  page: number;
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
  onDeleteSuccess?: () => void;
  onStatusSuccess?: () => void;
}

export function useContracts({
  search,
  statusFilter,
  page,
  onCreateSuccess,
  onUpdateSuccess,
  onDeleteSuccess,
  onStatusSuccess,
}: UseContractsOptions) {
  const orgId = useOrgId();
  const queryClient = useQueryClient();
  const { errors, clearBefore, handlers } = useMutationErrorSlots([
    "create",
    "update",
    "delete",
    "status",
  ] as const);

  const status: ContractStatus | undefined =
    statusFilter !== "all" ? (statusFilter as ContractStatus) : undefined;

  const listQuery = useListContracts(
    { search: search || undefined, status, page, pageSize: PAGE_SIZE },
    {
      query: {
        queryKey: getListContractsQueryKey({
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
      queryKey: withOrgKey(orgId, getListContractsQueryKey()),
    });
    void queryClient.invalidateQueries({
      queryKey: withOrgKey(orgId, getListInvoicesQueryKey()),
    });
  };

  const createMutation = useCreateContract({
    mutation: {
      ...handlers("create", "تعذر إنشاء العقد", () => {
        invalidateList();
        onCreateSuccess?.();
      }),
    },
  });

  const updateMutation = useUpdateContract({
    mutation: {
      ...handlers("update", "تعذر تحديث العقد", () => {
        invalidateList();
        onUpdateSuccess?.();
      }),
    },
  });

  const deleteMutation = useDeleteContract({
    mutation: {
      ...handlers("delete", "تعذر حذف العقد", () => {
        invalidateList();
        onDeleteSuccess?.();
      }),
    },
  });

  const statusMutation = useUpdateContractStatus({
    mutation: {
      ...handlers("status", "تعذر تغيير حالة العقد", () => {
        invalidateList();
        onStatusSuccess?.();
      }),
    },
  });

  const submitCreate = (body: CreateContractBody) => {
    clearBefore("create");
    createMutation.mutate({ data: body });
  };
  const submitUpdate = (id: number, body: CreateContractBody) => {
    clearBefore("update");
    updateMutation.mutate({ id, data: body });
  };
  const submitDelete = (id: number) => {
    clearBefore("delete");
    deleteMutation.mutate({ id });
  };
  const submitStatus = (id: number, status: ContractStatus) => {
    clearBefore("status");
    statusMutation.mutate({ id, data: { status } });
  };

  const buildEditDefaultValues = (contract: Contract): ContractFormValues => ({
    customerId: String(contract.customerId),
    carId: String(contract.carId),
    templateId: String(contract.templateId),
    startAt: toDateTimeLocalFromIso(contract.startAt),
    endAt: toDateTimeLocalFromIso(contract.endAt),
    amountExVat: String(contract.amountExVat),
  });

  return {
    contracts: listQuery.data?.data ?? [],
    total: listQuery.data?.total ?? 0,
    isLoading: listQuery.isLoading,
    listError: resolveQueryError(listQuery.isError, listQuery.error, "تعذر تحميل العقود"),
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

function toDateTimeLocalFromIso(iso: string): string {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function toContractBody(values: ContractFormValues): CreateContractBody {
  return {
    customerId: Number(values.customerId),
    carId: Number(values.carId),
    templateId: Number(values.templateId),
    startAt: new Date(values.startAt).toISOString(),
    endAt: new Date(values.endAt).toISOString(),
    amountExVat: Number(values.amountExVat),
  };
}

export { defaultContractStartAt, defaultContractEndAt };
