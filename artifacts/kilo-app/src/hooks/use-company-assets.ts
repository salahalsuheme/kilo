import { useQueryClient } from "@tanstack/react-query";
import {
  getListCompanyAssetsQueryKey,
  useCreateCompanyAsset,
  useDeleteCompanyAsset,
  useListCompanyAssets,
  useUpdateCompanyAsset,
} from "@/lib/api-client-react-tenant";
import type { CompanyAsset, CreateCompanyAssetBody } from "@/lib/api-client-react-tenant";
import { resolveQueryError } from "@/lib/api-error";
import { withOrgKey } from "@/lib/tenant-cache";
import { useOrgId } from "@/hooks/use-invalidate";
import { useMutationErrorSlots } from "@/hooks/use-mutation-error-slots";
import type { CompanyAssetFormValues } from "@/features/finance/company-asset-form.schema";

interface UseCompanyAssetsOptions {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

export function useCompanyAssets({
  onCreateSuccess,
  onUpdateSuccess,
  onDeleteSuccess,
}: UseCompanyAssetsOptions = {}) {
  const orgId = useOrgId();
  const queryClient = useQueryClient();
  const { errors, clearBefore, handlers } = useMutationErrorSlots([
    "create",
    "update",
    "delete",
  ] as const);

  const assetsQuery = useListCompanyAssets({
    query: { queryKey: getListCompanyAssetsQueryKey() },
  });

  const invalidate = () => {
    if (orgId == null) return;
    void queryClient.invalidateQueries({
      queryKey: withOrgKey(orgId, getListCompanyAssetsQueryKey()),
    });
  };

  const createMutation = useCreateCompanyAsset({
    mutation: {
      ...handlers("create", "تعذر إضافة الأصل", () => {
        invalidate();
        onCreateSuccess?.();
      }),
    },
  });

  const updateMutation = useUpdateCompanyAsset({
    mutation: {
      ...handlers("update", "تعذر تحديث الأصل", () => {
        invalidate();
        onUpdateSuccess?.();
      }),
    },
  });

  const deleteMutation = useDeleteCompanyAsset({
    mutation: {
      ...handlers("delete", "تعذر حذف الأصل", () => {
        invalidate();
        onDeleteSuccess?.();
      }),
    },
  });

  const toBody = (values: CompanyAssetFormValues): CreateCompanyAssetBody => ({
    assetType: values.assetType,
    referenceNumber: values.referenceNumber,
    initialValue: values.initialValue,
    annualDepreciationRate: values.annualDepreciationRate,
  });

  const submitCreate = (values: CompanyAssetFormValues) => {
    clearBefore("create");
    createMutation.mutate({ data: toBody(values) });
  };

  const submitUpdate = (id: number, values: CompanyAssetFormValues) => {
    clearBefore("update");
    updateMutation.mutate({ id, data: toBody(values) });
  };

  const submitDelete = (id: number) => {
    clearBefore("delete");
    deleteMutation.mutate({ id });
  };

  const buildEditDefaultValues = (asset: CompanyAsset): CompanyAssetFormValues => ({
    assetType: asset.assetType,
    referenceNumber: asset.referenceNumber,
    initialValue: asset.initialValue,
    annualDepreciationRate: asset.annualDepreciationRate,
  });

  return {
    assets: assetsQuery.data?.data ?? [],
    isLoading: assetsQuery.isLoading,
    listError: resolveQueryError(
      assetsQuery.isError,
      assetsQuery.error,
      "تعذر تحميل الأصول",
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
