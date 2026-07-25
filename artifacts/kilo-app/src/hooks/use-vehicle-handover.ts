import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Contract } from "@/lib/api-client-react-tenant";
import {
  getContractVehicleDamageForm,
  getContractVehicleDeliveryDamageForm,
  getCustomer,
  getListContractsQueryKey,
  getVehicle,
  useGetSettings,
  useUpsertContractVehicleDamageForm,
  useUpsertContractVehicleDeliveryDamageForm,
} from "@/lib/api-client-react-tenant";
import { getApiErrorMessage } from "@/lib/api-error";
import { openPrintDocument } from "@/lib/print/open-print-document";
import {
  VEHICLE_DAMAGE_DIAGRAM_IMAGE_SRC,
} from "@/lib/vehicle-damage/vehicle-damage-assets";
import { renderVehicleHandoverDiagramImage } from "@/lib/vehicle-damage/render-damage-form-image";
import { buildVehicleDamageFormPrintHtml } from "@workspace/print-domain";
import { withOrgKey } from "@/lib/tenant-cache";
import { useOrgId } from "@/hooks/use-invalidate";
import {
  isVehicleDeliveryHandoverDisabled,
  isVehicleReceiptHandoverLocked,
  canPrintVehicleReceiptHandover,
  vehicleDamageFormDocumentHeading,
  vehicleDeliveryFormDocumentHeading,
  type VehicleDamageMarker,
} from "@workspace/contracts-domain";
import { resolveOrgUnifiedNumberFromStorage } from "@workspace/settings-domain";
import type { VehicleHandoverPrintPhase } from "@workspace/print-domain";
import { resolveOrgMediaUrlsForPrint } from "@/lib/print/inline-upload-for-print";
import { mapVehicleToHandoverPrintInfo } from "@/features/contracts/handover-print-vehicle";
import type { ContractHandoverVehicleInfo } from "@workspace/contracts-domain";

export type VehicleHandoverPhase = "receipt" | "delivery";

type HandoverFormDto = Awaited<ReturnType<typeof getContractVehicleDamageForm>>;
type DeliveryHandoverFormDto = Awaited<ReturnType<typeof getContractVehicleDeliveryDamageForm>>;

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("تعذر تحضير صورة المحضر للطباعة"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("تعذر تحضير صورة المحضر للطباعة"));
    reader.readAsDataURL(blob);
  });
}

async function loadHandoverForm(
  contract: Contract,
  phase: VehicleHandoverPhase,
): Promise<HandoverFormDto | DeliveryHandoverFormDto> {
  return phase === "delivery"
    ? getContractVehicleDeliveryDamageForm(contract.id)
    : getContractVehicleDamageForm(contract.id);
}

type HandoverPrintContext = {
  contractNumber: string;
  vehicle: ContractHandoverVehicleInfo;
  driverName: string;
  driverIdNumber: string;
  orgBusinessName: string;
  orgUnifiedNumber: string | null;
  orgStampUrl: string | null;
  orgSignatureUrl: string | null;
  establishmentName: string | null | undefined;
  establishmentFullName: string | null | undefined;
};


async function buildHandoverPrintBodyHtml(
  ctx: HandoverPrintContext,
  phase: VehicleHandoverPrintPhase,
  diagramDataUrl: string,
  newDamageMarkerCount: number,
): Promise<string> {
  const media = await resolveOrgMediaUrlsForPrint(ctx.orgStampUrl, ctx.orgSignatureUrl);
  return buildVehicleDamageFormPrintHtml({
    phase,
    contractNumber: ctx.contractNumber,
    vehicle: ctx.vehicle,
    diagramDataUrl,
    driverName: ctx.driverName,
    driverIdNumber: ctx.driverIdNumber,
    orgBusinessName: ctx.orgBusinessName,
    orgUnifiedNumber: ctx.orgUnifiedNumber,
    orgStampUrl: media.stampUrl,
    orgSignatureUrl: media.signatureUrl,
    establishmentName: ctx.establishmentName,
    establishmentFullName: ctx.establishmentFullName,
    newDamageMarkerCount: phase === "delivery" ? newDamageMarkerCount : 0,
  });
}

