import type { CorrespondenceMessage } from "@/lib/api-client-react-tenant";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileEdit, MoreHorizontal, RefreshCw, Trash2 } from "lucide-react";
import { correspondenceResendPendingLabel } from "@/features/correspondences/correspondence-display";

interface CorrespondenceRowActionsMenuProps {
  message: CorrespondenceMessage;
  onEdit: (message: CorrespondenceMessage) => void;
  onDelete: (id: number) => void;
  onResend: (message: CorrespondenceMessage) => void;
  isResendPending?: boolean;
}

export function CorrespondenceRowActionsMenu({
  message,
  onEdit,
  onDelete,
  onResend,
  isResendPending,
}: CorrespondenceRowActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="text-right">
        <DropdownMenuItem onClick={() => onEdit(message)}>
          <FileEdit className="h-4 w-4 me-2" />
          تعديل وإرسال
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onResend(message)}
          disabled={isResendPending}
        >
          <RefreshCw
            className={`h-4 w-4 me-2 ${isResendPending ? "animate-spin" : ""}`}
          />
          {isResendPending ? correspondenceResendPendingLabel() : "إعادة الإرسال"}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => onDelete(message.id)}
        >
          <Trash2 className="h-4 w-4 me-2" />
          حذف
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
