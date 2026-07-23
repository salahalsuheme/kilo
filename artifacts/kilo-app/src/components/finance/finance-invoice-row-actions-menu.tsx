import type { FinanceInvoiceStatus } from "@/lib/api-client-react-tenant";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle, FileEdit, MoreHorizontal, Trash2 } from "lucide-react";

interface FinanceInvoiceRowActionsMenuProps {
  status: FinanceInvoiceStatus;
  onEdit: () => void;
  onDelete: () => void;
  onMarkPaid?: () => void;
  statusIsPending?: boolean;
}

export function FinanceInvoiceRowActionsMenu({
  status,
  onEdit,
  onDelete,
  onMarkPaid,
  statusIsPending,
}: FinanceInvoiceRowActionsMenuProps) {
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
            onEdit();
          }}
        >
          <FileEdit className="h-4 w-4 me-2" />
          تعديل
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-4 w-4 me-2" />
          حذف
        </DropdownMenuItem>
        {status === "draft" && onMarkPaid ? (
          <DropdownMenuItem
            disabled={statusIsPending}
            onClick={(e) => {
              e.stopPropagation();
              onMarkPaid();
            }}
          >
            <CheckCircle className="h-4 w-4 me-2" />
            تسجيل كمدفوعة
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
