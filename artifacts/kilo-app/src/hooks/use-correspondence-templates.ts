import { useQueryClient } from "@tanstack/react-query";
import {
  getListCorrespondenceTemplatesQueryKey,
  useCreateCorrespondenceTemplate,
  useDeleteCorrespondenceTemplate,
  useListCorrespondenceTemplates,
  useUpdateCorrespondenceTemplate,
} from "@/lib/api-client-react-tenant";
import type {
  CorrespondenceTemplate,
  CreateCorrespondenceTemplateBody,
} from "@/lib/api-client-react-tenant";
import { resolveQueryError } from "@/lib/api-error";
import { withOrgKey } from "@/lib/tenant-cache";
import { useOrgId } from "@/hooks/use-invalidate";
import { useMutationErrorSlots } from "@/hooks/use-mutation-error-slots";
import type { CorrespondenceTemplateFormValues } from "@/features/correspondences/correspondence-template-form.schema";

interface UseCorrespondenceTemplatesOptions {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

export function useCorrespondenceTemplates({
  onCreateSuccess,
  onUpdateSuccess,
  onDeleteSuccess,
}: UseCorrespondenceTemplatesOptions = {}) {
  const orgId = useOrgId();
  const queryClient = useQueryClient();
  const { errors, clearBefore, handlers } = useMutationErrorSlots([
    "create",
    "update",
    "delete",
  ] as const);

  const listQuery = useListCorrespondenceTemplates({
    query: { queryKey: getListCorrespondenceTemplatesQueryKey() },
  });

  const invalidateList = () => {
    if (orgId == null) return;
    void queryClient.invalidateQueries({
      queryKey: withOrgKey(orgId, getListCorrespondenceTemplatesQueryKey()),
    });
  };

  const createMutation = useCreateCorrespondenceTemplate({
    mutation: {
      ...handlers("create", "تعذر إنشاء قالب المراسلة", () => {
        invalidateList();
        onCreateSuccess?.();
      }),
    },
  });

  const updateMutation = useUpdateCorrespondenceTemplate({
    mutation: {
      ...handlers("update", "تعذر تحديث قالب المراسلة", () => {
        invalidateList();
        onUpdateSuccess?.();
      }),
    },
  });

  const deleteMutation = useDeleteCorrespondenceTemplate({
    mutation: {
      ...handlers("delete", "تعذر حذف قالب المراسلة", () => {
        invalidateList();
        onDeleteSuccess?.();
      }),
    },
  });

  const toBody = (values: CorrespondenceTemplateFormValues): CreateCorrespondenceTemplateBody => ({
    name: values.name,
    subject: values.subject,
    body: values.body,
  });

  const submitCreate = (values: CorrespondenceTemplateFormValues) => {
    clearBefore("create");
    createMutation.mutate({ data: toBody(values) });
  };

  const submitUpdate = (id: number, values: CorrespondenceTemplateFormValues) => {
    clearBefore("update");
    updateMutation.mutate({ id, data: toBody(values) });
  };

  const submitDelete = (id: number) => {
    clearBefore("delete");
    deleteMutation.mutate({ id });
  };

  const buildEditDefaultValues = (
    template: CorrespondenceTemplate,
  ): CorrespondenceTemplateFormValues => ({
    name: template.name,
    subject: template.subject,
    body: template.body,
  });

  return {
    templates: listQuery.data?.data ?? [],
    isLoading: listQuery.isLoading,
    listError: resolveQueryError(
      listQuery.isError,
      listQuery.error,
      "تعذر تحميل قوالب المراسلات",
    ),
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
