import type { Contract, ContractStatus } from "@/lib/api-client-react-tenant";
import { CONTRACT_STATUS_LABELS } from "@workspace/contracts-domain";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileEdit, CheckCircle2, Download, MoreHorizontal, Printer, RefreshCw, Trash2 } from "lucide-react";
import type { PrintMode } from "@/lib/print/open-print-document";

interface ContractRowActionsMenuProps {
  contract: Contract;
  onEdit: (contract: Contract) => void;
  onDelete: (id: number) => void;
  onChangeStatus: (contract: Contract, status: ContractStatus) => void;
  onPrint: (contract: Contract, mode: PrintMode) => void;
}

const STATUS_ACTIONS: Array<{
  status: ContractStatus;
  allowedFrom: ContractStatus[];
}> = [
  { status: "cancelled", allowedFrom: ["active"] },
  { status: "closed", allowedFrom: ["active", "overdue"] },
];

export function ContractRowActionsMenu({
  contract,
  onEdit,
  onDelete,
  onChangeStatus,
  onPrint,
}: ContractRowActionsMenuProps) {
  const canDelete = contract.status === "draft";
  const canEdit = contract.status === "draft";
  const canActivate = contract.status === "draft";
  const statusOptions = STATUS_ACTIONS.filter((action) =>
    action.allowedFrom.includes(contract.status),
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {canActivate ? (
          <DropdownMenuItem
            className="text-green-700 focus:text-green-800 focus:bg-green-50"
            onClick={(e) => {
              e.stopPropagation();
              onChangeStatus(contract, "active");
            }}
          >
            <CheckCircle2 className="h-4 w-4 me-2 text-green-600" />
            تنشيط العقد
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuItem
          disabled={!canEdit}
          onClick={(e) => {
            e.stopPropagation();
            if (canEdit) onEdit(contract);
          }}
        >
          <FileEdit className="h-4 w-4 me-2" />
          تعديل
        </DropdownMenuItem>

        {statusOptions.length > 0 && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <RefreshCw className="h-4 w-4 me-2" />
              تغيير الحالة
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {statusOptions.map((action) => (
                <DropdownMenuItem
                  key={action.status}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangeStatus(contract, action.status);
                  }}
                >
                  {CONTRACT_STATUS_LABELS[action.status]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}

        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onPrint(contract, "print");
          }}
        >
          <Printer className="h-4 w-4 me-2" />
          طباعة
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onPrint(contract, "pdf");
          }}
        >
          <Download className="h-4 w-4 me-2" />
          تنزيل
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive"
          disabled={!canDelete}
          onClick={(e) => {
            e.stopPropagation();
            if (canDelete) onDelete(contract.id);
          }}
        >
          <Trash2 className="h-4 w-4 me-2" />
          حذف
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
