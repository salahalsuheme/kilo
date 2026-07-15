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
import { VEHICLE_STATUS_LABELS } from "@/features/vehicles/vehicle-form.schema";
import type { VehicleFormValues } from "@/features/vehicles/vehicle-form.schema";
import type { VehiclesViewMode } from "@/features/vehicles/vehicle-display";
import { VehiclesViewToggle } from "@/components/vehicles/vehicles-view-toggle";

interface VehiclesToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  viewMode: VehiclesViewMode;
  onViewModeChange: (value: VehiclesViewMode) => void;
  rowCount: number;
  total: number;
  isLoading: boolean;
  onNewVehicle: () => void;
}

const STATUS_OPTIONS: Array<{
  value: string;
  label: string;
}> = [
  { value: "all", label: "كل الحالات" },
  ...(
    Object.entries(VEHICLE_STATUS_LABELS) as Array<
      [VehicleFormValues["status"], string]
    >
  ).map(([value, label]) => ({ value, label })),
];

export function VehiclesToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
  rowCount,
  total,
  isLoading,
  onNewVehicle,
}: VehiclesToolbarProps) {
  return (
    <MobileToolbar>
      <Button
        onClick={onNewVehicle}
        className={`${mobileToolbarBtnClass} bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 shadow-sm`}
      >
        <Plus className="h-4 w-4 me-2" />
        مركبة جديدة
      </Button>
      <SearchInput
        name="vehicles-search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="ابحث في المركبات .."
        className="bg-white"
        wrapperClassName={mobileToolbarSearchWrapClass}
      />
      <div className="flex w-full items-center gap-2 md:w-auto">
        <StatusFilterSelect
          value={statusFilter}
          onValueChange={onStatusFilterChange}
          options={STATUS_OPTIONS}
          triggerClassName={`${mobileToolbarSelectClass} md:w-[11rem]`}
        />
        <VehiclesViewToggle value={viewMode} onValueChange={onViewModeChange} />
      </div>
      {!isLoading && (
        <span className={mobileToolbarCountClass}>
          عرض {rowCount} من {total} مركبة
        </span>
      )}
    </MobileToolbar>
  );
}
