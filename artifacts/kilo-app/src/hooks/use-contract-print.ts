import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  downloadContractPdf,
  getGetContractQueryKey,
  getGetSettingsQueryKey,
  getContract,
  getSettings,
} from "@/lib/api-client-react-tenant";
import { withOrgKey } from "@/lib/tenant-cache";
import { useOrgId } from "@/hooks/use-invalidate";
import { buildContractPrintHtml, sanitizePdfFilename } from "@workspace/print-domain";
import { openPrintDocument, type PrintMode } from "@/lib/print/open-print-document";
import { downloadBlob } from "@/lib/print/download-blob";

export function useContractPrint() {
  const orgId = useOrgId();
  const queryClient = useQueryClient();

  const printContract = useCallback(
    async (contractId: number, mode: PrintMode, downloadName?: string) => {
      if (orgId == null) return false;

      if (mode === "pdf") {
        try {
          const blob = await downloadContractPdf(contractId);
          downloadBlob(
            blob,
            sanitizePdfFilename(downloadName ? `${downloadName}.pdf` : `contract-${contractId}.pdf`),
          );
          return true;
        } catch {
          return false;
        }
      }

      const [contract, settings] = await Promise.all([
        queryClient.fetchQuery({
          queryKey: withOrgKey(orgId, getGetContractQueryKey(contractId)),
          queryFn: () => getContract(contractId),
        }),
        queryClient.fetchQuery({
          queryKey: withOrgKey(orgId, getGetSettingsQueryKey()),
          queryFn: () => getSettings(),
        }),
      ]);

      const bodyHtml = buildContractPrintHtml(contract, settings);
      return openPrintDocument({ title: `عقد ${contract.contractNumber}`, bodyHtml });
    },
    [orgId, queryClient],
  );

  return { printContract };
}
