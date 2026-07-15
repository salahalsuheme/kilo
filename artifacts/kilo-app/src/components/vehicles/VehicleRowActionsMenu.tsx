import type { Vehicle, VehicleStatus } from "@/lib/api-client-react-tenant";
import { MANUAL_VEHICLE_STATUS_LABELS, MANUAL_VEHICLE_STATUSES, canDeleteVehicle } from "@workspace/vehicles-domain";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, FileEdit, RefreshCw, Trash2 } from "lucide-react";

interface VehicleRowActionsMenuProps {
  vehicle: Vehicle;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: number) => void;
  onChangeStatus: (vehicle: Vehicle, status: VehicleStatus) => void;
}

export function VehicleRowActionsMenu({
  vehicle,
  onEdit,
  onDelete,
  onChangeStatus,
}: VehicleRowActionsMenuProps) {
  const canChangeStatus = vehicle.status !== "rented";
  const canDelete = canDeleteVehicle(vehicle.status);
  const statusOptions = MANUAL_VEHICLE_STATUSES.filter((status) => status !== vehicle.status);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onEdit(vehicle);
          }}
        >
          <FileEdit className="h-4 w-4 me-2" />
          تعديل
        </DropdownMenuItem>

        {canChangeStatus && statusOptions.length > 0 && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <RefreshCw className="h-4 w-4 me-2" />
              حالة المركبة
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {statusOptions.map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangeStatus(vehicle, status);
                  }}
                >
                  {MANUAL_VEHICLE_STATUS_LABELS[status]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}

        {canDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(vehicle.id);
              }}
            >
              <Trash2 className="h-4 w-4 me-2" />
              حذف
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
