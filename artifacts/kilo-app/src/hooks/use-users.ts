import { useQueryClient } from "@tanstack/react-query";
import {
  getListUsersQueryKey,
  useCreateUser,
  useDeleteUser,
  useListUsers,
  useUpdateUser,
  useUploadUserPhoto,
} from "@/lib/api-client-react-tenant";
import type {
  CreateOrgUserBody,
  OrgUser,
  UpdateOrgUserBody,
  UserRole,
} from "@/lib/api-client-react-tenant";
import { getApiErrorMessage, resolveQueryError } from "@/lib/api-error";
import { withOrgKey } from "@/lib/tenant-cache";
import { useOrgId } from "@/hooks/use-invalidate";
import { useMutationErrorSlots } from "@/hooks/use-mutation-error-slots";

export const PAGE_SIZE = 10;

interface UseUsersOptions {
  search: string;
  roleFilter: string;
  page: number;
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

export function useUsers({
  search,
  roleFilter,
  page,
  onCreateSuccess,
  onUpdateSuccess,
  onDeleteSuccess,
}: UseUsersOptions) {
  const orgId = useOrgId();
  const queryClient = useQueryClient();
  const { errors, clearBefore, setError, handlers } = useMutationErrorSlots([
    "create",
    "update",
    "delete",
  ] as const);

  const role: UserRole | undefined =
    roleFilter !== "all" ? (roleFilter as UserRole) : undefined;

  const listQuery = useListUsers(
    { search: search || undefined, role, page, pageSize: PAGE_SIZE },
    {
      query: {
        queryKey: getListUsersQueryKey({
          search: search || undefined,
          role,
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
      queryKey: withOrgKey(orgId, getListUsersQueryKey()),
    });
  };

  const createMutation = useCreateUser({
    mutation: {
      ...handlers("create", "تعذر إنشاء المستخدم", () => {
        invalidateList();
        onCreateSuccess?.();
      }),
    },
  });

  const updateMutation = useUpdateUser({
    mutation: {
      ...handlers("update", "تعذر تحديث المستخدم", () => {
        invalidateList();
        onUpdateSuccess?.();
      }),
    },
  });

  const deleteMutation = useDeleteUser({
    mutation: {
      ...handlers("delete", "تعذر حذف المستخدم", () => {
        invalidateList();
        onDeleteSuccess?.();
      }),
    },
  });

  const uploadPhotoMutation = useUploadUserPhoto();

  const submitCreate = async (body: CreateOrgUserBody, photoFile?: File | null) => {
    clearBefore("create");
    try {
      const created = await createMutation.mutateAsync({ data: body });
      if (!photoFile) return;
      try {
        await uploadPhotoMutation.mutateAsync({ id: created.id, data: { file: photoFile } });
        invalidateList();
      } catch (error) {
        setError("create", getApiErrorMessage(error, "تعذر رفع صورة المستخدم"));
      }
    } catch {
      // createMutation.onError handles the message
    }
  };

  const submitUpdate = async (
    id: number,
    body: UpdateOrgUserBody,
    photoFile?: File | null,
  ) => {
    clearBefore("update");
    try {
      await updateMutation.mutateAsync({ id, data: body });
      if (!photoFile) return;
      try {
        await uploadPhotoMutation.mutateAsync({ id, data: { file: photoFile } });
        invalidateList();
      } catch (error) {
        setError("update", getApiErrorMessage(error, "تعذر رفع صورة المستخدم"));
      }
    } catch {
      // updateMutation.onError handles the message
    }
  };

  const submitDelete = (id: number) => {
    clearBefore("delete");
    deleteMutation.mutate({ id });
  };

  const buildEditDefaultValues = (user: OrgUser) => ({
    name: user.name,
    email: user.email,
    password: "",
    role: user.role,
  });

  return {
    users: listQuery.data?.data ?? [],
    total: listQuery.data?.total ?? 0,
    isLoading: listQuery.isLoading,
    listError: resolveQueryError(listQuery.isError, listQuery.error, "تعذر تحميل المستخدمين"),
    PAGE_SIZE,
    createIsPending: createMutation.isPending || uploadPhotoMutation.isPending,
    updateIsPending: updateMutation.isPending || uploadPhotoMutation.isPending,
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
