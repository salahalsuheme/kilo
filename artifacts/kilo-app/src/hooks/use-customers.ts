import { useQueryClient } from "@tanstack/react-query";
import {
  getListCustomersQueryKey,
  useCreateCustomer,
  useDeleteCustomer,
  useListCustomers,
  useUpdateCustomer,
} from "@/lib/api-client-react-tenant";
import type { Customer, CreateCustomerBody, CustomerType } from "@/lib/api-client-react-tenant";
import { stripEstablishmentNumberSuffix } from "@workspace/customers-domain";
import { resolveQueryError } from "@/lib/api-error";
import { withOrgKey } from "@/lib/tenant-cache";
import { useOrgId } from "@/hooks/use-invalidate";
import { useMutationErrorSlots } from "@/hooks/use-mutation-error-slots";

export const PAGE_SIZE = 10;

interface UseCustomersOptions {
  search: string;
  typeFilter: string;
  page: number;
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

export function useCustomers({
  search,
  typeFilter,
  page,
  onCreateSuccess,
  onUpdateSuccess,
  onDeleteSuccess,
}: UseCustomersOptions) {
  const orgId = useOrgId();
  const queryClient = useQueryClient();
  const { errors, clearBefore, handlers } = useMutationErrorSlots([
    "create",
    "update",
    "delete",
  ] as const);

  const clientType: CustomerType | undefined =
    typeFilter !== "all" ? (typeFilter as CustomerType) : undefined;

  const listQuery = useListCustomers(
    { search: search || undefined, clientType, page, pageSize: PAGE_SIZE },
    {
      query: {
        queryKey: getListCustomersQueryKey({
          search: search || undefined,
          clientType,
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
      queryKey: withOrgKey(orgId, getListCustomersQueryKey()),
    });
  };

  const createMutation = useCreateCustomer({
    mutation: {
      ...handlers("create", "تعذر إنشاء العميل", () => {
        invalidateList();
        onCreateSuccess?.();
      }),
    },
  });

  const updateMutation = useUpdateCustomer({
    mutation: {
      ...handlers("update", "تعذر تحديث العميل", () => {
        invalidateList();
        onUpdateSuccess?.();
      }),
    },
  });

  const deleteMutation = useDeleteCustomer({
    mutation: {
      ...handlers("delete", "تعذر حذف العميل", () => {
        invalidateList();
        onDeleteSuccess?.();
      }),
    },
  });

  const submitCreate = (body: CreateCustomerBody) => {
    clearBefore("create");
    createMutation.mutate({ data: body });
  };
  const submitUpdate = (id: number, body: CreateCustomerBody) => {
    clearBefore("update");
    updateMutation.mutate({ id, data: body });
  };
  const submitDelete = (id: number) => {
    clearBefore("delete");
    deleteMutation.mutate({ id });
  };

  const buildEditDefaultValues = (customer: Customer) => ({
    name: customer.name,
    clientType: customer.clientType,
    idNumber: customer.idNumber,
    birthDate: customer.birthDate ? String(customer.birthDate).slice(0, 10) : "",
    mobile: customer.mobile,
    licenseNumber: customer.licenseNumber ?? "",
    nationality: customer.nationality,
    hasTaxNumber: customer.hasTaxNumber,
    taxNumber: customer.taxNumber ?? "",
    establishmentName: customer.establishmentName ?? "",
    establishmentNumber: stripEstablishmentNumberSuffix(customer.establishmentNumber),
  });

  return {
    customers: listQuery.data?.data ?? [],
    total: listQuery.data?.total ?? 0,
    isLoading: listQuery.isLoading,
    listError: resolveQueryError(listQuery.isError, listQuery.error, "تعذر تحميل العملاء"),
    PAGE_SIZE,
    createIsPending: createMutation.isPending,
    updateIsPending: updateMutation.isPending,
    deleteIsPending: deleteMutation.isPending,
    createError: errors.create,
    updateError: errors.update,
    deleteError: errors.delete,
    buildEditDefaultValues,
    submitCreate,
    submitUpdate,
    submitDelete,
  };
}
