import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TenantPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function TenantPagination({ page, pageSize, total, onPageChange }: TenantPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  if (totalPages <= 1) return null;

  const canPrev = safePage > 1;
  const canNext = safePage < totalPages;

  return (
    <div className="flex items-center justify-center gap-2">
      <Button size="sm" variant="outline" disabled={!canPrev} onClick={() => onPageChange(safePage - 1)}>
        <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
      </Button>
      <span className="text-sm tabular-nums" dir="ltr">
        {safePage} / {totalPages}
      </span>
      <Button size="sm" variant="outline" disabled={!canNext} onClick={() => onPageChange(safePage + 1)}>
        <ChevronRight className="h-4 w-4 rtl:rotate-180" />
      </Button>
    </div>
  );
}
