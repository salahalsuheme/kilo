import { SearchInput } from "@/components/ui/search-input";
import { StatusFilterSelect } from "@/components/ui/status-filter-select";
import { Button } from "@/components/ui/button";
import {
  MobileToolbar,
  mobileToolbarCountClass,
  mobileToolbarSearchWrapClass,
  mobileToolbarSelectClass,
} from "@/components/mobile";
import { FINANCE_INVOICE_STATUS_LABELS } from "@workspace/finance-domain";
import type { FinanceInvoiceStatus } from "@/lib/api-client-react-tenant";
import { Plus } from "lucide-react";

interface PurchasesToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  rowCount: number;
  total: number;
  isLoading: boolean;
  onNewPurchase: () => void;
}

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "all", label: "كل الحالات" },
  ...(Object.entries(FINANCE_INVOICE_STATUS_LABELS) as Array<
    [FinanceInvoiceStatus, string]
  >).map(([value, label]) => ({ value, label })),
];

export function PurchasesToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  rowCount,
  total,
  isLoading,
  onNewPurchase,
}: PurchasesToolbarProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-start">
        <Button
          onClick={onNewPurchase}
          className="bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 shadow-sm"
        >
          <Plus className="h-4 w-4 me-2" />
          إضافة فاتورة مشتريات
        </Button>
      </div>
      <MobileToolbar>
        <SearchInput
          name="purchases-search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ابحث في المشتريات .."
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
    </div>
  );
}
