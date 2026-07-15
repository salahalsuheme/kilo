import type { ReactNode } from "react";
import type { Vehicle } from "@/lib/api-client-react-tenant";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Car } from "lucide-react";
import {
  COOLING_TYPE_LABELS,
  PERIODIC_MAINTENANCE_INTERVAL_LABELS,
  VEHICLE_FIELD_LABELS,
  formatRemainingPeriodicMaintenanceDays,
} from "@/features/vehicles/vehicle-form.schema";
import { formatVehicleDate, vehicleIdentifierClass } from "@/features/vehicles/vehicle-display";
import { VehicleStatusBadge } from "@/components/vehicles/vehicle-status-badge";
import { VehicleRowActionsMenu } from "@/components/vehicles/VehicleRowActionsMenu";
import { cn } from "@/lib/utils";

interface VehicleDetailDialogProps {
  vehicle: Vehicle | null;
  onOpenChange: (open: boolean) => void;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: number) => void;
  onChangeStatus: (vehicle: Vehicle, status: Vehicle["status"]) => void;
}

function DetailField({
  label,
  children,
  identifier,
}: {
  label: string;
  children: ReactNode;
  identifier?: boolean;
}) {
  return (
    <div className={cn("min-w-0 space-y-1", identifier && "text-start")}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium min-w-0">
        {identifier ? (
          <span dir="ltr" className={vehicleIdentifierClass}>
            {children}
          </span>
        ) : (
          children
        )}
      </dd>
    </div>
  );
}

export function VehicleDetailDialog({
  vehicle,
  onOpenChange,
  onEdit,
  onDelete,
  onChangeStatus,
}: VehicleDetailDialogProps) {
  return (
    <Dialog open={vehicle != null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {vehicle && (
          <>
            <DialogHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
              <div className="flex items-start gap-3 min-w-0">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Car className="h-5 w-5" />
                </div>
                <div className="min-w-0 space-y-1">
                  <DialogTitle className="text-lg leading-tight">{vehicle.brand}</DialogTitle>
                  <p className="text-sm text-muted-foreground">{vehicle.plateNumber}</p>
                </div>
              </div>
              <VehicleRowActionsMenu
                vehicle={vehicle}
                onEdit={onEdit}
                onDelete={onDelete}
                onChangeStatus={onChangeStatus}
              />
            </DialogHeader>

            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailField label={VEHICLE_FIELD_LABELS.brand}>{vehicle.brand}</DetailField>
              <DetailField label={VEHICLE_FIELD_LABELS.plateNumber}>{vehicle.plateNumber}</DetailField>
              <DetailField label={VEHICLE_FIELD_LABELS.modelYear}>
                <span dir="ltr" className="tabular-nums">
                  {vehicle.modelYear}
                </span>
              </DetailField>
              <DetailField label={VEHICLE_FIELD_LABELS.status}>
                <VehicleStatusBadge status={vehicle.status} />
              </DetailField>
              <DetailField label={VEHICLE_FIELD_LABELS.coolingType}>
                <Badge variant="secondary">{COOLING_TYPE_LABELS[vehicle.coolingType]}</Badge>
              </DetailField>
              <DetailField label={VEHICLE_FIELD_LABELS.registrationColor}>
                {vehicle.registrationColor}
              </DetailField>
              <DetailField label={VEHICLE_FIELD_LABELS.chassisNumber} identifier>
                {vehicle.chassisNumber}
              </DetailField>
              <DetailField label={VEHICLE_FIELD_LABELS.serialNumber} identifier>
                {vehicle.serialNumber}
              </DetailField>
              <DetailField label={VEHICLE_FIELD_LABELS.registrationExpiryDate}>
                <span dir="ltr" className="tabular-nums">
                  {formatVehicleDate(vehicle.registrationExpiryDate)}
                </span>
              </DetailField>
              <DetailField label={VEHICLE_FIELD_LABELS.inspectionExpiryDate}>
                <span dir="ltr" className="tabular-nums">
                  {formatVehicleDate(vehicle.inspectionExpiryDate)}
                </span>
              </DetailField>
              <DetailField label={VEHICLE_FIELD_LABELS.remainingPeriodicMaintenanceDays}>
                <span
                  className={
                    vehicle.remainingPeriodicMaintenanceDays <= 0
                      ? "text-destructive"
                      : undefined
                  }
                >
                  {formatRemainingPeriodicMaintenanceDays(vehicle.remainingPeriodicMaintenanceDays)}
                </span>
              </DetailField>
              <DetailField label={VEHICLE_FIELD_LABELS.odometer}>
                <span dir="ltr" className="tabular-nums">
                  {vehicle.odometer.toLocaleString("ar-SA")}
                </span>
              </DetailField>
              <DetailField label={VEHICLE_FIELD_LABELS.periodicMaintenanceInterval}>
                {PERIODIC_MAINTENANCE_INTERVAL_LABELS[vehicle.periodicMaintenanceInterval]}
              </DetailField>
            </dl>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
