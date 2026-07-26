import { useState } from "react";
import type { CorrespondenceTemplate } from "@/lib/api-client-react-tenant";
import { ApiErrorBanner } from "@/components/api-error-banner";
import { useCorrespondenceTemplates } from "@/hooks/use-correspondence-templates";
import { CorrespondenceTemplateDialog } from "@/components/correspondences/correspondence-template-dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export function CorrespondenceTemplatesPanel() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<CorrespondenceTemplate | null>(null);
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
  } = useCorrespondenceTemplates({
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
          قالب رسالة جديد
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم القالب</TableHead>
                <TableHead className="w-32 text-center">افتراضي</TableHead>
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
                      <Skeleton className="h-8 w-16 mx-auto" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-20 mx-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : templates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                    لا توجد قوالب مراسلات
                  </TableCell>
                </TableRow>
              ) : (
                templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell className="text-center">
                      {template.isDefault ? (
                        <Badge variant="secondary">افتراضي</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
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
                          disabled={template.isDefault}
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

      <CorrespondenceTemplateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="إضافة قالب مراسلة"
        onSubmit={submitCreate}
        isPending={createIsPending}
        errorMessage={createError}
      />

      {editTemplate && (
        <CorrespondenceTemplateDialog
          open
          onOpenChange={(open) => !open && setEditTemplate(null)}
          title="تعديل قالب مراسلة"
          defaultValues={buildEditDefaultValues(editTemplate)}
          onSubmit={(values) => submitUpdate(editTemplate.id, values)}
          isPending={updateIsPending}
          errorMessage={updateError}
        />
      )}

      <DeleteConfirmDialog
        open={deleteTemplateId != null}
        onOpenChange={(open) => !open && setDeleteTemplateId(null)}
        title="حذف قالب المراسلة"
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
