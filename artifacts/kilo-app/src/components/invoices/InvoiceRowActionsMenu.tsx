import type { Invoice } from "@/lib/api-client-react-tenant";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, MoreHorizontal, Printer } from "lucide-react";
import type { PrintMode } from "@/lib/print/open-print-document";

interface InvoiceRowActionsMenuProps {
  invoice: Invoice;
  onPrint: (invoice: Invoice, mode: PrintMode) => void;
}

export function InvoiceRowActionsMenu({ invoice, onPrint }: InvoiceRowActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
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
