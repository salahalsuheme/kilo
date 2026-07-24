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
import { openPrintDocument } from "@/lib/print/open-print-document";
import {
  VEHICLE_DAMAGE_DIAGRAM_IMAGE_SRC,
} from "@/lib/vehicle-damage/vehicle-damage-assets";
import { renderVehicleDamageFormImage } from "@/lib/vehicle-damage/render-damage-form-image";
import { buildVehicleDamageFormPrintHtml } from "@workspace/print-domain";
import { withOrgKey } from "@/lib/tenant-cache";
import { useOrgId } from "@/hooks/use-invalidate";
import {
  vehicleDamageFormDocumentHeading,
  type VehicleDamageMarker,
} from "@workspace/contracts-domain";

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("تعذر تحضير صورة النموذج للطباعة"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("تعذر تحضير صورة النموذج للطباعة"));
    reader.readAsDataURL(blob);
  });
}

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

  const loadSavedForm = (contract: Contract) =>
    getContractVehicleDamageForm(contract.id);

  const renderSavedFormImage = async (contract: Contract) => {
    const form = await loadSavedForm(contract);
    return renderVehicleDamageFormImage(VEHICLE_DAMAGE_DIAGRAM_IMAGE_SRC, form.markers);
  };

  const downloadForm = async (contract: Contract) => {
    setActionError(null);
    try {
      const blob = await renderSavedFormImage(contract);
      downloadBlob(blob, `${contract.contractNumber}-vehicle-damage.png`);
      return true;
    } catch {
      setActionError("تعذر تنزيل نموذج الأضرار");
      return false;
    }
  };

  const printForm = async (contract: Contract) => {
    setActionError(null);
    try {
      const form = await loadSavedForm(contract);
      const blob = await renderVehicleDamageFormImage(
        VEHICLE_DAMAGE_DIAGRAM_IMAGE_SRC,
        form.markers,
      );
      const diagramDataUrl = await blobToDataUrl(blob);
      const bodyHtml = buildVehicleDamageFormPrintHtml({
        diagramDataUrl,
        driverName: form.driverName,
        establishmentName: form.establishmentName,
        establishmentFullName: form.establishmentFullName,
      });
      const opened = openPrintDocument({
        title: vehicleDamageFormDocumentHeading(contract.contractNumber),
        bodyHtml,
      });
      if (!opened) {
        setActionError("تعذر بدء الطباعة. حاول مرة أخرى.");
        return false;
      }
      return true;
    } catch {
      setActionError("تعذر طباعة نموذج الأضرار");
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
    printForm,
    saveIsPending: saveMutation.isPending,
    deleteIsPending: deleteMutation.isPending,
  };
}
