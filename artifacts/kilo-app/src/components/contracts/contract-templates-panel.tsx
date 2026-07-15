import { useState } from "react";
import type { ContractTemplate } from "@/lib/api-client-react-tenant";
import { ApiErrorBanner } from "@/components/api-error-banner";
import { useContractTemplates } from "@/hooks/use-contract-templates";
import { ContractTemplateDialog } from "@/components/contracts/contract-template-dialog";
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
import { Plus, FileEdit, Trash2 } from "lucide-react";

export function ContractTemplatesPanel() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<ContractTemplate | null>(null);
  const [deleteTemplateId, setDeleteTemplateId] = useState<number | null>(null);

  const {
    templates,
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
  } = useContractTemplates({
    onCreateSuccess: () => setIsCreateOpen(false),
    onUpdateSuccess: () => setEditTemplate(null),
    onDeleteSuccess: () => setDeleteTemplateId(null),
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
          قالب عقد جديد
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم القالب</TableHead>
                <TableHead className="w-40 text-center">إجراء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-20 mx-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : templates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                    لا توجد قوالب عقود
                  </TableCell>
                </TableRow>
              ) : (
                templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditTemplate(template)}
                        >
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => setDeleteTemplateId(template.id)}
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

      <ContractTemplateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="إضافة قالب عقد"
        onSubmit={submitCreate}
        isPending={createIsPending}
        errorMessage={createError}
      />

      {editTemplate && (
        <ContractTemplateDialog
          open
          onOpenChange={(open) => !open && setEditTemplate(null)}
          title="تعديل قالب عقد"
          defaultValues={buildEditDefaultValues(editTemplate)}
          onSubmit={(values) => submitUpdate(editTemplate.id, values)}
          isPending={updateIsPending}
          errorMessage={updateError}
        />
      )}

      <DeleteConfirmDialog
        open={deleteTemplateId != null}
        onOpenChange={(open) => !open && setDeleteTemplateId(null)}
        title="حذف قالب العقد"
        description="هل أنت متأكد من حذف هذا القالب؟"
        isPending={deleteIsPending}
        errorMessage={deleteError}
        onConfirm={() => {
          if (deleteTemplateId != null) submitDelete(deleteTemplateId);
        }}
      />
    </div>
  );
}
