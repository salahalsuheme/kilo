import type { Customer } from "@/lib/api-client-react-tenant";
import { CUSTOMER_FIELD_LABELS, INVOICE_TYPE_LABELS } from "@workspace/customers-domain";
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
import { User, Building2 } from "lucide-react";
import { CLIENT_TYPE_LABELS } from "@/features/customers/customer-form.schema";
import type { CustomerFormValues } from "@/features/customers/customer-form.schema";
import { CustomerRowActionsMenu } from "@/components/customers/CustomerRowActionsMenu";

function CustomersTableColGroup() {
  return (
    <colgroup>
      <col style={{ width: "20%" }} />
      <col style={{ width: "18%" }} />
      <col style={{ width: "16%" }} />
      <col style={{ width: "12%" }} />
      <col style={{ width: "14%" }} />
      <col style={{ width: "4rem" }} />
    </colgroup>
  );
}

const ENTITY_TYPES = ["individual", "institution", "company", "government"] as const;
type EntityType = (typeof ENTITY_TYPES)[number];

function typeBadgeClass(clientType: CustomerFormValues["clientType"]) {
  if (clientType === "individual") return "bg-primary/10 text-primary border-primary/20";
  if (clientType === "government") return "bg-green-500/10 text-green-700 border-green-200";
  return "bg-purple-500/10 text-purple-600 border-purple-200";
}

interface CustomersTableProps {
  customers: Customer[];
  isLoading: boolean;
  search: string;
  typeFilter: string;
  onEdit: (customer: Customer) => void;
  onDelete: (id: number) => void;
}

export function CustomersTable({
  customers,
  isLoading,
  search,
  typeFilter,
  onEdit,
  onDelete,
}: CustomersTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table className="table-fixed">
          <CustomersTableColGroup />
          <TableHeader>
            <TableRow>
              <TableHead>{CUSTOMER_FIELD_LABELS.name}</TableHead>
              <TableHead>{CUSTOMER_FIELD_LABELS.establishmentName}</TableHead>
              <TableHead>الهوية</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>الفاتورة</TableHead>
              <TableHead className="text-center text-black">إجراء</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </TableCell>
                  <TableCell className="w-16">
                    <div className="flex justify-center">
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  {search || typeFilter !== "all" ? "لا توجد نتائج" : "لا يوجد عملاء"}
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => {
                const isEntity = (ENTITY_TYPES as readonly string[]).includes(customer.clientType);
                return (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-xs text-muted-foreground" dir="ltr">
                            {customer.mobile}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="min-w-0 font-medium">
                        {customer.establishmentName ?? "—"}
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="flex flex-col items-start gap-0.5 min-w-0">
                        <bdi className="block text-sm font-medium tabular-nums leading-tight">
                          {customer.idNumber}
                        </bdi>
                        <span className="text-xs text-muted-foreground leading-tight">
                          {customer.nationality}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {isEntity ? (
                        <Badge
                          variant="outline"
                          className={`gap-1 capitalize ${typeBadgeClass(customer.clientType)}`}
                        >
                          {customer.clientType === "individual" ? (
                            <User className="h-3 w-3" />
                          ) : (
                            <Building2 className="h-3 w-3" />
                          )}
                          {CLIENT_TYPE_LABELS[customer.clientType as EntityType]}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.invoiceType === "standard" ? "default" : "secondary"}>
                        {INVOICE_TYPE_LABELS[customer.invoiceType]}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-2 align-middle">
                      <div className="flex justify-center">
                        <CustomerRowActionsMenu
                          customer={customer}
                          onEdit={onEdit}
                          onDelete={onDelete}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
