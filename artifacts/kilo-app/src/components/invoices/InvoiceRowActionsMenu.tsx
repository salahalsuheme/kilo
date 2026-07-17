import type { Invoice } from "@/lib/api-client-react-tenant";
import { canEditPenaltyInvoice, canMarkPenaltyInvoicePaid } from "@workspace/invoices-domain";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle, Download, FileEdit, MoreHorizontal, Printer } from "lucide-react";
import type { PrintMode } from "@/lib/print/open-print-document";

interface InvoiceRowActionsMenuProps {
  invoice: Invoice;
  onPrint: (invoice: Invoice, mode: PrintMode) => void;
  onEdit: (invoice: Invoice) => void;
  onMarkPaid: (invoice: Invoice) => void;
  statusIsPending?: boolean;
}

export function InvoiceRowActionsMenu({
  invoice,
  onPrint,
  onEdit,
  onMarkPaid,
  statusIsPending,
}: InvoiceRowActionsMenuProps) {
  const canEdit = canEditPenaltyInvoice(invoice.invoiceSeq, invoice.status);
  const canMarkPaid = canMarkPenaltyInvoicePaid(invoice.invoiceSeq, invoice.status);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {canEdit ? (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onEdit(invoice);
            }}
          >
            <FileEdit className="h-4 w-4 me-2" />
            تعديل
          </DropdownMenuItem>
        ) : null}
        {canMarkPaid ? (
          <DropdownMenuItem
            disabled={statusIsPending}
            onClick={(e) => {
              e.stopPropagation();
              onMarkPaid(invoice);
            }}
          >
            <CheckCircle className="h-4 w-4 me-2" />
            تسجيل كمدفوعة
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onPrint(invoice, "print");
          }}
        >
          <Printer className="h-4 w-4 me-2" />
          طباعة
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onPrint(invoice, "pdf");
          }}
        >
          <Download className="h-4 w-4 me-2" />
          تنزيل
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
