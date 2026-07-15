import { useQueryClient } from "@tanstack/react-query";
import {
  getListContractTemplatesQueryKey,
  useCreateContractTemplate,
  useDeleteContractTemplate,
  useListContractTemplates,
  useUpdateContractTemplate,
} from "@/lib/api-client-react-tenant";
import type { ContractTemplate, CreateContractTemplateBody } from "@/lib/api-client-react-tenant";
import { resolveQueryError } from "@/lib/api-error";
import { withOrgKey } from "@/lib/tenant-cache";
import { useOrgId } from "@/hooks/use-invalidate";
import { useMutationErrorSlots } from "@/hooks/use-mutation-error-slots";
import type { ContractTemplateFormValues } from "@/features/contracts/contract-template-form.schema";

interface UseContractTemplatesOptions {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

export function useContractTemplates({
  onCreateSuccess,
  onUpdateSuccess,
  onDeleteSuccess,
}: UseContractTemplatesOptions = {}) {
  const orgId = useOrgId();
  const queryClient = useQueryClient();
  const { errors, clearBefore, handlers } = useMutationErrorSlots([
    "create",
    "update",
    "delete",
  ] as const);

  const listQuery = useListContractTemplates({
    query: { queryKey: getListContractTemplatesQueryKey() },
  });

  const invalidateList = () => {
    if (orgId == null) return;
    void queryClient.invalidateQueries({
      queryKey: withOrgKey(orgId, getListContractTemplatesQueryKey()),
    });
  };

  const createMutation = useCreateContractTemplate({
    mutation: {
      ...handlers("create", "تعذر إنشاء قالب العقد", () => {
        invalidateList();
        onCreateSuccess?.();
      }),
    },
  });

  const updateMutation = useUpdateContractTemplate({
    mutation: {
      ...handlers("update", "تعذر تحديث قالب العقد", () => {
        invalidateList();
        onUpdateSuccess?.();
      }),
    },
  });

  const deleteMutation = useDeleteContractTemplate({
    mutation: {
      ...handlers("delete", "تعذر حذف قالب العقد", () => {
        invalidateList();
        onDeleteSuccess?.();
      }),
    },
  });

  const submitCreate = (body: CreateContractTemplateBody) => {
    clearBefore("create");
    createMutation.mutate({ data: body });
  };
  const submitUpdate = (id: number, body: CreateContractTemplateBody) => {
    clearBefore("update");
    updateMutation.mutate({ id, data: body });
  };
  const submitDelete = (id: number) => {
    clearBefore("delete");
    deleteMutation.mutate({ id });
  };

  const buildEditDefaultValues = (template: ContractTemplate): ContractTemplateFormValues => ({
    name: template.name,
    body: template.body,
  });

  return {
    templates: listQuery.data?.data ?? [],
    isLoading: listQuery.isLoading,
    listError: resolveQueryError(listQuery.isError, listQuery.error, "تعذر تحميل قوالب العقود"),
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
