import { StatusFilterSelect } from "@/components/ui/status-filter-select";
import {
  MobileToolbar,
  mobileToolbarCountClass,
  mobileToolbarSelectClass,
} from "@/components/mobile";
import { NOTIFICATION_KIND_LABELS } from "@workspace/notifications-domain";
import type { NotificationKind } from "@workspace/notifications-domain";

interface NotificationsToolbarProps {
  kindFilter: string;
  onKindFilterChange: (value: string) => void;
  rowCount: number;
  total: number;
  isLoading: boolean;
}

const KIND_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "all", label: "كل الإشعارات" },
  ...(
    Object.entries(NOTIFICATION_KIND_LABELS) as Array<[NotificationKind, string]>
  ).map(([value, label]) => ({ value, label })),
];

export function NotificationsToolbar({
  kindFilter,
  onKindFilterChange,
  rowCount,
  total,
  isLoading,
}: NotificationsToolbarProps) {
  return (
    <MobileToolbar>
      <StatusFilterSelect
        value={kindFilter}
        onValueChange={onKindFilterChange}
        options={KIND_OPTIONS}
        triggerClassName={mobileToolbarSelectClass}
      />
      {!isLoading && (
        <span className={mobileToolbarCountClass}>
          عرض {rowCount} من {total} إشعار
        </span>
      )}
    </MobileToolbar>
  );
}
