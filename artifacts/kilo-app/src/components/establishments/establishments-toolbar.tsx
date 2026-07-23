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
import { ESTABLISHMENT_TYPE_LABELS } from "@/features/establishments/establishment-form.schema";

interface EstablishmentsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  rowCount: number;
  total: number;
  isLoading: boolean;
  onNewEstablishment: () => void;
}

const TYPE_OPTIONS = [
  { value: "all", label: "كل الأنواع" },
  ...Object.entries(ESTABLISHMENT_TYPE_LABELS).map(([value, label]) => ({ value, label })),
];

export function EstablishmentsToolbar({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  rowCount,
  total,
  isLoading,
  onNewEstablishment,
}: EstablishmentsToolbarProps) {
  return (
    <MobileToolbar>
      <Button
        onClick={onNewEstablishment}
        className={`${mobileToolbarBtnClass} bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 shadow-sm`}
      >
        <Plus className="h-4 w-4 me-2" />
        منشأة جديدة
      </Button>
      <SearchInput
        name="establishments-search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="ابحث في المنشآت .."
        className="bg-white"
        wrapperClassName={mobileToolbarSearchWrapClass}
      />
      <StatusFilterSelect
        value={typeFilter}
        onValueChange={onTypeFilterChange}
        options={TYPE_OPTIONS}
        triggerClassName={mobileToolbarSelectClass}
      />
      {!isLoading && (
        <span className={mobileToolbarCountClass}>
          عرض {rowCount} من {total} منشأة
        </span>
      )}
    </MobileToolbar>
  );
}
