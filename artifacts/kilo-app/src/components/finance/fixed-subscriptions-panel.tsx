import { useState } from "react";
import type { FinanceInvoiceStatus, SubscriptionInvoice } from "@/lib/api-client-react-tenant";
import { ApiErrorBanner } from "@/components/api-error-banner";
import { useFixedSubscriptions } from "@/hooks/use-fixed-subscriptions";
import { FixedSubscriptionDialog } from "@/components/finance/fixed-subscription-dialog";
import { PurchaseDialog } from "@/components/finance/purchase-dialog";
import { FinanceInvoiceRowActionsMenu } from "@/components/finance/finance-invoice-row-actions-menu";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { SearchInput } from "@/components/ui/search-input";
import { StatusFilterSelect } from "@/components/ui/status-filter-select";
import { TenantPagination } from "@/components/tenant-pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  MobileToolbar,
  mobileToolbarCountClass,
  mobileToolbarSearchWrapClass,
  mobileToolbarSelectClass,
} from "@/components/mobile";
import {
  BILLING_CYCLE_LABELS,
  FINANCE_INVOICE_STATUS_LABELS,
  billingPeriodLabel,
  financeInvoiceStatusBadgeClass,
  formatInvoiceDate,
} from "@workspace/finance-domain";
import { formatSarCurrency } from "@workspace/invoices-domain";
import type { FixedSubscription } from "@/lib/api-client-react-tenant";
import { Plus, FileEdit, Trash2 } from "lucide-react";

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "all", label: "كل الحالات" },
  ...(Object.entries(FINANCE_INVOICE_STATUS_LABELS) as Array<
    [FinanceInvoiceStatus, string]
  >).map(([value, label]) => ({ value, label })),
];