async function resolveHandoverPrintContext(
  contract: Contract,
  phase: VehicleHandoverPhase,
  orgSettingsFallback:
    | {
        businessName?: string;
        unifiedNumber?: string | null;
        stampUrl?: string | null;
        signatureUrl?: string | null;
      }
    | undefined,
): Promise<HandoverPrintContext> {
  try {
    const form = await loadHandoverForm(contract, phase);
    return {
      contractNumber: form.contractNumber,
      vehicle: form.vehicle,
      driverName: form.driverName,
      driverIdNumber: form.driverIdNumber,
      orgBusinessName: form.orgBusinessName,
      orgUnifiedNumber: form.orgUnifiedNumber ?? null,
      orgStampUrl: form.orgStampUrl ?? null,
      orgSignatureUrl: form.orgSignatureUrl ?? null,
      establishmentName: form.establishmentName,
      establishmentFullName: form.establishmentFullName,
    };
  } catch {
    const [customer, vehicle] = await Promise.all([
      getCustomer(contract.customerId),
      getVehicle(contract.carId),
    ]);
    return {
      contractNumber: contract.contractNumber,
      vehicle: mapVehicleToHandoverPrintInfo(vehicle),
      driverName: contract.driverName,
      driverIdNumber: customer.idNumber,
      orgBusinessName: orgSettingsFallback?.businessName ?? "",
      orgUnifiedNumber: resolveOrgUnifiedNumberFromStorage(orgSettingsFallback?.unifiedNumber),
      orgStampUrl: orgSettingsFallback?.stampUrl ?? null,
      orgSignatureUrl: orgSettingsFallback?.signatureUrl ?? null,
      establishmentName: contract.establishmentName,
      establishmentFullName: contract.establishmentFullName,
    };
  }
}

