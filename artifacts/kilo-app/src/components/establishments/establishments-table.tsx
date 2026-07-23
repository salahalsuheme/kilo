import type { Establishment } from "@/lib/api-client-react-tenant";
import {
  ESTABLISHMENT_FIELD_LABELS,
  ESTABLISHMENT_TYPE_LABELS,
  formatEstablishmentFullName,
} from "@workspace/establishments-domain";
import type { EstablishmentType } from "@workspace/establishments-domain";
import { INVOICE_TYPE_LABELS } from "@workspace/customers-domain";
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
import { Building2 } from "lucide-react";
import { EstablishmentRowActionsMenu } from "@/components/establishments/EstablishmentRowActionsMenu";

interface EstablishmentsTableProps {
  establishments: Establishment[];
  isLoading: boolean;
  search: string;
  typeFilter: string;
  onEdit: (establishment: Establishment) => void;
  onDelete: (id: number) => void;
}

export function EstablishmentsTable({
  establishments,
  isLoading,
  search,
  typeFilter,
  onEdit,
  onDelete,
}: EstablishmentsTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead>{ESTABLISHMENT_FIELD_LABELS.name}</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>{ESTABLISHMENT_FIELD_LABELS.establishmentNumber}</TableHead>
              <TableHead>الفاتورة</TableHead>
              <TableHead className="text-center text-black">إجراء</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : establishments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  {search || typeFilter !== "all" ? "لا توجد نتائج" : "لا توجد منشآت"}
                </TableCell>
              </TableRow>
            ) : (
              establishments.map((establishment) => (
                <TableRow key={establishment.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600 shrink-0">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 font-medium">
                        {formatEstablishmentFullName(
                          establishment.clientType as EstablishmentType,
                          establishment.name,
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {ESTABLISHMENT_TYPE_LABELS[establishment.clientType as EstablishmentType]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <bdi className="tabular-nums">{establishment.establishmentNumber}</bdi>
                  </TableCell>
                  <TableCell>
                    <Badge variant={establishment.invoiceType === "standard" ? "default" : "secondary"}>
                      {INVOICE_TYPE_LABELS[establishment.invoiceType]}
                    </Badge>
                  </TableCell>
                  <TableCell className="p-2 align-middle">
                    <div className="flex justify-center">
                      <EstablishmentRowActionsMenu
                        establishment={establishment}
                        onEdit={onEdit}
                        onDelete={onDelete}
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
