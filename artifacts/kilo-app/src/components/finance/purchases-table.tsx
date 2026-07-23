import type { FinanceInvoiceStatus, Purchase } from "@/lib/api-client-react-tenant";
import {
  FINANCE_INVOICE_STATUS_LABELS,
  financeInvoiceStatusBadgeClass,
  formatInvoiceDate,
} from "@workspace/finance-domain";
import { formatSarCurrency } from "@workspace/invoices-domain";
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
import { FinanceInvoiceRowActionsMenu } from "@/components/finance/finance-invoice-row-actions-menu";

interface PurchasesTableProps {
  purchases: Purchase[];
  isLoading: boolean;
  search: string;
  statusFilter: string;
  onEdit: (purchase: Purchase) => void;
  onDelete: (purchase: Purchase) => void;
  onMarkPaid: (purchase: Purchase) => void;
  statusIsPending: boolean;
}

export function PurchasesTable({
  purchases,
  isLoading,
  search,
  statusFilter,
  onEdit,
  onDelete,
  onMarkPaid,
  statusIsPending,
}: PurchasesTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[12%]">التاريخ</TableHead>
              <TableHead className="w-[12%]">رقم المرجع</TableHead>
              <TableHead className="w-[14%]">اسم الشركة</TableHead>
              <TableHead className="w-[20%]">الأصناف</TableHead>
              <TableHead className="w-[14%]">المبلغ شامل الضريبة</TableHead>
              <TableHead className="w-[12%]">الحالة</TableHead>
              <TableHead className="w-[14%] text-center">إجراء</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : purchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  {search || statusFilter !== "all" ? "لا توجد نتائج" : "لا توجد فواتير مشتريات"}
                </TableCell>
              </TableRow>
            ) : (
              purchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="text-sm whitespace-nowrap">
                    {formatInvoiceDate(purchase.invoiceDate)}
                  </TableCell>
                  <TableCell>
                    <bdi className="text-sm font-medium tabular-nums">{purchase.referenceNumber}</bdi>
                  </TableCell>
                  <TableCell className="font-medium">{purchase.companyName}</TableCell>
                  <TableCell className="text-sm truncate">{purchase.items}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {formatSarCurrency(purchase.totalInclVat)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={financeInvoiceStatusBadgeClass(
                        purchase.status as FinanceInvoiceStatus,
                      )}
                    >
                      {FINANCE_INVOICE_STATUS_LABELS[purchase.status as FinanceInvoiceStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      <FinanceInvoiceRowActionsMenu
                        status={purchase.status as FinanceInvoiceStatus}
                        onEdit={() => onEdit(purchase)}
                        onDelete={() => onDelete(purchase)}
                        onMarkPaid={() => onMarkPaid(purchase)}
                        statusIsPending={statusIsPending}
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
  );
}
