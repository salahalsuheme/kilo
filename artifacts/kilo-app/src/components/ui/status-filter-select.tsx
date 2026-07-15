import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toolbarControlTriggerClass } from "@/components/ui/toolbar-control-styles";

export interface StatusFilterOption {
  value: string;
  label: string;
}

interface StatusFilterSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: StatusFilterOption[];
  triggerClassName?: string;
}

/** Status/type dropdown aligned with SearchInput toolbar styling (presentation only). */
export function StatusFilterSelect({
  value,
  onValueChange,
  options,
  triggerClassName,
}: StatusFilterSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={cn(
          toolbarControlTriggerClass,
          "w-[10rem] shrink-0 px-3",
          triggerClassName,
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
