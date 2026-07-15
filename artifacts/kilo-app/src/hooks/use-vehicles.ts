import { useQueryClient } from "@tanstack/react-query";
import {
  getListVehiclesQueryKey,
  useCreateVehicle,
  useDeleteVehicle,
  useListVehicles,
  useUpdateVehicle,
} from "@/lib/api-client-react-tenant";
import type { Vehicle, CreateVehicleBody, VehicleStatus } from "@/lib/api-client-react-tenant";
import { resolveQueryError } from "@/lib/api-error";
import { withOrgKey } from "@/lib/tenant-cache";
import { useOrgId } from "@/hooks/use-invalidate";
import { useMutationErrorSlots } from "@/hooks/use-mutation-error-slots";

function vehicleToBody(vehicle: Vehicle, status?: VehicleStatus): CreateVehicleBody {
  return {
    brand: vehicle.brand,
    modelYear: vehicle.modelYear,
    coolingType: vehicle.coolingType,
    registrationColor: vehicle.registrationColor,
    chassisNumber: vehicle.chassisNumber,
    serialNumber: vehicle.serialNumber,
    plateNumber: vehicle.plateNumber,
    registrationExpiryDate: String(vehicle.registrationExpiryDate).slice(0, 10),
    inspectionExpiryDate: String(vehicle.inspectionExpiryDate).slice(0, 10),
    odometer: vehicle.odometer,
    periodicMaintenanceInterval: vehicle.periodicMaintenanceInterval,
    status: status ?? vehicle.status,
  };
}

export const PAGE_SIZE = 10;

interface UseVehiclesOptions {
  search: string;
  statusFilter: string;
  page: number;
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

export function useVehicles({
  search,
  statusFilter,
  page,
  onCreateSuccess,
  onUpdateSuccess,
  onDeleteSuccess,
}: UseVehiclesOptions) {
  const orgId = useOrgId();
  const queryClient = useQueryClient();
  const { errors, clearBefore, handlers } = useMutationErrorSlots([
    "create",
    "update",
    "delete",
    "status",
  ] as const);

  const status: VehicleStatus | undefined =
    statusFilter !== "all" ? (statusFilter as VehicleStatus) : undefined;

  const listQuery = useListVehicles(
    { search: search || undefined, status, page, pageSize: PAGE_SIZE },
    {
      query: {
        queryKey: getListVehiclesQueryKey({
          search: search || undefined,
          status,
          page,
          pageSize: PAGE_SIZE,
        }),
        placeholderData: (prev) => prev,
      },
    },
  );

  const invalidateList = () => {
    if (orgId == null) return;
    void queryClient.invalidateQueries({
      queryKey: withOrgKey(orgId, getListVehiclesQueryKey()),
    });
  };

  const createMutation = useCreateVehicle({
    mutation: {
      ...handlers("create", "تعذر إنشاء المركبة", () => {
        invalidateList();
        onCreateSuccess?.();
      }),
    },
  });

  const updateMutation = useUpdateVehicle();

  const deleteMutation = useDeleteVehicle({
    mutation: {
      ...handlers("delete", "تعذر حذف المركبة", () => {
        invalidateList();
        onDeleteSuccess?.();
      }),
    },
  });

  const submitCreate = (body: CreateVehicleBody) => {
    clearBefore("create");
    createMutation.mutate({ data: body });
  };
  const submitUpdate = (id: number, body: CreateVehicleBody) => {
    clearBefore("update");
    updateMutation.mutate(
      { id, data: body },
      {
        ...handlers("update", "تعذر تحديث المركبة", () => {
          invalidateList();
          onUpdateSuccess?.();
        }),
      },
    );
  };
  const submitDelete = (id: number) => {
    clearBefore("delete");
    deleteMutation.mutate({ id });
  };
  const submitStatusChange = (vehicle: Vehicle, nextStatus: VehicleStatus) => {
    clearBefore("status");
    updateMutation.mutate(
      { id: vehicle.id, data: vehicleToBody(vehicle, nextStatus) },
      {
        ...handlers("status", "تعذر تحديث حالة المركبة", () => {
          invalidateList();
        }),
      },
    );
  };

  const buildEditDefaultValues = (vehicle: Vehicle) => ({
    brand: vehicle.brand,
    modelYear: vehicle.modelYear,
    coolingType: vehicle.coolingType,
    registrationColor: vehicle.registrationColor,
    chassisNumber: vehicle.chassisNumber,
    serialNumber: vehicle.serialNumber,
    plateNumber: vehicle.plateNumber,
    registrationExpiryDate: vehicle.registrationExpiryDate
      ? String(vehicle.registrationExpiryDate).slice(0, 10)
      : "",
    inspectionExpiryDate: vehicle.inspectionExpiryDate
      ? String(vehicle.inspectionExpiryDate).slice(0, 10)
      : "",
    odometer: vehicle.odometer,
    periodicMaintenanceInterval: vehicle.periodicMaintenanceInterval,
    status: vehicle.status,
  });

  return {
    vehicles: listQuery.data?.data ?? [],
    total: listQuery.data?.total ?? 0,
    isLoading: listQuery.isLoading,
    listError: resolveQueryError(listQuery.isError, listQuery.error, "تعذر تحميل المركبات"),
    PAGE_SIZE,
    createIsPending: createMutation.isPending,
    updateIsPending: updateMutation.isPending,
    deleteIsPending: deleteMutation.isPending,
    createError: errors.create,
    updateError: errors.update,
    deleteError: errors.delete,
    statusError: errors.status,
    buildEditDefaultValues,
    submitCreate,
    submitUpdate,
    submitDelete,
    submitStatusChange,
  };
}
