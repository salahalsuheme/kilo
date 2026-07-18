import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Contract } from "@/lib/api-client-react-tenant";
import {
  downloadContractSignedAttachment,
  getListContractsQueryKey,
  useUploadContractSignedAttachment,
} from "@/lib/api-client-react-tenant";
import { getApiErrorMessage } from "@/lib/api-error";
import { downloadBlob } from "@/lib/print/download-blob";
import { withOrgKey } from "@/lib/tenant-cache";
import { useOrgId } from "@/hooks/use-invalidate";

function signedAttachmentFilename(contract: Contract, blob: Blob): string {
  const base = `${contract.contractNumber}-signed`;
  if (blob.type === "application/pdf") return `${base}.pdf`;
  if (blob.type === "image/jpeg") return `${base}.jpg`;
  if (blob.type === "image/png") return `${base}.png`;
  if (blob.type === "image/webp") return `${base}.webp`;
  return base;
}

export function useSignedContractAttachment() {
  const orgId = useOrgId();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [replaceTarget, setReplaceTarget] = useState<Contract | null>(null);
  const [pendingUploadContract, setPendingUploadContract] = useState<Contract | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadMutation = useUploadContractSignedAttachment();

  const invalidateList = () => {
    if (orgId == null) return;
    void queryClient.invalidateQueries({
      queryKey: withOrgKey(orgId, getListContractsQueryKey()),
    });
  };

  const openFilePicker = (contract: Contract) => {
    setUploadError(null);
    setPendingUploadContract(contract);
    fileInputRef.current?.click();
  };

  const requestUpload = (contract: Contract) => {
    if (contract.isSigned) {
      setReplaceTarget(contract);
      return;
    }
    openFilePicker(contract);
  };

  const confirmReplace = () => {
    if (!replaceTarget) return;
    const contract = replaceTarget;
    setReplaceTarget(null);
    openFilePicker(contract);
  };

  const handleFileSelected = async (file: File | undefined) => {
    const contract = pendingUploadContract;
    setPendingUploadContract(null);
    if (!file || !contract) return;

    setUploadError(null);
    try {
      await uploadMutation.mutateAsync({ id: contract.id, data: { file } });
      invalidateList();
    } catch (error) {
      setUploadError(getApiErrorMessage(error, "تعذر رفع العقد الموقع"));
    }
  };

  const downloadSigned = async (contract: Contract) => {
    if (!contract.isSigned) return false;
    try {
      const blob = await downloadContractSignedAttachment(contract.id);
      downloadBlob(blob, signedAttachmentFilename(contract, blob));
      return true;
    } catch {
      return false;
    }
  };

  return {
    fileInputRef,
    replaceTarget,
    setReplaceTarget,
    requestUpload,
    confirmReplace,
    handleFileSelected,
    downloadSigned,
    uploadIsPending: uploadMutation.isPending,
    uploadError,
    clearUploadError: () => setUploadError(null),
  };
}
