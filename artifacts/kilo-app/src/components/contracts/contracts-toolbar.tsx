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
import { CONTRACT_LIST_STATUS_FILTER_LABELS, CONTRACT_LIST_STATUS_FILTER_VALUES } from "@workspace/contracts-domain";

interface ContractsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  rowCount: number;
  total: number;
  isLoading: boolean;
  onNewContract: () => void;
}

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "all", label: "كل الحالات" },
  ...CONTRACT_LIST_STATUS_FILTER_VALUES.map((value) => ({
    value,
    label: CONTRACT_LIST_STATUS_FILTER_LABELS[value],
  })),
];

export function ContractsToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  rowCount,
  total,
  isLoading,
  onNewContract,
}: ContractsToolbarProps) {
  return (
    <MobileToolbar>
      <Button
        onClick={onNewContract}
        className={`${mobileToolbarBtnClass} bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 shadow-sm`}
      >
        <Plus className="h-4 w-4 me-2" />
        عقد جديد
      </Button>
      <SearchInput
        name="contracts-search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="ابحث في العقود .."
        className="bg-white"
        wrapperClassName={mobileToolbarSearchWrapClass}
      />
      <StatusFilterSelect
        value={statusFilter}
        onValueChange={onStatusFilterChange}
        options={STATUS_OPTIONS}
        triggerClassName={mobileToolbarSelectClass}
      />
      {!isLoading && (
        <span className={mobileToolbarCountClass}>
          عرض {rowCount} من {total} عقد
        </span>
      )}
    </MobileToolbar>
  );
}
