import type { Invoice } from "@/lib/api-client-react-tenant";
import { INVOICE_TYPE_LABELS } from "@workspace/customers-domain";
import {
  INVOICE_STATUS_LABELS,
  invoiceStatusBadgeClass,
} from "@workspace/invoices-domain";
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

import { InvoiceRowActionsMenu } from "@/components/invoices/InvoiceRowActionsMenu";
import type { PrintMode } from "@/lib/print/open-print-document";

interface InvoicesTableProps {
  invoices: Invoice[];
  isLoading: boolean;
  search: string;
  statusFilter: string;
  onPrint: (invoice: Invoice, mode: PrintMode) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 2,
  }).format(value);
}

export function InvoicesTable({
  invoices,
  isLoading,
  search,
  statusFilter,
  onPrint,
}: InvoicesTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[18%]">رقم الفاتورة</TableHead>
              <TableHead className="w-[16%]">اسم العميل</TableHead>
              <TableHead className="w-[16%]">المركبة المؤجرة</TableHead>
              <TableHead className="w-[14%]">المبلغ شامل الضريبة</TableHead>
              <TableHead className="w-[14%]">نوع الفاتورة</TableHead>
              <TableHead className="w-[12%]">حالة الفاتورة</TableHead>
              <TableHead className="w-[8%] text-center text-black">إجراء</TableHead>
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
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  {search || statusFilter !== "all" ? "لا توجد نتائج" : "لا توجد فواتير"}
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <bdi className="text-sm font-medium tabular-nums">{invoice.invoiceNumber}</bdi>
                  </TableCell>
                  <TableCell className="font-medium">{invoice.customerName}</TableCell>
                  <TableCell className="align-top">
                    <div className="min-w-0">
                      <div className="text-sm leading-tight">{invoice.vehicleBrand}</div>
                      <bdi className="block text-xs text-muted-foreground leading-tight mt-0.5">
                        {invoice.vehiclePlateNumber}
                      </bdi>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {formatCurrency(invoice.totalInclVat)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={invoice.invoiceType === "standard" ? "default" : "secondary"}
                    >
                      {INVOICE_TYPE_LABELS[invoice.invoiceType]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={invoiceStatusBadgeClass(invoice.status)}
                    >
                      {INVOICE_STATUS_LABELS[invoice.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="p-2 align-middle">
                    <div className="flex justify-center">
                      <InvoiceRowActionsMenu invoice={invoice} onPrint={onPrint} />
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
