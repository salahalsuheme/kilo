import { useQueryClient } from "@tanstack/react-query";
import {
  getListEstablishmentsQueryKey,
  useCreateEstablishment,
  useDeleteEstablishment,
  useListEstablishments,
  useUpdateEstablishment,
} from "@/lib/api-client-react-tenant";
import type { CreateEstablishmentBody, Establishment } from "@/lib/api-client-react-tenant";
import { stripEstablishmentNumberSuffix } from "@workspace/establishments-domain";
import { resolveQueryError } from "@/lib/api-error";
import { withOrgKey } from "@/lib/tenant-cache";
import { useOrgId } from "@/hooks/use-invalidate";
import { useMutationErrorSlots } from "@/hooks/use-mutation-error-slots";
import type { EstablishmentFormValues } from "@/features/establishments/establishment-form.schema";

export const ESTABLISHMENTS_PAGE_SIZE = 10;

interface UseEstablishmentsOptions {
  search: string;
  typeFilter: string;
  page: number;
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

export function useEstablishments({
  search,
  typeFilter,
  page,
  onCreateSuccess,
  onUpdateSuccess,
  onDeleteSuccess,
}: UseEstablishmentsOptions) {
  const orgId = useOrgId();
  const queryClient = useQueryClient();
  const { errors, clearBefore, handlers } = useMutationErrorSlots([
    "create",
    "update",
    "delete",
  ] as const);

  const clientType =
    typeFilter !== "all"
      ? (typeFilter as EstablishmentFormValues["clientType"])
      : undefined;

  const listQuery = useListEstablishments(
    { search: search || undefined, clientType, page, pageSize: ESTABLISHMENTS_PAGE_SIZE },
    {
      query: {
        queryKey: getListEstablishmentsQueryKey({
          search: search || undefined,
          clientType,
          page,
          pageSize: ESTABLISHMENTS_PAGE_SIZE,
        }),
        placeholderData: (prev) => prev,
      },
    },
  );

  const invalidateList = () => {
    if (orgId == null) return;
    void queryClient.invalidateQueries({
      queryKey: withOrgKey(orgId, getListEstablishmentsQueryKey()),
    });
  };

  const createMutation = useCreateEstablishment({
    mutation: {
      ...handlers("create", "تعذر إنشاء المنشأة", () => {
        invalidateList();
        onCreateSuccess?.();
      }),
    },
  });

  const updateMutation = useUpdateEstablishment({
    mutation: {
      ...handlers("update", "تعذر تحديث المنشأة", () => {
        invalidateList();
        onUpdateSuccess?.();
      }),
    },
  });

  const deleteMutation = useDeleteEstablishment({
    mutation: {
      ...handlers("delete", "تعذر حذف المنشأة", () => {
        invalidateList();
        onDeleteSuccess?.();
      }),
    },
  });

  const toBody = (values: EstablishmentFormValues): CreateEstablishmentBody => ({
    name: values.name,
    clientType: values.clientType,
    establishmentNumber: values.establishmentNumber.trim(),
    hasTaxNumber: values.hasTaxNumber,
    taxNumber: values.hasTaxNumber ? values.taxNumber?.trim() || null : null,
  });

  const submitCreate = (values: EstablishmentFormValues) => {
    clearBefore("create");
    createMutation.mutate({ data: toBody(values) });
  };
  const submitUpdate = (id: number, values: EstablishmentFormValues) => {
    clearBefore("update");
    updateMutation.mutate({ id, data: toBody(values) });
  };
  const submitDelete = (id: number) => {
    clearBefore("delete");
    deleteMutation.mutate({ id });
  };

  const buildEditDefaultValues = (establishment: Establishment): EstablishmentFormValues => ({
    name: establishment.name,
    clientType: establishment.clientType,
    establishmentNumber: stripEstablishmentNumberSuffix(establishment.establishmentNumber),
    hasTaxNumber: establishment.hasTaxNumber,
    taxNumber: establishment.taxNumber ?? "",
  });

  return {
    establishments: listQuery.data?.data ?? [],
    total: listQuery.data?.total ?? 0,
    isLoading: listQuery.isLoading,
    listError: resolveQueryError(listQuery.isError, listQuery.error, "تعذر تحميل المنشآت"),
    ESTABLISHMENTS_PAGE_SIZE,
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