export function useVehicleHandover() {
  const orgId = useOrgId();
  const queryClient = useQueryClient();
  const { data: orgSettings } = useGetSettings();
  const [dialogContract, setDialogContract] = useState<Contract | null>(null);
  const [handoverPhase, setHandoverPhase] = useState<VehicleHandoverPhase>("receipt");
  const [initialMarkers, setInitialMarkers] = useState<VehicleDamageMarker[]>([]);
  const [initialPriorMarkers, setInitialPriorMarkers] = useState<VehicleDamageMarker[]>([]);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const saveReceiptMutation = useUpsertContractVehicleDamageForm();
  const saveDeliveryMutation = useUpsertContractVehicleDeliveryDamageForm();

  const invalidateList = () => {
    if (orgId == null) return;
    void queryClient.invalidateQueries({
      queryKey: withOrgKey(orgId, getListContractsQueryKey()),
    });
  };

  const openDialog = async (contract: Contract, phase: VehicleHandoverPhase) => {
    setFormError(null);
    setActionError(null);
    setHandoverPhase(phase);
    setDialogContract(contract);
    setIsLoadingForm(true);
    setInitialMarkers([]);
    setInitialPriorMarkers([]);

    try {
      if (phase === "delivery") {
        const form = await getContractVehicleDeliveryDamageForm(contract.id);
        setInitialPriorMarkers(form.priorMarkers);
        setInitialMarkers(form.markers);
      } else if (contract.hasVehicleDamageForm) {
        const form = await getContractVehicleDamageForm(contract.id);
        setInitialMarkers(form.markers);
      }
    } catch {
      setFormError(phase === "delivery" ? "تعذر تحميل محضر التسليم" : "تعذر تحميل محضر الاستلام");
    } finally {
      setIsLoadingForm(false);
    }
  };

  const printHandover = async (contract: Contract, phase: VehicleHandoverPrintPhase) => {
    setActionError(null);
    try {
      const form = await loadHandoverForm(contract, phase);
      const priorMarkers = phase === "delivery" && "priorMarkers" in form ? form.priorMarkers : [];
      const newMarkers = form.markers;
      const blob = await renderVehicleHandoverDiagramImage(
        VEHICLE_DAMAGE_DIAGRAM_IMAGE_SRC,
        priorMarkers,
        newMarkers,
      );
      const diagramDataUrl = await blobToDataUrl(blob);
      const ctx = await resolveHandoverPrintContext(contract, phase, orgSettings);
      const bodyHtml = await buildHandoverPrintBodyHtml(
        ctx,
        phase,
        diagramDataUrl,
        newMarkers.length,
      );
      const heading =
        phase === "delivery"
          ? vehicleDeliveryFormDocumentHeading(contract.contractNumber)
          : vehicleDamageFormDocumentHeading(contract.contractNumber);
      const opened = openPrintDocument({
        bodyHtml,
        iframeTitle: heading,
        sheetHeaderReference: contract.contractNumber,
      });
      if (!opened) {
        setActionError("تعذر بدء الطباعة. حاول مرة أخرى.");
        return false;
      }
      return true;
    } catch {
      setActionError(
        phase === "delivery" ? "تعذر طباعة محضر التسليم" : "تعذر طباعة محضر الاستلام",
      );
      return false;
    }
  };

  const handleReceiptMenu = (contract: Contract) => {
    if (isVehicleReceiptHandoverLocked(contract)) return;
    void openDialog(contract, "receipt");
  };

  const handlePrintReceiptMenu = (contract: Contract) => {
    if (!canPrintVehicleReceiptHandover(contract)) return;
    void printHandover(contract, "receipt");
  };

  const handleDeliveryMenu = (contract: Contract) => {
    if (isVehicleDeliveryHandoverDisabled(contract)) return;
    void openDialog(contract, "delivery");
  };

  const saveForm = async (markers: VehicleDamageMarker[]) => {
    if (!dialogContract) return;
    setFormError(null);
    const phase = handoverPhase;
    try {
      if (phase === "delivery") {
        await saveDeliveryMutation.mutateAsync({
          id: dialogContract.id,
          data: { markers },
        });
      } else {
        await saveReceiptMutation.mutateAsync({
          id: dialogContract.id,
          data: { markers },
        });
      }
      invalidateList();
      const contract = dialogContract;
      setDialogContract(null);
      await printHandover(contract, phase);
    } catch (error) {
      setFormError(
        getApiErrorMessage(
          error,
          phase === "delivery" ? "تعذر حفظ محضر التسليم" : "تعذر حفظ محضر الاستلام",
        ),
      );
    }
  };

  const printFromDialog = async (
    markers: VehicleDamageMarker[],
    priorMarkers: VehicleDamageMarker[],
  ) => {
    if (!dialogContract) return;
    setActionError(null);
    try {
      const prior = handoverPhase === "delivery" ? priorMarkers : [];
      const blob = await renderVehicleHandoverDiagramImage(
        VEHICLE_DAMAGE_DIAGRAM_IMAGE_SRC,
        prior,
        markers,
      );
      const diagramDataUrl = await blobToDataUrl(blob);
      const ctx = await resolveHandoverPrintContext(dialogContract, handoverPhase, orgSettings);
      const bodyHtml = await buildHandoverPrintBodyHtml(
        ctx,
        handoverPhase,
        diagramDataUrl,
        markers.length,
      );
      const heading =
        handoverPhase === "delivery"
          ? vehicleDeliveryFormDocumentHeading(dialogContract.contractNumber)
          : vehicleDamageFormDocumentHeading(dialogContract.contractNumber);
      openPrintDocument({
        bodyHtml,
        iframeTitle: heading,
        sheetHeaderReference: dialogContract.contractNumber,
      });
    } catch {
      setActionError("تعذر طباعة المعاينة");
    }
  };

  const saveIsPending = saveReceiptMutation.isPending || saveDeliveryMutation.isPending;

  return {
    dialogContract,
    handoverPhase,
    setDialogContract,
    initialMarkers,
    initialPriorMarkers,
    isLoadingForm,
    formError,
    actionError,
    openDialog,
    handleReceiptMenu,
    handlePrintReceiptMenu,
    handleDeliveryMenu,
    saveForm,
    printFromDialog,
    saveIsPending,
  };
}
