import type { Vehicle } from "@/lib/api-client-react-tenant";
import { Badge } from "@/components/ui/badge";
import { VEHICLE_STATUS_LABELS } from "@/features/vehicles/vehicle-form.schema";
import { vehicleStatusBadgeClass } from "@/features/vehicles/vehicle-display";

interface VehicleStatusBadgeProps {
  status: Vehicle["status"];
}

export function VehicleStatusBadge({ status }: VehicleStatusBadgeProps) {
  return (
    <Badge variant="outline" className={`gap-1 ${vehicleStatusBadgeClass(status)}`}>
      {VEHICLE_STATUS_LABELS[status]}
    </Badge>
  );
}
