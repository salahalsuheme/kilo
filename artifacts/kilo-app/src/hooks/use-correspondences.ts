import { useQueryClient } from "@tanstack/react-query";
import {
  getListCorrespondencesQueryKey,
  useCreateCorrespondence,
  useDeleteCorrespondence,
  useListCorrespondences,
  useResendCorrespondence,
  useUpdateCorrespondence,
} from "@/lib/api-client-react-tenant";
import type { CorrespondenceMessage } from "@/lib/api-client-react-tenant";
import { resolveQueryError } from "@/lib/api-error";
import { withOrgKey } from "@/lib/tenant-cache";
import { useOrgId } from "@/hooks/use-invalidate";
import { useMutationErrorSlots } from "@/hooks/use-mutation-error-slots";
import type { CorrespondenceFormValues } from "@/features/correspondences/correspondence-form.schema";
import { correspondenceFormValuesToBody } from "@/features/correspondences/correspondence-form.mapper";

export const PAGE_SIZE = 10;

interface UseCorrespondencesOptions {
  search: string;
  page: number;
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
  onDeleteSuccess?: () => void;
  onResendSuccess?: () => void;
}

export function useCorrespondences({
  search,
  page,
  onCreateSuccess,
  onUpdateSuccess,
  onDeleteSuccess,
  onResendSuccess,
}: UseCorrespondencesOptions) {
  const orgId = useOrgId();
  const queryClient = useQueryClient();
  const { errors, clearBefore, handlers } = useMutationErrorSlots([
    "create",
    "update",
    "delete",
    "resend",
  ] as const);

  const listQuery = useListCorrespondences(
    { search: search || undefined, page, pageSize: PAGE_SIZE },
    {
      query: {
        queryKey: getListCorrespondencesQueryKey({
          search: search || undefined,
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
      queryKey: withOrgKey(orgId, getListCorrespondencesQueryKey()),
    });
  };

  const createMutation = useCreateCorrespondence({
    mutation: {
      ...handlers("create", "تعذر إرسال الرسالة", () => {
        invalidateList();
        onCreateSuccess?.();
      }),
    },
  });

  const updateMutation = useUpdateCorrespondence({
    mutation: {
      ...handlers("update", "تعذر تحديث الرسالة", () => {
        invalidateList();
        onUpdateSuccess?.();
      }),
    },
  });

  const deleteMutation = useDeleteCorrespondence({
    mutation: {
      ...handlers("delete", "تعذر حذف الرسالة", () => {
        invalidateList();
        onDeleteSuccess?.();
      }),
    },
  });

  const resendMutation = useResendCorrespondence({
    mutation: {
      ...handlers("resend", "تعذر إعادة إرسال الرسالة", () => {
        invalidateList();
        onResendSuccess?.();
      }),
    },
  });

  const submitCreate = (values: CorrespondenceFormValues, attachments: File[]) => {
    clearBefore("create");
    createMutation.mutate({
      data: correspondenceFormValuesToBody(values, attachments),
    });
  };

  const submitUpdate = (
    id: number,
    values: CorrespondenceFormValues,
    attachments: File[],
  ) => {
    clearBefore("update");
    updateMutation.mutate({
      id,
      data: correspondenceFormValuesToBody(values, attachments),
    });
  };

  const submitDelete = (id: number) => {
    clearBefore("delete");
    deleteMutation.mutate({ id });
  };

  const submitResend = (id: number) => {
    clearBefore("resend");
    resendMutation.mutate({ id });
  };

  const buildEditDefaultValues = (message: CorrespondenceMessage): CorrespondenceFormValues => ({
    establishmentId: String(message.establishmentId),
    templateId: message.templateId != null ? String(message.templateId) : "",
    subject: message.subject,
    body: message.body,
  });

  return {
    messages: listQuery.data?.data ?? [],
    total: listQuery.data?.total ?? 0,
    isLoading: listQuery.isLoading,
    listError: resolveQueryError(listQuery.isError, listQuery.error, "تعذر تحميل المراسلات"),
    PAGE_SIZE,
    createIsPending: createMutation.isPending,
    updateIsPending: updateMutation.isPending,
    deleteIsPending: deleteMutation.isPending,
    resendIsPending: resendMutation.isPending,
    resendingMessageId:
      resendMutation.isPending && resendMutation.variables != null
        ? resendMutation.variables.id
        : null,
    createError: errors.create,
    updateError: errors.update,
    deleteError: errors.delete,
    resendError: errors.resend,
    buildEditDefaultValues,
    submitCreate,
    submitUpdate,
    submitDelete,
    submitResend,
  };
}
