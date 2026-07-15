import type { Contract, ContractStatus } from "@/lib/api-client-react-tenant";
import { CONTRACT_STATUS_LABELS, formatContractDateTime } from "@workspace/contracts-domain";
import {
  CONTRACT_STATUS_BADGE_BASE_CLASS,
  contractExpiringSoonBadgeClass,
  contractStatusBadgeClass,
  isContractExpiringSoonRemaining,
} from "@/features/contracts/contract-display";
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
import { cn } from "@/lib/utils";
import { ContractRowActionsMenu } from "@/components/contracts/ContractRowActionsMenu";

import type { PrintMode } from "@/lib/print/open-print-document";

interface ContractsTableProps {
  contracts: Contract[];
  isLoading: boolean;
  search: string;
  statusFilter: string;
  onEdit: (contract: Contract) => void;
  onDelete: (id: number) => void;
  onChangeStatus: (contract: Contract, status: ContractStatus) => void;
  onPrint: (contract: Contract, mode: PrintMode) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 2,
  }).format(value);
}

export function ContractsTable({
  contracts,
  isLoading,
  search,
  statusFilter,
  onEdit,
  onDelete,
  onChangeStatus,
  onPrint,
}: ContractsTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[10%]">رقم العقد</TableHead>
              <TableHead className="w-[12%]">اسم العميل</TableHead>
              <TableHead className="w-[12%]">المركبة</TableHead>
              <TableHead className="w-[13%]">بداية / نهاية العقد</TableHead>
              <TableHead className="w-[8%]">مدة التأجير</TableHead>
              <TableHead className="w-[7%]">المتبقي</TableHead>
              <TableHead className="w-[8%]">التأخير</TableHead>
              <TableHead className="w-[10%]">قيمة العقد</TableHead>
              <TableHead className="w-[9%]">الحالة</TableHead>
              <TableHead className="w-16 text-center text-black">إجراء</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 10 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : contracts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                  {search || statusFilter !== "all" ? "لا توجد نتائج" : "لا يوجد عقود"}
                </TableCell>
              </TableRow>
            ) : (
              contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell>
                    <bdi className="text-sm font-medium tabular-nums">{contract.contractNumber}</bdi>
                  </TableCell>
                  <TableCell className="font-medium">{contract.customerName}</TableCell>
                  <TableCell className="align-top">
                    <div className="min-w-0">
                      <div className="text-sm leading-tight">{contract.vehicleBrand}</div>
                      <bdi className="block text-xs text-muted-foreground leading-tight mt-0.5">
                        {contract.vehiclePlateNumber}
                      </bdi>
                    </div>
                  </TableCell>
                  <TableCell className="align-top text-sm whitespace-nowrap">
                    <div className="leading-tight">{formatContractDateTime(contract.startAt)}</div>
                    <div className="mt-0.5 leading-tight text-muted-foreground">
                      {formatContractDateTime(contract.endAt)}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{contract.rentalDurationDays} يوم</TableCell>
                  <TableCell className="text-sm">
                    {contract.status === "active" ? `${contract.remainingDays} يوم` : "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {contract.status === "overdue" ? (
                      <div>
                        <span className="font-medium text-amber-700">
                          {contract.overdueDays} يوم
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {formatCurrency(contract.penaltyTotal)}
                        </span>
                      </div>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {formatCurrency(contract.totalInclVat)}
                  </TableCell>
                  <TableCell>
                    <div className="flex min-w-0 flex-col items-start gap-1">
                      <span
                        className={cn(
                          CONTRACT_STATUS_BADGE_BASE_CLASS,
                          contractStatusBadgeClass(contract.status),
                        )}
                      >
                        {CONTRACT_STATUS_LABELS[contract.status]}
                      </span>
                      {isContractExpiringSoonRemaining(contract) ? (
                        <span
                          className={cn(
                            CONTRACT_STATUS_BADGE_BASE_CLASS,
                            contractExpiringSoonBadgeClass(),
                          )}
                        >
                          ينتهي قريباً
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="w-16 p-2 align-middle">
                    <div className="flex justify-center">
                      <ContractRowActionsMenu
                        contract={contract}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onChangeStatus={onChangeStatus}
                        onPrint={onPrint}
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
