import { useState, useEffect } from "react";
import type { Purchase } from "@/lib/api-client-react-tenant";
import { usePageTitle } from "@/hooks/use-page-title";
import { ApiErrorBanner } from "@/components/api-error-banner";
import { PageHeader } from "@/components/page-header";
import { MobileScrollTabs, mobileTabPanelClass } from "@/components/mobile";
import { useFinanceReports } from "@/hooks/use-finance-reports";
import { usePurchases } from "@/hooks/use-purchases";
import { FinancialReportsPanel } from "@/components/finance/financial-reports-panel";
import { PurchasesToolbar } from "@/components/finance/purchases-toolbar";
import { PurchasesTable } from "@/components/finance/purchases-table";
import { PurchaseDialog } from "@/components/finance/purchase-dialog";
import { FixedSubscriptionsPanel } from "@/components/finance/fixed-subscriptions-panel";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { TenantPagination } from "@/components/tenant-pagination";

type TabId = "reports" | "purchases" | "subscriptions";

export default function FinancePage() {
  usePageTitle("المالية");

  const now = new Date();
  const [activeTab, setActiveTab] = useState<TabId>("reports");
  const [reportYear, setReportYear] = useState(now.getFullYear());
  const [reportMonth, setReportMonth] = useState(now.getMonth() + 1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editPurchase, setEditPurchase] = useState<Purchase | null>(null);
  const [deletePurchaseId, setDeletePurchaseId] = useState<number | null>(null);
  const [markPaidPurchase, setMarkPaidPurchase] = useState<Purchase | null>(null);

  const { report, isLoading: reportLoading, reportError } = useFinanceReports({
    year: reportYear,
    month: reportMonth,
  });

  const {
    purchases,
    total,
    isLoading,
    listError,
    PAGE_SIZE,
    createIsPending,
    updateIsPending,
    deleteIsPending,
    statusIsPending,
    createError,
    updateError,
    deleteError,
    statusError,
    buildEditDefaultValues,
    submitCreate,
    submitUpdate,
    submitDelete,
    submitStatus,
  } = usePurchases({
    search,
    statusFilter,
    page,
    onCreateSuccess: () => setIsCreateOpen(false),
    onUpdateSuccess: () => setEditPurchase(null),
    onDeleteSuccess: () => setDeletePurchaseId(null),
    onStatusSuccess: () => setMarkPaidPurchase(null),
  });

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    if (total === 0) return;
    const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (page > maxPage) setPage(maxPage);
  }, [total, page, PAGE_SIZE]);

  const tabs: { id: TabId; label: string }[] = [
    { id: "reports", label: "التقارير المالية" },
    { id: "purchases", label: "المشتريات" },
    { id: "subscriptions", label: "الاشتراكات الثابتة" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="المالية" description="التقارير المالية والمشتريات والاشتراكات الثابتة" />

      <div className="flex flex-col">
        <MobileScrollTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as TabId)}
        />

        <div className={mobileTabPanelClass} style={{ backgroundColor: "#f3f4f6" }}>
          {activeTab === "reports" && (
            <>
              <ApiErrorBanner message={reportError} />
              <FinancialReportsPanel
              year={reportYear}
              month={reportMonth}
              onYearChange={setReportYear}
              onMonthChange={setReportMonth}
              report={report}
              isLoading={reportLoading}
            />
            </>
          )}

          {activeTab === "purchases" && (
            <>
              <ApiErrorBanner message={listError} />
              <PurchasesToolbar
                search={search}
                onSearchChange={setSearch}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                rowCount={purchases.length}
                total={total}
                isLoading={isLoading}
                onNewPurchase={() => setIsCreateOpen(true)}
              />

              <div className="mt-4 space-y-4">
                <PurchasesTable
                  purchases={purchases}
                  isLoading={isLoading}
                  search={search}
                  statusFilter={statusFilter}
                  onEdit={setEditPurchase}
                  onDelete={setDeletePurchaseId}
                  onMarkPaid={setMarkPaidPurchase}
                  statusIsPending={statusIsPending}
                />
                <TenantPagination
                  page={page}
                  pageSize={PAGE_SIZE}
                  total={total}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}

          {activeTab === "subscriptions" && <FixedSubscriptionsPanel />}
        </div>
      </div>

      <PurchaseDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="إضافة فاتورة مشتريات"
        onSubmit={submitCreate}
        isPending={createIsPending}
        errorMessage={createError}
      />

      {editPurchase && (
        <PurchaseDialog
          open
          onOpenChange={(open) => !open && setEditPurchase(null)}
          title="تعديل فاتورة مشتريات"
          defaultValues={buildEditDefaultValues(editPurchase)}
          onSubmit={(values) => submitUpdate(editPurchase.id, values)}
          isPending={updateIsPending}
          errorMessage={updateError}
        />
      )}

      <DeleteConfirmDialog
        open={deletePurchaseId != null}
        onOpenChange={(open) => !open && setDeletePurchaseId(null)}
        title="حذف فاتورة المشتريات"
        description="يمكن حذف فواتير المشتريات المسودة فقط. هل تريد المتابعة؟"
        isPending={deleteIsPending}
        errorMessage={deleteError}
        onConfirm={() => {
          if (deletePurchaseId != null) submitDelete(deletePurchaseId);
        }}
      />

      <DeleteConfirmDialog
        open={markPaidPurchase != null}
        onOpenChange={(open) => !open && setMarkPaidPurchase(null)}
        title="تسجيل فاتورة مشتريات مدفوعة"
        description={`هل تريد تسجيل فاتورة ${markPaidPurchase?.referenceNumber ?? ""} كمدفوعة؟`}
        isPending={statusIsPending}
        errorMessage={statusError}
        confirmLabel="نعم"
        onConfirm={() => {
          if (markPaidPurchase) submitStatus(markPaidPurchase.id, "paid");
        }}
      />
    </div>
  );
}
