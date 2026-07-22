import { useState } from "react";
import type { CompanyAsset } from "@/lib/api-client-react-tenant";
import { ApiErrorBanner } from "@/components/api-error-banner";
import { useCompanyAssets } from "@/hooks/use-company-assets";
import { CompanyAssetDialog } from "@/components/finance/company-asset-dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
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
import { formatInvoiceDate } from "@workspace/finance-domain";
import { formatSarCurrency } from "@workspace/invoices-domain";
import { Plus, FileEdit, Trash2 } from "lucide-react";

export function CompanyAssetsPanel() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editAsset, setEditAsset] = useState<CompanyAsset | null>(null);
  const [deleteAssetId, setDeleteAssetId] = useState<number | null>(null);

  const {
    assets,
    isLoading,
    listError,
    createIsPending,
    updateIsPending,
    deleteIsPending,
    createError,
    updateError,
    deleteError,
    buildEditDefaultValues,
    submitCreate,
    submitUpdate,
    submitDelete,
  } = useCompanyAssets({
    onCreateSuccess: () => setIsCreateOpen(false),
    onUpdateSuccess: () => setEditAsset(null),
    onDeleteSuccess: () => setDeleteAssetId(null),
  });

  return (
    <div className="space-y-4">
      <ApiErrorBanner message={listError} />

      <div className="flex justify-start">
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 shadow-sm"
        >
          <Plus className="h-4 w-4 me-2" />
          إضافة أصل
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>تاريخ الإدخال</TableHead>
                <TableHead>الرقم المرجعي</TableHead>
                <TableHead>نوع الأصل</TableHead>
                <TableHead>قيمة الأصل عند الإنشاء</TableHead>
                <TableHead>قيمة الأصل اليوم</TableHead>
                <TableHead>نسبة الانخفاض السنوي</TableHead>
                <TableHead className="w-32 text-center">إجراء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : assets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    لا توجد أصول مسجّلة
                  </TableCell>
                </TableRow>
              ) : (
                assets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {formatInvoiceDate(asset.acquiredDate)}
                    </TableCell>
                    <TableCell>
                      <bdi className="text-sm font-medium tabular-nums">
                        {asset.referenceNumber}
                      </bdi>
                    </TableCell>
                    <TableCell className="font-medium">{asset.assetType}</TableCell>
                    <TableCell>{formatSarCurrency(asset.initialValue)}</TableCell>
                    <TableCell>{formatSarCurrency(asset.currentValue)}</TableCell>
                    <TableCell>
                      <bdi className="tabular-nums">{asset.annualDepreciationRate}%</bdi>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditAsset(asset)}
                        >
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => setDeleteAssetId(asset.id)}
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

      <CompanyAssetDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="إضافة أصل"
        onSubmit={submitCreate}
        isPending={createIsPending}
        errorMessage={createError}
      />

      {editAsset && (
        <CompanyAssetDialog
          open
          onOpenChange={(open) => !open && setEditAsset(null)}
          title="تعديل أصل"
          defaultValues={buildEditDefaultValues(editAsset)}
          onSubmit={(values) => submitUpdate(editAsset.id, values)}
          isPending={updateIsPending}
          errorMessage={updateError}
        />
      )}

      <DeleteConfirmDialog
        open={deleteAssetId != null}
        onOpenChange={(open) => !open && setDeleteAssetId(null)}
        title="حذف الأصل"
        description="هل أنت متأكد من حذف هذا الأصل؟"
        isPending={deleteIsPending}
        errorMessage={deleteError}
        onConfirm={() => {
          if (deleteAssetId != null) submitDelete(deleteAssetId);
        }}
      />
    </div>
  );
}
