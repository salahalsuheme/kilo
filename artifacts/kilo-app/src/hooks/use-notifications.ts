import {
  getListNotificationsQueryKey,
  useListNotifications,
} from "@/lib/api-client-react-tenant";
import type { NotificationKind } from "@/lib/api-client-react-tenant";
import { resolveQueryError } from "@/lib/api-error";
import { withOrgKey } from "@/lib/tenant-cache";
import { useOrgId } from "@/hooks/use-invalidate";
import { NOTIFICATIONS_PAGE_SIZE } from "@/features/notifications/notifications.constants";

interface UseNotificationsOptions {
  page: number;
  kindFilter: string;
  pageSize?: number;
}

export function useNotifications({
  page,
  kindFilter,
  pageSize = NOTIFICATIONS_PAGE_SIZE,
}: UseNotificationsOptions) {
  const orgId = useOrgId();
  const kind: NotificationKind | undefined =
    kindFilter !== "all" ? (kindFilter as NotificationKind) : undefined;

  const listQuery = useListNotifications(
    { page, pageSize, kind },
    {
      query: {
        queryKey: withOrgKey(orgId, getListNotificationsQueryKey({ page, pageSize, kind })),
        placeholderData: (prev) => prev,
      },
    },
  );

  return {
    notifications: listQuery.data?.data ?? [],
    total: listQuery.data?.total ?? 0,
    pageSize: listQuery.data?.pageSize ?? pageSize,
    isLoading: listQuery.isLoading,
    listError: resolveQueryError(listQuery.isError, listQuery.error, "تعذر تحميل الإشعارات"),
    PAGE_SIZE: pageSize,
  };
}
