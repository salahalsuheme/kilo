import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toolbarControlButtonClass } from "@/components/ui/toolbar-control-styles";

interface ExportExcelButtonProps {
  onClick: () => void;
  label: string;
  className?: string;
  disabled?: boolean;
}

/** Export control — same height and corners as SearchInput / status selects. */
export function ExportExcelButton({
  onClick,
  label,
  className,
  disabled,
}: ExportExcelButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className={cn("shrink-0", toolbarControlButtonClass, className)}
    >
      <FileDown className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </Button>
  );
}
