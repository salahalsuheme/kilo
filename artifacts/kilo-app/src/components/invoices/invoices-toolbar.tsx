import { SearchInput } from "@/components/ui/search-input";
import { StatusFilterSelect } from "@/components/ui/status-filter-select";
import {
  MobileToolbar,
  mobileToolbarCountClass,
  mobileToolbarSearchWrapClass,
  mobileToolbarSelectClass,
} from "@/components/mobile";
import { INVOICE_STATUS_LABELS } from "@workspace/invoices-domain";
import type { InvoiceStatus } from "@/lib/api-client-react-tenant";

interface InvoicesToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  rowCount: number;
  total: number;
  isLoading: boolean;
}

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "all", label: "كل الحالات" },
  ...(Object.entries(INVOICE_STATUS_LABELS) as Array<[InvoiceStatus, string]>).map(
    ([value, label]) => ({ value, label }),
  ),
];

export function InvoicesToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  rowCount,
  total,
  isLoading,
}: InvoicesToolbarProps) {
  return (
    <MobileToolbar>
      <SearchInput
        name="invoices-search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="ابحث في الفواتير .."
        className="bg-white"
        wrapperClassName={mobileToolbarSearchWrapClass}
      />
      <StatusFilterSelect
        value={statusFilter}
        onValueChange={onStatusFilterChange}
        options={STATUS_OPTIONS}
        triggerClassName={mobileToolbarSelectClass}
      />
      {!isLoading && (
        <span className={mobileToolbarCountClass}>
          عرض {rowCount} من {total} فاتورة
        </span>
      )}
    </MobileToolbar>
  );
}
