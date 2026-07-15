import type { Vehicle } from "@/lib/api-client-react-tenant";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Car } from "lucide-react";
import {
  COOLING_TYPE_LABELS,
  VEHICLE_FIELD_LABELS,
  formatRemainingPeriodicMaintenanceDays,
} from "@/features/vehicles/vehicle-form.schema";
import { VehicleRowActionsMenu } from "@/components/vehicles/VehicleRowActionsMenu";
import { VehicleStatusBadge } from "@/components/vehicles/vehicle-status-badge";
import { VehiclesTableColGroup } from "@/components/ui/list-table-cols";

interface VehiclesTableProps {
  vehicles: Vehicle[];
  isLoading: boolean;
  search: string;
  statusFilter: string;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: number) => void;
  onChangeStatus: (vehicle: Vehicle, status: Vehicle["status"]) => void;
}

export function VehiclesTable({
  vehicles,
  isLoading,
  search,
  statusFilter,
  onEdit,
  onDelete,
  onChangeStatus,
}: VehiclesTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table className="table-fixed">
          <VehiclesTableColGroup />
          <TableHeader>
            <TableRow>
              <TableHead>المركبة</TableHead>
              <TableHead>الموديل</TableHead>
              <TableHead>{VEHICLE_FIELD_LABELS.remainingPeriodicMaintenanceDays}</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الخيارات</TableHead>
              <TableHead className="text-center text-black">إجراء</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </TableCell>
                  <TableCell className="w-16">
                    <div className="flex justify-center">
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : vehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  {search || statusFilter !== "all" ? "لا توجد نتائج" : "لا توجد مركبات"}
                </TableCell>
              </TableRow>
            ) : (
              vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Car className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium">{vehicle.brand}</div>
                        <div className="text-xs text-muted-foreground">{vehicle.plateNumber}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="flex flex-col items-start gap-0.5 min-w-0">
                      <span className="text-sm font-medium tabular-nums leading-tight" dir="ltr">
                        {vehicle.modelYear}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="align-top whitespace-nowrap">
                    <span
                      className={
                        vehicle.remainingPeriodicMaintenanceDays <= 0
                          ? "text-sm font-medium text-destructive"
                          : "text-sm text-muted-foreground"
                      }
                    >
                      {formatRemainingPeriodicMaintenanceDays(vehicle.remainingPeriodicMaintenanceDays)}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <VehicleStatusBadge status={vehicle.status} />
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {COOLING_TYPE_LABELS[vehicle.coolingType]}
                    </Badge>
                  </TableCell>
                  <TableCell className="p-2 align-middle">
                    <div className="flex justify-center">
                      <VehicleRowActionsMenu
                        vehicle={vehicle}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onChangeStatus={onChangeStatus}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
