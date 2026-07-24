import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import type { Establishment } from "@/lib/api-client-react-tenant";
import {
  formatEstablishmentFullName,
  type EstablishmentType,
} from "@workspace/establishments-domain";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface EstablishmentSearchSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  establishments: Establishment[];
  allowNone?: boolean;
  noneLabel?: string;
  placeholder?: string;
  disabled?: boolean;
}

function establishmentSearchLabel(establishment: Establishment): string {
  return formatEstablishmentFullName(
    establishment.clientType as EstablishmentType,
    establishment.name,
  );
}

export function EstablishmentSearchSelect({
  value,
  onValueChange,
  establishments,
  allowNone = true,
  noneLabel = "بدون منشأة (عقد فرد)",
  placeholder = "اختر المنشأة",
  disabled = false,
}: EstablishmentSearchSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedLabel = useMemo(() => {
    if (!value) {
      return allowNone ? noneLabel : placeholder;
    }
    const match = establishments.find((item) => String(item.id) === value);
    return match ? establishmentSearchLabel(match) : placeholder;
  }, [allowNone, establishments, noneLabel, placeholder, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
          dir="rtl"
        >
          <span className="truncate text-right">{selectedLabel}</span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start" dir="rtl">
        <Command dir="rtl">
          <CommandInput placeholder="بحث عن منشأة..." className="text-right" />
          <CommandList>
            <CommandEmpty>لا توجد منشأة مطابقة</CommandEmpty>
            <CommandGroup>
              {allowNone ? (
                <CommandItem
                  value={`${noneLabel} فرد`}
                  onSelect={() => {
                    onValueChange("");
                    setOpen(false);
                  }}
                  className="text-right"
                >
                  <Check className={cn("ml-2 h-4 w-4", value ? "opacity-0" : "opacity-100")} />
                  {noneLabel}
                </CommandItem>
              ) : null}
              {establishments.map((establishment) => {
                const label = establishmentSearchLabel(establishment);
                const id = String(establishment.id);
                return (
                  <CommandItem
                    key={establishment.id}
                    value={`${label} ${establishment.establishmentNumber ?? ""}`}
                    onSelect={() => {
                      onValueChange(id);
                      setOpen(false);
                    }}
                    className="text-right"
                  >
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4",
                        value === id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
