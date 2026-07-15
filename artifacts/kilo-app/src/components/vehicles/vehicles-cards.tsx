import type { ReactNode } from "react";
import type { Vehicle } from "@/lib/api-client-react-tenant";
import { Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  COOLING_TYPE_LABELS,
  VEHICLE_FIELD_LABELS,
  formatRemainingPeriodicMaintenanceDays,
} from "@/features/vehicles/vehicle-form.schema";
import { VehicleStatusBadge } from "@/components/vehicles/vehicle-status-badge";

const vehicleCardClass =
  "w-full rounded-xl border border-gray-100 bg-white p-4 text-start shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-200";

interface VehiclesCardsProps {
  vehicles: Vehicle[];
  isLoading: boolean;
  search: string;
  statusFilter: string;
  onSelect: (vehicle: Vehicle) => void;
}

function VehicleCardField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 min-w-0">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <div className="min-w-0 text-sm font-medium text-end">{children}</div>
    </div>
  );
}

function VehicleCard({ vehicle, onSelect }: { vehicle: Vehicle; onSelect: (vehicle: Vehicle) => void }) {
  return (
    <button type="button" onClick={() => onSelect(vehicle)} className={vehicleCardClass}>
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Car className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 truncate">{vehicle.brand}</div>
            <div className="text-xs text-muted-foreground truncate">{vehicle.plateNumber}</div>
          </div>

          <div className="space-y-2 border-t border-gray-100 pt-3">
            <VehicleCardField label={VEHICLE_FIELD_LABELS.modelYear}>
              <span dir="ltr" className="tabular-nums">
                {vehicle.modelYear}
              </span>
            </VehicleCardField>
            <VehicleCardField label={VEHICLE_FIELD_LABELS.remainingPeriodicMaintenanceDays}>
              <span
                className={
                  vehicle.remainingPeriodicMaintenanceDays <= 0
                    ? "text-destructive"
                    : "text-muted-foreground"
                }
              >
                {formatRemainingPeriodicMaintenanceDays(vehicle.remainingPeriodicMaintenanceDays)}
              </span>
            </VehicleCardField>
            <VehicleCardField label={VEHICLE_FIELD_LABELS.status}>
              <VehicleStatusBadge status={vehicle.status} />
            </VehicleCardField>
            <VehicleCardField label={VEHICLE_FIELD_LABELS.coolingType}>
              <Badge variant="secondary">{COOLING_TYPE_LABELS[vehicle.coolingType]}</Badge>
            </VehicleCardField>
          </div>
        </div>
      </div>
    </button>
  );
}

function VehicleCardSkeleton() {
  return (
    <div className={`${vehicleCardClass} pointer-events-none`}>
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="space-y-2 border-t border-gray-100 pt-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-5 w-full rounded-full" />
            <Skeleton className="h-5 w-full rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function VehiclesCards({
  vehicles,
  isLoading,
  search,
  statusFilter,
  onSelect,
}: VehiclesCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <VehicleCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white text-sm text-muted-foreground">
        {search || statusFilter !== "all" ? "لا توجد نتائج" : "لا توجد مركبات"}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} onSelect={onSelect} />
      ))}
    </div>
  );
}
