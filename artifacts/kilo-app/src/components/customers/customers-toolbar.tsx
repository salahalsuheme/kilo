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
import { CLIENT_TYPE_LABELS } from "@/features/customers/customer-form.schema";
import type { CustomerFormValues } from "@/features/customers/customer-form.schema";

interface CustomersToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  rowCount: number;
  total: number;
  isLoading: boolean;
  onNewCustomer: () => void;
}

const CLIENT_TYPE_OPTIONS: Array<{
  value: string;
  label: string;
}> = [
  { value: "all", label: "كل الأنواع" },
  ...(
    Object.entries(CLIENT_TYPE_LABELS) as Array<
      [CustomerFormValues["clientType"], string]
    >
  ).map(([value, label]) => ({ value, label })),
];

export function CustomersToolbar({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  rowCount,
  total,
  isLoading,
  onNewCustomer,
}: CustomersToolbarProps) {
  return (
    <MobileToolbar>
      <Button
        onClick={onNewCustomer}
        className={`${mobileToolbarBtnClass} bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 shadow-sm`}
      >
        <Plus className="h-4 w-4 me-2" />
        عميل جديد
      </Button>
      <SearchInput
        name="customers-search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="ابحث في العملاء .."
        className="bg-white"
        wrapperClassName={mobileToolbarSearchWrapClass}
      />
      <StatusFilterSelect
        value={typeFilter}
        onValueChange={onTypeFilterChange}
        options={CLIENT_TYPE_OPTIONS}
        triggerClassName={mobileToolbarSelectClass}
      />
      {!isLoading && (
        <span className={mobileToolbarCountClass}>
          عرض {rowCount} من {total} عميل
        </span>
      )}
    </MobileToolbar>
  );
}
