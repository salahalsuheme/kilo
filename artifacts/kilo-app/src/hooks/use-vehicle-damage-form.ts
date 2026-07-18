import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Contract } from "@/lib/api-client-react-tenant";
import {
  getContractVehicleDamageForm,
  getListContractsQueryKey,
  useDeleteContractVehicleDamageForm,
  useUpsertContractVehicleDamageForm,
} from "@/lib/api-client-react-tenant";
import { getApiErrorMessage } from "@/lib/api-error";
import { downloadBlob } from "@/lib/print/download-blob";
import {
  VEHICLE_DAMAGE_DIAGRAM_IMAGE_SRC,
} from "@/lib/vehicle-damage/vehicle-damage-assets";
import { renderVehicleDamageFormImage } from "@/lib/vehicle-damage/render-damage-form-image";
import { withOrgKey } from "@/lib/tenant-cache";
import { useOrgId } from "@/hooks/use-invalidate";
import type { VehicleDamageMarker } from "@workspace/contracts-domain";

export function useVehicleDamageForm() {
  const orgId = useOrgId();
  const queryClient = useQueryClient();
  const [dialogContract, setDialogContract] = useState<Contract | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Contract | null>(null);
  const [initialMarkers, setInitialMarkers] = useState<VehicleDamageMarker[]>([]);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const saveMutation = useUpsertContractVehicleDamageForm();
  const deleteMutation = useDeleteContractVehicleDamageForm();

  const invalidateList = () => {
    if (orgId == null) return;
    void queryClient.invalidateQueries({
      queryKey: withOrgKey(orgId, getListContractsQueryKey()),
    });
  };

  const openForm = async (contract: Contract) => {
    setFormError(null);
    setActionError(null);
    setDialogContract(contract);
    setIsLoadingForm(true);
    setInitialMarkers([]);

    try {
      if (contract.hasVehicleDamageForm) {
        const form = await getContractVehicleDamageForm(contract.id);
        setInitialMarkers(form.markers);
      }
    } catch {
      setFormError("تعذر تحميل نموذج الأضرار");
    } finally {
      setIsLoadingForm(false);
    }
  };

  const saveForm = async (markers: VehicleDamageMarker[]) => {
    if (!dialogContract) return;
    setFormError(null);
    try {
      await saveMutation.mutateAsync({
        id: dialogContract.id,
        data: { markers },
      });
      invalidateList();
      setDialogContract(null);
    } catch (error) {
      setFormError(getApiErrorMessage(error, "تعذر حفظ نموذج الأضرار"));
    }
  };

  const requestDelete = (contract: Contract) => {
    setActionError(null);
    setDeleteTarget(contract);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setActionError(null);
    try {
      await deleteMutation.mutateAsync({ id: deleteTarget.id });
      invalidateList();
      setDeleteTarget(null);
    } catch (error) {
      setActionError(getApiErrorMessage(error, "تعذر حذف نموذج الأضرار"));
    }
  };

  const downloadForm = async (contract: Contract) => {
    setActionError(null);
    try {
      const form = await getContractVehicleDamageForm(contract.id);
      const blob = await renderVehicleDamageFormImage(
        VEHICLE_DAMAGE_DIAGRAM_IMAGE_SRC,
        form.markers,
      );
      downloadBlob(blob, `${contract.contractNumber}-vehicle-damage.png`);
      return true;
    } catch {
      setActionError("تعذر تنزيل نموذج الأضرار");
      return false;
    }
  };

  return {
    dialogContract,
    setDialogContract,
    deleteTarget,
    setDeleteTarget,
    initialMarkers,
    isLoadingForm,
    formError,
    actionError,
    openForm,
    saveForm,
    requestDelete,
    confirmDelete,
    downloadForm,
    saveIsPending: saveMutation.isPending,
    deleteIsPending: deleteMutation.isPending,
  };
}
