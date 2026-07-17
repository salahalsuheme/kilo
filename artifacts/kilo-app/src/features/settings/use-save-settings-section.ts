import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetSettingsQueryKey,
  usePutSettings,
  type PutSettingsBody,
} from "@/lib/api-client-react-tenant";
import { getApiErrorMessage } from "@/lib/api-error";
import { withOrgKey } from "@/lib/tenant-cache";
import { useOrgId } from "@/hooks/use-invalidate";

export function useSaveSettingsSection() {
  const orgId = useOrgId();
  const queryClient = useQueryClient();
  const putMutation = usePutSettings();
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(
    async (data: PutSettingsBody) => {
      setError(null);
      try {
        await putMutation.mutateAsync({ data });
        if (orgId != null) {
          await queryClient.invalidateQueries({
            queryKey: withOrgKey(orgId, getGetSettingsQueryKey()),
          });
        }
      } catch (saveError) {
        const message = getApiErrorMessage(saveError, "تعذر حفظ الإعدادات");
        setError(message);
        throw saveError;
      }
    },
    [orgId, putMutation, queryClient],
  );

  return {
    save,
    isSaving: putMutation.isPending,
    error,
    setError,
    clearError: () => setError(null),
  };
}
