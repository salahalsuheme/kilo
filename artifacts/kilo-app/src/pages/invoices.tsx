import { useState, useEffect } from "react";
import { usePageTitle } from "@/hooks/use-page-title";
import { ApiErrorBanner } from "@/components/api-error-banner";
import { PageHeader } from "@/components/page-header";
import { useInvoices } from "@/hooks/use-invoices";
import { useInvoicePrint } from "@/hooks/use-invoice-print";
import type { Invoice } from "@/lib/api-client-react-tenant";
import type { PrintMode } from "@/lib/print/open-print-document";
import { InvoicesToolbar } from "@/components/invoices/invoices-toolbar";
import { InvoicesTable } from "@/components/invoices/invoices-table";
import { TenantPagination } from "@/components/tenant-pagination";
import { mobileListPanelClass } from "@/components/mobile";

export default function InvoicesPage() {
  usePageTitle("الفواتير");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const { printInvoice } = useInvoicePrint();

  const handlePrintInvoice = async (invoice: Invoice, mode: PrintMode) => {
    const opened = await printInvoice(invoice.id, mode, invoice.invoiceNumber);
    if (!opened) {
      window.alert(
        mode === "pdf"
          ? "تعذر تنزيل PDF. حاول مرة أخرى."
          : "تعذر فتح نافذة الطباعة. يرجى السماح بالنوافذ المنبثقة.",
      );
    }
  };

  const { invoices, total, isLoading, listError, PAGE_SIZE } = useInvoices({
    search,
    statusFilter,
    page,
  });

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    if (total === 0) return;
    const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (page > maxPage) setPage(maxPage);
  }, [total, page, PAGE_SIZE]);

  return (
    <div className="space-y-6">
      <PageHeader title="الفواتير" description="فواتير عقود التأجير" />

      <ApiErrorBanner message={listError} />

      <div className="flex flex-col">
        <div className={mobileListPanelClass} style={{ backgroundColor: "#f3f4f6" }}>
          <InvoicesToolbar
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            rowCount={invoices.length}
            total={total}
            isLoading={isLoading}
          />

          <div className="mt-4 space-y-4">
            <InvoicesTable
              invoices={invoices}
              isLoading={isLoading}
              search={search}
              statusFilter={statusFilter}
              onPrint={(invoice, mode) => void handlePrintInvoice(invoice, mode)}
            />
            <TenantPagination
              page={page}
              pageSize={PAGE_SIZE}
              total={total}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
