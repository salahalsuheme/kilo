import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { StatusFilterSelect } from "@/components/ui/status-filter-select";
import {
  MobileToolbar,
  mobileToolbarBtnClass,
  mobileToolbarCountClass,
  mobileToolbarSearchWrapClass,
  mobileToolbarSelectClass,
} from "@/components/mobile";
import { USER_ROLE_LABELS } from "@workspace/users-domain";
import type { UserRole } from "@/lib/api-client-react-tenant";

interface UsersToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  rowCount: number;
  total: number;
  isLoading: boolean;
  onNewUser: () => void;
}

const ROLE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "all", label: "كل الصلاحيات" },
  ...(Object.entries(USER_ROLE_LABELS) as Array<[UserRole, string]>).map(
    ([value, label]) => ({ value, label }),
  ),
];

export function UsersToolbar({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  rowCount,
  total,
  isLoading,
  onNewUser,
}: UsersToolbarProps) {
  return (
    <MobileToolbar>
      <Button
        onClick={onNewUser}
        className={`${mobileToolbarBtnClass} bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 shadow-sm`}
      >
        <Plus className="h-4 w-4 me-2" />
        مستخدم جديد
      </Button>
      <SearchInput
        name="users-search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="ابحث في المستخدمين .."
        className="bg-white"
        wrapperClassName={mobileToolbarSearchWrapClass}
      />
      <StatusFilterSelect
        value={roleFilter}
        onValueChange={onRoleFilterChange}
        options={ROLE_OPTIONS}
        triggerClassName={mobileToolbarSelectClass}
      />
      {!isLoading && (
        <span className={mobileToolbarCountClass}>
          عرض {rowCount} من {total} مستخدم
        </span>
      )}
    </MobileToolbar>
  );
}
