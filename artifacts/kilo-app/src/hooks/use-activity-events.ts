import {
  getListActivityEventsQueryKey,
  useListActivityEvents,
} from "@/lib/api-client-react-tenant";
import { resolveQueryError } from "@/lib/api-error";
import { ACTIVITY_LOG_PAGE_SIZE } from "@/features/dashboard/activity-events.constants";

interface UseActivityEventsOptions {
  page: number;
  pageSize?: number;
}

export function useActivityEvents({ page, pageSize = ACTIVITY_LOG_PAGE_SIZE }: UseActivityEventsOptions) {
  const listQuery = useListActivityEvents(
    { page, pageSize },
    {
      query: {
        queryKey: getListActivityEventsQueryKey({ page, pageSize }),
        placeholderData: (prev) => prev,
      },
    },
  );

  return {
    events: listQuery.data?.data ?? [],
    total: listQuery.data?.total ?? 0,
    pageSize: listQuery.data?.pageSize ?? pageSize,
    isLoading: listQuery.isLoading,
    listError: resolveQueryError(listQuery.isError, listQuery.error, "تعذر تحميل سجل النشاط"),
  };
}
