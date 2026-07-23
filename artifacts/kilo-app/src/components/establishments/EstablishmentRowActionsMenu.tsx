import type { Establishment } from "@/lib/api-client-react-tenant";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, FileEdit, Trash2 } from "lucide-react";

interface EstablishmentRowActionsMenuProps {
  establishment: Establishment;
  onEdit: (establishment: Establishment) => void;
  onDelete: (id: number) => void;
}

export function EstablishmentRowActionsMenu({
  establishment,
  onEdit,
  onDelete,
}: EstablishmentRowActionsMenuProps) {
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
            onEdit(establishment);
          }}
        >
          <FileEdit className="h-4 w-4 me-2" />
          تعديل
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(establishment.id);
          }}
        >
          <Trash2 className="h-4 w-4 me-2" />
          حذف
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
