import { LayoutGrid, Table2 } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import type { VehiclesViewMode } from "@/features/vehicles/vehicle-display";

interface VehiclesViewToggleProps {
  value: VehiclesViewMode;
  onValueChange: (value: VehiclesViewMode) => void;
  className?: string;
}

const toggleItemClass =
  "h-9 w-9 shrink-0 rounded-md border border-gray-200 bg-white p-0 text-gray-600 shadow-sm hover:bg-gray-50 data-[state=on]:border-gray-300 data-[state=on]:bg-gray-100 data-[state=on]:text-gray-900";

export function VehiclesViewToggle({
  value,
  onValueChange,
  className,
}: VehiclesViewToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(next) => {
        if (next === "table" || next === "cards") onValueChange(next);
      }}
      className={cn("shrink-0", className)}
      aria-label="طريقة عرض المركبات"
    >
      <ToggleGroupItem value="table" className={toggleItemClass} aria-label="عرض جدول">
        <Table2 className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="cards" className={toggleItemClass} aria-label="عرض بطاقات">
        <LayoutGrid className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
