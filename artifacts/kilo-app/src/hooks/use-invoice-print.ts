import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  downloadInvoicePdf,
  getGetInvoiceQueryKey,
  getInvoice,
} from "@/lib/api-client-react-tenant";
import { withOrgKey } from "@/lib/tenant-cache";
import { useOrgId } from "@/hooks/use-invalidate";
import { buildInvoicePrintHtml, sanitizePdfFilename } from "@workspace/print-domain";
import { openPrintDocument, type PrintMode } from "@/lib/print/open-print-document";
import { downloadBlob } from "@/lib/print/download-blob";

export function useInvoicePrint() {
  const orgId = useOrgId();
  const queryClient = useQueryClient();

  const printInvoice = useCallback(
    async (invoiceId: number, mode: PrintMode, downloadName?: string) => {
      if (orgId == null) return false;

      if (mode === "pdf") {
        try {
          const blob = await downloadInvoicePdf(invoiceId);
          downloadBlob(
            blob,
            sanitizePdfFilename(downloadName ? `${downloadName}.pdf` : `invoice-${invoiceId}.pdf`),
          );
          return true;
        } catch {
          return false;
        }
      }

      const invoice = await queryClient.fetchQuery({
        queryKey: withOrgKey(orgId, getGetInvoiceQueryKey(invoiceId)),
        queryFn: () => getInvoice(invoiceId),
      });

      const bodyHtml = await buildInvoicePrintHtml(invoice);
      return openPrintDocument({ title: `فاتورة ${invoice.invoiceNumber}`, bodyHtml });
    },
    [orgId, queryClient],
  );

  return { printInvoice };
}
