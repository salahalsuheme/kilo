import { useState, useEffect } from "react";
import type { Vehicle } from "@/lib/api-client-react-tenant";
import { usePageTitle } from "@/hooks/use-page-title";
import { ApiErrorBanner } from "@/components/api-error-banner";
import { PageHeader } from "@/components/page-header";
import { useVehicles } from "@/hooks/use-vehicles";
import { VehicleDialog } from "@/components/vehicles/vehicle-dialog";
import { VehiclesToolbar } from "@/components/vehicles/vehicles-toolbar";
import { VehiclesTable } from "@/components/vehicles/vehicles-table";
import { VehiclesCards } from "@/components/vehicles/vehicles-cards";
import { VehicleDetailDialog } from "@/components/vehicles/vehicle-detail-dialog";
import type { VehiclesViewMode } from "@/features/vehicles/vehicle-display";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { TenantPagination } from "@/components/tenant-pagination";
import { mobileListPanelClass } from "@/components/mobile";
import type { VehicleFormValues } from "@/features/vehicles/vehicle-form.schema";

export default function VehiclesPage() {
  usePageTitle("المركبات");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [deleteVehicleId, setDeleteVehicleId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<VehiclesViewMode>("cards");
  const [detailVehicle, setDetailVehicle] = useState<Vehicle | null>(null);

  const {
    vehicles,
    total,
    isLoading,
    listError,
    PAGE_SIZE,
    createIsPending,
    updateIsPending,
    deleteIsPending,
    createError,
    updateError,
    deleteError,
    statusError,
    buildEditDefaultValues,
    submitCreate,
    submitUpdate,
    submitDelete,
    submitStatusChange,
  } = useVehicles({
    search,
    statusFilter,
    page,
    onCreateSuccess: () => setIsCreateOpen(false),
    onUpdateSuccess: () => setEditVehicle(null),
    onDeleteSuccess: () => setDeleteVehicleId(null),
  });

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    if (total === 0) return;
    const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (page > maxPage) setPage(maxPage);
  }, [total, page, PAGE_SIZE]);

  const toBody = (values: VehicleFormValues) => ({
    brand: values.brand,
    modelYear: values.modelYear,
    coolingType: values.coolingType,
    registrationColor: values.registrationColor,
    chassisNumber: values.chassisNumber,
    serialNumber: values.serialNumber,
    plateNumber: values.plateNumber,
    registrationExpiryDate: values.registrationExpiryDate,
    inspectionExpiryDate: values.inspectionExpiryDate,
    odometer: values.odometer,
    periodicMaintenanceInterval: values.periodicMaintenanceInterval,
    status: values.status,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="المركبات" description="إدارة بيانات المركبات" />

      <ApiErrorBanner message={listError ?? statusError} />

      <div className="flex flex-col">
        <div className={mobileListPanelClass} style={{ backgroundColor: "#f3f4f6" }}>
          <VehiclesToolbar
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            rowCount={vehicles.length}
            total={total}
            isLoading={isLoading}
            onNewVehicle={() => setIsCreateOpen(true)}
          />

          <div className="mt-4 space-y-4">
            {viewMode === "table" ? (
              <VehiclesTable
                vehicles={vehicles}
                isLoading={isLoading}
                search={search}
                statusFilter={statusFilter}
                onEdit={setEditVehicle}
                onDelete={setDeleteVehicleId}
                onChangeStatus={(vehicle, status) => submitStatusChange(vehicle, status)}
              />
            ) : (
              <VehiclesCards
                vehicles={vehicles}
                isLoading={isLoading}
                search={search}
                statusFilter={statusFilter}
                onSelect={setDetailVehicle}
              />
            )}
            <TenantPagination
              page={page}
              pageSize={PAGE_SIZE}
              total={total}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>

      <VehicleDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="إضافة مركبة"
        onSubmit={(values) => submitCreate(toBody(values))}
        isPending={createIsPending}
        errorMessage={createError}
      />

      {editVehicle && (
        <VehicleDialog
          open
          onOpenChange={(open) => !open && setEditVehicle(null)}
          title="تعديل مركبة"
          defaultValues={buildEditDefaultValues(editVehicle)}
          onSubmit={(values) => submitUpdate(editVehicle.id, toBody(values))}
          isPending={updateIsPending}
          errorMessage={updateError}
        />
      )}

      <VehicleDetailDialog
        vehicle={detailVehicle}
        onOpenChange={(open) => !open && setDetailVehicle(null)}
        onEdit={(vehicle) => {
          setDetailVehicle(null);
          setEditVehicle(vehicle);
        }}
        onDelete={(id) => {
          setDetailVehicle(null);
          setDeleteVehicleId(id);
        }}
        onChangeStatus={(vehicle, status) => submitStatusChange(vehicle, status)}
      />

      <DeleteConfirmDialog
        open={deleteVehicleId != null}
        onOpenChange={(open) => !open && setDeleteVehicleId(null)}
        title="حذف المركبة"
        description="هل أنت متأكد من حذف هذه المركبة؟ لا يمكن التراجع عن هذا الإجراء."
        isPending={deleteIsPending}
        errorMessage={deleteError}
        onConfirm={() => {
          if (deleteVehicleId != null) submitDelete(deleteVehicleId);
        }}
      />
    </div>
  );
}