export function FixedSubscriptionsPanel() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editSubscription, setEditSubscription] = useState<FixedSubscription | null>(null);
  const [deleteSubscriptionId, setDeleteSubscriptionId] = useState<number | null>(null);
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("all");
  const [invoicePage, setInvoicePage] = useState(1);
  const [markPaidInvoice, setMarkPaidInvoice] = useState<SubscriptionInvoice | null>(null);
  const [editSubscriptionInvoice, setEditSubscriptionInvoice] = useState<SubscriptionInvoice | null>(
    null,
  );
  const [deleteSubscriptionInvoice, setDeleteSubscriptionInvoice] =
    useState<SubscriptionInvoice | null>(null);

  const {
    subscriptions,
    subscriptionsLoading,
    subscriptionsError,
    subscriptionInvoices,
    subscriptionInvoicesTotal,
    subscriptionInvoicesLoading,
    subscriptionInvoicesError,
    SUBSCRIPTION_INVOICE_PAGE_SIZE,
    createIsPending,
    updateIsPending,
    deleteIsPending,
    invoiceStatusIsPending,
    invoiceUpdateIsPending,
    invoiceDeleteIsPending,
    createError,
    updateError,
    deleteError,
    invoiceStatusError,
    invoiceUpdateError,
    invoiceDeleteError,
    buildEditDefaultValues,
    buildInvoiceEditDefaultValues,
    submitCreate,
    submitUpdate,
    submitDelete,
    submitInvoiceStatus,
    submitInvoiceUpdate,
    submitInvoiceDelete,
  } = useFixedSubscriptions({
    invoiceSearch,
    invoiceStatusFilter,
    invoicePage,
    onCreateSuccess: () => setIsCreateOpen(false),
    onUpdateSuccess: () => setEditSubscription(null),
    onDeleteSuccess: () => setDeleteSubscriptionId(null),
    onInvoiceStatusSuccess: () => setMarkPaidInvoice(null),
    onInvoiceUpdateSuccess: () => setEditSubscriptionInvoice(null),
    onInvoiceDeleteSuccess: () => setDeleteSubscriptionInvoice(null),
  });

  return (
    <div className="space-y-6">
      <ApiErrorBanner message={subscriptionsError ?? subscriptionInvoicesError} />

      <div className="space-y-4">
        <div className="flex justify-start">
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 shadow-sm"
          >
            <Plus className="h-4 w-4 me-2" />
            إضافة فاتورة اشتراك ثابت
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>رقم المرجع</TableHead>
                  <TableHead>اسم الشركة</TableHead>
                  <TableHead>الصنف</TableHead>
                  <TableHead>دورة الدفع</TableHead>
                  <TableHead>المبلغ شامل الضريبة</TableHead>
                  <TableHead className="w-32 text-center">إجراء</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptionsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : subscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      لا توجد اشتراكات ثابتة
                    </TableCell>
                  </TableRow>
                ) : (
                  subscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell className="text-sm whitespace-nowrap">
                        {formatInvoiceDate(subscription.invoiceDate)}
                      </TableCell>
                      <TableCell>
                        <bdi className="text-sm font-medium tabular-nums">
                          {subscription.referenceNumber}
                        </bdi>
                      </TableCell>
                      <TableCell className="font-medium">{subscription.companyName}</TableCell>
                      <TableCell className="text-sm">{subscription.items}</TableCell>
                      <TableCell>
                        {BILLING_CYCLE_LABELS[subscription.billingCycle]}
                      </TableCell>
                      <TableCell>{formatSarCurrency(subscription.totalInclVat)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditSubscription(subscription)}
                          >
                            <FileEdit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => setDeleteSubscriptionId(subscription.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold">فواتير الاشتراكات الصادرة</h3>
        <MobileToolbar>
          <SearchInput
            name="subscription-invoices-search"
            value={invoiceSearch}
            onChange={(e) => setInvoiceSearch(e.target.value)}
            placeholder="ابحث في فواتير الاشتراكات .."
            className="bg-white"
            wrapperClassName={mobileToolbarSearchWrapClass}
          />
          <StatusFilterSelect
            value={invoiceStatusFilter}
            onValueChange={setInvoiceStatusFilter}
            options={STATUS_OPTIONS}
            triggerClassName={mobileToolbarSelectClass}
          />
          {!subscriptionInvoicesLoading && (
            <span className={mobileToolbarCountClass}>
              عرض {subscriptionInvoices.length} من {subscriptionInvoicesTotal} فاتورة
            </span>
          )}
        </MobileToolbar>

        <Card>
          <CardContent className="p-0">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[10%]">التاريخ</TableHead>
                  <TableHead className="w-[11%]">رقم المرجع</TableHead>
                  <TableHead className="w-[13%]">اسم الشركة</TableHead>
                  <TableHead className="w-[12%]">الصنف</TableHead>
                  <TableHead className="w-[11%]">الفترة</TableHead>
                  <TableHead className="w-[13%]">المبلغ شامل الضريبة</TableHead>
                  <TableHead className="w-[10%]">الحالة</TableHead>
                  <TableHead className="w-[10%] text-center">إجراء</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptionInvoicesLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((__, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : subscriptionInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      لا توجد فواتير اشتراك
                    </TableCell>
                  </TableRow>
                ) : (
                  subscriptionInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="text-sm whitespace-nowrap">
                        {formatInvoiceDate(invoice.invoiceDate)}
                      </TableCell>
                      <TableCell>
                        <bdi className="text-sm font-medium tabular-nums">
                          {invoice.referenceNumber}
                        </bdi>
                      </TableCell>
                      <TableCell className="font-medium">{invoice.companyName}</TableCell>
                      <TableCell className="text-sm truncate">{invoice.items}</TableCell>
                      <TableCell className="text-sm">
                        {billingPeriodLabel(invoice.billingPeriod, invoice.billingCycle)}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {formatSarCurrency(invoice.totalInclVat)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={financeInvoiceStatusBadgeClass(invoice.status)}
                        >
                          {FINANCE_INVOICE_STATUS_LABELS[invoice.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <FinanceInvoiceRowActionsMenu
                            status={invoice.status}
                            onEdit={() => setEditSubscriptionInvoice(invoice)}
                            onDelete={() => setDeleteSubscriptionInvoice(invoice)}
                            onMarkPaid={() => setMarkPaidInvoice(invoice)}
                            statusIsPending={invoiceStatusIsPending}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <TenantPagination
          page={invoicePage}
          pageSize={SUBSCRIPTION_INVOICE_PAGE_SIZE}
          total={subscriptionInvoicesTotal}
          onPageChange={setInvoicePage}
        />
      </div>

      <FixedSubscriptionDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="إضافة فاتورة اشتراك ثابت"
        onSubmit={submitCreate}
        isPending={createIsPending}
        errorMessage={createError}
      />

      {editSubscription && (
        <FixedSubscriptionDialog
          open
          onOpenChange={(open) => !open && setEditSubscription(null)}
          title="تعديل اشتراك ثابت"
          defaultValues={buildEditDefaultValues(editSubscription)}
          onSubmit={(values) => submitUpdate(editSubscription.id, values)}
          isPending={updateIsPending}
          errorMessage={updateError}
        />
      )}

      <DeleteConfirmDialog
        open={deleteSubscriptionId != null}
        onOpenChange={(open) => !open && setDeleteSubscriptionId(null)}
        title="حذف الاشتراك الثابت"
        description="هل أنت متأكد من حذف هذا الاشتراك؟"
        isPending={deleteIsPending}
        errorMessage={deleteError}
        onConfirm={() => {
          if (deleteSubscriptionId != null) submitDelete(deleteSubscriptionId);
        }}
      />

      <DeleteConfirmDialog
        open={markPaidInvoice != null}
        onOpenChange={(open) => !open && setMarkPaidInvoice(null)}
        title="تسجيل فاتورة اشتراك مدفوعة"
        description={`هل تريد تسجيل فاتورة ${markPaidInvoice?.referenceNumber ?? ""} كمدفوعة؟`}
        isPending={invoiceStatusIsPending}
        errorMessage={invoiceStatusError}
        confirmLabel="نعم"
        onConfirm={() => {
          if (markPaidInvoice) submitInvoiceStatus(markPaidInvoice.id, "paid");
        }}
      />

      {editSubscriptionInvoice && (
        <PurchaseDialog
          open
          onOpenChange={(open) => !open && setEditSubscriptionInvoice(null)}
          title="تعديل فاتورة اشتراك"
          defaultValues={buildInvoiceEditDefaultValues(editSubscriptionInvoice)}
          onSubmit={(values) => submitInvoiceUpdate(editSubscriptionInvoice.id, values)}
          isPending={invoiceUpdateIsPending}
          errorMessage={invoiceUpdateError}
        />
      )}

      <DeleteConfirmDialog
        open={deleteSubscriptionInvoice != null}
        onOpenChange={(open) => !open && setDeleteSubscriptionInvoice(null)}
        title="حذف فاتورة الاشتراك"
        description={
          deleteSubscriptionInvoice?.status === "paid"
            ? `هل أنت متأكد من حذف فاتورة ${deleteSubscriptionInvoice.referenceNumber} المدفوعة؟ سيُنعكس ذلك على التقارير المالية.`
            : "هل تريد حذف فاتورة الاشتراك هذه؟"
        }
        isPending={invoiceDeleteIsPending}
        errorMessage={invoiceDeleteError}
        onConfirm={() => {
          if (deleteSubscriptionInvoice) submitInvoiceDelete(deleteSubscriptionInvoice.id);
        }}
      />
    </div>
  );
}
